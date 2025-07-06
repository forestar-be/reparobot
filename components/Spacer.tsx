import React from 'react';

interface SpacerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  role?: string;
  'aria-hidden'?: boolean;
}

const Spacer: React.FC<SpacerProps> = ({
  size = 'md',
  className = '',
  role = 'separator',
  'aria-hidden': ariaHidden = true,
  ...props
}) => {
  const getSizeClass = () => {
    if (typeof size === 'number') {
      return { height: `${size}px` };
    }

    switch (size) {
      case 'sm':
        return 'h-4';
      case 'md':
        return 'h-8';
      case 'lg':
        return 'h-16';
      case 'xl':
        return 'h-24';
      default:
        return 'h-8';
    }
  };

  const sizeStyle = typeof size === 'number' ? getSizeClass() : {};
  const sizeClass = typeof size === 'string' ? getSizeClass() : '';

  return (
    <div
      role={role}
      aria-hidden={ariaHidden}
      className={`w-full ${sizeClass} ${className}`}
      style={sizeStyle}
      {...props}
    />
  );
};

export default React.memo(Spacer);
