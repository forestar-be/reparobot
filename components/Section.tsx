import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  pattern?: 'dots' | 'grid' | 'none';
  background?: 'white' | 'gray' | 'primary';
  id?: string;
}

const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  pattern = 'none',
  background = 'white',
  id,
}) => {
  const getBackgroundClass = () => {
    switch (background) {
      case 'gray':
        return 'bg-gray-50';
      case 'primary':
        return 'bg-primary-50';
      default:
        return 'bg-white';
    }
  };

  const getPatternStyle = () => {
    switch (pattern) {
      case 'dots':
        return {
          backgroundImage:
            'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        };
      case 'grid':
        return {
          backgroundImage:
            'linear-gradient(#d1d5db 1px, transparent 1px), linear-gradient(90deg, #d1d5db 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        };
      default:
        return {};
    }
  };

  return (
    <section
      id={id}
      className={`section-padding relative ${getBackgroundClass()} ${className}`}
      style={getPatternStyle()}
    >
      {pattern !== 'none' && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-transparent" />
      )}
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default Section;
