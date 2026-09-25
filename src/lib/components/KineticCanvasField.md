# KineticCanvasField - Technical Logic Explainer

## What Does It Do? (Plain English)

KineticCanvasField wraps any content in an interactive particle layer. Moving the pointer leaves a soft glowing trail; clicking or tapping fires a radial burst of sparks that drift, slow down and fall away. The particles are drawn on a `<canvas>` behind your content, so buttons and text above it stay fully clickable.

**Think of it like:** dragging a sparkler through the air behind a pane of glass — the light show happens behind the glass, and you can still read and touch everything on the front.

---

## How It Works (Pseudo-Code)

```
WHEN component renders (server or client):
  1. RENDER <div root> with an aria-hidden <canvas> and a content layer on top
  2. children render in the content layer (z-index 1)

WHEN component mounts:
  1. LAZY-LOAD gsap via loadGsap()
  2. IF unmounted, missing nodes, or prefers-reduced-motion → stop (static content only)
  3. resizeCanvas()  and  ResizeObserver(root) → resizeCanvas
  4. LISTEN pointermove  → trail burst   (density / 12 particles, force 0.45) if trail on
     LISTEN pointerdown  → click burst   (density particles, force 1.1)
  5. gsap.ticker.add(draw)

emit(x, y, count, force):
  1. total = clampParticleCount(count)                 # 8..260
  2. FOR i in 0..total:
       angle = evenly spaced around the circle + small jitter
       speed = (40..210) × force
       hue   = spread across the palette's hue range
       PUSH createKineticParticle(...), lifetime 0.55..1.3
  3. KEEP only the newest 260 particles

draw(time) every tick:
  1. delta = clamp(frame delta, max 0.04)
  2. particles = particles.map(stepKineticParticle).filter(life > 0)
  3. CLEAR canvas; blend mode 'lighter'
  4. FOR each particle: circle, alpha = life², radius shrinks with alpha

WHEN component unmounts:
  1. disconnect ResizeObserver, remove listeners, ticker.remove(draw)
```

---

## The Core Concept: A Tiny Particle Physics Step

`stepKineticParticle(particle, delta)` is a pure function, so the physics is testable without a canvas:

```
friction = 0.9 ^ (delta × 60)      # frame-rate independent damping
x  += vx × delta
y  += vy × delta
vx *= friction
vy  = vy × friction + 28 × delta   # gentle gravity pulls sparks down
life = max(0, life − delta / maxLife)
```

Raising `0.9` to the power of `delta × 60` means the particle loses the same fraction of speed per second whether the screen runs at 60Hz or 144Hz. Alpha is `life²`, so particles fade slowly at first and then vanish quickly — which reads as a natural ember.

### Palettes

| Palette | Hue range | Look |
|---------|-----------|------|
| `aurora` | 180° → 285° | Cyan through violet |
| `ember` | 12° → 58° | Red-orange through amber |
| `mono` | 210° → 220° | A narrow band of blue |

---

## Performance

- **Hard particle cap** — never more than 260 live particles, so a frantic pointer cannot grow the array without bound.
- **Clamped delta** — frame delta is capped at 40ms, so a backgrounded tab does not fling particles across the screen when it resumes.
- **Device pixel ratio capped at 2** — crisp on Retina without paying 3× fill cost on high-density phones.
- **Shared ticker** — `gsap.ticker` batches with any other GSAP work on the page instead of running a second `requestAnimationFrame` loop.
- **`pointer-events: none`** on the canvas means it never intercepts clicks meant for the content.

---

## State Flow Diagram

```
   ┌────────────────────┐   mount + gsap loaded    ┌──────────────────────┐
   │  STATIC            │ ───── not reduced ─────▶ │  LISTENING           │
   │  content only      │                          │  ticker running      │
   │  (SSR / reduced    │                          │  particles = []      │
   │   motion)          │                          └──────┬───────────────┘
   └────────────────────┘                                 │
                                pointermove (trail) /     │
                                pointerdown (burst)       ▼
                                              ┌──────────────────────┐
                                              │  EMITTING            │
                                              │  push particles      │
                                              │  (cap 260)           │
                                              └──────┬───────────────┘
                                                     │ each tick: step + draw
                                                     ▼
                                              ┌──────────────────────┐
                                              │  DECAYING            │
                                              │  life → 0, removed   │──▶ LISTENING
                                              └──────────────────────┘

   Unmount → remove listeners, ResizeObserver, ticker callback
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `Snippet` | — | Content rendered above the particle canvas. |
| `density` | `number` | `72` | Particles per click burst; trail bursts use `density / 12`. Each burst is clamped to 8–260. |
| `trail` | `boolean` | `true` | Emit a small trail as the pointer moves. |
| `palette` | `'aurora' \| 'ember' \| 'mono'` | `'aurora'` | Hue range used for particle colours. |
| `class` | `string` | `''` | Extra classes on the root wrapper. |

### Exported helpers

| Export | Purpose |
|--------|---------|
| `clampParticleCount(count)` | Rounds and clamps a burst size to 8–260. |
| `createKineticParticle(x, y, angle, speed, hue)` | Builds one particle with velocity from angle and speed. |
| `stepKineticParticle(particle, delta)` | Advances one particle by `delta` seconds (friction, gravity, life). |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `prefers-reduced-motion: reduce` | No listeners or ticker are attached, and CSS hides the canvas; content renders normally. |
| `trail={false}` | Pointer movement emits nothing; clicks still burst. |
| Very large `density` | Each burst is capped at 260, and the live array is trimmed to the newest 260. |
| Container resizes | `ResizeObserver` resizes the backing canvas to match, respecting device pixel ratio. |
| Tab backgrounded then resumed | Frame delta is clamped so particles do not jump. |
| Unmounted before GSAP loads | The `cancelled` flag stops listeners and the ticker from being attached. |
| Canvas 2D context unavailable | `draw` returns early; content is unaffected. |

---

## Dependencies

- **Svelte 5.x** — runes, snippets and `onMount`.
- **`gsap`** — only the shared `gsap.ticker` is used, dynamically imported via `$lib/gsapMotion`.
- **`$lib/gsapMotion`** — `loadGsap`, `prefersReducedMotion` and `clamp`; copy it alongside the component.

---

## File Structure

```
src/lib/components/KineticCanvasField.svelte     # implementation + exported particle helpers
src/lib/components/KineticCanvasField.md         # this file (rendered inside ComponentPageShell)
src/lib/components/KineticCanvasField.test.ts    # vitest unit tests for the helpers
src/lib/gsapMotion.ts                            # shared GSAP loader, reduced-motion check, clamp
src/routes/gsap-suite/+page.svelte               # demo page (GSAP suite)
```

## Frame timing

`gsap.ticker` calls listeners with its elapsed time in **seconds** (not milliseconds like
`requestAnimationFrame`). The exported `tickerFrameDelta(time, lastTime)` helper turns that
into a per-frame step without any `/ 1000` conversion, uses a nominal `1 / 60` step on the
first frame (or if time fails to advance), and clamps long gaps — a backgrounded tab, say —
to `MAX_FRAME_DELTA` (0.04s) so particles never jump across the canvas. Particle velocities
are therefore in pixels per second, and gravity adds 28px/s² to `vy`.
