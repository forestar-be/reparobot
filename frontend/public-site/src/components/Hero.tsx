import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';

import HeroButtons from './HeroButtons';
import Spacer from './Spacer';
import heroData from '../config/hero.json';
import { dark } from '../theme/palette';
import { rgbToRgba } from '../utils/common.utils';

interface HeroProps {
  title: string;
  description: string;
}

const Hero = (): JSX.Element => {
  const theme = useTheme();

  const [hero] = useState<HeroProps[]>(heroData);

  return (
    <div id="home">
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
  );
};

export default Hero;
