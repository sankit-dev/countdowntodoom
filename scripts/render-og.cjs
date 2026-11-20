// Renders promo/og.html to public/og.jpg (the link-preview image).
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto("file://" + path.join(__dirname, "og.html"));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(__dirname, "..", "public", "og.jpg"), type: "jpeg", quality: 88 });
  await b.close();
  console.log("wrote public/og.jpg");
})();
