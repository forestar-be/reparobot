// Types for robots catalog
export interface RobotCategory {
  id: string;
  name: string;
  description: string;
}

export interface Robot {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  maxSurface: number;
  maxSlope: number;
  price: number;
  installationPrice: number;
  promotion?: string | null;
  reference?: string;
  inventoryId: number;
}

export interface MaintenanceInfo {
  description: string;
  price: number;
}

export interface RobotsCatalog {
  categories: RobotCategory[];
  robots: Robot[];
  maintenance: MaintenanceInfo;
  generatedAt: string;
}

// Fallback data in case API is unavailable (for build time / offline scenarios)
const FALLBACK_CATALOG: RobotsCatalog = {
  categories: [
    {
      id: 'wired',
      name: 'Robots Filaires',
      description:
        "Installation avec câble périphérique, idéal pour jardins standards. Gestion multi-zones et réglages via l'application Automower® Connect.",
    },
    {
      id: 'wireless',
      name: 'Robots Sans Fil',
      description:
        "Installation facile avec zones virtuelles (pas de câble périphérique). Gestion multi-zones et réglages via l'application Automower® Connect. Fonctionnement via le système Husqvarna EPOS (RTK GPS).",
    },
  ],
  robots: [],
  maintenance: {
    description:
      "Entretien de fin d'année (remise à l'abri, nettoyage complet, mise à jour)",
    price: 79,
  },
  generatedAt: '2026-01-01T00:00:00.000Z',
};

/**
 * Fetches the robots catalog from the API server.
 * Uses Next.js fetch cache with ISR (Incremental Static Regeneration) for optimal SEO.
 * Cache is revalidated every hour (3600 seconds).
 */
export async function getRobotsCatalog(): Promise<RobotsCatalog> {
  const apiUrl = process.env.API_URL;
  const authToken = process.env.AUTH_TOKEN;

  if (!apiUrl) {
    console.warn('API_URL not configured, using fallback catalog data');
    return FALLBACK_CATALOG;
  }

  if (!authToken) {
    console.warn('AUTH_TOKEN not configured, using fallback catalog data');
    return FALLBACK_CATALOG;
  }

  try {
    const response = await fetch(`${apiUrl}/robots-catalog`, {
      next: {
        revalidate: 3600, // Revalidate every hour
        tags: ['robots-catalog'], // Tag for on-demand revalidation
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch robots catalog: ${response.status} ${response.statusText}`,
      );
      return FALLBACK_CATALOG;
    }

    const data: RobotsCatalog = await response.json();

    // Validate response structure
    if (!data.categories || !data.robots || !Array.isArray(data.robots)) {
      console.error('Invalid robots catalog response structure');
      return FALLBACK_CATALOG;
    }

    return data;
  } catch (error) {
    console.error('Error fetching robots catalog:', error);
    return FALLBACK_CATALOG;
  }
}

/**
 * Get robots for a specific category
 */
export async function getRobotsByCategory(
  categoryId: string,
): Promise<Robot[]> {
  const catalog = await getRobotsCatalog();
  return catalog.robots.filter((robot) => robot.category === categoryId);
}

/**
 * Get a specific robot by ID
 */
export async function getRobotById(id: string): Promise<Robot | undefined> {
  const catalog = await getRobotsCatalog();
  return catalog.robots.find((robot) => robot.id === id);
}

/**
 * Get the total count of robots for SEO structured data
 */
export async function getRobotsCount(): Promise<number> {
  const catalog = await getRobotsCatalog();
  return catalog.robots.length;
}
