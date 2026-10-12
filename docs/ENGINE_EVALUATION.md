# Animation engine evaluation

Date: September 14, 2026. Candidate: **StPageFlip / `page-flip` 2.0.7**, MIT, HTML mode. Evaluation platform: Windows; source and dependency patch checks used the installed package. The npm lockfile pins the actual artifact.

**Decision: retain this candidate for the visual prototype; visual acceptance is pending.** Source inspection establishes useful capabilities and specific integration defects. It does not establish convincing paper appearance, reference parity, owner approval, or measured frame rate. The application must keep these claims separate from automated passes.

## Reference and fidelity boundary

The requested references are the [official Heyzine magazine example](https://heyzine.com/flip-book/dce36e099f.html) and [official one-page example](https://heyzine.com/flip-book/7bf964fc45.html). The implementation task records reference browser captures separately under `docs/evidence/reference/`; this source audit did not operate that browser or assess those recordings. No proprietary player code or reference publication artwork belongs in the application.

## What the dependency actually provides

The [official API documentation](https://nodlik.github.io/StPageFlip/) distinguishes animated `flip`, `flipNext`, and `flipPrev` from immediate `turnToPage` operations. Its [repository](https://github.com/Nodlik/StPageFlip) describes HTML soft/hard surfaces and portrait cloning, and licenses the engine under MIT. Those capabilities justify evaluating it before writing a new renderer; they do not prove the requested visual result.

The installed `src/Page/HTMLPage.ts` implements a soft surface with a changing clipped polygon, translation, and in-plane rotation. Its hard surface uses `rotateY`. This is a computed fold, with moving front/reverse regions, rather than a continuously curved 3D mesh. Whether that fold looks sufficiently flexible is the central visual question. [Primary implementation](https://github.com/Nodlik/StPageFlip/blob/master/src/Page/HTMLPage.ts)

`src/Render/HTMLRender.ts` positions soft inner and outer shadows from the same fold calculation, clipping them to appropriate regions. Changing shadow opacity cannot make its geometry more curved. It also clears temporary copies after they cease to be the active moving surface. [Primary shadow renderer](https://github.com/Nodlik/StPageFlip/blob/master/src/Render/HTMLRender.ts)

## Source-page mapping and covers

With `showCover: true`, the unmodified collection produces these one-based source spreads:

| Source count | Wide-screen sequence |
| --- | --- |
| 1 | `[1]` |
| 2 | `[1]`, `[2]` |
| 3 | `[1]`, `[2, 3]` |
| 4 | `[1]`, `[2, 3]`, `[4]` |
| 5 | `[1]`, `[2, 3]`, `[4, 5]` |

Portrait mode instead makes one spread per source page. The adapter must retain a logical source page across orientation changes and derive button availability from application mapping. The upstream forward boundary check can still permit an attempted turn from a final paired spread.

The collection forcibly gives the first cover and any singleton tail hard density. The adapter must reset every page to soft after loading/updating; cover material and placement are independent. The singleton final spread uses one object for both moving and revealed surfaces, so two-page and even-ending motion need direct regression review. A sole page is also treated as the last left page upstream: handle its centering explicitly and prohibit navigation. Virtual balancing surfaces must remain outside the manifest count and search. [Primary collection implementation](https://github.com/Nodlik/StPageFlip/blob/master/src/Collection/PageCollection.ts)

## Minimal compatibility patch

`scripts/patch-page-flip.mjs` runs in `postinstall`. It changes both published JavaScript bundles, validates version 2.0.7 and every exact replacement count, and checks its own idempotent marker on subsequent runs. All replacements are computed before either bundle is written. A dependency upgrade requires a fresh review; unexpected source fails installation.

The patch is intentionally narrow:

1. Track/cancel the renderer's `requestAnimationFrame` callback and expose `getRender().stop()`. Destroy invokes it and releases the page collection. Upstream otherwise schedules frames indefinitely, including after removing the book DOM.
2. Always remove UI window listeners on destroy, including when `useMouseEvents: false`. The adapter supplies Pointer Events, so this mode is deliberate.
3. Honor the adapter-only `autoResize: false` setting in the upstream resize callback. The adapter can defer reflow until a fold settles.
4. Ignore the delayed initialization callback after destruction.
5. In portrait forward motion, clone the following source page's artwork for the reverse surface instead of cloning the current source artwork. The clone remains owned by the original page for cleanup; the revealed page retains its own element.

The patch does not alter fold mathematics, shadow formulas, or the spread construction. Original upstream TypeScript stays in `node_modules/page-flip/src` for inspection; runtime imports must use the patched package bundles, not those unmodified sources. Keep the upstream MIT license in exported notices.

Lifecycle changes are grounded in the installed renderer and UI code. The original UI registers mouse/touch events, lacks pointer cancellation and multi-pointer arbitration, and conditionally skips listener cleanup. [Primary render lifecycle](https://github.com/Nodlik/StPageFlip/blob/master/src/Render/Render.ts), [primary UI implementation](https://github.com/Nodlik/StPageFlip/blob/master/src/UI/UI.ts)

The portrait change is an explicit application policy for single-page display, not a claim that this layout models a complete physical spread. Inspect its front/reverse/revealed overlap in motion. Keep links and all other interactive overlays outside cloned page nodes; decode both source assets before starting. [Primary temporary-copy implementation](https://github.com/Nodlik/StPageFlip/blob/master/src/Page/HTMLPage.ts)

## Adapter integration findings

`startUserTouch(point)`, `userMove(point, isTouch)`, and `userStop(point, isSwipe)` exist on the actual runtime object. There is no `stopUserTouch` method. Points are relative to the engine's display element. Convert the latest client coordinates against that element's bounding rectangle after any outer transform. Use one pointer, a deliberate movement threshold, and separate pinch/pan handling. A touch start only stores coordinates: it does not itself establish the fold direction. [Primary application API](https://github.com/Nodlik/StPageFlip/blob/master/src/PageFlip.ts)

The controller exposes `getCalculation()`. Its calculation supplies `getPosition()`, `getDirection()`, `getCorner()`, and `getFlippingProgress()` from 0 through 100. The controller itself has no `getDirection()` method. An outer cover translation can interpolate from `-pageWidth / 2` at rest to zero while opening, and reverse when closing. This keeps artwork dimensions fixed. A cancelled fold must interpolate back rather than snapping the wrapper. [Primary fold calculation](https://github.com/Nodlik/StPageFlip/blob/master/src/Flip/FlipCalculation.ts)

`stopMove()` chooses completion after the corner crosses the spine; it is not an unconditional cancellation API. Also, moving back to the exact initial pointer coordinate through `userMove()` is ignored by its movement threshold. Return-to-origin cancellation needs a deliberate adapter operation. Visibility interruption and resize must converge on a valid committed page.

`flip(targetIndex)` performs one controlled distant transition by changing the internal spread reference before folding toward the destination. Decode the current and destination surfaces; do not enqueue dozens of turns. Do not publish its intermediate internal index. At completion, `flip` fires before `changeState('read')`; the state setter dispatches before assigning its internal field, so defer settled work to a microtask. Short animations are scaled by path distance: `flippingTime` is a maximum, not guaranteed actual duration, particularly on narrow screens. [Primary controller implementation](https://github.com/Nodlik/StPageFlip/blob/master/src/Flip/Flip.ts)

## Checks executed for this audit

- Read the complete v2 design and installed `page-flip` package manifest, collection, page, controller, calculation, UI, and render implementations; checked primary upstream documentation.
- Ran `node scripts/patch-page-flip.mjs` on Windows after installation: both already-patched bundles verified, zero files changed. This confirms rerunning is idempotent.
- Ran a Node VM behavioral smoke check against **both installed runtime bundles**. Fake scheduling and minimal DOM objects confirmed one pending RAF, cancellation without rescheduling, following-source reverse artwork, temporary-copy release, externally controlled resize, and listener cleanup with engine mouse events disabled. These are focused lifecycle tests, not browser visual tests.

Patched bundle SHA-256 values for patch v1:

```text
page-flip.browser.js 5856dfa07f41edcf8470f2ea2e38ee346dca6eb1909258ede95eb7dac6c534ab
page-flip.module.js  1e670482de389fa358d7b9908f471d156e9ea7694d97f2972df833ecc384031c
```

## Pending visual acceptance

Require normal-speed cover, forward/reverse spread, return-to-origin drag, narrow-layout, and even-tail recordings with identifiable source numbers. Review quarter/half/three-quarter drag captures, correct reverse print, shadow attachment, stable scale/spine, and reference presentation at comparable viewports. Measure actual turn timing and retained resources; no performance guarantee follows from these code checks.

Functional pass counts must not replace visual review or owner acceptance. If tuning and this limited patch cannot make the flexible-paper effect convincing, reject this candidate behind the adapter before declaring the creator complete.
