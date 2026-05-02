# MagicCard — Technical Logic Explainer

## What Does It Do? (Plain English)

MagicCard is a card wrapper that paints a soft radial spotlight following the cursor as it moves across the card. The spotlight fades in on hover, tracks the mouse in real time, and fades out when the cursor leaves. The content inside the card sits on top of the spotlight — perfectly readable, with the lit gradient peeking around the edges.

Think of shining a torch on a dark wall: wherever you point, there's a bright glowing circle. Move the torch, the circle follows. Walk away, the circle fades. That's MagicCard.

## How It Works (Pseudo-Code)

```
state:
  mouseX     = -gradientSize          // start off-screen so spotlight is hidden
  mouseY     = -gradientSize
  isHovering = false

derive bg:
  `radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)`

events:
  on mouseenter:
    isHovering = true
    // CSS opacity transition fades spotlight in

  on mousemove(e):
    rect = e.currentTarget.getBoundingClientRect()
    mouseX = e.clientX - rect.left           // X relative to card
    mouseY = e.clientY - rect.top            // Y relative to card
    // bg is recomputed reactively, gradient repositions instantly

  on mouseleave:
    isHovering = false
    mouseX = -gradientSize                    // park gradient off-screen
    mouseY = -gradientSize
    // CSS opacity transition fades spotlight out

render:
  <div onmouseenter onmousemove onmouseleave>
    <div class="spotlight" style="background: {bg}; opacity: {isHovering ? gradientOpacity : 0}"></div>
    <div class="content"> {@render children?.()} </div>
  </div>
```

The "magic" is one line of `$derived`: every time `mouseX` or `mouseY` changes, the `radial-gradient` string rebuilds with new coordinates, and Svelte writes the new `background` to the spotlight layer. There's no rAF loop, no observer — just reactivity.

## The Core Concept: Reactive Radial Gradient

A radial gradient is a CSS function that takes a centre point, a radius, and a colour ramp. MagicCard parameterises all three:

```css
background: radial-gradient(
  200px circle             /* size */
  at 150px 100px,          /* centre, in card-relative coordinates */
  #146ef5,                 /* core colour */
  transparent 100%         /* fades to fully transparent at the radius */
);
```

When the cursor moves, the `at` coordinates change and the entire gradient re-paints — but it stays on the GPU because `background` is a composited property, not a layout-affecting one. Even at 144 Hz the recomputation is essentially free.

The real machinery is one Svelte 5 `$derived`:

```typescript
let bg = $derived(
  `radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)`
);
```

Whenever `mouseX` or `mouseY` is reassigned, Svelte invalidates `bg` and any element binding to it gets the new string. The opacity transition handles the fade-in/out separately, so a fast cursor never produces a flash — the spotlight follows smoothly from the moment the mouse enters.

## Two-Layer Architecture: Spotlight Behind Content

The card renders two stacked layers:

```
┌────────────────────────────────────────┐
│                                        │
│   ┌──────────────────────────────┐    │  ← Layer 2 (z-10): your content
│   │                              │    │     (text, images, buttons)
│   │      Your content here       │    │
│   │                              │    │
│   └──────────────────────────────┘    │
│                                        │
│           ●  ← Spotlight                │  ← Layer 1 (z-0): radial gradient
│              radial-gradient            │     pointer-events: none
│                                        │
└────────────────────────────────────────┘
```

The spotlight sits at `z-0` with `pointer-events: none`, which keeps it from intercepting clicks meant for the content. The content sits at `z-10`, fully interactive. The host card has the `mouseenter`/`mousemove`/`mouseleave` handlers, so the cursor's position is tracked regardless of which child it's hovering over.

## The "Park Off-Screen" Trick

When the mouse leaves, the spotlight fades out via `opacity` — but during the fade, the gradient is still painted at its last position. If the user hovers back in quickly, they'd see the spotlight pop into the centre rather than appear under the cursor. To prevent that, `mouseleave` moves the gradient *off the card entirely*:

```typescript
function handleMouseLeave() {
  isHovering = false;
  mouseX = -gradientSize;
  mouseY = -gradientSize;
}
```

With `gradientSize = 200`, the centre is now at `(-200, -200)` — outside the card. The fade-out completes with the gradient invisible regardless. The next `mouseenter` triggers `mousemove`, which writes a new position before the opacity has finished transitioning back up.

## Coordinate Conversion: Page → Card

`event.clientX` is the mouse position in viewport coordinates. The gradient needs card-relative coordinates so `(0, 0)` is the card's top-left. The conversion is one `getBoundingClientRect`:

```
rect = card.getBoundingClientRect()    // card's position in viewport
x    = event.clientX - rect.left       // mouse X within the card
y    = event.clientY - rect.top        // mouse Y within the card
```

Example: card at viewport position `(100, 200)`, cursor at `(150, 250)`. The cursor is at `(50, 50)` inside the card — that's where the gradient centre should sit.

`getBoundingClientRect` is fast enough to call on every `mousemove`. The compositor doesn't care — `background` is GPU-accelerated.

## State Flow Diagram

```
                    ┌────────────────────────┐
                    │  IDLE                  │
                    │  isHovering = false    │
                    │  mouseX, mouseY parked │
                    │  off-screen            │
                    │  spotlight opacity = 0 │
                    └───────────┬────────────┘
                                │
                  mouseenter   │
                                ▼
                    ┌────────────────────────┐
                    │  HOVERING              │
                    │  isHovering = true     │
                    │  spotlight fades in    │
                    │  to gradientOpacity    │
                    └───────────┬────────────┘
                                │
                                │ mousemove(e)
                                ▼
                    ┌────────────────────────┐
                    │  TRACKING              │
                    │  mouseX, mouseY = e    │
                    │  bg recomputes via     │
                    │  $derived              │
                    │  spotlight repositions │
                    └───────────┬────────────┘
                                │
                                │ ↺ same state, $derived
                                │   re-runs on each move
                                │
                                │ mouseleave
                                ▼
                    ┌────────────────────────┐
                    │  PARKING               │
                    │  isHovering = false    │
                    │  mouseX, mouseY → off  │
                    │  spotlight fades out   │
                    └───────────┬────────────┘
                                │
                                ▼
                          back to IDLE
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gradientSize` | `number` | `200` | Spotlight radius in pixels. |
| `gradientColor` | `string` | `'#262626'` | Core colour of the spotlight; fades to transparent. |
| `gradientOpacity` | `number` | `0.8` | Spotlight opacity at full intensity (0–1). |
| `borderColor` | `string` | `'#146ef5'` | Reserved for border-highlight variants. |
| `class` | `string` | `''` | Extra classes for the card wrapper. |
| `children` | `Snippet` | — | Content to render on top of the spotlight. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Card is wider than `gradientSize × 2` | Most of the card is unlit; the spotlight is genuinely a torch beam rather than a wash. This is the intended look. |
| `gradientOpacity = 0` | Spotlight is invisible even on hover. The component still tracks the cursor — useful if a parent wants to disable the effect via prop without unmounting. |
| `gradientOpacity = 1` | Spotlight is at full intensity; the card looks like a single bright disc following the cursor. |
| Touch device with no mouse events | `mouseenter`/`mousemove` never fire; `isHovering` stays false; the spotlight is permanently hidden. The card content is unaffected. |
| Card sits inside a scrolling container | `getBoundingClientRect` reports viewport-relative coordinates, which already account for scroll. The maths is correct without extra adjustment. |
| Card resized during hover | The next `mousemove` reads a fresh `rect`; the gradient repositions correctly. No flicker. |
| User has `prefers-reduced-motion: reduce` | The opacity fade is instant rather than a 300 ms transition. The gradient still tracks the cursor — that's direct manipulation, not animation. |
| `class` overrides `position` to `static` | The spotlight needs a positioned ancestor to absolute-position itself against. The card wrapper already sets `position: relative`; user classes should not override it. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$props`, and snippets. The single `$derived` for `bg` is the heart of the component.
- **`$lib/utils`** — `cn()` for class merging.
- **TailwindCSS** — utility classes for layout (the host app must have Tailwind configured).
- Zero animation libraries — the fade is pure CSS, the gradient repositioning is pure reactivity.

## File Structure

```
src/lib/components/MagicCard.svelte         # implementation
src/lib/components/MagicCard.md             # this file
src/lib/components/MagicCard.test.ts        # vitest unit tests
src/routes/magiccard/+page.svelte           # demo page
src/lib/types.ts                            # MagicCardProps
```
