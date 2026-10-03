/**
 * Consentement à la mesure d'audience (R004-S02, D-06).
 *
 * Le choix du visiteur vit dans `localStorage`, pour 12 mois : passé ce délai,
 * il est traité comme « aucun choix » et la question est reposée. Tant qu'aucun
 * choix valide n'existe, aucun traceur ne se charge (voir `components/Analytics`).
 *
 * `localStorage` peut lever (navigation privée, stockage bloqué) : chaque accès
 * est protégé et retombe sur « aucun choix connu » — la question est posée, rien
 * n'est mesuré. Un stockage défaillant ne casse jamais la page.
 */
export const CONSENT_STORAGE_KEY = 'reparobot-consent';
/** Émis sur `window` à chaque enregistrement d'un choix (`detail` : le choix). */
export const CONSENT_UPDATED_EVENT = 'reparobot-consent-updated';
/** Émis par « Gérer les cookies » : rouvre le bandeau. */
export const CONSENT_OPEN_EVENT = 'reparobot-consent-open';
/** Durée de conservation du choix : 12 mois (AC-02). */
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export type ConsentChoice = {
  analytics: boolean;
  /** Date ISO de l'enregistrement du choix. */
  updatedAt: string;
};

/** Lit le choix enregistré ; `null` s'il n'y en a pas, s'il est illisible ou périmé. */
export function readConsent(now: number = Date.now()): ConsentChoice | null {
  try {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<ConsentChoice> | null;
    if (
      !parsed ||
      typeof parsed.analytics !== 'boolean' ||
      typeof parsed.updatedAt !== 'string'
    ) {
      return null;
    }
    const savedAt = Date.parse(parsed.updatedAt);
    if (Number.isNaN(savedAt) || now - savedAt > CONSENT_MAX_AGE_MS) {
      return null;
    }
    return { analytics: parsed.analytics, updatedAt: parsed.updatedAt };
  } catch {
    return null;
  }
}

/** Enregistre le choix et prévient les composants. Un stockage bloqué n'empêche pas l'événement. */
export function saveConsent(analytics: boolean): ConsentChoice {
  const choice: ConsentChoice = {
    analytics,
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice));
  } catch {
    // Choix non retenu : il vaut pour la page en cours (événement ci-dessous).
  }
  try {
    window.dispatchEvent(
      new CustomEvent<ConsentChoice>(CONSENT_UPDATED_EVENT, { detail: choice }),
    );
  } catch {
    // Rien à faire : le choix est déjà enregistré.
  }
  return choice;
}

/** Vrai seulement après un « Accepter » encore valable. Relu à chaque appel. */
export function hasAnalyticsConsent(): boolean {
  return readConsent()?.analytics === true;
}

/** Rouvre le bandeau (lien « Gérer les cookies »). */
export function openConsentSettings(): void {
  try {
    window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
  } catch {
    // Sans effet : aucune fonctionnalité du site n'en dépend.
  }
}
