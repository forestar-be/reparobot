'use client';

import { trackEvent } from '../utils/analytics';
import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { X } from 'lucide-react';

const API_URL = process.env.API_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

interface Robot {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  maxSurface: number;
  maxSlope: number;
  price: number;
  priceExVAT?: number;
  installationPrice: number;
  promotion?: string;
}

// Standard form fields for robot reservation
const formFields = [
  {
    label: 'Nom',
    type: 'text',
    isRequired: true,
  },
  {
    label: 'Prénom',
    type: 'text',
    isRequired: true,
  },
  {
    label: 'Email',
    type: 'email',
    isRequired: true,
  },
  {
    label: 'Téléphone',
    type: 'tel',
    isRequired: true,
  },
  {
    label: 'Adresse',
    type: 'text',
    isRequired: true,
  },
  {
    label: 'Code Postal',
    type: 'text',
    isRequired: true,
  },
  {
    label: 'Ville',
    type: 'text',
    isRequired: true,
  },
  {
    label: "Date d'installation souhaitée",
    type: 'date',
    isRequired: false,
    minFuturDateRange: 3,
  },
  {
    label: 'Message',
    type: 'textarea',
    isRequired: false,
  },
  {
    label: 'Entretien annuel (79€)',
    type: 'checkbox_price',
    isRequired: false,
    price: 79,
  },
  {
    label: "J'accepte les conditions générales",
    type: 'checkbox_term',
    isRequired: true,
  },
];

const RobotContactForm = ({
  robot,
  onClose,
  onFormEdit,
}: {
  robot: Robot;
  onClose: (force?: boolean) => void;
  onFormEdit: (edited: boolean) => void;
}) => {
  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [termsOpen, setTermsOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState(
    robot.price + robot.installationPrice,
  );
  const [isLoading, setIsLoading] = useState(false);

  const formRef = useRef<HTMLDivElement | null>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Initialize form values with default states
  useEffect(() => {
    const initialFormValues: { [key: string]: any } = {};
    formFields.forEach((field) => {
      if (
        field.type === 'checkbox' ||
        field.type === 'checkbox_price' ||
        field.type === 'checkbox_term'
      ) {
        initialFormValues[field.label] = false;
      } else {
        initialFormValues[field.label] = '';
      }
    });
    setFormValues(initialFormValues);
  }, []);

  // Track form visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView) {
            trackEvent(
              'section_view',
              'form_interaction',
              'robot_form_section',
            );
            setHasTrackedView(true);
          }
        });
      },
      {
        threshold: 0.5,
      },
    );

    if (formRef.current) {
      observer.observe(formRef.current);
    }

    return () => {
      if (formRef.current) {
        observer.unobserve(formRef.current);
      }
    };
  }, [hasTrackedView]);

  // Calculate total price
  useEffect(() => {
    let price = robot.price + robot.installationPrice;
    formFields.forEach((field) => {
      if (
        field.type === 'checkbox_price' &&
        formValues[field.label] &&
        field.price
      ) {
        price += field.price;
      }
    });
    setTotalPrice(price);
  }, [formValues, robot.price, robot.installationPrice]);

  const handleChange = (label: string, value: any) => {
    setFormValues({ ...formValues, [label]: value });
    onFormEdit(true);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    formFields.forEach((field) => {
      if (field.isRequired && !formValues[field.label]) {
        newErrors[field.label] = `${field.label} est requis`;
      }
      if (
        field.type === 'tel' &&
        formValues[field.label] &&
        !phoneRegex.test(formValues[field.label])
      ) {
        newErrors[field.label] =
          `${field.label} doit être un numéro de téléphone valide`;
      }
      if (
        field.type === 'email' &&
        formValues[field.label] &&
        !emailRegex.test(formValues[field.label])
      ) {
        newErrors[field.label] =
          `${field.label} doit être une adresse email valide`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
      trackEvent('form_submit_error', 'form_interaction', 'validation_failed');
      return;
    }

    onFormEdit(false);
    setIsLoading(true);

    // Prepare form data
    const formattedValues = { ...formValues };

    // Add robot information
    formattedValues['Robot sélectionné'] = robot.name;
    formattedValues['Catégorie'] =
      robot.category === 'wired' ? 'Robot Filaire' : 'Robot Sans Fil';
    formattedValues['Prix du robot'] = `${robot.price} €`;
    formattedValues["Prix d'installation"] = `${robot.installationPrice} €`;

    // Format date if exists
    formFields.forEach((field) => {
      if (field.type === 'date' && formValues[field.label]) {
        formattedValues[field.label] = dayjs(formValues[field.label]).format(
          'DD/MM/YYYY',
        );
      }
    });

    if (totalPrice !== undefined) {
      formattedValues['Prix total'] = `${totalPrice} €`;
    }

    try {
      const response = await fetch(`${API_URL}/submit-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
        body: JSON.stringify(formattedValues),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setFormValues({});
      setErrors({});
      setModalType('success');
      setModalMessage(
        'Votre demande de réservation a été soumise avec succès. Nous vous contacterons très prochainement.',
      );

      trackEvent(
        'form_submission',
        'form_interaction',
        'robot_form_submission_success',
        totalPrice,
      );
    } catch (error) {
      console.error('Error submitting form', error);
      setModalType('error');
      setModalMessage(
        "Une erreur s'est produite lors de la soumission du formulaire. Veuillez réessayer ou contacter le support.",
      );

      trackEvent('form_submit_error', 'form_interaction', 'submission_failed');
    } finally {
      setIsLoading(false);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    if (modalType === 'success') {
      onClose(true);
    }
  };

  const handleOpenTerms = () => {
    setTermsOpen(true);
    trackEvent('dialog_open', 'form_interaction', 'terms_dialog');
  };

  const handleCloseTerms = () => {
    setTermsOpen(false);
  };

  const renderField = (field: any, index: number) => {
    const inputClass = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
      errors[field.label] ? 'border-red-500' : 'border-gray-300'
    }`;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={index} className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-700">
              {field.label} {field.isRequired && '*'}
            </label>
            <input
              type={field.type}
              className={inputClass}
              required={field.isRequired}
              value={formValues[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
            />
            {errors[field.label] && (
              <span className="mt-1 text-sm text-red-500">
                {errors[field.label]}
              </span>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={index} className="flex flex-col lg:col-span-2">
            <label className="mb-2 text-sm font-medium text-gray-700">
              {field.label} {field.isRequired && '*'}
            </label>
            <textarea
              rows={4}
              className={inputClass}
              required={field.isRequired}
              value={formValues[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
            />
            {errors[field.label] && (
              <span className="mt-1 text-sm text-red-500">
                {errors[field.label]}
              </span>
            )}
          </div>
        );

      case 'checkbox':
      case 'checkbox_term':
      case 'checkbox_price':
        return (
          <div key={index} className="flex flex-col lg:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={formValues[field.label] || false}
                onChange={(e) => handleChange(field.label, e.target.checked)}
              />
              <label className="ml-2 text-sm text-gray-700">
                {field.type === 'checkbox_term' ? (
                  <span>
                    {field.label}{' '}
                    <button
                      type="button"
                      onClick={handleOpenTerms}
                      className="text-primary-600 underline"
                    >
                      (Lire)
                    </button>
                  </span>
                ) : (
                  field.label
                )}
              </label>
            </div>
            {errors[field.label] && (
              <span className="mt-1 text-sm text-red-500">
                {errors[field.label]}
              </span>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={index} className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-700">
              {field.label} {field.isRequired && '*'}
            </label>
            <input
              type="date"
              className={inputClass}
              required={field.isRequired}
              min={
                field.minFuturDateRange
                  ? dayjs()
                      .add(field.minFuturDateRange, 'day')
                      .format('YYYY-MM-DD')
                  : undefined
              }
              value={
                formValues[field.label]
                  ? dayjs(formValues[field.label]).format('YYYY-MM-DD')
                  : ''
              }
              onChange={(e) =>
                handleChange(
                  field.label,
                  e.target.value ? dayjs(e.target.value) : null,
                )
              }
            />
            {errors[field.label] && (
              <span className="mt-1 text-sm text-red-500">
                {errors[field.label]}
              </span>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-white shadow-lg lg:flex-row">
      {/* Robot Info Section */}
      <div className="relative bg-primary-50 p-6 lg:w-2/5">
        <button
          onClick={() => onClose()}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100"
          aria-label="Fermer le formulaire"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-2xl font-bold">{robot.name}</h2>

        <div className="mb-6 hidden lg:block">
          <img
            src={robot.image}
            alt={robot.name}
            className="h-60 w-full rounded-lg object-contain"
          />
        </div>

        <p className="mb-4 text-gray-700">{robot.description}</p>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-800">
            Surface: {robot.maxSurface} m²
          </span>
          <span className="rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-800">
            Pente: {robot.maxSlope}%
          </span>
          <span className="rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-800">
            {robot.category === 'wired' ? 'Filaire' : 'Sans fil'}
          </span>
        </div>

        <div className="hidden lg:block">
          <hr className="my-4 border-gray-200" />
          <div className="mt-auto">
            <h3 className="mb-3 text-lg font-semibold">Détails de prix:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Prix du robot:</span>
                <span className="font-bold">{robot.price} €</span>
              </div>
              <div className="flex justify-between">
                <span>Installation:</span>
                <span className="font-bold">{robot.installationPrice} €</span>
              </div>
              {formValues['Entretien annuel (79€)'] && (
                <div className="flex justify-between">
                  <span>Entretien annuel:</span>
                  <span className="font-bold">79 €</span>
                </div>
              )}
              <hr className="border-gray-200" />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-primary-600">
                  {totalPrice} €
                </span>
              </div>
            </div>

            {robot.promotion && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="font-medium text-red-800">
                  Promotion: {robot.promotion}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div ref={formRef} className="p-6 lg:w-3/5">
        <h2 className="mb-6 text-2xl font-bold">Formulaire de réservation</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {formFields.map(renderField)}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Envoi en cours...
              </span>
            ) : (
              'Réserver ce robot'
            )}
          </button>
        </form>
      </div>

      {/* Price Details Section for Small Screens */}
      <div className="border-t bg-primary-50 p-6 lg:hidden">
        <h3 className="mb-3 text-lg font-semibold">Détails de prix:</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Prix du robot:</span>
            <span className="font-bold">{robot.price} €</span>
          </div>
          <div className="flex justify-between">
            <span>Installation:</span>
            <span className="font-bold">{robot.installationPrice} €</span>
          </div>
          {formValues['Entretien annuel (79€)'] && (
            <div className="flex justify-between">
              <span>Entretien annuel:</span>
              <span className="font-bold">79 €</span>
            </div>
          )}
          <hr className="border-gray-200" />
          <div className="flex justify-between text-lg">
            <span className="font-bold">Total:</span>
            <span className="font-bold text-primary-600">{totalPrice} €</span>
          </div>
        </div>

        {robot.promotion && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="font-medium text-red-800">
              Promotion: {robot.promotion}
            </p>
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-bold">
              {modalType === 'success' ? 'Réservation envoyée' : 'Erreur'}
            </h3>
            <p className="mb-6 text-gray-700">{modalMessage}</p>
            <button onClick={handleCloseModal} className="btn-primary w-full">
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Terms and Conditions Dialog */}
      {termsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Conditions Générales</h3>
              <button
                onClick={handleCloseTerms}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="mb-2 font-semibold">Conditions de vente</h4>
                <p className="text-gray-700">
                  Les robots tondeuses Husqvarna sont vendus avec une garantie
                  de 2 ans. L'installation est réalisée par des techniciens
                  certifiés Husqvarna. Le délai de livraison est généralement de
                  2 à 3 semaines selon disponibilité.
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">
                  Conditions d'installation
                </h4>
                <p className="text-gray-700">
                  L'installation comprend la pose du câble périphérique (pour
                  les modèles filaires), la configuration du robot, et une
                  démonstration complète du fonctionnement. Pour les modèles
                  sans fil, l'installation comprend la configuration du système
                  EPOS, la définition des zones virtuelles, et la formation à
                  l'utilisation.
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">Conditions de paiement</h4>
                <p className="text-gray-700">
                  Un acompte de 30% est demandé à la commande, le solde sera à
                  régler à la livraison. Plusieurs modes de paiement sont
                  acceptés : carte bancaire, virement, ou financement.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={handleCloseTerms} className="btn-primary">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RobotContactForm;
