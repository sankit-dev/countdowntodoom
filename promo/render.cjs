// Renders promo.html frame by frame and encodes an MP4 ready for X.
//
//   node promo/render.cjs                 # countdown starts from "now"
//   node promo/render.cjs 2026-12-01T18:00 # countdown as of a given moment
//
// Needs Playwright (with Chromium) and ffmpeg. Output: promo/out/road-to-doomsday.mp4
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const FPS = 30;
const dir = __dirname;
const frames = path.join(dir, "out", "frames");
const out = path.join(dir, "out", "road-to-doomsday.mp4");

(async () => {
  fs.rmSync(frames, { recursive: true, force: true });
  fs.mkdirSync(frames, { recursive: true });
  const at = process.argv[2] ? `?at=${encodeURIComponent(process.argv[2])}` : "";
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
  await page.goto("file://" + path.join(dir, "promo.html") + at);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500); // let the footage preload
  const total = await page.evaluate(() => window.DURATION * 30);
  for (let i = 0; i < total; i++) {
    await page.evaluate((t) => window.render(t), i / FPS);
    await page.screenshot({ path: path.join(frames, `f_${String(i).padStart(4, "0")}.jpg`), type: "jpeg", quality: 92 });
    if (i % 60 === 0) process.stdout.write(`frame ${i}/${total}\n`);
  }
  await browser.close();
  execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(FPS), "-i", path.join(frames, "f_%04d.jpg"),
    "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100", "-shortest",
    "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", out], { stdio: "inherit" });
  console.log("wrote", out);
})();
