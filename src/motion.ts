import { useEffect } from "react";

// Scroll motion, kept in one place so the components stay plain.
//  1. Reveals: each block below fades and rises into place the first time it
//     scrolls into view. Groups marked "stagger" bring their children in one after another.
//  2. Hero parallax: as you scroll away from the hero, the background drifts
//     slower than the page and the title eases back, so the page has depth.
// Everything is skipped for people who ask for reduced motion.
// Uses data attributes (not classes) so React re-renders never wipe them.

const REVEAL: [selector: string, kind?: "stagger" | "side" | "title"][] = [
  [".tree-head h2, .story-head h2, .sec-head h2", "title"],
  [".tree-head > *:not(h2), .story-head .story-warn, .sec-head .lede"],
  [".progress"],
  [".tree-stage"],
  [".deck", "side"],
  [".deck-nav"],
  [".controls > *", "stagger"],
  [".planner-grid > :not(.controls)"],
  [".foot > *", "stagger"],
];

export function useScrollMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.dataset.motion = "";

    // 1. Reveals
    // Clipped titles can't be seen by the observer, so we watch their parent
    // and show whatever was waiting on it. Threshold 0: some blocks (the plan
    // list) are many screens tall and would never be 12% visible.
    const waiting = new Map<Element, HTMLElement[]>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          for (const el of waiting.get(e.target) || []) el.dataset.in = "";
          waiting.delete(e.target);
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );
    const watch = (target: Element, el: HTMLElement) => {
      const list = waiting.get(target);
      if (list) list.push(el);
      else { waiting.set(target, [el]); io.observe(target); }
    };
    const mark = () => {
      for (const [sel, kind] of REVEAL) {
        const groups = new Map<Element, number>();
        document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
          if (el.dataset.reveal !== undefined) return;
          el.dataset.reveal = kind || "";
          if (kind === "stagger") {
            const n = groups.get(el.parentElement!) || 0;
            groups.set(el.parentElement!, n + 1);
            el.style.setProperty("--i", String(Math.min(n, 8)));
          }
          // Anything already on screen (or above it) shows at once, no animation.
          const r = el.getBoundingClientRect();
          if (r.top < innerHeight * 0.9) el.dataset.in = "";
          else watch(kind === "title" ? el.parentElement! : el, el);
        });
      }
    };
    // Wait a frame so the first render has laid out.
    const raf0 = requestAnimationFrame(mark);

    // 2. Hero parallax
    const hero = document.querySelector<HTMLElement>(".hero");
    let raf = 0;
    const onScroll = () => {
      if (raf || !hero) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const h = hero.offsetHeight || 1;
        const p = Math.min(1, Math.max(0, scrollY / h));
        hero.style.setProperty("--hero-p", p.toFixed(3));
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      cancelAnimationFrame(raf0);
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("scroll", onScroll);
      delete root.dataset.motion;
    };
  }, []);
}
