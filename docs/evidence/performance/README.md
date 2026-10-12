# Local reader timing

Recorded 2026-09-14T15:33:11.345Z. Run `node scripts/measure-reader.mjs` to regenerate.

12 alternating cover-opening and reverse turns after 2 warm-up turns; real Playwright click events; stage MutationObserver records input-to-settling; requestAnimationFrame samples while settling. No video recording. Headless browser scheduling and shared-machine load affect these observations.

- AMD Ryzen 5 5600H with Radeon Graphics         , 12 logical CPUs, 15 GiB RAM.
- Windows 10.0.26200, Chromium 153.0.8010.12, headless, 1440 × 1000, DPR 1.
- Cached input to settling: median 102.5 ms, maximum 142.2 ms.
- Settling duration median: 892.3 ms.
- rAF interval median / p95 / maximum: 66.6 / 83.4 / 83.4 ms. 151 of 164 sampled intervals exceeded 33 ms.
- Maximum active image element references in these samples: 6. This is not a heap-memory plateau measurement.

These measurements do not establish display-refresh-rate presentation, GPU frame timing, visual parity, a long-session heap plateau, Firefox performance, or real mobile-device performance.

The fixture combines original procedural illustrations/text and a credited NASA photograph on page 6. These alternating cover/spread timing samples use the illustrated pages 1–3.

Raw samples and settings are in chromium-windows.json.
