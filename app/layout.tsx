import Analytics from '../components/Analytics';
import CookieBanner from '../components/CookieBanner';
import MobileBar from '../components/site/MobileBar';
import SiteFooter from '../components/site/SiteFooter';
import SiteHeader from '../components/site/SiteHeader';
import { SITE_URL } from '../lib/site';
import { getSiteInfo, telHref } from '../lib/site-info';
import React from 'react';
import { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

// Manrope (SIL OFL, licence dans ./fonts/OFL.txt) : fichiers de la maquette, conteneur
// woff2. Le texte courant est en 400, les titres en 600, les prix et actions en 700,
// la signature en 800.
const manrope = localFont({
  src: [
    { path: './fonts/manrope-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/manrope-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/manrope-700.woff2', weight: '700', style: 'normal' },
    { path: './fonts/manrope-800.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-manrope',
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});

// Define your metadata using Next.js Metadata API
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | Robot Husqvarna Belgique | Forestar',
    default:
      'Entretien, Achat et Réparation Robot Tondeuse Husqvarna en Belgique | Forestar',
  },
  description:
    'Spécialiste robot tondeuse Husqvarna en Belgique. Entretien, achat, réparation et installation par des experts certifiés. Service professionnel garanti.',
  icons: {
    icon: '/images/logo/favicon.ico',
    shortcut: '/images/logo/favicon.ico',
    apple: '/images/logo/logo-70x70.png',
  },
  keywords: [
    'robot tondeuse Belgique',
    'Husqvarna Belgique',

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
      'Entretien, Achat et Réparation Robot Tondeuse Husqvarna en Belgique',
    description:
      'Spécialiste robot tondeuse Husqvarna en Belgique. Entretien, achat, réparation et installation par des experts certifiés.',
    url: SITE_URL,
    siteName: 'Robot Husqvarna Belgique | Forestar',
    locale: 'fr_BE',
    type: 'website',
    images: [
      {
        url: '/images/robot-tondeuse-husqvarna-belgique.jpg',
        width: 1200,
        height: 630,
        alt: 'Robot tondeuse Husqvarna - Entretien et réparation en Belgique',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Robot Tondeuse Husqvarna Belgique',
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
    canonical: SITE_URL,
  },
  category: 'jardinage',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const info = await getSiteInfo();
  return (
    <html lang="fr" className={manrope.variable}>
      <body>
        <a href="#contenu" className="skip-link">
          Aller au contenu
        </a>
        <SiteHeader />
        <main id="contenu">{children}</main>
        <SiteFooter />
        <MobileBar phoneHref={telHref(info)} />
        <Analytics />
        <CookieBanner />
      </body>
    </html>
  );
}
