'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronUp } from 'lucide-react';
import Footer from './Footer/Footer';
import Header from './Header/Header';
import Sidebar from './Sidebar/Sidebar';

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
  const [openSidebar, setOpenSidebar] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLg, setIsLg] = useState(true);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsLg(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) {
        setOpenSidebar(false);
      }
    };

    // Set initial value
    handleResize();

    // Add scroll listener for scroll-to-top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSidebarOpen = (): void => {
    setOpenSidebar(true);
  };

  const handleSidebarClose = (): void => {
    if (openSidebar) setOpenSidebar(false);
  };

  const open = isLg ? false : openSidebar;

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
    <div
      id="page-top"
      className="relative min-h-screen w-full overflow-x-hidden bg-white"
      onClick={handleSidebarClose}
    >
      <Header />
      <Sidebar onClose={handleSidebarClose} open={open} />

      <main className="mx-auto w-full">{children}</main>

      <Footer />

      {/* Scroll to top button */}
      <button
        onClick={() => scrollTo('page-top')}
        className={`fixed bottom-6 right-8 z-50 transform rounded-full bg-primary-500 p-3 text-white shadow-lg transition-all duration-300 hover:bg-primary-600 ${
          showScrollTop
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-16 scale-90 opacity-0'
        }`}
        aria-label="scroll back to top"
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      <NavigationHandler />
    </div>
  );
};

export default PageLayout;
