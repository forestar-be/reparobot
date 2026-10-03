import Image from 'next/image';

/**
 * « Revendeur agréé Husqvarna » avec le logo officiel horizontal (D-08, D-19),
 * tel que fourni : ni recoloré ni redessiné, avec sa zone de protection (le
 * remplissage autour). Le bleu du logo reste propre à la marque.
 *
 * `withTagline={false}` retire « Robots tondeuses · Belgique » là où le titre voisin le dit
 * déjà (héros de l'accueil, PO 4 oct. 2026).
 */
export default function DealerBadge({
  className = '',
  withTagline = true,
}: {
  className?: string;
  withTagline?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 text-xs leading-normal text-forest mobile:gap-2.5 ${className}`}
    >
      <Image
        src="/images/husqvarna-officiel.svg"
        alt="Husqvarna"
        width={240}
        height={44}
        unoptimized
        className="h-11 w-[123px] object-contain p-2 mobile:h-[35px] mobile:w-[107px] mobile:p-[7px]"
      />
      <div>
        <strong className="block text-xs font-bold">
          Revendeur agréé Husqvarna
        </strong>
        {withTagline ? 'Robots tondeuses · Belgique' : null}
      </div>
    </div>
  );
}
