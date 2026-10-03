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
 * Sans identifiant GA4 valide, rien n'est rendu. Restylé au gabarit (R008-S04) :
 * ivoire, vert forêt, Manrope, focus visibles.
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
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-ivory shadow-[0_-3px_16px_#183e3214]"
    >
      <div className="wrap flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="text-[13px] text-muted mobile:text-xs">
          <p id="cookie-banner-title" className="font-bold text-ink">
            Mesure d&apos;audience
          </p>
          <p id="cookie-banner-text">
            Avec votre accord, nous mesurons les visites du site (Google
            Analytics) pour l&apos;améliorer. Rien n&apos;est chargé avant votre
            choix.{' '}
            <Link
              href="/cookies"
              className="font-bold text-forest underline hover:text-forest-hover"
            >
              En savoir plus
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => choose(false)}
            className="min-h-11 rounded-action px-4 text-[13px] font-semibold text-forest underline hover:text-forest-hover"
          >
            Refuser
          </button>
          <button
            ref={acceptRef}
            type="button"
            onClick={() => choose(true)}
            className="min-h-11 rounded-action border border-forest bg-forest px-5 text-[13px] font-bold text-white hover:bg-forest-hover"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
