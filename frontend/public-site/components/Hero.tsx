// components/Hero.tsx

'use client'; // Ensure this is a client component

import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

import HeroButtons from './HeroButtons/HeroButtons';
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
  const [urlQuery, setUrlQuery] = useState<{ [key: string]: string | undefined }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView) {
            // Track Hero section visibility
            trackEvent(
              'section_view',        // More consistent event name in snake_case
              'user_engagement',     // More standard GA4 category
              'hero_section',        // Keep the section identifier
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setUrlQuery(Object.fromEntries(urlParams.entries()));
    }
  }, []);

  return (
    <div id="home" ref={heroRef}>
      <Box
        sx={{
          backgroundImage: 'url(/images/hero.webp)',
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
                  {urlQuery.x || item.description}
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
                  {item.title}
                </Typography>
              </Box>
              <HeroButtons />
            </Container>
          ))}
        </Box>
      </Box>
      <Spacer sx={{ paddingTop: 6 }} />
    </div>
  );
};

export default Hero;
