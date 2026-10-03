import { getSiteInfo, hoursLines, telHref } from '../../lib/site-info';
import Eyebrow from '../ui/Eyebrow';
import ContactMap from './ContactMap';

/**
 * Contact : adresse, horaires, téléphone (site-info). `id="contact"` sert l'ancre du
 * menu ; une seule section de ce nom par page (l'accueil).
 */
export default async function ContactBand({
  anchor = false,
  map = false,
}: {
  anchor?: boolean;
  map?: boolean;
}) {
  const info = await getSiteInfo();
  const mapHref = `https://www.openstreetmap.org/?mlat=${info.latitude}&mlon=${info.longitude}#map=17/${info.latitude}/${info.longitude}`;
  const [street, ...city] = info.address.split(/,\s*/);
  return (
    <section
      id={anchor ? 'contact' : undefined}
      aria-labelledby={anchor ? 'contact-title' : 'contact-title-bis'}
      className="grid grid-cols-2 items-center gap-[60px] border-t border-line py-[42px] mobile:grid-cols-1 mobile:gap-6 mobile:py-[30px]"
    >
      <div>
        <Eyebrow>À deux pas de votre jardin</Eyebrow>
        <h2
          id={anchor ? 'contact-title' : 'contact-title-bis'}
          className="mb-3 text-[28px] mobile:text-[27px]"
        >
          Parlons-en à l’atelier.
        </h2>
        <p className="m-0 text-[13px] text-muted">
          Une équipe locale pour choisir, installer et entretenir votre robot.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-[25px] mobile:gap-5">
        <div>
          <b className="mb-2 block text-[13px] mobile:text-[11px]">
            Venez nous rencontrer
          </b>
          <address className="text-[13px] leading-[1.6] text-muted not-italic mobile:text-[10px]">
            {street}
            <br />
            {city.join(', ')}
          </address>
          <a
            href={mapHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-block text-[13px] font-bold text-forest underline mobile:text-[11px]"
          >
            Voir sur la carte
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
        </div>
        <div>
          <b className="mb-2 block text-[13px] mobile:text-[11px]">
            Appelez le magasin
          </b>
          <a
            href={telHref(info)}
            className="mb-1 block text-[13px] font-bold text-forest mobile:text-[11px]"
          >
            {info.phoneDisplay}
          </a>
          {hoursLines(info.hours).map((line) => (
            <p
              key={line}
              className="m-0 text-[12px] text-muted mobile:text-[10px]"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
      {map ? (
        <div className="col-span-2 mobile:col-span-1">
          <ContactMap
            latitude={info.latitude}
            longitude={info.longitude}
            address={info.address}
          />
        </div>
      ) : null}
    </section>
  );
}
