import { useEffect, useRef, useState } from "react";

// The looping throne video behind the hero and the countdown.
// Only on larger screens (laptop/desktop): phones keep the still image, which
// saves their data. Also skipped for people who ask for reduced motion.
const QUERY = "(min-width: 900px) and (prefers-reduced-motion: no-preference)";

export function LoopVideo({ base, className }: { base: string; className: string }) {
  const [want, setWant] = useState(() => typeof window !== "undefined" && window.matchMedia(QUERY).matches);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const on = () => setWant(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Pause while scrolled out of view.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(v);
    return () => io.disconnect();
  }, [want]);

  if (!want) return null;
  return (
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
  );
}
