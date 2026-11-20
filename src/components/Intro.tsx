import { useEffect, useState } from "react";
import { DOOM_ID, TITLES } from "../data";

const NAMES = TITLES.filter((t) => t.id !== DOOM_ID).map((t) => t.title);

/** A two-second cold open: every title flickers past, then the screen cuts to the site. */
export function Intro() {
  const skip =
    typeof window !== "undefined" &&
    (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      sessionStorage.getItem("rtd.intro") === "1");
  const [i, setI] = useState(0);
  const [stage, setStage] = useState<"run" | "slam" | "out" | "gone">(skip ? "gone" : "run");

  useEffect(() => {
    if (stage !== "run") return;
    const step = Math.ceil(NAMES.length / 26);
    const iv = setInterval(() => {
      setI((n) => {
        if (n + step >= NAMES.length) {
          clearInterval(iv);
          setStage("slam");
          return n;
        }
        return n + step;
      });
    }, 62);
    return () => clearInterval(iv);
  }, [stage]);

  useEffect(() => {
    if (stage === "slam") {
      const a = setTimeout(() => setStage("out"), 900);
      return () => clearTimeout(a);
    }
    if (stage === "out") {
      try { sessionStorage.setItem("rtd.intro", "1"); } catch { /* ignore */ }
      const a = setTimeout(() => setStage("gone"), 700);
      return () => clearTimeout(a);
    }
  }, [stage]);

  if (stage === "gone") return null;
  return (
    <div className={`intro intro-${stage}`} onClick={() => setStage("out")} aria-hidden="true">
      {stage === "run" ? (
        <span className="intro-flick" key={i}>{NAMES[i]}</span>
      ) : (
        <span className="intro-slam">Doomsday</span>
      )}
      <span className="intro-skip">Click to skip</span>
    </div>
  );
}
