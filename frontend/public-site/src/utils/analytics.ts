// utils/analytics.ts

export const trackEvent = (
    action: string,
    category: string,
    label: string,
    value?: number
  ) => {

    // console.log("trackEvent called with:", {
    //   action,
    //   category,
    //   label,
    //   value: value ?? 'undefined'
    // });

    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
    
  };
  