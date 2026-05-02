# Slider — Technical Logic Explainer

## What Does It Do? (Plain English)

A continuous-value range input — volume, brightness, opacity, price filter, anywhere the user wants to *feel* a number rather than type it. Built on top of a native `<input type="range">`, so the whole keyboard-accessibility ladder (arrow keys step, Home/End jump to the extremes, PageUp/PageDown for a coarse jump, screen reader announcements) is free. The component's job is to dress up the track and thumb to match the design system, and to optionally float a value bubble above the thumb so the user can see exactly where they are.

Think of it like a mixing-desk fader: the platform supplies the engineering, this component supplies the cap.

## How It Works (Pseudo-Code)

```
state:
  value    = bindable number
  min/max/step = numeric bounds (default 0..100, step 1)
  size     = sm | md | lg  (sets --track-h and --thumb-size CSS vars)
  variant  = default | success | danger  (sets --fill-color)

derive percent:
  percent = ((value - min) / (max - min)) * 100

events:
  on input (browser fires this for every step):
    value = Number(event.target.value)
    fire onChange(value)

render:
  <input type="range" min={min} max={max} step={step} value={value}
         style="--percent: {percent}%">
  if showValue: floating bubble at left: percent
  if formatValue: bubble text = formatValue(value), else String(value)
```

The whole reactivity is one `oninput` handler and one `$derived` percent. Every other behaviour — keyboard handling, touch dragging on mobile, clamping to min/max, snapping to step — is delegated to the browser's range input. The component contributes styling and the optional bubble.

## The Core Concept: CSS Custom Properties Drive a Native Range

Styling `<input type="range">` is famously hostile because every browser uses different pseudo-elements: `::-webkit-slider-runnable-track`, `::-webkit-slider-thumb`, `::-moz-range-track`, `::-moz-range-progress`, `::-moz-range-thumb`. There's no portable cross-browser way to style "the filled portion left of the thumb".

The trick this component uses: **a linear-gradient on the track** that swaps colour at the percent mark.

```css
.slider-input::-webkit-slider-runnable-track {
  background: linear-gradient(
    to right,
    var(--fill-color) 0%,
    var(--fill-color) var(--percent),
    var(--slider-track-bg) var(--percent),
    var(--slider-track-bg) 100%
  );
}
```

The two stops at `var(--percent)` — `--fill-color` and `--slider-track-bg` — sit at the same X coordinate. That makes the colour change a hard step, not a fade, so the track looks like two solid bands meeting at the thumb's centre. As `--percent` updates from JS (via `style="--percent: {percent}%"` on the input), the gradient redraws with the new boundary.

Firefox doesn't need this trick — it has `::-moz-range-progress`, a real pseudo-element for the filled portion. The CSS is duplicated for each engine because there's no shared selector. The math is the same; only the hooks differ.

## CSS Animation Strategy & Theming

Two distinct animations:

1. **Thumb scale on press**: `transform: scale(1.15)` while `:active`, transitioning over 150 ms. Tells the user "I've grabbed it" without a colour change. Cursor flips to `grabbing` for the same reason.
2. **Focus ring on `:focus-visible`**: a 4px outset box-shadow tinted via `--slider-focus-ring`. Keyboard users get the ring; mouse users don't (focus-visible suppresses it for non-keyboard focus).

Reduced motion turns both off:

```css
@media (prefers-reduced-motion: reduce) {
  .slider-input::-webkit-slider-thumb,
  .slider-input::-moz-range-thumb {
    transition: none;
  }
  .slider-input:active::-webkit-slider-thumb,
  .slider-input:active::-moz-range-thumb {
    transform: none;
  }
}
```

The dark-mode strategy uses six CSS custom properties on `.slider-wrapper` (`--slider-track-bg`, `--slider-thumb-bg`, `--slider-label-fg`, `--slider-bubble-bg`, `--slider-bubble-fg`, `--slider-focus-ring`). Light defaults are inline; a `@media (prefers-color-scheme: dark)` block flips the chrome. The variant fill colour (`--fill-color`) and size tokens (`--track-h`, `--thumb-size`) deliberately don't flip — vivid blue/green/red read fine on either scheme, and a slider's "filled" colour is a brand signal users learn to recognise.

To override: target `.slider-wrapper` with ≥2-class specificity (e.g. `body .slider-wrapper.slider-wrapper`) so your declaration wins against the scoped `.slider-wrapper.svelte-HASH` baseline. The doubled-class trick is the cheapest unconditional override.

## State Flow Diagram

```
              ┌────────────────────────┐
              │   IDLE                 │
              │   value at some point  │
              │   in [min, max]        │
              └───────────┬────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   click track       drag thumb        keyboard
        │                 │                 │
        ▼                 ▼                 ▼
              ┌────────────────────────┐
              │   INPUT EVENT FIRES    │
              │   value = clamp(new,   │
              │     min, step, max)    │
              │   percent recomputed   │
              │   gradient redraws     │
              │   onChange(value)      │
              └───────────┬────────────┘
                          │
                          ▼
                       back to IDLE
                       (new position)

  Keyboard:
    ← / →    : step
    ↑ / ↓    : step
    Home     : value = min
    End      : value = max
    PageUp   : large step (typically 10% of range)
    PageDown : large step
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current value. Use `bind:value` for two-way sync. |
| `min` | `number` | `0` | Minimum value. |
| `max` | `number` | `100` | Maximum value. |
| `step` | `number` | `1` | Granularity. Use fractions for fine control (e.g. `0.05`). |
| `label` | `string` | `''` | Visible label rendered above the track. |
| `showValue` | `boolean` | `false` | Whether to render the value bubble above the thumb. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Track + thumb size (4/14, 6/18, 8/22 in px). |
| `variant` | `'default' \| 'success' \| 'danger'` | `'default'` | Fill colour: blue / green / red. |
| `disabled` | `boolean` | `false` | Sets the real `disabled` attribute. |
| `id` | `string` | auto | `id` on the input (used by the label `for` attribute). |
| `ariaLabel` | `string` | — | `aria-label` for sliders without a visible label. Defaults to `'Slider'`. |
| `formatValue` | `(v: number) => string` | — | Custom formatter for the value bubble (e.g. `v => `${v}%``). |
| `onChange` | `(value: number) => void` | — | Fires after each change with the new value. |
| `class` | `string` | `''` | Extra classes on the wrapper. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `value` set outside `[min, max]` by the parent | The browser's range input clamps to `[min, max]` on render; `oninput` returns the clamped value, which the component writes back to `value`. |
| `step` is fractional (e.g. `0.05`) and the user drags between increments | The browser snaps to the nearest step on `oninput`. Fractional precision is preserved as long as the parent doesn't round. |
| `min === max` | The browser disables drag (no range to slide across); arrow keys do nothing. |
| User presses Page Up / Page Down | Browser default: large step. Most browsers use 10% of `(max - min)`. |
| `formatValue` throws on a value | The bubble fails to render; the rest of the slider keeps working. Consumers should make `formatValue` total. |
| User has `prefers-reduced-motion: reduce` | Thumb-grow on press is disabled; the slider snaps without animation. |
| Dark-mode media flips chrome but consumer also overrode `--slider-track-bg` | The ≥2-class consumer override wins (declared on the same element with higher specificity than the scoped baseline). |
| Dragging on a touch device | The browser handles touch as a stream of `input` events. Same code path, no special-case needed. |

## Dependencies

- **Svelte 5.x** — `$bindable`, `$derived`, `$props`. The `oninput` handler is a single line.
- Zero external dependencies. Native `<input type="range">`, scoped CSS, no motion library, no touch shim.

## File Structure

```
src/lib/components/Slider.svelte    # implementation
src/lib/components/Slider.md        # this file (rendered inside ComponentPageShell)
src/lib/components/Slider.test.ts   # vitest unit tests
src/routes/slider/+page.svelte      # demo page
```
