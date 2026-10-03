'use client';

import { isSamePage, parseAnchorHref, scrollToAnchor } from '../../lib/anchor';
import type { ComponentProps, MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Lien interne qui défile vraiment jusqu'à son ancre, à chaque clic.
 *
 * Quand le lien vise une ancre de la page courante, on prend la main : défilement explicite
 * (respecte `prefers-reduced-motion`), focus sur la cible, adresse mise à jour sans entrée
 * d'historique en plus. Dans tous les autres cas (autre page, clic modifié, ancre absente),
 * c'est le comportement normal de `next/link`.
 */
export default function AnchorLink({
  href,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname();
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const anchor = parseAnchorHref(href);
    if (!anchor || !isSamePage(anchor.path, pathname)) return;
    if (!document.getElementById(anchor.id)) return;
    event.preventDefault();
    // Au prochain affichage : le `onClick` du parent a pu changer la mise en page (un menu qui se
    // referme) et la position de la cible avec elle ; on défile vers sa position définitive.
    window.requestAnimationFrame(() => scrollToAnchor(anchor.id));
    window.history.replaceState(null, '', `${pathname}#${anchor.id}`);
  };
  return <Link href={href} onClick={handleClick} {...props} />;
}
