import CatalogueFilters from '../../components/robots/CatalogueFilters';
import RobotCard from '../../components/robots/RobotCard';
import ContactBand from '../../components/site/ContactBand';
import Breadcrumb from '../../components/ui/Breadcrumb';
import DealerBadge from '../../components/ui/DealerBadge';
import Eyebrow from '../../components/ui/Eyebrow';
import {
  catalogueHref,
  countLabel,
  filterRobots,
  parseCatalogueFilters,
} from '../../lib/catalogue';
import { getRobotsCatalog } from '../../lib/robots';
import { siteUrl } from '../../lib/site';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Robots tondeuses Husqvarna Automower® à Braine-le-Comte',
  description:
    'Toute la gamme de robots tondeuses Husqvarna Automower® : filaires et sans fil, de 400 à 12 000 m². Prix TVAC, installation chiffrée à part, devis gratuit à signer en ligne.',
  alternates: { canonical: siteUrl('/robots') },
  openGraph: {
    type: 'website',
    locale: 'fr_BE',
    url: siteUrl('/robots'),
    title: 'Robots tondeuses Husqvarna Automower®',
    description:
      'Choisissez votre robot Husqvarna : filaire ou sans fil, selon la surface de votre jardin.',
  },
};

type SearchParams = Promise<{
  type?: string | string[];
  surface?: string | string[];
}>;

export default async function RobotsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = parseCatalogueFilters(await searchParams);
  const catalog = await getRobotsCatalog();
  const robots = filterRobots(catalog.robots, filters);
  const filtered = Boolean(filters.type || filters.surface);

  const structuredData = [
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
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Robots tondeuses Husqvarna Automower®',
      numberOfItems: catalog.robots.length,
      itemListElement: catalog.robots.map((robot, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: robot.name,
        url: siteUrl(`/robots/${robot.slug}`),
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Breadcrumb items={[{ label: 'Robots Husqvarna' }]} />
      <div className="wrap">
        <section className="flex items-end justify-between gap-10 pt-[23px] pb-[34px] mobile:block mobile:pt-3.5 mobile:pb-[25px]">
          <div>
            <Eyebrow>La gamme Automower®</Eyebrow>
            <h1 className="max-w-[850px] text-[54px] tablet:text-[48px] mobile:text-[40px] mobile:leading-[1.07]">
              Robots tondeuses Husqvarna Automower®
            </h1>
            <p className="mt-4 max-w-[680px] text-sm text-muted mobile:mt-[15px] mobile:text-xs">
              Des petits espaces aux grandes pelouses, trouvez votre Husqvarna.
              <br />
              Les prix affichés sont TVAC, robot seul. L’installation est
              chiffrée à part.
            </p>
          </div>
          <DealerBadge className="mb-2 shrink-0 mobile:mt-5 mobile:mb-0" />
        </section>

        <section aria-label="Catalogue" className="pb-[58px] mobile:pb-8">
          <CatalogueFilters filters={filters} />
          <div className="mb-[23px] flex items-center justify-between gap-5 text-[11px] text-muted mobile:mb-[19px] mobile:gap-2.5 mobile:text-[10px]">
            <span role="status" aria-live="polite">
              {countLabel(robots.length, catalog.robots.length)}
            </span>
            <Link
              href={catalogueHref({ type: null, surface: null })}
              scroll={false}
              className="border-b border-current p-1 text-forest"
            >
              Réinitialiser les filtres
            </Link>
          </div>

          <h2 className="sr-only">Modèles disponibles</h2>
          {robots.length > 0 ? (
            <ul className="m-0 grid list-none grid-cols-3 gap-[22px] p-0 tablet:gap-[15px] mobile:grid-cols-1 mobile:gap-[19px]">
              {robots.map((robot, index) => (
                <RobotCard key={robot.id} robot={robot} priority={index < 3} />
              ))}
            </ul>
          ) : (
            <div className="rounded-card border border-dashed border-line p-[50px] text-center">
              <p className="m-0 text-ink">
                {filtered
                  ? 'Aucun robot ne couvre cette combinaison.'
                  : 'Le catalogue est momentanément indisponible.'}
              </p>
              {filtered ? (
                <Link
                  href="/robots"
                  className="mt-3 inline-block border-b border-current text-xs font-bold text-forest"
                >
                  Voir tous les robots
                </Link>
              ) : (
                <p className="mt-2 text-xs text-muted">
                  Appelez-nous ou revenez dans quelques minutes.
                </p>
              )}
            </div>
          )}

          {catalog.categories.length > 0 ? (
            <div
              className={`mt-[38px] grid gap-10 border-t border-line pt-[35px] mobile:mt-8 mobile:grid-cols-1 mobile:gap-[25px] mobile:pt-[29px] ${
                catalog.categories.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
              }`}
            >
              {catalog.categories.map((category, index) => (
                <article key={category.id}>
                  <span className="mb-[15px] block text-[11px] text-muted mobile:mb-[9px]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="mb-3 text-[21px]">{category.name}</h2>
                  <p className="m-0 text-xs text-muted">
                    {category.description}
                  </p>
                </article>
              ))}
            </div>
          ) : null}
        </section>
        <ContactBand />
      </div>
    </>
  );
}
