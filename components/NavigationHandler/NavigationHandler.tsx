// src/components/NavigationHandler/NavigationHandler.tsx

'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const NavigationHandler = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasScrolledRef = useRef(false); // To prevent multiple scrolls

  useEffect(() => {
    const handleScroll = () => {
      const hash = window.location.hash;
      console.log(`Current Hash: ${hash}`);

      if (pathname === '/' && hash && !hasScrolledRef.current) {
        hasScrolledRef.current = true; // Prevent subsequent scrolls for the same hash
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            console.log(`Scrolling to element with ID: ${hash}`);
            element.scrollIntoView({ behavior: 'smooth' });
          } else {
            console.log(`No element found with ID: ${hash}`);
          }
        }, 100);
      }
    };

    handleScroll();
    window.addEventListener('hashchange', handleScroll);
    console.log('NavigationHandler mounted and hashchange listener added.');

    return () => {
      window.removeEventListener('hashchange', handleScroll);
      console.log('NavigationHandler unmounted and hashchange listener removed.');
    };
  }, [pathname, searchParams]);

  return null;
};

export default NavigationHandler;
