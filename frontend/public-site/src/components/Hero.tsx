// src/components/Hero.tsx

import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Helmet } from 'react-helmet-async';

import HeroButtons from './HeroButtons';
import Spacer from './Spacer';
import heroData from '../config/hero.json';
import { dark } from '../theme/palette';
import { rgbToRgba } from '../utils/common.utils';
import { trackEvent } from '../utils/analytics'; // Import the tracking utility

interface HeroProps {
  title: string;
  description: string;
}

const Hero = (): JSX.Element => {
  const [hero] = useState<HeroProps[]>(heroData);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false); // State to ensure the event is sent only once

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView) {
            // Track Hero section visibility
            trackEvent(
              'section_view',           // More consistent event name in snake_case
              'user_engagement',       // More standard GA4 category
              'hero_section',         // Keep the section identifier
            );
            setHasTrackedView(true); // Prevent duplicate tracking
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the Hero section is visible
      }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, [hasTrackedView]);

  return (
    <>
      <Helmet>
        <title>
          Entretien et Réparation Robot Tondeuse Husqvarna & Gardena
        </title>
        <meta
          name="description"
          content="Expert en entretien, réparation et maintenance des robots tondeuses Husqvarna et Gardena. Services professionnels pour prolonger la vie de votre robot tondeuse."
        />
        <meta
          name="keywords"
          content="robot tondeuse, Husqvarna, Gardena, entretien, réparation, maintenance"
        />
        <link rel="canonical" href="http://localhost:3000/" />
        <meta
          property="og:title"
          content="Entretien et Réparation Robot Tondeuse Husqvarna & Gardena"
        />
        <meta
          property="og:description"
          content="Expert en entretien, réparation et maintenance des robots tondeuses Husqvarna et Gardena."
        />
        <meta property="og:url" content="http://localhost:3000/" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div id="home" ref={heroRef}>
        <Box
          sx={{
            backgroundImage: 'url(/images/hero.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Box
            sx={{
              paddingY: 10,
              paddingX: 2,
              backgroundColor: rgbToRgba(dark.background.paper, 0.6),
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {hero.slice(0, 1).map((item, i) => (
              <Container
                key={i}
                maxWidth="md"
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box marginBottom={2}>
                  <Typography
                    align="center"
                    color={dark.text.primary}
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                    }}
                    gutterBottom
                  >
                    {item.title}
                  </Typography>
                </Box>
                <Box marginBottom={3}>
                  <Typography
                    variant="h6"
                    component="p"
                    color={dark.text.primary}
                    sx={{
                      fontWeight: 400,
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
                <HeroButtons />
              </Container>
            ))}
          </Box>
        </Box>
        <Spacer sx={{ paddingTop: 6 }} />
      </div>
    </>
  );
};

export default Hero;
