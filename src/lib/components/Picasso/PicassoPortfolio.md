# PicassoPortfolio — Technical Logic Explainer

## What Does It Do? (Plain English)

Each painting is a grid of coloured swatches drawn from a per-painting palette. As a painting scrolls into view, its swatches start scattered (rotated, semi-transparent, displaced along a Fibonacci-spaced ring) and reassemble into the canvas with a staggered ease. Title and caption fade up just behind the reassembly. The next painting waits for its own scroll moment.

Use it for editorial portfolio sections, art-directed about pages, or any "these are my works" feature where the kinetic dissect/reassemble earns its place over a static gallery.

## How It Works (Pseudo-Code)

```
state:
  panelRefs: HTMLElement[]            // one per painting
  triggered: Set<index>               // each painting fires once
  prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches

build per painting:
  cells = []
  for r in [0, gridSize):
    for c in [0, gridSize):
      cells.push({
        bg: palette[(r*gridSize + c) % palette.length],
        row: r, col: c
      })
  render cells as <span> children of .pp-grid

on mount:
  loadGsap → gsapInstance
  if prefersReduced or no IntersectionObserver: bail (CSS fallback paints assembled state)
  observer = IntersectionObserver(threshold: 0.4)
  for each panel: observer.observe(panel)
  on entry isIntersecting: animatePanel(idx)

animatePanel(index):
  if triggered.has(index): return
  triggered.add(index)

  swatches = panel.querySelectorAll('.pp-swatch')
  tl = gsap.timeline()
  tl.fromTo(swatches,
    {
      x: i => cos(i * 137.5°) * 110,        // Fibonacci-spaced angle
      y: i => sin(i * 137.5°) * 110,
      opacity: 0,
      scale: 0.4,
      rotation: i => i % 2 === 0 ? 18 : -18
    },
    {
      x: 0, y: 0,
      opacity: 1, scale: 1, rotation: 0,
      duration,                              // 1.4s default
      ease: 'power3.out',
      stagger: { each: 0.04, from: 'random' }
    }, 0)
  tl.fromTo(title,   { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }, 0.45)
  tl.fromTo(caption, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.50, ease: 'power3.out' }, 0.60)
```

## The Core Concept: Fibonacci-Spaced Dissect, Random Stagger Reassemble

Two design choices give the dissect/reassemble its character.

**The dissect uses the golden angle (137.5°) to space displacement vectors.** A naïve approach would scatter swatches in a uniform grid offset (`x = (col - mid) * 80`) — but that reads as a slide, not a dissection. By feeding each swatch index through `cos/sin(i * 137.5°)`, the displacement vectors form a Fibonacci-style sunflower pattern, which mimics how natural objects scatter (seeds, atoms, paint splatters) and reads as organic rather than mechanical.

```js
{
  x: (i: number) => Math.cos((i * 137.5 * Math.PI) / 180) * 110,
  y: (i: number) => Math.sin((i * 137.5 * Math.PI) / 180) * 110,
}
```

`110` is the radius — far enough that a 4×4 grid (16 swatches) actually feels scattered on a 320px painting, close enough that the reassemble doesn't feel like a teleport. Tune for grid size + canvas size.

**The reassemble uses `stagger: { each: 0.04, from: 'random' }`.** The `from: 'random'` is the key — without it, swatches arrive in DOM order (top-left first, bottom-right last) which reads as a scan, not a reassembly. With `from: 'random'`, gsap shuffles the order each invocation so swatches arrive in random order and the painting visibly *constructs itself* rather than wipes in.

Combined: scattered displacement + random-order arrival = the dissect/reassemble reads as art-directed motion, not as canned animation. Total dissect distance is roughly 110px × 1.5 = 165px peak excursion; reassemble takes 1.4s but the staggered `each: 0.04` × 16 swatches = 0.64s of stagger overlap, so the visible motion is ~2s.

## Per-Painting Trigger via IntersectionObserver, Not ScrollTrigger

The registry originally listed `ScrollTrigger + Flip` but those are GSAP business plugins. The component uses the equivalent native primitives:

- **`IntersectionObserver` for the trigger**: each panel observes itself, fires once at `intersectionRatio >= 0.4`, then is added to a `triggered` Set so it never re-fires. No scroll-event listeners, no measurement on every frame, no plugin needed.
- **`gsap.timeline` for the choreography**: timeline orchestrates the swatch reassemble + title fade + caption fade as a single composite tween, with the relative offsets controlling timing handoffs (`0.45s` before the title arrives, `0.60s` before the caption).

If the user has `prefers-reduced-motion: reduce`, neither the timeline nor the IntersectionObserver fires; the `.pp-panel--reduced .pp-swatch` CSS rule pins all swatches to the assembled state with `transform: none; opacity: 1`.

## State Flow Diagram

```
            ┌──────────────────────────────┐
            │  paintings prop               │
            └────────────┬─────────────────┘
                         │
                         ▼
            ┌──────────────────────────────┐
            │  for each painting:           │
            │   buildSwatches(palette,grid) │
            │   render figure + grid + meta│
            └────────────┬─────────────────┘
                         │
                         ▼
            ┌──────────────────────────────┐
            │  onMount → loadGsap          │
            │  IO observe each .pp-panel   │
            └────────────┬─────────────────┘
                         │
                         │  intersectionRatio >= 0.4
                         ▼
            ┌──────────────────────────────┐
            │  animatePanel(idx):           │
            │   if triggered.has(idx) bail │
            │   triggered.add(idx)         │
            │   gsap.timeline:              │
            │     fromTo swatches scatter  │
            │       → assembled (random   │
            │         order, 0.04 stagger) │
            │     fromTo title @0.45       │
            │     fromTo caption @0.60     │
            └──────────────────────────────┘
```

## Props Reference

| Prop          | Type                  | Default                | Description                                                              |
|---------------|-----------------------|------------------------|--------------------------------------------------------------------------|
| `paintings`   | `PicassoPainting[]`   | required               | Paintings in display order.                                              |
| `gridSize`    | `number`              | `4`                    | Side length of each painting's grid (gridSize × gridSize cells).         |
| `duration`    | `number`              | `1.4`                  | Reassemble timeline duration (seconds).                                  |
| `ariaLabel`   | `string`              | `'Picasso portfolio'`  | Wrapper aria-label.                                                      |
| `class`       | `string`              | `''`                   | Extra classes on the outer container.                                    |

`PicassoPainting` shape: `{ id, title, caption?, scene?, palette }` — `palette` is `string[]`, see `$lib/types`.

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `prefers-reduced-motion: reduce` | Neither gsap nor the IntersectionObserver fire. The `.pp-panel--reduced .pp-swatch` CSS rule pins swatches to the assembled state. Title + caption render statically. |
| Painting scrolled past before mount | Once mounted, the IO callback fires for any panel currently intersecting and animates it as if it just arrived. |
| Same panel scrolled past then back | Animates only the first time; the `triggered` Set prevents re-runs (intentional — re-triggering would feel busy). |
| `palette` shorter than `gridSize²` | Cells cycle through the palette in row-major order; first colour repeats. |
| `palette` longer than `gridSize²` | Excess colours unused. |
| `gridSize = 1` | Single swatch per painting — the dissect still applies (single swatch scatters and reassembles). |
| Empty `paintings` array | Wrapper renders without any panels; no observers attached. |

## Dependencies

- **Svelte 5.x** — `$state`, `$props`, `onMount`, action wiring.
- **`gsap` core** (already a project dep) — drives the dissect → reassemble timeline + title + caption fades. No GSAP business plugins (no ScrollTrigger / Flip / SplitText).
- **`IntersectionObserver`** — native scroll trigger; universally supported.

## File Structure

```
src/lib/components/Picasso/PicassoPortfolio.svelte    # implementation
src/lib/components/Picasso/PicassoPortfolio.md        # this file
src/lib/components/Picasso/PicassoPortfolio.test.ts   # vitest unit + behaviour tests
src/lib/types.ts                                      # PicassoPortfolioProps + PicassoPainting
```
