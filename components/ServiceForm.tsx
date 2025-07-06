// src/components/ServiceForm.tsx
'use client';

import conditions from '../config/conditions.json';
import { trackEvent } from '../utils/analytics';
import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { X } from 'lucide-react';
import { ServicesProps } from './Services';

// src/components/ServiceForm.tsx

// src/components/ServiceForm.tsx

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTH_TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN;

const ServiceForm = ({
  service,
  onClose,
  onFormEdit,
}: {
  service: ServicesProps;
  onClose: (force?: boolean) => void;
  onFormEdit: (edited: boolean) => void;
}) => {
  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [termsOpen, setTermsOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState(service.basePrice);
  const [isLoading, setIsLoading] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Handle screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Initialize form values with default states
  useEffect(() => {
    const initialFormValues: { [key: string]: any } = {};
    service.formFields.forEach((field) => {
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
  }, [service.formFields]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView) {
            // Track ServiceForm section visibility
            trackEvent(
              'section_view', // Action: consistent with other section views
              'form_interaction', // Category: snake_case, consistent category naming
              'service_form_section', // Label: snake_case, more consistent naming
            );
            setHasTrackedView(true); // Prevent duplicate tracking
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the form is visible
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

  useEffect(() => {
    if (service.basePrice !== undefined) {
      let price = service.basePrice;
      service.formFields.forEach((field) => {
        if (
          (field.type === 'checkbox_price' || field.type === 'checkbox') &&
          formValues[field.label] &&
          field.price
        ) {
          price += field.price;
        }
      });
      setTotalPrice(price);
    }
  }, [formValues, service]);

  const handleChange = (label: string, value: any) => {
    setFormValues({ ...formValues, [label]: value });
    onFormEdit(true);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;

    service.formFields.forEach((field) => {
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
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
      // Track form submission with validation errors
      trackEvent(
        'form_submit_error', // Action: snake_case, more specific
        'form_interaction', // Category: already good, keep snake_case
        'validation_failed', // Label: snake_case, more specific
      );
      return;
    }

    onFormEdit(false);
    setIsLoading(true);

    const formattedValues = { ...formValues };
    service.formFields.forEach((field) => {
      if (field.type === 'date' && formValues[field.label]) {
        formattedValues[field.label] = dayjs(formValues[field.label]).format(
          'DD/MM/YYYY',
        );
      }
    });

    if (totalPrice !== undefined) {
      formattedValues['Prix total'] = totalPrice;
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
      setModalMessage('Votre demande a été soumise avec succès');

      // Track successful form submission
      trackEvent(
        'form_submission', // Keep it snake_case
        'form_interaction', // Category
        'form_submission_success', // Label
        99,
      );
    } catch (error) {
      console.error('Error submitting form', error);
      setModalType('error');
      setModalMessage(
        "Une erreur s'est produite lors de la soumission du formulaire. Veuillez réessayer ou contacter le support.",
      );

      // Track failed form submission
      trackEvent(
        'form_submit_error', // Action: snake_case, clearer error event
        'form_interaction', // Category: already good, keep snake_case
        'submission_failed', // Label: snake_case, more consistent
      );
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
    trackEvent(
      'dialog_open', // Action: snake_case, more generic for reuse
      'form_interaction', // Category: already good, keep snake_case
      'terms_dialog', // Label: snake_case, more concise
    );
  };

  const handleCloseTerms = () => {
    setTermsOpen(false);
  };

  const renderField = (field: any, index: number) => {
    const inputClass = `w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
      errors[field.label] ? 'border-red-500' : ''
    }`;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={index} className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              {field.label} {field.isRequired && '*'}
            </label>
            <input
              type={field.type}
              className={inputClass}
              required={field.isRequired}
              value={formValues[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
              aria-describedby={`${field.label}-error`}
              aria-required={field.isRequired}
            />
            {errors[field.label] && (
              <span
                className="mt-1 text-sm text-red-500"
                id={`${field.label}-error`}
              >
                {errors[field.label]}
              </span>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={index} className="col-span-2 flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              {field.label} {field.isRequired && '*'}
            </label>
            <textarea
              rows={4}
              className={inputClass}
              required={field.isRequired}
              value={formValues[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
              aria-describedby={`${field.label}-error`}
              aria-required={field.isRequired}
            />
            {errors[field.label] && (
              <span
                className="mt-1 text-sm text-red-500"
                id={`${field.label}-error`}
              >
                {errors[field.label]}
              </span>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={index} className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              {field.label} {field.isRequired && '*'}
            </label>
            <select
              className={inputClass}
              required={field.isRequired}
              value={formValues[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
              aria-describedby={`${field.label}-error`}
              aria-required={field.isRequired}
            >
              <option value="">Sélectionner...</option>
              {field.options?.map((option: string, i: number) => (
                <option key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors[field.label] && (
              <span
                className="mt-1 text-sm text-red-500"
                id={`${field.label}-error`}
              >
                {errors[field.label]}
              </span>
            )}
          </div>
        );

      case 'checkbox':
      case 'checkbox_term':
      case 'checkbox_price':
        return (
          <div key={index} className="col-span-2 flex flex-col">
            <div className="flex items-start">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={formValues[field.label] || false}
                onChange={(e) => handleChange(field.label, e.target.checked)}
                aria-describedby={`${field.label}-error`}
                aria-required={field.isRequired}
              />
              <label className="ml-2 text-sm text-gray-700">
                {field.type === 'checkbox_term' ? (
                  <span>
                    {field.label}{' '}
                    <button
                      type="button"
                      onClick={handleOpenTerms}
                      className="text-primary-600 underline"
                      aria-label="Lire les conditions générales"
                    >
                      (Lire)
                    </button>
                  </span>
                ) : (
                  `${field.label} ${
                    field.type === 'checkbox_price' ? `+${field.price} €` : ''
                  }`
                )}
              </label>
            </div>
            {errors[field.label] && (
              <span
                className="mt-1 text-sm text-red-500"
                id={`${field.label}-error`}
              >
                {errors[field.label]}
              </span>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={index} className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
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
              aria-describedby={`${field.label}-error`}
              aria-required={field.isRequired}
            />
            {errors[field.label] && (
              <span
                className="mt-1 text-sm text-red-500"
                id={`${field.label}-error`}
              >
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
    <div className="relative">
      {/* Form Header */}
      <button
        onClick={() => onClose()}
        className="absolute right-3 top-6 z-50 rounded-full p-2 hover:bg-gray-100"
        aria-label="Fermer le formulaire"
      >
        <X className="h-5 w-5" />
      </button>

      <form
        ref={formRef}
        className="relative rounded-bl-[32px] rounded-tl-[32px] bg-white p-6"
        onSubmit={handleSubmit}
        noValidate
        aria-labelledby="service-form-title"
        itemScope
        itemType="https://schema.org/ContactPage"
      >
        <h2
          id="service-form-title"
          className="mb-6 text-xl font-semibold text-gray-900"
        >
          Formulaire du service: {service.name}
        </h2>

        {/* Form Fields */}
        <div
          className={`grid gap-4 ${isLargeScreen ? 'grid-cols-2' : 'grid-cols-1'}`}
        >
          {service.formFields.map(renderField)}
        </div>

        {/* Total Price */}
        {totalPrice !== undefined && (
          <div className="mt-6">
            <p className="text-xl font-semibold text-gray-900" itemProp="price">
              Prix total: {totalPrice} €
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="mt-6 rounded-lg bg-primary-600 px-6 py-2 font-medium text-white transition-colors duration-200 hover:bg-primary-700 disabled:bg-primary-600 disabled:opacity-70"
        >
          {isLoading ? (
            <span className="flex items-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              Envoi...
            </span>
          ) : (
            'Envoyer'
          )}
        </button>

        {/* Submission Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 max-w-md rounded-lg bg-white p-6">
              <h3 className="mb-4 text-lg font-bold">Envoi du formulaire</h3>
              <p className="mb-6 text-gray-700">{modalMessage}</p>
              <button
                onClick={handleCloseModal}
                className="btn-primary w-full"
                autoFocus
              >
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
                {Object.values(conditions.terms_and_conditions).map(
                  (section, index) => (
                    <div key={index} className="mb-4">
                      <h4 className="mb-2 font-semibold">{section.title}</h4>
                      <p className="text-gray-700">{section.content}</p>
                    </div>
                  ),
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseTerms}
                  className="btn-primary"
                  autoFocus
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ServiceForm;
