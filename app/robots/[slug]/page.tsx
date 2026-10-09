import Badge from '../../../components/ui/Badge';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import Button, { TextLink } from '../../../components/ui/Button';
import Eyebrow from '../../../components/ui/Eyebrow';
import Glyph from '../../../components/ui/Glyph';
import Price, { InstallationPrice } from '../../../components/ui/Price';
import RobotImage from '../../../components/ui/RobotImage';
import TrustStrip from '../../../components/ui/TrustStrip';
import {
  metaDescription,
  robotShortName,
  splitDescription,
  typeLabel,
  typeOfRobot,
} from '../../../lib/catalogue';
import { formatEuro, formatNumber, formatSurface } from '../../../lib/format';
import {
  INSTALLATION_TITLE,
  installationItemsFor,
} from '../../../lib/installation-content';
import { getInstallationPrices } from '../../../lib/installation-prices';
import { OG_IMAGE } from '../../../lib/og-image';
import {
  getRobotBySlug,
  getRobotsCatalog,
  isFallbackCatalog,
} from '../../../lib/robots';
import { baseOffer, getServiceOffers } from '../../../lib/service-offers';
import { siteUrl } from '../../../lib/site';
import { getSiteInfo, shortHours, telHref } from '../../../lib/site-info';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

/** Une fiche par robot du catalogue, générée au build puis revalidée (tag `robots-catalog`). */
export async function generateStaticParams() {
  const catalog = await getRobotsCatalog();
  if (isFallbackCatalog(catalog)) return [];
  return catalog.robots.map((robot) => ({ slug: robot.slug }));
}

type Params = Promise<{ slug: string }>;

/** Absolue seulement : l'image neutre locale n'est pas une photo de produit. */
function absoluteImage(src: string | null | undefined): string | null {
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src;
  return null;
}

/**
 * Retrouve le robot ; un slug inconnu est un 404, mais une panne de l'API (catalogue de
 * repli) est une erreur : elle ne doit pas être mise en cache comme un 404.
 */
async function loadRobot(slug: string) {
  const robot = await getRobotBySlug(slug);
  if (robot) return robot;
  const catalog = await getRobotsCatalog();
  if (isFallbackCatalog(catalog)) {
    throw new Error('Catalogue indisponible : fiche non générée');
  }
  return notFound();
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const robot = await loadRobot(slug);
  const { lead } = splitDescription(robot.description);
  const description = metaDescription(
    lead || `${robot.name}, robot tondeuse Husqvarna`,
    `${formatEuro(robot.price)} TVAC, robot seul. Installation en option, devis gratuit par email.`,
  );
  const image = absoluteImage(robot.image);
  const url = siteUrl(`/robots/${robot.slug}`);
  return {
    title: robot.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'fr_BE',
      url,
      title: robot.name,
      description,
      images: image ? [{ url: image, alt: robot.name }] : [OG_IMAGE],
    },
  };
}

export default async function RobotPage({ params }: { params: Params }) {
  const { slug } = await params;
  const robot = await loadRobot(slug);
  const [info, installation, offers] = await Promise.all([
    getSiteInfo(),
    getInstallationPrices(robot.inventoryId),
    getServiceOffers(),
  ]);

  const shortName = robotShortName(robot.name);
  const type = typeOfRobot(robot);
  const wired = type === 'filaire';
  const { lead, body } = splitDescription(robot.description);
  const placement = installation?.placement ?? robot.installationPrice;

  // Entretien annuel : forfait BASE de /service-offers (D-23 : plus de `maintenance`
  // du catalogue). Sans forfait lisible, la carte garde le lien et omet le prix.
  const maintenance = baseOffer(offers, 'MAINTENANCE');
  const maintenancePrice = maintenance?.price ?? null;
  const maintenanceText = maintenance?.description ?? null;

  const image = absoluteImage(robot.image);
  const url = siteUrl(`/robots/${robot.slug}`);
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${url}#product`,
      name: robot.name,
      description: [lead, body].filter(Boolean).join(' ').replace(/\s+/g, ' '),
      url,
      brand: { '@type': 'Brand', name: 'Husqvarna' },
      category: 'Robot tondeuse',
      ...(robot.reference
        ? { sku: robot.reference, mpn: robot.reference.split('_')[0] }
        : {}),
      ...(image ? { image: [image] } : {}),
      offers: {
        '@type': 'Offer',
        url,
        price: robot.price,
        priceCurrency: 'EUR',
        itemCondition: 'https://schema.org/NewCondition',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: robot.price,
          priceCurrency: 'EUR',
          valueAddedTaxIncluded: true,
        },
        seller: {
          '@type': 'Organization',
          name: 'Forestar',
          url: siteUrl('/'),
        },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Accueil',
          item: siteUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Robots Husqvarna',
          item: siteUrl('/robots'),
        },
        { '@type': 'ListItem', position: 3, name: shortName, item: url },
      ],
    },
  ];

  const items = installationItemsFor(wired);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Breadcrumb
        items={[
          { label: 'Robots Husqvarna', href: '/robots' },
          { label: shortName },
        ]}
      />
      <div className="wrap">
        <section className="grid grid-cols-[1.12fr_1fr] items-start gap-[65px] pt-3 pb-[42px] tablet:gap-[35px] mobile:grid-cols-1 mobile:gap-[25px] mobile:pt-2.5 mobile:pb-[30px]">
          <div>
            <div className="relative h-[466px] rounded-panel border border-line bg-[#edf0e6] p-7 mobile:h-[297px] mobile:rounded-[9px] mobile:p-[22px]">
              <Badge className="absolute top-[19px] left-[19px] z-10">
                {typeLabel(type)}
              </Badge>
              <div className="relative h-full w-full">
                <RobotImage
                  src={robot.image}
                  name={robot.name}
                  priority
                  sizes="(max-width: 760px) 100vw, 600px"
                />
              </div>
            </div>
            <div className="mt-[13px] flex justify-between gap-3.5 text-sm text-muted">
              <span>{image ? 'Visuel Husqvarna' : 'Photo à venir'}</span>
              {robot.reference ? (
                <span>Réf. {robot.reference.split('_')[0]}</span>
              ) : null}
            </div>
            <dl className="m-0 mt-7 grid grid-cols-3 border-y border-line mobile:mt-5">
              <Spec
                value={formatSurface(robot.maxSurface)}
                label="Surface maximale"
              />
              <Spec
                value={typeLabel(type)}
                label={wired ? 'Câble périphérique' : 'Limites virtuelles'}
                divided
              />
              <Spec
                value={`${formatNumber(robot.maxSlope)} %`}
                label="Pente maximale"
                divided
              />
            </dl>
          </div>

          <div>
            <Eyebrow className="!mb-2.5">Husqvarna Automower®</Eyebrow>
            <h1 className="mb-[19px] text-[41px] tablet:text-[36px] mobile:mb-4 mobile:text-[33px]">
              {robot.name}
            </h1>
            {lead ? (
              <p className="mb-[23px] text-[15px] text-muted mobile:mb-[18px]">
                {lead}
              </p>
            ) : null}

            <div className="mb-[22px] border-t border-line pt-[18px] mobile:mb-[19px] mobile:pt-4">
              <Price amount={robot.price} size="big" />
              <InstallationPrice
                amount={placement}
                className="mt-1 text-sm text-forest"
              />
              {robot.promotion ? (
                <Badge tone="promo" className="mt-3 !text-xs">
                  {robot.promotion}
                </Badge>
              ) : null}
            </div>

            <div className="mb-4">
              <Button href={`/devis?robot=${robot.slug}`} full>
                Recevoir mon devis
              </Button>
              <span className="mt-[7px] block text-center text-sm text-muted">
                gratuit, par email, à signer en ligne
              </span>
            </div>
            <div className="mb-4">
              <Button
                href={`/etre-recontacte?robot=${robot.slug}`}
                variant="outline"
                full
              >
                Être recontacté
              </Button>
              <span className="mt-[7px] block text-center text-sm text-muted">
                un conseil, une question ? nous vous recontactons
              </span>
            </div>

            <div className="mt-[22px] flex items-center gap-[13px] border-t border-line py-4 mobile:mt-[19px]">
              <Glyph name="phone" />
              <div>
                <a
                  href={telHref(info)}
                  className="text-base font-bold text-forest"
                >
                  {info.phoneDisplay}
                </a>
                <small className="block text-sm text-muted">
                  {shortHours(info.hours)}
                </small>
              </div>
            </div>
          </div>
        </section>

        {body ? (
          <section
            aria-labelledby="description-title"
            className="border-t border-line py-[42px] mobile:py-[30px]"
          >
            <h2
              id="description-title"
              className="mb-[21px] text-[28px] mobile:text-[27px]"
            >
              À propos de ce robot
            </h2>
            <div className="max-w-[760px] space-y-3 text-[15px] text-muted">
              {body.split('\n').map((paragraph) => (
                <p key={paragraph} className="m-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid grid-cols-[1.5fr_1fr] gap-[60px] border-t border-line pt-[42px] pb-14 tablet:gap-10 mobile:grid-cols-1 mobile:gap-[29px] mobile:py-[30px]">
          <div>
            <Eyebrow>L’installation</Eyebrow>
            <h2 className="mb-[21px] text-[28px] mobile:text-[27px]">
              {INSTALLATION_TITLE}
            </h2>
            <p className="m-0 text-sm text-muted">
              Installation facultative : {formatEuro(placement)}, placement
              compris. Le montant du devis est affiché TVAC.
            </p>
            <ol className="m-0 mt-4 list-none p-0">
              {items.map((item, index) => {
                const price =
                  item.priced === 'cable' && installation
                    ? `${formatEuro(installation.wirePerMeter)} / m`
                    : item.priced === 'antenna' && installation
                      ? formatEuro(installation.antennaSupport)
                      : null;
                return (
                  <li
                    key={item.key}
                    className="flex gap-[17px] border-b border-line py-[15px]"
                  >
                    <span
                      aria-hidden="true"
                      className="pt-0.5 text-sm text-muted"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <h3 className="mb-[5px] text-[15px] leading-[1.4] font-bold tracking-normal">
                        {item.title}
                      </h3>
                      <p className="m-0 text-sm text-muted">{item.text}</p>
                    </div>
                    {price ? (
                      <strong className="text-sm whitespace-nowrap text-forest">
                        {price}
                      </strong>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>

          <aside className="self-start rounded-card bg-sage p-[29px] mobile:p-[25px]">
            <Eyebrow>Après l’installation</Eyebrow>
            <h2 className="mb-[15px] text-2xl">
              Un atelier pour
              <br />
              la suite de l’histoire.
            </h2>
            {maintenanceText ? (
              <p className="mb-5 text-sm text-muted">{maintenanceText}</p>
            ) : null}
            {maintenance ? (
              <div className="my-[18px] text-[32px] leading-[1.2] font-bold">
                {maintenancePrice !== null ? (
                  <>
                    {formatEuro(maintenancePrice)}{' '}
                    <small className="text-sm font-normal text-muted">
                      TVAC / entretien annuel
                    </small>
                  </>
                ) : (
                  <small className="text-sm font-normal text-muted">
                    Entretien annuel : sur devis
                  </small>
                )}
              </div>
            ) : null}
            <TextLink href="/entretien-reparation" className="mt-2.5">
              Entretien &amp; réparation
            </TextLink>
          </aside>
        </section>

        <TrustStrip />
      </div>
    </>
  );
}

function Spec({
  value,
  label,
  divided = false,
}: {
  value: string;
  label: string;
  divided?: boolean;
}) {
  return (
    <div
      className={`flex flex-col-reverse py-[18px] pr-2 mobile:py-3.5 mobile:pr-1.5 ${
        divided ? 'border-l border-line pl-[17px] mobile:pl-3' : ''
      }`}
    >
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="m-0 text-[15px] font-bold text-forest">{value}</dd>
    </div>
  );
}
