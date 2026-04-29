---
name: ScrollProgressBar
category: Layout & Navigation
author: tfeclaude
status: shipped
---

# ScrollProgressBar

Viewport-level reading-progress bar that fills 0→100% as the user scrolls through a document or named container.

## Purpose

Long-form content (blog posts, documentation, articles, marketing pages) benefits from a continuous "how far am I" signal. ScrollProgressBar provides that signal as a thin fixed strip at the top or bottom edge of the viewport — peripheral enough to ignore, present enough to glance at.

## Quick start

```svelte
<script lang="ts">
  import ScrollProgressBar from '$lib/components/ScrollProgressBar.svelte';
</script>

<!-- Default: 2px thin bar at top, indigo -->
<ScrollProgressBar />

<!-- Bold gradient flow at bottom edge -->
<ScrollProgressBar variant="gradient" position="bottom" color="#6366f1" />

<!-- Pulse glow tracking a named container -->
<ScrollProgressBar
  target="#article-body"
  variant="pulse"
  color="#ec4899"
  aria-label="Article reading progress"
/>
```

## Props

| Prop          | Type                                          | Default              | Description                                          |
|---------------|-----------------------------------------------|----------------------|------------------------------------------------------|
| `target`      | `'window' \| string`                          | `'window'`           | Scroll source — window or CSS selector               |
| `variant`     | `'thin' \| 'bold' \| 'gradient' \| 'pulse'`   | `'thin'`             | Visual style                                         |
| `position`    | `'top' \| 'bottom'`                           | `'top'`              | Viewport edge anchor                                 |
| `color`       | `string`                                      | `'#6366f1'`          | CSS colour — solid or gradient seed                  |
| `height`      | `number`                                      | `0` (auto)           | Bar height in px (clamped 1–20)                      |
| `aria-label`  | `string`                                      | `'Reading progress'` | Screen reader announcement                           |
| `class`       | `string`                                      | `''`                 | Additional wrapper classes                           |

## Variants

- **thin** (2px): default. Subtle, content-friendly.
- **bold** (6px): stronger signal for marketing pages or hero areas.
- **gradient**: animated multi-stop horizontal colour flow (8s loop). The `color` prop seeds the start and end of the gradient.
- **pulse**: solid bar with a soft pulsing glow at the leading edge (1.2s loop).

## Helper exports

The module-script exposes pure helpers for testing:

| Export                  | Purpose                                                    |
|-------------------------|------------------------------------------------------------|
| `VALID_VARIANTS`        | Read-only list of accepted variant names                   |
| `VALID_POSITIONS`       | Read-only list of accepted position names                  |
| `isValidVariant(v)`     | Type-guard for variant strings                             |
| `pickVariant(v)`        | Coerce to valid variant or fall back to `'thin'`           |
| `isValidPosition(p)`    | Type-guard for position strings                            |
| `pickPosition(p)`       | Coerce to valid position or fall back to `'top'`           |
| `clampHeight(h, fb)`    | Clamp height to 1–20px range; falls back if invalid        |
| `calculateProgress(...)`| Compute 0–100 from `scrollTop / scrollHeight / clientHeight` |
| `isReducedMotion()`     | Detect `prefers-reduced-motion: reduce` safely             |
| `supportsScrollTimeline()` | Feature-detect `animation-timeline: scroll()`           |

## Distinct from

- **ProgressBar / ProgressRing** — bound to discrete data (e.g. upload progress), not viewport scroll
- **Pagination** — discrete step navigation, not continuous scroll feedback
- **ScrollReveal** — element-level fade-in on intersection, not viewport-level progress
- **Stepper** — multi-step form indicator, not scroll-bound

## Accessibility

- `role="progressbar"` with `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100`
- Configurable `aria-label` (defaults to `'Reading progress'`)
- `aria-valuenow` is rounded to integer per rAF tick — no churn for screen readers
- `pointer-events: none` on wrapper — never intercepts clicks
- Triple-defence reduced-motion: JS probe in `onMount` + `.reduced` gate class + CSS `@media` fallback
- Under `prefers-reduced-motion: reduce`: gradient flow disabled, pulse glow disabled, fill transitions disabled

## Performance

- Single passive scroll listener with `requestAnimationFrame` throttling
- One CSS custom-property write per scroll tick
- No `ResizeObserver`, no `IntersectionObserver`, no `MutationObserver`
- Width transition (`80ms linear`) smooths jitter between rAF samples

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

## Browser support

Works in any browser supporting CSS custom properties + `requestAnimationFrame` (effectively all browsers since 2016). Modern browsers with `animation-timeline: scroll()` support could replace the JS path with pure CSS in a future enhancement; the current JS-driven path is universal and required anyway for `aria-valuenow` updates.
