/**
 * R007-S02 / AC-03 / AC-05 / D-04 — contrat de « Réserver un passage » : route, corps, en-tête
 * Turnstile, et options chiffrées.
 *
 * Le vrai formulaire, le vrai hook d'envoi, le vrai widget et la vraie server action ; seuls
 * `window.turnstile` et `fetch` sont remplacés. Le corps doit porter `Type de demande` et
 * `Marque` : ce sont les clés dont le serveur tire le sujet « Demande d'entretien — <marque> ».
 */
import type { ServiceOffer } from '../../lib/service-offers';
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
import BookingForm from './BookingForm';
import { BookingProvider, PresetLink } from './BookingProvider';

const env = vi.hoisted(() => {
  process.env.API_URL = 'https://api.example.test';
  process.env.AUTH_TOKEN = 'jeton-partage';
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = '1x00000000000000000000AA';
  return { api: 'https://api.example.test' };
});

const trackLead = vi.hoisted(() => vi.fn());
vi.mock('../../lib/analytics', () => ({ trackLead }));

const offer = (patch: Partial<ServiceOffer>): ServiceOffer => ({
  id: 0,
  service: 'MAINTENANCE',
  kind: 'OPTION',
  label: '',
  description: null,
  price: 0,
  unit: null,
  exclusiveGroup: null,
  order: 0,
  ...patch,
});

const OFFERS: ServiceOffer[] = [
  offer({ id: 1, kind: 'BASE', label: 'Entretien annuel', price: 107 }),
  offer({
    id: 2,
    label: 'Enlèvement 30 km',
    price: 40,
    exclusiveGroup: 'transport',
    order: 1,
  }),
  offer({
    id: 3,
    label: 'Dépose en magasin',
    price: 0,
    exclusiveGroup: 'transport',
    order: 2,
  }),
  offer({ id: 4, label: 'Hivernage tout l’hiver', price: 30, order: 3 }),
  offer({
    id: 6,
    label: 'Lames classiques',
    price: 7,
    exclusiveGroup: 'lames',
    order: 5,
  }),
  offer({
    id: 7,
    label: 'Lames carbure',
    price: 10,
    exclusiveGroup: 'lames',
    order: 6,
  }),
  offer({
    id: 9,
    service: 'REPAIR',
    kind: 'BASE',
    label: 'Réparation',
    price: null,
  }),
  offer({
    id: 10,
    service: 'REPAIR',
    label: 'Enlèvement et redémarrage',
    price: 80,
    order: 1,
  }),
  offer({
    id: 11,
    service: 'INSTALLATION_HELP',
    kind: 'BASE',
    label: 'Problème d’installation',
    price: null,
  }),
];

const NBSP = String.fromCharCode(160);
const euro = (n: string) => `${n}${NBSP}€`;

async function clickSend() {
  const bouton = screen.getByRole('button', {
    name: /Réserver un passage/,
  }) as HTMLButtonElement;
  await waitFor(() => expect(bouton.disabled).toBe(false));
  fireEvent.click(bouton);
}

function fillRequired(brand = 'Gardena') {
  fireEvent.change(screen.getByLabelText(/^Prénom/), {
    target: { value: 'Jean' },
  });
  fireEvent.change(screen.getByLabelText(/^Nom/), {
    target: { value: 'Dupont' },
  });
  fireEvent.change(screen.getByLabelText(/^Téléphone/), {
    target: { value: '0470 00 00 00' },
  });
  fireEvent.change(screen.getByLabelText(/^Email/), {
    target: { value: 'jean@example.test' },
  });
  fireEvent.change(screen.getByLabelText(/^Marque du robot/), {
    target: { value: brand },
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

describe('formulaire « Réserver un passage »', () => {
  it('poste sur /submit-form avec le jeton, le type, la marque et les options chiffrées', async () => {
    fakeTurnstile(true);
    const mock = fetchMock(new Response('ok', { status: 200 }));
    render(<BookingForm offers={OFFERS} />);

    fillRequired();
    fireEvent.change(screen.getByLabelText(/^Modèle/), {
      target: { value: 'Sileno' },
    });
    fireEvent.click(screen.getByLabelText(/Hivernage/));
    fireEvent.change(screen.getByLabelText('Transport'), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText('Lames'), {
      target: { value: '7' },
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
      'Type de demande': 'Entretien',
      Marque: 'Gardena',
      Modèle: 'Sileno',
      Forfait: `Entretien annuel — ${euro('107')}`,
      'Hivernage tout l’hiver': `+ ${euro('30')}`,
      'Enlèvement 30 km': `+ ${euro('40')}`,
      'Lames carbure': `+ ${euro('10')}`,
      'Total estimé': euro('187'),
      'Nom de famille': 'Dupont',
      Prénom: 'Jean',
      'Adresse e-mail': 'jean@example.test',
      'Numéro de téléphone': '0470 00 00 00',
      'Conditions acceptées': true,
    });

    expect(await screen.findByText(/Demande envoyée/)).toBeTruthy();
    expect(trackLead).toHaveBeenCalledTimes(1);
    expect(trackLead).toHaveBeenCalledWith('entretien');
  });

  it('accepte n’importe quelle marque : champ libre avec suggestions dont Husqvarna (AC-02)', () => {
    fakeTurnstile(true);
    const { container } = render(<BookingForm offers={OFFERS} />);
    const champ = screen.getByLabelText(/^Marque du robot/) as HTMLInputElement;
    expect(champ.tagName).toBe('INPUT');
    const liste = container.querySelector(
      `datalist#${champ.getAttribute('list')}`,
    );
    const suggestions = Array.from(liste!.querySelectorAll('option')).map((o) =>
      o.getAttribute('value'),
    );
    expect(suggestions).toContain('Husqvarna');
    fireEvent.change(champ, { target: { value: 'Marque inconnue 3000' } });
    expect(champ.value).toBe('Marque inconnue 3000');
  });

  it('le type d’intervention change le service : Réparation = sur devis et ses options', async () => {
    fakeTurnstile(true);
    const mock = fetchMock(new Response('ok', { status: 200 }));
    render(<BookingForm offers={OFFERS} />);

    fillRequired('Worx');
    fireEvent.change(screen.getByLabelText(/Votre besoin/), {
      target: { value: '1' },
    });
    expect(screen.queryByLabelText(/Hivernage/)).toBeNull();
    fireEvent.click(screen.getByLabelText(/Enlèvement et redémarrage/));
    expect(document.body.textContent).toContain(`${euro('80')} + devis`);
    await clickSend();

    await waitFor(() => expect(mock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(String(mock.mock.calls[0][1]?.body));
    expect(body['Type de demande']).toBe('Réparation');
    expect(body.Marque).toBe('Worx');
    expect(body.Forfait).toBe('Réparation — sur devis');
    expect(body['Enlèvement et redémarrage']).toBe(`+ ${euro('80')}`);
    expect(trackLead).toHaveBeenCalledWith('entretien');
  });

  it('le total suit les choix : 107 €, puis hivernage, puis un choix exclusif remplacé', () => {
    fakeTurnstile(true);
    render(<BookingForm offers={OFFERS} />);
    const total = () =>
      document.querySelector('[aria-live=polite] strong')!.textContent;
    expect(total()).toBe(euro('107'));
    fireEvent.click(screen.getByLabelText(/Hivernage/));
    expect(total()).toBe(euro('137'));
    fireEvent.change(screen.getByLabelText('Lames'), {
      target: { value: '6' },
    });
    expect(total()).toBe(euro('144'));
    fireEvent.change(screen.getByLabelText('Lames'), {
      target: { value: '7' },
    });
    expect(total()).toBe(euro('147'));
  });

  it('« Réserver un passage » d’une carte présélectionne l’entretien avec hivernage', () => {
    fakeTurnstile(true);
    render(
      <BookingProvider>
        <PresetLink kind="winter">Réserver un passage</PresetLink>
        <BookingForm offers={OFFERS} />
      </BookingProvider>,
    );
    fireEvent.click(screen.getByRole('link', { name: /Réserver un passage/ }));
    expect(
      (screen.getByLabelText(/Hivernage/) as HTMLInputElement).checked,
    ).toBe(true);
    expect(
      document.querySelector('[aria-live=polite] strong')!.textContent,
    ).toBe(euro('137'));
  });

  it('la date souhaitée est au plus tôt demain (J+1)', async () => {
    fakeTurnstile(true);
    render(<BookingForm offers={OFFERS} />);
    const date = screen.getByLabelText(/^Date souhaitée/) as HTMLInputElement;
    await waitFor(() => expect(date.min).not.toBe(''));
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);
    const attendu = `${demain.getFullYear()}-${String(demain.getMonth() + 1).padStart(2, '0')}-${String(demain.getDate()).padStart(2, '0')}`;
    expect(date.min).toBe(attendu);
  });

  it('sans forfaits (API absente) : le formulaire reste utilisable, tout est sur devis', async () => {
    fakeTurnstile(true);
    const mock = fetchMock(new Response('ok', { status: 200 }));
    render(<BookingForm offers={[]} />);

    expect(document.body.textContent).toContain('Sur devis');
    expect(screen.queryByText('Services supplémentaires')).toBeNull();
    fillRequired();
    await clickSend();

    await waitFor(() => expect(mock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(String(mock.mock.calls[0][1]?.body)).Forfait).toBe(
      'Entretien annuel — sur devis',
    );
  });

  it("n'envoie rien tant que le widget n'a pas délivré de jeton (AC-04)", () => {
    fakeTurnstile(false);
    const mock = fetchMock(new Response('ok', { status: 200 }));
    render(<BookingForm offers={OFFERS} />);

    const bouton = screen.getByRole('button', {
      name: /Réserver un passage/,
    }) as HTMLButtonElement;
    expect(bouton.disabled).toBe(true);
    fillRequired();
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
    render(<BookingForm offers={OFFERS} />);

    fillRequired();
    await clickSend();

    expect((await screen.findByRole('alert')).textContent).toContain(
      'La vérification anti-robot a échoué',
    );
    expect(turnstile.reset).toHaveBeenCalled();
    expect(
      (screen.getByLabelText(/^Marque du robot/) as HTMLInputElement).value,
    ).toBe('Gardena');
    expect(trackLead).not.toHaveBeenCalled();
  });
});
