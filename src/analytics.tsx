import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

// ── Analytics ──────────────────────────────────────────────────────────────
// Vercel Analytics: on automatically when the site runs on Vercel (enable it in
// the project's Analytics tab). Nothing to configure here.
//
// Google Analytics: paste your Measurement ID (looks like "G-XXXXXXXXXX"), or
// set it as the build variable VITE_GA_ID. Left empty, Google is not loaded.
const PASTED_GA_ID = "";
const GA_ID: string = import.meta.env.VITE_GA_ID || PASTED_GA_ID;

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window { dataLayer: unknown[]; gtag?: Gtag }
}

let started = false;
function startGoogle() {
  if (started || !GA_ID || typeof window === "undefined") return;
  started = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
}

/** Record something a visitor did (Google Analytics only; Vercel's free plan has no custom events). */
export function track(event: string, params: Record<string, string | number> = {}) {
  window.gtag?.("event", event, params);
}

export function Analytics() {
  startGoogle();
  return <VercelAnalytics />;
}
