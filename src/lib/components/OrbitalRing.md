---
name: OrbitalRing
slug: orbitalring
category: Helpful UX
status: shipped
since: 2026-04-29
---

# OrbitalRing

A circular orbital layout primitive for arbitrary children. N items are
distributed evenly around a ring that auto-rotates clockwise or
counter-clockwise. Each item's content can either stay world-frame
upright (planet orientation) or rotate with the ring (constellation
orientation).

Useful for testimonials carousels, team-photo galleries, value-prop
spotlights, awards reels, or any radial layout where a flat
left-to-right strip would feel mundane.

## Key Features

- **Radial layout** — N children pinned to a circle of given radius.
- **Auto-spin** — continuous rotation in either direction; configurable
  duration per full revolution.
- **Pause on hover** — ring stops while the cursor is inside.
- **Pause when offscreen** — IntersectionObserver halts rAF when the
  ring leaves the viewport, so a hero ring at the top of a long page
  doesn't burn cycles you can't see.
- **Counter-rotation** — content stays upright in world frame
  (default) or rotates with the ring.
- **Optional centre slot** — a snippet rendered at the ring's centre,
  counter-rotated so it stays still while the ring spins around it.
- **prefers-reduced-motion** — auto-spin disabled at the stylesheet
  level. Items still positioned correctly, just static.

## Usage

### Basic auto-spinning ring

```svelte
<script>
  import OrbitalRing from '$lib/components/OrbitalRing.svelte';

  const planets = [
    { id: 1, name: 'Mercury' },
    { id: 2, name: 'Venus' },
    { id: 3, name: 'Earth' },
    { id: 4, name: 'Mars' },
    { id: 5, name: 'Jupiter' }
  ];
</script>

<OrbitalRing items={planets} radius={180}>
  {#snippet item(p)}
    <div class="planet">{p.name}</div>
  {/snippet}
</OrbitalRing>
```

### With a stationary centre

```svelte
<OrbitalRing items={services} radius={200}>
  {#snippet center()}
    <div class="logo">☀</div>
  {/snippet}
  {#snippet item(s)}
    <div class="service-tile">{s.label}</div>
  {/snippet}
</OrbitalRing>
```

### Counter-clockwise, slow spin

```svelte
<OrbitalRing
  items={testimonials}
  radius={220}
  spinDurationMs={60000}
  direction="counter-clockwise"
>
  {#snippet item(t)}
    <blockquote>{t.quote}</blockquote>
  {/snippet}
</OrbitalRing>
```

### Constellation mode (items rotate with the ring)

```svelte
<OrbitalRing items={stars} counterRotateItems={false}>
  {#snippet item(s)}
    <span class="star">★</span>
  {/snippet}
</OrbitalRing>
```

## Props

| Prop                  | Type                                          | Default          | Description                                                            |
| --------------------- | --------------------------------------------- | ---------------- | ---------------------------------------------------------------------- |
| `items`               | `T[]`                                         | required         | Array of arbitrary data, one slot per element                          |
| `radius`              | `number`                                      | `160`            | Distance from centre to slot centres, in px (clamped 20–2000)          |
| `autoSpin`            | `boolean`                                     | `true`           | Whether the ring rotates continuously                                  |
| `spinDurationMs`      | `number`                                      | `20000`          | Time for one full revolution                                           |
| `direction`           | `'clockwise' \| 'counter-clockwise'`          | `'clockwise'`    | Rotation direction                                                     |
| `pauseOnHover`        | `boolean`                                     | `true`           | Halt rotation while the cursor is inside the ring                      |
| `counterRotateItems`  | `boolean`                                     | `true`           | World-upright (true) vs ring-upright (false) for item content          |
| `itemSize`            | `number`                                      | `80`             | Px size of each slot box                                               |
| `startAngleDeg`       | `number`                                      | `0`              | Where item 0 begins (0 = 12 o'clock, 90 = 3 o'clock)                   |
| `class`               | `string`                                      | `''`             | Extra classes on the host                                              |
| `item`                | `Snippet<[T, number]>`                        | —                | Render snippet for each slot — receives item + index                   |
| `center`              | `Snippet`                                     | —                | Optional snippet rendered at the ring's centre (counter-rotated)       |

## Pure helpers (module-script exports)

| Function                                     | Returns           | Purpose                                               |
| -------------------------------------------- | ----------------- | ----------------------------------------------------- |
| `distributeAngles(count, startDeg)`          | `number[]`        | Evenly spaced angles, in degrees                      |
| `slotTransform(angleDeg, radius)`            | `string`          | CSS transform that pins a slot at angle               |
| `contentRotation(angle, ringRot, upright)`   | `number`          | Counter-rotation degrees for content's inner div      |
| `pickDirection(name)`                        | `Direction`       | Validates / defaults a direction string               |
| `clampRadius(value, minPx, maxPx)`           | `number`          | Defensive radius clamp                                |
| `isReducedMotion()`                          | `boolean`         | SSR-safe matchMedia probe                             |

## How it works

The host writes four CSS custom properties: `--orbital-radius`,
`--orbital-size`, `--orbital-item-size`, and `--orbital-ring-rotation`.
The track has `transform: rotate(var(--orbital-ring-rotation))` —
that's the only attribute updated per frame, so the GPU composites a
single transform on a single layer regardless of how many items are
in the ring.

Each slot uses `rotate(var(--slot-angle)) translateY(-radius)` to pin
itself to the circle. Content inside each slot uses a `calc()` against
both `--slot-angle` and `--ring-rotation` to counter-rotate, so a face
stays facing the viewer regardless of where the ring has spun to.

The rAF loop accumulates `(360 / spinDurationMs) * elapsedMs` per
frame onto `ringRotation` (modulo 360) — no envelope, no halting; it
runs steady-state. `IntersectionObserver` toggles `visible`, which an
`$effect` watches alongside `hovered` and `reduced` to start or stop
the rAF dispatcher.

## Accessibility

- The host carries `role="list"`; each slot carries `role="listitem"`.
- The optional centre slot is `role="presentation"` — assistive tech
  reads through to its content, not the wrapper.
- prefers-reduced-motion: reduce → the stylesheet zeroes the track
  transform via `!important`, so the ring renders as a static circle
  even if the rAF loop momentarily fires before `onMount` runs.
- No keyboard interaction in M1 — items are layout, not buttons. If
  consumers wrap items with their own anchors or buttons, normal Tab
  order applies.

## Performance

- Steady spin: a single CSS custom property update per frame on the
  host. Browser composites the track transform on its own layer.
- Counter-rotation: handled by CSS `calc()` against the cascaded
  custom property — no per-item JS work per frame.
- Offscreen: rAF stops when the ring leaves the viewport.
- Reduced motion: stylesheet-level `transform: none !important` —
  zero animation cost, layout only.

## When to reach for it

- Radial galleries (testimonials, team photos, value props, awards).
- "Solar system" diagrams where one element is the focal point and
  others orbit it.
- Constellations / star fields where items should rotate with the
  ring (set `counterRotateItems={false}`).

## When not to

- For a strict carousel with explicit prev/next navigation, reach for
  CardStack or Marquee — OrbitalRing has no direct keyboard / button
  controls in M1.
- For data viz where item position encodes meaning (e.g.,
  hierarchical), reach for Sunburst or RadialCluster.
- For long lists (>12 items), readability suffers — radial layout
  rewards a small N.

## Inspiration

A nod to circular-mast galleries and the "satellites round a planet"
effect popular in agency hero sections circa 2024–2026 (Awwwards
darlings). Pure-CSS implementation with no SVG or canvas, so it copy-
pastes into any Svelte 5 project with zero dependencies.
