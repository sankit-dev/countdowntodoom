import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BY_ID, DOOM_ID, NEXT, TITLES, Title, fmtMin } from "../data";
import type { Tier } from "../App";
import { Poster, usePosters } from "../posters";

interface Props {
  selected: string | null;
  focus: { id: string; n: number } | null;
  onSelect: (id: string | null, travel?: boolean) => void;
  watched: Set<string>;
  tier: Tier;
  setTier: (t: Tier) => void;
}

const MIN_IMP: Record<Tier, number> = { essential: 7, recommended: 4, all: 0 };
const VIEWS: { tier: Tier; label: string }[] = [
  { tier: "essential", label: "Essentials" },
  { tier: "recommended", label: "Recommended" },
  { tier: "all", label: "Everything" },
];
const ORDER = Object.fromEntries(TITLES.map((t, i) => [t.id, i]));
const tierFor = (t: Title): Tier => (t.imp >= 7 ? "essential" : t.imp >= 4 ? "recommended" : "all");

function useViewport() {
  const [v, setV] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const on = () => setV({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return v;
}

type Pt = [number, number];
/** A right-angled connector through `pts`, with softened corners. */
function elbow(pts: Pt[], r = 8) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [cx, cy] = pts[i], [nx, ny] = pts[i + 1];
    const d1 = Math.hypot(cx - px, cy - py), d2 = Math.hypot(nx - cx, ny - cy);
    const rr = Math.min(r, d1 / 2, d2 / 2);
    if (rr < 0.5) { d += `L${cx} ${cy}`; continue; }
    d += `L${cx - ((cx - px) / d1) * rr} ${cy - ((cy - py) / d1) * rr}Q${cx} ${cy} ${cx + ((nx - cx) / d2) * rr} ${cy + ((ny - cy) / d2) * rr}`;
  }
  const last = pts[pts.length - 1];
  return d + `L${last[0]} ${last[1]}`;
}

export function TimelineMap({ selected, focus, onSelect, watched, tier, setTier }: Props) {
  const vp = useViewport();
  const posters = usePosters();
  const [hover, setHover] = useState<string | null>(null);
  const [card, setCard] = useState<{ id: string; x: number; y: number; flip: boolean } | null>(null);
  const enter = (id: string, el: HTMLElement) => {
    setHover(id);
    const r = el.getBoundingClientRect();
    const flip = r.right + 300 > window.innerWidth;
    setCard({ id, x: flip ? r.left - 12 : r.right + 12, y: Math.max(70, Math.min(window.innerHeight - 190, r.top)), flip });
  };
  const leave = () => { setHover(null); setCard(null); };
  useEffect(() => {
    window.addEventListener("scroll", leave, { passive: true });
    return () => window.removeEventListener("scroll", leave);
  }, []);

  // ── Build the tree for this view ─────────────────────────────────────────
  // Doomsday is the root on the right. Each title hangs off the next title on
  // its road to Doomsday that is visible in this view.
  const T = useMemo(() => {
    const visible = new Set(
      TITLES.filter((t) => t.id === DOOM_ID || (t.imp >= MIN_IMP[tier] && NEXT[t.id])).map((t) => t.id)
    );
    const parent: Record<string, string> = {};
    const kids: Record<string, string[]> = {};
    for (const id of visible) {
      if (id === DOOM_ID) continue;
      let n = NEXT[id];
      while (n && !visible.has(n)) n = NEXT[n];
      parent[id] = n || DOOM_ID;
      (kids[parent[id]] ||= []).push(id);
    }
    for (const k of Object.values(kids)) k.sort((a, b) => ORDER[a] - ORDER[b]);

    // Depth-first: leaves take the next free row, parents sit between their children.
    const row: Record<string, number> = {};
    const dist: Record<string, number> = { [DOOM_ID]: 0 };
    let rows = 0, maxDist = 0;
    const place = (id: string) => {
      const c = kids[id] || [];
      for (const k of c) { dist[k] = dist[id] + 1; maxDist = Math.max(maxDist, dist[k]); place(k); }
      row[id] = c.length ? (row[c[0]] + row[c[c.length - 1]]) / 2 : rows++;
    };
    place(DOOM_ID);

    const side = tier === "all" ? TITLES.filter((t) => t.id !== DOOM_ID && !NEXT[t.id]) : [];
    // Watch order: release order among the titles shown in this view.
    const num: Record<string, number> = {};
    let n = 0;
    for (const t of TITLES) if (t.id !== DOOM_ID && visible.has(t.id)) num[t.id] = ++n;
    return { visible, parent, row, dist, rows, cols: maxDist + 1, side, num };
  }, [tier]);

  // ── Sizes ────────────────────────────────────────────────────────────────
  // The tree grows upward: Doomsday at the top, each road climbing to it.
  const G = useMemo(() => {
    // Fixed sizes: the canvas is zoomed to fit, the tree is not squeezed.
    const leafW = 132;
    const pw = 96;
    const ph = Math.round(pw * 1.5);
    const label = 34; // room for two lines of title under a poster
    const levelH = ph + label + 46;
    const doomR = 78;
    const top = doomR * 2 + 50;
    const width = leafW * T.rows;
    const height = top + levelH * (T.cols - 1);
    const x = (id: string) => T.row[id] * leafW + leafW / 2;
    // y is the top edge of a poster (for Doomsday, the centre of the circle).
    const y = (id: string) => (id === DOOM_ID ? doomR + 4 : top + (T.dist[id] - 1) * levelH);
    return { pw, ph, label, levelH, doomR, width, height, x, y, leafW };
  }, [T]);

  // ── Highlight: a title's own road to Doomsday ────────────────────────────
  const active = hover ?? selected;
  const road = useMemo(() => {
    if (!active || !T.visible.has(active)) return null;
    const s = new Set<string>();
    for (let n: string | undefined = active; n; n = T.parent[n]) s.add(n);
    return s;
  }, [active, T]);

  // ── Being sent to a title from the drawer ────────────────────────────────
  useEffect(() => {
    if (!focus) return;
    const t = BY_ID[focus.id];
    const need: Tier = !NEXT[t.id] && t.id !== DOOM_ID ? "all" : tierFor(t);
    if (MIN_IMP[need] < MIN_IMP[tier]) { setTier(need); return; }
    const el = stage.current;
    if (!el || !T.visible.has(t.id)) return;
    const k = Math.max(viewRef.current.k, 0.7);
    setView({ k, x: el.clientWidth / 2 - G.x(t.id) * k, y: el.clientHeight / 2 - (G.y(t.id) + G.ph / 2) * k });
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, tier]);

  // ── Pan and zoom ─────────────────────────────────────────────────────────
  // The tree sits on a canvas: drag to move it, pinch / Ctrl+scroll / the
  // buttons to zoom. Plain scrolling is left alone so the page still scrolls.
  const stage = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const dragged = useRef(false);
  const MIN_K = 0.2, MAX_K = 2.2;
  const PAD = 28;

  const fit = (whole: boolean) => {
    const el = stage.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    const byW = (w - PAD * 2) / G.width, byH = (h - PAD * 2) / G.height;
    const k = Math.max(MIN_K, Math.min(1, whole ? Math.min(byW, byH) : byW));
    // Centre on Doomsday horizontally; start from the top unless showing it all.
    setView({ k, x: w / 2 - G.x(DOOM_ID) * k, y: whole ? Math.max(PAD, (h - G.height * k) / 2) : PAD });
  };
  useLayoutEffect(() => fit(false), [G, vp.w, vp.h]); // eslint-disable-line react-hooks/exhaustive-deps

  const zoomAt = (cx: number, cy: number, factor: number) =>
    setView((v) => {
      const k = Math.max(MIN_K, Math.min(MAX_K, v.k * factor));
      return { k, x: cx - ((cx - v.x) * k) / v.k, y: cy - ((cy - v.y) * k) / v.k };
    });
  const zoomBy = (factor: number) => {
    const el = stage.current!;
    zoomAt(el.clientWidth / 2, el.clientHeight / 2, factor);
  };

  // Ctrl/⌘ + wheel (which is also what a trackpad pinch sends) zooms.
  useEffect(() => {
    const el = stage.current!;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      // A mouse wheel sends big steps, a trackpad pinch small ones; cap the big ones.
      zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-Math.max(-30, Math.min(30, e.deltaY)) * 0.01));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // One pointer drags; two pointers pinch.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ x: number; y: number; d: number } | null>(null);
  const measure = () => {
    const ps = [...pointers.current.values()];
    const x = ps.reduce((n, p) => n + p.x, 0) / ps.length, y = ps.reduce((n, p) => n + p.y, 0) / ps.length;
    return { x, y, d: ps.length > 1 ? Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) : 0 };
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gesture.current = measure();
    if (pointers.current.size === 1) dragged.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g0 = gesture.current, g1 = measure();
    const dx = g1.x - g0.x, dy = g1.y - g0.y;
    if (!dragged.current && pointers.current.size === 1 && Math.hypot(dx, dy) < 5) return;
    if (!dragged.current) {
      dragged.current = true;
      leave();
      stage.current!.classList.add("grabbing");
      try { stage.current!.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    }
    gesture.current = g1;
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    if (g0.d && g1.d) {
      const r = stage.current!.getBoundingClientRect();
      zoomAt(g1.x - r.left, g1.y - r.top, g1.d / g0.d);
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    gesture.current = pointers.current.size ? measure() : null;
    if (!pointers.current.size) {
      stage.current!.classList.remove("grabbing");
      setTimeout(() => (dragged.current = false), 0); // let the click that follows a drag be ignored
    }
  };

  const count = (t: Tier) => TITLES.filter((x) => x.id !== DOOM_ID && x.imp >= MIN_IMP[t] && (t === "all" || NEXT[x.id])).length;

  const tile = (t: Title, style?: React.CSSProperties) => (
    <button
      key={t.id}
      data-title={t.id}
      className={`tile${road?.has(t.id) ? " lit" : ""}${selected === t.id ? " sel" : ""}${watched.has(t.id) ? " seen" : ""}`}
      style={{ ...style, ["--pw" as string]: `${G.pw}px`, ["--ph" as string]: `${G.ph}px`, ["--tw" as string]: `${Math.round(G.leafW - 8)}px` }}
      onMouseEnter={(e) => { if (!dragged.current) enter(t.id, e.currentTarget.querySelector(".art") as HTMLElement); }}
      onMouseLeave={leave}
      onClick={() => onSelect(selected === t.id ? null : t.id)}
    >
      <span className="art">
        <i>{t.year}</i>
        {T.num[t.id] && <em className="num" aria-label={`Watch number ${T.num[t.id]}`}>{T.num[t.id]}</em>}
        <Poster src={t.poster || posters[t.id]} />
        {watched.has(t.id) && <u aria-label="Watched">✓</u>}
      </span>
      <b>{t.title}</b>
    </button>
  );

  return (
    <section id="timeline" className="tree-section">
      <header className="tree-head">
        <div>
          <h2>Every road leads to Doom</h2>
          <p>Watch in number order, starting at 1. Every line climbs to Doomsday — hover a title for the short version, click for the full story.</p>
        </div>
        <div className="seg" role="group" aria-label="How much to show">
          {VIEWS.map((v) => (
            <button key={v.tier} className={tier === v.tier ? "on" : ""} onClick={() => setTier(v.tier)}>
              {v.label} <small>{count(v.tier)}</small>
            </button>
          ))}
        </div>
      </header>

      <div
        className="tree-stage"
        ref={stage}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => { if (dragged.current) { e.stopPropagation(); e.preventDefault(); } }}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          const r = e.currentTarget.getBoundingClientRect();
          zoomAt(e.clientX - r.left, e.clientY - r.top, 1.6);
        }}
      >
        <div className={`tree${road ? " has-lit" : ""}`}
          style={{ width: G.width, height: G.height, transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.k})` }}>
          <svg className="edges" width={G.width} height={G.height} aria-hidden="true">
            {[...T.visible].filter((id) => id !== DOOM_ID).map((id) => {
              const p = T.parent[id];
              // Up out of this poster, across, and up into the foot of the next one.
              const sx = G.x(id), sy = G.y(id);
              const ex = G.x(p), ey = p === DOOM_ID ? G.y(p) + G.doomR : G.y(p) + G.ph + G.label;
              const my = sy - 22;
              return (
                <path key={id} className={`edge${road?.has(id) ? " on" : ""}`}
                  d={elbow([[sx, sy], [sx, my], [ex, my], [ex, ey]])} />
              );
            })}
          </svg>

          {TITLES.filter((t) => T.visible.has(t.id) && t.id !== DOOM_ID).map((t) =>
            tile(t, { position: "absolute", left: G.x(t.id), top: G.y(t.id) })
          )}

          <button
            data-title={DOOM_ID}
            className={`doom${road ? " lit" : ""}${selected === DOOM_ID ? " sel" : ""}`}
            style={{ left: G.x(DOOM_ID), top: G.y(DOOM_ID), width: G.doomR * 2, height: G.doomR * 2 }}
            onMouseEnter={() => setHover(DOOM_ID)}
            onMouseLeave={leave}
            onClick={() => onSelect(selected === DOOM_ID ? null : DOOM_ID)}
          >
            <small>Avengers</small>
            <b>Doomsday</b>
            <span>18 · 12 · 2026</span>
          </button>
        </div>

        <span className="stage-hint">Drag to move · pinch or Ctrl + scroll to zoom</span>
        <div className="stage-tools" onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
          <button onClick={() => zoomBy(1.35)} aria-label="Zoom in">+</button>
          <button onClick={() => zoomBy(1 / 1.35)} aria-label="Zoom out">−</button>
          <button className="wide" onClick={() => fit(true)}>Fit all</button>
          <button className="wide" onClick={() => fit(false)}>Reset</button>
        </div>
      </div>

      {card && !selected && (
        <aside className={`hover-card${card.flip ? " flip" : ""}`} style={{ left: card.x, top: card.y }} aria-hidden="true">
          <b>{T.num[card.id] ? `${T.num[card.id]}. ` : ""}{BY_ID[card.id].title}</b>
          <span>{BY_ID[card.id].year} · {BY_ID[card.id].kind === "film" ? "Film" : BY_ID[card.id].kind === "series" ? "Series" : "Special"} · {fmtMin(BY_ID[card.id].min)}</span>
          <p>{BY_ID[card.id].why}</p>
        </aside>
      )}

      {T.side.length > 0 && (
        <div className="side-roads">
          <h3>Side roads</h3>
          <p>Worth watching, but they don't feed into Doomsday.</p>
          <div className="side-row">{T.side.map((t) => tile(t))}</div>
        </div>
      )}
    </section>
  );
}
