# HoloCard — Technical Logic Explainer

## What Does It Do? (Plain English)

HoloCard wraps a slot of content in a holographic-foil shimmer. As the cursor moves across the element, a multi-coloured conic-gradient ring rotates around its centre and a diagonal "sheen" highlight slides across — the same effect you've seen on rare Pokémon cards or holographic stickers. The slotted content stays underneath, fully interactive; the foil and sheen are pointer-event-none decoration on top.

Think of tilting a glossy collectible in your hand under a desk lamp. The light catches the foil at a different angle for every cursor position, and the rainbow only appears at the angle where the foil is briefly facing you head-on.

## How It Works (Pseudo-Code)

```
state:
  intensity = 'subtle' | 'iridescent' | 'cosmic'
  palette   = 'rainbow' | 'pastel' | 'cosmic' | 'gold'
  hue       = 0           // current foil rotation (degrees)
  sheen     = 0           // current sheen alpha (0..sheenAlpha)
  reduced   = false       // prefers-reduced-motion probe

derive:
  cfg     = pickIntensity(intensity)
          = { saturation, sheenAlpha, paletteSize }
  colors  = pickPalette(palette)         // string[7]
  gradientStops = colors.join(', ')

events:
  on mount:
    reduced = isReducedMotion()

  on pointermove(e) over host (skip if reduced):
    rect  = host.getBoundingClientRect()
    angle = cursorAngle(e.clientX, e.clientY, rect)
          = atan2(e.clientY - cy, e.clientX - cx) → degrees in [0, 360)
    hue   = hueAtAngle(angle, cfg.paletteSize)
          = (angle * paletteSize) mod 360
    sheen = sheenAtAngle(angle, cfg)
          = clamp01( (sin(angle°) * 0.5 + 0.5) * sheenAlpha )

  on pointerleave host:
    hue = 0
    sheen = 0

render:
  div.holo onpointermove onpointerleave
           style: --holo-hue, --holo-sheen, --holo-saturation
    div.holo-content { @render children() }
    div.holo-foil   aria-hidden
                    style="background: conic-gradient(from {hue}deg, {gradientStops})"
                    css: opacity: var(--holo-saturation),
                         mix-blend-mode: color-dodge
    div.holo-sheen  aria-hidden
                    css: background: linear-gradient(105deg, transparent 30%,
                                       rgba(255,255,255, 0.85*sheen) 50%,
                                       transparent 70%),
                         mix-blend-mode: overlay
```

The component does **one `getBoundingClientRect()` and a handful of trig per `pointermove` event** — no `requestAnimationFrame`, no timer, no canvas. When the pointer leaves, every value resets to zero and the GPU stops compositing animated changes.

## The Core Concept: Cursor Angle → Conic Hue

The visual is two CSS effects driven by one geometric measurement.

### Step 1: angle from centre

```ts
function cursorAngle(cursorX, cursorY, rect) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;
  const dx = cursorX - cx;
  const dy = cursorY - cy;
  let deg = atan2(dy, dx) * 180 / π;
  if (deg < 0) deg += 360;
  return deg;   // [0, 360)
}
```

`Math.atan2(dy, dx)` returns the angle of the cursor's position vector relative to the element's centre, in radians from `-π` to `π`. Convert to degrees and shift to `[0, 360)` and you have a single number that tells you "where on the clock face is the cursor right now":

```
                    270° (north / top)
                          │
                          │
        180° (west) ──────┼────── 0° (east / right)
                          │
                          │
                     90° (south / bottom)
```

### Step 2: angle → foil hue

```ts
function hueAtAngle(angle, paletteSize) {
  const mult = max(1, min(paletteSize, 8));
  return ((angle * mult) % 360 + 360) % 360;
}
```

Multiplying by `paletteSize` makes the hue cycle multiple times as the cursor sweeps around the element. `paletteSize=3` (subtle) means the conic gradient rotates 3 full cycles for one full cursor sweep — denser shimmer. `paletteSize=7` (cosmic) gives 7 cycles per sweep — even denser. This is the parameter that takes HoloCard from "calm iridescent" to "psychedelic".

The hue value drives the conic gradient's `from` angle:

```svelte
<div
  class="holo-foil"
  style="background: conic-gradient(from {hue}deg, {gradientStops});"
></div>
```

A conic gradient sweeps colour around the centre — exactly the geometry you'd see on a sticker rotated in light. As the cursor moves, the `from` angle changes, and the foil appears to rotate. Every palette closes its ring (first colour == last colour) so the rotation has no visible seam.

### Step 3: angle → sheen alpha

```ts
function sheenAtAngle(angle, intensity) {
  const t = sin(angle * π / 180) * 0.5 + 0.5;   // [0, 1]
  return clamp01(t * intensity.sheenAlpha);
}
```

`sin(angle°) * 0.5 + 0.5` is a smooth `[0, 1]` cycle as the angle goes around: 0 at `angle=0`/`180°`/`360°`, peaks at `90°`/`270°`. Multiply by the intensity's `sheenAlpha` and you get a sheen brightness that swells when the cursor is "above" or "below" centre, and fades when it's left or right.

The result feeds a single CSS variable used inside a fixed-direction linear gradient:

```css
.holo-sheen {
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgba(255, 255, 255, calc(0.85 * var(--holo-sheen, 0))) 50%,
    transparent 70%
  );
  mix-blend-mode: overlay;
}
```

The sheen is always at 105° — only its *intensity* changes with cursor angle. This is the single trick that distinguishes HoloCard from "the foil is the only thing happening". The diagonal highlight reads like a glossy reflection sliding across the surface, even though it's never moving.

### Why two blend modes?

```css
.holo-foil  { mix-blend-mode: color-dodge; }
.holo-sheen { mix-blend-mode: overlay;     }
```

- **`color-dodge`** brightens the underlying content based on the foil's colour. Dark content stays mostly dark; bright content saturates toward the foil's hue. This matches how holographic foil actually works — it's reflective, not opaque.
- **`overlay`** combines `multiply` (for darks) and `screen` (for lights) — the sheen brightens highlights and darkens shadows, faking a glossy specular highlight.

Layer them and the slot below reads as a foil-coated surface, not as content with stickers slapped on top.

## CSS Animation Strategy

There are no CSS keyframes in HoloCard. The "animation" comes entirely from the inline `--holo-hue` and `--holo-sheen` variables changing per pointer event, plus two CSS `transition` rules to smooth the change between frames:

```css
.holo-foil  { transition: opacity 200ms ease-out; }
.holo-sheen { transition: background 80ms linear; }
```

The 200 ms foil transition is intentionally slower than the 80 ms sheen — the foil reads as "settling" into a new colour, while the sheen tracks the cursor responsively.

`prefers-reduced-motion: reduce` is honoured three ways:
1. `pointermove` returns early — `if (reduced) return;` — so `hue` and `sheen` stay at their defaults.
2. The `.reduced` class lowers the foil opacity and replaces the sheen gradient with a static one.
3. A `@media` block belt-and-braces those two changes in case the JS probe misfires.

## Performance

- **One `getBoundingClientRect()` per `pointermove`.** Modern browsers cache rect geometry between events at the same scroll position, so this is cheap.
- **Constant-time math per event** — one `atan2`, one `sin`, two multiplications. ~µs per event.
- **No rAF, no timers, no canvas.** The component does no work between events.
- **`mix-blend-mode` is GPU-composited** when the layer has `position: absolute` + `pointer-events: none` + `isolation: isolate` on the parent — all of which HoloCard sets. The compositor handles the blending without re-painting the underlying content.
- **Steady-state cost is zero JS.** When the cursor isn't moving, no work happens. When the cursor leaves, all values reset to 0 and the layers settle to their static defaults.
- **Stack many HoloCards on a page?** Each adds two compositor layers (`foil` + `sheen`). A grid of 50 thumbnails uses ~100 layers, which modern compositors handle fine. The pointer handler is per-instance (`onpointermove` is set on each `.holo`), so cost scales linearly with the number of *visible, hovered* instances — not with the total count.

## State Flow Diagram

```
                  ┌─────────────────────────────┐
                  │  initial / SSR              │
                  │  hue = 0, sheen = 0         │
                  │  foil at default opacity    │
                  └────────────┬────────────────┘
                               │ mount
                               ▼
                  ┌─────────────────────────────┐
                  │  reduced = isReducedMotion()│
                  └────────────┬────────────────┘
                               │
              ┌────────────────┼─────────────────┐
              │                                  │
              │ reduced = true                   │ reduced = false
              ▼                                  ▼
       ┌──────────────┐                  ┌──────────────────┐
       │  static foil │                  │  idle            │
       │  no pointer  │                  │  hue=0, sheen=0  │
       │  reaction    │                  └────────┬─────────┘
       └──────────────┘                           │ pointermove
                                                  ▼
                                         ┌──────────────────┐
                                         │  shimmering      │
                                         │  hue, sheen      │
                                         │  driven by cursor│
                                         │  angle           │
                                         └────────┬─────────┘
                                                  │ pointerleave
                                                  ▼
                                         ┌──────────────────┐
                                         │  decay to idle   │
                                         │  CSS transitions │
                                         │  smooth back to 0│
                                         └──────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intensity` | `'subtle' \| 'iridescent' \| 'cosmic'` | `'iridescent'` | Tunes foil opacity (`saturation`), sheen alpha, palette stop count. Unknown names fall back to `iridescent`. |
| `palette` | `'rainbow' \| 'pastel' \| 'cosmic' \| 'gold'` | `'rainbow'` | Colour set used in the conic gradient. Unknown names fall back to `rainbow`. |
| `children` | `Snippet` | optional | Content to wrap. Stays in the DOM and a11y tree. |

The intensity preset table:

| Intensity    | saturation (foil opacity) | sheenAlpha | paletteSize |
|--------------|---------------------------|------------|-------------|
| `subtle`     | 0.18                      | 0.25       | 3           |
| `iridescent` | 0.32                      | 0.45       | 5           |
| `cosmic`     | 0.50                      | 0.60       | 7           |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Unknown `intensity` or `palette` | Falls back to `iridescent` / `rainbow` via `pickIntensity` / `pickPalette`. |
| Cursor on a touch device (no `pointermove`) | Component renders foil and sheen at their static defaults; no shimmer, no jitter. |
| `prefers-reduced-motion: reduce` | Pointer handlers no-op; `.reduced` class lowers foil opacity and freezes sheen to a static linear gradient. |
| Component scrolled offscreen | Pointer events don't fire when the cursor isn't over the element; no work happens. |
| Wrapper resized at runtime | `getBoundingClientRect()` is read fresh on each pointermove, so resize is handled implicitly. No `ResizeObserver` needed. |
| Hi-DPI / retina | Conic gradient is resolution-independent; foil and sheen scale crisply. |
| GPU acceleration unavailable | `mix-blend-mode` falls back to CPU compositing; performance suffers on large surfaces but the visual still works. |
| Browser without `mix-blend-mode: color-dodge` (very old) | Foil renders opaquely on top of content instead of dodging — still recognisable, less premium. |
| `host` ref is `undefined` | Pointer handler short-circuits at `if (!host) return;` — no errors. |
| Multiple instances side-by-side | Each tracks its own pointer events on its own `.holo` element; no global listeners, no contention. |
| Rapid pointer-flick across element | Each `pointermove` recomputes hue/sheen; CSS transitions smooth between frames. No flicker. |
| `host.getBoundingClientRect()` returns 0×0 | `cursorAngle` returns the angle from a degenerate centre — typically `Math.atan2(0, 0) = 0`. Foil renders without rotation. |

## Dependencies

- **Svelte 5.x** — `$props`, `$state`, `$derived`, snippets, `bind:this`. Module-script exports (`pickIntensity`, `pickPalette`, `cursorAngle`, `hueAtAngle`, `sheenAtAngle`, `clamp01`, `isReducedMotion`) for unit testing.
- Zero external dependencies — pure CSS gradients, no canvas, no animation library, no SVG.

## File Structure

```
src/lib/components/HoloCard.svelte         # implementation + module-level helpers
src/lib/components/HoloCard.md             # this file (rendered inside ComponentPageShell)
src/lib/components/HoloCard.test.ts        # vitest unit tests
src/routes/holocard/+page.svelte           # demo page
```
