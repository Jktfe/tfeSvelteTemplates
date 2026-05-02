# CRTScreen — Technical Logic Explainer

## What Does It Do? (Plain English)

CRTScreen wraps any slot of content in a retro cathode-ray-tube monitor frame. The slotted content stays normal HTML — text, paragraphs, headings, even other components — and the wrapper paints horizontal scanlines, RGB chromatic aberration on the inner glyphs, an optional vertical "tracking roll" band, and a soft corner vignette on top of it. Four named profiles bundle the colours: `amber` (1980s terminal), `green` (lab phosphor), `broadcast` (TV news), and `modern` (slate + pink/cyan ghosting).

Think of it as a transparent vinyl sticker of a CRT monitor that you stick over real HTML. Click-throughs, focus, copy-paste — everything still works underneath.

## How It Works (Pseudo-Code)

```
state:
  profileName = 'amber' | 'green' | 'broadcast' | 'modern'
  density     = 3                  // scanline cycle height (px)
  intensity   = 1                  // scanline alpha multiplier
  aberration  = 1                  // RGB ghost offset (px)
  roll        = false | true | 0..10
  vignette    = true
  curved      = false

derive:
  profile           = pickProfile(profileName) ?? PROFILES.amber
  scanGradient      = buildScanlineGradient(intensity, density, profile)
                    = repeating-linear-gradient(0deg,
                        profile.scan 0px,
                        profile.scan {lineHeight}px,
                        transparent {lineHeight}px,
                        transparent {density}px)
  aberrationShadow  = buildAberrationShadow(aberration, profile)
                    = `${a}px 0 0 profile.aberrationR,
                       -${a}px 0 0 profile.aberrationB`
  rollSpeed         = typeof roll === 'number' ? roll : roll ? 3 : 0
  rollCfg           = rollSchedule(rollSpeed)
                    = rollSpeed === 0
                        ? { duration: '0s', animationName: 'none' }
                        : { duration: `${18/rollSpeed}s`,
                            animationName: 'crt-roll' }

render:
  div.crt-root with --crt-* custom properties
    div.crt-screen
      div.crt-content { @render children() }
                       // inherits text-shadow: var(--crt-aberration)
      div.crt-overlay.crt-scanlines  (mix-blend-mode: multiply)
      div.crt-overlay.crt-roll       (animated translateY)
      div.crt-overlay.crt-vignette-layer  [if vignette]

CSS:
  .crt-scanlines { background: var(--crt-scan-gradient) }
  .crt-roll {
    background: linear-gradient(180deg, /* white band, soft top+bottom */);
    background-size: 100% 200%;
    background-position: 0 -100%;
    animation: var(--crt-roll-name) var(--crt-roll-duration) linear infinite;
  }
  @keyframes crt-roll {
    0%   { background-position: 0 -100%; }
    100% { background-position: 0  100%; }
  }
```

The component does **zero work after mount**. All `$derived` values are functions of props; CSS handles every frame.

## The Core Concept: Stacked Overlays Over a Slot

The visual is the sum of four overlays. Each overlay is a single `<div>` with a single CSS rule. Read together they reproduce a CRT.

### 1. Scanlines via repeating-linear-gradient

```css
background: repeating-linear-gradient(
  0deg,
  rgba(0, 0, 0, 0.42) 0px,
  rgba(0, 0, 0, 0.42) 1px,
  transparent 1px,
  transparent 3px
);
mix-blend-mode: multiply;
```

`repeating-linear-gradient` is the cheapest way to paint stripes — a single CSS expression produces an arbitrary number of lines. `0deg` means the lines run horizontally. The four colour stops form one cycle: dark from 0 to 1 px, transparent from 1 to 3 px (= one 3 px cycle, repeated forever).

`buildScanlineGradient` constructs this string at render time:

```ts
const lineHeight = safeI === 0 ? 0 : Math.max(1, Math.round(safeI * 1.2));
return `repeating-linear-gradient(0deg,
  ${profile.scan} 0px,
  ${profile.scan} ${lineHeight}px,
  transparent ${lineHeight}px,
  transparent ${safeD}px)`;
```

`density` controls the cycle height (smaller = tighter lines, larger = chunky CRT). `intensity` modulates the dark-stop alpha *and* the line height — at intensity 1 the dark band is `1.2px` thick; at intensity 0 it collapses to 0 and the gradient becomes pure transparency.

`mix-blend-mode: multiply` darkens everything beneath rather than overlaying solid black, so the scanlines bleed through the content rather than crushing it.

### 2. Chromatic aberration via channel-split text-shadow

Real CRTs misalign the R, G, B electron beams slightly, producing colour fringes around glyph edges. Implemented as:

```css
.crt-content {
  text-shadow: 1.00px 0 0 rgba(255, 80, 40, 0.7),  /* R offset right */
              -1.00px 0 0 rgba(40, 200, 255, 0.55); /* B offset left */
}
```

`buildAberrationShadow` builds this at render time. Two zero-blur shadows at horizontally opposite offsets create the channel-split — a red ghost to the right, a blue ghost to the left. The original glyph is in the middle, untouched.

`aberration={0}` short-circuits to `'none'` so the text renders crisply when the effect isn't wanted (e.g. for accessibility or for a cleaner look).

The choice of channel colours per profile matters — `amber` uses warm-orange and cool-cyan offsets; `modern` uses pink and sky for a fashion-magazine retro look that doesn't sit on the orange/green axis.

### 3. Vertical tracking roll

A faulty CRT shows a pale band slowly drifting down the screen — the "tracking roll" caused by misaligned vertical sync. Implemented as a single keyframe animating `background-position`:

```css
.crt-roll {
  background: linear-gradient(180deg,
    transparent 0%, transparent 40%,
    rgba(255,255,255,0.05) 48%,
    rgba(255,255,255,0.10) 50%,
    rgba(255,255,255,0.05) 52%,
    transparent 60%, transparent 100%);
  background-size: 100% 200%;        /* twice as tall as the screen */
  background-position: 0 -100%;       /* start above viewport */
  animation: crt-roll var(--crt-roll-duration) linear infinite;
  mix-blend-mode: screen;
}
@keyframes crt-roll {
  0%   { background-position: 0 -100%; }
  100% { background-position: 0  100%; }
}
```

The gradient is twice as tall as the overlay (`background-size: 100% 200%`). The `from` position `-100%` puts the white band entirely above the visible area; the `to` position `100%` puts it entirely below. Linear easing means the band drifts at constant speed, top to bottom, over `--crt-roll-duration`. `mix-blend-mode: screen` lightens the underlying content where the band passes — the inverse of the scanline overlay's `multiply`.

`rollSchedule(speed)` maps the 0-10 knob to a duration: speed 1 → 18 s (slow drift), speed 10 → 1.8 s (rapid roll). Speed 0 returns `{ animationName: 'none' }`, removing the animation entirely.

### 4. Vignette via radial-gradient

```css
background: radial-gradient(ellipse at center,
  transparent 50%,
  rgba(0, 0, 0, 0.6) 100%);
```

A single ellipse-shaped radial gradient — fully transparent for the inner 50 % of the radius, ramping to 60 % black at the corners. Each profile picks its own end-stop alpha. Cheap, GPU-composited, no animation.

### 5. Curved-glass option

`curved={true}` rounds the inner screen corners (`border-radius: 1.5rem`) and adds an inset box-shadow:

```css
.crt-curved::before {
  border-radius: 1.5rem;
  box-shadow: inset 0 0 6rem rgba(0, 0, 0, 0.5);
}
```

The inset shadow darkens the perimeter from the inside, faking the way a curved CRT bezel falls into shadow at its edges.

## CSS Animation Strategy

Only one keyframe in the entire component — `crt-roll`. The scanlines, vignette, and aberration are static CSS rules that don't animate at all.

The roll animation runs on a single `background-position` shift. `background-position` is GPU-composited in modern browsers when the element has a stable layout, so the animation is essentially free.

`mix-blend-mode` is the cheap trick that makes the overlays composite correctly without separate render passes:
- `multiply` on scanlines darkens the content beneath
- `screen` on the roll lightens it
- `mix-blend-mode` is hardware-accelerated when the layer is GPU-promoted (which `position: absolute` + `inset: 0` triggers).

`prefers-reduced-motion: reduce` is honoured by:

```css
@media (prefers-reduced-motion: reduce) {
  .crt-roll       { animation: none; }
  .crt-content    { text-shadow: none; }
}
```

The roll stops, the chromatic aberration disappears (some users find the channel split actively painful). Scanlines and vignette remain — they're appearance, not motion.

## Performance

- **Three or four overlay layers per instance** — scanlines (always), roll (always, may be `animation: none`), vignette (optional), curved-glass `::before` (optional).
- **All four are GPU-composited.** The repeating-linear-gradient and radial-gradient compute once per layout, not per frame.
- **One animated keyframe per instance** if `roll > 0`. Otherwise zero.
- **No JS per frame.** All derived state is `$derived` over props.
- **No measurement, no observers.** The wrapper sizes to its content; overlays use `inset: 0` and adapt naturally.
- **Stack many CRTScreens?** Each one adds 3-4 compositor layers. A page of 20 instances uses ~80 layers, which modern compositors handle but is on the higher end. For a list of CRTScreens, consider gating the heavier (`curved`, `aberration`, `roll`) features behind a `is-visible` IntersectionObserver in your wrapper.

## State Flow Diagram

```
                  ┌─────────────────────────────┐
                  │  render with props          │
                  │  derived: profile, scan,    │
                  │  aberration, rollCfg        │
                  └────────────┬────────────────┘
                               │ mount (no JS work)
                               ▼
              ┌────────────────┬─────────────────┐
              │                │                 │
              │ roll > 0       │ roll = 0/false  │
              ▼                ▼                 │
       ┌──────────────┐ ┌──────────────┐        │
       │  rolling     │ │  steady      │        │
       │  band drifts │ │  no anim     │        │
       │  top→bottom  │ │  on roll     │        │
       │  forever     │ │  layer       │        │
       └──────────────┘ └──────────────┘        │
                               │                 │
              ┌────────────────┼─────────────────┘
              ▼                ▼
       ┌──────────────┐ ┌──────────────┐
       │ aberration=0 │ │ aberration>0 │
       │ → text-shadow│ │ → R/B ghost  │
       │   'none'     │ │   on content │
       └──────────────┘ └──────────────┘

  prefers-reduced-motion: reduce
    → roll animation: none
    → text-shadow: none on content
    → scanlines + vignette stay
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `profile` | `'amber' \| 'green' \| 'broadcast' \| 'modern'` | `'amber'` | Named colour profile. Unknown values fall back to `amber`. |
| `density` | `number` | `3` | Scanline cycle height in pixels. Clamped to `>= 1` and rounded to a positive integer. |
| `intensity` | `number` | `1` | Scanline alpha multiplier. Clamped to `[0, 1]`; `0` flattens the lines to invisible. |
| `aberration` | `number` | `1` | Chromatic-aberration offset in pixels. `0` removes the text-shadow entirely. |
| `roll` | `boolean \| number` | `false` | Tracking-roll speed. `true` → 3, `false`/`0` → off, `1`–`10` → explicit speed mapped to 18s → 1.8s duration. |
| `vignette` | `boolean` | `true` | Render the corner-darkening radial overlay. |
| `curved` | `boolean` | `false` | Round the inner screen corners and add an inset shadow for a glassy feel. |
| `class` | `string` | `''` | Extra CSS classes on `.crt-root`. |
| `children` | `Snippet` | optional | The content being framed. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Unknown `profile` name | `pickProfile` falls back to `amber`. |
| `density` < 1 / `NaN` | Clamped to `1` and rounded; `density=0` would mean "every pixel is a scanline" which would just black out the content. |
| `intensity` outside `[0, 1]` | Clamped at the helper level; CSS receives a sane value. |
| `intensity` = 0 | Scanlines become transparent (invisible); other overlays remain. |
| `aberration` = 0 | `buildAberrationShadow` returns `'none'`; content renders crisply. |
| `aberration` very large (e.g. 20) | Text-shadow renders huge ghosts; layout doesn't shift, but legibility drops. Practical max ~3 px. |
| `roll` = `Infinity` / `NaN` | `Math.max(0, Math.min(10, speed))` returns `NaN`; `rollSchedule` returns `{ animationName: 'none' }` and the animation doesn't run. |
| `prefers-reduced-motion: reduce` | Roll animation killed; aberration `text-shadow` disabled. Scanlines + vignette stay. |
| Component scrolled offscreen | Browser throttles compositor layer. Roll animation pauses naturally on hidden tabs. |
| Wrapper resized | Overlays use `inset: 0` and `repeating-linear-gradient` is layout-independent — adapts naturally without `ResizeObserver`. |
| Hi-DPI / retina | `repeating-linear-gradient` lines render at CSS pixels; on retina a 1 px line is sub-pixel and may anti-alias. Increase `intensity` to push the line height to 2+ px on retina screens. |
| GPU acceleration unavailable | Mix-blend-modes fall back to CPU compositing; rolling band may stutter. Drop `roll` to `false` if frame-rate suffers. |
| Content slot uses `position: absolute` | Escapes the screen frame; usually not what you want. Wrap the absolute child in a relative container. |
| Content overflow | `.crt-root` has `overflow: hidden`; long slots crop at the screen edges. Add a scroll container inside the slot if you need vertical scrolling. |
| Browser without `mix-blend-mode` (very old) | Scanlines and roll render at full opacity instead of blending — cosmetically uglier, still functional. Modern browsers all support it. |
| Multiple instances, same `roll` value | They all roll in lockstep — same keyframe, same duration. Add per-instance `animation-delay` via the `class` prop if you want staggered rolls. |

## Dependencies

- **Svelte 5.x** — `$props`, `$derived`, snippets. Module-script exports (`pickProfile`, `buildScanlineGradient`, `buildAberrationShadow`, `rollSchedule`, `isReducedMotion`) for unit testing.
- Zero external dependencies — pure CSS gradients and one keyframe. No fonts loaded, no images, no SVG, no canvas.

## File Structure

```
src/lib/components/CRTScreen.svelte         # implementation + module-level helpers
src/lib/components/CRTScreen.md             # this file (rendered inside ComponentPageShell)
src/lib/components/CRTScreen.test.ts        # vitest unit tests
src/routes/crtscreen/+page.svelte           # demo page
```
