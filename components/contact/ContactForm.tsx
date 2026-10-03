'use client';

import { submitContactRequest } from '../../lib/actions';
import {
  buildContactBody,
  CONTACT_CHANNELS,
  EMPTY_CONTACT,
  validateContact,
  type ContactChannel,
  type ContactErrors,
  type ContactField,
} from '../../lib/contact-request';
import { formatEuro } from '../../lib/format';
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
import dayjs from 'dayjs';

type TextKey =
  | 'lastName'
  | 'firstName'
  | 'email'
  | 'phone'
  | 'address'
  | 'postalCode'
  | 'city'
  | 'installationDate'
  | 'message';

/**
 * « Être recontacté » (D-25) : le visiteur choisit d'être recontacté par téléphone (par défaut)
 * ou par email ; le champ du canal choisi est obligatoire, l'autre facultatif. Nom, prénom,
 * adresse d'installation, date souhaitée, entretien annuel (si le forfait a un prix), message,
 * consentement et anti-robot. Le robot, s'il y en a un, part avec le nom de sa fiche.
 */
export default function ContactForm({
  robot,
  maintenancePrice,
}: {
  robot: { name: string; ficheUrl: string; slug: string } | null;
  /** Prix du forfait BASE de l'entretien annuel ; `null` : la case n'est pas proposée. */
  maintenancePrice: number | null;
}) {
  const [values, setValues] = useState(EMPTY_CONTACT);
  const [errors, setErrors] = useState<ContactErrors>({});
  // « Demain au plus tôt » : calculé dans le navigateur, la page étant mise en cache.
  const [minDate, setMinDate] = useState('');
  const submission = useFormSubmission('contact');
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setMinDate(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  }, []);

  // Le message remplace le formulaire : on le lit tout de suite.
  useEffect(() => {
    if (submission.done) doneRef.current?.focus();
  }, [submission.done]);

  const set = <K extends keyof typeof EMPTY_CONTACT>(
    key: K,
    value: (typeof EMPTY_CONTACT)[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    // Une erreur se retire dès que le champ est modifié.
    if (key in errors) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key as ContactField];
        return next;
      });
    }
  };

  const chooseChannel = (channel: ContactChannel) => {
    setValues((current) => ({ ...current, channel }));
    // Le canal change le champ obligatoire : les erreurs de téléphone et d'email n'ont plus de sens.
    setErrors((current) => ({
      ...current,
      phone: undefined,
      email: undefined,
    }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = { ...values, maintenancePrice, robot };
    const found = validateContact(input, minDate);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Le focus va au premier champ en erreur, une fois l'erreur rendue.
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    const body = buildContactBody(input);
    await submission.submit((token) => submitContactRequest(body, token));
  }

  const panel =
    'rounded-card border border-line bg-white p-[33px] mobile:p-[23px]';

  if (submission.done) {
    return (
      <div className={panel} role="status">
        <h2 ref={doneRef} tabIndex={-1} className="mb-4 text-2xl outline-none">
          Demande envoyée
        </h2>
        <p className="mt-0 text-[15px]">
          Merci, nous avons bien reçu votre demande. Nous vous recontactons
          {values.channel === 'Email' ? ' par email' : ' par téléphone'}.
        </p>
        <TextLink href={robot ? `/robots/${robot.slug}` : '/robots'}>
          {robot ? 'Revenir à la fiche du robot' : 'Voir les robots'}
        </TextLink>
      </div>
    );
  }

  const invalid = (field: ContactField) => ({
    'aria-invalid': errors[field] ? (true as const) : undefined,
  });
  const text = (key: TextKey) => ({
    name: key,
    value: values[key],
    onChange: (event: { target: { value: string } }) =>
      set(key, event.target.value),
    className: CONTROL,
  });

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className={panel}>
      <h2 className="mb-6 text-2xl">Être recontacté</h2>

      <fieldset className="m-0 mb-[21px] min-w-0 border-0 p-0">
        <legend className="mb-2.5 p-0 text-sm font-semibold text-ink">
          Comment préférez-vous être recontacté ?
        </legend>
        <div className="flex gap-3 mobile:flex-col mobile:gap-2.5">
          {CONTACT_CHANNELS.map((channel) => (
            <label
              key={channel}
              className={`flex min-h-[46px] flex-1 cursor-pointer items-center gap-2.5 rounded-[5px] border px-3.5 text-sm font-semibold ${
                values.channel === channel
                  ? 'border-forest bg-sage'
                  : 'border-field bg-white'
              }`}
            >
              <input
                type="radio"
                name="canal"
                value={channel}
                checked={values.channel === channel}
                onChange={() => chooseChannel(channel)}
                className="h-4 w-4 shrink-0 accent-forest"
              />
              {channel}
            </label>
          ))}
        </div>
      </fieldset>

      <Fields>
        <Field label="Nom" required error={errors.lastName}>
          <input
            type="text"
            autoComplete="family-name"
            required
            aria-required="true"
            {...invalid('lastName')}
            {...text('lastName')}
          />
        </Field>
        <Field label="Prénom">
          <input type="text" autoComplete="given-name" {...text('firstName')} />
        </Field>
        <Field
          label="Email"
          required={values.channel === 'Email'}
          error={errors.email}
        >
          <input
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.be"
            aria-required={values.channel === 'Email' ? 'true' : undefined}
            {...invalid('email')}
            {...text('email')}
          />
        </Field>
        <Field
          label="Téléphone"
          required={values.channel === 'Téléphone'}
          error={errors.phone}
        >
          <input
            type="tel"
            autoComplete="tel"
            aria-required={values.channel === 'Téléphone' ? 'true' : undefined}
            {...invalid('phone')}
            {...text('phone')}
          />
        </Field>
        <Field
          label="Adresse"
          wide
          hint="Facultatif : utile pour préparer l’installation."
        >
          <input
            type="text"
            autoComplete="street-address"
            placeholder="Rue et numéro"
            {...text('address')}
          />
        </Field>
        <Field label="Code postal">
          <input
            type="text"
            autoComplete="postal-code"
            inputMode="numeric"
            {...text('postalCode')}
          />
        </Field>
        <Field label="Ville">
          <input type="text" autoComplete="address-level2" {...text('city')} />
        </Field>
        <Field
          label="Date d’installation souhaitée"
          wide
          error={errors.installationDate}
          hint="Facultatif : à partir de demain."
        >
          <input
            type="date"
            min={minDate || undefined}
            {...invalid('installationDate')}
            {...text('installationDate')}
          />
        </Field>
        <Field label="Votre question / message" wide>
          <textarea
            placeholder={
              robot
                ? 'Que souhaitez-vous savoir sur ce robot ?'
                : 'Que souhaitez-vous savoir ?'
            }
            {...text('message')}
            className={TEXTAREA}
          />
        </Field>
      </Fields>

      {maintenancePrice !== null && (
        <label className="mt-[19px] flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            name="entretien-annuel"
            checked={values.maintenance}
            onChange={(event) => set('maintenance', event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-forest"
          />
          <span>
            Je suis intéressé par l’entretien annuel (
            {formatEuro(maintenancePrice)})
          </span>
        </label>
      )}

      <small className="mt-4 block text-sm text-muted">
        * Champs obligatoires : le nom, et le{' '}
        {values.channel === 'Email' ? 'email' : 'téléphone'} choisi pour vous
        recontacter.
      </small>
      <div className="mt-[25px]">
        <ConsentCheck
          checked={values.consent}
          onChange={(checked) => set('consent', checked)}
          error={errors.consent}
        />
        <SubmitBlock
          label="Être recontacté"
          hint="un conseil, une question ? nous vous recontactons"
          action="reparobot-contact"
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
