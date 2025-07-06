'use client';

import servicesData from '../config/services.json';
import { trackEvent } from '../utils/analytics';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ServiceForm from './ServiceForm';

export interface ServicesProps {
  id: string;
  name: string;
  description: string;
  image: string;
  formFields: FormField[];
  basePrice?: number;
  isExternalLink?: boolean;
  externalUrl?: string;
}

interface FormField {
  label: string;
  type: string;
  options?: string[];
  optional?: boolean;
  isRequired: boolean;
  minFuturDateRange?: number;
  price?: number;
}

interface ServicesComponentProps {
  entretienServiceRef: React.RefObject<HTMLDivElement>;
}

const Services = React.forwardRef<HTMLElement, ServicesComponentProps>(
  ({ entretienServiceRef }, ref) => {
    const router = useRouter();

    // Modify the existing "Réservation de robot" service to redirect to /robots
    const modifiedServices = useMemo(() => {
      return servicesData.map((service) => {
        if (service.name.toLowerCase() === 'réservation de robot') {
          return {
            ...service,
            name: 'Réservation de Robot',
            description:
              'Réservez votre robot tondeuse Husqvarna parmi notre gamme de 14 modèles filaires et sans fil.',
            isExternalLink: true,
            externalUrl: '/robots',
          };
        }
        return service;
      });
    }, []);

    const [services] = useState<ServicesProps[]>(modifiedServices);
    const [selectedService, setSelectedService] =
      useState<ServicesProps | null>(null);
    const [isFormEdited, setIsFormEdited] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [isSectionViewed, setIsSectionViewed] = useState(false);
    const [highlightedServices, setHighlightedServices] = useState<string[]>(
      [],
    );

    // Track when the Services section enters the viewport
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isSectionViewed) {
              trackEvent('section_view', 'user_engagement', 'services_section');
              setIsSectionViewed(true);
            }
          });
        },
        { threshold: 0.5 },
      );

      if (ref && 'current' in ref && ref.current) {
        observer.observe(ref.current);
      }

      return () => {
        if (ref && 'current' in ref && ref.current) {
          observer.unobserve(ref.current);
        }
      };
    }, [isSectionViewed]);

    // Listen for custom events to highlight specific services
    useEffect(() => {
      const handleHighlightServices = (event: CustomEvent) => {
        const { serviceNames } = event.detail;
        console.log('Event reçu dans Services:', serviceNames);

        // Highlight first
        setHighlightedServices(serviceNames);
        console.log('Services mis en surbrillance:', serviceNames);

        // // Then scroll to services section with a small delay
        // setTimeout(() => {
        //   topRef.current?.scrollIntoView({ behavior: 'smooth' });
        // }, 100);

        // Remove highlight after 6 seconds
        setTimeout(() => {
          setHighlightedServices([]);
          console.log('Surbrillance supprimée');
        }, 6100);
      };

      window.addEventListener(
        'highlightServices',
        handleHighlightServices as EventListener,
      );

      return () => {
        window.removeEventListener(
          'highlightServices',
          handleHighlightServices as EventListener,
        );
      };
    }, []);

    const handleServiceClick = useCallback(
      (service: ServicesProps) => {
        trackEvent(
          'service_card_click',
          'service_interaction',
          `service_${service.name.toLowerCase().replace(/\s+/g, '_')}`,
        );

        // If the service is configured to link externally, navigate to that URL
        if (service.isExternalLink && service.externalUrl) {
          router.push(service.externalUrl);
          return;
        }

        setSelectedService(service);
      },
      [router],
    );

    const closeForm = useCallback(() => {
      setSelectedService(null);
      setIsFormEdited(false);
      setTimeout(() => {
        if (ref && 'current' in ref && ref.current) {
          const elementPosition = ref.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - 80; // 80px offset for fixed header

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }, 100);
    }, []);

    const handleCloseForm = useCallback(
      (force?: boolean) => {
        if (isFormEdited && !force) {
          setIsConfirmDialogOpen(true);
        } else {
          closeForm();
        }
      },
      [isFormEdited, closeForm],
    );

    const handleConfirmClose = useCallback(() => {
      setIsConfirmDialogOpen(false);
      closeForm();
    }, [closeForm]);

    const handleCancelClose = useCallback(() => {
      setIsConfirmDialogOpen(false);
    }, []);

    return (
      <>
        {/* Styles pour l'animation de clignotement vert */}
        <style>{`
        @keyframes green-pulse {
          0% { 
            border-color: #22c55e;
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
          }
          50% { 
            border-color: #16a34a;
            box-shadow: 0 0 0 8px rgba(34, 197, 94, 0.1);
          }
          100% { 
            border-color: #22c55e;
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
          }
        }
      `}</style>

        <section
          id="services"
          ref={ref}
          className="section-padding-small relative border-b border-gray-100 bg-white"
          aria-labelledby="services-title"
        >
          {/* Background decoration */}
          <div className="bg-grid-pattern absolute inset-0 opacity-5"></div>

          <div className="container-custom relative">
            <div className="mb-8 text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1.5 text-xs font-medium text-primary-700">
                🚀 Nos Services Premium
              </div>
              <h2
                id="services-title"
                className="mb-4 font-display text-3xl font-bold tracking-tight text-gray-900 md:text-4xl"
              >
                Services d'Excellence
              </h2>
              <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
                Une gamme complète de services professionnels pour l'achat,
                l'entretien et la maintenance de vos robots tondeuses, fournis
                par les experts de{' '}
                <a
                  href="https://forestar.be"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-600 transition-colors hover:text-primary-700"
                >
                  Forestar.be
                </a>
                .
              </p>
            </div>

            {/* Première ligne - Devis et Réservation */}
            <div className="mb-6 grid grid-cols-1 gap-4 xs:grid-cols-2 md:gap-8 lg:gap-10">
              {services.slice(0, 2).map((service, i) => {
                // Map service names to modern icons
                const getServiceIcon = (serviceName: string) => {
                  if (serviceName.toLowerCase().includes('entretien'))
                    return '⚙️';
                  if (serviceName.toLowerCase().includes('réparation'))
                    return '🔧';
                  if (serviceName.toLowerCase().includes('réservation'))
                    return '📅';
                  if (serviceName.toLowerCase().includes('diagnostic'))
                    return '🔍';
                  if (serviceName.toLowerCase().includes('devis')) return '📄';
                  return '🤖';
                };

                // Check if this service should be highlighted
                const isHighlighted = highlightedServices.some(
                  (highlightName) =>
                    service.name
                      .toLowerCase()
                      .includes(highlightName.toLowerCase()),
                );

                return (
                  <div
                    id={`service-${service.id}`}
                    key={i}
                    ref={
                      service.id === 'entretien_robot'
                        ? entretienServiceRef
                        : null
                    }
                    className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-500 ${
                      isHighlighted
                        ? 'border-green-400'
                        : 'border-gray-100 hover:border-primary-200 hover:shadow-xl'
                    }`}
                    style={
                      isHighlighted
                        ? {
                            borderWidth: '3px',
                            animation: 'green-pulse 2s ease-in-out infinite',
                          }
                        : {}
                    }
                    onClick={() => handleServiceClick(service)}
                    role="button"
                    tabIndex={0}
                    aria-label={
                      service.isExternalLink
                        ? `Voir les robots`
                        : `Ouvrir le formulaire pour ${service.name}`
                    }
                    onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleServiceClick(service);
                      }
                    }}
                  >
                    {/* Image Section */}
                    <div className="relative h-32 overflow-hidden xs:h-48">
                      <Image
                        src={service.image}
                        alt={`Image pour ${service.name}`}
                        className={`h-full w-full object-cover transition-transform duration-500 ${
                          isHighlighted ? '' : 'group-hover:scale-110'
                        }`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                      {/* Service Icon */}
                      <div className="absolute left-4 top-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl shadow-lg backdrop-blur-sm transition-all duration-300 ${
                            isHighlighted
                              ? 'bg-green-500 text-white'
                              : 'bg-white/90'
                          }`}
                        >
                          {getServiceIcon(service.name)}
                        </div>
                      </div>

                      {/* Hover overlay with CTA */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center bg-primary-500/90 opacity-0 transition-opacity duration-300 ${
                          isHighlighted ? '' : 'group-hover:opacity-100'
                        }`}
                      >
                        <div className="translate-y-4 transform text-center text-white transition-transform duration-300 group-hover:translate-y-0">
                          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                            <svg
                              className="h-6 w-6"
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
                          <span className="text-lg font-semibold">
                            {service.isExternalLink ? 'Découvrir' : 'Commencer'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-1 flex-col p-3 xs:p-4 md:p-6">
                      <h3
                        className={`mb-3 font-display text-xl font-bold text-gray-900 transition-colors ${
                          isHighlighted ? '' : 'group-hover:text-primary-600'
                        }`}
                      >
                        {service.name}
                      </h3>

                      <p className="mb-4 flex-grow text-sm leading-relaxed text-gray-600 md:text-base">
                        {service.description}
                      </p>

                      {/* CTA */}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm font-medium text-primary-600"
                          id={`service-button-${service.id}`}
                        >
                          {service.isExternalLink
                            ? 'Explorer les options'
                            : 'Demander un devis'}
                        </span>
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 transition-colors ${
                            isHighlighted
                              ? ''
                              : 'group-hover:bg-primary-500 group-hover:text-white'
                          }`}
                        >
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
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute -right-2 -top-2 h-20 w-20 rotate-45 transform rounded-full bg-gradient-to-br from-primary-500/10 to-transparent"></div>
                  </div>
                );
              })}
            </div>

            {/* Deuxième ligne - Entretien, Réparation et Installation */}
            <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 md:gap-8 lg:gap-10">
              {services.slice(2).map((service, i) => {
                // Map service names to modern icons
                const getServiceIcon = (serviceName: string) => {
                  if (serviceName.toLowerCase().includes('entretien'))
                    return '⚙️';
                  if (serviceName.toLowerCase().includes('réparation'))
                    return '🔧';
                  if (serviceName.toLowerCase().includes('réservation'))
                    return '📅';
                  if (serviceName.toLowerCase().includes('diagnostic'))
                    return '🔍';
                  if (serviceName.toLowerCase().includes('devis')) return '📄';
                  return '🤖';
                };

                // Check if this service should be highlighted
                const isHighlighted = highlightedServices.some(
                  (highlightName) =>
                    service.name
                      .toLowerCase()
                      .includes(highlightName.toLowerCase()),
                );

                return (
                  <div
                    id={`service-${service.id}`}
                    key={i + 2}
                    ref={
                      service.id === 'entretien_robot'
                        ? entretienServiceRef
                        : null
                    }
                    className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-500 ${
                      isHighlighted
                        ? 'border-green-400'
                        : 'border-gray-100 hover:border-primary-200 hover:shadow-xl'
                    }`}
                    style={
                      isHighlighted
                        ? {
                            borderWidth: '3px',
                            animation: 'green-pulse 2s ease-in-out infinite',
                          }
                        : {}
                    }
                    onClick={() => handleServiceClick(service)}
                    role="button"
                    tabIndex={0}
                    aria-label={
                      service.isExternalLink
                        ? `Voir les robots`
                        : `Ouvrir le formulaire pour ${service.name}`
                    }
                    onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleServiceClick(service);
                      }
                    }}
                  >
                    {/* Image Section */}
                    <div className="relative h-32 overflow-hidden xs:h-48">
                      <Image
                        src={service.image}
                        alt={`Image pour ${service.name}`}
                        className={`h-full w-full object-cover transition-transform duration-500 ${
                          isHighlighted ? '' : 'group-hover:scale-110'
                        }`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                      {/* Service Icon */}
                      <div className="absolute left-4 top-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl shadow-lg backdrop-blur-sm transition-all duration-300 ${
                            isHighlighted
                              ? 'bg-green-500 text-white'
                              : 'bg-white/90'
                          }`}
                        >
                          {getServiceIcon(service.name)}
                        </div>
                      </div>

                      {/* Hover overlay with CTA */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center bg-primary-500/90 opacity-0 transition-opacity duration-300 ${
                          isHighlighted ? '' : 'group-hover:opacity-100'
                        }`}
                      >
                        <div className="translate-y-4 transform text-center text-white transition-transform duration-300 group-hover:translate-y-0">
                          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                            <svg
                              className="h-6 w-6"
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
                          <span className="text-lg font-semibold">
                            {service.isExternalLink ? 'Découvrir' : 'Commencer'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-1 flex-col p-3 xs:p-4 md:p-6">
                      <h3
                        className={`mb-3 font-display text-xl font-bold text-gray-900 transition-colors ${
                          isHighlighted ? '' : 'group-hover:text-primary-600'
                        }`}
                      >
                        {service.name}
                      </h3>

                      <p className="mb-4 flex-grow text-sm leading-relaxed text-gray-600 md:text-base">
                        {service.description}
                      </p>

                      {/* CTA */}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm font-medium text-primary-600"
                          id={`service-button-${service.id}`}
                        >
                          {service.isExternalLink
                            ? 'Explorer les options'
                            : 'Demander un devis'}
                        </span>
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 transition-colors ${
                            isHighlighted
                              ? ''
                              : 'group-hover:bg-primary-500 group-hover:text-white'
                          }`}
                        >
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
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute -right-2 -top-2 h-20 w-20 rotate-45 transform rounded-full bg-gradient-to-br from-primary-500/10 to-transparent"></div>
                  </div>
                );
              })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-10 text-center">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
                <span className="text-gray-600">
                  Besoin d'aide pour choisir ?
                </span>
                <a href="#contact" className="btn-primary text-sm">
                  Nous contacter
                </a>
              </div>
            </div>

            {/* Service Form Modal */}
            {selectedService && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
                  <div
                    className="fixed inset-0 transition-opacity"
                    aria-hidden="true"
                  >
                    <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
                  </div>

                  <span
                    className="hidden sm:inline-block sm:h-screen sm:align-middle"
                    aria-hidden="true"
                  >
                    &#8203;
                  </span>

                  <div className="inline-block transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6 sm:align-middle">
                    <ServiceForm
                      service={selectedService}
                      onClose={handleCloseForm}
                      onFormEdit={setIsFormEdited}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Dialog */}
            {isConfirmDialogOpen && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
                  <div
                    className="fixed inset-0 transition-opacity"
                    aria-hidden="true"
                  >
                    <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
                  </div>

                  <span
                    className="hidden sm:inline-block sm:h-screen sm:align-middle"
                    aria-hidden="true"
                  >
                    &#8203;
                  </span>

                  <div className="inline-block transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
                    <div>
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                        <svg
                          className="h-6 w-6 text-orange-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      </div>
                      <h3 className="mb-2 text-center text-lg font-bold leading-6 text-gray-900">
                        Confirmer la fermeture
                      </h3>
                      <p className="mb-6 text-center text-sm text-gray-500">
                        Vous avez des modifications non enregistrées. Êtes-vous
                        sûr de vouloir fermer le formulaire ?
                      </p>
                    </div>
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleCancelClose}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleConfirmClose}
                      >
                        Confirmer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </>
    );
  },
);

Services.displayName = 'Services';

export default React.memo(Services);
