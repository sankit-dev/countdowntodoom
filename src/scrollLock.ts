import { useEffect } from "react";

// Stops the page behind a panel or dialog from scrolling while it's open, so a
// swipe inside the panel only ever moves the panel. "phone" locks only on small
// screens (on laptops the title panel sits beside the page, which stays usable).
let held: ("phone" | "all")[] = [];
const apply = () => {
  const root = document.documentElement;
  if (held.includes("all")) root.dataset.lock = "all";
  else if (held.length) root.dataset.lock = "phone";
  else delete root.dataset.lock;
};

export function useScrollLock(active: boolean, scope: "phone" | "all" = "all") {
  useEffect(() => {
    if (!active) return;
    held.push(scope);
    apply();
    return () => {
      const i = held.indexOf(scope);
      if (i >= 0) held.splice(i, 1);
      apply();
    };
  }, [active, scope]);
}
