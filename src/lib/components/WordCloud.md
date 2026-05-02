# WordCloud — Technical Logic Explainer

## What Does It Do? (Plain English)

A frequency-weighted text cloud. Pass it `[{ text, weight, href? }, …]` and it renders the words sized proportionally to their weight, packed into a container, optionally rotated, coloured deterministically from a palette. Three variants share the same input shape: **organic** (`flex-wrap` chaos in a good way), **grid** (CSS-grid placement with weighted spans), and **radial** (concentric rings of words around a centre).

Use cases: blog tags, search facets, AI prompt-token frequency, customer-feedback sentiment, code-keyword analysis. Pure CSS layout — no canvas, no D3, no rAF. Same word always gets the same colour across renders because palette index is derived from a hash of the text, so re-mounts don't flicker.

## How It Works (Pseudo-Code)

```
state:
  // No internal mutable state — everything is derived from props

derive normalisedWords (from words):
  // Sort by weight desc, deduplicate by lowercase text (first wins)
  // Filter out empty/non-string text
  return sorted, deduped array

derive weightExtents (from normalisedWords):
  return { min, max } over weights, with sane fallbacks for empty input

derive resolvedVariant     = pickVariant(variant)        // organic | grid | radial
derive resolvedRotation    = pickRotationStrategy(rot)   // none | alternating | random
derive resolvedMin / Max   = clampSize(minSize, maxSize) to [8, 200]

per-word (during render, not state):
  fontSize = scaleSize(weight, min, max, minPx, maxPx)   // linear, clamped
  color    = palette[hashWord(text) % palette.length]    // deterministic by text
  rotation = pickRotation(strategy, index, seed)         // 0 | -90 | small set

  if variant === 'radial':
    {left%, top%} = polarPosition(index)                  // index 0 at centre, then rings of 6, 12, 18…

render:
  <ul role="list">
    {#each normalisedWords}
      {#if href}    <a  role="listitem" style="font-size, color, transform">…</a>
      {:else if onWordClick}  <button …>
      {:else}                  <span aria-hidden …>
    {/each}
  </ul>
  {#if srTable} visually-hidden ranked <table> for screen readers {/if}
```

There's no measurement loop, no resize observer, no rAF. The whole layout is a single render pass: compute the per-word style values, hand them to CSS, let the browser do the placement.

## Core Concept: Three Layout Strategies, One Data Shape

The interesting bit isn't the maths (it's modest) — it's that three quite different visual outcomes share the same input shape and the same scaling pipeline.

### Linear weight → font-size scale

```
fontSize(weight) = minSize + ((weight - minWeight) / (maxWeight - minWeight)) × (maxSize - minSize)
                 clamped to [minSize, maxSize]
```

Linear, not log. For tag clouds the weights are usually within 1–2 orders of magnitude (a popular tag has 50 occurrences, a rare one has 3); linear scaling is honest and readable. Log scaling makes sense when weights span 4+ orders of magnitude (e.g., pageview counts), in which case you should pre-transform `weight` to `log(weight)` before passing it in.

When all weights are equal, the formula degenerates to `0/0`. We collapse to the midpoint `(minSize + maxSize) / 2` — uniform-size cloud, no division-by-zero exception.

### Deterministic colour: hash the text

Most word-cloud libraries randomise colour, which means re-renders flicker. We hash the text with a tiny djb2-style 32-bit hash and modulo into the palette:

```
hashWord("svelte") → 4_184_028_393 → mod palette.length → palette[1]
```

Same word, same colour, every time. Different cloud, different corpus — same word still gets the same colour, which is occasionally useful when you have multiple clouds side by side comparing eras of the same vocabulary.

### Organic variant: flex-wrap chaos

The container is `display: flex; flex-wrap: wrap; justify-content: center; align-items: baseline;` with a small gap. Words are placed left-to-right, top-to-bottom, breaking into new rows when they run out of width. Optional rotation (`-90deg`) is per-word inline transform. The result is the recognisable "wordle" look: high-weight words anchor visually because they're physically larger, low-weight words fill the gaps.

### Grid variant: CSS-grid with weighted spans

The container is `display: grid` with `grid-template-columns: repeat(auto-fill, minmax(<minSize>px, 1fr))`. Each word's `grid-column` span is proportional to its font size band, so heavy words occupy multiple cells while light ones occupy one. The grid algorithm handles placement deterministically — same input, same layout. Useful when you need predictable rows for screenshot stability.

### Radial variant: polar coordinates per index

```
polarPosition(0)        = centre (50%, 50%)
polarPosition(1..6)     = ring 1, evenly spaced around 360°
polarPosition(7..18)    = ring 2, 12 positions
polarPosition(19..36)   = ring 3, 18 positions
…
```

Ring `k` holds `6k` positions and sits at radius `min(48%, 14% × k)` from centre. The positions are computed once per word at render time — no iteration loop, no collision detection. Tight at the centre, loose at the edges; word 0 (heaviest) sits in the bullseye.

The `0.85` vertical squash on the radius (`top = 50 + sin × radius × 0.85`) compensates for typical wide-aspect containers — without it, the radial cloud looks vertically cramped in landscape orientations.

## Performance

Single-pass, GPU-friendly, scales to ~500 words before the DOM count starts to matter.

- **n ≤ 50:** Trivial. No measurement, no layout thrash.
- **n = 50–200:** One render. CSS does all the work.
- **n = 200–500:** DOM has 200–500 list items. Still fine. Hover scale is `transform`, GPU-composited.
- **n > 500:** DOM count rather than CPU is the limit. If you genuinely have 1 000+ tags to show, consider truncating to top-N before passing in (with a "show all" toggle).

There's no rAF loop, no observer, no event delegation. Hover transitions are pure CSS. The cost-per-frame is whatever the browser charges to scale-transform a single element on hover.

`prefers-reduced-motion: reduce` disables the hover scale transition. The cloud is otherwise static — no animations to suppress.

## State Flow Diagram

```
              ┌────────────────────────┐
              │  empty / no words      │  words === []
              │  renders nothing        │
              └───────────┬────────────┘
                          │ words prop set
                          ▼
              ┌────────────────────────┐
              │  normalised            │
              │  - dedup by lowercase  │
              │  - sort by weight desc │
              │  - drop invalid items  │
              └───────────┬────────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │  rendered              │
              │  per-word: size, color │
              │  rotation, position    │
              └───────────┬────────────┘
                          │
              ┌───────────┼───────────────┐
              │ hover     │ click         │ words prop changes
              ▼           ▼               ▼
       ┌──────────┐ ┌──────────────┐  ┌──────────────────┐
       │ scale    │ │ onWordClick  │  │ re-normalise     │
       │ transform│ │ fired (or    │  │ re-render        │
       │ (CSS)    │ │ <a> follow)  │  │ colours stable   │
       └──────────┘ └──────────────┘  │ across renders   │
                                       └──────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `words` | `WordCloudWord[]` | `[]` | Each word: `{ text, weight, href? }`. Sorted/deduped automatically. |
| `variant` | `'organic' \| 'grid' \| 'radial'` | `'organic'` | Layout strategy. Invalid strings fall back to `'organic'`. |
| `rotation` | `'none' \| 'alternating' \| 'random'` | `'none'` | Rotation strategy. `'random'` is seeded by the `seed` prop. |
| `minSize` | `number` (px) | `14` | Smallest font size. Clamped to `[8, 200]`. |
| `maxSize` | `number` (px) | `48` | Largest font size. Clamped to `[8, 200]`. |
| `palette` | `string[]` | built-in | Hex colours indexed by `hashWord(text) % palette.length`. |
| `seed` | `number` | `0` | PRNG seed for `'random'` rotation. Same seed → same angles. |
| `srTable` | `boolean` | `false` | Emit a visually-hidden ranked `<table>` for screen readers. |
| `onWordClick` | `(word: WordCloudWord) => void` | `undefined` | Click handler. When set, words render as `<button role="listitem">`. |
| `aria-label` | `string` | `'Word cloud'` | Container ARIA label when words are decorative-only. |
| `class` | `string` | `''` | Extra classes appended to the container. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `words === []` | Container renders empty (no words). No errors. |
| Single word | Centred at midpoint font size (extents collapse triggers midpoint fallback). |
| All weights identical | Every word renders at `(minSize + maxSize) / 2`. Visual hierarchy disappears (which is correct — the data has no hierarchy). |
| Duplicate text (e.g. "Svelte" and "svelte") | Lowercase deduplication keeps the first; the duplicate is silently dropped. |
| Word with empty/whitespace text | Filtered out during normalisation. |
| `weight` non-finite (NaN, Infinity) | Defaulted to `1` during normalisation. |
| `minSize > maxSize` | The clamps still respect `[8, 200]` individually; the scale formula goes negative gracefully and clamps back. Layout looks weird but doesn't error. |
| `palette` empty or missing | Falls back to `DEFAULT_PALETTE` (8 colours). |
| `variant` is a typo (e.g., `'wonderful'`) | `pickVariant` returns `'organic'`. The `isValidVariant` guard catches anything not in the union. |
| `'random'` rotation, same `seed`, two mounts | Identical angles. The Mulberry32 PRNG is deterministic. |
| `prefers-reduced-motion: reduce` | Hover scale disabled. Layout unchanged. |
| `srTable: true` | A second, hidden ranked table is added to the DOM for screen-reader users. AT navigates the table; sighted users see only the cloud. |

## Dependencies

- **Svelte 5.x** — `$derived` for normalisation and resolved-prop chains.
- Zero external dependencies. Hashing, PRNG, scaling, polar placement, and palette indexing are all hand-rolled in <150 lines of pure-function code (each exported from the `<script module>` block for tests).

## File Structure

```
src/lib/components/WordCloud.svelte    # implementation (incl. exported pure helpers in <script module>)
src/lib/components/WordCloud.test.ts   # unit tests covering hashWord, scaleSize, polarPosition, etc.
src/lib/components/WordCloud.md        # this file
src/routes/wordcloud/+page.svelte      # demo page
```
