/**
 * Données structurées des pages sans fiche produit : l'atelier (`Service`) et la page
 * de contact (`ContactPage`). Elles lisent les mêmes sources que l'affichage
 * (`/service-offers`, `site-info`) : aucun prix ni coordonnée en dur.
 */
import { buildLocalBusiness } from './local-business';
import type { ServiceOffer } from './service-offers';
import { SITE_URL, siteUrl } from './site';
import type { SiteInfo } from './site-info';

/** Sérialise pour une balise `<script>` : un `<` dans une valeur ne doit pas la refermer. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * Service d'entretien et de réparation (toutes marques). Seuls les forfaits au prix
 * connu sont publiés comme offres ; un forfait « sur devis » n'a pas de prix à déclarer.
 * Les montants du gérant sont TTC.
 */
export function buildWorkshopService(offers: ServiceOffer[]) {
  const priced = offers
    .filter(
      (o) =>
        (o.service === 'MAINTENANCE' || o.service === 'REPAIR') &&
        o.kind === 'BASE' &&
        o.price != null,
    )
    .sort((a, b) => a.order - b.order);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${siteUrl('/entretien-reparation')}#service`,
    name: 'Entretien et réparation de robot tondeuse, toutes marques',
    serviceType: 'Entretien et réparation de robots tondeuses',
    description:
      'Entretien annuel, hivernage et réparation de votre robot tondeuse, Husqvarna ou une autre marque, à l’atelier de Braine-le-Comte.',
    url: siteUrl('/entretien-reparation'),
    provider: { '@type': 'LocalBusiness', '@id': `${SITE_URL}/#business` },
    areaServed: { '@type': 'Country', name: 'Belgique' },
    ...(priced.length > 0
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Forfaits de l’atelier',
            itemListElement: priced.map((o) => ({
              '@type': 'Offer',
              name: o.label,
              ...(o.description ? { description: o.description } : {}),
              price: o.price,
              priceCurrency: 'EUR',
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: o.price,
                priceCurrency: 'EUR',
                valueAddedTaxIncluded: true,
              },
            })),
          },
        }
      : {}),
  };
}

/** Page de contact : l'établissement (adresse, téléphone, horaires) en entité principale. */
export function buildContactPage(info: SiteInfo) {
  const { '@context': _context, ...business } = buildLocalBusiness(info);
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${siteUrl('/contact')}#page`,
    name: 'Contact',
    url: siteUrl('/contact'),
    mainEntity: business,
  };
}
