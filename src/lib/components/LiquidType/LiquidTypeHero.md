# LiquidTypeHero — Technical Logic Explainer

## What Does It Do? (Plain English)

Three words sit on a dark hero panel. As you move your cursor across them each character closest to the pointer "inflates" — its font-weight climbs from light (300) toward heavy (850) and it scales up subtly. While idle a slow left-to-right wave breathes through the row. Click anywhere and a shockwave radiates outward, briefly peaking each glyph it passes.

The continuous physics runs on a single rAF loop with damped-spring per glyph; the **entrance reveal** (per-glyph fade-up stagger) is GSAP-driven via `gsap.from(...stagger: 0.018, ease: power3.out)`. No GSAP business plugins — `requestAnimationFrame`, CSS custom properties, and `font-variation-settings` carry the steady-state physics; gsap-core handles the dramatic first-paint stagger.

## How It Works (Pseudo-Code)

```
state:
  glyphs[]        // one per character: { x, y, weight, weightV, scale, scaleV }
  pointer = { x, y, active }
  shockwave = { x, y, t, life }
  prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches

on mount:
  measure each glyph element → store its centre (x, y) in glyphs[]
  ResizeObserver(wrapper) → re-measure on resize
  if !prefersReduced: requestAnimationFrame(tick)
  else: paint a static heavy-weight version, never start the loop

each frame (rAF):
  seconds = now / 1000
  breath = 0.18 + 0.18 * sin(seconds * 0.6)        // global breath envelope
  wavePhase = seconds * 0.45                        // idle wave clock

  for each glyph i:
    pointerInfluence = pointer.active
      ? max(0, 1 - distance(glyph, pointer) / influenceRadius)
      : 0

    shockInfluence = ringInfluence(glyph, shockwave)  // see below

    idleWave = max(0, sin(wavePhase - i*0.32)) * breath * 0.32

    targetIntensity = max(pointerInfluence, shockInfluence, idleWave)
    targetWeight = baseWeight + (peakWeight - baseWeight) * targetIntensity
    targetScale  = baseScale  + (peakScale  - baseScale)  * targetIntensity

    // damped-spring step (per-glyph, dimensionless)
    glyph.weightV = (glyph.weightV + (targetWeight - glyph.weight) * 0.18) * 0.74
    glyph.scaleV  = (glyph.scaleV  + (targetScale  - glyph.scale)  * 0.20) * 0.72
    glyph.weight += glyph.weightV
    glyph.scale  += glyph.scaleV

    span.style.setProperty('--lt-weight', glyph.weight)
    span.style.setProperty('--lt-scale',  glyph.scale)

events:
  pointermove → pointer = (x - rect.left, y - rect.top, active=true)
  pointerleave → pointer.active = false; pointer = (-9999, -9999)
  click → shockwave = { x, y, t = now, life: 1.2s }
  resize → re-measure glyph centres
```

## The Core Concept: A "Single Variable per Glyph" Render

The expensive part of any per-character animation is talking to the DOM. The cheap part is the maths. LiquidTypeHero leans hard on that asymmetry: the rAF loop computes everything purely from numbers (cursor distance, shockwave ring, breath envelope) and writes exactly **two CSS custom properties per glyph per frame**:

```js
span.style.setProperty('--lt-weight', glyph.weight);
span.style.setProperty('--lt-scale', glyph.scale);
```

The CSS does the rest:

```css
.lt-glyph {
  font-variation-settings: 'wght' var(--lt-weight, 300);
  font-weight: var(--lt-weight, 300);
  transform: scale(var(--lt-scale, 1));
  will-change: transform, font-weight;
}
```

`font-weight` is the fallback so the effect still reads on non-variable fonts (the user just gets the four discrete weights the platform supports). When a real variable font (Inter Variable, etc.) is loaded, `font-variation-settings: 'wght' …` interpolates smoothly through the entire weight axis.

`will-change` hints to the compositor to keep these properties on a GPU layer, so the per-frame writes don't trigger layout passes. The browser handles the actual interpolation; the rAF loop just publishes the next target every frame.

## Three Influence Sources, One Max

The most important design choice in the loop is the line:

```js
targetIntensity = Math.max(pointerInfluence, shockInfluence, idleWave);
```

Three independent forces try to peak each glyph: the pointer (when active and nearby), an in-flight shockwave (when the user clicked recently), and the idle breathing wave. They DON'T sum — they `max`. Summing would let the idle wave push glyphs past their peak even when the pointer isn't there; max keeps the peak weight as a hard ceiling.

The shockwave influence in particular is a moving ring, not a flood:

```js
const elapsed = now - shockwave.t;            // seconds since click
const ringR   = elapsed * 480;                // ring radius grows at 480 px/s
const distFromRing = Math.abs(distance(glyph, shockwave) - ringR);
const ringWidth = 90;
shockInfluence = distFromRing < ringWidth
  ? (1 - distFromRing / ringWidth) * (1 - elapsed / shockwave.life)
  : 0;
```

So a glyph 200 px from the click point gets peak influence ~0.42 s after the click (when ringR ≈ 200), then fades over the remaining lifetime. The decay multiplier `(1 - elapsed / life)` ensures the shockwave naturally fades to zero by `life` seconds.

## Damped-Spring Physics in Six Numbers

Each per-frame step:

```
v = (v + (target - x) * STIFFNESS) * DAMPING
x = x + v
```

For weight: `STIFFNESS = 0.18`, `DAMPING = 0.74` — fast attack, snappy release.
For scale:  `STIFFNESS = 0.20`, `DAMPING = 0.72` — even snappier (scale changes are visually subtle and want a faster feel).

These are per-frame ratios, so they're stable across 60Hz/120Hz/jittery framerates without per-frame normalisation. Picking different stiffness/damping per axis is intentional — the eye reads weight changes more slowly than scale changes, so weight benefits from a slightly softer attack.

## State Flow Diagram

```
              ┌──────────────────────────┐
              │  pointer / shockwave /   │
              │  idle-wave inputs        │
              └────────────┬─────────────┘
                           │  per-frame
                           ▼
              ┌──────────────────────────┐
              │  for each glyph i:        │
              │   pInf = pointer falloff  │
              │   sInf = shock ring band  │
              │   iWave = sin(t - i*k)    │
              │   target = max(pInf,sInf,iWave) │
              └────────────┬─────────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │ damped-spring step on     │
              │ weight + scale (separate) │
              └────────────┬─────────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │ span.style.setProperty(   │
              │   '--lt-weight', w);      │
              │ span.style.setProperty(   │
              │   '--lt-scale',  s);      │
              └────────────┬─────────────┘
                           │
                           ▼
                requestAnimationFrame
```

## Props Reference

| Prop                | Type        | Default                         | Description                                                         |
|---------------------|-------------|---------------------------------|---------------------------------------------------------------------|
| `words`             | `string[]`  | `['Words', 'have', 'weight']`   | Words to render. Spaces preserved between them.                     |
| `baseWeight`        | `number`    | `300`                           | Idle font-weight per glyph.                                         |
| `peakWeight`        | `number`    | `850`                           | Peak font-weight when fully influenced.                             |
| `baseScale`         | `number`    | `1`                             | Idle scale.                                                         |
| `peakScale`         | `number`    | `1.18`                          | Peak scale at full influence.                                       |
| `influenceRadius`   | `number`    | `160`                           | Pointer influence falls off linearly to zero at this radius (px).   |
| `ariaLabel`         | `string`    | `'Liquid Type hero'`            | Wrapper aria-label.                                                 |
| `class`             | `string`    | `''`                            | Extra classes on the outer container.                               |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `prefers-reduced-motion: reduce` | rAF loop never starts. Glyphs render at a fixed mid weight (600) with `transform: none`. Pointer/click events are still received but produce no visual change. |
| Non-variable font available | `font-variation-settings` is ignored; `font-weight` falls back to whatever discrete weights the font ships (typically 300/400/700/900). The animation still reads but in chunky steps instead of smooth. |
| Wrapper resizes / browser zoom | `ResizeObserver` re-measures glyph centres so pointer influence stays accurate. |
| `words` array contains a single empty string | The component renders nothing visible; the rAF loop runs but has no glyphs to update. |
| Empty `words` array | Same as above — sr-only fallback renders nothing. |
| User clicks repeatedly | The most recent click overwrites `shockwave.t`; only one active shockwave at a time. |
| Pointer leaves the wrapper | Pointer is reset to `(-9999, -9999)` and `active = false`; only idle + shockwave influences remain. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$props`, `onMount`.
- **`gsap` core** (already a project dep) — drives the per-glyph entrance stagger via `gsap.from`. No GSAP business plugins.
- **`requestAnimationFrame`** + **`ResizeObserver`** — drive the continuous per-character spring physics + position re-measurement.
- **CSS `font-variation-settings` + custom properties** — `--lt-weight` + `--lt-scale` written each frame; universally supported.

## File Structure

```
src/lib/components/LiquidType/LiquidTypeHero.svelte    # implementation
src/lib/components/LiquidType/LiquidTypeHero.md        # this file
src/lib/components/LiquidType/LiquidTypeHero.test.ts   # vitest unit + behaviour tests
src/lib/types.ts                                       # LiquidTypeHeroProps
```
