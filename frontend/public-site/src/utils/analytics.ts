// analytics.ts

declare global {
  interface Window {
    gtag: (
      command: 'event',
      action: string,
      params: {
        [key: string]: any;
      }
    ) => void;
  }
}

export const trackEvent = (
  action: string,
  category: string,
  label: string,
  value?: number
) => {
  if (window.gtag) {
    window.gtag('event', action, {
      // GA4 recommended parameters
      event_name: action,
      event_category: category,
      event_label: label,
      value: value,
      // You can add custom parameters as needed
      interaction_type: category,
      item_label: label
    });
  }
};