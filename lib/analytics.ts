/**
 * Mesure d'audience GA4 (R004-S02, D-06) — modèle allégé de celle du shop.
 *
 * Règles :
 *
 * 1. **Le consentement se relit à chaque émission**, jamais au montage : un
 *    visiteur qui retire son accord cesse d'être mesuré aussitôt, sans rechargement.
 * 2. **Aucun identifiant, aucune mesure** : sans `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
 *    valide, ni script, ni bandeau, ni événement.
 * 3. **La mesure ne bloque jamais un formulaire** : chaque émission est protégée
 *    par `try` et ne renvoie rien. Une erreur de mesure est avalée.
 *
 * Quatre événements seulement : `page_view` (émis par GA4), `generate_lead` (devis, rappel,
 * entretien) et `phone_click`. Aucun contenu de formulaire n'est transmis.
 */
import { hasAnalyticsConsent } from './consent';

/**
 * L'identifiant d'une propriété GA4 : `G-` suivi de lettres et chiffres. Le gabarit
 * `G-XXXXXXXXXX` respecte cette forme mais ne désigne aucune propriété : mesuré sur
 * le shop (R169), il y a fait afficher un bandeau et partir des événements vers le
 * vide. Il est donc exclu explicitement.
 */
export function isConfiguredGa4MeasurementId(
  value: string | null | undefined,
): boolean {
  const trimmed = (value ?? '').trim();
  if (!/^G-[A-Z0-9]{4,}$/.test(trimmed)) return false;
  return !/^X+$/.test(trimmed.slice(2));
}

const RAW_GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

/** Identifiant résolu, ou `null` : la seule source de vérité pour « GA4 est-il configuré ». */
export const GA4_MEASUREMENT_ID: string | null = isConfiguredGa4MeasurementId(
  RAW_GA4_MEASUREMENT_ID,
)
  ? (RAW_GA4_MEASUREMENT_ID as string).trim()
  : null;

/** Faut-il demander un consentement ? Sans mesure configurée, il n'y a rien à refuser. */
export const CONSENT_UI_ENABLED = GA4_MEASUREMENT_ID !== null;

/** Durée des cookies GA4 : 395 jours (13 mois), en secondes. */
const GA4_COOKIE_EXPIRES_SECONDS = 395 * 24 * 60 * 60;

type Gtag = (...args: unknown[]) => void;
type MeasuredWindow = {
  dataLayer?: unknown[];
  gtag?: Gtag;
  [key: string]: unknown;
};

function measuredWindow(): MeasuredWindow {
  return window as unknown as MeasuredWindow;
}

let bootstrapped = false;

/** Remet l'amorçage à zéro (tests uniquement). */
export function resetAnalyticsForTests(): void {
  bootstrapped = false;
}

function gtagQueue(): Gtag | null {
  if (!GA4_MEASUREMENT_ID || typeof window === 'undefined') return null;
  const scope = measuredWindow();
  scope.dataLayer = scope.dataLayer || [];
  if (!scope.gtag) {
    scope.gtag = function gtag() {
      // gtag.js attend l'objet `arguments`, pas un tableau.
      // eslint-disable-next-line prefer-rest-params
      scope.dataLayer?.push(arguments);
    };
  }
  return scope.gtag;
}

/**
 * Prépare la file `gtag` AVANT le chargement du script (Consent Mode v2) : tout est
 * refusé par défaut, puis seule la mesure d'audience est accordée — l'amorçage n'a
 * lieu que sur un chemin déjà consenti. Idempotent.
 */
export function ensureAnalyticsBootstrap(): void {
  try {
    if (bootstrapped) return;
    const gtag = gtagQueue();
    if (!gtag || !GA4_MEASUREMENT_ID) return;
    bootstrapped = true;

    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    gtag('consent', 'update', { analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', GA4_MEASUREMENT_ID, {
      // Première page vue à l'accord ; les suivantes viennent de la mesure
      // améliorée (changements d'historique). Le site n'en émet aucune.
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: GA4_COOKIE_EXPIRES_SECONDS,
    });
  } catch {
    // La mesure ne doit jamais casser la page.
  }
}

/**
 * Reflète le consentement courant auprès de gtag.js déjà chargé. Le mode consentement
 * `denied` ne suffit pas à le faire taire (il continue d'envoyer des pings sans
 * cookie) : l'interrupteur `ga-disable-<ID>` coupe, lui, tous les envois.
 */
export function syncAnalyticsConsent(allowed: boolean): void {
  try {
    if (!GA4_MEASUREMENT_ID || typeof window === 'undefined') return;
    const scope = measuredWindow();
    scope[`ga-disable-${GA4_MEASUREMENT_ID}`] = !allowed;
    scope.gtag?.('consent', 'update', {
      analytics_storage: allowed ? 'granted' : 'denied',
    });
  } catch {
    // Voir ensureAnalyticsBootstrap.
  }
}

/** Émet un événement si, et seulement si, GA4 est configuré ET le visiteur a accepté. */
function send(name: string, params: Record<string, string>): void {
  try {
    if (!GA4_MEASUREMENT_ID || typeof window === 'undefined') return;
    if (!hasAnalyticsConsent()) return;
    ensureAnalyticsBootstrap();
    measuredWindow().gtag?.('event', name, params);
  } catch {
    // La mesure ne bloque jamais un formulaire ni un lien.
  }
}

export type LeadType = 'devis' | 'rappel' | 'entretien';

/**
 * Une demande a atteint le serveur. À appeler APRÈS la réponse de succès, jamais
 * avant : un refus (Turnstile, validation) n'est pas un contact obtenu.
 */
export function trackLead(type: LeadType): void {
  send('generate_lead', { lead_type: type });
}

/** Clic sur un lien `tel:` (le numéro lui-même n'est pas transmis). */
export function trackPhoneClick(): void {
  send('phone_click', { link_type: 'tel' });
}
