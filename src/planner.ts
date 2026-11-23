import { BY_ID, CHRONO, DOOM_ID, TITLES, Title } from "./data";

export interface PlanOptions {
  days: number;
  hoursPerDay: number;
  includeSeries: boolean;
  order: "release" | "story";
  watched: Set<string>;
  /** Hand-picked titles ("I'll choose"). Plans exactly these, watched or not. */
  only?: string[];
}

export interface Slot {
  id: string;
  minutes: number;
  part: "whole" | "start" | "middle" | "end";
}

export interface Plan {
  days: Slot[][];
  picked: Title[];
  skipped: Title[];
  totalMin: number;
  readiness: number; // 0-100
  essentialsPicked: number;
  essentialsTotal: number;
}

const RELEASE_INDEX = Object.fromEntries(TITLES.map((x, i) => [x.id, i]));
const STORY_INDEX = Object.fromEntries(CHRONO.map((id, i) => [id, i]));

/** Lay titles out across days. Returns null if they do not fit. */
function schedule(items: Title[], days: number, perDay: number): Slot[][] | null {
  const out: Slot[][] = Array.from({ length: days }, () => []);
  let day = 0;
  let left = perDay;
  const nextDay = () => { day++; left = perDay; };

  for (const it of items) {
    let rem = it.min;
    // Don't start a film you can't finish tonight if it would fit tomorrow.
    if (it.kind !== "series" && rem > left && left < perDay && rem <= perDay) nextDay();
    let first = true;
    while (rem > 0) {
      if (left < Math.min(25, rem)) nextDay();
      if (day >= days) return null;
      const use = Math.min(rem, left);
      const last = rem - use <= 0;
      out[day].push({
        id: it.id,
        minutes: use,
        part: first && last ? "whole" : first ? "start" : last ? "end" : "middle",
      });
      rem -= use;
      left -= use;
      first = false;
    }
  }
  return out;
}

export function buildPlan(o: PlanOptions): Plan {
  const perDay = Math.round(o.hoursPerDay * 60);
  const index = o.order === "story" ? STORY_INDEX : RELEASE_INDEX;
  const sortView = (a: Title, b: Title) => index[a.id] - index[b.id];

  const chosen = o.only ? new Set(o.only) : null;
  const pool = TITLES.filter((x) =>
    x.id !== DOOM_ID &&
    (chosen ? chosen.has(x.id) : !o.watched.has(x.id) && (o.includeSeries || x.kind !== "series"))
  );

  // Most important first; among equals, the more recent one (fresher set-up).
  const ranked = [...pool].sort(
    (a, b) => b.imp - a.imp || RELEASE_INDEX[b.id] - RELEASE_INDEX[a.id]
  );

  let picked: Title[] = [];
  let days: Slot[][] = Array.from({ length: o.days }, () => []);
  for (const cand of ranked) {
    const trial = [...picked, cand].sort(sortView);
    const s = schedule(trial, o.days, perDay);
    if (s) { picked = trial; days = s; }
  }

  const pickedIds = new Set(picked.map((x) => x.id));
  const all = TITLES.filter((x) => x.id !== DOOM_ID);
  const score = (xs: Title[]) => xs.reduce((n, x) => n + x.imp * x.imp, 0);
  const have = all.filter((x) => pickedIds.has(x.id) || o.watched.has(x.id));
  const essentials = all.filter((x) => x.imp >= 7);

  return {
    days,
    picked,
    skipped: pool.filter((x) => !pickedIds.has(x.id)).sort((a, b) => b.imp - a.imp),
    totalMin: picked.reduce((n, x) => n + x.min, 0),
    readiness: Math.round((score(have) / score(all)) * 100),
    essentialsPicked: essentials.filter((x) => pickedIds.has(x.id) || o.watched.has(x.id)).length,
    essentialsTotal: essentials.length,
  };
}

export const titleOf = (id: string) => BY_ID[id];
