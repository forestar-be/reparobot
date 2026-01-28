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

const nextConfig = {
  // productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'reparobot.be',
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
              pathname: '/**/images/**',
            },
          ]
        : []),
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
