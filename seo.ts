// Build-time SEO: head tags, structured data, a plain-HTML copy of the watch
// order inside #root (so crawlers see real content before JavaScript runs —
// React replaces it on load), plus robots.txt and sitemap.xml.
import type { Plugin } from "vite";
import { DOOM_ID, TITLES } from "./src/data";
import { llmsFullTxt, llmsTxt } from "./llms";
import { GUIDE_CSS, staticPages, titleHref } from "./pages";

// The public address of the site. Change it here (or set SITE_URL) if you add a custom domain.
export const SITE = (process.env.SITE_URL || "https://countdowntodoom.vercel.app").replace(/\/$/, "");

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const list = TITLES.filter((t) => t.id !== DOOM_ID);
const kind = (k: string) => (k === "film" ? "Film" : k === "series" ? "Series" : "Special");

interface Page { title: string; description: string; path: string; body: string; jsonld: object[] }

const PAGES: Record<string, Page> = {
  main: {
    title: "Avengers: Doomsday Watch Order — Every MCU Film & Series in Order",
    description:
      "What to watch before Avengers: Doomsday (18 Dec 2026): all 58 MCU films and series in order, how they connect, a day-by-day watch plan for the time you have, and a live countdown.",
    path: "/",
    body: `<main style="max-width:760px;margin:0 auto;padding:96px 20px;color:#eef3ee;background:#060807;font-family:system-ui,sans-serif">
<h1>Avengers: Doomsday watch order</h1>
<p>Every film and series that leads to <strong>Avengers: Doomsday</strong> (in cinemas 18 December 2026), in order, with why each one matters.</p>
<p><a href="/watch-order/" style="color:#8dff6a">Full watch order</a> · <a href="/essentials/" style="color:#8dff6a">The essentials</a> · <a href="/story/" style="color:#8dff6a">The story so far</a> · <a href="/countdown/" style="color:#8dff6a">Countdown</a></p>
<ol>
${list.map((t) => `<li><a href="${titleHref(t)}" style="color:#8dff6a"><strong>${esc(t.title)}</strong></a> (${t.year}, ${kind(t.kind)}) — ${esc(t.why)}</li>`).join("\n")}
<li><strong>Avengers: Doomsday</strong> (18 December 2026)</li>
</ol>
</main>`,
    jsonld: [
      { "@context": "https://schema.org", "@type": "WebSite", name: "Road to Doomsday", url: `${SITE}/`,
        description: "The Avengers: Doomsday watch order, timeline, watch planner and countdown." },
      { "@context": "https://schema.org", "@type": "ItemList", name: "Avengers: Doomsday watch order",
        numberOfItems: list.length,
        itemListElement: list.map((t, i) => ({ "@type": "ListItem", position: i + 1,
          item: { "@type": t.kind === "series" ? "TVSeries" : "Movie", name: t.title, datePublished: String(t.year) } })) },
    ],
  },
  countdown: {
    title: "Avengers: Doomsday Countdown — Days Until 18 December 2026",
    description: "A live countdown to Avengers: Doomsday, in cinemas 18 December 2026 — days, hours, minutes and seconds left.",
    path: "/countdown/",
    body: `<main style="padding:96px 20px;text-align:center;color:#eef3ee;background:#000;font-family:system-ui,sans-serif">
<h1>Avengers: Doomsday countdown</h1>
<p>Avengers: Doomsday is released in cinemas on 18 December 2026.</p>
<p><a href="/watch-order/" style="color:#8dff6a">See the full watch order</a> · <a href="/essentials/" style="color:#8dff6a">The essentials</a></p>
</main>`,
    jsonld: [],
  },
};

function head(p: Page) {
  const url = SITE + p.path;
  const img = `${SITE}/og.jpg`;
  return [
    `<title>${esc(p.title)}</title>`,
    `<meta name="description" content="${esc(p.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<link rel="alternate" type="text/plain" title="LLM-friendly summary" href="${SITE}/llms.txt" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Road to Doomsday" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(p.title)}" />`,
    `<meta property="og:description" content="${esc(p.description)}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(p.title)}" />`,
    `<meta name="twitter:description" content="${esc(p.description)}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    ...p.jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`),
  ].join("\n    ");
}

export function seo(): Plugin {
  return {
    name: "road-to-doomsday-seo",
    transformIndexHtml(html, ctx) {
      const page = ctx.path.includes("countdown") ? PAGES.countdown : PAGES.main;
      return html
        .replace(/<title>[\s\S]*?<\/title>\s*/, "")
        .replace(/<meta name="description"[^>]*>\s*/, "")
        .replace("</head>", `    ${head(page)}\n  </head>`)
        .replace('<div id="root"></div>', `<div id="root">${page.body}</div>`);
    },
    generateBundle() {
      const pages = staticPages(SITE);
      for (const pg of pages) this.emitFile({ type: "asset", fileName: pg.path.slice(1) + "index.html", source: pg.html });
      this.emitFile({ type: "asset", fileName: "guide.css", source: GUIDE_CSS });
      this.emitFile({ type: "asset", fileName: "llms.txt", source: llmsTxt(SITE) });
      this.emitFile({ type: "asset", fileName: "llms-full.txt", source: llmsFullTxt(SITE) });
      const today = new Date().toISOString().slice(0, 10);
      this.emitFile({ type: "asset", fileName: "robots.txt", source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n` });
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.values(PAGES).map((p) => `  <url><loc>${SITE}${p.path}</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>${p.path === "/" ? "1.0" : "0.8"}</priority></url>`).join("\n")}
${pages.map((pg) => `  <url><loc>${SITE}${pg.path}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${pg.path.startsWith("/title/") ? "0.6" : "0.9"}</priority></url>`).join("\n")}
</urlset>
`,
      });
    },
  };
}
