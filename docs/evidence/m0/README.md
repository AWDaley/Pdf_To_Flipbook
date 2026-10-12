# M0 visual evidence

Captured on Windows, September 14, 2026. The selected candidate is patched `page-flip` 2.0.7 in HTML mode with flexible pages. **Owner visual approval and exact reference parity remain pending.** Successful interaction tests do not approve appearance.

## Local capture

Run `npm run test:reader -- --project chromium`. The `M0 normal-speed cover, forward/reverse folds, partial return, and narrow turn` test records a real browser video and screenshots using deterministic pointer paths. Successful evidence is copied from its test-results folder into `docs/evidence/m0/chromium/` so subsequent test runs do not erase it.

Desktop capture is 1280 × 720; narrow capture is 390 × 844. Device scale is 1. The reader uses the magazine preset, automatic layout, a flexible cover alone, background `#e9e6df`, dark toolbar, configured turn duration 850 ms, shadow strength 0.32, page edges, and explicit full motion.

The ten-page **FIELDNOTES / A study in quiet places** fixture combines original writing, original forest/botanical/architectural illustrations, distinctive source-page numbers, and a credited NASA astronaut photograph on page 6. Its [photo source and usage record](../../../fixtures/assets/README.md) is checked in; demo generation and reading require no network.

| Evidence | What it records |
| --- | --- |
| `chromium/video.webm` | Normal-speed cover opening, forward controlled fold, reverse turn, partial return, narrow turn, and photographic spread; screenshot pauses are included. |
| `chromium/cover.png` | Centered single flexible cover, source page 1. |
| `chromium/cover-opening.png` | Animated opening toward pages 2–3. |
| `chromium/resting-spread.png` | Aligned source pages 2–3 with no arbitrary binding gap. |
| `chromium/fold-quarter.png` | Pointer moved 25% across the spread's width. |
| `chromium/fold-half.png` | Pointer moved 50% across the spread's width. |
| `chromium/fold-three-quarter.png` | Pointer moved 75% across the spread's width. |
| `chromium/reverse-fold.png` | Previous-page animation from pages 4–5 toward pages 2–3. |
| `chromium/partial-return-before.png` | A new partial forward drag after a reverse turn. |
| `chromium/partial-return-after.png` | Released drag returned to committed pages 2–3. |
| `chromium/narrow-fold.png` | Single-page animated turn from source page 2 to source page 3. |
| `chromium/narrow-rest.png` | Crisp source page 3 after the narrow turn. |
| `chromium/photographic-spread.png` | Pages 6–7, including the NASA photograph and its visible credit. |

The quarter/half/three-quarter names describe deterministic pointer positions; they do not claim exact normalized geometry progress or an undocumented animation-seek API. The forward screenshots show source page 3 folding, the correct source page 4 reverse, and source page 5 revealed beneath. A human still needs to judge the moving paper's flexibility and compare full motion.

## Reference comparison

The [official Heyzine magazine example](https://heyzine.com/flip-book/dce36e099f.html) and [official one-page example](https://heyzine.com/flip-book/7bf964fc45.html) were opened in the Codex in-app browser on Windows at 1280 × 720. The magazine cover, opening fold, and resting spread were observed, and forward/reverse pointer paths were exercised. A partially opened sheet showed reverse text, revealed artwork, and a fold shadow. The one-page example was also captured at 390 × 844; its slide-labeled controls alone do not establish the required fold effect.

Reference screenshots are in `docs/evidence/reference/`. No normal-speed reference recording was captured. The local reader shows the required computed flexible fold and correct observed print surfaces; these observations are not a claim of exact Heyzine parity. Reference publication artwork and proprietary player files are not bundled in the product.

## Functional and performance limits

The Chromium suite covers source order, single-page forward/reverse navigation, responsive preservation, one/two/odd/even endings, page entry, thumbnails, bookmarks, search, zoom/pan, focused shortcuts, repeated clicks, bounded active image elements, link priority, missing assets/retry, reduced motion, pointer cancellation, resize during a turn, and slow destination loading. See the current test output for the final run's count.

Firefox was attempted on Windows but failed before browser initialization with `spawn UNKNOWN`; Windows SideBySide activation errors identify its `mozglue` assembly. These are unexecuted Firefox regressions, not passing tests. Diagnosis is recorded in `docs/DEPENDENCY_FEASIBILITY.md`.

Timing samples and hardware are recorded separately in `docs/evidence/performance/`. They do not establish 60 FPS, GPU presentation timing, a long-session heap plateau, real mobile-device performance, or owner acceptance. Linux and real mobile hardware remain unchecked in this evidence.
