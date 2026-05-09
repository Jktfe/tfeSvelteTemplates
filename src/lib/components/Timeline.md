# Timeline — Technical Logic Explainer

## What Does It Do? (Plain English)

Timeline renders a list of dated events along a connecting line and animates them into view one by one. Vertical or horizontal orientation; left, right, or alternating alignment for vertical mode; entrance animations of fade, slide, scale, or none; optional progress fill that highlights "completed" events; optional click handler so the timeline doubles as a navigation control.

Think of it as a project roadmap or a "history" page: a single connecting strand with marker dots at each milestone, and a card or label explaining what happened.

## How It Works (Pseudo-Code)

```
state:
  timelineRef           = bound DOM ref
  hasAnimated           = false
  prefersReducedMotion  = matchMedia query

derive (logic helpers):
  formatDate(date)              → dateFormat function | 'relative' (Intl.RelativeTimeFormat) | default 'D MMM YYYY'
  getRelativeTime(date)         → "yesterday" / "in 3 days" / "2 months ago" via Intl.RelativeTimeFormat
  getAlignmentClass(index)      → 'align-left' | 'align-right' (for 'alternate' it depends on parity)
  getProgressPercentage()       → completed / total * 100

events:
  on event click(event):
    if onEventClick: onEventClick(event)

  on event keydown Enter or Space(event):
    preventDefault
    handleEventClick(event)

on mount:
  arm an IntersectionObserver on the root .timeline element (threshold 0.1)
  when it intersects and hasAnimated is false:
    if prefersReducedMotion: skip animation; events render in their final positions
    else:
      use animejs to stagger items into view:
        - target each .timeline-item
        - opacity 0 → 1
        - per-variant transform (translateX ±50 for slide; scale 0.8 for scale; opacity-only for fade)
        - duration: animationDuration ms
        - delay:    stagger(animationDelay) — anime.js helper
      set hasAnimated = true once the last item lands
```

## The Core Concept: Dual-Axis Layout via CSS + JS-Sequenced Entrance

Timeline has two distinct concerns: **layout** (how the line and items are arranged on the page) and **entrance** (how they animate in when scrolled into view). The component splits them cleanly.

**Layout** is pure CSS:

- Vertical orientation: a single absolutely-positioned `.timeline-line` `<div>` down the middle, with each `.timeline-item` flex-aligned left or right of it. The marker dot sits on the line; a thin connector ties the dot to the card. On mobile (≤ 768px) all items collapse to `align-left` automatically — both `alternate` and `right` modes funnel into the single-column layout.
- Horizontal orientation: flex row with the line as a horizontal `.timeline-line`, items stacked above the line, scrolling left-to-right with `scroll-snap`.
- `alignment="alternate"` toggles the side per-index; `'left'` / `'right'` pin to one side.

```
  Vertical, alternate:

         ◯     Title 1
              card 1
       ────────────────│────
                        │
             Title 2    ◯
              card 2    │
       ────────────────│────
                        │
         ◯     Title 3
              card 3
```

**Entrance** is anime.js: a single timeline animation that stages each `.timeline-item` with a stagger between them. The `animation` prop selects the variant:

- `'fade'`: opacity 0 → 1
- `'slide'`: opacity 0 → 1 + translateX(±50) → 0 (mirrored by alignment side; on mobile always −50)  (default)
- `'scale'`: opacity 0 → 1 + scale(0.8) → 1
- `'none'`: items appear instantly in their final positions

When `showProgress` is true, a second `.timeline-progress` `<div>` is positioned over the static `.timeline-line`. It carries an inline `style="--progress: <getProgressPercentage()>%"` that the scoped CSS consumes via `height: var(--progress, 0%)` (vertical) or `width: var(--progress, 0%)` (horizontal), so the coloured fill grows from `0%` to the computed completion percentage. The first paint is static; on entry the anime.js stagger then animates `scaleY` (or `scaleX`) on top of the fill once for the dramatic reveal.

## Why anime.js Here

The library is reluctant to take external animation deps — most components use pure CSS or rAF helpers. Timeline is a documented exception, and the rationale lives in the component header:

> "Complex sequenced animations would be significantly more work to implement natively, and anime.js provides excellent easing, staggering, and timeline sequencing out of the box."

A single sequence with stagger + per-item duration + reduced-motion check + replay-on-prop-change isn't trivial to write defensively. Anime.js gives:

- `stagger(animationDelay)` — exact delay sequencing per item
- Promise-based `.finished` for "all items in" hooks
- Built-in `prefers-reduced-motion` cooperation by skipping the run

The cost is ~17 KB minified+gzipped. For a component this prominent, the library's reach in the design quality is worth the bundle hit.

## CSS Animation Strategy

Layout is flex with absolute-positioned dots. The connecting line is a real `.timeline-line` `<div>` on the wrapper; the progress fill is a second `.timeline-progress` `<div>` whose inline `--progress` custom property feeds `height: var(--progress, 0%)` (vertical) or `width: var(--progress, 0%)` (horizontal). On entry, anime.js animates `scaleY` (or `scaleX` for horizontal) on top of that pre-positioned fill once after the entrance stagger lands. When `showProgress` is true and `events` change, the percentage recomputes and the next entrance pass redraws the fill.

For reduced-motion users, the entrance animation is skipped (anime.js bails when the matchMedia probe reports `reduce`), and the progress fill transition is disabled via `@media (prefers-reduced-motion: reduce)` — the bar appears at its final percentage statically.

## Performance

- Anime.js entrance runs once per mount (or per `events` array change). Not a continuous animation — the rAF loop ends when the last item lands.
- Progress fill is a single CSS transition. No JS work after `getProgressPercentage()` recomputes.
- `Intl.RelativeTimeFormat` is instantiated once per render of `'relative'`-formatted dates; modern engines cache these instances internally.
- DOM cost scales with `events.length` — one card per event. For very long histories (>200 entries) consider chunking with a "Show earlier" button.

## State Flow Diagram

```
  [mounted]
        │
        │  prefers-reduced-motion: reduce
        │     ──────────────▶ [static]   items in final positions, no entrance
        │
        │  else:
        ▼
  [animating-in]
        │  anime.js timeline:
        │    each item: opacity 0→1, transform per `animation` variant
        │    stagger:    animationDelay between consecutive items
        │  duration:     animationDuration per item
        │
        │  last item finishes
        ▼
  [settled]
        │
        │  user click on event (if onEventClick provided)
        ▼
  [event handler invoked]
        │
        ▼
  [settled]

  events array changes:
        re-trigger entrance from [animating-in]
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | `TimelineEvent[]` | required | Events to display. Each `TimelineEvent` is `{ id, date, title, description?, icon?, color?, completed?, href? }`. |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout direction. |
| `alignment` | `'left' \| 'right' \| 'alternate'` | `'alternate'` | Item alignment (vertical only). |
| `animation` | `'fade' \| 'slide' \| 'scale' \| 'none'` | `'slide'` | Entrance animation style. |
| `animationDuration` | `number` | `600` | Per-item entrance duration in ms. |
| `animationDelay` | `number` | `100` | Stagger delay between consecutive items in ms. |
| `lineColor` | `string \| undefined` | `undefined` | Optional override for the connecting line colour. When undefined, the CSS theme tokens (`--line-color`, light + dark) win — light mode falls back to `#e2e8f0`, dark mode to `rgba(148, 163, 184, 0.25)`. |
| `markerColor` | `string \| undefined` | `undefined` | Optional override for the marker colour. When undefined, the CSS token `--marker-color` is used (`#146ef5`). Per-event `event.color` always wins. |
| `showProgress` | `boolean` | `false` | Render a progress fill on the line based on `event.completed` count. |
| `dateFormat` | `((d: Date) => string) \| 'relative' \| undefined` | `undefined` | Date formatting strategy: function for custom, `'relative'` for `Intl.RelativeTimeFormat`, undefined for `'D MMM YYYY'`. |
| `onEventClick` | `(event: TimelineEvent) => void` | `undefined` | Click and keyboard-Enter handler. |

### Theme tokens (CSS custom properties)

The component exposes four custom properties so you can retheme without props. Override these on `.timeline` (or any ancestor):

| Token | Default (light) | Default (dark) | Effect |
|-------|-----------------|----------------|--------|
| `--timeline-title` | `#1e293b` | `#f1f5f9` | Card title text |
| `--timeline-description` | `#64748b` | `#cbd5e1` | Card body text |
| `--timeline-marker-ring` | `#ffffff` | `#0f172a` | The white halo around the dot |
| `--line-color` | `#e2e8f0` | `rgba(148, 163, 184, 0.25)` | Connecting line |
| `--marker-color` | `#146ef5` | inherited | Default dot colour |

The dark-mode defaults activate via both `@media (prefers-color-scheme: dark)` and an opt-in `:global(.dark) .timeline` selector. The `lineColor` / `markerColor` props are optional overrides — if you omit them, the tokens win, which means dark mode "just works".

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `events` is `[]` | The line renders but no items; `getProgressPercentage` returns 0. |
| User has `prefers-reduced-motion: reduce` | Entrance animation skipped via anime.js's reduced-motion check; items appear in final positions. |
| `events` array changes after mount | Entrance re-triggers from the start. Items restart their fade/slide/scale animation. |
| `dateFormat = 'relative'` and event date is now | `Intl.RelativeTimeFormat` returns "today". |
| `dateFormat = 'relative'` and event is far in the future | Falls through unit-by-unit (days → weeks → months → years) and prints the largest sensible unit. |
| Event with `href` set | Treated as an interactive element; `Tab` lands on it; Enter/Space activate. |
| `orientation='horizontal'` with `alignment='alternate'` | `getAlignmentClass` still returns alternating classes; CSS interprets them as above/below the horizontal line. |
| Very long event description | Card grows; line and dots stay aligned because the dot is positioned relative to the line, not the card content. |
| `completed` flag missing on all events | `getProgressPercentage` returns 0; progress fill is at 0% (effectively invisible). |

## Dependencies

- **Svelte 5.x** — `$state`, `$props`, `onMount`.
- **`animejs`** ^4.x — sequenced entrance animation. Justified because hand-rolling stagger + reduced-motion + replay-on-change is non-trivial; anime.js handles it cleanly in ~17 KB.
- **`Intl.RelativeTimeFormat`** (native) — for `dateFormat = 'relative'`.
- **`$lib/types`** — `TimelineProps`, `TimelineEvent` interfaces.

## File Structure

```
src/lib/components/Timeline.svelte   # implementation
src/lib/components/Timeline.md       # this file (rendered inside ComponentPageShell)
src/lib/components/Timeline.test.ts  # vitest unit tests
src/routes/timeline/+page.svelte     # demo page
```
