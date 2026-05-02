# PixelTrail — Technical Logic Explainer

## What Does It Do? (Plain English)

PixelTrail wraps any region — a hero section, a card, a whole page — and emits a chain of small coloured pixels that follow the cursor as it moves. Each pixel fades, scales down, and drifts upward on a CSS keyframe before self-cleaning, so the visible trail looks like a comet tail behind the pointer. The density is throttled by distance (one pixel per ~size pixels of cursor travel) so a fast drag and a slow drag produce visually similar trails.

It is a decoration only. The wrapped content keeps its native click and focus semantics; the trail layer is `aria-hidden` and has `pointer-events: none`. Reduced-motion users see a static wrapper, no movement.

## How It Works (Pseudo-Code)

```
state:
  pixels[]   = []             // active pixel sprites
  lastX, lastY                // last cursor position (for throttle)
  hasLast    = false
  colorIndex = 0              // walks through palette colours
  reducedMotion              // capability flag

derived:
  sizeConfig    = pickSize(size)         // {px, throttlePx}
  paletteConfig = pickPalette(palette)   // {colors[], shadow}
  cappedLength  = round(clamp trailLength to [0, 64])
  safeDuration  = round(clamp duration  to [0, 2000])

on mount:
  reducedMotion = isReducedMotion()

on mousemove(event):
  if reducedMotion: return
  rect = wrapper.getBoundingClientRect()
  x    = event.clientX - rect.left
  y    = event.clientY - rect.top

  if hasLast:
    threshold² = throttlePx²
    if distanceSquared(lastX, lastY, x, y) < threshold²:  return    // throttle
  lastX, lastY, hasLast = x, y, true

  color = paletteConfig.colors[colorIndex % colors.length]
  colorIndex++
  id = nextTrailId()                // module-scoped counter

  pixels.push({ id, x, y, color })
  while pixels.length > cappedLength: pixels.shift()    // drop oldest

  schedule(setTimeout, safeDuration + 60):
    pixels = pixels.filter(p => p.id !== id)            // self-clean

on mouseleave:
  hasLast = false                                        // reset throttle anchor

render:
  wrapper { onmousemove, onmouseleave }
    { children }
    div.trail-layer aria-hidden
      for each pixel:
        span.pixel
          left, top, --color, --shadow, --size, --duration

CSS:
  .pixel { animation: pixel-fade var(--duration) cubic-bezier(.32, 0, .67, 0) forwards; }
  @keyframes pixel-fade {
    0%   { transform: scale(1) translateY(0);   opacity: 1; }
    60%  { opacity: 0.8; }
    100% { transform: scale(0.2) translateY(-6px); opacity: 0; }
  }
```

## The Core Concept: Distance-Throttled Spawning Plus Self-Cleaning Sprites

Two bits of logic make the trail feel right and stay cheap.

**1. Distance throttling.** A naïve "spawn one pixel per mousemove" implementation produces a thick clump on slow drags and a sparse line on fast drags — opposite to the desired behaviour. Throttling by *distance travelled* (rather than by *time*) decouples the visible density from cursor speed:

```
if distanceSquared(lastX, lastY, x, y) < throttlePx²: skip
```

`distanceSquared` is used in preference to `Math.hypot` because we only need a comparison — squaring both sides of `dist < threshold` avoids the `sqrt`. With the medium preset (`throttlePx = 10`), a slow cursor barely beating the threshold spawns ~100 pixels per second; a fast flick of 800 px in 16 ms spawns ~80 pixels — visually similar.

**2. Self-cleaning sprites.** Each pixel carries a unique id (`nextTrailId()` from a module-scoped counter), and a `setTimeout` removes it from `pixels[]` after `duration + 60 ms`. The 60 ms cushion absorbs rAF jitter at the tail end so a pixel finishing late doesn't briefly render at scale 0.2 before being garbage-collected.

The `pixels.shift()` cap on `cappedLength` is the second guardrail: even if the cursor moves so fast that timeouts haven't fired yet, the array never grows past 64 entries (the hard cap), so memory stays bounded under any cursor pattern.

```
   slow cursor                fast cursor
   ●●●●●●●●●●●●               ●  ●  ●  ●  ●  ●
   │ density throttled        │  spacing matches throttlePx
   │ to ≥ throttlePx between  │
   │ consecutive spawns       │
```

The visible *colour* walks through the palette one entry at a time per spawn, so a stationary cursor that emits one pixel will use one colour; a moving cursor cycles through the palette in order, giving the trail a chromatic wash rather than a uniform stripe.

## CSS Animation Strategy

The pixel itself is a single `<span>` with five CSS variables. The keyframe runs once per pixel — `forwards` means the final keyframe sticks, but we self-remove before it would matter visually.

```css
.pixel {
  position: absolute;
  width: var(--size);
  height: var(--size);
  margin-left: calc(var(--size) / -2);   /* centred on the cursor */
  margin-top:  calc(var(--size) / -2);
  background: var(--color);
  box-shadow: 0 0 calc(var(--size) * 1.25) var(--shadow);
  animation: pixel-fade var(--duration) cubic-bezier(0.32, 0, 0.67, 0) forwards;
  pointer-events: none;
  will-change: opacity, transform;
}

@keyframes pixel-fade {
  0%   { transform: scale(1)   translateY(0);   opacity: 1; }
  60%  { opacity: 0.8; }
  100% { transform: scale(0.2) translateY(-6px); opacity: 0; }
}
```

The cubic-bezier `(0.32, 0, 0.67, 0)` is a deliberately ugly-feeling ease — fast in, slow out, with a held middle. It makes the pixel *linger* visibly before it dies, which is what gives the trail its presence. A linear or ease-out curve makes the pixels look like they're being deleted on a timer rather than fading.

The translateY offset (`0 → -6px`) is small but important — the pixel drifts upward as it dies, so the trail has a slight buoyancy. Without it the pixels would just fade in place, which reads as static.

`@media (prefers-reduced-motion: reduce) { .pixel { display: none; } }` is the safety net; the JS handler also short-circuits before any pixel is created.

## State Flow Diagram

```
                ┌────────────────────────┐
                │  IDLE                  │
                │  pixels = []           │
                │  hasLast = false       │
                └──────────┬─────────────┘
                           │ mousemove enters wrapper
                           ▼
                ┌────────────────────────┐
                │  THROTTLE CHECK        │
                │  dist² >= threshold² ? │
                └─┬──────────────┬───────┘
                  │ no (skip)    │ yes
                  │              ▼
                  │     ┌────────────────────────┐
                  │     │  SPAWN PIXEL           │
                  │     │  push { id, x, y, c }  │
                  │     │  cap to cappedLength   │
                  │     │  schedule self-clean   │
                  │     └──────────┬─────────────┘
                  │                │ duration + 60ms timer
                  ▼                ▼
                ◄────  back to THROTTLE CHECK or IDLE  ────►

  mouseleave: hasLast = false (next move starts fresh)
  prefers-reduced-motion: reduce: handler bails immediately; pixels[] never populated
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Pixel size preset. Maps to `{px, throttlePx}` via `pickSize`. small=4/6, medium=8/10, large=16/18. |
| `palette` | `'mono-white' \| 'cyber-cyan' \| 'sunset-warm'` | `'mono-white'` | Colour palette. Pixels cycle through the palette in spawn order. |
| `trailLength` | `number` | `16` | Maximum live pixels at once. Clamped to `[0, 64]`. |
| `duration` | `number` | `700` | Per-pixel lifetime in ms. Clamped to `[0, 2000]`. |
| `class` | `string` | `''` | Extra classes on the wrapper. |
| `children` | `Snippet` | required | Wrapped content. Trail floats over it but does not intercept events. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Very fast cursor flick | Distance throttle limits spawn rate; old pixels are dropped via `pixels.shift()` once `cappedLength` is hit. Memory stays bounded. |
| Cursor stops for several seconds | No more `mousemove` events fire; existing pixels finish their animation and self-clean. The trail dissolves. |
| Cursor leaves and re-enters quickly | `mouseleave` resets `hasLast`. The next move spawns immediately rather than throttling against a stale anchor on the other side of the wrapper. |
| `trailLength = 0` | `cappedLength` falls back to 16 via the `|| 16` guard. To truly disable, omit the component. |
| Wrapped element internal scrolling | The wrapper's bounding rect doesn't move with the inner scroll, so the trail lands on cursor-position relative to the wrapper, not the scrolled content. Usually correct for hero/card use cases. |
| `prefers-reduced-motion: reduce` | Mousemove handler bails before touching state. CSS `@media` rule additionally hides `.pixel` if any somehow leak into the DOM. |
| Touch device with no mouse events | Mousemove never fires; trail layer stays empty. Wrapper renders as plain children. |
| Component unmounts mid-trail | Active timeouts reference state owned by the unmounted instance — they no-op when they fire. The DOM nodes go with the component. |

## Dependencies

- **Svelte 5** — `$state`, `$derived`, `$props`, `Snippet`, `onMount`.
- **`<script module>`** exports — `pickSize`, `pickPalette`, `clamp01`, `clampPositive`, `distanceSquared`, `nextTrailId`, `isReducedMotion`. All pure, testable without a DOM.
- **Zero external libraries** — no animation library, no canvas. Pure CSS keyframes + DOM sprites.

## File Structure

```
src/lib/components/PixelTrail.svelte          # implementation
src/lib/components/PixelTrail.md              # this explainer
src/lib/components/PixelTrail.test.ts         # unit tests for exported helpers
src/routes/pixeltrail/+page.svelte            # demo page
```
