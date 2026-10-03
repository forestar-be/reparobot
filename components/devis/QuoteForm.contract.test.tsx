/**
 * R006-S01 / AC-06 / D-04 — contrat du formulaire de devis : la route appelée, le corps et
 * l'en-tête Turnstile.
 *
 * Rien n'est simulé entre le clic et le réseau : le vrai formulaire, le vrai hook d'envoi, le
 * vrai widget (devant un faux `window.turnstile` qui lève comme le vrai) et la vraie server
 * action, dont seul le `fetch` est remplacé. Un envoi qui perdrait le jeton, changerait de route
 * ou renommerait un champ du corps échouerait ici — et c'est ce que `tsc` ne voit pas.
 */
import { quoteContextFor } from '../../lib/quote';
import type { Robot } from '../../lib/robots';
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
import QuoteForm from './QuoteForm';

const env = vi.hoisted(() => {
  process.env.API_URL = 'https://api.example.test';
  process.env.AUTH_TOKEN = 'jeton-partage';
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = '1x00000000000000000000AA';
  return { api: 'https://api.example.test' };
});

const trackLead = vi.hoisted(() => vi.fn());
vi.mock('../../lib/analytics', () => ({ trackLead }));

const robot: Robot = {
  id: 'r2',
  inventoryId: 2,
  slug: 'husqvarna-automower-305',
  isFeatured: false,
  name: 'Husqvarna Automower® 305',
  category: 'wired',
  description: '',
  image: '/images/robots/default.webp',
  maxSurface: 600,
  maxSlope: 40,
  price: 1199,
  installationPrice: 200,
  promotion: null,
};

const accessories = {
  plugins: [],
  antennas: [
    {
      id: 17,
      name: 'Antenne rs1',
      category: 'ANTENNA' as const,
      sellingPrice: 299,
    },
  ],
  shelters: [],
};

const context = quoteContextFor(
  robot,
  { placement: 200, wirePerMeter: 1.3, antennaSupport: 50 },
  accessories.antennas,
);

function renderForm() {
  return render(
    <QuoteForm robot={robot} context={context} accessories={accessories} />,
  );
}

const NBSP = String.fromCharCode(160);
const euro = (n: string) => `${n}${NBSP}€`;

/** Le jeton arrive de façon asynchrone (le widget se monte après le chargement du script). */
async function clickSend() {
  const bouton = screen.getByRole('button', {
    name: /Recevoir mon devis/,
  }) as HTMLButtonElement;
  await waitFor(() => expect(bouton.disabled).toBe(false));
  fireEvent.click(bouton);
}

function fillRequired() {
  fireEvent.change(screen.getByLabelText(/^Prénom/), {
    target: { value: 'Jean' },
  });
  fireEvent.change(screen.getByLabelText(/^Nom/), {
    target: { value: 'Dupont' },
  });
  fireEvent.change(screen.getByLabelText(/^Email/), {
    target: { value: 'jean@example.test' },
  });
  fireEvent.click(screen.getByLabelText(/J’accepte que Forestar/));
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  window.scrollTo = vi.fn();
  trackLead.mockClear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  removeTurnstile();
});

describe('formulaire de devis', () => {
  it('poste sur /quote-request avec le jeton en en-tête et le corps attendu', async () => {
    fakeTurnstile(true);
    const mock = fetchMock(
      new Response(JSON.stringify({ requestId: 42 }), { status: 200 }),
    );
    renderForm();

    fillRequired();
    fireEvent.click(screen.getByLabelText(/Installation professionnelle/));
    fireEvent.click(screen.getByLabelText(/Antenne rs1/));
    fireEvent.click(screen.getByLabelText(/Câble périphérique/));
    fireEvent.change(screen.getByLabelText(/Longueur du câble/), {
      target: { value: '120' },
    });
    fireEvent.click(screen.getByLabelText(/Support d’antenne/));
    fireEvent.change(screen.getByLabelText(/^Code postal/), {
      target: { value: '7090' },
    });
    fireEvent.change(screen.getByLabelText(/^Ville/), {
      target: { value: 'Braine-le-Comte' },
    });
    await clickSend();

    await waitFor(() => expect(mock).toHaveBeenCalledTimes(1));
    const [url, init] = mock.mock.calls[0];
    expect(url).toBe(`${env.api}/quote-request`);
    expect(init?.method).toBe('POST');
    const headers = new Headers(init?.headers as HeadersInit);
    expect(headers.get(TURNSTILE_HEADER)).toBe('jeton-turnstile');
    expect(headers.get('authorization')).toBe('Bearer jeton-partage');
    expect(JSON.parse(String(init?.body))).toMatchObject({
      clientFirstName: 'Jean',
      clientLastName: 'Dupont',
      clientEmail: 'jean@example.test',
      clientCity: '7090 Braine-le-Comte',
      robotInventoryId: 2,
      antennaInventoryId: 17,
      pluginInventoryId: null,
      shelterInventoryId: null,
      hasWire: true,
      wireLength: 120,
      hasAntennaSupport: true,
      hasPlacement: true,
      needsInstaller: true,
    });

    // Succès : message, numéro de demande, et un seul `generate_lead` « devis ».
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /Votre devis arrive par email/,
      }),
    ).toBeTruthy();
    expect(screen.getByText(/#42/)).toBeTruthy();
    expect(trackLead).toHaveBeenCalledTimes(1);
    expect(trackLead).toHaveBeenCalledWith('devis');
  });

  it("l'installation n'est pas cochée par défaut et le devis part sans placement (D-14)", async () => {
    fakeTurnstile(true);
    const mock = fetchMock(new Response('{"requestId":1}', { status: 200 }));
    renderForm();

    expect(
      (
        screen.getByLabelText(
          /Installation professionnelle/,
        ) as HTMLInputElement
      ).checked,
    ).toBe(false);
    expect(screen.getByText('Installation non comprise.')).toBeTruthy();
    fillRequired();
    await clickSend();

    await waitFor(() => expect(mock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(String(mock.mock.calls[0][1]?.body))).toMatchObject({
      hasPlacement: false,
      needsInstaller: false,
      hasWire: false,
    });
  });

  it("le récapitulatif suit les choix : total et mention de l'installation", () => {
    fakeTurnstile(true);
    renderForm();
    const recap = screen.getByRole('complementary', { name: /récapitulatif/i });
    expect(recap.textContent).toContain('Total TVAC');
    expect(recap.textContent).toContain(euro('1199'));

    fireEvent.click(screen.getByLabelText(/Installation professionnelle/));
    expect(recap.textContent).toContain(euro('1399'));
    expect(recap.textContent).toContain(
      `Installation comprise : ${euro('200')}.`,
    );
  });

  it("n'envoie rien tant que le widget n'a pas délivré de jeton (AC-04)", () => {
    fakeTurnstile(false);
    const mock = fetchMock(new Response('{}', { status: 200 }));
    renderForm();

    const bouton = screen.getByRole('button', {
      name: /Recevoir mon devis/,
    }) as HTMLButtonElement;
    expect(bouton.disabled).toBe(true);
    fillRequired();
    fireEvent.click(bouton);
    expect(mock).not.toHaveBeenCalled();
  });

  it('un refus Turnstile réarme le widget, garde la saisie et ne compte aucun lead (AC-05/AC-06)', async () => {
    const turnstile = fakeTurnstile(true);
    fetchMock(
      new Response(
        JSON.stringify({
          code: 'turnstile_failed',
          message: 'Vérification échouée.',
        }),
        {
          status: 403,
        },
      ),
    );
    renderForm();

    fillRequired();
    await clickSend();

    const alerte = await screen.findByRole('alert');
    expect(alerte.textContent).toContain('La vérification anti-robot a échoué');
    expect(turnstile.reset).toHaveBeenCalled();
    expect((screen.getByLabelText(/^Prénom/) as HTMLInputElement).value).toBe(
      'Jean',
    );
    expect(trackLead).not.toHaveBeenCalled();
  });

  it("une erreur du serveur s'affiche et ne compte aucun lead", async () => {
    fakeTurnstile(true);
    fetchMock(
      new Response(JSON.stringify({ message: 'Robot sélectionné invalide' }), {
        status: 400,
      }),
    );
    renderForm();

    fillRequired();
    await clickSend();

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Robot sélectionné invalide',
    );
    expect(trackLead).not.toHaveBeenCalled();
  });
});
