// GET /api/card?ready=82&e=12[&t=r|a][&r=fr] → the 1200x630 doom-ready card as a JPEG.
// Used for the "Download image" button and as the link preview of share links.
import { RELEASE, TIER_TOTAL, TIER_WORDS, daysLeft, parseShare } from "../src/doomReady.js";
import { readyCard, render } from "./_card.js";

// Node.js runtime (not edge): the JPEG conversion needs sharp.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const share = parseShare(url.searchParams);
  if (!share) return new Response("Missing or invalid ?ready=0-100", { status: 400 });
  const node = readyCard(url.origin, share.pct, share.count, TIER_TOTAL[share.tier], TIER_WORDS[share.tier], daysLeft(share.region), `Avengers: Doomsday, out ${RELEASE[share.region].short} in ${RELEASE[share.region].label}`);
  return render(url.origin, node, 3600);
}
