import Analytics from '../components/Analytics';
import CookieBanner from '../components/CookieBanner';
import MobileBar from '../components/site/MobileBar';
import SiteFooter from '../components/site/SiteFooter';
import SiteHeader from '../components/site/SiteHeader';
import { OG_IMAGE } from '../lib/og-image';
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

// Métadonnées communes. Chaque page déclare son propre titre, sa description et son
// canonical (`alternates.canonical`, via `siteUrl`) : aucun canonical global ici, il
// ferait pointer toutes les pages vers l'accueil.
const SITE_NAME = 'reparobot par Forestar';
const DEFAULT_TITLE =
  'Robots tondeuses Husqvarna, entretien et réparation toutes marques';
const DEFAULT_DESCRIPTION =
  'Revendeur agréé Husqvarna à Braine-le-Comte : robots tondeuses Automower®, installation, entretien et réparation de robots de toutes marques.';
// Code de vérification Search Console (balise) : lu dans l'environnement, jamais en dur.
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | reparobot',
    default: `${DEFAULT_TITLE} | reparobot`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: '/images/logo/favicon.ico',
    shortcut: '/images/logo/favicon.ico',
    apple: '/images/logo/logo-70x70.png',
  },
  authors: [{ name: 'Forestar' }],
  creator: 'Forestar',
  publisher: 'Forestar',
  openGraph: {
    siteName: SITE_NAME,
    locale: 'fr_BE',
    type: 'website',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE.url],
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
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
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
