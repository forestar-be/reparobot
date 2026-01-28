import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Devis Immédiat Robot Tondeuse - Achat & Installation | Reparobot',
  description:
    "Obtenez votre devis personnalisé pour l'achat d'un robot tondeuse Husqvarna avec installation facultative. Signature électronique immédiate. Devis gratuit et sans engagement.",
  keywords: [
    'devis robot tondeuse',
    'achat robot tondeuse',
    'robot tondeuse Husqvarna',
    'installation robot tondeuse',
    'devis immédiat',
    'signature électronique',
    'robot tondeuse prix',
    'tondeuse automatique',
    'jardin automatisé',
    'devis en ligne',
  ],
  authors: [{ name: 'Reparobot' }],
  creator: 'Reparobot',
  publisher: 'Reparobot',
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
    locale: 'fr_FR',
    url: 'https://reparobot.be/devis',
    title: 'Devis Immédiat Robot Tondeuse - Achat & Installation | Forestar',
    description:
      "Obtenez votre devis personnalisé pour l'achat d'un robot tondeuse avec installation. Signature électronique immédiate.",
    siteName: 'Entretien & Vente Robot Husqvarna Belgique | Forestar',
    images: [
      {
        url: '/images/devis-robot-tondeuse-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Devis immédiat pour robot tondeuse',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Devis Immédiat Robot Tondeuse - Reparobot',
    description:
      "Devis personnalisé pour l'achat d'un robot tondeuse avec installation. Signature électronique immédiate.",
    images: ['/images/devis-robot-tondeuse-twitter.jpg'],
  },
  alternates: {
    canonical: 'https://reparobot.be/devis',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'jardinage',
};

export default function DevisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
