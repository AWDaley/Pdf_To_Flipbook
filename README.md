# Tervoro Digital Publishing

A local, personal PDF-to-flipbook application for Windows. Import a PDF, turn and drag animated pages, adjust the appearance, save the project, and export the same reader as a standalone HTML file, HTML folder, or ZIP.

**Visual acceptance remains open.** The StPageFlip candidate has recorded motion and functional checks; owner approval of the magazine effect is pending. Firefox cannot currently launch on the tested Windows host. See [implementation status](docs/IMPLEMENTATION_STATUS.md), [engine evaluation](docs/ENGINE_EVALUATION.md), and [Windows feasibility](docs/DEPENDENCY_FEASIBILITY.md) for the current evidence and remaining gates.

## Windows setup

Use **Node.js 24.13.0** and **npm 11.6.2**, as pinned in `package.json`. Open a terminal in this repository, then run:

```powershell
npm ci
npm run doctor
npm run build
npm start
```

If PowerShell blocks its `npm.ps1` shim, use `npm.cmd` for these commands. Dependencies and native rendering resources download during installation. After installation, conversion, reading, saving, and HTML export work locally without an internet connection.

Open the **complete local link printed in the terminal**. It connects the browser to that running local session; a service restart prints a fresh link. The default port is 4173. Leave the terminal open while using the studio and press **Ctrl+C** to stop it. No account is required.

For normal use, double-click **`start-paperbound.cmd`**. It rebuilds the application, starts the local service, and opens the browser. Create a Windows shortcut to this file if desired. The launcher does not install dependencies automatically.

For development with live reload:

```powershell
npm run dev
```

The same terminal prints the local session link. `npm run dev:ui` is the separate frontend/demo server used by reader tests; use `npm run dev` for the complete creator workflow.

The scripts also support Node on other platforms: `sh start-paperbound.sh`, or `node scripts/launch.mjs --no-open` to open the printed link yourself. Linux and macOS operation have not been verified on this Windows host.

## Use the studio

1. Choose **New flipbook** and select a PDF. Conversion renders its original page artwork locally, one page at a time.
2. Use the arrows or focus the book and press **← / →**. Drag a corner to control a fold. Page entry, thumbnails, contents, and extracted-text search provide other navigation.
3. Use **Zoom** to inspect and pan. **Reset view** returns to fit; page navigation restores fit before turning. Narrow layouts use animated single pages.
4. Open **Appearance** to change the title, background image/color, controls, cover layout, edges, shadow strength, duration, and motion preference. **Save project** preserves those settings. Quality changes require **Rebuild page images**.
5. Choose **Read** to hide creator controls. Return to the library to reopen a saved project.
6. Choose **Export**, select whether to include the original PDF, and create the HTML folder and ZIP. The original PDF is excluded by default.

One-page documents disable impossible turns. Source pages remain one-based; balancing blank surfaces do not increase the document count. Mixed page sizes keep their proportions within consistent paper slots. Existing landscape spreads remain single logical PDF pages.

Scanned pages render normally but are not searchable without OCR. Password-protected PDFs and dynamic XFA forms are unsupported. Rendering errors stop the replacement build, preserving the last complete book. Cancel a conversion from its progress bar; interrupted work can be retried manually.

## Projects and export

Editable projects live in `data/projects/<project-id>/`, including the source PDF, validated project settings, complete builds, and exports. Back up this entire directory to preserve editing and reconversion. An exported HTML folder is a reading snapshot; later project edits do not update a copied folder or ZIP.

The easiest way to share an export is to unzip it and double-click `index.html`. It opens in Chrome or Edge with no install, terminal, creator service, or internet connection. The exported folder also works from an ordinary **HTTP static server** when you want to publish it or open it on another device. For a quick local server, open a terminal in the export folder and use its included standalone Node server:

```powershell
node serve.mjs . 8080
```

Open `http://127.0.0.1:8080/`. This server has no npm dependencies and runs with the creator stopped. Any other static server is also suitable. External document links require a network only when followed. Exporting does not publish a public URL.

## Command-line conversion

```powershell
npm run convert -- --input fixtures/fieldnotes.pdf --output data/manual-conversion
npm run convert -- --input fixtures/fine-text.pdf --output data/fine-type --quality lossless
```

The converter CLI writes a manifest, rendered pages, thumbnails, and text assets. Use the studio **Export** action to include the animated reader. The CLI stages replacements and accepts an existing output only when it contains a valid generated manifest and expected conversion files. It refuses to discard unrelated files in that directory.

Default conversion limits are 100 MiB input, 300 pages, 16 million output pixels per page, 60 seconds per page/stage, 2 GiB output, and a 256 MiB free-disk reserve. To configure limits for a service run in PowerShell:

```powershell
$env:PAPERBOUND_LIMITS = '{"maxInputBytes":157286400,"pageTimeoutMs":120000}'
$env:PAPERBOUND_PORT = '4173'
npm start
```

Only the supplied fields change. Remove these environment variables or open a new terminal to restore defaults. The conversion process provides isolation and cancellation; it is not an operating-system security sandbox. [Conversion details and actual checks](docs/CONVERSION_EVALUATION.md).

## Verification

Install browser test binaries once, while connected:

```powershell
npx playwright install chromium firefox
```

Then run the relevant commands:

| Command | What it checks |
| --- | --- |
| `npm ci` | Reproducible installation and pinned page-flip patch |
| `npm run doctor` | Runtime versions, local resources, native PDF/canvas/WebP rendering, disk capacity |
| `npm run lint` | Static code checks |
| `npm run typecheck` | TypeScript contracts |
| `npm run build` | Creator and shared standalone reader bundles |
| `npm run test:unit` | Schemas and logical page mapping |
| `npm run test:integration` | Real conversion, project storage, cancellation, replacement, local service, export assembly |
| `npm run test:reader` | Chromium and Firefox reader interactions, screenshots, recordings |
| `npm run test:export` | Independently served exports and offline reader behavior |
| `npm run verify` | Runs every automated check in sequence and returns failure if any command fails |

Chromium-only diagnostic runs are available with `npm run test:reader -- --project=chromium` and `npm run test:export -- --project=chromium`. These do not constitute a Firefox pass. The configured Firefox binary currently fails before application code runs with a Windows side-by-side/`mozglue` assembly error. Full verification remains unsuccessful while that browser cannot launch; it has not been silently skipped.

The sample reader is available at `/?demo=1` while the application runs. Its ten-page book contains original text and procedural illustration. Rights-cleared PDF fixtures live in `fixtures/`; regenerate them with `npm run fixtures`. The password-required fixture has a separate reproducible generator described there.

Evidence locations:

- `docs/evidence/reference/`: inspected reference screenshots.
- `docs/evidence/m0/`: prototype resting/fold states and normal-speed motion.
- `docs/evidence/performance/`: measured host, browser, timing samples, and their limits.
- `test-results/` and `playwright-report/`: latest automated browser artifacts.
- `data/converter-smoke/`: real two-page conversion example from the CLI check.

Recorded browser emulation is not real-device testing. Smoothness, memory plateau, exact reference fidelity, Linux support, and owner visual approval must be judged from their own evidence rather than inferred from unit-test counts.

## Dependencies and notices

The application uses React/TypeScript/Vite, Fastify, PDF.js, native canvas, Sharp, and StPageFlip behind the shared reader adapter. Data is stored as project folders and JSON. The local service binds to loopback, checks requests, constrains project paths, and serializes conversions.

`THIRD_PARTY_NOTICES.txt` inventories the installed runtime and development packages and preserves their available license/notice files, including PDF rendering resources. Regenerate it after dependency changes with `node scripts/generate-notices.mjs`. Each exported reader has its own smaller notice file for the dependencies it actually bundles. No reference player assets are shipped.
#   P d f _ T o _ F l i p b o o k  
 