/**
 * Ancres internes : défilement explicite jusqu'à une cible de la page.
 *
 * Un lien `#cible` ne fait plus rien quand `#cible` est déjà dans l'adresse (clic, remontée,
 * reclic) : le navigateur et le routeur considèrent qu'il n'y a pas de changement. On défile
 * donc nous-mêmes, à chaque clic, quel que soit le hash courant.
 */

/** Éléments qu'on peut remplir, dans l'ordre du document. */
const FIELD_SELECTOR =
  'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])';

/** `true` si l'utilisateur demande moins d'animations (le défilement est alors instantané). */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Défile jusqu'à l'élément d'`id` donné, puis place le focus : sur son premier champ de
 * saisie s'il en a un, sinon sur l'élément lui-même (rendu focalisable au besoin).
 * Renvoie `false` si la cible n'existe pas dans la page.
 */
export function scrollToAnchor(id: string): boolean {
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });
  const field = target.querySelector<HTMLElement>(FIELD_SELECTOR);
  if (field) {
    field.focus({ preventScroll: true });
  } else {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
  return true;
}

/**
 * Découpe un `href` interne en chemin et ancre. `#passage` → `{ path: '', id: 'passage' }` ;
 * `/#contact` → `{ path: '/', id: 'contact' }` ; `/robots` → `null` (pas d'ancre).
 */
export function parseAnchorHref(
  href: string,
): { path: string; id: string } | null {
  const index = href.indexOf('#');
  if (index < 0 || index === href.length - 1) return null;
  return { path: href.slice(0, index), id: href.slice(index + 1) };
}

/** `true` si le chemin de l'ancre est celui de la page courante (chemin vide = la page courante). */
export function isSamePage(anchorPath: string, pathname: string): boolean {
  return anchorPath === '' || anchorPath === pathname;
}
