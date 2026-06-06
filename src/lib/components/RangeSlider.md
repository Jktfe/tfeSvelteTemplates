# RangeSlider

## What Does It Do? (Plain English)

RangeSlider lets a person pick a *span* of values — a price band, an age bracket, a date window — rather than a single point. Two draggable thumbs sit on one track, and the colour between them shows the selected range at a glance. The lower thumb can never overtake the upper one (and vice versa), so the range stays valid no matter how hard you push.

Think of it as the twin-handle filter you see on shopping sites: "show me items between £20 and £80". You can drag either handle with a mouse or finger, or nudge it precisely with the keyboard.

## How It Works (Pseudo-Code)

```
state:
  value = { min, max }        // the selected range, bindable
  activeThumb = null          // 'min' | 'max' while dragging

derived:
  minPercent = (value.min - min) / (max - min) * 100
  maxPercent = (value.max - min) / (max - min) * 100
  // fill spans minPercent → maxPercent

setThumb(which, raw):
  v = snap(raw)               // round to step, clamp to [min, max]
  if which == 'min': value.min = MIN(v, value.max)   // can't cross up
  if which == 'max': value.max = MAX(v, value.min)   // can't cross down

events:
  on pointerdown thumb: activeThumb = which; capture pointer
  on pointermove:       if activeThumb: setThumb(activeThumb, valueAt(clientX))
  on pointerup:         release pointer; activeThumb = null

  on track pointerdown (not on a thumb):
    move the NEAREST thumb to the click point

  on keydown thumb:
    ArrowRight/Up   → +step      (Shift → +largeStep)
    ArrowLeft/Down  → -step      (Shift → -largeStep)
    PageUp/PageDown → ±largeStep
    Home            → floor (overall min, or other thumb)
    End             → ceiling (overall max, or other thumb)
```

## The Core Concept: Non-Crossing Clamp

The whole correctness of a dual-thumb slider rests on one rule: **a thumb's clamp ceiling/floor is the *other* thumb's current value, not the track's bound.** This is enforced in `setThumb` rather than as a post-hoc validation pass:

```
min thumb:  value.min = MIN(snapped, value.max)
max thumb:  value.max = MAX(snapped, value.min)
```

Worked example with `step = 5`, current `{ min: 48, max: 50 }`, pressing ArrowRight on the lower thumb:

```
raw      = 48 + 5 = 53
snapped  = 50        (53 clamped to overall max would be 53, but...)
value.min = MIN(53, value.max=50) = 50   ← parks against the upper thumb
```

The thumb stops *exactly* at the neighbour instead of jumping past or freezing one step short. The same `MIN`/`MAX` pair also keeps the ARIA contract honest: the lower thumb advertises `aria-valuemax={value.max}` and the upper advertises `aria-valuemin={value.min}`, so a screen reader always hears the live range, not a static bound.

## CSS Animation Strategy

Thumbs and the fill are positioned with a percentage `left` (and the fill with a percentage `width`), so the layout is purely declarative — the `$derived` percentages flow straight into `style:left`. A short `transition: left 0.08s ease` smooths keyboard nudges and track-clicks without lagging behind a live drag (80ms is below the threshold where a dragging finger feels rubber-banded).

Value bubbles fade in via `opacity` on hover / focus / active, never via `display`, so they stay in the accessibility tree and animate cheaply. Everything is `transform`/`opacity`/`left` — no layout-thrashing `top` animation. Under `prefers-reduced-motion: reduce` all three transitions collapse to `none`, so thumbs snap instantly.

## State Flow Diagram

```
            ┌─────────────┐
            │    idle     │
            └──────┬──────┘
       pointerdown │            ▲ pointerup / pointercancel
       on a thumb  ▼            │
            ┌─────────────┐     │
            │  dragging   │─────┘
            │ activeThumb │
            └──────┬──────┘
       pointermove │ (loop)
                   ▼
            setThumb → value clamped, fill + bubble update

   idle ──keydown (Arrow/Page/Home/End)──▶ setThumb ──▶ idle
   idle ──pointerdown on bare track─────▶ nearest thumb jumps ──▶ idle
```

## Props Reference

| Prop        | Type                            | Default          | Description                                                    |
| ----------- | ------------------------------- | ---------------- | -------------------------------------------------------------- |
| `value`     | `{ min: number; max: number }`  | `{ min: 20, max: 80 }` | Bindable selected range. Use `bind:value`.              |
| `min`       | `number`                        | `0`              | Lowest selectable value on the track.                          |
| `max`       | `number`                        | `100`            | Highest selectable value on the track.                         |
| `step`      | `number`                        | `1`              | Granularity for an Arrow key or a drag tick.                   |
| `largeStep` | `number`                        | `step * 10`      | Granularity for Shift+Arrow and PageUp/PageDown.               |
| `label`     | `string`                        | `'Range'`        | Group label; each thumb's aria-label derives from it.          |
| `format`    | `(value: number) => string`     | `String(value)`  | Formats bubble text and `aria-valuetext` (e.g. currency).      |
| `disabled`  | `boolean`                       | `false`          | Disables pointer + keyboard and removes thumbs from tab order. |
| `class`     | `string`                        | `''`             | Extra classes for the root element.                            |

## Edge Cases

| Case                                  | Behaviour                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| Thumbs pushed into each other         | They clamp to equal values; neither crosses. The range can be zero-width.                  |
| Click on the bare track               | The nearest thumb (by distance) jumps to the click point; ties favour the lower thumb.     |
| Fractional `step` (e.g. `0.1`)        | `snap` rounds to the step then trims floating-point dust with `toFixed(6)`.                |
| Value passed outside `[min, max]`     | Any committed change is clamped back into range by `snap`.                                 |
| `disabled` set                        | Pointer events ignored, thumbs get `tabindex="-1"` and `aria-disabled="true"`, opacity dims. |
| `max === min` (degenerate track)      | Percentages guard against divide-by-zero in `valueFromClientX`; thumbs sit at 0%.          |
| Drag released outside the component   | Pointer capture keeps the thumb tracking until `pointerup`, wherever the cursor ends up.   |

## Dependencies

Zero external dependencies. Pure Svelte 5 runes, scoped CSS, and the native Pointer Events API (`setPointerCapture` / `releasePointerCapture`) — no drag library, no icon set.

## File Structure

```
src/lib/components/
  RangeSlider.svelte      ← component (runes + scoped CSS)
  RangeSlider.md          ← this explainer
  RangeSlider.test.ts     ← vitest coverage (ARIA, keyboard, clamp)
src/routes/rangeslider/
  +page.svelte            ← demo wrapped in ComponentPageShell
```
