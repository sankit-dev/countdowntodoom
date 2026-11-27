// The share dialog: a preview of the doom-ready card and the ways to share it.
// Loaded only when someone opens it (React.lazy), so it costs nothing on first load.
//
// The card counts whichever list you pick (Essentials / Recommended / Everything),
// starting with the tab you were looking at. On phones that can share files, the
// main button shares the card image itself (to WhatsApp, Instagram, X...).
import { useEffect, useMemo, useState } from "react";
import { track } from "../analytics";
import { DoomReady, ShareTier, Shared, TIER_TOTAL, cardPath, shareUrl, watchedIn, xIntent, xText } from "../doomReady";
import { useRegion } from "../release";
import { useScrollLock } from "../scrollLock";

const TIERS: { tier: ShareTier; label: string }[] = [
  { tier: "essential", label: "Essentials" },
  { tier: "recommended", label: "Recommended" },
  { tier: "all", label: "Everything" },
];

export default function ShareCard({ ready, watched, tier: startTier = "essential", onClose }: {
  ready: DoomReady; watched: Set<string>; tier?: ShareTier; onClose: () => void;
}) {
  const [region] = useRegion();
  useScrollLock(true);
  const [tier, setTier] = useState<ShareTier>(startTier);
  const share: Shared = useMemo(() => ({ pct: ready.pct, count: watchedIn(watched, tier), tier, region }), [ready.pct, watched, tier, region]);
  const src = cardPath(share);
  const link = shareUrl(share);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // A new card for each list: reset the preview and fetch the image ahead of time,
  // so "Share image" can hand it to the phone instantly when tapped.
  useEffect(() => {
    setLoaded(false); setFailed(false); setFile(null);
    let live = true;
    fetch(src).then((r) => (r.ok ? r.blob() : Promise.reject())).then((b) => {
      const f = new File([b], `doom-ready-${share.pct}.jpg`, { type: "image/jpeg" });
      if (live && navigator.canShare?.({ files: [f] })) setFile(f);
    }).catch(() => {});
    return () => { live = false; };
  }, [src, share.pct]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const text = `I'm ${share.pct}% doom-ready. How ready are you?`;
  const shareImage = async () => {
    if (!file) return;
    track("share_card_shared", { via: "native", tier });
    try { await navigator.share({ files: [file], text: `${text} ${link}` }); } catch { /* closed the sheet */ }
  };
  const save = async () => {
    track("share_card_shared", { via: "download", tier });
    try {
      const blob = file ?? (await (await fetch(src)).blob());
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `doom-ready-${share.pct}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch {
      window.open(src, "_blank", "noopener");
    }
  };
  const copy = async () => {
    track("share_card_shared", { via: "copy", tier });
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const t = document.createElement("textarea");
      t.value = link;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Share my doom-ready %" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box share-box">
        <button className="drawer-x" onClick={onClose} aria-label="Close">×</button>
        <h3>You're <em>{share.pct}%</em> doom-ready</h3>

        <div className="share-tiers" role="group" aria-label="What the card counts">
          {TIERS.map((t) => (
            <button key={t.tier} className={tier === t.tier ? "on" : ""} aria-pressed={tier === t.tier} onClick={() => setTier(t.tier)}>
              {t.label} <small>{watchedIn(watched, t.tier)}/{TIER_TOTAL[t.tier]}</small>
            </button>
          ))}
        </div>

        <div className={`share-preview${loaded ? " loaded" : ""}`}>
          {!failed ? (
            <img key={src} src={src} width={1200} height={630} alt={`My doom-ready card: ${share.pct}%, ${share.count} of ${TIER_TOTAL[tier]} watched`}
              onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
          ) : (
            <p className="dim small">The card preview couldn't load. You can still copy the link or post on X.</p>
          )}
        </div>

        {file && (
          <button className="glow-btn glow-doom share-main" onClick={shareImage}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 14v5h14v-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Share image
          </button>
        )}
        <div className="share-grid">
          <a className={file ? "" : "main"} href={xIntent(share)} target="_blank" rel="noopener noreferrer" onClick={() => track("share_card_shared", { via: "x", tier })}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z" /></svg>
            <span>Post on X</span>
          </a>
          <a href={`https://wa.me/?text=${encodeURIComponent(xText(share))}`} target="_blank" rel="noopener noreferrer" onClick={() => track("share_card_shared", { via: "whatsapp", tier })}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" /></svg>
            <span>WhatsApp</span>
          </a>
          <button onClick={copy}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <span>{copied ? "Copied" : "Copy link"}</span>
          </button>
          <button onClick={save} disabled={failed}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>Save image</span>
          </button>
        </div>
      </div>
    </div>
  );
}
