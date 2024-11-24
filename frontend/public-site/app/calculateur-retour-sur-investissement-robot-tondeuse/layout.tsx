// app/calculateur-economie-robot-tondeuse/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Calculateur Retour sur Investissement Robot Tondeuse | Reparobot',
  description: 'Calculez vos économies en comparant les coûts d\'entretien traditionnel de pelouse avec un robot tondeuse. Estimez votre ROI sur plusieurs années, incluant essence, maintenance et services.',
  keywords: [
    'calculateur ROI robot tondeuse',
    'comparaison coûts tonte',
    'économies entretien pelouse',
    'coût robot tondeuse',
    'maintenance pelouse',
    'coût essence tondeuse',
    'service jardinage',
    'retour sur investissement jardinage',
    'comparatif tonte automatique',
    'calcul économies jardinage'
  ],
  openGraph: {
    title: 'Calculateur Retour sur Investissement Robot Tondeuse | Reparobot',
    description: 'Comparez les coûts d\'entretien traditionnel (essence, maintenance, service) avec un robot tondeuse. Calculez vos économies potentielles sur plusieurs années.',
    type: 'website',
    locale: 'fr_BE',
    url: 'https://reparobot.be/calculateur-retour-sur-investissement-robot-tondeuse',
    siteName: 'Reparobot',
    images: [
      {
        url: 'https://reparobot.be/images/calculateur-retour-sur-investissement-robot-tondeuse.jpg',
        width: 1200,
        height: 630,
        alt: 'Calculateur Retour sur Investissement Robot Tondeuse'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculateur Retour sur Investissement Robot Tondeuse | Reparobot',
    description: 'Comparez les coûts d\'entretien traditionnel avec un robot tondeuse. Calculez vos économies sur plusieurs années incluant essence, maintenance et services.',
    images: ['https://reparobot.be/images/calculateur-retour-sur-investissement-robot-tondeuse.jpg'],
  },
  alternates: {
    canonical: 'https://reparobot.be/calculateur-retour-sur-investissement-robot-tondeuse'
  },
};

// Structured data optimized for the ROI Calculator
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Calculateur Retour sur Investissement Robot Tondeuse',
  applicationCategory: 'FinanceApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR'
  },
  description: 'Calculez votre retour sur investissement en comparant les coûts d\'entretien traditionnel de pelouse (essence, maintenance, service) avec un robot tondeuse',
  operatingSystem: 'Web',
  featureList: [
    'Calcul des coûts d\'essence',
    'Estimation maintenance tondeuse',
    'Comparaison services jardinage',
    'Analyse sur plusieurs années',
    'Calcul économies potentielles'
  ],
  creator: {
    '@type': 'Organization',
    name: 'Reparobot',
    url: 'https://reparobot.be'
  }
};

export default function ROICalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}