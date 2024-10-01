import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import footerData from '../config/footer.json';

interface FooterProps {
  copyright: string;
}

const Footer = (): JSX.Element => {
  const theme = useTheme();

  const [footer] = useState<FooterProps[]>(footerData);

  return (
    <Grid container spacing={2}>
      {footer.slice(0, 1).map((item, i) => (
        <Grid item xs={12} key={i}>
          <Box sx={{ marginBottom: '20px', textAlign: 'center' }}>
            <Typography
              align="center"
              variant="subtitle2"
              color={theme.palette.text.secondary}
              gutterBottom
              sx={{ marginTop: '25px' }}
            >
              Copyright &copy; {new Date().getFullYear()} {item.copyright}.
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default Footer;
