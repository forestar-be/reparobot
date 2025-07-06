// next-sitemap.config.js
module.exports = {
  siteUrl: 'https://reparobot.be', // Your site's base URL
  generateRobotsTxt: true, // Automatically generate a robots.txt
  changefreq: 'weekly', // Default change frequency for all pages
  priority: 0.7, // Default priority for all pages
  sitemapSize: 5000, // Maximum number of URLs per sitemap file
  generateIndexSitemap: false, // Generate an index sitemap for large sites
  exclude: [
    '/#services',
    '/#about',
    '/#contact',
    '/api/*',
    '/admin/*',
    '/_next/*',
    '/devis/demande',
    '/devis/confirmation',
    '/devis/[id]',
  ], // Exclude anchor-based sections and non-public pages
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: ['/', '/robots', '/devis'],
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/devis/demande',
          '/devis/confirmation',
          '/devis/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/robots', '/devis'],
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/devis/demande',
          '/devis/confirmation',
          '/devis/',
        ],
      },
    ],
    additionalSitemaps: [],
  },
  transform: async (config, path) => {
    // Pages du header avec priorités optimisées pour le SEO
    const headerPages = {
      '/': {
        priority: 1.0,
        changefreq: 'weekly',
      },
      '/robots': {
        priority: 0.9,
        changefreq: 'weekly',
      },
      '/devis': {
        priority: 0.9,
        changefreq: 'weekly',
      },
    };

    return {
      loc: path, // Path of the URL
      lastmod: new Date().toISOString(), // Current timestamp
      changefreq: headerPages[path]?.changefreq || 'monthly', // Change frequency
      priority: headerPages[path]?.priority || 0.5, // Priority for specific pages
    };
  },
};
  