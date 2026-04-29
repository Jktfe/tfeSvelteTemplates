---
title: SplitFlap
description: Mechanical Solari-board character flip — each character is a 3D card whose top half drops down through intermediate charset positions, the bottom catches it, settles on the new glyph. Per-character stagger creates a left-to-right cascade like an airport arrivals board updating. Asset-free, prefers-reduced-motion safe.
category: Statement Sections
author: antclaude
status: stable
---

# SplitFlap

Mechanical Solari-board character flip. Each character is a 3D card with a top and bottom half; on a value change the top half rotates down through intermediate charset positions while the bottom catches the new glyph. Per-character stagger creates a left-to-right cascade — the same effect old airport arrivals boards used.

Pure CSS 3D transforms + perspective handle the mechanics. The only JS is a small per-cell timer chain that walks the charset between old and new glyphs and toggles a `flipping` class. No animation library, no font CDN, no images.

## Key Features

- **Solari-board aesthetic** — 3D `rotateX` flap animation, gradient-shaded halves, and a 1px central divider give each cell the look of a hinged mechanical card.
- **Four named charsets** — `digits`, `alpha`, `alnum`, `solari` (with punctuation extras). Unknown names fall back to `alnum` instead of throwing.
- **Two traversal directions** — `forward` (the classic Solari feel: every change costs a full charset cycle for the longer-distance characters) or `shortest` (snappier for clocks/counters).
- **Configurable cascade** — `stagger` controls inter-cell delay, `intensity` multiplies it, `flipDuration` sets per-tick speed. The cascade can be a wave or punchy depending on values.
- **SSR-safe first paint** — the initial render shows the target value statically; the cascade only kicks in after hydration so server-rendered HTML always matches the final state.
- **Reduced-motion safe** — `prefers-reduced-motion: reduce` swaps glyphs instantly; the flip animation is disabled at the CSS layer too as a belt-and-braces guarantee.
- **Accessible** — wrapper carries `role="group"`, `aria-live="polite"`, `aria-busy` toggles while a flip is in flight, and `aria-label` always reflects the target value.
- **Zero dependencies** — single `.svelte` file, scoped CSS.

## Usage

```svelte
<script lang="ts">
  import SplitFlap from '$lib/components/SplitFlap.svelte';
  let value = $state('GATE 14');
</script>

<!-- Departures-board headline -->
<SplitFlap value={value} charset="solari" size="lg" />

<!-- Live clock face -->
<SplitFlap value="12:34:56" charset="solari" size="md" stagger={40} flipDuration={250} />

<!-- Counter that always takes the shortest path -->
<SplitFlap value="00420" charset="digits" direction="shortest" />

<!-- Plain alpha headline with a bigger stagger wave -->
<SplitFlap value="DEPARTING" charset="alpha" stagger={100} intensity={1.4} />
```

`SplitFlap` is an `inline-flex` row — drop it into any heading or hero. To restyle, override the CSS custom properties on the root: `--sf-bg`, `--sf-bg-hi`, `--sf-fg`, `--sf-radius`, `--sf-divider`, `--sf-cell-w`, `--sf-cell-h`.

## Props

| Prop           | Type                                            | Default     | Description                                                |
|----------------|-------------------------------------------------|-------------|------------------------------------------------------------|
| `value`        | `string`                                        | —           | The target string. Internally upper-cased.                 |
| `charset`      | `'digits' \| 'alpha' \| 'alnum' \| 'solari'`    | `'alnum'`   | Glyph set the cells cycle through. Unknown → `alnum`.      |
| `stagger`      | `number` (ms)                                   | `60`        | Inter-cell delay before each character begins flipping.    |
| `flipDuration` | `number` (ms)                                   | `320`       | Per-tick flap rotation duration.                           |
| `intensity`    | `number`                                        | `1`         | Multiplier applied to the cascade stagger.                 |
| `direction`    | `'forward' \| 'shortest'`                       | `'forward'` | Charset traversal direction.                               |
| `size`         | `'sm' \| 'md' \| 'lg'`                          | `'md'`      | Type-scale size class.                                     |
| `class`        | `string`                                        | `''`        | Extra CSS classes appended to the `.sf-root` wrapper.      |

## Charsets

| Name      | Length | Notes                                              |
|-----------|--------|----------------------------------------------------|
| `digits`  | 10     | `0–9` only — counters, scores, prices.             |
| `alpha`   | 27     | Leading space + `A–Z`. The space acts as a blank flap, so initial paints look right. |
| `alnum`   | 37     | Space + `A–Z` + `0–9`. The default — flexible.     |
| `solari`  | 45     | Adds `.,:!?-+/`. Use for full Solari boards.       |

## Distinct From

- **`ScrambledText`** — random glyph-shuffle reveal in 2D. SplitFlap traverses a charset deterministically with 3D mechanical flips.
- **`VariableProximity`** — font-axis morph driven by cursor proximity. SplitFlap is value-change-driven, not pointer-driven.
- **`ShinyText`** / **`TrueFocus`** — text presentation effects. SplitFlap is a value-change primitive.
- **`Ticker`** / marquees — continuous translation. SplitFlap holds in place and flips on value change.

## Accessibility

- The wrapper is a `role="group"` aria-live region. `aria-label` always reflects the target value, so screen readers announce the final string regardless of intermediate flip states.
- `aria-busy="true"` while any cell is mid-flip; flips back to `false` once the whole cascade settles.
- Each cell is `aria-hidden="true"` — only the wrapper is announced, not the intermediate glyphs.
- `prefers-reduced-motion: reduce` instantly swaps glyphs; CSS animations are also disabled at the stylesheet layer.

## Performance Notes

- One `setTimeout` chain per cell during a value change; chains are cancelled on unmount or before a new value lands.
- Each cell flip runs two CSS animations (top flap down, bottom flap up). Both are GPU-composited transforms.
- No `requestAnimationFrame`, no continuous polling, no `ResizeObserver`.
- For very long strings (>100 chars) prefer `direction="shortest"` to keep the maximum tick count bounded.

## Implementation Notes

- The four pure helpers (`pickCharset`, `nextCharIndex`, `frameDelay`, `buildTickSequence`, `isReducedMotion`) live in `<script module>` so the test suite can assert charset traversal and stagger maths without rendering.
- `buildTickSequence` is hard-capped at one full charset traversal so a malformed `direction` value can never spin a cell forever.
- The component renders the target value statically on the server / first paint and only kicks off the cascade after `onMount`, so SSR HTML is always identical to the post-cascade state. This avoids hydration mismatch warnings.
- A leading space in `alpha` / `alnum` / `solari` acts as the "blank flap" — values containing whitespace render correctly because the space is a member of the charset, not an unknown character.
