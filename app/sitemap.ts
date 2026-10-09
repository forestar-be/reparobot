import { getRobotsCatalog, isFallbackCatalog } from '../lib/robots';
import { siteUrl } from '../lib/site';
import type { MetadataRoute } from 'next';

// Régénéré avec le catalogue (tag `robots-catalog`) ; au plus toutes les heures.
export const revalidate = 3600;

/**
 * Plan du site : uniquement des pages qui répondent 200 et qu'on veut référencer.
 * `/devis` n'y figure pas (sans robot choisi, il redirige vers `/robots`) ; les pages
 * de formulaire (`/etre-recontacte`) non plus : elles ne valent que depuis une fiche.
 * `/cookies` reste en ligne et indexable, mais n'est pas à pousser à Google.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getRobotsCatalog();
  // Catalogue indisponible : à l'exécution, on lève pour que Next garde le plan
  // précédent plutôt que de publier un plan sans fiches ; pendant le build (aperçu sans
  // jeton d'API, par exemple), on se contente des pages fixes.
  if (
    isFallbackCatalog(catalog) &&
    process.env.NEXT_PHASE !== 'phase-production-build'
  ) {
    throw new Error('Catalogue indisponible : plan du site non généré');
  }
  const pages: MetadataRoute.Sitemap = [
    { url: siteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: siteUrl('/robots'), changeFrequency: 'weekly', priority: 0.9 },
    ...catalog.robots.map((robot) => ({
      url: siteUrl(`/robots/${robot.slug}`),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    {
      url: siteUrl('/entretien-reparation'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { url: siteUrl('/contact'), changeFrequency: 'monthly', priority: 0.6 },
  ];
  return pages;
}
