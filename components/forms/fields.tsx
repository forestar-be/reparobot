'use client';

/**
 * Éléments communs des trois formulaires (devis, rappel, passage à l'atelier), au dessin de
 * la maquette : champs à libellé toujours visible, cadre blanc arrondi à 10 px, consentement
 * avec le détail de l'utilisation des données (`config/conditions.json`).
 */
import conditions from '../../config/conditions.json';
import type { HTMLAttributes, ReactNode } from 'react';

/** Classes d'un champ de saisie, d'une liste ou d'une zone de texte. */
export const CONTROL =
  'min-h-[46px] w-full rounded-[5px] border border-field bg-white px-3 py-2.5 text-[13px] text-ink placeholder:text-xs placeholder:font-normal placeholder:text-[#828a80] mobile:text-[13px]';

export const TEXTAREA = `${CONTROL} min-h-[109px] resize-y`;

/** Cadre blanc d'une section de formulaire. */
export function Panel({
  children,
  className = '',
  ...rest
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`mb-[22px] rounded-card border border-line bg-white p-[29px] tablet:p-6 mobile:mb-[17px] mobile:p-5 ${className}`}
      {...rest}
    >
      {children}
    </section>
  );
}

/** Titre numéroté d'une section (« 01 Votre robot »). */
export function PanelTitle({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center gap-[15px] mobile:mb-[18px] mobile:gap-2.5">
      <span
        aria-hidden="true"
        className="flex h-[29px] w-[29px] items-center justify-center rounded-full border border-line text-[11px] text-forest mobile:h-[26px] mobile:w-[26px]"
      >
        {number}
      </span>
      <h2 className="text-[22px] mobile:text-xl">{children}</h2>
    </div>
  );
}

/** Grille de champs : deux colonnes, une seule en mobile. */
export function Fields({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-2 gap-[19px] mobile:grid-cols-1 mobile:gap-[17px] ${className}`}
    >
      {children}
    </div>
  );
}

/** Libellé + champ. L'astérisque est visuel : l'obligation passe par l'attribut `required` du champ. */
export function Field({
  label,
  required = false,
  wide = false,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  wide?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label
      className={`block min-w-0 text-xs font-semibold text-ink mobile:text-[11px] ${
        wide ? 'col-span-full' : ''
      }`}
    >
      {label}
      {required && <span aria-hidden="true"> *</span>}
      <span className="mt-[7px] block font-normal">{children}</span>
      {hint && (
        <span className="mt-1.5 block text-[11px] font-normal text-muted">
          {hint}
        </span>
      )}
    </label>
  );
}

/** Consentement obligatoire, avec le détail de l'utilisation des données sous la case. */
export function ConsentCheck({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const terms = conditions.terms_and_conditions;
  return (
    <div className="my-4">
      <label className="flex items-start gap-2.5 text-[11px] font-normal mobile:text-[10px]">
        <input
          type="checkbox"
          name="consentement"
          required
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-forest"
        />
        <span>
          J’accepte que Forestar utilise mes coordonnées pour répondre à cette
          demande.
        </span>
      </label>
      <details className="mt-2 pl-[26px] text-[10px] leading-relaxed text-muted">
        <summary className="cursor-pointer font-semibold text-forest">
          Comment vos données sont utilisées
        </summary>
        <div className="mt-2 space-y-2">
          {[terms.data_use, terms.data_protection, terms.data_retention].map(
            (term) => (
              <p key={term.title} className="m-0">
                <b className="text-ink">{term.title}.</b> {term.content}
              </p>
            ),
          )}
        </div>
      </details>
    </div>
  );
}

/** Message d'erreur du formulaire, annoncé aux lecteurs d'écran. */
export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mt-4 rounded-action border border-[#d9a49b] bg-[#fbeeeb] p-4 text-xs text-[#7a2a1f]"
    >
      {message}
    </p>
  );
}
