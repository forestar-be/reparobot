import BookingForm from '../../components/entretien/BookingForm';
import {
  BookingProvider,
  PresetLink,
  type PresetKind,
} from '../../components/entretien/BookingProvider';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Card from '../../components/ui/Card';
import Eyebrow from '../../components/ui/Eyebrow';
import Glyph from '../../components/ui/Glyph';
import TrustStrip from '../../components/ui/TrustStrip';
import { formatEuro } from '../../lib/format';
import {
  amountOrQuote,
  supplementText,
  winterOption,
  winterPackage,
} from '../../lib/service-booking';
import {
  baseOffer,
  getServiceOffers,
  optionOffers,
} from '../../lib/service-offers';
import { getSiteInfo, telHref } from '../../lib/site-info';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Entretien et réparation de robot tondeuse, toutes marques',
  description:
    'Entretien annuel, hivernage et réparation de votre robot tondeuse, Husqvarna ou une autre marque. Atelier à Braine-le-Comte, enlèvement à domicile dans un rayon de 30 km.',
  alternates: { canonical: '/entretien-reparation' },
};

/** Une phrase se termine par un point, même quand le gérant n'en a pas écrit. */
const withFinalStop = (text: string): string =>
  /[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`;

interface PackageCard {
  kind: PresetKind;
  eyebrow: string;
  title: string;
  amount: string;
  text: string;
  highlight?: boolean;
}

/**
 * `/entretien-reparation` (R007) : l'atelier toutes marques, les forfaits lus dans
 * `/service-offers` (aucun prix en dur, « sur devis » quand le prix est nul), et le formulaire
 * « Réserver un passage » dans la page.
 */
export default async function EntretienPage() {
  const [offers, info] = await Promise.all([getServiceOffers(), getSiteInfo()]);
  const maintenance = baseOffer(offers, 'MAINTENANCE');
  const repair = baseOffer(offers, 'REPAIR');
  const winter = winterOption(offers);
  const winterTotal = winterPackage(maintenance, winter);

  const cards: PackageCard[] = [
    {
      kind: 'maintenance',
      eyebrow: 'Le rendez-vous annuel',
      title: maintenance?.label ?? 'Entretien annuel',
      amount: amountOrQuote(maintenance?.price ?? null),
      text:
        maintenance?.description ??
        'Le forfait pour entretenir votre robot à l’atelier.',
      highlight: true,
    },
  ];
  if (winterTotal && maintenance && winter) {
    cards.push({
      kind: 'winter',
      eyebrow: 'Pour passer l’hiver',
      title: 'Entretien + hivernage',
      amount: formatEuro(winterTotal.total),
      text: `${maintenance.label} (${formatEuro(maintenance.price ?? 0)}) et, en plus : ${winter.label} (${formatEuro(winter.price ?? 0)}).`,
    });
  }
  cards.push({
    kind: 'repair',
    eyebrow: 'Pour retrouver la tonte',
    title: repair?.label ?? 'Réparation',
    amount: amountOrQuote(repair?.price ?? null),
    text: [
      withFinalStop(repair?.description ?? 'Réparation de votre robot'),
      repair?.price == null ? 'Le montant est chiffré par l’atelier.' : '',
    ]
      .filter(Boolean)
      .join(' '),
  });

  const supplements = optionOffers(offers, 'MAINTENANCE');

  return (
    <>
      <Breadcrumb items={[{ label: 'Entretien & réparation' }]} />
      <div className="wrap">
        <section className="grid grid-cols-[1.3fr_1fr] items-center gap-[70px] pt-[25px] pb-[35px] tablet:gap-10 mobile:grid-cols-1 mobile:gap-[23px] mobile:pt-[18px] mobile:pb-6">
          <div>
            <Eyebrow>L’atelier Forestar · toutes marques</Eyebrow>
            <h1 className="mb-[21px] text-[56px] tablet:text-5xl mobile:mb-[18px] mobile:text-[43px]">
              Votre robot mérite
              <br />
              de bonnes mains.
            </h1>
            <p className="m-0 max-w-[600px] text-sm text-muted mobile:text-xs">
              Un entretien avant la saison, une panne ou une installation à
              reprendre ? Retrouvez un atelier local à Braine-le-Comte, depuis
              2008.
            </p>
          </div>
          <Card tone="forest" className="p-7 mobile:p-[23px]">
            <Glyph
              name="tool"
              className="mb-[17px] h-[31px] w-[31px] mobile:mb-3 mobile:h-[26px] mobile:w-[26px]"
            />
            <h2 className="mb-3.5 text-[25px] mobile:text-[23px]">
              Husqvarna ou une autre marque.
            </h2>
            <p className="m-0 text-xs text-on-dark-muted">
              L’atelier entretient et répare les robots de toutes marques.
              Expliquez-nous votre besoin et nous préparons votre passage.
            </p>
          </Card>
        </section>

        <BookingProvider>
          <section
            aria-label="Forfaits d’entretien"
            className={`mt-2.5 mb-[35px] grid gap-5 mobile:mt-1 mobile:mb-[25px] mobile:grid-cols-1 mobile:gap-[15px] ${
              cards.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
            }`}
          >
            {cards.map((card) => (
              <Card
                key={card.kind}
                tone={card.highlight ? 'sage' : 'white'}
                className={`flex flex-col p-7 mobile:p-6 ${
                  card.highlight ? '!border-[#9baa92]' : ''
                }`}
              >
                <div className="mb-[18px] min-h-[17px] text-[10px] font-extrabold tracking-[0.16em] text-forest uppercase mobile:mb-[13px] mobile:min-h-0">
                  {card.eyebrow}
                </div>
                <h2 className="mb-[17px] text-2xl mobile:mb-[13px] mobile:text-[25px]">
                  {card.title}
                </h2>
                <div
                  className={`mb-3 leading-tight font-bold tracking-[-0.05em] ${
                    card.amount === 'Sur devis'
                      ? 'text-[27px]'
                      : 'text-4xl mobile:text-[33px]'
                  }`}
                >
                  {card.amount}
                  {card.amount !== 'Sur devis' && (
                    <small className="text-[11px] font-normal tracking-normal">
                      {' '}
                      TVAC
                    </small>
                  )}
                </div>
                <p className="mb-[22px] flex-1 text-xs text-muted">
                  {card.text}
                </p>
                <PresetLink kind={card.kind}>Réserver un passage</PresetLink>
              </Card>
            ))}
          </section>

          {supplements.length > 0 && (
            <ul
              aria-label="Suppléments"
              className="m-0 mb-[55px] grid list-none grid-cols-3 gap-[15px] border-y border-line p-0 py-6 tablet:grid-cols-2 mobile:mb-[34px] mobile:grid-cols-1 mobile:gap-[13px]"
            >
              {supplements.map((option) => (
                <li
                  key={option.id}
                  className="flex justify-between gap-[15px] pr-5 text-[11px] mobile:pr-0"
                >
                  <span>{option.label}</span>
                  <strong className="whitespace-nowrap text-forest">
                    {supplementText(option.price)}
                  </strong>
                </li>
              ))}
              <li className="flex justify-between gap-[15px] pr-5 text-[11px] mobile:pr-0">
                <span>Tous les forfaits et suppléments</span>
                <strong className="whitespace-nowrap text-forest">TVAC</strong>
              </li>
            </ul>
          )}

          <section
            id="passage"
            aria-labelledby="passage-titre"
            className="grid scroll-mt-[30px] grid-cols-[0.85fr_1.15fr] items-start gap-[65px] pb-[45px] tablet:gap-10 mobile:grid-cols-1 mobile:gap-[22px] mobile:pb-[26px]"
          >
            <div>
              <Eyebrow>Un rendez-vous avec l’atelier</Eyebrow>
              <h2
                id="passage-titre"
                className="mb-[22px] text-[37px] mobile:mb-[17px] mobile:text-[32px]"
              >
                Réserver un passage
              </h2>
              <p className="m-0 max-w-[400px] text-[13px] text-muted mobile:text-xs">
                Indiquez la marque de votre robot et ce dont vous avez besoin.
                Nous vous recontactons pour convenir du passage.
              </p>
              <ul className="my-[27px] list-none p-0 text-xs mobile:my-5 mobile:text-[11px]">
                {[
                  {
                    icon: 'check' as const,
                    text: 'Toutes les marques sont les bienvenues.',
                  },
                  {
                    icon: 'check' as const,
                    text: 'Enlèvement à domicile dans un rayon de 30 km de Braine-le-Comte (hors Bruxelles).',
                  },
                  { icon: 'pin' as const, text: info.address },
                ].map((item) => (
                  <li
                    key={item.text}
                    className="my-[17px] flex items-start gap-2.5 mobile:my-3.5"
                  >
                    <Glyph
                      name={item.icon}
                      className="h-[17px] w-[17px] text-forest"
                    />
                    {item.text}
                  </li>
                ))}
                <li className="my-[17px] flex items-start gap-2.5">
                  <Glyph
                    name="phone"
                    className="h-[17px] w-[17px] text-forest"
                  />
                  <span>
                    Une question ?{' '}
                    <a href={telHref(info)} className="font-bold text-forest">
                      {info.phoneDisplay}
                    </a>
                  </span>
                </li>
              </ul>
            </div>
            <BookingForm offers={offers} />
          </section>
        </BookingProvider>

        <TrustStrip />
      </div>
    </>
  );
}
