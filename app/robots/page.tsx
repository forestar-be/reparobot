import RobotSelection from '../../components/RobotSelection';
import React from 'react';
export { metadata } from './metadata';

// Données structurées pour la page robots
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://reparobot.be/robots',
  name: 'Réservation Robot Tondeuse Husqvarna & Gardena',
  description: 'Découvrez et réservez votre robot tondeuse Husqvarna ou Gardena avec installation professionnelle en Belgique',
  url: 'https://reparobot.be/robots',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Robots Tondeuses Disponibles',
    description: 'Gamme complète de robots tondeuses Husqvarna et Gardena',
    numberOfItems: 14,
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
      {
        '@type': 'Product',
        name: 'Robot Tondeuse Gardena',
        brand: 'Gardena',
        category: 'Robot Tondeuse',
        description: 'Robot tondeuse automatique intelligent',
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

export default function RobotsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <RobotSelection />
    </>
  );
}
