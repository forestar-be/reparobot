import { describe, expect, it } from 'vitest';
import type { ServiceOffer } from './service-offers';
import type { SiteInfo } from './site-info';
import {
  buildContactPage,
  buildWorkshopService,
  jsonLd,
} from './structured-data';

const offer = (over: Partial<ServiceOffer>): ServiceOffer => ({
  id: 1,
  service: 'MAINTENANCE',
  kind: 'BASE',
  label: 'Entretien annuel',
  description: null,
  price: 107,
  unit: null,
  exclusiveGroup: null,
  order: 1,
  ...over,
});

describe('structured-data', () => {
  it('jsonLd empêche de refermer la balise <script>', () => {
    expect(jsonLd({ a: '</script><b>' })).not.toContain('</script>');
    expect(JSON.parse(jsonLd({ a: '</script>' }))).toEqual({ a: '</script>' });
  });

  it('le service ne publie que les forfaits de base au prix connu', () => {
    const service = buildWorkshopService([
      offer({}),
      offer({ id: 2, service: 'REPAIR', label: 'Réparation', price: null }),
      offer({ id: 3, kind: 'OPTION', label: 'Lames', price: 15 }),
      offer({ id: 4, service: 'INSTALLATION_HELP', label: 'Aide', price: 90 }),
    ]);
    const items = service.hasOfferCatalog?.itemListElement ?? [];
    expect(items.map((i) => i.name)).toEqual(['Entretien annuel']);
    expect(items[0].price).toBe(107);
    expect(service.provider['@id']).toBe('https://www.reparobot.be/#business');
  });

  it('sans forfait lisible, le service n’a pas de catalogue d’offres', () => {
    expect(buildWorkshopService([])).not.toHaveProperty('hasOfferCatalog');
  });

  it('la page de contact embarque l’établissement sans second @context', () => {
    const info = {
      address: '160 Chaussée d’Écaussinnes, 7090 Braine-le-Comte',
      hours: 'Lundi — Vendredi : 07:00–12:00, 13:00–18:00',
      phone: '067 83 07 06',
      latitude: 50.6,
      longitude: 4.1,
    } as unknown as SiteInfo;
    const page = buildContactPage(info);
    expect(page['@type']).toBe('ContactPage');
    expect(page.mainEntity['@type']).toBe('LocalBusiness');
    expect(page.mainEntity).not.toHaveProperty('@context');
  });
});
