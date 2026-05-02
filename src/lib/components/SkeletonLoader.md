# SkeletonLoader — Technical Logic Explainer

## What Does It Do? (Plain English)

SkeletonLoader is a small, soft-grey shape that pre-figures the layout of content while it's loading. Compose lots of them — a circle for an avatar, a few text lines for a name and bio, a wide rectangle for a hero image — and you get a "ghost" of the real card or row. The layout stays put when the real data arrives, so the page doesn't jump, and the user *senses* that progress is happening even though there's nothing to read yet.

Think of it as a tracing-paper outline of where the real content is going to land.

## How It Works (Pseudo-Code)

```
props:
  shape     = 'text' | 'circle' | 'rect'                // default 'text'
  width     = CSS length string                          // default '100%'
  height    = CSS length string                          // optional
  radius    = CSS length string                          // optional
  animation = 'pulse' | 'shimmer' | 'none'              // default 'pulse'

derive resolvedHeight:
  if height passed: use it
  else if shape == 'text':   '0.875rem'                 // single line
  else if shape == 'circle': '2.5rem'                   // avatar
  else (rect):               '8rem'                     // card body

derive resolvedWidth:
  if shape == 'circle' and no width: use resolvedHeight  // make it round
  else: width

derive resolvedRadius:
  if radius passed: use it
  else if shape == 'circle': '50%'
  else if shape == 'text':   '4px'
  else (rect):               '8px'

render <span aria-hidden
            style="width / height / border-radius"
            class="skeleton-{shape} skeleton-{animation}">
</span>
```

The component is a single `<span>` with three CSS variables driving its size and one of three animation classes driving its motion. There's no JS animation loop.

## The Core Concept: Three Shapes Compose Into Anything

Rather than ship a `<SkeletonCard>`, `<SkeletonRow>`, `<SkeletonAvatar>` family, SkeletonLoader gives you three shape primitives — `text`, `circle`, `rect` — and trusts you to compose them into whatever ghost layout you need:

```
A user card placeholder:

  ┌─────────────────────────────────────────┐
  │  [○]   ━━━━━━━━━━━━━━━━━              │  ← circle avatar + name text
  │        ━━━━━━━━━━━                     │  ← role text (shorter)
  │                                         │
  │  ┌───────────────────────────────────┐ │
  │  │                                   │ │  ← rect for card body
  │  │                                   │ │
  │  └───────────────────────────────────┘ │
  └─────────────────────────────────────────┘
```

```svelte
<div class="card" aria-busy="true">
  <div class="header">
    <SkeletonLoader shape="circle" width="48px" height="48px" />
    <div>
      <SkeletonLoader width="60%" />
      <SkeletonLoader width="40%" />
    </div>
  </div>
  <SkeletonLoader shape="rect" height="160px" />
</div>
```

The shapes are deliberately neutral and the defaults sensible (`text` is exactly one line tall, `circle` is avatar-sized, `rect` is roughly an image). You'll often pass `width` to tune the line lengths so the ghost feels like the real content rather than a uniform grid.

## CSS Animation Strategy

SkeletonLoader ships two animations — pulse and shimmer — and an explicit `none` to opt out.

**Pulse** is a gentle opacity fade between 1 and 0.55:

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}
```

Cheap, GPU-accelerated, and reads as "alive" without being attention-stealing. It's the default because it works on any shape, in any colour scheme, at any size.

**Shimmer** is a sweeping highlight using a pseudo-element with a moving gradient:

```css
.skeleton-shimmer::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0.65) 50%,
    rgba(255,255,255,0) 100%);
  transform: translateX(-100%);
  animation: skeleton-shimmer 1.6s linear infinite;
}
@keyframes skeleton-shimmer {
  100% { transform: translateX(100%); }
}
```

The white-rgba gradient slides across using `transform`, which doesn't trigger layout. The `overflow: hidden` on the parent clips the highlight to the rounded shape, so a circular skeleton shimmers in a circle, not a square.

**`none`** disables animation outright. Useful for static placeholder screens or for designers who want to opt out at scale.

`prefers-reduced-motion: reduce` removes both the pulse keyframes and the shimmer animation — a static grey shape still does the layout-reservation job without motion. The reservation is what matters; the animation is a bonus signal.

## Performance

A skeleton is the cheapest piece of UI in the library: a single span with one repeating CSS animation. Hundreds of them on a page is fine. The shimmer variant is slightly more expensive than pulse because it adds a pseudo-element with a gradient repaint, but still well under the budget for a typical loading screen.

The component is designed to live for a couple of hundred milliseconds. If you find yourself showing skeletons for many seconds at a time, the bottleneck is your data, not the skeleton — switch to a Spinner with a status message past about three seconds.

## Accessibility Notes

The component is **decorative** — it sets `aria-hidden="true"` on the rendered span. Screen readers don't announce it, which is correct: a row of skeletons should not be announced as a row of empty things, it should be announced as "loading".

You convey loading state on the *parent region*:

```svelte
<section aria-busy={loading} aria-live="polite">
  {#if loading}
    <SkeletonLoader shape="rect" height="120px" />
    <span class="sr-only">Loading orders…</span>
  {:else}
    <OrderList {orders} />
  {/if}
</section>
```

`aria-busy` plus a visually-hidden status sentence is the canonical pattern.

## Distinct From Spinner

Both indicate "we're working on it" but at different scales:

- **Skeleton** holds *layout space* and matches the *shape* of the content that's coming. Best when you have a known structure to load (a list, a card, a dashboard widget).
- **Spinner** is a single small indicator that says "still thinking" without claiming any space. Best when the surrounding layout is fixed and you just need a "wait" hint inside a button or next to a row.

If the loaded content will significantly change the layout, prefer skeletons — they prevent layout shift. If the content fits in a known box that's already drawn, prefer a spinner.

## State Flow Diagram

```
   Parent: loading = true              Parent: loading = false
          │                                       │
          ▼                                       ▼
   ┌─────────────────┐                   ┌─────────────────┐
   │  SkeletonLoader │                   │  Real content   │
   │  rendered       │  ──── replace ──▶ │  rendered in    │
   │                 │                   │  the same slot  │
   └─────────────────┘                   └─────────────────┘

   Inside the skeleton:
       ┌─────────────────┐
       │  pulse / shimmer │  CSS keyframes loop infinitely
       │  animation runs  │  (until removed)
       └─────────────────┘

   If prefers-reduced-motion: animation is removed; static grey
   shape still holds the layout space.
```

The skeleton itself has no internal state. It runs its animation forever and gets unmounted when the parent flips `loading` to false.

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `shape` | `'text' \| 'circle' \| 'rect'` | `'text'` | Geometry primitive — drives the default height and border-radius. |
| `width` | `string` | `'100%'` | CSS width. Any unit. Defaults to height for `circle` so it stays round. |
| `height` | `string` | shape-dependent | CSS height. Defaults: `0.875rem` for text, `2.5rem` for circle, `8rem` for rect. |
| `radius` | `string` | shape-dependent | Border-radius override. Defaults: `50%` (circle), `4px` (text), `8px` (rect). |
| `animation` | `'pulse' \| 'shimmer' \| 'none'` | `'pulse'` | Loading animation style. `none` is fully static. |
| `class` | `string` | `''` | Extra classes appended to the span. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `shape="circle"` with only `height` passed | Width defaults to the height so the shape stays round. Pass an explicit width to make it elliptical. |
| `width="100%"` inside an inline parent with no explicit width | The skeleton stretches to whatever the inline parent allows — usually 0. Wrap in a block-level container with width. |
| User has `prefers-reduced-motion: reduce` | Both pulse and shimmer animations are removed. The static grey shape still holds the layout space — that's the primary job. |
| Many skeletons (e.g. 500 in a list) | Performance is fine; CSS keyframes are GPU-accelerated and don't run JS. If you see jank, profile the parent's render pipeline, not the skeletons. |
| Loading takes longer than ~3 seconds | The user starts to wonder. Switch to a Spinner with a status message, or show progressive content (real items as they arrive instead of one big swap). |
| Custom `radius` that's larger than half the dimensions | Renders the skeleton as a fully-rounded pill / circle — looks fine, but you could just pass `shape="circle"` instead. |
| Skeleton is rendered at SSR | No problem — the entire component is markup + CSS, no runtime JavaScript needed. |

## Dependencies

- **Svelte 5.x** — `$props`, `$derived`. Single-file component.
- Zero external runtime dependencies. Pulse and shimmer are pure CSS keyframes.

## File Structure

```
src/lib/components/SkeletonLoader.svelte         # component implementation
src/lib/components/SkeletonLoader.md             # this file (rendered inside ComponentPageShell)
src/lib/components/SkeletonLoader.test.ts        # vitest unit tests
src/routes/skeletonloader/+page.svelte           # demo page
```
