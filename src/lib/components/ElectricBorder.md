# ElectricBorder — Technical Logic Explainer

## What Does It Do? (Plain English)

ElectricBorder wraps any element with a crackling, jagged border that pulses like a Tesla coil. The slot underneath stays normal HTML — fully clickable, fully readable — and the border on top is a single SVG rectangle whose stroke is being violently displaced by an animated turbulence filter. Three intensities (`mild` / `crackling` / `lightning`) and three palettes (`electric-blue` / `plasma-purple` / `volt-yellow`) are pre-tuned, so a single component call gets you the right look.

Think of it as putting a steel frame around your content and running 50,000 V through it. The frame stays where it is; the *light* it emits is what's flickering.

## How It Works (Pseudo-Code)

```
state:
  intensity = 'mild' | 'crackling' | 'lightning'
  palette   = 'electric-blue' | 'plasma-purple' | 'volt-yellow'
  radius    = 12 (px, wrapper border-radius)
  filterId  = 'ec-static'    // SSR placeholder
  reduced   = false

derive:
  cfg              = pickIntensity(intensity)
                   = { frequency, distortion, animSpeed, strokeWidth, glowBlur }
  colors           = pickPalette(palette)
                   = { stroke, glow, highlight }
  frequencyValues  = frequencyValuesString(cfg.frequency)
                   = `${base};${min(base*2.2, 1)};${base}`
                   // 3 stops: low → high → low, seamless loop

onMount:
  filterId = nextFilterId('ec')          // 'ec-1', 'ec-2', ... unique
  reduced  = isReducedMotion()

render:
  div.electric-wrapper with --ec-* custom properties
    div.electric-content { @render children() }
    svg.electric-border-svg viewBox="0 0 100 100" preserveAspectRatio="none"
                            aria-hidden
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise"
                        baseFrequency={cfg.frequency}
                        numOctaves="2" seed="0">
            if !reduced:
              <animate attributeName="baseFrequency"
                       dur="{cfg.animSpeed}s"
                       values={frequencyValues}
                       repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic"
                             scale={reduced ? 0 : cfg.distortion} />
        </filter>
      </defs>
      <rect x=0 y=0 width=100 height=100 rx=3
            fill="none"
            stroke="var(--ec-stroke)"
            stroke-width="2"
            vector-effect="non-scaling-stroke"
            filter="url(#filterId)" />

CSS:
  .electric-border-svg {
    filter: drop-shadow(0 0 var(--ec-glow-blur) var(--ec-glow));
  }
```

The component does **zero per-frame JavaScript**. The SMIL `<animate>` element drives the turbulence frequency up and down on the SVG renderer's clock; the displacement map distorts the stroked rectangle in real-time; the GPU composites the drop-shadow halo. The only JS is mount-time: a unique filter ID and a reduced-motion probe.

## The Core Concept: Animated Turbulence + Displacement Map

The visual is one SVG `<rect>` whose stroke is being shoved around by a Perlin-noise field. As the noise field changes shape over time, the stroke wiggles into different jagged paths.

### feTurbulence — the noise field

```svg
<feTurbulence type="fractalNoise" baseFrequency="0.030" numOctaves="2" seed="0" />
```

`feTurbulence` generates a Perlin-noise image — a smooth, organic, randomly-shaped greyscale field. `baseFrequency=0.030` is `crackling`'s default; lower values (0.015 = `mild`) produce broader noise blobs and gentler arcs; higher values (0.060 = `lightning`) produce fine-grained chaos and dense spikes.

`seed=0` makes the noise deterministic, so server-side render and client-side first paint agree.

### feDisplacementMap — push pixels by the noise

```svg
<feDisplacementMap in="SourceGraphic" scale="6" />
```

`feDisplacementMap` takes a source graphic (here, the stroked rectangle) and uses an input image (the noise field) as instructions to displace each pixel. Red channel of the noise pushes pixels horizontally; green channel pushes vertically; both are scaled by `scale`.

`scale=3` (mild) gives gentle wobble. `scale=6` (crackling) gives Tesla-coil arcs. `scale=12` (lightning) gives full lightning-strike chaos. The trade-off is realism — high distortion can pull the stroke entirely outside its bounds, which is why the filter is sized `x="-20%" y="-20%" width="140%" height="140%"` to give the displaced stroke 20 % of bleed room on each side.

### `<animate>` — pump the frequency

The crackling motion comes from animating `baseFrequency`:

```svg
<animate attributeName="baseFrequency"
         dur="3s"
         values="0.0300;0.0660;0.0300"
         repeatCount="indefinite" />
```

`frequencyValuesString(base)` constructs the values: low → peak → low, where peak is `min(base * 2.2, 1)`. The first and last values match so the loop is seamless. SMIL interpolates between the three stops over 3 s (animSpeed for `crackling`), and the `feTurbulence` recomputes the noise field continuously.

The visual reading: at the low frequency, the stroke wobbles broadly and slowly; at the peak frequency, it crackles into fine jagged arcs; the cycle repeats. Two octaves of noise gives enough variation that the loop never reads as obviously periodic.

### Stroke trickery: `vector-effect="non-scaling-stroke"`

```svg
<rect x="0" y="0" width="100" height="100" rx="3"
      fill="none" stroke="var(--ec-stroke)"
      stroke-width="2"
      vector-effect="non-scaling-stroke" />
```

The viewBox is `0 0 100 100` and `preserveAspectRatio="none"` lets the rect stretch to fill any wrapper aspect ratio. Without `vector-effect="non-scaling-stroke"`, a wrapper twice as wide as it is tall would render the horizontal stroke segments at twice the thickness of the vertical ones — visibly broken. With the non-scaling stroke, the 2 px stroke renders at exactly 2 screen pixels regardless of wrapper geometry.

### Drop-shadow halo

```css
.electric-border-svg {
  filter: drop-shadow(0 0 var(--ec-glow-blur, 8px) var(--ec-glow, #0080ff));
}
```

A single CSS `drop-shadow` filter on the SVG layer, with the blur size and colour driven by intensity / palette. Because the SVG itself is what's being displaced, the drop-shadow follows the displaced stroke — the halo crackles in sync with the arc, not as a static rim around the wrapper.

## CSS Animation Strategy

The animation is **SMIL-driven**, not CSS-driven. SMIL (`<animate>`) runs in the SVG renderer, completely outside the CSS animation pipeline. It's hardware-accelerated when the SVG layer is GPU-promoted, and the browser doesn't pay a `requestAnimationFrame` cost in the main thread.

CSS provides:
- The `drop-shadow` halo (static, GPU-composited).
- The `prefers-reduced-motion` belt-and-braces fallback:

```css
@media (prefers-reduced-motion: reduce) {
  .electric-border-svg {
    filter: drop-shadow(0 0 4px var(--ec-glow));
  }
}
```

Reduced motion is honoured three ways:
1. The `<animate>` element is **omitted entirely** when `reduced === true` — no SMIL animation runs.
2. `feDisplacementMap`'s `scale` is set to `0`, so the stroke renders unwarped — a clean rectangle.
3. The CSS halo blur shrinks from `glowBlur` (up to 14 px) to a static 4 px so the visual identity stays present without pulsing.

## Performance

- **Zero JS per frame.** The SMIL animation runs in C++ inside the SVG renderer.
- **One `<filter>` chain per instance.** `feTurbulence` is the only mildly-expensive primitive; `crackling` (frequency 0.03, 2 octaves) measures fine on commodity hardware.
- **Filter is scoped to the SVG layer only**, so the wrapped content is never re-rasterised when the noise updates.
- **`drop-shadow` is GPU-composited** when the SVG layer is positioned absolutely (which `position: absolute; inset: 0` triggers).
- **Per-instance filter IDs** via `nextFilterId('ec')` prevent SVG `<defs>` namespace collisions when multiple ElectricBorders co-exist.
- **No observers, no rAF, no timers.** Steady-state cost is whatever the SVG renderer charges per frame for the filter chain and drop-shadow.
- **Stack many ElectricBorders?** Each adds one filter chain plus one drop-shadow. A page of 10 instances at `crackling` intensity is comfortable; 50 at `lightning` would saturate. The chunkiest setting is `lightning + plasma-purple` because `glowBlur=14` is the largest blur the component ships with.

## State Flow Diagram

```
              ┌──────────────────────────────┐
              │  SSR / first paint            │
              │  filterId = 'ec-static'       │
              │  reduced = false              │
              │  <animate> rendered           │
              │  scale = cfg.distortion       │
              └────────────┬─────────────────┘
                           │ onMount
                           ▼
              ┌──────────────────────────────┐
              │  filterId = nextFilterId()   │
              │  reduced = probed             │
              └────────────┬─────────────────┘
                           │
              ┌────────────┴─────────────────┐
              │                              │
              │ !reduced                     │ reduced
              ▼                              ▼
       ┌──────────────┐               ┌──────────────┐
       │  crackling   │               │  static      │
       │  SMIL drives │               │  no <animate>│
       │  baseFreq    │               │  scale=0     │
       │  forever     │               │  smaller halo│
       └──────────────┘               └──────────────┘

  prefers-reduced-motion change at runtime
    (no listener wired in current build —
     reduced is captured at mount only)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intensity` | `'mild' \| 'crackling' \| 'lightning'` | `'crackling'` | Tunes turbulence frequency, displacement scale, animation speed, stroke width, and glow blur. Unknown names fall back to `crackling`. |
| `palette` | `'electric-blue' \| 'plasma-purple' \| 'volt-yellow'` | `'electric-blue'` | Stroke and glow colours. Unknown names fall back to `electric-blue`. |
| `radius` | `number` | `12` | Wrapper `border-radius` in pixels. The SVG rect itself uses a constant `rx=3` in viewBox units; this prop only affects the wrapper's outline. |
| `children` | `Snippet` | optional | Content to wrap. Stays in the DOM and a11y tree. |

The intensity preset table:

| Intensity   | frequency | distortion | animSpeed | strokeWidth | glowBlur |
|-------------|-----------|------------|-----------|-------------|----------|
| `mild`      | 0.015     | 3          | 5 s       | 2 px        | 4 px     |
| `crackling` | 0.030     | 6          | 3 s       | 2 px        | 8 px     |
| `lightning` | 0.060     | 12         | 1.5 s     | 3 px        | 14 px    |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Unknown `intensity` or `palette` | Falls back to `crackling` / `electric-blue` via `pickIntensity` / `pickPalette`. |
| `prefers-reduced-motion: reduce` set on mount | `<animate>` element omitted; `feDisplacementMap` `scale=0`; CSS `@media` shrinks glow halo. Border renders as a clean rectangle. |
| `prefers-reduced-motion` flips at runtime | The current build captures `reduced` at mount via `onMount`; runtime flips don't update it. CSS `@media` rule still updates the halo. For full runtime sync, fork the component to add a `matchMedia` change listener. |
| Multiple instances on one page | Each gets a unique filter ID via `nextFilterId('ec')`. No SVG `<defs>` collisions. |
| Component scrolled offscreen | SMIL animation continues. Browser may throttle hidden tabs but doesn't pause SMIL inside an in-DOM SVG. If you embed many ElectricBorders, gate them behind an `IntersectionObserver` in your wrapper. |
| Wrapper resized | SVG uses `viewBox="0 0 100 100" preserveAspectRatio="none"` plus `vector-effect="non-scaling-stroke"` — adapts to any aspect ratio without distorted stroke thickness. |
| Hi-DPI / retina | `feTurbulence` is resolution-independent. `vector-effect="non-scaling-stroke"` keeps stroke thickness in screen pixels. Crackling renders crisply at all scales. |
| GPU acceleration unavailable | `feTurbulence + feDisplacementMap` falls back to CPU; cost rises but the visual still works. Drop `intensity` to `mild` for cheaper noise. |
| Browser without SVG filters (IE11) | Filter is ignored; rect renders as a plain stroked rectangle. The component still gives a coloured border, just not crackling. |
| `radius` very large (e.g. `999`) | Wrapper rounds into a pill or circle. The SVG rect's internal `rx=3` is in viewBox units (3 % of width) so the *stroked* shape stays a rounded rectangle inside the elliptical wrapper — visible mismatch. For pill shapes, fork the component and set `rx` proportional to viewBox. |
| Children use `position: fixed` | Fixed positioning escapes the wrapper; the border stays put, the child floats. Usually not what you want. |
| Children with their own SVG filters | No conflict — each filter has a unique ID. The drop-shadow halo composites independently from the child's filters. |
| Component used inside another `isolation: isolate` stacking context | Halo composites correctly; `mix-blend-mode` is not used so there's no risk of leakage. |

## Dependencies

- **Svelte 5.x** — `$props`, `$state`, `$derived`, snippets. Module-script exports (`pickIntensity`, `pickPalette`, `clamp01`, `clampPositive`, `nextFilterId`, `frequencyValuesString`, `isReducedMotion`) for unit testing.
- Zero external dependencies — inline SVG filter (SMIL), CSS drop-shadow. No canvas, no WebGL, no animation library, no images.

## File Structure

```
src/lib/components/ElectricBorder.svelte         # implementation + module-level helpers
src/lib/components/ElectricBorder.md             # this file (rendered inside ComponentPageShell)
src/lib/components/ElectricBorder.test.ts        # vitest unit tests
src/routes/electricborder/+page.svelte           # demo page
```
