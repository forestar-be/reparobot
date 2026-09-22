/**
 * R006-S04 (phase 9.18) — les server actions relaient le jeton et rendent le
 * code de refus.
 *
 * Deux propriétés se prouvent ici, et nulle part ailleurs : l'en-tête
 * `x-turnstile-token` part réellement avec l'appel (sans quoi le garde de R005
 * refuserait tout une fois activé), et le `code` rendu par forestar-server
 * remonte jusqu'au formulaire (sans quoi le client lirait « une erreur est
 * survenue » à la place de « refaites la vérification »).
 *
 * `API_URL` et `AUTH_TOKEN` sont lus **au chargement du module** : chaque cas
 * réimporte donc `actions.ts` après avoir posé l'environnement.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TURNSTILE_HEADER } from './turnstile';

const API_URL = 'https://api.example.test';

type Actions = typeof import('./actions');

async function loadActions(): Promise<Actions> {
  vi.resetModules();
  vi.stubEnv('API_URL', API_URL);
  vi.stubEnv('AUTH_TOKEN', 'jeton-partage');
  return import('./actions');
}

/**
 * Le faux `fetch` déclare ses deux paramètres : sans eux, `mock.calls` est typé
 * comme un tuple vide et `tsc` refuse d'en lire l'URL (TS2493).
 */
function fetchMock(response: Response) {
  const mock = vi.fn(
    async (_url: string, _init?: RequestInit): Promise<Response> => response,
  );
  vi.stubGlobal('fetch', mock);
  return mock;
}

function urlOf(mock: ReturnType<typeof fetchMock>): string | undefined {
  return mock.mock.calls[0]?.[0];
}

function headersOf(mock: ReturnType<typeof fetchMock>): Headers {
  return new Headers(mock.mock.calls[0]?.[1]?.headers as HeadersInit);
}

beforeEach(() => {
  // Les actions journalisent leurs échecs : utile en production, du bruit ici.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('submitServiceForm', () => {
  it("poste sur /submit-form et relaie le jeton dans l'en-tête (D-04)", async () => {
    const mock = fetchMock(new Response('{}', { status: 200 }));
    const { submitServiceForm } = await loadActions();

    const result = await submitServiceForm({ name: 'Jean' }, 'jeton-turnstile');

    expect(result).toEqual({ success: true });
    expect(urlOf(mock)).toBe(`${API_URL}/submit-form`);
    const headers = headersOf(mock);
    expect(headers.get(TURNSTILE_HEADER)).toBe('jeton-turnstile');
    expect(headers.get('authorization')).toBe('Bearer jeton-partage');
  });

  it("ne pose pas d'en-tête vide quand il n'y a pas de jeton", async () => {
    const mock = fetchMock(new Response('{}', { status: 200 }));
    const { submitServiceForm } = await loadActions();

    await submitServiceForm({ name: 'Jean' });

    // Un en-tête vide et un en-tête absent ne disent pas la même chose au
    // garde : « widget muet » n'est pas « pas de widget ».
    expect(headersOf(mock).has(TURNSTILE_HEADER)).toBe(false);
  });

  it('remonte le code de refus du serveur (AC-05)', async () => {
    fetchMock(
      new Response(
        JSON.stringify({
          success: false,
          code: 'turnstile_failed',
          message: 'Vérification anti-robot échouée.',
        }),
        { status: 403 },
      ),
    );
    const { submitServiceForm } = await loadActions();

    const result = await submitServiceForm({ name: 'Jean' }, 'jeton-usé');

    expect(result.success).toBe(false);
    expect(result.code).toBe('turnstile_failed');
  });

  it('remonte `turnstile_unavailable` (503, fail-closed de D-05)', async () => {
    fetchMock(
      new Response(JSON.stringify({ code: 'turnstile_unavailable' }), {
        status: 503,
      }),
    );
    const { submitServiceForm } = await loadActions();

    expect((await submitServiceForm({}, 'jeton')).code).toBe(
      'turnstile_unavailable',
    );
  });

  it("ne fabrique pas de code quand le corps de l'erreur est illisible", async () => {
    fetchMock(new Response('<html>502</html>', { status: 502 }));
    const { submitServiceForm } = await loadActions();

    const result = await submitServiceForm({}, 'jeton');

    expect(result.success).toBe(false);
    expect(result.code).toBeUndefined();
  });
});

describe('submitRobotReservation', () => {
  it('poste sur /submit-form avec le jeton', async () => {
    const mock = fetchMock(new Response('{}', { status: 200 }));
    const { submitRobotReservation } = await loadActions();

    await submitRobotReservation({ robot: 'Ambrogio' }, 'jeton-reservation');

    expect(urlOf(mock)).toBe(`${API_URL}/submit-form`);
    expect(headersOf(mock).get(TURNSTILE_HEADER)).toBe('jeton-reservation');
  });
});

describe('submitQuoteRequest', () => {
  it('relaie le jeton et rend le requestId', async () => {
    const mock = fetchMock(
      new Response(JSON.stringify({ requestId: 42 }), { status: 200 }),
    );
    const { submitQuoteRequest } = await loadActions();

    const result = await submitQuoteRequest(
      { clientEmail: 'test@example.test' } as never,
      'jeton-devis',
    );

    expect(result).toEqual({ success: true, data: { requestId: 42 } });
    expect(urlOf(mock)).toBe(`${API_URL}/quote-request`);
    expect(headersOf(mock).get(TURNSTILE_HEADER)).toBe('jeton-devis');
  });

  it('remonte le code de refus malgré son chemin par exception', async () => {
    fetchMock(
      new Response(
        JSON.stringify({ code: 'turnstile_required', message: 'Manquant.' }),
        { status: 400 },
      ),
    );
    const { submitQuoteRequest } = await loadActions();

    const result = await submitQuoteRequest({} as never);

    expect(result.success).toBe(false);
    expect(result.code).toBe('turnstile_required');
    // Le message du serveur est conservé : il est rédigé pour le client.
    expect(result.error).toBe('Manquant.');
  });
});

describe('configuration absente', () => {
  it('échoue proprement sans API_URL, sans lever', async () => {
    vi.resetModules();
    vi.stubEnv('API_URL', '');
    vi.stubEnv('AUTH_TOKEN', '');
    const mock = fetchMock(new Response('{}', { status: 200 }));
    const { submitServiceForm } = await import('./actions');

    expect(await submitServiceForm({})).toEqual({
      success: false,
      error: 'Configuration manquante',
    });
    expect(mock).not.toHaveBeenCalled();
  });
});
