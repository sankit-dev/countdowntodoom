import { useEffect, useRef, useState } from "react";
import { DOOM_ID, LANE_BY_ID, TITLES } from "../data";

const FRAMES = 14;
const FW = 960, FH = 540;
const COLS = 4, ROWS = 3;

/**
 * Paints a tall sprite sheet: each frame is a page of comic-style panels, one
 * panel per title, in that title's storyline colour. Flipping through the
 * frames is the "pages" effect of the opening.
 */
function paintPages(): string {
  const c = document.createElement("canvas");
  c.width = FW; c.height = FH * FRAMES;
  const g = c.getContext("2d")!;
  const list = TITLES.filter((t) => t.id !== DOOM_ID);
  let n = 0;
  for (let f = 0; f < FRAMES; f++) {
    const oy = f * FH;
    g.fillStyle = "#050605"; g.fillRect(0, oy, FW, FH);
    // Uneven column widths so no two pages line up.
    const cuts = [0, ...Array.from({ length: COLS - 1 }, (_, i) => ((i + 1) / COLS) * FW + (Math.random() - 0.5) * 90), FW];
    for (let r = 0; r < ROWS; r++) {
      for (let k = 0; k < COLS; k++) {
        const t = list[n++ % list.length];
        const x = cuts[k] + 5, y = oy + (r * FH) / ROWS + 5;
        const w = cuts[k + 1] - cuts[k] - 10, h = FH / ROWS - 10;
        g.fillStyle = LANE_BY_ID[t.lane].color; g.fillRect(x, y, w, h);
        g.fillStyle = (r + k + f) % 2 ? "rgba(0,0,0,.42)" : "rgba(0,0,0,.12)"; g.fillRect(x, y, w, h);
        // Halftone dots
        g.fillStyle = "rgba(0,0,0,.2)";
        for (let dy = 6; dy < h; dy += 9) for (let dx = 6 + ((dy / 9) % 2) * 4.5; dx < w; dx += 9) {
          g.beginPath(); g.arc(x + dx, y + dy, 1.6 + (dx / w) * 1.6, 0, 6.283); g.fill();
        }
        // Title, wrapped
        g.fillStyle = "#fff"; g.textBaseline = "top";
        g.font = `34px Anton, Impact, sans-serif`;
        const words = t.title.toUpperCase().split(" ");
        let line = "", ly = y + 12;
        for (const wd of words) {
          if (g.measureText(line + wd).width > w - 22 && line) { g.fillText(line, x + 12, ly); line = ""; ly += 36; }
          line += wd + " ";
        }
        if (ly < y + h - 30) g.fillText(line, x + 12, ly);
      }
    }
  }
  return c.toDataURL("image/jpeg", 0.8);
}

type Stage = "wait" | "flip" | "forge" | "out" | "gone";

/**
 * The opening: pages of every title flip past full-screen, the camera pulls
 * back to show they are running inside the letters of the wordmark, and the
 * letters forge into metal.
 */
export function Intro() {
  const skip =
    typeof window !== "undefined" &&
    (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      sessionStorage.getItem("rtd.intro") === "1");
  const [stage, setStage] = useState<Stage>(skip ? "gone" : "wait");
  const [sheet, setSheet] = useState("");
  const root = useRef<HTMLDivElement>(null);

  // Wait for the display font so the panels are drawn in it, but never for long.
  useEffect(() => {
    if (stage !== "wait") return;
    let live = true;
    const go = () => { if (live) { setSheet(paintPages()); setStage("flip"); } };
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    Promise.race([
      fonts ? fonts.load("34px Anton") : Promise.resolve(),
      new Promise((r) => setTimeout(r, 1200)),
    ]).then(go, go);
    return () => { live = false; };
  }, [stage]);

  // Page flipping
  useEffect(() => {
    if (stage !== "flip") return;
    let f = 0;
    const iv = setInterval(() => {
      f = (f + 1) % FRAMES;
      root.current?.style.setProperty("--page", `${(f / (FRAMES - 1)) * 100}%`);
    }, 75);
    const done = setTimeout(() => setStage("forge"), 2700);
    return () => { clearInterval(iv); clearTimeout(done); };
  }, [stage]);

  useEffect(() => {
    if (stage === "forge") {
      const a = setTimeout(() => setStage("out"), 1500);
      return () => clearTimeout(a);
    }
    if (stage === "out") {
      try { sessionStorage.setItem("rtd.intro", "1"); } catch { /* ignore */ }
      const a = setTimeout(() => setStage("gone"), 800);
      return () => clearTimeout(a);
    }
  }, [stage]);

  useEffect(() => {
    document.documentElement.classList.toggle("intro-lock", stage !== "gone" && stage !== "out");
    return () => document.documentElement.classList.remove("intro-lock");
  }, [stage]);

  if (stage === "gone") return null;
  const pages = sheet ? { backgroundImage: `url("${sheet}")` } : undefined;
  return (
    <div
      ref={root}
      className={`intro intro-${stage}`}
      style={{ ["--frames" as string]: FRAMES }}
      onClick={() => setStage("out")}
      aria-hidden="true"
    >
      <div className="intro-pages" style={pages} />
      <div className="intro-mark">
        <span className="intro-top">Road to</span>
        <span className="intro-word" style={stage === "flip" ? pages : undefined}>Doomsday</span>
      </div>
      <i className="intro-flash" />
      <span className="intro-skip">Click to skip</span>
    </div>
  );
}
