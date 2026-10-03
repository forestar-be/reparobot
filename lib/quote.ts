/**
 * Devis d'achat (R006-S01) : calcul du récapitulatif et corps de `POST /quote-request`.
 *
 * Fonctions pures, sans réseau. Le total reprend à l'identique la formule du PDF du
 * serveur (`PurchaseOrderPdfDocument`) : robot + accessoires + installation cochée
 * (placement compris) + câble au mètre + support d'antenne. Un élément sans prix n'ajoute
 * rien au total et se lit « prix confirmé dans le devis ».
 */
import type { InstallationPrices } from './installation-prices';

export type AccessoryCategory = 'PLUGIN' | 'ANTENNA' | 'SHELTER';

export interface Accessory {
  id: number;
  name: string;
  reference?: string | null;
  category: AccessoryCategory;
  /** `null` : article sans prix, « à chiffrer ». */
  sellingPrice: number | null;
}

export interface QuoteSelection {
  /** Installation professionnelle (placement du robot compris) : décochée par défaut (D-14). */
  installation: boolean;
  /** Un accessoire au plus par catégorie (le serveur n'en reçoit qu'un). */
  pluginId: number | null;
  antennaId: number | null;
  shelterId: number | null;
  wire: boolean;
  wireLength: number;
  antennaSupport: boolean;
}

export const EMPTY_SELECTION: QuoteSelection = {
  installation: false,
  pluginId: null,
  antennaId: null,
  shelterId: null,
  wire: false,
  wireLength: 0,
  antennaSupport: false,
};

export interface QuoteContext {
  robotPrice: number;
  /** Placement du robot (`installationPrice`), `null` si inconnu. */
  placement: number | null;
  /** Câble au mètre et support, `null` quand `/installation-prices` ne les donne pas. */
  wirePerMeter: number | null;
  antennaSupportPrice: number | null;
  accessories: Accessory[];
}

export interface QuoteLine {
  key: string;
  label: string;
  /** `null` : prix confirmé dans le devis. */
  amount: number | null;
  /** Précision affichée à côté du libellé (« 120 m »). */
  detail?: string;
}

export interface Quote {
  lines: QuoteLine[];
  /** Somme des lignes dont le prix est connu, arrondie au centime. */
  total: number;
  /** Libellés des lignes sans prix : le total n'est alors qu'un sous-total. */
  unpriced: string[];
  installationIncluded: boolean;
  /** Montant de l'installation si elle est cochée et chiffrée. */
  installationAmount: number | null;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Longueur de câble saisie, ramenée à un entier de 0 à 3000 m. */
export function normalizeWireLength(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(3000, Math.floor(value)));
}

export function findAccessory(
  accessories: Accessory[],
  id: number | null,
): Accessory | undefined {
  return id === null ? undefined : accessories.find((a) => a.id === id);
}

export function computeQuote(
  context: QuoteContext,
  selection: QuoteSelection,
): Quote {
  const lines: QuoteLine[] = [
    { key: 'robot', label: 'Robot seul', amount: context.robotPrice },
  ];

  if (selection.installation) {
    lines.push({
      key: 'installation',
      label: 'Installation & placement',
      amount: context.placement,
    });
  }

  for (const id of [
    selection.pluginId,
    selection.antennaId,
    selection.shelterId,
  ]) {
    const accessory = findAccessory(context.accessories, id);
    if (accessory) {
      lines.push({
        key: `accessoire-${accessory.id}`,
        label: accessory.name.trim(),
        amount: accessory.sellingPrice,
      });
    }
  }

  const wireLength = normalizeWireLength(selection.wireLength);
  if (selection.wire && wireLength > 0) {
    lines.push({
      key: 'cable',
      label: 'Câble périphérique',
      detail: `${wireLength} m`,
      amount:
        context.wirePerMeter === null
          ? null
          : round2(context.wirePerMeter * wireLength),
    });
  }

  if (selection.antennaSupport) {
    lines.push({
      key: 'support',
      label: "Support d'antenne",
      amount: context.antennaSupportPrice,
    });
  }

  const total = round2(
    lines.reduce((sum, line) => sum + (line.amount ?? 0), 0),
  );
  const unpriced = lines.filter((l) => l.amount === null).map((l) => l.label);
  const installation = lines.find((l) => l.key === 'installation');

  return {
    lines,
    total,
    unpriced,
    installationIncluded: selection.installation,
    installationAmount: installation?.amount ?? null,
  };
}

/** Corps de `POST /quote-request`, tel que le serveur le lit (`publicSite.routes.js`). */
export interface QuoteRequestBody {
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientCity: string;
  robotInventoryId: number;
  pluginInventoryId: number | null;
  antennaInventoryId: number | null;
  shelterInventoryId: number | null;
  hasWire: boolean;
  wireLength: number;
  hasAntennaSupport: boolean;
  hasPlacement: boolean;
  installationNotes: string;
  needsInstaller: boolean;
}

export interface QuoteContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  notes: string;
}

export function buildQuoteRequestBody(
  robotInventoryId: number,
  selection: QuoteSelection,
  contact: QuoteContact,
): QuoteRequestBody {
  const wireLength = normalizeWireLength(selection.wireLength);
  const hasWire = selection.wire && wireLength > 0;
  return {
    clientFirstName: contact.firstName.trim(),
    clientLastName: contact.lastName.trim(),
    clientEmail: contact.email.trim(),
    clientPhone: contact.phone.trim(),
    clientAddress: contact.address.trim(),
    // Le serveur n'a qu'un champ ville : code postal et ville y vont ensemble (« 7090 Braine-le-Comte »).
    clientCity: `${contact.postalCode.trim()} ${contact.city.trim()}`.trim(),
    robotInventoryId,
    pluginInventoryId: selection.pluginId,
    antennaInventoryId: selection.antennaId,
    shelterInventoryId: selection.shelterId,
    hasWire,
    wireLength: hasWire ? wireLength : 0,
    hasAntennaSupport: selection.antennaSupport,
    // Une seule case « installation » : placement du robot et installateur vont ensemble (D-14).
    hasPlacement: selection.installation,
    needsInstaller: selection.installation,
    installationNotes: contact.notes.trim(),
  };
}

/** Prix d'installation d'un robot : le placement de l'inventaire, sinon celui de `/installation-prices`. */
export function quoteContextFor(
  robot: { price: number; installationPrice: number },
  prices: InstallationPrices | null,
  accessories: Accessory[],
): QuoteContext {
  return {
    robotPrice: robot.price,
    placement: prices?.placement ?? robot.installationPrice ?? null,
    wirePerMeter: prices?.wirePerMeter ?? null,
    antennaSupportPrice: prices?.antennaSupport ?? null,
    accessories,
  };
}
