import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import servicesData from '../config/services.json';

interface ServicesProps {
  name: string;
  description: string;
  image: string;
}

const Services = (): JSX.Element => {
  const theme = useTheme();

  const [services] = useState<ServicesProps[]>(servicesData);

  return (
    <div id="services">
      <Box
        sx={{
          paddingTop: 5,
          paddingBottom: 10,
          paddingX: 2,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box marginBottom={4}>
          <Typography
            variant="h5"
            align="center"
            fontWeight={700}
            marginTop={theme.spacing(1)}
            gutterBottom
            sx={{
              color: theme.palette.text.primary,
              textTransform: 'uppercase',
            }}
          >
            Services
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            marginTop={theme.spacing(1)}
            gutterBottom
            color={theme.palette.text.secondary}
          >
            Nous vous proposons une large gamme de service pour l'entretien de
            votre robot.
          </Typography>
        </Box>
        <Container>
          <Grid container spacing={4}>
            {services.map((item, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Box
                  component={Card}
                  padding={4}
                  width={1}
                  height={1}
                  bgcolor={theme.palette.background.paper}
                  sx={{
                    '&:hover': {
                      bgcolor: theme.palette.background.default,
                      color:
                        theme.palette.mode === 'dark'
                          ? theme.palette.common.white
                          : theme.palette.common.black,
                    },
                  }}
                >
                  <Box display="flex" flexDirection="column">
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography color="inherit">{item.description}</Typography>
                  </Box>
                  <Box display="block" width={1} height={1}>
                    <Card
                      sx={{
                        width: 1,
                        height: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: 'none',
                        bgcolor: 'transparent',
                        backgroundImage: 'none',
                      }}
                    >
                      <CardMedia
                        title=""
                        image={item.image}
                        sx={{
                          position: 'relative',
                          height: 320,
                          overflow: 'hidden',
                          borderRadius: 2,
                          filter:
                            theme.palette.mode === 'dark'
                              ? 'brightness(0.7)'
                              : 'brightness(0.9)',
                          marginTop: 4,
                        }}
                      />
                    </Card>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </div>
  );
};

export default Services;
