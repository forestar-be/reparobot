import ContactForm from '../../components/contact/ContactForm';
import { ContactCoordinates } from '../../components/site/ContactBand';
import ContactMap from '../../components/site/ContactMap';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Eyebrow from '../../components/ui/Eyebrow';
import TrustStrip from '../../components/ui/TrustStrip';
import { baseOffer, getServiceOffers } from '../../lib/service-offers';
import { siteUrl } from '../../lib/site';
import { getSiteInfo } from '../../lib/site-info';
import { buildContactPage, jsonLd } from '../../lib/structured-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contactez l’atelier Forestar à Braine-le-Comte : adresse, horaires, téléphone, ou laissez-nous un message pour être recontacté par téléphone ou par email.',
  alternates: { canonical: siteUrl('/contact') },
};

/**
 * `/contact` : la page de contact générique (retour du PO, 4 oct. 2026). Coordonnées,
 * horaires et carte du magasin, et le formulaire « Être recontacté » sans robot en tête :
 * même envoi (`Type de demande: Contact`), titre et bouton propres à cette page.
 */
export default async function ContactPage() {
  const [info, offers] = await Promise.all([getSiteInfo(), getServiceOffers()]);
  const maintenancePrice = baseOffer(offers, 'MAINTENANCE')?.price ?? null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(buildContactPage(info)) }}
      />
      <Breadcrumb items={[{ label: 'Contact' }]} />
      <div className="wrap">
        <div className="grid grid-cols-[0.95fr_1fr] items-start gap-[75px] pt-7 pb-[55px] tablet:gap-10 mobile:grid-cols-1 mobile:gap-[26px] mobile:pt-[15px] mobile:pb-[30px]">
          <div className="grid gap-7 mobile:gap-5">
            <div>
              <Eyebrow className="!mb-4">Atelier et magasin</Eyebrow>
              <h1 className="mb-[22px] text-[49px] mobile:mb-4 mobile:text-[35px]">
                Nous contacter
              </h1>
              <p className="m-0 max-w-[460px] text-[15px] text-muted">
                Une question sur un robot, un entretien ou une installation ?
                Passez au magasin, appelez-nous, ou laissez-nous un message :
                nous vous recontactons par téléphone ou par email.
              </p>
            </div>
            <ContactCoordinates info={info} />
            <ContactMap
              latitude={info.latitude}
              longitude={info.longitude}
              address={info.address}
            />
          </div>
          <ContactForm
            robot={null}
            maintenancePrice={maintenancePrice}
            title="Écrivez-nous"
            submitLabel="Envoyer ma demande"
            hint="nous vous recontactons par téléphone ou par email"
          />
        </div>
        <TrustStrip />
      </div>
    </>
  );
}
