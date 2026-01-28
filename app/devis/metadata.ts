import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Devis Immédiat Robot Tondeuse Husqvarna - Achat & Installation Belgique',
  description:
    "Obtenez votre devis personnalisé pour l'achat d'un robot tondeuse Husqvarna avec installation professionnelle en Belgique. Signature électronique immédiate.",
  keywords: [
    'devis robot tondeuse Belgique',
    'achat robot tondeuse Husqvarna',

    'installation robot tondeuse Belgique',
    'devis immédiat robot tondeuse',
    'signature électronique',
    'robot tondeuse prix Belgique',
    'tondeuse automatique devis',
    'jardin automatisé Belgique',
    'devis en ligne robot tondeuse',
    'commande robot tondeuse',
    'vente robot tondeuse professionnel',
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
    url: 'https://reparobot.be/devis',
    title: 'Devis Immédiat Robot Tondeuse Husqvarna - Belgique',
    description:
      "Obtenez votre devis personnalisé pour l'achat d'un robot tondeuse avec installation professionnelle en Belgique.",
    siteName: 'Robot Husqvarna Belgique | Forestar',
    images: [
      {
        url: '/images/devis-robot-tondeuse-belgique.jpg',
        width: 1200,
        height: 630,
        alt: 'Devis immédiat pour robot tondeuse en Belgique',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Devis Immédiat Robot Tondeuse - Belgique',
    description:
      "Devis personnalisé pour l'achat d'un robot tondeuse avec installation professionnelle en Belgique.",
    images: ['/images/devis-robot-tondeuse-twitter.jpg'],
  },
  alternates: {
    canonical: 'https://reparobot.be/devis',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'service',
};
