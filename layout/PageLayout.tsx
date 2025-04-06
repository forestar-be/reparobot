'use client';

import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import NoSsr from '@mui/material/NoSsr';
import Zoom from '@mui/material/Zoom';
import useMediaQuery from '@mui/material/useMediaQuery';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useTheme, ThemeProvider } from '@mui/material/styles';
import { usePathname } from 'next/navigation';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import Sidebar from './Sidebar/Sidebar';
import getTheme from '../theme/theme';

function NavigationHandler() {
  const pathname = usePathname();
  const hasScrolled = useRef(false);
  const userScrolled = useRef(false);
  const lastScrollPosition = useRef(0);

  useEffect(() => {
    // Reset all flags on route change
    hasScrolled.current = false;
    userScrolled.current = false;
    lastScrollPosition.current = window.scrollY;

    if (pathname !== '/') return;

    const hash = window.location.hash;
    if (!hash) return;

    const targetId = hash.replace('#', '');
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    // Comprehensive user interaction detection
    const detectUserInteraction = (e: Event) => {
      if (!hasScrolled.current) {
        const currentScroll = window.scrollY;
        if (Math.abs(currentScroll - lastScrollPosition.current) > 5) {
          userScrolled.current = true;
        }
        lastScrollPosition.current = currentScroll;
      }
    };

    // Add all possible scroll detection events
    window.addEventListener('wheel', detectUserInteraction, { passive: true });
    window.addEventListener('touchmove', detectUserInteraction, {
      passive: true,
    });
    window.addEventListener('keydown', (e) => {
      if (
        [
          'ArrowUp',
          'ArrowDown',
          'PageUp',
          'PageDown',
          'Home',
          'End',
          ' ',
        ].includes(e.key)
      ) {
        userScrolled.current = true;
      }
    });
    window.addEventListener('scroll', detectUserInteraction, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          !entries[0].isIntersecting &&
          !hasScrolled.current &&
          !userScrolled.current
        ) {
          hasScrolled.current = true;

          requestAnimationFrame(() => {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          });

          setTimeout(() => {
            observer.disconnect();
          }, 1000);
        }
      },
      {
        rootMargin: '0px',
        threshold: 0.1,
      },
    );

    observer.observe(targetElement);

    const cleanup = () => {
      observer.disconnect();
      window.removeEventListener('wheel', detectUserInteraction);
      window.removeEventListener('touchmove', detectUserInteraction);
      window.removeEventListener('scroll', detectUserInteraction);
    };

    return cleanup;
  }, [pathname]);

  return null;
}

interface Props {
  children: React.ReactNode;
}

const PageLayout = ({ children }: Props): JSX.Element => {
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up('lg'), {
    defaultMatches: true,
  });

  const [openSidebar, setOpenSidebar] = useState(false);

  const handleSidebarOpen = (): void => {
    setOpenSidebar(true);
  };

  const handleSidebarClose = (): void => {
    if (openSidebar) setOpenSidebar(false);
  };

  const open = isLg ? false : openSidebar;

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const scrollTo = (id: string): void => {
    setTimeout(() => {
      const element = document.querySelector(`#${id}`) as HTMLElement;
      if (!element) {
        return;
      }
      window.scrollTo({ left: 0, top: element.offsetTop, behavior: 'smooth' });
    });
  };

  return (
    <AppRouterCacheProvider options={{ key: 'css', enableCssLayer: true }}>
      <ThemeProvider theme={getTheme('light')}>
        <Box
          id="page-top"
          sx={{
            backgroundColor: theme.palette.background.default,
            height: '100%',
            width: '100%',
            overflowX: 'hidden',
            position: 'relative',
          }}
          onClick={handleSidebarClose}
        >
          <Header onSidebarOpen={handleSidebarOpen} />
          <Sidebar onClose={handleSidebarClose} open={open} />
          <Box width={1} margin="0 auto">
            {children}
          </Box>
          <Footer />
          <NoSsr>
            <Zoom in={trigger}>
              <Box
                onClick={() => scrollTo('page-top')}
                role="presentation"
                sx={{ position: 'fixed', bottom: 24, right: 32 }}
              >
                <Fab
                  color="primary"
                  size="small"
                  aria-label="scroll back to top"
                  sx={{
                    backgroundColor: '#43a047', // Explicitly set the background color
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color:
                        theme.palette.mode === 'dark' ? '#43a047' : '#2e7031',
                      border: `2px solid ${theme.palette.mode === 'dark' ? '#43a047' : '#2e7031'}`,
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <KeyboardArrowUpIcon />
                </Fab>
              </Box>
            </Zoom>
          </NoSsr>
          {/* <Suspense fallback={<div>Loading navigation...</div>}> */}
          <NavigationHandler />
          {/* </Suspense> */}
        </Box>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};

export default PageLayout;
