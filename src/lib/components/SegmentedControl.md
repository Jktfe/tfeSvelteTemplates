# SegmentedControl — Technical Logic Explainer

## What Does It Do? (Plain English)

A row of mutually-exclusive options visually joined into one control. iOS-style picker for switching between modes (List / Grid / Cards), time ranges (1D / 1W / 1M), or simple tab bars. Single-select only — the joined affordance reads as "pick one of these". A sliding indicator animates from the previous selection to the new one, so the eye tracks the change rather than re-scanning the row to find what's active now.

Think of it as a row of station-preset buttons on a car radio — exactly one is pressed in at any time, and pressing a new one makes the previous one pop out as this one goes down.

## How It Works (Pseudo-Code)

```
state:
  value         = bindable string (the selected value)
  options       = [{ value, label, icon? }]

derive activeIndex:
  i = options.findIndex(o => o.value === value)
  return Math.max(0, i)        // clamp -1 → 0 so the indicator
                                 // doesn't fly off-screen pre-mount

events:
  on radio change (newValue):
    value = newValue
    fire onChange(newValue)

render:
  container with --active-index and --option-count CSS vars
  ::before pseudo-element = the sliding indicator
  for each option:
    <label> wrapping a hidden radio <input> + label text
```

The sliding indicator is a single CSS pseudo-element (`::before` on the container) that translates by `activeIndex × 100% of segment-width`. One animated element, regardless of how many segments — which is why the slide stays smooth no matter how many options you give it.

## The Core Concept: One Indicator, Many Segments

The naïve approach is to colour the active segment's background. That works visually but produces a jarring effect when transitioning: as one segment turns dark, the previous one turns light, and the eye sees two simultaneous changes rather than one continuous motion.

This component flips the model. **The "active" colour is owned by a single sliding pseudo-element**, not by the segments themselves:

```css
.segmented::before {
  content: '';
  position: absolute;
  width: calc((100% - 0.5rem) / var(--option-count));
  background: var(--active-bg);
  transform: translateX(calc(var(--active-index) * 100%));
  transition: transform 0.18s ease;
}
```

`--option-count` and `--active-index` are written by Svelte as inline custom properties on the container. The pseudo-element computes its width as `100% / option-count` and translates by `active-index × 100%-of-its-own-width`. When `--active-index` changes, the translate updates, and CSS interpolates the transform over 180 ms.

The segments themselves are transparent over the indicator (`isolation: isolate` + `z-index` ordering on the container). The active label gets a colour change to `--active-text` for contrast against the indicator background.

Why `transform` and not `left`? Transforms compose on the GPU and never trigger layout. Animating `left` would force the browser to re-layout the row on every frame.

## Native Radios as Click Targets

Each segment wraps a native `<input type="radio">` that's positioned absolutely to fill the entire segment, with `opacity: 0`:

```css
.segment input {
  position: absolute;
  inset: 0;
  opacity: 0;
}
```

This single move buys three things:

1. **Clickability.** The whole segment is a click target — clicking the icon, the label, or empty padding all hit the radio.
2. **Keyboard nav for free.** Browsers handle `Arrow ←/→/↑/↓` and `Home/End` on radio groups natively. No custom keydown handler needed.
3. **Screen reader semantics.** AT announces "*View mode, list, radio, 1 of 3, selected*" — exactly the right wording. We use `role="radiogroup"` on the container with an `aria-label` to name the group.

The `name` prop seeds the radio group: each radio shares the same `name`, which is how the browser enforces single-select. If two SegmentedControls render on the same page without distinct `name` props, they'd interfere — so the default is an auto-generated random suffix.

## State Flow Diagram

```
              ┌──────────────────────┐
              │   value = 'list'     │
              │   activeIndex = 0    │
              │   indicator at 0%    │
              └───────────┬──────────┘
                          │
                  user clicks 'grid'
                          │
                          ▼
              ┌──────────────────────┐
              │   value = 'grid'     │
              │   activeIndex = 1    │
              │   indicator slides   │ ← CSS transition: 180ms
              │   to 100%            │   (or instant if reduced-motion)
              │   onChange('grid')   │
              └──────────────────────┘

  Keyboard:
    Tab       : focus the radiogroup
    Arrow R/D : focus & select next radio
    Arrow L/U : focus & select previous radio
    Home      : focus & select first
    End       : focus & select last
    Space     : (already selected on focus — no-op)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `{ value: string; label: string; icon?: string }[]` | required | Segments to render. |
| `value` | `string` | required (bindable) | Selected value. Use `bind:value` for two-way sync. |
| `size` | `'sm' \| 'md'` | `'md'` | Control height (28 px vs 32 px). |
| `equalWidth` | `boolean` | `true` | All segments share the same width. Set to `false` for content-fit segments. |
| `activeBg` | `string` | `'#ffffff'` | Active indicator background colour. |
| `activeText` | `string` | `'#1f2937'` | Active label text colour. |
| `ariaLabel` | `string` | `'Segmented control'` | radiogroup label. |
| `name` | `string` | auto | Radio group name. Auto-generated; only set if you have multiple controls on one page and want stable IDs. |
| `onChange` | `(value: string) => void` | — | Fires after selection changes. |
| `class` | `string` | `''` | Extra classes on the wrapper. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `value` doesn't match any option (e.g. uninitialised state) | `findIndex` returns `-1`; clamped to `0` so the indicator parks on the first segment. The first segment is *not* selected — `value` stays unchanged. |
| `equalWidth={false}` and segments have different label lengths | Indicator width still computes from `option-count`, which assumes equal segments. The slide will visually mis-align with content-fit segments. Stick to `equalWidth` unless you accept that compromise. |
| User has `prefers-reduced-motion: reduce` | The 180 ms slide is removed; the indicator teleports to the new position. |
| Six or more segments | They get cramped on mobile and the joined affordance stops reading as "pick one". Switch to Tabs or a `<select>` dropdown. |
| Two SegmentedControls on the same page without `name` overrides | Each gets an auto-generated `name`; the radio groups don't interfere. |
| Touch device with no hover | Tap selects exactly like click — no hover-only state. |
| `options` array is empty | The radiogroup renders with no segments; `--option-count: 0` makes the indicator width `Infinity` divided. The browser handles this gracefully (no segments to display). Don't pass an empty array. |

## Dependencies

- **Svelte 5.x** — `$bindable`, `$derived`, `$props`. One handler, one derived index.
- Zero external dependencies. Native `<input type="radio">`, native `<label>`, scoped CSS.

## File Structure

```
src/lib/components/SegmentedControl.svelte    # implementation
src/lib/components/SegmentedControl.md        # this file (rendered inside ComponentPageShell)
src/lib/components/SegmentedControl.test.ts   # vitest unit tests
src/routes/segmentedcontrol/+page.svelte      # demo page
```
