import React from 'react';
import Link from 'next/link';

interface HeroButtonsProps {
  servicesRef: React.RefObject<HTMLElement>;
  entretienServiceRef: React.RefObject<HTMLDivElement>;
}

const HeroButtons = ({
  servicesRef,
  entretienServiceRef,
}: HeroButtonsProps): JSX.Element => {
  // Event handler for the first button
  const handleBuyRobotClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher le comportement par défaut du lien
    console.log('Buy Robot button clicked');

    // Dispatch custom event to highlight specific services
    const event = new CustomEvent('highlightServices', {
      detail: {
        serviceNames: ['devis immédiat', 'réservation de robot'],
      },
    });
    window.dispatchEvent(event);

    // Scroll to the top of the services section using ref with offset for fixed header
    setTimeout(() => {
      if (servicesRef.current) {
        const elementPosition = servicesRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 80; // 80px offset for fixed header

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 100);
  };

  // Event handler for the second button
  const handleMaintenanceClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher le comportement par défaut du lien
    console.log('Maintenance & Repair button clicked');

    // Dispatch custom event to highlight specific services
    const event = new CustomEvent('highlightServices', {
      detail: {
        serviceNames: [
          'entretien de robot',
          'réparation de robot',
          "problème d'installation",
        ],
      },
    });
    window.dispatchEvent(event);

    // Scroll to the specific service div using ref with offset for fixed header
    setTimeout(() => {
      if (entretienServiceRef.current) {
        const elementPosition =
          entretienServiceRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 100; // offset for fixed header

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 100);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 md:flex-row md:gap-4 lg:gap-6">
      {/* First Button - Acheter un robot tondeuse */}
      <Link
        href="#services"
        className="group relative inline-block w-[320px] min-w-[320px] overflow-hidden rounded-lg border-2 border-blue-400/40 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2 text-center font-semibold text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:transform hover:border-blue-300/60 hover:shadow-2xl hover:shadow-blue-500/25 sm:rounded-xl sm:px-6 sm:py-3 md:w-auto md:rounded-2xl md:px-4 md:py-2 lg:px-8 lg:py-4"
        aria-label="Acheter un robot tondeuse"
        onClick={handleBuyRobotClick}
      >
        <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
          <svg
            className="h-4 w-4 text-blue-300 transition-colors group-hover:text-blue-200 sm:h-5 sm:w-5 md:h-6 md:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293A1 1 0 007 17h10M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
            />
          </svg>
          <span className="text-sm font-semibold text-white transition-colors group-hover:text-white sm:text-base md:text-lg lg:text-xl">
            Acheter un robot tondeuse
          </span>
          <svg
            className="h-3 w-3 text-blue-300 transition-all group-hover:translate-x-1 group-hover:text-blue-200 sm:h-4 sm:w-4 md:h-5 md:w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 transition-opacity duration-300 group-hover:opacity-20 sm:rounded-xl md:rounded-2xl"></div>
      </Link>

      {/* Second Button - Entretien & Réparation */}
      <Link
        href="#service-entretien_robot"
        className="group relative inline-block w-[320px] min-w-[320px] overflow-hidden rounded-lg border-2 border-green-400/40 bg-gradient-to-r from-green-500/20 to-blue-500/20 px-4 py-2 text-center font-semibold text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:transform hover:border-green-300/60 hover:shadow-2xl hover:shadow-green-500/25 sm:rounded-xl sm:px-6 sm:py-3 md:w-auto md:rounded-2xl md:px-4 md:py-2 lg:px-8 lg:py-4"
        aria-label="Services d'entretien et réparation de robots tondeuses"
        onClick={handleMaintenanceClick}
      >
        <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
          <svg
            className="h-4 w-4 text-green-300 transition-colors group-hover:text-green-200 sm:h-5 sm:w-5 md:h-6 md:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {/* Clé à molette */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm font-semibold text-white transition-colors group-hover:text-white sm:text-base md:text-lg lg:text-xl">
            Entretien & Réparation
          </span>
          <svg
            className="h-3 w-3 text-green-300 transition-all group-hover:translate-x-1 group-hover:text-green-200 sm:h-4 sm:w-4 md:h-5 md:w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-blue-500/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-green-400 to-blue-400 opacity-0 transition-opacity duration-300 group-hover:opacity-20 sm:rounded-xl md:rounded-2xl"></div>
      </Link>
    </div>
  );
};

export default HeroButtons;
