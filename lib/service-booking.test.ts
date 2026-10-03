/**
 * R007 — forfaits, options et corps de « Réserver un passage ».
 *
 * Les offres reprennent celles lues en production le 3 oct. 2026 (entretien 107 €, hivernage 30 €,
 * enlèvement 40 € ou dépose en magasin, lames classiques 7 € ou carbure 10 €, réparation sur
 * devis) : une constante de prix dans le code ferait échouer ces cas dès qu'on la change.
 */
import { describe, expect, it } from 'vitest';
import {
  buildServiceRequestBody,
  computeServiceTotal,
  frenchDate,
  groupLabel,
  groupOptions,
  priceText,
  supplementText,
  toggleOption,
  winterOption,
  winterPackage,
} from './service-booking';
import { baseOffer, optionOffers, type ServiceOffer } from './service-offers';

let nextId = 0;
const offer = (patch: Partial<ServiceOffer>): ServiceOffer => ({
  id: ++nextId,
  service: 'MAINTENANCE',
  kind: 'OPTION',
  label: 'Option',
  description: null,
  price: 0,
  unit: null,
  exclusiveGroup: null,
  order: 0,
  ...patch,
});

const OFFERS: ServiceOffer[] = [
  offer({
    id: 1,
    kind: 'BASE',
    label: 'Entretien annuel',
    price: 107,
    order: 0,
  }),
  offer({
    id: 2,
    label:
      'Enlèvement dans un rayon de 30 km de Braine-le-Comte (hors Bruxelles)',
    price: 40,
    exclusiveGroup: 'transport',
    order: 1,
  }),
  offer({
    id: 3,
    label: 'Dépose en magasin',
    price: 0,
    exclusiveGroup: 'transport',
    order: 2,
  }),
  offer({
    id: 4,
    label: "Hivernage tout l'hiver dans un entrepôt chauffé",
    price: 30,
    order: 3,
  }),
  offer({
    id: 5,
    label: 'Redémarrage du robot à domicile au printemps',
    price: 35,
    order: 4,
  }),
  offer({
    id: 6,
    label: 'Lames classiques',
    price: 7,
    exclusiveGroup: 'lames',
    order: 5,
  }),
  offer({
    id: 7,
    label: 'Lames carbure',
    price: 10,
    exclusiveGroup: 'lames',
    order: 6,
  }),
  offer({
    id: 9,
    service: 'REPAIR',
    kind: 'BASE',
    label: 'Réparation',
    price: null,
  }),
  offer({
    id: 10,
    service: 'REPAIR',
    label: 'Enlèvement et redémarrage à domicile',
    price: 80,
    order: 1,
  }),
  offer({
    id: 11,
    service: 'INSTALLATION_HELP',
    kind: 'BASE',
    label: "Problème d'installation",
    price: null,
  }),
];

const maintenance = baseOffer(OFFERS, 'MAINTENANCE');
const repair = baseOffer(OFFERS, 'REPAIR');
const byId = (...ids: number[]) => OFFERS.filter((o) => ids.includes(o.id));

const NBSP = String.fromCharCode(160);
const euro = (n: string) => `${n}${NBSP}€`;

describe('textes de prix', () => {
  it('« sur devis » pour un prix nul, jamais « 0 € »', () => {
    expect(priceText(null)).toBe('sur devis');
    expect(priceText(107)).toBe(euro('107'));
    expect(supplementText(null)).toBe('sur devis');
    expect(supplementText(0)).toBe('sans supplément');
    expect(supplementText(40)).toBe(`+ ${euro('40')}`);
  });
});

describe('entretien + hivernage', () => {
  it("est la somme calculée du forfait et de l'option (107 + 30 = 137)", () => {
    expect(winterOption(OFFERS)?.id).toBe(4);
    expect(winterPackage(maintenance, winterOption(OFFERS))).toEqual({
      total: 137,
    });
  });

  it('suit un prix modifié par le gérant', () => {
    const offers = OFFERS.map((o) => (o.id === 4 ? { ...o, price: 45 } : o));
    expect(winterPackage(maintenance, winterOption(offers))).toEqual({
      total: 152,
    });
  });

  it("n'existe pas sans option d'hivernage, ni si un des prix manque", () => {
    expect(winterOption(OFFERS.filter((o) => o.id !== 4))).toBeUndefined();
    expect(winterPackage(maintenance, undefined)).toBeNull();
    expect(
      winterPackage({ ...maintenance!, price: null }, winterOption(OFFERS)),
    ).toBeNull();
  });

  it("ne confond pas l'hivernage d'un autre service", () => {
    const autre = offer({ service: 'REPAIR', label: 'Hivernage', price: 10 });
    expect(winterOption([autre])).toBeUndefined();
  });
});

describe('options', () => {
  it("sépare les cases libres des groupes exclusifs, dans l'ordre du serveur", () => {
    const { free, groups } = groupOptions(optionOffers(OFFERS, 'MAINTENANCE'));
    expect(free.map((o) => o.id)).toEqual([4, 5]);
    expect(groups.map((g) => [g.key, g.options.map((o) => o.id)])).toEqual([
      ['transport', [2, 3]],
      ['lames', [6, 7]],
    ]);
    expect(groupLabel('lames')).toBe('Lames');
    expect(groupLabel('mise_en_route')).toBe('Mise en route');
  });

  const options = optionOffers(OFFERS, 'MAINTENANCE');

  it('choisir une option exclusive retire sa concurrente seulement', () => {
    let chosen = toggleOption(options, [], 6, true);
    chosen = toggleOption(options, chosen, 4, true);
    chosen = toggleOption(options, chosen, 2, true);
    expect(chosen.sort()).toEqual([2, 4, 6]);
    chosen = toggleOption(options, chosen, 7, true);
    expect(chosen.sort()).toEqual([2, 4, 7]);
    chosen = toggleOption(options, chosen, 3, true);
    expect(chosen.sort()).toEqual([3, 4, 7]);
  });

  it('décocher retire, une option inconnue ne change rien', () => {
    expect(toggleOption(options, [4, 6], 4, false)).toEqual([6]);
    expect(toggleOption(options, [4], 999, true)).toEqual([4]);
  });
});

describe('computeServiceTotal', () => {
  it('forfait seul : 107 €', () => {
    const total = computeServiceTotal(maintenance, []);
    expect(total.known).toBe(107);
    expect(total.text).toBe(euro('107'));
    expect(total.hasUnpriced).toBe(false);
  });

  it('avec options : 107 + 30 + 40 + 10 = 187 €', () => {
    expect(computeServiceTotal(maintenance, byId(4, 2, 7)).text).toBe(
      euro('187'),
    );
  });

  it('« dépose en magasin » à 0 € ne change pas le total', () => {
    expect(computeServiceTotal(maintenance, byId(3)).known).toBe(107);
  });

  it('une réparation est « sur devis », avec ses suppléments connus à part', () => {
    expect(computeServiceTotal(repair, []).text).toBe('Sur devis');
    const avec = computeServiceTotal(repair, byId(10));
    expect(avec.text).toBe(`${euro('80')} + devis`);
    expect(avec.hasUnpriced).toBe(true);
  });

  it('sans forfait de base (API absente) : sur devis, jamais un prix inventé', () => {
    expect(computeServiceTotal(undefined, []).text).toBe('Sur devis');
  });
});

describe('frenchDate', () => {
  it('met la date au format des anciens emails', () => {
    expect(frenchDate('2026-10-12')).toBe('12/10/2026');
    expect(frenchDate('')).toBe('');
  });
});

describe('buildServiceRequestBody', () => {
  const contact = {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean@example.test',
    phone: '0470 00 00 00',
    address: '',
    robotCode: '',
    notes: ' Il ne démarre plus ',
  };

  it('liste Type de demande, Marque, forfait, options avec leurs prix et total', () => {
    const body = buildServiceRequestBody({
      type: 'Entretien',
      brand: ' Gardena ',
      model: 'Sileno',
      base: maintenance,
      fallbackLabel: 'Entretien annuel',
      chosen: byId(4, 6),
      date: '2026-10-12',
      contact,
    });
    expect(body).toEqual({
      'Type de demande': 'Entretien',
      Marque: 'Gardena',
      Modèle: 'Sileno',
      Forfait: `Entretien annuel — ${euro('107')}`,
      "Hivernage tout l'hiver dans un entrepôt chauffé": `+ ${euro('30')}`,
      'Lames classiques': `+ ${euro('7')}`,
      'Total estimé': euro('144'),
      'Date souhaitée': '12/10/2026',
      'Nom de famille': 'Dupont',
      Prénom: 'Jean',
      'Adresse e-mail': 'jean@example.test',
      'Numéro de téléphone': '0470 00 00 00',
      Remarques: 'Il ne démarre plus',
      'Conditions acceptées': true,
    });
    // L'ordre des clés est celui de l'email : le type et la marque d'abord.
    expect(Object.keys(body).slice(0, 2)).toEqual([
      'Type de demande',
      'Marque',
    ]);
  });

  it('une réparation part « sur devis », avec le type Réparation', () => {
    const body = buildServiceRequestBody({
      type: 'Réparation',
      brand: 'Husqvarna',
      model: '',
      base: repair,
      fallbackLabel: 'Réparation',
      chosen: [],
      date: '',
      contact,
    });
    expect(body['Type de demande']).toBe('Réparation');
    expect(body.Forfait).toBe('Réparation — sur devis');
    expect(body['Total estimé']).toBe('Sur devis');
    expect(body).not.toHaveProperty('Date souhaitée');
    expect(body).not.toHaveProperty('Modèle');
  });

  it('sans forfait en base, utilise le libellé de secours', () => {
    const body = buildServiceRequestBody({
      type: 'Installation',
      brand: 'Worx',
      model: '',
      base: undefined,
      fallbackLabel: "Problème d'installation",
      chosen: [],
      date: '',
      contact,
    });
    expect(body.Forfait).toBe("Problème d'installation — sur devis");
  });
});
