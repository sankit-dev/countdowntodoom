// Build step: copy every title's poster from Wikipedia onto the site itself.
//
// Runs once per build (on Vercel). For each title it asks Wikipedia for the
// article's lead image, shrinks it to a small WebP and writes it to
// dist/posters/<id>.webp, plus dist/posters/manifest.json listing what worked.
// The site loads those first, so posters appear instantly and don't depend on
// Wikipedia being reachable. Anything that fails here is simply left out and the
// site falls back to asking Wikipedia at runtime, so this can never break a build.
import type { Plugin } from "vite";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { WIKI } from "./src/wiki";
import { BY_ID } from "./src/data";

const API = "https://en.wikipedia.org/w/api.php";
const UA = "RoadToDoomsdayBuild/1.0 (https://countdowntodoom.vercel.app)";
const WIDTH = 320; // px; tiles show posters at ~96px wide, so this is sharp on 3x phones

async function get(url: string) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 15_000);
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, signal: ctl.signal });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r;
  } finally {
    clearTimeout(timer);
  }
}

/** Title id → image URL, following Wikipedia's redirects back to our ids. */
async function lookup(ids: string[]): Promise<Record<string, string>> {
  const params = new URLSearchParams({
    action: "query", format: "json", redirects: "1", prop: "pageimages", piprop: "thumbnail",
    pithumbsize: "500", pilicense: "any", pilimit: "50", titles: ids.map((id) => WIKI[id]).join("|"),
  });
  const q = (await (await get(`${API}?${params}`)).json()).query || {};
  const hop: Record<string, string> = {};
  for (const r of [...(q.normalized || []), ...(q.redirects || [])]) hop[r.from] = r.to;
  const byTitle: Record<string, string> = {};
  for (const p of Object.values<any>(q.pages || {})) if (p.thumbnail?.source) byTitle[p.title] = p.thumbnail.source;
  const out: Record<string, string> = {};
  for (const id of ids) {
    let t = WIKI[id];
    for (let i = 0; i < 4 && hop[t]; i++) t = hop[t];
    if (byTitle[t]) out[id] = byTitle[t];
  }
  return out;
}

export function posters(): Plugin {
  let outDir = "dist";
  return {
    name: "copy-posters",
    apply: "build",
    configResolved(c) { outDir = c.build.outDir; },
    async closeBundle() {
      const dir = join(outDir, "posters");
      const manifest: Record<string, string> = {};
      try {
        await mkdir(dir, { recursive: true });
        // Titles with a poster pinned in data.ts already have their own file.
        const ids = Object.keys(WIKI).filter((id) => !BY_ID[id]?.poster);
        const urls: Record<string, string> = {};
        for (let i = 0; i < ids.length; i += 40) Object.assign(urls, await lookup(ids.slice(i, i + 40)).catch(() => ({})));
        const todo = Object.entries(urls);
        // A few at a time, to be polite to Wikimedia.
        for (let i = 0; i < todo.length; i += 6) {
          await Promise.all(todo.slice(i, i + 6).map(async ([id, url]) => {
            try {
              const buf = Buffer.from(await (await get(url)).arrayBuffer());
              await writeFile(join(dir, `${id}.webp`), await sharp(buf).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: 74 }).toBuffer());
              manifest[id] = `posters/${id}.webp`;
            } catch { /* leave it to the runtime fallback */ }
          }));
        }
      } catch (e) {
        console.warn("[posters] skipped:", (e as Error).message);
      }
      await writeFile(join(dir, "manifest.json"), JSON.stringify(manifest)).catch(() => {});
      console.log(`[posters] copied ${Object.keys(manifest).length} of ${Object.keys(WIKI).length} posters`);
    },
  };
}
