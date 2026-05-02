# RatingStars — Technical Logic Explainer

## What Does It Do? (Plain English)

A row of stars users click to rate something — a product, a restaurant, a movie, a customer-satisfaction prompt. The interactive mode shows a hover preview as the cursor moves across the row, so users see the rating they're about to commit before clicking. The read-only mode displays an existing rating with support for fractional values — a 4.5-star rating renders the fifth star as a half-fill via an SVG gradient.

Think of it like the bar at a coffee shop where you fill cups one by one — hovering over the third star tells you "if you click here, three cups get filled". Clicking commits the choice, and the read-only view shows whoever-rated-this's three filled cups.

## How It Works (Pseudo-Code)

```
state:
  value          = current rating (number, possibly fractional in read-only)
  hoverValue     = number | null     // the count user is hovering, or null
  displayValue   = hoverValue ?? value   // what we actually paint

events:
  on hover label i (interactive only):
    hoverValue = i + 1                // 1-indexed, matches the visual count

  on focus label i:
    hoverValue = i + 1                // keyboard parity with mouse hover

  on mouseleave row / focusout label:
    hoverValue = null                 // back to the committed value

  on radio change (selectValue v):
    if readonly: return
    fire onChange(v)
    parent updates `value` prop on the next render

derive star fill per index i:
  diff = displayValue - i
  if diff >= 1: 100% fill
  if diff >  0: round(diff * 100) % fill   // half-stars in read-only
  else:         0% fill
```

The interactive mode uses real `<input type="radio">` elements (visually hidden), one per star, so keyboard navigation, focus rings, and screen reader announcements come for free. The read-only mode skips the radios entirely and renders pure SVG with a gradient `<linearGradient>` that splits each star at the percent mark — that's how 4.5 renders as four full stars and one half-filled star.

## The Core Concept: Half-Star SVG Gradient

Most star-rating implementations either round to the nearest integer or hack two stacked stars (one empty under one with `clip-path`). This component uses an `SVG <linearGradient>` per star, with two stops at the *same* offset:

```
<linearGradient id="grad-{i}" x1="0" x2="100%" y1="0" y2="0">
  <stop offset="{fill}%" class="grad-stop-filled" />
  <stop offset="{fill}%" class="grad-stop-empty" />
</linearGradient>
```

Two stops at the same X coordinate make the colour change a hard step rather than a fade. So a star with `fill=50%` is half gold, half grey, divided exactly down the middle. The colours come from CSS classes on the stops (`stop-color: var(--rating-star-filled)`) so the dark-mode token flip applies automatically.

The path is the same Bezier-curve star outline used by every star rating UI on the web; the only thing that varies is `fill="url(#grad-{i})"` pointing at the per-star gradient.

The trade-off: each read-only row builds N gradients with unique IDs (`grad-{groupName}-{i}`). The `groupName` is auto-generated per component instance (`rating-${random}`) so multiple RatingStars on the same page don't collide on `defs/id`.

## Hover Preview Without Click-Through

A clean hover-preview UX has two requirements:

1. While hovering star *N*, the first *N* stars should appear filled — even though `value` hasn't changed yet.
2. Moving off the row should restore the *real* value's display.

The implementation uses two pieces of state:

```
hoverValue   = $state<number | null>(null)
displayValue = $derived(hoverValue ?? value)
```

`displayValue` is what the render path uses. Hover sets `hoverValue` to `i + 1`; mouse-leave clears it. The `??` (nullish coalescing) means a `hoverValue` of `0` (no stars hovered, technically) is still preferred over `value` — but `0` never appears as a hover value because the row only fires hover on a star, not the gap before star 1. Hovering off the row entirely fires `mouseleave` on the wrapper, which sets `hoverValue = null`.

Keyboard parity comes from `onfocusin` / `onfocusout` mirroring the hover events. When a keyboard user Tabs to the third star, `hoverValue = 3`, so the preview matches what a mouse user would see.

## State Flow Diagram

```
   READ-ONLY MODE                      INTERACTIVE MODE

   ┌────────────────┐                  ┌────────────────────┐
   │  value = 4.5   │                  │  value = 3         │
   │  display 4.5   │                  │  hoverValue = null │
   │  ★★★★★▿        │                  │  display 3         │
   │  (4 + half)    │                  │  ★★★☆☆             │
   └────────────────┘                  └─────────┬──────────┘
                                                 │
                                       hover star 4 (or focus)
                                                 │
                                                 ▼
                                       ┌────────────────────┐
                                       │  hoverValue = 4    │
                                       │  display 4         │
                                       │  ★★★★☆ (preview)   │
                                       └─────────┬──────────┘
                                                 │
                              ┌──────────────────┼──────────────────┐
                              │                  │                  │
                          click star 4     mouseleave row     focusout label
                              │                  │                  │
                              ▼                  ▼                  ▼
                    ┌────────────────┐  ┌────────────────────┐
                    │ onChange(4)    │  │ hoverValue = null  │
                    │ parent updates │  │ display = value    │
                    │ value to 4     │  └────────────────────┘
                    └────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current rating in `[0, max]`. Fractional values render half-stars in read-only mode. |
| `max` | `number` | `5` | Number of stars in the scale. |
| `readonly` | `boolean` | `false` | Disable interaction; render display-only mode (with half-star support). |
| `size` | `number` | `28` | Star size in px. |
| `name` | `string` | auto | Radio group name. Auto-generated; only set if you have multiple interactive ratings on one page. |
| `filledColor` | `string` | `undefined` | Filled star colour override (inline-style win). When omitted, `--rating-star-filled` CSS var controls. |
| `emptyColor` | `string` | `undefined` | Empty star colour override. When omitted, `--rating-star-empty` CSS var controls. |
| `ariaLabel` | `string` | `'Rating'` | Group label for screen readers (interactive mode). Read-only mode uses `aria-label="Rated X out of Y"` automatically. |
| `onChange` | `(v: number) => void` | `undefined` | Fired when user picks a value. |
| `class` | `string` | `''` | Extra classes on the wrapper. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Read-only with `value = 4.5` | Stars 1–4 fill 100%; star 5 fills 50% via the `<linearGradient>` two-stop-same-offset trick. |
| Interactive with `value = 0` | All stars empty; clicking any star sets it to `i + 1`. |
| User clicks the currently selected star | The radio fires `change` again with the same value; `onChange(value)` fires. Parent can choose to clear (set to `0`) on a same-value click. |
| Two interactive RatingStars on one page | Auto-generated `name` prefixes (`rating-${random}`) keep their radio groups distinct. |
| User has `prefers-reduced-motion: reduce` | The hover-scale transform is disabled; star transitions are instant. |
| Dark-mode active (system pref) | Empty star and focus-ring tokens flip to dark-friendly values; the gold filled colour deliberately stays the same so users can still recognise "filled" at a glance. |
| `filledColor` / `emptyColor` props passed | They write inline-style overrides on the wrapper, which win against the dark-mode media query (consumer wins). |
| Keyboard user Tabs into the row | First star receives focus (or the currently-selected star if `value > 0`). Arrow keys move between stars natively (radio group). |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$props`. Hover/focus state is one variable, display is one derived.
- Zero external dependencies. Native `<input type="radio">` (visually hidden), inline SVG, scoped CSS.

## File Structure

```
src/lib/components/RatingStars.svelte    # implementation
src/lib/components/RatingStars.md        # this file (rendered inside ComponentPageShell)
src/lib/components/RatingStars.test.ts   # vitest unit tests
src/routes/ratingstars/+page.svelte      # demo page
```
