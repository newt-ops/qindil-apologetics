// Google Analytics 4 (GA4) Consent-Gated Loader & Helper

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const CONSENT_KEY = 'qindil_cookie_consent';

export const getCookieConsent = (): 'accepted' | 'declined' | null => {
  if (typeof window === 'undefined') return null;
  const val = localStorage.getItem(CONSENT_KEY);
  if (val === 'accepted' || val === 'declined') return val;
  return null;
};

export const setCookieConsent = (consent: 'accepted' | 'declined'): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_KEY, consent);
};

export const initGA4 = (): void => {
  if (typeof window === 'undefined') return;

  const consent = getCookieConsent();
  if (consent !== 'accepted') {
    return;
  }

  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;
  if (!measurementId) {
    if (import.meta.env.DEV) {
      console.log('[GA4] No VITE_GA4_MEASUREMENT_ID configured.');
    }
    return;
  }

  // Prevent duplicate script injection
  const scriptId = 'ga4-gtag-script';
  if (document.getElementById(scriptId)) {
    return;
  }

  // Inject GA4 script tag
  const script = document.createElement('script');
  script.id = scriptId;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
  });

  if (import.meta.env.DEV) {
    console.log(`[GA4] Initialized GA4 with Measurement ID: ${measurementId}`);
  }
};

export const trackGA4Event = (action: string, category?: string, label?: string, value?: number): void => {
  if (typeof window === 'undefined' || getCookieConsent() !== 'accepted') {
    return;
  }

  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
