import { formatRating, getSiteInfo } from '../../lib/site-info';
import Glyph, { type GlyphName } from './Glyph';

/**
 * Bande de confiance à trois items (atelier, note Google, suivi toutes marques).
 * La note vient de `site-info` : une seule source avec le JSON-LD.
 */
export default async function TrustStrip() {
  const info = await getSiteInfo();
  const items: { icon: GlyphName; title: string; text: string }[] = [
    {
      icon: 'pin',
      title: 'Un atelier près de chez vous',
      text: 'Braine-le-Comte, depuis 2008',
    },
    {
      icon: 'star',
      title: `${formatRating(info.googleRating)} / 5 sur Google`,
      text: 'La confiance de nos clients',
    },
    {
      icon: 'tool',
      title: 'Un suivi, toutes marques',
      text: 'Entretien, hivernage et réparation',
    },
  ];
  return (
    <ul className="m-0 grid list-none grid-cols-3 gap-6 border-t border-line p-0 py-[23px] mobile:grid-cols-1 mobile:gap-[18px] mobile:py-[22px]">
      {items.map((item) => (
        <li key={item.title} className="flex items-center gap-3.5">
          <Glyph name={item.icon} className="h-[26px] w-[26px] text-forest" />
          <div>
            <b className="block text-xs mobile:text-[11px]">{item.title}</b>
            <p className="m-0 text-[11px] text-muted mobile:text-[10px]">
              {item.text}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
