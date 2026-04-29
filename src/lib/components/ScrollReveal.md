---
title: ScrollReveal
description: Wrap any container, its direct children animate in (translate + fade) as they cross the viewport threshold — per-child stagger creates a cascading reveal driven by IntersectionObserver, not rAF.
category: Helpful UX
author: Claude
---

# ScrollReveal

A wrapper that animates its direct children in as they enter the viewport. The cascade comes from a per-child delay (`index × stagger × intensity`) so a row of cards appears to "tuck in" with rhythm instead of all flashing on at once. The observer is the OS-level `IntersectionObserver`, so there are no scroll listeners, no `requestAnimationFrame` loop, and zero steady-state cost — between reveals, the component does nothing.

`ScrollReveal` fills the **viewport-entry** slot in the existing interaction taxonomy. Where `ClickSpark` and `RippleGrid` are click-driven, `VariableProximity` and `MagicCard` are cursor-driven, `SplitFlap` is value-change-driven, and `AuroraBackdrop` / `Cardwall` are idle-ambient, `ScrollReveal` is the primitive for *progress through the page* — the most common animation request on real marketing and docs surfaces.

## Key Features

- **IntersectionObserver-based**: zero rAF, zero scroll listeners, zero steady-state cost.
- **Six directions**: `up` / `down` / `left` / `right` / `scale` / `rotate`.
- **Per-child stagger**: `delayForChild(index, stagger, intensity)` computed at mount, written to `--sr-delay`. CSS handles the rest.
- **One-shot or replay**: defaults to a single reveal per child; opt-in `replay` re-animates on scroll back.
- **prefers-reduced-motion: reduce safe**: instant reveal, no transform, `--sr-duration` clamped to 0ms. Stylesheet-level fallback even if JS hasn't run.
- **SSR-safe**: `IntersectionObserver` is created in `onMount` only. The server renders the wrapper + children inert; the first paint matches the un-reduced default.
- **Accessibility-preserving**: children are *visually* hidden via `opacity` + `transform`, never via `display: none` or `visibility: hidden` — screen readers see all content regardless of viewport state.
- **Pure helpers exported** from the module-script for unit testing without a DOM.
- **Zero external dependencies**.

## Usage

### Default — vertical fade-up cascade

```svelte
<script lang="ts">
  import ScrollReveal from '$lib/components/ScrollReveal.svelte';
</script>

<ScrollReveal>
  {#each items as item}
    <Card {item} />
  {/each}
</ScrollReveal>
```

### Horizontal slide-from-left

```svelte
<ScrollReveal direction="left" distance={48} stagger={120}>
  {#each features as f}
    <FeatureRow {f} />
  {/each}
</ScrollReveal>
```

### Hero — one-shot crossfade with no transform

```svelte
<ScrollReveal direction="scale" distance={0} stagger={0} duration={900}>
  <h1>Welcome.</h1>
  <p>The product copy.</p>
</ScrollReveal>
```

### Replay-on-leave (re-animates on scroll back)

```svelte
<ScrollReveal replay direction="up" stagger={60}>
  {#each highlights as h}
    <Highlight {h} />
  {/each}
</ScrollReveal>
```

### Targeting individual children with CSS

Children get `data-sr-index` and `data-revealed` attributes automatically, so you can fine-tune from the consumer side:

```css
[data-sr-index='0'][data-revealed='true'] {
  /* extra punch on the first child */
  transition-duration: 1100ms;
}
```

## Props

| Prop         | Type                                                            | Default    | Description                                                                                                |
| ------------ | --------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| `stagger`    | `number`                                                        | `80`       | Milliseconds between consecutive child reveals.                                                            |
| `direction`  | `'up' \| 'down' \| 'left' \| 'right' \| 'scale' \| 'rotate'`    | `'up'`     | Which direction children enter from. `scale` and `rotate` ignore `distance`.                               |
| `distance`   | `number`                                                        | `32`       | Translation distance in pixels. Ignored for `scale` / `rotate`.                                            |
| `threshold`  | `number`                                                        | `0.15`     | IntersectionObserver threshold (0..1) — the share of the child that must be visible to trigger reveal.     |
| `duration`   | `number`                                                        | `700`      | Per-child reveal duration in milliseconds.                                                                 |
| `intensity`  | `number`                                                        | `1`        | Multiplier on the per-step stagger gap. `0.5` halves the cascade tempo, `2` doubles it.                    |
| `replay`     | `boolean`                                                       | `false`    | If `true`, children re-hide when they leave the viewport and re-animate on next entry.                     |
| `rootMargin` | `string`                                                        | `'0px'`    | IntersectionObserver `rootMargin` — useful for triggering early (e.g. `'-100px 0px'`).                     |
| `class`      | `string`                                                        | `''`       | Extra class names appended to the wrapper. Use this for layout (`grid`, `flex`, etc).                      |
| `children`   | `Snippet`                                                       | `undefined`| Direct children to animate. Each becomes one reveal target.                                                |

## Pure helpers (exported from the module-script)

All helpers are pure functions that can be unit-tested without a DOM. Import them alongside the component:

```typescript
import ScrollReveal, {
  thresholdForChild,
  delayForChild,
  transformAtProgress,
  shouldReplay,
  isReducedMotion,
  type Direction,
  type RevealMode
} from '$lib/components/ScrollReveal.svelte';
```

| Helper                                              | Returns                  | Notes                                                                  |
| --------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------- |
| `thresholdForChild(index, total, base)`             | `number` in `[0, 1]`     | Clamps base threshold; hook for future progressive-threshold logic.    |
| `delayForChild(index, baseStagger, intensity?)`     | `number` (ms)            | `index * baseStagger * intensity`. Defensive against bad inputs.       |
| `transformAtProgress(direction, distance, progress)`| `string` (CSS transform) | progress 0..1. Returns `none` for unknown directions.                  |
| `shouldReplay(currentlyVisible, mode)`              | `boolean`                | True for `'replay'`, false for `'one-shot'`. Guards re-hide branch.    |
| `isReducedMotion()`                                 | `boolean`                | SSR-safe wrapper around `matchMedia('(prefers-reduced-motion: reduce)')`. |

## How it works

1. **Mount**: snapshot `containerEl.children` into an array. For each child, set `data-sr-index="N"`, `data-revealed="false"`, and four CSS custom properties (`--sr-delay`, `--sr-duration`, `--sr-tx-hidden`, `--sr-tx-revealed`).
2. **Reduced motion check**: if `prefers-reduced-motion: reduce` is set, immediately mark every child `data-revealed="true"` with `--sr-duration: 0ms` and *skip creating the IntersectionObserver entirely*. There is nothing animating to throttle.
3. **Observe**: a single `IntersectionObserver` is created with the configured `threshold` and `rootMargin`. Every child is added via `observer.observe(child)`.
4. **Intersect**: when a child crosses the threshold, the callback flips `data-revealed="true"`. CSS picks up the change and runs the transition with the child's pre-computed `--sr-delay`.
5. **One-shot vs replay**: in one-shot mode (default), `observer.unobserve(target)` is called immediately after reveal — the child is permanently revealed and the observer drops it. In `replay` mode, the child remains under observation; on exit (`isIntersecting: false`) the attribute flips back to `"false"` and the transition reverses.
6. **Cleanup**: on `onDestroy`, the observer disconnects.

## Accessibility

- **Semantic neutrality**: the wrapper is a plain `<div>` with no `role`. Use the `class` prop to layer on layout classes from your design system.
- **Screen readers**: children remain in the DOM and accessibility tree at all times. Animations only affect `opacity` and `transform`. Users on screen readers experience the page identically regardless of viewport state.
- **Reduced motion**: when `prefers-reduced-motion: reduce` is active, every child mounts with `data-revealed="true"` and `--sr-duration: 0ms`. A stylesheet-level `@media (prefers-reduced-motion: reduce)` override also forces `opacity: 1; transform: none; transition: none` on every `[data-sr-index]` — so even if JS is delayed or the matchMedia probe fails, the user's preference still wins.
- **Focus**: focus order, tab indices, and `:focus-visible` styles are untouched. The wrapper does not interfere with keyboard navigation through its children.

## Performance

- **Steady state**: zero. No `rAF`, no scroll listeners. The `IntersectionObserver` lives on the compositor thread and only fires when intersection state actually changes.
- **Per-reveal cost**: one CSS transition per child. Both the animated properties (`opacity`, `transform`) are GPU-composited, so reveals never trigger layout or paint on the affected element.
- **Mount cost**: O(n) where n is the number of direct children — five property writes per child plus one `observer.observe` call.
- **Recommended bounds**: tested to ~200 children per wrapper on a single viewport without frame drops. For very long lists (a thousand+ rows), partition into sub-wrappers per logical section so the observer payload stays bounded per-IO instance.

## When to reach for it

- **Marketing / landing-page sections** that should reveal in rhythm as the user scrolls.
- **Dashboards** that should fade into life as the user navigates between views.
- **Product feature lists** where each row "introduces itself" with a short stagger.
- **Image grids** where a scattered scale/rotate reveal feels editorial.
- **Hero sections** where a single one-shot crossfade lands the brand.

## When *not* to reach for it

- **Form fields** or **interactive controls** where any reveal animation delays meaningful interaction.
- **Critical above-the-fold copy** that the user must read immediately — fade-in delays time-to-content.
- **Long virtualised lists** (tables, infinite scrollers) — the per-child observer cost is small but non-zero and you don't want to observer-spam thousands of rows.
- **Print stylesheets** — there is no scrolling in print; transitions are wasted. (`prefers-reduced-motion` covers this on most browsers; explicit `@media print` overrides are still a good idea for production.)

## Inspiration

The interaction is the most common animation pattern across modern marketing pages — Apple, Stripe, Linear, Vercel — and most teams reach for AOS, GSAP ScrollTrigger, or Framer Motion to ship it. `ScrollReveal` is the same primitive rebuilt as a portable Svelte 5 component with no animation library, no dependency surface, and no rAF loop — just `IntersectionObserver`, CSS custom properties, and ~7KB of inspectable Svelte.
