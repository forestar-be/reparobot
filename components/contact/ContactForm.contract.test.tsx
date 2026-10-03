/**
 * D-25 — contrat de « Être recontacté » : route, corps, en-tête Turnstile, canal obligatoire.
 *
 * Le vrai formulaire, le vrai hook d'envoi, le vrai widget et la vraie server action ; seuls
 * `window.turnstile` et `fetch` sont remplacés. Le corps doit porter `Type de demande: Contact`,
 * `Robot`, `Lien de la fiche` et `Recontacter par` : c'est ce que lit le serveur pour composer le
 * sujet de l'email (« Demande de contact — <robot> »).
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
import ContactForm from './ContactForm';

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

const NBSP = String.fromCharCode(160);

async function clickSend() {
  const bouton = screen.getByRole('button', {
    name: /Être recontacté/,
  }) as HTMLButtonElement;
  await waitFor(() => expect(bouton.disabled).toBe(false));
  fireEvent.click(bouton);
}

/** Le champ de saisie d'un libellé (les boutons radio Téléphone/Email portent les mêmes mots). */
const field = (label: RegExp): HTMLInputElement => {
  const found = screen
    .getAllByLabelText(label)
    .filter((el) => el.getAttribute('type') !== 'radio');
  expect(found).toHaveLength(1);
  return found[0] as HTMLInputElement;
};

const change = (label: RegExp, value: string) =>
  fireEvent.change(field(label), { target: { value } });

function accept() {
  fireEvent.click(screen.getByLabelText(/J’accepte que Forestar/));
}

/** Canal Téléphone (par défaut) : nom, téléphone et consentement. */
function fillPhone() {
  change(/^Nom/, ' Jeanne ');
  change(/^Téléphone/, '0470 11 22 33');
  accept();
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

describe('formulaire « Être recontacté » — contrat d’envoi', () => {
  it('poste sur /submit-form avec le jeton, le type Contact, le robot, le lien et le canal', async () => {
    fakeTurnstile(true);
    const mock = fetchMock(new Response('ok', { status: 200 }));
    render(<ContactForm robot={robot} maintenancePrice={107} />);

    fillPhone();
    change(/^Prénom/, 'Jeanne-Marie');
    change(/^Email/, 'jeanne@example.be');
    change(/^Adresse/, '12 rue des Tilleuls');
    change(/^Code postal/, '7090');
    change(/^Ville/, 'Braine-le-Comte');
    change(/^Date d’installation/, '2099-03-14');
    fireEvent.click(screen.getByLabelText(/entretien annuel/));
    change(/Votre question/, 'Convient-il à ma pente ?');
    await clickSend();

    await waitFor(() => expect(mock).toHaveBeenCalledTimes(1));
    const [url, init] = mock.mock.calls[0];
    expect(url).toBe(`${env.api}/submit-form`);
    expect(init?.method).toBe('POST');
    const headers = new Headers(init?.headers as HeadersInit);
    expect(headers.get(TURNSTILE_HEADER)).toBe('jeton-turnstile');
    expect(headers.get('authorization')).toBe('Bearer jeton-partage');
    expect(JSON.parse(String(init?.body))).toEqual({
      'Type de demande': 'Contact',
      Robot: 'Husqvarna Automower® 430V NERA',
      'Lien de la fiche':
        'https://www.reparobot.be/robots/husqvarna-automower-430v-nera',
      'Recontacter par': 'Téléphone',
      Nom: 'Jeanne',
      Prénom: 'Jeanne-Marie',
      'Adresse e-mail': 'jeanne@example.be',
      'Numéro de téléphone': '0470 11 22 33',
      Adresse: '12 rue des Tilleuls',
      'Code postal': '7090',
      Ville: 'Braine-le-Comte',
      "Date d'installation souhaitée": '14/03/2099',
      'Entretien annuel': `Oui (107${NBSP}€)`,
      Message: 'Convient-il à ma pente ?',
      'Conditions acceptées': true,
    });

    expect(await screen.findByText(/Demande envoyée/)).toBeTruthy();
    expect(trackLead).toHaveBeenCalledTimes(1);
    expect(trackLead).toHaveBeenCalledWith('contact');
  });

  it('canal Email : `Recontacter par: Email`, et les champs vides sont omis', async () => {
    fakeTurnstile(true);
    const mock = fetchMock(new Response('ok', { status: 200 }));
    render(<ContactForm robot={robot} maintenancePrice={107} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Email' }));
    change(/^Nom/, 'Jeanne');
    change(/^Email/, 'jeanne@example.be');
    accept();
    await clickSend();

    await waitFor(() => expect(mock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(String(mock.mock.calls[0][1]?.body))).toEqual({
      'Type de demande': 'Contact',
      Robot: 'Husqvarna Automower® 430V NERA',
      'Lien de la fiche':
        'https://www.reparobot.be/robots/husqvarna-automower-430v-nera',
      'Recontacter par': 'Email',
      Nom: 'Jeanne',
      'Adresse e-mail': 'jeanne@example.be',
      'Conditions acceptées': true,
    });
  });

  it('sans robot : ni `Robot` ni `Lien de la fiche` dans le corps', async () => {
    fakeTurnstile(true);
    const mock = fetchMock(new Response('ok', { status: 200 }));
    render(<ContactForm robot={null} maintenancePrice={null} />);

    fillPhone();
    await clickSend();

    await waitFor(() => expect(mock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(String(mock.mock.calls[0][1]?.body));
    expect(body['Type de demande']).toBe('Contact');
    expect(body['Recontacter par']).toBe('Téléphone');
    expect(body).not.toHaveProperty('Robot');
    expect(body).not.toHaveProperty('Lien de la fiche');
  });

  it("n'envoie rien tant que le widget n'a pas délivré de jeton (AC-04)", () => {
    fakeTurnstile(false);
    const mock = fetchMock(new Response('ok', { status: 200 }));
    render(<ContactForm robot={robot} maintenancePrice={107} />);

    const bouton = screen.getByRole('button', {
      name: /Être recontacté/,
    }) as HTMLButtonElement;
    expect(bouton.disabled).toBe(true);
    fillPhone();
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
    render(<ContactForm robot={robot} maintenancePrice={107} />);

    fillPhone();
    await clickSend();

    expect((await screen.findByRole('alert')).textContent).toContain(
      'La vérification anti-robot a échoué',
    );
    expect(turnstile.reset).toHaveBeenCalled();
    expect(field(/^Téléphone/).value).toBe('0470 11 22 33');
    expect(trackLead).not.toHaveBeenCalled();
  });

  it('une panne du serveur affiche une erreur et ne compte aucun lead', async () => {
    fakeTurnstile(true);
    fetchMock(new Response('boom', { status: 500 }));
    render(<ContactForm robot={robot} maintenancePrice={107} />);

    fillPhone();
    await clickSend();

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Erreur lors de la soumission',
    );
    expect(trackLead).not.toHaveBeenCalled();
  });
});

describe('formulaire « Être recontacté » — champs et canal', () => {
  it('propose Téléphone (par défaut) et Email en boutons radio', () => {
    fakeTurnstile(true);
    render(<ContactForm robot={robot} maintenancePrice={107} />);
    const groupe = screen.getByRole('group', {
      name: 'Comment préférez-vous être recontacté ?',
    });
    const radios = Array.from(
      groupe.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
    );
    expect(radios.map((r) => [r.value, r.checked])).toEqual([
      ['Téléphone', true],
      ['Email', false],
    ]);
  });

  it('reprend les champs de l’ancien formulaire de réservation', () => {
    fakeTurnstile(true);
    render(<ContactForm robot={robot} maintenancePrice={107} />);
    for (const label of [
      /^Nom/,
      /^Prénom/,
      /^Email/,
      /^Téléphone/,
      /^Adresse/,
      /^Code postal/,
      /^Ville/,
      /^Date d’installation souhaitée/,
      /Votre question/,
    ]) {
      expect(field(label)).toBeTruthy();
    }
    expect(screen.getByText(/utile pour préparer l’installation/)).toBeTruthy();
    const date = field(/^Date d’installation/);
    // J+1 minimum, posé côté navigateur
    return waitFor(() => expect(date.min).toMatch(/^\d{4}-\d{2}-\d{2}$/));
  });

  it('la case d’entretien annuel porte le prix du forfait, et disparaît sans forfait', () => {
    fakeTurnstile(true);
    const { unmount } = render(
      <ContactForm robot={robot} maintenancePrice={107} />,
    );
    expect(
      screen.getByLabelText(
        /Je suis intéressé par l’entretien annuel \(107\s€\)/,
      ),
    ).toBeTruthy();
    unmount();
    render(<ContactForm robot={robot} maintenancePrice={null} />);
    expect(screen.queryByLabelText(/entretien annuel/)).toBeNull();
  });

  it('canal Téléphone : un téléphone vide bloque l’envoi, l’email reste facultatif', async () => {
    fakeTurnstile(true);
    const mock = fetchMock(new Response('ok', { status: 200 }));
    render(<ContactForm robot={robot} maintenancePrice={107} />);

    change(/^Nom/, 'Jeanne');
    accept();
    await clickSend();

    expect(
      await screen.findByText('Indiquez votre numéro de téléphone.'),
    ).toBeTruthy();
    expect(screen.queryByText(/Indiquez votre adresse email/)).toBeNull();
    expect(field(/^Téléphone/).getAttribute('aria-invalid')).toBe('true');
    expect(mock).not.toHaveBeenCalled();
    expect(trackLead).not.toHaveBeenCalled();
  });

  it('canal Email : un email vide bloque l’envoi, le téléphone reste facultatif', async () => {
    fakeTurnstile(true);
    const mock = fetchMock(new Response('ok', { status: 200 }));
    render(<ContactForm robot={robot} maintenancePrice={107} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Email' }));
    change(/^Nom/, 'Jeanne');
    accept();
    await clickSend();

    expect(
      await screen.findByText('Indiquez votre adresse email.'),
    ).toBeTruthy();
    expect(screen.queryByText(/Indiquez votre numéro/)).toBeNull();
    expect(mock).not.toHaveBeenCalled();
  });

  it('canal Email : un email au format invalide est refusé', async () => {
    fakeTurnstile(true);
    const mock = fetchMock(new Response('ok', { status: 200 }));
    render(<ContactForm robot={robot} maintenancePrice={107} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Email' }));
    change(/^Nom/, 'Jeanne');
    change(/^Email/, 'jeanne@');
    accept();
    await clickSend();

    expect(
      await screen.findByText('Cette adresse email ne semble pas valide.'),
    ).toBeTruthy();
    expect(mock).not.toHaveBeenCalled();
  });

  it('le nom reste obligatoire, quel que soit le canal', async () => {
    fakeTurnstile(true);
    const mock = fetchMock(new Response('ok', { status: 200 }));
    render(<ContactForm robot={robot} maintenancePrice={107} />);

    change(/^Téléphone/, '0470 11 22 33');
    accept();
    await clickSend();

    expect(await screen.findByText('Indiquez votre nom.')).toBeTruthy();
    expect(mock).not.toHaveBeenCalled();
  });
});
