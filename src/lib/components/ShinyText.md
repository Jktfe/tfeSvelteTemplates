# ShinyText — Technical Logic Explainer

## What Does It Do? (Plain English)

ShinyText takes a plain string and runs a bright "shine" band across the letters on a loop, like a flashlight sweeping over engraved metal. The base text sits in a muted colour; a brighter band moves left-to-right (or right-to-left) and falls off back to the muted base on either side.

It is pure CSS — one `linear-gradient` clipped to the letter shapes via `background-clip: text`, animated by sliding `background-position`. No JavaScript runs after the component mounts. Think of it as polish for a CTA: more refined than a colour change, less heavy than a bouncy attention-grabber.

## How It Works (Pseudo-Code)

```
state:
  none — every behaviour is encoded in CSS custom properties

derive:
  gradient        = "linear-gradient(90deg, base 0%, shine 50%, base 100%)"
  animDirection   = direction === 'lr' ? 'normal' : 'reverse'
  iterationCount  = loop ? 'infinite' : '1'

render:
  <span style="
    background-image:           gradient;
    background-size:            200% auto;
    background-position:        -200% center;       // start fully off-screen left
    background-clip:            text;
    -webkit-text-fill-color:    transparent;        // letters become a 'window' to the gradient
    animation-name:             shiny-sweep;
    animation-duration:         {duration}s;
    animation-delay:            {delay}s;
    animation-direction:        animDirection;      // normal | reverse
    animation-iteration-count:  iterationCount;     // infinite | 1
    animation-fill-mode:        forwards;
  ">{text}</span>

keyframes shiny-sweep:
  from: background-position = -200% center  (band fully off-screen left)
  to:   background-position =  200% center  (band fully off-screen right)

prefers-reduced-motion:
  animation: none
  background-image: none           // remove gradient so transparent text isn't invisible
  fill colour: base                // settle on the muted resting colour
```

## The Core Concept: 200%-Wide Gradient + `background-clip: text`

The trick has two ingredients.

**One** — `background-clip: text` (with `-webkit-text-fill-color: transparent`) makes the gradient render *only* inside the letter shapes. The whitespace between letters stays transparent; the rectangular box that owns the gradient is invisible.

**Two** — the gradient is sized to twice the box width (`background-size: 200% auto`) and positioned off-screen to the left (`background-position: -200% center`). Animating `background-position` from `-200%` to `+200%` slides the gradient four element-widths in total, which is enough that a single bright stripe enters from one side, crosses the letters, and exits the other.

```
  background-size: 200%
  ┌───────────────────────────────────────────────┐
  │  base ──────── shine ──────── base            │   ← gradient image
  └───────────────────────────────────────────────┘
                     ▲
                     │ background-position slides this strip
                     │
              ┌──────┴──────┐
              │  S H I N Y  │   ← element box (clip window)
              └─────────────┘

  At -200%:  shine band sits left of the box → letters look base-coloured
  At    0%:  shine band centred → middle letters peak bright
  At +200%:  shine band sits right of the box → letters back to base
```

Because the gradient stops are `base 0% → shine 50% → base 100%`, every letter sees the brightest pixel exactly once per sweep, then fades back to base.

## CSS Animation Strategy

A single `@keyframes` block animates `background-position` from `-200%` to `+200%`. Direction is controlled by `animation-direction: reverse` for `'rl'` rather than a second keyframe block — both because it is shorter, and because it sidesteps a Safari/older-WebKit bug where CSS custom properties inside `@keyframes` sometimes fail to resolve.

`linear` easing keeps the highlight at constant velocity (any other curve would pool the brightness at one edge of the letters). The animation is GPU-friendly — `background-position` triggers only a paint, not a layout, and modern engines composite it cheaply.

For reduced-motion users the `@media (prefers-reduced-motion: reduce)` block does three things: stops the animation, removes the gradient image (so transparent fill doesn't leave invisible letters), and sets the colour back to `--shiny-base`. The result is the same word, statically rendered in the muted colour.

## Performance

- Zero JS work after mount. No `requestAnimationFrame`, no `setInterval`, no event listeners.
- One paint per frame on the element's bounding box; modern engines composite paints on the GPU.
- Safe to drop dozens onto one page — a marquee of CTAs costs the same as one because they all share the same composited pipeline.
- Pure-export helpers (`buildShinyGradient`, `getAnimDirection`, `getIterationCount`) live in the module-script block so unit tests can assert each branch in two lines without rendering.

## State Flow Diagram

```
  [mounted] ── delay elapsed ──▶ [sweeping] ─┐
                                              │ keyframe completes
                                              ▼
                                   loop ?  ─── infinite cycle
                                       │
                                       └── one-shot: settle on
                                           background-position: 200%

  prefers-reduced-motion: reduce
        │
        ▼
   [static]  no animation, no gradient, base colour fill
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | required | The text to render. |
| `baseColor` | `string` | `'#94a3b8'` | Resting / muted letter colour. |
| `shineColor` | `string` | `'#ffffff'` | Bright peak colour at the centre of the band. |
| `duration` | `number` | `3` | Seconds for one full sweep. |
| `direction` | `'lr' \| 'rl'` | `'lr'` | Which way the shine moves across the letters. |
| `loop` | `boolean` | `true` | Repeat indefinitely (`true`) or sweep once (`false`). |
| `delay` | `number` | `0` | Seconds to wait before the first sweep starts. |
| `class` | `string` | `''` | Extra classes on the wrapper span. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Empty `text` prop | Renders an empty inline-block span; no animation flicker. |
| `loop = false` | Plays one sweep, settles at `background-position: 200% center` (band off-screen right) — letters rest at base colour. |
| User has `prefers-reduced-motion: reduce` | Animation cancelled, gradient removed, letters render in `baseColor`. |
| Browser without `background-clip: text` support | Falls back to the literal `color: var(--shiny-base)` declared above the transparent fill — letters appear in the base colour with no shine. |
| `duration` set to `0` | The keyframe completes instantly; with `loop = true` you get a still image at the end position. |
| Letter colour overridden by inherited `color` | The `-webkit-text-fill-color: transparent` declaration wins over inherited colour — the gradient remains visible. |

## Dependencies

- **Svelte 5.x** — `$derived` runes and module-script exports are core to the implementation.
- Zero external dependencies — pure CSS keyframe animation, no animation libraries.

## File Structure

```
src/lib/components/ShinyText.svelte   # implementation
src/lib/components/ShinyText.md       # this file (rendered inside ComponentPageShell)
src/lib/components/ShinyText.test.ts  # vitest unit tests for the helper functions
src/routes/shinytext/+page.svelte     # demo page
```
