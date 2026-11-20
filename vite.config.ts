import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { seo } from "./seo";

export default defineConfig({
  plugins: [react(), seo()],
  base: "./",
  build: { rollupOptions: { input: { main: "index.html", countdown: "countdown/index.html" } } },
});
