'use server';

/**
 * Server Actions for API calls that require authentication.
 * These actions run on the server, keeping AUTH_TOKEN secure and never exposing it to the client.
 */

const API_URL = process.env.API_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

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
): Promise<ApiResponse<{ requestId: number }>> {
  if (!API_URL || !AUTH_TOKEN) {
    console.error('API_URL or AUTH_TOKEN not configured');
    return { success: false, error: 'Configuration manquante' };
  }

  try {
    const response = await fetch(`${API_URL}/quote-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la soumission');
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
    };
  }
}

/**
 * Submit robot reservation form
 */
export async function submitRobotReservation(
  formData: FormSubmitData,
): Promise<ApiResponse<void>> {
  if (!API_URL || !AUTH_TOKEN) {
    console.error('API_URL or AUTH_TOKEN not configured');
    return { success: false, error: 'Configuration manquante' };
  }

  try {
    const response = await fetch(`${API_URL}/submit-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return { success: true };
  } catch (error) {
    console.error('Error submitting form:', error);
    return {
      success: false,
      error: 'Erreur lors de la soumission du formulaire',
    };
  }
}
