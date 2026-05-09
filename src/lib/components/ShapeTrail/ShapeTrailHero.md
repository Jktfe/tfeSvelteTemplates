# ShapeTrailHero — Technical Logic Explainer

## What Does It Do? (Plain English)

A hero canvas where 32 (configurable) geometric primitives — circles, squares, triangles — float in a lattice. Move your cursor and they break formation to orbit it; click and they snap back into the lattice; click again and they release. The whole thing runs on a single requestAnimationFrame loop with a tiny damped-spring physics step per particle.

Use it for kinetic landing pages, design-studio heroes, or anywhere you want a single arresting interaction without committing to a full 3D scene.

## How It Works (Pseudo-Code)

```
state:
  particles = []                    // Particle[]
  pointer = { x, y, active }
  settled = false
  prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches

build particles:
  cols = ceil(sqrt(density))
  rows = ceil(density / cols)
  for i in [0, density):
    col = i % cols
    row = floor(i / cols)
    target.x = cell.w * (col + 0.5)
    target.y = cell.h * (row + 0.5)
    radius = 6 + rand(seed) * 10
    hue = palette.from + rand(seed*31) * (palette.to - palette.from)
    particles.push({ ...target, ...startOffset, vx:0, vy:0, radius, hue, kind })

each frame (rAF):
  ctx.fillStyle = 'rgba(7,8,16,0.18)'           // trail-fade overlay
  ctx.fillRect(0, 0, w, h)
  for p in particles:
    if settled:                                  // snap to lattice
      target = (p.tx, p.ty)
    else if pointer.active:                      // orbit pointer
      angle = p.seed * 137.5 deg
      radius = 60 + (p.seed % 7) * 14
      target = pointer + (cos·radius, sin·radius)
    else:                                        // drift back to lattice
      target = (p.tx, p.ty)

    p.vx = (p.vx + (target.x - p.x) * 0.012) * 0.86
    p.vy = (p.vy + (target.y - p.y) * 0.012) * 0.86
    p.x += p.vx
    p.y += p.vy
    drawShape(ctx, p)

events:
  pointermove → pointer = (x - rect.left, y - rect.top, active=true)
  pointerleave → pointer.active = false
  click | Enter | Space → settled = !settled
  resize → rebuild particles for new viewport
  prefers-reduced-motion → skip rAF, paint a single static lattice
```

## The Core Concept: Trail Fade via Translucent Overlay

Every animation frame the canvas needs to "forget" the previous frame so old particle positions don't pile up. The naïve approach (`ctx.clearRect`) gives you a sharp redraw but no trail. The cinematic approach is the **translucent overlay trick**:

```
ctx.fillStyle = 'rgba(7, 8, 16, 0.18)';   // panel background, 18% opaque
ctx.fillRect(0, 0, w, h);
```

Each frame paints a slightly opaque layer of the panel background over the canvas, fading old positions toward black at a controlled rate. New particles paint on top fully opaque, so they look bright; old positions fade to invisible over ~6 frames at 0.18 alpha. The result is a trail that gracefully decays without per-particle history bookkeeping.

The trade-off: the trail length is set globally by the alpha. 0.18 gives a 5–6 frame visible trail; 0.06 gives a long ghostly trail; 0.5 gives almost no trail. Tune to taste — the component picks 0.18 as a balance between "kinetic" and "legible".

## Damped-Spring Physics in Six Numbers

Each particle has two state variables (`x`, `y`) and two velocity variables (`vx`, `vy`). The update step is:

```
acceleration = (target - current) * STIFFNESS    // pull toward target
velocity     = (velocity + acceleration) * DAMPING  // shed energy each frame
position     = position + velocity
```

With `STIFFNESS = 0.012` and `DAMPING = 0.86`:

- **Stiffness** picks how aggressively each particle reaches for its target. Higher = snappier (more elastic), lower = lazier (more lethargic).
- **Damping** picks how quickly oscillation dies. Below ~0.8 the particles overshoot wildly and look chaotic; above ~0.95 they barely move. The 0.86 sweet spot gives a soft "settle" with one or two micro-overshoots.

Both numbers are dimensionless (per-frame ratios), so they're stable regardless of frame rate variability. The system is a critically-underdamped harmonic oscillator — same maths as spring/mass simulations in physics engines, just with the "mass" baked into the constants.

## State Flow Diagram

```
                  ┌─────────────────────┐
                  │  pointer.active +   │
                  │  settled flags      │
                  └──────────┬──────────┘
                             │  per-frame, per-particle
                             ▼
              ┌──────────────────────────────┐
              │  pick target for this frame  │
              ├──────────────────────────────┤
              │  settled        →  (tx, ty)  │
              │  pointer.active → orbit ring │
              │  idle           →  (tx, ty)  │
              └──────────────┬───────────────┘
                             │
                             ▼
                ┌────────────────────────┐
                │ damped-spring step:    │
                │ vx = (vx + dx*0.012)*0.86│
                │ vy = (vy + dy*0.012)*0.86│
                │ x += vx; y += vy        │
                └────────────┬────────────┘
                             │
                             ▼
                ┌────────────────────────┐
                │ paint translucent bg   │
                │ then drawShape(p)      │
                └────────────┬───────────┘
                             │
                             ▼
                  requestAnimationFrame
```

## Props Reference

| Prop          | Type                              | Default               | Description                                                              |
|---------------|-----------------------------------|-----------------------|--------------------------------------------------------------------------|
| `density`     | `number`                          | `32`                  | Number of particles to render. Clamped to [8, 128].                      |
| `palette`     | `'mono' \| 'aurora' \| 'amber'`   | `'aurora'`            | Hue band the particles draw from.                                        |
| `ariaLabel`   | `string`                          | `'Shape Trail hero'`  | Wrapper aria-label.                                                      |
| `class`       | `string`                          | `''`                  | Extra classes on the outer container.                                    |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `density < 8` or `> 128` | Clamped via `Math.max(8, Math.min(128, density))`. |
| `prefers-reduced-motion: reduce` | rAF loop never starts; the canvas paints a single static lattice frame and the cursor doesn't trigger orbits. |
| Wrapper resizes | A `ResizeObserver` rebuilds particles for the new dimensions (lattice scales). Handles browser zoom + viewport rotation cleanly. |
| Pointer leaves the wrapper | `pointer.active = false`; particles drift back to lattice positions. |
| Click on a non-pointer interaction (Enter/Space) | Toggles `settled` for keyboard parity. The wrapper has `tabindex=0` so it can be focused. |
| `palette` not in the preset list | TypeScript prevents this at the type boundary; at runtime an unknown key throws when reading `PALETTE_HUES[palette]`. |
| `<canvas>` 2D context unavailable (very old browsers) | The component renders nothing visual but doesn't crash — the rAF loop early-returns. |

## GSAP-Driven Entrance + State Transitions

The continuous canvas animation is rAF-driven (per-particle spring step at 60fps), but the **discrete state changes** — entrance reveal, settle/release transitions on the content + status pill — are GSAP-driven. After `loadGsap()` resolves in `onMount`, a `gsap.timeline()` stages:

```
gsap.timeline()
  .fromTo(canvas,  { opacity: 0 },                      { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0)
  .fromTo(content, { y: 14, opacity: 0 },               { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.15)
  .fromTo(status,  { y: 8, opacity: 0 },                { y: 0, opacity: 0.85, duration: 0.5, ease: 'power2.out' }, 0.4);
```

A separate `$effect(() => settled)` calls `gsap.to(content, …)` and `gsap.to(status, …)` when the user toggles, so the click-to-settle gesture rides a `power3.out` ease rather than a snap.

`prefers-reduced-motion` short-circuits both: the timeline never runs, the `$effect` early-returns, and the canvas paints a single static lattice frame. The wrapper still updates `aria-pressed={settled}` so AT users get the toggle state regardless.

## Dependencies

- **Svelte 5.x** — `$state`, `$props`, `$derived`, `$effect`, `onMount`.
- **`gsap` core** (already a project dep) — drives the entrance timeline + settle/release tweens. No business plugins.
- **Canvas 2D + `requestAnimationFrame`** — drives the per-particle physics loop.
- **`ResizeObserver`** — re-builds particles on viewport changes.

## File Structure

```
src/lib/components/ShapeTrail/ShapeTrailHero.svelte    # implementation
src/lib/components/ShapeTrail/ShapeTrailHero.md        # this file
src/lib/components/ShapeTrail/ShapeTrailHero.test.ts   # vitest unit + behaviour tests
src/lib/types.ts                                       # ShapeTrailHeroProps
```
