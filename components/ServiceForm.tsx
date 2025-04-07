// src/components/ServiceForm.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { ServicesProps } from './Services';
import conditions from '../config/conditions.json';
import { trackEvent } from '../utils/analytics'; // Import the tracking utility

const API_URL = process.env.API_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

if (!API_URL || !AUTH_TOKEN) {
  throw new Error('API_URL and AUTH_TOKEN must be defined');
}

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

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const formRef = useRef<HTMLDivElement | null>(null); // Reference to the form container
  const [hasTrackedView, setHasTrackedView] = useState(false); // State to ensure the event is sent only once

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
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <TextField
            key={index}
            id={`field-${index}`}
            name={field.label}
            label={field.label}
            type={field.type}
            variant="outlined"
            fullWidth
            required={field.isRequired}
            error={!!errors[field.label]}
            helperText={errors[field.label]}
            value={formValues[field.label] || ''} // Ensure value is never undefined
            onChange={(e) => handleChange(field.label, e.target.value)}
            aria-describedby={`${field.label}-error`}
            inputProps={{
              'aria-required': field.isRequired,
            }}
          />
        );
      case 'textarea':
        return (
          <TextField
            key={index}
            id={`field-${index}`}
            name={field.label}
            label={field.label}
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            required={field.isRequired}
            error={!!errors[field.label]}
            helperText={errors[field.label]}
            value={formValues[field.label] || ''} // Ensure value is never undefined
            onChange={(e) => handleChange(field.label, e.target.value)}
            aria-describedby={`${field.label}-error`}
            inputProps={{
              'aria-required': field.isRequired,
            }}
          />
        );
      case 'select':
        return (
          <TextField
            key={index}
            id={`field-${index}`}
            name={field.label}
            label={field.label}
            select
            variant="outlined"
            fullWidth
            required={field.isRequired}
            error={!!errors[field.label]}
            helperText={errors[field.label]}
            value={formValues[field.label] || ''} // Added value prop
            onChange={(e) => handleChange(field.label, e.target.value)}
            aria-describedby={`${field.label}-error`}
            inputProps={{
              'aria-required': field.isRequired,
            }}
          >
            {field.options?.map((option: string, i: number) => (
              <MenuItem key={i} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        );
      case 'checkbox':
      case 'checkbox_term':
      case 'checkbox_price':
        return (
          <FormControl
            key={index}
            required={field.isRequired}
            error={!!errors[field.label]}
            component="fieldset"
          >
            <FormControlLabel
              control={
                <Checkbox
                  id={`field-${index}`}
                  name={field.label}
                  checked={formValues[field.label] || false}
                  onChange={(e) => handleChange(field.label, e.target.checked)}
                  aria-describedby={`${field.label}-error`}
                  inputProps={{
                    'aria-required': field.isRequired,
                  }}
                />
              }
              label={
                field.type === 'checkbox_term' ? (
                  <span>
                    {field.label}{' '}
                    <Link
                      component="button"
                      variant="body2"
                      onClick={handleOpenTerms}
                      aria-label="Lire les conditions générales"
                    >
                      (Lire)
                    </Link>
                  </span>
                ) : (
                  `${field.label} ${
                    field.type === 'checkbox_price' ? `+${field.price} €` : ''
                  }`
                )
              }
            />
            {!!errors[field.label] && (
              <FormHelperText id={`${field.label}-error`}>
                {errors[field.label]}
              </FormHelperText>
            )}
          </FormControl>
        );
      case 'date':
        return (
          <LocalizationProvider key={index} dateAdapter={AdapterDayjs}>
            <DatePicker
              disablePast={!!field.minFuturDateRange}
              minDate={
                field.minFuturDateRange
                  ? dayjs && dayjs().add(field.minFuturDateRange, 'day')
                  : undefined
              }
              label={field.label}
              format={'DD/MM/YYYY'}
              value={formValues[field.label] || null} // Ensure value is never undefined
              onChange={(date) => handleChange(field.label, date)}
              slotProps={{
                textField: {
                  id: `field-${index}`,
                  name: field.label,
                  required: field.isRequired,
                  error: !!errors[field.label],
                  helperText: errors[field.label],
                  fullWidth: true,
                  inputProps: {
                    'aria-describedby': `${field.label}-error`,
                    'aria-required': field.isRequired,
                  },
                },
              }}
            />
          </LocalizationProvider>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Form Header */}
      <IconButton
        onClick={() => onClose()}
        sx={{
          position: 'absolute',
          top: 23,
          right: 11,
          zIndex: 500,
        }}
        aria-label="Fermer le formulaire"
      >
        <CloseIcon />
      </IconButton>
      <Box
        ref={formRef} // Attach ref here for visibility tracking
        component="form"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          // marginTop: 4,
          padding: 2,
          backgroundColor: 'background.paper',
          borderRadius: '32px 0 0px 32px',
          position: 'relative',
          '& > *': {
            flex: isLargeScreen ? '1 1 calc(50% - 16px)' : '1 1 100%',
          },
        }}
        onSubmit={handleSubmit}
        noValidate
        aria-labelledby="service-form-title"
        itemScope
        itemType="https://schema.org/ContactPage"
      >
        <Typography
          id="service-form-title"
          variant="h6" // Maintained existing style with h6
          sx={{
            flex: '1 1 100%',
            marginBottom: 2,
          }}
        >
          Formulaire du service: {service.name}
        </Typography>

        {/* Form Fields */}
        {service.formFields.map(renderField)}

        {/* Total Price */}
        {totalPrice !== undefined && (
          <Typography
            variant="h6"
            sx={{
              flex: '1 1 100%',
              marginTop: 2,
            }}
            itemProp="price"
          >
            Prix total: {totalPrice} €
          </Typography>
        )}

        {/* Submit Button */}
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          sx={{
            color: 'white',
            bgcolor: '#43a047',
            '&:hover': {
              bgcolor: '#2e7031',
            },
            '&:disabled': {
              bgcolor: '#43a047',
              opacity: 0.7,
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Envoyer'
          )}
        </Button>

        {/* Submission Modal */}
        <Dialog
          open={modalOpen}
          onClose={handleCloseModal}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Envoi du formulaire</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {modalMessage}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary" autoFocus>
              Fermer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Terms and Conditions Dialog */}
        <Dialog
          fullScreen={fullScreen}
          open={termsOpen}
          onClose={handleCloseTerms}
          aria-labelledby="terms-dialog-title"
          aria-describedby="terms-dialog-description"
        >
          <DialogTitle id="terms-dialog-title">
            Conditions Générales
          </DialogTitle>
          <DialogContent>
            {Object.values(conditions.terms_and_conditions).map(
              (section, index) => (
                <Box key={index} mb={2}>
                  <Typography variant="h6">{section.title}</Typography>
                  <DialogContentText>{section.content}</DialogContentText>
                </Box>
              ),
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTerms} color="primary" autoFocus>
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default ServiceForm;
