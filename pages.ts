// Build-time static pages for search engines and people arriving from search:
//   /watch-order/          the full watch order, as an article
//   /essentials/           what to watch if you are short on time
//   /story/                the story so far, incl. "what is an incursion"
//   /title/<slug>/         one page per film or series (58)
// They are plain HTML (fast, readable without JavaScript) generated from the
// same data as the app, and every one links back into the interactive site.
import {
  BY_ID, CHRONO, DOOM_ID, PHASES, TITLES, TIER_LABEL, Title,
  fmtMin, parentsOf, roadToDoom, slugOf, tierOf,
} from "./src/data";
import { CHAPTERS, PLOT } from "./src/story";

export interface StaticPage { path: string; html: string }

const list = TITLES.filter((t) => t.id !== DOOM_ID);
const essentials = list.filter((t) => tierOf(t) === "essential");
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const kind = (t: Title) => (t.kind === "film" ? "Film" : t.kind === "series" ? "Series" : "Special");
const phase = (t: Title) => (t.phase ? `${PHASES[t.phase].name} · ${PHASES[t.phase].saga}` : "Legacy X-Men universe");
const hours = (xs: Title[]) => fmtMin(xs.reduce((n, t) => n + t.min, 0));
const pos = (t: Title) => list.indexOf(t) + 1;
const href = (t: Title) => (t.id === DOOM_ID ? "/" : `/title/${slugOf(t)}/`);
const link = (t: Title) => `<a href="${href(t)}">${esc(t.title)}</a>`;

const verdict = (t: Title) => {
  const tier = tierOf(t);
  if (tier === "essential") return `<strong>Yes, watch it.</strong> It's one of the ${essentials.length} I wouldn't skip before Avengers: Doomsday.`;
  if (tier === "recommended") return "<strong>Good to watch.</strong> It helps with Doomsday, but you can skip it if you're short on time.";
  return "<strong>Not needed.</strong> Watch it if you like, but Doomsday doesn't depend on it.";
};

const CSS = `
:root{--bg:#060807;--panel:#0f1512;--ink:#eef3ee;--dim:#9aa59d;--line:rgba(255,255,255,.1);--doom:#8dff6a;--muted:#c3ccc5}
*{box-sizing:border-box}html{background:var(--bg)}body{margin:0;background:var(--bg);color:var(--ink);font:400 18px/1.6 "Newsreader",Georgia,serif;-webkit-font-smoothing:antialiased}
a{color:var(--doom);text-underline-offset:3px}a:hover{color:#c4ffb0}
.top{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:16px clamp(16px,4vw,40px);border-bottom:1px solid var(--line)}
.brand{display:inline-grid;justify-items:start;font:900 19px/1 "Cinzel",serif;letter-spacing:.01em;color:var(--ink);text-decoration:none;text-transform:uppercase}.brand small{font:600 .5em/1 "Cinzel",serif;letter-spacing:1.37em;margin-right:-1.37em;margin-bottom:.32em;color:#cfd5d0;white-space:nowrap}
.top nav{display:flex;gap:18px;flex-wrap:wrap}.top nav a{font:500 15px/1 "Archivo",sans-serif;color:var(--muted);text-decoration:none}.top nav a:hover{color:var(--ink)}
main{max-width:780px;margin:0 auto;padding:48px clamp(16px,4vw,24px) 80px}
.crumbs{font:500 14px/1.4 "Archivo",sans-serif;color:var(--dim);margin:0 0 18px}.crumbs a{color:var(--dim)}
.kicker{font:500 15px/1 "Archivo",sans-serif;color:var(--muted);margin:0 0 10px}
h1{font:condensed 800 clamp(40px,6.4vw,64px)/1 "Archivo","Arial Narrow",sans-serif;margin:0 0 18px;text-wrap:balance}
h2{font:condensed 800 clamp(28px,3.6vw,36px)/1.05 "Archivo","Arial Narrow",sans-serif;margin:44px 0 12px;text-wrap:balance}
h3{font:700 19px/1.3 "Archivo",sans-serif;margin:28px 0 6px}
p{margin:0 0 14px}.lede{font-size:20px;color:#d5ddd6}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:24px 0}
.facts div{background:var(--panel);border:1px solid var(--line);padding:14px 16px}.facts dt{font:500 13px/1 "Archivo",sans-serif;color:var(--dim);margin-bottom:8px}.facts dd{margin:0;font:600 17px/1.3 "Archivo",sans-serif}
.verdict{padding:16px 18px;border-left:3px solid var(--doom);background:rgba(141,255,106,.06);margin:22px 0}
.road{list-style:none;padding:0;margin:0}.road li{position:relative;padding:0 0 10px 24px}.road li:before{content:"";position:absolute;left:3px;top:9px;width:9px;height:9px;border-radius:50%;border:2px solid var(--dim)}.road li:last-child:before{background:var(--doom);border-color:var(--doom)}
ol.order{padding-left:1.6em}ol.order li{margin:0 0 12px}ol.order li span{color:var(--dim);font-size:15px}
.pager{display:flex;justify-content:space-between;gap:16px;margin-top:48px;padding-top:20px;border-top:1px solid var(--line);font-size:15px}
.cta{display:inline-block;margin:10px 10px 0 0;padding:13px 18px;font:600 16px/1 "Archivo",sans-serif;text-decoration:none;color:#06120a;background:var(--doom)}
.cta.alt{background:none;color:var(--ink);border:1px solid rgba(255,255,255,.3)}
.spoiler{font-size:14px;color:var(--dim)}
footer{max-width:780px;margin:0 auto;padding:30px 20px 60px;border-top:1px solid var(--line);font-size:13px;color:var(--dim)}
`;

function shell(o: { site: string; path: string; title: string; description: string; body: string; jsonld?: object[] }) {
  const url = o.site + o.path;
  const ld = (o.jsonld || []).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#060807" />
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.description)}" />
<link rel="canonical" href="${url}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Road to Doomsday" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${esc(o.title)}" />
<meta property="og:description" content="${esc(o.description)}" />
<meta property="og:image" content="${o.site}/og.jpg" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:creator" content="@sankitdev" />
<meta name="twitter:image" content="${o.site}/og.jpg" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;900&family=Archivo:wdth,wght@62..100,400..800&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/guide.css" />
<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-NS78CJ3F"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());</script>
<script defer src="/_vercel/insights/script.js"></script>
${ld}
</head>
<body>
<header class="top">
  <a class="brand" href="/"><small>Road to</small>Doomsday</a>
  <nav><a href="/watch-order/">Watch order</a><a href="/essentials/">Essentials</a><a href="/story/">Story so far</a><a href="/#planner">Planner</a><a href="/countdown/">Countdown</a></nav>
</header>
<main>
${o.body}
</main>
<footer>Made by <a href="https://x.com/sankitdev" rel="noopener">@sankitdev</a> for me and my friends before Doomsday. Just a fan project. It's not affiliated with or endorsed by Marvel or Disney. Runtimes are rough, and for shows it's the whole season.</footer>
</body>
</html>
`;
}

const crumbs = (site: string, items: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: site + path })),
});

function titlePage(site: string, t: Title): StaticPage {
  const i = list.indexOf(t);
  const prev = list[i - 1], next = list[i + 1];
  const road = roadToDoom(t.id);
  const from = parentsOf(t.id).map((id) => BY_ID[id]);
  const into = t.to.map((id) => BY_ID[id]);
  const short = t.title;
  const description = `Do you need to watch ${short} before Avengers: Doomsday? ${tierOf(t) === "essential" ? "Yes, it's essential." : tierOf(t) === "recommended" ? "It's recommended." : "It's optional."} Here's what happens, why it matters and where it fits in the watch order.`;
  const body = `
<p class="crumbs"><a href="/">Road to Doomsday</a> › <a href="/watch-order/">Watch order</a> › #${pos(t)}</p>
<p class="kicker">#${pos(t)} of ${list.length} in the watch order</p>
<h1>${esc(t.title)} (${t.year})</h1>
<p class="lede">Do you need to watch ${esc(short)} before Avengers: Doomsday?</p>
<p class="verdict">${verdict(t)}</p>
<dl class="facts">
  <div><dt>Released</dt><dd>${t.year}</dd></div>
  <div><dt>Type</dt><dd>${kind(t)}</dd></div>
  <div><dt>Runtime</dt><dd>${fmtMin(t.min)}${t.kind === "series" ? " (season)" : ""}</dd></div>
  <div><dt>Importance</dt><dd>${t.imp}/10 · ${TIER_LABEL[tierOf(t)]}</dd></div>
  <div><dt>Era</dt><dd>${esc(phase(t))}</dd></div>
</dl>
<h2>Why watch it before Doomsday</h2>
<p>${esc(t.why)}</p>
${PLOT[t.id] ? `<h2>What happens in ${esc(short)}</h2>\n<p class="spoiler">Spoilers.</p>\n<p>${esc(PLOT[t.id])}</p>` : ""}
<h2>How it leads to Doomsday</h2>
${road ? `<ol class="road">${road.map((id) => `<li>${link(BY_ID[id])}</li>`).join("")}</ol>` : "<p>This is a side story, it doesn't lead into Avengers: Doomsday.</p>"}
${from.length ? `<h3>Comes after</h3><p>${from.map(link).join(" · ")}</p>` : ""}
${into.length ? `<h3>Leads into</h3><p>${into.map(link).join(" · ")}</p>` : ""}
<h2>Make a watch plan</h2>
<p>Tell the planner how many days and hours you've got and it'll make a day by day list, essentials first.</p>
<p><a class="cta" href="/#planner">Make me a watch plan</a><a class="cta alt" href="/watch-order/">See the full watch order</a></p>
<nav class="pager">
  <span>${prev ? `← #${pos(prev)} ${link(prev)}` : ""}</span>
  <span>${next ? `#${pos(next)} ${link(next)} →` : `Next: <a href="/">Avengers: Doomsday</a> →`}</span>
</nav>`;
  return {
    path: href(t),
    html: shell({
      site, path: href(t), body, description,
      title: `Do You Need to Watch ${short} Before Doomsday?`,
      jsonld: [
        { "@context": "https://schema.org", "@type": t.kind === "series" ? "TVSeries" : "Movie", name: t.title,
          datePublished: String(t.year), description: PLOT[t.id] || t.why, url: site + href(t) },
        crumbs(site, [["Road to Doomsday", "/"], ["Watch order", "/watch-order/"], [t.title, href(t)]]),
      ],
    }),
  };
}

function watchOrderPage(site: string): StaticPage {
  const path = "/watch-order/";
  const body = `
<p class="crumbs"><a href="/">Road to Doomsday</a> › Watch order</p>
<h1>Avengers: Doomsday watch order, all ${list.length} movies and shows</h1>
<p class="lede">Every MCU movie, show and special you need before Avengers: Doomsday (out 17 December 2026 in India, 18 December in the US), in order, with why each one matters.</p>
<p>Short on time? Start with the <a href="/essentials/">${essentials.length} essentials</a> (about ${hours(essentials)}), or let the <a href="/#planner">planner</a> fit a list to the days you have.</p>
<p>It's release order, except for the three old X-Men movies (2000 to 2014, from a different universe). I put those right before Deadpool &amp; Wolverine, because that's where they come into the story.</p>
<h2>The full watch order</h2>
<ol class="order">
${list.map((t) => `<li>${link(t)} <span>(${t.year} · ${kind(t)} · ${fmtMin(t.min)} · ${TIER_LABEL[tierOf(t)]})</span><br />${esc(t.why)}</li>`).join("\n")}
<li><a href="/">Avengers: Doomsday</a> <span>(17 December 2026 in India, 18 December in the US)</span></li>
</ol>
<h2>Prefer story order?</h2>
<p>Here's the order things happen inside the story:</p>
<ol class="order">
${CHRONO.filter((id) => id !== DOOM_ID).map((id) => `<li>${link(BY_ID[id])} <span>(${BY_ID[id].year})</span></li>`).join("\n")}
</ol>
<p><a class="cta" href="/#planner">Make me a watch plan</a><a class="cta alt" href="/story/">Catch up on the story</a></p>`;
  return {
    path,
    html: shell({
      site, path, body,
      title: `Avengers: Doomsday Watch Order: All ${list.length} MCU Movies and Shows`,
      description: `The full Avengers: Doomsday watch order. All ${list.length} MCU movies and shows in order and why each one matters, plus story order and the ${essentials.length} essentials.`,
      jsonld: [
        { "@context": "https://schema.org", "@type": "ItemList", name: "Avengers: Doomsday watch order", numberOfItems: list.length,
          itemListElement: list.map((t, i) => ({ "@type": "ListItem", position: i + 1, url: site + href(t), name: t.title })) },
        crumbs(site, [["Road to Doomsday", "/"], ["Watch order", path]]),
      ],
    }),
  };
}

function essentialsPage(site: string): StaticPage {
  const path = "/essentials/";
  const body = `
<p class="crumbs"><a href="/">Road to Doomsday</a> › Essentials</p>
<p class="kicker">Short on time</p>
<h1>What to watch before Avengers: Doomsday if you're short on time</h1>
<p class="lede">If you only watch ${essentials.length} things, make it these, in this order. It's about ${hours(essentials)} in total.</p>
<ol class="order">
${essentials.map((t) => `<li>${link(t)} <span>(${t.year} · ${fmtMin(t.min)})</span><br />${esc(t.why)}</li>`).join("\n")}
</ol>
<h2>Have a bit more time?</h2>
<p>Add the recommended ones, or look at the <a href="/watch-order/">full watch order of all ${list.length}</a>. The <a href="/#planner">planner</a> can also pick the best list for the exact days and hours you've got.</p>
<p><a class="cta" href="/#planner">Make me a watch plan</a><a class="cta alt" href="/countdown/">How long is left?</a></p>`;
  return {
    path,
    html: shell({
      site, path, body,
      title: `What to Watch Before Avengers: Doomsday: ${essentials.length} Essentials`,
      description: `Short on time before Avengers: Doomsday? These are the ${essentials.length} MCU movies and shows to watch (about ${hours(essentials)}), in order, and why each one matters.`,
      jsonld: [
        { "@context": "https://schema.org", "@type": "ItemList", name: "Essential watching before Avengers: Doomsday", numberOfItems: essentials.length,
          itemListElement: essentials.map((t, i) => ({ "@type": "ListItem", position: i + 1, url: site + href(t), name: t.title })) },
        crumbs(site, [["Road to Doomsday", "/"], ["Essentials", path]]),
      ],
    }),
  };
}

function storyPage(site: string): StaticPage {
  const path = "/story/";
  const anchor = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const body = `
<p class="crumbs"><a href="/">Road to Doomsday</a> › Story so far</p>
<p class="kicker">Catch up</p>
<h1>The story so far, before Avengers: Doomsday</h1>
<p class="lede">A quick catch-up on the Infinity Stones, the Sacred Timeline, incursions and Doctor Doom, in ${CHAPTERS.length} short bits.</p>
<p class="spoiler">Spoilers for every MCU film and series up to now.</p>
<p>${CHAPTERS.map((c) => `<a href="#${anchor(c.title)}">${esc(c.title)}</a>`).join(" · ")}</p>
${CHAPTERS.map((c, i) => `<h2 id="${anchor(c.title)}">${i + 1}. ${esc(c.title)}</h2>
${c.body.map((p) => `<p>${esc(p)}</p>`).join("\n")}
<p><span class="spoiler">See it in:</span> ${c.watch.map((id) => link(BY_ID[id])).join(" · ")}</p>`).join("\n")}
<p><a class="cta" href="/watch-order/">See the full watch order</a><a class="cta alt" href="/#planner">Make me a watch plan</a></p>`;
  return {
    path,
    html: shell({
      site, path, body,
      title: "Avengers: Doomsday Story So Far: Incursions and Doom Explained",
      description: "A quick catch-up on what happened before Avengers: Doomsday: the snap, the Sacred Timeline, what an incursion is, the New Avengers, the Fantastic Four and Doctor Doom.",
      jsonld: [crumbs(site, [["Road to Doomsday", "/"], ["Story so far", path]])],
    }),
  };
}

export function staticPages(site: string): StaticPage[] {
  return [watchOrderPage(site), essentialsPage(site), storyPage(site), ...list.map((t) => titlePage(site, t))];
}
export const GUIDE_CSS = CSS;
export const titleHref = href;
