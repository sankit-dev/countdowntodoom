import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Poster art is looked up at runtime from each title's English Wikipedia
// article (no API key needed). If the lookup fails — offline, blocked, a
// renamed article — the site simply keeps its typographic tiles.
//
// To pin an image yourself, set `poster` on the title in data.ts; that wins.

/** Title id → Wikipedia article name. */
export const WIKI: Record<string, string> = {
  "iron-man": "Iron Man (2008 film)",
  "incredible-hulk": "The Incredible Hulk (film)",
  "iron-man-2": "Iron Man 2",
  "thor": "Thor (film)",
  "first-avenger": "Captain America: The First Avenger",
  "avengers": "The Avengers (2012 film)",
  "iron-man-3": "Iron Man 3",
  "dark-world": "Thor: The Dark World",
  "winter-soldier": "Captain America: The Winter Soldier",
  "guardians": "Guardians of the Galaxy (film)",
  "age-of-ultron": "Avengers: Age of Ultron",
  "ant-man": "Ant-Man (film)",
  "civil-war": "Captain America: Civil War",
  "doctor-strange": "Doctor Strange (2016 film)",
  "guardians-2": "Guardians of the Galaxy Vol. 2",
  "homecoming": "Spider-Man: Homecoming",
  "ragnarok": "Thor: Ragnarok",
  "black-panther": "Black Panther (film)",
  "infinity-war": "Avengers: Infinity War",
  "ant-man-wasp": "Ant-Man and the Wasp",
  "captain-marvel": "Captain Marvel (film)",
  "endgame": "Avengers: Endgame",
  "far-from-home": "Spider-Man: Far From Home",
  "wandavision": "WandaVision",
  "falcon-winter-soldier": "The Falcon and the Winter Soldier",
  "loki-1": "Loki season 1",
  "black-widow": "Black Widow (2021 film)",
  "shang-chi": "Shang-Chi and the Legend of the Ten Rings",
  "eternals": "Eternals (film)",
  "hawkeye": "Hawkeye (miniseries)",
  "no-way-home": "Spider-Man: No Way Home",
  "moon-knight": "Moon Knight (miniseries)",
  "multiverse-of-madness": "Doctor Strange in the Multiverse of Madness",
  "ms-marvel": "Ms. Marvel (miniseries)",
  "love-and-thunder": "Thor: Love and Thunder",
  "she-hulk": "She-Hulk: Attorney at Law",
  "werewolf": "Werewolf by Night (TV special)",
  "wakanda-forever": "Black Panther: Wakanda Forever",
  "holiday-special": "The Guardians of the Galaxy Holiday Special",
  "quantumania": "Ant-Man and the Wasp: Quantumania",
  "guardians-3": "Guardians of the Galaxy Vol. 3",
  "secret-invasion": "Secret Invasion (miniseries)",
  "loki-2": "Loki season 2",
  "the-marvels": "The Marvels",
  "echo": "Echo (miniseries)",
  "x-men": "X-Men (film)",
  "x2": "X2 (film)",
  "days-of-future-past": "X-Men: Days of Future Past",
  "deadpool-wolverine": "Deadpool & Wolverine",
  "agatha": "Agatha All Along",
  "brave-new-world": "Captain America: Brave New World",
  "born-again-1": "Daredevil: Born Again season 1",
  "thunderbolts": "Thunderbolts*",
  "ironheart": "Ironheart (miniseries)",
  "first-steps": "The Fantastic Four: First Steps",
  "wonder-man": "Wonder Man (miniseries)",
  "born-again-2": "Daredevil: Born Again season 2",
  "brand-new-day": "Spider-Man: Brand New Day",
  "visionquest": "VisionQuest",
  "doomsday": "Avengers: Doomsday",
};

type Posters = Record<string, string>;
const CACHE = "rtd.posters.v1";
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

async function loadPosters(): Promise<Posters> {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE) || "null");
    if (c && Date.now() - c.at < TTL && Object.keys(c.posters).length) return c.posters;
  } catch { /* no cache */ }
  const ids = Object.keys(WIKI);
  const batches: string[][] = [];
  for (let i = 0; i < ids.length; i += 40) batches.push(ids.slice(i, i + 40));
  const parts = await Promise.all(batches.map((b) => fetchBatch(b).catch(() => ({} as Posters))));
  const posters = Object.assign({}, ...parts) as Posters;
  try {
    if (Object.keys(posters).length) localStorage.setItem(CACHE, JSON.stringify({ at: Date.now(), posters }));
  } catch { /* ignore */ }
  return posters;
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
