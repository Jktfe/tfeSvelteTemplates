# CountUp — Technical Logic Explainer

## What Does It Do? (Plain English)

CountUp animates a number from a start value (default `0`) up to an end value over a configurable duration, with an easing curve, formatted display (locale, decimals, prefix/suffix, thousands grouping), and an optional flash-on-complete cue. Trigger on viewport entry, on mount, or manually. Exposes `run()` and `reset()` so consumers can drive it imperatively.

Think of it as the "stat ticker" you see on marketing pages — *"$2.3M raised"* counting up the moment the section scrolls into view.

## How It Works (Pseudo-Code)

```
state:
  current   = start          // resting value at SSR / pre-mount
  done      = false
  startTs   = null            // performance.now() at first rAF tick
  rafId     = null
  observer  = IntersectionObserver | null

derive:
  easeFn       = pickEasing(easing)
  formatOpts   = { locale, decimals, prefix, suffix, useGrouping }
  displayValue = formatNumber(current, formatOpts)   // visual
  finalLabel   = formatNumber(end, formatOpts)        // SR-only

helpers (pure, exported):
  pickEasing(name)           → t-curve   (linear | quad | cubic | quart | expo)
  easeOutQuart(t)            → 1 - (1-t)^4
  tickValue(start, end, t, easeFn)  → start + (end - start) * easeFn(clamp(t, 0, 1))
  clampValue(v, start, end)  → guard against rAF overshoot on the final tick
  formatNumber(value, opts)  → Intl.NumberFormat with prefix/suffix
  isReducedMotion()          → bool

step(now):
  if startTs null: startTs = now
  elapsed = now - startTs
  t       = clamp(elapsed / duration, 0, 1)   (or 1 if duration <= 0)
  v       = tickValue(start, end, t, easeFn)
  current = clampValue(v, start, end)
  if t < 1: rafId = requestAnimationFrame(step)
  else: current = end; done = true; rafId = null

run():
  cancelAnimationFrame(rafId); startTs = null
  done = false; current = start
  if SSR or reduced-motion or duration <= 0:
    current = end; done = true; return
  rafId = requestAnimationFrame(step)

reset():
  cancelAnimationFrame(rafId); rafId = null
  startTs = null; current = start; done = false

trigger gating:
  trigger = 'mount':    run() onMount
  trigger = 'viewport': IntersectionObserver(threshold) → run() once → disconnect
  trigger = 'manual':   consumer calls run() / reset() via bind
```

## The Core Concept: Easing the Final Stretch

A linear count from 0 to 1,000,000 in 1.8s feels mechanical and unfinished — you reach 1,000,000 and the animation simply stops. Real "stat ticker" anims slow toward the end so the eye lands gracefully on the final value. CountUp's default is **quart-out** (`1 − (1 − t)⁴`):

```
  t (progress)   linear   quart-out (1 - (1-t)^4)
  0.0            0.000    0.0000
  0.1            0.100    0.3439
  0.2            0.200    0.5904
  0.3            0.300    0.7599
  0.5            0.500    0.9375
  0.7            0.700    0.9919
  0.9            0.900    0.9999
  1.0            1.000    1.0000
```

By the half-way mark you're already at 94 % of the final value; the back half of the timeline is dedicated to easing those last few percent in. This is exactly what makes the anim feel "finished" rather than "cut off".

`tickValue(start, end, t, easeFn)` computes the in-flight value:

```
v = start + (end - start) * easeFn(clamp(t, 0, 1))
```

The function is direction-agnostic — pass `start = 100, end = 0` and it counts down with the same easing curve. `clampValue` guards against rAF overshoot: if the browser fires the final frame slightly past `duration` (timestamp drift), the displayed value still snaps to exactly `end`.

```
Available curves (all map t ∈ [0,1] → progress ∈ [0,1]):

  linear   →  t                                  no easing, mechanical
  quad     →  1 - (1-t)²                          gentle ease-out
  cubic    →  1 - (1-t)³                          stronger ease-out
  quart    →  1 - (1-t)⁴   (default)              "marketing-stat" feel
  expo     →  1 - 2^(-10t)                        steepest ease-out, dramatic
```

## Performance

- One rAF loop while running. Cancelled the moment `t === 1` and on every `run()` re-entry.
- Reduced-motion users skip the rAF loop entirely (`current = end; done = true`); the resting value paints once.
- `formatNumber` runs once per rAF tick — `Intl.NumberFormat` is cheap and modern engines cache the formatter.
- The final value is exposed through a visually-hidden `.countup-sr` span carrying the formatted `finalLabel`. Screen readers announce the *destination* number once, not every rAF tick — otherwise users would hear "two thousand thirteen, two thousand seventeen, two thousand twenty-two..." spam.
- Viewport trigger uses `IntersectionObserver` with `threshold: 0.4` (40% visible) and disconnects after the first intersection — the observer is dormant for the rest of the page lifetime.

## CSS Animation Strategy

The displayed number is plain text — no transform, no filter — so the count itself doesn't need CSS animation. The optional `flash` prop adds a 600 ms `text-shadow` pulse keyframe when `done` flips true:

```css
@keyframes countup-flash {
  0%   { text-shadow: 0 0 0 transparent;       transform: translateY(0); }
  35%  { text-shadow: 0 0 14px rgba(125,211,252,.9); transform: translateY(-2px); }
  100% { text-shadow: 0 0 0 transparent;       transform: translateY(0); }
}
.countup-flash .countup-value { animation: countup-flash 600ms ease-out 1; }

@media (prefers-reduced-motion: reduce) {
  .countup-flash .countup-value { animation: none; }
}
```

Reduced-motion users get the static destination value with no flash — just like they get the static value with no count animation.

## State Flow Diagram

```
  [mounted]   current = start  (paints resting value during SSR/hydration)
        │
        │  trigger = 'mount': run() immediately
        │  trigger = 'viewport': observe; on intersection → run() → disconnect
        │  trigger = 'manual': consumer calls run() via bind
        ▼
  [running]   rAF loop
        │
        │  reduced-motion / SSR / duration <= 0
        │     ──────────────────────▶ [done]   current = end; done = true
        │
        │  every rAF tick:
        │     elapsed = now - startTs
        │     t       = clamp(elapsed / duration, 0, 1)
        │     current = clampValue(tickValue(start, end, t, easeFn), start, end)
        │
        │  t === 1
        ▼
  [done]   current = end
        │
        │  flash && done → CSS keyframe fires once (600 ms)
        ▼
  [resting]   stays at end until reset() or new run()

  on destroy: cancelAnimationFrame; observer.disconnect()
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `end` | `number` | required | Destination value. |
| `start` | `number` | `0` | Initial value (also the resting value during SSR). |
| `duration` | `number` | `1800` | Milliseconds for the count animation. `0` snaps instantly. |
| `easing` | `'linear' \| 'quad' \| 'cubic' \| 'quart' \| 'expo'` | `'quart'` | Easing curve. |
| `decimals` | `number` | `0` | Decimal places in the formatted output (clamped to `0..20`). |
| `prefix` | `string` | `''` | Text prepended (`'$'`, `'£'`, etc.). |
| `suffix` | `string` | `''` | Text appended (`'%'`, `'M'`, etc.). |
| `locale` | `string` | `'en-GB'` | BCP-47 locale passed to `Intl.NumberFormat`. |
| `useGrouping` | `boolean` | `true` | Insert thousands separators per locale. |
| `trigger` | `'viewport' \| 'mount' \| 'manual'` | `'viewport'` | When to start counting. |
| `threshold` | `number` | `0.4` | Visibility ratio that triggers the viewport mode (0..1). |
| `flash` | `boolean` | `false` | Run a 600 ms text-shadow pulse on completion. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Type scale. |
| `class` | `string` | `''` | Extra classes on the wrapper. |

Exported imperative API: `run(): void`, `reset(): void` — bind the component instance to call these.

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `duration <= 0` | `run()` snaps `current = end; done = true` without entering the rAF loop. |
| `start > end` | Counts down. Easing applies in the same direction; `clampValue` keeps the displayed value within `[end, start]`. |
| User has `prefers-reduced-motion: reduce` | `run()` snaps to `end`; no rAF, no flash. |
| `trigger = 'viewport'` and `IntersectionObserver` unsupported | The observer block is skipped; consumer must call `run()` manually or use `trigger='mount'`. |
| Component re-mounts after completion | Fresh state — `current` initialises to `start` again; trigger logic re-fires. |
| `run()` called while already running | Existing rAF cancelled; `startTs` reset; new run starts cleanly from `start`. |
| `reset()` called mid-flight | rAF cancelled; `current = start`; `done = false`. |
| Locale unknown to `Intl` | `Intl.NumberFormat` substitutes the runtime default — no throw. |
| `decimals` outside `0..20` | Clamped to the valid range before being passed to `Intl`. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$props`, `onMount`, `onDestroy`, module-script exports.
- **`Intl.NumberFormat`** (native) — locale-aware formatting.
- **`IntersectionObserver`** (native) — viewport trigger; component falls back gracefully when missing.
- Zero external dependencies otherwise — no GSAP, no anime.js.

## File Structure

```
src/lib/components/CountUp.svelte    # implementation
src/lib/components/CountUp.md        # this file (rendered inside ComponentPageShell)
src/lib/components/CountUp.test.ts   # vitest unit tests for the pure helpers
src/routes/countup/+page.svelte      # demo page
```
