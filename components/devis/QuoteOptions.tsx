'use client';

import type { AccessoriesByCategory } from '../../lib/accessories';
import { formatEuro } from '../../lib/format';
import type { Accessory, QuoteContext, QuoteSelection } from '../../lib/quote';
import { CONTROL, Field, Panel, PanelTitle, TEXTAREA } from '../forms/fields';
import OptionRow from './OptionRow';

type AccessoryKey = 'pluginId' | 'antennaId' | 'shelterId';

const CATEGORIES: ReadonlyArray<{
  key: AccessoryKey;
  list: keyof AccessoriesByCategory;
  label: string;
}> = [
  { key: 'antennaId', list: 'antennas', label: 'Antenne' },
  { key: 'shelterId', list: 'shelters', label: 'Abri' },
  { key: 'pluginId', list: 'plugins', label: 'Plugin' },
];

const costOf = (price: number | null): string =>
  price === null ? 'À chiffrer' : formatEuro(price);

/**
 * Section 02 : installation (optionnelle, non cochée, D-14), accessoires réels de
 * `/accessories` (D-16), câble au mètre, support d'antenne, et les questions sur le jardin.
 */
export default function QuoteOptions({
  context,
  accessories,
  selection,
  onChange,
  notes,
  onNotesChange,
}: {
  context: QuoteContext;
  accessories: AccessoriesByCategory;
  selection: QuoteSelection;
  onChange: (patch: Partial<QuoteSelection>) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}) {
  return (
    <Panel aria-labelledby="devis-options">
      <PanelTitle number="02">
        <span id="devis-options">Accessoires &amp; installation</span>
      </PanelTitle>

      <OptionRow
        name="installation"
        title="Installation professionnelle"
        description="Placement du robot compris, paramétrage et mise en service."
        cost={
          context.placement === null
            ? 'Prix confirmé dans le devis'
            : formatEuro(context.placement)
        }
        checked={selection.installation}
        onChange={(installation) => onChange({ installation })}
      />

      {CATEGORIES.map(({ key, list, label }) => {
        const items: Accessory[] = accessories[list];
        if (items.length === 0) return null;
        return (
          <div key={key}>
            {items.length > 1 && (
              <p className="mt-4 mb-0 text-[10px] font-extrabold tracking-[0.16em] text-forest uppercase">
                {label} · un seul choix
              </p>
            )}
            {items.map((item) => (
              <OptionRow
                key={item.id}
                name={`${key}-${item.id}`}
                title={item.name.trim()}
                cost={costOf(item.sellingPrice)}
                checked={selection[key] === item.id}
                onChange={(on) => onChange({ [key]: on ? item.id : null })}
              />
            ))}
          </div>
        );
      })}

      <OptionRow
        name="cable"
        title="Câble périphérique"
        description="Pour une configuration filaire. Longueur indicative."
        cost={
          context.wirePerMeter === null
            ? 'Prix confirmé dans le devis'
            : `${formatEuro(context.wirePerMeter)} / m`
        }
        checked={selection.wire}
        onChange={(wire) => onChange({ wire })}
      >
        {selection.wire && (
          <div className="mb-4 pl-[30px] mobile:pl-[27px]">
            <Field label="Longueur du câble, en mètres" required>
              <input
                type="number"
                name="longueur-cable"
                inputMode="numeric"
                min={1}
                max={3000}
                step={1}
                required
                value={selection.wireLength || ''}
                onChange={(event) =>
                  onChange({ wireLength: Number(event.target.value) || 0 })
                }
                className={`${CONTROL} !w-[110px]`}
              />
            </Field>
          </div>
        )}
      </OptionRow>

      <OptionRow
        name="support-antenne"
        title="Support d’antenne"
        description="À ajouter si une antenne doit être fixée sur un support."
        cost={
          context.antennaSupportPrice === null
            ? 'Prix confirmé dans le devis'
            : formatEuro(context.antennaSupportPrice)
        }
        checked={selection.antennaSupport}
        onChange={(antennaSupport) => onChange({ antennaSupport })}
      />

      <div className="mt-5">
        <Field label="Votre jardin, vos questions" wide>
          <textarea
            name="notes"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder="Accès, zones de tonte, contraintes particulières…"
            className={TEXTAREA}
          />
        </Field>
      </div>
    </Panel>
  );
}
