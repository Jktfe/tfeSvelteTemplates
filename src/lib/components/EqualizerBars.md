---
name: EqualizerBars
category: Helpful UX
author: antclaude
status: shipped
---

# EqualizerBars

A compact "things are alive" indicator: N vertical bars that oscillate in concert via phased CSS keyframes, evoking a frozen-in-motion audio spectrum analyser. Decorative only — no input, no value semantics, no audio analysis. Good fits: streaming-now badges, agent-thinking indicators, "live" tags on dashboards, listening-state on voice UIs.

Pairs naturally with `Spinner` (different idiom: rotation vs. amplitude), `ProgressBar` (different commitment: indefinite vs. measured), `LiveDot` style indicators (different density: single vs. multi). Never a substitute for a real meter — use a value-bound primitive when you need to communicate magnitude.

## Key features

- **Four variants** — `equalizer` (smooth sine wave), `spectrum` (peak-biased FFT-style), `pulse` (binary high/low), `heartbeat` (sparse double-spike). Each is a distinct rhythm, not just a colour swap.
- **Phase-stagger illusion** — every bar shares the same keyframe but starts at a different point via negative `animation-delay: calc(var(--eq-idx) * var(--eq-stagger) * -1)`. N independent CSS clocks render as one travelling wave with zero JS coupling.
- **Configurable density** — bar count `1–64`, speed multiplier `0.25×–4×`, height `16–256px`, colour (`'auto'` = `currentColor` or any CSS colour). All clamped at the helper layer so malformed input degrades gracefully.
- **Inactive state** — when `active={false}` the bars freeze at deterministic seeded heights via `seededHeights(count, seed)` (mulberry32-derived LCG, returns `[0.15, 1.0]`). Same seed → same silhouette → SSR-stable hydration.
- **Pure CSS** — zero `requestAnimationFrame`, zero `<canvas>`, zero `ResizeObserver`. One `transform: scaleY()` keyframe per variant; GPU-composited.
- **Pure helpers exported** — `pickVariant`, `isValidVariant`, `clampSpeed`, `clampBars`, `clampHeight`, `seededHeights`, `isReducedMotion`. Directly unit-testable without rendering (45 helper + render tests in this repo).
- **prefers-reduced-motion safe** — `onMount` flips `runAnimation` to false when the media query matches; a CSS `@media (prefers-reduced-motion: reduce)` rule freezes any escaped keyframe at the seeded silhouette.

## Usage

```svelte
<script>
	import EqualizerBars from '$lib/components/EqualizerBars.svelte';
</script>

<EqualizerBars />

<EqualizerBars bars={16} variant="spectrum" speed={1.5} />

<EqualizerBars variant="heartbeat" color="#ff3a6e" height={64} />

<EqualizerBars active={false} bars={20} ariaLabel="Idle signal meter" />
```

## Props

| Prop        | Type                                                  | Default                  | Notes                                                  |
| ----------- | ----------------------------------------------------- | ------------------------ | ------------------------------------------------------ |
| `bars`      | `number`                                              | `12`                     | Clamped `[1, 64]`. Floored. Malformed → `12`.          |
| `variant`   | `'equalizer' \| 'spectrum' \| 'pulse' \| 'heartbeat'` | `'equalizer'`            | Unknown → `'equalizer'`.                               |
| `speed`     | `number`                                              | `1`                      | Clamped `[0.25, 4]`. Inverse of cycle time. NaN → `1`. |
| `color`     | `string`                                              | `'auto'`                 | `'auto'` resolves to `currentColor`. Any CSS colour.   |
| `active`    | `boolean`                                             | `true`                   | `false` freezes bars at seeded silhouette.             |
| `height`    | `number`                                              | `48`                     | Clamped `[16, 256]` px. NaN → `48`.                    |
| `seed`      | `number`                                              | `1`                      | Drives inactive-state silhouette. Same seed = same.    |
| `ariaLabel` | `string`                                              | `'Audio visualisation'`  | Wrapper carries `role="img"`.                          |
| `class`     | `string`                                              | `''`                     | Extra classes on the wrapper.                          |

## Variant table

| Variant     | Easing               | Shape                              | Vibe                                |
| ----------- | -------------------- | ---------------------------------- | ----------------------------------- |
| `equalizer` | `ease-in-out` alt.   | Smooth sine, 0.18 → 0.65 → 1.0      | Classic music-app meter             |
| `spectrum`  | `cubic-bezier` alt.  | Peak-biased, 0.2 → 0.95 → 0.45 → 0.85 | FFT-style; reads as frequency     |
| `pulse`     | `steps(2, jump-none)`| Binary high/low, 0.18 ↔ 1.0         | Heartbeat-monitor flatline pulse    |
| `heartbeat` | `ease-in-out`        | Sparse double-spike then long tail | EKG / vitals indicator              |

Stagger-step is `9%` of the base duration — chosen by ear so even at `bars=64` no two adjacent bars phase-lock visibly.

## Distinct from

- **`Spinner`** — single rotating element; communicates "working" without amplitude information. EqualizerBars communicates *rhythm*.
- **`ProgressBar`** / **`ProgressRing`** — value-bound. EqualizerBars is *indefinite*.
- **`Marquee`** / **`TickerTape`** — horizontal scroll of structured content. EqualizerBars is *vertical amplitude*, content-free.
- **`Pendulum`** — single regular oscillator. EqualizerBars is *N coupled-looking oscillators*.
- **`AudioVisualizer`-style components** — those analyse real audio. EqualizerBars is *pure decoration* — it never opens a microphone.

## Pure helpers (module-script exports)

- `pickVariant(name)` — returns `'equalizer' | 'spectrum' | 'pulse' | 'heartbeat'`. Falls back to `'equalizer'`.
- `isValidVariant(name)` — type guard for variant names.
- `clampSpeed(n)` — clamps to `[0.25, 4]`. NaN/Infinity/non-numeric → `1`.
- `clampBars(n)` — clamps to `[1, 64]` and floors. NaN/Infinity/non-numeric → `12`.
- `clampHeight(n)` — clamps to `[16, 256]`. NaN/Infinity/non-numeric → `48`.
- `seededHeights(count, seed)` — deterministic mulberry32-derived array of fractions in `[0.15, 1.0]`. Same `(count, seed)` always returns the same array — required for SSR/hydration parity.
- `isReducedMotion()` — `boolean`. Returns `false` outside the browser.

## Accessibility

- Wrapper carries `role="img"` and a configurable `aria-label`. The visual is announced as a single image, not as 12 unlabelled spans.
- Each `.eq-bar` is `aria-hidden="true"` so SR users hear *only* the wrapper label.
- No keyboard or pointer interaction — the component is decorative and ignores focus / clicks.
- Under `prefers-reduced-motion: reduce`: `onMount` forces `runAnimation = false`, a `@media` rule freezes any escaped keyframe, and the bars render at their seeded heights — a static silhouette that still communicates "this is an indicator", just without motion.

## Performance

- 1 DOM node per bar (`<span class="eq-bar">`). At `bars=64`, that's 64 spans + 1 wrapper.
- Animation drives only `transform: scaleY()` on a `transform-origin: 50% 100%` element — pure GPU compositing, no layout, no paint.
- Seeded heights are computed once per render via `$derived` and reused for the inactive state.
- Zero `requestAnimationFrame`, zero canvas, zero `ResizeObserver`.

## Recipes

- **Streaming-now badge**: `<EqualizerBars bars={4} variant="pulse" height={16} color="#10b981" />` next to the title.
- **Agent-thinking indicator**: `<EqualizerBars bars={8} variant="equalizer" speed={1.5} color="#38bdf8" />` in the chat input row.
- **Listening-mode mic button**: `<EqualizerBars variant="spectrum" bars={5} height={24} color="currentColor" />` inside a button that already has a mic icon.
- **EKG vitals**: `<EqualizerBars variant="heartbeat" bars={32} color="#ff3a6e" speed={0.75} height={96} ariaLabel="Patient pulse indicator" />`.
- **Frozen silhouette**: `<EqualizerBars active={false} bars={20} seed={7} />` for "we'll start when you do" empty states.
