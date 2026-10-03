import PhoneBlock from '../../components/forms/PhoneBlock';
import SelectedRobot from '../../components/forms/SelectedRobot';
import CallbackForm from '../../components/rappel/CallbackForm';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { TextLink } from '../../components/ui/Button';
import Eyebrow from '../../components/ui/Eyebrow';
import TrustStrip from '../../components/ui/TrustStrip';
import { robotShortName } from '../../lib/catalogue';
import { getRobotBySlug } from '../../lib/robots';
import { siteUrl } from '../../lib/site';
import { getSiteInfo } from '../../lib/site-info';
import type { Metadata } from 'next';

type SearchParams = Promise<{ robot?: string | string[] }>;

const slugOf = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? '';

export const metadata: Metadata = {
  title: 'Être rappelé',
  description:
    'Un conseil, une question sur un robot tondeuse Husqvarna ? Laissez-nous votre numéro, nous vous rappelons.',
  // Un formulaire, pas une page à référencer : les moteurs indexent les fiches.
  robots: { index: false, follow: true },
};

/**
 * `/rappel?robot=<slug>` (R006-S02). Sans robot, ou avec une adresse inconnue, le formulaire
 * reste utilisable, sans robot en tête : quelqu'un qui veut un conseil avant d'avoir choisi est
 * justement celui qu'il faut rappeler, et le renvoyer au catalogue serait une impasse. Le sujet de
 * l'email garde alors son préfixe seul (« Demande de rappel »).
 */
export default async function RappelPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [robot, info] = await Promise.all([
    getRobotBySlug(slugOf((await searchParams).robot)),
    getSiteInfo(),
  ]);

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Robots Husqvarna', href: '/robots' },
          ...(robot
            ? [
                {
                  label: robotShortName(robot.name),
                  href: `/robots/${robot.slug}`,
                },
              ]
            : []),
          { label: 'Être rappelé' },
        ]}
      />
      <div className="wrap">
        <div className="mx-auto grid max-w-[1050px] grid-cols-[0.95fr_1fr] items-start gap-[75px] pt-7 pb-[55px] tablet:gap-10 mobile:grid-cols-1 mobile:gap-[26px] mobile:pt-[15px] mobile:pb-[30px]">
          <div>
            {robot && (
              <div className="mb-[30px] mobile:mb-[26px]">
                <SelectedRobot robot={robot} />
              </div>
            )}
            <Eyebrow className="!mb-4">Un conseil, une question ?</Eyebrow>
            <h1 className="mb-[22px] text-[49px] mobile:mb-4 mobile:text-[35px]">
              On en parle
              <br />
              de vive voix.
            </h1>
            <p className="m-0 max-w-[430px] text-sm text-muted mobile:text-xs">
              Un doute sur le modèle, votre jardin ou l’installation ?
              Laissez-nous votre numéro, nous vous rappelons.
            </p>
            <PhoneBlock info={info} className="mt-[30px] mobile:hidden" />
            {robot && (
              <div className="mt-5 mobile:hidden">
                <TextLink href={`/robots/${robot.slug}`}>
                  Revenir à la fiche du robot
                </TextLink>
              </div>
            )}
          </div>
          <CallbackForm
            robot={
              robot
                ? {
                    name: robot.name,
                    slug: robot.slug,
                    ficheUrl: siteUrl(`/robots/${robot.slug}`),
                  }
                : null
            }
          />
        </div>
        <TrustStrip />
      </div>
    </>
  );
}
