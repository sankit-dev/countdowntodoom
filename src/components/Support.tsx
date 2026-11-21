import { useEffect, useMemo, useState } from "react";
import qrcode from "qrcode-generator";
import { DODO_LINK, WALLETS } from "../support";

/** A QR code for `text`, drawn as one SVG path. */
function QR({ text }: { text: string }) {
  const { d, n } = useMemo(() => {
    const q = qrcode(0, "M");
    q.addData(text);
    q.make();
    const n = q.getModuleCount();
    let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    return { d, n };
  }, [text]);
  return (
    <svg className="qr" viewBox={`-2 -2 ${n + 4} ${n + 4}`} role="img" aria-label="QR code for this address">
      <rect x="-2" y="-2" width={n + 4} height={n + 4} fill="#fff" />
      <path d={d} fill="#000" />
    </svg>
  );
}

export function Support({ open, onClose }: { open: boolean; onClose: () => void }) {
  const wallets = WALLETS.filter((w) => w.address.trim());
  const [pick, setPick] = useState(0);
  const [copied, setCopied] = useState(false);
  const w = wallets[pick];

  useEffect(() => setCopied(false), [pick, open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(w.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked — the address is selectable, so it can still be copied by hand */
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Support this project" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="drawer-x" onClick={onClose} aria-label="Close">×</button>
        <h3>Help keep this running</h3>
        <p className="modal-lede">I made this for me and my friends. It's free with no ads, so if it helped you get ready for Doomsday you can chip in, but no pressure.</p>

        {!DODO_LINK && !wallets.length && <p className="dim">Support options are being set up. Check back soon.</p>}

        {DODO_LINK && (
          <section>
            <h4>Card and other payment methods</h4>
            <a className="btn btn-primary" href={DODO_LINK} target="_blank" rel="noopener noreferrer">Support with Dodo Payments</a>
            <p className="dim small">Opens a secure checkout hosted by Dodo Payments in a new tab.</p>
          </section>
        )}

        {wallets.length > 0 && (
          <section>
            <h4>Crypto</h4>
            <div className="seg coins">
              {wallets.map((x, i) => (
                <button key={x.coin} className={i === pick ? "on" : ""} onClick={() => setPick(i)}>{x.coin}</button>
              ))}
            </div>
            <div className="wallet">
              <QR text={w.address} />
              <div>
                <span className="wallet-net">Send only on <b>{w.network}</b></span>
                <code>{w.address}</code>
                <button className="btn" onClick={copy}>{copied ? "Copied ✓" : "Copy address"}</button>
              </div>
            </div>
            <p className="dim small">Only send on the network shown, otherwise the money is gone.</p>
          </section>
        )}
      </div>
    </div>
  );
}
