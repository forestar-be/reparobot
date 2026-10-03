'use client';

import { formatEuro } from '../../lib/format';
import type { Quote } from '../../lib/quote';
import type { Robot } from '../../lib/robots';
import { ConsentCheck } from '../forms/fields';
import SelectedRobot from '../forms/SelectedRobot';
import SubmitBlock from '../forms/SubmitBlock';
import Glyph from '../ui/Glyph';

const amountText = (amount: number | null): string =>
  amount === null ? 'prix confirmé dans le devis' : formatEuro(amount);

/** « Installation non comprise » ou « Installation comprise : X € » (D-14). */
export function installationNote(quote: Quote): string {
  if (!quote.installationIncluded) return 'Installation non comprise.';
  return `Installation comprise : ${amountText(quote.installationAmount)}.`;
}

/**
 * Récapitulatif : collant sur ordinateur, sous les sections en mobile. Il porte le
 * consentement, le widget anti-robot et le bouton « Recevoir mon devis ».
 */
export default function QuoteSummary({
  robot,
  quote,
  consent,
  onConsent,
  submission,
}: {
  robot: Robot;
  quote: Quote;
  consent: boolean;
  onConsent: (value: boolean) => void;
  submission: {
    pending: boolean;
    waitingForTurnstile: boolean;
    error: string | null;
    turnstileResetSignal: number;
    onTurnstileToken: (token: string) => void;
  };
}) {
  const partial = quote.unpriced.length > 0;
  return (
    <aside
      aria-labelledby="devis-recap"
      className="sticky top-6 rounded-card border border-[#d1dacb] bg-sage p-[29px] tablet:p-6 mobile:static mobile:p-[23px]"
    >
      <h2
        id="devis-recap"
        className="mb-[23px] text-[23px] mobile:mb-[21px] mobile:text-[22px]"
      >
        Votre récapitulatif
      </h2>
      <SelectedRobot robot={robot} variant="compact" />
      <dl className="my-[23px] mobile:my-5">
        {quote.lines.map((line) => (
          <div
            key={line.key}
            className="flex justify-between gap-3 border-b border-[#cdd7c6] py-2.5 text-sm"
          >
            <dt>
              {line.label}
              {line.detail && (
                <span className="text-muted"> ({line.detail})</span>
              )}
            </dt>
            <dd
              className={`m-0 text-right font-semibold ${
                line.amount === null
                  ? 'text-sm font-normal text-muted'
                  : 'whitespace-nowrap'
              }`}
            >
              {amountText(line.amount)}
            </dd>
          </div>
        ))}
      </dl>
      <div aria-live="polite" aria-atomic="true">
        <div className="flex items-baseline justify-between gap-[15px] pt-3 pb-1">
          <span className="text-sm font-bold">
            {partial ? 'Sous-total TVAC' : 'Total TVAC'}
          </span>
          <b className="text-[29px] tracking-[-0.05em]">
            {formatEuro(quote.total)}
          </b>
        </div>
        <p className="m-0 text-sm text-muted">
          {installationNote(quote)}
          {partial && (
            <>
              {' '}
              Prix confirmé dans le devis : {quote.unpriced.join(', ')}. Le
              total final y sera détaillé.
            </>
          )}
        </p>
      </div>
      <div className="mt-[25px]">
        <ConsentCheck checked={consent} onChange={onConsent} />
        <SubmitBlock
          label="Recevoir mon devis"
          hint="gratuit, par email, à signer en ligne"
          action="reparobot-devis"
          pending={submission.pending}
          waitingForTurnstile={submission.waitingForTurnstile}
          error={submission.error}
          resetSignal={submission.turnstileResetSignal}
          onToken={submission.onTurnstileToken}
        />
      </div>
      <p className="mt-5 mb-0 flex gap-2.5 border-t border-[#cdd7c6] pt-[17px] text-sm">
        <Glyph name="mail" className="mt-0.5 h-[18px] w-[18px]" />
        Vous recevez le détail de votre configuration et pouvez signer votre
        devis en ligne.
      </p>
    </aside>
  );
}
