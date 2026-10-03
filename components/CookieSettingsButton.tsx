'use client';

import { CONSENT_UI_ENABLED } from '../lib/analytics';
import { openConsentSettings } from '../lib/consent';

/**
 * « Gérer les cookies » : rouvre le bandeau pour changer ou retirer son choix.
 * Absent quand aucune mesure n'est configurée — il n'y aurait rien à régler.
 */
export default function CookieSettingsButton({
  className = '',
}: {
  className?: string;
}) {
  if (!CONSENT_UI_ENABLED) return null;
  return (
    <button type="button" className={className} onClick={openConsentSettings}>
      Gérer les cookies
    </button>
  );
}
