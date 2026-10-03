'use client';

import SectionDivider from '../SectionDivider';
import React, { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

const Presentation = () => {
  const defaultText = `Entretien, Réservation et Réparation Robot Tondeuse Husqvarna est
  votre expert en robotique pour l'entretien, la réparation et la
  maintenance des robots tondeuses de la marque Husqvarna.
  Forte de plusieurs années d'expérience, notre entreprise propose
  une large gamme de services spécialisés, incluant l'entretien
  saisonnier, la réparation de composants défectueux, ainsi que des
  services de récupération et de protection à domicile pour vos
  appareils.

  Nous nous engageons à prolonger la durée de vie de vos robots
  tondeuses tout en assurant une efficacité optimale. Nos experts
  effectuent des vérifications approfondies, des nettoyages
  complets, et des ajustements précis pour que vos robots tondeuses
  maintiennent la beauté et la propreté de vos espaces extérieurs
  tout au long de l'année.

  Outre les services de réparation, nous offrons également une gamme
  de pièces détachées et d'accessoires indispensables pour
  l'entretien de vos robots tondeuses. Parmi nos articles, vous
  trouverez des lames de rechange, des boîtiers solaires pour
  optimiser la performance énergétique de vos équipements, et bien
  d'autres composants.

  Chez Entretien, Réservation et Réparation Robot Tondeuse, notre mission est de
  vous offrir un service client exceptionnel, avec des diagnostics
  rapides, des interventions sur mesure, et une prise en charge
  complète pour tous vos besoins en matière de robotique extérieure.

  Nous comprenons l'importance d'un espace vert parfaitement
  entretenu, et c'est pourquoi nous nous efforçons d'offrir des
  services de qualité supérieure, que vous soyez un particulier ou
  une entreprise. Que vous cherchiez à prolonger la durée de vie de
  votre robot tondeuse, à améliorer ses performances ou à obtenir
  des conseils d'experts, nous sommes là pour vous accompagner.
  Contactez-nous dès aujourd'hui pour un devis gratuit ou pour en
  savoir plus sur nos solutions sur mesure.`;

  // Access the search parameters synchronously
  const searchParams = useSearchParams();

  // Get the 'text' parameter from the URL
  const urlText = searchParams.get('text');

  // Initialize 'text' based on the URL parameter or fallback to defaultText
  const text = urlText ? urlText : defaultText;

  /**
   * Splits the text into sentences while handling edge cases like URLs and abbreviations.
   * @param {string} inputText
   * @returns {string[]} Array of sentences.
   */
  const splitIntoSentences = (inputText: string): string[] => {
    // Regular expression to split at sentence-ending punctuation
    const sentenceEndRegex =
      /(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=[.?!])\s+(?=[A-Z])/g;
    return inputText.split(sentenceEndRegex).map((sentence) => sentence.trim());
  };

  if (!text.trim()) {
    return null;
  }

  // Split the text into sentences for display
  const sentences = useMemo(() => splitIntoSentences(text), [text]);

  return (
    <section className="relative overflow-hidden border-b border-gray-100 bg-white section-padding-small">
      {/* Top Divider */}
      <SectionDivider variant="dots" position="top" />

      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 h-72 w-72 -translate-x-1/2 transform rounded-full bg-primary-100 opacity-8 blur-3xl"></div>
        <div className="absolute right-0 bottom-1/4 h-96 w-96 translate-x-1/2 transform rounded-full bg-primary-200 opacity-10 blur-3xl"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-3"></div>
      </div>

      <div className="relative container-custom pt-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1.5 text-xs font-medium text-primary-700">
              💡 Notre Expertise
            </div>
            <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Pourquoi nous choisir ?
            </h2>
            <div className="mx-auto h-1 w-24 rounded-full bg-linear-to-r from-primary-400 to-primary-600"></div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Text Content */}
            <div className="space-y-8">
              {sentences
                .slice(0, Math.ceil(sentences.length / 2))
                .map((sentence, index) => (
                  <div
                    key={index}
                    className="group flex animate-fade-in items-start gap-4"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Icon */}
                    <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 transition-colors duration-300 group-hover:bg-primary-200">
                      <div className="text-lg">
                        {index % 4 === 0 && '🎯'}
                        {index % 4 === 1 && '⚡'}
                        {index % 4 === 2 && '🛡️'}
                        {index % 4 === 3 && '🏆'}
                      </div>
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <p className="text-lg leading-relaxed text-gray-700">
                        {sentence.endsWith('.') ||
                        sentence.endsWith('?') ||
                        sentence.endsWith('!')
                          ? sentence
                          : `${sentence}.`}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Visual Content */}
            <div className="relative">
              {/* Main feature card */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

                <div className="relative z-10">
                  <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-100">
                      <div className="text-3xl">🤖</div>
                    </div>
                    <h3 className="mb-2 font-display text-2xl font-bold text-gray-900">
                      Service Premium
                    </h3>
                    <p className="text-gray-600">
                      Une expertise reconnue dans l'entretien de robots
                      tondeuses
                    </p>
                  </div>

                  {/* Features list */}
                  <div className="space-y-4">
                    {[
                      'Diagnostic complet gratuit',
                      'Intervention à domicile',
                      'Garantie sur tous nos services',
                      'Support technique 7j/7',
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500">
                          <svg
                            className="h-3 w-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-linear-to-br from-primary-300/30 to-transparent"></div>
                <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-linear-to-tr from-primary-200/40 to-transparent"></div>
              </div>

              {/* Floating stats */}
              <div className="absolute -top-6 -left-6 z-20 rounded-2xl border border-gray-100 bg-white p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                    <span className="text-xl">✅</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">100%</div>
                    <div className="text-sm text-gray-600">Satisfaction</div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-6 -bottom-6 z-20 rounded-2xl border border-gray-100 bg-white p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">24h</div>
                    <div className="text-sm text-gray-600">Intervention</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Remaining content */}
          {sentences.length > Math.ceil(sentences.length / 2) && (
            <div className="mt-12">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {sentences
                  .slice(Math.ceil(sentences.length / 2))
                  .map((sentence, index) => (
                    <div
                      key={index + Math.ceil(sentences.length / 2)}
                      className="animate-fade-in rounded-2xl border border-gray-100 bg-white p-6 shadow-xs transition-shadow duration-300 hover:shadow-md"
                      style={{
                        animationDelay: `${(index + Math.ceil(sentences.length / 2)) * 0.1}s`,
                      }}
                    >
                      <p className="leading-relaxed text-gray-700">
                        {sentence.endsWith('.') ||
                        sentence.endsWith('?') ||
                        sentence.endsWith('!')
                          ? sentence
                          : `${sentence}.`}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <div className="rounded-2xl bg-linear-to-r from-primary-500 to-primary-600 p-8 text-white">
              <h3 className="mb-4 font-display text-2xl font-bold">
                Prêt à confier votre robot tondeuse à des experts ?
              </h3>
              <p className="mb-6 text-lg text-primary-100">
                Contactez-nous dès maintenant pour un devis gratuit et
                personnalisé
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 font-medium text-primary-600 transition-all duration-200 hover:bg-gray-100"
                >
                  <span>Contactez-nous maintenant</span>
                  <svg
                    className="h-4 w-4"
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
                </a>
                <a
                  href="#services"
                  className="rounded-lg border-2 border-white px-8 py-3 font-medium text-white transition-all duration-200 hover:bg-white hover:text-primary-600"
                >
                  Découvrir nos services
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Presentation;
