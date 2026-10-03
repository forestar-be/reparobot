'use client';

import Glyph from '../ui/Glyph';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isActive, NAV_ITEMS } from './nav-items';

/**
 * Barre fixe du mobile (sous 760 px) : Robots · Entretien · Appeler. Le contenu lui
 * réserve sa place (padding du `body`, zone de sécurité du téléphone comprise).
 *
 * « Appeler » est un lien `tel:` : l'écouteur unique de `components/Analytics` émet
 * `phone_click` (via `trackPhoneClick`) pour tout lien `tel:` du site — l'appeler ici
 * aussi compterait le clic deux fois.
 */
export default function MobileBar({ phoneHref }: { phoneHref: string }) {
  const pathname = usePathname();
  const [robots, entretien] = NAV_ITEMS;
  const tab = (active: boolean) =>
    `flex min-h-10 flex-col items-center justify-center gap-1 text-xs font-semibold ${
      active ? 'text-forest' : 'text-muted'
    }`;
  return (
    <nav
      aria-label="Accès rapides"
      className="fixed inset-x-0 bottom-0 z-10 hidden grid-cols-3 border-t border-line bg-white px-2.5 pt-[9px] pb-[calc(9px+env(safe-area-inset-bottom))] shadow-[0_-3px_16px_#183e3208] mobile:grid"
    >
      <Link
        href={robots.href}
        aria-current={isActive(robots, pathname) ? 'page' : undefined}
        className={tab(isActive(robots, pathname))}
      >
        <Glyph name="robot" />
        Robots
      </Link>
      <Link
        href={entretien.href}
        aria-current={isActive(entretien, pathname) ? 'page' : undefined}
        className={`border-l border-line ${tab(isActive(entretien, pathname))}`}
      >
        <Glyph name="tool" />
        Entretien
      </Link>
      <a href={phoneHref} className={`border-l border-line ${tab(false)}`}>
        <Glyph name="phone" />
        Appeler
      </a>
    </nav>
  );
}
