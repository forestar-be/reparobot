import type { ReactNode } from 'react';

/** Une ligne de choix du devis : case, titre, précision et prix alignés à droite. */
export default function OptionRow({
  title,
  description,
  cost,
  checked,
  onChange,
  name,
  children,
}: {
  title: string;
  description?: string;
  cost: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name: string;
  /** Contenu sous la ligne (longueur du câble) : hors du libellé, il a son propre champ. */
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-line last:border-b-0">
      <label className="flex items-start gap-[13px] py-[17px] mobile:gap-2.5 mobile:py-4">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-[5px] h-[17px] w-[17px] shrink-0 accent-forest"
        />
        <span className="flex-1">
          <b className="mb-[3px] block text-sm">{title}</b>
          {description && (
            <span className="block text-sm text-muted">{description}</span>
          )}
        </span>
        <span className="text-sm font-bold whitespace-nowrap text-forest">
          {cost}
        </span>
      </label>
      {children}
    </div>
  );
}
