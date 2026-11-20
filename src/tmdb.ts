import { useEffect, useState } from "react";
import { BY_ID } from "./data";

// Trailers come from TMDB (themoviedb.org), which needs a free API key.
// Provide it either as a build variable (VITE_TMDB_KEY — the deploy workflow
// reads the repository secret TMDB_KEY) or by pasting it here.
// Without a key the site falls back to a "search YouTube" link.
const PASTED_KEY = "";
export const TMDB_KEY: string = import.meta.env.VITE_TMDB_KEY || PASTED_KEY;
export const hasTrailers = TMDB_KEY.length > 0;

const API = "https://api.themoviedb.org/3";
const CACHE = "rtd.trailers.v1";
const memo: Record<string, Promise<string | null>> = {};

const readCache = (): Record<string, string | null> => {
  try { return JSON.parse(localStorage.getItem(CACHE) || "{}"); } catch { return {}; }
};

async function get(path: string, params: Record<string, string>) {
  const res = await fetch(`${API}${path}?${new URLSearchParams({ api_key: TMDB_KEY, ...params })}`);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

async function lookup(id: string): Promise<string | null> {
  const t = BY_ID[id];
  const tv = t.kind === "series";
  const season = t.title.match(/Season (\d+)/)?.[1];
  const query = t.title.replace(/ — Season \d+/, "");
  const search = await get(`/search/${tv ? "tv" : "movie"}`, {
    query,
    ...(tv || season ? {} : { year: String(t.year) }),
  });
  const hit = search.results?.[0];
  if (!hit) return null;
  // A season's own trailer if there is one, otherwise the show's.
  const paths = tv && season ? [`/tv/${hit.id}/season/${season}/videos`, `/tv/${hit.id}/videos`] : [`/${tv ? "tv" : "movie"}/${hit.id}/videos`];
  for (const p of paths) {
    const vids: any[] = (await get(p, { language: "en-US" })).results || [];
    const yt = vids.filter((v) => v.site === "YouTube");
    const best =
      yt.find((v) => v.type === "Trailer" && v.official) || yt.find((v) => v.type === "Trailer") || yt.find((v) => v.type === "Teaser");
    if (best) return best.key;
  }
  return null;
}

/** The YouTube id of a title's trailer, or null if there is none (or no key). */
export function trailerKey(id: string): Promise<string | null> {
  if (!hasTrailers) return Promise.resolve(null);
  const cached = readCache();
  if (id in cached) return Promise.resolve(cached[id]);
  return (memo[id] ||= lookup(id)
    .then((key) => {
      try { localStorage.setItem(CACHE, JSON.stringify({ ...readCache(), [id]: key })); } catch { /* ignore */ }
      return key;
    })
    .catch(() => null));
}

export function useTrailer(id: string | null) {
  const [key, setKey] = useState<string | null>(null);
  useEffect(() => {
    setKey(null);
    if (!id) return;
    let live = true;
    trailerKey(id).then((k) => live && setKey(k));
    return () => { live = false; };
  }, [id]);
  return key;
}

export const embedUrl = (key: string) =>
  `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&rel=0&modestbranding=1`;
export const searchUrl = (id: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(BY_ID[id].title.replace(" — ", " ") + " official trailer")}`;
