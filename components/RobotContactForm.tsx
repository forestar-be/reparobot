'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Typography,
  TextField,
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
  Grid,
  Divider,
  Chip,
  Card,
  CardMedia,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { trackEvent } from '../utils/analytics';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTH_TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN;

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

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const isMobileOnly = useMediaQuery(theme.breakpoints.down('sm'));

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
                  `${field.label}`
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

  // Schema.org structured data for the product
  const generateStructuredData = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: robot.name,
      description: robot.description,
      brand: {
        '@type': 'Brand',
        name: 'Husqvarna',
      },
      offers: {
        '@type': 'Offer',
        price: robot.price,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        priceValidUntil: dayjs().add(30, 'day').format('YYYY-MM-DD'),
      },
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Surface maximale',
          value: `${robot.maxSurface} m²`,
        },
        {
          '@type': 'PropertyValue',
          name: 'Pente maximale',
          value: `${robot.maxSlope}%`,
        },
      ],
    };
  };

  return (
    <Box
      sx={{ display: 'flex', flexDirection: isLargeScreen ? 'row' : 'column' }}
      itemScope
      itemType="https://schema.org/Product"
    >
      {/* Robot Info Section */}
      <Box
        sx={{
          width: isLargeScreen ? '40%' : undefined,
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(0,0,0,0.2)'
              : 'rgba(67, 160, 71, 0.05)',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={() => onClose()}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 500,
          }}
          aria-label="Fermer le formulaire"
        >
          <CloseIcon />
        </IconButton>

        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 600 }}
          itemProp="name"
        >
          {robot.name}
        </Typography>

        {isLargeScreen && (
          <Card
            sx={{
              width: '100%',
              mb: 3,
              boxShadow: 'none',
              bgcolor: 'transparent',
            }}
          >
            <CardMedia
              component="img"
              image={robot.image}
              alt={robot.name}
              itemProp="image"
              sx={{
                width: '100%',
                height: 240,
                objectFit: 'contain',
                mb: 2,
              }}
            />
          </Card>
        )}

        <Typography variant="body1" sx={{ mb: 2 }} itemProp="description">
          {robot.description}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={`Surface: ${robot.maxSurface} m²`}
            size="small"
            sx={{
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(67, 160, 71, 0.2)'
                  : 'rgba(67, 160, 71, 0.1)',
              color: theme.palette.mode === 'dark' ? '#43a047' : '#2e7031',
            }}
          />
          <Chip
            label={`Pente: ${robot.maxSlope}%`}
            size="small"
            sx={{
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(67, 160, 71, 0.2)'
                  : 'rgba(67, 160, 71, 0.1)',
              color: theme.palette.mode === 'dark' ? '#43a047' : '#2e7031',
            }}
          />
          <Chip
            label={robot.category === 'wired' ? 'Filaire' : 'Sans fil'}
            size="small"
            sx={{
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(67, 160, 71, 0.2)'
                  : 'rgba(67, 160, 71, 0.1)',
              color: theme.palette.mode === 'dark' ? '#43a047' : '#2e7031',
            }}
          />
        </Box>

        {isLargeScreen && (
          <>
            <Divider sx={{ my: 2, mt: 2 }} />
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Détails de prix:
              </Typography>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Typography>Prix du robot:</Typography>
                <Typography fontWeight="bold" itemProp="price">
                  {robot.price} €
                </Typography>
                <meta itemProp="priceCurrency" content="EUR" />
              </Box>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Typography>Installation:</Typography>
                <Typography fontWeight="bold">
                  {robot.installationPrice} €
                </Typography>
              </Box>
              {formValues['Entretien annuel (79€)'] && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography>Entretien annuel:</Typography>
                  <Typography fontWeight="bold">79 €</Typography>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Typography fontWeight="bold">Total:</Typography>
                <Typography fontWeight="bold" color="primary">
                  {totalPrice} €
                </Typography>
              </Box>

              {robot.promotion && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 2,
                    color: theme.palette.error.main,
                    fontWeight: 600,
                    p: 1,
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(211, 47, 47, 0.1)'
                        : 'rgba(211, 47, 47, 0.05)',
                    borderRadius: 1,
                  }}
                >
                  Promotion: {robot.promotion}
                </Typography>
              )}
            </Box>
          </>
        )}
      </Box>

      {/* Form Section */}
      <Box
        ref={formRef}
        component="form"
        sx={{
          width: isLargeScreen ? '60%' : undefined,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          p: 3,
          backgroundColor: 'background.paper',
          '& > *': {
            flex: isMobileOnly ? '1 1 100%' : '1 1 calc(50% - 16px)',
          },
        }}
        onSubmit={handleSubmit}
        noValidate
        aria-labelledby="robot-form-title"
        itemScope
        itemType="https://schema.org/ContactPoint"
      >
        <Typography
          id="robot-form-title"
          variant="h5"
          sx={{
            flex: '1 1 100%',
            mb: 3,
          }}
        >
          Formulaire de réservation
        </Typography>

        {/* Form Fields */}
        {formFields.map(renderField)}

        {/* Submit Button */}
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          sx={{
            mt: 2,
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
            'Réserver ce robot'
          )}
        </Button>
      </Box>

      {/* Price Details Section for Small Screens */}
      {!isLargeScreen && (
        <Box
          sx={{
            p: 3,
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(0,0,0,0.2)'
                : 'rgba(67, 160, 71, 0.05)',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Détails de prix:
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Prix du robot:</Typography>
            <Typography fontWeight="bold">{robot.price} €</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Installation:</Typography>
            <Typography fontWeight="bold">
              {robot.installationPrice} €
            </Typography>
          </Box>
          {formValues['Entretien annuel (79€)'] && (
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography>Entretien annuel:</Typography>
              <Typography fontWeight="bold">79 €</Typography>
            </Box>
          )}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography fontWeight="bold">Total:</Typography>
            <Typography fontWeight="bold" color="primary">
              {totalPrice} €
            </Typography>
          </Box>

          {robot.promotion && (
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: theme.palette.error.main,
                fontWeight: 600,
                p: 1,
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(211, 47, 47, 0.1)'
                    : 'rgba(211, 47, 47, 0.05)',
                borderRadius: 1,
              }}
            >
              Promotion: {robot.promotion}
            </Typography>
          )}
        </Box>
      )}

      {/* Submission Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {modalType === 'success' ? 'Réservation envoyée' : 'Erreur'}
        </DialogTitle>
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
        open={termsOpen}
        onClose={handleCloseTerms}
        aria-labelledby="terms-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="terms-dialog-title">Conditions Générales</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Conditions de vente
          </Typography>
          <Typography paragraph>
            Les robots tondeuses Husqvarna sont vendus avec une garantie de 2
            ans. L'installation est réalisée par des techniciens certifiés
            Husqvarna. Le délai de livraison est généralement de 2 à 3 semaines
            selon disponibilité.
          </Typography>

          <Typography variant="h6" gutterBottom>
            Conditions d'installation
          </Typography>
          <Typography paragraph>
            L'installation comprend la pose du câble périphérique (pour les
            modèles filaires), la configuration du robot, et une démonstration
            complète du fonctionnement. Pour les modèles sans fil,
            l'installation comprend la configuration du système EPOS, la
            définition des zones virtuelles, et la formation à l'utilisation.
          </Typography>

          <Typography variant="h6" gutterBottom>
            Conditions de paiement
          </Typography>
          <Typography paragraph>
            Un acompte de 30% est demandé à la commande, le solde sera à régler
            à la livraison. Plusieurs modes de paiement sont acceptés : carte
            bancaire, virement, ou financement.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTerms} color="primary" autoFocus>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invisible structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData()),
        }}
      />
    </Box>
  );
};

export default RobotContactForm;
