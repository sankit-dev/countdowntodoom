import { useEffect, useState } from "react";

// Full-screen backdrop for the hero and the countdown page.
// A local file wins if it exists; otherwise the lead image of the film's
// Wikipedia article is loaded in the visitor's browser.
const WIKI =
  "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1" +
  "&prop=pageimages&piprop=thumbnail&pithumbsize=1600&pilicense=any&titles=" +
  encodeURIComponent("Avengers: Doomsday");

const loads = (src: string) =>
  new Promise<string>((ok, fail) => {
    const img = new Image();
    img.onload = () => ok(src);
    img.onerror = fail;
    img.src = src;
  });

let wiki: Promise<string> | null = null;
const wikiImage = () =>
  (wiki ||= fetch(WIKI)
    .then((r) => r.json())
    .then((j) => {
      const page: any = Object.values(j.query?.pages || {})[0];
      if (!page?.thumbnail?.source) throw new Error("no image");
      return loads(page.thumbnail.source);
    }));

/** `own` is true when the image is your own file (shown full-bleed, not as a poster). */
/** Phones get a portrait poster instead of the wide still. */
export const isPhone = () => typeof window !== "undefined" && window.matchMedia("(max-width: 899px)").matches;

export function useBackdrop(local: string) {
  const [bg, setBg] = useState<{ src: string; own: boolean } | null>(null);
  useEffect(() => {
    let live = true;
    loads(local)
      .then((src) => live && setBg({ src, own: true }))
      .catch(() => wikiImage().then((src) => live && setBg({ src, own: false })))
      .catch(() => { /* stays black */ });
    return () => { live = false; };
  }, [local]);
  return bg;
}
