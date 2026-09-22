'use server';

/**
 * Server Actions for API calls that require authentication.
 * These actions run on the server, keeping AUTH_TOKEN secure and never exposing it to the client.
 */
import { TURNSTILE_HEADER } from './turnstile';

const API_URL = process.env.API_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

/**
 * R006 (phase 9.18) — les en-têtes d'un appel sortant, jeton partagé compris.
 *
 * Le jeton Turnstile est **relayé**, jamais vérifié ici (D-04) : le garde vit
 * dans forestar-server (R005). Un jeton absent ne pose pas d'en-tête vide,
 * pour que le garde distingue « pas de widget » de « widget vide ».
 */
function apiHeaders(turnstileToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${AUTH_TOKEN}`,
  };
  if (turnstileToken) headers[TURNSTILE_HEADER] = turnstileToken;
  return headers;
}

/**
 * Le code de refus rendu par forestar-server, quand il y en a un.
 *
 * Les trois routes publiques répondent `{ success: false, code, message }`
 * depuis R005. Lire `code` est ce qui permet aux formulaires d'afficher « la
 * vérification a échoué, refaites-la » au lieu de « une erreur est survenue »,
 * qui n'aide personne. Une réponse illisible ne devient jamais un code.
 */
async function refusalCode(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.clone().json()) as { code?: unknown };
    return typeof body.code === 'string' ? body.code : undefined;
  } catch {
    return undefined;
  }
}

// Types
interface Robot {
  id: number;
  name: string;
  reference?: string;
  sellingPrice?: number;
}

interface Accessory {
  id: number;
  name: string;
  reference?: string;
  category: 'PLUGIN' | 'ANTENNA' | 'SHELTER';
  sellingPrice?: number;
}

interface AccessoriesData {
  plugins: Accessory[];
  antennas: Accessory[];
  shelters: Accessory[];
}

interface QuoteRequestData {
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientCity: string;
  robotInventoryId: number | '';
  pluginInventoryId: number | '';
  antennaInventoryId: number | '';
  shelterInventoryId: number | '';
  hasWire: boolean;
  wireLength: number;
  hasAntennaSupport: boolean;
  hasPlacement: boolean;
  installationNotes: string;
  needsInstaller: boolean;
}

interface FormSubmitData {
  [key: string]: string | number | boolean | null | undefined;
}

// Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  /** Code de refus du serveur, par exemple `turnstile_failed` (R006/AC-05). */
  code?: string;
}

/**
 * Fetch available robots for quote request form
 */
export async function fetchRobots(): Promise<ApiResponse<Robot[]>> {
  if (!API_URL || !AUTH_TOKEN) {
    console.error('API_URL or AUTH_TOKEN not configured');
    return { success: false, error: 'Configuration manquante' };
  }

  try {
    const response = await fetch(`${API_URL}/robots`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error('Error fetching robots:', error);
    return {
      success: false,
      error: 'Erreur lors du chargement des robots disponibles',
    };
  }
}

/**
 * Fetch available accessories for quote request form
 */
export async function fetchAccessories(): Promise<
  ApiResponse<AccessoriesData>
> {
  if (!API_URL || !AUTH_TOKEN) {
    console.error('API_URL or AUTH_TOKEN not configured');
    return { success: false, error: 'Configuration manquante' };
  }

  try {
    const response = await fetch(`${API_URL}/accessories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data || { plugins: [], antennas: [], shelters: [] },
    };
  } catch (error) {
    console.error('Error fetching accessories:', error);
    return {
      success: false,
      error: 'Erreur lors du chargement des accessoires disponibles',
    };
  }
}

/**
 * Submit a quote request
 */
export async function submitQuoteRequest(
  formData: QuoteRequestData,
  turnstileToken?: string,
): Promise<ApiResponse<{ requestId: number }>> {
  if (!API_URL || !AUTH_TOKEN) {
    console.error('API_URL or AUTH_TOKEN not configured');
    return { success: false, error: 'Configuration manquante' };
  }

  try {
    const response = await fetch(`${API_URL}/quote-request`, {
      method: 'POST',
      headers: apiHeaders(turnstileToken),
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const code = await refusalCode(response);
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.message || 'Erreur lors de la soumission',
      );
      (error as Error & { code?: string }).code = code;
      throw error;
    }

    const responseData = await response.json();
    return { success: true, data: { requestId: responseData.requestId } };
  } catch (error) {
    console.error('Error submitting quote request:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi de votre demande",
      code: (error as { code?: string })?.code,
    };
  }
}

/**
 * Submit robot reservation form
 */
export async function submitRobotReservation(
  formData: FormSubmitData,
  turnstileToken?: string,
): Promise<ApiResponse<void>> {
  return postPublicForm(formData, turnstileToken, 'la réservation');
}

/**
 * Soumet une demande de service (R006-S01).
 *
 * Le composant `ServiceForm` appelait lui-même
 * `fetch(`${API_URL}/submit-form`)` depuis le **navigateur**, en lisant
 * `process.env.API_URL` et `process.env.AUTH_TOKEN` — que Next ne remplace pas
 * côté client. L'URL valait donc `undefined/submit-form` et la requête
 * repartait en 404 : le formulaire ne fonctionnait plus du tout, et le client
 * voyait « Network response was not ok » (D-13). Il passe par cette action,
 * comme les deux autres formulaires du site.
 *
 * Même route que la réservation de robot : forestar-server lit le corps et
 * envoie l'email interne correspondant. Deux noms distincts malgré tout, pour
 * que les journaux et les appels disent lequel des deux parcours est en cause.
 */
export async function submitServiceForm(
  formData: FormSubmitData,
  turnstileToken?: string,
): Promise<ApiResponse<void>> {
  return postPublicForm(formData, turnstileToken, 'la demande de service');
}

async function postPublicForm(
  formData: FormSubmitData,
  turnstileToken: string | undefined,
  quoi: string,
): Promise<ApiResponse<void>> {
  if (!API_URL || !AUTH_TOKEN) {
    console.error('API_URL or AUTH_TOKEN not configured');
    return { success: false, error: 'Configuration manquante' };
  }

  try {
    const response = await fetch(`${API_URL}/submit-form`, {
      method: 'POST',
      headers: apiHeaders(turnstileToken),
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Erreur lors de la soumission de ${quoi}`,
        code: await refusalCode(response),
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error submitting form:', error);
    return {
      success: false,
      error: `Erreur lors de la soumission de ${quoi}`,
    };
  }
}
