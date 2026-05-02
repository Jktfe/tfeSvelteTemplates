# ProgressBar — Technical Logic Explainer

## What Does It Do? (Plain English)

ProgressBar is a horizontal bar that fills from left to right to show how much of a task is done. Pass a number from 0 to 100 and the fill animates smoothly to that percentage. Pass `null` and the bar switches into an indeterminate mode where a soft stripe slides across to communicate "still working — no estimate yet". You get sizes, colour variants, an optional value label, and a custom formatter — but underneath it's a single semantic `<progress>` element styled by a sibling `<div>`.

Think of it as a fuel gauge that screen readers can announce out loud.

## How It Works (Pseudo-Code)

```
props:
  value      = number | null                  // null = indeterminate
  max        = number (default 100)
  size       = 'sm' | 'md' | 'lg'             // bar height
  variant    = 'default' | 'success' | 'warning' | 'danger'
  showValue  = 'above' | 'inline' | 'none'
  format     = (v, m) => string               // optional custom formatter
  ariaLabel  = string                         // default 'Progress'

derive:
  isIndeterminate = value === null            // ! null, not 0
  safeValue       = isIndeterminate ? 0 : clamp(value, 0, max)
  percent         = isIndeterminate ? 0 : (safeValue / max) * 100
  isComplete      = !isIndeterminate && safeValue >= max
  labelText       = isIndeterminate
                      ? ''
                      : format ? format(safeValue, max)
                              : `${round(percent)}%`

render <div class="pb pb-{size} pb-{variant}">
  if showValue == 'above': render label row above
  <div class="pb-row">
    <div class="pb-track">
      <progress class="pb-native"   ← visually hidden but in the AT tree
                value={isIndeterminate ? undefined : safeValue}
                max
                aria-label={ariaLabel} />
      <div class="pb-fill"          ← visual bar (a styled sibling)
           style:width={isIndeterminate ? undefined : percent%}
           aria-hidden="true"></div>
    </div>
    if showValue == 'inline': render label tail
  </div>
</div>
```

## The Core Concept: Native `<progress>` For ARIA, Styled `<div>` For Looks

Native `<progress>` is the right semantic element for progress: screen readers announce "X percent" without us writing a single ARIA attribute. The problem is that styling native `<progress>` is a cross-browser nightmare — every browser exposes a different shadow DOM (Firefox, Chromium, Safari, and they're each different), and the visual treatment we want (rounded corners, gradient fills, animated stripes) cannot be achieved consistently.

ProgressBar's solution is to use both elements at once:

1. A real `<progress>` is in the DOM, **visually hidden** with the `clip` pattern but kept in the accessibility tree. It carries `value`, `max`, and `aria-label`. Screen readers see it and announce it.
2. A styled `<div class="pb-fill">` sits next to it. It's `aria-hidden="true"`. This is what users *see*. We can do anything to it: gradient, transition, indeterminate stripe, success-coloured pulse on completion.

This split gives us best of both: native semantics for AT, full design control for the visible bar. There's no fighting the user agent, no `::-webkit-progress-bar` hacks, no Firefox-specific overrides.

```
DOM:
  <progress class="pb-native"  hidden visually, present for AT />
  <div      class="pb-fill"    visible, aria-hidden />

User experience:    sees the styled div
Screen reader:      reads the <progress> element
```

## The `value === null` Convention For Indeterminate

A common bug in progress components: passing `0` accidentally trips into indeterminate mode. ProgressBar avoids that by reserving `null` (not `undefined`, not `0`) as the explicit indeterminate trigger.

```
isIndeterminate = value === null
```

`value: 0` is a *valid determinate state* — "0% done". `value: null` is "I don't know how far along we are". TypeScript enforces this in the prop type: `number | null`.

## CSS Animation Strategy

**Determinate fill:** the `.pb-fill` has `transition: width 0.3s ease`. As `value` changes, `width` animates smoothly. The colour comes from the variant class (`pb-success`, `pb-warning`, etc.). When `value` reaches `max`, the `pb-complete` class swaps the colour to green — a quiet acknowledgement of completion without a celebration animation.

**Indeterminate stripe:** the fill is given a fixed 50% width and a horizontal gradient from transparent through the variant colour to transparent. A keyframe animation slides the entire fill from `translateX(-100%)` to `translateX(200%)`:

```css
@keyframes pb-slide {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
```

The track has `overflow: hidden`, so the gradient appears to enter from the left, sweep across, and disappear out the right — a clean "still working" signal.

**Reduced motion:** `prefers-reduced-motion: reduce` removes both transitions. For indeterminate, the animation is replaced with a static half-opacity full-width fill. The user still sees the bar; it just doesn't move.

```css
@media (prefers-reduced-motion: reduce) {
  .pb-fill { transition: none; }
  .pb-indeterminate .pb-fill {
    animation: none;
    width: 100%;
    opacity: 0.5;
  }
}
```

## Performance

Updates are O(1) — a single `width` style mutation per change. Even at 60 FPS updates (e.g. byte-level upload progress) the cost is negligible. The native `<progress>` is updated by Svelte's normal reactivity.

For the indeterminate stripe, the animation is GPU-accelerated `transform`. No layout thrashing, no paint storms.

## State Flow Diagram

```
                 ┌─────────────────────┐
                 │  value === null     │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  INDETERMINATE      │
                 │  stripe slides      │
                 │  L→R infinitely     │
                 │  ARIA: <progress>   │
                 │   no value attr     │
                 └─────────────────────┘

                 ┌─────────────────────┐
                 │  value === number   │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  DETERMINATE        │
                 │  fill width =       │
                 │  (value/max) * 100% │
                 │  transition 0.3s    │
                 │  ARIA: <progress>   │
                 │   value=N max=M     │
                 └──────────┬──────────┘
                            │ value reaches max
                            ▼
                 ┌─────────────────────┐
                 │  COMPLETE           │
                 │  pb-complete class  │
                 │  fill colour → green│
                 └─────────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number \| null` | `0` | Current progress. `null` activates indeterminate mode. `0` is a valid determinate state. |
| `max` | `number` | `100` | Maximum value used to compute the percentage. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Bar height: 4px / 8px / 12px. |
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Colour scheme of the fill. |
| `showValue` | `'above' \| 'inline' \| 'none'` | `'none'` | Where the value label sits relative to the bar. |
| `format` | `(value: number, max: number) => string` | percent fn | Custom label formatter (e.g. "3 of 5 steps"). |
| `ariaLabel` | `string` | `'Progress'` | Forwarded to the native `<progress>` for SR announcement. |
| `class` | `string` | `''` | Extra classes appended to the wrapper. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `value` is greater than `max` | Clamped to `max`. The bar sits at 100%, `pb-complete` activates, the colour shifts green. |
| `value` is negative | Clamped to `0`. Avoids a negative-width fill that would render outside the track. |
| `value` is `null` (indeterminate) and `showValue` is set | The label is suppressed in indeterminate mode — there's nothing meaningful to display. |
| `value` is `0` (determinate zero) | Shown as `0%` with an empty fill. Distinct from indeterminate — `0` is not `null`. |
| `format` callback throws | Svelte's reactivity surfaces the error; the bar stops updating until the caller fixes the formatter. |
| User has `prefers-reduced-motion: reduce` | Determinate transition is removed; indeterminate stripe replaced with a static half-opacity full-width fill. |
| Custom `max` (e.g. `max=5` with `value=3`) | Internal percent calculation still produces 60%, fill width is 60%. The native `<progress>` reports `value=3 max=5` to AT. |
| Multiple bars on a page, all updating | Each is independent — no shared timer, no contention. CSS animations are GPU-isolated. |

## Dependencies

- **Svelte 5.x** — `$props`, `$derived`.
- Zero external runtime dependencies. Pure scoped CSS, native `<progress>` for accessibility.

## File Structure

```
src/lib/components/ProgressBar.svelte         # component implementation
src/lib/components/ProgressBar.md             # this file (rendered inside ComponentPageShell)
src/lib/components/ProgressBar.test.ts        # vitest unit tests
src/routes/progressbar/+page.svelte           # demo page
```
