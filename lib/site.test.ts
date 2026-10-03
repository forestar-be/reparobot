import { describe, expect, it } from 'vitest';
import { DEFAULT_SITE_URL, normalizeSiteUrl } from './site';

describe('normalizeSiteUrl (R002-S04)', () => {
  it("retombe sur l'hôte www réellement servi sans variable", () => {
    expect(normalizeSiteUrl(undefined)).toBe(DEFAULT_SITE_URL);
    expect(normalizeSiteUrl('')).toBe(DEFAULT_SITE_URL);
    expect(normalizeSiteUrl('   ')).toBe(DEFAULT_SITE_URL);
    expect(DEFAULT_SITE_URL).toBe('https://www.reparobot.be');
  });

  it('retire les espaces et la barre finale', () => {
    expect(normalizeSiteUrl(' https://apercu.exemple.test/ ')).toBe(
      'https://apercu.exemple.test',
    );
    expect(normalizeSiteUrl('https://apercu.exemple.test///')).toBe(
      'https://apercu.exemple.test',
    );
  });
});
