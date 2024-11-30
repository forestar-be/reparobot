// app/layout.tsx

import './globals.css';
import { Metadata } from 'next';
import PageLayout from '../layout/PageLayout'; // Adjust the path if necessary
import React from 'react';

// Define your metadata using Next.js Metadata API
export const metadata: Metadata = {
  metadataBase: new URL('https://reparobot.be'),
  title: {
    template: '%s | Entretien Robot Husqvarna & Gardena',
    default: 'Entretien et Réparation Robot Tondeuse Husqvarna & Gardena',
  },
  description: 'Expert en entretien et réparation de robots tondeuses Husqvarna et Gardena. Services professionnels, maintenance et installation.',
  keywords: ['robot tondeuse', 'Husqvarna', 'Gardena', 'entretien', 'réparation', 'maintenance', 'installation'],
  authors: [{ name: 'Forestar' }],
  generator: 'Next.js',
  openGraph: {
    title: 'Entretien et Réparation Robot Tondeuse Husqvarna & Gardena',
    description: 'Expert en entretien et réparation de robots tondeuses Husqvarna et Gardena. Services professionnels, maintenance et installation.',
    url: 'https://reparobot.be',
    siteName: 'Entretien Robot Husqvarna & Gardena',
    locale: 'fr_BE',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://reparobot.be',
  },
};

// Structured Data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Entretien Robot Husqvarna & Gardena',
  image: 'https://reparobot.be/images/logo/logo-70x70.png',
  '@id': 'https://reparobot.be',
  url: 'https://reparobot.be',
  telephone: '+3267830706',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '160 Chaussée d\'ecaussinnes',
    addressLocality: 'Braine le comte',
    postalCode: '7090',
    addressCountry: 'BE'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 50.6082, // Replace with actual coordinates
    longitude: 4.1284  // Replace with actual coordinates
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday'
    ],
    opens: '09:00',
    closes: '18:00'
  },
  priceRange: '€€',
  vatID: 'BE0806-685-256'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <PageLayout>
          {children}
        </PageLayout>
      </body>
    </html>
  );
}
