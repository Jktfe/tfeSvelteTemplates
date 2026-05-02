# ScrollReveal — Technical Logic Explainer

## What Does It Do? (Plain English)

ScrollReveal wraps any container and animates its direct children into view as they cross into the viewport. The first child fires immediately, each subsequent child is delayed by a configurable stagger so the row "tucks in" with rhythm rather than flashing on all at once. It is the most common animation request on real marketing pages — the kind of cascade Apple, Stripe, Linear, and Vercel ship by default — rebuilt as a portable Svelte 5 component with no animation library, no scroll listener, and no `requestAnimationFrame` loop.

The reveal is driven by `IntersectionObserver`, the browser's compositor-side primitive for "did this element enter the viewport". Once a child has revealed, the observer stops watching it (one-shot mode), so steady-state cost is literally zero — the component does nothing between reveals. Reduced-motion users see all content instantly, in-place; screen readers see all content at all times because we animate via opacity and transform only, never `display: none`.

## How It Works (Pseudo-Code)

```
state:
  containerEl    // bound DOM div
  observer       // IntersectionObserver, created on mount

on mount:
  reduced = isReducedMotion()
  mode    = replay ? 'replay' : 'one-shot'
  childEls = Array.from(containerEl.children)

  for each child at index i:
    set data-sr-index = i
    set data-revealed = reduced ? 'true' : 'false'
    set --sr-delay        = delayForChild(i, stagger, intensity) ms
    set --sr-duration     = reduced ? 0 : duration ms
    set --sr-tx-hidden    = transformAtProgress(direction, distance, 0)
    set --sr-tx-revealed  = transformAtProgress(direction, distance, 1)

  if reduced:
    return (no observer; everything visible immediately)

  observer = new IntersectionObserver((entries) ⇒ {
    for entry in entries:
      target = entry.target
      if entry.isIntersecting:
        target.dataset.revealed = 'true'
        if mode === 'one-shot':
          observer.unobserve(target)
      else if mode === 'replay':
        target.dataset.revealed = 'false'
  }, { threshold, rootMargin })

  for each child: observer.observe(child)

  return () => observer.disconnect()

CSS:
  [data-sr-index] {
    opacity: 0;
    transform: var(--sr-tx-hidden);
    transition: opacity var(--sr-duration) cubic-bezier(.22,.61,.36,1) var(--sr-delay),
                transform var(--sr-duration) cubic-bezier(.22,.61,.36,1) var(--sr-delay);
  }
  [data-sr-index][data-revealed='true'] {
    opacity: 1;
    transform: var(--sr-tx-revealed);
  }
```

The component does its work once on mount (stamp children with attributes and CSS variables), creates one observer, and then sleeps until intersection state changes. The observer disconnects on destroy.

## The Core Concept: Per-Child Delay Plus Variable-Driven Transforms

Two ideas conspire to give cheap, well-cadenced cascades.

**1. Per-index delay** is computed once at mount and written into a CSS variable on each child:

```
delayForChild(index, stagger, intensity) = index * stagger * intensity
```

So with `stagger = 80` and `intensity = 1`, child 0 has 0 ms delay, child 1 has 80 ms, child 2 has 160 ms, and so on. The CSS `transition-delay` reads from `var(--sr-delay)` — when the `data-revealed` attribute flips, the transition fires, but each child's transition starts at its own pre-computed offset. The cascade is implicit in the CSS engine's transition scheduling; no JS loop is involved.

**2. Direction is encoded as a transform** rather than baked into a keyframe. `transformAtProgress(direction, distance, progress)` returns a single CSS transform string for `progress = 0` (hidden) and `progress = 1` (revealed), and CSS interpolates between them.

```
direction='up'    → translate3d(0, distance px, 0)  →  translate3d(0, 0, 0)
direction='left'  → translate3d(distance px, 0, 0)  →  translate3d(0, 0, 0)
direction='scale' → scale(0.95)                     →  scale(1)
direction='rotate'→ rotate(5deg)                    →  rotate(0deg)
```

The function is exported from the module-script so the maths can be unit-tested without a DOM, and so consumers driving their own scroll-progress logic can call it with a continuous progress value.

```
                  reveal cascade (stagger = 100ms)
   t=0   ┌──────┐
         │card 0│ ← starts revealing immediately
         └──────┘
   t=100        ┌──────┐
                │card 1│ ← starts 100ms later
                └──────┘
   t=200               ┌──────┐
                       │card 2│ ← 200ms later
                       └──────┘
   t=300                      ┌──────┐
                              │card 3│
                              └──────┘
```

## CSS Animation Strategy

Two `:global()` selectors and one `@media` block carry the entire visual implementation:

```css
.scroll-reveal :global([data-sr-index]) {
  opacity: 0;
  transform: var(--sr-tx-hidden, none);
  transition:
    opacity   var(--sr-duration, 700ms) cubic-bezier(0.22, 0.61, 0.36, 1) var(--sr-delay, 0ms),
    transform var(--sr-duration, 700ms) cubic-bezier(0.22, 0.61, 0.36, 1) var(--sr-delay, 0ms);
  will-change: opacity, transform;
}

.scroll-reveal :global([data-sr-index][data-revealed='true']) {
  opacity: 1;
  transform: var(--sr-tx-revealed, none);
}

@media (prefers-reduced-motion: reduce) {
  .scroll-reveal :global([data-sr-index]) {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

`:global()` is needed because Svelte's CSS scoping would otherwise prefix `[data-sr-index]` with a hash that the children — rendered through the snippet — don't carry. The selectors are still bounded by the parent `.scroll-reveal` class, so the rules can't leak across the page.

The `cubic-bezier(0.22, 0.61, 0.36, 1)` is a soft "ease-out-quint"-flavoured curve — fast at the start, slow at the end. Reveals feel light because the bulk of the visual change happens early in the transition, then it gracefully settles. Linear easing on a cascade looks wooden by comparison.

The reduced-motion `@media` block is a stylesheet-level safety net: even if the JS path was skipped (SSR-only delivery, matchMedia exception), the user's preference still wins. `transition: none` is explicit so we don't accidentally animate `opacity: 0 → 1` instantly with a 0-duration transition (which some browsers handle inconsistently).

## Performance

- **Mount cost**: O(n) where n is the number of direct children. Five property writes per child plus one `observer.observe(child)` call.
- **Steady state**: zero. No `requestAnimationFrame`, no scroll listener. The `IntersectionObserver` lives on the compositor thread and only fires when intersection state actually changes.
- **Per reveal cost**: one CSS transition per child. The transitioned properties (`opacity`, `transform`) are GPU-composited — the browser does not trigger layout or paint on the affected element.
- **Recommended bounds**: tested to ~200 children per wrapper without frame drops. For very long lists, partition into sub-wrappers per logical section so each observer's callback payload stays bounded.

## State Flow Diagram

```
                  ┌────────────────────────┐
                  │  on mount              │
                  │  stamp data-sr-index   │
                  │  set CSS variables     │
                  └──────────┬─────────────┘
                             │
                if reduced motion → skip observer
                             │
                             ▼
                  ┌────────────────────────┐
                  │  ALL HIDDEN            │
                  │  data-revealed=false   │
                  └──────────┬─────────────┘
                             │ child crosses threshold
                             ▼
                  ┌────────────────────────┐
                  │  REVEALING child i     │ ← CSS transition fires
                  │  data-revealed=true    │   with index*stagger delay
                  └──────────┬─────────────┘
                             │
              one-shot mode  │  replay mode
                             │
                             ▼
                  ┌────────────────────────┐
                  │  REVEALED              │
                  │  observer.unobserve(c) │  (one-shot only)
                  └────────────────────────┘
                             │ child leaves viewport
                             ▼ (replay only)
                  ┌────────────────────────┐
                  │  HIDDEN AGAIN          │
                  │  data-revealed=false   │
                  └────────────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stagger` | `number` | `80` | Milliseconds between consecutive child reveals. |
| `direction` | `'up' \| 'down' \| 'left' \| 'right' \| 'scale' \| 'rotate'` | `'up'` | Which way children enter from. `scale` and `rotate` ignore `distance`. |
| `distance` | `number` | `32` | Translation distance in pixels. Ignored for scale/rotate. |
| `threshold` | `number` | `0.15` | IntersectionObserver threshold (0..1). Share of the child that must be visible to trigger reveal. |
| `duration` | `number` | `700` | Per-child reveal duration in ms. |
| `intensity` | `number` | `1` | Multiplier on the per-step stagger. `0.5` halves the cascade tempo, `2` doubles it. |
| `replay` | `boolean` | `false` | If true, children re-hide on viewport exit and re-animate on next entry. |
| `rootMargin` | `string` | `'0px'` | IntersectionObserver `rootMargin`. `-100px 0px` triggers earlier. |
| `class` | `string` | `''` | Extra classes on the wrapper. Use this for layout (`grid`, `flex`). |
| `children` | `Snippet` | — | Direct children to animate. Each becomes one reveal target. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `prefers-reduced-motion: reduce` | All children mount with `data-revealed='true'` and `--sr-duration: 0ms`. Observer is never created. The `@media` rule is the stylesheet-level safety net. |
| SSR delivery, no JS hydration | Server-rendered children carry no data attributes. They render visible in their natural position via the `@media` reduced-motion rule (which clamps opacity to 1) — graceful fallback. |
| Children added after mount | The observer was set up against children present at mount. New children are not observed automatically. Re-key the wrapper or call your own observer if dynamic children are required. |
| Duplicate `:global()` selector hits | The `data-sr-index` attribute is enough to disambiguate. The parent `.scroll-reveal` class prevents the rule from leaking to other ScrollReveal-less elements that happen to share the attribute. |
| Long list, observer entry storm on first paint | IntersectionObserver batches entries; the callback handles them in one pass. No throttle is required. |
| `threshold = 0` with tall children | Reveal fires the moment any pixel enters. Combined with `rootMargin: '-200px'`, this gives an "anticipate the scroll" feel. |
| `replay = true` and rapid scroll | Children flip `data-revealed` between `true` and `false` on each crossing. The transition reverses smoothly because both directions are CSS interpolations. |
| Print stylesheets | `prefers-reduced-motion` handles most cases. For belt-and-braces, layer your own `@media print { [data-sr-index] { opacity: 1; transform: none; } }`. |

## Dependencies

- **Svelte 5** — `$props`, `Snippet`, `onMount`. Module-scope helpers (`thresholdForChild`, `delayForChild`, `transformAtProgress`, `shouldReplay`, `isReducedMotion`) exported for unit tests.
- **`IntersectionObserver`** — broadly supported (Safari 12.1+, Chrome 51+, Firefox 55+). No polyfill ships with the component.
- **Zero external libraries** — no AOS, no GSAP ScrollTrigger, no Framer Motion.

## File Structure

```
src/lib/components/ScrollReveal.svelte        # implementation
src/lib/components/ScrollReveal.md            # this explainer
src/lib/components/ScrollReveal.test.ts       # unit tests covering exported helpers
src/routes/scrollreveal/+page.svelte          # demo page
```
