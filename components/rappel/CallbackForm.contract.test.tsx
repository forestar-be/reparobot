/**
 * R006-S02 / AC-03 / AC-06 / D-04 — contrat de « Être rappelé » : route, corps, en-tête Turnstile.
 *
 * Le vrai formulaire, le vrai hook d'envoi, le vrai widget et la vraie server action ; seuls
 * `window.turnstile` et `fetch` sont remplacés. Le corps doit porter `Type de demande: Rappel`,
 * `Robot` et `Lien de la fiche` : c'est ce que lit le serveur pour composer le sujet de l'email
 * (« Demande de rappel — <robot> »).
 */
import { TURNSTILE_HEADER } from '../../lib/turnstile';
import {
  fakeTurnstile,
  fetchMock,
  removeTurnstile,
} from '../forms/contract-helpers';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CallbackForm from './CallbackForm';

const env = vi.hoisted(() => {
  process.env.API_URL = 'https://api.example.test';
  process.env.AUTH_TOKEN = 'jeton-partage';
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = '1x00000000000000000000AA';
  return { api: 'https://api.example.test' };
});

const trackLead = vi.hoisted(() => vi.fn());
vi.mock('../../lib/analytics', () => ({ trackLead }));

const robot = {
  name: 'Husqvarna Automower® 430V NERA',
  slug: 'husqvarna-automower-430v-nera',
  ficheUrl: 'https://www.reparobot.be/robots/husqvarna-automower-430v-nera',
};

async function clickSend() {
  const bouton = screen.getByRole('button', {
    name: /Être rappelé/,
  }) as HTMLButtonElement;
  await waitFor(() => expect(bouton.disabled).toBe(false));
  fireEvent.click(bouton);
}

function fill() {
  fireEvent.change(screen.getByLabelText(/^Nom/), {
    target: { value: ' Jeanne ' },
  });
  fireEvent.change(screen.getByLabelText(/^Téléphone/), {
    target: { value: '0470 11 22 33' },
  });
  fireEvent.click(screen.getByLabelText(/J’accepte que Forestar/));
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  trackLead.mockClear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  removeTurnstile();
});

describe('formulaire « Être rappelé »', () => {
  it('poste sur /submit-form avec le jeton, le type, le robot et le lien de la fiche', async () => {
    fakeTurnstile(true);
    const mock = fetchMock(new Response('ok', { status: 200 }));
    render(<CallbackForm robot={robot} />);

    fill();
    fireEvent.change(screen.getByLabelText(/Votre question/), {
      target: { value: 'Convient-il à ma pente ?' },
    });
    await clickSend();

    await waitFor(() => expect(mock).toHaveBeenCalledTimes(1));
    const [url, init] = mock.mock.calls[0];
    expect(url).toBe(`${env.api}/submit-form`);
    expect(init?.method).toBe('POST');
    const headers = new Headers(init?.headers as HeadersInit);
    expect(headers.get(TURNSTILE_HEADER)).toBe('jeton-turnstile');
    expect(headers.get('authorization')).toBe('Bearer jeton-partage');
    expect(JSON.parse(String(init?.body))).toEqual({
      'Type de demande': 'Rappel',
      Robot: 'Husqvarna Automower® 430V NERA',
      'Lien de la fiche':
        'https://www.reparobot.be/robots/husqvarna-automower-430v-nera',
      Nom: 'Jeanne',
      'Numéro de téléphone': '0470 11 22 33',
      Question: 'Convient-il à ma pente ?',
      'Conditions acceptées': true,
    });

    expect(await screen.findByText(/Demande envoyée/)).toBeTruthy();
    expect(trackLead).toHaveBeenCalledTimes(1);
    expect(trackLead).toHaveBeenCalledWith('rappel');
  });

  it('demande au plus nom, téléphone, question et accord : ni email ni adresse', () => {
    fakeTurnstile(true);
    render(<CallbackForm robot={robot} />);
    expect(screen.getByLabelText(/^Nom/)).toBeTruthy();
    expect(screen.getByLabelText(/^Téléphone/)).toBeTruthy();
    expect(screen.getByLabelText(/Votre question/)).toBeTruthy();
    expect(screen.queryByLabelText(/Email|Adresse/i)).toBeNull();
  });

  it('sans robot : ni `Robot` ni `Lien de la fiche` dans le corps', async () => {
    fakeTurnstile(true);
    const mock = fetchMock(new Response('ok', { status: 200 }));
    render(<CallbackForm robot={null} />);

    fill();
    await clickSend();

    await waitFor(() => expect(mock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(String(mock.mock.calls[0][1]?.body));
    expect(body['Type de demande']).toBe('Rappel');
    expect(body).not.toHaveProperty('Robot');
    expect(body).not.toHaveProperty('Lien de la fiche');
  });

  it("n'envoie rien tant que le widget n'a pas délivré de jeton (AC-04)", () => {
    fakeTurnstile(false);
    const mock = fetchMock(new Response('ok', { status: 200 }));
    render(<CallbackForm robot={robot} />);

    const bouton = screen.getByRole('button', {
      name: /Être rappelé/,
    }) as HTMLButtonElement;
    expect(bouton.disabled).toBe(true);
    fill();
    fireEvent.click(bouton);
    expect(mock).not.toHaveBeenCalled();
  });

  it('un refus Turnstile réarme le widget, garde la saisie et ne compte aucun lead (AC-05/AC-06)', async () => {
    const turnstile = fakeTurnstile(true);
    fetchMock(
      new Response(JSON.stringify({ code: 'turnstile_failed' }), {
        status: 403,
      }),
    );
    render(<CallbackForm robot={robot} />);

    fill();
    await clickSend();

    expect((await screen.findByRole('alert')).textContent).toContain(
      'La vérification anti-robot a échoué',
    );
    expect(turnstile.reset).toHaveBeenCalled();
    expect(
      (screen.getByLabelText(/^Téléphone/) as HTMLInputElement).value,
    ).toBe('0470 11 22 33');
    expect(trackLead).not.toHaveBeenCalled();
  });

  it('une panne du serveur affiche une erreur et ne compte aucun lead', async () => {
    fakeTurnstile(true);
    fetchMock(new Response('boom', { status: 500 }));
    render(<CallbackForm robot={robot} />);

    fill();
    await clickSend();

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Erreur lors de la soumission',
    );
    expect(trackLead).not.toHaveBeenCalled();
  });
});
