# Personal PDF-to-Flipbook Studio
## Revised design: mandatory Heyzine-style page turning

**Version:** 2.0 — replaces the previous design for this project  
**Date:** September 14, 2026  
**Audience:** Owner, developer, and coding agent  
**Status:** Proposed implementation specification. No implementation, visual-parity test, or performance benchmark is claimed by this document.

> Build a personal tool that turns my PDFs into attractive, realistic, animated flipbooks resembling Heyzine's magazine-style reader. Page-turn animation is the central feature and a release requirement—not an optional enhancement to a PDF viewer.

## 1. Product brief and scope correction

The owner's requirements are **personal use**, **required page-turn animations**, and **a visual experience like Heyzine flipbooks**. Optimize for an appealing reader and a simple import-to-export workflow, not operating a publishing business.

The proposed delivery is a Windows-first local application opened in a browser, with a lightweight local Node.js service for conversion and project files. Keep the development scripts cross-platform and test Linux as a secondary environment. A desktop shortcut can launch the service and open the interface. A packaged native desktop shell is not required for the first release.

The normal workflow is:

```text
Choose a PDF -> Convert locally -> Open animated flipbook
                          -> Adjust appearance -> Save project
                                               -> Export HTML folder or ZIP
```

The application needs no account, subscription, paid conversion API, cloud storage, language model, Docker, PostgreSQL, Redis, or dedicated GPU. After dependencies and rendering resources are installed, importing, converting, viewing, and exporting must work without internet access. This does not mean browser graphics acceleration is prohibited.

### Changes from the previous specification

| Previous emphasis | Replacement |
|---|---|
| Publishing application with an administrator | Personal creator and reader with no login screen |
| Optional animation among several reading modes | Animated flipbook is the required normal experience |
| Mobile single/scroll fallback | Mobile single-page **animated flipping** |
| Database, durable queue, sessions, audit records | Project folders, validated JSON, one conversion at a time |
| Draft approval, immutable releases, rollback system | Save a project; export a complete snapshot |
| Hosted production hardening milestone | Local reliability and standalone export verification |
| Broad platform features first | Visual page-turn proof first |

The earlier specification's optional-animation language, scrolling fallback, publishing lifecycle, database requirements, and hosted-deployment gates no longer apply. Retain the useful ideas of faithful conversion, bounded page loading, safe local file handling, and an independent exported reader.

## 2. Reference target and fidelity boundary

Use **Heyzine's magazine flipbook** as the default visual and interaction reference. Heyzine documents several distinct effects, including magazine, book, one-page flip, slider, and cover flow; this project targets its flipping experience, not the slider or cover-flow effects. [R1]

Reference locations for implementation review:

- Official magazine example: `https://heyzine.com/flip-book/dce36e099f.html`
- Official one-page example: `https://heyzine.com/flip-book/7bf964fc45.html`
- Official examples and feature descriptions: `https://heyzine.com/`

The first two examples were reached through Heyzine's own homepage on the research date. They are reference locations, not bundled assets. This specification does not claim to have measured their animation geometry or reproduced their proprietary renderer.

**Interpret “like Heyzine” as visual and interaction fidelity:** convincing paper folding, a clean centered book, coordinated shadows, smooth input, and unobtrusive controls. Use original branding and licensed dependencies. Do not copy Heyzine's proprietary player files, logos, icons, or publication artwork into the product.

During implementation, record the selected reference, viewport, date, and relevant settings. Capture its resting spread, cover, partially turned page, and narrow-screen presentation where browser access permits. Use those states to review the local implementation. Do not upload the owner's private PDFs to a third party to obtain comparison material. Use an owner-approved non-sensitive fixture for any same-document comparison.

A static screenshot alone cannot establish animation parity. Review a short recording and interactive drag behavior as well. When the reference is inaccessible, continue implementing the specified behaviors but label visual comparison as pending; do not claim a match that was not checked.

## 3. Required visual behavior

### 3.1 Book at rest

The flipbook is the dominant object in the reading area. Show a centered two-page spread on sufficiently wide screens, with clean paper edges, a subtle center gutter, and restrained depth and contact shadows. The background should be visually quiet and customizable.

Pages meet at the binding without an arbitrary gap. The resting artwork must remain rectangular and legible. Do not use heavy gradients that obscure text near the spine, permanently warp the original layout, or make a thin magazine resemble a thick plastic slab.

Show the first page alone as a centered cover by default. Opening it should transition smoothly to the spread without resizing the page artwork or snapping the book sideways. Keep cover positioning independent of material: the default magazine cover is flexible, not automatically a rigid board.

Optional hardcover styling can be added after the magazine reference passes review. It must not substitute for flexible interior pages.

### 3.2 Page in motion

A turn must resemble a sheet folding or curling around the binding. Its shape, visible front/back surfaces, overlap, highlights, and shadows should change together as it moves.

Required outcomes:

| Property | Acceptance requirement |
|---|---|
| Deformation | A visible fold/curl or equivalent convincing flexible-paper effect—not only a rigid rectangle rotation |
| Content | Correct front and reverse artwork; no unrelated page, duplicated print, unintended mirroring, or blank flash |
| Shadows | Moving fold and cast shadows track progress and direction; no detached or suddenly appearing dark bands |
| Binding | Page motion is anchored consistently to the book spine |
| Pointer interaction | The lifted corner follows the drag continuously rather than merely starting a canned animation |
| Release | A partial drag either completes naturally or returns to its original position |
| Layering | Moving pages pass above and below the correct surfaces without clipping or z-order flashes |
| Completion | The page settles into an aligned, crisp spread without jumping or changing scale |
| Reverse turns | Previous-page motion is as polished as forward motion |

A left/right image slider, fade, GIF/video of a page turn, CSS card flip, or ordinary embedded PDF viewer **does not satisfy this requirement**. A sophisticated renderer is not automatically acceptable either; the visible result must pass review.

### 3.3 Reader controls

Place compact previous/next arrows beside the book and a restrained toolbar below or over the background—not over document text. Include page position, page entry, thumbnails, zoom/reset, and fullscreen when supported. Search and contents belong in a collapsible panel when available.

The creator's settings drawer disappears in reading and export modes. Preserve a clean appearance without account controls, pricing prompts, analytics panels, or a persistent administration sidebar.

Use consistent icon sizes, visible hover/focus states, and comfortable touch targets. Controls remain available to keyboard users even when pointer-idle styling makes them less prominent.

## 4. Interaction and page-mapping rules

### Desktop

Clicking a navigation arrow or using a reader-focused arrow key triggers an animated page turn. Dragging an outer page corner starts a controllable fold. A small pointer-hover corner hint is permitted; it must not repeatedly trigger animations by itself.

Links take priority over page-turn hit regions. Do not intercept text entry in page/search inputs. Do not bind shortcuts globally across the creator interface.

### Narrow screens and touch

Switch from a spread to a single-page **flip layout**, preserving animated page turning. Do not silently replace the product with vertical scrolling or a slide carousel on mobile.

Support horizontal touch gestures with a deliberate movement threshold so ordinary taps remain taps. Distinguish flipping from pinch zoom and vertical scrolling outside an embedded viewer. Cancelled pointers and interrupted gestures must leave a valid page state.

Layout changes preserve the reader's logical source page, not an animation engine's internal spread index.

### Page order

Use one-based source-page numbers throughout the application and manifest. Convert to a dependency's indices only inside its adapter.

In cover-alone spread layout, the opening sequence is cover page 1, then pages 2–3, then pages 4–5. A physical sheet's reverse side uses the appropriate next source page; it is not a mirrored copy of its front.

Any blank surfaces needed to balance the book are virtual slots. They do not become search results or increase the source page count. Test one-page documents, two-page documents, and both odd and even counts. A one-page document has no next source page: disable next/previous rather than invent content merely to animate something.

Single-page layout advances through every source page in order with an animation. Its internal surface mapping may differ from the two-page renderer; it must not skip every second PDF page.

### Mixed dimensions and existing spreads

Preserve the proportions of every PDF page. Use a consistent animated paper slot with centered, contained artwork and neutral margins for mixed-size documents. Overlay coordinates must follow the artwork rectangle, not the surrounding margins.

Do not switch mixed-size PDFs to an unanimated reader. A landscape PDF page remains one logical page. Automatic splitting of already-designed spreads is outside the first release; warn the owner and recommend a single-page export from their authoring tool when applicable.

### Zoom

Zoom is an inspection state of the same flipbook. Use higher-resolution assets, support panning, and provide an obvious reset. During zoom, dragging pans rather than folds paper. Navigation controls first restore the fit view, then perform the requested animated turn. Do not interpret a pinch gesture as a page turn.

### Motion preferences

Normal reading uses full animation by default. A reader-requested reduced-motion setting, including an operating-system preference with an explicit override, may suppress decorative motion. This is an accessibility exception, not a substitute implementation or a way to pass the animation gate. W3C documents user control over interaction-triggered animation. [R7]

A renderer failure must produce a clear error and retry option. Do not silently report success while showing a static PDF instead.

## 5. Technology and system design

### Proposed stack

| Component | Choice | Role |
|---|---|---|
| Creator UI | React, TypeScript, Vite | Local library, import, preview, appearance settings |
| Local service | Node.js and Fastify | Loopback-only file operations and conversion orchestration |
| PDF conversion | `pdfjs-dist` with its compatible Node canvas integration | Render original page artwork; extract text and supported navigation |
| Image encoding | `sharp` | Reading images, thumbnails, zoom variants |
| Reader | TypeScript module with its own DOM root | Shared by creator preview and exported flipbooks |
| Animation candidate | `page-flip` / StPageFlip behind an adapter | First implementation to evaluate against the visual target |
| Project storage | Filesystem plus validated JSON | Source PDF, settings, generated assets, conversion status |
| Verification | Vitest, Playwright, recordings, manual visual review | Conversion correctness, interactions, appearance, exports |

Pin compatible package and runtime versions after a small Windows-first feasibility check. Do not describe a dependency as suitable solely because its README uses the word “realistic.” PDF.js supplies a Node rendering example; Sharp supplies image-output controls, including WebP. [R4, R5]

```text
Local creator UI
       |
Loopback-only service ---- Project folders / JSON
       |
One conversion child process
       |
PDF -> page images + thumbnails + text + safe links
       |
       +---- Shared animated reader: local preview
       |
       +---- Export: same reader + settings + page assets
```

React owns the surrounding interface, not the flip library's internal page DOM. Do not remount the animated book on every setting edit or page change. The reader must not contain dependencies on creator-only routes.

## 6. Animation-engine decision and implementation rules

### Evaluate StPageFlip first, without guaranteeing parity

StPageFlip documents image/HTML input, soft and hard pages in HTML mode, portrait/spread layouts, shadows, and animated navigation. Its repository uses an MIT license. These make it a reasonable first candidate, not proof of equivalence to Heyzine. [R2, R3]

Start with HTML page containers holding prepared images, flexible interior pages, and the selected surrounding visual treatment. Pin and test the dependency's actual implementation rather than relying on undocumented behavior.

Important integration checks from its documentation:

- Animated operations (`flip`, `flipNext`, `flipPrev`) differ from immediate operations (`turnToPage` and related methods). Ordinary next/previous actions must use the animated path. [R3]
- Its documented `showCover` option combines cover presentation with hard-page behavior. Keep the product's cover positioning and material settings independent; verify, adapt, or patch the integration instead of unintentionally making magazine covers rigid. [R3]
- Portrait mode can clone HTML page elements. Keep interactive overlays outside animated/cloned page nodes, and verify duplicate DOM, cached-image references, and event cleanup. [R2]

If the candidate produces folds that are visibly too flat, discontinuous, or unlike the selected reference, first tune its supported behavior and assess a small, documented patch. Do not compensate for inadequate deformation by adding more decorative shadows.

If the geometry remains insufficient, replace the adapter with a renderer capable of the required deformation. A custom WebGL mesh-based renderer is one possible implementation direction: it would need double-sided page textures, a controllable curl surface, appropriate lighting, and correct page-order handling. This is a conditional engineering direction, not a finished algorithm or a claim about Heyzine's internal technology. No particular graphics API is mandatory; the result is.

**Gate:** Demonstrate and review the visual prototype before committing to the full creator application. Engine selection stays provisional until that gate passes. A rejected prototype is an engine-selection issue, not permission to downgrade the product to static pages.

### Adapter boundary

Expose a small application-owned contract. The following is a proposed interface, not the third-party library's API:

```ts
export type BookLayout = "spread" | "single";
export type ReaderState =
  | "loading" | "idle" | "dragging" | "settling"
  | "zoomed" | "error";

export interface FlipEngine {
  mount(root: HTMLElement, manifest: FlipbookManifest): Promise<void>;
  next(): Promise<void>;
  previous(): Promise<void>;
  goTo(sourcePage: number): Promise<void>;
  setLayout(layout: BookLayout): Promise<void>;
  updateAppearance(settings: ReaderSettings): Promise<void>;
  onPageChange(callback: (sourcePages: number[]) => void): () => void;
  destroy(): void;
}
```

The adapter owns animation events, source-page mapping, image readiness, resizing, and cleanup. Keep no-animation initialization or explicit reduced-motion behavior internal so ordinary application calls cannot accidentally bypass animation.

A distant page selection should use a controlled animated transition to the requested destination rather than queuing dozens of turns. It must still show the correct source order at rest. Define and test this separately from adjacent physical-sheet turns.

### State and loading behavior

Allow one active turn and at most one pending navigation intent. Avoid unbounded queues from repeated clicks. A page-change event commits when a turn settles, not when a drag begins. Returning a partial drag restores the original source page and controls.

Decode all page images required for the front, reverse, and revealed surfaces before starting a turn. Keep the current page visible during loading. Do not start an animation that will reveal a white placeholder. Delay interaction with a subtle loading indicator when necessary.

Do not resize the book or swap an image for a different-resolution asset in the middle of a fold. Apply deferred appearance and layout changes after settling. On pointer cancellation, lost visibility, resize interruption, or image failure, converge to a known stable state.

## 7. Conversion pipeline

Copy the selected PDF into its project folder using an application-generated identifier. Validate parseability and limits, then convert one page at a time in a child process so the local interface remains responsive.

Use PDF.js's displayed viewport to account for rotation and cropping. Render the original artwork rather than attempting to rebuild its typography in HTML. Extract text, safe links, and bookmarks as separate supporting data. [R4, R6]

Proposed starting profiles—not measured quality guarantees:

| Asset | Maximum long edge | Initial encoding |
|---|---:|---|
| Thumbnail | 320 px | WebP, quality 80 |
| Fit-view/turn image | 1,600 px | WebP, quality 90 |
| Zoom image | 3,200 px | WebP, quality 95 |

Render at the higher resolution and derive smaller assets. Include a high-quality lossless preset for documents where compression visibly harms fine text or diagrams. Choose it deliberately because storage use will vary. Preserve aspect ratios and use a consistent white paper background.

Release intermediate canvases and buffers after each page. Bundle the PDF engine's necessary fonts, CMaps, and other resources locally. No conversion or reader resource should load from a public CDN.

Suggested initial operating limits are 100 MiB per PDF, 300 pages, one conversion at a time, and a configurable per-page timeout and pixel cap. Enforce output-size and disk-space checks as well. These are protective defaults, not a promise that every PDF below them is supported.

Password-required PDFs receive a clear unsupported-input message in version 1. Scanned/image-only pages still render, but search coverage must be labeled accurately. OCR is not required. Never replace a failed visual page with a blank and call conversion successful.

Progress should report actual completed pages and the current stage. On cancellation or failure, discard the partial build while retaining the last complete one. After a restart, an interrupted conversion can be retried manually; distributed job recovery is unnecessary.

## 8. Local project model

Use a simple folder per project:

```text
data/
  projects/
    <project-id>/
      project.json
      source.pdf
      current-build.json
      builds/
        <build-id>/
          manifest.json
          pages/
          thumbnails/
          text/
      staging/
      exports/
```

The library can be reconstructed from project folders. A cached library index is optional and must not be the sole record of the user's work. An application-level single-instance lock prevents two processes from writing the same projects.

Save settings through a temporary file and safe replace operation. Serialize project mutations and reject a stale revision from another open tab. When conversion completes, validate all assets before changing `current-build.json`; a failed replacement must not destroy the previous readable flipbook.

A build is complete visual conversion output. Theme edits change `project.json`, not every page image. Keep the previous build until successful replacement; an elaborate release/rollback database is not needed.

### Portable reader contract

```ts
export interface ReaderSettings {
  preset: "magazine";
  layout: "auto" | "spread" | "single";
  showCoverAlone: boolean;
  backgroundColor: string;
  backgroundImage: string | null;
  toolbarTheme: "light" | "dark";
  turnDurationMs: number;
  shadowStrength: number;
  showPageEdges: boolean;
  motionPreference: "system" | "full" | "reduced";
}

export interface PageAsset {
  path: string;      // Safe relative path, never an arbitrary filesystem path
  width: number;
  height: number;
}

export interface FlipbookManifest {
  schemaVersion: "2.0";
  title: string;
  pageCount: number;
  settings: ReaderSettings;
  pages: Array<{
    sourcePage: number; // One-based
    label: string;
    aspectRatio: number;
    image: PageAsset;
    zoomImage: PageAsset;
    thumbnail: PageAsset;
    textPath: string | null;
    links: Array<{
      x: number; y: number; width: number; height: number;
      label: string;
      target:
        | { type: "page"; sourcePage: number }
        | { type: "external"; href: string };
    }>;
  }>;
  outline: Array<{ title: string; sourcePage: number }>;
  originalPdf: string | null;
}
```

Add runtime schemas: validate bounds, page counts, target pages, path containment, and allowed URLs. Link rectangles use normalized coordinates relative to the displayed, cropped, rotated artwork. Use the PDF.js viewport transform; do not merely invert the Y coordinate. [R6]

Export serializes a snapshot of settings plus one complete build. No reader asset may require an absolute path, a temporary localhost port, an account token, or an original-project API call.

## 9. Creator interface and feature priorities

Provide a small library with cover thumbnails and three main actions: **New flipbook**, **Open**, and **Export**. Each project opens directly into its animated preview with a collapsible appearance drawer.

The drawer adjusts the title, background, toolbar theme, page shadow strength, turn duration, cover layout, page-edge treatment, and render quality. Start with a well-tuned magazine preset; do not make the owner manually configure twenty controls to get an appealing result.

Appearance settings that do not affect page assets should update without reconversion. Render-quality changes explicitly start a new build. Show what will happen before rerendering a large document.

| Priority | Scope |
|---|---|
| Release blockers | Local PDF conversion; convincing page turns; correct page order; polished spread and single-page layouts; fit/zoom; save/reopen; matching animated HTML export |
| Supporting first-release features | Page entry; thumbnails; safe imported links; basic extracted-text search; available PDF bookmarks; fullscreen |
| Deferred | Multimedia editor, OCR, advanced text editing, analytics, public hosting, account management, password-gated readers, cloud sync, native installers, automatic spread splitting |

Supporting features must not delay demonstrating the animation or be used as evidence that an unconvincing reader is complete.

## 10. Static HTML export

Export an ordinary directory and optionally ZIP it:

```text
my-flipbook/
  index.html
  reader.js
  reader.css
  manifest.json
  pages/
  thumbnails/
  text/
  background/             # Only when a custom image is used
  original.pdf            # Only when explicitly included
  README.txt
  THIRD_PARTY_NOTICES.txt
```

The exported player must use the **same reader build, animation adapter, settings, shadows, and page assets** as the local preview. Do not make export a simpler static reader or a separate, lower-quality implementation.

Bundle all scripts and styles. Use relative paths so the directory works under a subpath on ordinary static hosting. Nothing should contact Heyzine, a licensing server, a CDN, or the creator application at runtime. External document links require a network only when followed.

Provide local preview through the application's static server. For exported packages, document HTTP serving through a static host or local HTTP server rather than promising every feature under a double-clicked `file://` page. Offline use means no internet connection is required when served locally.

Offer an iframe snippet only after a deployment URL is supplied; exporting alone does not create a public URL. Sharing or hosting the file does not require exposing the creator service.

An export is a snapshot. Editing the project does not update an already copied ZIP, and there is no remote revocation or DRM promise. A static export is for reading; backing up the whole project folder preserves editing and reconversion inputs.

## 11. Performance and memory

Performance matters most during the visible turn. Use already-decoded fit-view assets while animating; load zoom variants only for inspection and switch them outside active folds.

Keep an active image window around the visible pages, initially targeting the current spread and a small number of neighboring surfaces. Never preload all 300 pages at zoom resolution. Animated clones and temporary reverse surfaces count toward retained references. Release obsolete object URLs and temporary DOM nodes, and cancel outdated fetches.

These are proposed acceptance targets to measure on the owner's recorded hardware and browser:

| Metric | Target |
|---|---|
| Cached navigation feedback | Begins within 150 ms of input |
| Default full turn | Roughly 700–1,000 ms; tune against the reference, independently of loading delay |
| Motion | Aim for display-refresh-rate animation; record frame timing and visible stalls |
| Normal pointer dragging | No repeated stalls or large jumps in corner position |
| Loading | No blank moving surfaces; keep the existing page visible while preparing the next |
| Repeated navigation | Active image references remain bounded; memory trends toward a plateau |
| Export parity | Same visible result at the same viewport and settings |

Do not assert a guaranteed frame rate without measuring it. Low-end hardware can reduce pixel density or expensive optional shadows, but it must not silently remove the required page-turn behavior.

## 12. Local safety and reliability

Personal scope removes the need for internet-facing platform infrastructure, not basic file safety. Bind the creator service to loopback, validate Host/Origin, and use a per-launch capability/session mechanism so an unrelated website cannot operate it. Do not permit arbitrary cross-origin access or serve the whole drive.

Keep application file operations inside the chosen workspace. Accept uploaded file bytes rather than arbitrary paths or remote URLs. Validate filenames and generated asset paths, including traversal and symlinks. Use patched dependencies and do not execute PDF scripting, embedded-file launch actions, or extracted HTML.

Render metadata as text, allow only intended external link schemes, and open external web links with safe opener behavior. Conversion runs in a cancellable child process with available limits; a child process is not claimed to be a security sandbox. This release is intended for the owner's documents and is not an internet-facing upload service.

The original PDF is excluded from export by default unless the owner selects it. Hiding a download button does not prevent copying readable page images. No telemetry or background network requests are required.

## 13. Verification and visual acceptance

### A. Mandatory visual prototype

Before building the complete creator, produce an 8–12-page representative test book with text, photographs, and distinctive page numbers. Demonstrate cover opening, spread turning, reverse turning, a partial drag returned to its origin, and a narrow-screen turn.

Record normal-speed motion. Capture resting and partially turned states at approximately quarter, half, and three-quarter progress. Use deterministic pointer paths for regression captures; do not assume the dependency provides an arbitrary animation-seek API.

Compare against the selected Heyzine reference for flexible-paper appearance, shadow coherence, book placement, control restraint, and overall smoothness. Use comparable page proportions and viewports. User/developer review is a required visual gate, not something unit-test counts can replace.

### B. Behavior and conversion suite

Verify correct page order, page-entry destinations, cover centering, odd/even endings, narrow layouts, resize, partial-drag cancellation, repeated clicks, links near turn regions, zoom/pan, missing assets, and reduced-motion behavior. Confirm that next/previous in normal mode actually animate.

Use rights-cleared fixtures for standard pages, rotation and cropping, mixed dimensions, image-only PDFs, fine text, safe/unsafe links, bookmarks, malformed files, and password-required PDFs. A failed page must fail its build. Interruption and reconversion must leave the last complete project usable.

Run Chromium and Firefox tests on Windows; use additional browser coverage and real mobile checks where available. Emulation is not evidence of real-device performance.

### C. Export gate

Serve the export from a separate static directory under a non-root path, stop the creator/conversion service, and deny external network requests. Verify the same page-turn effect, cover settings, backgrounds, navigation, thumbnails, links, zoom, and available search data.

A generated ZIP and a static screenshot are not sufficient export acceptance.

### D. Completion evidence

Each milestone must provide the commands actually executed, fixtures used, outcomes, and relevant screenshots or recordings. Distinguish “functional tests passed” from “visual comparison approved.” Record unchecked platforms and known limitations explicitly.

## 14. Implementation milestones

| Milestone | Deliverable | Gate |
|---|---|---|
| **M0 — Visual proof** | Small animated book; first candidate renderer; magazine presentation; cover/spread/single mapping | Motion recording and reference comparison; convincing turns before broad application work |
| **M1 — Real PDF conversion** | Local import, images, thumbnails, text/links, project folder, cancellation | Real PDFs appear correctly inside the already-tested animated reader |
| **M2 — Personal creator** | Library, appearance drawer, save/reopen, replacement conversion | Simple end-to-end workflow with no database, login, or cloud dependency |
| **M3 — Reader polish and export** | Touch, zoom, search/contents, interaction fixes, HTML/ZIP export | Same animated experience locally and independently from export |
| **M4 — Personal-use release** | Cross-platform scripts, resource limits, regressions, documentation, recorded limitations | Clean setup and full workflow demonstrated; visual and functional gates passed |

Proposed repository structure:

```text
apps/studio/             # Creator UI
apps/local-service/      # Loopback service and converter orchestration
packages/converter/      # PDF.js, rendering, extraction
packages/reader/         # Reader, FlipEngine adapter, controls and overlays
packages/shared/         # Runtime schemas and types
packages/exporter/       # Static-package assembly
fixtures/                # Rights-cleared test inputs
scripts/                 # Cross-platform launch, verification, diagnostics
```

Required commands are interfaces to implement, not existing software:

```text
npm ci
npm run doctor
npm run dev
npm run build
npm start
npm run convert -- --input <pdf> --output <folder>
npm run test:unit
npm run test:integration
npm run test:reader
npm run test:export
npm run verify
```

Do not introduce database migrations, an administrator setup command, container requirements, or an external queue for this scope.

## 15. Definition of done and coding-agent directive

The project is complete when the owner can open the local application, choose a supported PDF, obtain a visually convincing Heyzine-style magazine flipbook, turn and drag pages smoothly, read it in spread or single-page animated layouts, customize its appearance, save and reopen it, and export the same animated experience without dependence on the creator application or an external service.

**A functional converter plus a plain viewer is not completion. A polished toolbar around weak page-turn effects is not completion. Passing automated tests without visual review is not completion.**

> Implement this as a personal PDF-to-flipbook creator, not a publishing SaaS. Prioritize the mandatory realistic page-turn effect and Heyzine-style reading experience. Prove the animation before expanding the application. Keep local setup simple and exports independent. Do not substitute sliders, rigid card flips, scrolling, or static pages for the requested experience. Do not claim exact visual parity until the implementation has actually been compared and reviewed.

---

## Research references

Primary documentation checked September 14, 2026. Requirements, architecture, limits, and targets are proposed design decisions unless explicitly attributed. Public documentation identifies candidate capabilities; it does not establish that their integration has been implemented or tested.

**[R1] Heyzine — official product features and example links.** Distinct magazine/book/one-page effects, customization, and downloadable HTML.  
`https://heyzine.com/`

**[R2] StPageFlip — official repository.** Image/HTML support, page types, portrait cloning, configuration, license.  
`https://github.com/Nodlik/StPageFlip`

**[R3] StPageFlip — official examples and API documentation.** Animated versus immediate methods, shadow controls, cover behavior, events.  
`https://nodlik.github.io/StPageFlip/`

**[R4] Mozilla PDF.js — official Node rendering example.** Rendering outside the reader and locally configured resources.  
`https://github.com/mozilla/pdf.js/blob/master/examples/node/pdf2png/pdf2png.mjs`

**[R5] Sharp — output options.** Image encoding and WebP settings.  
`https://sharp.pixelplumbing.com/api-output/`

**[R6] Mozilla PDF.js — PDFPageProxy API.** Page viewport, rendering, annotations, and text.  
`https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFPageProxy.html`

**[R7] W3C — Animation from Interactions.** User control over interaction-triggered motion.  
`https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html`

Retain notices required by every bundled dependency. Do not infer rights to a commercial player or its assets merely from their availability in a browser.
