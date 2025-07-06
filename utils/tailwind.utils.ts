// Utility function to combine class names
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(' ');
};

// Common animation classes
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  bounceLight: 'animate-bounce-light',
};

// Common spacing classes
export const spacing = {
  sectionPadding: 'section-padding',
  containerCustom: 'container-custom',
};

// Common button variants
export const buttons = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
};

// Common card classes
export const cards = {
  base: 'card',
};
