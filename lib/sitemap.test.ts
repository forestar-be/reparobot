import { beforeEach, describe, expect, it, vi } from 'vitest';

const catalog = {
  categories: [],
  robots: [
    { slug: 'husqvarna-automower-305' },
    { slug: 'husqvarna-automower-308v' },
  ],
};
let fallback = false;
vi.mock('./robots', () => ({
  getRobotsCatalog: async () => catalog,
  isFallbackCatalog: () => fallback,
}));

beforeEach(() => {
  fallback = false;
  vi.unstubAllEnvs();
});

describe('sitemap (R009-S01)', () => {
  it('liste accueil, catalogue, chaque fiche, entretien et contact', async () => {
    const { default: sitemap } = await import('../app/sitemap');
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toEqual([
      'https://www.reparobot.be',
      'https://www.reparobot.be/robots',
      'https://www.reparobot.be/robots/husqvarna-automower-305',
      'https://www.reparobot.be/robots/husqvarna-automower-308v',
      'https://www.reparobot.be/entretien-reparation',
      'https://www.reparobot.be/contact',
    ]);
  });

  it('ne contient ni /devis (il redirige sans robot) ni /etre-recontacte ni anciennes adresses', async () => {
    const { default: sitemap } = await import('../app/sitemap');
    const urls = (await sitemap()).map((e) => e.url).join(' ');
    for (const absent of [
      '/devis',
      '/etre-recontacte',
      '/rappel',
      '/cookies',
      '/about',
      '#',
    ]) {
      expect(urls).not.toContain(absent);
    }
  });

  it('à l’exécution, un catalogue indisponible lève (Next garde le plan précédent)', async () => {
    fallback = true;
    const { default: sitemap } = await import('../app/sitemap');
    await expect(sitemap()).rejects.toThrow(/indisponible/);
  });

  it('pendant le build, un catalogue indisponible donne les pages fixes', async () => {
    fallback = true;
    vi.stubEnv('NEXT_PHASE', 'phase-production-build');
    const { default: sitemap } = await import('../app/sitemap');
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toContain('https://www.reparobot.be/robots');
  });
});
