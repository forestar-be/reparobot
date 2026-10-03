'use client';

import {
  ensureAnalyticsBootstrap,
  GA4_MEASUREMENT_ID,
  syncAnalyticsConsent,
  trackPageView,
  trackPhoneClick,
} from '../lib/analytics';
import { CONSENT_UPDATED_EVENT, hasAnalyticsConsent } from '../lib/consent';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

/**
 * Charge GA4 — et rien d'autre — une fois le consentement donné (R004-S02).
 *
 * Aucun `<Script>` n'est rendu tant que l'accord manque : sans accord, ni requête
 * vers googletagmanager.com ni vers google-analytics.com. Sans identifiant de mesure
 * valide, le composant ne rend rien du tout.
 *
 * Il émet aussi les pages vues (une par adresse, sans chaîne de requête) et le
 * clic sur le téléphone : un seul écouteur sur le document couvre tous les liens
 * `tel:` du site, présents et à venir.
 */
export default function Analytics() {
  const [allowed, setAllowed] = useState(false);
  const pathname = usePathname();
  const lastSentPath = useRef<string | null>(null);

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
    if (!allowed) lastSentPath.current = null;
  }, [allowed]);

  useEffect(() => {
    if (!GA4_MEASUREMENT_ID || !allowed) return;
    if (lastSentPath.current === pathname) return;
    lastSentPath.current = pathname;
    trackPageView(pathname);
  }, [allowed, pathname]);

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
