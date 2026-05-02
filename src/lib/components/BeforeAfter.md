# BeforeAfter — Technical Logic Explainer

## What Does It Do? (Plain English)

Two images stacked perfectly on top of one another, with a vertical line you drag left and right to reveal more of one and less of the other. Use it for retouch comparisons, renovation reveals, "with filter / without filter" demos, or any pair of images that tell a story by being shown side-by-side at the same moment.

Think of it as a squeegee on a fogged window: as you slide it across, the left side keeps the fog and the right side becomes clear. The component does no image processing — both images are always rendered in full; the divider just clips one of them out of view in real time using CSS `clip-path`.

## How It Works (Pseudo-Code)

```
state:
  dividerPosition  = initialPosition (0–100, default 50)
  isDragging       = false
  containerEl      = bound DOM ref

derive:
  beforeClip = "inset(0  (100 − dividerPosition)%  0  0)"   // hide right side
  afterClip  = "inset(0  0  0  dividerPosition%)"            // hide left side

events:
  on pointerdown over container (skip if disabled):
    1. isDragging = true
    2. containerEl.setPointerCapture(pointerId)             // keep events on us
    3. updateDividerPosition(event)                          // jump to click

  on pointermove (skip if not dragging):
    updateDividerPosition(event)

  on pointerup / pointercancel:
    1. isDragging = false
    2. containerEl.releasePointerCapture(pointerId)

  on keydown ArrowLeft (and not disabled):
    preventDefault; dividerPosition = max(0, dividerPosition − 1)

  on keydown ArrowRight (and not disabled):
    preventDefault; dividerPosition = min(100, dividerPosition + 1)

updateDividerPosition(e):
  rect = containerEl.getBoundingClientRect()
  x    = e.clientX − rect.left
  dividerPosition = clamp(0, 100, (x / rect.width) × 100)

effect:
  whenever dividerPosition changes, call onChange?(dividerPosition)
```

The component owns one piece of reactive state (`dividerPosition`); everything visible is a `$derived` of that single number. There is no canvas, no JS animation loop, and no per-frame layout thrash.

## The Core Concept: Clipping, Not Cropping

Both images are absolutely positioned at full size and occupy the same rectangle. The illusion of a moving boundary comes from CSS `clip-path: inset(...)`, which clips each panel from a specific edge in proportion to `dividerPosition`.

```
inset(top right bottom left)   ← all four sides as percentages

before panel  →  inset(0,  100 − P %,  0,  0)    clips from the RIGHT
after  panel  →  inset(0,  0,  0,  P %)          clips from the LEFT

At P = 30:

  ┌──────────┬─────────────────────────┐
  │ BEFORE   │                         │
  │ visible  │                         │
  │  (30%)   │                         │
  └──────────┘                         │
              ┌─────────────────────────┐
              │ AFTER                   │
              │ visible                 │
              │   (70%)                 │
              └─────────────────────────┘
                ▲
                divider at 30%
```

`clip-path` is GPU-composited — clipping a 4K image is no more expensive than clipping a 100×100 thumbnail, because the bitmap never re-rasterises. That's what makes the slider feel weightless even on full-resolution photos.

The naïve alternative — animating `width` on one panel — would force a layout/paint pass on every pointer move, and stutter as soon as the images grew past a few hundred pixels.

## Pointer Capture: Surviving Drags Off-Element

A common drag bug: the user starts dragging the divider, drags fast, and the cursor leaves the container — `pointermove` stops firing on the element, the slider freezes, and they have to come back to "find" it again. Pointer capture prevents that entirely:

```javascript
containerEl.setPointerCapture(e.pointerId);
```

After that call, every subsequent `pointermove`/`pointerup` for that pointer ID is delivered to `containerEl` regardless of where the cursor is on the page — even outside the browser window on most platforms. Release happens in `pointerup`, or automatically if the pointer is lost (browser focus change, tab switch, `pointercancel`).

The Pointer Events API also unifies mouse, touch, and pen input under one set of handlers. There is no parallel `touchstart`/`touchmove`/`touchend` path to maintain. `touch-action: none` on the container is the one extra detail — it tells the browser "don't try to scroll/zoom this gesture, the JS is handling it" — without which iOS Safari would steal horizontal touch drags as page-pan gestures.

## Performance & Accessibility

Per pointer move the component does:

- One `getBoundingClientRect()` (cached layout, not forced)
- One `clamp(...)` and one assignment to `dividerPosition`
- Svelte updates two CSS `clip-path` strings via `$derived`
- The compositor blits clipped panels — no JS paint, no layout

There is no `requestAnimationFrame`, no throttle, no debounce. The cost is bounded by pointer-move frequency (60–120 Hz) and is constant regardless of image resolution.

For keyboard users, the container itself is `tabindex="0"` and listens for arrow keys: `ArrowLeft` / `ArrowRight` step the divider by 1 % each press — fine-grained enough to land on any value. ARIA exposes the divider as a `role="separator"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` so screen readers announce the position numerically as it changes. `prefers-reduced-motion: reduce` strips the small CSS transitions on the handle so the slider becomes instant rather than easing — for users who set this preference, easing under the cursor is itself a motion they want gone.

Both `<img>` tags carry author-supplied `alt` text (`beforeAlt` / `afterAlt`); the optional corner labels (`beforeLabel` / `afterLabel`) are decorative overlays, marked `pointer-events: none` so they never intercept drags.

## State Flow Diagram

```
                 ┌────────────────────┐
                 │   dividerPosition  │  ── persistent across all states
                 │      = 0..100      │     (drag, key, focus, idle)
                 └────────────────────┘

           ┌─────────────────────────────────┐
           │             IDLE                │  ◀──── initial mount
           │   isDragging = false            │
           └─────────────────────────────────┘
                │                ▲
   pointerdown  │                │ pointerup / pointercancel
                ▼                │
           ┌─────────────────────────────────┐
           │           DRAGGING              │
           │   isDragging = true             │
           │   pointer captured              │
           │   pointermove → recalc position │
           │   handle transition disabled    │
           └─────────────────────────────────┘

           Independent path (any state, no flag flip):

           ArrowLeft  → dividerPosition − 1 (clamped 0)
           ArrowRight → dividerPosition + 1 (clamped 100)

           Side effect on every change:

           $effect → onChange?.(dividerPosition)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `beforeImage` | `string` | required | URL of the "before" image (left side at P=100). |
| `afterImage` | `string` | required | URL of the "after" image (right side at P=0). |
| `beforeAlt` | `string` | `'Before'` | Alt text for the before image. |
| `afterAlt` | `string` | `'After'` | Alt text for the after image. |
| `beforeLabel` | `string` | `undefined` | Optional text overlay shown in the top-left corner. |
| `afterLabel` | `string` | `undefined` | Optional text overlay shown in the top-right corner. |
| `aspectRatio` | `string` | `'16/9'` | CSS `aspect-ratio` value (`'4/3'`, `'1/1'`, `'21/9'`, etc.). |
| `width` | `number \| string` | `'100%'` | Container width; numbers become pixels, strings pass through. |
| `initialPosition` | `number` | `50` | Starting divider position as a percentage (0–100). |
| `disabled` | `boolean` | `false` | Disables drag and keyboard input; current position stays put. |
| `dividerColor` | `string` | `'#ffffff'` | Colour of the vertical divider line. |
| `dividerWidth` | `number` | `2` | Width of the divider line in pixels. |
| `handleSize` | `number` | `48` | Diameter of the circular grab handle in pixels. |
| `handleColor` | `string` | `'#ffffff'` | Background colour of the grab handle. |
| `onChange` | `(position: number) => void` | `undefined` | Fires whenever `dividerPosition` changes for any reason. |
| `class` | `string` | `''` | Extra classes appended to the container. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Cursor leaves the container during drag | Pointer capture keeps `pointermove` flowing; the divider continues to track until pointer-up. |
| Image fails to load | The broken-image placeholder shows in the affected panel. The slider still works; the divider just clips an empty box on that side. |
| Container narrower than the handle | Handle still renders at `handleSize` px and may visually overhang; pointer-down anywhere inside the container still works because the container itself is the drag target. |
| Slow network / progressive image load | Clipping happens on whatever pixels are currently decoded, so the slider stays responsive even mid-load. No spinner is provided — the parent should handle that if needed. |
| `prefers-reduced-motion: reduce` | The 100 ms handle ease transition is removed; the divider snaps to position instantly. The interaction is otherwise identical. |
| Keyboard-only user | Tab focuses the container (visible focus ring), Arrow keys step the divider 1 % per press, ARIA `aria-valuenow` updates each step so screen readers announce the new value. |
| `disabled={true}` | All pointer and key handlers exit early; current `dividerPosition` is preserved and `onChange` does not fire spuriously. |
| Mobile dark mode | No automatic theme switch — `dividerColor` and `handleColor` defaults are white, set them explicitly for dark backgrounds (`'#0c0a09'` / `'#262626'`). |
| Component unmounted mid-drag | Svelte tears down listeners; the next mount starts at `initialPosition` — drag state does not persist. |
| `initialPosition` outside 0–100 | Captured as-is on first render; the first user interaction clamps it back into range. Pass a sane value. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$effect`, `$props`, and `bind:this`. The whole component is one reactive number plumbed through CSS custom properties and `clip-path` strings.
- Zero external dependencies — no canvas, no animation library, no icon library. The arrow icon on the handle is inline SVG. Fully copy-paste portable.

## File Structure

```
src/lib/components/BeforeAfter.svelte         # implementation
src/lib/components/BeforeAfter.md             # this file (rendered inside ComponentPageShell)
src/lib/components/BeforeAfter.test.ts        # vitest unit tests
src/routes/beforeafter/+page.svelte           # demo page
src/lib/types.ts                              # BeforeAfterProps interface
```
