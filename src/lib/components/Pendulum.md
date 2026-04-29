---
title: Pendulum
description: Wrap any element to make it swing on a damped harmonic curve from a configurable offset pivot. Mount-trigger, viewport-trigger, click-to-swing, or imperative `swing()` — pure rAF + CSS transform-origin, zero animation libraries, `prefers-reduced-motion: reduce` honoured at the stylesheet level.
category: Helpful UX
author: Claude
---

# Pendulum

A wrapper that gives its child a physics-grounded swing — peak amplitude at t=0, exponentially decaying envelope, sinusoidal cycle — pivoting from an offset above (or anywhere relative to) the wrapped element's bounding box. The motion comes from a single rAF loop running `θ(t) = A·exp(-decay·t)·cos(2π·freq·t)`; no animation library, no SVG, no canvas.

`Pendulum` fills the **physics-driven swing** slot in the existing taxonomy. Where `Tilt3D` rotates whole elements toward the cursor, `MagneticButton` translates them, and `MagicCard` adds a 2D spotlight, `Pendulum` rotates them around an offset pivot under their own simulated gravity-and-damping. It composes cleanly with the others — wrapping a `MagicCard` in a `Pendulum` gives you the spotlight *and* the pendular swing.

## Key Features

- **Pure CSS transform**: `rotateZ` around an offset `transform-origin`. No filter, no canvas, no SVG.
- **Four triggers**: `mount` (auto on mount), `viewport` (when scrolled into view via IntersectionObserver), `click` (tap-to-swing), `manual` (call `swing()` from outside).
- **Imperative API**: `bind:this={pendulum}` then `pendulum.swing()` or `pendulum.stop()`.
- **Configurable pivot**: any `{ x, y }` offset (in pixels) from element centre — typically `y: -40` to hang from "above the head".
- **Damped harmonic motion**: peak amplitude at t=0, exponential decay, sinusoidal cycle. Tune amplitude, frequency (Hz), and decay (1/s) independently.
- **Auto-halt**: rAF loop stops when the swing envelope drops below 0.05° or hits the duration cap, whichever comes first — never burns idle frames.
- **prefers-reduced-motion: reduce safe**: physics loop no-ops, transform locks to identity at the stylesheet level even if the JS path didn't run.
- **SSR-safe**: `window.matchMedia` only read inside `onMount`; server render matches the un-reduced default.
- **Accessibility-preserving**: child stays in the DOM and accessibility tree. `click` trigger adds `role="button"` and `tabindex="0"` to the inner element with Enter/Space keyboard activation.
- **Pure helpers exported** from the module-script for unit testing without a DOM.
- **Zero external dependencies**.

## Usage

### Default — auto-swing on mount

```svelte
<script lang="ts">
  import Pendulum from '$lib/components/Pendulum.svelte';
</script>

<Pendulum>
  <div class="bell">🔔</div>
</Pendulum>
```

### Hanging shop sign — pivot from above the head

```svelte
<Pendulum
  trigger="viewport"
  amplitude={12}
  frequency={0.6}
  decay={0.8}
  pivotOffset={{ x: 0, y: -40 }}
  duration={6000}
>
  <img src="/shop-sign.png" alt="The Crown Tavern" />
</Pendulum>
```

### Click-to-swing notification bell

```svelte
<Pendulum trigger="click" amplitude={25} frequency={2} decay={3}>
  <span class="bell" aria-label="Ring the bell">🔔</span>
</Pendulum>
```

### Mantel-clock pendulum — slow, never stops (long duration cap)

```svelte
<Pendulum
  trigger="mount"
  amplitude={20}
  frequency={0.5}
  decay={0.05}
  pivotOffset={{ x: 0, y: -100 }}
  duration={60000}
>
  <div class="weight">⚖️</div>
</Pendulum>
```

### Imperative `swing()` from a parent button

```svelte
<script lang="ts">
  import Pendulum from '$lib/components/Pendulum.svelte';

  let bell: ReturnType<typeof Pendulum> & { swing: () => void };
</script>

<button onclick={() => bell.swing()}>Ring the bell</button>

<Pendulum bind:this={bell} trigger="manual" amplitude={20}>
  <span class="bell">🔔</span>
</Pendulum>
```

## Props

| Prop             | Type                                          | Default              | Description                                                                                          |
| ---------------- | --------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------- |
| `trigger`        | `'mount' \| 'viewport' \| 'click' \| 'manual'`| `'mount'`            | When the swing starts. `manual` exposes `swing()` only.                                              |
| `amplitude`      | `number`                                      | `18`                 | Peak swing in degrees (one side of zero).                                                            |
| `frequency`      | `number`                                      | `1.2`                | Cycles per second (Hz). Lower = slower swing.                                                        |
| `decay`          | `number`                                      | `1.4`                | Exponential damping (1/s). Higher = halts sooner. `0.05` for clock-like persistence.                 |
| `pivotOffset`    | `{ x: number, y: number }`                    | `{ x: 0, y: -20 }`   | Offset (in px) from element centre for the rotation pivot. Negative `y` hangs from above.            |
| `duration`       | `number`                                      | `4000`               | Hard cap on swing duration (ms). The rAF loop also halts when the envelope drops below 0.05°.        |
| `autoStartDelay` | `number`                                      | `0`                  | Delay (ms) before auto-triggers (`mount` / `viewport`) actually fire — useful for staggered rows.    |
| `threshold`      | `number`                                      | `0.4`                | IntersectionObserver threshold for `trigger='viewport'`.                                             |
| `class`          | `string`                                      | `''`                 | Extra class names appended to the wrapper.                                                           |
| `children`       | `Snippet`                                     | `undefined`          | The element to swing. Pass exactly the content you want pivoting.                                    |

## Imperative API (component-level)

| Method     | Returns | Description                                                                                       |
| ---------- | ------- | ------------------------------------------------------------------------------------------------- |
| `swing()`  | `void`  | Start (or restart) a fresh swing from the peak amplitude. Idempotent — cancels any in-flight rAF. |
| `stop()`   | `void`  | Cancel any in-flight rAF and snap the angle back to 0 immediately.                                |

Bind via `bind:this={pendulum}` to call.

## Pure helpers (exported from the module-script)

All helpers are pure functions that can be unit-tested without a DOM. Import them alongside the component:

```typescript
import Pendulum, {
  dampedSine,
  nextAngle,
  clampSwing,
  pickTrigger,
  pivotOffsetCSS,
  isReducedMotion,
  type Trigger,
  type PivotOffset,
  type SwingState
} from '$lib/components/Pendulum.svelte';
```

| Helper                                              | Returns         | Notes                                                                                            |
| --------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------ |
| `dampedSine(t, amplitude, frequency, decay)`        | `number`        | `θ(t) = A·exp(-decay·t)·cos(2π·freq·t)`. Returns 0 for non-finite or negative `t`.               |
| `nextAngle(state, deltaT, gravity, damping)`        | `SwingState`    | One Euler-integration step for users who want their own physics loop.                            |
| `clampSwing(angle, max)`                            | `number`        | Defensive clamp; non-finite or non-positive `max` returns 0.                                     |
| `pickTrigger(name)`                                 | `Trigger`       | Validates name; falls back to `'mount'` on unknown input.                                        |
| `pivotOffsetCSS(offset)`                            | `string`        | Converts `{ x, y }` to `transform-origin` syntax. `{ x: 0, y: 0 }` returns `'50% 50%'`.          |
| `isReducedMotion()`                                 | `boolean`       | SSR-safe wrapper around `matchMedia('(prefers-reduced-motion: reduce)')`.                        |

## How it works

1. **Mount**: read `prefers-reduced-motion` once. If set, all triggers no-op and the stylesheet-level fallback locks the inner element flat.
2. **Trigger dispatch**:
   - `mount`: call `swing()` immediately (or after `autoStartDelay`).
   - `viewport`: arm an `IntersectionObserver` against the wrapper; on intersection, call `swing()` once and disconnect.
   - `click`: attach a click handler on the inner element; each tap calls `swing()` from peak.
   - `manual`: do nothing on mount; expose `swing()` for parent code to drive.
3. **Tick loop**: each `requestAnimationFrame` step computes elapsed time, runs `dampedSine` to get the current angle, clamps it via `clampSwing` (defensive, in case of pathological inputs), and writes it to the `--pendulum-angle` CSS custom property. The inner element's `transform: rotateZ(var(--pendulum-angle))` follows.
4. **Halt**: the loop stops when either (a) the envelope `A·exp(-decay·t)` drops below 0.05°, or (b) elapsed time exceeds `duration`. On halt the angle is set to exactly 0.
5. **Pivot**: `transform-origin` is set on the wrapper using `pivotOffsetCSS(pivotOffset)` and inherited by the inner element (`transform-origin: inherit`). The rotation pivots around that point, not the element centre.

## Accessibility

- **Semantic neutrality**: the wrapper is a plain `<div role="presentation">`. The child element keeps its own role, label, and focus behaviour.
- **Click trigger**: the inner element gains `role="button"`, `tabindex="0"`, `aria-label="Swing pendulum"`, and Enter/Space keyboard activation. Focus ring uses `:focus-visible` (indigo, 2px, 4px offset).
- **Screen readers**: child is in the DOM and accessibility tree at all times. The pendulum motion itself is invisible to assistive tech (no live region announcements — they would be noise).
- **Reduced motion**: when `prefers-reduced-motion: reduce` is active, all triggers no-op (no rAF, no rotation) and a stylesheet-level `@media (prefers-reduced-motion: reduce)` override locks `transform: none` on the inner — so even if the JS hasn't run yet, the user's preference still wins.

## Performance

- **Steady state with no swing**: zero work. No rAF, no scroll listeners, no observers (unless `trigger='viewport'`, which uses one IntersectionObserver that disconnects after first intersection).
- **Per swing tick**: one `dampedSine` call (4 arithmetic ops + 2 transcendentals: `Math.exp`, `Math.cos`), one `clampSwing` (constant time), one CSS custom property write. The transform itself is GPU-composited (`rotateZ`), so swings never hit layout or paint.
- **Auto-halt**: the loop stops once the envelope falls below 0.05° (~1/360th of typical amplitude) — well below visual perception. With default decay=1.4, that's roughly 4 seconds of motion regardless of amplitude.
- **Mount cost**: O(1) — one `matchMedia` probe, one optional IntersectionObserver setup.

## When to reach for it

- **Hanging signs / tags** in marketing pages where you want a pub-sign feel without animating the SVG itself.
- **Notification bells** where the click should feel kinetic, not just visual.
- **Hero illustrations** with charm — swinging keys, teetering vases, dangling jewellery.
- **Mantel-clock pendulums** for that one block of an "About" page that needs a touch of analogue.
- **Interactive product mockups** — let users tap a price tag to make it swing.
- **Staggered viewport reveals**: pair `trigger="viewport"` with sibling-by-sibling `autoStartDelay` to choreograph rows.

## When *not* to reach for it

- **Body text or long-form content** — rotating paragraphs is just nausea-inducing.
- **Form fields** or **interactive controls** — the rotation interferes with click/drag accuracy and screen reader semantics.
- **Above-the-fold text the user must read immediately** — anything moving while you're trying to read it is friction.
- **High-density grids** — many simultaneous swings can muddy a layout. Stagger them with `autoStartDelay` if you must.

## Inspiration

The pattern shows up wherever marketing pages need a touch of physical charm — Stripe's playful product illustrations, Apple's loose-collar product shots, Awwwards pub-sign hero treatments. Most teams reach for GSAP timelines, anime.js, or hand-rolled CSS animations. `Pendulum` is the same primitive rebuilt as a portable Svelte 5 component: no animation library, no SVG, no canvas — just `transform-origin`, `rotateZ`, CSS custom properties, and ~7KB of inspectable Svelte.
