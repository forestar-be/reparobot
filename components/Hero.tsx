'use client';

import heroData from '../config/hero.json';
import { trackEvent } from '../utils/analytics';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import HeroButtons from './HeroButtons/HeroButtons';

interface HeroProps {
  title: string;
  description: string;
}

interface HeroComponentProps {
  servicesRef: React.RefObject<HTMLElement>;
  entretienServiceRef: React.RefObject<HTMLDivElement>;
}

const Hero = ({
  servicesRef,
  entretienServiceRef,
}: HeroComponentProps): JSX.Element => {
  const [hero] = useState<HeroProps[]>(heroData);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false); // State to ensure the event is sent only once

  const searchParams = useSearchParams();

  // Calculate years of experience automatically
  const currentYear = new Date().getFullYear();
  const foundingYear = 2008;
  const yearsOfExperience = currentYear - foundingYear;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView) {
            // Track Hero section visibility
            trackEvent(
              'section_view', // More consistent event name in snake_case
              'user_engagement', // More standard GA4 category
              'hero_section', // Keep the section identifier
            );
            setHasTrackedView(true); // Prevent duplicate tracking
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the Hero section is visible
      },
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, [hasTrackedView]);

  return (
    <div ref={heroRef}>
      <section
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero.webp)' }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/80" />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-1/4 h-32 w-32 animate-pulse rounded-full bg-primary-500 mix-blend-multiply blur-xl filter sm:h-48 sm:w-48 md:h-64 md:w-64"></div>
          <div className="animation-delay-2000 absolute left-1/2 top-3/4 h-48 w-48 -translate-x-1/2 transform animate-pulse rounded-full bg-green-400 mix-blend-multiply blur-xl filter sm:h-72 sm:w-72 md:h-96 md:w-96"></div>
        </div>

        {/* Content */}
        <div className="container-custom relative z-10 flex flex-col items-center justify-center pb-16 pt-32 text-center sm:pb-20">
          {hero.slice(0, 1).map((item, i) => (
            <div
              key={i}
              className="mx-auto max-w-5xl animate-fade-in px-4 sm:px-6"
            >
              {/* Main Title */}
              <div className="mb-6 sm:mb-8">
                <h1 className="mb-4 mt-4 animate-slide-up font-display text-2xl font-bold leading-tight text-white drop-shadow-2xl sm:mb-6 sm:mt-6 sm:text-3xl md:text-4xl lg:text-5xl">
                  <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {searchParams.get('x')
                      ? searchParams.get('x')
                      : item.description}
                  </span>
                </h1>
                <div className="mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 sm:w-24"></div>
              </div>

              {/* Subtitle */}
              <div className="animation-delay-200 mx-auto mb-8 max-w-4xl animate-slide-up sm:mb-10">
                <p className="text-lg font-light leading-relaxed text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-lg md:text-xl lg:text-2xl">
                  {item.title}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="animation-delay-400 mb-8 animate-slide-up sm:mb-10">
                <HeroButtons
                  servicesRef={servicesRef}
                  entretienServiceRef={entretienServiceRef}
                />
              </div>

              {/* Trust Indicators - Chips Style */}
              <div className="animation-delay-600 mx-auto grid max-w-5xl animate-fade-in grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
                <div className="group">
                  <div className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white/15 sm:w-auto sm:px-3 sm:py-2 md:px-4 md:py-2.5">
                    <div className="flex items-center">
                      <div className="mr-1 rounded-full bg-blue-500/20 p-0.5 sm:mr-1.5 sm:p-1">
                        <svg
                          className="h-2.5 w-2.5 text-blue-300 sm:h-3 sm:w-3 md:h-4 md:w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center text-white">
                        <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-sm font-semibold text-transparent sm:text-sm">
                          {yearsOfExperience} ans
                        </span>
                        <span className="ml-0.5 text-sm font-medium text-white/80 sm:ml-1 sm:text-xs">
                          d'expérience
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <button
                    onClick={() => {
                      window.open(
                        'https://www.google.com/maps/place/?q=place_id:ChIJJ8L3wqtKwkcRGnGl3tIF-go',
                        '_blank',
                      );
                    }}
                    className="inline-flex w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 sm:w-auto sm:px-3 sm:py-2 md:px-4 md:py-2.5"
                    aria-label="Voir nos avis Google"
                  >
                    <div className="flex items-center">
                      <div className="mr-1 rounded-full bg-yellow-500/20 p-0.5 sm:mr-1.5 sm:p-1">
                        <svg
                          className="h-2.5 w-2.5 text-yellow-300 sm:h-3 sm:w-3 md:h-4 md:w-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                      <div className="flex items-center text-white">
                        <span className="bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-sm font-semibold text-transparent sm:text-sm">
                          4.6★
                        </span>
                        <span className="ml-0.5 text-sm font-medium text-white/80 sm:ml-1 sm:text-xs">
                          avis Google
                        </span>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="group">
                  <div className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white/15 sm:w-auto sm:px-3 sm:py-2 md:px-4 md:py-2.5">
                    <div className="flex items-center">
                      <div className="mr-1 rounded-full bg-purple-500/20 p-0.5 sm:mr-1.5 sm:p-1">
                        <svg
                          className="h-2.5 w-2.5 text-purple-300 sm:h-3 sm:w-3 md:h-4 md:w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center text-white">
                        <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-sm font-semibold text-transparent sm:text-sm">
                          Expert
                        </span>
                        <span className="ml-0.5 text-sm font-medium text-white/80 sm:ml-1 sm:text-xs">
                          certifié
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white/15 sm:w-auto sm:px-3 sm:py-2 md:px-4 md:py-2.5">
                    <div className="flex items-center">
                      <div className="mr-1 rounded-full bg-green-500/20 p-0.5 sm:mr-1.5 sm:p-1">
                        <svg
                          className="h-2.5 w-2.5 text-green-300 sm:h-3 sm:w-3 md:h-4 md:w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center text-white">
                        <span className="bg-gradient-to-r from-white to-green-200 bg-clip-text text-sm font-semibold text-transparent sm:text-sm">
                          &lt;24h
                        </span>
                        <span className="ml-0.5 text-sm font-medium text-white/80 sm:ml-1 sm:text-xs">
                          délai de réponse
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-1 left-0 right-0 z-20 flex animate-bounce justify-center sm:bottom-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (servicesRef.current) {
                const elementPosition =
                  servicesRef.current.getBoundingClientRect().top;
                const offsetPosition =
                  elementPosition + window.pageYOffset - 80; // 80px offset for fixed header

                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                });
              }
            }}
            className="group flex cursor-pointer flex-col items-center text-white/70 transition-all duration-300 hover:text-white focus:outline-none"
            aria-label="Scroll to services section"
          >
            <span className="mb-0.5 text-sm font-medium transition-colors group-hover:text-primary-300 sm:mb-1">
              Découvrir nos services
            </span>
            <div className="flex justify-center">
              <div className="rounded-full border border-white/50 p-0.5 transition-all duration-300 group-hover:border-primary-300 group-hover:bg-primary-500/20 sm:p-1">
                <ChevronDown className="h-3 w-3 text-white/70 transition-colors group-hover:text-primary-300 sm:h-4 sm:w-4" />
              </div>
            </div>
          </button>
        </div>
      </section>

      <style jsx>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Hero;
