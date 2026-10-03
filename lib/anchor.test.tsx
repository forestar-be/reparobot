/**
 * Ancres internes : défilement explicite à chaque clic, même si le hash est déjà dans l'adresse.
 */
import AnchorLink from '../components/ui/AnchorLink';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isSamePage, parseAnchorHref, scrollToAnchor } from './anchor';

let pathname = '/entretien-reparation';
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

const scrollIntoView = vi.fn();

/** Le défilement d'un `AnchorLink` part au prochain affichage. */
const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function reducedMotion(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: reduce && query.includes('prefers-reduced-motion'),
    })),
  );
}

beforeEach(() => {
  pathname = '/entretien-reparation';
  scrollIntoView.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
  reducedMotion(false);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('parseAnchorHref / isSamePage', () => {
  it('découpe chemin et ancre', () => {
    expect(parseAnchorHref('#passage')).toEqual({ path: '', id: 'passage' });
    expect(parseAnchorHref('/#contact')).toEqual({ path: '/', id: 'contact' });
    expect(parseAnchorHref('/robots')).toBeNull();
    expect(parseAnchorHref('/robots#')).toBeNull();
  });
  it('ne prend la main que sur la page courante', () => {
    expect(isSamePage('', '/robots')).toBe(true);
    expect(isSamePage('/', '/')).toBe(true);
    expect(isSamePage('/', '/robots')).toBe(false);
  });
});

describe('scrollToAnchor', () => {
  it('défile en douceur et focalise le premier champ de la cible', () => {
    document.body.innerHTML =
      '<section id="passage"><h2>Titre</h2><input name="a"><input name="b"></section>';
    expect(scrollToAnchor('passage')).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
    expect((document.activeElement as HTMLInputElement).name).toBe('a');
  });

  it('respecte prefers-reduced-motion : défilement immédiat', () => {
    reducedMotion(true);
    document.body.innerHTML = '<section id="passage"><input></section>';
    scrollToAnchor('passage');
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start',
    });
  });

  it('sans champ, la cible elle-même reçoit le focus', () => {
    document.body.innerHTML =
      '<section id="contact"><h2>Contact</h2></section>';
    scrollToAnchor('contact');
    expect(document.activeElement?.id).toBe('contact');
  });

  it('cible absente : rien ne défile', () => {
    document.body.innerHTML = '';
    expect(scrollToAnchor('absent')).toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

describe('AnchorLink', () => {
  it('défile à chaque clic, même quand le hash est déjà dans l’adresse', async () => {
    document.body.innerHTML = '';
    const cible = document.createElement('section');
    cible.id = 'passage';
    cible.innerHTML = '<input name="prenom">';
    document.body.append(cible);
    window.history.replaceState(null, '', '/entretien-reparation#passage');

    render(<AnchorLink href="#passage">Réserver un passage</AnchorLink>, {
      container: document.body.appendChild(document.createElement('div')),
    });
    const lien = screen.getByRole('link', { name: 'Réserver un passage' });
    fireEvent.click(lien);
    await nextFrame();
    fireEvent.click(lien);
    await nextFrame();
    expect(scrollIntoView).toHaveBeenCalledTimes(2);
    expect(window.location.hash).toBe('#passage');
  });

  it('laisse next/link gérer un lien vers une autre page ou un clic modifié', () => {
    document.body.innerHTML = '';
    const cible = document.createElement('div');
    cible.id = 'contact';
    document.body.append(cible);
    render(<AnchorLink href="/#contact">Contact</AnchorLink>, {
      container: document.body.appendChild(document.createElement('div')),
    });
    // pathname courant : /entretien-reparation, l'ancre vise l'accueil
    fireEvent.click(screen.getByRole('link', { name: 'Contact' }));
    expect(scrollIntoView).not.toHaveBeenCalled();

    pathname = '/';
    cleanup();
    render(<AnchorLink href="/#contact">Contact</AnchorLink>, {
      container: document.body.appendChild(document.createElement('div')),
    });
    fireEvent.click(screen.getByRole('link', { name: 'Contact' }), {
      ctrlKey: true,
    });
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('exécute aussi le onClick fourni (la présélection du forfait)', async () => {
    document.body.innerHTML = '<section id="passage"><input></section>';
    const onClick = vi.fn();
    render(
      <AnchorLink href="#passage" onClick={onClick}>
        Réserver
      </AnchorLink>,
      { container: document.body.appendChild(document.createElement('div')) },
    );
    fireEvent.click(screen.getByRole('link', { name: 'Réserver' }));
    await nextFrame();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });
});
