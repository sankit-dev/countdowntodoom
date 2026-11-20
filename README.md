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

## Notes

- Runtimes are approximate (series = whole season) and importance scores are
  editorial judgement. Both live in `src/data.ts` and should be reviewed.
- The branding is original. This project is not affiliated with or endorsed by
  Marvel or Disney, and uses no official logos, posters or stills.
- "Watched" marks are stored in the browser only.

## Deploying

`.github/workflows/pages.yml` builds and publishes the site to GitHub Pages on
every push to `main`. One-time setup: in the repository's **Settings → Pages**,
set **Source** to **GitHub Actions**. The site then lives at
`https://<user>.github.io/<repo>/` — name the repo `countdowntodoom` to get
`…github.io/countdowntodoom/`.

For a custom domain (for example `countdowntodoom.com`), buy the domain, add a
`public/CNAME` file containing just the domain, and point its DNS at GitHub
Pages as described in GitHub's custom-domain docs.
