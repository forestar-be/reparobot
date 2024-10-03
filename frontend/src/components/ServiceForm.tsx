import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ServicesProps } from './Services';
import dayjs from 'dayjs';
import {
  FormControl,
  FormHelperText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
} from '@mui/material';
import conditions from '../config/conditions.json'; // Import conditions.json

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
  const [termsOpen, setTermsOpen] = useState(false); // State for terms dialog

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));

  const handleChange = (label: string, value: any) => {
    setFormValues({ ...formValues, [label]: value });
    onFormEdit(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const newErrors: { [key: string]: string } = {};
    const today = new Date();
    const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;

    service.formFields.forEach((field) => {
      if (field.isRequired && !formValues[field.label]) {
        newErrors[field.label] = `${field.label} est requis`;
      }
      if (field.type === 'tel' && !phoneRegex.test(formValues[field.label])) {
        newErrors[field.label] =
          `${field.label} doit être un numéro de téléphone valide`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log('Errors', newErrors);
    } else {
      onFormEdit(false);

      // Submit form
      try {
        console.log('Form submitted', formValues);
        setModalMessage('Votre demande a été soumise avec succès');
      } catch (error) {
        console.error('Error submitting form', error);
        setModalMessage(
          "Une erreur s'est produite lors de la soumission du formulaire. Veuillez réessayer ou contacter le support.",
        );
      } finally {
        setFormValues({});
        setErrors({});
        setModalOpen(true);
      }
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    onClose(true);
  };

  const handleOpenTerms = () => {
    setTermsOpen(true);
  };

  const handleCloseTerms = () => {
    setTermsOpen(false);
  };

  return (
    <Box
      component="form"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        marginTop: 4,
        padding: 2,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        position: 'relative',
        '& > *': {
          flex: isLargeScreen ? '1 1 calc(50% - 16px)' : '1 1 100%',
        },
      }}
      onSubmit={handleSubmit}
    >
      <IconButton
        onClick={() => onClose()}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
      <Typography
        variant="h6"
        sx={{
          flex: '1 1 100%',
          marginBottom: 2,
        }}
      >
        Formulaire du service: {service.name}
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {service.formFields.map((field, index) => {
          switch (field.type) {
            case 'text':
              return (
                <TextField
                  key={index}
                  label={field.label}
                  variant="outlined"
                  fullWidth
                  required={field.isRequired}
                  error={!!errors[field.label]}
                  helperText={errors[field.label]}
                  onChange={(e) => handleChange(field.label, e.target.value)}
                />
              );
            case 'email':
              return (
                <TextField
                  key={index}
                  label={field.label}
                  type="email"
                  variant="outlined"
                  fullWidth
                  required={field.isRequired}
                  error={!!errors[field.label]}
                  helperText={errors[field.label]}
                  onChange={(e) => handleChange(field.label, e.target.value)}
                />
              );
            case 'tel':
              return (
                <TextField
                  key={index}
                  label={field.label}
                  type="tel"
                  variant="outlined"
                  fullWidth
                  required={field.isRequired}
                  error={!!errors[field.label]}
                  helperText={errors[field.label]}
                  onChange={(e) => handleChange(field.label, e.target.value)}
                />
              );
            case 'textarea':
              return (
                <TextField
                  key={index}
                  label={field.label}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  required={field.isRequired}
                  error={!!errors[field.label]}
                  helperText={errors[field.label]}
                  onChange={(e) => handleChange(field.label, e.target.value)}
                />
              );
            case 'select':
              return (
                <TextField
                  key={index}
                  label={field.label}
                  select
                  variant="outlined"
                  fullWidth
                  required={field.isRequired}
                  error={!!errors[field.label]}
                  helperText={errors[field.label]}
                  onChange={(e) => handleChange(field.label, e.target.value)}
                >
                  {field.options?.map((option, i) => (
                    <MenuItem key={i} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              );
            case 'checkbox':
            case 'checkbox_term':
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
                        checked={formValues[field.label] || false}
                        onChange={(e) =>
                          handleChange(field.label, e.target.checked)
                        }
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
                          >
                            (Lire)
                          </Link>
                        </span>
                      ) : (
                        field.label
                      )
                    }
                  />
                  {!!errors[field.label] && (
                    <FormHelperText>{errors[field.label]}</FormHelperText>
                  )}
                </FormControl>
              );
            case 'date':
              return (
                <DatePicker
                  disablePast={!!field.minFuturDateRange}
                  minDate={
                    field.minFuturDateRange
                      ? dayjs().add(field.minFuturDateRange, 'day')
                      : undefined
                  }
                  key={index}
                  label={field.label}
                  value={formValues[field.label] || null}
                  onChange={(date) => handleChange(field.label, date)}
                  slotProps={{
                    textField: {
                      inputProps: {
                        required: field.isRequired,
                        error: !!errors[field.label],
                        helperText: errors[field.label],
                        fullWidth: true,
                      },
                    },
                  }}
                />
              );
            default:
              return null;
          }
        })}
      </LocalizationProvider>
      <Button variant="contained" color="primary" type="submit">
        Envoyer
      </Button>

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Form Submission'}</DialogTitle>
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

      <Dialog
        open={termsOpen}
        onClose={handleCloseTerms}
        aria-labelledby="terms-dialog-title"
        aria-describedby="terms-dialog-description"
      >
        <DialogTitle id="terms-dialog-title">
          {'Conditions Générales'}
        </DialogTitle>
        <DialogContent>
          {Object.values(conditions.terms_and_conditions).map(
            (section, index) => (
              <div key={index}>
                <Typography variant="h6">{section.title}</Typography>
                <DialogContentText>{section.content}</DialogContentText>
              </div>
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
  );
};

export default ServiceForm;
