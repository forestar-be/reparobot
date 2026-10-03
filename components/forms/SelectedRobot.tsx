import { typeLabel, typeOfRobot } from '../../lib/catalogue';
import { formatSurface } from '../../lib/format';
import type { Robot } from '../../lib/robots';
import Glyph from '../ui/Glyph';
import RobotImage from '../ui/RobotImage';
import Link from 'next/link';

/** « Sans fil · Vision · 4800 m² » : ce qui distingue le robot en une ligne. */
export function robotSubtitle(robot: Robot): string {
  return [
    typeLabel(typeOfRobot(robot)),
    /vision/i.test(robot.name) ? 'Vision' : null,
    formatSurface(robot.maxSurface),
  ]
    .filter(Boolean)
    .join(' · ');
}

/**
 * Robot choisi, avec sa photo : en tête du devis et de la demande de contact, et dans le récapitulatif.
 * `changeHref` ajoute « Changer de robot » (retour au catalogue).
 */
export default function SelectedRobot({
  robot,
  changeHref,
  variant = 'card',
}: {
  robot: Robot;
  changeHref?: string;
  variant?: 'card' | 'compact';
}) {
  const compact = variant === 'compact';
  return (
    <div
      className={`flex items-center ${
        compact
          ? 'gap-3.5'
          : 'gap-[23px] rounded-[7px] bg-[#eff1e9] p-[17px] mobile:gap-[13px] mobile:p-3'
      }`}
    >
      <div
        className={`relative shrink-0 ${
          compact
            ? 'h-[78px] w-[86px]'
            : 'h-[91px] w-[116px] mobile:h-20 mobile:w-[85px]'
        }`}
      >
        <RobotImage
          src={robot.image}
          name={robot.name}
          sizes={compact ? '86px' : '116px'}
        />
      </div>
      <div className="min-w-0">
        <p
          className={`m-0 font-semibold tracking-[-0.02em] ${
            compact
              ? 'text-sm leading-[1.3]'
              : 'mb-[7px] text-[17px] leading-[1.3] mobile:text-[15px]'
          }`}
        >
          {robot.name}
        </p>
        <p className={`m-0 text-sm text-muted ${compact ? 'mt-1' : ''}`}>
          {robotSubtitle(robot)}
        </p>
        {changeHref && (
          <Link
            href={changeHref}
            className="mt-2 inline-flex items-center gap-3 border-b border-current pb-[3px] text-sm font-bold text-forest"
          >
            Changer de robot
            <Glyph name="arrow" className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
