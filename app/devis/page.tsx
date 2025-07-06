'use client';

import React from 'react';
import Link from 'next/link';


const DevisPage: React.FC = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': 'https://reparobot.be/devis',
    name: 'Devis Immédiat Robot Tondeuse',
    description:
      "Service de devis immédiat pour l'achat et l'installation de robots tondeuses Husqvarna et Gardena en Belgique",
    provider: {
      '@type': 'Organization',
      '@id': 'https://reparobot.be',
      name: 'Forestar | Reparobot',
      url: 'https://reparobot.be',
      logo: 'https://reparobot.be/images/logo/logo-70x70.png',
      telephone: '+3267830706',
      address: {
        '@type': 'PostalAddress',
        streetAddress: "160 Chaussée d'ecaussinnes",
        addressLocality: 'Braine le comte',
        postalCode: '7090',
        addressCountry: 'BE',
      },
    },
    areaServed: {
      '@type': 'Country',
      name: 'Belgique',
    },
    serviceType: 'Vente et installation robot tondeuse',
    category: 'Jardinage et Entretien',
    brand: ['Husqvarna', 'Gardena'],
    offers: {
      '@type': 'Offer',
      description:
        'Devis gratuit et personnalisé pour robot tondeuse avec installation',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString(),
      itemCondition: 'https://schema.org/NewCondition',
    },
    additionalType: 'https://schema.org/QuoteAction',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Robots Tondeuses Husqvarna & Gardena',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Robot Tondeuse Husqvarna',
            brand: 'Husqvarna',
            category: 'Robot Tondeuse',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Robot Tondeuse Gardena',
            brand: 'Gardena',
            category: 'Robot Tondeuse',
          },
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-blue-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Header Section */}
      <div className="section-padding-large relative border-b border-primary-200/30 bg-gradient-to-r from-white/10 via-white/15 to-primary-200/20 pt-32 backdrop-blur-sm">
        <div className="bg-grid-pattern absolute inset-0 opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-300/20 via-transparent to-blue-300/20"></div>

        <div className="container-custom relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1.5 text-xs font-medium text-primary-700 md:mb-6 md:px-4 md:py-2 md:text-sm">
              ⚡ Devis Immédiat Digital
            </div>

            <h1 className="mb-4 font-display text-3xl font-bold tracking-tight text-white md:mb-6 md:text-5xl lg:text-6xl">
              Devis Immédiat - Achat Robot
            </h1>

            <p className="mb-6 px-4 text-base leading-relaxed text-gray-200 md:mb-8 md:px-0 md:text-xl">
              Obtenez votre devis personnalisé pour l'achat d'un robot tondeuse
              avec installation facultative. Signez immédiatement par email pour
              une commande 100% digitale.
            </p>

            <div className="flex flex-col gap-3 px-4 sm:flex-row sm:justify-center md:gap-4 md:px-0">
              <Link
                href="/devis/demande"
                className="btn-primary inline-flex items-center justify-center whitespace-nowrap px-6 py-3 text-base md:px-8 md:py-4 md:text-lg"
                aria-label="Créer mon devis pour robot tondeuse"
              >
                Créer mon devis
                <svg
                  className="ml-2 h-4 w-4 flex-shrink-0 md:h-5 md:w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>

              <a
                href="#comment-ca-marche"
                className="btn-secondary px-6 py-3 text-base md:px-8 md:py-4 md:text-lg"
                aria-label="Voir comment fonctionne le devis immédiat"
              >
                Comment ça marche
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="section-padding-medium relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/50 to-primary-50 py-8 md:py-20">
        <div className="bg-grid-pattern absolute inset-0 opacity-5"></div>
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary-200/20 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl"></div>
        <div className="container-custom relative z-10">
          <div className="mb-6 px-4 text-center md:mb-16 md:px-0">
            <h2 className="mb-3 font-display text-2xl font-bold text-gray-900 md:mb-4 md:text-3xl lg:text-4xl">
              Pourquoi choisir notre Devis Immédiat ?
            </h2>
            <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
              Une solution moderne pour l'achat de votre robot tondeuse
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            <div className="group rounded-2xl border border-gray-200/50 bg-white/70 p-4 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl md:p-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg transition-all duration-300 group-hover:shadow-xl md:mb-6 md:h-20 md:w-20">
                <svg
                  className="h-8 w-8 text-white md:h-10 md:w-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-lg font-bold text-gray-900 md:mb-4 md:text-xl">
                Rapidité Immédiate
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                Devis d'achat généré en moins de 5 minutes avec prix et options
                d'installation
              </p>
            </div>

            <div className="group rounded-2xl border border-gray-200/50 bg-white/70 p-4 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl md:p-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg transition-all duration-300 group-hover:shadow-xl md:mb-6 md:h-20 md:w-20">
                <svg
                  className="h-8 w-8 text-white md:h-10 md:w-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-lg font-bold text-gray-900 md:mb-4 md:text-xl">
                Signature Immédiate
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                Signez électroniquement votre bon de commande directement depuis
                votre email
              </p>
            </div>

            <div className="group rounded-2xl border border-gray-200/50 bg-white/70 p-4 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl md:p-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg transition-all duration-300 group-hover:shadow-xl md:mb-6 md:h-20 md:w-20">
                <svg
                  className="h-8 w-8 text-white md:h-10 md:w-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-lg font-bold text-gray-900 md:mb-4 md:text-xl">
                100% Sécurisé
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                Signature électronique légalement reconnue et documents cryptés
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section
        id="comment-ca-marche"
        className="section-padding-medium relative overflow-hidden bg-white py-12 md:py-24"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 via-transparent to-blue-600/5"></div>
        <div className="absolute right-10 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-primary-200/30 to-blue-200/30 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-200/30 to-green-200/30 blur-3xl"></div>
        <div className="container-custom relative z-10">
          <div className="mb-6 px-4 text-center md:mb-16 md:px-0">
            <h2 className="mb-4 font-display text-2xl font-bold text-gray-900 md:mb-6 md:text-3xl lg:text-4xl">
              Comment ça marche ?
            </h2>
            <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
              Un processus simple en 4 étapes pour obtenir votre devis signé
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <div className="group rounded-xl border border-primary-200/50 bg-gradient-to-br from-primary-50 to-primary-100/50 p-4 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-6">
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg transition-all duration-300 group-hover:shadow-xl md:mb-6 md:h-20 md:w-20">
                <span className="text-xl font-bold md:text-2xl">1</span>
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 opacity-25 blur transition-opacity group-hover:opacity-40"></div>
              </div>
              <h3 className="mb-2 text-base font-bold text-gray-900 md:mb-3 md:text-lg">
                Décrivez vos besoins
              </h3>
              <p className="text-xs leading-relaxed text-gray-600 md:text-sm">
                Choisissez votre robot et spécifiez vos besoins d'installation
              </p>
            </div>

            <div className="group rounded-xl border border-green-200/50 bg-gradient-to-br from-emerald-50 to-green-100/50 p-4 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-6">
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-lg transition-all duration-300 group-hover:shadow-xl md:mb-6 md:h-20 md:w-20">
                <span className="text-xl font-bold md:text-2xl">2</span>
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-600 to-green-700 opacity-25 blur transition-opacity group-hover:opacity-40"></div>
              </div>
              <h3 className="mb-2 text-base font-bold text-gray-900 md:mb-3 md:text-lg">
                Devis automatique
              </h3>
              <p className="text-xs leading-relaxed text-gray-600 md:text-sm">
                Notre système calcule le prix du robot et des options
                d'installation
              </p>
            </div>

            <div className="group rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-100/50 p-4 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-6">
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg transition-all duration-300 group-hover:shadow-xl md:mb-6 md:h-20 md:w-20">
                <span className="text-xl font-bold md:text-2xl">3</span>
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 opacity-25 blur transition-opacity group-hover:opacity-40"></div>
              </div>
              <h3 className="mb-2 text-base font-bold text-gray-900 md:mb-3 md:text-lg">
                Réception par email
              </h3>
              <p className="text-xs leading-relaxed text-gray-600 md:text-sm">
                Vous recevez immédiatement votre devis d'achat PDF dans votre
                boîte mail
              </p>
            </div>

            <div className="group rounded-xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-violet-100/50 p-4 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-6">
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-violet-700 text-white shadow-lg transition-all duration-300 group-hover:shadow-xl md:mb-6 md:h-20 md:w-20">
                <span className="text-xl font-bold md:text-2xl">4</span>
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-violet-700 opacity-25 blur transition-opacity group-hover:opacity-40"></div>
              </div>
              <h3 className="mb-2 text-base font-bold text-gray-900 md:mb-3 md:text-lg">
                Signature en un clic
              </h3>
              <p className="text-xs leading-relaxed text-gray-600 md:text-sm">
                Signez votre bon de commande électroniquement, sans impression
                nécessaire
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's included in the quote */}
      <section className="section-padding-medium relative overflow-hidden bg-gradient-to-br from-slate-800 via-gray-800 to-primary-800 py-12 md:py-24">
        <div className="bg-grid-pattern absolute inset-0 opacity-10"></div>
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-gradient-to-br from-primary-400/20 to-purple-400/20 blur-3xl"></div>
        <div className="container-custom relative z-10">
          <div className="mb-6 px-4 text-center md:mb-16 md:px-0">
            <h2 className="mb-4 font-display text-2xl font-bold text-white md:mb-6 md:text-3xl lg:text-4xl">
              Que comprend votre devis d'achat ?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <div className="group rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-8">
              <div className="mb-3 flex items-center gap-3 md:mb-4 md:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 transition-all duration-300 group-hover:from-orange-200 group-hover:to-orange-300 md:h-14 md:w-14">
                  <span className="text-2xl md:text-3xl">🤖</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 md:text-xl">
                  Robot tondeuse
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                Prix du robot Husqvarna choisi parmi notre gamme de 14 modèles
              </p>
            </div>

            <div className="group rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-8">
              <div className="mb-3 flex items-center gap-3 md:mb-4 md:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 transition-all duration-300 group-hover:from-blue-200 group-hover:to-blue-300 md:h-14 md:w-14">
                  <span className="text-2xl md:text-3xl">🔧</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 md:text-xl">
                  Installation complète
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                Pose du câble périphérique, paramétrage et mise en service
                (facultatif)
              </p>
            </div>

            <div className="group rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-8">
              <div className="mb-3 flex items-center gap-3 md:mb-4 md:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-200 transition-all duration-300 group-hover:from-green-200 group-hover:to-emerald-300 md:h-14 md:w-14">
                  <span className="text-2xl md:text-3xl">📏</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 md:text-xl">
                  Câble périphérique
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                Fourniture du câble selon la superficie de votre terrain
              </p>
            </div>

            <div className="group rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-8">
              <div className="mb-3 flex items-center gap-3 md:mb-4 md:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 transition-all duration-300 group-hover:from-purple-200 group-hover:to-purple-300 md:h-14 md:w-14">
                  <span className="text-2xl md:text-3xl">📡</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 md:text-xl">
                  Support d'antenne
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                Installation du support d'antenne si nécessaire (en option)
              </p>
            </div>

            <div className="group rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-8">
              <div className="mb-3 flex items-center gap-3 md:mb-4 md:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-100 to-amber-200 transition-all duration-300 group-hover:from-yellow-200 group-hover:to-amber-300 md:h-14 md:w-14">
                  <span className="text-2xl md:text-3xl">🎓</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 md:text-xl">
                  Formation
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                Explication du fonctionnement et des réglages de base
              </p>
            </div>

            <div className="group rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-8">
              <div className="mb-3 flex items-center gap-3 md:mb-4 md:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-teal-200 transition-all duration-300 group-hover:from-cyan-200 group-hover:to-teal-300 md:h-14 md:w-14">
                  <span className="text-2xl md:text-3xl">🛡️</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 md:text-xl">
                  Garantie
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                Garantie constructeur et service après-vente inclus
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding-medium relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 py-12 text-white md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/50 via-primary-700/50 to-primary-800/50"></div>
        <div className="bg-grid-pattern absolute inset-0 opacity-10"></div>
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="container-custom relative z-10">
          <div className="mx-auto max-w-4xl px-4 text-center md:px-0">
            <h2 className="mb-4 font-display text-2xl font-bold md:mb-6 md:text-4xl lg:text-5xl">
              Prêt à obtenir votre devis d'achat ?
            </h2>
            <p className="mb-8 text-base leading-relaxed text-primary-100 md:mb-10 md:text-xl">
              Rejoignez plus de 500 clients qui nous font confiance pour l'achat
              et l'installation de leur robot tondeuse.
            </p>

            <Link
              href="/devis/demande"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-lg font-semibold text-primary-600 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-2xl md:gap-3 md:px-10 md:py-5 md:text-xl"
              aria-label="Démarrer mon devis d'achat gratuit pour robot tondeuse"
            >
              Démarrer mon devis d'achat gratuit
              <svg
                className="h-5 w-5 md:h-6 md:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>

            <div className="mt-6 flex flex-col items-center justify-center gap-4 text-xs text-primary-200 sm:flex-row md:mt-8 md:gap-8 md:text-sm">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm md:gap-3 md:px-4 md:py-2">
                <svg
                  className="h-4 w-4 md:h-5 md:w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Gratuit et sans engagement
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm md:gap-3 md:px-4 md:py-2">
                <svg
                  className="h-4 w-4 md:h-5 md:w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Réponse IMMÉDIATE par email
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DevisPage;