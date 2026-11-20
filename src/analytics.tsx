import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

// ── Analytics ──────────────────────────────────────────────────────────────
// Vercel Analytics: on automatically when the site runs on Vercel (enable it in
// the project's Analytics tab).
//
// Google: the Google tag snippet (container GTM-NS78CJ3F) sits at the top of
// <head> in index.html and countdown/index.html, exactly as Google provides it.
// To change or remove Google, edit it in both files.

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window { dataLayer: unknown[]; gtag?: Gtag }
}

/** Record something a visitor did, as a Google tag event. (Vercel's free plan has no custom events.) */
export function track(event: string, params: Record<string, string | number> = {}) {
  window.gtag?.("event", event, params);
}

export function Analytics() {
  return <VercelAnalytics />;
}
