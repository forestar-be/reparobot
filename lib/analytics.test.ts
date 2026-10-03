import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ID = 'G-TEST123456';

type Appel = unknown[];
type FenetreMesure = {
  dataLayer?: IArguments[];
  gtag?: (...args: unknown[]) => void;
  [cle: string]: unknown;
};

/** `window` vu comme la couche de mesure l'écrit (dataLayer, gtag, ga-disable-…). */
function fenetreMesure(): FenetreMesure {
  return window as unknown as FenetreMesure;
}

/** Recharge les modules avec l'identifiant voulu (il est lu à l'import). */
async function charger(id: string | undefined) {
  vi.resetModules();
  if (id === undefined) vi.stubEnv('NEXT_PUBLIC_GA4_MEASUREMENT_ID', '');
  else vi.stubEnv('NEXT_PUBLIC_GA4_MEASUREMENT_ID', id);
  const consent = await import('./consent');
  const analytics = await import('./analytics');
  return { consent, analytics };
}

function appels(): Appel[] {
  const fenetre = fenetreMesure();
  return (fenetre.dataLayer ?? []).map((a) => Array.from(a));
}

beforeEach(() => {
  window.localStorage.clear();
  const fenetre = fenetreMesure();
  delete fenetre.dataLayer;
  delete fenetre.gtag;
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('identifiant GA4 (R004, AC-04)', () => {
  it('accepte un identifiant réel, refuse le gabarit et le vide', async () => {
    const { analytics } = await charger(ID);
    const ok = analytics.isConfiguredGa4MeasurementId;
    expect(ok('G-ABCD1234')).toBe(true);
    expect(ok('G-XXXXXXXXXX')).toBe(false);
    expect(ok('')).toBe(false);
    expect(ok(undefined)).toBe(false);
    expect(ok('UA-123456-1')).toBe(false);
  });

  it('sans identifiant : ni bandeau à afficher ni événement', async () => {
    const { analytics, consent } = await charger(undefined);
    expect(analytics.GA4_MEASUREMENT_ID).toBeNull();
    expect(analytics.CONSENT_UI_ENABLED).toBe(false);
    consent.saveConsent(true);
    analytics.trackLead('devis');
    analytics.trackPhoneClick();
    expect(appels()).toEqual([]);
  });

  it('avec le gabarit : traité comme sans identifiant', async () => {
    const { analytics } = await charger('G-XXXXXXXXXX');
    expect(analytics.GA4_MEASUREMENT_ID).toBeNull();
    expect(analytics.CONSENT_UI_ENABLED).toBe(false);
  });
});

describe('événements (R004, AC-01 et AC-03)', () => {
  it("sans choix : rien n'est envoyé, aucune file n'est même créée", async () => {
    const { analytics } = await charger(ID);
    analytics.trackLead('devis');
    analytics.trackPhoneClick();
    expect(appels()).toEqual([]);
    expect(fenetreMesure().gtag).toBeUndefined();
  });

  it("après un refus : rien n'est envoyé", async () => {
    const { analytics, consent } = await charger(ID);
    consent.saveConsent(false);
    analytics.trackLead('contact');
    analytics.trackPhoneClick();
    expect(appels()).toEqual([]);
  });

  it('après accord : generate_lead porte le type, et le consentement est amorcé avant', async () => {
    const { analytics, consent } = await charger(ID);
    consent.saveConsent(true);
    analytics.trackLead('devis');
    const vus = appels();
    expect(vus[0]).toEqual([
      'consent',
      'default',
      {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      },
    ]);
    expect(vus[1]).toEqual([
      'consent',
      'update',
      { analytics_storage: 'granted' },
    ]);
    expect(vus.find((a) => a[0] === 'config')?.[1]).toBe(ID);
    expect(vus.at(-1)).toEqual([
      'event',
      'generate_lead',
      { lead_type: 'devis' },
    ]);
  });

  it.each(['devis', 'contact', 'entretien'] as const)(
    'trackLead(%s) envoie lead_type=%s',
    async (type) => {
      const { analytics, consent } = await charger(ID);
      consent.saveConsent(true);
      analytics.trackLead(type);
      expect(appels().at(-1)).toEqual([
        'event',
        'generate_lead',
        { lead_type: type },
      ]);
    },
  );

  it('trackPhoneClick envoie phone_click sans le numéro', async () => {
    const { analytics, consent } = await charger(ID);
    consent.saveConsent(true);
    analytics.trackPhoneClick();
    expect(appels().at(-1)).toEqual([
      'event',
      'phone_click',
      { link_type: 'tel' },
    ]);
  });

  it("le consentement se relit à l'émission : un retrait coupe aussitôt", async () => {
    const { analytics, consent } = await charger(ID);
    consent.saveConsent(true);
    analytics.trackLead('devis');
    const avant = appels().length;
    consent.saveConsent(false);
    analytics.trackLead('devis');
    expect(appels().length).toBe(avant);
  });

  it("l'amorçage n'a lieu qu'une fois", async () => {
    const { analytics, consent } = await charger(ID);
    consent.saveConsent(true);
    analytics.trackLead('devis');
    analytics.trackLead('contact');
    expect(appels().filter((a) => a[0] === 'config')).toHaveLength(1);
  });

  it('syncAnalyticsConsent coupe tous les envois de la propriété après un refus', async () => {
    const { analytics } = await charger(ID);
    analytics.syncAnalyticsConsent(false);
    expect(fenetreMesure()[`ga-disable-${ID}`]).toBe(true);
    analytics.syncAnalyticsConsent(true);
    expect(fenetreMesure()[`ga-disable-${ID}`]).toBe(false);
  });
});

describe('la mesure ne casse jamais la page (R004, risques)', () => {
  it("un gtag qui lève ne remonte pas jusqu'au formulaire", async () => {
    const { analytics, consent } = await charger(ID);
    consent.saveConsent(true);
    fenetreMesure().gtag = () => {
      throw new Error('gtag cassé');
    };
    expect(() => analytics.trackLead('devis')).not.toThrow();
    expect(() => analytics.trackPhoneClick()).not.toThrow();
    expect(() => analytics.syncAnalyticsConsent(true)).not.toThrow();
  });

  it('un stockage qui lève ne remonte pas non plus', async () => {
    const { analytics } = await charger(ID);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('stockage bloqué');
    });
    expect(() => analytics.trackLead('entretien')).not.toThrow();
    expect(appels()).toEqual([]);
  });
});
