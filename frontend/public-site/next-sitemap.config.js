// next-sitemap.config.js
module.exports = {
    siteUrl: 'https://reparobot.be', // Your site's base URL
    generateRobotsTxt: true, // Automatically generate a robots.txt
    changefreq: 'monthly', // Default change frequency for all pages
    priority: 0.8, // Default priority for all pages
    sitemapSize: 5000, // Maximum number of URLs per sitemap file
    generateIndexSitemap: true, // Generate an index sitemap for large sites
    exclude: [
      '/#services',
      '/#about',
      '/#contact',
    ], // Exclude anchor-based sections
    transform: async (config, path) => {
      // Custom logic for specific paths
      const customRoutes = {
        '/calculator': {
          priority: 0.8,
        },
        '/roi-calculator': {
          priority: 0.8,
        },
      };
  
      return {
        loc: path, // Path of the URL
        lastmod: new Date().toISOString(), // Current timestamp
        changefreq: 'monthly', // Default change frequency
        priority: customRoutes[path]?.priority || 0.8, // Priority for specific pages
      };
    },
  };
  