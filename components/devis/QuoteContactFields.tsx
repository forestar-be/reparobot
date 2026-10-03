'use client';

import type { QuoteContact } from '../../lib/quote';
import { CONTROL, Field, Fields, Panel, PanelTitle } from '../forms/fields';

/** Section 03 : où envoyer le devis. Prénom, nom et email obligatoires. */
export default function QuoteContactFields({
  contact,
  onChange,
}: {
  contact: QuoteContact;
  onChange: (patch: Partial<QuoteContact>) => void;
}) {
  const bind = (key: keyof QuoteContact) => ({
    name: key,
    value: contact[key],
    onChange: (event: { target: { value: string } }) =>
      onChange({ [key]: event.target.value }),
    className: CONTROL,
  });
  return (
    <Panel aria-labelledby="devis-contact">
      <PanelTitle number="03">
        <span id="devis-contact">Où envoyer votre devis ?</span>
      </PanelTitle>
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
        <Field label="Email" required>
          <input
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.be"
            required
            {...bind('email')}
          />
        </Field>
        <Field label="Téléphone">
          <input type="tel" autoComplete="tel" {...bind('phone')} />
        </Field>
        <Field label="Adresse d’installation" wide>
          <input
            type="text"
            autoComplete="street-address"
            placeholder="Rue et numéro"
            {...bind('address')}
          />
        </Field>
        <Field label="Code postal">
          <input
            type="text"
            autoComplete="postal-code"
            inputMode="numeric"
            {...bind('postalCode')}
          />
        </Field>
        <Field label="Ville">
          <input type="text" autoComplete="address-level2" {...bind('city')} />
        </Field>
      </Fields>
      <p className="mt-[18px] mb-0 text-xs text-muted">
        * Champs obligatoires. Votre adresse nous aide à préparer
        l’installation.
      </p>
    </Panel>
  );
}
