---
title: Tilt3D
description: Wrap any element. On hover the wrapped content tilts in 3D toward the cursor — Stripe / Linear / Apple product-page card depth — with an optional glare-sweep that follows the pointer. Pure CSS perspective + transform, minimal JS for the cursor-pos→rotation math.
category: Helpful UX
author: Claude
---

# Tilt3D

A wrapper that gives its child a steady-state 3D tilt response to the cursor. The element rotates along its own X / Y axes based on cursor position relative to its centre, with a radial-gradient glare highlight that tracks the pointer to sell the depth. On pointer-leave it spring-eases back to flat (or snaps, or stays — your pick).

`Tilt3D` fills the **cursor-driven 3D-rotation** slot in the existing taxonomy. Where `MagicCard` adds a 2D spotlight overlay, `MagneticButton` translates the element 2D toward the cursor, and `VariableProximity` modulates font weight, `Tilt3D` rotates the whole element in 3D space without changing its position. It composes cleanly with all of them — wrapping a `MagicCard` in `Tilt3D` gives you the spotlight *and* the depth.

## Key Features

- **Pure CSS transform**: `perspective` + `rotateX` + `rotateY` + `scale`. No filter, no canvas, no SVG.
- **Optional glare layer**: radial-gradient overlay positioned by the same cursor coordinates, with `mix-blend-mode: overlay` so it adapts to whatever is underneath.
- **Three reset modes**: `spring` (rAF damped ease back to flat), `instant` (snap on leave), `none` (stay where the cursor left it).
- **prefers-reduced-motion: reduce safe**: pointer handlers no-op, transform locks to identity at the stylesheet level even if the JS path didn't run.
- **SSR-safe**: `window.matchMedia` only read inside `onMount`; server render matches the un-reduced default.
- **Accessibility-preserving**: child stays in the DOM and accessibility tree, keyboard focus and `:focus-visible` work normally, glare layer is `aria-hidden`.
- **Pure helpers exported** from the module-script for unit testing without a DOM.
- **Zero external dependencies**.

## Usage

### Default — soft tilt with glare

```svelte
<script lang="ts">
  import Tilt3D from '$lib/components/Tilt3D.svelte';
</script>

<Tilt3D>
  <article class="card">
    <h3>Pricing</h3>
    <p>£29 / month</p>
  </article>
</Tilt3D>
```

### Stronger tilt for hero photos

```svelte
<Tilt3D maxTilt={20} perspective={800} glareIntensity={0.5}>
  <img src="/hero.jpg" alt="Hero photo" />
</Tilt3D>
```

### Subtle depth for buttons (no glare, low max)

```svelte
<Tilt3D maxTilt={6} glare={false} scale={1.02}>
  <button class="cta">Get started</button>
</Tilt3D>
```

### Snap-back instead of spring

```svelte
<Tilt3D reset="instant">
  <div class="tile">…</div>
</Tilt3D>
```

### Stay-where-left (cinematic)

```svelte
<Tilt3D reset="none">
  <div class="frozen">Last cursor position is preserved.</div>
</Tilt3D>
```

## Props

| Prop             | Type                                | Default    | Description                                                                                |
| ---------------- | ----------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| `maxTilt`        | `number`                            | `12`       | Maximum rotation in degrees on either axis.                                                |
| `perspective`    | `number`                            | `1000`     | CSS perspective in pixels. Smaller values give a more dramatic tilt.                       |
| `glare`          | `boolean`                           | `true`     | Render the radial-gradient glare overlay.                                                  |
| `glareIntensity` | `number`                            | `0.3`      | Glare opacity at peak, 0..1.                                                               |
| `reset`          | `'spring' \| 'instant' \| 'none'`   | `'spring'` | What happens on pointer-leave.                                                             |
| `scale`          | `number`                            | `1.04`     | Subtle scale-up applied while the cursor is inside, for added depth.                       |
| `class`          | `string`                            | `''`       | Extra class names appended to the wrapper.                                                 |
| `children`       | `Snippet`                           | `undefined`| The element you're tilting. Pass exactly the content you want responding to the cursor.    |

## Pure helpers (exported from the module-script)

All helpers are pure functions that can be unit-tested without a DOM. Import them alongside the component:

```typescript
import Tilt3D, {
  rotationFromCursor,
  glarePositionFromCursor,
  clampTilt,
  springReset,
  isReducedMotion,
  type Reset,
  type Rect,
  type Rotation,
  type GlarePos
} from '$lib/components/Tilt3D.svelte';
```

| Helper                                                | Returns                | Notes                                                                          |
| ----------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| `rotationFromCursor(cursorX, cursorY, rect, maxTilt)` | `{ rx, ry }` degrees   | Cursor in top half of rect → positive `rx` (top edge forward).                 |
| `glarePositionFromCursor(cursorX, cursorY, rect)`     | `{ x, y }` 0..1        | Clamped to the rect; outside cursor sticks to the edge it left through.        |
| `clampTilt(angle, max)`                               | `number`               | Defensive clamp; non-finite or non-positive `max` returns 0.                   |
| `springReset(current, target, damping?)`              | `number`               | One step of damped easing. Default damping 0.15 ≈ 12-frame settle.             |
| `isReducedMotion()`                                   | `boolean`              | SSR-safe wrapper around `matchMedia('(prefers-reduced-motion: reduce)')`.      |

## How it works

1. **Mount**: read `prefers-reduced-motion` once. If set, all pointer handlers no-op and the stylesheet-level fallback locks the inner element flat.
2. **Pointer move** (active path): take the wrapper's bounding rect, normalise the cursor's position to `[-1, 1]` on each axis, multiply by `maxTilt`, and write the result to `--tilt-rx` and `--tilt-ry`. The same cursor coordinates drive `--glare-x` / `--glare-y`. The transform applies immediately — no transition while tracking, so the element stays glued to the cursor.
3. **Pointer leave** (`reset='spring'`): start a `requestAnimationFrame` loop running `springReset` on both rotation values until they're under 0.05 degrees, then snap to exactly zero and stop. Rotation magnitude under 0.05 is well below visual perception, and stopping at that threshold means we never burn idle frames.
4. **Pointer leave** (`reset='instant'`): write zero to both rotation values immediately. The `transition: none` on the inner means it snaps in one frame.
5. **Pointer leave** (`reset='none'`): drop the `tilt3d--active` flag (so the glare fades out), but leave the rotation values untouched.

## Accessibility

- **Semantic neutrality**: the wrapper is a plain `<div role="presentation">`. The child element keeps its own role, label, and focus behaviour.
- **Screen readers**: child is in the DOM and accessibility tree at all times. The glare overlay is `aria-hidden`.
- **Keyboard navigation**: focusable children remain focusable via Tab. `:focus-visible` styles on the child are unaffected. The wrapper has no tabindex of its own.
- **Reduced motion**: when `prefers-reduced-motion: reduce` is active, pointer handlers no-op (no rotation, no glare opacity flips) and a stylesheet-level `@media (prefers-reduced-motion: reduce)` override locks `transform: none` on the inner — so even if the JS hasn't run yet, the user's preference still wins.

## Performance

- **Steady state with no cursor**: zero work. No rAF, no scroll listeners, no observers.
- **Per pointermove**: one `getBoundingClientRect`, four arithmetic ops, four CSS custom property writes. The transform itself is GPU-composited (`rotateX` / `rotateY` / `scale`), so reveals never hit layout or paint on the affected element.
- **Leave-spring**: a single rAF loop running `springReset` on two numbers until the rotation magnitude drops below 0.05 degrees (~12 frames at default damping), then halts.
- **Mount cost**: O(1) — one `matchMedia` probe.

## When to reach for it

- **Pricing cards** that should feel premium and clickable on hover.
- **Hero photos** where you want depth without animating the photo itself.
- **Icon grids** in feature sections — small individual tilts give a lot of life to an otherwise static layout.
- **Product mockups** in marketing pages where the page is selling a tactile artefact.
- **Anything Awwwards-flavoured** where a dead-flat card would feel apologetic.

## When *not* to reach for it

- **Body text or long-form content** — rotating paragraphs is just nausea-inducing.
- **Form fields** or **interactive controls** — the rotation interferes with click/drag accuracy and screen reader semantics.
- **Above-the-fold text the user must read immediately** — anything moving while you're trying to read it is friction.
- **Mobile-only flows** — `pointermove` works on touch but the gesture model is wrong; either disable Tilt3D below a breakpoint or use the `none` reset to lock state after each tap.

## Inspiration

The pattern is everywhere in modern marketing — Stripe, Linear, Vercel, the Apple product pages, Awwwards-of-the-day picks — and most teams reach for `vanilla-tilt`, `react-parallax-tilt`, or hand-rolled GSAP for it. `Tilt3D` is the same primitive rebuilt as a portable Svelte 5 component: no animation library, no SVG filter, no canvas, just `perspective`, `rotateX`/`rotateY`, CSS custom properties, and ~6KB of inspectable Svelte.
