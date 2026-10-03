'use client';

import { CONSENT_UI_ENABLED } from '../lib/analytics';
import {
  CONSENT_OPEN_EVENT,
  CONSENT_STORAGE_KEY,
  readConsent,
  saveConsent,
} from '../lib/consent';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const BENEFITS = [
  'Un site plus simple à parcourir, grâce aux pages les plus consultées.',
  'Des fiches et des réponses qui collent mieux à vos questions.',
  'Votre soutien à un atelier local qui s’améliore avec vos retours.',
];

/** `readConsent` lit `localStorage`, qui peut lever : on retombe alors sur « aucun choix ». */
function safeReadConsent() {
  try {
    return readConsent();
  } catch {
    return null;
  }
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Consentement cookies : modale bloquante, comme sur le storefront du shop (PO, 4 oct. 2026).
 *
 * Tant qu'aucun choix valable (12 mois) n'est enregistré, la modale couvre le site et ne se
 * ferme que par un choix : ni croix, ni clic sur le fond, ni `Échap` (qui ramène le focus sur
 * « Tout accepter »). Une fois le choix fait, elle ne revient plus ; « Gérer les cookies » du
 * pied de page la rouvre, cette fois refermable.
 *
 * « Tout accepter » est le bouton principal ; « Tout refuser » est discret (texte souligné)
 * mais présent dès le premier écran, lisible et à un clic — même choix assumé que pour le shop
 * (30 sept. 2026). Dans « Personnaliser », la mesure d'audience est décochée par défaut.
 * Rien n'est chargé avant le choix (`components/Analytics`).
 *
 * Au-dessus de tout, carte Leaflet comprise (ses calques montent à 1000) : `z-[2000]`.
 * Accessibilité : `role="dialog"`, `aria-modal`, focus piégé, défilement du corps bloqué,
 * focus rendu à l'élément d'origine à la fermeture. Sans identifiant GA4, rien n'est rendu.
 */
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  // Aucun choix enregistré : la modale bloque et ne se ferme que par un choix.
  const [mandatory, setMandatory] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const acceptRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!CONSENT_UI_ENABLED) return;
    const saved = safeReadConsent();
    if (saved) {
      setAnalytics(saved.analytics);
    } else {
      setMandatory(true);
      setVisible(true);
    }
    const open = () => {
      const current = safeReadConsent();
      previousFocus.current = document.activeElement as HTMLElement | null;
      setAnalytics(current?.analytics ?? false);
      setMandatory(current === null);
      setShowDetails(true);
      setVisible(true);
    };
    // Un autre onglet a enregistré un choix : la question n'a plus lieu d'être.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== CONSENT_STORAGE_KEY || event.newValue === null) return;
      const current = safeReadConsent();
      if (!current) return;
      setAnalytics(current.analytics);
      setMandatory(false);
      setVisible(false);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CONSENT_OPEN_EVENT, open);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const close = useCallback(() => {
    if (mandatory) return;
    setVisible(false);
  }, [mandatory]);

  // Ouverte : corps figé, focus dans la modale, `Tab` piégé, `Échap` selon le cas.
  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    acceptRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (mandatory) acceptRef.current?.focus();
        else close();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const items = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (
        event.shiftKey &&
        (active === first || !dialogRef.current.contains(active))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (active === last || !dialogRef.current.contains(active))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const toRestore = previousFocus.current;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      toRestore?.focus?.();
    };
  }, [visible, mandatory, close]);

  const choose = useCallback((allowed: boolean) => {
    try {
      saveConsent(allowed);
    } catch {
      // Stockage indisponible : la modale bloquante rendrait le site inutilisable. On ferme,
      // quitte à reposer la question à la visite suivante ; rien n'est chargé entre-temps.
    }
    setAnalytics(allowed);
    setMandatory(false);
    setVisible(false);
  }, []);

  if (!CONSENT_UI_ENABLED || !visible) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#0f1f19b3] p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-message"
        className="max-h-[calc(100dvh-2rem)] w-[min(92vw,40rem)] overflow-y-auto rounded-card border border-line bg-ivory p-7 shadow-[0_18px_50px_#0f1f1940] mobile:p-5"
      >
        <h2
          id="cookie-consent-title"
          className="mb-3 text-[24px] mobile:text-[21px]"
        >
          Vos préférences de cookies
        </h2>
        <p
          id="cookie-consent-message"
          className="m-0 text-[15px] leading-relaxed text-muted"
        >
          Les cookies nécessaires font fonctionner le site. Avec votre accord,
          nous mesurons aussi les visites (Google Analytics) pour l’améliorer.
          Vous pouvez changer d’avis à tout moment avec « Gérer les cookies » en
          bas de page.{' '}
          <Link href="/cookies" className="font-bold text-forest underline">
            En savoir plus
          </Link>
        </p>
        <ul className="mt-4 grid list-none gap-2 p-0 text-[15px] text-ink">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex gap-2.5">
              <span aria-hidden="true" className="font-bold text-forest">
                ✓
              </span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        {showDetails && (
          <div className="mt-5 grid grid-cols-2 gap-3 mobile:grid-cols-1">
            <label className="rounded-action border border-line bg-white p-3.5">
              <span className="flex items-center gap-2.5 text-[15px] font-bold">
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="h-5 w-5 accent-forest"
                />
                Nécessaires
              </span>
              <span className="mt-1 block text-sm text-muted">
                Toujours actifs pour faire fonctionner le site.
              </span>
            </label>
            <label className="rounded-action border border-line bg-white p-3.5">
              <span className="flex items-center gap-2.5 text-[15px] font-bold">
                <input
                  id="cookie-consent-analytics"
                  type="checkbox"
                  checked={analytics}
                  onChange={(event) => setAnalytics(event.target.checked)}
                  className="h-5 w-5 accent-forest"
                />
                Mesure d’audience
              </span>
              <span className="mt-1 block text-sm text-muted">
                Nous aide à comprendre l’utilisation du site (Google Analytics).
              </span>
            </label>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-2.5 mobile:grid-cols-1">
          <button
            ref={acceptRef}
            type="button"
            onClick={() => choose(true)}
            className="order-2 min-h-12 rounded-action border border-forest bg-forest px-5 text-[15px] font-bold text-white hover:bg-forest-hover mobile:order-1"
          >
            Tout accepter
          </button>
          {showDetails ? (
            <button
              type="button"
              onClick={() => choose(analytics)}
              className="order-1 min-h-12 rounded-action border border-forest bg-white px-5 text-[15px] font-bold text-forest hover:bg-sage mobile:order-2"
            >
              Enregistrer mes choix
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="order-1 min-h-12 rounded-action border border-forest bg-white px-5 text-[15px] font-bold text-forest hover:bg-sage mobile:order-2"
            >
              Personnaliser
            </button>
          )}
        </div>
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={() => choose(false)}
            className="min-h-10 rounded-action px-3 text-sm font-semibold text-ink underline underline-offset-2 hover:text-forest"
          >
            Tout refuser
          </button>
        </div>
        {!mandatory && (
          <button
            type="button"
            onClick={close}
            className="mt-2 min-h-11 w-full rounded-action border border-line bg-white px-5 text-sm font-semibold text-ink hover:bg-sage"
          >
            Fermer
          </button>
        )}
      </div>
    </div>
  );
}
