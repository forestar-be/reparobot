import { hoursLines, telHref, type SiteInfo } from '../../lib/site-info';
import Glyph from '../ui/Glyph';

/**
 * Téléphone direct du magasin et ses horaires. Le clic sur le lien `tel:` est compté par l'écouteur
 * unique de `components/Analytics` : ne pas appeler `trackPhoneClick` ici.
 */
export default function PhoneBlock({
  info,
  className = '',
}: {
  info: Pick<SiteInfo, 'phone' | 'phoneDisplay' | 'hours'>;
  className?: string;
}) {
  const hours = hoursLines(info.hours)[0];
  return (
    <div
      className={`flex items-center gap-[13px] border-t border-line py-4 ${className}`}
    >
      <Glyph name="phone" className="h-[26px] w-[26px] text-forest" />
      <div>
        <a href={telHref(info)} className="text-base font-bold text-forest">
          {info.phoneDisplay}
        </a>
        {hours && (
          <small className="block text-sm leading-normal text-muted">
            {hours}
          </small>
        )}
      </div>
    </div>
  );
}
