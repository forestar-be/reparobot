/**
 * R006-S01 — le total du devis du site est celui du PDF du serveur (AC-02).
 *
 * La formule de référence est `calculateTotalPrice` de `PurchaseOrderPdfDocument` : prix du
 * robot + accessoires + `computeInstallationCosts` (placement si coché, câble = longueur x
 * prix au mètre arrondi au centime, support). Les cas ci-dessous rejouent les montants du
 * relevé de preuve du serveur (Automower 305 à 1 199 €, placement 200 €, câble 1,30 €/m,
 * support 50 € : 120 m donnent 1 605 €).
 */
import { describe, expect, it } from 'vitest';
import {
  buildQuoteRequestBody,
  computeQuote,
  EMPTY_SELECTION,
  normalizeWireLength,
  quoteContextFor,
  type Accessory,
  type QuoteContact,
  type QuoteContext,
} from './quote';

const antenna: Accessory = {
  id: 17,
  name: 'Antenne rs1',
  category: 'ANTENNA',
  sellingPrice: 299,
};
const shelterA: Accessory = {
  id: 33,
  name: 'Abri 308 ',
  category: 'SHELTER',
  sellingPrice: 219,
};
const shelterB: Accessory = {
  id: 34,
  name: 'Abris robot li',
  category: 'SHELTER',
  sellingPrice: 199.99,
};
const unpricedShelter: Accessory = {
  id: 35,
  name: 'Abri sur mesure',
  category: 'SHELTER',
  sellingPrice: null,
};

const context: QuoteContext = {
  robotPrice: 1199,
  placement: 200,
  wirePerMeter: 1.3,
  antennaSupportPrice: 50,
  accessories: [antenna, shelterA, shelterB, unpricedShelter],
};

const contact: QuoteContact = {
  firstName: ' Jean ',
  lastName: 'Dupont',
  email: 'jean@example.test',
  phone: '0470 00 00 00',
  address: 'Rue des Fleurs 1',
  postalCode: '7090',
  city: 'Braine-le-Comte',
  notes: ' Pente derrière la maison ',
};

describe('computeQuote', () => {
  it('ne compte que le robot par défaut : installation décochée (D-14)', () => {
    const quote = computeQuote(context, EMPTY_SELECTION);
    expect(quote.total).toBe(1199);
    expect(quote.installationIncluded).toBe(false);
    expect(quote.lines.map((l) => l.key)).toEqual(['robot']);
    expect(quote.unpriced).toEqual([]);
  });

  it("ajoute le placement quand l'installation est cochée", () => {
    const quote = computeQuote(context, {
      ...EMPTY_SELECTION,
      installation: true,
    });
    expect(quote.total).toBe(1399);
    expect(quote.installationIncluded).toBe(true);
    expect(quote.installationAmount).toBe(200);
  });

  it('retrouve le total du PDF du serveur (1 605 €)', () => {
    const quote = computeQuote(context, {
      ...EMPTY_SELECTION,
      installation: true,
      wire: true,
      wireLength: 120,
      antennaSupport: true,
    });
    expect(quote.total).toBe(1605);
    expect(quote.lines.find((l) => l.key === 'cable')?.amount).toBe(156);
  });

  it('suit un prix de câble modifié, sans constante dans le code (AC-02 de R001)', () => {
    const quote = computeQuote(
      { ...context, wirePerMeter: 2 },
      { ...EMPTY_SELECTION, installation: true, wire: true, wireLength: 120 },
    );
    expect(quote.total).toBe(1639);
  });

  it('arrondit au centime : 0,1 + 0,2 ne donne pas 0,30000000000000004', () => {
    const quote = computeQuote(
      { ...context, robotPrice: 0.1, wirePerMeter: 0.2 },
      { ...EMPTY_SELECTION, wire: true, wireLength: 1 },
    );
    expect(quote.total).toBe(0.3);
  });

  it('ajoute les accessoires choisis, au prix exact de /accessories', () => {
    const quote = computeQuote(context, {
      ...EMPTY_SELECTION,
      antennaId: 17,
      shelterId: 34,
    });
    expect(quote.total).toBe(1199 + 299 + 199.99);
    expect(quote.lines.map((l) => l.label)).toEqual([
      'Robot seul',
      'Antenne rs1',
      'Abris robot li',
    ]);
  });

  it('un accessoire sans prix est « à confirmer » et ne change pas le total', () => {
    const quote = computeQuote(context, { ...EMPTY_SELECTION, shelterId: 35 });
    expect(quote.total).toBe(1199);
    expect(quote.unpriced).toEqual(['Abri sur mesure']);
  });

  it('un câble ou un support sans prix connu est « à confirmer », jamais compté à 0 en silence', () => {
    const quote = computeQuote(
      { ...context, wirePerMeter: null, antennaSupportPrice: null },
      { ...EMPTY_SELECTION, wire: true, wireLength: 50, antennaSupport: true },
    );
    expect(quote.total).toBe(1199);
    expect(quote.unpriced).toEqual(['Câble périphérique', "Support d'antenne"]);
  });

  it("un placement inconnu est « à confirmer » mais l'installation reste annoncée comprise", () => {
    const quote = computeQuote(
      { ...context, placement: null },
      { ...EMPTY_SELECTION, installation: true },
    );
    expect(quote.installationIncluded).toBe(true);
    expect(quote.installationAmount).toBeNull();
    expect(quote.unpriced).toEqual(['Installation & placement']);
  });

  it("un câble coché sans longueur n'ajoute aucune ligne", () => {
    const quote = computeQuote(context, {
      ...EMPTY_SELECTION,
      wire: true,
      wireLength: 0,
    });
    expect(quote.lines.map((l) => l.key)).toEqual(['robot']);
  });

  it('ignore un accessoire inconnu', () => {
    const quote = computeQuote(context, { ...EMPTY_SELECTION, antennaId: 999 });
    expect(quote.lines).toHaveLength(1);
  });
});

describe('normalizeWireLength', () => {
  it.each([
    [120, 120],
    [-5, 0],
    [12.9, 12],
    [99999, 3000],
    [Number.NaN, 0],
  ])('%s donne %s', (input, expected) => {
    expect(normalizeWireLength(input)).toBe(expected);
  });
});

describe('quoteContextFor', () => {
  it('préfère le placement de /installation-prices, sinon celui du catalogue', () => {
    const robot = { price: 1199, installationPrice: 200 };
    expect(
      quoteContextFor(
        robot,
        { placement: 250, wirePerMeter: 1.3, antennaSupport: 50 },
        [],
      ).placement,
    ).toBe(250);
    const sans = quoteContextFor(robot, null, []);
    expect(sans.placement).toBe(200);
    expect(sans.wirePerMeter).toBeNull();
    expect(sans.antennaSupportPrice).toBeNull();
  });
});

describe('buildQuoteRequestBody', () => {
  it('produit exactement les clés que lit POST /quote-request', () => {
    const body = buildQuoteRequestBody(
      2,
      {
        ...EMPTY_SELECTION,
        installation: true,
        antennaId: 17,
        wire: true,
        wireLength: 120,
        antennaSupport: true,
      },
      contact,
    );
    expect(body).toEqual({
      clientFirstName: 'Jean',
      clientLastName: 'Dupont',
      clientEmail: 'jean@example.test',
      clientPhone: '0470 00 00 00',
      clientAddress: 'Rue des Fleurs 1',
      clientCity: '7090 Braine-le-Comte',
      robotInventoryId: 2,
      pluginInventoryId: null,
      antennaInventoryId: 17,
      shelterInventoryId: null,
      hasWire: true,
      wireLength: 120,
      hasAntennaSupport: true,
      hasPlacement: true,
      installationNotes: 'Pente derrière la maison',
      needsInstaller: true,
    });
  });

  it('sans installation cochée : ni placement ni installateur (D-14)', () => {
    const body = buildQuoteRequestBody(2, EMPTY_SELECTION, contact);
    expect(body.hasPlacement).toBe(false);
    expect(body.needsInstaller).toBe(false);
    expect(body.hasWire).toBe(false);
    expect(body.wireLength).toBe(0);
  });

  it('un câble coché sans longueur part décoché', () => {
    const body = buildQuoteRequestBody(
      2,
      { ...EMPTY_SELECTION, wire: true, wireLength: 0 },
      contact,
    );
    expect(body.hasWire).toBe(false);
  });

  it("une ville seule ne laisse pas d'espace de tête", () => {
    const body = buildQuoteRequestBody(2, EMPTY_SELECTION, {
      ...contact,
      postalCode: '',
      city: 'Mons',
    });
    expect(body.clientCity).toBe('Mons');
  });
});
