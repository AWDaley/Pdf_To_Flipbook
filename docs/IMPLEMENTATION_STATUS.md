# Implementation status — September 14, 2026

**Working application; release acceptance remains pending owner motion review and unavailable platform checks.** No visual-parity or guaranteed-frame-rate claim is made.

The complete v2 design was read before implementation. Initially this repository contained only that design, with no code or AGENTS.md. The implementation uses the proposed local stack and contains no account, database, cloud conversion, analytics, or hosted publishing service.

| Milestone | Implemented and observed | Gate |
| --- | --- | --- |
| M0 | Ten-page FIELDNOTES demo; original text/illustrations and credited NASA photography; patched StPageFlip adapter; soft cover, front/reverse artwork, draggable folds, cancellation, spread and single layout; normal-speed video and partial screenshots | Provisional engine; owner visual approval pending |
| M1 | Actual PDF.js child-process conversion, local fonts/CMaps/WASM, 320/1600/3200 px profiles, lossless option, cropped/rotated mixed pages, text/links/bookmarks, limits, cancellation, complete builds, filesystem revisions and locks | 15 real conversion/storage/export integration tests passed on Windows in the final serial run |
| M2 | Library, upload, animated preview, appearance drawer, live theme edits, explicit quality rebuild, save/reopen, reading mode | Production browser import/save/reopen/export smoke passed |
| M3 | Shared standalone reader, navigation, thumbnails, search, contents, links, zoom/pan, reduced-motion override, folder/ZIP export, Node static server | Independent Chromium export test passed with stopped creator instance and nonlocal requests blocked |
| M4 | Exact package/runtime pins, lockfile, native doctor, launchers, README, dependency notices and executable verification commands | Windows Chromium checked; Firefox launch fails on this host; Linux and real mobile devices untested |

## Evidence and commands

- `npm ci`, `npm run doctor`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run dev`, and `npm start` executed successfully on Windows 11 build 26200, Node 24.13.0, npm 11.6.2. Native canvas and Sharp rendered a real PDF during doctor.
- Final unit run: **59 passed**. Final integration run: **15 passed**, 159.04 seconds under the recorded host load. Includes malformed/password input, crop/rotation pixel checks, links/bookmarks, scanned text coverage, cancellation, failed replacement, foreign-file preservation, restart/revisions, and real local HTTP/filesystem operations.
- `npm run convert -- --input fixtures/pages-2.pdf --output data/cli-example` passed: two actual PDF pages rendered at all three profiles, with complete manifest/text assets. The output folder is preserved for inspection.
- Final browser run: **15/15 Chromium reader checks passed**, including slow assets, cancellation, ending drags, reduced motion and resize preservation; **1/1 Chromium independent export check passed**. All 16 Firefox checks failed before page creation with `spawn UNKNOWN`.
- `npm run verify` completed all seven subcommands: doctor, lint, build, unit and integration returned 0; reader and export returned 1 solely because Firefox could not launch. Full output: `artifacts/verification-final.log`. These are infrastructure failures, not skips or application passes. Overall verification remains nonzero.
- Demo: `/demo/manifest.json` and `/?demo=1`; source `public/demo/`, fixtures `fixtures/`, offline fixture generation `npm run fixtures`.
- Normal-speed motion and resting/partial screenshots: `docs/evidence/m0/chromium/`, including `video.webm`, `fold-quarter.png`, `fold-half.png`, `fold-three-quarter.png`, `partial-return-before.png`, and `narrow-fold.png`.
- Real creator screenshots: `docs/evidence/studio/`. A local browser imported `fixtures/fieldnotes.pdf`, saved title/background at revision 4 without changing build `1544525c-b9f8-4630-acf0-ff32685321c2`, reopened it, and exported successfully with the original PDF unchecked.
- Convenient real-project export: `artifacts/fieldnotes-example/` and `artifacts/fieldnotes-example.zip`. These are snapshots, not editable project backups. Run `node artifacts/fieldnotes-example/serve.mjs artifacts/fieldnotes-example 8080` and open `http://127.0.0.1:8080/`.
- Independent export evidence is under `test-results/export/`. Tests verify identical shared reader bundle bytes, animation, cover order, custom background, thumbnails, zoom, text search, contents and safe link destinations under `/shelf/fieldnotes/` with no external network access.

## Visual review and remaining limits

Both specified Heyzine references were opened in the Codex browser on Windows at 1280×720; the one-page page was also inspected at 390×844. Magazine cover, forward fold, reverse/drag interaction and resting spread were observed; screenshots are in `docs/evidence/reference/`. The one-page URL exposed slide-labelled controls, so it is not treated as proof of required fold behavior. No proprietary code or publication artwork is bundled.

Developer observations: local cover stays the same artwork size while translating into the spread; moving reverse artwork and folded clipping/shadows are visible; final pages align at the gutter. Recordings support review, but **owner approval is still pending**. Source audit/patch decisions are in `ENGINE_EVALUATION.md`.

Headless timing observations are in `docs/evidence/performance/`. The final 12-turn run measured 102.5 ms median input feedback (maximum 142.2 ms), 892.3 ms median settling, and 66.6 ms median rAF intervals (p95 83.4 ms). An earlier run measured 33.3 ms median rAF intervals; shared-host load varied substantially. These observations do **not** establish display-refresh-rate motion. Concurrent testing exhausted available host memory; an earlier final rerun was interrupted, then verification was repeated serially. Long-session heap plateau and real touch-device performance remain unmeasured. Two-finger contact is recognized as zoom rather than a turn; continuous distance-controlled pinch zoom is not implemented.

Firefox 155 and a diagnostic Firefox 153 binary both failed before application startup due to Windows side-by-side/mozglue activation. See `DEPENDENCY_FEASIBILITY.md`. Chromium mobile viewport/pointer tests are emulation, not real-device evidence.

Automatic approval review blocked cleanup of generated `data/test-service-e787c00c-6c20-4a72-9abd-dd4d117ed174` with a generic policy rejection. Cleanup was omitted; the saved project is preserved.
