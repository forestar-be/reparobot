import RobotSelection from '../../components/RobotSelection';
import { getRobotsCatalog, getRobotsCount } from '../../lib/robots';
import React from 'react';

export { metadata } from './metadata';

// Enable ISR with revalidation every hour
export const revalidate = 3600;

// Generate structured data dynamically based on actual robot count
async function generateStructuredData() {
  const robotsCount = await getRobotsCount();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://reparobot.be/robots',
    name: 'Réservation Robot Tondeuse Husqvarna',
    description:
      'Découvrez et réservez votre robot tondeuse Husqvarna avec installation professionnelle en Belgique',
    url: 'https://reparobot.be/robots',
    mainEntity: {
      '@type': 'ItemList',
      name: 'Robots Tondeuses Disponibles',
      description: 'Gamme complète de robots tondeuses Husqvarna',
      numberOfItems: robotsCount,
      itemListElement: [
        {
          '@type': 'Product',
          name: 'Robot Tondeuse Husqvarna',
          brand: 'Husqvarna',
          category: 'Robot Tondeuse',
          description: 'Robot tondeuse automatique pour entretien de pelouse',
          offers: {
            '@type': 'Offer',
            availability: 'https://schema.org/InStock',
            priceCurrency: 'EUR',
            seller: {
              '@type': 'Organization',
              name: 'Forestar',
            },
          },
        },
      ],
    },
    provider: {
      '@type': 'Organization',
      '@id': 'https://reparobot.be',
      name: 'Forestar',
      url: 'https://reparobot.be',
      logo: 'https://reparobot.be/images/logo/logo-70x70.png',
      address: {
        '@type': 'PostalAddress',
        streetAddress: "160 Chaussée d'ecaussinnes",
        addressLocality: 'Braine le comte',
        postalCode: '7090',
        addressCountry: 'BE',
      },
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Accueil',
          item: 'https://reparobot.be',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Robots Tondeuses',
          item: 'https://reparobot.be/robots',
        },
      ],
    },
  };
}

export default async function RobotsPage() {
  // Fetch catalog data server-side for SEO
  const catalog = await getRobotsCatalog();
  const structuredData = await generateStructuredData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <RobotSelection
        categories={catalog.categories}
        robots={catalog.robots}
        maintenance={catalog.maintenance}
      />
    </>
  );
}
