// Which release date this visitor counts down to. The dates themselves live in
// doomReady.ts (shared with the server); this adds detection and a switch.
import { useEffect, useState } from "react";
import { RELEASE, Region, regionOf, releaseAt } from "./doomReady";

export { RELEASE, releaseAt };
export type { Region };

const KEY = "rtd.region";

// Time zone → country, used only if the server couldn't tell us (see middleware.ts).
const TZ: Record<string, string> = {
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN", "Europe/London": "GB", "Europe/Paris": "FR", "Europe/Berlin": "DE",
  "Europe/Rome": "IT", "Europe/Brussels": "BE", "Europe/Vienna": "AT", "Europe/Helsinki": "FI", "Europe/Warsaw": "PL",
  "Europe/Stockholm": "SE", "Asia/Shanghai": "CN", "America/Sao_Paulo": "BR", "Asia/Tokyo": "JP",
  "America/Toronto": "CA", "America/Vancouver": "CA", "America/New_York": "US", "America/Chicago": "US",
  "America/Denver": "US", "America/Los_Angeles": "US", "America/Phoenix": "US", "Pacific/Honolulu": "US",
};

/**
 * Which country's release date to count down to:
 * 1. one picked on the site, 2. the country Vercel saw the visit come from
 * (a cookie set by middleware.ts), 3. the device's time zone, 4. "anywhere else" (18 Dec).
 */
export function detectRegion(): Region {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && saved in RELEASE) return saved;
  } catch { /* storage blocked */ }
  const cookie = /(?:^|; )rtd_cc=([A-Za-z]{2})/.exec(document.cookie)?.[1];
  if (cookie) return regionOf(cookie);
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TZ[tz]) return TZ[tz];
  } catch { /* old browser */ }
  return "WW";
}

// Shared across components so switching in one place updates every countdown.
let current: Region | null = null;
const listeners = new Set<(r: Region) => void>();

export function useRegion(): [Region, (r: Region) => void] {
  const [region, setRegionState] = useState<Region>(() => (current ??= detectRegion()));
  useEffect(() => {
    listeners.add(setRegionState);
    return () => { listeners.delete(setRegionState); };
  }, []);
  const set = (r: Region) => {
    current = r;
    try { localStorage.setItem(KEY, r); } catch { /* ignore */ }
    listeners.forEach((l) => l(r));
  };
  return [region, set];
}

// Countries in the picker: listed ones by name, then "Somewhere else".
const PICK = Object.entries(RELEASE).filter(([c]) => c !== "WW").sort((a, b) => a[1].name.localeCompare(b[1].name));

/** "Out 16 Dec in France · Change": the date being counted down to, with a country picker. */
export function RegionNote({ className }: { className?: string }) {
  const [region, setRegion] = useRegion();
  const r = RELEASE[region] ?? RELEASE.WW;
  return (
    <p className={`region-note${className ? ` ${className}` : ""}`}>
      {region === "WW" ? <>Counting to <b>{r.short}</b>, the US date</> : <>Out <b>{r.short}</b> in {r.label}</>}
      <span aria-hidden="true"> · </span>
      <label className="region-pick">
        <span>Change</span>
        <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Pick your country for its release date">
          {PICK.map(([code, x]) => <option key={code} value={code}>{x.name} ({x.short})</option>)}
          <option value="WW">Somewhere else (18 Dec)</option>
        </select>
      </label>
    </p>
  );
}

/**
 * The current time, refreshed every minute, so anything counted in days
 * (the nav counter, the planner's slider) moves on by itself at midnight
 * even if the page stays open. Nothing about the date is fixed in the code.
 */
export function useNow(every = 60_000) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const iv = setInterval(tick, every);
    // Phones freeze timers in background tabs: catch up as soon as the page is back.
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", tick); };
  }, [every]);
  return now;
}
