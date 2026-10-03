'use client';

/**
 * Cycle d'envoi commun aux trois formulaires : jeton Turnstile relayé à la server action (jamais
 * vérifié ici, D-04), réarmement du widget après un refus, message d'erreur, et `trackLead` après
 * la seule réponse de succès du serveur (R004, AC-03).
 */
import { trackLead, type LeadType } from '../../lib/analytics';
import { turnstileEnabled, turnstileMessage } from '../../lib/turnstile';
import { useState } from 'react';

export interface SubmitResult {
  success: boolean;
  error?: string;
  code?: string;
}

const GENERIC_ERROR =
  "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer ou nous appeler.";

export function useFormSubmission(lead: LeadType) {
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Tant que la protection est en service et que le widget n'a rien rendu, pas d'envoi (AC-04).
  const waitingForTurnstile = turnstileEnabled() && !turnstileToken;

  /** Envoie ; rend `true` si le serveur a accepté la demande. */
  async function submit(
    send: (turnstileToken: string) => Promise<SubmitResult>,
  ): Promise<boolean> {
    if (pending) return false;
    setPending(true);
    setError(null);
    try {
      const result = await send(turnstileToken);
      if (!result.success) {
        const refus = turnstileMessage(result.code);
        if (refus) {
          // Un jeton refusé est un jeton consommé : réarmer le widget, garder la saisie (AC-05/AC-06).
          setTurnstileResetSignal((precedent) => precedent + 1);
          setError(refus);
        } else {
          setError(result.error || GENERIC_ERROR);
        }
        return false;
      }
      setDone(true);
      trackLead(lead);
      return true;
    } catch (cause) {
      console.error('Envoi du formulaire impossible', cause);
      setError(GENERIC_ERROR);
      return false;
    } finally {
      setPending(false);
    }
  }

  return {
    pending,
    error,
    done,
    waitingForTurnstile,
    turnstileResetSignal,
    onTurnstileToken: setTurnstileToken,
    submit,
  };
}
