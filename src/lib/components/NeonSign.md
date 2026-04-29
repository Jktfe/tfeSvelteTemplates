---
title: NeonSign
description: Glowing neon-tube text — multi-layer text-shadow stack creates the inner-tube core through to the outer atmospheric haze. Six palettes, optional irregular flicker, "broken" mode that dims selected characters as if a tube has burnt out, and an on/off power state. Pure CSS, asset-free, prefers-reduced-motion safe.
category: Statement Sections
author: antclaude
status: stable
---

# NeonSign

Glowing neon-tube text. The trick is a five-stop CSS `text-shadow` stack — a hard white core, two saturated palette stops, and two soft halo stops. Stacking shadows on a single element gives the layered tube-and-haze look without any blur filter, SVG, or canvas, and the whole effect is GPU-composited so it's safe to put many on a page.

The component layers an optional flicker animation on top: a deterministic per-seed keyframe schedule with shallow dips for `subtle` (real-world neon twitch) or deeper dips for `broken` (a dying tube). A "broken" mode also lets you mark specific character indices that drop out of the glow stack and render in a dim shade, so signs like `NO VACANCY` can have the `NO` burnt out.

Two power states — `on` (glow on) and `off` (whole sign collapses to the dim shade) — let consumers wire the component to any toggle without re-mounting it.

## Key Features

- **Five-layer text-shadow stack** — white core → palette glow ×2 → palette halo ×2. Scales with `intensity` so a single prop dials the whole sign brighter or dimmer.
- **Six palettes** — `pink`, `cyan`, `yellow`, `green`, `red`, `purple`. Unknown names fall back to `pink` instead of throwing.
- **Three flicker profiles** — `none` (steady), `subtle` (occasional shallow dip), `broken` (frequent deep dips, like a failing tube). Deterministic per `seed` so paints are stable across renders.
- **Burnt-out characters** — pass `broken={[0, 1]}` to dim the first two characters; the rest stay lit. Out-of-range indices are silently ignored.
- **On/off power state** — `on={false}` collapses every character to the palette's dim shade and disables the flicker; perfect for `closed` / `vacancy` toggles.
- **Reduced-motion safe** — `prefers-reduced-motion: reduce` disables the flicker animation at the CSS layer; the static glow remains so the sign still looks lit.
- **Accessible** — wrapper carries `role="img"` and `aria-label` reflects the value; the per-character `<span>`s are `aria-hidden` so screen readers announce the string once.
- **Zero dependencies** — single `.svelte` file, scoped CSS, no font CDN, no SVG, no canvas.

## Usage

```svelte
<script lang="ts">
  import NeonSign from '$lib/components/NeonSign.svelte';
  let powered = $state(true);
</script>

<!-- Hero "OPEN" sign -->
<NeonSign value="OPEN" colour="pink" size="lg" intensity={1.4} />

<!-- "NO VACANCY" with the first two letters burnt out -->
<NeonSign value="NO VACANCY" colour="red" broken={[0, 1]} flicker="broken" />

<!-- Power-toggle ON AIR sign -->
<button onclick={() => (powered = !powered)}>
  <NeonSign value="ON AIR" colour="cyan" on={powered} />
</button>

<!-- Steady, no flicker, custom seed -->
<NeonSign value="DINER" colour="yellow" flicker="none" seed={42} />
```

`NeonSign` is an `inline-flex` row — drop it into any heading, navigation badge, or hero. To restyle the dim/halo colours, override the CSS custom properties on the root: `--neon-glow`, `--neon-halo`, `--neon-dim`, `--neon-shadow`.

## Props

| Prop        | Type                                                          | Default     | Description                                                                          |
|-------------|---------------------------------------------------------------|-------------|--------------------------------------------------------------------------------------|
| `value`     | `string`                                                      | —           | Text to render. Each character becomes its own `<span>` for individual flicker / break control. |
| `colour`    | `'pink' \| 'cyan' \| 'yellow' \| 'green' \| 'red' \| 'purple'` | `'pink'`   | Palette name. Unknown names → `pink`.                                                |
| `intensity` | `number`                                                      | `1`         | Multiplier on the shadow blur radii. `0` collapses the glow, `>1` brightens it.       |
| `flicker`   | `'none' \| 'subtle' \| 'broken'`                              | `'subtle'`  | Flicker profile. `none` = steady, `subtle` = real-world neon twitch, `broken` = dying tube. |
| `broken`    | `number[]`                                                    | `[]`        | Character indices that should render dim, as if their tube has burnt out.            |
| `on`        | `boolean`                                                     | `true`      | Power state. `false` collapses every character to the dim shade and disables flicker. |
| `size`      | `'sm' \| 'md' \| 'lg'`                                        | `'md'`      | Type-scale size class.                                                               |
| `seed`      | `number`                                                      | `7`         | Seeds the deterministic flicker schedule. Same seed → same pattern.                  |
| `class`     | `string`                                                      | `''`        | Extra CSS classes appended to `.neon-root`.                                          |

## Palettes

| Name     | Glow      | Halo                          | Use for                                  |
|----------|-----------|-------------------------------|------------------------------------------|
| `pink`   | `#ff3aa9` | `rgba(255, 58, 169, 0.55)`    | Classic neon, "OPEN", late-night diners. |
| `cyan`   | `#3affef` | `rgba(58, 255, 239, 0.5)`     | Sci-fi, retro-arcade, broadcast ON AIR.  |
| `yellow` | `#ffe93a` | `rgba(255, 233, 58, 0.5)`     | Warm diner / cinema marquee.             |
| `green`  | `#3aff7a` | `rgba(58, 255, 122, 0.5)`     | Pharmacies, "GO", apothecary signs.      |
| `red`    | `#ff5a3a` | `rgba(255, 90, 58, 0.55)`     | "STOP", "VACANCY", warning lamps.        |
| `purple` | `#bd5cff` | `rgba(189, 92, 255, 0.5)`     | Lounge / club / Vegas-strip mood.        |

## Distinct From

- **`ShinyText`** — moving gradient sweep clipped to text. NeonSign is a static glow stack with optional opacity flicker.
- **`SplitFlap`** — value-change cascade. NeonSign is presentation, not value-change-driven.
- **`ScrambledText`** / **`TrueFocus`** — reveal/focus mechanics. NeonSign holds in place and stays lit.
- **`AuroraBackdrop`** / **`MembraneHero`** / **`RippleGrid`** — surface effects, not text glow.

## Accessibility

- The wrapper carries `role="img"` and `aria-label={value}`, so screen readers announce the sign as a single string.
- Per-character spans are `aria-hidden="true"` — they're a visual hack, not content.
- `prefers-reduced-motion: reduce` disables the flicker animation; the steady glow remains so the sign is still legible.
- Focus states aren't wired by the component itself — wrap it in a `<button>` if you need keyboard interaction (see the demo).

## Performance Notes

- All glow is text-shadow on a single span per character. No blur filter, no SVG, no canvas.
- Flicker is one CSS animation per character, GPU-composited.
- The keyframe block is generated once per render via `<svelte:head>`; same `colour`, `flicker`, and `seed` reuse the same `@keyframes` rule across multiple instances.
- Steady-state cost is zero JS — only `flicker="none"` skips the animation entirely.

## Implementation Notes

- The five pure helpers (`pickPalette`, `buildShadowStack`, `flickerSchedule`, `brokenMask`, `isReducedMotion`) live in `<script module>` so the test suite can assert palette resolution, deterministic flicker maths, and broken-index masking without rendering.
- `flickerSchedule` uses a deterministic LCG seeded by `seed` so the same prop combination paints the same dips on every render — no twitching on prop updates that don't change the schedule.
- `brokenMask` ignores out-of-range and non-integer indices so callers can pass a fixed list (e.g. `[0, 1]`) even when the value shrinks.
- The component generates a unique `@keyframes` name per `(palette, profile, seed)` triple — multiple signs with different flicker schedules don't collide.
