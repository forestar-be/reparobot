// components/Services.tsx

'use client'; // Ensure this is a client component

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
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
  Container,
  useMediaQuery,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import servicesData from '../config/services.json';
import ServiceForm from './ServiceForm';
import { trackEvent } from '../utils/analytics';

export interface ServicesProps {
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

const Services: React.FC = () => {
  const theme = useTheme();
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
  const [selectedService, setSelectedService] = useState<ServicesProps | null>(
    null,
  );
  const [isFormEdited, setIsFormEdited] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSectionViewed, setIsSectionViewed] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

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

    if (topRef.current) {
      observer.observe(topRef.current);
    }

    return () => {
      if (topRef.current) {
        observer.unobserve(topRef.current);
      }
    };
  }, [isSectionViewed]);

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
    [isFormEdited, closeForm],
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
      <Grid item xs={12} sm={6} md={6} key={i}>
        <Tooltip
          title={
            item.isExternalLink
              ? 'Cliquez pour voir les robots'
              : 'Cliquez pour ouvrir le formulaire'
          }
          arrow
        >
          <Box
            component={Card}
            itemScope
            itemType="https://schema.org/Service"
            padding={3}
            bgcolor={theme.palette.background.paper}
            sx={{
              boxSizing: 'border-box',
              width: '100%',
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
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
            onClick={() => handleServiceClick(item)}
            role="button"
            tabIndex={0}
            aria-label={
              item.isExternalLink
                ? `Voir les robots`
                : `Ouvrir le formulaire pour ${item.name}`
            }
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
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mt={2}
            >
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
    [theme, selectedService, handleServiceClick],
  );

  const memoizedServices = useMemo(
    () => services.map(renderServiceCard),
    [services, renderServiceCard],
  );

  return (
    <section
      id="services"
      ref={topRef}
      aria-labelledby="services-title"
      itemScope
      itemType="https://schema.org/Service"
    >
      <Container maxWidth="lg" disableGutters>
        <Box
          sx={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingX: { xs: 1, sm: 2, md: 4 },
            backgroundColor: theme.palette.background.default,
            overflowX: 'hidden',
          }}
        >
          <Box marginBottom={1}>
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
              Nous vous proposons une large gamme de services pour
              l&apos;entretien de votre robot.
            </Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Grid
              container
              spacing={{ xs: 2, sm: 3, md: 4 }}
              sx={(theme) => ({
                maxWidth: '100%',
                mx: 'auto',
                justifyContent: 'center',
                ml: {
                  xs: theme.spacing(-1),
                  sm: theme.spacing(-1.5),
                  md: theme.spacing(-2),
                },
                width: {
                  xs: `calc(100% + ${theme.spacing(2)})`,
                  sm: `calc(100% + ${theme.spacing(3)})`,
                  md: `calc(100% + ${theme.spacing(4)})`,
                },
              })}
            >
              {memoizedServices}
            </Grid>
            <Dialog
              fullScreen={fullScreen}
              open={!!selectedService}
              onClose={() => handleCloseForm()}
              maxWidth="lg" // Set maxWidth to prevent overflow
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
              <DialogTitle id="confirm-dialog-title">
                Confirmer la fermeture
              </DialogTitle>
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
      </Container>
    </section>
  );
};

export default React.memo(Services);
