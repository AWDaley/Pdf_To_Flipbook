# Dependency and Windows feasibility record

Recorded on September 14, 2026. This records runtime feasibility; it does not approve the animation's visual quality.

## Tested host

- Windows (`win32`, x64), OS build `10.0.26200`.
- AMD Ryzen 5 5600H with Radeon Graphics, 12 logical processors, 15.4 GiB RAM.
- Node `24.13.0`, npm `11.6.2`. Both are pinned in `package.json`; Node is also recorded in `.nvmrc` and `.node-version`.
- About 38 GiB free disk space at the initial native smoke check.

## Version selection

Direct dependencies use exact versions, with `package-lock.json` locking transitives. Registry package metadata and installed source were checked for compatibility. The installed PDF.js `6.3.289` declares optional canvas `^1.0.0`; this project explicitly pins `@napi-rs/canvas` `1.0.9`. Sharp `0.35.4` loads libvips `8.18.6` successfully on this machine.

Vite `8.3.0`, React `19.3.0`, Fastify `5.12.4`, Vitest `5.0.0`, and Playwright `1.63.0` accept the pinned Node runtime. TypeScript `6.0.3` was selected because the installed typescript-eslint `8.70.0` supports TypeScript below `6.1`; the latest TypeScript `7.0.2` does not satisfy that peer range. This is a verified dependency compatibility decision.

Archiver `8.0.0` uses ESM named exports, including `ZipArchive`; it does not expose the historical default `archiver('zip')` factory. StPageFlip remains pinned to `2.0.7`; its idempotent application patch runs after installation. See [the patch](../scripts/patch-page-flip.mjs) and engine decision record.

## Actual setup and smoke results

- `npm install --ignore-scripts`: succeeded, 256 packages initially installed; audit reported zero vulnerabilities.
- `npm rebuild`: succeeded, including native package lifecycle and StPageFlip patch.
- Clean `npm ci`: succeeded after stopping the owned creator/dev servers; 256 packages installed in 27 seconds, both StPageFlip bundles patched by postinstall, zero audit vulnerabilities. Subsequent doctor and full studio/shared-reader build passed.
- `npm run doctor`: passed after fixing Windows resource paths and PDF.js cleanup. It creates a real in-memory PDF containing text and a colored rectangle, renders through PDF.js's Node canvas factory, encodes WebP through Sharp, and checks image dimensions and nonempty ink. Result: 144 × 192 WebP, 914 bytes.
- `npm run test:unit`: 35 tests passed at the initial foundation verification. Later test additions have their own results.
- `npx playwright install chromium firefox`: downloaded Chromium `153.0.8010.12`, Firefox `155.0`, and recording support.
- Chromium launch and DOM smoke: passed on Windows.
- Firefox launch: **blocked before application code executes**. Windows reports an incorrect side-by-side configuration; Application Event Log provider `SideBySide` says dependent assembly `mozglue`, version `1.0.0.0`, could not be found. The downloaded directory does contain `mozglue.dll`. An isolated earlier Playwright `1.62.1` Firefox `153.0` download failed in the same way. The repository remains pinned to `1.63.0`; no system DLL or registry modifications were made.

Browser executable presence in doctor output confirms installation only. It must not be interpreted as passing the reader suite. Chromium and Firefox remain configured in the browser suites so unavailable Firefox does not become a hidden skip.

## Windows-specific integration findings

PDF.js resource directory strings must end with a forward slash even on Windows. Normalize backslashes and append `/`; use the installed `cmaps`, `standard_fonts`, and `wasm` directories. A trailing Windows backslash produces an explicit factory URL error.

In installed PDF.js `6.3.289`, cleanup is owned by the loading task: use `await loadingTask.destroy()`. `PDFDocumentProxy.destroy()` is absent. The native smoke uses these verified APIs.

## Primary references checked

- [Vite installation and runtime requirements](https://vite.dev/guide/)
- [Mozilla PDF.js getting started](https://mozilla.github.io/pdf.js/getting_started/)
- [Mozilla's Node render example](https://github.com/mozilla/pdf.js/blob/master/examples/node/pdf2png/pdf2png.mjs)
- [Sharp installation and prebuilt native support](https://sharp.pixelplumbing.com/install/)
- [Playwright browser installation](https://playwright.dev/docs/browsers)
- [Playwright test configuration](https://playwright.dev/docs/test-configuration)

No Linux runtime, real mobile device, frame-rate benchmark, or owner visual approval is established by this record.
