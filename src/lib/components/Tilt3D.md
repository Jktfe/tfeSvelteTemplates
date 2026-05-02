# Tilt3D — Technical Logic Explainer

## What Does It Do? (Plain English)

Tilt3D wraps any element and tilts it in 3D toward the cursor as you hover over it. The element rotates a few degrees on its X and Y axes depending on where the cursor is relative to its centre — point at the top edge and the top tilts toward you; point at the right edge and the right tilts away. An optional glare highlight follows the pointer with a soft radial gradient, selling the depth like light catching on glossy plastic. When the cursor leaves, the element spring-eases back to flat (or snaps, or stays — your pick).

It is the Stripe / Linear / Apple product-page card depth effect, rebuilt as a portable Svelte 5 wrapper with no animation library. Reduced-motion users see a static element with the glare suppressed; keyboard focus is untouched because the wrapper is purely decorative.

## How It Works (Pseudo-Code)

```
state:
  rx, ry   = 0, 0       // current rotation in degrees
  glareX, glareY = 0.5  // glare position 0..1
  active   = false      // affects scale and glare opacity
  reduced  = false      // capability flag
  frameId  = 0          // current rAF for spring reset

on mount: reduced = isReducedMotion()

on pointermove(event):
  if reduced or !containerEl: return
  cancelAnimationFrame(frameId)        // cancel any in-flight spring
  rect = containerEl.getBoundingClientRect()
  r = rotationFromCursor(event.clientX, event.clientY, rect, maxTilt)
  g = glarePositionFromCursor(event.clientX, event.clientY, rect)
  rx, ry = r.rx, r.ry
  glareX, glareY = g.x, g.y
  active = true

on pointerleave:
  if reduced: return
  if reset === 'instant': rx=0; ry=0; active=false; return
  if reset === 'none':            active=false; return

  // reset === 'spring': rAF ease back to identity
  tick = () =>
    rx = springReset(rx, 0, 0.15)
    ry = springReset(ry, 0, 0.15)
    if |rx| < 0.05 and |ry| < 0.05:
      rx, ry = 0, 0; active = false; frameId = 0; return
    frameId = requestAnimationFrame(tick)
  frameId = requestAnimationFrame(tick)

on destroy: if frameId: cancelAnimationFrame

CSS:
  .tilt3d { perspective: var(--tilt-perspective, 1000px); transform-style: preserve-3d; }
  .tilt3d__inner {
    transform: rotateX(var(--tilt-rx)) rotateY(var(--tilt-ry)) scale(var(--tilt-scale));
    transform-style: preserve-3d;
    will-change: transform;
  }
  .tilt3d__glare {
    background: radial-gradient(circle at var(--glare-x) var(--glare-y),
                                rgba(255,255,255, var(--glare-intensity)) 0%, transparent 50%);
    mix-blend-mode: overlay;
    opacity: 0;
    transition: opacity 220ms;
  }
  .tilt3d--active .tilt3d__glare { opacity: 1; }

  @media (prefers-reduced-motion: reduce) {
    .tilt3d__inner { transform: none !important; }
    .tilt3d__glare { display: none !important; }
  }
```

## The Core Concept: Cursor Position → Normalised Tilt → Two CSS Rotations

The rotation maths is two parallel mappings: cursor's horizontal offset becomes Y rotation, vertical offset becomes X rotation.

```
const cx = rect.left + rect.width  / 2
const cy = rect.top  + rect.height / 2

nx = (cursorX - cx) / (rect.width  / 2)   // -1 (left edge) .. +1 (right edge)
ny = (cursorY - cy) / (rect.height / 2)   // -1 (top edge)  .. +1 (bottom edge)

rx = clamp(-ny * maxTilt, ±maxTilt)        // top half ny<0 → rx>0 (top tilts forward)
ry = clamp( nx * maxTilt, ±maxTilt)        // right half nx>0 → ry>0 (right tilts back)
```

Two conventions baked in:

- **Negate `ny`** so cursor in the top half (`ny < 0`) produces positive `rotateX`, which in CSS tilts the *top edge toward the viewer*. Without the negation the card would dip away from the cursor, which feels wrong (your finger is "pushing it away" instead of "lifting it up").
- **Don't negate `nx`** so cursor on the right (`nx > 0`) produces positive `rotateY`, which tilts the right edge *away*. Combined with the X axis, the card rotates as if pinned to a horizontal axle that runs through the cursor — exactly the gestalt that makes Stripe-style cards feel tactile.

```
   cursor at top-left              cursor at bottom-right
   nx=-1, ny=-1                    nx=+1, ny=+1
   rx=+maxTilt, ry=-maxTilt        rx=-maxTilt, ry=+maxTilt

      ┌─────┐                         ┌─────┐
     /│     │\                        │     │\
    / │     │ \                       │     │ \
       │  ●  │  ←tilts up,            │  ●  │   ←tilts down,
       │     │   left out             │     │    right out
       └─────┘                        └─────┘
```

The clamping (`clampTilt`) is defensive against bad input — non-finite values (e.g. from a bad cursor event during transition) return 0 instead of poisoning the inner element with `NaNdeg`.

The **glare** is a separate mapping: cursor position in `[0, 1]` fractions of the wrapper, used as the centre of a radial gradient. When the cursor is over the wrapper, the glare opacity transitions from 0 → 1 over 220 ms; when it leaves, the glare position freezes at the edge it left through (because the helper clamps `[0, 1]` rather than allowing the gradient origin to drift off-element).

The **spring reset** on pointer-leave is a Hooke-style damped step toward zero:

```
springReset(current, target=0, damping=0.15) = current + (target - current) × damping
```

Iterating in rAF, this converges geometrically: each frame removes 15% of the remaining displacement. After ~12 frames at 60 fps (~200 ms) the rotation is below the 0.05° threshold and the rAF loop exits. No idle rAF — the loop only runs while a settle is in progress.

## CSS Animation Strategy

Three CSS techniques carry the visible motion:

```css
.tilt3d {
  display: inline-block;
  perspective: var(--tilt-perspective, 1000px);
  transform-style: preserve-3d;
}

.tilt3d__inner {
  transform: rotateX(var(--tilt-rx, 0deg)) rotateY(var(--tilt-ry, 0deg))
             scale(var(--tilt-scale, 1));
  transform-style: preserve-3d;
  will-change: transform;
  /* No transition while active — JS drives the rotation directly per pointermove
     for snap-tight cursor tracking. Spring reset is rAF-driven so we never fight
     the transition timeline. */
}

.tilt3d__glare {
  background: radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%),
                              rgba(255,255,255, var(--glare-intensity, 0.3)) 0%,
                              rgba(255,255,255, 0) 50%);
  mix-blend-mode: overlay;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 220ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.tilt3d--active .tilt3d__glare { opacity: 1; }
```

Three deliberate decisions:

- **`perspective` on the outer element**, not the inner. Putting it on the inner would make the tilt look orthographic (no foreshortening); the outer position lets the inner element rotate *inside* a perspective camera, which is what makes the front edge appear larger than the back.
- **No transition on the inner transform.** While the user is over the element, every pointermove writes new `rx, ry` values; if there were a transition, the transform would lag behind the cursor. We trade smoothness for snap. The rAF spring on leave is the *only* time the inner transform is animated by code rather than by mouse input.
- **`mix-blend-mode: overlay` on the glare.** Overlay multiplies dark areas and screens light areas, so the glare brightens highlights and tints shadows — much more like real reflected light than a flat alpha overlay would be.

Reduced motion is the catch-all stylesheet override: `.tilt3d__inner` is locked to identity transform, glare hidden entirely. The `!important` is necessary because the inline-style CSS variables would otherwise win.

## Performance

- **Steady state with no cursor**: zero. No rAF, no listener fire.
- **Per pointermove**: one `getBoundingClientRect`, two helper calls (`rotationFromCursor`, `glarePositionFromCursor`), four `$state` writes, four CSS variable updates that the compositor folds into the existing layer. Sub-millisecond.
- **Leave-spring**: one rAF loop until `|rx|, |ry| < 0.05deg` (~12 frames). Then it stops. No idle rAF.
- **Multiple stacked Tilt3D wrappers**: each is independent. Pointer events bubble normally; the wrapper currently under the cursor receives the pointermove. CSS perspective compounds, but each wrapper's transform-style is its own stacking context.

## State Flow Diagram

```
              ┌──────────────────────┐
              │  REST                │  ← rx=ry=0, active=false
              └──────────┬───────────┘
                         │ pointer enters
                         ▼
              ┌──────────────────────┐
              │  TRACKING            │  ← per pointermove:
              │  rx, ry, glare write │     recompute rotations
              │  active = true       │     and glare position
              └──────┬───────────────┘
                     │ pointer leaves
                     │
                     │ reset === 'spring'   reset === 'instant'   reset === 'none'
                     │      │                     │                      │
                     │      ▼                     ▼                      ▼
                     │  ┌──────────────┐   ┌──────────────┐    ┌──────────────────┐
                     │  │ SPRING       │   │ SNAP TO REST │    │ FROZEN AT        │
                     │  │ rAF eases    │   │ rx=ry=0      │    │ last rotation    │
                     │  │ to 0,0       │   └──────┬───────┘    │ active=false     │
                     │  └──────┬───────┘          │            └──────────────────┘
                     │         │                  │
                     ▼         ▼                  ▼
              ┌──────────────────────┐
              │  REST                │
              └──────────────────────┘

  prefers-reduced-motion: reduce → handlers bail; CSS locks inner to identity, glare hidden.
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxTilt` | `number` | `12` | Maximum rotation in degrees on either axis. `clampTilt` enforces `[-max, max]`. |
| `perspective` | `number` | `1000` | CSS perspective in pixels. Smaller = more dramatic foreshortening. |
| `glare` | `boolean` | `true` | Render the radial-gradient glare overlay. |
| `glareIntensity` | `number` | `0.3` | Glare alpha at peak in `[0, 1]`. |
| `reset` | `'spring' \| 'instant' \| 'none'` | `'spring'` | Pointer-leave behaviour. |
| `scale` | `number` | `1.04` | Scale-up while active. Adds the "lifted toward you" feel. |
| `class` | `string` | `''` | Extra wrapper classes. |
| `children` | `Snippet` | — | The element to wrap. Keeps its own focus / interaction. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `prefers-reduced-motion: reduce` | All pointer handlers bail. CSS `@media` rule locks the inner transform to identity and hides the glare. |
| Wrapped element has zero-size rect (e.g. before layout settles) | `rotationFromCursor` returns `{rx:0, ry:0}` and `glarePositionFromCursor` returns `{x:0.5, y:0.5}`. No NaN propagation. |
| Cursor leaves while spring is mid-flight | A new pointer-enter cancels the spring's rAF; subsequent pointermoves take over. Conversely, if the user leaves and re-enters during the settle, the rotation picks up smoothly from the in-flight value. |
| `reset = 'none'` with rapid leave/enter | The rotation freezes at last value on leave; subsequent enter resumes tracking. Useful for hover-based "pinned" effects. |
| Inner content has its own transforms | Tilt3D's transform composes with the inner's. They will stack. If the inner element transitions its transform, both transitions race — usually fine, occasionally wobbly. |
| Touch / coarse pointer | `pointermove` fires on tap-and-drag; the tilt updates per move. Not always desirable on a swipe gesture — consumers may want to disable on touch via a wrapper conditional. |
| Multiple stacked Tilt3D wrappers | Each independent. Pointer events go to the topmost wrapper under the cursor; ancestors don't receive the event unless events bubble (they do not for pointermove on an inner Tilt3D). |
| `maxTilt = 0` | Both rotations clamp to 0. The wrapper still scales to `scale` on hover, and the glare still renders — useful for an "underline only" version. |
| Component destroys mid-spring | `onDestroy` calls `cancelAnimationFrame(frameId)`. No leaked timer. |

## Dependencies

- **Svelte 5** — `$state`, `$props`, `onMount`, `onDestroy`, `Snippet`.
- **`<script module>`** exports — `clampTilt`, `rotationFromCursor`, `glarePositionFromCursor`, `springReset`, `isReducedMotion`. All pure, testable without a DOM.
- **Zero external libraries** — no animation library, no spring physics library, no SVG filter, no canvas, no fonts.

## File Structure

```
src/lib/components/Tilt3D.svelte              # implementation
src/lib/components/Tilt3D.md                  # this explainer
src/lib/components/Tilt3D.test.ts             # unit tests for exported helpers
src/routes/tilt3d/+page.svelte                # demo page
```
