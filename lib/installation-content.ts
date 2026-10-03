/**
 * « Que comprend votre devis d'achat ? » — contenu repris tel quel de l'ancienne page
 * `/devis` (production), D-12 : on n'invente aucune étape ni promesse. Les montants
 * ne sont jamais ici : ils viennent de `/installation-prices` (R001).
 */
export const INSTALLATION_TITLE = "Que comprend votre devis d'achat ?";

export interface InstallationItem {
  key: 'installation' | 'cable' | 'antenna' | 'training' | 'warranty';
  title: string;
  text: string;
}

export const INSTALLATION_ITEMS: InstallationItem[] = [
  {
    key: 'installation',
    title: 'Installation complète',
    text: 'Pose du câble périphérique, paramétrage et mise en service (facultatif)',
  },
  {
    key: 'cable',
    title: 'Câble périphérique',
    text: 'Fourniture du câble selon la superficie de votre terrain',
  },
  {
    key: 'antenna',
    title: "Support d'antenne",
    text: "Installation du support d'antenne si nécessaire (en option)",
  },
  {
    key: 'training',
    title: 'Formation',
    text: 'Explication du fonctionnement et des réglages de base',
  },
  {
    key: 'warranty',
    title: 'Garantie',
    text: 'Garantie constructeur et service après-vente inclus',
  },
];

/**
 * Sur un robot sans fil, il n'y a ni câble périphérique à poser ni à fournir : la ligne
 * « Câble périphérique » disparaît et l'installation garde la partie de la phrase
 * existante qui reste vraie.
 */
export function installationItemsFor(
  wired: boolean,
): (InstallationItem & { priced?: 'cable' | 'antenna' })[] {
  return INSTALLATION_ITEMS.filter((item) => wired || item.key !== 'cable').map(
    (item) => {
      if (item.key === 'installation' && !wired) {
        return {
          ...item,
          text: 'Paramétrage et mise en service (facultatif)',
        };
      }
      if (item.key === 'cable') return { ...item, priced: 'cable' as const };
      if (item.key === 'antenna')
        return { ...item, priced: 'antenna' as const };
      return item;
    },
  );
}
