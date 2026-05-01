# ScrollProgressBar — Technical Logic Explainer

## What Does It Do? (Plain English)

ScrollProgressBar is a thin fixed strip at the top or bottom edge of the viewport that fills 0→100% as the reader scrolls through a document or named container. It answers a single question — *how far through this am I?* — and gets out of the way the rest of the time.

Think of it as the page's progress meter. Long-form content (blog posts, documentation, articles, marketing pages) benefits from a continuous "how far am I" signal that sits in your peripheral vision: present enough to glance at, subtle enough to ignore. It's the lighter half of a two-part reading toolkit, the partner to `ReadingTOC` (which adds *where* — section awareness — on top of *how much*).

The component ships with four visual variants tuned for different tones:

- **thin** (2px): default. Subtle, content-friendly.
- **bold** (6px): stronger signal for marketing pages or hero areas.
- **gradient**: animated multi-stop horizontal colour flow (8s loop). The `color` prop seeds the start and end of the gradient.
- **pulse**: solid bar with a soft pulsing glow at the leading edge (1.2s loop).

It tracks `window` by default, or any scrollable element via a CSS selector — useful for embedding inside an `overflow: auto` panel where the page itself doesn't scroll.

## How It Works (Pseudo-Code)

```
state:
  progress     = 0                 // 0..100
  reduced      = false             // prefers-reduced-motion gate
  rafId        = 0                 // current rAF handle, 0 = idle
  scrollTarget = null              // window or HTMLElement

derived:
  resolvedVariant   = pickVariant(variant)
  resolvedPosition  = pickPosition(position)
  defaultHeight     = thin → 2, bold → 6, others → 4
  resolvedHeight    = clampHeight(height || defaultHeight, defaultHeight)

on mount:
  reduced = isReducedMotion()
  scrollTarget = (target === 'window') ? window : document.querySelector(target)
  if not scrollTarget: bail
  scrollTarget.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleScroll, { passive: true })
  tick()                           // initial calculation

on scroll / resize → handleScroll():
  if rafId is set: ignore (already queued)
  rafId = requestAnimationFrame(tick)

tick():
  rafId = 0
  m = readScroll()                 // { scrollTop, scrollHeight, clientHeight }
  progress = calculateProgress(m.scrollTop, m.scrollHeight, m.clientHeight)

calculateProgress(top, total, visible):
  scrollable = total - visible
  if scrollable <= 0: return 0     // page doesn't scroll
  pct = (top / scrollable) * 100
  clamp pct to [0, 100]

render:
  <div role="progressbar"
       aria-valuenow={Math.round(progress)}
       style:--spb-progress="{progress}%"
       style:--spb-height="{resolvedHeight}px"
       style:--spb-color={color}>
    <div class="fill" />
  </div>

on destroy:
  cancelAnimationFrame(rafId)
  remove scroll + resize listeners
```

The "trick" here is that scrolling is *the* hottest input in a browser, and naïvely updating state on every `scroll` event will queue thousands of renders per second. ScrollProgressBar coalesces every burst of scroll events into a single `requestAnimationFrame`-aligned read: the first `scroll` queues a tick, subsequent scrolls in the same frame are ignored (because `rafId` is non-zero), and `tick` clears the flag so the next frame can queue again. One read per frame, regardless of how furiously the user spins their wheel.

## Helper Exports

The module-script exposes pure helpers for testing and downstream use. Every one of these is a plain function with no Svelte runtime dependency.

| Export | Purpose |
|--------|---------|
| `VALID_VARIANTS` | Read-only list of accepted variant names |
| `VALID_POSITIONS` | Read-only list of accepted position names |
| `isValidVariant(v)` | Type-guard for variant strings |
| `pickVariant(v)` | Coerce to valid variant or fall back to `'thin'` |
| `isValidPosition(p)` | Type-guard for position strings |
| `pickPosition(p)` | Coerce to valid position or fall back to `'top'` |
| `clampHeight(h, fb)` | Clamp height to 1–20px range; falls back if invalid |
| `calculateProgress(top, total, visible)` | Compute 0–100 from `scrollTop / scrollHeight / clientHeight` |
| `isReducedMotion()` | Detect `prefers-reduced-motion: reduce` safely |
| `supportsScrollTimeline()` | Feature-detect `animation-timeline: scroll()` |

`calculateProgress` is the only piece of "logic" worth highlighting. It hardens against the three things that can go wrong with raw scroll measurements:

1. `scrollHeight` ≤ `clientHeight` (the document doesn't scroll) — return `0` rather than divide by zero or negative.
2. `scrollTop` overshooting `scrollable` on bounce-scroll (Safari elasticity, mobile rubber-banding) — clamp to `100`.
3. Negative `scrollTop` from over-scroll at the top — clamp to `0`.

The `supportsScrollTimeline()` probe is forward-looking: a future revision could swap the JS path for a pure CSS `animation-timeline: scroll()` rule on browsers that support it. Today the JS path is universal and remains required anyway, because `aria-valuenow` updates aren't expressible in pure CSS.

## Performance

- One `requestAnimationFrame`-throttled, **passive** scroll listener — never blocks the scroll thread.
- One CSS custom-property write per scroll tick (`--spb-progress`). The actual width is animated by the GPU compositor via the `width` transition.
- Width transition (`80ms linear`) smooths jitter between rAF samples. Long enough to mask sub-frame jumps; short enough that the bar visibly *follows* the cursor rather than chasing it.
- No `ResizeObserver`, no `IntersectionObserver`, no `MutationObserver`, no setInterval. The component is fully event-driven and idle when the user isn't scrolling.
- The `aria-valuenow` value is rounded to an integer per tick, so screen readers don't churn through 99.4 → 99.6 → 99.8 → 100.

The `resize` listener is the often-missed detail: when the window is resized, `scrollHeight - clientHeight` changes, which means a previously-100% progress bar might now be at 80% (or vice versa). Listening to `resize` keeps the bar honest.

## Distinct From ReadingTOC

These two components live next to each other and are deliberately complementary:

- **ScrollProgressBar** is *passive*. It tells you you're 47% of the way through. It doesn't know what 47% means; it doesn't know about sections; it can't take you anywhere.
- **ReadingTOC** is *active*. It knows which section you're in, lets you jump elsewhere, and rebuilds itself if the heading list changes.

Other things that are *not* ScrollProgressBar:

- **ProgressBar / ProgressRing** — bound to discrete data (e.g. upload progress), not viewport scroll.
- **Pagination** — discrete step navigation, not continuous scroll feedback.
- **ScrollReveal** — element-level fade-in on intersection, not viewport-level progress.
- **Stepper** — multi-step form indicator, not scroll-bound.

## Browser Support

Works in any browser supporting CSS custom properties + `requestAnimationFrame` — effectively everything since 2016. There's no conditional code path; it's the same JS everywhere.

A future enhancement could replace the JS path with `animation-timeline: scroll()` (the CSS Scroll-Driven Animations spec) on browsers that support it, gated by the `supportsScrollTimeline()` probe. That's a possibility, not a present feature: as of writing, Chrome and Edge ship it but Safari and Firefox don't, and the JS path is still required for `aria-valuenow` updates. The current implementation is the universal one.

## Recipes

### Track a specific container

```svelte
<div id="article-body" style="height: 600px; overflow: auto;">
  <!-- long content -->
</div>

<ScrollProgressBar target="#article-body" variant="bold" />
```

### Custom height + colour

```svelte
<ScrollProgressBar variant="thin" color="#10b981" height={3} />
```

### Bottom edge anchor

```svelte
<ScrollProgressBar position="bottom" variant="gradient" />
```

### Pair with ReadingTOC

```svelte
<ScrollProgressBar variant="thin" color="#6366f1" />

<div class="page-grid">
  <ReadingTOC variant="rail" position="right" />
  <main>
    <article>...</article>
  </main>
</div>
```

## State Flow Diagram

```
                ┌──────────────────────┐
                │  mount               │
                │  progress = 0        │
                │  reduced = probe()   │
                └──────────┬───────────┘
                           │ resolve scrollTarget
                           │ attach listeners (passive)
                           │ tick()  ← initial read
                           ▼
                ┌──────────────────────┐
                │  idle                │
                │  rafId = 0           │
                └──────────┬───────────┘
                           │
              scroll  ─────┤───── resize
                           │
                           ▼
                ┌──────────────────────┐
                │  handleScroll()      │
                │  rafId set?  ──yes─► drop event
                └──────────┬───────────┘ (coalesce)
                           │ no → rAF(tick)
                           ▼
                ┌──────────────────────┐
                │  tick() (next frame) │
                │  rafId = 0           │
                │  read scrollTop /    │
                │       scrollHeight / │
                │       clientHeight   │
                │  progress =          │
                │   calculateProgress()│
                └──────────┬───────────┘
                           │ writes --spb-progress
                           │ writes aria-valuenow
                           ▼
                  back to idle ↺

  unmount → cancelAnimationFrame(rafId) + remove listeners
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `target` | `'window' \| string` | `'window'` | Scroll source — window or CSS selector for a scrollable element. |
| `variant` | `'thin' \| 'bold' \| 'gradient' \| 'pulse'` | `'thin'` | Visual style. |
| `position` | `'top' \| 'bottom'` | `'top'` | Viewport edge anchor. |
| `color` | `string` | `'#6366f1'` | CSS colour — solid bar fill, or seed/anchor for the gradient variant. |
| `height` | `number` | `0` (auto) | Bar height in px (clamped 1–20). `0` picks a sensible default per variant. |
| `aria-label` | `string` | `'Reading progress'` | Screen-reader announcement. |
| `class` | `string` | `''` | Additional wrapper classes. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `target` selector matches nothing | `scrollTarget` is `null`, `onMount` bails before attaching listeners. The bar renders at 0% and stays there — no errors. |
| Document is shorter than the viewport (nothing to scroll) | `scrollable = scrollHeight - clientHeight ≤ 0`, `calculateProgress` returns `0`. |
| User over-scrolls (rubber-band on iOS, elasticity on Safari) | Negative `scrollTop` clamped to `0`; `pct > 100` clamped to `100`. `aria-valuenow` never reports outside `0..100`. |
| Window resized while scrolled to bottom | `resize` listener triggers a tick; if the new `scrollHeight - clientHeight` is smaller, progress recalculates — it doesn't get stuck at the old 100%. |
| `prefers-reduced-motion: reduce` | Triple-defence: JS probe + `.reduced` gate class + CSS `@media`. Width transition, gradient flow, and pulse glow are all disabled; the bar updates instantly per scroll tick. |
| Two ScrollProgressBars on the same page | Both work independently — each owns its own listener, rAF handle, and CSS custom properties via scoped styles. |
| `height={0}` (default) | Resolved to per-variant default: thin → 2, bold → 6, gradient/pulse → 4. |
| `height={50}` | Clamped to `20` by `clampHeight`. The bar is a peripheral signal, not a banner. |

## Dependencies

- **Svelte 5.x** — runes (`$state`, `$derived`) for the reactive `progress` value and the resolved variant/position/height triple.
- Zero external dependencies — pure scoped CSS, native `requestAnimationFrame`, no motion library.

## File Structure

```
src/lib/components/ScrollProgressBar.svelte    # implementation (with module-script helpers)
src/lib/components/ScrollProgressBar.md        # this file (rendered inside ComponentPageShell)
src/lib/components/ScrollProgressBar.test.ts   # vitest unit tests for the helpers
src/routes/scrollprogressbar/+page.svelte      # demo page
```
