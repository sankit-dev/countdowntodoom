// GET /?ready=82&e=12 (rewritten here by vercel.json) → the normal homepage,
// with its link-preview tags pointing at that person's doom-ready card.
// Visitors get the usual site; X, WhatsApp and Reddit see the card.
import { ESSENTIALS_TOTAL, RELEASE, Region, daysLeft, parseShare } from "../src/doomReady.js";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Replace the content="…" of one meta tag, matched by its property/name. */
function setMeta(html: string, attr: "property" | "name", key: string, value: string) {
  const re = new RegExp(`(<meta ${attr}="${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}" content=")[^"]*(")`);
  return html.replace(re, `$1${esc(value)}$2`);
}

export function withShareTags(html: string, origin: string, pct: number, essentials: number | null, days: number, region: Region = "IN") {
  const q = `ready=${pct}${essentials === null ? "" : `&e=${essentials}`}${region === "US" ? "&r=us" : ""}`;
  const image = `${origin}/api/card?${q}`;
  const title = `I'm ${pct}% doom-ready. How ready are you?`;
  const bits = [
    essentials === null ? null : `${essentials}/${ESSENTIALS_TOTAL} essentials watched`,
    `${days} ${days === 1 ? "day" : "days"} to Avengers: Doomsday (out ${RELEASE[region].short} in ${RELEASE[region].label})`,
  ].filter(Boolean);
  const description = `${bits.join(" and ")}. See how ready you are and get a watch plan.`;
  let out = html;
  out = setMeta(out, "property", "og:url", `${origin}/?${q}`);
  out = setMeta(out, "property", "og:title", title);
  out = setMeta(out, "property", "og:description", description);
  out = setMeta(out, "property", "og:image", image);
  out = setMeta(out, "name", "twitter:title", title);
  out = setMeta(out, "name", "twitter:description", description);
  out = setMeta(out, "name", "twitter:image", image);
  return out.replace(
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:image:height" content="630" />\n    <meta property="og:image:type" content="image/jpeg" />'
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = await fetch(`${url.origin}/index.html`);
  const html = await page.text();
  const share = parseShare(url.searchParams);
  const body = share ? withShareTags(html, url.origin, share.pct, share.essentials, daysLeft(share.region), share.region) : html;
  return new Response(body, {
    status: page.status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
