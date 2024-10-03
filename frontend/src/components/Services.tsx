import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import servicesData from '../config/services.json';
import ServiceForm from './ServiceForm';

export interface ServicesProps {
  name: string;
  description: string;
  image: string;
  formFields: FormField[];
}

interface FormField {
  label: string;
  type: string;
  options?: string[];
  optional?: boolean;
  isRequired: boolean;
  minFuturDateRange?: number;
}

const Services = (): JSX.Element => {
  const theme = useTheme();
  const [services] = useState<ServicesProps[]>(servicesData);
  const [selectedService, setSelectedService] = useState<ServicesProps | null>(
    null,
  );
  const [isFormEdited, setIsFormEdited] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const handleServiceClick = (service: ServicesProps) => {
    setSelectedService(service);
  };

  const handleCloseForm = (force?: boolean) => {
    if (isFormEdited && !force) {
      setIsConfirmDialogOpen(true);
    } else {
      closeForm();
    }
  };

  const closeForm = () => {
    setSelectedService(null);
    setIsFormEdited(false);
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleConfirmClose = () => {
    setIsConfirmDialogOpen(false);
    closeForm();
  };

  const handleCancelClose = () => {
    setIsConfirmDialogOpen(false);
  };

  return (
    <div id="services" ref={topRef}>
      <Box
        sx={{
          paddingTop: 5,
          paddingBottom: 10,
          paddingX: 2,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box marginBottom={4}>
          <Typography
            variant="h5"
            align="center"
            fontWeight={700}
            marginTop={theme.spacing(1)}
            gutterBottom
            sx={{
              color: theme.palette.text.primary,
              textTransform: 'uppercase',
            }}
          >
            Services
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            marginTop={theme.spacing(1)}
            gutterBottom
            color={theme.palette.text.secondary}
          >
            Nous vous proposons une large gamme de services pour l'entretien de
            votre robot.
          </Typography>
        </Box>
        <Container>
          <Grid container spacing={4}>
            {services.map((item, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Box
                  component={Card}
                  padding={4}
                  width={1}
                  height={1}
                  bgcolor={theme.palette.background.paper}
                  sx={{
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
                  }}
                  onClick={() => handleServiceClick(item)}
                >
                  <Box display="flex" flexDirection="column">
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography color="inherit">{item.description}</Typography>
                  </Box>
                  <Box display="block" width={1} height={1}>
                    <Card
                      sx={{
                        width: 1,
                        height: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: 'none',
                        bgcolor: 'transparent',
                        backgroundImage: 'none',
                      }}
                    >
                      <CardMedia
                        title=""
                        image={item.image}
                        sx={{
                          position: 'relative',
                          height: 320,
                          overflow: 'hidden',
                          borderRadius: 2,
                          filter:
                            theme.palette.mode === 'dark'
                              ? 'brightness(0.7)'
                              : 'brightness(0.9)',
                          marginTop: 4,
                        }}
                      />
                    </Card>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Dialog
            open={!!selectedService}
            onClose={() => handleCloseForm()}
            maxWidth={'md'}
          >
            {selectedService && (
              <ServiceForm
                service={selectedService}
                onClose={handleCloseForm}
                onFormEdit={setIsFormEdited}
              />
            )}
          </Dialog>
          <Dialog open={isConfirmDialogOpen} onClose={handleCancelClose}>
            <DialogTitle>Confirmer la fermeture</DialogTitle>
            <DialogContent>
              <DialogContentText>
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
        </Container>
      </Box>
    </div>
  );
};

export default Services;
