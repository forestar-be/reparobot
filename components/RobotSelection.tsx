'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Divider,
  Chip,
  Dialog,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import robotsData from '../config/robots.json';
import RobotContactForm from './RobotContactForm';
import { trackEvent } from '../utils/analytics';

interface Robot {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  maxSurface: number;
  maxSlope: number;
  price: number;
  priceExVAT?: number;
  installationPrice: number;
  promotion?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

const RobotSelection = (): JSX.Element => {
  const [categories] = useState<Category[]>(robotsData.categories);
  const [robots] = useState<Robot[]>(robotsData.robots);
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [isFormEdited, setIsFormEdited] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const topRef = useRef<HTMLDivElement>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Track view
  useEffect(() => {
    if (!hasTrackedView) {
      trackEvent('page_view', 'navigation', 'robot_selection_page');
      setHasTrackedView(true);
    }
  }, [hasTrackedView]);

  const handleRobotClick = (robot: Robot) => {
    setSelectedRobot(robot);
    trackEvent('robot_selection', 'user_interaction', `robot_${robot.id}`);
  };

  const handleCloseForm = (force?: boolean) => {
    setSelectedRobot(null);
    setIsFormEdited(false);
  };

  return (
    <Box
      sx={{
        py: 6,
        bgcolor: theme.palette.background.default,
        minHeight: '100vh',
      }}
      ref={topRef}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 4,
          }}
        >
          Réservation de Robots Tondeuses Husqvarna
        </Typography>

        {categories.map((category) => (
          <Box key={category.id} sx={{ mb: 8 }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: theme.palette.mode === 'dark' ? '#43a047' : '#2e7031',
                px: 2,
              }}
            >
              {category.name}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                px: 2,
              }}
            >
              {category.description}
            </Typography>

            <Grid
              container
              spacing={3}
              sx={(theme) => ({
                maxWidth: '100%',
                mx: 'auto',
                justifyContent: 'center',
                ml: {
                  xs: theme.spacing(-1.5),
                  sm: theme.spacing(-1.5),
                  md: theme.spacing(-1.5),
                },
                width: {
                  xs: `calc(100% + ${theme.spacing(3)})`,
                  sm: `calc(100% + ${theme.spacing(3)})`,
                  md: `calc(100% + ${theme.spacing(3)})`,
                },
              })}
            >
              {robots
                .filter((robot) => robot.category === category.id)
                .map((robot) => (
                  <Grid item xs={12} sm={6} md={4} key={robot.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 8,
                        },
                        borderRadius: 2,
                      }}
                    >
                      <CardActionArea
                        onClick={() => handleRobotClick(robot)}
                        sx={{
                          flexGrow: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'stretch',
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="240"
                          image={robot.image}
                          alt={robot.name}
                          sx={{
                            objectFit: 'contain',
                            p: 2,
                            bgcolor:
                              theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.03)',
                          }}
                        />
                        <CardContent
                          sx={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <Typography variant="h6" component="h3" gutterBottom>
                            {robot.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2, flexGrow: 1 }}
                          >
                            {robot.description}
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Box
                            sx={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 1,
                              mb: 2,
                            }}
                          >
                            <Chip
                              label={`Surface: ${robot.maxSurface} m²`}
                              size="small"
                              sx={{
                                bgcolor:
                                  theme.palette.mode === 'dark'
                                    ? 'rgba(67, 160, 71, 0.2)'
                                    : 'rgba(67, 160, 71, 0.1)',
                                color:
                                  theme.palette.mode === 'dark'
                                    ? '#43a047'
                                    : '#2e7031',
                              }}
                            />
                            <Chip
                              label={`Pente: ${robot.maxSlope}%`}
                              size="small"
                              sx={{
                                bgcolor:
                                  theme.palette.mode === 'dark'
                                    ? 'rgba(67, 160, 71, 0.2)'
                                    : 'rgba(67, 160, 71, 0.1)',
                                color:
                                  theme.palette.mode === 'dark'
                                    ? '#43a047'
                                    : '#2e7031',
                              }}
                            />
                          </Box>
                          <Typography
                            variant="h6"
                            component="p"
                            sx={{ fontWeight: 700 }}
                          >
                            {robot.price} €
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Installation: {robot.installationPrice} €
                          </Typography>
                          {robot.promotion && (
                            <Typography
                              variant="body2"
                              sx={{
                                mt: 1,
                                color: theme.palette.error.main,
                                fontWeight: 600,
                              }}
                            >
                              Promo: {robot.promotion}
                            </Typography>
                          )}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
        ))}
      </Container>

      <Dialog
        open={!!selectedRobot}
        onClose={() => handleCloseForm()}
        maxWidth="lg"
        fullWidth
        fullScreen={isSmallScreen}
        PaperProps={{
          sx: {
            borderRadius: isSmallScreen ? 0 : 2,
            padding: 0,
            overflowY: 'auto',
            maxHeight: isSmallScreen ? '100vh' : '90vh',
            m: isSmallScreen ? 0 : 2,
          },
        }}
      >
        {selectedRobot && (
          <RobotContactForm
            robot={selectedRobot}
            onClose={handleCloseForm}
            onFormEdit={setIsFormEdited}
          />
        )}
      </Dialog>
    </Box>
  );
};

export default RobotSelection;
