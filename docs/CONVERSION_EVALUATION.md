# Local conversion implementation and checks

Recorded September 14, 2026 on Windows 10.0.26200 x64, AMD Ryzen 5 5600H (12 logical processors), approximately 15.4 GiB RAM, Node 24.13.0. Linux and real mobile hardware were not tested by this audit.

`convertPdf({ input, output, title?, quality?, settings?, limits?, onProgress?, signal? })` in `packages/converter/index.ts` returns a validated portable manifest. The output must be a **new directory**. The service owns serial conversion scheduling and publication of the current build pointer. The converter owns only its newly created output and removes it after failure or cancellation.

PDF.js 6.3.289 renders one page at a time through its Node canvas factory, backed by `@napi-rs/canvas` 1.0.9. Sharp 0.35.4 derives WebP images at 320, 1,600, and 3,200 pixels along the longest edge. The lossless setting uses actual lossless WebP encoding. Canvas/page resources are released after each source page. The original PDF is not copied into the conversion output.

The installed PDF.js API determines displayed crop, rotation, and proportions through `getViewport`. In version 6, rectangle conversion uses two `convertToViewportPoint` calls; `convertToViewportRectangle` is absent. Links use these transformed coordinates, clipped to the displayed artwork, and support only validated web/plain-mailto links or valid internal destinations. Outlines are flattened in document order. Extracted text is stored as plain JSON. Pages without extracted text have a null manifest text path so search coverage does not count scanned pages. No scripting or embedded launch APIs are invoked.

Local resource paths include CMaps, standard fonts, WASM codecs, and ICC profiles, with forward slashes and a trailing slash on Windows. PDF.js's Node path disables its browser-only synchronous ICC/WASM color-management route; color-critical print proofing was not assessed. Rendering fidelity is otherwise delegated to PDF.js, including its supported annotation appearances. Password-protected PDFs and dynamic XFA forms are rejected. OCR and automatic splitting of existing landscape spreads are outside this implementation.

The child process has a 1,536 MiB V8 heap ceiling and an external per-stage/page watchdog. Defaults enforce a 100 MiB input cap, 300 source pages, 16 million output pixels per page, 60 seconds per page/stage, 2 GiB of output, and 256 MiB of free disk reserve. These do not constitute an OS security sandbox or a bound on every native decoder allocation. `maxImageSize` is deliberately not used to silently omit large embedded images. A failed render rejects the build; no blank substitute page is generated.

## Executed checks

- `npm run test:integration -- packages/converter/converter.integration.test.ts`: 9 tests passed in 44.37 seconds on the recorded host at the initial converter milestone. The suite renders actual PDFs and writes real files in a dedicated temporary directory.
- Fixtures: two-page original magazine; mixed dimensions and 90/270-degree rotations/crops; safe/unsafe links and bookmarks; image-only PDF; malformed PDF; AES-256 password-required PDF; ten-page magazine for mid-build cancellation.
- Assertions cover profile dimensions, nonblank artwork statistics, actual colored-pixel positions after crop/rotation, transformed link rectangles, destination order, lossless bitstream, extracted text, unsupported inputs, all configured limits, real watchdog termination, cancellation after a completed page, preservation of the prior complete output, and successful CLI replacement.
- `npm run convert -- --input fixtures/pages-2.pdf --output data/converter-smoke --title "Native conversion sample"`: succeeded on Windows in approximately 5.56 seconds, replacing an earlier one-page conversion. Output is retained at `data/converter-smoke`.
- Whole-project `npm run typecheck` passed at the initial converter milestone. Later integrated runs are tracked separately.
- After the scan-coverage and unrelated-file preservation improvements, a parallel suite rerun was stopped when the host ran low on memory. Final sequential rerun results belong in the overall implementation status; the initial 9-test pass must not be presented as a final pass of those later edits.

The CLI stages beside its explicit output folder. It replaces only a directory with a valid generated manifest and expected conversion files; unrelated owner files make it refuse replacement. It retains the previous directory until the new complete conversion is ready and restores it if installation fails. Windows Vite watchers initially prevented directory renames; excluding generated data and test directories resolved the failure. Bounded rename retries cover transient file-scanner handles.

These are conversion and filesystem results. They do not establish animation quality, browser export parity, a guaranteed conversion speed, or owner visual approval.

Primary implementation references: [Mozilla's Node rendering example](https://github.com/mozilla/pdf.js/blob/master/examples/node/pdf2png/pdf2png.mjs), [PDFPageProxy API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFPageProxy.html), [Sharp output options](https://sharp.pixelplumbing.com/api-output/). Version-specific differences above were verified in the installed package source and types.
