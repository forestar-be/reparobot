import {
  getSiteInfo,
  hoursLines,
  mapsHref,
  telHref,
} from '../../lib/site-info';
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
  const [street, ...city] = info.address.split(/,\s*/);
  const coordinates = (
    <div className="grid grid-cols-2 gap-[25px] mobile:grid-cols-1 mobile:gap-5">
      <div>
        <b className="mb-2 block text-sm">Venez nous rencontrer</b>
        <address className="text-sm leading-[1.6] text-muted not-italic">
          {street}
          <br />
          {city.join(', ')}
        </address>
        <a
          href={mapsHref(info)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-block text-sm font-bold text-forest underline"
        >
          Voir sur la carte
          <span className="sr-only"> (nouvel onglet)</span>
        </a>
      </div>
      <div>
        <b className="mb-2 block text-sm">Appelez le magasin</b>
        <a
          href={telHref(info)}
          className="mb-1 block text-sm font-bold text-forest"
        >
          {info.phoneDisplay}
        </a>
        {hoursLines(info.hours).map((line) => (
          <p key={line} className="m-0 text-sm text-muted">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
  return (
    <section
      id={anchor ? 'contact' : undefined}
      aria-labelledby={anchor ? 'contact-title' : 'contact-title-bis'}
      className="grid grid-cols-2 items-center gap-[60px] border-t border-line py-[42px] tablet:gap-8 mobile:grid-cols-1 mobile:gap-6 mobile:py-[30px]"
    >
      <div>
        <Eyebrow>À deux pas de votre jardin</Eyebrow>
        <h2
          id={anchor ? 'contact-title' : 'contact-title-bis'}
          className="mb-3 text-[28px] mobile:text-[27px]"
        >
          Parlons-en à l’atelier.
        </h2>
        <p className="m-0 text-[15px] text-muted">
          Une équipe locale pour choisir, installer et entretenir votre robot.
        </p>
        {/* Avec la carte, les coordonnées passent sous le titre : la carte tient une colonne. */}
        {map ? <div className="mt-7 mobile:mt-5">{coordinates}</div> : null}
      </div>
      {map ? (
        <ContactMap
          latitude={info.latitude}
          longitude={info.longitude}
          address={info.address}
        />
      ) : (
        coordinates
      )}
    </section>
  );
}
