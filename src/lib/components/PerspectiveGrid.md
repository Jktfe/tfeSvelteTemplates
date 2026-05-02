# PerspectiveGrid — Technical Logic Explainer

## What Does It Do? (Plain English)

PerspectiveGrid wraps a slot of content and paints a TRON / synthwave / arcade-tunnel grid behind it — endless lines drifting toward the viewer, vanishing at a horizon line. The slotted child stays in front, fully interactive; the grid is decorative paint that ignores clicks and the cursor. You can switch between three intensities (`calm` / `standard` / `rush`), three colour modes (`mono` / `neon` / `wireframe`), and toggle a mirrored ceiling to turn the surface into a tunnel.

Think of it as the floor of an old vector arcade game. The trick is that the lines aren't moving — only the *background-position* of a repeating pattern is. The plane stays geometrically still; the texture flows over it.

## How It Works (Pseudo-Code)

```
state:
  intensity   = 'calm' | 'standard' | 'rush'
  mode        = 'mono' | 'neon' | 'wireframe'
  ceiling     = false
  animated    = true
  opacity     = 1
  runAnimation = true   // gated by isReducedMotion + prop

derive:
  cfg            = pickIntensity(intensity)
                 = { durationS, cellPx, lineOpacity }
  resolvedMode   = pickMode(mode)
  resolvedOpacity = clamp01(opacity)

onMount:
  if animated AND !isReducedMotion(): runAnimation = true
  else:                                runAnimation = false

reactive effect:
  if !animated: runAnimation = false   // runtime opt-out

render:
  div.pg-wrapper
    div.pg-stage (mask-image: linear-gradient horizon fade)
      div.pg-3d   (perspective: 600px; preserve-3d)
        div.pg-plane.pg-floor    (rotateX(60deg), tile bg)
        div.pg-plane.pg-ceiling  (rotateX(-60deg), tile bg)  [if ceiling]
    div.pg-content
      {@render children()}     // slot stays z-index: 1, above stage

CSS animation:
  .pg-animated .pg-floor   { animation: pg-drift duration linear infinite }
  .pg-animated .pg-ceiling { animation: pg-drift-reverse … }

  @keyframes pg-drift {
    from { background-position: 0 0 }
    to   { background-position: 0 var(--pg-cell) }
  }
  // Shifting by exactly one cell makes the loop seamless —
  // the grid reads as continuously flowing.
```

The whole thing is **pure CSS** after mount. No `requestAnimationFrame`, no canvas, no WebGL, no `IntersectionObserver`, no `ResizeObserver`. The only JavaScript work is a single `isReducedMotion()` probe and a `$effect` that flips `runAnimation` if the `animated` prop changes.

## The Core Concept: Faking Receding 3D with One CSS Trick

The visual is geometrically a 3D scene — a flat plane lying on the floor, tilted away from the camera. The implementation is shockingly simple because of one observation:

> **A repeating grid pattern is identical to itself when shifted by exactly one cell.**

So instead of moving the plane forward through 3D space (which would require either CSS `transform: translateZ()` with re-rotated planes, or a canvas/WebGL renderer), the plane stays put and the **background pattern** shifts by one cell. The eye reads the moving pattern as the plane drifting toward the camera.

### The 3D scene

```css
.pg-3d {
  perspective: 600px;        /* viewer's distance from the screen */
  perspective-origin: 50% 50%;
  transform-style: preserve-3d;
}
.pg-plane {
  position: absolute;
  left: -100%; width: 300%;   /* oversized: 3× wider than wrapper */
  height: 100%;
}
.pg-floor {
  bottom: 0;
  transform-origin: 50% 100%;
  transform: rotateX(60deg);  /* lay it down */
}
.pg-ceiling {
  top: 0;
  transform-origin: 50% 0%;
  transform: rotateX(-60deg); /* mirror it */
}
```

`perspective: 600px` is what makes parallel lines visibly converge. With `perspective: none`, the rotated plane would be a uniform parallelogram; with `600px`, it tapers to a vanishing point. The 60° rotation chosen is steep enough to feel "floor-like" but shallow enough that the front edge of the plane stays visible.

The plane is **300 % wide and offset `left: -100%`** because perspective-projecting a 100 %-wide plane leaves visible edges in the corners of the wrapper. Triple-wide guarantees coverage at any aspect ratio.

### The grid lines

```css
.pg-plane {
  background-image:
    linear-gradient(to right,  white 1px, transparent 1px),
    linear-gradient(to bottom, white 1px, transparent 1px);
  background-size: var(--pg-cell) var(--pg-cell);   /* e.g. 60px × 60px */
}
```

Two stacked linear-gradients render as a 1 px-wide line every `--pg-cell` pixels in each direction. The result is a tile-able grid texture — no DOM elements, no SVG. Cell size, line opacity, and stroke width are all driven by the resolved intensity config.

### The drift loop

```css
@keyframes pg-drift {
  from { background-position: 0 0; }
  to   { background-position: 0 var(--pg-cell); }
}
```

The animation shifts the background by one cell over `--pg-duration`. Because the grid pattern is periodic with period `--pg-cell`, the position-`0` frame and the position-`var(--pg-cell)` frame are visually *identical*. So the linear-easing infinite loop never has a "snap-back" — it appears to flow continuously forever.

`pg-drift-reverse` for the ceiling drifts the opposite direction so the floor and ceiling appear to move *together* in 3D space (they're both rotated 60° but in opposite directions, so they need opposite background-position shifts to flow the same way).

### The horizon fade

```css
.pg-stage {
  mask-image: linear-gradient(
    to bottom,
    transparent 0%, black 18%, black 82%, transparent 100%
  );
}
```

A mask fades the top and bottom 18 % of the stage to fully transparent. Without this, the perspective plane would cut off in a hard rectangular line at the top of the wrapper — instantly killing the 3D illusion. The mask makes the grid dissolve into the canvas instead.

## CSS Animation Strategy

`background-position` animation is unusual but specifically chosen here:

- **Compositor-only** — modern browsers composite background-position changes on the GPU when `will-change: background-position` is set. No paint, no layout.
- **Naturally periodic** — shifting by `var(--pg-cell)` is a no-op visually, so the loop is seamless without needing keyframes at intermediate percentages.
- **No transform on the plane** — leaves the perspective-projected geometry untouched, so the pattern always shifts *along the plane*, not through 3D space.

Compare with the obvious alternative — `transform: translateZ()` on the plane:
- That would require re-rotating the plane each cycle to maintain the floor angle, or a clever `mod`-style wrap which CSS doesn't natively support.
- Triggers re-projection through the perspective camera each frame.
- Visibly stutters when the cycle wraps unless the wrap distance is exactly tuned.

`background-position` sidesteps all of that.

The neon mode adds `filter: drop-shadow(0 0 4px ...) drop-shadow(0 0 12px ...)` to each plane — two stacked drop-shadows give the cyan/magenta tube glow without a blur filter (which would soften the lines). The drop-shadows are GPU-composited but more expensive than mono mode; on lower-end mobile, prefer `mono`.

## Performance

- **Two DOM nodes for the grid** (one floor + optional ceiling) plus the wrapper structure. No per-cell DOM, no SVG.
- **One animation per plane**, single `background-position` keyframe. GPU-composited.
- **Mask fade is static** — `linear-gradient` mask computes once per layout, not per frame.
- **No JavaScript per frame** — the only JS is mount-time `isReducedMotion()` probe and a `$effect` that watches the `animated` prop.
- **Neon mode adds 2 drop-shadow stops per plane**. Each drop-shadow is a separate compositor pass. If you nest multiple PerspectiveGrids in neon mode, the GPU bill stacks; mono and wireframe stay cheap.
- **Hi-DPI** — line widths are in CSS pixels (1 px and 0.5 px). On retina the 0.5 px wireframe lines hit sub-pixel rendering, which on some browsers anti-aliases them into invisibility; mono is more robust there.

## State Flow Diagram

```
              ┌────────────────────────────┐
              │   SSR / first paint        │
              │   runAnimation = true      │
              │   stage rendered with cfg  │
              └────────────┬───────────────┘
                           │ onMount
                           ▼
              ┌────────────────────────────┐
              │   probe isReducedMotion()  │
              └────────────┬───────────────┘
                           │
              ┌────────────┴───────────────┐
              │                            │
              │ animated && !reduced       │ animated=false OR reduced
              ▼                            ▼
       ┌──────────────┐            ┌──────────────┐
       │  drifting    │            │  static      │
       │  pg-animated │            │  no pg-      │
       │  class on    │            │  animated    │
       │  stage; CSS  │            │  class;      │
       │  keyframes   │            │  background- │
       │  run         │            │  position    │
       └──────┬───────┘            │  fixed       │
              │                    └──────────────┘
              │ animated prop flips false at runtime
              ▼
       ┌──────────────┐
       │  static      │
       │  $effect     │
       │  flips       │
       │  runAnimation│
       └──────────────┘

  prefers-reduced-motion: reduce  ──►  CSS @media kills keyframe
                                       (belt-and-braces alongside JS gate)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intensity` | `'calm' \| 'standard' \| 'rush'` | `'standard'` | Bundles drift duration (s), cell size (px), and line opacity. Unknown names fall back to `standard`. |
| `mode` | `'mono' \| 'neon' \| 'wireframe'` | `'mono'` | Colour preset; `neon` adds drop-shadow glow. Unknown names fall back to `mono`. |
| `ceiling` | `boolean` | `false` | Mirror plane above the floor — turns the surface into a tunnel. |
| `animated` | `boolean` | `true` | Auto-disabled if `prefers-reduced-motion: reduce`. |
| `opacity` | `number` | `1` | Stage opacity. Clamped to `[0, 1]`; `NaN` / `±Infinity` collapse to `0`. |
| `class` | `string` | `''` | Extra classes on the wrapper. |
| `children` | `Snippet` | required | Slotted content rendered above the grid. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Unknown `intensity` or `mode` | `pickIntensity` / `pickMode` fall back to `standard` / `mono`. |
| `opacity` = `NaN` / `±Infinity` | `clamp01` returns `0` — stage becomes invisible rather than throwing. |
| `prefers-reduced-motion: reduce` set on mount | `runAnimation` flipped to `false`; CSS `@media` query also disables the keyframe as a belt-and-braces guard. Grid renders statically. |
| `animated` flipped to `false` at runtime | `$effect` sets `runAnimation = false`; the `pg-animated` class drops; CSS animations stop on the next frame. |
| Component scrolled offscreen | Browser throttles or skips the layer's compositor work. No JS work to pause. |
| Wrapper resized | Plane is sized in percentages (300 % wide, 100 % tall) — naturally adapts. No `ResizeObserver`. |
| Hi-DPI / retina | Line widths in CSS pixels render crisp; `wireframe` 0.5 px lines may sub-pixel anti-alias on some browsers — prefer `mono` for hairlines if that bites. |
| GPU acceleration unavailable | `background-position` falls back to CPU; on weak CPUs you may see jitter. Lower `intensity` to `calm` halves the work per frame. |
| Multiple instances on one page | Each wrapper carries `isolation: isolate` via the stacking context — no z-index leakage. |
| Slotted child uses `position: fixed` | Fixed positioning escapes the wrapper; the grid stays put, the child floats — usually what you want. |
| Neon + ceiling on low-end mobile | Four drop-shadow passes (2 per plane) hit the compositor budget. If frame-rate drops, switch to `mode="mono"` or `ceiling={false}`. |

## Dependencies

- **Svelte 5.x** — `$props`, `$derived`, `$effect`, `$state`, snippets. Module-script exports (`pickIntensity`, `pickMode`, `clamp01`, etc.) for unit testing.
- Zero external dependencies — pure CSS perspective and gradients, no canvas, no WebGL.

## File Structure

```
src/lib/components/PerspectiveGrid.svelte         # implementation + module-level helpers
src/lib/components/PerspectiveGrid.md             # this file (rendered inside ComponentPageShell)
src/lib/components/PerspectiveGrid.test.ts        # vitest unit tests
src/lib/components/PerspectiveGridTestHarness.test.svelte  # render-test harness
src/routes/perspectivegrid/+page.svelte           # demo page
```
