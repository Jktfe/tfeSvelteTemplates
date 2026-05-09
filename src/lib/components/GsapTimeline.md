# GsapTimeline — Technical Logic Explainer

## What Does It Do? (Plain English)

A vertical timeline of events with markers on a centre line. Same data shape as the native `Timeline` component (`TimelineEvent[]`) — drop-in compatible at the prop boundary — but the entrance animation is composed by `gsap.timeline()` instead of anime.js, which lets it share the same easing curves and stagger conventions as the rest of the GSAP suite.

Pick this variant when your design system already speaks GSAP. Pick the native `Timeline` when zero external dependencies matter.

## How It Works (Pseudo-Code)

```
state:
  played = false
  prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches

on mount:
  loadGsap → gsapInstance
  if prefersReduced or no IntersectionObserver: played = true; bail
  observer = IntersectionObserver(threshold: 0.15)
  on first intersect: play(); observer.disconnect()

play():
  items   = .gt-item   nodes
  markers = .gt-marker nodes
  progress = .gt-progress (if showProgress)
  tl = gsap.timeline()
  tl.fromTo(items,    { y: 22, opacity: 0 },   { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out',  stagger: { each: 0.08 } }, 0)
  tl.fromTo(markers,  { scale: 0, rotation: -45 }, { scale: 1, rotation: 0, duration: 0.55, ease: 'back.out(1.6)', stagger: { each: 0.08 } }, 0.05)
  if showProgress:
    tl.fromTo(progress, { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: 'power2.inOut' }, 0)
```

## The Core Concept: Three Tweens, One Timeline

The visual character of GsapTimeline comes from three tweens running on the same timeline:

1. **Items**: `y: 22 → 0`, `opacity: 0 → 1`, ease `power3.out`, stagger 0.08s. The cards slide up + fade in.
2. **Markers**: `scale: 0 → 1`, `rotation: -45 → 0`, ease `back.out(1.6)`. The dots pop in with a slight overshoot — the `back.out(1.6)` overshoot is what gives them character vs. a flat scale-up.
3. **Progress line** (optional): `scaleY: 0 → 1`, ease `power2.inOut`, duration 0.9s. The connector line "draws itself" from top to bottom over the whole sequence.

Items and markers are both staggered; the marker stagger lags the item stagger by 0.05s so the dot lands just after its item card has settled. The progress line runs concurrently with item 0 and finishes around when the last marker lands — so the eye reads "the whole spine drew itself, then the events appeared on it" rather than three independent animations.

The trigger is an `IntersectionObserver` at `threshold: 0.15`, fired exactly once. If the user scrolls back past the timeline and forward again, it doesn't replay (intentional — re-triggering would feel busy in an editorial flow). To replay programmatically, key the `<GsapTimeline>` with `{#key replayKey}` and bump `replayKey`.

## State Flow Diagram

```
              ┌──────────────────────────────┐
              │  events prop                  │
              └────────────┬─────────────────┘
                           │
                           ▼
              ┌──────────────────────────────┐
              │  for each event: render       │
              │   .gt-item (left/right/alt)   │
              │   .gt-marker (icon/check/dot) │
              │   .gt-content (date/title/p)  │
              └────────────┬─────────────────┘
                           │
                           ▼
              ┌──────────────────────────────┐
              │  onMount → loadGsap          │
              │  IO observe rootEl @0.15     │
              └────────────┬─────────────────┘
                           │  on first intersect
                           ▼
              ┌──────────────────────────────┐
              │  play() (one-shot)           │
              │   gsap.timeline:              │
              │     items:   slide + fade   │
              │     markers: scale + rotate │
              │     progress: scaleY 0→1    │
              │   played = true; disconnect │
              └──────────────────────────────┘
```

## Props Reference

| Prop             | Type                                    | Default            | Description                                                          |
|------------------|-----------------------------------------|--------------------|----------------------------------------------------------------------|
| `events`         | `TimelineEvent[]`                       | required           | List of events in display order.                                     |
| `alignment`      | `'left' \| 'right' \| 'alternate'`      | `'alternate'`      | Item alignment relative to the centre line (vertical only).          |
| `showProgress`   | `boolean`                               | `false`            | Render the progress fill on the connector line based on completed events. |
| `dateFormat`     | `(d: Date) => string`                   | undefined          | Custom date formatter, otherwise `'D MMM YYYY'` via `toLocaleDateString`. |
| `onEventClick`   | `(event: TimelineEvent) => void`        | undefined          | Click + Enter/Space activates events when supplied.                   |
| `ariaLabel`      | `string`                                | `'GSAP timeline'`  | Wrapper aria-label.                                                  |
| `class`          | `string`                                | `''`               | Extra classes on the outer container.                                |

`TimelineEvent` shape: `{ id, date, title, description?, icon?, color?, completed?, href? }` — see `$lib/types`.

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `prefers-reduced-motion: reduce` | Neither gsap nor IO fire. The `.gsap-timeline--reduced` CSS rule pins items, markers, and progress fill to the assembled state. |
| Scroll back past the timeline and return | Doesn't replay — `played` is set to `true` after first run. Use `{#key replayKey}` for programmatic replay. |
| Mobile viewport (≤ 640px) | Layout collapses to single-column with the line on the left and items right-aligned. The marker positioning recalculates so it stays on the line. |
| `events` empty | Renders the centre line, no items, no animation. |
| `event.color` set | Inline `background` overrides `--gt-marker` for that marker. |
| `event.completed` true | Marker turns green and renders a `✓` glyph. |

## Distinct From Native `Timeline`

| Concern | `Timeline` (native) | `GsapTimeline` (this) |
|---------|--------------------|------------------------|
| Animation engine | anime.js | gsap.timeline |
| Trigger | IntersectionObserver | IntersectionObserver |
| Marker entrance | scale fade | scale + rotation with `back.out` overshoot |
| Progress fill | anime.js scaleY | gsap.fromTo scaleY |
| Bundle impact | anime.js (~17 KB) | gsap (already in project) |
| Use when | zero-external matters | design system already speaks GSAP |

Both share the same `TimelineEvent[]` prop interface so they're substitutable at the call site.

## Dependencies

- **Svelte 5.x** — `$state`, `$props`, `onMount`.
- **`gsap` core** (already a project dep) — drives the entrance timeline + marker overshoot + progress line draw. No GSAP business plugins.
- **`IntersectionObserver`** — native scroll trigger; universally supported.

## File Structure

```
src/lib/components/GsapTimeline.svelte    # implementation
src/lib/components/GsapTimeline.md        # this file
src/lib/components/GsapTimeline.test.ts   # vitest unit + behaviour tests
src/lib/types.ts                          # GsapTimelineProps (shares TimelineEvent)
```
