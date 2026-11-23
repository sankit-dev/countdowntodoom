// "Doom-ready %": how much of what matters for Avengers: Doomsday you have
// actually watched. Only ticked titles count (unlike the planner's "Ready by
// release", which also counts what your plan will cover). Titles are weighted
// by importance squared — the same weighting the planner uses — so the
// essentials dominate.
//
// No React and no browser APIs here: the server functions in api/ use it too.
// Relative imports keep their ".js" extension so Node can load them on Vercel.
import { DOOM_ID, TITLES, tierOf } from "./data.js";

export const SITE_HOST = "countdowntodoom.vercel.app";
export const SITE_URL = `https://${SITE_HOST}`;

const ALL = TITLES.filter((t) => t.id !== DOOM_ID);
const ESSENTIALS = ALL.filter((t) => tierOf(t) === "essential");
const weight = (imp: number) => imp * imp;
const TOTAL = ALL.reduce((n, t) => n + weight(t.imp), 0);

export const ESSENTIALS_TOTAL = ESSENTIALS.length;

export interface DoomReady {
  pct: number; // 0–100
  essentials: number; // essentials watched
  essentialsTotal: number;
}

export function doomReady(watched: Set<string>): DoomReady {
  const have = ALL.filter((t) => watched.has(t.id)).reduce((n, t) => n + weight(t.imp), 0);
  return {
    pct: Math.round((have / TOTAL) * 100),
    essentials: ESSENTIALS.filter((t) => watched.has(t.id)).length,
    essentialsTotal: ESSENTIALS_TOTAL,
  };
}

/** Clamp untrusted numbers from a share link. */
export function parseShare(params: URLSearchParams): { pct: number; essentials: number | null; region: Region } | null {
  const raw = params.get("ready");
  if (raw === null || !/^\d{1,3}$/.test(raw)) return null;
  const pct = Math.min(100, Number(raw));
  const e = params.get("e");
  const essentials = e !== null && /^\d{1,2}$/.test(e) ? Math.min(ESSENTIALS_TOTAL, Number(e)) : null;
  const r = params.get("r");
  return { pct, essentials, region: r ? regionOf(r) : "IN" };
}

const regionParam = (region: Region) => (region === "IN" ? "" : `&r=${region.toLowerCase()}`);
export const shareUrl = (r: DoomReady, region: Region = "IN") => `${SITE_URL}/?ready=${r.pct}&e=${r.essentials}${regionParam(region)}`;

/** Path of the share-card image for these numbers. */
export const cardPath = (pct: number, essentials: number | null, region: Region = "IN") =>
  `/api/card?ready=${pct}${essentials === null ? "" : `&e=${essentials}`}${regionParam(region)}`;

// ── Release dates ───────────────────────────────────────────────────────────
// Avengers: Doomsday opens on different days around the world. India is 17 Dec
// (Marvel India, 27 Oct 2026); the US, Canada and Japan are 18 Dec; much of
// Europe, the UK, China and Brazil are reported as 16 Dec. Fan and listings
// sources still disagree on some countries, so only those with a consistent
// date are listed. Anywhere else counts to 18 Dec (the latest), so nobody is
// told it's out before it is. The site has a "Wrong date?" link for fixes.
export type Region = string; // ISO country code, or "WW" for "anywhere else"
type Info = { label: string; name: string; date: string; short: string; y: number; m: number; d: number };
const day = (label: string, name: string, d: number): Info =>
  ({ label, name, date: `${d} December 2026`, short: `${d} Dec`, y: 2026, m: 11, d });
export const RELEASE: Record<string, Info> = {
  IN: day("India", "India", 17),
  US: day("the US", "United States", 18),
  CA: day("Canada", "Canada", 18),
  JP: day("Japan", "Japan", 18),
  GB: day("the UK", "United Kingdom", 16),
  FR: day("France", "France", 16),
  DE: day("Germany", "Germany", 16),
  IT: day("Italy", "Italy", 16),
  BE: day("Belgium", "Belgium", 16),
  AT: day("Austria", "Austria", 16),
  FI: day("Finland", "Finland", 16),
  PL: day("Poland", "Poland", 16),
  SE: day("Sweden", "Sweden", 16),
  CN: day("China", "China", 16),
  BR: day("Brazil", "Brazil", 16),
  WW: day("most countries", "Somewhere else", 18),
};
/** Any code we don't have a date for counts down to 18 Dec. */
export const regionOf = (code: string | null | undefined): Region => {
  const c = (code || "").toUpperCase();
  return c in RELEASE ? c : "WW";
};

/** Midnight at the start of release day: in IST for India, in the visitor's own time otherwise (UTC on the server). */
export function releaseAt(region: Region) {
  const r = RELEASE[region] ?? RELEASE.WW;
  return region === "IN" ? Date.UTC(r.y, r.m, r.d - 1, 18, 30) : new Date(r.y, r.m, r.d).getTime();
}

/** Whole days left, rounded down, the same way the big countdown shows them. */
export const daysUntil = (region: Region, now = Date.now()) =>
  Math.max(0, Math.floor((releaseAt(region) - now) / 86_400_000));

/** Days left shown on share cards: India's date unless the link says otherwise. */
export const daysLeft = (region: Region = "IN", now = Date.now()) => daysUntil(region, now);

/** The prefilled post for X: the wording you asked for, with the share link in place of the bare domain. */
export const xText = (r: DoomReady, region: Region = "IN") =>
  `i'm ${r.pct}% doom-ready, how ready are you?? ${SITE_HOST}/?ready=${r.pct}&e=${r.essentials}${regionParam(region)}`;
export const xIntent = (r: DoomReady, region: Region = "IN") => `https://x.com/intent/post?text=${encodeURIComponent(xText(r, region))}`;
