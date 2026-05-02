# Tooltip — Technical Logic Explainer

## What Does It Do? (Plain English)

Wraps any trigger element — a button, link, or icon — and shows a small floating panel of helpful text when the user hovers over it or focuses it with the keyboard. The panel has an arrow pointing back at the trigger, so the connection is unambiguous even when several tooltips are visible. Press Escape (or move the pointer away) and it disappears.

Think of it as a labelled sticky note that appears just long enough to answer "what does this do?" then steps out of the way. Crucially, it works for keyboard users too — focus alone triggers it, not just mouse hover.

## How It Works (Pseudo-Code)

```
state:
  visible    = false
  showTimer  = null
  hideTimer  = null
  tooltipId  = id ?? auto-generated

events:
  on pointer enter trigger:
    cancel hideTimer
    schedule showTimer = after showDelay → visible = true

  on pointer leave trigger:
    cancel showTimer
    schedule hideTimer = after hideDelay → visible = false

  on focus trigger:                      // keyboard / programmatic
    visible = true (immediate, no delay)

  on blur trigger:
    visible = false (immediate)

  on keydown Escape (anywhere on trigger or tooltip):
    visible = false
    cancel both timers

derived markup:
  trigger gets   aria-describedby = tooltipId   (only when visible)
  tooltip body   role="tooltip" id=tooltipId    (only mounted when visible)
                                                 positioned by placement prop
```

The trigger is wrapped in a positioned wrapper; the tooltip is an absolutely-positioned sibling, so it floats out of normal flow without affecting layout. The CSS arrow is a triangle drawn with `border` tricks on a pseudo-element — no SVG, no extra DOM.

## Positioning Algorithm

Placement is purely declarative — the `placement` prop selects one of four pre-baked CSS rules. Each sets the tooltip's `top`/`bottom`/`left`/`right` relative to the wrapper, plus a `transform` to centre on the cross-axis:

```
placement = 'top'     bottom: 100%; left: 50%;  transform: translate(-50%, -8px);
placement = 'bottom'  top: 100%;    left: 50%;  transform: translate(-50%,  8px);
placement = 'left'    right: 100%;  top: 50%;   transform: translate(-8px, -50%);
placement = 'right'   left: 100%;   top: 50%;   transform: translate( 8px, -50%);
```

The `8px` offset gives the arrow room between trigger and body. The arrow itself is a `::after` pseudo-element on `.tooltip-body`; its `border-color` is set so three sides are transparent and the fourth points back at the trigger.

This is deliberately *static positioning* — no Floating UI, no popper, no auto-flip on viewport edges. Trade-off: at the screen's literal corners, a tooltip can clip. We accept this for a 2KB component; pages where edge-clipping matters should use a Floating UI integration or `MorphingDialog` instead.

## Accessibility Deep-Dive

Three architectural choices make this work for screen-reader and keyboard users:

1. **`aria-describedby`, not `aria-labelledby`.** The trigger keeps its own accessible name (its visible label or `aria-label`). The tooltip is supplemental — answering "any extra detail?" — which is exactly what `describedby` semantics carry.

2. **Focus triggers, not just hover.** The same handlers that fire on `pointerenter` / `pointerleave` also fire on `focus` / `blur`. A keyboard user tabbing to the trigger sees the tooltip; a mouse user hovering sees the same thing.

3. **Escape closes everywhere.** Even if focus is *inside* the tooltip body (rich `tip` snippet with a link), Escape clears `visible` immediately and cancels any pending show timer. Matches modal-dismissal expectations.

The tooltip element is **only mounted** when `visible === true` — it doesn't sit in the DOM with `display: none`. That keeps the screen-reader tree small and avoids stale `aria-describedby` references when the tooltip isn't being shown.

## CSS Animation Strategy

A short `transform` + `opacity` fade frames the appearance. Pure CSS — no JS animation library:

```css
.tooltip-body {
  opacity: 0;
  transform: translate(...) scale(0.96);
  transition: opacity 120ms ease, transform 120ms ease;
}
.tooltip-body[data-visible='true'] {
  opacity: 1;
  transform: translate(...) scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .tooltip-body { transition: none; }
}
```

`scale(0.96) → scale(1)` is too small to read as motion but lifts the body subtly off the trigger — the eye reads it as "popping forward". `transform` + `opacity` are compositor-only, so the animation can't trigger layout.

## State Flow Diagram

```
                ┌────────────────┐
                │     hidden     │  ← initial
                │  visible=false │
                └──┬───────────┬─┘
                   │           │
      hover / focus│           │ (hideTimer fires)
                   ▼           │
              ┌──────────┐     │
              │ pending  │     │
              │ showTimer│     │
              └────┬─────┘     │
                   │ delay     │
                   ▼           │
              ┌─────────────┐  │
              │   visible   │──┘
              │ aria-       │
              │ describedby │
              └─────┬───────┘
                    │ leave / blur / Esc
                    ▼
                hideTimer  →  hidden
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `''` | Plain-text tooltip body. Ignored if `tip` snippet is supplied. |
| `placement` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Side of the trigger the tooltip sits on. |
| `showDelay` | `number` | `200` | Milliseconds before showing on hover. Focus is always immediate. |
| `hideDelay` | `number` | `0` | Milliseconds before hiding after leave. Useful when the tooltip body is interactive. |
| `id` | `string` | auto | Custom id for the tooltip element (auto-generated otherwise — used for `aria-describedby`). |
| `class` | `string` | `''` | Extra classes appended to the wrapper. |
| `children` | `Snippet` | required | The trigger element to wrap. |
| `tip` | `Snippet` | — | Rich-content body (overrides `text`). Use for inline `<strong>`, `<kbd>`, etc. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Trigger sits at the right or bottom edge of the viewport | Tooltip may clip outside the viewport. Use a different `placement` or wrap in a container with `overflow: visible` — this component does not auto-flip. |
| User has `prefers-reduced-motion: reduce` | The fade/scale transition is dropped; show/hide becomes an instant swap. |
| User hovers the trigger and quickly tabs away | Hover handler cleared on blur; tooltip never appears. No flash. |
| User focuses the trigger and immediately presses Escape | `visible` flips to `false`, both timers cancelled. Trigger keeps focus. |
| Tooltip body itself contains a focusable element (rich `tip`) | Tab moves into the body. Blur on the trigger doesn't fire while focus is inside, so `hideDelay > 0` is required to let the user move there. |
| Multiple Tooltips on one page | Each gets its own auto-generated `id`. `aria-describedby` references are unique. |
| Trigger removed from DOM while tooltip is visible | Tooltip unmounts with the wrapper; no orphaned panel. |
| Page navigates while a tooltip is open | SvelteKit unmounts the route; the tooltip goes with it. |

## Dependencies

- **Svelte 5.x** — runes (`$state`, `$derived`) and snippets are core to the implementation.
- Zero external dependencies — pure CSS for panel, arrow, and animation.

## File Structure

```
src/lib/components/Tooltip.svelte         # implementation
src/lib/components/Tooltip.md             # this file (rendered inside ComponentPageShell)
src/lib/components/Tooltip.test.ts        # unit tests
src/routes/tooltip/+page.svelte           # demo page
docs/THEMING.md                           # the (0,2,0) specificity override mechanism
```
