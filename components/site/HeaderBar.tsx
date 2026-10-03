'use client';

import AnchorLink from '../ui/AnchorLink';
import Button from '../ui/Button';
import Glyph from '../ui/Glyph';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Brand from './Brand';
import { isActive, NAV_ITEMS } from './nav-items';

/**
 * Barre d'en-tête : signature, menu, « Devis gratuit » (vers le catalogue, D-18) et,
 * sous 760 px, un menu repliable fermé par Échap (le focus revient au bouton).
 */
export default function HeaderBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Un changement de page referme le menu.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const linkClass = (active: boolean) =>
    `hover:text-forest ${active ? 'border-b border-forest text-forest' : ''}`;

  return (
    <>
      <div className="wrap flex h-[91px] items-center gap-[35px] tablet:gap-5 mobile:h-[73px] mobile:gap-3">
        <Brand className="mr-auto" />
        <nav
          aria-label="Navigation principale"
          className="flex items-center gap-7 text-sm font-semibold tablet:gap-[15px] mobile:hidden"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item, pathname);
            return (
              <AnchorLink
                key={item.label}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={linkClass(active)}
              >
                {item.label}
              </AnchorLink>
            );
          })}
        </nav>
        <Button href="/robots" className="mobile:hidden">
          Devis gratuit
        </Button>
        <button
          ref={buttonRef}
          type="button"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((v) => !v)}
          className="hidden h-[45px] w-[45px] items-center justify-center rounded-action border border-line bg-transparent mobile:flex"
        >
          <Glyph name={open ? 'close' : 'menu'} />
        </button>
      </div>
      <nav
        id="menu-mobile"
        aria-label="Navigation mobile"
        className="hidden flex-col border-b border-line bg-ivory px-[18px] pt-1 pb-[18px] mobile:data-[open=true]:flex"
        data-open={open}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item, pathname);
          return (
            <AnchorLink
              key={item.label}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              onClick={() => setOpen(false)}
              className={`border-b border-line py-[11px] text-sm ${
                active ? 'font-semibold text-forest' : ''
              }`}
            >
              {item.label}
            </AnchorLink>
          );
        })}
        <Button href="/robots" className="mt-[13px]">
          Devis gratuit
        </Button>
      </nav>
    </>
  );
}
