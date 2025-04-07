import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

const RobotReservation = (): JSX.Element => {
  const router = useRouter();

  const handleReservation = () => {
    router.push('/robots');
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Robots Tondeuses Husqvarna',
    description:
      'Découvrez notre gamme complète de robots tondeuses Husqvarna. Installation professionnelle incluse.',
    brand: {
      '@type': 'Brand',
      name: 'Husqvarna',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <Head>
        <title>
          ReparObot | Robots Tondeuses Husqvarna | Vente et Installation en
          Belgique
        </title>
        <meta
          name="description"
          content="ReparObot est distributeur officiel de robots tondeuses Husqvarna en Belgique. Installation professionnelle, service après-vente et entretien annuel disponible."
        />
        <meta
          name="keywords"
          content="robot tondeuse, Husqvarna, Automower, installation robot tondeuse, entretien robot tondeuse, Belgique"
        />
        <meta
          property="og:title"
          content="ReparObot | Robots Tondeuses Husqvarna | Vente et Installation"
        />
        <meta
          property="og:description"
          content="Distributeur officiel de robots tondeuses Husqvarna en Belgique. Installation et service inclus."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reparobot.be/" />
        <meta
          property="og:image"
          content="https://reparobot.be/images/robot-tondeuse-husqvarna.jpg"
        />
        <link rel="canonical" href="https://reparobot.be/" />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Head>
      <Box
        sx={{
          py: 4,
          backgroundColor: 'background.paper',
          borderRadius: 4,
          textAlign: 'center',
          boxShadow: 3,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            Réservez votre robot tondeuse Husqvarna
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Découvrez notre gamme complète de robots tondeuses Husqvarna.
            Choisissez parmi 14 modèles différents, filaires ou sans fil, pour
            trouver celui qui correspond parfaitement à vos besoins.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleReservation}
            sx={{
              bgcolor: '#43a047',
              '&:hover': {
                bgcolor: '#2e7031',
              },
              px: 4,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            Découvrir les robots
          </Button>
        </Container>
      </Box>
    </>
  );
};

export default RobotReservation;
