/**
 * Formats d'affichage, sans `Intl` : le serveur et le navigateur ne regroupent pas
 * toujours les milliers de la même façon (ICU), ce qui ferait diverger l'hydratation.
 *
 * Choix de la maquette : « 1399 € », « 4800 m² » (pas de séparateur à quatre
 * chiffres), « 12 000 m² » (espace insécable à partir de cinq chiffres).
 */
const NBSP = String.fromCharCode(160);

function group(integer: string): string {
  if (integer.length < 5) return integer;
  return integer.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

/** `1399` → « 1399 € », `199.99` → « 199,99 € », `1.3` → « 1,30 € ». */
export function formatEuro(amount: number): string {
  const rounded = Math.round(Math.abs(amount) * 100) / 100;
  const [integer, decimals] = rounded.toFixed(2).split('.');
  const fraction = decimals === '00' ? '' : `,${decimals}`;
  const sign = amount < 0 && rounded !== 0 ? '-' : '';
  return `${sign}${group(integer)}${fraction}${NBSP}€`;
}

/** `4800` → « 4800 », `12000` → « 12 000 ». */
export function formatNumber(value: number): string {
  return group(String(Math.round(value)));
}

/** `4800` → « 4800 m² ». */
export function formatSurface(m2: number): string {
  return `${formatNumber(m2)}${NBSP}m²`;
}
