# MagneticButton — Technical Logic Explainer

## What Does It Do? (Plain English)

MagneticButton is a wrapper that makes its child element subtly chase the cursor — as you move the mouse near a wrapped button or link, the element drifts a few pixels in that direction, like an iron filing tugged towards a magnet. It is a tactile "this is interactive" cue, especially common on premium product pages where every CTA needs a moment of personality.

The wrapper itself has no semantics. The interactive element you put inside (a `<button>`, an `<a>`, whatever) keeps its native role, focus ring, ARIA labels, and keyboard handling. MagneticButton only exists to translate the inner element by a few pixels in response to cursor proximity. On a touchscreen or with reduced motion enabled, the wrapper goes inert and the button behaves like an ordinary button.

## How It Works (Pseudo-Code)

```
state:
  x, y          = (0, 0)        // current translation in pixels
  prefersReducedMotion          // capability flag
  coarsePointer                 // capability flag (touch device)

on mount:
  read matchMedia('(prefers-reduced-motion: reduce)')
  read matchMedia('(pointer: coarse)')
  subscribe to both for live OS-level changes
  return cleanup that unsubscribes on destroy

on mousemove(event) over wrapper:
  if prefersReducedMotion or coarsePointer: return       // inert path
  rect       = wrapper.getBoundingClientRect()
  centerX    = rect.left + rect.width / 2
  centerY    = rect.top  + rect.height / 2
  dx         = event.clientX − centerX
  dy         = event.clientY − centerY
  distance   = sqrt(dx² + dy²)
  if distance < radius:
    factor = (1 − distance / radius) × strength    // closer = stronger pull
    x = dx × factor
    y = dy × factor
  else:
    x = 0; y = 0                                   // outside influence

on mouseleave:
  x = 0; y = 0                                     // CSS transition eases home

render:
  outer wrapper:
    padding  = radius           // expands hit area to capture pre-hover
    margin   = -radius          // cancels visual padding so layout stays put
  inner content:
    transform: translate(x, y)
    transition: transform damping s cubic-bezier(.23, 1, .32, 1)
```

The outer wrapper's `padding: radius; margin: -radius;` trick is the small but critical detail that lets the magnetic pull begin *before* the cursor reaches the visible button. Without it, you would only see motion once the pointer was already on the element — which defeats the point.

## The Core Concept: Linear Pull With A Cosine-Shaped Glide-Home

The displacement formula is deliberately simple:

```
factor = (1 − distance / radius) × strength
x = (cursorX − centerX) × factor
y = (cursorY − centerY) × factor
```

Plotting `factor` against `distance` is a straight line from `strength` (when the cursor is on top of the centre) down to `0` (at the edge of the influence radius):

```
strength │●
         │ ●
         │  ●
         │   ●
       0 │    ●─────────── distance (px)
         0    radius
```

A linear pull is the right call here because the element ought to track the cursor more or less proportionally — anything fancier (an exponential, a smoothstep) makes the motion feel laggy at close range. The motion *feels* eased not because the pull curve is curved, but because the **return-to-rest** is curved: the inner element carries a CSS `transition: transform <damping>s cubic-bezier(0.23, 1, 0.32, 1)`. That cubic-bezier is one of the standard "ease-out-expo"-flavoured curves — quick at the start, slow at the end — which produces the silky settle when the cursor leaves.

So the recipe is: hard-realtime linear math while the cursor is inside the radius, soft cubic-bezier easing whenever the position changes (which the CSS transition handles for free, frame after frame). The `damping` prop is the duration of that CSS transition, not a physics damping coefficient — a slight misnomer kept for friendliness.

The `radius` prop controls reach (how far away the magnet starts pulling); the `strength` prop controls how much of that pull lands as visible motion. Default `strength = 0.3` means at the centre the element moves 30% of the cursor's offset towards itself. Going above ~0.5 makes the element feel like it is being chased *too* hard and looks gummy.

## CSS Animation Strategy

JavaScript writes inline `style:transform` and `style:transition` per pointermove; CSS handles the visible motion via `will-change: transform` to keep the inner element on its own GPU layer.

```css
.magnetic-wrapper {
  display: inline-block;
  padding: var(--radius);   /* enlarged hit area */
  margin: calc(var(--radius) * -1);  /* layout-neutral */
  cursor: pointer;
}

.magnetic-content {
  display: block;
  will-change: transform;
}
```

Reduced motion is handled at the JavaScript layer rather than via `@media`: when `prefers-reduced-motion: reduce` is true, the pointermove handler returns immediately so `x` and `y` never leave `(0, 0)`. The element is still in the DOM, fully accessible, fully clickable — it just doesn't drift.

Coarse-pointer devices get the same kill switch. Tap-and-hold could theoretically fire pointermove, but the result on most touch hardware is jittery and the magnetic wobble looks like a bug. Better to render a clean, static button.

## Performance

Per cursor frame:

- one `getBoundingClientRect()` (cheap; no forced layout if no other code is reading layout that frame)
- four arithmetic ops (subtract, sqrt, divide, multiply)
- two `$state` writes (`x`, `y`)
- two inline-style updates that the compositor folds into the existing layer

Steady state when the cursor is outside the wrapper or absent: zero. There is no `requestAnimationFrame` loop, no observer, no timer.

The initial mount cost is two `matchMedia` subscriptions, both released by a returned cleanup closure on destroy.

## State Flow Diagram

```
              ┌────────────────────────┐
              │  mount                 │
              │  read motion / pointer │
              │  subscribe to changes  │
              └───────────┬────────────┘
                          │ cursor enters padded hit area
                          ▼
              ┌────────────────────────┐
              │  ACTIVE                │  ← every mousemove → recompute (x, y)
              │  x, y track cursor     │
              └───────────┬────────────┘
                          │ cursor leaves
                          ▼
              ┌────────────────────────┐
              │  REST                  │  ← (x, y) = (0, 0)
              │  CSS transition eases  │
              └────────────────────────┘

  Reduced-motion: reduce  ──►  pointermove returns early. ACTIVE never entered.
  Coarse pointer (touch)  ──►  pointermove returns early. Static button.
  OS preference flips     ──►  matchMedia listeners flip the gates live.
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `Snippet` | required | The interactive element to wrap (button, link, etc). The wrapper does not own focus or click. |
| `strength` | `number` | `0.3` | Multiplier on the linear pull. `0.3` means the element travels 30% of the cursor's offset toward itself when at centre. Values >0.5 feel sticky. |
| `radius` | `number` | `100` | Influence radius in pixels. The pull starts at this distance and ramps to maximum at the centre. The wrapper's hit-area padding is set to this value so the pull begins *before* the cursor visually reaches the element. |
| `damping` | `number` | `0.1` | Duration in seconds of the CSS transition that runs whenever `x` / `y` change. Higher = silkier glide back to rest, lower = snappier tracking. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `prefers-reduced-motion: reduce` set at OS level | Pointermove handler bails out; element stays at `(0, 0)`. Listener stays subscribed so the user can flip the preference and the magnet wakes up live. |
| Touch device (`pointer: coarse`) | Same kill switch. The button works as a normal tap target. |
| OS preference flips at runtime | The two `matchMedia` listeners update `prefersReducedMotion` / `coarsePointer` reactively, so the magnet flips on/off without a page reload. |
| Multiple stacked wrappers | Each wrapper is independent; pointermove fires on whichever element is currently under the cursor (or its ancestor chain). The padding / negative-margin trick keeps layout neutral so wrappers can sit inside flex/grid containers without disturbing alignment. |
| Very small wrapped element with default `radius=100` | The padded hit-area can extend well beyond the element. This is intentional — it's how the pull starts before you reach the button — but be aware that the wrapper covers ~200×200 px of pointer-event surface around any 24×24 px icon button. Stagger them or shrink `radius`. |
| Disabled wrapped button | The wrapper still moves — the magnet is wrapper-side. If the visual feedback feels wrong on a disabled state, set `strength={0}` or omit MagneticButton when the inner button is disabled. |
| Cursor enters and immediately leaves | Single pointermove fires (sets x,y), then mouseleave fires (resets to 0,0). The CSS transition handles both transitions smoothly without any "snap". |

## Dependencies

- **Svelte 5** — `$state`, `$props`, `Snippet`. Reactivity is the whole story; no manual subscription bookkeeping needed.
- **`onMount` / cleanup** — to subscribe / unsubscribe from `matchMedia` listeners safely.
- **Zero external libraries** — no animation library, no spring physics library. The cubic-bezier `cubic-bezier(0.23, 1, 0.32, 1)` is built into CSS.

## File Structure

```
src/lib/components/MagneticButton.svelte      # implementation
src/lib/components/MagneticButton.md          # this explainer
src/routes/magneticbutton/+page.svelte        # demo page
```
