---
name: CountUp
category: Helpful UX
author: antclaude
status: shipped
---

# CountUp

Number-animation primitive — animate a value from `start` → `end` over a duration when it enters the viewport (or on manual trigger). Configurable easing, decimal precision, prefix/suffix, locale-aware grouping. Asset-free, dependency-free, prefers-reduced-motion safe.

## Key Features

- **Five easings** — `linear`, `quad`, `cubic`, `quart` (default), `expo`. All unit-testable as pure functions exported from the module-script.
- **Three triggers** — `viewport` (default; IntersectionObserver), `mount` (immediate), `manual` (call `run()` from a parent component reference).
- **Locale-aware formatting** — `Intl.NumberFormat` does the heavy lifting. Pass `locale="de-DE"` for `1.000.000` instead of `1,000,000`.
- **Prefix / suffix** — currency, percent, plus signs all work. Decimals clamp to `[0, 20]` and integerise on negative input.
- **Direction-agnostic** — `start={100}` `end={0}` counts down with the same easing curve.
- **Tabular nums** — `font-variant-numeric: tabular-nums` keeps each digit slot the same width so the number doesn't dance during the count.
- **prefers-reduced-motion safe** — instant set to end value; no rAF loop spawned.
- **Optional flash-on-complete** — gentle text-shadow pop on landing for celebratory KPIs.

## Usage

```svelte
<script>
	import { CountUp } from '$lib/components/CountUp.svelte';
</script>

<!-- Basic: viewport-triggered count -->
<CountUp end={1234} />

<!-- Currency stat with grouping and flash -->
<CountUp end={1500000} prefix="£" decimals={0} flash size="lg" />

<!-- Percentage with decimal precision -->
<CountUp end={99.9} decimals={1} suffix="%" />

<!-- Count down -->
<CountUp start={60} end={0} duration={1500} suffix="s" />

<!-- Manual trigger from a parent -->
<script>
	let counter: ReturnType<typeof CountUp> | null = $state(null);
</script>
<CountUp bind:this={counter} end={500} trigger="manual" />
<button onclick={() => counter?.run()}>Run</button>
```

## Props

| Prop          | Type                                          | Default     | Notes                                               |
| ------------- | --------------------------------------------- | ----------- | --------------------------------------------------- |
| `end`         | `number`                                      | (required)  | Destination value                                   |
| `start`       | `number`                                      | `0`         | Starting value (can be > end for count-down)        |
| `duration`    | `number`                                      | `1800`      | Total animation time in ms                          |
| `easing`      | `'linear' \| 'quad' \| 'cubic' \| 'quart' \| 'expo'` | `'quart'` | Curve shape                                          |
| `decimals`    | `number`                                      | `0`         | Decimal places (clamped to `[0, 20]`)               |
| `prefix`      | `string`                                      | `''`        | Renders before the number (e.g. `£`, `$`)            |
| `suffix`      | `string`                                      | `''`        | Renders after the number (e.g. `+`, `%`, `x`)        |
| `locale`      | `string`                                      | `'en-GB'`   | `Intl.NumberFormat` locale                          |
| `useGrouping` | `boolean`                                     | `true`      | Thousand separators on/off                          |
| `trigger`     | `'viewport' \| 'mount' \| 'manual'`           | `'viewport'`| When the count starts                               |
| `threshold`   | `number`                                      | `0.4`       | IntersectionObserver threshold (viewport trigger)   |
| `flash`       | `boolean`                                     | `false`     | Text-shadow pop on completion                       |
| `size`        | `'sm' \| 'md' \| 'lg' \| 'xl'`                | `'md'`      | Typographic preset                                  |
| `class`       | `string`                                      | `''`        | Extra class names appended to root                  |

## Imperative API

The component exposes two methods via `bind:this`:

| Method  | Effect                                                |
| ------- | ----------------------------------------------------- |
| `run()` | Start (or restart) the count from `start`. Clears any in-flight rAF. |
| `reset()` | Cancel any in-flight rAF and snap to `start`.         |

## Easings

| Name     | Shape                | Best for                             |
| -------- | -------------------- | ------------------------------------ |
| `linear` | Constant rate        | Even tickers (clocks, progress)      |
| `quad`   | Mild ease-out        | Subtle entrance                      |
| `cubic`  | Stronger ease-out    | Hero stats                           |
| `quart`  | **Default.** Punchy ease-out | KPI grids, marketing stats   |
| `expo`   | Aggressive ease-out  | Big-impact numbers (fast-then-stop)  |

## Distinct From

- **vs SplitFlap** — SplitFlap mechanically flap-flips characters when a value changes. CountUp eases monotonically; no per-character animation.
- **vs ScrambledText** — ScrambledText shuffles glyphs to reveal arbitrary text. CountUp is value-driven, not text-driven.
- **vs ScrollReveal** — ScrollReveal staggers the reveal of multiple children on viewport entry. CountUp animates a single numeric value within one node. They compose well — wrap a grid of `<CountUp>` cards in `<ScrollReveal>` for a stat dashboard reveal.
- **vs Tilt3D / RippleGrid / ClickSpark** — those are interaction primitives; CountUp is content-driven.

## Helpers

All exported from `<script lang="ts" module>` for testing and advanced consumers:

| Helper            | Returns                  | Notes                                                                             |
| ----------------- | ------------------------ | --------------------------------------------------------------------------------- |
| `pickEasing(name)`| `(t: number) => number`  | Easing function lookup; falls back to `quart` on unknown name                     |
| `easeOutQuart(t)` | `number`                 | Quart-out easing; clamps `t` into `[0, 1]`                                        |
| `tickValue(start, end, t, easeFn)` | `number`        | Value at progress `t` with given easing; direction-agnostic                       |
| `clampValue(value, start, end)` | `number`            | Clamps to `[min(start,end), max(start,end)]`                                      |
| `formatNumber(value, opts)` | `string`                | Wraps `Intl.NumberFormat` with prefix/suffix/decimals/grouping                    |
| `isReducedMotion()`| `boolean`               | Reads `prefers-reduced-motion: reduce` via `matchMedia`                           |

## Accessibility

The visible ticking number has `aria-hidden="true"`. The destination value (final, formatted) sits in a visually-hidden `.countup-sr` span so screen readers announce the end-state value once on first encounter, instead of every rAF tick. `prefers-reduced-motion: reduce` short-circuits to the end value with no animation.

## Performance

- **One rAF loop** per active count. No scroll listeners, no resize handlers.
- **One IntersectionObserver per CountUp** when `trigger="viewport"`. Disconnects after first intersection — observer is throwaway.
- **GPU-friendly flash** — when `flash={true}`, the only post-completion animation is a 600 ms text-shadow + transform. Composited.
- **Steady-state cost: zero** once the count is done.
