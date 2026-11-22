import { useEffect, useState } from "react";

// A soft glow behind each poster in that poster's own strongest colour (Iron Man
// red-gold, Hulk green...). The colour is read from a tiny copy of the poster on a
// canvas, then cached. Posters are served from our own domain, so this always works;
// a poster that can't be read just gets no glow.

export const glowOn = true;

const KEY = "rtd.glow.v2";
let cache: Record<string, string> = {};
try { cache = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { /* none */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* full or blocked */ } };

/** Most common vivid hue in the image, as an hsl() colour. Muddy or grey posters get null. */
function vivid(img: HTMLImageElement): string | null {
  const w = 24, h = 36;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(img, 0, 0, w, h);
  const d = g.getImageData(0, 0, w, h).data;
  const bins = new Array(36).fill(0);
  const light = new Array(36).fill(0);
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] / 255, gg = d[i + 1] / 255, b = d[i + 2] / 255;
    const max = Math.max(r, gg, b), min = Math.min(r, gg, b), l = (max + min) / 2, ch = max - min;
    if (ch < 0.18 || l < 0.12 || l > 0.9) continue; // skip greys, blacks, whites
    let hue = max === r ? ((gg - b) / ch) % 6 : max === gg ? (b - r) / ch + 2 : (r - gg) / ch + 4;
    hue = (hue * 60 + 360) % 360;
    const s = ch / (1 - Math.abs(2 * l - 1));
    const k = Math.floor(hue / 10);
    bins[k] += s * s; // favour strong colour
    light[k] += l * s * s;
  }
  // Smooth neighbouring bins so a hue split across two bins still wins.
  let best = -1, score = 0;
  for (let k = 0; k < 36; k++) {
    const v = bins[(k + 35) % 36] * 0.5 + bins[k] + bins[(k + 1) % 36] * 0.5;
    if (v > score) { score = v; best = k; }
  }
  if (best < 0 || score < 6) return null;
  return `hsl(${best * 10 + 5} 85% 55%)`;
}

export function useGlow(id: string, src?: string) {
  const [color, setColor] = useState<string | null>(cache[id] ?? null);
  useEffect(() => {
    if (!glowOn || !src || cache[id] !== undefined) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.onload = () => {
      try { const v = vivid(img); cache[id] = v || ""; save(); setColor(v); } catch { /* tainted canvas: no glow */ }
    };
    img.src = src;
  }, [id, src]);
  return glowOn ? color || null : null;
}
