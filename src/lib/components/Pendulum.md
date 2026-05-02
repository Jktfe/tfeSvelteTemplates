# Pendulum — Technical Logic Explainer

## What Does It Do? (Plain English)

Pendulum wraps any element and makes it swing back and forth on a damped harmonic curve, like a pendulum hanging from a configurable pivot point above the element. The first swing is the largest, each successive swing is smaller, and after a few seconds the motion fades to rest. Four trigger modes decide when the swing starts: on mount (immediately), on viewport entry (when the user scrolls to it), on click (tap to swing again), or fully manually (consumer calls `swing()` themselves).

It is the kind of small flourish that adds personality to icons, badges, or callout cards without becoming distracting — the swing happens once, settles, and stays still until something triggers the next one. Reduced-motion users see a static element; the rAF loop never starts and the CSS transform stays at identity.

## How It Works (Pseudo-Code)

```
state:
  angle      = 0         // current swing angle in degrees
  reduced    = false     // capability flag
  rafId      = null      // current animation frame
  startTs    = null      // performance.now() when the current swing began
  observer               // IntersectionObserver for viewport trigger

derived:
  safeTrigger = pickTrigger(trigger)
  originCSS   = pivotOffsetCSS(pivotOffset)        // "calc(50% + Xpx) calc(50% + Ypx)"

tick(now):
  if startTs === null: startTs = now
  elapsedMs = now - startTs
  elapsedS  = elapsedMs / 1000
  raw       = dampedSine(elapsedS, amplitude, frequency, decay)
  angle     = clampSwing(raw, amplitude)

  envelope  = exp(-decay * elapsedS) * amplitude
  halted    = envelope < 0.05 or elapsedMs >= duration
  if halted:
    angle = 0; rafId = null; startTs = null; return
  rafId = requestAnimationFrame(tick)

export swing():
  if rafId: cancelAnimationFrame(rafId); rafId = null
  startTs = null
  if reduced: angle = 0; return
  rafId = requestAnimationFrame(tick)

export stop():
  if rafId: cancelAnimationFrame(rafId)
  rafId = null; startTs = null; angle = 0

on mount:
  reduced = isReducedMotion()
  if reduced: return
  if trigger === 'mount':    swing() (after autoStartDelay)
  if trigger === 'viewport': observer.observe(containerEl)
                              on intersect → swing()

on click (only when trigger === 'click'):
  swing()

on destroy: cancelAnimationFrame, clearTimeout, observer.disconnect

render:
  div.pendulum style:transform-origin={originCSS}
    div.pendulum__inner style="--pendulum-angle: {angle}deg"
      { children }

CSS:
  .pendulum__inner {
    transform: rotateZ(var(--pendulum-angle, 0deg));
    transform-origin: inherit;
    will-change: transform;
  }
```

## The Core Concept: Damped Harmonic Motion (The Math!)

The swing curve is the analytical solution to a damped harmonic oscillator:

```
θ(t) = A · e^(-decay·t) · cos(2π · frequency · t)

where:
  A         = amplitude (peak swing in degrees, e.g. 18)
  frequency = swing rate in Hz (e.g. 1.2 Hz = ~1.2 swings per second)
  decay     = exponential damping (1/sec; higher = settles faster)
  t         = elapsed time in seconds
```

The cosine is the oscillation. Multiplying by `e^(-decay·t)` is what makes the amplitude shrink each cycle — at `t = 0`, the envelope is `A`; at `t = 1` with `decay = 1.4`, the envelope is `A × e^(-1.4) ≈ 0.247 × A`. After ~2 seconds the amplitude is below 5% and the motion is visually still.

```
   θ(t)
    A   ●
    │ ●●  ●●
    │●     ●●
   0│  ────────●●─────────●●─────●● ─── ─ time
    │           ●●     ●●●  ●●●●●
    │            ●●●●●●●
   -A
        ↑   ↑   ↑   ↑    ↑
        each peak is smaller as e^(-decay·t) shrinks
```

Three deliberate decisions in the implementation:

- **Use the analytical solution, not numerical integration.** `dampedSine(t, A, f, decay)` evaluates the curve at any `t` directly — no accumulated floating-point drift, no need to integrate a differential equation. The component still uses rAF, but only to *sample* the analytical curve at the current frame's timestamp.
- **Halt early when the envelope drops below 0.05°.** No point continuing to schedule rAF frames for sub-pixel rotations the eye can't see. The check `envelope < 0.05` exits the loop cleanly.
- **Clamp the result.** `clampSwing(raw, amplitude)` is defensive — even though the analytical solution can never exceed `±amplitude`, a non-finite input would otherwise propagate `NaNdeg` into the inline transform.

A second helper, `nextAngle(state, deltaT, gravity, damping)`, is exported for consumers who want to drive their own physics loop with Euler integration instead of the analytical solution. The component itself doesn't use it — but it's there for tests and for consumers who want to couple Pendulum's motion to a custom force model.

The **pivot offset** is the other piece of geometry. By default the pivot is at `{x:0, y:-20}` — the centre of the element's bounding box, shifted 20 px upward. That makes the element swing as if hanging from a string attached 20 px above its top. `pivotOffsetCSS({x, y})` translates this into the CSS `transform-origin: calc(50% + Xpx) calc(50% + Ypx)` — anchoring rotation around that offset point.

## CSS Animation Strategy

The component is CSS-light. One transform, one will-change hint:

```css
.pendulum__inner {
  display: inline-block;
  transform: rotateZ(var(--pendulum-angle, 0deg));
  transform-origin: inherit;            /* picks up calc(50% + ...) from the wrapper */
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .pendulum__inner {
    transform: none !important;
    transition: none !important;
  }
}
```

`transform-origin` is set on the outer `.pendulum` via `style:transform-origin={originCSS}` and inherited into the inner — this lets the JS update the angle on the inner without recalculating the origin. The reduced-motion `@media` rule is a stylesheet-level safety net even if the JS gate is somehow bypassed.

There is no CSS keyframe — the JS writes a fresh `--pendulum-angle` per frame, and the GPU compositor handles the rotation. This is the right call here because `dampedSine` is not a curve CSS can express in keyframes (the exponential envelope is not in `cubic-bezier`'s vocabulary). The cost is "one rAF until envelope < threshold", which is bounded by `duration` (4 s default) regardless of input.

## Performance

- **Idle**: zero. No timer, no rAF, no observer (unless `viewport` trigger is in use).
- **Per swinging frame**: one `dampedSine` evaluation (one `Math.exp`, one `Math.cos`, three multiplications), one `$state` write (`angle`), one CSS variable update. Sub-millisecond at 60 fps.
- **Auto-halt**: when the envelope drops below 0.05° or `duration` ms is reached, the loop exits and rAF is unscheduled. No idle scheduling.
- **Viewport trigger**: a single `IntersectionObserver` on the container. Disconnects on first intersection (one-shot).

## State Flow Diagram

```
                    ┌──────────────────┐
                    │  REST            │  ← angle = 0, rafId = null
                    └────────┬─────────┘
                             │
       trigger='mount'       │   trigger='viewport'    trigger='click'   trigger='manual'
                             │
                             ▼
                    autoStartDelay timer    waiting on observer    waiting on click    waiting on swing()
                             │
                             ▼  swing() called
                    ┌──────────────────┐
                    │  SWINGING        │  ← rAF loop active
                    │  angle =          │     evaluating dampedSine
                    │   dampedSine(t,…) │     each frame
                    └────────┬─────────┘
                             │ envelope < 0.05° or elapsed >= duration
                             ▼
                    ┌──────────────────┐
                    │  HALTED          │  ← angle = 0, rafId = null
                    └────────┬─────────┘
                             │
                             ▼  → REST  (next trigger restarts)

  prefers-reduced-motion: reduce → SWINGING never entered. Stays in REST.
  swing() while in SWINGING → cancelAnimationFrame, reset startTs, restart loop.
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `'mount' \| 'viewport' \| 'click' \| 'manual'` | `'mount'` | When the swing starts. `'click'` makes the wrapper a button. `'manual'` means consumer calls `swing()`. |
| `amplitude` | `number` | `18` | Peak swing in degrees. |
| `frequency` | `number` | `1.2` | Swing rate in Hz (cycles per second). |
| `decay` | `number` | `1.4` | Exponential damping (1/sec). Higher = settles faster. |
| `pivotOffset` | `{ x: number; y: number }` | `{ x: 0, y: -20 }` | Pivot offset in pixels from the element's centre. |
| `duration` | `number` | `4000` | Hard cap on swing duration in ms. The envelope check usually exits sooner. |
| `autoStartDelay` | `number` | `0` | For `mount` trigger: ms to wait before starting. |
| `threshold` | `number` | `0.4` | For `viewport` trigger: IntersectionObserver threshold. |
| `class` | `string` | `''` | Extra wrapper classes. |
| `children` | `Snippet` | — | The element to wrap. |

The component exports `swing()` and `stop()` for `bind:this={pendulum}` imperative control.

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `prefers-reduced-motion: reduce` | rAF loop never starts. `swing()` short-circuits with `angle = 0`. Stylesheet `@media` rule pins transform to identity. |
| `swing()` called while already swinging | Existing rAF cancels; `startTs` resets; the loop restarts from the new `t = 0`. The user sees a fresh swing, not a continuation of the previous one. |
| `frequency = 0` | The cosine becomes `cos(0) = 1` constant; the envelope decays an unwavering offset. Visually: the element shifts by `amplitude` and slowly returns to 0. Acceptable; useful for "lean and settle" motions. |
| `decay = 0` | No damping. The cosine oscillates forever at full amplitude. The `duration` cap is what eventually halts it; consider raising `duration` or setting a non-zero decay for non-perpetual swings. |
| Non-finite input to `dampedSine` | Returns 0. Guards downstream against NaN propagation. |
| Component destroys mid-swing | `onDestroy` cancels the rAF and the autoStartDelay timer, disconnects the observer. No leaked anything. |
| `trigger = 'click'` with keyboard user | The clickable inner wrapper is `role="button"`, `tabindex="0"`, with Enter/Space handlers — full keyboard parity. |
| `trigger = 'viewport'` and component never enters viewport | Observer waits indefinitely. No swing fires; no resource leak. |
| Multiple Pendulum instances on one page | Each is independent. They drift out of phase even with identical config — usually preferable to synchronised swinging. |
| `pivotOffset = { x: 0, y: 0 }` | Pivot at element centre. Swing rotates the element about its own centroid — looks like a teetering coin rather than a hanging pendulum. |

## Dependencies

- **Svelte 5** — `$state`, `$derived`, `$props`, `onMount`, `onDestroy`, `Snippet`.
- **`<script module>`** exports — `dampedSine`, `nextAngle`, `clampSwing`, `pickTrigger`, `pivotOffsetCSS`, `isReducedMotion`. All pure, deterministic, testable without a DOM.
- **`IntersectionObserver`** — browser primitive used for the viewport trigger only.
- **Zero external libraries** — no animation library, no physics library. The `dampedSine` curve is `Math.exp` × `Math.cos`.

## File Structure

```
src/lib/components/Pendulum.svelte            # implementation
src/lib/components/Pendulum.md                # this explainer
src/lib/components/Pendulum.test.ts           # unit tests for exported helpers
src/routes/pendulum/+page.svelte              # demo page
```
