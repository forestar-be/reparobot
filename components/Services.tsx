// components/Services.tsx

'use client'; // Ensure this is a client component

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Tooltip,
  Grid,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  useTheme,
  Card,
} from '@mui/material';
import servicesData from '../config/services.json';
import ServiceForm from './ServiceForm';
import { trackEvent } from '../utils/analytics';

export interface ServicesProps {
  name: string;
  description: string;
  image: string;
  formFields: FormField[];
  basePrice?: number;
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

const Services: React.FC = () => {
  const theme = useTheme();
  const [services] = useState<ServicesProps[]>(servicesData);
  const [selectedService, setSelectedService] = useState<ServicesProps | null>(null);
  const [isFormEdited, setIsFormEdited] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSectionViewed, setIsSectionViewed] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

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
      { threshold: 0.5 }
    );

    if (topRef.current) {
      observer.observe(topRef.current);
    }

    return () => {
      if (topRef.current) {
        observer.unobserve(topRef.current);
      }
    };
  }, [isSectionViewed]);

  const handleServiceClick = useCallback((service: ServicesProps) => {
    trackEvent(
      'service_card_click',
      'service_interaction',
      `service_${service.name.toLowerCase().replace(/\s+/g, '_')}`
    );
    setSelectedService(service);
  }, []);

  const closeForm = useCallback(() => {
    setSelectedService(null);
    setIsFormEdited(false);
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    [isFormEdited, closeForm]
  );

  const handleConfirmClose = useCallback(() => {
    setIsConfirmDialogOpen(false);
    closeForm();
  }, [closeForm]);

  const handleCancelClose = useCallback(() => {
    setIsConfirmDialogOpen(false);
  }, []);

  const renderServiceCard = useCallback(
    (item: ServicesProps, i: number) => (
      <Grid item xs={12} sm={6} md={4} key={i}>
        <Tooltip title="Cliquez pour ouvrir le formulaire" arrow>
          <Box
            component="article"
            itemScope
            itemType="https://schema.org/Service"
            padding={3}
            // Remove width="100%" to prevent overflow
            // width="100%"
            bgcolor={theme.palette.background.paper}
            sx={{
              boxSizing: 'border-box', // Ensure padding is included within the Box
              '&:hover': {
                bgcolor: theme.palette.background.default,
                color:
                  theme.palette.mode === 'dark'
                    ? theme.palette.common.white
                    : theme.palette.common.black,
              },
              cursor: 'pointer',
              backgroundColor:
                selectedService?.name === item.name
                  ? theme.palette.action.selected
                  : theme.palette.background.paper,
              outline: 'none',
              transition: 'background-color 0.3s, color 0.3s',
              '&:focus': {
                outline: `2px solid ${
                  theme.palette.mode === 'dark'
                    ? theme.palette.primary.light
                    : theme.palette.success.light
                }`,
                outlineOffset: '2px',
              },
              // Ensure the Box takes full height to prevent uneven heights causing overlap
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
            onClick={() => handleServiceClick(item)}
            role="button"
            tabIndex={0}
            aria-label={`Ouvrir le formulaire pour ${item.name}`}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleServiceClick(item);
              }
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 600, textAlign: 'center' }}
              itemProp="name"
            >
              {item.name}
            </Typography>
            <Typography
              color="inherit"
              itemProp="description"
              sx={{ textAlign: 'center', minHeight: '3em', flexGrow: 1 }}
            >
              {item.description}
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
              <Card
                sx={{
                  width: '100%',
                  maxWidth: 300,
                  height: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'none',
                  bgcolor: 'transparent',
                  backgroundImage: 'none',
                }}
              >
                <Box
                  component="img"
                  src={item.image}
                  alt={`Image pour ${item.name}`}
                  loading="lazy"
                  itemProp="image"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 2,
                    filter:
                      theme.palette.mode === 'dark'
                        ? 'brightness(0.7)'
                        : 'brightness(0.9)',
                  }}
                />
              </Card>
            </Box>
          </Box>
        </Tooltip>
      </Grid>
    ),
    [theme, selectedService, handleServiceClick]
  );

  const memoizedServices = useMemo(
    () => services.map(renderServiceCard),
    [services, renderServiceCard]
  );

  return (
    <section
      id="services"
      ref={topRef}
      aria-labelledby="services-title"
      itemScope
      itemType="https://schema.org/Service"
    >
      <Box
        sx={{
          paddingTop: 5,
          paddingBottom: 10,
          paddingX: { xs: 2, sm: 4, md: 6 },
          backgroundColor: theme.palette.background.default,
          overflowX: 'hidden', // Prevent horizontal overflow
        }}
      >
        <Box marginBottom={4}>
          <Typography
            id="services-title"
            variant="h4"
            component="h2"
            align="center"
            fontWeight={700}
            marginTop={theme.spacing(1)}
            gutterBottom
            sx={{
              color: theme.palette.text.primary,
              textTransform: 'uppercase',
              fontSize: { xs: '1.75rem', sm: '2.5rem' }, // Responsive font size
            }}
            itemProp="headline"
          >
            Services
          </Typography>
          <Typography
            variant="subtitle1"
            component="p"
            align="center"
            marginTop={theme.spacing(1)}
            gutterBottom
            color={theme.palette.text.secondary}
            itemProp="description"
            sx={{ maxWidth: 600, marginX: 'auto' }}
          >
            Nous vous proposons une large gamme de services pour l&apos;entretien de
            votre robot.
          </Typography>
        </Box>
        <Box>
          <Grid container spacing={4}>
            {memoizedServices}
          </Grid>
          <Dialog
            open={!!selectedService}
            onClose={() => handleCloseForm()}
            maxWidth="sm" // Set maxWidth to prevent overflow
            fullWidth
            aria-labelledby="service-form-dialog-title"
            PaperProps={{
              sx: {
                borderRadius: 2,
                padding: 2,
                overflowY: 'auto',
              },
            }}
          >
            {selectedService && (
              <ServiceForm
                service={selectedService}
                onClose={handleCloseForm}
                onFormEdit={setIsFormEdited}
              />
            )}
          </Dialog>
          <Dialog
            open={isConfirmDialogOpen}
            onClose={handleCancelClose}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            maxWidth="xs"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
                padding: 2,
              },
            }}
          >
            <DialogTitle id="confirm-dialog-title">Confirmer la fermeture</DialogTitle>
            <DialogContent>
              <DialogContentText id="confirm-dialog-description">
                Vous avez des modifications non enregistrées. Êtes-vous sûr de
                vouloir fermer le formulaire ?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelClose} color="primary">
                Annuler
              </Button>
              <Button onClick={handleConfirmClose} color="primary" autoFocus>
                Confirmer
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </section>
  );
};

export default React.memo(Services);
