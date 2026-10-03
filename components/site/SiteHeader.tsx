import { getSiteInfo, shortHours, telHref } from '../../lib/site-info';
import HeaderBar from './HeaderBar';

/**
 * Bande locale (slogan, téléphone, horaires) puis en-tête. Les coordonnées viennent de
 * `site-info` (lib/site-info.ts), jamais d'un texte en dur.
 */
export default async function SiteHeader() {
  const info = await getSiteInfo();
  return (
    <>
      <div className="bg-forest py-2 text-[11px] tracking-[0.025em] text-on-dark mobile:py-[7px] mobile:text-[9px]">
        <div className="wrap flex justify-between mobile:justify-center">
          <span>Votre spécialiste des robots tondeuses à Braine-le-Comte</span>
          <a href={telHref(info)} className="text-on-dark mobile:hidden">
            {info.phoneDisplay} · {shortHours(info.hours)}
          </a>
        </div>
      </div>
      <header className="border-b border-line bg-ivory">
        <HeaderBar />
      </header>
    </>
  );
}
