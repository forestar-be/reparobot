// src/components/About.tsx

import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { InView } from 'react-intersection-observer';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import aboutData from '../config/about.json';
import { trackEvent } from '../utils/analytics'; // Import your analytics utility

interface AboutProps {
  value: number;
  suffix: string;
  description: string;
}

const About: React.FC = () => {
  const theme = useTheme();
  const [hasTrackedSection, setHasTrackedSection] = useState(false);

  // Track when the About section enters the viewport
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
      { threshold: 0.2 } // Fire when 20% of the section is visible
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

  const [about] = useState<AboutProps[]>(aboutData);

  // Handler for tracking hover events
  const handleHover = (description: string) => {
    const formattedDescription = description.toLowerCase().replace(/\s+/g, '_');
    trackEvent('hover_stat', 'engagement', `stat_${formattedDescription}`);
  };

  return (
    <section id="about" aria-labelledby="about-title">
      <Box
        sx={{
          paddingTop: 5,
          paddingBottom: 12,
          paddingX: 2,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12}>
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
                About Us
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
                {/* Your about section description paragraphs */}
                Welcome to our company! We specialize in providing top-notch services to our clients...
              </Typography>
            </Grid>
            {about.map((item, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box
                  component={Card}
                  height={1}
                  display="flex"
                  flexDirection="column"
                  boxShadow={0}
                  aria-label={`Statistic ${item.value}${item.suffix}`}
                  onMouseEnter={() => handleHover(item.description)}
                >
                  <CardContent
                    sx={{
                      padding: { sm: 4 },
                    }}
                  >
                    <Box
                      marginBottom={4}
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
                          <InView
                            as="span"
                            triggerOnce
                            threshold={0.5}
                            onChange={(inView) => {
                              if (inView) {
                                trackEvent(
                                  'view_stat_counter',
                                  'engagement',
                                  `stat_${item.description.toLowerCase().replace(/\s+/g, '_')}`,
                                  item.value
                                );
                              }
                            }}
                          >
                            {({ inView, ref }) => (
                              <span ref={ref}>
                                {inView ? (
                                  <CountUp
                                    duration={2}
                                    end={item.value}
                                    start={0}
                                    suffix={item.suffix}
                                  />
                                ) : (
                                  0
                                )}
                              </span>
                            )}
                          </InView>
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
