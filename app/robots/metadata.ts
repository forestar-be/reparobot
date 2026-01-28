import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Réservation Robot Tondeuse Husqvarna - Achat en Belgique',
  description:
    'Découvrez et réservez votre robot tondeuse Husqvarna. Large gamme de robots automatiques avec installation professionnelle en Belgique.',
  keywords: [
    'réservation robot tondeuse',
    'achat robot tondeuse Belgique',
    'robot tondeuse Husqvarna prix',

    'robot tondeuse automatique',
    'tondeuse robotisée Belgique',
    'robot tondeuse sans fil',
    'installation robot tondeuse',
    'commande robot tondeuse',
    'vente robot tondeuse Belgique',
  ],
  authors: [{ name: 'Forestar - Reparobot' }],
  creator: 'Forestar',
  publisher: 'Forestar',
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
  openGraph: {
    type: 'website',
    locale: 'fr_BE',
    url: 'https://reparobot.be/robots',
    title: 'Réservation Robot Tondeuse Husqvarna en Belgique',
    description:
      'Large gamme de robots tondeuses Husqvarna disponibles. Réservez votre robot avec installation professionnelle.',
    siteName: 'Robot Husqvarna Belgique | Forestar',
    images: [
      {
        url: '/images/robots-tondeuse-husqvarna.jpg',
        width: 1200,
        height: 630,
        alt: 'Gamme robots tondeuses Husqvarna disponibles en Belgique',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Robots Tondeuses Husqvarna - Belgique',
    description:
      'Découvrez notre gamme complète de robots tondeuses avec installation professionnelle.',
    images: ['/images/robots-tondeuse-twitter.jpg'],
  },
  alternates: {
    canonical: 'https://reparobot.be/robots',
  },
  category: 'commerce',
};
