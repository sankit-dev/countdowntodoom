# Road to Doomsday

An unofficial fan site: every film and series leading to *Avengers: Doomsday*
(18 December 2026), drawn as one connected timeline, with a planner that turns
the days and hours you have into a day-by-day watch order.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # static site in dist/ — host anywhere
```

## How it is put together

| File | What it does |
| --- | --- |
| `src/data.ts` | Every title: year, runtime, storyline lane, importance (1–10), what it leads into, and why it matters. **Edit this to change the site.** |
| `src/planner.ts` | Picks the most important titles that fit the time budget and lays them out per day. |
| `src/components/TimelineMap.tsx` | The scroll-driven map. Vertical scroll moves you horizontally through the timeline. |
| `src/components/Drawer.tsx` | Detail panel: why a title matters and its shortest road to Doomsday. |
| `src/components/Planner.tsx` | The marathon planner UI. |
| `src/components/Hero.tsx`, `Intro.tsx` | Opening sequence, countdown. |

## Images

- **Background video**: `public/doom-loop.webm` and `.mp4` loop silently behind the hero and the countdown on screens 900px and wider. Phones get posters instead: `public/phone-tapestry.jpg` behind the homepage, `public/phone-glass.jpg` behind the countdown.

- **Hero background**: put an image at `public/hero.jpg`. Without it the hero is plain black.
- **Countdown page background** (`/countdown/`): uses `public/doom-throne.jpg` if present; otherwise it loads the lead image of the film's Wikipedia article in the browser.
- **Posters** are looked up in the visitor's browser from each title's Wikipedia
  article (`src/posters.tsx`). To pin one yourself, set `poster` on the title in
  `src/data.ts`.

## Trailers

Embedded trailers come from TMDB and need a free API key
(themoviedb.org → Settings → API). Add it as a repository secret named
`TMDB_KEY` (Settings → Secrets and variables → Actions) and redeploy. Without
it, trailer buttons link to a YouTube search instead. For local development,
put `VITE_TMDB_KEY=...` in a `.env.local` file.

## Support button

Edit `src/support.ts`: paste your Dodo Payments payment link and your wallet
addresses. Empty entries are hidden. No server is involved — Dodo hosts the
checkout, and crypto is a plain address with a QR code.

## Analytics

- **Vercel Analytics** is built in. Turn it on in the Vercel project's
  Analytics tab; page views then show up there.
- **Google**: the Google tag for container `GTM-NS78CJ3F` is at the top of
  `<head>` in `index.html` and `countdown/index.html`. Events sent with it:
  `mark_watched`, `support_open`, `trailer_play`, `map_view`.

## Sharing (server functions in `api/`)

- **Doom-ready %** (`src/doomReady.ts`): share of what matters you've actually
  watched — ticked titles only, weighted by importance². Different from the
  planner's "Ready by release", which also counts what your plan will cover.
- `GET /api/card?ready=82&e=12` → the 1200×630 share card (JPEG). Drawn with
  `@vercel/og` in `api/_card.ts`, converted to JPEG with `sharp` to stay small
  enough for WhatsApp previews. Fonts are the site's own, served from `public/fonts/`.
- `/?ready=82&e=12` is rewritten (see `vercel.json`) to `api/share.ts`, which
  returns the normal homepage with its preview tags pointing at that card.
- `npm run dev` runs these functions locally too (see `vite.config.ts`).

## SEO

`seo.ts` runs at build time and adds, for both pages: the search title and
description, canonical URL, link-preview tags for X/Facebook/WhatsApp,
structured data (the watch order as a list), and a plain-HTML copy of the
watch order inside the page so it is readable before JavaScript runs. It also
writes `robots.txt` and `sitemap.xml`.

- `pages.ts` generates plain-HTML guide pages from the same data: `/watch-order/`,
  `/essentials/`, `/story/` and one page per title at `/title/<name>/`. All of
  them go into `sitemap.xml`.
- The site address lives in `seo.ts` (`SITE`). Change it if you add a custom domain.
- `llms.ts` writes `/llms.txt` (a short summary for AI assistants, per
  llmstxt.org) and `/llms-full.txt` (the complete watch order, plots, story
  and story order), generated from the same data as the site.
- The preview image is `public/og.jpg`; regenerate it with `node scripts/render-og.cjs`.

## Notes

- Runtimes are approximate (series = whole season) and importance scores are
  editorial judgement. Both live in `src/data.ts` and should be reviewed.
- The site's own branding (wordmark, sigil) is original. It also shows official
  Marvel imagery: poster thumbnails from Wikipedia, the background video and the
  phone posters. This project is not affiliated with or endorsed by Marvel or Disney.
- "Watched" marks are stored in the browser only.

## Deploying

The live site is on Vercel (https://countdowntodoom.vercel.app), deployed
automatically from `main`. Vercel runs `npm run build` and serves `dist/`,
plus the server functions in `api/`.

For a custom domain, add it in the Vercel project's **Settings → Domains**,
then update `SITE` in `seo.ts`.
