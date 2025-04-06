import { Theme, responsiveFontSizes } from '@mui/material';
import { createTheme, ComponentsOverrides } from '@mui/material/styles';
import { light, dark } from './palette';

const getTheme = (mode: string): Theme =>
  responsiveFontSizes(
    createTheme({
      cssVariables: true,
      palette: mode === 'light' ? light : dark,
      typography: {
        fontFamily: '"Poppins", sans-serif',
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundColor: '#f9fafb',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
              borderRadius: '1rem',
              border: '1px solid #e5e7eb',
            },
          },
        },
      },
    }),
  );

export default getTheme;
