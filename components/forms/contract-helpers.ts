/**
 * Aides des tests de contrat des formulaires (devis, rappel, passage à l'atelier) : un faux
 * `window.turnstile` et un faux `fetch`. Rien d'autre n'est simulé entre le clic et le réseau.
 */
import { vi } from 'vitest';

export type FakeTurnstile = {
  render: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
};

/** Faux Turnstile : délivre un jeton tout de suite, ou jamais (`deliver: false`). */
export function fakeTurnstile(deliver: boolean): FakeTurnstile {
  const api: FakeTurnstile = {
    render: vi.fn(
      (_container: HTMLElement, options: { callback: (t: string) => void }) => {
        if (deliver) options.callback('jeton-turnstile');
        return 'widget-1';
      },
    ),
    reset: vi.fn(),
    remove: vi.fn(),
  };
  (window as unknown as { turnstile?: FakeTurnstile }).turnstile = api;
  return api;
}

export function removeTurnstile() {
  delete (window as unknown as { turnstile?: FakeTurnstile }).turnstile;
}

export function fetchMock(response: Response) {
  const mock = vi.fn(async (_url: string, _init?: RequestInit) => response);
  vi.stubGlobal('fetch', mock);
  return mock;
}
