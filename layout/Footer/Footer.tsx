import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import footerData from '../../config/footer.json';
import { Paper } from '@mui/material';

interface FooterProps {
  copyright: string;
  TVA: string;
}

const Footer = (): JSX.Element => {
  const theme = useTheme();

  const [footer] = useState<FooterProps>(footerData);

  return (
    <Grid container spacing={2} component={Paper}>
      <Grid item xs={12}>
        <Box sx={{ marginBottom: '20px', textAlign: 'center' }}>
          <Typography
            align="center"
            color={theme.palette.text.secondary}
            gutterBottom
            sx={{ marginTop: '25px', fontSize: '0.95em' }}
          >
            Copyright &copy; {new Date().getFullYear()} {footer.copyright}.
          </Typography>
          <Typography
            align="center"
            color={theme.palette.text.secondary}
            gutterBottom
            sx={{ fontSize: '0.95em' }}
          >
            TVA {footer.TVA}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Footer;
