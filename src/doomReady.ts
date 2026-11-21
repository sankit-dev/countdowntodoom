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
  return { pct, essentials, region: params.get("r") === "us" ? "US" : "IN" };
}

const regionParam = (region: Region) => (region === "US" ? "&r=us" : "");
export const shareUrl = (r: DoomReady, region: Region = "IN") => `${SITE_URL}/?ready=${r.pct}&e=${r.essentials}${regionParam(region)}`;

/** Path of the share-card image for these numbers. */
export const cardPath = (pct: number, essentials: number | null, region: Region = "IN") =>
  `/api/card?ready=${pct}${essentials === null ? "" : `&e=${essentials}`}${regionParam(region)}`;

// ── Release dates ───────────────────────────────────────────────────────────
// India gets Avengers: Doomsday a day early: 17 Dec 2026 (announced by Marvel
// India on 27 Oct 2026). Everywhere else counts to 18 Dec, the US date. Other
// countries' dates still conflict between sources, so they aren't listed.
export type Region = "IN" | "US";
export const RELEASE = {
  IN: { label: "India", date: "17 December 2026", short: "17 Dec", y: 2026, m: 11, d: 17 },
  US: { label: "the US", date: "18 December 2026", short: "18 Dec", y: 2026, m: 11, d: 18 },
} as const;

/** Midnight at the start of release day: in IST for India, in the visitor's own time otherwise (UTC on the server). */
export function releaseAt(region: Region) {
  const r = RELEASE[region];
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
