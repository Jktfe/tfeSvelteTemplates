---
name: WordCloud
category: Data Visualisation
author: tfeclaude
status: shipped
---

# WordCloud

A frequency-weighted text-cloud primitive. N words sized proportionally to their `weight`, packed into a container, optionally rotated, coloured deterministically from a palette. At-a-glance summary of token frequency in a corpus — blog tags, search facets, AI prompt-token frequency, customer-feedback sentiment, code-keyword analysis, conference programme buzzwords.

Pure CSS layout — no canvas, no D3, no rAF. Three variants — organic flex-wrap, CSS-grid, polar radial — each shares the same data shape (`{text, weight, href?}`).

## Key features

- **Three variants** — `organic` (flex-wrap line flow, larger words first), `grid` (CSS grid, evenly spaced), `radial` (concentric polar rings around the heaviest word at the centre). Each carries the same data shape.
- **Linear weight→font-size scale** clamped to `[minSize, maxSize]`. Equal-weight corpora collapse to the midpoint — no division-by-zero, no tiny text.
- **Deterministic palette colour** — `pickPaletteColor(text, palette)` hashes the word text via `hashWord` and indexes into the palette. Same word → same colour, every render. No colour flicker on re-render.
- **Optional rotation** — `none`, `alternating` (every 2nd word at -90deg), `random` (deterministic from `seed`, picks from a small angle set so most words still read horizontally).
- **Three render modes** — `<a>` when `href` set, `<button>` when `onWordClick` set, `<span>` otherwise. Words with `href` participate in tab order.
- **Hover lift** — `transform: scale(1.08)` on interactive words. Disabled under `prefers-reduced-motion: reduce` and when the component detects `isReducedMotion()` on mount.
- **Optional screen-reader table** via `srTable` — emits a visually-hidden ranked table of words for SR users; decorative spans become `aria-hidden`.
- **Pure helpers exported** from the module-script — directly unit-testable without rendering.
- **Zero external dependencies** — pure Svelte 5 + scoped CSS.

## Usage

```svelte
<script lang="ts">
	import WordCloud from '$lib/components/WordCloud.svelte';
	import type { WordCloudWord } from '$lib/components/WordCloud.svelte';

	const topics: WordCloudWord[] = [
		{ text: 'svelte', weight: 42 },
		{ text: 'rune', weight: 28 },
		{ text: 'reactivity', weight: 22 },
		{ text: 'store', weight: 18, href: '/docs/store' },
		{ text: 'snippet', weight: 14 }
	];
</script>

<!-- Default organic flow -->
<WordCloud words={topics} />

<!-- Radial variant with alternating rotation -->
<WordCloud
	words={topics}
	variant="radial"
	rotation="alternating"
	minSize={16}
	maxSize={64}
/>

<!-- Custom palette + click handler -->
<WordCloud
	words={topics}
	variant="grid"
	palette={['#6366f1', '#06b6d4', '#10b981']}
	onWordClick={(w) => console.log(w.text)}
/>
```

## Props

| Prop          | Type                                 | Default       | Notes                                                                                |
| ------------- | ------------------------------------ | ------------- | ------------------------------------------------------------------------------------ |
| `words`       | `WordCloudWord[]`                    | `[]`          | Empty array → renders nothing.                                                       |
| `variant`     | `'organic' \| 'grid' \| 'radial'`    | `'organic'`   | Unknown values fall back to `organic`.                                               |
| `rotation`    | `'none' \| 'alternating' \| 'random'`| `'none'`      | Unknown values fall back to `none`.                                                  |
| `minSize`     | `number` (px)                        | `14`          | Clamped to `[8, 200]`. Non-finite → fallback `14`.                                   |
| `maxSize`     | `number` (px)                        | `48`          | Clamped to `[8, 200]`. Non-finite → fallback `48`.                                   |
| `palette`     | `string[]`                           | built-in (8)  | Empty / non-array falls back to the built-in palette.                                |
| `seed`        | `number`                             | `0`           | Used by the `random` rotation strategy — same seed → same angles.                    |
| `srTable`     | `boolean`                            | `false`       | Emit a visually-hidden ranked table for screen readers.                              |
| `onWordClick` | `(w: WordCloudWord) => void`         | `undefined`   | Words become `<button>` when set (and have no `href`).                               |
| `aria-label`  | `string`                             | `'Word cloud'`| Screen-reader summary of the cloud's purpose.                                        |
| `class`       | `string`                             | `''`          | Extra classes on the outer wrapper.                                                  |

### `WordCloudWord` shape

| Field    | Type     | Required | Notes                                                          |
| -------- | -------- | -------- | -------------------------------------------------------------- |
| `text`   | `string` | yes      | The word itself. Empty strings are stripped by `normaliseWords`.|
| `weight` | `number` | yes      | Drives font-size and rank order. Non-finite → coerced to `1`.  |
| `href`   | `string` | no       | If present, the word renders as an anchor with focus styling.  |

## Pure helpers (module-script exports)

Every helper below is exported and directly unit-testable — no DOM, no Svelte runtime needed.

| Helper                                                                          | Purpose                                                                                  |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `pickVariant(name)`                                                             | Returns a valid `WordCloudVariant`. Falls back to `'organic'`.                            |
| `isValidVariant(name)`                                                          | Type guard for `WordCloudVariant`.                                                       |
| `pickRotationStrategy(name)`                                                    | Returns a valid `WordCloudRotation`. Falls back to `'none'`.                              |
| `isValidRotationStrategy(name)`                                                 | Type guard for `WordCloudRotation`.                                                      |
| `clampSize(n, fallback)`                                                        | Clamps to `[8, 200]`. Non-finite → fallback.                                              |
| `hashWord(text)`                                                                | Deterministic 32-bit djb2-style hash of a string. Stable across renders.                  |
| `pickPaletteColor(text, palette)`                                               | `palette[hashWord(text) % palette.length]`. Empty palette → built-in default.             |
| `scaleSize(weight, minWeight, maxWeight, minSize, maxSize)`                     | Linear interpolation, clamped. Equal min/max weights → midpoint of size range.            |
| `pickRotation(strategy, index, seed?)`                                          | Returns rotation angle in degrees. Deterministic for `random` given the same `seed`.      |
| `normaliseWords(words)`                                                         | Sort by weight desc + dedupe by lowercase text. First occurrence wins.                    |
| `getWeightExtents(words)`                                                       | `{ min, max }` of the weight column. Empty → `{ min: 0, max: 1 }`.                        |
| `polarPosition(index)`                                                          | `{ left, top, ring }` percentages for the radial variant. Index 0 sits at the centre.     |
| `isReducedMotion()`                                                             | Returns `false` outside the browser; otherwise checks `prefers-reduced-motion`.           |

## How it works

```
.wordcloud (container, role="list" or "group", aria-label)
  ├ .wordcloud__word (font-size + colour from helpers)
  ├ .wordcloud__word
  └ .wordcloud__word
```

The component maps each word to `{ fontSize, colour, angle }` via the pure helpers, then renders one of three element types per word:

- `<a>` if the word has `href`
- `<button>` if `onWordClick` is provided
- `<span>` otherwise

Variant-specific layout is class-driven:

- `organic` → `display: flex; flex-wrap: wrap` with gap
- `grid` → `display: grid` with `auto-fit` columns
- `radial` → `display: block; position: relative` with each word `position: absolute` at `polarPosition(index)` percentages

Rotation is applied via inline `transform: rotate(Xdeg)` so it survives variant changes without re-renders. Hover lift is GPU-composited (`transform: scale`) and disabled under reduced-motion.

## Accessibility

- The outer wrapper is `role="list"` when items are interactive (or any item carries `href`); otherwise `role="group"` with an `aria-label` summary. List items get `role="listitem"` automatically.
- Linked / clickable words have `:focus-visible` rings (2px outline, 2px offset) — they participate in tab order and respond to `Enter` / `Space` like native controls.
- The `srTable` prop emits a visually-hidden ranked `<table>` listing every word and its weight. When this table is present, decorative `<span>` words receive `aria-hidden="true"` so screen readers see the data exactly once.
- Hover lift is suppressed under `prefers-reduced-motion: reduce` (CSS media query + JS probe both flip the class). Words still render and remain readable.
- Colour is decorative — it carries no semantic meaning. Word size is the only quantitative encoding.

## Performance

- Single render pass — no measurement loop, no `ResizeObserver`, no rAF.
- Polar coordinates for the radial variant are computed once per word at render time (sin/cos × N words — cheap even at N≈200).
- Hover lift is `transform: scale` only — GPU compositor effect, no layout thrash.
- The deterministic palette index means re-renders with the same data don't allocate or compare colour arrays.

## Distinct from

- **`TickerTape`** — scrolls a structured `TickerItem[]` strip horizontally. WordCloud is a static aggregation visual, not a marquee.
- **`ScrambledText`** / **`Typewriter`** / **`SplitFlap`** — single-string text effects. WordCloud is a multi-token frequency display.
- **`BubblePacking`** — D3 force-directed circle packing of numeric values. Visually similar but bubbles encode weight via area; WordCloud encodes weight via font-size and renders the actual word.
- **`StatCard`** — single static KPI card. WordCloud is the multi-token version.

## When to use

- **Topic clouds** — blog tags, search facets, knowledge-base index pages.
- **Survey response visualisation** — short free-text answers aggregated into common terms.
- **AI prompt-token frequency** — the most-used words across a model's context window.
- **Customer-feedback sentiment summaries** — common nouns/adjectives from review corpora.
- **Code-keyword analysis** — most-imported symbols, most-used React hooks, etc.
- **Conference programme overview** — talk titles → buzzword cloud.

## When _not_ to use

- **Precise quantitative comparison** — sizes are perceptual, not measurable. Use `BubblePacking` or `DataGridBasic` when readers need to read off exact values.
- **Long-string corpora** (word count > ~100) — the cloud becomes visual clutter. Pre-filter to top-N first.
- **Ordered sequences** — a word cloud has no narrative order. Use `TickerTape` or `Timeline` for sequential data.

## Recipes

- **Blog tag cloud**: `<WordCloud words={tags} variant="organic" minSize={14} maxSize={32} />`
- **Search-facet poster**: `<WordCloud words={facets} variant="grid" rotation="alternating" />`
- **Hub-and-spoke topics**: `<WordCloud words={topics} variant="radial" rotation="random" seed={42} />`
- **Branded palette**: `<WordCloud words={words} palette={['#6366f1', '#06b6d4']} />`
- **Filter trigger**: `<WordCloud words={filters} onWordClick={applyFilter} />`
- **Accessible decorative cloud**: `<WordCloud words={words} aria-label="Top 20 themes from customer interviews" srTable />`
