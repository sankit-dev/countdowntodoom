// Vercel Routing Middleware. Share links like /?ready=82&e=12 are sent to
// api/share, which returns the homepage with that person's card as the link
// preview. (A vercel.json rewrite can't do this: "/" matches the static
// index.html first.) Every other visit to / or /countdown/ passes straight
// through, with a cookie saying which country it came from.
import { next, rewrite } from "@vercel/edge";

export const config = { matcher: ["/", "/countdown/"] };

// Vercel tells us which country a visit comes from. We pass it to the page in a
// cookie so the countdown shows that country's release date (src/release.tsx).
const withCountry = (request: Request) => {
  const cc = request.headers.get("x-vercel-ip-country");
  return /^[A-Z]{2}$/.test(cc || "")
    ? next({ headers: { "Set-Cookie": `rtd_cc=${cc}; Path=/; Max-Age=86400; SameSite=Lax` } })
    : next();
};

export default function middleware(request: Request) {
  const url = new URL(request.url);
  if (!url.searchParams.has("ready")) return withCountry(request);
  const dest = new URL("/api/share", url);
  dest.search = url.search;
  return rewrite(dest);
}
