import { useCallback, useEffect, useState } from "react";
import { DOOM_DATE } from "./data";
import { Hero } from "./components/Hero";
import { TimelineMap } from "./components/TimelineMap";
import { Drawer } from "./components/Drawer";
import { Planner } from "./components/Planner";
import { Sigil } from "./components/Sigil";
import { PosterProvider } from "./posters";

export type Tier = "all" | "recommended" | "essential";

const STORE = "rtd.watched.v1";
const loadWatched = (): Set<string> => {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORE) || "[]"));
  } catch {
    return new Set();
  }
};

export const daysToDoom = () =>
  Math.ceil((DOOM_DATE.getTime() - Date.now()) / 86_400_000);

export default function App() {
  const [selected, setSelected] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ id: string; n: number } | null>(null);
  const [watched, setWatched] = useState<Set<string>>(loadWatched);
  const [tier, setTier] = useState<Tier>("essential");

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
      n.has(id) ? n.delete(id) : n.add(id);
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

  const d = daysToDoom();

  return (
    <PosterProvider>
      <header className="nav">
        <a className="brand" href="#top" aria-label="Road to Doomsday — home">
          <Sigil />
          <span className="brand-text">
            <small>Road to</small>
            <b>Doomsday</b>
          </span>
        </a>
        <nav>
          <a href="#timeline">Timeline</a>
          <a href="#planner">Planner</a>
          <a href="./countdown/">Countdown</a>
        </nav>
        <span className="nav-count">
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
          tier={tier}
          setTier={setTier}
        />
        <Planner watched={watched} onSelect={select} />
      </main>

      <footer className="foot">
        <Sigil />
        <p>
          An unofficial fan project. Not affiliated with, endorsed by or sponsored by Marvel or
          The Walt Disney Company. All film and series titles belong to their respective owners.
        </p>
        <p className="dim">Runtimes are approximate. Series runtimes cover the whole season. Poster images are loaded from Wikipedia and belong to their respective rights holders.</p>
      </footer>

      <Drawer
        id={selected}
        watched={watched}
        toggleWatched={toggleWatched}
        onSelect={select}
        onClose={() => setSelected(null)}
      />
    </PosterProvider>
  );
}
