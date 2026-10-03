'use server';

/**
 * Server Actions for API calls that require authentication.
 * These actions run on the server, keeping AUTH_TOKEN secure and never exposing it to the client.
 */
import type { QuoteRequestBody } from './quote';
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
/** Corps de `POST /submit-form` : paires libellé → valeur, lues telles quelles dans l'email. */
type FormSubmitData = Record<string, string | boolean>;

// Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  /** Code de refus du serveur, par exemple `turnstile_failed` (R006/AC-05). */
  code?: string;
}

/**
 * Devis d'achat (R006-S01) : `POST /quote-request`, qui persiste le bon avec `source = SITE`.
 */
export async function submitQuoteRequest(
  formData: QuoteRequestBody,
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
 * « Être rappelé » (R006-S02) : `POST /submit-form` avec `Type de demande: Rappel`.
 * Le corps vient de `buildCallbackBody` (lib/callback.ts).
 */
export async function submitCallbackRequest(
  formData: FormSubmitData,
  turnstileToken?: string,
): Promise<ApiResponse<void>> {
  return postPublicForm(formData, turnstileToken, 'la demande de rappel');
}

/**
 * « Réserver un passage » (R007) : `POST /submit-form` avec `Type de demande`
 * Entretien, Réparation ou Installation et `Marque`.
 *
 * Passe par une server action, jamais par un `fetch` du navigateur : `API_URL` et
 * `AUTH_TOKEN` ne sont pas remplacés côté client par Next, et l'ancien formulaire
 * partait ainsi vers `undefined/submit-form` (D-13, du 25 janv. au 22 sept. 2026).
 */
export async function submitServiceRequest(
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
