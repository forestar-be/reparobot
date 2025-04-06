import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { useRouter } from 'next/navigation';

const RobotReservation = (): JSX.Element => {
  const router = useRouter();

  const handleReservation = () => {
    router.push('/robots');
  };

  return (
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
  );
};

export default RobotReservation;
