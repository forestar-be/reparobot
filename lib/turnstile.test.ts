/**
 * Le socle du relais Turnstile de reparobot (phase 9.18, R006-S02).
 */

import { describe, expect, it } from 'vitest';
import {
  isTurnstileRefusal,
  TURNSTILE_FIELD,
  TURNSTILE_HEADER,
  TURNSTILE_SCRIPT_URL,
  turnstileMessage,
} from './turnstile';

describe('le contrat partagé avec forestar-server', () => {
  it('nomme l’en-tête exactement comme le garde le lit', () => {
    // R005 lit `x-turnstile-token` : toute autre orthographe laisserait le
    // garde croire qu'aucun jeton n'est présenté.
    expect(TURNSTILE_HEADER).toBe('x-turnstile-token');
    expect(TURNSTILE_FIELD).toBe('cf-turnstile-response');
  });

  it('charge le script en rendu explicite', () => {
    expect(TURNSTILE_SCRIPT_URL).toContain(
      'challenges.cloudflare.com/turnstile/v0/api.js',
    );
    expect(TURNSTILE_SCRIPT_URL).toContain('render=explicit');
  });

  it('reconnaît les trois refus, et eux seuls', () => {
    expect(isTurnstileRefusal('turnstile_required')).toBe(true);
    expect(isTurnstileRefusal('turnstile_failed')).toBe(true);
    expect(isTurnstileRefusal('turnstile_unavailable')).toBe(true);
    expect(isTurnstileRefusal('dates_unavailable')).toBe(false);
    expect(isTurnstileRefusal(undefined)).toBe(false);
  });
});

describe('les messages affichés au client', () => {
  it('distingue les trois causes', () => {
    expect(turnstileMessage('turnstile_required')).toContain('Rechargez');
    expect(turnstileMessage('turnstile_failed')).toContain('Refaites');
    expect(turnstileMessage('turnstile_unavailable')).toContain(
      'momentanément indisponible',
    );
  });

  it('ne transforme jamais une panne quelconque en « refaites la vérification »', () => {
    // Sinon le client refait un geste qui ne répare rien, et la vraie cause
    // reste invisible.
    expect(turnstileMessage('Erreur lors de la soumission')).toBeNull();
    expect(turnstileMessage(undefined)).toBeNull();
    expect(turnstileMessage(null)).toBeNull();
  });
});
