import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Poster art is looked up at runtime from each title's English Wikipedia
// article (no API key needed). If the lookup fails — offline, blocked, a
// renamed article — the site simply keeps its typographic tiles.
//
// To pin an image yourself, set `poster` on the title in data.ts; that wins.

import { WIKI } from "./wiki";
export { WIKI };

type Posters = Record<string, string>;
const CACHE = "rtd.posters.v2";
const TTL = 7 * 86_400_000;
const API = "https://en.wikipedia.org/w/api.php";

async function fetchBatch(ids: string[]): Promise<Posters> {
  const params = new URLSearchParams({
    action: "query", format: "json", origin: "*", redirects: "1",
    prop: "pageimages", piprop: "thumbnail", pithumbsize: "400",
    pilicense: "any", pilimit: "50",
    titles: ids.map((id) => WIKI[id]).join("|"),
  });
  const res = await fetch(`${API}?${params}`);
  if (!res.ok) throw new Error(String(res.status));
  const q = (await res.json()).query || {};
  // Wikipedia may normalise or redirect a title; follow both back to our id.
  const hop: Record<string, string> = {};
  for (const r of [...(q.normalized || []), ...(q.redirects || [])]) hop[r.from] = r.to;
  const byTitle: Record<string, string> = {};
  for (const p of Object.values<any>(q.pages || {})) if (p.thumbnail?.source) byTitle[p.title] = p.thumbnail.source;
  const out: Posters = {};
  for (const id of ids) {
    let t = WIKI[id];
    for (let i = 0; i < 4 && hop[t]; i++) t = hop[t];
    if (byTitle[t]) out[id] = byTitle[t];
  }
  return out;
}

/** Posters copied onto the site at build time (see posterPlugin.ts). */
async function localPosters(): Promise<Posters> {
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}posters/manifest.json`);
    if (!r.ok) return {};
    const m: Posters = await r.json();
    const base = new URL(import.meta.env.BASE_URL, location.href);
    return Object.fromEntries(Object.entries(m).map(([id, path]) => [id, new URL(path, base).href]));
  } catch {
    return {};
  }
}

async function loadPosters(): Promise<Posters> {
  // Our own copies first: instant, and no dependence on Wikipedia.
  const local = await localPosters();
  try {
    const c = JSON.parse(localStorage.getItem(CACHE) || "null");
    if (c && Date.now() - c.at < TTL && Object.keys(c.posters).length) return { ...c.posters, ...local };
  } catch { /* no cache */ }
  // Only ask Wikipedia for the ones we don't have.
  const ids = Object.keys(WIKI).filter((id) => !local[id]);
  if (!ids.length) return local;
  const batches: string[][] = [];
  for (let i = 0; i < ids.length; i += 40) batches.push(ids.slice(i, i + 40));
  const parts = await Promise.all(batches.map((b) => fetchBatch(b).catch(() => ({} as Posters))));
  const posters = Object.assign({}, ...parts) as Posters;
  try {
    if (Object.keys(posters).length) localStorage.setItem(CACHE, JSON.stringify({ at: Date.now(), posters }));
  } catch { /* ignore */ }
  return { ...posters, ...local };
}

const Ctx = createContext<Posters>({});
export const usePosters = () => useContext(Ctx);

export function PosterProvider({ children }: { children: ReactNode }) {
  const [posters, setPosters] = useState<Posters>({});
  useEffect(() => {
    let live = true;
    loadPosters().then((p) => live && setPosters(p)).catch(() => {});
    return () => { live = false; };
  }, []);
  return <Ctx.Provider value={posters}>{children}</Ctx.Provider>;
}

/** A poster image that removes itself if it fails to load. */
export function Poster({ src, className }: { src?: string; className?: string }) {
  const [dead, setDead] = useState(false);
  useEffect(() => setDead(false), [src]);
  if (!src || dead) return null;
  return <img className={className} src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setDead(true)} />;
}
