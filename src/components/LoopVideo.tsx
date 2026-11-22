import { useEffect, useRef, useState } from "react";
import { track } from "../analytics";

// The looping throne video behind the hero and the countdown.
// Only on larger screens (laptop/desktop). Phones keep the still image, which
// saves their data, but still get the same sound: just the audio track, which
// isn't downloaded until someone taps "Sound". Reduced-motion visitors get the
// audio-only version too.
//
// It always starts muted (browsers block sound until the visitor interacts)
// and the "Sound" button turns the audio on.
const QUERY = "(min-width: 900px) and (prefers-reduced-motion: no-preference)";

export function LoopVideo({ base, className }: { base: string; className: string }) {
  const [want, setWant] = useState(() => typeof window !== "undefined" && window.matchMedia(QUERY).matches);
  const [ready, setReady] = useState(false);
  const [sound, setSound] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const on = () => setWant(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Without the video there's nothing to wait for: show the button straight away.
  useEffect(() => { if (!want) setReady(true); }, [want]);

  // Pause while scrolled out of view or the tab is hidden (this also stops the sound).
  useEffect(() => {
    const el = want ? video.current : btn.current;
    if (!el) return;
    let visible = true;
    const sync = () => {
      const on = visible && !document.hidden;
      if (want) {
        const v = video.current!;
        on ? v.play().catch(() => {}) : v.pause();
      } else {
        const a = audio.current!;
        if (!on) a.pause();
        else if (sound) a.play().catch(() => {});
      }
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [want, sound]);

  const toggle = () => {
    const on = !sound;
    if (want) {
      const v = video.current;
      if (!v) return;
      v.muted = !on;
      v.volume = 0.8;
      if (on && v.paused) v.play().catch(() => {});
    } else {
      const a = audio.current;
      if (!a) return;
      a.volume = 0.8;
      on ? a.play().catch(() => setSound(false)) : a.pause();
    }
    if (on) track("sound_on", { mode: want ? "video" : "audio" });
    setSound(on);
  };

  return (
    <>
      {want ? (
        <video
          ref={video}
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
      ) : (
        <audio ref={audio} src={`${base}doom-loop.m4a`} loop preload="none" />
      )}
      <button
        ref={btn}
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
