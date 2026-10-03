import { getSiteInfo, hoursLines, telHref } from '../../lib/site-info';
import CookieSettingsButton from '../CookieSettingsButton';
import DealerBadge from '../ui/DealerBadge';
import Link from 'next/link';
import Brand from './Brand';
import { NAV_ITEMS } from './nav-items';

/** TVA de Forestar. */
const VAT_NUMBER = 'BE0806-685-256';

/**
 * Pied de page : signature, menu, coordonnées (site-info), mention « Revendeur agréé
 * Husqvarna », liens légaux (cookies et « Gérer les cookies »), lien vers forestar.be.
 */
export default async function SiteFooter() {
  const info = await getSiteInfo();
  return (
    <footer className="border-t border-line bg-footer pt-9 pb-[23px] mobile:pt-[26px] mobile:pb-5">
      <div className="wrap">
        <div className="mb-7 flex justify-between gap-6 mobile:mb-[22px] mobile:flex-col mobile:gap-5">
          <div className="flex flex-col gap-4">
            <Brand />
            <DealerBadge />
          </div>
          <nav
            aria-label="Pied de page"
            className="flex items-start gap-[27px] text-[11px] mobile:grid mobile:grid-cols-2 mobile:gap-3"
          >
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} href={item.href} className="py-1">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mb-7 grid grid-cols-[1.4fr_1fr_1fr] gap-8 border-t border-[#cfd7c9] pt-6 text-[11px] mobile:grid-cols-1 mobile:gap-5">
          <address className="not-italic">
            <b className="mb-1.5 block text-xs">Atelier et magasin</b>
            <p className="m-0 text-muted">{info.address}</p>
            <a
              href={telHref(info)}
              className="mt-1 inline-block font-bold text-forest"
            >
              {info.phoneDisplay}
            </a>
          </address>
          <div>
            <b className="mb-1.5 block text-xs">Horaires</b>
            {hoursLines(info.hours).map((line) => (
              <p key={line} className="m-0 text-muted">
                {line}
              </p>
            ))}
          </div>
          <div>
            <b className="mb-1.5 block text-xs">Informations</b>
            <p className="m-0 flex flex-col items-start">
              <Link
                href="/cookies"
                className="py-1 text-muted hover:text-forest"
              >
                Cookies et mesure d&apos;audience
              </Link>
              <CookieSettingsButton className="py-1 text-left text-muted underline hover:text-forest" />
            </p>
          </div>
        </div>
        <div
          className={`flex justify-between gap-5 border-t border-[#cfd7c9] pt-[17px] text-[10px] text-muted mobile:flex-col mobile:gap-2 mobile:text-[9px]`}
        >
          <span>
            © {new Date().getFullYear()} Forestar · Braine-le-Comte, Belgique ·
            TVA {VAT_NUMBER}
          </span>
          <span>
            Services professionnels fournis par{' '}
            <a
              href="https://forestar.be"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-forest"
            >
              Forestar.be
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
