# TickerTape — Technical Logic Explainer

## What Does It Do? (Plain English)

TickerTape is a horizontal infinite-scroll display of structured data points — Bloomberg's stock crawl, a sports score crawl, an airport status board. Each item is a tuple of `{label, value, delta?, trend?}` rather than arbitrary content, so colour and glyph cues (▲ green for up, ▼ red for down) can be inferred consistently.

The whole thing is one CSS `@keyframes` animating `translateX(-50%)` on a track that holds **two copies** of the items list back-to-back. When the first copy has slid fully off-screen, the duplicate has just slid into the same position — the seam is always off-screen and the loop is invisible. Pause-on-hover toggles `animation-play-state` only.

## How It Works (Pseudo-Code)

```
state:
  none — every behaviour is encoded in CSS

derive (sanitised):
  safeVariant   = 'default' | 'finance' | 'sports' | 'minimal'
  safeDirection = 'left' | 'right'
  safeSpeed     = clamp(speed, 1..1000)            // px/s
  trackWidth    = items.length * 220               // estimated avg item width
  durationSec   = trackWidth / safeSpeed

helpers (pure, exported):
  pickVariant(name), pickDirection(name)           → safe defaults
  clampSpeed(n, fallback=60)                        → 1..1000
  inferTrend(item) → 'up' | 'down' | 'flat'
    explicit item.trend wins
    else: delta > 0 → up, delta < 0 → down, else → flat
  formatDelta(delta) → '+1.23%' | '-0.45%' | ''
  trendGlyph(trend) → '▲' | '▼' | '▬'

render:
  <div class="tickertape" style="--tickertape-duration: {durationSec}s">
    <div class="tickertape__track">
      {#each [0, 1] as copy}                       // double the items
        {#each items as item}
          ...label, value, delta...
          <span class="tickertape__sep">{separator}</span>
        {/each}
      {/each}
    </div>
  </div>

CSS:
  @keyframes tickertape-scroll {
    from { transform: translate3d(0, 0, 0); }
    to   { transform: translate3d(-50%, 0, 0); }    // exactly half = one full items copy
  }
  .tickertape__track { animation: tickertape-scroll var(--tickertape-duration) linear infinite; }
  .tickertape--right .tickertape__track { animation-direction: reverse; }
  .tickertape--pause-on-hover:hover .tickertape__track { animation-play-state: paused; }

  @media (prefers-reduced-motion: reduce) {
    .tickertape__track { animation: none !important; transform: translate3d(0,0,0); }
  }
```

## The Core Concept: 50% Translate Across a Doubled Track

Naive marquee implementations either re-mount items on a JS interval (jitters) or `translateX(-100%)` and snap (visible seam). TickerTape duplicates the items list and translates by exactly `-50%` — the second copy occupies the exact same pixel space the first copy did at `0%`, so when the keyframe restarts there is no jump.

```
  items = [A, B, C, D]    — 4 items
  track DOM = [A, B, C, D, A, B, C, D]   — 8 items, 2× width

  At t=0:    track is at 0%
   ┌─────────────────────────────────────────────────┐
   │ A   B   C   D   A   B   C   D                   │
   └─────────────────────────────────────────────────┘
   ◀── visible window ──▶

  At t=duration/2:  track is at -25%
   ┌─────────────────────────────────────────────────┐
   │       A   B   C   D   A   B   C   D             │
   └─────────────────────────────────────────────────┘
       ◀── visible window ──▶

  At t=duration:    track is at -50%
   ┌─────────────────────────────────────────────────┐
   │             A   B   C   D   A   B   C   D       │
   └─────────────────────────────────────────────────┘
                ◀── visible window ──▶
   keyframe restarts at 0% — visible content has not moved
   because the second copy of A,B,C,D was sitting at exactly
   the position the first copy occupied at t=0.
```

The first copy is fully in view; the duplicate is purely structural to bridge the wrap. `aria-hidden="true"` is set on the second-copy items so screen readers don't announce them twice.

`durationSec = (items.length * 220) / safeSpeed` gives a stable `px/s` velocity regardless of item count. The 220 px estimate is an average — real layout governs visuals; this is just a reasonable knob mapping speed to duration.

## CSS Animation Strategy

Three things make the scroll feel right.

**One — `linear` easing.** Any other curve would visibly accelerate or decelerate; a ticker should crawl at constant speed.

**Two — `translate3d` (not `translateX`).** Forces a GPU layer; the compositor handles the animation without invalidating layout.

**Three — `mask-image` on the wrapper.** A linear gradient fades the leftmost and rightmost 4% of the strip to transparent, so items don't pop into view at the edges:

```css
.tickertape {
  mask-image: linear-gradient(to right, transparent 0, #000 4%, #000 96%, transparent 100%);
}
```

Pause-on-hover is `animation-play-state: paused` — no JS, no event listener. Reverse direction is `animation-direction: reverse`. Both compose with the same single keyframe.

## Performance

- Zero rAF, zero `setInterval`, zero `ResizeObserver`. Every scroll is paint-only and runs on the GPU compositor.
- Track renders 2× items — that's the **only** duplication. No 4×, no measurement loop, no responsive re-render.
- `will-change: transform` hints the browser to keep the track on its own layer.
- Pause cost: a single CSS property flip on `:hover`. Resume: same.
- `<TickerTape items={...} variant="finance" />` is safe to drop multiple instances on the same page; they all share the GPU compositor pipeline.

## State Flow Diagram

```
  [mounted with items.length > 0]
        │
        │  CSS animation starts immediately on render
        ▼
  [scrolling] ── translate3d(0) → translate3d(-50%) ── loops forever
        │
        │  hover, pauseOnHover = true
        ▼
  [paused]
        │
        │  hover ends
        ▼
  [scrolling]

  prefers-reduced-motion: reduce
        │
        ▼
  [static]   animation: none; track at translate3d(0)
              first copy fully readable as a static row
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TickerItem[]` | `[]` | Array of `{ label, value, delta?, trend?, href? }`. Empty array hides the track. |
| `speed` | `number` | `60` | Pixels per second. Clamped to `1..1000`. |
| `direction` | `'left' \| 'right'` | `'left'` | Scroll direction. `'right'` flips `animation-direction: reverse`. |
| `pauseOnHover` | `boolean` | `true` | Stop the scroll while the pointer is over the wrapper. |
| `separator` | `string` | `'•'` | Glyph rendered between items. |
| `variant` | `'default' \| 'finance' \| 'sports' \| 'minimal'` | `'default'` | Theme tokens — colour grammar, padding, font size. |
| `class` | `string` | `''` | Extra classes on the wrapper. |
| `aria-label` | `string` | `'Ticker tape'` | Region label for screen readers. |

`TickerItem`:
| Field | Type | Notes |
|-------|------|-------|
| `label` | `string` | Uppercased, muted colour. |
| `value` | `string \| number` | Bold, brand-coloured. |
| `delta` | `number` (optional) | Used to infer `trend` if not set; rendered as `+1.23%` / `-0.45%`. |
| `trend` | `'up' \| 'down' \| 'flat'` (optional) | Explicit override; otherwise inferred from `delta` sign. |
| `href` | `string` (optional) | Wraps the item in an `<a>` with focus-visible styles. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `items` is `[]` | Track is not rendered; wrapper still exposes `role="marquee"`. |
| `speed = 0` or non-finite | `clampSpeed` returns the fallback `60`. |
| `items` very long | `durationSec` scales linearly, so `px/s` stays constant — the scroll just takes longer to repeat. |
| Item with `delta` but no `trend` | `inferTrend` reads delta sign — positive → up, negative → down, zero → flat. |
| `href` on an item | Renders as `<a>` with focus-visible outline; AT can Tab to it. The duplicate copy is `aria-hidden="true"` so it isn't announced or focused twice. |
| User has `prefers-reduced-motion: reduce` | Animation cancelled; track sits at `translate3d(0)` — the first copy reads as a static, readable row. |
| `variant` unknown string | `pickVariant` falls back to `'default'`. |
| Surrogate-pair glyph in label/value (emoji, CJK) | Rendered as a single token — no string-based slicing happens. |

## Dependencies

- **Svelte 5.x** — `$derived`, `$props`.
- Zero external dependencies — pure Svelte 5 + scoped CSS.

## File Structure

```
src/lib/components/TickerTape.svelte   # implementation
src/lib/components/TickerTape.md       # this file (rendered inside ComponentPageShell)
src/lib/components/TickerTape.test.ts  # vitest unit tests for the pure helpers
src/routes/tickertape/+page.svelte     # demo page
```
