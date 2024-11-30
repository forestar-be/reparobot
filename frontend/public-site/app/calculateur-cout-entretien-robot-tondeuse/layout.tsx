// app/calculateur-cout-entretien-robot-tondeuse/layout.tsx
import { Metadata } from "next";
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Calculateur Coût Entretien Robot Tondeuse | Diagnostic & Estimation',
  description: 'Estimez instantanément les coûts d\'entretien de votre robot tondeuse. Quiz de diagnostic précis, tarifs transparents basés sur la taille du terrain, la fréquence d\'utilisation et le type de maintenance.',
  keywords: [
    'coût entretien robot tondeuse',
    'estimation maintenance robot',
    'diagnostic robot tondeuse',
    'prix entretien annuel',
    'coût réparation tondeuse',
    'maintenance préventive',
    'tarif entretien pelouse',
    'calculateur coût robot',
    'estimation frais tondeuse',
    'budget maintenance jardin'
  ],
  openGraph: {
    title: 'Calculateur Coût Entretien Robot Tondeuse | Diagnostic & Estimation',
    description: 'Estimation précise des coûts d\'entretien de votre robot tondeuse basée sur la taille de votre terrain, fréquence d\'utilisation et historique de maintenance.',
    type: 'website',
    locale: 'fr_BE',
    url: 'https://reparobot.be/calculateur-cout-entretien-robot-tondeuse',
    siteName: 'Reparobot',
    images: [
      {
        url: 'https://reparobot.be/images/calculateur-cout-entretien-robot-tondeuse-preview.webp',
        width: 1200,
        height: 630,
        alt: 'Calculateur de Coût Entretien Robot Tondeuse'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculateur Coût Entretien Robot Tondeuse | Diagnostic & Estimation',
    description: 'Estimation précise des coûts d\'entretien robot tondeuse basée sur vos besoins spécifiques.',
    images: ['https://reparobot.be/images/calculateur-cout-entretien-robot-tondeuse-preview.webp'],
  },
  alternates: {
    canonical: 'https://reparobot.be/calculateur-cout-entretien-robot-tondeuse'
  },
  robots: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  }
};

// Structured data for the cost calculator
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculateur de Coût Entretien Robot Tondeuse',
  applicationCategory: 'UtilityApplication',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock'
  },
  description: 'Calculez vos coûts d\'entretien robot tondeuse selon la taille du terrain, la fréquence d\'utilisation, le type de terrain et les accessoires utilisés',
  featureList: [
    'Calcul personnalisé selon taille de pelouse',
    'Ajustement selon fréquence d\'utilisation',
    'Prise en compte du type de terrain',
    'Estimation des coûts d\'accessoires',
    'Analyse de l\'historique de maintenance',
    'Évaluation des problèmes techniques'
  ],
  provider: {
    '@type': 'LocalBusiness',
    name: 'Reparobot',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '160 Chaussée d\'ecaussinnes',
      addressLocality: 'Braine le comte',
      postalCode: '7090',
      addressCountry: 'BE'
    }
  },
  review: {
    '@type': 'Review',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: '4.8',
      bestRating: '5'
    },
    author: {
      '@type': 'Organization',
      name: 'Reparobot'
    }
  }
};

// FAQ Schema updated to match calculator functionality
const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Comment est calculé le coût d\'entretien de mon robot tondeuse?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Le coût est calculé en fonction de plusieurs facteurs : la taille de votre pelouse (en m²), la fréquence d\'utilisation (quotidienne, hebdomadaire ou mensuelle), le type de terrain (plat, accidenté ou en pente), l\'historique des problèmes techniques et la présence d\'accessoires.'
      }
    },
    {
      '@type': 'Question',
      name: 'Quels facteurs influencent le plus le coût d\'entretien?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les principaux facteurs sont la taille de la pelouse (0,10€ par m²), le type de terrain (jusqu\'à +50€ pour terrain accidenté), la fréquence d\'utilisation (+20% pour usage quotidien) et l\'historique de maintenance (-10% si entretien régulier).'
      }
    },
    {
      '@type': 'Question',
      name: 'Comment réduire mes coûts d\'entretien?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pour réduire vos coûts, privilégiez un entretien régulier (-10% sur les coûts), adaptez la fréquence d\'utilisation à vos besoins réels, et maintenez votre robot en bon état. Notre calculateur vous aide à identifier les domaines où vous pouvez optimiser vos coûts.'
      }
    }
  ]
};

export default function CostCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        id="calculator-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      {children}
    </>
  );
}