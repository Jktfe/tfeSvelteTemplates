# OrbitalRing — Technical Logic Explainer

## What Does It Do? (Plain English)

OrbitalRing arranges any list of items evenly around the rim of an invisible circle and slowly rotates the whole ring. Think of a planetary system: the centre slot holds a star (or a logo, or any custom content) and the orbiting items circle it at a configurable radius and speed. Each orbit slot can either travel with the ring (so a clock face's numbers tilt as the ring spins) or counter-rotate so it always faces the viewer (so an avatar always reads the right way up).

It is a small but expressive layout primitive — useful for "ecosystem" diagrams, hero sections, "constellation"-style team pages, and anywhere you want a continuous, low-key sense of motion that draws the eye to a centre. Hovering pauses the ring; reduced-motion users see a static composition; visibility-aware: the rAF loop stops when the ring scrolls off-screen.

## How It Works (Pseudo-Code)

```
state:
  ringRotation = 0    // current angle of the whole ring, deg
  reduced            // capability flag
  hovered            // pause-on-hover flag
  visible            // IntersectionObserver flag
  rafId              // current animation frame id

derived:
  safeDirection = pickDirection(direction)        // 'clockwise' or 'counter-clockwise'
  safeRadius    = clampRadius(radius)             // [20, 2000] px
  angles        = distributeAngles(items.length, startAngleDeg)

on mount:
  reduced = isReducedMotion()
  observer = new IntersectionObserver(([entry]) => visible = entry.isIntersecting)
  observer.observe(containerEl)

effect:
  if autoSpin and !reduced and !(pauseOnHover and hovered) and visible:
    start()
  else:
    stop()

tick(now):
  if lastTs === null: lastTs = now
  elapsed = now - lastTs
  lastTs  = now
  degPerMs = 360 / max(spinDurationMs, 1)
  sign     = safeDirection === 'clockwise' ? 1 : -1
  ringRotation = (ringRotation + sign * elapsed * degPerMs) % 360
  rafId = requestAnimationFrame(tick)

on hover enter / leave: hovered = true / false
on destroy: cancelAnimationFrame, observer.disconnect

render:
  <div class="orbital-ring" style="--orbital-ring-rotation: {ringRotation}deg">
    <div class="orbital-ring__track">       /* spins as a single layer */
      {center?.()}
      for each item, i:
        <div class="orbital-ring__slot" style="--orbital-slot-angle: {angles[i]}deg">
          <div class="orbital-ring__content {counterRotate ? '--upright' : ''}">
            {item(data, i)}
          </div>
        </div>
    </div>
  </div>

CSS:
  .__track    { transform: rotate(var(--ring-rotation)); }
  .__slot     { transform: translate(-50%, -50%) rotate(slot-angle) translateY(-radius); }
  .__content          { transform: rotate(calc(slot-angle * -1)); }
  .__content--upright { transform: rotate(calc(slot-angle * -1 - ring-rotation)); }
```

## The Core Concept: Stacked Rotations And Counter-Rotation

Three nested transforms compose together to put each item where you want and (optionally) keep it upright.

**1. Distribute slots evenly** by stepping the angle by `360/N`:

```
distributeAngles(count, startDeg) returns [
  startDeg + 0 * (360/count),
  startDeg + 1 * (360/count),
  ...
]
```

For five items and `startDeg = 0`, that's `[0°, 72°, 144°, 216°, 288°]`. The function is exported from `<script module>` so the test suite can assert distribution without rendering.

**2. Pin a slot to the ring** by chaining three transforms in CSS, applied right-to-left:

```
transform:
  translate(-50%, -50%)               /* anchor on element centre */
  rotate(slot-angle)                  /* rotate around the centre */
  translateY(-radius)                 /* walk outward along the rotated Y axis */
```

The `translate(-50%, -50%)` keeps the slot's centre on the ring, regardless of slot size; the `rotate(slot-angle)` aims a fresh local Y axis in the slot's direction; the `translateY(-radius)` walks out along that axis. Since each slot lives inside `.__track`, when the track rotates by `ringRotation` the entire ring moves together — no per-slot JavaScript update needed.

**3. Counter-rotate the content** if you want it to stay upright. There are two flavours:

- **Ring-frame upright** (`counterRotateItems = true` is the default; the `--upright` class without ring rotation cancellation): content rotates with the ring (numbers on a clock dial). The CSS applies `rotate(calc(slot-angle * -1))` — undoing only the slot's local rotation, so the content sits flat against the ring.
- **World-frame upright** (the actual `--upright` rule includes both `slot-angle * -1` and `ring-rotation * -1`): content stays upright in the viewer's frame regardless of where the ring has spun. Used for avatars and labels you always want readable.

```
                    ●  ← centre
                  ╱
                 ╱
               ●  ← slot pinned at slot-angle, distance radius
              ╱
            content rotated back so it reads upright
```

The `dampedSine` style of nested-transform composition is what makes the maths cheap: once mounted, the only state that changes per frame is `--orbital-ring-rotation`, a single CSS variable on `.__track`. The compositor inherits that change to all descendant slots, applies the per-slot rotations on the GPU, and the ring spins without a single per-slot JavaScript write.

## CSS Animation Strategy

A single per-frame change drives every visible motion:

```css
.orbital-ring__track {
  transform: rotate(var(--orbital-ring-rotation, 0deg));
  will-change: transform;
}

.orbital-ring__slot {
  transform:
    translate(-50%, -50%)
    rotate(var(--orbital-slot-angle, 0deg))
    translateY(calc(var(--orbital-radius, 160px) * -1));
}

.orbital-ring__content--upright {
  transform: rotate(calc(var(--orbital-slot-angle, 0deg) * -1 - var(--orbital-ring-rotation, 0deg)));
}

@media (prefers-reduced-motion: reduce) {
  .orbital-ring__track { transform: none !important; }
  .orbital-ring__content--upright,
  .orbital-ring__content { transform: rotate(calc(var(--orbital-slot-angle, 0deg) * -1)) !important; }
}
```

Reduced motion freezes the track and *also* removes the world-frame counter-rotation so upright content sits at a deterministic angle. The `!important` is necessary because the inline `--orbital-ring-rotation` variable would otherwise win the cascade.

## Performance

- **Steady state per frame**: one `$state` write (`ringRotation`), one CSS variable update on the wrapper, GPU compositor handles the rest. With 8 items the per-frame cost is sub-millisecond.
- **Idle when off-screen**: the `IntersectionObserver` flips `visible` to `false`, the effect calls `stop()`, the rAF loop unschedules. A scrolled-away ring contributes nothing to the frame budget.
- **Idle on hover**: same mechanism via the `hovered` flag.
- **Idle for reduced-motion users**: the rAF loop never starts; the `@media` rule freezes the visible state at the stylesheet level even if the JS gate ever drifts.

## State Flow Diagram

```
              ┌──────────────────────┐
              │  REST                │  ← rafId = null
              │  ringRotation = 0    │
              └──────────┬───────────┘
                         │ autoSpin + visible + !hovered + !reduced
                         ▼
              ┌──────────────────────┐
              │  SPINNING            │  ← rAF loop active
              │  ringRotation grows  │
              │  by elapsed × degPerMs│
              └──┬───────────────────┘
                 │ hover, scroll-out, or OS pref change
                 ▼
              ┌──────────────────────┐
              │  PAUSED              │  ← cancelAnimationFrame
              │  ringRotation frozen │
              └──────────┬───────────┘
                         │ gates flip back true
                         ▼ resume from current rotation

  IntersectionObserver: container off-screen → visible=false → stop
  Hover enter / leave: hovered=true / false → effect flips
  prefers-reduced-motion: reduce: locked in REST forever
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | required | Generic items array. Each is rendered via the `item` snippet. |
| `radius` | `number` | `160` | Ring radius in pixels. Clamped to `[20, 2000]`. |
| `autoSpin` | `boolean` | `true` | Drive the ring with rAF. False renders a static layout. |
| `spinDurationMs` | `number` | `20000` | Time for one full revolution. Higher = slower. |
| `direction` | `'clockwise' \| 'counter-clockwise'` | `'clockwise'` | Spin direction. Unknown values fall back to clockwise via `pickDirection`. |
| `pauseOnHover` | `boolean` | `true` | Pause when the cursor enters the wrapper. |
| `counterRotateItems` | `boolean` | `true` | World-frame upright: items always face the viewer. False makes them tilt with the ring. |
| `itemSize` | `number` | `80` | Slot box size in pixels. The container's outer size = `radius*2 + itemSize`. |
| `startAngleDeg` | `number` | `0` | Angle of the first slot. `0` = top; `90` = right. |
| `class` | `string` | `''` | Extra wrapper classes. |
| `item` | `Snippet<[T, number]>` | — | Per-slot rendering snippet. Receives `(data, index)`. |
| `center` | `Snippet` | — | Optional centre snippet rendered inside the ring. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `items = []` | Track renders empty. The centre snippet still appears if provided. No rAF work — `start()` runs but the loop is harmless with no slots to update. |
| `items.length = 1` | One slot at `startAngleDeg`. With `counterRotateItems`, it stays upright; without, it tilts. |
| Non-finite `radius` | `clampRadius` returns `minPx = 20` so the inline style never receives `NaNpx`. |
| Unknown `direction` string | `pickDirection` falls back to `'clockwise'`. Never crashes on user data. |
| `pauseOnHover = true`, cursor enters then quickly leaves | Effect flips `hovered` → `start()` resumes from the current rotation. No reset. |
| Component scrolls off-screen | `IntersectionObserver` flips `visible = false` → effect stops the loop. Re-entering resumes — the ring "remembers" where it was. |
| `prefers-reduced-motion: reduce` enabled | rAF loop never starts. CSS `@media` rule additionally pins `transform: none` on the track and removes ring-rotation cancellation on upright content. |
| Resizing the window mid-spin | `getBoundingClientRect` is not used in the per-frame path, so resizes don't trigger jitter. The ring continues spinning; `radius` and `itemSize` are absolute pixels. |
| Component unmounts mid-spin | `onDestroy` cancels the rAF and disconnects the observer. No leaked timer. |

## Dependencies

- **Svelte 5** — `$state`, `$derived`, `$effect`, `$props`, `Snippet`, generic component (`<T>`).
- **`<script module>`** exports — `distributeAngles`, `slotTransform`, `contentRotation`, `pickDirection`, `clampRadius`, `isReducedMotion`. All pure, testable without a DOM.
- **`IntersectionObserver`** — browser primitive used to pause when off-screen.
- **Zero external libraries** — no animation library, no layout library. Pure CSS transforms + rAF.

## File Structure

```
src/lib/components/OrbitalRing.svelte         # implementation
src/lib/components/OrbitalRing.md             # this explainer
src/lib/components/OrbitalRing.test.ts        # unit tests for exported helpers
src/routes/orbitalring/+page.svelte           # demo page
```
