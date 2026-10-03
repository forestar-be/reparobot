'use client';

import TurnstileWidget from '../TurnstileWidget';
import Button from '../ui/Button';
import { FormAlert } from './fields';

/** Widget anti-robot, message d'erreur, bouton d'envoi et sa sous-ligne. */
export default function SubmitBlock({
  label,
  hint,
  pending,
  waitingForTurnstile,
  error,
  resetSignal,
  onToken,
  action,
  hintAlign = 'center',
}: {
  label: string;
  hint: string;
  pending: boolean;
  waitingForTurnstile: boolean;
  error: string | null;
  resetSignal: number;
  onToken: (token: string) => void;
  /** Nom de l'action, journalisé par le garde Turnstile. */
  action: string;
  hintAlign?: 'center' | 'left';
}) {
  return (
    <div>
      <TurnstileWidget
        action={action}
        onToken={onToken}
        resetSignal={resetSignal}
        className="my-4"
      />
      <FormAlert message={error} />
      <Button
        type="submit"
        full
        disabled={pending || waitingForTurnstile}
        aria-busy={pending}
        className="mt-4 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {pending ? 'Envoi en cours…' : label}
      </Button>
      {waitingForTurnstile && !pending && (
        <p role="status" className="mt-2 text-center text-[10px] text-muted">
          Vérification anti-robot en cours…
        </p>
      )}
      <p
        className={`my-3 text-[10px] text-muted ${
          hintAlign === 'center' ? 'text-center' : ''
        }`}
      >
        {hint}
      </p>
    </div>
  );
}
