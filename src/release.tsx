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

/** "Counting down to India's date (17 Dec)." plus a button to switch to the other one. */
export function RegionNote({ className }: { className?: string }) {
  const [region, setRegion] = useRegion();
  const other: Region = region === "IN" ? "US" : "IN";
  return (
    <p className={`region-note${className ? ` ${className}` : ""}`}>
      {region === "IN"
        ? <>Out in India on <b>{RELEASE.IN.short}</b>, a day before the US.</>
        : <>Out <b>{RELEASE.US.short}</b> in the US, and a day earlier ({RELEASE.IN.short}) in India.</>}{" "}
      <button type="button" onClick={() => setRegion(other)}>
        {other === "IN" ? "Count down to India's date" : "Count down to the US date"}
      </button>
    </p>
  );
}
