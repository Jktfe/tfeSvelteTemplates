# VariableProximity — Technical Logic Explainer

## What Does It Do? (Plain English)

VariableProximity splits a phrase into per-letter spans, then drives each letter's variable-font axes (weight, width, slant, optical size) by how close the cursor is. Letters near the pointer swell — heavier weight, wider letterforms, optional slant. Letters far away rest at their base. There is no timer; the effect is purely cursor-reactive. Move away and every letter relaxes back to base.

Think of it as a magnifying glass for typography. Where your finger lands, the glyphs respond.

## How It Works (Pseudo-Code)

```
state:
  letterEls       = Map<index, HTMLElement>
  cursorPos       = { x, y } | null
  prefersReduced  = matchMedia query
  supportsVariable = CSS.supports('font-variation-settings: "wght" 400')
  rafHandle       = null

derive:
  letters         = Array.from(text).map(c => { char, isSpace })
  baseSettings    = buildVariationSettings(axes, 0)   // proximity = 0 → base values

helpers (pure, exported):
  distance(p1, p2) → Euclidean
  falloff(d, radius, curve) → 0..1 weight
    'linear':    1 - d/radius
    'quadratic': (1 - d/radius)^2
    'gaussian':  exp(-((1 - (1 - d/radius)) * 2)^2)
  axisInterpolate(t, base, peak) → base + (peak - base) * t
  buildVariationSettings(axes, proximity) → '"wght" 712.50, "wdth" 113.20'

events:
  on pointermove(e):
    if prefersReduced or !supportsVariable: bail
    cursorPos = { e.clientX, e.clientY }
    scheduleApply()    // rAF-throttled

  on pointerleave / blur:
    cursorPos = null
    scheduleApply()    // resets every letter to base

  on focus (keyboard parity):
    cursorPos = wrapper centre
    scheduleApply()

scheduleApply():
  if rafHandle: bail (one rAF outstanding at a time)
  rafHandle = requestAnimationFrame(applyAxesFromCursor)

applyAxesFromCursor():
  rafHandle = null
  if cursorPos null:
    for el of letterEls: el.style.fontVariationSettings = baseSettings
    return
  wRect = wrapper.getBoundingClientRect()
  for el of letterEls:
    lRect    = el.getBoundingClientRect()
    centre   = letter midpoint relative to wrapper
    d        = distance(cursor relative to wrapper, centre)
    prox     = falloff(d, radius, falloffCurve)
    el.style.fontVariationSettings = buildVariationSettings(axes, prox)
```

## The Core Concept: Distance → Falloff → Axis Interpolation

The component's "shape" comes from one composition: every pointermove writes a fresh `font-variation-settings` per letter, and CSS transitions interpolate to those new values. The chain has three stages.

**Stage 1 — distance.** Euclidean distance between cursor and letter centre, in pixels relative to the wrapper:

```
d = √((cursor.x - letter.cx)² + (cursor.y - letter.cy)²)
```

**Stage 2 — falloff curve.** Map `d` into a 0..1 proximity weight:

```
t = 1 - d/radius   (clamped: 1 at d=0, 0 at d>=radius)

linear   (t):   t                       sharpest, triangular
quadratic(t):   t²                      eases out — soft falloff
gaussian (t):   exp(-((1-t)*2)²)        bell curve — narrow centre, soft tails
```

**Stage 3 — axis lerp.** For each axis (wght, wdth, slnt, opsz), interpolate between base and peak by the proximity weight:

```
value = base + (peak - base) * t
font-variation-settings: "wght" 400, "wdth" 100   ← at proximity 0
font-variation-settings: "wght" 800, "wdth" 125   ← at proximity 1
```

CSS does not have a built-in interpolation for `font-variation-settings` between arbitrary values, but a `transition: font-variation-settings 150ms ease-out` interpolates *each named axis* numerically — which is exactly what we want. The JS layer writes target values; CSS runs the in-betweens for free.

```
        radius = 120px
        ┌─────────────┐
        │             │  letters outside radius → base
        │      ●      │  cursor at centre → peak axes locally
        │     ╱│╲     │
        │    ╱ │ ╲    │  letters inside radius → falloff curve
        │   ╱  │  ╲   │  determines how 'spiky' the centre is
        └─────────────┘
```

## Performance

- **rAF throttling.** A flood of `pointermove` events (some browsers fire 200+ per second on a fast trackpad) coalesces into at most one DOM-write pass per frame. `scheduleApply` short-circuits if `rafHandle` is already set.
- **GPU-friendly.** `font-variation-settings` is a paint, not a layout — modern engines composite axis changes without reflowing the surrounding text. The wrapper's metrics stay stable.
- **No cache, no observer.** Letter rects are read fresh each frame. `getBoundingClientRect` is fast in a hot path; caching would mean tracking resize, scroll, zoom, and font-load events for marginal gain.
- **Capability gate.** `isVariableFontSupported()` checks `CSS.supports('font-variation-settings: "wght" 400')` once at mount; on engines that don't support it, the pointermove handler bails immediately and the letters render flat.
- **Reduced-motion gate.** `prefers-reduced-motion: reduce` also bails the handler — letters freeze at base, no inline writes, no CSS transitions.

## CSS Animation Strategy

The CSS layer is one rule:

```css
.letter {
  display: inline-block;
  transition: font-variation-settings var(--vp-transition-ms, 150ms) ease-out;
  will-change: font-variation-settings;
}
```

Each axis interpolates independently between the previous and new written value. `ease-out` matches the proximity feel — fast initial response, soft settle as the cursor stops moving. `will-change` hints the renderer to keep these elements on a separate layer.

For reduced-motion or unsupported-VF engines, both the JS handler and the CSS transition are disabled, so the phrase reads as static type with whatever base axes were configured.

## State Flow Diagram

```
  [mounted]
    │  capability probe & reduced-motion check
    │  scheduleApply() once → all letters at baseSettings
    ▼
  [resting]
    │
    │  pointermove                       blur
    ▼                                     ▲
  [tracking] ── scheduleApply() ──┐       │
    │                              │       │
    │ writes font-variation-       │       │
    │ settings on every letter     │       │
    │ each rAF frame               │       │
    │                              │       │
    │  pointerleave / blur         │       │
    ▼                              │       │
  [resting] ◀────────────────────┘ [reset to baseSettings]
                                   │
                                   ▼

  prefers-reduced-motion / no VF support
    └─ pointermove bails; letters never animate.
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | required | Phrase rendered as per-letter spans. |
| `radius` | `number` | `120` | Cursor radius in pixels for the proximity falloff. |
| `falloffCurve` | `'linear' \| 'quadratic' \| 'gaussian'` | `'quadratic'` | Curve shape from peak to base. |
| `axes` | `AxisRange[]` | `[{axis:'wght',base:400,peak:800},{axis:'wdth',base:100,peak:125}]` | One or more variable-font axes to drive (`AxisRange = { axis: 'wght' \| 'wdth' \| 'slnt' \| 'opsz', base: number, peak: number }`). |
| `transitionMs` | `number` | `150` | Duration of the CSS transition between axis writes. |
| `class` | `string` | `''` | Extra classes on the wrapper span. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Browser without variable-font support | `isVariableFontSupported()` returns false; pointermove handler is a no-op; letters render at their base axes statically. |
| User has `prefers-reduced-motion: reduce` | Same bail as no-VF; CSS transition is also disabled. |
| Surrogate pair / emoji in `text` | `splitToLetters` uses `Array.from(text)`, so emoji and CJK ideographs stay as single tokens. |
| `radius` set to `0` | `falloff` returns `0` for any distance; every letter sits at base. |
| Pointer leaves the wrapper | `cursorPos = null`; next rAF resets every letter to `baseSettings`. |
| Tab focus into the wrapper | `handleFocus` plants a virtual cursor at the wrapper centre so keyboard users see the proximity peak; blur restores base. |
| Cursor outside the radius | `falloff` returns `0`; letter renders at base values — no DOM-write churn for off-axis letters because they all converge to the same string. |
| Custom font without all the requested axes | The axis tag is silently ignored by the renderer for that font; other axes still drive normally. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `onMount`, `untrack`, `SvelteMap` from `svelte/reactivity`.
- **A variable font** — bundled fallback chain: Inter Variable, Roboto Flex, Segoe UI Variable, San Francisco — all of which ship on modern OSes. No font CDN.
- **`CSS.supports`** (native) — capability gate for `font-variation-settings`.
- Zero external dependencies otherwise.

## File Structure

```
src/lib/components/VariableProximity.svelte   # implementation
src/lib/components/VariableProximity.md       # this file (rendered inside ComponentPageShell)
src/lib/components/VariableProximity.test.ts  # vitest unit tests for the pure helpers
src/routes/variableproximity/+page.svelte     # demo page
```
