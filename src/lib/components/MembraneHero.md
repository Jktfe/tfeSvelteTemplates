# MembraneHero — Technical Logic Explainer

## What Does It Do? (Plain English)

MembraneHero is a full-bleed editorial hero section: an enormous coloured-gradient surface that ripples like a fluid film, with a single tiny "focal dot" wandering across it, and an editorial layout (eyebrow tag, big headline, subhead, two CTA buttons) sitting on top. The headline deals in glyph-by-glyph on mount, the way a typesetter might fan a deck of cards.

Think of it as a still photograph of a soap-bubble's surface — except the surface is breathing. The membrane is a static CSS gradient, but an SVG turbulence filter is constantly sloshing it around, and a roaming dot gives the eye somewhere to track without ever quite settling.

## How It Works (Pseudo-Code)

```
state (MembraneHero):
  palette       = 'aurora' | 'sunset' | 'polar'
  headline text = "A new kind of canvas"
  headlineWords = splitWords(headline)
                = [{kind:'word', chars:[...]},
                   {kind:'space', chars:[' ']}, ...]

derive at render:
  for each headlineWord, for each char in word:
    glyphIndex = running total across all words
    render <span class="mh-glyph"
                 style="--mh-glyph-delay: glyphIndex * 0.024s">
    CSS @keyframes mh-glyph-in: opacity 0→1, translateY 0.4em→0
    => glyphs deal in left-to-right at 24ms apart

state (MembraneSurface):
  reduced  = isReducedMotion()    // probed onMount
  dotX, dotY = 0                   // current Lissajous position
  raf       = null
  mountedAt = performance.now()

  rAF loop tick(now):
    if reduced: stop loop
    t = (now - mountedAt) / 1000
    {x, y} = lissajous(t * 0.18, 3, 2, 0.32, 0.22, π/4)
    dotX, dotY = x, y                  // both in [-1, 1]
    raf = requestAnimationFrame(tick)

  matchMedia listener:
    on prefers-reduced-motion change → reduced = e.matches

render:
  inline SVG <filter id="mh-displace">
    <feTurbulence baseFrequency="0.014" octaves="2" seed="7">
      if !reduced:
        <animate attributeName="baseFrequency"
                 values="0.012; 0.024; 0.012"
                 dur="14s" indefinite />
    </feTurbulence>
    <feDisplacementMap in="SourceGraphic" scale="38" />

  div .mh-mesh with conic+radial gradient
                  style="filter: url(#mh-displace)"

  div .mh-dot positioned at
    translate3d(50vw + dotX*38vw, 50vh + dotY*30vh, 0)
```

The membrane's "breathing" is **SMIL-driven** — the `<animate>` element inside the SVG filter is what cycles `baseFrequency`. The dot's drift is the **only** JS frame loop in the component, and it stops the moment `prefers-reduced-motion` flips on.

## The Core Concept: SVG Displacement + Lissajous Drift

Two distinct techniques layer to produce the visual.

### 1. feTurbulence + feDisplacementMap = warped membrane

The SVG filter is the visual workhorse:

```svg
<filter id="mh-displace">
  <feTurbulence type="fractalNoise" baseFrequency="0.014"
                numOctaves="2" seed="7">
    <animate attributeName="baseFrequency"
             values="0.012; 0.024; 0.012"
             dur="14s" repeatCount="indefinite" />
  </feTurbulence>
  <feDisplacementMap in="SourceGraphic" scale="38" />
</filter>
```

`feTurbulence` generates a Perlin-noise field — a smooth, organic, randomly-shaped image where nearby pixels have similar values. Crucially, `seed="7"` makes that noise field **deterministic**, so server and client render identical first frames.

`feDisplacementMap` then takes the source graphic (our gradient mesh) and uses the noise field as instructions: red channel of noise pushes pixels left/right, green channel pushes up/down, scaled by `38`. Pixels in calm parts of the noise barely move; pixels in noisy parts get sloshed by up to ~38 px.

The clever bit is the `<animate>` on `baseFrequency`. The base frequency controls the *scale* of the noise — low values make giant blobs of warp, high values make fine-grained crinkle. Cycling 0.012 → 0.024 → 0.012 over 14 s makes the membrane breathe: it expands into broad, lazy ripples then contracts into tight ones.

### 2. Lissajous curve = wandering focal dot

The focal dot needs a path that:
- never repeats too quickly (so the eye doesn't predict where it goes next)
- stays inside the visible region (so it doesn't disappear)
- looks organic, not robotic

A **Lissajous curve** — two perpendicular sine waves at different frequencies — does all three:

```ts
lissajous(t, a, b, A, B, phase) = {
  x: A * sin(a * t + phase),
  y: B * sin(b * t)
}
// MembraneHero calls with t * 0.18, a=3, b=2, A=0.32, B=0.22, phase=π/4
```

When `a/b` is a rational ratio (like 3/2), the curve eventually closes into a knotted figure. Choose `a/b = 3/2` and you get a clean trefoil pattern — the dot traces an ever-so-slightly different path each cycle because of the `phase` offset, but always within `[-A, A]` × `[-B, B]`.

The output is in `[-1, 1]` units; the component scales to viewport: `translate3d(50vw + dotX*38vw, 50vh + dotY*30vh, 0)`. So the dot wanders within ±38 % of half the viewport width and ±30 % of half the viewport height — comfortably inside the visible area.

### 3. Per-glyph deal-in for the headline

The headline is split into words and individual glyphs. Each glyph gets `--mh-glyph-delay: {globalIndex * 0.024}s`, and a single CSS keyframe handles the rest:

```css
.mh-glyph {
  opacity: 0;
  transform: translateY(0.4em);
  animation: mh-glyph-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--mh-glyph-delay);
}
@keyframes mh-glyph-in {
  to { opacity: 1; transform: translateY(0); }
}
```

`splitWords` keeps each word's glyphs inside an `inline-block` `<span class="mh-word">` with `white-space: nowrap`, so line-breaks can only happen at the explicit `<span class="mh-space">` between words — never mid-letter.

## CSS Animation Strategy

Three independent animation systems, none of which fight each other:

- **SMIL `<animate>`** drives the membrane's `baseFrequency`. SMIL runs in the SVG renderer, completely outside the CSS animation pipeline — no `requestAnimationFrame`, no main-thread cost beyond the filter recomputation.
- **CSS `@keyframes`** drive the eyebrow fade-down, subhead fade-up, CTA fade-up, dot pulse, and per-glyph `mh-glyph-in`. All of them are `forwards`-fill so the layout settles in its final state and never re-runs.
- **JS rAF loop** drives only `dotX, dotY` for the Lissajous translate3d. This is the only thing the main thread does per frame, and it's a single sin/cos calculation.

`prefers-reduced-motion` is honoured three different ways:
1. `<animate>` element is *omitted entirely* when `reduced === true` — the SMIL animation never starts.
2. The rAF tick exits at the top — `if (reduced) { raf = null; return; }`.
3. CSS `@media (prefers-reduced-motion: reduce)` resets the deal-in glyphs and pulses to their final states.

## Performance

- **One rAF loop per instance**, doing one `lissajous()` call (six sin/cos ops) and writing two state variables. ~0.05 ms/frame.
- **One SVG filter chain per instance**. The filter is computed by the browser's SVG renderer in C++, not from JavaScript. On modern GPUs a 2-octave fractal-noise displacement on a single full-bleed surface is a few ms per frame; on lower-end GPUs reduce to one octave by editing the component.
- **Glyph deal-in is one-shot** — `forwards` fill plus zero `iteration-count` overrides means each `<span>` stops animating after 0.6 s.
- **Membrane is drawn once per turbulence frame**, not per CSS frame — SMIL is the rate limiter, not the screen refresh. At 60 Hz with a 14 s SMIL cycle the filter recomputes a few hundred times per cycle, which is well within budget.
- **Backdrop-filter on the eyebrow pill** (`backdrop-filter: blur(8px)`) is the most expensive single CSS rule. If you support older Safari, consider gating it behind `@supports`.

## State Flow Diagram

```
  [SSR / initial render]
         │ static SVG filter, frozen baseFrequency=0.014
         │ glyph spans rendered with opacity 0
         ▼
  [client mount]
         │ MembraneHero: per-glyph deal-in fires once (CSS, forwards)
         │ MembraneSurface: onMount() probes reduced-motion
         ▼
        ┌──────────────────────────────────────────────┐
        │  reduced === false                            │
        │   • SMIL <animate> cycles baseFrequency 14s   │
        │   • rAF loop ticks dotX/dotY each frame       │
        │   • mh-dot-pulse keyframe runs forever        │
        └────────────┬─────────────────────────────────┘
                     │ matchMedia change → reduced flips
                     ▼
        ┌──────────────────────────────────────────────┐
        │  reduced === true                             │
        │   • <animate> already absent (no-op)          │
        │   • rAF tick exits, raf = null                │
        │   • dot frozen at last position               │
        │   • CSS @media disables pulse                 │
        └──────────────────────────────────────────────┘

  [unmount]
         │ cancelAnimationFrame(raf)
         │ matchMedia listener removed
         ▼
  [destroyed]
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `palette` | `'aurora' \| 'sunset' \| 'polar'` | `'aurora'` | Three-stop palette preset (membrane gradient + dot accent). |
| `eyebrow` | `string` | `'Now in beta'` | Pill badge above the headline. Also used as `aria-label` on the section. |
| `headline` | `string` | `'A new kind of canvas'` | Display H1 — split into glyphs for staggered deal-in. |
| `subhead` | `string` | `'Hand-crafted primitives, zero runtime cost.'` | Single-line lead under the headline. |
| `primaryCta` | `string` | `'Start building'` | Primary button label. |
| `secondaryCta` | `string` | `'See the docs'` | Secondary button label. |
| `primaryHref` | `string` | `'#'` | `href` on the primary `<a>`. |
| `secondaryHref` | `string` | `'#'` | `href` on the secondary `<a>`. |
| `showDot` | `boolean` | `true` | Render the Lissajous focal dot. |
| `class` | `string` | `''` | Extra classes on the root `<section>`. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Headline > ~60 characters | Per-glyph deal-in remains correct but visually janky on long strings; consider trimming or shortening. |
| Headline contains emoji or surrogate pairs | `Array.from(text)` (used in `splitWords`) iterates by code point, so emoji stay intact in their own `<span>`. |
| `prefers-reduced-motion: reduce` set on mount | SMIL `<animate>` never inserted; rAF loop never starts; deal-in CSS resets to final state via `@media`. The hero looks like a static still. |
| `prefers-reduced-motion` flips at runtime | matchMedia change handler updates `reduced`; rAF loop exits on its next tick; static frame remains. |
| Multiple `MembraneHero` instances on one page | Each gets a unique `filterId` via the `uid` prop on `MembraneSurface` — no SVG filter ID collisions. |
| Component unmounted mid-rAF | `onMount` return cleans up: `cancelAnimationFrame(raf)` + `mq.removeEventListener`. |
| Browser without SVG filters (IE11) | Membrane renders as a flat conic+radial gradient, undisplaced. Deal-in still works (CSS only). |
| Hi-DPI display | SVG filter is resolution-independent; the membrane crisps up automatically. The dot is `width: 18px` so it stays visually consistent. |
| Component scrolled offscreen | rAF loop continues to tick (browser still calls rAF). Cost is small (~0.05 ms/frame); if you embed many MembraneHeroes on one page, gate them behind an `IntersectionObserver` in your wrapper. |
| Section narrower than ~600 px | `clamp(2.6rem, 8vw, 5.8rem)` on the headline scales it down; the layout reflows because all CTAs use `flex-wrap: wrap`. |
| `headline` empty | `splitWords` returns `[]`; the H1 renders empty (only the screen-reader span). Deal-in is a no-op. |

## Dependencies

- **Svelte 5.x** — `$props`, `$state`, `$derived`, snippets (`{#snippet glyphSpan}`). The component leans on snippets to keep the per-glyph render readable.
- **Subcomponents** — `MembraneSurface.svelte` (the warped layer + dot) and `types.ts` (palette resolver, Lissajous helper). Both are private to the `MembraneHero/` directory.
- Zero external runtime dependencies — no GSAP, no images, no font CDN, no animation library. Inline SVG + CSS keyframes + a single rAF loop.

## File Structure

```
src/lib/components/MembraneHero/MembraneHero.svelte     # editorial layout + headline deal-in
src/lib/components/MembraneHero/MembraneSurface.svelte  # SVG filter + Lissajous focal dot
src/lib/components/MembraneHero/types.ts                # MembranePalette, lissajous, helpers
src/lib/components/MembraneHero.md                      # this file (rendered inside ComponentPageShell)
src/lib/components/MembraneHero.test.ts                 # vitest unit tests
src/routes/membrane-hero/+page.svelte                   # demo page
```
