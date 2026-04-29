---
name: MeshGradient
slug: meshgradient
category: Decorative
status: shipped
since: 2026-04-29
---

# MeshGradient

An ambient animated mesh-gradient backdrop. A small set of large,
blurry radial-gradient blobs drift slowly across the surface; the
GPU composites them through a single `filter: blur` layer so the
result reads as a soft, smoky mesh — Stripe / Linear / Vercel
marketing energy, with no canvas, no rAF loop, and no per-frame JS.

Useful as a hero backdrop behind a headline, the wash on a marketing
landing splash, atmosphere behind an empty-state panel that wants
quiet life, or a dark-mode glow accent. Pure decoration that doesn't
fight for attention.

## Key Features

- **6 named palettes** — `sunset`, `aurora`, `ember`, `cosmic`,
  `mint`, `monochrome`. Each carries 5 colours chosen to blend
  cleanly under heavy blur (saturated mid-lights, no muddy grays).
- **Configurable blob count** — 1–12 blobs. Lower counts give a
  cleaner, more singular wash; higher counts give a busier, more
  textured mesh.
- **Independent drift per blob** — golden-angle spiral places each
  blob; staggered durations and negative animation-delays mean they
  never sync up, so the loop reads as continuous flow rather than a
  metronome.
- **Cascaded CSS custom properties** — every position, colour, blur,
  opacity, and timing value is set inline on the DOM. The GPU only
  ever touches its compositor layer; layout never thrashes.
- **prefers-reduced-motion** — every blob freezes at its first-frame
  position. The composition still reads as a static mesh gradient —
  no jarring blank.

## Usage

### Default sunset wash

```svelte
<script>
  import MeshGradient from '$lib/components/MeshGradient.svelte';
</script>

<div style="position: relative; height: 400px;">
  <MeshGradient />
  <h1 style="position: relative; z-index: 1;">Hello, world</h1>
</div>
```

### Aurora at higher density

```svelte
<MeshGradient palette="aurora" blobCount={8} blur={100} />
```

### Cosmic dark-mode glow at half speed

```svelte
<MeshGradient
  palette="cosmic"
  blobCount={5}
  blur={120}
  opacity={0.85}
  speed={0.5}
/>
```

### Frozen mesh (no drift)

```svelte
<MeshGradient palette="ember" speed={0} />
```

## Props

| Prop        | Type     | Default     | Description                                              |
| ----------- | -------- | ----------- | -------------------------------------------------------- |
| `palette`   | `string` | `'sunset'`  | Named palette: `sunset`, `aurora`, `ember`, `cosmic`, `mint`, `monochrome` |
| `blobCount` | `number` | `5`         | Number of blobs to render (clamped 1–12, floored)        |
| `blur`      | `number` | `80`        | Blur radius in px (clamped ≥0)                           |
| `opacity`   | `number` | `0.7`       | Container opacity (clamped 0–1)                          |
| `speed`     | `number` | `1`         | Speed multiplier — `0` freezes, `2` runs double-time     |
| `class`     | `string` | `''`        | Extra classes on the host                                |

## Pure helpers (module-script exports)

| Function                                       | Returns          | Purpose                                                |
| ---------------------------------------------- | ---------------- | ------------------------------------------------------ |
| `pickPalette(name)`                            | `Palette`        | Validates / defaults a palette name                    |
| `getPaletteColors(name)`                       | `readonly string[]` | Hex array for the named palette                     |
| `clamp01(n)`                                   | `number`         | Clamp to `[0, 1]`, NaN-safe                            |
| `clampPositive(n, fallback?)`                  | `number`         | Clamp to `[0, ∞)`, NaN-safe                            |
| `clampInt(n, min, max)`                        | `number`         | Floored int clamp, NaN-safe                            |
| `blobPosition(i, count)`                       | `{xPercent, yPercent}` | Golden-angle spiral position for one blob        |
| `blobAnimation(i, count, baseDurationMs?)`     | `{delayMs, durationMs}` | Per-blob animation timing                       |
| `blobColor(i, paletteName)`                    | `string`         | Hex colour for blob `i` in named palette               |
| `blobSize(count)`                              | `number`         | Diameter percent — bigger blobs when fewer blobs       |
| `buildBlobLayout(count, paletteName)`          | `BlobLayout[]`   | Full layout array: position, colour, timing, size      |
| `isReducedMotion()`                            | `boolean`        | SSR-safe matchMedia probe                              |

## How it works

The host renders one absolutely-positioned div per blob. Each blob
carries six inline CSS custom properties — `--blob-x`, `--blob-y`,
`--blob-size`, `--blob-color`, `--blob-delay`, `--blob-duration` —
which feed straight into a single `radial-gradient` background, a
`translate(-50%, -50%)` anchor, and an `animation` shorthand.

The host itself owns the heavy `filter: blur(N px)` so all blobs
composite into one another rather than each sitting in their own
isolated blur — that's what gives the soft mesh feel rather than a
collection of distinct fuzzy circles.

A single 0/25/50/75/100% `@keyframes mesh-drift` rule translates each
blob a few percent off its base position and back. The interesting
thing is what happens between blobs: each runs at a different
duration (`blobAnimation` adds 1500ms per index) and starts at a
different point in its cycle (negative delays scaled by index).
That's why the mesh feels like continuous flow rather than a
synchronised wave.

`buildBlobLayout` is the single source of truth — props in, layout
array out. Component, tests, and demo pages all consume the same
function, so what the test asserts and what the user sees are
guaranteed to match.

## Accessibility

- The host is `role="presentation"` — MeshGradient is purely a
  visual effect, not interactive content. Wrap it inside meaningful
  semantics if you put real UI on top.
- `pointer-events: none` on the host means the gradient never
  intercepts clicks or hovers from descendants z-indexed over it.
- `prefers-reduced-motion: reduce` → every blob's animation drops
  to `none !important` and the transform freezes at base. The
  composition still reads as a static mesh gradient.
- No keyboard interaction. No focus capture. No screen-reader
  output (it's decorative).

## Performance

- **Zero JS animation loop** — every transition runs on the
  GPU through CSS keyframes and inline custom properties.
- **One DOM node per blob** — default 5 blobs = 5 absolutely
  positioned divs. Tested smooth at 12 blobs even with 100px+
  blur on retina displays.
- **`filter: blur` on the host** — blobs composite into one
  another rather than each sitting in their own blur layer.
  Net result: one expensive compositor effect, not N.
- **`will-change: transform`** on each blob to hint the GPU.
- Reduced motion disables animations entirely — zero animation
  cost, just static gradient.

## When to reach for it

- Hero backdrops behind a headline.
- Marketing / landing splash washes.
- Empty-state panels that want quiet ambient life.
- Dark-mode glow accents.
- Anywhere "premium product" energy is the goal.

## When not to

- For event-driven concentric expansion, reach for **RippleGrid**.
- For cursor-following displacement, reach for **MagnetGrid**.
- For stripey horizontal aurora bands, reach for **AuroraBackdrop**.
- For one-axis sweep on a border, reach for **ShineBorder**.
- For burst-on-click sparkles, reach for **ClickSpark**.

## Inspiration

A nod to the soft mesh-gradient backdrops Stripe, Linear, and
Vercel popularised in their 2023–24 marketing surfaces. Pure CSS
keyframes with cascaded custom properties — the GPU does the heavy
lifting and the helpers stay pure for testing.
