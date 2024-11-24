'use client'; // Mark this as a client component

import './globals.css';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async'; // Import Helmet
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { usePathname, useSearchParams } from 'next/navigation';
import ColorModeContext from '../utils/ColorModeContext';
import getTheme from '../theme/theme';
import PageLayout from '../layout/PageLayout';


const defaultTheme = 'light';

function NavigationHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleScroll = () => {
      const hash = window.location.hash;

      if (pathname === '/' && hash) {
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    };

    handleScroll();
    window.addEventListener('hashchange', handleScroll);

    return () => {
      window.removeEventListener('hashchange', handleScroll);
    };
  }, [pathname, searchParams]);

  return null;
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState(defaultTheme);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        const newMode = mode === 'dark' ? 'light' : 'dark';
        window.localStorage.setItem('themeMode', newMode);
        setMode(newMode);
      },
      isDark: mode === 'dark',
    }),
    [mode]
  );

  useEffect(() => {
    const localTheme = window.localStorage.getItem('themeMode');
    if (localTheme && (localTheme === 'light' || localTheme === 'dark')) {
      setMode(localTheme);
    } else {
      const prefersDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, []);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={getTheme(mode)}>
        <CssBaseline />
        <PageLayout>
          <Suspense
            fallback={
              <div
                style={{
                  height: '100vh',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Loading...
              </div>
            }
          >
            {children}
          </Suspense>
        </PageLayout>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <HelmetProvider>
          {/* Add metadata here */}
          <Helmet>
            <title>Entretien et Réparation Robot Tondeuse Husqvarna & Gardena</title>
            <meta
              name="description"
              content="Expert en entretien, réparation et maintenance des robots tondeuses Husqvarna et Gardena. Services professionnels pour prolonger la vie de votre robot tondeuse."
            />
            <meta
              name="keywords"
              content="robot tondeuse, Husqvarna, Gardena, entretien, réparation, maintenance"
            />
            <link rel="canonical" href="http://localhost:3000/" />
            <meta
              property="og:title"
              content="Entretien et Réparation Robot Tondeuse Husqvarna & Gardena"
            />
            <meta
              property="og:description"
              content="Expert en entretien, réparation et maintenance des robots tondeuses Husqvarna et Gardena."
            />
            <meta property="og:url" content="http://localhost:3000/" />
            <meta property="og:type" content="website" />
          </Helmet>
          <Suspense fallback={<div>Loading navigation...</div>}>
          <NavigationHandler /></Suspense>
          <LayoutContent>{children}</LayoutContent>
        </HelmetProvider>
      </body>
    </html>
  );
}
