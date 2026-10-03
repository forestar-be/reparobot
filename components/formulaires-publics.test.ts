/**
 * R006-S05 (phase 9.18), reprise en R006/R007 — la règle que ni `tsc` ni `eslint` ne voient.
 *
 * D-13 : l'ancien formulaire de service appelait l'API **depuis le navigateur**, en lisant
 * `process.env.API_URL` et `process.env.AUTH_TOKEN` dans un composant `'use client'`. Next ne
 * remplace pas ces variables côté client : le bundle publié contenait
 * `fetch("".concat(undefined, "/submit-form"))`, mesuré en 404 — le formulaire ne fonctionnait
 * plus du tout. Et si la variable avait porté un préfixe `NEXT_PUBLIC_`, le jeton partagé serait
 * parti dans le bundle.
 *
 * Le contrôle est textuel parce que le défaut est textuel. Il porte sur **tous** les composants
 * client des formulaires (dossiers `forms`, `devis`, `rappel`, `entretien`) : un composant ajouté
 * plus tard est couvert sans qu'on pense à l'inscrire ici. Le comportement (route, corps,
 * en-tête, jeton, refus) est prouvé par les tests de contrat de chaque formulaire.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = join(__dirname, '..');
const DOSSIERS = ['forms', 'devis', 'rappel', 'entretien'];

function source(fichier: string): string {
  return readFileSync(join(RACINE, fichier), 'utf8');
}

/**
 * La règle porte sur le **code**, pas sur les commentaires : les commentaires expliquent
 * justement pourquoi on ne lit plus `API_URL` ni `AUTH_TOKEN`.
 */
function sansCommentaires(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/** Les fichiers `.tsx`/`.ts` du dossier, tests exclus. */
function fichiersDe(dossier: string): string[] {
  return readdirSync(join(RACINE, 'components', dossier))
    .filter((nom) => /\.tsx?$/.test(nom) && !/\.test\./.test(nom))
    .map((nom) => `components/${dossier}/${nom}`);
}

const CLIENTS = DOSSIERS.flatMap(fichiersDe).filter((fichier) =>
  /^'use client';$/m.test(source(fichier)),
);

describe('composants client des formulaires', () => {
  it('le contrôle couvre bien les formulaires (pas un dossier vide)', () => {
    expect(CLIENTS).toEqual(
      expect.arrayContaining([
        'components/forms/useFormSubmission.ts',
        'components/devis/QuoteForm.tsx',
      ]),
    );
  });

  describe.each(CLIENTS)('%s', (fichier) => {
    const code = sansCommentaires(source(fichier));

    it('ne lit aucune variable serveur depuis le navigateur (D-13)', () => {
      const lectures = code.match(/process\.env\.[A-Z0-9_]+/g) ?? [];
      const interdites = lectures.filter(
        (lecture) => !lecture.startsWith('process.env.NEXT_PUBLIC_'),
      );
      expect(interdites).toEqual([]);
      // Nommés explicitement : ce sont les deux qui ont réellement cassé la production, et
      // `AUTH_TOKEN` est le jeton partagé de forestar-server.
      expect(code).not.toContain('API_URL');
      expect(code).not.toContain('AUTH_TOKEN');
    });

    it("n'appelle jamais `fetch` lui-même : il passe par une server action", () => {
      expect(code).not.toMatch(/\bfetch\s*\(/);
    });
  });
});

describe('cycle d’envoi commun', () => {
  const code = sansCommentaires(
    source('components/forms/useFormSubmission.ts'),
  );

  it("n'envoie pas avant d'avoir le jeton (AC-04)", () => {
    expect(code).toMatch(/turnstileEnabled\(\)\s*&&\s*!turnstileToken/);
  });

  it('transmet le jeton à la fonction d’envoi', () => {
    expect(code).toMatch(/send\(turnstileToken\)/);
  });

  it('réarme le widget après un refus (AC-06) et traduit le refus (AC-05)', () => {
    expect(code).toContain('setTurnstileResetSignal');
    expect(code).toContain('turnstileMessage');
  });

  it('appelle trackLead exactement une fois, après le refus du serveur, jamais avant (R004, AC-03)', () => {
    expect(code.match(/trackLead\(/g) ?? []).toHaveLength(1);
    const refus = code.indexOf('if (!result.success)');
    expect(refus).toBeGreaterThan(-1);
    expect(code.indexOf('trackLead(')).toBeGreaterThan(refus);
  });
});

describe('server actions', () => {
  it('est le seul fichier autorisé à connaître le jeton partagé', () => {
    const actions = source('lib/actions.ts');
    expect(actions).toMatch(/^'use server';/);
    expect(sansCommentaires(actions)).toContain('process.env.AUTH_TOKEN');
  });

  it('le socle commun du widget ne lit que des variables publiques', () => {
    // `lib/turnstile.ts` est importé par des composants client : une variable serveur lue ici
    // repartirait dans le bundle du navigateur.
    const lectures =
      sansCommentaires(source('lib/turnstile.ts')).match(
        /process\.env\.[A-Z0-9_]+/g,
      ) ?? [];
    expect(lectures).toEqual(['process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY']);
  });
});

/**
 * Chaque formulaire appelle `useFormSubmission` avec son événement de mesure : le type de lead
 * n'est pas un détail, c'est ce que la refonte compare (D-06).
 */
describe('événements de mesure', () => {
  it.each([['components/devis/QuoteForm.tsx', 'devis']])(
    '%s déclare le lead « %s »',
    (fichier, lead) => {
      expect(sansCommentaires(source(fichier))).toContain(
        `useFormSubmission('${lead}')`,
      );
    },
  );
});
