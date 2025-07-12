'use client';

import AboutExpertise from '../components/AboutExpertise';
import Contact from '../components/Contact';
import Hero from '../components/Hero';
import Services from '../components/Services';
import React, { Suspense, useRef } from 'react';

// Données structurées pour la page d'accueil
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://reparobot.be',
  name: 'Entretien, Achat et Réparation Robot Tondeuse Husqvarna & Gardena en Belgique',
  description:
    'Spécialiste robot tondeuse Husqvarna & Gardena en Belgique. Entretien, achat, réparation et installation par des experts certifiés.',
  url: 'https://reparobot.be',
  mainEntity: {
    '@type': 'Organization',
    '@id': 'https://reparobot.be',
    name: 'Forestar - Reparobot',
    alternateName: 'Reparobot',
    description:
      'Spécialiste en entretien, achat et réparation de robots tondeuses Husqvarna et Gardena en Belgique',
    url: 'https://reparobot.be',
    logo: 'https://reparobot.be/images/logo/logo-70x70.png',
    image:
      'https://reparobot.be/images/robot-tondeuse-husqvarna-gardena-belgique.jpg',
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
      '@id': 'https://reparobot.be/#services',
      name: 'Services Robot Tondeuse',
      description:
        'Entretien, réparation et installation de robots tondeuses Husqvarna et Gardena',
      url: 'https://reparobot.be/#services',
    },
    {
      '@type': 'WebPageElement',
      '@id': 'https://reparobot.be/#about',
      name: 'À propos',
      description:
        'Notre expertise en robots tondeuses et notre engagement qualité',
      url: 'https://reparobot.be/#about',
    },
    {
      '@type': 'WebPageElement',
      '@id': 'https://reparobot.be/#contact',
      name: 'Contact',
      description: 'Contactez nos experts robot tondeuse en Belgique',
      url: 'https://reparobot.be/#contact',
    },
  ],
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://reparobot.be',
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
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-white">
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
