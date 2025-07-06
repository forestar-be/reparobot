// src/components/CustomButton.tsx
// Import Next.js Link for client-side navigation
import { trackEvent } from '../utils/analytics';
// Import the tracking utility
import React from 'react';
import Link from 'next/link';

interface Props {
  href: string;
  text: string;
  external?: boolean; // Indicates if the link is external
  ariaLabel?: string; // Optional aria-label for accessibility
  title?: string; // Optional title for additional context
  eventCategory?: string; // Category for Google Analytics event
  eventAction?: string; // Action for Google Analytics event
  eventLabel?: string; // Label for Google Analytics event
  eventValue?: number; // Optional value for Google Analytics event
}

const CustomButton = ({
  href,
  text,
  external = false,
  ariaLabel,
  title,
  eventCategory = 'Navigation',
  eventAction = 'Click',
  eventLabel, // Optional: If not provided, default to button text
  eventValue,
}: Props): JSX.Element => {
  // Determine if the link is external
  const isExternal = external || href.startsWith('http');

  // Default event label to button text if not provided
  const finalEventLabel = eventLabel || text;

  // Click handler to track events
  const handleClick = () => {
    trackEvent(eventAction, eventCategory, finalEventLabel, eventValue);
  };

  // Common button classes
  const buttonClasses = `
    text-gray-700 hover:text-primary-600 active:text-primary-700 
    uppercase mx-3 ml-4 px-3 py-2 rounded-md transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  `;

  // If the link is external, render an <a> tag
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel || text}
        title={title || text}
        onClick={handleClick}
        className={buttonClasses}
      >
        {text}
      </a>
    );
  }

  // For internal links, use Next.js' Link
  return (
    <Link
      href={href}
      aria-label={ariaLabel || text}
      title={title || text}
      onClick={handleClick}
      className={buttonClasses}
    >
      {text}
    </Link>
  );
};

export default CustomButton;
