'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List'; // Import List component
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import EmailIcon from '@mui/icons-material/Email';
import LocationIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import { useTheme } from '@mui/material/styles';
import ClientMapWrapper from './ClientMapWrapper';
import contactData from '../config/contact.json';
import { trackEvent } from '../utils/analytics';

interface ContactProps {
  address: string;
  email: string;
  phone: string;
  latitude: number;
  longitude: number;
}

const Contact = (): JSX.Element => {
  const theme = useTheme();
  const [contact] = useState<ContactProps[]>(contactData);

  const handlePhoneClick = () => {
    trackEvent('contact_phone_click', 'contact_interaction', 'phone_number', 1);
  };

  const handleEmailClick = () => {
    trackEvent('contact_email_click', 'contact_interaction', 'email_address', 1);
  };

  const handleAddressClick = () => {
    trackEvent('contact_address_click', 'contact_interaction', 'physical_address', 1);
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      itemScope
      itemType="https://schema.org/LocalBusiness"
    >
      <Box
        sx={{
          paddingTop: 5,
          paddingBottom: 10,
          paddingX: 2,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Title Section */}
        <Box marginBottom={4}>
          <Typography
            id="contact-title"
            variant="h2"
            component="h2"
            align="center"
            fontWeight={700}
            marginTop={theme.spacing(1)}
            gutterBottom
            sx={{
              color: theme.palette.text.primary,
              textTransform: 'uppercase',
            }}
            itemProp="name"
          >
            Contact
          </Typography>
          <Typography
            variant="subtitle1"
            component="p"
            align="center"
            marginTop={theme.spacing(1)}
            gutterBottom
            color={theme.palette.text.secondary}
            itemProp="description"
          >
            N&apos;hésitez pas à nous contacter pour toute information.
          </Typography>
        </Box>
        
        {/* Contact Information */}
        {contact.slice(0, 1).map((item, i) => (
          <Container key={i}>
            <Grid container spacing={4}>
              {/* Map Section */}
              <Grid item xs={12} md={6}>
                <ClientMapWrapper
                  latitude={item.latitude}
                  longitude={item.longitude}
                  address={item.address}
                  isDarkMode={theme.palette.mode === 'dark'}
                />
              </Grid>

              {/* Contact Details Section */}
              <Grid item xs={12} md={6}>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  marginTop={15}
                  marginBottom={6}
                >
                  <address
                    itemScope
                    itemType="https://schema.org/PostalAddress"
                    style={{ margin: 0 }}
                  >
                    {/* Wrap ListItems within List (ul) */}
                    <List
                      component="ul"
                      aria-label="Contact Information"
                      sx={{ padding: 0, listStyle: 'none' }} // Remove default padding and list styles
                    >
                      {/* Phone */}
                      <ListItem
                        component="li"
                        disableGutters
                        sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}
                        aria-label="Phone number"
                      >
                        <PhoneIcon
                          sx={{
                            color:
                              theme.palette.mode === 'dark'
                                ? theme.palette.primary.main
                                : theme.palette.success.dark,
                            width: 25,
                            height: 25,
                            marginRight: 1,
                          }}
                          aria-hidden="true"
                        />
                        <ListItemText
                          primary={
                            <a
                              href={`tel:${item.phone}`}
                              style={{ textDecoration: 'none', color: 'inherit' }}
                              title={`Call us at ${item.phone}`}
                              onClick={handlePhoneClick}
                            >
                              {item.phone}
                            </a>
                          }
                          sx={{
                            '&:hover': {
                              textDecoration: 'underline',
                              cursor: 'pointer',
                            },
                          }}
                        />
                      </ListItem>

                      {/* Email */}
                      <ListItem
                        component="li"
                        disableGutters
                        sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}
                        aria-label="Email address"
                      >
                        <EmailIcon
                          sx={{
                            color:
                              theme.palette.mode === 'dark'
                                ? theme.palette.primary.main
                                : theme.palette.success.dark,
                            width: 25,
                            height: 25,
                            marginRight: 1,
                          }}
                          aria-hidden="true"
                        />
                        <ListItemText
                          primary={
                            <a
                              href={`mailto:${item.email}`}
                              style={{ textDecoration: 'none', color: 'inherit' }}
                              title={`Email us at ${item.email}`}
                              onClick={handleEmailClick}
                            >
                              {item.email}
                            </a>
                          }
                          sx={{
                            '&:hover': {
                              textDecoration: 'underline',
                              cursor: 'pointer',
                            },
                          }}
                        />
                      </ListItem>

                      {/* Address */}
                      <ListItem
                        component="li"
                        disableGutters
                        sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}
                        aria-label="Physical address"
                      >
                        <LocationIcon
                          sx={{
                            color:
                              theme.palette.mode === 'dark'
                                ? theme.palette.primary.main
                                : theme.palette.success.dark,
                            width: 25,
                            height: 25,
                            marginRight: 1,
                          }}
                          aria-hidden="true"
                        />
                        <ListItemText
                          primary={
                            <a
                              href="https://maps.app.goo.gl/Ep9j27mJNvWGBBmY7"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none', color: 'inherit' }}
                              title={`Find us at ${item.address}`}
                              onClick={handleAddressClick}
                            >
                              {item.address}
                            </a>
                          }
                          sx={{
                            '&:hover': {
                              textDecoration: 'underline',
                              cursor: 'pointer',
                            },
                          }}
                        />
                      </ListItem>
                    </List>
                  </address>
                </Box>
              </Grid>
            </Grid>
          </Container>
        ))}
      </Box>
    </section>
  );
};

export default Contact;
