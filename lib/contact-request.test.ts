/**
 * D-25 — validation et corps de « Être recontacté » : fonctions pures.
 */
import { describe, expect, it } from 'vitest';
import {
  buildContactBody,
  EMPTY_CONTACT,
  isValidEmail,
  isValidPhone,
  validateContact,
  type ContactInput,
} from './contact-request';

const base: ContactInput = {
  ...EMPTY_CONTACT,
  lastName: 'Dupont',
  consent: true,
  maintenancePrice: 107,
  robot: null,
};

describe('validateContact', () => {
  it('téléphone choisi : le téléphone est obligatoire, pas l’email', () => {
    expect(validateContact(base)).toEqual({
      phone: 'Indiquez votre numéro de téléphone.',
    });
    expect(validateContact({ ...base, phone: '0470 11 22 33' })).toEqual({});
  });

  it('email choisi : l’email est obligatoire, pas le téléphone', () => {
    const input = { ...base, channel: 'Email' as const };
    expect(validateContact(input)).toEqual({
      email: 'Indiquez votre adresse email.',
    });
    expect(validateContact({ ...input, email: 'a@b.be' })).toEqual({});
  });

  it('l’autre canal, une fois rempli, doit avoir un format valide', () => {
    const tel = { ...base, phone: '0470 11 22 33', email: 'pas-un-email' };
    expect(validateContact(tel).email).toMatch(/ne semble pas valide/);
    const mail = {
      ...base,
      channel: 'Email' as const,
      email: 'a@b.be',
      phone: 'abc',
    };
    expect(validateContact(mail).phone).toMatch(/ne semble pas valide/);
  });

  it('exige le nom et le consentement', () => {
    const errors = validateContact({
      ...base,
      lastName: '  ',
      phone: '0470 11 22 33',
      consent: false,
    });
    expect(Object.keys(errors).sort()).toEqual(['consent', 'lastName']);
  });

  it('refuse une date d’installation avant demain', () => {
    const input = { ...base, phone: '0470 11 22 33' };
    expect(
      validateContact(
        { ...input, installationDate: '2026-10-04' },
        '2026-10-05',
      ).installationDate,
    ).toMatch(/à partir de demain/);
    expect(
      validateContact(
        { ...input, installationDate: '2026-10-05' },
        '2026-10-05',
      ),
    ).toEqual({});
    expect(
      validateContact({ ...input, installationDate: 'hier' }).installationDate,
    ).toMatch(/ne semble pas valide/);
  });
});

describe('formats', () => {
  it.each(['0470 11 22 33', '+32 470 11 22 33', '067/83.07.06', '(02) 123'])(
    'accepte le téléphone %s',
    (value) => expect(isValidPhone(value)).toBe(true),
  );
  it.each(['abc', '12 ab', ''])('refuse le téléphone « %s »', (value) =>
    expect(isValidPhone(value)).toBe(false),
  );
  it.each(['a@b.be', ' prenom.nom@example.com '])(
    'accepte l’email %s',
    (value) => expect(isValidEmail(value)).toBe(true),
  );
  it.each(['a@b', '@b.be', 'a b@c.be', ''])('refuse l’email « %s »', (value) =>
    expect(isValidEmail(value)).toBe(false),
  );
});

describe('buildContactBody', () => {
  it('sans robot : type Contact, canal, champs remplis seulement', () => {
    expect(buildContactBody({ ...base, phone: ' 0470 11 22 33 ' })).toEqual({
      'Type de demande': 'Contact',
      'Recontacter par': 'Téléphone',
      Nom: 'Dupont',
      'Numéro de téléphone': '0470 11 22 33',
      'Conditions acceptées': true,
    });
  });

  it('l’entretien annuel n’est envoyé que coché ET avec un prix', () => {
    const on = { ...base, phone: '1', maintenance: true };
    expect(buildContactBody(on)).toHaveProperty('Entretien annuel');
    expect(
      buildContactBody({ ...on, maintenancePrice: null }),
    ).not.toHaveProperty('Entretien annuel');
    expect(buildContactBody({ ...on, maintenance: false })).not.toHaveProperty(
      'Entretien annuel',
    );
  });
});
