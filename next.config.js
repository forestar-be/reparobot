/** @type {import('next').NextConfig} */
require('dotenv').config();

// Parse API_URL to extract hostname for image remote patterns
const apiUrl = process.env.API_URL || '';
let apiHostname = '';
let apiProtocol = 'https';
let apiPort = '';
try {
  if (apiUrl) {
    const url = new URL(apiUrl);
    apiHostname = url.hostname;
    apiProtocol = url.protocol.replace(':', '');
    apiPort = url.port || '';
  }
} catch (e) {
  console.warn('Invalid API_URL format, images from API may not load');
}

// Hôte du site lui-même (images servies par le site) : suit SITE_URL (lib/site.ts,
// que ce fichier CommonJS ne peut pas importer ; même valeur par défaut).
let siteHostname = 'www.reparobot.be';
try {
  if (process.env.SITE_URL)
    siteHostname = new URL(process.env.SITE_URL).hostname;
} catch (e) {
  console.warn('Invalid SITE_URL format, default host used for site images');
}

const nextConfig = {
  // SITE_URL doit aussi exister dans les composants client (pages en 'use client') :
  // sans cela, le navigateur retomberait sur la valeur par défaut de lib/site.ts et
  // la page hydraterait une autre URL que celle rendue par le serveur.
  env: {
    SITE_URL: process.env.SITE_URL ?? '',
  },
  // productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: siteHostname,
        port: '',
        pathname: '/**',
      },
      // Allow images from API server (dynamically from API_URL env var)
      ...(apiHostname
        ? [
            {
              protocol: apiProtocol,
              hostname: apiHostname,
              port: apiPort,
              // L'API sert ses images à la racine (`/images/…`) depuis qu'elle n'a
              // plus de préfixe : `/**/images/**` exigeait un segment devant.
              pathname: '/images/**',
            },
          ]
        : []),
      // Allow localhost/127.0.0.1 for local development
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24 hours
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compress: true,
  poweredByHeader: false,
  // i18n: {
  //   locales: ['fr'],
  //   defaultLocale: 'fr',
  // },
  experimental: {
    optimizeCss: true,
  },
  // R006-S04 : l'ancien formulaire de devis vit désormais sur `/devis` (la chaîne de requête suit).
  async redirects() {
    return [
      { source: '/devis/demande', destination: '/devis', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
