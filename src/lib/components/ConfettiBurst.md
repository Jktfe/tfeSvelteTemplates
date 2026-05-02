# ConfettiBurst — Technical Logic Explainer

## What Does It Do? (Plain English)

ConfettiBurst is an imperative celebration component you mount once on a page and call by name when a moment deserves a party — a successful submit, a level-up, a hold-to-confirm completion, a payment received. Calling `burst.fire()` paints a fixed-position canvas over the whole viewport, tosses a few hundred coloured paper rectangles upward and outward from a configurable origin, and lets gravity, drag, and a fade ramp dispose of them over the next ~1.8 seconds. When the burst finishes the canvas unmounts, leaving the DOM exactly as it was.

It is the canvas-based sibling of ClickSpark — same "decorate an interaction" intent, but designed for full-viewport celebrations rather than tiny per-click flourishes. Reduced-motion users get the contract preserved (the `onComplete` callback still fires) but no animation, so any consumer logic that expects to run after the burst still runs.

## How It Works (Pseudo-Code)

```
state:
  firing  = false                       // gates canvas mount
  canvas                                 // bound canvas element
  particles = []                         // current particle list
  rafId                                  // current animation frame
  startedAt                              // performance.now() when burst began

derive:
  // resolve props every fire so per-shot overrides work

export function fire(opts?):
  if isReducedMotion(): onComplete(); return

  w, h          = window.innerWidth, window.innerHeight
  origin        = parseOrigin(opts?.origin ?? prop.origin, w, h)
  palette       = opts?.palette ?? prop.palette
  particles     = generateParticles({ count, palette, origin, spread, velocity, seed })
  firing        = true                   // {#if firing} mounts the canvas
  startedAt     = performance.now()

  // Defer one frame so the canvas exists before we measure it.
  rafId = requestAnimationFrame(now => {
    canvas.width  = w
    canvas.height = h
    startedAt     = now
    frame(now)
  })

frame(now):
  elapsedMs = now - startedAt
  totalMs   = clampDuration(prop.duration)
  ctx       = canvas.getContext('2d')
  if !ctx: stop(); onComplete(); return

  particles = particles.map(p => stepParticle(p, 1/60, gravity, elapsedMs, totalMs))

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for p in particles:
    ctx.save()
    ctx.globalAlpha = p.opacity
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)
    ctx.fillStyle = p.color
    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size)
    ctx.restore()

  if elapsedMs >= totalMs: stop(); onComplete(); return
  rafId = requestAnimationFrame(frame)

stop:
  cancelAnimationFrame(rafId)
  firing = false                        // unmounts canvas via {#if}
  particles = []

on destroy: stop()
```

## The Core Concept: Pure-Physics Particles With A Seeded RNG

The maths lives in `<script module>` so unit tests can exercise it without rendering a canvas. The factory is deterministic given a seed — important because tests need to assert exact positions and colours.

**1. `generateParticles(options)`** lays out the initial particle field:

```
halfSpreadRad = (spread / 2) × π / 180
for i in 0..count:
  angle  = -π/2 + (rand × 2 − 1) × halfSpreadRad     // straight up ± half-spread
  speed  = velocity × (0.55 + rand × 0.45)           // 55–100% of base velocity
  push {
    x, y       = origin.x, origin.y
    vx, vy     = cos(angle) × speed, sin(angle) × speed
    size       = 4 + rand × 6                         // 4..10 px
    rotation   = rand × 2π                            // start orientation
    angularVel = (rand × 2 − 1) × 8                   // -8..8 rad/sec
    color      = palette[floor(rand × palette.length)]
    opacity    = 1
  }
```

The `-π/2` baseline is "straight up" in canvas coordinates (y grows downward, so negative y is up). Spread of 70° means each particle's initial angle is ±35° around vertical — a satisfying upward cone rather than a flat horizontal scatter.

The speed jitter `(0.55 + rand × 0.45)` keeps the front of the burst sharper than a uniform-velocity field would (where every particle would arrive at its peak at the same instant). With variation, the leading edge is "fast minority", the body is "average majority", and the trailing edge is "slow minority" — looks more like real paper confetti.

**2. `stepParticle(p, dtSec, gravity, elapsedMs, totalMs)`** advances one particle by one frame:

```
return {
  ...p,
  x: p.x + p.vx × dtSec,
  y: p.y + p.vy × dtSec,
  vx: p.vx × 0.99,                         // 1% drag per frame
  vy: p.vy × 0.99 + gravity × dtSec,       // drag + gravity
  rotation: p.rotation + p.angularVel × dtSec,
  opacity: max(0, 1 - elapsedMs / totalMs)  // linear fade over the burst lifetime
}
```

Drag at 1% per frame ≈ 0.6 per second — enough to slow runaway particles without choking the burst. Gravity at the default `1500 px/sec²` is ~1.5× Earth gravity at typical canvas pixel density, which makes paper-light particles fall convincingly fast for a short burst. The linear opacity fade is intentionally simple — the eye reads the visual death of a particle from its trajectory, not its alpha curve.

```
                 ●●●●
              ●●●●●●●●●          ← peak: ~30–40% into duration
              ●●●●●●●●●
            ●●● ●●● ●●●          ← gravity asserts; spread fans
          ●●●     ●●●  ●
        ●●         ●●     ●
       ●            ●         ●  ← drag + gravity → curving paths
      ●              ●           
                                   ← opacity ramps to 0; off-screen
                                     particles are still drawn but invisible
```

**3. The mulberry32 PRNG** in module scope (`mulberry32(seed)`) is the small fast PRNG that backs `generateParticles`. Same seed → same particle list, every time. In production each `fire()` uses a fresh `Math.random()-derived` seed; tests pin the seed.

## CSS Animation Strategy

Most of the visible motion is in canvas — but the *mount* strategy matters: the canvas is conditionally rendered via `{#if firing}` so the DOM stays empty between bursts. Zero idle cost.

```svelte
{#if firing}
  <canvas bind:this={canvas} class="confetti-canvas" aria-hidden="true"></canvas>
{/if}
```

```css
.confetti-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
}
```

`position: fixed` plus `inset: 0` covers the whole viewport regardless of scroll position — so a burst from a button near the bottom of a long page still fills the screen, not just the unscrolled chunk.

`pointer-events: none` ensures the celebratory canvas never swallows clicks meant for the underlying UI. `z-index: 9999` puts it on top of typical app chrome (modals, dropdowns).

`aria-hidden="true"` is non-negotiable: the burst has no semantic meaning. The user's screen reader announces the *event* (success, confirm) via the consumer's normal UI, not via the confetti.

## Performance

- **Idle cost**: zero. No canvas in the DOM, no rAF running.
- **Per active burst**: one rAF loop, O(count) draw calls per frame. With defaults (80 particles × 60 fps), that's ~4800 fillRect calls per second — comfortably inside the GPU envelope on any device since 2015.
- **Memory**: one canvas, one particles array. Both released when `stop()` runs.
- **Reduced motion**: `fire()` returns immediately after invoking `onComplete`. No canvas mount, no rAF, no allocation.

## State Flow Diagram

```
              ┌──────────────────────┐
              │  IDLE                │  ← canvas absent
              │  firing = false      │
              │  particles = []      │
              └──────────┬───────────┘
                         │ fire(opts) called
                         │ (reduced motion? → onComplete; stay IDLE)
                         ▼
              ┌──────────────────────┐
              │  GENERATE            │
              │  particles[] built   │
              │  firing = true       │
              │  canvas mounts       │
              └──────────┬───────────┘
                         │ rAF: size canvas; reset startedAt
                         ▼
              ┌──────────────────────┐
              │  ANIMATING           │
              │  per-frame:          │
              │   step particles     │
              │   clear + redraw     │
              └──────────┬───────────┘
                         │ elapsed ≥ duration
                         ▼
              ┌──────────────────────┐
              │  COMPLETE            │
              │  onComplete()        │
              │  stop(): firing=false│
              │  canvas unmounts     │
              └──────────┬───────────┘
                         │
                         ▼  → IDLE

  destroy mid-burst: stop() cancels rAF, unmounts canvas
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `80` | Particles per burst. Clamped to `[10, 500]`. |
| `spread` | `number` | `70` | Cone width in degrees. `0` = straight up; `180` = full omnidirectional. |
| `velocity` | `number` | `800` | Base initial speed in px/sec. Per-particle scaled to 55–100% of this. |
| `gravity` | `number` | `1500` | Vertical acceleration in px/sec². Higher = faster fall. |
| `duration` | `number` | `1800` | Total burst lifetime in ms. Clamped to `[200, 5000]`. |
| `palette` | `string[]` | rainbow defaults | Array of CSS colours. Particles pick one each. |
| `origin` | `'center' \| { x, y }` | `'center'` | Origin in viewport coordinates. `'center'` = `(innerWidth/2, innerHeight/2)`. |
| `onComplete` | `() => void` | `() => {}` | Callback fired when the burst ends (or immediately under reduced motion). |
| `ariaLabel` | `string` | `'Celebration'` | Canvas aria-label (still aria-hidden, but kept for completeness). |
| `class` | `string` | `''` | Extra classes on the canvas. |

The `fire(opts?)` method takes an optional `{ origin, palette }` to override per-shot without remounting.

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `prefers-reduced-motion: reduce` | `fire()` returns immediately, `onComplete` fires synchronously. Consumers' post-burst flows are unaffected. |
| Canvas 2D context unavailable | `frame()` calls `stop()` and `onComplete()` — graceful abort with the contract preserved. |
| `fire()` called while a previous burst is still running | The `particles` array is overwritten with a fresh field; the existing rAF continues but now operates on the new list. The old canvas is reused. Visual "two overlapping bursts" effect comes naturally. |
| Component destroyed mid-burst | `onDestroy` runs `stop()` — rAF cancelled, canvas unmounted with the component. No leaked timer. |
| `origin = { x: -100, y: -100 }` | Particles emit from off-screen and may not reach the viewport. The burst still completes silently after `duration` ms. Use with intent. |
| Window resized mid-burst | The canvas was sized once on `fire()`. Resizing during a burst leaves the canvas at the original viewport size; particles continue to draw within that. The next burst remeasures. |
| `count = 1` | Clamped to 10 by `clampCount`. The minimum is enforced because under-10 bursts look broken — the eye reads them as accidental flashes rather than celebrations. |
| `palette = []` | `generateParticles` falls back to the module's `DEFAULT_PALETTE`. |
| Touch device | No interaction model on the component — `fire()` is called from your own event handlers, which fire the same on touch as on click. |

## Dependencies

- **Svelte 5** — `$state`, `$props`, `onDestroy`. The `bind:this={burst}` pattern lets consumers call `burst.fire()` imperatively.
- **`<script module>`** exports — `clampCount`, `clampDuration`, `clampSpread`, `parseOrigin`, `mulberry32`, `generateParticles`, `stepParticle`, `isReducedMotion`. Pure, deterministic, testable without rendering. Mulberry32 is the only PRNG; no `crypto.getRandomValues` involved (overkill for confetti).
- **`<canvas>` 2D context** — drawn directly via `fillRect`. No WebGL.
- **Zero external libraries** — no canvas-confetti, no particle library.

## File Structure

```
src/lib/components/ConfettiBurst.svelte       # implementation
src/lib/components/ConfettiBurst.md           # this explainer
src/lib/components/ConfettiBurst.test.ts      # unit tests for exported helpers
src/lib/components/ConfettiBurstTestHarness.test.svelte   # render harness for integration
src/routes/confettiburst/+page.svelte         # demo page
```
