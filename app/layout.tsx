import PageLayout from '../layout/PageLayout';
import React from 'react';
import { Metadata } from 'next';
import './globals.css';

// Define your metadata using Next.js Metadata API
export const metadata: Metadata = {
  metadataBase: new URL('https://reparobot.be'),
  title: {
    template: '%s | Robot Husqvarna & Gardena Belgique | Forestar',
    default:
      'Entretien, Achat et Réparation Robot Tondeuse Husqvarna & Gardena en Belgique | Forestar',
  },
  description:
    'Spécialiste robot tondeuse Husqvarna & Gardena en Belgique. Entretien, achat, réparation et installation par des experts certifiés. Service professionnel garanti.',
  icons: {
    icon: '/images/logo/favicon.ico',
    shortcut: '/images/logo/favicon.ico',
    apple: '/images/logo/logo-70x70.png',
  },
  keywords: [
    'robot tondeuse Belgique',
    'Husqvarna Belgique',
    'Gardena Belgique',
    'entretien robot tondeuse',
    'réparation robot tondeuse',
    'achat robot tondeuse',
    'installation robot tondeuse',
    'maintenance robot tondeuse',
    'service robot tondeuse Belgique',
    'robot tondeuse automatique',
    'tondeuse robotisée',
    'expert robot tondeuse',
  ],
  authors: [{ name: 'Forestar - Reparobot' }],
  creator: 'Forestar',
  publisher: 'Forestar',
  generator: 'Next.js',
  openGraph: {
    title:
      'Entretien, Achat et Réparation Robot Tondeuse Husqvarna & Gardena en Belgique',
    description:
      'Spécialiste robot tondeuse Husqvarna & Gardena en Belgique. Entretien, achat, réparation et installation par des experts certifiés.',
    url: 'https://reparobot.be',
    siteName: 'Robot Husqvarna & Gardena Belgique | Forestar',
    locale: 'fr_BE',
    type: 'website',
    images: [
      {
        url: '/images/robot-tondeuse-husqvarna-gardena-belgique.jpg',
        width: 1200,
        height: 630,
        alt: 'Robot tondeuse Husqvarna et Gardena - Entretien et réparation en Belgique',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Robot Tondeuse Husqvarna & Gardena Belgique',
    description:
      'Entretien, achat et réparation de robots tondeuses par des experts certifiés en Belgique.',
    images: ['/images/robot-tondeuse-twitter.jpg'],
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
  category: 'jardinage',
};

// Structured Data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://reparobot.be',
  name: 'Forestar - Entretien Robot Husqvarna & Gardena',
  alternateName: 'Reparobot',
  description:
    'Spécialiste en entretien, achat et réparation de robots tondeuses Husqvarna et Gardena en Belgique',
  image: 'https://reparobot.be/images/logo/logo-70x70.png',
  logo: 'https://reparobot.be/images/logo/logo-70x70.png',
  url: 'https://reparobot.be',
  telephone: '+3267830706',
  email: 'info@forestar.be',
  priceRange: '€€',
  vatID: 'BE0806-685-256',
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
  serviceArea: {
    '@type': 'Country',
    name: 'Belgique',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services Robot Tondeuse',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Entretien Robot Tondeuse',
          description:
            "Service professionnel d'entretien de robots tondeuses Husqvarna et Gardena",
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Réparation Robot Tondeuse',
          description:
            'Réparation professionnelle de robots tondeuses toutes marques',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Achat Robot Tondeuse',
          description:
            'Vente de robots tondeuses Husqvarna et Gardena avec installation',
          brand: ['Husqvarna', 'Gardena'],
        },
      },
    ],
  },
  areaServed: 'Belgique',
  knowsAbout: [
    'Robot Tondeuse',
    'Husqvarna',
    'Gardena',
    'Entretien',
    'Réparation',
    'Installation',
  ],
  slogan: 'Votre spécialiste robot tondeuse en Belgique',
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
        <PageLayout>{children}</PageLayout>
      </body>
    </html>
  );
}
