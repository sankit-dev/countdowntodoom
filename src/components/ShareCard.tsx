// The share dialog: a preview of the doom-ready card and three ways to share
// it. Loaded only when someone opens it (React.lazy), so it costs nothing on
// first load.
import { useEffect, useState } from "react";
import { DoomReady, cardPath, shareUrl, xIntent } from "../doomReady";

export default function ShareCard({ ready, onClose }: { ready: DoomReady; onClose: () => void }) {
  const src = cardPath(ready.pct, ready.essentials);
  const link = shareUrl(ready);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const download = async () => {
    setSaving(true);
    try {
      const blob = await (await fetch(src)).blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `doom-ready-${ready.pct}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch {
      window.open(src, "_blank", "noopener"); // fall back to opening the image
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Older browsers: copy through a temporary text field.
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
        <h3>You're {ready.pct}% doom-ready</h3>
        <div className={`share-preview${loaded ? " loaded" : ""}`}>
          {!failed ? (
            <img src={src} width={1200} height={630} alt={`My doom-ready card: ${ready.pct}%, ${ready.essentials} of ${ready.essentialsTotal} essentials watched`}
              onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
          ) : (
            <p className="dim small">The card preview couldn't load. You can still copy the link or share to X.</p>
          )}
        </div>
        <div className="share-actions">
          <button className="btn" onClick={download} disabled={saving || failed}>{saving ? "Saving…" : "Download image"}</button>
          <button className="btn" onClick={copy}>{copied ? "Link copied ✓" : "Copy link"}</button>
          <a className="btn btn-primary" href={xIntent(ready)} target="_blank" rel="noopener noreferrer">Share on X</a>
        </div>
        <p className="dim small share-link">{link.replace("https://", "")}</p>
      </div>
    </div>
  );
}
