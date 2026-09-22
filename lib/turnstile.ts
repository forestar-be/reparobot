/**
 * R006 (phase 9.18) — le socle commun du relais Turnstile de reparobot.be.
 *
 * D-04 : le front ne **vérifie** jamais un jeton, il le **relaie**. Le garde
 * vit dans forestar-server (R005), qui sert les trois routes de ces
 * formulaires. Ce fichier ne contient donc aucun secret et aucun appel réseau.
 *
 * Copié du storefront du shop plutôt que partagé : les deux dépôts n'ont
 * aucun paquet commun, et publier un paquet npm pour trois constantes ferait
 * dépendre la protection d'une publication de version. Le contrat réellement
 * commun est la liste des codes de refus, rendue par forestar-server.
 *
 * Importé par des composants CLIENT : ne rien y mettre qui dépende du réseau
 * ou d'une variable d'environnement non `NEXT_PUBLIC_*`.
 */

/**
 * Le nom conventionnel de Cloudflare. Le widget le rend dans un champ caché
 * piloté par React (`response-field: false` à l'appel de `render`), pour qu'il
 * n'existe jamais deux champs de ce nom dans le même formulaire.
 */
export const TURNSTILE_FIELD = 'cf-turnstile-response';

/** L'en-tête par lequel le jeton voyage jusqu'au garde (R005 le lit ainsi). */
export const TURNSTILE_HEADER = 'x-turnstile-token';

/**
 * `render=explicit` : le script ne cherche pas de `.cf-turnstile` dans la
 * page, c'est le composant qui appelle `turnstile.render()` sur son propre
 * conteneur.
 */
export const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/** Les trois refus que forestar-server rend, et eux seuls. */
export type TurnstileRefusal =
  | 'turnstile_required'
  | 'turnstile_failed'
  | 'turnstile_unavailable';

const REFUSALS: readonly string[] = [
  'turnstile_required',
  'turnstile_failed',
  'turnstile_unavailable',
];

/**
 * La sitekey est publique par construction (elle voyage dans le HTML). Elle
 * est figée au build par `NEXT_PUBLIC_*` : sans elle, aucun widget n'est rendu
 * et les trois formulaires se comportent exactement comme avant la phase 9.18
 * (AC-03) — c'est le mode du développement local.
 */
export function turnstileSiteKey(): string {
  return (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim();
}

export function turnstileEnabled(): boolean {
  return turnstileSiteKey().length > 0;
}

/** Reconnaît un refus Turnstile dans le code rendu par une server action. */
export function isTurnstileRefusal(
  code?: string | null,
): code is TurnstileRefusal {
  return typeof code === 'string' && REFUSALS.includes(code);
}

/**
 * Le message affiché par les trois formulaires, dans leur modale ou leur
 * bandeau existants (AC-05). Rend `null` pour tout le reste, délibérément : un
 * échec générique ne doit jamais devenir « refaites la vérification », ce qui
 * ne réparerait rien et masquerait la vraie cause.
 */
export function turnstileMessage(code?: string | null): string | null {
  if (code === 'turnstile_required') {
    return 'La vérification anti-robot est manquante. Rechargez la page, puis réessayez.';
  }
  if (code === 'turnstile_failed') {
    return 'La vérification anti-robot a échoué. Refaites-la, puis réessayez.';
  }
  if (code === 'turnstile_unavailable') {
    return 'La vérification anti-robot est momentanément indisponible. Réessayez dans un instant.';
  }
  return null;
}
