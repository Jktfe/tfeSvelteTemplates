# Countdown — Technical Logic Explainer

## What Does It Do? (Plain English)

Countdown displays a live timer ticking down from "now" toward a target date — days, hours, minutes, and seconds (or any subset). When a number changes, a small flip animation cues the change so the reader's eye latches onto it. When the target hits zero the component fires `onComplete` and either swaps to a completion message or hides itself.

Three formats: `cards` (boxed segments with labels), `labels` (numbers with units beneath), `compact` (`HH:MM:SS` separated by a glyph). Think of it as the digital alarm clock at midnight on New Year's Eve, just packaged as a Svelte component.

## How It Works (Pseudo-Code)

```
state:
  segments        : Array<{ value, label, unit }>
  isComplete      = false
  intervalId      = setInterval handle
  previousValues  : Record<unit, number>   // tracked for the change-flash class

helpers:
  parseTargetDate(target)        → Date  (accepts Date | number | string)
  getUnitLabel(unit, value)      → singular or plural label
  formatValue(value, padZeros)   → '05' | '5'
  hasValueChanged(unit, value)   → bool   (used to drive .countdown__segment--changed)

calculateTimeRemaining():
  target = parseTargetDate(targetDate)
  if target invalid:
    segments = zeros; clear interval; return
  diff = target - now
  if diff <= 0:
    if not isComplete:
      isComplete = true
      segments = zeros
      onComplete?()
    return
  totalSeconds = floor(diff / 1000)
  totalMinutes = floor(totalSeconds / 60)
  totalHours   = floor(totalMinutes / 60)
  totalDays    = floor(totalHours / 24)
  values = {
    days:    totalDays,
    hours:   totalHours   % 24,
    minutes: totalMinutes % 60,
    seconds: totalSeconds % 60
  }
  for unit in units: previousValues[unit] = current segments[unit].value
  segments = units.map(unit => ({ value: values[unit], label: ..., unit }))

on mount:
  calculateTimeRemaining()
  intervalId = setInterval(calculateTimeRemaining, 1000)

on destroy:
  clearInterval(intervalId)
```

The whole thing is a `setInterval` ticking once per second. Every tick recomputes from scratch — there's no incremental subtraction, so clock skew, sleep/resume, and tab-throttling all heal themselves on the next tick.

## The Core Concept: Modular Arithmetic, Not Incremental Subtraction

A naive countdown subtracts 1 from `seconds` each tick, rolls over to `minutes` at zero, and so on. That accumulates drift over hours (the `setInterval` is approximate, especially when the tab is throttled). The fix is to recompute every unit from a single ground-truth `diff = target - now` on each tick:

```
  diff = target.getTime() - now.getTime()        (milliseconds)

  totalSeconds = ⌊ diff / 1000 ⌋
  totalMinutes = ⌊ totalSeconds / 60 ⌋
  totalHours   = ⌊ totalMinutes / 60 ⌋
  totalDays    = ⌊ totalHours / 24 ⌋

  values:
    days    = totalDays
    hours   = totalHours   mod 24
    minutes = totalMinutes mod 60
    seconds = totalSeconds mod 60
```

```
  Example: diff = 90061000 ms

  totalSeconds = 90061
  totalMinutes = 1501
  totalHours   = 25
  totalDays    = 1

  display:
    days:    1
    hours:   25 mod 24 = 1
    minutes: 1501 mod 60 = 1
    seconds: 90061 mod 60 = 1

  → "1 day, 1 hour, 1 minute, 1 second"
```

This means a tab that was suspended for 30 minutes resumes at the *correct* time on the next tick, not 30 minutes behind. The `units` prop selects which subset to display; the modular arithmetic always runs over all four so the maths is consistent.

## CSS Animation Strategy

When `previousValues[unit] !== currentValue`, the segment gains a transient `.countdown__segment--changed` class. CSS keyframes fade the new value in or apply a small flip-style transform — enough to draw the eye without distracting. The component reads `prefers-reduced-motion` indirectly via the global media query — the keyframes are wrapped in `@media (prefers-reduced-motion: no-preference)` so reduced-motion users see static digit changes.

`compact` format uses a separator span between segments (default `:`); `cards` and `labels` use flex gap. The `aria-live="polite"` region announces ticks to assistive tech — but at one update per second it doesn't spam screen readers; the `aria-label` on each segment carries the human-readable form (`"5 Hours"`).

## Performance

- One `setInterval` at 1 Hz. Cheap.
- Every tick recomputes from scratch; no accumulator drift.
- `previousValues` is a tiny `Record<CountdownUnit, number>`, not a Map, so reads/writes are O(1).
- DOM cost: one segment per displayed unit (max 4). Re-renders are flat regardless of how long until the target.
- `setInterval` is cleared in `onDestroy` — no orphan timer after navigation.
- Invalid `targetDate` clears the interval immediately and renders zeros, so we don't burn ticks on garbage input.

## State Flow Diagram

```
  [mounted]
        │
        │  calculateTimeRemaining() once
        │  setInterval(calculateTimeRemaining, 1000)
        ▼
  [ticking]   segments update each second
        │
        │  diff > 0
        ◀──── (loop) ────┐
        │                │
        │  invalid date  │
        ▼                │
  [zeroed]               │
        │                │
        │                │
        ▼                │
        ◀────────────────┘
        │
        │  diff <= 0  (first time)
        ▼
  [complete]   isComplete = true
                onComplete?()
                if hideOnComplete: render nothing
                else: render completedMessage

  on destroy: clearInterval
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `targetDate` | `Date \| number \| string` | required | Target date/time. String parsed by `new Date()`; number is a UTC ms timestamp. |
| `units` | `CountdownUnit[]` | `['days', 'hours', 'minutes', 'seconds']` | Which units to display (`CountdownUnit = 'days' \| 'hours' \| 'minutes' \| 'seconds'`). |
| `format` | `'cards' \| 'labels' \| 'compact'` | `'cards'` | Display style. `compact` separates segments with `separator`; `cards`/`labels` use the unit label below. |
| `showLabels` | `boolean` | `true` | Show "Days" / "Hours" / etc. labels (ignored in `compact` mode). |
| `separator` | `string` | `':'` | Glyph rendered between segments in `compact` mode. |
| `padZeros` | `boolean` | `true` | Zero-pad single digits (`05` instead of `5`). |
| `completedMessage` | `string` | `"Time's up!"` | Text shown when the countdown reaches zero. |
| `onComplete` | `() => void` | `undefined` | Callback fired exactly once when the countdown completes. |
| `hideOnComplete` | `boolean` | `false` | Hide the entire component when complete (otherwise `completedMessage` is shown). |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `targetDate` is in the past at mount | `diff <= 0` immediately; `isComplete = true`; `onComplete` fires once; component renders the completion message. |
| `targetDate` is invalid (e.g. `"not-a-date"`) | `parseTargetDate` returns an invalid Date; `isNaN(target.getTime())` triggers; segments render zeros; interval cleared. |
| Tab is suspended (browser throttling) | On resume, the next tick recomputes from `target - now` — display heals automatically, no skew. |
| User changes system clock backwards | Display jumps forward (more time remaining); the recompute uses the system clock as ground truth. |
| `units` prop is empty | Loop renders nothing; the wrapper `aria-live` region remains, just with no segments. |
| `onComplete` is called multiple times concurrently | Guarded by `if (!isComplete)` — the callback fires exactly once even if the interval re-enters. |
| Component unmounts before completion | `onDestroy` clears the interval; no callback fires. |
| `hideOnComplete=true` on completion | `{#if !hideOnComplete || !isComplete}` evaluates false; the entire wrapper is removed from the DOM. |

## Dependencies

- **Svelte 5.x** — `$state`, `$props`, `onMount`, `onDestroy`.
- **`$lib/types`** — shared `CountdownProps`, `CountdownUnit`, `CountdownSegment` interfaces.
- Zero external dependencies — no animation library, native `setInterval` and `Date`.

## File Structure

```
src/lib/components/Countdown.svelte   # implementation
src/lib/components/Countdown.md       # this file (rendered inside ComponentPageShell)
src/lib/components/Countdown.test.ts  # vitest unit tests
src/routes/countdown/+page.svelte     # demo page
```
