'use client';

import {
  ensureAnalyticsBootstrap,
  GA4_MEASUREMENT_ID,
  syncAnalyticsConsent,
  trackPhoneClick,
} from '../lib/analytics';
import { CONSENT_UPDATED_EVENT, hasAnalyticsConsent } from '../lib/consent';
import { useEffect, useState } from 'react';
import Script from 'next/script';

/**
 * Charge GA4 — et rien d'autre — une fois le consentement donné (R004-S02).
 *
 * Aucun `<Script>` n'est rendu tant que l'accord manque : sans accord, ni requête
 * vers googletagmanager.com ni vers google-analytics.com. Sans identifiant de mesure
 * valide, le composant ne rend rien du tout.
 *
 * Les pages vues sont celles de GA4 (première page à l'accord, puis changements
 * d'historique par la mesure améliorée) : le site n'en émet pas, sinon chaque page
 * compte double. Il émet le clic sur le téléphone : un seul écouteur sur le
 * document couvre tous les liens `tel:` du site, présents et à venir.
 */
export default function Analytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!GA4_MEASUREMENT_ID) return;
    const refresh = () => setAllowed(hasAnalyticsConsent());
    refresh();
    window.addEventListener(CONSENT_UPDATED_EVENT, refresh);
    // Un autre onglet a changé le choix.
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CONSENT_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    if (!GA4_MEASUREMENT_ID) return;
    if (allowed) ensureAnalyticsBootstrap();
    syncAnalyticsConsent(allowed);
  }, [allowed]);

  useEffect(() => {
    if (!GA4_MEASUREMENT_ID) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('a[href^="tel:"]')) trackPhoneClick();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  if (!GA4_MEASUREMENT_ID || !allowed) return null;

  return (
    <Script
      id="ga4-loader"
      src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
      strategy="afterInteractive"
    />
  );
}
