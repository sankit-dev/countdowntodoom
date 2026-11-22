// Which release date this visitor counts down to. The dates themselves live in
// doomReady.ts (shared with the server); this adds detection and a switch.
import { useEffect, useState } from "react";
import { RELEASE, Region, releaseAt } from "./doomReady";

export { RELEASE, releaseAt };
export type { Region };

const KEY = "rtd.region";

/** India if the device is set to Indian time, otherwise the US date. A choice made on the site wins. */
export function detectRegion(): Region {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "IN" || saved === "US") return saved;
  } catch { /* storage blocked */ }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "IN";
  } catch { /* old browser */ }
  return "US";
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

/** "Out 17 Dec in India · Switch to US": the date being counted down to, and a switch. */
export function RegionNote({ className }: { className?: string }) {
  const [region, setRegion] = useRegion();
  const other: Region = region === "IN" ? "US" : "IN";
  return (
    <p className={`region-note${className ? ` ${className}` : ""}`}>
      Out <b>{RELEASE[region].short}</b> in {RELEASE[region].label}
      <span aria-hidden="true"> · </span>
      <button type="button" onClick={() => setRegion(other)} aria-label={`Count down to the ${other === "IN" ? "India" : "US"} date instead`}>
        Switch to {other === "IN" ? "India" : "US"}
      </button>
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
