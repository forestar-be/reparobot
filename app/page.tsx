'use client';

import AboutExpertise from '../components/AboutExpertise';
import Contact from '../components/Contact';
import Hero from '../components/Hero';
import Services from '../components/Services';
import { SITE_URL } from '../lib/site';
import React, { Suspense, useRef, type JSX } from 'react';

// Données structurées pour la page d'accueil
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': SITE_URL,
  name: 'Entretien, Achat et Réparation Robot Tondeuse Husqvarna en Belgique',
  description:
    'Spécialiste robot tondeuse Husqvarna en Belgique. Entretien, achat, réparation et installation par des experts certifiés.',
  url: SITE_URL,
  mainEntity: {
    '@type': 'Organization',
    '@id': SITE_URL,
    name: 'Forestar - Reparobot',
    alternateName: 'Reparobot',
    description:
      'Spécialiste en entretien, achat et réparation de robots tondeuses Husqvarna en Belgique',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo/logo-70x70.png`,
    image: `${SITE_URL}/images/robot-tondeuse-husqvarna-belgique.jpg`,
    telephone: '+3267830706',
    email: 'info@forestar.be',
    address: {
      '@type': 'PostalAddress',
      streetAddress: "160 Chaussée d'ecaussinnes",
      addressLocality: 'Braine le comte',
      postalCode: '7090',
      addressCountry: 'BE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 50.6082,
      longitude: 4.1284,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Belgique',
    },
    serviceArea: {
      '@type': 'Country',
      name: 'Belgique',
    },
  },
  hasPart: [
    {
      '@type': 'WebPageElement',
      '@id': `${SITE_URL}/#services`,
      name: 'Services Robot Tondeuse',
      description:
        'Entretien, réparation et installation de robots tondeuses Husqvarna',
      url: `${SITE_URL}/#services`,
    },
    {
      '@type': 'WebPageElement',
      '@id': `${SITE_URL}/#about`,
      name: 'À propos',
      description:
        'Notre expertise en robots tondeuses et notre engagement qualité',
      url: `${SITE_URL}/#about`,
    },
    {
      '@type': 'WebPageElement',
      '@id': `${SITE_URL}/#contact`,
      name: 'Contact',
      description: 'Contactez nos experts robot tondeuse en Belgique',
      url: `${SITE_URL}/#contact`,
    },
  ],
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: SITE_URL,
      },
    ],
  },
};

const Home = (): JSX.Element => {
  const servicesRef = useRef<HTMLElement>(null);
  const entretienServiceRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main id="home" className="overflow-hidden">
        {/* Hero Section */}
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center bg-linear-to-br from-primary-50 to-white">
              <div className="animate-pulse text-primary-500">
                Chargement...
              </div>
            </div>
          }
        >
          <Hero
            servicesRef={servicesRef}
            entretienServiceRef={entretienServiceRef}
          />
        </Suspense>

        {/* Services Section */}
        <Services ref={servicesRef} entretienServiceRef={entretienServiceRef} />

        {/* About & Expertise Section */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-16">
              <div className="animate-pulse text-primary-500">
                Chargement du contenu...
              </div>
            </div>
          }
        >
          <AboutExpertise />
        </Suspense>

        {/* Contact Section */}
        <Contact />
      </main>
    </>
  );
};

export default Home;
