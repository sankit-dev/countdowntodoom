import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { seo } from "./seo";

/**
 * Local development only: run the Vercel functions in api/ inside the Vite dev
 * server, including the "/?ready=" rewrite from vercel.json, so `npm run dev`
 * behaves like production. Has no effect on builds.
 */
function vercelFunctionsInDev(): Plugin {
  return {
    name: "vercel-functions-in-dev",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || "/", `http://${req.headers.host}`);
        let fn: string | null = null;
        if (url.pathname.startsWith("/api/") && !url.pathname.slice(5).startsWith("_")) fn = url.pathname.slice(5);
        else if (url.pathname === "/" && url.searchParams.has("ready") && req.headers.accept?.includes("text/html")) fn = "share";
        if (!fn) return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${fn}.ts`);
          if (fn === "share") {
            // In dev the page is served by Vite, so transform its HTML rather than fetching /index.html.
            const html = await server.transformIndexHtml("/", (await import("node:fs")).readFileSync("index.html", "utf8"));
            const { parseShare, daysLeft } = await server.ssrLoadModule("/src/doomReady.ts");
            const share = parseShare(url.searchParams);
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            return res.end(share ? mod.withShareTags(html, url.origin, share.pct, share.essentials, daysLeft(share.region), share.region) : html);
          }
          const r: Response = await mod.GET(new Request(url));
          res.statusCode = r.status;
          r.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(Buffer.from(await r.arrayBuffer()));
        } catch (e) {
          next(e);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), seo(), vercelFunctionsInDev()],
  base: "./",
  build: { rollupOptions: { input: { main: "index.html", countdown: "countdown/index.html" } } },
});
