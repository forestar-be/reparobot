/**
 * « Réserver un passage » (R007) : forfaits, options, total et corps de `POST /submit-form`.
 *
 * Fonctions pures. Les prix viennent de `GET /service-offers` (jamais en dur) : un prix
 * `null` se lit « sur devis ».
 */
import { formatEuro } from './format';
import type { ServiceKind, ServiceOffer } from './service-offers';

export type RequestType = 'Entretien' | 'Réparation' | 'Installation';

/** Les trois types d'intervention du formulaire, et le service de forfaits qui leur répond. */
export const REQUEST_TYPES: ReadonlyArray<{
  type: RequestType;
  service: ServiceKind;
  /** Libellé quand le forfait de base manque (API absente). */
  fallbackLabel: string;
}> = [
  {
    type: 'Entretien',
    service: 'MAINTENANCE',
    fallbackLabel: 'Entretien annuel',
  },
  { type: 'Réparation', service: 'REPAIR', fallbackLabel: 'Réparation' },
  {
    type: 'Installation',
    service: 'INSTALLATION_HELP',
    fallbackLabel: "Problème d'installation",
  },
];

const round2 = (n: number): number => Math.round(n * 100) / 100;

const normalize = (text: string): string =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** « sur devis » pour `null`, sinon le montant. */
export function priceText(price: number | null): string {
  return price === null ? 'sur devis' : formatEuro(price);
}

/** Montant d'un forfait en grand (cartes) : `null` devient « Sur devis ». */
export function amountOrQuote(price: number | null): string {
  return price === null ? 'Sur devis' : formatEuro(price);
}

/** Supplément d'une option : « + X € », « sans supplément » pour 0, « sur devis » pour `null`. */
export function supplementText(price: number | null): string {
  if (price === null) return 'sur devis';
  if (price === 0) return 'sans supplément';
  return `+ ${formatEuro(price)}`;
}

/** L'option d'hivernage de l'entretien (repérée à son libellé : le forfait n'a pas d'autre marque). */
export function winterOption(offers: ServiceOffer[]): ServiceOffer | undefined {
  return offers
    .filter((o) => o.service === 'MAINTENANCE' && o.kind === 'OPTION')
    .sort((a, b) => a.order - b.order)
    .find((o) => normalize(o.label).includes('hivernage'));
}

/** « Entretien + hivernage » : somme calculée du forfait de base et de l'option, jamais saisie. */
export function winterPackage(
  base: ServiceOffer | undefined,
  winter: ServiceOffer | undefined,
): { total: number } | null {
  if (!base || !winter) return null;
  if (base.price === null || winter.price === null) return null;
  return { total: round2(base.price + winter.price) };
}

/** Options à choix libre (cases) et groupes exclusifs (un choix parmi plusieurs). */
export interface OptionGroups {
  free: ServiceOffer[];
  groups: Array<{ key: string; options: ServiceOffer[] }>;
}

export function groupOptions(options: ServiceOffer[]): OptionGroups {
  const free: ServiceOffer[] = [];
  const groups: OptionGroups['groups'] = [];
  for (const option of options) {
    if (!option.exclusiveGroup) {
      free.push(option);
      continue;
    }
    const group = groups.find((g) => g.key === option.exclusiveGroup);
    if (group) group.options.push(option);
    else groups.push({ key: option.exclusiveGroup, options: [option] });
  }
  return { free, groups };
}

/** « lames » devient « Lames ». */
export function groupLabel(key: string): string {
  const text = key.trim().replace(/[-_]+/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Coche ou décoche une option. Choisir une option d'un groupe exclusif retire les autres
 * du même groupe ; les groupes entre eux et les cases libres ne se touchent pas.
 */
export function toggleOption(
  options: ServiceOffer[],
  chosen: number[],
  id: number,
  on: boolean,
): number[] {
  const target = options.find((o) => o.id === id);
  if (!target) return chosen;
  const without = chosen.filter((c) => {
    if (c === id) return false;
    const other = options.find((o) => o.id === c);
    return !(
      on &&
      target.exclusiveGroup &&
      other?.exclusiveGroup === target.exclusiveGroup
    );
  });
  return on ? [...without, id] : without;
}

export interface ServiceTotal {
  /** Somme des prix connus. */
  known: number;
  /** Un prix au moins reste à chiffrer (réparation, option sur devis). */
  hasUnpriced: boolean;
  /** « X € », « X € + devis » ou « Sur devis ». */
  text: string;
  /** Légende du total. */
  label: string;
}

export function computeServiceTotal(
  base: ServiceOffer | undefined,
  chosen: ServiceOffer[],
): ServiceTotal {
  const prices = [base?.price ?? null, ...chosen.map((o) => o.price)];
  const hasUnpriced = prices.some((p) => p === null);
  const known = round2(prices.reduce<number>((sum, p) => sum + (p ?? 0), 0));
  const text = !hasUnpriced
    ? formatEuro(known)
    : known > 0
      ? `${formatEuro(known)} + devis`
      : 'Sur devis';
  return {
    known,
    hasUnpriced,
    text,
    label: hasUnpriced
      ? 'Suppléments connus · le reste est chiffré par l’atelier'
      : 'Forfait avec options · TVAC',
  };
}

export interface ServiceContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  robotCode: string;
  notes: string;
}

export interface ServiceRequestInput {
  type: RequestType;
  brand: string;
  model: string;
  base: ServiceOffer | undefined;
  fallbackLabel: string;
  chosen: ServiceOffer[];
  /** Date souhaitée au format AAAA-MM-JJ, ou vide. */
  date: string;
  contact: ServiceContact;
}

/** `2026-10-12` devient `12/10/2026` (le format des anciens emails). */
export function frenchDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : isoDate;
}

/**
 * Corps de `POST /submit-form`. Le serveur choisit le sujet de l'email avec
 * `Type de demande` et `Marque`, puis liste toutes les clés dans l'ordre : une ligne par
 * forfait et par option, avec son prix. Les champs facultatifs vides sont omis.
 */
export function buildServiceRequestBody(
  input: ServiceRequestInput,
): Record<string, string | boolean> {
  const { contact } = input;
  const total = computeServiceTotal(input.base, input.chosen);
  const body: Record<string, string | boolean> = {
    'Type de demande': input.type,
    Marque: input.brand.trim(),
  };
  const put = (key: string, value: string) => {
    if (value.trim()) body[key] = value.trim();
  };
  put('Modèle', input.model);
  body['Forfait'] =
    `${input.base?.label ?? input.fallbackLabel} — ${priceText(input.base?.price ?? null)}`;
  for (const option of input.chosen) {
    body[option.label] = supplementText(option.price);
  }
  body['Total estimé'] = total.text;
  if (input.date) body['Date souhaitée'] = frenchDate(input.date);
  body['Nom de famille'] = contact.lastName.trim();
  body['Prénom'] = contact.firstName.trim();
  put('Adresse', contact.address);
  body['Adresse e-mail'] = contact.email.trim();
  body['Numéro de téléphone'] = contact.phone.trim();
  put('Code du robot', contact.robotCode);
  put('Remarques', contact.notes);
  body['Conditions acceptées'] = true;
  return body;
}

/** Marques proposées en suggestion (le champ reste libre : toutes les marques). */
export const BRAND_SUGGESTIONS = [
  'Husqvarna',
  'Gardena',
  'Worx',
  'Bosch',
  'Stihl',
  'Honda',
  'McCulloch',
  'Ambrogio',
  'Robomow',
  'Stiga',
  'Segway Navimow',
] as const;
