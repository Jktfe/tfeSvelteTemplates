# ClickSpark — Technical Logic Explainer

## What Does It Do? (Plain English)

ClickSpark is a wrap-anything decoration that fires a tiny burst of particles every time the user clicks inside the wrapper. The wrapped element — a button, a link, a card, an image — keeps its normal click behaviour; ClickSpark just paints decorative sparks emanating from the exact pixel where the click landed. Each burst is independent and self-cleans, so even if the user mashes a button ten times in a row the bursts overlap cleanly without any state churn.

The shapes (dot, plus, line, star) and palette (any CSS colour) are configurable per instance. Reduced-motion users get the click semantics with no particles at all — the spark generation short-circuits before any DOM mutation.

## How It Works (Pseudo-Code)

```
state:
  bursts[]   = []        // list of active bursts; each has { id, x, y, angles[] }
  nextId     = 0         // monotonically increasing id

on click(event):
  if prefers-reduced-motion: return
  rect = wrapper.getBoundingClientRect()
  x    = event.clientX − rect.left           // relative to wrapper
  y    = event.clientY − rect.top
  id   = nextId++
  angles = getSparkAngles(sparkCount)         // [0, 360/n, 2*360/n, …]
  bursts.push({ id, x, y, angles })

  schedule(setTimeout, duration + 50ms):
    bursts = bursts.filter(b => b.id !== id)  // self-clean

render:
  emit wrapper { onclick }
    render { children }
    for each burst in bursts (keyed by id):
      div.burst at (left: burst.x, top: burst.y)
        for each angle in burst.angles:
          span.spark.spark-{shape} with CSS vars:
            --angle, --distance, --duration, --color, --size, --easing

CSS:
  .spark {
    transform: rotate(var(--angle)) translateX(0) scale(1);
    animation: spark-fly var(--duration) var(--easing) forwards;
  }
  @keyframes spark-fly {
    0%   { transform: rotate(var(--angle)) translateX(0)              scale(1);   opacity: 1; }
    60%  { opacity: 1; }
    100% { transform: rotate(var(--angle)) translateX(var(--distance)) scale(0.4); opacity: 0; }
  }
```

The `setTimeout` after `duration + 50` ms is deliberately slack — the +50 absorbs jitter so a spark that finishes a frame late doesn't briefly render at scale 0.4 before being garbage-collected.

## The Core Concept: Even Angle Distribution Plus Rotate-Then-Translate

Two ideas combine to give cheap, correct radial bursts.

**1. Evenly-spaced angles** are computed by `getSparkAngles(count)`:

```
angles[i] = i * (360 / count)
```

For `sparkCount = 8` you get `[0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°]` — a clean octagon. Whatever count the consumer picks, the sparks are always evenly distributed; the function lives in `<script module>` so unit tests can verify it without rendering.

**2. Rotate-first, translate-second** sidesteps the per-spark `cos/sin` calls you would normally need to send each particle in its own direction. The CSS transform on each spark is:

```
transform: rotate(var(--angle)) translateX(0)              // start
transform: rotate(var(--angle)) translateX(var(--distance))  // end
```

Reading the transform: the `translateX(distance)` walks the spark out along its own X axis, but because that translation is applied *inside* the rotated coordinate system, the spark actually moves in whatever direction the rotation pointed. So a spark assigned `--angle: 90deg` walks straight down once the rotation is applied; a spark at `45deg` walks down-and-right; a spark at `0deg` walks right. The browser does all the trigonometry on the GPU compositor; the JavaScript only had to assign the angles.

```
              spark angle distribution (count = 8)
                       0°
                        │
              315°    ──┼──    45°
                        │
                 ──    [●]    ──         ← burst origin (the click point)
                        │
              225°    ──┼──    135°
                        │
                       180°
```

The mid-keyframe `60% { opacity: 1 }` keeps the spark fully visible for the bulk of its travel, then it fades sharply in the final 40%. This gives the burst a snappier feel than a linear opacity ramp would — the eye reads "particle dies" rather than "particle slowly fades the whole way".

## CSS Animation Strategy

Every spark is a single `<span>` with five CSS custom properties driving the animation. There is no per-frame JavaScript and no `requestAnimationFrame` loop — the browser handles each spark independently.

```css
.spark {
  position: absolute;
  width: var(--size);
  height: var(--size);
  margin-left: calc(var(--size) / -2);   /* centred on the click point */
  margin-top:  calc(var(--size) / -2);
  background: var(--color);
  transform: rotate(var(--angle)) translateX(0) scale(1);
  animation: spark-fly var(--duration) var(--easing) forwards;
}
```

Four shape variants share the same animation, distinguished only by paint:

- `spark-dot` — `border-radius: 50%`
- `spark-plus` — two crossed gradient bars, transparent background
- `spark-line` — a thin pill (`width: size * 0.3`) that streaks outward
- `spark-star` — solid background masked by a five-pointed `clip-path`

`pointer-events: none` on the burst layer ensures the visual sparks never swallow subsequent clicks meant for the wrapped child. The wrapper itself is `position: relative; display: inline-block` so it does not disturb the parent's layout flow.

`@media (prefers-reduced-motion: reduce) { .spark { display: none; } }` is the belt-and-braces fallback — the click handler also short-circuits up front, so this only matters if the preference flips mid-flight.

## State Flow Diagram

```
                 ┌──────────────────┐
                 │   IDLE           │
                 │   bursts = []    │
                 └────────┬─────────┘
                          │ click event
                          │ (prefers-reduced-motion? skip → IDLE)
                          ▼
                 ┌──────────────────┐
                 │   FIRING         │   ← bursts has ≥1 entry
                 │   sparks animate │
                 │   via CSS only   │
                 └────────┬─────────┘
                          │ duration + 50ms timer fires per-burst
                          ▼
                 ┌──────────────────┐
                 │   GARBAGE COL.   │
                 │   filter out id  │
                 └────────┬─────────┘
                          │ if any other bursts remain → FIRING, else → IDLE
                          ▼

   prefers-reduced-motion: reduce → click handler returns early; never enters FIRING.
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sparkColor` | `string` | `'#ffffff'` | Any CSS colour. Drives the spark fill (and the gradient stops for the plus variant). |
| `sparkCount` | `number` | `8` | Particles per click, distributed evenly around 360°. `getSparkAngles` is exported for unit testing. |
| `sparkSize` | `number` | `10` | Particle size in pixels. Line and star variants scale internally off this. |
| `spreadRadius` | `number` | `60` | How far each particle travels before reaching its endpoint. |
| `duration` | `number` | `500` | Burst lifetime in milliseconds. Shorter = snappier; longer = lazier. |
| `easing` | `string` | `'cubic-bezier(0.25, 1, 0.5, 1)'` | Any CSS easing string. Drives the fly-out curve. |
| `shape` | `'dot' \| 'plus' \| 'line' \| 'star'` | `'dot'` | Visual variant. All four use the same animation pipeline. |
| `class` | `string` | `''` | Extra classes on the wrapper. |
| `children` | `Snippet` | required | The element(s) to wrap. Their click semantics are preserved. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `sparkCount = 0` | `getSparkAngles(0)` returns `[]`. The burst is created with no sparks — visible no-op. Cheaper to omit ClickSpark entirely. |
| Rapid repeated clicks | Each click pushes an independent burst; bursts may overlap visually but never share state. Each cleans itself on its own timer, so the array stays bounded by `clicks-per-second × duration`. |
| Click on disabled child button | The native click event still bubbles to the wrapper. The burst fires; the inner action does not. Fine for most cases. |
| Wrapper rendered inside `display: inline` parent | We force `inline-block` in CSS so positioning works. Adjacent inline content is unaffected. |
| Wrapped element overflows the wrapper | Clicks on the overflowed area do not fire (event listener is on the wrapper only). Wrap the overflowing element instead. |
| `prefers-reduced-motion: reduce` | Click handler returns early before any burst is created; no DOM mutation, no animation. The wrapped child still receives its click. |
| Burst fires near the edge of the wrapper | Sparks may animate outside the wrapper's box. The wrapper has `position: relative` but no `overflow: hidden`, so this is intentional — the burst is a moment of celebration, not a layout-bound element. |
| Component unmounts mid-burst | `setTimeout` callbacks reference state owned by the unmounted instance. Svelte tears down the DOM with the component, so the visible sparks disappear with their host; no memory leak. |

## Dependencies

- **Svelte 5** — `$state` for the reactive bursts array, `$props` for configuration, `Snippet` for the children slot.
- **`<script module>`** — exports `getSparkAngles` so unit tests can import the angle distributor without rendering the component.
- **Zero external libraries** — no animation library, no icon library, no font CDN. All four spark shapes are pure CSS.

## File Structure

```
src/lib/components/ClickSpark.svelte          # implementation
src/lib/components/ClickSpark.md              # this explainer
src/lib/components/ClickSpark.test.ts         # unit tests, importing getSparkAngles
src/routes/clickspark/+page.svelte            # demo page
```
