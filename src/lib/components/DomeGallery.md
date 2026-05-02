# DomeGallery — Technical Logic Explainer

## What Does It Do? (Plain English)

A grid of image tiles arranged on the surface of an invisible sphere. Drag to spin the sphere; let go and it coasts to a stop with a touch of inertia, the way a globe on a desk does. Tap any tile and it flies out from where it sat to a centred lightbox, ready to read. Tap outside or press Escape and it flies back home.

Think of it as a snow globe full of photographs — except instead of glass, the dome is built entirely from CSS 3D transforms (`rotateX`, `rotateY`, `translateZ`, `perspective`). There is no Three.js, no WebGL, and no canvas: every tile is a real `<img>` inside a regular DOM element, so they remain selectable, focusable, and indexable.

## How It Works (Pseudo-Code)

```
state:
  rotation   = { x: 0, y: 0 }   // reactive — drives sphere transform
  dragging   = false
  moved      = false            // exceeded click vs drag threshold?
  velocity   = { x: 0, y: 0 }   // updated every pointermove
  enlarging  = false            // reactive — drives lightbox class
  inertiaRAF = null             // active requestAnimationFrame id

derive:
  items = buildItems(images, segments)   // grid coords + photo data per tile

events:
  on ResizeObserver:
    radius = clamp(min, basis × fit, max); write --radius CSS var

  on pointerdown over sphere:
    if focused (lightbox open): ignore
    stopInertia(); dragging = true; moved = false
    capture pointer; lockScroll(); snapshot startRot/startPos

  on pointermove (skip if !dragging):
    update velocity (Δposition / Δtime)
    if drag distance² > 16 px² → moved = true
    rotation.x = clamp(start − dy/sensitivity, ±maxVerticalRotationDeg)
    rotation.y = wrap(start + dx/sensitivity)
    apply transform on sphere element

  on pointerup:
    if |velocity| significant: startInertia(vx, vy)
    if !moved AND target was a tile: openItemFromElement(tile)
    release pointer; unlockScroll()

  on tile open:
    capture tile rect; FLIP-style transform from tile → centre
    enlarging = true; lockScroll()

  on Escape / scrim click:
    FLIP back to original tile rect; remove overlay; unlockScroll()

inertia step (rAF):
  vX *= friction; vY *= friction
  apply rotation; recurse until |v| < threshold OR frames > maxFrames
```

## The Core Concept: Building a Sphere From Flat Tiles

The "sphere" is a stack of plain rectangles, each rotated to the right latitude/longitude and pushed outward by `radius` so its centre lands on the imaginary spherical surface.

```
.stage          { perspective: 1200px; }            // viewer eye
  └── .sphere   { transform: translateZ(-radius)
                            rotateX(rotation.x)
                            rotateY(rotation.y); }
        ├── .item   transform: rotateY(longitude)
        │                       rotateX(latitude)
        │                       translateZ(radius);
        ├── .item   …
        └── .item   …
```

For each tile at grid position `(offsetX, offsetY)` with `segments` columns:

```
unit     = 360° / segments / 2     // half-step per grid unit
rotateY  = unit × (offsetX + (sizeX − 1) / 2)    // longitude
rotateX  = unit × (offsetY − (sizeY − 1) / 2)    // latitude
```

Why halve the step? The brick-stagger pattern increments grid X by 2 between columns and uses two interleaved Y arrays (`evenYs = [-4,-2,0,2,4]`, `oddYs = [-3,-1,1,3,5]`), which means consecutive *visual* columns are only one half-step apart. Halving the unit puts them on a continuous angular grid without overlaps.

`translateZ(radius)` is the trick that turns a 2D layout into a sphere surface: each tile, after its rotations, points outward from the origin and is then pushed exactly `radius` units along its own local Z axis. The sphere itself is then translated `-radius` on Z so the *near* face of the dome sits at the viewer's eye position — that's why a tile at rotation `(0, 0)` appears flat against the screen.

A staggered brick pattern (rather than a regular grid) is used so the tile seams do not line up into obvious horizontal/vertical bands when the dome rotates — the eye reads a brick pattern as "varied" and a uniform grid as "rigid".

## Performance: Where the Frame Budget Goes

The component holds a strict invariant: **only `rotation` and `enlarging` are reactive Svelte state**. Everything else (`dragging`, `velocity`, `lastMovePos`, RAF ids) is plain JS that mutates without triggering re-renders. When `rotation` changes, the sphere's `transform` is rewritten directly via DOM API, not via re-rendering children.

Per drag-frame: two `clamp`/`wrap` calls and one `applyTransform` (one CSS `transform` string written on the sphere element). Per inertia frame: identical, plus one `requestAnimationFrame` schedule. The friction loop terminates on two conditions (velocity below threshold OR frame count over a maximum) so a stuck animation cannot run forever.

Three CSS rules earn their keep:

```css
.sphere { will-change: transform; }
.item   { backface-visibility: hidden; }   /* skip rear-facing tiles */
.stage  { contain: layout paint size; }    /* isolate from page layout */
```

`backface-visibility: hidden` is the big one — half the tiles face away at any moment, and culling them at the GPU level halves the per-frame fill cost. `contain: layout paint size` means the rest of the page never has to lay out or repaint when the dome rotates.

Image tags use the browser's standard lazy-decode path. Add `loading="lazy"` and `decoding="async"` on tiles that will start off-screen if you have many — the component itself does no lazy-loading, keeping it portable.

## Accessibility Deep-Dive

- Each tile is a real focusable element with `role="button"`, `tabindex="0"`, and an `aria-label` derived from its `alt` text — Tab walks the tile set in DOM order regardless of where they sit visually.
- `Enter` / `Space` opens the lightbox; `Escape` closes it; focus is restored to the originating tile.
- The lightbox locks page scroll (`document.body` gets the `dg-scroll-lock` class). The lock is released only when both `enlarging` is false AND `dragging` is false — the two states share one lock so neither can leak.
- For `prefers-reduced-motion: reduce`, set `dragDampening={0}` to suppress inertia coast and `enlargeTransitionMs={0}` for instant lightbox swaps.
- The 16 px² click-vs-drag threshold matters for keyboard users too: `Enter`/`Space` never accidentally triggers drag logic, and mouse users with shaky hands get a small grace zone.

## State Flow Diagram

```
              ┌────────────────────┐
              │       IDLE         │
              │  rotation = {0,0}  │
              │  enlarging = false │
              └─────────┬──────────┘
                        │ pointerdown on sphere
                        ▼
              ┌────────────────────┐
              │      DRAGGING      │
              │  rotation updates  │
              │  velocity tracked  │
              │  scroll locked     │
              └─────────┬──────────┘
                        │ pointerup
            ┌───────────┴────────────┐
            │                        │
   moved & |v| significant       !moved & on tile
            │                        │
            ▼                        ▼
   ┌────────────────┐      ┌──────────────────┐
   │   COASTING     │      │    ENLARGING     │
   │  rAF friction  │      │  FLIP tile→centre│
   └────────┬───────┘      └─────────┬────────┘
            │ |v| < threshold         │ Escape / scrim
            ▼                         ▼
           IDLE                   FLIP back → IDLE
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `(string \| DomeGalleryImage)[]` | `[]` | Array of `{ src, alt }` objects or plain URL strings. Cycles to fill all grid slots. |
| `fit` | `number` | `0.5` | Multiplier applied to the chosen container basis to derive the sphere radius. |
| `fitBasis` | `'auto' \| 'min' \| 'max' \| 'width' \| 'height'` | `'auto'` | Which container dimension drives the radius calculation. |
| `minRadius` | `number` | `600` | Lower bound on the sphere radius in pixels. |
| `maxRadius` | `number` | `Infinity` | Upper bound on the sphere radius in pixels. |
| `padFactor` | `number` | `0.25` | Padding applied around the viewer as a fraction of the basis dimension. |
| `overlayBlurColor` | `string` | `'#060010'` | Colour used by the radial vignette that fades the dome edges. |
| `maxVerticalRotationDeg` | `number` | `5` | Hard clamp on vertical (X-axis) rotation, in degrees. |
| `dragSensitivity` | `number` | `20` | Pixels of pointer movement per degree of rotation; lower = more sensitive. |
| `enlargeTransitionMs` | `number` | `300` | Duration of the FLIP open/close animation. |
| `segments` | `number` | `35` | Number of grid columns; more = smaller, denser tiles. |
| `dragDampening` | `number` | `0.8` | 0–1 inertia tuning: 0 = no coast, 1 = long coast. |
| `openedImageWidth` | `string` | `'250px'` | Width of the enlarged image. |
| `openedImageHeight` | `string` | `'350px'` | Height of the enlarged image. |
| `imageBorderRadius` | `string` | `'30px'` | Border radius applied to grid tiles. |
| `openedImageBorderRadius` | `string` | `'30px'` | Border radius applied to the enlarged image. |
| `grayscale` | `boolean` | `true` | Apply a `grayscale(1)` filter to the tiles for an editorial look. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Small viewport (mobile portrait) | `ResizeObserver` recalculates `--radius` against the smaller dimension; the dome shrinks proportionally and tiles remain readable. `touch-action: none` ensures vertical page scroll is not stolen by horizontal drags. |
| Image fails to load | The browser's broken-image glyph appears in that tile; nothing else changes. Surrounding tiles continue to render and the dome remains interactive. |
| Slow network | Tiles render their backing `<img>` immediately; pixels stream in as the network delivers them. Pre-decode by adding `decoding="async"` and `loading="lazy"` to image sources. |
| `prefers-reduced-motion: reduce` | Pass `dragDampening={0}` to suppress inertia coast and `enlargeTransitionMs={0}` for instant lightbox swaps. The dome remains static unless dragged. |
| Keyboard-only user | Tab walks tiles in DOM order; Enter/Space opens, Escape closes and restores focus to the originating tile. |
| Click landed mid-coast | Pointer-down calls `stopInertia()` first, so a coasting dome can be caught and re-grabbed without delay. |
| More / fewer images than tiles | More: `console.warn` and excess ignored. Fewer: array cycles; a swap-pass guarantees no two adjacent slots repeat. |
| Dark mode page | Theme-agnostic — set `overlayBlurColor` to the page background to make the edge fade blend. Default `#060010` suits dark themes. |
| Component unmount mid-drag | `$effect` cleanup cancels `inertiaRAF` and removes the scroll-lock class so unmounting cannot strand the page locked. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$effect`, and `$props`. Reactive state is deliberately limited to `rotation` and `enlarging`; everything else is plain JS for performance.
- Zero external dependencies — no Three.js, no canvas, no animation library, no icon library. CSS 3D transforms, `ResizeObserver`, and the Pointer Events API are the only browser features used.

## File Structure

```
src/lib/components/DomeGallery.svelte         # implementation
src/lib/components/DomeGallery.md             # this file (rendered inside ComponentPageShell)
src/lib/components/DomeGallery.test.ts        # vitest unit tests
src/routes/domegallery/+page.svelte           # demo page
src/lib/types.ts                              # DomeGalleryProps + DomeGalleryImage + DomeGalleryItem
```
