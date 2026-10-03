/**
 * URL publique du site (R002-S04, D-07).
 *
 * reparobot.be reste distinct de forestar.be et son domaine pourra changer :
 * métadonnées, URL canoniques, plan du site et données structurées la lisent
 * ici, jamais en dur. Le défaut est l'hôte réellement servi par Vercel
 * (`www`, l'apex redirige vers lui — Q-03). En aperçu ou en local, la variable
 * `SITE_URL` la remplace.
 *
 * `SITE_URL` est recopiée dans le bundle client par `env` de next.config.js
 * (valeur du build) : les pages en 'use client' voient la même URL que le
 * serveur. Un changement de la variable demande donc un nouveau build.
 */
export const DEFAULT_SITE_URL = 'https://www.reparobot.be';

/** Normalise une valeur de `SITE_URL` : sans espace ni barre finale. */
export function normalizeSiteUrl(value: string | undefined): string {
  const cleaned = (value ?? '').trim().replace(/\/+$/, '');
  return cleaned || DEFAULT_SITE_URL;
}

export const SITE_URL = normalizeSiteUrl(process.env.SITE_URL);

/** URL absolue d'un chemin du site (`/robots` donne `<SITE_URL>/robots`). */
export function siteUrl(path = ''): string {
  if (!path || path === '/') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
