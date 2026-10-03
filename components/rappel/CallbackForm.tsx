'use client';

import { submitCallbackRequest } from '../../lib/actions';
import { buildCallbackBody } from '../../lib/callback';
import {
  ConsentCheck,
  CONTROL,
  Field,
  Fields,
  TEXTAREA,
} from '../forms/fields';
import SubmitBlock from '../forms/SubmitBlock';
import { useFormSubmission } from '../forms/useFormSubmission';
import { TextLink } from '../ui/Button';
import { useEffect, useRef, useState, type FormEvent } from 'react';

/**
 * « Être rappelé » (R006-S02) : nom, téléphone, question, consentement, anti-robot. Pas
 * d'email ni d'adresse. Le robot rappelé, s'il y en a un, part avec le nom de sa fiche.
 */
export default function CallbackForm({
  robot,
}: {
  robot: { name: string; ficheUrl: string; slug: string } | null;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [question, setQuestion] = useState('');
  const [consent, setConsent] = useState(false);
  const submission = useFormSubmission('rappel');
  const doneRef = useRef<HTMLHeadingElement>(null);

  // Le message remplace le formulaire : on le lit tout de suite.
  useEffect(() => {
    if (submission.done) doneRef.current?.focus();
  }, [submission.done]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = buildCallbackBody({ name, phone, question, robot });
    await submission.submit((token) => submitCallbackRequest(body, token));
  }

  const panel =
    'rounded-card border border-line bg-white p-[33px] mobile:p-[23px]';

  if (submission.done) {
    return (
      <div className={panel} role="status">
        <h2 ref={doneRef} tabIndex={-1} className="mb-4 text-2xl outline-none">
          Demande envoyée
        </h2>
        <p className="mt-0 text-sm">
          Merci, nous avons bien reçu votre demande. Nous vous rappelons.
        </p>
        <TextLink href={robot ? `/robots/${robot.slug}` : '/robots'}>
          {robot ? 'Revenir à la fiche du robot' : 'Voir les robots'}
        </TextLink>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={panel}>
      <h2 className="mb-6 text-2xl">Être rappelé</h2>
      <Fields className="!grid-cols-1">
        <Field label="Nom" required>
          <input
            type="text"
            name="nom"
            autoComplete="name"
            placeholder="Votre nom"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={CONTROL}
          />
        </Field>
        <Field label="Téléphone" required>
          <input
            type="tel"
            name="telephone"
            autoComplete="tel"
            placeholder="Votre numéro de téléphone"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={CONTROL}
          />
        </Field>
        <Field label="Votre question">
          <textarea
            name="question"
            placeholder={
              robot
                ? 'Que souhaitez-vous savoir sur ce robot ?'
                : 'Que souhaitez-vous savoir ?'
            }
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className={TEXTAREA}
          />
        </Field>
      </Fields>
      <small className="mt-2.5 block text-xs text-muted">
        * Champs obligatoires.
      </small>
      <div className="mt-[25px]">
        <ConsentCheck checked={consent} onChange={setConsent} />
        <SubmitBlock
          label="Être rappelé"
          hint="un conseil, une question ? nous vous rappelons"
          action="reparobot-rappel"
          pending={submission.pending}
          waitingForTurnstile={submission.waitingForTurnstile}
          error={submission.error}
          resetSignal={submission.turnstileResetSignal}
          onToken={submission.onTurnstileToken}
        />
      </div>
    </form>
  );
}
