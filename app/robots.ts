import { siteUrl } from '../lib/site';
import type { MetadataRoute } from 'next';

/** `robots.txt` : tout est public sauf l'API interne ; le plan du site est référencé. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: siteUrl('/sitemap.xml'),
  };
}
