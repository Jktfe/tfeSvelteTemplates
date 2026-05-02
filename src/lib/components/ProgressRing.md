# ProgressRing — Technical Logic Explainer

## What Does It Do? (Plain English)

ProgressRing is a circular progress indicator with two personalities. In **determinate** mode you pass a `value` from 0 to 100 and the ring fills smoothly to that percentage. In **indeterminate** mode it spins to communicate "still working — no estimate available". The centre of the ring is a snippet, so you can render the percent number, an icon, or anything else you want to sit at the bullseye.

Think of it as a sliced-donut gauge: the more of the donut is iced, the closer the task is to done.

## How It Works (Pseudo-Code)

```
props:
  value          = number 0..100              // ignored if indeterminate
  indeterminate  = boolean                    // default false
  size           = number (px)                // default 64
  stroke         = number (px)                // default 6
  trackColor     = CSS colour                 // default '#e2e8f0'
  progressColor  = CSS colour                 // default '#3b82f6'
  ariaLabel      = string                     // optional
  label          = optional snippet (centre content)

derive:
  radius        = (size - stroke) / 2
  circumference = 2 * π * radius
  clamped       = clamp(value, 0, 100)
  dashOffset    = circumference - (clamped / 100) * circumference
  valueText     = indeterminate ? undefined : "{round(clamped)} percent"

render <div role="progressbar"
            aria-label aria-valuemin aria-valuemax aria-valuenow aria-valuetext>
  <svg>
    <circle .progress-track  stroke={trackColor}    stroke-width={stroke} />
    <circle .progress-bar    stroke={progressColor} stroke-width={stroke}
            stroke-dasharray={circumference}
            stroke-dashoffset={indeterminate ? circumference * 0.75 : dashOffset}
            transform="rotate(-90 cx cy)" />
  </svg>
  if label snippet: <span class="progress-label">{render label()}</span>
</div>

if indeterminate:
  CSS rotates the SVG continuously (1s linear infinite)
else:
  CSS transitions stroke-dashoffset over 0.4s for smooth fill
```

## The Core Concept: Stroke-Dashoffset Geometry

A circle outline is drawn by two SVG attributes — `stroke-dasharray` (the on/off pattern) and `stroke-dashoffset` (where in the pattern to start). ProgressRing exploits this in a single equation.

Set the dash array equal to the full circumference: the dash is "fully on, never off". Then animate the offset from `circumference` (the dashed pattern starts one full circle in — the stroke is invisible) down to `0` (the pattern starts at the beginning — the stroke is fully visible).

```
stroke-dasharray  = C        ← C is the circumference
stroke-dashoffset = C        ← 0% drawn
stroke-dashoffset = C/2      ← 50% drawn
stroke-dashoffset = 0        ← 100% drawn
```

In code:

```
dashOffset = circumference - (clamped / 100) * circumference
```

The progress circle is rotated `-90°` so 0% sits at the top (12 o'clock) and growth sweeps clockwise — the convention every progress meter follows.

For indeterminate mode we cheat: `dashOffset` is fixed at `0.75 * circumference` (so a quarter-arc is visible) and the SVG element itself spins with `animation: progress-spin 1s linear infinite`. The visible arc sweeps around the track.

This same technique scales perfectly. Doubling `size` doubles `radius` and `circumference` together; the arithmetic still resolves to "this percentage of the circle is drawn". No magic numbers.

## Accessibility Notes

The wrapper carries the WAI-ARIA `progressbar` pattern:

| Attribute | Determinate | Indeterminate |
|-----------|-------------|---------------|
| `role` | `progressbar` | `progressbar` |
| `aria-valuemin` | `0` | omitted |
| `aria-valuemax` | `100` | omitted |
| `aria-valuenow` | `clamped` | omitted |
| `aria-valuetext` | `"75 percent"` | omitted |
| `aria-label` | from prop | from prop |

The ARIA spec is explicit: an indeterminate progressbar **must omit** `aria-valuenow`. ProgressRing follows that — screen readers announce "loading" or "busy" rather than reading a wrong number.

`aria-valuetext` provides a human-readable phrase ("seventy-five percent" rather than the bare number). The optional `label` snippet shows the same value visually.

## CSS Animation Strategy

**Determinate:** the `.progress-bar` circle has `transition: stroke-dashoffset 0.4s ease`. As `value` updates, the offset interpolates over 400ms, producing a smooth fill animation. SVG `stroke-dashoffset` animation is GPU-accelerated in modern browsers.

**Indeterminate:** the SVG element rotates as a whole with `animation: progress-spin 1s linear infinite`. The progress-bar's `transition` is set to `none` in indeterminate mode so the dash offset doesn't try to animate during the spin.

```css
@keyframes progress-spin {
  to { transform: rotate(360deg); }
}
```

`prefers-reduced-motion: reduce` slows the spin from 1 second to 4 seconds and removes the determinate fill transition. The slow rotation still indicates "working" without triggering vestibular discomfort. Stopping the spin entirely would be wrong here — a frozen ring reads as "stuck", which is exactly the wrong message.

## State Flow Diagram

```
                   ┌─────────────────────┐
                   │     indeterminate   │
                   │       == true       │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │   SPINNING          │
                   │   visible 270° arc  │
                   │   SVG rotates 360°  │
                   │   per second        │
                   │   ARIA: progressbar │
                   │   no valuenow       │
                   └─────────────────────┘

                   ┌─────────────────────┐
                   │    indeterminate    │
                   │       == false      │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │   DETERMINATE       │
                   │   value = N         │
                   │   dashOffset =      │
                   │   C - (N/100)*C     │
                   │   smooth 0.4s       │
                   │   transition        │
                   │   ARIA: valuenow=N  │
                   └─────────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Progress 0–100. Ignored when `indeterminate` is true. Clamped to bounds. |
| `indeterminate` | `boolean` | `false` | Spin mode — used when no estimate is available. |
| `size` | `number` | `64` | Diameter in pixels. |
| `stroke` | `number` | `6` | Ring thickness in pixels. |
| `trackColor` | `string` | `'#e2e8f0'` | Background ring colour. |
| `progressColor` | `string` | `'#3b82f6'` | Foreground (filled) stroke colour. |
| `ariaLabel` | `string` | `undefined` | Accessible label naming the indicator's purpose. |
| `label` | `Snippet` | `undefined` | Centred content snippet (percent, icon, etc.). |
| `class` | `string` | `''` | Extra classes appended to the wrapper. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `value` < 0 or > 100 | Clamped to `[0, 100]`. ARIA reports the clamped value, not the raw input. |
| `value` is `NaN` (e.g. division-by-zero in caller) | `Math.max(0, Math.min(100, NaN))` returns `NaN`; the dashoffset becomes `NaN` and SVG ignores it. Treat NaN-protection in your caller. |
| Switching from determinate → indeterminate while ring is partially filled | The ring jumps to the indeterminate 270° arc and starts spinning. No transition is animated between modes. |
| `stroke` larger than `size / 2` | Radius becomes ≤ 0 — the SVG draws nothing. Keep `stroke < size / 2`. |
| User has `prefers-reduced-motion: reduce` | Determinate fill transition is removed; indeterminate spin slows to 4 seconds. The ring still moves so users see "working", just gently. |
| `value` updates rapidly (every animation frame) | Each update kicks off a fresh 0.4s transition — visually smooth. CPU cost is trivial. |
| `label` snippet renders large content | The label is absolutely positioned with `inset: 0` and centred via flexbox; oversized content overflows the ring. Keep label content small. |

## Dependencies

- **Svelte 5.x** — `$props`, `$derived`, snippets.
- Zero external runtime dependencies. Pure SVG + CSS keyframes.

## File Structure

```
src/lib/components/ProgressRing.svelte         # component implementation
src/lib/components/ProgressRing.md             # this file (rendered inside ComponentPageShell)
src/lib/components/ProgressRing.test.ts        # vitest unit tests
src/routes/progressring/+page.svelte           # demo page
```
