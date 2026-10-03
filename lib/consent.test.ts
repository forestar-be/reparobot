import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CONSENT_MAX_AGE_MS,
  CONSENT_OPEN_EVENT,
  CONSENT_STORAGE_KEY,
  CONSENT_UPDATED_EVENT,
  hasAnalyticsConsent,
  openConsentSettings,
  readConsent,
  saveConsent,
} from './consent';

beforeEach(() => window.localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('consentement à la mesure (R004-S02)', () => {
  it('sans choix : aucun consentement, la question reste à poser', () => {
    expect(readConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('Accepter : le choix est retenu et se relit', () => {
    saveConsent(true);
    expect(hasAnalyticsConsent()).toBe(true);
    expect(readConsent()?.analytics).toBe(true);
  });

  it('Refuser : un choix existe, mais sans mesure', () => {
    saveConsent(false);
    expect(readConsent()).not.toBeNull();
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('le choix se retire : Accepter puis Refuser coupe la mesure', () => {
    saveConsent(true);
    saveConsent(false);
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('le choix est retenu 12 mois, pas davantage', () => {
    saveConsent(true);
    const saved = Date.parse(readConsent()!.updatedAt);
    expect(readConsent(saved + CONSENT_MAX_AGE_MS - 1000)).not.toBeNull();
    expect(readConsent(saved + CONSENT_MAX_AGE_MS + 1000)).toBeNull();
  });

  it('un choix périmé ne compte plus comme accord', () => {
    const old = new Date(Date.now() - CONSENT_MAX_AGE_MS - 86_400_000);
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ analytics: true, updatedAt: old.toISOString() }),
    );
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it.each([
    ['du texte', 'accepted'],
    ['du JSON incomplet', '{"analytics":true}'],
    ['un type faux', '{"analytics":"oui","updatedAt":"2026-10-01T00:00:00Z"}'],
    ['une date illisible', '{"analytics":true,"updatedAt":"hier"}'],
  ])('%s : traité comme aucun choix', (_nom, valeur) => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, valeur);
    expect(readConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("un stockage qui lève ne casse rien : aucun choix, pas d'exception", () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('stockage bloqué');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('stockage bloqué');
    });
    expect(readConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(false);
    expect(() => saveConsent(true)).not.toThrow();
  });

  it("l'enregistrement prévient les composants, même sans stockage", () => {
    const recu = vi.fn();
    window.addEventListener(CONSENT_UPDATED_EVENT, recu);
    saveConsent(true);
    window.removeEventListener(CONSENT_UPDATED_EVENT, recu);
    expect(recu).toHaveBeenCalledTimes(1);
  });

  it('« Gérer les cookies » émet la demande de réouverture', () => {
    const recu = vi.fn();
    window.addEventListener(CONSENT_OPEN_EVENT, recu);
    openConsentSettings();
    window.removeEventListener(CONSENT_OPEN_EVENT, recu);
    expect(recu).toHaveBeenCalledTimes(1);
  });
});
