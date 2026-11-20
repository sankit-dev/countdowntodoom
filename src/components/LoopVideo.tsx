import { useEffect, useRef, useState } from "react";
import { track } from "../analytics";

// The looping throne video behind the hero and the countdown.
// Only on larger screens (laptop/desktop): phones keep the still image, which
// saves their data. Also skipped for people who ask for reduced motion.
//
// It always starts muted — browsers block sound until the visitor interacts —
// and the "Sound" button turns the audio on.
const QUERY = "(min-width: 900px) and (prefers-reduced-motion: no-preference)";

export function LoopVideo({ base, className }: { base: string; className: string }) {
  const [want, setWant] = useState(() => typeof window !== "undefined" && window.matchMedia(QUERY).matches);
  const [ready, setReady] = useState(false);
  const [sound, setSound] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const on = () => setWant(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Pause while scrolled out of view (this also stops the sound).
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(v);
    return () => io.disconnect();
  }, [want]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    const on = !sound;
    v.muted = !on;
    v.volume = 0.8;
    if (on) {
      if (v.paused) v.play().catch(() => {});
      track("sound_on");
    }
    setSound(on);
  };

  if (!want) return null;
  return (
    <>
      <video
        ref={ref}
        className={`${className}${ready ? " ready" : ""}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={`${base}hero.jpg`}
        onPlaying={() => setReady(true)}
        aria-hidden="true"
      >
        <source src={`${base}doom-loop.webm`} type="video/webm" />
        <source src={`${base}doom-loop.mp4`} type="video/mp4" />
      </video>
      <button
        className={`sound${sound ? " on" : ""}${ready ? " ready" : ""}`}
        onClick={toggle}
        aria-pressed={sound}
        aria-label={sound ? "Turn sound off" : "Turn sound on"}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
          {sound ? (
            <g className="waves" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M16.5 8.5a5 5 0 0 1 0 7" />
              <path d="M19 6a8.5 8.5 0 0 1 0 12" />
            </g>
          ) : (
            <path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
        <span>{sound ? "Sound on" : "Sound off"}</span>
      </button>
    </>
  );
}
