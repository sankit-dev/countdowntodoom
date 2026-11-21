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
export function parseShare(params: URLSearchParams): { pct: number; essentials: number | null } | null {
  const raw = params.get("ready");
  if (raw === null || !/^\d{1,3}$/.test(raw)) return null;
  const pct = Math.min(100, Number(raw));
  const e = params.get("e");
  const essentials = e !== null && /^\d{1,2}$/.test(e) ? Math.min(ESSENTIALS_TOTAL, Number(e)) : null;
  return { pct, essentials };
}

export const shareUrl = (r: DoomReady) => `${SITE_URL}/?ready=${r.pct}&e=${r.essentials}`;

/** Path of the share-card image for these numbers. */
export const cardPath = (pct: number, essentials: number | null) =>
  `/api/card?ready=${pct}${essentials === null ? "" : `&e=${essentials}`}`;

// Release: 18 December 2026. Server-side "days left" counts to midnight in India
// (IST, UTC+5:30), where most visitors are; the page itself counts to midnight
// in each visitor's own timezone.
const DOOM_IST = Date.UTC(2026, 11, 17, 18, 30);
export const daysLeft = (now = Date.now()) => Math.max(0, Math.ceil((DOOM_IST - now) / 86_400_000));

/** The prefilled post for X: the wording you asked for, with the share link in place of the bare domain. */
export const xText = (r: DoomReady) =>
  `i'm ${r.pct}% doom-ready, how ready are you?? ${SITE_HOST}/?ready=${r.pct}&e=${r.essentials}`;
export const xIntent = (r: DoomReady) => `https://x.com/intent/post?text=${encodeURIComponent(xText(r))}`;
