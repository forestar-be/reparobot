'use client';

import { CONSENT_UI_ENABLED } from '../lib/analytics';
import { CONSENT_OPEN_EVENT, readConsent, saveConsent } from '../lib/consent';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/**
 * Bandeau de consentement à la mesure d'audience (R004-S02).
 *
 * Affiché en bas de page tant qu'aucun choix valable (12 mois) n'est enregistré, et
 * rouvert par « Gérer les cookies ». Il ne bloque pas la page : le site reste
 * entièrement utilisable sans répondre.
 *
 * Choix du PO (30 sept. 2026, comme pour le shop) : « Refuser » est discret — un
 * bouton texte souligné — mais présent dès le premier écran, lisible et à un clic.
 * « Accepter » est le bouton principal. Risque assumé : la checklist de l'APD
 * demande des boutons de refus et d'acceptation affichés de la même façon ; passer
 * à un style identique revient à changer les classes du bouton « Refuser ».
 *
 * Sans identifiant GA4 valide, rien n'est rendu. Style volontairement sobre : la
 * maquette le reprendra (R008).
 */
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  // Vrai quand l'utilisateur rouvre le bandeau alors qu'un choix existe déjà.
  const [reopened, setReopened] = useState(false);
  const acceptRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!CONSENT_UI_ENABLED) return;
    if (!readConsent()) setVisible(true);
    const open = () => {
      setReopened(readConsent() !== null);
      setVisible(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);

  // Rouvert au clavier ou à la souris : le focus passe au bandeau.
  useEffect(() => {
    if (visible && reopened) acceptRef.current?.focus();
  }, [visible, reopened]);

  useEffect(() => {
    if (!visible || !reopened) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setVisible(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible, reopened]);

  const choose = useCallback((analytics: boolean) => {
    saveConsent(analytics);
    setVisible(false);
    setReopened(false);
  }, []);

  if (!CONSENT_UI_ENABLED || !visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-text"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-gray-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.12)]"
    >
      <div className="container-custom flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="text-sm text-gray-700">
          <p id="cookie-banner-title" className="font-semibold text-gray-900">
            Mesure d&apos;audience
          </p>
          <p id="cookie-banner-text">
            Avec votre accord, nous mesurons les visites du site (Google
            Analytics) pour l&apos;améliorer. Rien n&apos;est chargé avant votre
            choix.{' '}
            <Link
              href="/cookies"
              className="font-medium text-primary-700 underline hover:text-primary-800"
            >
              En savoir plus
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => choose(false)}
            className="min-h-11 rounded-lg px-4 text-sm font-medium text-gray-700 underline hover:text-gray-900"
          >
            Refuser
          </button>
          <button
            ref={acceptRef}
            type="button"
            onClick={() => choose(true)}
            className="min-h-11 rounded-lg bg-primary-600 px-5 text-sm font-medium text-white hover:bg-primary-700"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
