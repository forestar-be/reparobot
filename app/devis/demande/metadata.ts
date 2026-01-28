import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Devis d'achat personnalisé | Forestar - Reparobot",
  description:
    "Demandez votre devis d'achat personnalisé pour un robot tondeuse Husqvarna avec installation professionnelle en Belgique.",
  keywords: [
    'devis robot tondeuse',
    'achat robot tondeuse Belgique',
    'prix robot tondeuse Husqvarna',
    'devis installation robot tondeuse',
    'commande robot tondeuse',
  ],
  authors: [{ name: 'Forestar - Reparobot' }],
  creator: 'Forestar',
  publisher: 'Forestar',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_BE',
    url: 'https://reparobot.be/devis/demande',
    title: "Devis d'achat Robot Tondeuse | Forestar",
    description:
      "Obtenez votre devis personnalisé pour l'achat d'un robot tondeuse Husqvarna avec installation professionnelle.",
    siteName: 'Robot Husqvarna Belgique | Forestar',
  },
  alternates: {
    canonical: 'https://reparobot.be/devis/demande',
  },
};
