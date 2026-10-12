/** Observed local timing; these results do not establish visual parity or real-device performance. */
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'docs', 'evidence', 'performance');
await fs.mkdir(output, { recursive: true });
const base = 'http://127.0.0.1:5187';
const server = spawn(process.execPath, [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--host', '127.0.0.1', '--port', '5187', '--strictPort'], { cwd: root, windowsHide: true, stdio: 'pipe' });
let serverLog = '';
server.stdout.on('data', chunk => { serverLog += chunk; }); server.stderr.on('data', chunk => { serverLog += chunk; });
let browser;
try {
  for (let i = 0; i < 100; i++) { try { if ((await fetch(base)).ok) break; } catch { /* Wait until the owned local preview is listening. */ } await delay(100); }
  if (server.exitCode !== null) throw new Error(`Local timing preview failed: ${serverLog}`);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  await page.goto(`${base}/?demo=1`);
  await page.locator('[data-testid="book-stage"][data-state="idle"]').waitFor();
  // The first two turns warm both visual assets and rendering code before cached samples.
  for (const label of ['Next page', 'Previous page']) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await page.locator('[data-testid="book-stage"][data-state="settling"]').waitFor();
    await page.locator('[data-testid="book-stage"][data-state="idle"]').waitFor();
  }
  const samples = [];
  for (let i = 0; i < 12; i++) {
    const label = i % 2 === 0 ? 'Next page' : 'Previous page';
    const sourceBefore = await page.getByTestId('book-stage').getAttribute('data-page');
    await page.evaluate(label => {
      const stage = document.querySelector('[data-testid="book-stage"]');
      const button = document.querySelector(`button[aria-label="${label}"]`);
      let input = 0, first = 0, previousFrame = 0, raf = 0, timeout = 0;
      const frameIntervals = [];
      let resolve;
      window.__readerTimingResult = new Promise(done => { resolve = done; });
      const observer = new MutationObserver(() => {
        if (stage.dataset.state === 'settling' && !first) first = performance.now();
        if (stage.dataset.state === 'idle' && first) {
          clearTimeout(timeout); cancelAnimationFrame(raf); observer.disconnect();
          resolve({ inputToSettlingMs: first - input, settlingDurationMs: performance.now() - first, frameIntervalsMs: frameIntervals, sourceAfter: stage.dataset.page, activeImageReferences: document.querySelectorAll('.paper-artwork[src]').length });
        }
      });
      observer.observe(stage, { attributes: true, attributeFilter: ['data-state'] });
      timeout = window.setTimeout(() => { cancelAnimationFrame(raf); observer.disconnect(); resolve({ error: `Timing sample did not settle; reader state ${stage.dataset.state}` }); }, 30_000);
      const frame = now => { if (first) { if (previousFrame) frameIntervals.push(now - previousFrame); previousFrame = now; } raf = requestAnimationFrame(frame); };
      button.addEventListener('click', () => { input = performance.now(); raf = requestAnimationFrame(frame); }, { once: true, capture: true });
    }, label);
    await page.getByRole('button', { name: label, exact: true }).click();
    const result = await page.evaluate(() => window.__readerTimingResult);
    if (result.error) throw new Error(result.error);
    samples.push({ number: i + 1, direction: label, sourceBefore, ...result });
  }
  const percentile = (values, p) => { const ordered = [...values].sort((a, b) => a - b); return ordered[Math.min(ordered.length - 1, Math.floor(ordered.length * p))] ?? null; };
  const intervals = samples.flatMap(sample => sample.frameIntervalsMs);
  const summary = {
    recordedAt: new Date().toISOString(),
    environment: { platform: process.platform, release: os.release(), arch: os.arch(), cpu: os.cpus()[0]?.model, logicalCpuCount: os.cpus().length, totalMemoryGiB: Math.round(os.totalmem() / 1024 ** 3), node: process.version, browser: await browser.version(), headless: true, viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, fixture: 'public/demo/manifest.json', settings: (await (await fetch(`${base}/demo/manifest.json`)).json()).settings },
    method: '12 alternating cover-opening and reverse turns after 2 warm-up turns; real Playwright click events; stage MutationObserver records input-to-settling; requestAnimationFrame samples while settling. No video recording. Headless browser scheduling and shared-machine load affect these observations.',
    metrics: { sampleCount: samples.length, inputToSettlingMedianMs: percentile(samples.map(s => s.inputToSettlingMs), .5), inputToSettlingMaxMs: Math.max(...samples.map(s => s.inputToSettlingMs)), settlingDurationMedianMs: percentile(samples.map(s => s.settlingDurationMs), .5), frameIntervalMedianMs: percentile(intervals, .5), frameIntervalP95Ms: percentile(intervals, .95), frameIntervalMaxMs: Math.max(...intervals), framesOver33ms: intervals.filter(value => value > 33).length, frameSampleCount: intervals.length, maximumActiveImageReferences: Math.max(...samples.map(s => s.activeImageReferences)) },
    limitations: ['These measurements do not establish display-refresh-rate presentation, GPU frame timing, visual parity, a long-session heap plateau, Firefox performance, or real mobile-device performance.', 'The fixture combines original procedural illustrations/text and a credited NASA photograph on page 6. These alternating cover/spread timing samples use the illustrated pages 1–3.'], samples,
  };
  await fs.writeFile(path.join(output, 'chromium-windows.json'), JSON.stringify(summary, null, 2));
  await fs.writeFile(path.join(output, 'README.md'), `# Local reader timing\n\nRecorded ${summary.recordedAt}. Run \`node scripts/measure-reader.mjs\` to regenerate.\n\n${summary.method}\n\n- ${summary.environment.cpu}, ${summary.environment.logicalCpuCount} logical CPUs, ${summary.environment.totalMemoryGiB} GiB RAM.\n- Windows ${summary.environment.release}, Chromium ${summary.environment.browser}, headless, 1440 × 1000, DPR 1.\n- Cached input to settling: median ${summary.metrics.inputToSettlingMedianMs?.toFixed(1)} ms, maximum ${summary.metrics.inputToSettlingMaxMs.toFixed(1)} ms.\n- Settling duration median: ${summary.metrics.settlingDurationMedianMs?.toFixed(1)} ms.\n- rAF interval median / p95 / maximum: ${summary.metrics.frameIntervalMedianMs?.toFixed(1)} / ${summary.metrics.frameIntervalP95Ms?.toFixed(1)} / ${summary.metrics.frameIntervalMaxMs.toFixed(1)} ms. ${summary.metrics.framesOver33ms} of ${summary.metrics.frameSampleCount} sampled intervals exceeded 33 ms.\n- Maximum active image element references in these samples: ${summary.metrics.maximumActiveImageReferences}. This is not a heap-memory plateau measurement.\n\n${summary.limitations.join('\n\n')}\n\nRaw samples and settings are in chromium-windows.json.\n`);
  console.log(JSON.stringify(summary.metrics, null, 2));
} finally { await browser?.close(); server.kill(); }
