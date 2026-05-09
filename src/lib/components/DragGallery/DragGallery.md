# DragGallery — Technical Logic Explainer

## What Does It Do? (Plain English)

A horizontal row of product cards. Drag with your mouse, finger, or trackpad to flick through them with momentum. Release and the deck keeps moving briefly under inertia, then snaps to the nearest card. Click a card to jump to it directly. Arrow keys navigate from the keyboard.

Use it for product carousels, photo portfolios, "shop the look" panels — anywhere the user benefits from a tactile flick over a paginated stepper.

## How It Works (Pseudo-Code)

```
state:
  activeIndex = initialIndex
  offset = 0                 // current x translation
  velocity = 0               // px per frame, set by pointer move
  dragging = false
  prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches

derived:
  stride = cardWidth + cardGap
  minOffset = -(items.length - 1) * stride

events:
  pointerdown:
    cancel any in-flight inertia
    record (clientX, offset, time) as the drag origin
    setPointerCapture so subsequent moves come even if pointer leaves track

  pointermove (only while dragging):
    dx = current.clientX - origin.clientX
    offset = clamp(originOffset + dx, [minOffset, 0])
    velocity = (current.clientX - lastMoveX) / (now - lastMoveTime) * 16
    update lastMoveX / lastMoveTime

  pointerup:
    dragging = false
    if prefersReduced: snapTo(nearestIndex(offset))
    else: startInertia()

  keydown:
    ArrowLeft  → snapTo(activeIndex - 1)
    ArrowRight → snapTo(activeIndex + 1)
    Home       → snapTo(0)
    End        → snapTo(items.length - 1)

  card click (when not dragging and velocity is small):
    snapTo(thatIndex)

inertia loop (rAF):
  if |velocity| < 0.5:
    snapTo(nearestIndex(offset))
    stop
  offset = clamp(offset + velocity)
  velocity *= 0.93              // 7% energy loss per frame
  request next frame

snapTo(index):
  activeIndex = clamp(index, 0, items.length - 1)
  offset = -activeIndex * stride        // CSS transition handles the visual ease
  fire onSelect(items[activeIndex], activeIndex)
```

## The Core Concept: Velocity from Deltas, Inertia from Decay, GSAP for the Snap

The drag → momentum → snap pipeline splits cleanly across native + GSAP. Velocity sampling and inertia decay are inline JS — small enough to write directly, no need for `GSAP Draggable` or `InertiaPlugin`. The **final snap-to-nearest** is `gsap.to` with `power3.out`, so the eased curve matches the rest of the suite. The card stagger entrance is `gsap.from`. GSAP-core only — no business plugins.

**Velocity sampling**:

```js
const dt = event.timeStamp - lastMoveTime;
if (dt > 0) {
  velocity = ((event.clientX - lastMoveX) / dt) * 16; // px per ~frame
}
```

`dt` is in milliseconds; dividing by it gives px/ms; multiplying by ~16 (one frame at 60Hz) normalises to "px per frame" so the inertia loop can apply velocity directly to offset without re-sampling time. This is intentional: it makes the inertia frame-rate-independent (within reason) without a per-frame `(now - last)` measurement.

**Inertia decay**:

```js
const tick = () => {
  if (Math.abs(velocity) < 0.5) {
    snapTo(nearestIndex(offset));
    return;
  }
  offset = clampOffset(offset + velocity);
  velocity *= 0.93;
  inertiaRaf = requestAnimationFrame(tick);
};
```

Each frame: apply velocity to offset, then bleed off 7% of velocity. Below 0.5 px/frame the user can't perceive the motion, so we snap. The snap is a one-shot CSS transition — `transform: translate3d(...)` with `transition: transform 0.45s cubic-bezier(0.16, 0.84, 0.32, 1)` — the bezier gives a slight overshoot-style ease-out that reads as "settling".

The two values that govern the feel:
- **Decay factor (0.93)**: higher = longer glide; lower = abrupt stop. 0.93 = ~10 frames of perceptible coast at typical flick velocities.
- **Snap threshold (0.5 px/frame)**: roughly 30 px/sec; below this the eye reads the deck as stopped.

## Pointer Capture: Why You Can Drag Off the Track

Without `setPointerCapture`, releasing the pointer outside the track element means the `pointerup` event goes elsewhere, the drag never ends, and the next click misfires. The fix:

```js
function handlePointerDown(event) {
  // …
  (event.target).setPointerCapture(event.pointerId);
}

function handlePointerUp(event) {
  // …
  (event.target).releasePointerCapture(event.pointerId);
}
```

Once captured, every subsequent `pointermove` and `pointerup` from that pointer is delivered to the original target until release, regardless of where the pointer is. This eliminates the "drag broke when I left the page" class of bug that plagues hand-rolled draggables.

## State Flow Diagram

```
       ┌──────────────────────┐
       │  pointerdown          │
       │  • cancel inertia     │
       │  • record origin      │
       │  • setPointerCapture  │
       └──────────┬───────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │   dragging = true     │
       │   pointermove updates │
       │   • offset            │
       │   • velocity sample   │
       └──────────┬───────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │  pointerup            │
       │  • dragging = false   │
       │  • releasePointerCapture
       │  • startInertia()     │
       └──────────┬───────────┘
                  │
                  ▼
   ┌──────────────────────────────┐
   │ inertia rAF loop:             │
   │  while |velocity| >= 0.5:     │
   │    offset += velocity         │
   │    velocity *= 0.93           │
   │  snapTo(nearestIndex(offset)) │
   └──────────────┬───────────────┘
                  │
                  ▼
   ┌──────────────────────────────┐
   │ snapTo(index):                │
   │  activeIndex = clamp(index)   │
   │  offset = -activeIndex*stride │
   │  CSS transition handles ease  │
   │  onSelect(item, index)        │
   └──────────────────────────────┘

   keyboard parallel path:
   ArrowLeft/Right/Home/End → snapTo(...) directly
```

## Props Reference

| Prop            | Type                                              | Default          | Description                                                          |
|-----------------|---------------------------------------------------|------------------|----------------------------------------------------------------------|
| `items`         | `DragGalleryItem[]`                               | required         | Cards in display order.                                              |
| `initialIndex`  | `number`                                          | `0`              | Card to start active.                                                |
| `cardWidth`     | `number`                                          | `220`            | Pixel width of each card.                                            |
| `cardGap`       | `number`                                          | `32`             | Pixel gap between cards.                                             |
| `ariaLabel`     | `string`                                          | `'Drag gallery'` | Wrapper aria-label.                                                  |
| `onSelect`      | `(item: DragGalleryItem, index: number) => void`  | —                | Fires whenever the active card changes (drag-snap, click, keyboard). |
| `class`         | `string`                                          | `''`             | Extra classes on the outer container.                                |

`DragGalleryItem` shape: `{ id, title, eyebrow?, subtitle?, image?, alt? }` — see `$lib/types`.

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `prefers-reduced-motion: reduce` | Inertia loop skipped on release, the gsap snap tween is bypassed, and the deck offset jumps to the nearest index directly. CSS transitions are disabled via media query. |
| User drags past the first/last card | `offset` is clamped to `[minOffset, 0]`; the deck stops at the edge instead of rubber-banding (intentional simplicity). |
| Click on a card immediately after a flick | If `|velocity| > 1`, the click is ignored to avoid stealing a snap that's about to settle. |
| Empty `items` array | `activeIndex` clamps to 0; the wrapper renders with no cards and does not crash. |
| `initialIndex` out of bounds | Clamped into `[0, items.length - 1]` at mount. |
| Pointer leaves the track mid-drag | `setPointerCapture` keeps the move/up events flowing back to the original target so the drag completes cleanly. |
| Multi-touch | Only the first pointer is tracked; subsequent fingers are ignored. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$props`, `onMount`.
- **`gsap` core** (already a project dep) — drives the card-stagger entrance (`gsap.from`) and the snap-on-release tween (`gsap.to` with `power3.out`). No GSAP business plugins (no Draggable / InertiaPlugin / Observer).
- **PointerEvents API** — universally supported. Native pointer drag + `setPointerCapture` for the capture, native rAF for the velocity sampling and inertia decay.

## File Structure

```
src/lib/components/DragGallery/DragGallery.svelte    # implementation
src/lib/components/DragGallery/DragGallery.md        # this file
src/lib/components/DragGallery/DragGallery.test.ts   # vitest unit + behaviour tests
src/lib/types.ts                                     # DragGalleryProps + DragGalleryItem
```
