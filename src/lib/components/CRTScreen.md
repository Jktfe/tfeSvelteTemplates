---
title: CRTScreen
description: Retro CRT-monitor frame for arbitrary content. Repeating-gradient scanlines, RGB chromatic aberration on the inner content via channel-split text-shadow, optional vertical tracking roll, and a corner vignette. Four named profiles (amber / green-phosphor / broadcast / modern), pure CSS, asset-free, prefers-reduced-motion safe.
category: Statement Sections
author: antclaude
status: stable
---

# CRTScreen

Wraps any content in a CRT-monitor frame. The trick is layered overlays on top of a slot — a `repeating-linear-gradient` at 0deg paints horizontal scanlines, a `text-shadow` channel-split fakes RGB phosphor misalignment on the inner glyphs, an optional vertical-band keyframe drifts a "tracking roll" down the screen, and a `radial-gradient` darkens the corners. No SVG filters, no canvas, no images. Whole effect is GPU-composited and cheap enough to nest several on a page.

Four named profiles preset the foreground / background / scanline / aberration / vignette colours together so you don't have to hand-tune every overlay: `amber` (classic terminal), `green` (lab phosphor), `broadcast` (TV news off-white on dark slate), and `modern` (clean slate with pink/cyan aberration for fashion-style retro).

The component is a wrapper, not a text effect. Whatever you put in the default slot is what gets framed — headings, monospace logs, an entire ASCII art block, even other components.

## Key Features

- **Pure-CSS scanlines** — `repeating-linear-gradient(0deg, …)` painted as a `mix-blend-mode: multiply` overlay. `density` prop controls the cycle height in pixels (smaller = tighter lines, larger = chunky CRT). `intensity` clamps to `[0, 1]` and modulates the dark-stop alpha multiplier.
- **Chromatic aberration via text-shadow channel-split** — content slot inherits a `text-shadow` that offsets the R channel one way and the B channel the other. `aberration` prop scales the offset in pixels; `0` removes the shadow entirely.
- **Optional vertical tracking roll** — single static `@keyframes crt-roll` keyframe drifts a soft white band from top to bottom. `roll` accepts `boolean | number`; `true` gets a default speed, a number 1-10 maps to a 18s → 1.8s duration, `false`/`0` disables.
- **Corner vignette** — `vignette` prop toggles a `radial-gradient` darkening overlay. Each profile has its own vignette opacity.
- **Curved-glass option** — `curved={true}` rounds the inner screen corners and adds an inset shadow for a more glassy, perspective-y feel.
- **Reduced-motion safe** — `prefers-reduced-motion: reduce` disables the roll animation and removes the aberration text-shadow at the CSS layer. Scanlines + vignette stay so the frame still reads as a CRT.
- **Accessible** — overlay layers carry `aria-hidden`; slot content is announced exactly as written. No special role on the wrapper.
- **Zero dependencies** — single `.svelte` file, scoped CSS, no fonts loaded, no images.

## Usage

```svelte
<script lang="ts">
  import CRTScreen from '$lib/components/CRTScreen.svelte';
</script>

<!-- Amber terminal banner -->
<CRTScreen profile="amber" density={3}>
  <pre>&gt; LOADING&hellip; OK</pre>
</CRTScreen>

<!-- Green phosphor lab readout, with tracking roll -->
<CRTScreen profile="green" density={2} roll={4}>
  <h2>SYS::HEALTH</h2>
  <p>cpu 42% &middot; mem 1.8GB &middot; net OK</p>
</CRTScreen>

<!-- Broadcast NEWS card, curved-glass effect -->
<CRTScreen profile="broadcast" density={4} curved aberration={1.5}>
  <h2>BREAKING</h2>
  <p>Markets close higher on tech rally.</p>
</CRTScreen>

<!-- Modern aesthetic without aberration -->
<CRTScreen profile="modern" density={5} aberration={0} vignette={false}>
  <p>Clean retro frame — no chromatic split, no vignette.</p>
</CRTScreen>
```

To override colours, set the CSS custom properties on the root: `--crt-fg`, `--crt-bg`, `--crt-scan-gradient`, `--crt-aberration`, `--crt-vignette-color`. The roll animation reads `--crt-roll-name` and `--crt-roll-duration`.

## Props

| Prop         | Type                                                | Default     | Description                                                                                |
|--------------|-----------------------------------------------------|-------------|--------------------------------------------------------------------------------------------|
| `profile`    | `'amber' \| 'green' \| 'broadcast' \| 'modern'`     | `'amber'`   | Named colour profile. Unknown names fall back to `amber`.                                  |
| `density`    | `number`                                            | `3`         | Scanline cycle height in pixels. Clamped to `>= 1` and rounded to a positive integer.       |
| `intensity`  | `number`                                            | `1`         | Scanline alpha multiplier, clamped to `[0, 1]`. `0` flattens the lines to invisible.        |
| `aberration` | `number`                                            | `1`         | Chromatic-aberration offset in pixels. `0` removes the text-shadow entirely.                |
| `roll`       | `boolean \| number`                                 | `false`     | Tracking-roll speed. `true` = speed 3, `false` = disabled, `1-10` = explicit speed.         |
| `vignette`   | `boolean`                                           | `true`      | Whether to render the corner-darkening radial overlay.                                      |
| `curved`     | `boolean`                                           | `false`     | Round the inner screen corners and add an inset shadow for a glassy CRT feel.               |
| `class`      | `string`                                            | `''`        | Extra CSS classes appended to `.crt-root`.                                                  |
| `children`   | `Snippet`                                           | —           | Default slot — the content being framed.                                                    |

## Profiles

| Name        | Foreground | Background | Use for                                                  |
|-------------|------------|------------|----------------------------------------------------------|
| `amber`     | `#ffb84d`  | `#160d05`  | Classic 80s terminal, BIOS banner, retro REPL output.    |
| `green`     | `#7dff8a`  | `#031208`  | Phosphor lab readouts, oscilloscope-style telemetry.     |
| `broadcast` | `#f8f8f8`  | `#1a1428`  | TV news lower-third, "BREAKING" cards, broadcast bumpers.|
| `modern`    | `#e2e8f0`  | `#0f172a`  | Clean retro for design systems — slate + pink/cyan ghost.|

## Distinct From

- **`NeonSign`** — per-character glowing tube text. CRTScreen wraps arbitrary content in a monitor frame; NeonSign is a typography effect.
- **`AuroraBackdrop` / `MembraneHero`** — full-page ambient backdrops. CRTScreen is a content frame with overlays sized to its slot.
- **`ShinyText` / `ScrambledText` / `TrueFocus` / `VariableProximity`** — per-character text mechanics. CRTScreen treats its slot as opaque content and draws on top.
- **`RippleGrid` / `ClickSpark`** — interactive primitives that respond to pointer events. CRTScreen is purely presentational.
- **`SplitFlap`** — mechanical character flip. Different effect surface entirely.
- **`ScrollReveal`** — viewport-trigger stagger. CRTScreen is steady-state, no scroll dependency.

## Helpers

Module-script exports for unit tests and advanced consumers:

| Export                      | Returns         | Notes                                                                              |
|-----------------------------|-----------------|------------------------------------------------------------------------------------|
| `pickProfile(name)`         | `CRTProfile`    | Resolve a profile by name; unknown names fall back to `amber`.                     |
| `buildScanlineGradient(intensity, density, profile)` | `string` | Compute the CSS `repeating-linear-gradient` value used by `--crt-scan-gradient`. |
| `buildAberrationShadow(amount, profile)` | `string` | Compute the CSS `text-shadow` value used by `--crt-aberration`. Returns `'none'` at `0`. |
| `rollSchedule(speed)`       | `RollSchedule`  | Map a 0-10 speed knob to `{ duration, animationName }`. `0` returns `'none'`.       |
| `isReducedMotion()`         | `boolean`       | SSR-safe wrapper over `matchMedia('(prefers-reduced-motion: reduce)')`.            |

## Accessibility

- Overlay layers (`.crt-scanlines`, `.crt-roll`, `.crt-vignette-layer`) all carry `aria-hidden="true"` so they don't pollute the accessibility tree.
- The wrapper itself has no `role` — slot content is announced as it would be without the frame.
- `prefers-reduced-motion: reduce` disables the roll animation and removes the chromatic aberration text-shadow. Static scanlines and vignette remain so the visual identity holds.

## Performance

- Single repeating-gradient + radial-gradient + one keyframe — total of three GPU-composited layers per instance. Several CRTScreens on a page do not measurably slow paint.
- No JavaScript runs after mount; all derived state is `$derived` over props.
- No fonts loaded, no images, no SVG, no canvas — everything ships in the component CSS.
