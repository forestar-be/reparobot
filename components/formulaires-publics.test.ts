/**
 * R006-S05 (phase 9.18) — la règle que ni `tsc` ni `eslint` ne voient.
 *
 * D-13 : `ServiceForm.tsx` appelait l'API **depuis le navigateur**, en lisant
 * `process.env.API_URL` et `process.env.AUTH_TOKEN` dans un composant
 * `'use client'`. Next ne remplace pas ces variables côté client : le bundle
 * publié contenait `fetch("".concat(undefined, "/submit-form"))`, mesuré en 404
 * — le formulaire ne fonctionnait plus du tout. Et si la variable avait porté
 * un préfixe `NEXT_PUBLIC_`, le jeton partagé serait parti dans le bundle.
 *
 * Le contrôle est textuel parce que le défaut est textuel : rien dans le type
 * de `process.env` ne distingue une variable lisible du navigateur d'une autre.
 * Un test de rendu ne l'aurait pas vu non plus — le composant se montait très
 * bien, c'est l'appel qui partait dans le vide.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = join(__dirname, '..');

/** Les trois formulaires publics du site, et l'action qui les sert. */
const FORMULAIRES = [
  { fichier: 'components/ServiceForm.tsx', action: 'submitServiceForm' },
  {
    fichier: 'components/RobotContactForm.tsx',
    action: 'submitRobotReservation',
  },
  { fichier: 'components/QuoteRequestForm.tsx', action: 'submitQuoteRequest' },
] as const;

function source(fichier: string): string {
  return readFileSync(join(RACINE, fichier), 'utf8');
}

/**
 * La règle porte sur le **code**, pas sur les commentaires : `ServiceForm.tsx`
 * explique justement en commentaire pourquoi il ne lit plus `API_URL` ni
 * `AUTH_TOKEN`, et ce texte ne part dans aucun bundle. Un contrôle naïf
 * interdirait d'écrire l'explication.
 */
function sansCommentaires(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

describe.each(FORMULAIRES)('%s', ({ fichier, action }) => {
  const brut = source(fichier);
  const code = sansCommentaires(brut);

  it('est bien un composant client (le contrôle porte sur le bon fichier)', () => {
    // Pas d'ancrage en début de fichier : `ServiceForm.tsx` porte une ligne
    // de commentaire avant sa directive, ce qui reste valide.
    expect(brut).toMatch(/^'use client';$/m);
  });

  it('ne lit aucune variable serveur depuis le navigateur (D-13)', () => {
    const lectures = code.match(/process\.env\.[A-Z0-9_]+/g) ?? [];
    const interdites = lectures.filter(
      (lecture) => !lecture.startsWith('process.env.NEXT_PUBLIC_'),
    );
    expect(interdites).toEqual([]);
    // Nommés explicitement : ce sont les deux qui ont réellement cassé la
    // production, et `AUTH_TOKEN` est le jeton partagé de forestar-server.
    expect(code).not.toContain('API_URL');
    expect(code).not.toContain('AUTH_TOKEN');
  });

  it("n'appelle jamais `fetch` lui-même : il passe par sa server action", () => {
    expect(code).not.toMatch(/\bfetch\s*\(/);
    expect(code).toContain(action);
  });

  it('monte le widget et lui transmet un jeton neuf après un refus', () => {
    expect(code).toContain('TurnstileWidget');
    expect(code).toContain('turnstileToken');
    // AC-06 — un jeton refusé est consommé : le second essai en exige un neuf.
    expect(code).toContain('setTurnstileResetSignal');
    // AC-05 — le refus du serveur devient un message, pas une erreur brute.
    expect(code).toContain('turnstileMessage');
  });

  it("n'envoie pas la soumission avant d'avoir le jeton (AC-04)", () => {
    // La condition exacte du bouton : inactif tant que la protection est en
    // service et que le widget n'a rien rendu.
    expect(code).toMatch(/turnstileEnabled\(\)\s*&&\s*!turnstileToken/);
  });

  it('transmet le jeton à son action', () => {
    const appel = new RegExp(`${action}\\([^)]*turnstileToken`, 's');
    expect(code).toMatch(appel);
  });
});

describe('server actions', () => {
  it('est le seul fichier autorisé à connaître le jeton partagé', () => {
    const actions = source('lib/actions.ts');
    expect(actions).toMatch(/^'use server';/);
    expect(sansCommentaires(actions)).toContain('process.env.AUTH_TOKEN');
  });

  it('le socle commun du widget ne lit que des variables publiques', () => {
    // `lib/turnstile.ts` est importé par des composants client : une variable
    // serveur lue ici repartirait dans le bundle du navigateur.
    const lectures =
      sansCommentaires(source('lib/turnstile.ts')).match(
        /process\.env\.[A-Z0-9_]+/g,
      ) ?? [];
    expect(lectures).toEqual(['process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY']);
  });
});
