/**
 * Forfaits d'entretien, de réparation et d'aide à l'installation (R003, D-03) :
 * `GET /service-offers`, réglés dans Paramètres de forestar-robot. Les pages ne
 * contiennent aucun prix en dur.
 *
 * Un prix `null` se lit « sur devis ».
 */
export type ServiceKind = 'MAINTENANCE' | 'REPAIR' | 'INSTALLATION_HELP';

export interface ServiceOffer {
  id: number;
  service: ServiceKind;
  kind: 'BASE' | 'OPTION';
  label: string;
  description: string | null;
  /** `null` : sur devis. */
  price: number | null;
  unit: string | null;
  /** Les options d'un même groupe s'excluent (lames, transport). */
  exclusiveGroup: string | null;
  order: number;
}

/** Lit les forfaits ; `[]` si l'API est absente ou en erreur (jamais de levée). */
export async function getServiceOffers(): Promise<ServiceOffer[]> {
  const apiUrl = process.env.API_URL;
  const authToken = process.env.AUTH_TOKEN;
  if (!apiUrl || !authToken) return [];
  try {
    const response = await fetch(`${apiUrl}/service-offers`, {
      next: { revalidate: 3600, tags: ['service-offers'] },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as ServiceOffer[]) : [];
  } catch {
    return [];
  }
}

/** Le forfait de base d'un service (entretien annuel, réparation, aide à l'installation). */
export function baseOffer(
  offers: ServiceOffer[],
  service: ServiceKind,
): ServiceOffer | undefined {
  return offers
    .filter((o) => o.service === service && o.kind === 'BASE')
    .sort((a, b) => a.order - b.order)[0];
}

/** Les options d'un service, dans l'ordre du serveur. */
export function optionOffers(
  offers: ServiceOffer[],
  service: ServiceKind,
): ServiceOffer[] {
  return offers
    .filter((o) => o.service === service && o.kind === 'OPTION')
    .sort((a, b) => a.order - b.order);
}
