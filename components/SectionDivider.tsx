'use client';

import React from 'react';

interface SectionDividerProps {
  variant?: 'default' | 'wave' | 'dots' | 'gradient';
  className?: string;
  position?: 'top' | 'bottom';
}

const SectionDivider: React.FC<SectionDividerProps> = ({
  variant = 'default',
  className = '',
  position = 'top',
}) => {
  const baseClasses = `absolute left-0 right-0 z-10 ${position === 'top' ? 'top-0' : 'bottom-0'}`;

  if (variant === 'wave') {
    return (
      <div className={`${baseClasses} h-16 ${className}`}>
        <svg
          className={`h-16 w-full ${position === 'bottom' ? 'rotate-180 transform' : ''}`}
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,96L48,112C96,128 192,160 288,160C384,160 480,128 576,112C672,96 768,96 864,112C960,128 1056,160 1152,160C1200,160 1200,160 1200,96L1200,0L0,0Z"
            fill="currentColor"
            className="text-white/50"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div
        className={`${baseClasses} flex items-center justify-center py-8 ${className}`}
      >
        <div className="flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full bg-primary-300/60 ${
                i === 2 ? 'h-3 w-3 bg-primary-500/80' : ''
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div
        className={`${baseClasses} flex items-center justify-center py-4 ${className}`}
      >
        <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-primary-300/50 to-transparent" />
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`${baseClasses} flex items-center justify-center py-6 ${className}`}
    >
      <div className="flex items-center space-x-4">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary-300/60"></div>
        <div className="h-3 w-3 rounded-full bg-primary-500/80 shadow-lg"></div>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary-300/60"></div>
      </div>
    </div>
  );
};

export default SectionDivider;
