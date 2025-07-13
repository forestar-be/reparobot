'use client';

import contactData from '../config/contact.json';
import { trackEvent } from '../utils/analytics';
import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import ClientMapWrapper from './ClientMapWrapper';
import SectionDivider from './SectionDivider';

interface ContactProps {
  address: string;
  email: string;
  phone: string;
  latitude: number;
  longitude: number;
}

const Contact = (): JSX.Element => {
  const [contact] = useState<ContactProps[]>(contactData);

  const handlePhoneClick = () => {
    trackEvent('contact_phone_click', 'contact_interaction', 'phone_number', 1);
  };

  const handleEmailClick = () => {
    trackEvent(
      'contact_email_click',
      'contact_interaction',
      'email_address',
      1,
    );
  };

  const handleAddressClick = () => {
    trackEvent(
      'contact_address_click',
      'contact_interaction',
      'physical_address',
      1,
    );
  };

  return (
    <section
      id="contact"
      className="section-padding-small relative overflow-hidden bg-gradient-to-b from-primary-50 to-gray-50"
      aria-labelledby="contact-title"
    >
      {/* Top Divider */}
      <SectionDivider variant="gradient" position="top" />

      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 transform rounded-full bg-primary-200 opacity-15 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 transform rounded-full bg-primary-300 opacity-20 blur-2xl"></div>
        {/* Geometric pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute left-20 top-20 h-32 w-32 rounded-full border border-primary-300"></div>
          <div className="absolute bottom-20 right-20 h-24 w-24 rotate-45 rounded-lg border border-primary-400"></div>
        </div>
      </div>

      <div className="container-custom relative pt-8">
        {/* Title Section */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1.5 text-xs font-medium text-primary-700">
            📞 Parlons-en
          </div>
          <h2
            id="contact-title"
            className="mb-4 font-display text-3xl font-bold tracking-tight text-gray-900 md:text-4xl"
          >
            Contactez-Nous
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
            Notre équipe d'experts est à votre disposition pour répondre à
            toutes vos questions
          </p>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-primary-400 to-primary-600"></div>
        </div>

        {/* Contact Information */}
        {contact.slice(0, 1).map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2"
          >
            {/* Contact Details Section */}
            <div className="order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
                {/* Background pattern */}
                <div className="bg-grid-pattern absolute inset-0 opacity-5"></div>

                <div className="relative z-10">
                  <h3 className="mb-8 font-display text-2xl font-bold text-gray-900">
                    Nos coordonnées
                  </h3>

                  <div className="space-y-8">
                    {/* Phone */}
                    <div className="group">
                      <div className="flex items-center">
                        <div className="mr-5 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-100 transition-colors duration-300 group-hover:bg-primary-200">
                          <Phone className="h-6 w-6 text-primary-500" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 text-sm font-medium text-gray-500">
                            Téléphone
                          </div>
                          <a
                            href={`tel:${item.phone}`}
                            className="text-xl font-bold text-gray-900 transition-colors hover:text-primary-500"
                            title={`Call us at ${item.phone}`}
                            onClick={handlePhoneClick}
                          >
                            {item.phone}
                          </a>
                          <p className="mt-1 text-sm text-gray-500">
                            Appelez-nous maintenant
                          </p>
                        </div>
                        <div className="ml-4 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
                            <svg
                              className="h-4 w-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="group">
                      <div className="flex items-center">
                        <div className="mr-5 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-100 transition-colors duration-300 group-hover:bg-primary-200">
                          <Mail className="h-6 w-6 text-primary-500" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 text-sm font-medium text-gray-500">
                            Email
                          </div>
                          <a
                            href={`mailto:${item.email}`}
                            className="break-all text-xl font-bold text-gray-900 transition-colors hover:text-primary-500"
                            title={`Email us at ${item.email}`}
                            onClick={handleEmailClick}
                          >
                            {item.email}
                          </a>
                          <p className="mt-1 text-sm text-gray-500">
                            Écrivez-nous
                          </p>
                        </div>
                        <div className="ml-4 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
                            <svg
                              className="h-4 w-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="group">
                      <div className="flex items-start">
                        <div className="mr-5 mt-1 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-100 transition-colors duration-300 group-hover:bg-primary-200">
                          <MapPin className="h-6 w-6 text-primary-500" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 text-sm font-medium text-gray-500">
                            Adresse
                          </div>
                          <a
                            href="https://maps.app.goo.gl/eqBWhMaT8fHnsjg4A"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xl font-bold text-gray-900 transition-colors hover:text-primary-500"
                            title={`Find us at ${item.address}`}
                            onClick={handleAddressClick}
                          >
                            {item.address}
                          </a>
                          <p className="mt-1 text-sm text-gray-500">
                            Visitez notre atelier
                          </p>
                        </div>
                        <div className="ml-4 mt-2 self-start opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
                            <svg
                              className="h-4 w-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="mt-8 border-t border-gray-100 pt-8">
                    <h4 className="mb-4 text-lg font-semibold text-gray-900">
                      Actions rapides
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <a
                        href={`tel:${item.phone}`}
                        className="rounded-xl bg-primary-500 px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-primary-600"
                        onClick={handlePhoneClick}
                      >
                        📞 Appeler
                      </a>
                      <a
                        href={`mailto:${item.email}`}
                        className="rounded-xl bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                        onClick={handleEmailClick}
                      >
                        ✉️ Email
                      </a>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary-300/30 to-transparent"></div>
                <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-gradient-to-tr from-primary-200/40 to-transparent"></div>
              </div>
            </div>

            {/* Map Section */}
            <div className="order-1 lg:order-2">
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                <div className="border-b border-gray-100 p-6">
                  <h3 className="flex items-center gap-2 font-display text-xl font-bold text-gray-900">
                    <span className="text-2xl">📍</span>
                    Notre localisation
                  </h3>
                  <p className="mt-1 text-gray-600">
                    Trouvez-nous facilement sur la carte
                  </p>
                </div>
                <div className="relative">
                  <ClientMapWrapper
                    latitude={item.latitude}
                    longitude={item.longitude}
                    address={item.address}
                    isDarkMode={false}
                  />
                  {/* Map overlay for better interaction */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm">
                      <div className="text-sm font-medium text-gray-900">
                        🚗 Parking disponible
                      </div>
                      <div className="text-xs text-gray-600">
                        Accès facile en voiture
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Additional Info */}
        <div className="mt-12">
          <div className="rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 p-8 text-center text-white">
            <h3 className="mb-4 font-display text-2xl font-bold">
              Horaires d'ouverture
            </h3>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-xl bg-white/10 p-4">
                <div className="mb-2 font-semibold">Lundi - Vendredi</div>
                <div className="text-primary-100">7h00 - 18h00</div>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <div className="mb-2 font-semibold">Samedi</div>
                <div className="text-primary-100">8h00 - 18h00</div>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <div className="mb-2 font-semibold">Dimanche</div>
                <div className="text-primary-100">Fermé</div>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-primary-100">
                💡 Interventions d'urgence disponibles
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
