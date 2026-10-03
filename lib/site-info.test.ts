import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  FALLBACK_SITE_INFO,
  formatRating,
  getSiteInfo,
  mergeSiteInfo,
  parseAddress,
  parseOpeningHours,
  shortHours,
  telHref,
} from './site-info';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('parseOpeningHours', () => {
  it('lit les horaires de production : lundi-vendredi, samedi, dimanche fermé', () => {
    const specs = parseOpeningHours(FALLBACK_SITE_INFO.hours);
    expect(specs).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:00',
        closes: '12:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '13:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:00',
        closes: '12:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '13:00',
        closes: '18:00',
      },
    ]);
  });

  it('ignore « Fermé » et les lignes illisibles sans rien inventer', () => {
    expect(parseOpeningHours('Dimanche : Fermé')).toEqual([]);
    expect(parseOpeningHours('sur rendez-vous')).toEqual([]);
    expect(parseOpeningHours('Jour férié : 9:00–12:00')).toEqual([]);
    const specs = parseOpeningHours('n’importe quoi\nMardi : 9:00-17:30');
    expect(specs).toHaveLength(1);
    expect(specs[0]).toMatchObject({
      dayOfWeek: ['Tuesday'],
      opens: '09:00',
      closes: '17:30',
    });
  });

  it('accepte les tirets simples et les accents', () => {
    const [spec] = parseOpeningHours('Mardi - Jeudi : 08:00–16:00');
    expect(spec.dayOfWeek).toEqual(['Tuesday', 'Wednesday', 'Thursday']);
  });

  it('refuse une plage de jours inversée', () => {
    expect(parseOpeningHours('Vendredi — Lundi : 08:00–16:00')).toEqual([]);
  });
});

describe('mergeSiteInfo', () => {
  it('remplace chaque champ nul ou vide par la valeur de secours', () => {
    const merged = mergeSiteInfo({
      phone: null,
      phoneDisplay: ' 02 123 45 67 ',
      hours: '',
      address: null,
      googleRating: 4.9,
      latitude: null,
      longitude: 4.2,
    });
    expect(merged.phoneDisplay).toBe('02 123 45 67');
    expect(merged.phone).toBe(FALLBACK_SITE_INFO.phone);
    expect(merged.hours).toBe(FALLBACK_SITE_INFO.hours);
    expect(merged.googleRating).toBe(4.9);
    expect(merged.latitude).toBe(FALLBACK_SITE_INFO.latitude);
    expect(merged.longitude).toBe(4.2);
  });

  it('retombe entièrement sur le secours si la réponse n’est pas un objet', () => {
    expect(mergeSiteInfo(null)).toEqual(FALLBACK_SITE_INFO);
    expect(mergeSiteInfo('<html>')).toEqual(FALLBACK_SITE_INFO);
  });
});

describe('getSiteInfo', () => {
  it('lit /site-info avec le tag de cache `site-info`', async () => {
    vi.stubEnv('API_URL', 'https://api.test');
    vi.stubEnv('AUTH_TOKEN', 'jeton');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ phoneDisplay: '01 11 11 11 11' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const info = await getSiteInfo();
    expect(info.phoneDisplay).toBe('01 11 11 11 11');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test/site-info',
      expect.objectContaining({
        next: expect.objectContaining({ tags: ['site-info'] }),
      }),
    );
  });

  it('retombe sur le secours si la route répond 404 (avant son déploiement)', async () => {
    vi.stubEnv('API_URL', 'https://api.test');
    vi.stubEnv('AUTH_TOKEN', 'jeton');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
    expect(await getSiteInfo()).toEqual(FALLBACK_SITE_INFO);
  });

  it('retombe sur le secours si le réseau échoue ou si le JSON est invalide', async () => {
    vi.stubEnv('API_URL', 'https://api.test');
    vi.stubEnv('AUTH_TOKEN', 'jeton');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('réseau')));
    expect(await getSiteInfo()).toEqual(FALLBACK_SITE_INFO);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('JSON');
        },
      }),
    );
    expect(await getSiteInfo()).toEqual(FALLBACK_SITE_INFO);
  });

  it('retombe sur le secours sans configuration d’API', async () => {
    vi.stubEnv('API_URL', '');
    vi.stubEnv('AUTH_TOKEN', '');
    expect(await getSiteInfo()).toEqual(FALLBACK_SITE_INFO);
  });
});

describe('petits formats', () => {
  it('shortHours prend la première ligne', () => {
    expect(shortHours(FALLBACK_SITE_INFO.hours)).toBe(
      'Lundi — Vendredi : 07:00–12:00, 13:00–18:00',
    );
  });
  it('telHref garde le numéro international', () => {
    expect(telHref(FALLBACK_SITE_INFO)).toBe('tel:+3267830706');
  });
  it('parseAddress sépare rue, code postal et commune', () => {
    expect(parseAddress(FALLBACK_SITE_INFO.address)).toEqual({
      streetAddress: "160 Chaussée d'Écaussinnes",
      postalCode: '7090',
      addressLocality: 'Braine-le-Comte',
    });
    expect(parseAddress('adresse libre')).toEqual({
      streetAddress: 'adresse libre',
    });
  });
  it('formatRating met une virgule', () => {
    expect(formatRating(4.6)).toBe('4,6');
  });
});
