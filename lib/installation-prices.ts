/**
 * Prix d'installation d'un robot (R001) : `GET /installation-prices?robotId=<inventoryId>`.
 * Placement, câble au mètre et support d'antenne, TTC, d'une seule source — la même
 * que le devis, son PDF et la facture.
 */
export interface InstallationPrices {
  placement: number;
  wirePerMeter: number;
  antennaSupport: number;
}

/** Lit les prix d'installation d'un robot ; `null` si l'API est absente ou en erreur. */
export async function getInstallationPrices(
  inventoryId: number,
): Promise<InstallationPrices | null> {
  const apiUrl = process.env.API_URL;
  const authToken = process.env.AUTH_TOKEN;
  if (!apiUrl || !authToken) return null;
  try {
    const response = await fetch(
      `${apiUrl}/installation-prices?robotId=${encodeURIComponent(String(inventoryId))}`,
      {
        // Le prix de placement suit l'inventaire : même tag que le catalogue.
        next: { revalidate: 3600, tags: ['robots-catalog'] },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as Partial<InstallationPrices>;
    if (
      typeof data.placement !== 'number' ||
      typeof data.wirePerMeter !== 'number' ||
      typeof data.antennaSupport !== 'number'
    ) {
      return null;
    }
    return data as InstallationPrices;
  } catch {
    return null;
  }
}
