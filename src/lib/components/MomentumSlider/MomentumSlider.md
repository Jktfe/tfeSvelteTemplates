# MomentumSlider — Technical Logic Explainer

## What Does It Do? (Plain English)

A horizontal carousel of cards with perspective depth — the active card sits flat, neighbours rotate into the page like a fanned hand of cards. Drag with your mouse, finger, or trackpad and the deck flicks with momentum; release and it snaps to the nearest card. Click the active card and it expands into a centred modal with a backdrop fade — a "handshake" between the inline card and the overlay. Click anywhere outside (or hit Escape) to close.

Use it for editorial product showcases, kinetic hero sections, and gallery-grade portfolio rotators where each card earns a deeper view.

## How It Works (Pseudo-Code)

```
state:
  activeIndex = clamp(initialIndex, [0, items.length-1])
  offset = 0                   // px translation of the track
  velocity = 0                 // px per frame, set during drag
  dragging = false
  expanded = null              // active item if modal is open
  prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches

derived:
  stride = cardWidth + cardGap
  minOffset = -(items.length - 1) * stride

per card render:
  distance = i - activeIndex
  rotateY = distance * -8°
  scale   = max(0.78, 1 - |distance| * 0.06)
  opacity = max(0.35, 1 - |distance| * 0.18)
  shadow-strength = (i === activeIndex) ? 1 : 0

events:
  pointerdown → cancel inertia, record (clientX, offset, time), setPointerCapture
  pointermove → offset = clamp(originOffset + dx); sample velocity
  pointerup   → startInertia()

  card click → if (i === activeIndex) expand(i) else snapTo(i)
  Enter on focused wrapper → expand(activeIndex)
  Escape inside modal → close()

inertia loop (rAF):
  while (|velocity| >= 0.5):
    offset = clamp(offset + velocity); velocity *= 0.93
  snapTo(nearestIndex(offset))

snap (gsap.to with power3.out):
  tween offset → -index * stride over 0.55s; onUpdate writes offset

expand(i) — modal handshake (gsap.timeline):
  set expanded = items[i]
  next frame:
    backdrop fadeIn (0.35s, power2.out)
    modal scale 0.92→1 + opacity 0→1 + y 12→0 (0.45s, power3.out, +0.05s)

close() — modal release (gsap.timeline):
  modal scale 1→0.95 + opacity 1→0 + y 0→8 (0.3s, power2.in)
  backdrop fadeOut (0.3s, power2.in, +0.05s)
  onComplete: expanded = null
```

## The Core Concept: Per-Card Distance → Perspective Math

Each card's visual style is a pure function of its distance from the active index. Three CSS custom properties capture the entire 3D effect:

```js
const distance = i - activeIndex;              // signed (-N … +N)
const absDist  = Math.abs(distance);

style="--rotate: {distance * -8}deg;
       --scale: {Math.max(0.78, 1 - absDist * 0.06)};
       --opacity: {Math.max(0.35, 1 - absDist * 0.18)};
       --shadow-strength: {i === activeIndex ? 1 : 0};"
```

```css
.ms-card {
  transform: rotateY(var(--rotate, 0)) scale(var(--scale, 1));
  opacity: var(--opacity, 1);
  box-shadow: 0 calc(28px * var(--shadow-strength, 0)) 64px -20px rgba(15, 23, 42, 0.32);
}

.ms-track {
  perspective: 1200px;            /* on the wrapper */
  transform-style: preserve-3d;   /* on the track */
}
```

The signed `distance` is intentional: cards to the right of active get negative rotation (turning their front toward the user from the right), cards to the left get positive rotation (mirroring). This creates the fanned look without separate left/right CSS.

The `Math.max` clamps prevent cards far off-screen from going invisible (opacity floor 0.35) or shrinking into nothing (scale floor 0.78). A scrollable carousel of 50 items still has the deepest cards readable, just dim.

`--shadow-strength` is a binary 0/1 multiplier so only the active card carries the heavy editorial drop-shadow. Neighbours stay flat.

## The Modal Handshake: GSAP Timeline

Click the active card and the inline card-to-modal transition is two simultaneous tweens orchestrated by `gsap.timeline()`:

```js
const tl = gsap.timeline();
tl.fromTo(backdropEl, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0);
tl.fromTo(modalEl,
  { scale: 0.92, opacity: 0, y: 12 },
  { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' },
  0.05  // small offset so the modal arrives just after the backdrop starts fading in
);
```

The 0.05s stagger between backdrop and modal is the "handshake" — the eye sees the dark layer arrive *first*, then the modal pops in over it. Without the stagger the two arrive simultaneously and read as one event. With too much (>0.15s) the modal feels delayed. The 0.05s sweet spot is fast enough to read as one motion, with just enough lead for the backdrop to register.

Closing reverses the order — modal scales out + falls slightly, backdrop fades out 50ms behind. The `onComplete: () => { expanded = null }` removes the modal from the DOM after the tween finishes, so React-style "exit" animation is preserved without a portal.

## State Flow Diagram

```
                     ┌───────────────────────────────┐
                     │  pointerdown → cancel inertia │
                     │  pointermove → offset, velocity│
                     │  pointerup   → startInertia()  │
                     └────────────┬──────────────────┘
                                  │
                                  ▼
                     ┌───────────────────────────────┐
                     │  inertia rAF loop              │
                     │  velocity *= 0.93 each frame   │
                     │  → snapTo(nearestIndex)         │
                     └────────────┬──────────────────┘
                                  │
                                  ▼
                     ┌───────────────────────────────┐
                     │  snapTo(index):                 │
                     │   gsap.to({value: offset},     │
                     │     value: -index*stride,      │
                     │     ease: power3.out, 0.55s    │
                     │   )                             │
                     │   onSelect(item, index)         │
                     └────────────┬──────────────────┘
                                  │
                                  │  click on active card
                                  ▼
                     ┌───────────────────────────────┐
                     │  expand(index)                 │
                     │   expanded = items[index]      │
                     │   gsap.timeline:                │
                     │     backdrop fadeIn  @0       │
                     │     modal scale-in   @0.05    │
                     │   onExpand(item, index)        │
                     └────────────┬──────────────────┘
                                  │
                                  │  click backdrop / Escape
                                  ▼
                     ┌───────────────────────────────┐
                     │  close()                       │
                     │   gsap.timeline:                │
                     │     modal scale-out  @0       │
                     │     backdrop fadeOut @0.05    │
                     │   onComplete: expanded = null │
                     └───────────────────────────────┘
```

## Props Reference

| Prop            | Type                                                  | Default              | Description                                                          |
|-----------------|-------------------------------------------------------|----------------------|----------------------------------------------------------------------|
| `items`         | `MomentumSliderItem[]`                                | required             | Cards in display order.                                              |
| `initialIndex`  | `number`                                              | `0`                  | Card to start active.                                                |
| `cardWidth`     | `number`                                              | `280`                | Pixel width of each card.                                            |
| `cardGap`       | `number`                                              | `32`                 | Pixel gap between cards.                                             |
| `ariaLabel`     | `string`                                              | `'Momentum slider'`  | Wrapper aria-label.                                                  |
| `onSelect`      | `(item: MomentumSliderItem, index: number) => void`   | —                    | Fires whenever the active card changes (drag-snap, click, keyboard). |
| `onExpand`      | `(item: MomentumSliderItem, index: number) => void`   | —                    | Fires when the active card opens into the modal.                     |
| `class`         | `string`                                              | `''`                 | Extra classes on the outer container.                                |

`MomentumSliderItem` shape: `{ id, title, eyebrow?, subtitle?, description?, image?, alt?, color? }` — see `$lib/types`.

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `prefers-reduced-motion: reduce` | Inertia loop disabled (snaps directly), modal handshake skips the timeline (modal appears/disappears instantly). |
| User clicks a non-active card | `snapTo(thatIndex)` instead of `expand` — first click brings it to centre, second opens it. |
| Empty `items` array | Wrapper renders without cards; activeIndex clamped to 0; modal logic never fires. |
| `initialIndex` out of bounds | Clamped into `[0, items.length - 1]` at mount. |
| Pointer leaves the wrapper mid-drag | `setPointerCapture` keeps move/up flowing back to the original target so the drag completes cleanly. |
| Multi-touch | Only the first pointer is tracked. |
| Modal open, user presses Tab / Shift+Tab | Focus is trapped inside the modal — `handleDialogKeydown` cycles forward/backward through the focusable elements; first → last on Shift+Tab from first, last → first on Tab from last. |
| Modal open, user presses Escape | The modal's `handleDialogKeydown` calls `close()` directly, so Escape works whether focus is on the close button, inside the dialog body, or on the dialog itself. Focus restores to the invoking card via `lastFocusedEl?.focus()` on close. |
| `description` missing on item | Modal renders eyebrow + title + close only, no body text. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$props`, `onMount`.
- **`gsap` core** (already a project dep) — drives snap easing + the modal handshake timeline. No GSAP business plugins.
- **PointerEvents API + `requestAnimationFrame`** — native pointer drag, velocity sampling, inertia decay.
- **CSS `perspective` + `preserve-3d`** — universally supported.

## File Structure

```
src/lib/components/MomentumSlider/MomentumSlider.svelte    # implementation
src/lib/components/MomentumSlider/MomentumSlider.md        # this file
src/lib/components/MomentumSlider/MomentumSlider.test.ts   # vitest unit + behaviour tests
src/lib/types.ts                                           # MomentumSliderProps + MomentumSliderItem
```
