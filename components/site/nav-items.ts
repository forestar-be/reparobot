/**
 * Menu du site (R005-S02) : Robots Husqvarna · Entretien & réparation · Contact.
 * Une seule liste pour l'en-tête, le menu mobile et le pied de page.
 *
 * - « Contact » mène à la page `/contact` (coordonnées, carte, formulaire).
 */
export interface NavItem {
  label: string;
  href: string;
  /** Préfixes de chemins pour lesquels l'entrée est « active ». */
  activeFor: string[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Robots Husqvarna',
    href: '/robots',
    activeFor: ['/robots', '/devis', '/etre-recontacte'],
  },
  {
    label: 'Entretien & réparation',
    href: '/entretien-reparation',
    activeFor: ['/entretien-reparation'],
  },
  { label: 'Contact', href: '/contact', activeFor: ['/contact'] },
];

/** L'entrée est active si le chemin courant commence par l'un de ses préfixes. */
export function isActive(item: NavItem, pathname: string): boolean {
  return item.activeFor.some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(prefix.endsWith('-') ? prefix : `${prefix}/`),
  );
}
