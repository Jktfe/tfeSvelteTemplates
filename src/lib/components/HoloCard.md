---
name: HoloCard
category: Helpful UX
author: antclaude
status: shipped
---

# HoloCard

Holographic-foil shimmer wrapper. Cursor-driven CSS conic-gradient ring rotates with the cursor's angle from center, while a diagonal sheen overlay tracks pointer position. The classic Pokemon-card-foil look — premium, joyful, instantly recognisable. Pure CSS gradients + minimal JS for cursor angle math.

Composes naturally with `Tilt3D` (HoloCard handles colour-shift, Tilt3D handles 3D rotation) for the full physical-collectible-card feel. Pairs well with `MagicCard` (different aesthetic — single-color torch spotlight rather than rainbow foil), `ShineBorder` (border-only, complements the surface foil), and any premium-tile / achievement / rare-item context.

## Key features

- **Three intensities** — `subtle` / `iridescent` / `cosmic`. Each preset balances foil opacity, sheen alpha and palette breadth so a single intensity prop does the right thing.
- **Four palettes** — `rainbow` (full-spectrum), `pastel` (muted iridescent), `cosmic` (deep purple), `gold` (treasure). Each closes the gradient ring (first colour == last colour) so the conic gradient seam-rotates cleanly.
- **Cursor-angle-driven** — foil rotates as you move the cursor across the wrapped element. Sheen brightens at certain angles to simulate a metallic highlight.
- **Pure helpers exported** from the module-script (`pickIntensity`, `pickPalette`, `cursorAngle`, `hueAtAngle`, `sheenAtAngle`, `clamp01`, `isReducedMotion`) — all directly unit-testable without rendering.
- **prefers-reduced-motion safe** — `isReducedMotion()` is read on mount and pointer handlers no-op when `true`. The stylesheet also locks foil opacity and sheen to a low static appearance via `@media (prefers-reduced-motion: reduce)` as belt + braces.
- **SR-friendly** — slotted content is rendered as the primary content; foil and sheen overlays are absolutely-positioned, pointer-events-none, `aria-hidden`. Focus and keyboard interaction with the slotted content are unaffected.

## Usage

```svelte
<script>
	import HoloCard from '$lib/components/HoloCard.svelte';
</script>

<HoloCard intensity="iridescent" palette="rainbow">
	<img src="/rare-card.png" alt="Pikachu, holographic rare" />
</HoloCard>

<HoloCard intensity="cosmic" palette="gold">
	<span class="badge">VIP</span>
</HoloCard>
```

## Composition with Tilt3D

```svelte
<script>
	import HoloCard from '$lib/components/HoloCard.svelte';
	import Tilt3D from '$lib/components/Tilt3D.svelte';
</script>

<Tilt3D maxTilt={18}>
	<HoloCard intensity="cosmic" palette="rainbow">
		<article class="card">…</article>
	</HoloCard>
</Tilt3D>
```

The two effects layer cleanly: Tilt3D handles X/Y rotation toward the cursor, HoloCard handles colour-shift around the cursor's angle. Together they give the full physical-collectible-card behaviour.

## Props

| Prop        | Type                                          | Default        | Notes                                                                |
| ----------- | --------------------------------------------- | -------------- | -------------------------------------------------------------------- |
| `intensity` | `'subtle' \| 'iridescent' \| 'cosmic'`        | `'iridescent'` | Tunes foil opacity, sheen alpha, palette stop count.                 |
| `palette`   | `'rainbow' \| 'pastel' \| 'cosmic' \| 'gold'` | `'rainbow'`    | Colour set used in the conic gradient.                               |
| `children`  | `Snippet`                                     | _(required)_   | Content to wrap. Stays in the DOM and a11y tree.                     |

Unknown intensity / palette values fall back to `iridescent` / `rainbow`.

## Intensity table

| Intensity    | saturation (foil opacity) | sheenAlpha | paletteSize (cycles per rotation) |
| ------------ | ------------------------- | ---------- | --------------------------------- |
| `subtle`     | 0.18                      | 0.25       | 3                                 |
| `iridescent` | 0.32                      | 0.45       | 5                                 |
| `cosmic`     | 0.5                       | 0.6        | 7                                 |

`paletteSize` controls how many times the conic gradient cycles per cursor sweep. Higher values give a denser, more chromatic shimmer; lower values give a calmer single-rainbow look.

## Palette table

| Palette    | First colour | Last colour | Vibe                                       |
| ---------- | ------------ | ----------- | ------------------------------------------ |
| `rainbow`  | `#ff006e`    | `#ff006e`   | Hot pink → orange → yellow → green → blue → violet → hot pink. |
| `pastel`   | `#ffd6e0`    | `#ffd6e0`   | Soft muted iridescent — pinks, peaches, mints, lavender.       |
| `cosmic`   | `#0a0a23`    | `#0a0a23`   | Deep midnight → violet → lavender → midnight.                  |
| `gold`     | `#7a4f01`    | `#7a4f01`   | Antique → bright gold → white highlight → bright gold → antique. |

Every palette is constructed so the first and last entries match — this closes the conic-gradient ring cleanly so the rotation seam is invisible.

## Distinct from

- **`MagicCard`** — single-color radial spotlight ("torch on a dark wall") that follows the cursor. HoloCard uses a multi-hue conic gradient that rotates with cursor angle. Different math, different aesthetic.
- **`Tilt3D`** — X/Y rotation toward the cursor (3D parallax). HoloCard has no rotation, only colour-shift. They compose.
- **`ShineBorder`** — animated border ring around an element. HoloCard fills the entire surface with foil, not the border.
- **`ShinyText`** — one-shot diagonal shimmer pass over text. HoloCard is steady-state cursor-reactive foil over any element.
- **`Spinner.pulse`** — concentric expanding rings (loading state). HoloCard has no rings, no loading state.
- **`MagneticButton`** — translates the wrapped element toward the cursor. HoloCard stays put; only the colour shifts.
- **`CRTScreen`** — frame wrapper with scanlines. HoloCard is interior surface foil; you can compose CRTScreen wrapping a HoloCard wrapping content.
- **`GlitchText`** — RGB-channel-split distortion of text. HoloCard is steady iridescent shimmer of any element. Different category.

## Pure helpers (module-script exports)

- `pickIntensity(name)` — returns `{ saturation, sheenAlpha, paletteSize }`. Falls back to `iridescent`.
- `pickPalette(name)` — returns the colour array for the named palette. Falls back to `rainbow`.
- `clamp01(n)` — clamps to `[0, 1]`; treats `NaN` and `±Infinity` as `0`.
- `cursorAngle(cursorX, cursorY, rect)` — returns the cursor's angle from the centre of `rect`, in degrees in `[0, 360)`. East = 0°, south = 90°, west = 180°, north = 270°.
- `hueAtAngle(angle, paletteSize)` — returns a hue in `[0, 360)` driven by the cursor angle. `paletteSize` controls how fast the hue cycles per cursor sweep (clamped to `[1, 8]`).
- `sheenAtAngle(angle, intensity)` — returns the diagonal sheen blend factor in `[0, sheenAlpha]`. Sin-wave around the cursor sweep gives smooth highlight cycling.
- `isReducedMotion()` — `boolean`. Returns `false` outside the browser.

## Accessibility

- The slotted content is rendered as the primary content of the wrapper and is read by screen readers normally.
- Foil and sheen overlays are absolutely-positioned, `pointer-events: none`, and `aria-hidden`. They are invisible to assistive tech.
- Pointer event handlers (`pointermove` / `pointerleave`) are no-ops when `prefers-reduced-motion: reduce` is set.
- The stylesheet has a CSS-layer fallback that locks foil opacity and sheen to a static low-key appearance under `prefers-reduced-motion: reduce`, so even if the JS probe misfires, the visual respects the user's preference.
- The wrapper is role-neutral (no `role` attribute set) — it inherits whatever role makes sense from the slotted content.
- The wrapper has `svelte-ignore a11y_no_static_element_interactions` because the pointer handlers are decorative-only; the slotted content's keyboard and screen-reader path is unaffected.

## Performance

- One `getBoundingClientRect()` + cheap math per `pointermove` event. No rAF loop, no timers.
- Foil and sheen are pure CSS gradients written via inline styles and CSS custom properties. No layout thrash.
- All work stops between `pointerleave` and the next `pointermove`. Steady-state cost is zero.
- Conic-gradient and linear-gradient compositing is GPU-accelerated in modern browsers; `mix-blend-mode: color-dodge` / `overlay` keeps the foil keyed to the underlying content's brightness.

## Recipes

- **Rare collectible card**: `<Tilt3D max={18}><HoloCard intensity="cosmic" palette="rainbow">…</HoloCard></Tilt3D>`. Full Pokemon-card feel.
- **Premium badge**: `<HoloCard intensity="cosmic" palette="gold"><span class="badge">VIP</span></HoloCard>`.
- **Achievement-unlocked tile**: `<HoloCard intensity="subtle" palette="gold"><div class="achievement">…</div></HoloCard>`.
- **Product thumb hover (calm)**: `<HoloCard intensity="subtle" palette="pastel"><figure>…</figure></HoloCard>`.
- **Hero element with foil**: `<HoloCard intensity="iridescent" palette="rainbow"><h1>Premium</h1></HoloCard>`.
