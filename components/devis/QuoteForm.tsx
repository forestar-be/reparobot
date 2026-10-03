'use client';

import type { AccessoriesByCategory } from '../../lib/accessories';
import { submitQuoteRequest } from '../../lib/actions';
import {
  buildQuoteRequestBody,
  computeQuote,
  EMPTY_SELECTION,
  type QuoteContact,
  type QuoteContext,
  type QuoteSelection,
} from '../../lib/quote';
import type { Robot } from '../../lib/robots';
import { Panel, PanelTitle } from '../forms/fields';
import SelectedRobot from '../forms/SelectedRobot';
import { useFormSubmission } from '../forms/useFormSubmission';
import Button, { TextLink } from '../ui/Button';
import Card from '../ui/Card';
import Eyebrow from '../ui/Eyebrow';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import QuoteContactFields from './QuoteContactFields';
import QuoteOptions from './QuoteOptions';
import QuoteSummary from './QuoteSummary';

const EMPTY_CONTACT: QuoteContact = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  postalCode: '',
  city: '',
  notes: '',
};

const STEPS = ['Configurer', 'Recevoir par email', 'Signer en ligne'];

/**
 * Formulaire de devis d'un robot choisi (R006-S01), au dessin de la maquette : trois sections
 * numérotées à gauche, récapitulatif collant à droite (sous les sections en mobile).
 */
export default function QuoteForm({
  robot,
  context,
  accessories,
}: {
  robot: Robot;
  context: QuoteContext;
  accessories: AccessoriesByCategory;
}) {
  const [selection, setSelection] = useState<QuoteSelection>(EMPTY_SELECTION);
  const [contact, setContact] = useState<QuoteContact>(EMPTY_CONTACT);
  const [consent, setConsent] = useState(false);
  const [requestId, setRequestId] = useState<number | null>(null);
  const submission = useFormSubmission('devis');
  const titleRef = useRef<HTMLHeadingElement>(null);

  const quote = useMemo(
    () => computeQuote(context, selection),
    [context, selection],
  );

  // Après l'envoi, le message remplace le formulaire : on revient en haut et on le lit.
  useEffect(() => {
    if (!submission.done) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
    titleRef.current?.focus();
  }, [submission.done]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = buildQuoteRequestBody(robot.inventoryId, selection, contact);
    await submission.submit(async (token) => {
      const result = await submitQuoteRequest(body, token);
      if (result.success) setRequestId(result.data?.requestId ?? null);
      return result;
    });
  }

  if (submission.done) {
    return (
      <div className="wrap pb-16">
        <section className="pt-[23px] pb-8 mobile:pt-3.5">
          <Eyebrow>Demande envoyée</Eyebrow>
          <h1
            ref={titleRef}
            tabIndex={-1}
            className="max-w-[760px] text-[54px] outline-none tablet:text-5xl mobile:text-[40px] mobile:leading-[1.07]"
          >
            Votre devis arrive par email.
          </h1>
        </section>
        <Card tone="sage" className="max-w-[720px] p-[29px] mobile:p-5">
          <div role="status">
            <p className="mt-0 text-sm">
              Merci pour votre demande. Vous recevrez votre devis personnalisé
              par email dans les plus brefs délais, avec un bon de commande
              signable électroniquement pour finaliser votre achat.
            </p>
            {requestId !== null && (
              <p className="text-sm">
                <b>Numéro de demande :</b> #{requestId}. Conservez-le pour toute
                communication avec notre équipe.
              </p>
            )}
          </div>
          <ol className="my-5 list-decimal space-y-2 pl-5 text-xs">
            <li>Vous recevez un email avec le détail de votre devis.</li>
            <li>Cliquez sur le lien pour signer votre bon de commande.</li>
            <li>
              Si l’email n’arrive pas, vérifiez vos courriers indésirables ou
              contactez-nous.
            </li>
            <li>
              Notre équipe vous contacte ensuite pour programmer la livraison et
              l’installation.
            </li>
          </ol>
          <div className="flex flex-wrap items-center gap-6">
            <Button href="/robots">Voir les autres robots</Button>
            <TextLink href="/">Retour à l’accueil</TextLink>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="wrap">
      <section className="pt-[23px] pb-[34px] mobile:pt-3.5 mobile:pb-[25px]">
        <Eyebrow>Votre robot, votre configuration</Eyebrow>
        <h1 className="mb-0 text-[54px] tablet:text-5xl mobile:text-[40px] mobile:leading-[1.07]">
          Votre devis, en quelques minutes.
        </h1>
        <p className="mt-4 mb-0 max-w-[680px] text-sm text-muted mobile:mt-[15px] mobile:text-xs">
          Le robot est choisi. Personnalisez l’installation, puis indiquez où
          envoyer votre devis.
        </p>
        <ol
          aria-label="Les étapes"
          className="m-0 mt-6 flex list-none flex-wrap items-center gap-[22px] p-0 text-[11px] text-muted mobile:mt-[19px] mobile:gap-3 mobile:text-[9px]"
        >
          {STEPS.map((step, index) => (
            <li
              key={step}
              aria-current={index === 0 ? 'step' : undefined}
              className={`flex items-center gap-2 mobile:gap-[5px] ${
                index === 0 ? 'font-bold text-forest' : ''
              }`}
            >
              <b
                aria-hidden="true"
                className="inline-block h-[23px] w-[23px] rounded-full bg-sage text-center leading-[23px] mobile:h-[21px] mobile:w-[21px] mobile:leading-[21px]"
              >
                {index + 1}
              </b>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-[minmax(0,1fr)_370px] items-start gap-10 pb-[60px] tablet:grid-cols-[minmax(0,1fr)_310px] tablet:gap-6 mobile:grid-cols-1 mobile:gap-2 mobile:pb-8"
      >
        <div>
          <Panel aria-labelledby="devis-robot">
            <PanelTitle number="01">
              <span id="devis-robot">Votre robot</span>
            </PanelTitle>
            <SelectedRobot robot={robot} changeHref="/robots" />
          </Panel>
          <QuoteOptions
            context={context}
            accessories={accessories}
            selection={selection}
            onChange={(patch) => setSelection((s) => ({ ...s, ...patch }))}
            notes={contact.notes}
            onNotesChange={(notes) => setContact((c) => ({ ...c, notes }))}
          />
          <QuoteContactFields
            contact={contact}
            onChange={(patch) => setContact((c) => ({ ...c, ...patch }))}
          />
        </div>
        <QuoteSummary
          robot={robot}
          quote={quote}
          consent={consent}
          onConsent={setConsent}
          submission={submission}
        />
      </form>
    </div>
  );
}
