// Builds /llms.txt (short summary, per the llms.txt convention: llmstxt.org)
// and /llms-full.txt (the complete content) from the site's own data, so the
// text AI assistants read always matches what the site shows.
import { BY_ID, CHRONO, DOOM_ID, PHASES, TIER_LABEL, TITLES, fmtMin, roadToDoom, tierOf } from "./src/data";
import { CHAPTERS, PLOT } from "./src/story";

const list = TITLES.filter((t) => t.id !== DOOM_ID);
const kind = (k: string) => (k === "film" ? "Film" : k === "series" ? "Series" : "Special");
const phase = (p: number) => (p ? PHASES[p].name : "Legacy universe (pre-MCU X-Men)");
const essentials = list.filter((t) => tierOf(t) === "essential");
const recommended = list.filter((t) => tierOf(t) === "recommended");
const hours = (xs: typeof list) => fmtMin(xs.reduce((n, t) => n + t.min, 0));

export function llmsTxt(site: string) {
  return `# Road to Doomsday

> An unofficial fan guide to Avengers: Doomsday (Marvel Studios, in cinemas 18 December 2026): every MCU film and series that leads to it, in watch order, with why each one matters, a day-by-day watch planner and a live countdown.

Key facts:
- Avengers: Doomsday releases in cinemas on 18 December 2026. Doctor Doom is played by Robert Downey Jr.
- The guide covers ${list.length} films, series and specials, released 2000–2026.
- Shortest useful watch list: ${essentials.length} essential titles (about ${hours(essentials)}). With recommended titles: ${essentials.length + recommended.length} titles (about ${hours([...essentials, ...recommended])}).
- Most important set-up: Loki seasons 1 and 2 (the multiverse), Doctor Strange in the Multiverse of Madness (incursions), Thunderbolts* (the New Avengers) and The Fantastic Four: First Steps (Doctor Doom's first appearance).

## Pages

- [Watch order, timeline and planner](${site}/): the interactive guide, the story-so-far explainer and the marathon planner
- [Countdown](${site}/countdown/): a live countdown to 18 December 2026
- [Full watch order](${site}/watch-order/): all titles in order with why each matters, plus story (chronological) order
- [The essentials](${site}/essentials/): the shortest list to watch before Doomsday
- [The story so far](${site}/story/): the saga explained, including what an incursion is
- Every title has its own page at ${site}/title/<name>/, e.g. [Loki — Season 2](${site}/title/loki-season-2/)

## Full content

- [llms-full.txt](${site}/llms-full.txt): the complete watch order with every title's year, runtime, importance, plot summary and why it matters for Doomsday; the story so far; and story (chronological) order

## Optional

- [Sitemap](${site}/sitemap.xml)
`;
}

export function llmsFullTxt(site: string) {
  const essential = essentials.map((t, i) => `${i + 1}. ${t.title} (${t.year})`).join("\n");
  const order = list
    .map((t, i) => {
      const road = roadToDoom(t.id);
      return `### ${i + 1}. ${t.title}

- Year: ${t.year} · ${kind(t.kind)} · ${fmtMin(t.min)}${t.kind === "series" ? " (whole season)" : ""} · ${phase(t.phase)}
- Importance for Doomsday: ${t.imp}/10 (${TIER_LABEL[tierOf(t)]})
- What happens (spoilers): ${PLOT[t.id] || "—"}
- Why it matters for Doomsday: ${t.why}
- Leads to Doomsday via: ${road ? road.map((id) => BY_ID[id].title).join(" → ") : "a side story; it does not feed into Doomsday directly"}`;
    })
    .join("\n\n");
  const story = CHAPTERS.map((c, i) =>
    `### ${i + 1}. ${c.title}\n\n${c.body.join("\n\n")}\n\nSee it in: ${c.watch.map((id) => BY_ID[id].title).join(", ")}`).join("\n\n");
  const chrono = CHRONO.filter((id) => id !== DOOM_ID).map((id, i) => `${i + 1}. ${BY_ID[id].title} (${BY_ID[id].year})`).join("\n");

  return `# Road to Doomsday — full content

> The complete text of ${site}/ — an unofficial fan guide to Avengers: Doomsday (in cinemas 18 December 2026). Contains spoilers for every title listed. Runtimes are approximate; series runtimes cover the whole season. Importance scores are the guide's editorial judgement.

Not affiliated with, endorsed by or sponsored by Marvel or The Walt Disney Company.

## The essentials (${essentials.length} titles, about ${hours(essentials)})

If you only have a little time, watch these, in this order:

${essential}

## The full watch order (${list.length} titles)

Release order, except that the three older X-Men films (2000–2014, from a different film universe) are placed just before Deadpool & Wolverine, where they join the story.

${order}

## The story so far

${story}

## Story (chronological) order

For people who prefer to watch in in-universe order rather than release order:

${chrono}

## About the planner

On ${site}/ you set how many days you have and how many hours a day. The planner picks the most important titles that fit (essentials first), keeps them in release or story order, splits long series across days, and skips titles you have marked as watched.
`;
}
