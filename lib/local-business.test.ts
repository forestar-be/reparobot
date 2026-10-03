import { describe, expect, it } from 'vitest';
import { buildLocalBusiness } from './local-business';
import { FALLBACK_SITE_INFO } from './site-info';

describe('buildLocalBusiness', () => {
  const ld = buildLocalBusiness(FALLBACK_SITE_INFO);

  it('reprend les coordonnées de site-info, pas de valeurs en dur', () => {
    expect(ld.telephone).toBe('+3267830706');
    expect(ld.geo).toEqual({
      '@type': 'GeoCoordinates',
      latitude: 50.5993464,
      longitude: 4.1318598,
    });
    expect(ld.address).toMatchObject({
      streetAddress: "160 Chaussée d'Écaussinnes",
      postalCode: '7090',
      addressLocality: 'Braine-le-Comte',
      addressCountry: 'BE',
    });
  });

  it('dérive les horaires des lignes de site-info', () => {
    expect(ld.openingHoursSpecification).toHaveLength(4);
    const custom = buildLocalBusiness({
      ...FALLBACK_SITE_INFO,
      hours: 'Mardi : 10:00–12:00',
    });
    expect(custom.openingHoursSpecification).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday'],
        opens: '10:00',
        closes: '12:00',
      },
    ]);
  });

  it('omet les horaires illisibles plutôt que d’en inventer', () => {
    const none = buildLocalBusiness({
      ...FALLBACK_SITE_INFO,
      hours: 'sur rendez-vous',
    });
    expect('openingHoursSpecification' in none).toBe(false);
  });

  it('ne publie pas de note sans nombre d’avis', () => {
    expect('aggregateRating' in ld).toBe(false);
  });
});
