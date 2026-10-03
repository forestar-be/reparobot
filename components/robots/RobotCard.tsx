import { robotShortName, typeLabel, typeOfRobot } from '../../lib/catalogue';
import { formatSurface } from '../../lib/format';
import type { Robot } from '../../lib/robots';
import Badge from '../ui/Badge';
import Glyph from '../ui/Glyph';
import Price, { InstallationPrice } from '../ui/Price';
import RobotImage from '../ui/RobotImage';
import Link from 'next/link';

/**
 * Carte robot de la maquette : photo entière sur fond sauge, badge de type, surtitre
 * « Husqvarna Automower® », modèle, surface, prix « TVAC, robot seul », installation,
 * flèche. Toute la carte ouvre la fiche `/robots/<slug>` ; aucune fenêtre de réservation.
 *
 * `featured` : version compacte de l'accueil (quatre colonnes, deux en mobile).
 * La promotion s'affiche telle que saisie dans forestar-robot (D-15).
 */
export default function RobotCard({
  robot,
  featured = false,
  priority = false,
}: {
  robot: Robot;
  featured?: boolean;
  priority?: boolean;
}) {
  const shortName = robotShortName(robot.name);
  const type = typeLabel(typeOfRobot(robot));
  return (
    <li className="m-0 flex list-none">
      <Link
        href={`/robots/${robot.slug}`}
        className={`group relative flex w-full flex-col overflow-hidden rounded-card border border-line bg-white transition-[border-color,box-shadow] duration-150 hover:border-[#8b9e83] hover:shadow-[0_9px_25px_#183e3209]`}
      >
        <div
          className={`relative bg-sage-soft ${
            featured
              ? 'h-[164px] px-[17px] pt-[30px] pb-[5px] mobile:h-[121px] mobile:px-[9px] mobile:pt-[26px] mobile:pb-[3px]'
              : 'h-[236px] px-5 pt-8 pb-3 mobile:h-[235px]'
          }`}
        >
          <Badge
            className={`absolute top-[13px] left-3.5 z-10 ${
              featured
                ? 'mobile:top-[9px] mobile:left-[9px] mobile:px-1.5 mobile:py-[3px]'
                : ''
            }`}
          >
            {type}
          </Badge>
          <div className="relative h-full w-full">
            <RobotImage
              src={robot.image}
              name={robot.name}
              priority={priority}
              sizes={
                featured
                  ? '(max-width: 760px) 50vw, 25vw'
                  : '(max-width: 760px) 100vw, (max-width: 1100px) 33vw, 400px'
              }
            />
          </div>
        </div>
        <div
          className={`flex flex-1 flex-col ${
            featured
              ? 'px-[17px] py-[15px] mobile:p-[11px]'
              : 'px-[22px] pt-[19px] pb-5 mobile:p-5'
          }`}
        >
          <span
            className={`mb-[5px] text-xs tracking-[0.07em] text-muted uppercase ${
              featured ? 'mobile:tracking-[0.02em]' : ''
            }`}
          >
            Husqvarna Automower®
          </span>
          <h3
            className={`mb-[9px] leading-[1.3] tracking-[-0.03em] text-ink ${
              featured
                ? 'min-h-10 text-[15px] mobile:mb-1.5 mobile:min-h-8'
                : 'min-h-[49px] text-[19px] mobile:min-h-0 mobile:text-[22px]'
            }`}
          >
            {shortName}
          </h3>
          <p
            className={`m-0 flex items-center gap-[7px] text-muted ${
              featured
                ? 'mb-2.5 text-sm mobile:mb-[9px] mobile:gap-1'
                : 'mb-[17px] text-sm mobile:mb-[15px]'
            }`}
          >
            <Glyph
              name="garden"
              className={featured ? 'h-5 w-5 mobile:h-3 mobile:w-3' : 'h-5 w-5'}
            />
            Jusqu’à {formatSurface(robot.maxSurface)}
          </p>
          {robot.promotion ? (
            <p className="mb-2.5 line-clamp-2 rounded-[3px] bg-sage px-2 py-1 text-sm leading-snug font-semibold text-forest mobile:line-clamp-3">
              {robot.promotion}
            </p>
          ) : null}
          <div className="mt-auto flex items-center justify-between gap-2.5">
            <Price amount={robot.price} size={featured ? 'compact' : 'card'} />
            <span
              className={`flex items-center justify-center rounded-full border border-line bg-ivory text-forest ${
                featured
                  ? 'h-[37px] w-[37px] mobile:h-7 mobile:w-7'
                  : 'h-[37px] w-[37px] mobile:h-10 mobile:w-10'
              }`}
            >
              <Glyph
                name="arrow"
                className={
                  featured ? 'h-5 w-5 mobile:h-3.5 mobile:w-3.5' : 'h-5 w-5'
                }
              />
            </span>
          </div>
          <InstallationPrice
            amount={robot.installationPrice}
            className="m-0 mt-[7px] text-sm text-muted"
          />
        </div>
      </Link>
    </li>
  );
}
