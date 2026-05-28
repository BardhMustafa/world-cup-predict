// GA4 wrapper — safe to call even when GA_ID is not set (dev / no env var).
// Uses the dataLayer push pattern so events queued before the script loads
// are replayed once gtag.js arrives.

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/* eslint-disable prefer-rest-params */
function gtag() {
  (window.dataLayer = window.dataLayer || []).push(arguments);
}
/* eslint-enable prefer-rest-params */

export function initAnalytics() {
  if (!GA_ID) return;

  window.dataLayer = window.dataLayer || [];
  gtag('js', new Date());
  // send_page_view: false — we track pages manually via trackPage()
  // so React Router navigations are captured correctly.
  gtag('config', GA_ID, { send_page_view: false });

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

export function trackPage(path) {
  if (!GA_ID) return;
  gtag('event', 'page_view', { page_path: path });
}

export function trackEvent(name, params = {}) {
  if (!GA_ID) return;
  gtag('event', name, params);
}
