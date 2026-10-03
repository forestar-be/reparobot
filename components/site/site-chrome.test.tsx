/**
 * R005-S02 — gabarit commun : menu repliable fermé par Échap, entrées actives, barre
 * mobile et mesure du téléphone (un seul `phone_click` par appel).
 */
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let pathname = '/';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: unknown;
  }) => (
    <a href={href} {...rest}>
      {children as never}
    </a>
  ),
}));
vi.mock('next/script', () => ({
  default: ({ id, src }: { id: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-sync-scripts
    <script id={id} src={src} />
  ),
}));

type FenetreMesure = { dataLayer?: IArguments[] };
const appels = () =>
  ((window as unknown as FenetreMesure).dataLayer ?? []).map((a) =>
    Array.from(a),
  );

beforeEach(() => {
  pathname = '/';
  window.localStorage.clear();
  delete (window as unknown as FenetreMesure).dataLayer;
  document.head.innerHTML = '';
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('menu', () => {
  it('liste les trois entrées du menu (sans « Conseils », retiré le 4 oct. 2026), dans l’ordre, avec leurs adresses', async () => {
    const { NAV_ITEMS } = await import('./nav-items');
    expect(NAV_ITEMS.map((i) => [i.label, i.href])).toEqual([
      ['Robots Husqvarna', '/robots'],
      ['Entretien & réparation', '/entretien-reparation'],
      ['Contact', '/#contact'],
    ]);
  });

  it('marque l’entrée de la page courante', async () => {
    const { NAV_ITEMS, isActive } = await import('./nav-items');
    const actives = (p: string) =>
      NAV_ITEMS.filter((i) => isActive(i, p)).map((i) => i.label);
    expect(actives('/')).toEqual([]);
    expect(actives('/robots')).toEqual(['Robots Husqvarna']);
    expect(actives('/robots/husqvarna-automower-430v-nera')).toEqual([
      'Robots Husqvarna',
    ]);
    expect(actives('/devis')).toEqual(['Robots Husqvarna']);
    expect(actives('/entretien-reparation')).toEqual([
      'Entretien & réparation',
    ]);
    expect(actives('/etre-recontacte')).toEqual(['Robots Husqvarna']);
    // les calculateurs restent joignables par leur adresse, mais sans entrée de menu
    expect(actives('/calculateur-cout-entretien-robot-tondeuse')).toEqual([]);
    // `/robotsx` n'est pas `/robots`
    expect(actives('/robotsx')).toEqual([]);
  });
});

describe('HeaderBar', () => {
  it('le menu mobile est fermé au départ, s’ouvre au bouton et se ferme par Échap, focus rendu au bouton', async () => {
    const { default: HeaderBar } = await import('./HeaderBar');
    render(<HeaderBar />);
    const bouton = screen.getByRole('button', { name: 'Ouvrir le menu' });
    expect(bouton.getAttribute('aria-expanded')).toBe('false');
    expect(
      document.getElementById('menu-mobile')?.getAttribute('data-open'),
    ).toBe('false');

    fireEvent.click(bouton);
    const ouvert = screen.getByRole('button', { name: 'Fermer le menu' });
    expect(ouvert.getAttribute('aria-expanded')).toBe('true');
    expect(
      document.getElementById('menu-mobile')?.getAttribute('data-open'),
    ).toBe('true');

    fireEvent.keyDown(document, { key: 'Escape' });
    const ferme = screen.getByRole('button', { name: 'Ouvrir le menu' });
    expect(ferme.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(ferme);
  });

  it('« Devis gratuit » mène au catalogue (D-18)', async () => {
    const { default: HeaderBar } = await import('./HeaderBar');
    render(<HeaderBar />);
    const liens = screen.getAllByRole('link', { name: /Devis gratuit/ });
    expect(liens.length).toBeGreaterThan(0);
    for (const lien of liens) expect(lien.getAttribute('href')).toBe('/robots');
  });

  it('la signature se lit « reparobot.be »', async () => {
    const { default: Brand } = await import('./Brand');
    const { container } = render(<Brand />);
    const nom = container.querySelector('b');
    expect(nom?.textContent).toBe('reparobot.be');
  });

  it('la signature n’est pas un titre', async () => {
    const { default: HeaderBar } = await import('./HeaderBar');
    render(<HeaderBar />);
    expect(screen.queryAllByRole('heading')).toHaveLength(0);
  });
});

describe('MobileBar', () => {
  it('propose Robots, Entretien et Appeler (lien tel:)', async () => {
    const { default: MobileBar } = await import('./MobileBar');
    render(<MobileBar phoneHref="tel:+3267830706" />);
    const barre = screen.getByRole('navigation', { name: 'Accès rapides' });
    const liens = Array.from(barre.querySelectorAll('a')).map((a) => [
      a.textContent,
      a.getAttribute('href'),
    ]);
    expect(liens).toEqual([
      ['Robots', '/robots'],
      ['Entretien', '/entretien-reparation'],
      ['Appeler', 'tel:+3267830706'],
    ]);
  });

  it('« Appeler » envoie un seul phone_click après accord (écouteur de Analytics)', async () => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_GA4_MEASUREMENT_ID', 'G-TEST123456');
    const { saveConsent } = await import('../../lib/consent');
    saveConsent(true);
    const { default: Analytics } = await import('../Analytics');
    const { default: MobileBar } = await import('./MobileBar');
    render(
      <>
        <MobileBar phoneHref="tel:+3267830706" />
        <Analytics />
      </>,
    );
    await act(async () => {});
    fireEvent.click(screen.getByRole('link', { name: 'Appeler' }));
    expect(appels().filter((a) => a[1] === 'phone_click')).toHaveLength(1);
  });
});
