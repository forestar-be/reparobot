/**
 * Règles du catalogue, pures et testées : noms courts, types, filtres de l'URL.
 * Rien ici n'appelle l'API.
 */
import type { Robot } from './robots';

/** « Husqvarna Automower® 430V NERA » → « 430V NERA » (surtitre « Husqvarna Automower® » à part). */
export function robotShortName(name: string): string {
  return name.replace(/^Husqvarna\s+Automower®\s*/i, '').trim() || name;
}

export type CatalogueType = 'filaire' | 'sans-fil';

/** Modèle que le constructeur ne fabrique plus : la vitrine l'affiche « Abandonné ». */
export function isDiscontinued(robot: Pick<Robot, 'isDiscontinued'>): boolean {
  return robot.isDiscontinued === true;
}

/**
 * Disponibilité schema.org d'une offre. Seul l'abandon est publié : le stock est une
 * information interne qui ne remonte jamais à la vitrine.
 */
export function offerAvailability(
  robot: Pick<Robot, 'isDiscontinued'>,
): string | undefined {
  return isDiscontinued(robot) ? 'https://schema.org/Discontinued' : undefined;
}

/** Phrase de la fiche d'un modèle abandonné (sans dire s'il en reste en magasin). */
export const DISCONTINUED_NOTICE =
  'Husqvarna ne fabrique plus ce modèle. Contactez-nous pour connaître sa disponibilité.';

/** Catégorie de l'API → valeur de l'URL. */
export function typeOfRobot(robot: Pick<Robot, 'category'>): CatalogueType {
  return robot.category === 'wired' ? 'filaire' : 'sans-fil';
}

/** Libellé du badge (`wireType` : Filaire / Sans fil). */
export function typeLabel(type: CatalogueType): string {
  return type === 'filaire' ? 'Filaire' : 'Sans fil';
}

/** Paliers de « Mon jardin » : les robots dont la capacité couvre au moins la surface choisie. */
export const SURFACE_STEPS = [400, 800, 1500, 3000, 4800, 7500, 12000] as const;

export interface CatalogueFilters {
  type: CatalogueType | null;
  surface: number | null;
}

type Param = string | string[] | undefined;

const first = (v: Param): string | undefined => (Array.isArray(v) ? v[0] : v);

/** Lit `?type=sans-fil&surface=1500` ; une valeur inconnue est ignorée. */
export function parseCatalogueFilters(params: {
  type?: Param;
  surface?: Param;
}): CatalogueFilters {
  const rawType = first(params.type);
  const type: CatalogueType | null =
    rawType === 'filaire' || rawType === 'sans-fil' ? rawType : null;
  const rawSurface = Number(first(params.surface));
  const surface =
    Number.isInteger(rawSurface) && rawSurface > 0 && rawSurface <= 100000
      ? rawSurface
      : null;
  return { type, surface };
}

/** Construit la chaîne de requête d'un état de filtres (vide si aucun). */
export function catalogueHref(filters: CatalogueFilters): string {
  const qs = new URLSearchParams();
  if (filters.type) qs.set('type', filters.type);
  if (filters.surface) qs.set('surface', String(filters.surface));
  const text = qs.toString();
  return text ? `/robots?${text}` : '/robots';
}

/** Filtre sans réordonner : le serveur trie déjà par `publicOrder`. */
export function filterRobots(
  robots: Robot[],
  filters: CatalogueFilters,
): Robot[] {
  return robots.filter(
    (r) =>
      (!filters.type || typeOfRobot(r) === filters.type) &&
      (!filters.surface || r.maxSurface >= filters.surface),
  );
}

/** « 1 modèle présenté », « 5 modèles sur 16 ». */
export function countLabel(shown: number, total: number): string {
  const word = shown > 1 ? 'modèles' : 'modèle';
  if (shown === total) {
    return `${shown} ${word} ${shown > 1 ? 'présentés' : 'présenté'}`;
  }
  return `${shown} ${word} sur ${total}`;
}

/**
 * La description d'un robot (`publicDescription`) commence par une ligne d'accroche,
 * puis le détail. « Robot tondeuse pour…\nHusqvarna Automower® 305 présente… ».
 */
export function splitDescription(description: string | null | undefined): {
  lead: string;
  body: string;
} {
  const lines = (description ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { lead: '', body: '' };
  if (lines.length === 1) return { lead: lines[0], body: '' };
  return { lead: lines[0], body: lines.slice(1).join('\n') };
}

/** Description sur une ligne pour les balises meta : accroche seule, sans retour à la ligne. */
export function metaDescription(
  lead: string,
  extra: string,
  max = 158,
): string {
  const text = `${lead.replace(/[.\s]+$/, '')}. ${extra}`
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}
