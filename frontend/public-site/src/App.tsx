import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import getTheme from './theme/theme';
import ColorModeContext from './utils/ColorModeContext';
import Layout from './layout/Layout';
import Home from './pages/Home';

import CalculatorPage from './pages/CalculatorPage';
import ROICalculatorPage from './pages/ROICalculatorPage'; // Import the new page


// Google Analytics Component
const GoogleAnalytics = (): JSX.Element | null => {
  const location = useLocation();

  useEffect(() => {
    // Initialize GA
    const loadGoogleAnalytics = () => {
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-QM3ZJ7DLLV';
      
      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-QM3ZJ7DLLV', {
          debug_mode: true,
          page_path: '${location.pathname}${location.search}'
        });
      `;
      
      document.head.appendChild(script1);
      document.head.appendChild(script2);

      return () => {
        document.head.removeChild(script1);
        document.head.removeChild(script2);
      };
    };

    loadGoogleAnalytics();
  }, []);

  // Track page views
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search
      });
    }
  }, [location]);

  return null;
};


const ScrollHandler = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if there's a hash and we're on the homepage
    if (location.hash && location.pathname === '/') {
      // Small delay to ensure the DOM is fully loaded
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (location.pathname === '/') {
      // If we're just returning to homepage with no hash, scroll to top
      window.scrollTo(0, 0);
    }
  }, [location]);

  return null;
};



// App Routes with Analytics
const AppRoutes = () => {
  return (
    <>
      <GoogleAnalytics />
      <ScrollHandler />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/roi-calculator" element={<ROICalculatorPage />} /> {/* New Route */}
        </Routes>
      </Layout>
    </>
  );
};


const defaultTheme = 'light';

const App = (): JSX.Element => {
  const [mode, setMode] = useState(defaultTheme);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        const newMode = mode === 'dark' ? 'light' : 'dark';
        window.localStorage.setItem('themeMode', newMode);
        setMode(newMode);
      },
    }),
    [mode],
  );

  useEffect(() => {
    const localTheme = window.localStorage.getItem('themeMode');
    if (localTheme && (localTheme === 'light' || localTheme === 'dark')) {
      setMode(localTheme);
    } else {
      const prefersDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, []);

  return (
    <HelmetProvider>
      <Helmet
        titleTemplate="%s | Entretien Robot Husqvarna & Gardena"
        defaultTitle="Entretien Robot Husqvarna & Gardena"
      >
        <html lang="fr" />
        <meta
          name="description"
          content="Service d'entretien pour robots tondeuses Husqvarna et Gardena"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://votre-domaine.com" />
      </Helmet>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={getTheme(mode)}>
          <CssBaseline />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </HelmetProvider>
  );
};

// Add type declaration for gtag
// declare global {
//   interface Window {
//     dataLayer: any[];
//     gtag: (...args: any[]) => void;
//   }
// }

export default App;