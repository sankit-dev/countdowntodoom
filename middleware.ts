// Vercel Routing Middleware. Share links like /?ready=82&e=12 are sent to
// api/share, which returns the homepage with that person's card as the link
// preview. (A vercel.json rewrite can't do this: "/" matches the static
// index.html first.) Every other request passes straight through.
import { next, rewrite } from "@vercel/edge";

export const config = { matcher: "/" };

export default function middleware(request: Request) {
  const url = new URL(request.url);
  if (!url.searchParams.has("ready")) return next();
  const dest = new URL("/api/share", url);
  dest.search = url.search;
  return rewrite(dest);
}
