/**
 * R004-S02 — chargement de GA4 et bandeau : ce que `lib/analytics.test.ts` ne voit
 * pas, c'est ce que le navigateur fait réellement (script, clic sur un lien tel:).
 */
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// next/script garde un cache de scripts déjà chargés (par id) au niveau du module : il
// survit à `vi.resetModules()` et fausserait les cas suivants. Le composant est remplacé
// par un simple <script> : ce qui compte ici est « est-il rendu, et avec quelle adresse ».
vi.mock('next/script', () => ({
  default: ({ id, src }: { id: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-sync-scripts
    <script id={id} src={src} />
  ),
}));
vi.mock('next/navigation', () => ({ usePathname: () => '/robots' }));
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

const ID = 'G-TEST123456';
type FenetreMesure = { dataLayer?: IArguments[] };

function appels(): unknown[][] {
  return ((window as unknown as FenetreMesure).dataLayer ?? []).map((a) =>
    Array.from(a),
  );
}
function scriptsGoogle(): Element[] {
  return Array.from(document.querySelectorAll('script')).filter((s) =>
    (s.getAttribute('src') ?? '').includes('googletagmanager.com'),
  );
}

async function monter(id: string | undefined) {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_GA4_MEASUREMENT_ID', id ?? '');
  const consent = await import('../lib/consent');
  const { default: Analytics } = await import('./Analytics');
  const { default: CookieBanner } = await import('./CookieBanner');
  render(
    <>
      <a href="tel:+3267830706">Appeler</a>
      <a href="mailto:info@forestar.be">Écrire</a>
      <Analytics />
      <CookieBanner />
    </>,
  );
  return { consent };
}

beforeEach(() => {
  window.localStorage.clear();
  delete (window as unknown as FenetreMesure).dataLayer;
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('sans identifiant GA4 (AC-04)', () => {
  it('ni bandeau, ni script, ni traceur', async () => {
    await monter(undefined);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(scriptsGoogle()).toHaveLength(0);
    fireEvent.click(screen.getByText('Appeler'));
    expect(appels()).toEqual([]);
  });
});

describe('avec un identifiant (AC-01 et AC-02)', () => {
  it('sans choix : le bandeau est là, aucun script Google, aucun événement', async () => {
    await monter(ID);
    const bandeau = await screen.findByRole('dialog');
    expect(bandeau).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Accepter' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Refuser' })).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /En savoir plus/ }).getAttribute('href'),
    ).toBe('/cookies');
    expect(scriptsGoogle()).toHaveLength(0);
    fireEvent.click(screen.getByText('Appeler'));
    expect(appels()).toEqual([]);
  });

  it('Refuser : le bandeau disparaît, toujours aucun script ni événement', async () => {
    await monter(ID);
    fireEvent.click(await screen.findByRole('button', { name: 'Refuser' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(scriptsGoogle()).toHaveLength(0);
    fireEvent.click(screen.getByText('Appeler'));
    expect(appels().filter((a) => a[0] === 'event')).toEqual([]);
  });

  it('Accepter : le script GA4 se charge avec le bon identifiant et la page vue part', async () => {
    await monter(ID);
    await act(async () => {
      fireEvent.click(await screen.findByRole('button', { name: 'Accepter' }));
    });
    await vi.waitFor(() => expect(scriptsGoogle()).toHaveLength(1));
    expect(scriptsGoogle()[0].getAttribute('src')).toContain(`id=${ID}`);
    const pageVue = appels().find(
      (a) => a[0] === 'event' && a[1] === 'page_view',
    );
    expect(pageVue?.[2]).toMatchObject({ page_path: '/robots' });
  });

  it('un lien tel: envoie phone_click après accord, un autre lien rien', async () => {
    await monter(ID);
    await act(async () => {
      fireEvent.click(await screen.findByRole('button', { name: 'Accepter' }));
    });
    fireEvent.click(screen.getByText('Écrire'));
    expect(appels().filter((a) => a[1] === 'phone_click')).toHaveLength(0);
    fireEvent.click(screen.getByText('Appeler'));
    expect(appels().filter((a) => a[1] === 'phone_click')).toHaveLength(1);
  });

  it('un choix déjà enregistré : pas de bandeau, la mesure repart', async () => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_GA4_MEASUREMENT_ID', ID);
    const { saveConsent } = await import('../lib/consent');
    saveConsent(true);
    const { default: Analytics } = await import('./Analytics');
    const { default: CookieBanner } = await import('./CookieBanner');
    render(
      <>
        <Analytics />
        <CookieBanner />
      </>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    await vi.waitFor(() => expect(scriptsGoogle()).toHaveLength(1));
  });

  it('« Gérer les cookies » rouvre le bandeau, et Refuser retire la mesure', async () => {
    const { consent } = await monter(ID);
    await act(async () => {
      fireEvent.click(await screen.findByRole('button', { name: 'Accepter' }));
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    await act(async () => consent.openConsentSettings());
    fireEvent.click(await screen.findByRole('button', { name: 'Refuser' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    const avant = appels().length;
    fireEvent.click(screen.getByText('Appeler'));
    expect(appels().length).toBe(avant);
    expect(consent.hasAnalyticsConsent()).toBe(false);
  });
});
