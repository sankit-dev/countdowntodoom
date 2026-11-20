// The 1200x630 cards, drawn with @vercel/og (Satori). Used by /api/card (the
// image itself) and, through it, by share-link previews. Files starting with
// "_" in api/ are helpers, not routes.
//
// Colours and fonts are the site's own (see :root in src/styles.css).
import { ImageResponse } from "@vercel/og";
import sharp from "sharp";

export const C = {
  bg: "#060807",
  ink: "#eef3ee",
  dim: "#8b978f",
  line: "rgba(255,255,255,0.10)",
  doom: "#8dff6a",
  gold: "#d8b56a",
};

type Style = Record<string, string | number>;
type Node = { type: string; props: { style?: Style; children?: unknown; [k: string]: unknown } };
export const h = (type: string, style: Style, ...children: unknown[]): Node => ({
  type,
  props: { style: { display: "flex", ...style }, children: children.length === 1 ? children[0] : children },
});
export const img = (src: string, style: Style): Node => ({ type: "img", props: { src, style } });

const FONTS: [string, string, number][] = [
  ["Cinzel", "Cinzel-ExtraBold.ttf", 800],
  ["Cinzel", "Cinzel-Black.ttf", 900],
  ["Bebas Neue", "BebasNeue.ttf", 400],
  ["Barlow Condensed", "BarlowCondensed-SemiBold.ttf", 600],
  ["Barlow Condensed", "BarlowCondensed-Bold.ttf", 700],
  ["Barlow", "Barlow-Medium.ttf", 500],
];

/** Fonts are served from the site itself (public/fonts), so the card always matches it. */
async function loadFonts(origin: string) {
  return Promise.all(
    FONTS.map(async ([name, file, weight]) => ({
      name,
      weight: weight as 400 | 500 | 600 | 700 | 800 | 900,
      style: "normal" as const,
      data: await fetch(`${origin}/fonts/${file}`).then((r) => {
        if (!r.ok || (r.headers.get("content-type") || "").includes("html")) throw new Error(`font ${file}: ${r.status} ${r.headers.get("content-type")}`);
        return r.arrayBuffer();
      }),
    }))
  );
}

/** Small "ROAD TO / DOOMSDAY" mark, as in the site's nav. */
export const brand = () =>
  h("div", { flexDirection: "column", lineHeight: 1 },
    h("div", { fontFamily: "Barlow Condensed", fontWeight: 600, fontSize: 15, letterSpacing: 6, color: C.dim }, "ROAD TO"),
    h("div", { fontFamily: "Cinzel", fontWeight: 800, fontSize: 30, letterSpacing: 1, color: C.ink, marginTop: 6 }, "DOOMSDAY"));

export const footer = () =>
  h("div", { position: "absolute", left: 72, top: 556, width: 1056, justifyContent: "space-between", alignItems: "center" },
    h("div", { fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 26, letterSpacing: 7, color: C.gold }, "COUNTDOWNTODOOM.VERCEL.APP"),
    h("div", { fontFamily: "Barlow Condensed", fontWeight: 600, fontSize: 20, letterSpacing: 4, color: C.dim }, "AVENGERS: DOOMSDAY · 18.12.2026"));

/** Background used by every card: dark, with the throne still fading in on the right. */
export const backdrop = (origin: string) => [
  img(`${origin}/hero.jpg`, { position: "absolute", right: 0, top: 0, width: 760, height: 630, objectFit: "cover", objectPosition: "50% 45%" }),
  h("div", { position: "absolute", left: 0, top: 0, width: 1200, height: 630, backgroundImage: `linear-gradient(90deg, ${C.bg} 0%, ${C.bg} 40%, rgba(6,8,7,0.7) 58%, rgba(6,8,7,0.25) 100%)` }),
  h("div", { position: "absolute", left: 0, top: 490, width: 1200, height: 140, backgroundImage: `linear-gradient(180deg, rgba(6,8,7,0), ${C.bg})` }),
];

/** The doom-ready card. */
export function readyCard(origin: string, pct: number, essentials: number | null, essentialsTotal: number, days: number): Node {
  const stat = (big: string, label: string) =>
    h("div", { flexDirection: "column", marginRight: 64 },
      h("div", { fontFamily: "Bebas Neue", fontSize: 64, lineHeight: 0.9, color: C.ink }, big),
      h("div", { fontFamily: "Barlow Condensed", fontWeight: 600, fontSize: 18, letterSpacing: 5, color: C.dim, marginTop: 8 }, label));
  return h("div", { position: "relative", width: 1200, height: 630, backgroundColor: C.bg, color: C.ink, fontFamily: "Barlow" },
    ...backdrop(origin),
    h("div", { position: "absolute", left: 72, top: 46 }, brand()),
    h("div", { position: "absolute", left: 72, top: 124, flexDirection: "column" },
      h("div", { alignItems: "flex-end" },
        h("div", { fontFamily: "Bebas Neue", fontSize: 210, lineHeight: 0.8, color: C.doom }, String(pct)),
        h("div", { fontFamily: "Bebas Neue", fontSize: 92, lineHeight: 0.8, color: C.doom, marginLeft: 6, marginBottom: 4 }, "%")),
      h("div", { fontFamily: "Cinzel", fontWeight: 900, fontSize: 46, letterSpacing: 4, color: C.ink, marginTop: 14 }, "DOOM-READY"),
      h("div", { width: 520, height: 10, marginTop: 18, backgroundColor: C.line },
        h("div", { width: `${Math.max(1.5, pct)}%`, height: 10, backgroundImage: `linear-gradient(90deg, ${C.gold}, ${C.doom})` })),
      h("div", { marginTop: 28 },
        ...(essentials === null ? [] : [stat(`${essentials}/${essentialsTotal}`, "ESSENTIALS WATCHED")]),
        stat(String(days), days === 1 ? "DAY TO DOOMSDAY" : "DAYS TO DOOMSDAY"))),
    footer());
}

/**
 * Draw the card and return it as a JPEG. The generator only makes PNGs, which
 * come out at ~450 KB with the photo; as JPEG it is ~70 KB, well inside what
 * WhatsApp and others will show as a link preview.
 */
export async function render(origin: string, node: Node, cacheSeconds: number) {
  const png = await new ImageResponse(node as never, { width: 1200, height: 630, fonts: await loadFonts(origin) }).arrayBuffer();
  const jpg = await sharp(Buffer.from(png)).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), {
    headers: {
      "Content-Type": "image/jpeg",
      // Days left changes daily, so cache for an hour at most.
      "Cache-Control": `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`,
    },
  });
}
