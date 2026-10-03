/**
 * « Être recontacté » (D-25) : validation et corps de `POST /submit-form`.
 *
 * Le contact se fait par téléphone OU par email, au choix du visiteur : le champ du canal choisi
 * est obligatoire, l'autre facultatif. Le serveur compose le sujet « Demande de contact —
 * <Robot> » avec `Type de demande` et `Robot`, et la fiche du robot arrive dans `Lien de la
 * fiche`. Sans robot choisi, ces deux clés sont omises et le sujet garde son préfixe seul.
 *
 * Fonctions pures, sans réseau : le composant ne fait qu'afficher ce que renvoie la validation.
 */
import { formatEuro } from './format';
import { frenchDate } from './service-booking';

export type ContactChannel = 'Téléphone' | 'Email';

export const CONTACT_CHANNELS: ContactChannel[] = ['Téléphone', 'Email'];

export interface ContactInput {
  channel: ContactChannel;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  /** Date d'installation souhaitée, AAAA-MM-JJ, ou vide. */
  installationDate: string;
  /** Case « entretien annuel » cochée. */
  maintenance: boolean;
  /** Prix du forfait d'entretien annuel (case présente seulement s'il est connu). */
  maintenancePrice: number | null;
  message: string;
  consent: boolean;
  /** Robot concerné, ou `null` pour une demande sans robot précis. */
  robot: { name: string; ficheUrl: string } | null;
}

export const EMPTY_CONTACT: Omit<ContactInput, 'maintenancePrice' | 'robot'> = {
  channel: 'Téléphone',
  lastName: '',
  firstName: '',
  email: '',
  phone: '',
  address: '',
  postalCode: '',
  city: '',
  installationDate: '',
  maintenance: false,
  message: '',
  consent: false,
};

export type ContactField =
  'lastName' | 'email' | 'phone' | 'installationDate' | 'consent';

export type ContactErrors = Partial<Record<ContactField, string>>;

const PHONE_FORMAT = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidPhone = (value: string): boolean =>
  PHONE_FORMAT.test(value.trim());
export const isValidEmail = (value: string): boolean =>
  EMAIL_FORMAT.test(value.trim());

/**
 * Erreurs de saisie, par champ. Le canal choisi rend son champ obligatoire ; l'autre champ,
 * s'il est rempli, doit tout de même avoir un format valide (on ne transmet pas un email bancal).
 * `minDate` (AAAA-MM-JJ, demain) vient du navigateur : la page est mise en cache.
 */
export function validateContact(
  input: ContactInput,
  minDate?: string,
): ContactErrors {
  const errors: ContactErrors = {};
  if (!input.lastName.trim()) errors.lastName = 'Indiquez votre nom.';

  const phone = input.phone.trim();
  const email = input.email.trim();
  if (input.channel === 'Téléphone' && !phone) {
    errors.phone = 'Indiquez votre numéro de téléphone.';
  } else if (phone && !isValidPhone(phone)) {
    errors.phone = 'Ce numéro de téléphone ne semble pas valide.';
  }
  if (input.channel === 'Email' && !email) {
    errors.email = 'Indiquez votre adresse email.';
  } else if (email && !isValidEmail(email)) {
    errors.email = 'Cette adresse email ne semble pas valide.';
  }

  if (input.installationDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.installationDate)) {
      errors.installationDate = 'Cette date ne semble pas valide.';
    } else if (minDate && input.installationDate < minDate) {
      errors.installationDate = 'Choisissez une date à partir de demain.';
    }
  }

  if (!input.consent) {
    errors.consent =
      'Acceptez l’utilisation de vos coordonnées pour continuer.';
  }
  return errors;
}

/** Corps de `POST /submit-form` : paires libellé → valeur, champs vides omis. */
export function buildContactBody(
  input: ContactInput,
): Record<string, string | boolean> {
  const body: Record<string, string | boolean> = {
    'Type de demande': 'Contact',
  };
  if (input.robot) {
    body['Robot'] = input.robot.name;
    body['Lien de la fiche'] = input.robot.ficheUrl;
  }
  body['Recontacter par'] = input.channel;
  const put = (key: string, value: string) => {
    if (value.trim()) body[key] = value.trim();
  };
  put('Nom', input.lastName);
  put('Prénom', input.firstName);
  put('Adresse e-mail', input.email);
  put('Numéro de téléphone', input.phone);
  put('Adresse', input.address);
  put('Code postal', input.postalCode);
  put('Ville', input.city);
  if (input.installationDate) {
    body["Date d'installation souhaitée"] = frenchDate(input.installationDate);
  }
  if (input.maintenance && input.maintenancePrice !== null) {
    body['Entretien annuel'] = `Oui (${formatEuro(input.maintenancePrice)})`;
  }
  put('Message', input.message);
  body['Conditions acceptées'] = true;
  return body;
}
