/**
 * Coordonnées du magasin (R005-S02, R008-S02) : une seule source pour la bande
 * locale, le pied de page, la section contact et le JSON-LD `LocalBusiness`.
 *
 * Source : `GET /site-info` du serveur (clés Config « Reparobot - … » réglées dans
 * Paramètres de forestar-robot), mise en cache avec le tag `site-info`. Chaque champ
 * peut être `null` ; la route peut aussi être absente (404 avant son déploiement) ou
 * injoignable : dans tous ces cas, la valeur de secours ci-dessous prend le relais,
 * champ par champ, sans jamais lever.
 *
 * Les valeurs de secours sont celles qui seront écrites dans les clés Config de
 * production (relevées sur forestar.be, même magasin). Les coordonnées GPS sont celles
 * de l’épingle de la carte ; les anciens JSON-LD en portaient
 * de fausses.
 */

export interface SiteInfo {
  /** Numéro international, pour `tel:`. */
  phone: string;
  /** Numéro tel qu'affiché. */
  phoneDisplay: string;
  /** Une ligne par plage, « Libellé : plages ». */
  hours: string;
  address: string;
  googleRating: number;
  latitude: number;
  longitude: number;
}

export const FALLBACK_SITE_INFO: SiteInfo = {
  phone: '+3267830706',
  phoneDisplay: '067 83 07 06',
  hours:
    'Lundi — Vendredi : 07:00–12:00, 13:00–18:00\nSamedi : 08:00–12:00, 13:00–18:00\nDimanche : Fermé',
  address: "160 Chaussée d'Écaussinnes, 7090 Braine-le-Comte",
  googleRating: 4.6,
  latitude: 50.5993464,
  longitude: 4.1318598,
};

type RawSiteInfo = { [K in keyof SiteInfo]?: SiteInfo[K] | null };

const isText = (v: unknown): v is string =>
  typeof v === 'string' && v.trim() !== '';
const isNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

/** Fusionne une réponse de l'API (champs éventuellement `null`) avec les valeurs de secours. */
export function mergeSiteInfo(raw: unknown): SiteInfo {
  const r = (raw && typeof raw === 'object' ? raw : {}) as RawSiteInfo;
  const f = FALLBACK_SITE_INFO;
  return {
    phone: isText(r.phone) ? r.phone.trim() : f.phone,
    phoneDisplay: isText(r.phoneDisplay)
      ? r.phoneDisplay.trim()
      : f.phoneDisplay,
    hours: isText(r.hours) ? r.hours.trim() : f.hours,
    address: isText(r.address) ? r.address.trim() : f.address,
    googleRating: isNumber(r.googleRating) ? r.googleRating : f.googleRating,
    latitude: isNumber(r.latitude) ? r.latitude : f.latitude,
    longitude: isNumber(r.longitude) ? r.longitude : f.longitude,
  };
}

/** Lit `GET /site-info` ; ne lève jamais. */
export async function getSiteInfo(): Promise<SiteInfo> {
  const apiUrl = process.env.API_URL;
  const authToken = process.env.AUTH_TOKEN;
  if (!apiUrl || !authToken) return FALLBACK_SITE_INFO;
  try {
    const response = await fetch(`${apiUrl}/site-info`, {
      next: { revalidate: 3600, tags: ['site-info'] },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!response.ok) return FALLBACK_SITE_INFO;
    return mergeSiteInfo(await response.json());
  } catch {
    return FALLBACK_SITE_INFO;
  }
}

/** Nom du magasin, tel qu'on le cherche sur Google Maps et tel qu'il titre la bulle de la carte. */
export const STORE_NAME = 'Forestar Shop';

/** Site officiel de Forestar, proposé dans la bulle de la carte. */
export const OFFICIAL_SITE_URL = 'https://www.forestar.be';

/** Lien Google Maps vers le magasin (recherche « nom, adresse »), pour « Voir sur la carte ». */
export function mapsHref(info: Pick<SiteInfo, 'address'>): string {
  const query = encodeURIComponent(`${STORE_NAME}, ${info.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/** Lignes d'horaires, sans ligne vide. */
export function hoursLines(hours: string): string[] {
  return hours
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Version courte pour la bande locale : la première ligne. */
export function shortHours(hours: string): string {
  return hoursLines(hours)[0] ?? '';
}

/** Lien `tel:` d'un numéro (le numéro international de l'API, sinon dérivé de l'affichage). */
export function telHref(
  info: Pick<SiteInfo, 'phone' | 'phoneDisplay'>,
): string {
  const digits = (info.phone || info.phoneDisplay).replace(/[^\d+]/g, '');
  return `tel:${digits}`;
}

const DAYS = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
] as const;
const SCHEMA_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export interface OpeningHoursSpecification {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

function dayIndex(label: string): number {
  const norm = label.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return DAYS.indexOf(norm as (typeof DAYS)[number]);
}

/**
 * Dérive les `openingHoursSpecification` du JSON-LD depuis les lignes d'horaires
 * (« Lundi — Vendredi : 07:00–12:00, 13:00–18:00 », « Samedi : 08:00–12:00 »,
 * « Dimanche : Fermé »). Une ligne « Fermé » ou illisible est omise : on n'invente
 * jamais un horaire.
 */
export function parseOpeningHours(hours: string): OpeningHoursSpecification[] {
  const specs: OpeningHoursSpecification[] = [];
  for (const line of hoursLines(hours)) {
    const sep = line.indexOf(':');
    if (sep < 0) continue;
    const label = line.slice(0, sep);
    const ranges = line.slice(sep + 1);

    const bounds = label.split(/\s*[—–-]\s*|\s+(?:à|au|a)\s+/i);
    if (bounds.length < 1 || bounds.length > 2) continue;
    const from = dayIndex(bounds[0]);
    const to = bounds.length === 2 ? dayIndex(bounds[1]) : from;
    if (from < 0 || to < from) continue;
    const dayOfWeek = SCHEMA_DAYS.slice(from, to + 1) as unknown as string[];

    for (const range of ranges.split(',')) {
      const m = range
        .trim()
        .match(/^(\d{1,2}):(\d{2})\s*[—–-]\s*(\d{1,2}):(\d{2})$/);
      if (!m) continue;
      const opens = `${m[1].padStart(2, '0')}:${m[2]}`;
      const closes = `${m[3].padStart(2, '0')}:${m[4]}`;
      specs.push({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [...dayOfWeek],
        opens,
        closes,
      });
    }
  }
  return specs;
}

/** Découpe « 160 Chaussée d'Écaussinnes, 7090 Braine-le-Comte » pour `PostalAddress`. */
export function parseAddress(address: string): {
  streetAddress: string;
  postalCode?: string;
  addressLocality?: string;
} {
  const m = address.match(/^(.*?),\s*(\d{4})\s+(.+)$/);
  if (!m) return { streetAddress: address };
  return { streetAddress: m[1], postalCode: m[2], addressLocality: m[3] };
}

/** `4.6` s'affiche « 4,6 ». */
export function formatRating(rating: number): string {
  return String(rating).replace('.', ',');
}
