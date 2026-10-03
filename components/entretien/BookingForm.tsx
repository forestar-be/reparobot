'use client';

import { submitServiceRequest } from '../../lib/actions';
import {
  BRAND_SUGGESTIONS,
  buildServiceRequestBody,
  computeServiceTotal,
  groupLabel,
  groupOptions,
  priceText,
  REQUEST_TYPES,
  supplementText,
  toggleOption,
  winterOption,
  type RequestType,
} from '../../lib/service-booking';
import {
  baseOffer,
  optionOffers,
  type ServiceOffer,
} from '../../lib/service-offers';
import {
  ConsentCheck,
  CONTROL,
  Field,
  Fields,
  TEXTAREA,
} from '../forms/fields';
import SubmitBlock from '../forms/SubmitBlock';
import { useFormSubmission } from '../forms/useFormSubmission';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import dayjs from 'dayjs';
import { useBookingPreset } from './BookingProvider';

const EMPTY_CONTACT = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  robotCode: '',
  notes: '',
};

/**
 * « Réserver un passage » (R007-S02) : marque libre avec suggestions, type d'intervention, options
 * du service correspondant (choix exclusifs par groupe), date souhaitée à partir de demain,
 * coordonnées, consentement et Turnstile. Les prix viennent de `/service-offers`.
 */
export default function BookingForm({ offers }: { offers: ServiceOffer[] }) {
  const [typeIndex, setTypeIndex] = useState(0);
  const [chosenIds, setChosenIds] = useState<number[]>([]);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [date, setDate] = useState('');
  const [minDate, setMinDate] = useState('');
  const [contact, setContact] = useState(EMPTY_CONTACT);
  const [consent, setConsent] = useState(false);
  const submission = useFormSubmission('entretien');
  const doneRef = useRef<HTMLHeadingElement>(null);
  const preset = useBookingPreset();

  const current = REQUEST_TYPES[typeIndex];
  const base = baseOffer(offers, current.service);
  const options = useMemo(
    () => optionOffers(offers, current.service),
    [offers, current.service],
  );
  const { free, groups } = useMemo(() => groupOptions(options), [options]);
  const chosen = options.filter((o) => chosenIds.includes(o.id));
  const total = computeServiceTotal(base, chosen);

  // « Demain au plus tôt » : calculé dans le navigateur, la page étant mise en cache.
  useEffect(() => {
    setMinDate(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  }, []);

  // Une carte de forfait présélectionne le type d'intervention et l'hivernage.
  useEffect(() => {
    if (!preset) return;
    const winter = winterOption(offers);
    if (preset.kind === 'repair') {
      setTypeIndex(REQUEST_TYPES.findIndex((t) => t.type === 'Réparation'));
      setChosenIds([]);
    } else {
      setTypeIndex(REQUEST_TYPES.findIndex((t) => t.type === 'Entretien'));
      setChosenIds(preset.kind === 'winter' && winter ? [winter.id] : []);
    }
  }, [preset, offers]);

  useEffect(() => {
    if (submission.done) doneRef.current?.focus();
  }, [submission.done]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = buildServiceRequestBody({
      type: current.type as RequestType,
      brand,
      model,
      base,
      fallbackLabel: current.fallbackLabel,
      chosen,
      date,
      contact,
    });
    await submission.submit((token) => submitServiceRequest(body, token));
  }

  const panel =
    'rounded-card border border-line bg-white p-[29px] mobile:p-5 tablet:p-6';
  const bind = (key: keyof typeof EMPTY_CONTACT) => ({
    name: key,
    value: contact[key],
    onChange: (event: { target: { value: string } }) =>
      setContact((c) => ({ ...c, [key]: event.target.value })),
    className: CONTROL,
  });

  if (submission.done) {
    return (
      <div className={panel} role="status">
        <h3 ref={doneRef} tabIndex={-1} className="mb-3 text-2xl outline-none">
          Demande envoyée
        </h3>
        <p className="m-0 text-sm">
          Merci, nous avons bien reçu votre demande. L’atelier vous recontacte
          pour convenir du passage.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={panel}>
      <Fields>
        <Field label="Prénom" required>
          <input
            type="text"
            autoComplete="given-name"
            required
            {...bind('firstName')}
          />
        </Field>
        <Field label="Nom" required>
          <input
            type="text"
            autoComplete="family-name"
            required
            {...bind('lastName')}
          />
        </Field>
        <Field label="Téléphone" required>
          <input type="tel" autoComplete="tel" required {...bind('phone')} />
        </Field>
        <Field label="Email" required>
          <input
            type="email"
            autoComplete="email"
            required
            {...bind('email')}
          />
        </Field>
        <Field label="Marque du robot" required>
          <input
            type="text"
            name="marque"
            list="marques-robots"
            autoComplete="off"
            placeholder="Husqvarna, Worx, Gardena…"
            required
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className={CONTROL}
          />
          <datalist id="marques-robots">
            {BRAND_SUGGESTIONS.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </Field>
        <Field label="Modèle, si vous le connaissez">
          <input
            type="text"
            name="modele"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            className={CONTROL}
          />
        </Field>
        <Field label="Votre besoin" wide>
          <select
            name="besoin"
            value={typeIndex}
            onChange={(event) => {
              setTypeIndex(Number(event.target.value));
              setChosenIds([]);
            }}
            className={CONTROL}
          >
            {REQUEST_TYPES.map((type, index) => (
              <option key={type.type} value={index}>
                {baseOffer(offers, type.service)?.label ?? type.fallbackLabel}
                {' · '}
                {priceText(baseOffer(offers, type.service)?.price ?? null)}
              </option>
            ))}
          </select>
        </Field>
      </Fields>

      {options.length > 0 && (
        <fieldset className="m-0 mt-[21px] min-w-0 border-0 p-0">
          <legend className="mb-[11px] p-0 text-base font-semibold tracking-[-0.045em]">
            Services supplémentaires
          </legend>
          {free.map((option) => (
            <label
              key={option.id}
              className="my-[11px] flex items-start gap-[9px] text-sm"
            >
              <input
                type="checkbox"
                name={`option-${option.id}`}
                checked={chosenIds.includes(option.id)}
                onChange={(event) =>
                  setChosenIds((ids) =>
                    toggleOption(options, ids, option.id, event.target.checked),
                  )
                }
                className="mt-0.5 h-4 w-4 shrink-0 accent-forest"
              />
              <span>
                {option.label} · {supplementText(option.price)}
              </span>
            </label>
          ))}
          {groups.map((group) => {
            const selected = group.options.find((o) =>
              chosenIds.includes(o.id),
            );
            return (
              <div key={group.key} className="mt-[17px]">
                <Field label={groupLabel(group.key)}>
                  <select
                    name={`groupe-${group.key}`}
                    value={selected?.id ?? ''}
                    onChange={(event) => {
                      const id = Number(event.target.value);
                      setChosenIds((ids) => {
                        const without = ids.filter(
                          (c) => !group.options.some((o) => o.id === c),
                        );
                        return id
                          ? toggleOption(options, without, id, true)
                          : without;
                      });
                    }}
                    className={CONTROL}
                  >
                    <option value="">Aucun</option>
                    {group.options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label} · {supplementText(option.price)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            );
          })}
        </fieldset>
      )}

      <div className="mt-[21px]">
        <Fields>
          <Field
            label="Date souhaitée"
            hint="Facultatif : le passage est convenu avec l’atelier après votre demande."
          >
            <input
              type="date"
              name="date"
              min={minDate || undefined}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={CONTROL}
            />
          </Field>
          <Field label="Code du robot, si vous le connaissez">
            <input type="text" {...bind('robotCode')} />
          </Field>
          <Field
            label="Adresse"
            hint="Utile pour un enlèvement ou un déplacement à domicile."
            wide
          >
            <input
              type="text"
              autoComplete="street-address"
              {...bind('address')}
            />
          </Field>
          <Field label="Un détail à nous transmettre ?" wide>
            <textarea
              name="notes"
              placeholder="Décrivez le problème ou vos disponibilités…"
              value={contact.notes}
              onChange={(event) =>
                setContact((c) => ({ ...c, notes: event.target.value }))
              }
              className={TEXTAREA}
            />
          </Field>
        </Fields>
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="my-[18px] flex items-baseline justify-between gap-4 border-t border-line py-[15px] text-sm"
      >
        <span>{total.label}</span>
        <strong className="text-[21px] tracking-[-0.04em] text-forest">
          {total.text}
        </strong>
      </div>

      <ConsentCheck checked={consent} onChange={setConsent} />
      <SubmitBlock
        label="Réserver un passage"
        hint="Le passage est convenu avec l’atelier après votre demande."
        action="reparobot-entretien"
        hintAlign="left"
        pending={submission.pending}
        waitingForTurnstile={submission.waitingForTurnstile}
        error={submission.error}
        resetSignal={submission.turnstileResetSignal}
        onToken={submission.onTurnstileToken}
      />
    </form>
  );
}
