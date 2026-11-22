import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { track } from "./analytics";
import { BY_ID, DOOM_ID, TITLES } from "./data";
import { releaseAt, useNow, useRegion } from "./release";
import { daysUntil, doomReady } from "./doomReady";

const ShareCard = lazy(() => import("./components/ShareCard"));
import { Hero } from "./components/Hero";
import { TimelineMap } from "./components/TimelineMap";
import { Drawer } from "./components/Drawer";
import { Planner } from "./components/Planner";
import { Story } from "./components/Story";
import { Support } from "./components/Support";
import { Sigil } from "./components/Sigil";
import { PosterProvider } from "./posters";
import { useScrollMotion } from "./motion";

export type Tier = "all" | "recommended" | "essential";

const STORE = "rtd.watched.v1";
const loadWatched = (): Set<string> => {
  try {
    // Drop anything no longer on the list (titles do get removed, e.g. Wonder Man).
    return new Set((JSON.parse(localStorage.getItem(STORE) || "[]") as string[]).filter((id) => BY_ID[id]));
  } catch {
    return new Set();
  }
};

/** Days you can still use for watching: the release day itself counts as the last one. */
export const daysToDoom = (region: Parameters<typeof releaseAt>[0], now = Date.now()) =>
  Math.ceil((releaseAt(region) - now) / 86_400_000);

export default function App() {
  const [selected, setSelected] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ id: string; n: number } | null>(null);
  const [watched, setWatched] = useState<Set<string>>(loadWatched);
  const [tier, setTier] = useState<Tier>("essential");
  const [support, setSupport] = useState(false);
  const [sharing, setSharing] = useState(false);
  useScrollMotion();

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify([...watched]));
    } catch {
      /* private mode – the site still works, it just won't remember */
    }
  }, [watched]);

  const toggleWatched = useCallback((id: string) => {
    setWatched((w) => {
      const n = new Set(w);
      if (n.has(id)) n.delete(id);
      else { n.add(id); track("mark_watched", { title: id }); }
      return n;
    });
  }, []);

  /** Select a title; `travel` also flies the map to it. */
  const select = useCallback((id: string | null, travel = false) => {
    setSelected(id);
    if (id && travel) setFocus((f) => ({ id, n: (f?.n || 0) + 1 }));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Whole days, rounded down like the big countdown, so the two always agree.
  const [region] = useRegion();
  const now = useNow();
  const d = daysUntil(region, now);
  // The nav's "days left" only shows once the big countdown has scrolled out of view.
  const [pastCountdown, setPastCountdown] = useState(false);
  useEffect(() => {
    const el = document.querySelector(".hero .count, .hero .count-over");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPastCountdown(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const ready = useMemo(() => doomReady(watched), [watched]);

  return (
    <PosterProvider>
      <header className="nav">
        <a className="brand" href="#top" aria-label="Road to Doomsday, home">
          <Sigil />
          <span className="brand-text">
            <small>Road to</small>
            <b>Doomsday</b>
          </span>
        </a>
        <nav>
          <a href="#timeline">Watch order</a>
          <a href="#story">Catch up</a>
          <a href="#planner">Watch plan</a>
          <a href="./countdown/">Countdown</a>
          <a href="https://x.com/sankitdev" target="_blank" rel="noopener noreferrer" onClick={() => track("follow_x", { from: "nav" })}>@sankitdev</a>
        </nav>
        <button className="nav-support" onClick={() => { setSupport(true); track("support_open", { from: "nav" }); }}>Support</button>
        <span className={`nav-count${pastCountdown ? " on" : ""}`} aria-hidden={!pastCountdown}>
          {d > 0 ? (
            <>
              <b>{d}</b> {d === 1 ? "day" : "days"} left
            </>
          ) : (
            <b>Doomsday is here</b>
          )}
        </span>
      </header>

      <main id="top">
        <Hero />
        <TimelineMap
          selected={selected}
          focus={focus}
          onSelect={select}
          watched={watched}
          toggleWatched={toggleWatched}
          tier={tier}
          setTier={setTier}
        />
        <Story onSelect={select} />
        <Planner watched={watched} onSelect={select} />
      </main>

      <footer className="foot">
        <div className="foot-inner">
          <div className="foot-top">
            <a className="brand foot-brand" href="#top" aria-label="Back to the top">
              <Sigil />
              <span className="brand-text"><small>Road to</small><b>Doomsday</b></span>
            </a>
            <p className="foot-tag">Every MCU movie and show you need before Avengers: Doomsday, in the right order.</p>
          </div>

          <div className="foot-actions">
            <section className="foot-card foot-ready" style={{ ["--p" as string]: ready.pct }}>
              <h3>How ready are you?</h3>
              <p className="foot-ready-num"><b>{ready.pct}%</b> doom-ready · {ready.essentials}/{ready.essentialsTotal} essentials watched</p>
              <i className="foot-ready-bar"><i /></i>
              <button className="glow-btn glow-line" onClick={() => { setSharing(true); track("share_card_clicked", { from: "footer" }); }}>Share my doom-ready %</button>
            </section>
            <section className="foot-card">
              <h3>Made by @sankitdev</h3>
              <p>I built this for me and my friends before Doomsday. Follow for updates and new features.</p>
              <a className="glow-btn glow-x" href="https://x.com/sankitdev" target="_blank" rel="noopener noreferrer" onClick={() => track("follow_x", { from: "footer_button" })}>
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z"/></svg>
                Follow on X
              </a>
            </section>
            <section className="foot-card">
              <h3>Keep it free</h3>
              <p>No ads, no sign-up. If it helped you get ready, you can chip in for the hosting.</p>
              <button className="glow-btn glow-doom" onClick={() => { setSupport(true); track("support_open", { from: "footer" }); }}>Support this site</button>
            </section>
          </div>

          <nav className="foot-nav" aria-label="Guides">
            <h3>Guides</h3>
            <ul>
              <li><a href="./watch-order/">Full watch order</a></li>
              <li><a href="./essentials/">The essentials</a></li>
              <li><a href="./story/">The story so far</a></li>
              <li><a href="./countdown/">Countdown</a></li>
            </ul>
          </nav>

          <div className="foot-legal">
            <p>Just a fan project. It's not affiliated with or endorsed by Marvel or Disney, and all the titles belong to them.</p>
            <p>Runtimes are rough, and for shows it's the whole season. Posters come from Wikipedia and belong to their owners.</p>
          </div>
        </div>
      </footer>

      <Drawer
        id={selected}
        watched={watched}
        toggleWatched={toggleWatched}
        onSelect={select}
        onClose={() => setSelected(null)}
      />
      <Support open={support} onClose={() => setSupport(false)} />
      {sharing && (
        <Suspense fallback={null}>
          <ShareCard ready={ready} onClose={() => setSharing(false)} />
        </Suspense>
      )}
    </PosterProvider>
  );
}
