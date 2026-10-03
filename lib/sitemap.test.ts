import { beforeEach, describe, expect, it, vi } from 'vitest';

const catalog = {
  categories: [],
  robots: [
    { slug: 'husqvarna-automower-305' },
    { slug: 'husqvarna-automower-308v' },
  ],
  maintenance: { description: '', price: null },
  generatedAt: '',
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
  it('liste accueil, catalogue, chaque fiche, entretien, calculateurs et cookies', async () => {
    const { default: sitemap } = await import('../app/sitemap');
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toEqual([
      'https://www.reparobot.be',
      'https://www.reparobot.be/robots',
      'https://www.reparobot.be/robots/husqvarna-automower-305',
      'https://www.reparobot.be/robots/husqvarna-automower-308v',
      'https://www.reparobot.be/entretien-reparation',
      'https://www.reparobot.be/calculateur-cout-entretien-robot-tondeuse',
      'https://www.reparobot.be/calculateur-retour-sur-investissement-robot-tondeuse',
      'https://www.reparobot.be/cookies',
    ]);
  });

  it('ne contient ni /devis (il redirige sans robot) ni /rappel ni anciennes adresses', async () => {
    const { default: sitemap } = await import('../app/sitemap');
    const urls = (await sitemap()).map((e) => e.url).join(' ');
    for (const absent of ['/devis', '/rappel', '/about', '/contact', '#']) {
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
