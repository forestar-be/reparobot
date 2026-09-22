'use client';

/**
 * R006-S02 (phase 9.18) — le widget Turnstile des trois formulaires publics.
 *
 * Porté du storefront du shop (`storefront/src/components/TurnstileWidget.tsx`),
 * réduit à ce dont reparobot a besoin : les trois formulaires sont des
 * composants client qui gèrent déjà leur état, ils reçoivent donc le jeton par
 * `onToken` et décident eux-mêmes de leur bouton. Pas de provider ici.
 *
 * Sans sitekey (AC-03), le composant ne rend rien : le développement local se
 * comporte exactement comme avant la phase 9.18.
 */
import {
  TURNSTILE_FIELD,
  TURNSTILE_SCRIPT_URL,
  turnstileSiteKey,
} from '../lib/turnstile';
import { useCallback, useEffect, useRef, useState } from 'react';

type TurnstileRenderOptions = {
  sitekey: string;
  action?: string;
  'response-field': boolean;
  retry: 'auto' | 'never';
  callback: (token: string) => void;
  'expired-callback': () => void;
  'timeout-callback': () => void;
  'error-callback': () => void;
};

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: TurnstileRenderOptions,
  ) => string | undefined | null;
  reset: (widgetId?: string) => void;
  remove?: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

/**
 * Le script n'est chargé **qu'une fois** par page, même si plusieurs widgets
 * se montent : la promesse vit au niveau du module. Un échec de chargement la
 * remet à zéro, pour qu'un second essai puisse réessayer plutôt que d'hériter
 * éternellement de l'échec.
 */
function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no-dom'));
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => {
      scriptPromise = null;
      reject(new Error('turnstile-script-error'));
    });
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/** Réservé aux tests : le cache de module survivrait d'un cas à l'autre. */
export function resetTurnstileScriptCacheForTests() {
  scriptPromise = null;
}

function resetWidget(widgetId: string | null) {
  try {
    if (widgetId) window.turnstile?.reset(widgetId);
    else window.turnstile?.reset();
  } catch {
    // Le widget a pu disparaître entre-temps : ne jamais remonter d'ici.
  }
}

const TurnstileWidget = ({
  action,
  onToken,
  resetSignal,
  siteKey = turnstileSiteKey(),
  className,
}: {
  /** Nom de l'action, journalisé par le garde — jamais une décision. */
  action?: string;
  onToken?: (token: string) => void;
  /**
   * Incrémenté par le formulaire pour réarmer le widget après un refus du
   * serveur (AC-06) : un jeton refusé est un jeton consommé, le second essai
   * en exige un neuf.
   */
  resetSignal?: number;
  siteKey?: string;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [token, setToken] = useState('');
  const [unavailable, setUnavailable] = useState(false);

  // Le rappel change à chaque rendu du parent : le garder dans une `ref` évite
  // de démonter et remonter le widget Cloudflare à chaque frappe du client.
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const publish = useCallback((value: string) => {
    setToken(value);
    onTokenRef.current?.(value);
  }, []);

  useEffect(() => {
    if (!siteKey) return;
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    const mount = () => {
      if (cancelled || widgetIdRef.current) return;
      const api = window.turnstile;
      if (!api) {
        setUnavailable(true);
        return;
      }
      try {
        const id = api.render(container, {
          sitekey: siteKey,
          action,
          // Le champ caché est rendu par React, pas par le script, pour qu'il
          // n'en existe jamais deux du même nom dans le formulaire.
          'response-field': false,
          retry: 'auto',
          callback: (value: string) => publish(value),
          'expired-callback': () => {
            publish('');
            resetWidget(widgetIdRef.current);
          },
          'timeout-callback': () => {
            publish('');
            resetWidget(widgetIdRef.current);
          },
          // Volontairement SANS `reset` : sur une erreur persistante (domaine
          // non autorisé, réseau coupé), réarmer en boucle martèlerait
          // Cloudflare. Le jeton est effacé, le message s'affiche, et le
          // réarmement délibéré reste possible par `resetSignal`.
          'error-callback': () => {
            publish('');
            setUnavailable(true);
          },
        });
        widgetIdRef.current = typeof id === 'string' ? id : null;
      } catch {
        setUnavailable(true);
      }
    };

    // Volontairement SANS `turnstile.ready()`. Mesuré au navigateur le
    // 2026-09-22 sur le shop : `api.js` chargé en `async`/`defer` fait
    // **lever** `ready()` — « Remove async/defer from the Turnstile api.js
    // script tag before using turnstile.ready() » — et le widget ne se rendait
    // jamais. Ici le script est injecté par nous : sa promesse ne se résout
    // qu'après l'événement `load`, donc `window.turnstile` est déjà complet.
    loadTurnstileScript()
      .then(() => {
        if (!cancelled) mount();
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      });

    return () => {
      cancelled = true;
      const id = widgetIdRef.current;
      widgetIdRef.current = null;
      if (id) {
        try {
          window.turnstile?.remove?.(id);
        } catch {
          // Un démontage ne doit jamais casser la navigation.
        }
      }
    };
  }, [siteKey, action, publish]);

  const effectiveResetSignal = resetSignal ?? 0;
  const firstResetRef = useRef(effectiveResetSignal);
  useEffect(() => {
    if (effectiveResetSignal === firstResetRef.current) return;
    firstResetRef.current = effectiveResetSignal;
    publish('');
    setUnavailable(false);
    resetWidget(widgetIdRef.current);
  }, [effectiveResetSignal, publish]);

  if (!siteKey) return null;

  return (
    <div className={className} data-testid="turnstile">
      <div ref={containerRef} data-testid="turnstile-container" />
      <input type="hidden" name={TURNSTILE_FIELD} value={token} readOnly />
      {unavailable && (
        <p className="mt-2 text-sm text-gray-600" role="status">
          La vérification anti-robot n’a pas pu se charger. Rechargez la page,
          ou réessayez dans un instant.
        </p>
      )}
    </div>
  );
};

export default TurnstileWidget;
