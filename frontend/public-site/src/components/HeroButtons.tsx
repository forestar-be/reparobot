// src/components/HeroButtons.tsx

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { trackEvent } from '../utils/analytics'; // Import the tracking utility

const HeroButtons = (): JSX.Element => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  });

  // Event handler for the first button
  const handleExploreServicesClick = () => {
    trackEvent(
      'button_click',           // Action: more specific, snake_case
      'hero_interaction',       // Category: more specific, snake_case
      'explore_services'        // Label: snake_case, shorter
    );
  };

  // Event handler for the second button
  const handleExpertiseClick = () => {
    trackEvent(
      'button_click',           // Action: more specific, snake_case
      'hero_interaction',       // Category: more specific, snake_case
      'expertise_section'       // Label: snake_case, shorter
    );
  };

  return (
    <Box
      component="nav"
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretched', sm: 'flex-start' }}
      justifyContent="center"
      marginTop={4}
      aria-label="Navigation des sections principales"
    >
      {/* First Button: "Explorer nos services de robotique" */}
      <Button
        component="a"
        variant="contained"
        size="large"
        fullWidth={!isMd}
        href="#services"
        endIcon={<ArrowForwardIcon aria-hidden="true" />}
        disableElevation
        aria-label="Explorer nos services d'entretien et réparation de robots tondeuses"
        onClick={handleExploreServicesClick} // Attach onClick handler
        sx={{
          backdropFilter: 'blur(10px)',
          color:
            theme.palette.mode === 'dark'
              ? theme.palette.common.black
              : theme.palette.common.white,
          bgcolor:
            theme.palette.mode === 'dark'
              ? theme.palette.primary.main
              : theme.palette.success.dark,
          padding: '15px 30px',
          marginRight: isMd ? '15px' : 0,
          fontSize: '16px',
          textTransform: 'uppercase',
          border: '2px solid',
          borderColor:
            theme.palette.mode === 'dark'
              ? theme.palette.primary.main
              : theme.palette.success.dark,
          '&:hover': {
            backgroundColor: 'transparent',
            color:
              theme.palette.mode === 'dark'
                ? theme.palette.primary.main
                : theme.palette.success.dark,
            border: '2px solid',
            borderColor:
              theme.palette.mode === 'dark'
                ? theme.palette.primary.main
                : theme.palette.success.dark,
          },
          '&:focus': {
            outline: `2px solid ${theme.palette.mode === 'dark'
                ? theme.palette.primary.light
                : theme.palette.success.light
              }`,
            outlineOffset: '2px',
          },
        }}
      >
        Explorer nos services de robotique
      </Button>

      {/* Second Button: "Notre expertise robotique" */}
      <Box
        marginTop={{ xs: 2, sm: 0 }}
        marginLeft={{ sm: isMd ? '15px' : 0 }}
        width={{ xs: '100%', md: 'auto' }}
      >
        <Button
          component="a"
          variant="outlined"
          size="large"
          fullWidth={!isMd}
          href="#about"
          disableElevation
          aria-label="En savoir plus sur notre expertise en robots tondeuses Husqvarna et Gardena"
          onClick={handleExpertiseClick} // Attach onClick handler
          sx={{
            backdropFilter: 'blur(10px)',
            color:
              theme.palette.mode === 'dark'
                ? theme.palette.primary.main
                : theme.palette.success.dark,
            padding: '15px 30px',
            fontSize: '16px',
            textTransform: 'uppercase',
            border: '2px solid',
            borderColor:
              theme.palette.mode === 'dark'
                ? theme.palette.primary.main
                : theme.palette.success.dark,
            whiteSpace: 'nowrap',
            minWidth: 'auto',
            '&:hover': {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? theme.palette.primary.main
                  : theme.palette.success.dark,
              color:
                theme.palette.mode === 'dark'
                  ? theme.palette.common.black
                  : theme.palette.common.white,
              border: '2px solid',
              borderColor:
                theme.palette.mode === 'dark'
                  ? theme.palette.primary.main
                  : theme.palette.success.dark,
            },
            '&:focus': {
              outline: `2px solid ${theme.palette.mode === 'dark'
                  ? theme.palette.primary.light
                  : theme.palette.success.light
                }`,
              outlineOffset: '2px',
            },
          }}
        >
          Notre expertise robotique
        </Button>
      </Box>
    </Box>
  );
};

export default HeroButtons;
