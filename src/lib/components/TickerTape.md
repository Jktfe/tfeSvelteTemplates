---
name: TickerTape
category: Helpful UX
author: tfeclaude
status: shipped
---

# TickerTape

A horizontal infinite-scroll display of **structured** data points. Each item is a tuple of `{label, value, delta?, trend?, href?}` rather than arbitrary content — Bloomberg / airport-info-board energy, but as a portable Svelte 5 primitive.

The track holds two copies of the items list back-to-back; a single CSS keyframe translates the track by exactly `-50%` so the wrap seam is always off-screen. Hover pauses via `animation-play-state` — that's it. Zero `requestAnimationFrame`, zero canvas, zero JS frame loop, zero resize observer.

## Key features

- **Four named variants** — `default` (slate mono), `finance` (dark navy + amber numerals + green/red deltas), `sports` (deep teal scoreboard), `minimal` (transparent, hairline-bordered for light dashboards). Each carries its own colour grammar, weight and tabular numeral treatment.
- **Trend chevrons** — `up` / `down` / `flat`. Inferred from `delta` sign automatically (`>0` → up, `<0` → down, `=0` → flat) or set explicitly per item via the `trend` field. Glyphs: green ▲, red ▼, grey ▬.
- **Delta formatting** — `formatDelta(n)` produces `+1.20%` / `-0.43%` / `0.00%` (no leading sign on zero). Empty string for `undefined` / `NaN` / `±Infinity`.
- **Pure CSS keyframe scroll** — single GPU compositor effect on `transform: translate3d(...)` with `will-change: transform`. Pause-on-hover via `animation-play-state: paused`, no JS handler.
- **Configurable speed** (px/s, default 60, clamped `[1, 1000]`) and **direction** (`left` / `right` via `animation-direction: reverse`).
- **Edge fade** via `mask-image: linear-gradient(...)` so items slide in/out softly on both ends — no hard cut at the viewport edge.
- **Optional `href` per item** wraps it as a focus-visible anchor. Without `href`, items render as `<span>`.
- **prefers-reduced-motion: reduce** → animation off via CSS `@media`, strip stays readable as a static row.
- **SR-friendly** — outer wrapper is `role="marquee"` with `aria-live="off"` (animated content shouldn't announce per cycle). Pass `aria-label` to describe the strip's purpose. The duplicated second copy is `aria-hidden="true"` so screen readers see each item once.
- **Pure helpers exported from the module-script** (`pickVariant`, `pickDirection`, `clampSpeed`, `inferTrend`, `formatDelta`, `trendGlyph`, `isValidVariant`, `isValidDirection`, `isReducedMotion`) — directly unit-testable without rendering.

## Usage

```svelte
<script lang="ts">
	import TickerTape from '$lib/components/TickerTape.svelte';
	import type { TickerItem } from '$lib/components/TickerTape.svelte';

	const stocks: TickerItem[] = [
		{ label: 'AAPL', value: '$187.42', delta: 1.24 },
		{ label: 'MSFT', value: '$418.05', delta: -0.43 },
		{ label: 'GOOGL', value: '$142.66', delta: 0.87, href: '/stocks/googl' }
	];
</script>

<!-- Default mono -->
<TickerTape items={stocks} />

<!-- Finance variant, faster, no pause-on-hover -->
<TickerTape items={stocks} variant="finance" speed={120} pauseOnHover={false} />

<!-- Custom separator, right-to-left -->
<TickerTape items={stocks} variant="minimal" direction="right" separator="·" />
```

## Props

| Prop           | Type                                                    | Default     | Notes                                                                       |
| -------------- | ------------------------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `items`        | `TickerItem[]`                                          | `[]`        | Empty array → renders nothing (no track, no animation).                     |
| `variant`      | `'default' \| 'finance' \| 'sports' \| 'minimal'`       | `'default'` | Unknown values fall back to `default`.                                      |
| `direction`    | `'left' \| 'right'`                                     | `'left'`    | Unknown values fall back to `left`.                                         |
| `speed`        | `number` (px/s)                                         | `60`        | Clamped to `[1, 1000]`. NaN / ±Infinity / non-numeric → fallback `60`.      |
| `pauseOnHover` | `boolean`                                               | `true`      | Toggles `animation-play-state: paused` on hover/focus.                      |
| `separator`    | `string`                                                | `'•'`       | Glyph rendered between items. Set `''` to omit.                             |
| `class`        | `string`                                                | `''`        | Extra classes on the outer wrapper.                                         |

### `TickerItem` shape

| Field   | Type                          | Required | Notes                                                                       |
| ------- | ----------------------------- | -------- | --------------------------------------------------------------------------- |
| `label` | `string`                      | yes      | Ticker symbol / category / short caption.                                   |
| `value` | `string \| number`            | yes      | The headline figure. Number values render with tabular numerals.            |
| `delta` | `number`                      | no       | Signed percent. Drives chevron + colour when `trend` is unset.              |
| `trend` | `'up' \| 'down' \| 'flat'`    | no       | Explicit trend. Wins over `delta` sign — useful for categorical states.     |
| `href`  | `string`                      | no       | If present, the item renders as `<a href>` (focus-visible).                 |

## How it works

The component renders a wrapper, an inner track, and the items list — twice, back-to-back:

```
.tickertape (wrapper, mask-image fade, role="marquee")
  └ .tickertape__track (animated translateX)
      ├ items copy 0 (live)
      └ items copy 1 (aria-hidden)
```

A single CSS keyframe `tickertape-scroll` translates the track from `0` to `-50%` over a duration computed from `items.length × ITEM_WIDTH / speed`. Because copy 1 is identical to copy 0, the wrap seam at `-50%` is invisible — it loops cleanly and the strip appears infinite.

`direction="right"` flips the keyframe via `animation-direction: reverse` (no separate keyframe needed).

`pauseOnHover` adds a class that sets `animation-play-state: paused` on `:hover`. This costs nothing — the GPU compositor freezes the transform, no JS runs.

## Pure helpers (module-script exports)

- `pickVariant(name)` → `TickerVariant`. Falls back to `'default'`.
- `pickDirection(name)` → `TickerDirection`. Falls back to `'left'`.
- `clampSpeed(n, fallback?)` → `number` in `[1, 1000]`. NaN / ±Infinity / non-numeric → fallback (default 60).
- `inferTrend(item)` → `'up' | 'down' | 'flat'`. Explicit `trend` wins; otherwise from `delta` sign.
- `formatDelta(delta)` → `string`. `+1.20%` / `-0.43%` / `0.00%` / `''` for nullish/non-finite.
- `trendGlyph(trend)` → `'▲' | '▼' | '▬'`.
- `isValidVariant(name)` / `isValidDirection(name)` — type guards.
- `isReducedMotion()` → `boolean`. Returns `false` outside the browser.

## Accessibility

- The outer wrapper is `role="marquee"` with `aria-live="off"` — animated, looping content should not be re-announced on each cycle. Pass `aria-label="Live stock prices"` (or similar) so screen readers describe the strip's purpose once.
- Each rendered copy of the items list contains the same data; the second copy is `aria-hidden="true"` so SR users see each item exactly once.
- Items with `href` render as `<a>` with default focus-visible styling. They participate in tab order and are keyboard-activatable.
- Under `prefers-reduced-motion: reduce`, a CSS `@media` rule freezes the keyframe — the strip displays the first frame statically. Content remains fully readable; a horizontal-scroll-on-tab fallback is **not** added (the static frame is the contract under reduced-motion).
- Trend chevrons (▲ / ▼ / ▬) sit alongside the formatted delta string; the colour is decorative and the percent sign carries the semantic information.

## Performance

- One keyframe animates a single `transform: translate3d(...)` on the track — the cheapest possible GPU compositor effect.
- The track renders 2× the items (just enough for a seamless wrap); no resize observer, no measurement loop, no rAF.
- `will-change: transform` hints the GPU once.
- Pause-on-hover costs nothing — `animation-play-state` flips, no JS handler.
- The `mask-image` fade is a static gradient applied to the wrapper — no per-frame work.

## Distinct from

- **`Marquee`** / **`MarqueeDraggable`** — those scroll arbitrary children; TickerTape scrolls a *structured* `TickerItem[]` with built-in label/value/delta/trend grammar.
- **`Typewriter`** / **`SplitFlap`** / **`KineticHeadline`** — single-string text effects. TickerTape is a *strip* of structured items.
- **`StatCard`** — single static KPI card. TickerTape is the moving multi-item version.
- **`AnimatedCounter`** / **`CountUp`** — animate the numeric value of a single figure. TickerTape doesn't animate the values themselves; it scrolls the strip.

## When to use

- **Stock / crypto / FX prices** with deltas — the flagship case. The `finance` variant is purpose-built.
- **Live sports scores** along the top of a broadcast page or scoreboard.
- **Status feeds** — system health, deployment state, build status. Use the `default` or `minimal` variant with `trend` set explicitly per item (categorical states).
- **Key metrics in a dashboard hero** — the `minimal` variant slots quietly above the fold.
- **Airport / station info boards** — flight numbers, gate, status.

## When _not_ to use

- For free-form scrolling content (logos, testimonials, images) — use `Marquee` / `MarqueeDraggable` instead. TickerTape's data shape is structured tuples.
- For single-value emphasis — use `StatCard` or `CountUp` for one figure with a label.
- For high-frequency updating data where each tick should re-announce — TickerTape sets `aria-live="off"` deliberately. If you need announcements, layer a separate visually-hidden `aria-live="polite"` region.

## Recipes

- **Live stock board**: `<TickerTape items={prices} variant="finance" speed={70} aria-label="Live stock prices" />`
- **Scoreboard**: `<TickerTape items={scores} variant="sports" speed={55} aria-label="Live scores" />`
- **Status feed**: `<TickerTape items={statusItems} variant="default" speed={45} aria-label="System status" />`
- **Dashboard hero metrics**: `<TickerTape items={metrics} variant="minimal" speed={50} />`
- **Bidirectional rows** (one left, one right): two stacked TickerTapes with opposite `direction` props for visual variety.
