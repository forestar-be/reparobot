/**
 * Image de partage par défaut (1200×630). Une page qui déclare son propre `openGraph`
 * remplace celui du layout en entier, images comprises : elle doit donc la reprendre
 * elle-même, sans quoi aucun `og:image` n'est émis.
 */
export const OG_IMAGE = {
  url: '/images/og-reparobot.jpg',
  width: 1200,
  height: 630,
  alt: 'Husqvarna Automower 430V NERA dans un jardin, mise en scène',
};
