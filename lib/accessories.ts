/**
 * Accessoires proposés au devis (D-16) : `GET /accessories`, les vrais articles de
 * l'inventaire avec leurs prix. Le tag `robots-catalog` les revalide avec l'inventaire.
 */
import type { Accessory } from './quote';

export interface AccessoriesByCategory {
  plugins: Accessory[];
  antennas: Accessory[];
  shelters: Accessory[];
}

export const NO_ACCESSORIES: AccessoriesByCategory = {
  plugins: [],
  antennas: [],
  shelters: [],
};

const asList = (value: unknown): Accessory[] =>
  Array.isArray(value)
    ? value.map((a) => ({
        ...(a as Accessory),
        sellingPrice:
          typeof (a as Accessory).sellingPrice === 'number'
            ? (a as Accessory).sellingPrice
            : null,
      }))
    : [];

/** Lit les accessoires ; listes vides si l'API est absente ou en erreur (jamais de levée). */
export async function getAccessories(): Promise<AccessoriesByCategory> {
  const apiUrl = process.env.API_URL;
  const authToken = process.env.AUTH_TOKEN;
  if (!apiUrl || !authToken) return NO_ACCESSORIES;
  try {
    const response = await fetch(`${apiUrl}/accessories`, {
      next: { revalidate: 3600, tags: ['robots-catalog'] },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!response.ok) return NO_ACCESSORIES;
    const body = (await response.json()) as {
      data?: Partial<Record<keyof AccessoriesByCategory, unknown>>;
    };
    return {
      plugins: asList(body.data?.plugins),
      antennas: asList(body.data?.antennas),
      shelters: asList(body.data?.shelters),
    };
  } catch {
    return NO_ACCESSORIES;
  }
}
