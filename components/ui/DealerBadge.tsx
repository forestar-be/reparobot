import Image from 'next/image';

/**
 * « Revendeur agréé Husqvarna » avec le logo officiel horizontal (D-08, D-19),
 * tel que fourni : ni recoloré ni redessiné, avec sa zone de protection (le
 * remplissage autour). Le bleu du logo reste propre à la marque.
 */
export default function DealerBadge({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-[15px] text-sm leading-normal text-forest mobile:gap-2.5 ${className}`}
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
        <strong className="block text-sm font-bold">
          Revendeur agréé Husqvarna
        </strong>
        Robots tondeuses · Belgique
      </div>
    </div>
  );
}
