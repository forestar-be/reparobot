/**
 * JSON-LD `LocalBusiness` de l'accueil, construit depuis `site-info` : l'affichage
 * (bande locale, contact, pied de page) et les données structurées lisent la même
 * source (R008 AC-04). Aucune note n'est publiée en `aggregateRating` : le nombre
 * d'avis n'est pas connu, et une note sans effectif n'est pas un balisage valide.
 */
import { SITE_URL, siteUrl } from './site';
import { parseAddress, parseOpeningHours, type SiteInfo } from './site-info';

export function buildLocalBusiness(info: SiteInfo) {
  const address = parseAddress(info.address);
  const hours = parseOpeningHours(info.hours);
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#business`,
    name: 'reparobot par Forestar',
    alternateName: ['Reparobot', 'Forestar'],
    description:
      'Revendeur agréé Husqvarna à Braine-le-Comte : robots tondeuses Automower®, installation, entretien et réparation de robots de toutes marques.',
    url: siteUrl('/'),
    image: siteUrl('/images/jardin-430v.png'),
    logo: siteUrl('/images/logo/logo-70x70.png'),
    telephone: info.phone,
    email: 'info@forestar.be',
    priceRange: '€€',
    vatID: 'BE0806685256',
    address: {
      '@type': 'PostalAddress',
      ...address,
      addressCountry: 'BE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: info.latitude,
      longitude: info.longitude,
    },
    ...(hours.length > 0 ? { openingHoursSpecification: hours } : {}),
    areaServed: { '@type': 'Country', name: 'Belgique' },
    brand: { '@type': 'Brand', name: 'Husqvarna' },
  };
}
