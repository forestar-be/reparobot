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
