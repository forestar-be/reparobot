import RobotCard from '../components/robots/RobotCard';
import ContactBand from '../components/site/ContactBand';
import Button, { TextLink } from '../components/ui/Button';
import DealerBadge from '../components/ui/DealerBadge';
import Eyebrow from '../components/ui/Eyebrow';
import Glyph from '../components/ui/Glyph';
import TrustStrip from '../components/ui/TrustStrip';
import { formatEuro } from '../lib/format';
import { buildLocalBusiness } from '../lib/local-business';
import { getFeaturedRobots } from '../lib/robots';
import {
  baseOffer,
  getServiceOffers,
  type ServiceKind,
} from '../lib/service-offers';
import { siteUrl } from '../lib/site';
import { getSiteInfo } from '../lib/site-info';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    absolute: 'Robots tondeuses Husqvarna à Braine-le-Comte | reparobot',
  },
  description:
    'Revendeur agréé Husqvarna à Braine-le-Comte : robots tondeuses Automower®, installation, entretien et réparation de robots de toutes marques. Devis gratuit.',
  alternates: { canonical: siteUrl('/') },
  openGraph: {
    type: 'website',
    locale: 'fr_BE',
    url: siteUrl('/'),
    title: 'Robots tondeuses Husqvarna à Braine-le-Comte',
    description:
      'Choisissez votre robot Husqvarna, ou confiez-nous l’entretien et la réparation de votre robot, toutes marques.',
    images: [{ url: siteUrl('/images/jardin-430v.png') }],
  },
};

/** Les trois lignes de l'atelier : forfait de base de chaque service, dans cet ordre. */
const WORKSHOP_SERVICES: ServiceKind[] = [
  'MAINTENANCE',
  'REPAIR',
  'INSTALLATION_HELP',
];

export default async function Home() {
  const [featured, offers, info] = await Promise.all([
    getFeaturedRobots(),
    getServiceOffers(),
    getSiteInfo(),
  ]);
  const workshop = WORKSHOP_SERVICES.map((service) =>
    baseOffer(offers, service),
  ).filter((offer): offer is NonNullable<typeof offer> => Boolean(offer));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildLocalBusiness(info)),
        }}
      />
      <div className="wrap">
        <section className="grid grid-cols-[1.04fr_1fr] items-center gap-[65px] pt-[38px] tablet:gap-[30px] mobile:grid-cols-1 mobile:gap-5 mobile:pt-[22px]">
          <div>
            <DealerBadge withTagline={false} />
            <h1 className="mt-[22px] text-[15px] font-bold tracking-normal text-forest mobile:mt-[17px]">
              Robots tondeuses Husqvarna à Braine-le-Comte
            </h1>
            <p className="mt-2 mb-[25px] max-w-[850px] text-[64px] leading-[1.12] font-semibold tracking-[-0.045em] text-ink tablet:text-[53px] mobile:mt-1.5 mobile:mb-[21px] mobile:text-[44px] mobile:leading-[1.05] mobile:tracking-[-0.055em]">
              Votre jardin.
              <br />
              Notre spécialité.
            </p>
            <div className="flex gap-2.5 tablet:flex-wrap tablet:gap-2 mobile:flex-col mobile:gap-[9px]">
              <Button
                href="/robots"
                className="mobile:w-full mobile:justify-between"
              >
                Choisir mon robot
              </Button>
              <Button
                href="/entretien-reparation"
                variant="outline"
                className="mobile:w-full mobile:justify-between"
              >
                Entretien ou réparation
              </Button>
            </div>
          </div>
          <figure className="relative m-0 h-[316px] overflow-hidden rounded-panel mobile:h-[150px] mobile:rounded-lg">
            <Image
              src="/images/jardin-430v.png"
              alt="Husqvarna Automower 430V NERA dans un jardin arboré, mise en scène générée"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 620px"
              className="object-cover mobile:object-[center_52%]"
            />
            <figcaption className="absolute bottom-[17px] left-5 rounded-[3px] bg-ivory/90 px-3 py-[5px] text-xs tracking-[0.045em] text-forest mobile:bottom-[11px] mobile:left-3">
              Automower® 430V NERA · mise en scène.
            </figcaption>
          </figure>
        </section>

        {featured.length > 0 ? (
          <section
            aria-labelledby="featured-title"
            className="pt-[34px] pb-[45px] mobile:py-[25px]"
          >
            <div className="mb-6 flex items-end justify-between gap-[25px] mobile:mb-[17px] mobile:items-center mobile:gap-3">
              <h2
                id="featured-title"
                className="text-[29px] mobile:text-[23px]"
              >
                Un robot pour votre jardin.
              </h2>
              <TextLink href="/robots" className="mobile:whitespace-nowrap">
                Toute la gamme
              </TextLink>
            </div>
            <ul className="m-0 grid list-none grid-cols-4 gap-4 p-0 mobile:grid-cols-2 mobile:gap-2.5">
              {featured.map((robot, index) => (
                <RobotCard
                  key={robot.id}
                  robot={robot}
                  featured
                  priority={index < 2}
                />
              ))}
            </ul>
          </section>
        ) : null}

        <TrustStrip />
      </div>

      <section
        aria-labelledby="atelier-title"
        className="mt-8 bg-forest py-[68px] text-ivory mobile:mt-3 mobile:py-[38px]"
      >
        <div className="wrap grid grid-cols-2 items-center gap-[70px] mobile:grid-cols-1 mobile:gap-[29px]">
          <div>
            <Eyebrow dark>L’achat n’est que le début</Eyebrow>
            <h2
              id="atelier-title"
              className="mb-[22px] max-w-[500px] text-[38px] mobile:mb-[17px] mobile:text-[32px]"
            >
              Du premier conseil
              <br />
              au prochain printemps.
            </h2>
            <p className="m-0 max-w-[480px] text-[15px] text-on-dark-muted">
              Forestar vend les robots Husqvarna et prend soin des robots de
              toutes marques. Installation, entretien ou panne : votre
              interlocuteur reste ici, à Braine-le-Comte.
            </p>
            <Button
              href="/entretien-reparation"
              variant="light"
              className="mt-[27px]"
            >
              Découvrir l’atelier
            </Button>
          </div>
          {workshop.length > 0 ? (
            <ul className="m-0 list-none border-t border-on-dark-line p-0">
              {workshop.map((offer) => (
                <li key={offer.id}>
                  <Link
                    href="/entretien-reparation"
                    className="flex items-center justify-between gap-5 border-b border-on-dark-line py-[23px] mobile:py-[18px]"
                  >
                    <div>
                      <h3 className="mb-1 text-lg tracking-[-0.025em] mobile:text-base">
                        {offer.label}
                      </h3>
                      {offer.description ? (
                        <p className="m-0 text-sm text-on-dark-muted">
                          {offer.description}
                        </p>
                      ) : null}
                    </div>
                    {offer.price !== null ? (
                      <strong className="text-[23px] whitespace-nowrap mobile:text-[22px]">
                        {formatEuro(offer.price)}
                      </strong>
                    ) : (
                      <span className="flex items-center gap-2 text-sm whitespace-nowrap text-on-dark-muted">
                        Sur devis
                        <Glyph name="arrow" />
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <div className="wrap">
        <ContactBand anchor map />
      </div>
    </>
  );
}
