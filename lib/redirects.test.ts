/**
 * Redirections de `next.config.js` : l'ancienne adresse « Être rappelé » (D-25) mène au formulaire
 * « Être recontacté » en 308, et les anciennes adresses d'avant la refonte gardent leur code.
 */
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

type Redirect = {
  source: string;
  destination: string;
  permanent?: boolean;
  statusCode?: number;
};

async function redirects(): Promise<Redirect[]> {
  const config = createRequire(import.meta.url)('../next.config.js') as {
    redirects: () => Promise<Redirect[]>;
  };
  return config.redirects();
}

describe('redirections', () => {
  it('/rappel redirige en 308 (permanent) vers /etre-recontacte', async () => {
    const found = (await redirects()).find((r) => r.source === '/rappel');
    expect(found).toBeDefined();
    expect(found?.destination).toBe('/etre-recontacte');
    // `permanent: true` répond 308 ; un `statusCode` explicite le contredirait
    expect(found?.permanent).toBe(true);
    expect(found?.statusCode).toBeUndefined();
    // aucune requête en dur dans la destination : Next ajoute celle de la demande (`?robot=`)
    expect(found?.destination).not.toContain('?');
  });

  it('garde les redirections existantes', async () => {
    const list = await redirects();
    expect(list.find((r) => r.source === '/devis/demande')?.destination).toBe(
      '/devis',
    );
    expect(list.find((r) => r.source === '/contact')?.statusCode).toBe(301);
  });
});
