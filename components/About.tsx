'use client';

import React, { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import aboutData from '../config/about.json';
import { trackEvent } from '../utils/analytics';

interface AboutProps {
  value: number;
  suffix: string;
  description: string;
}

const CountUpWrapper = ({ value, suffix, description }: AboutProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (counterRef.current) {
            trackEvent(
              'view_stat_counter',
              'engagement',
              `stat_${description.toLowerCase().replace(/\s+/g, '_')}`,
              value,
            );
          }
        }
      },
      { threshold: 0.5 },
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, [value, description]);

  return (
    <span ref={counterRef}>
      {isVisible ? (
        <CountUp duration={2} end={value} start={0} suffix={suffix} />
      ) : (
        '0'
      )}
    </span>
  );
};

const About: React.FC = () => {
  const theme = useTheme();
  const [hasTrackedSection, setHasTrackedSection] = useState(false);
  const [about] = useState<AboutProps[]>(aboutData);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedSection) {
            trackEvent('view_section', 'engagement', 'about_section');
            setHasTrackedSection(true);
          }
        });
      },
      { threshold: 0.2 },
    );

    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      observer.observe(aboutSection);
    }

    return () => {
      if (aboutSection) {
        observer.unobserve(aboutSection);
      }
    };
  }, [hasTrackedSection]);

  const handleHover = (description: string) => {
    const formattedDescription = description.toLowerCase().replace(/\s+/g, '_');
    trackEvent('hover_stat', 'engagement', `stat_${formattedDescription}`);
  };

  return (
    <section id="about" aria-labelledby="about-title">
      <Box
        sx={{
          paddingTop: 5,
          paddingBottom: 5,
          paddingX: 2,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Container sx={{ p: '0!important', maxWidth: '1000px!important' }}>
          <Grid
            container
            spacing={2}
            sx={(theme) => ({
              justifyContent: 'center',
              ml: {
                xs: theme.spacing(-1),
                sm: theme.spacing(-1),
                md: theme.spacing(-1),
              },
              width: {
                xs: `calc(100% + ${theme.spacing(2)})`,
                sm: `calc(100% + ${theme.spacing(2)})`,
                md: `calc(100% + ${theme.spacing(2)})`,
              },
              '& > .MuiGrid-item': {
                paddingLeft: theme.spacing(1),
                paddingRight: theme.spacing(1),
              },
            })}
          >
            <Grid item xs={12} pb={2}>
              <Typography
                id="about-title"
                variant="h2"
                component="h2"
                align="center"
                fontWeight={700}
                gutterBottom
                sx={{
                  color: theme.palette.text.primary,
                  textTransform: 'uppercase',
                }}
                itemProp="name"
              >
                À propos
              </Typography>
              <Typography
                variant="body1"
                component="div"
                align="center"
                color={theme.palette.text.secondary}
                marginTop={theme.spacing(1)}
                gutterBottom
                itemProp="description"
              >
                Découvrez nos chiffres
              </Typography>
            </Grid>
            {about.map((item, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.background.default,
                    width: '100%',
                  }}
                  component={Card}
                  height={1}
                  display="flex"
                  flexDirection="column"
                  aria-label={`Statistic ${item.value}${item.suffix}`}
                  onMouseEnter={() => handleHover(item.description)}
                >
                  <CardContent
                    sx={{
                      padding: { sm: 4 },
                    }}
                  >
                    <Box
                      marginBottom={0}
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                    >
                      <Typography
                        variant="h4"
                        color="primary"
                        gutterBottom
                        component="h3"
                      >
                        <Box
                          fontWeight={600}
                          sx={{
                            color:
                              theme.palette.mode === 'dark'
                                ? theme.palette.primary.main
                                : theme.palette.success.dark,
                          }}
                        >
                          <CountUpWrapper
                            value={item.value}
                            suffix={item.suffix}
                            description={item.description}
                          />
                        </Box>
                      </Typography>
                      <Typography
                        component="p"
                        color={theme.palette.text.secondary}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </section>
  );
};

export default About;
