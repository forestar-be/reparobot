// src/components/CustomButton.tsx

import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link'; // Import Next.js Link for client-side navigation
import { trackEvent } from '../utils/analytics'; // Import the tracking utility
import React from 'react';

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
  const theme = useTheme();

  // Determine if the link is external
  const isExternal = external || href.startsWith('http');

  // Default event label to button text if not provided
  const finalEventLabel = eventLabel || text;

  // Click handler to track events
  const handleClick = () => {
    trackEvent(eventAction, eventCategory, finalEventLabel, eventValue);
  };

  // If the link is external, render an <a> tag inside the button
  if (isExternal) {
    return (
      <Button
        component="a"
        color="primary"
        href={href}
        variant="text"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel || text}
        title={title || text}
        onClick={handleClick} // Add onClick handler for tracking
        sx={{
          color: theme.palette.text.primary,
          textTransform: 'uppercase',
          marginX: 1.5,
          marginLeft: '15px',
          '&:active': {
            color:
              theme.palette.mode === 'dark'
                ? theme.palette.primary.main
                : theme.palette.success.dark,
          },
          '&:hover': {
            color:
              theme.palette.mode === 'dark'
                ? theme.palette.primary.main
                : theme.palette.success.dark,
          },
          '&:focus': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
          },
        }}
      >
        {text}
      </Button>
    );
  }

  // For internal links, use Next.js' Link with a styled button
  return (
    <Link href={href} passHref>
      <Button
        color="primary"
        variant="text"
        aria-label={ariaLabel || text}
        title={title || text}
        onClick={handleClick} // Add onClick handler for tracking
        sx={{
          color: theme.palette.text.primary,
          textTransform: 'uppercase',
          marginX: 1.5,
          marginLeft: '15px',
          '&:active': {
            color:
              theme.palette.mode === 'dark'
                ? theme.palette.primary.main
                : theme.palette.success.dark,
          },
          '&:hover': {
            color:
              theme.palette.mode === 'dark'
                ? theme.palette.primary.main
                : theme.palette.success.dark,
          },
          '&:focus': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
          },
        }}
      >
        {text}
      </Button>
    </Link>
  );
};

export default CustomButton;
