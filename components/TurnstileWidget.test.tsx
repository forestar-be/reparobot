/**
 * R006-S02 (phase 9.18) — le widget de reparobot.be.
 *
 * Le cas décisif est `refuse-un-ready-obligeant` : sur le shop, onze tests
 * verts montaient un faux `turnstile.ready()` complaisant, et le widget ne
 * s'est jamais rendu dans un vrai navigateur — `api.js` chargé en
 * `async`/`defer` fait lever `ready()`. Les faux de ce fichier lèvent donc
 * comme le vrai : un composant qui appellerait `ready()` échouerait ici.
 */
import { TURNSTILE_FIELD, TURNSTILE_SCRIPT_URL } from '../lib/turnstile';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TurnstileWidget, {
  resetTurnstileScriptCacheForTests,
} from './TurnstileWidget';

type Callbacks = {
  callback: (token: string) => void;
  'expired-callback': () => void;
  'timeout-callback': () => void;
  'error-callback': () => void;
};

type FakeApi = {
  render: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  ready: () => void;
  options: () => Record<string, unknown> & Callbacks;
};

/**
 * Un faux `window.turnstile` fidèle au vrai : `ready()` lève, exactement comme
 * le script chargé en `async`/`defer`.
 */
function fakeApi(): FakeApi {
  const rendered: (Record<string, unknown> & Callbacks)[] = [];
  const api = {
    render: vi.fn((_container: HTMLElement, options: never) => {
      rendered.push(options as unknown as Record<string, unknown> & Callbacks);
      return `widget-${rendered.length}`;
    }),
    reset: vi.fn(),
    remove: vi.fn(),
    ready: () => {
      throw new Error(
        'Remove async/defer from the Turnstile api.js script tag before using turnstile.ready()',
      );
    },
    options: () => rendered[rendered.length - 1],
  };
  (window as unknown as { turnstile: unknown }).turnstile = api;
  return api;
}

afterEach(() => {
  // Sans `globals: true`, le nettoyage automatique de RTL n'est pas branché :
  // le DOM d'un cas survivrait au suivant et les requêtes `screen` mentiraient.
  cleanup();
  resetTurnstileScriptCacheForTests();
  delete (window as unknown as { turnstile?: unknown }).turnstile;
  document.head.querySelectorAll('script').forEach((s) => s.remove());
});

describe('TurnstileWidget', () => {
  it('ne rend rien sans sitekey — le développement local ne change pas (AC-03)', () => {
    const { container } = render(<TurnstileWidget siteKey="" />);
    expect(container.innerHTML).toBe('');
  });

  it('rend le widget et publie le jeton dans le champ caché et par onToken', async () => {
    const api = fakeApi();
    const onToken = vi.fn();
    render(
      <TurnstileWidget siteKey="1x000" action="service" onToken={onToken} />,
    );

    await waitFor(() => expect(api.render).toHaveBeenCalledTimes(1));
    const options = api.options();
    expect(options.sitekey).toBe('1x000');
    expect(options.action).toBe('service');
    // Le champ caché est rendu par React : le script ne doit pas en créer un
    // second du même nom dans le formulaire.
    expect(options['response-field']).toBe(false);

    const field = () =>
      document.querySelector<HTMLInputElement>(
        `input[name="${TURNSTILE_FIELD}"]`,
      );
    expect(field()?.value).toBe('');

    await act(async () => options.callback('jeton-1'));
    expect(onToken).toHaveBeenLastCalledWith('jeton-1');
    expect(field()?.value).toBe('jeton-1');
  });

  it("n'appelle jamais `ready()`, qui lève sur un script async/defer", async () => {
    const api = fakeApi();
    const ready = api.ready;
    // Le faux lève comme le vrai : si le composant l'appelait, le rendu
    // n'aurait pas lieu — c'est le défaut mesuré au navigateur sur le shop.
    expect(() => ready()).toThrow(/Remove async\/defer/);
    render(<TurnstileWidget siteKey="1x000" />);
    await waitFor(() => expect(api.render).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('charge le script une seule fois, en `render=explicit`', async () => {
    const onToken = vi.fn();
    render(<TurnstileWidget siteKey="1x000" onToken={onToken} />);
    render(<TurnstileWidget siteKey="1x000" onToken={onToken} />);

    const scripts = () =>
      Array.from(document.head.querySelectorAll('script')).filter((s) =>
        s.src.includes('challenges.cloudflare.com'),
      );
    await waitFor(() => expect(scripts()).toHaveLength(1));
    expect(scripts()[0].src).toBe(TURNSTILE_SCRIPT_URL);

    // Le script se résout : les deux widgets se montent alors.
    const api = fakeApi();
    await act(async () => {
      scripts()[0].dispatchEvent(new Event('load'));
    });
    await waitFor(() => expect(api.render).toHaveBeenCalledTimes(2));
  });

  it('vide le jeton à expiration et réarme le widget', async () => {
    const api = fakeApi();
    const onToken = vi.fn();
    render(<TurnstileWidget siteKey="1x000" onToken={onToken} />);
    await waitFor(() => expect(api.render).toHaveBeenCalledTimes(1));

    await act(async () => api.options().callback('jeton-1'));
    await act(async () => api.options()['expired-callback']());

    expect(onToken).toHaveBeenLastCalledWith('');
    expect(api.reset).toHaveBeenCalledWith('widget-1');
  });

  it('affiche un repli lisible sur `error-callback`, sans réarmer en boucle', async () => {
    const api = fakeApi();
    render(<TurnstileWidget siteKey="1x000" />);
    await waitFor(() => expect(api.render).toHaveBeenCalledTimes(1));

    await act(async () => api.options()['error-callback']());

    expect(screen.getByRole('status').textContent).toMatch(
      /vérification anti-robot/i,
    );
    // Volontairement aucun `reset` ici : marteler Cloudflare sur une erreur
    // persistante (domaine non autorisé) n'aide personne.
    expect(api.reset).not.toHaveBeenCalled();
  });

  it('réarme le widget quand le formulaire incrémente `resetSignal` (AC-06)', async () => {
    const api = fakeApi();
    const onToken = vi.fn();
    const { rerender } = render(
      <TurnstileWidget siteKey="1x000" onToken={onToken} resetSignal={0} />,
    );
    await waitFor(() => expect(api.render).toHaveBeenCalledTimes(1));
    await act(async () => api.options().callback('jeton-1'));

    await act(async () => {
      rerender(
        <TurnstileWidget siteKey="1x000" onToken={onToken} resetSignal={1} />,
      );
    });

    expect(onToken).toHaveBeenLastCalledWith('');
    expect(api.reset).toHaveBeenCalledWith('widget-1');
    // Un seul rendu Cloudflare : le réarmement réutilise le widget existant.
    expect(api.render).toHaveBeenCalledTimes(1);
  });

  it('signale une indisponibilité quand le script ne se charge pas', async () => {
    render(<TurnstileWidget siteKey="1x000" />);
    const script = document.head.querySelector('script');
    expect(script).not.toBeNull();
    await act(async () => {
      script?.dispatchEvent(new Event('error'));
    });
    expect(screen.getByRole('status')).toBeTruthy();
  });
});
