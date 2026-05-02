# MorphingDialog — Technical Logic Explainer

## What Does It Do? (Plain English)

MorphingDialog is a modal dialog that doesn't just appear — it grows out of the element you clicked. Click a card, and the card visually expands and transforms into the dialog at the centre of the screen; close the dialog, and it shrinks back into the card. The trigger and the dialog are visually the *same* object, just at different sizes and positions, which gives the user a continuous spatial cue about where the content came from.

Think of it as the visual sleight-of-hand from iOS or macOS, where tapping an album cover doesn't open a separate detail view — the cover itself zooms up and becomes the detail view.

## How It Works (Pseudo-Code)

```
state:
  open               = false                              // bindable
  phase              ∈ { 'idle', 'morphing-open', 'open', 'morphing-close' }
  triggerRect        = null | DOMRect                      // captured at click
  triggerEl          = bound trigger wrapper
  dialogEl           = bound dialog element
  unlockScroll       = null | () => void                   // from scrollLock util
  previousFocus      = null | HTMLElement
  prefersReducedMotion = boolean

events:
  on trigger click:
    if phase !== 'idle': return
    triggerRect   = triggerEl.getBoundingClientRect()
    previousFocus = document.activeElement
    unlockScroll  = lockScroll()
    open          = true

    if prefersReducedMotion:
      phase = 'open'
      requestAnimationFrame(focusDialog)
    else:
      phase = 'morphing-open'
      setTimeout(() => { phase = 'open'; focusDialog() }, duration)

  on close request (Escape, overlay click, or close button):
    if phase !== 'open': return

    if prefersReducedMotion:
      phase = 'idle'; open = false; cleanup()
    else:
      triggerRect = triggerEl.getBoundingClientRect()      // re-measure (scroll may have shifted it)
      phase = 'morphing-close'
      setTimeout(() => { phase = 'idle'; open = false; cleanup() }, duration)

  on Tab / Shift+Tab while phase === 'open':
    cycle focus inside the dialog (focus trap)

  on Escape (if closeOnEscape):
    request close

  on overlay click (if closeOnOverlay AND target === currentTarget):
    request close

cleanup():
  unlockScroll?.()
  previousFocus?.focus()
```

The dialog renders only while `phase !== 'idle'`. Each phase corresponds to a different CSS class on the dialog element (`--at-trigger`, `--at-center`, `--closing`), and CSS transitions handle the actual morph between sizes and positions.

## The Core Concept: Geometry Capture + CSS Variable Choreography

A traditional modal animates `opacity` and maybe a small `scale`. MorphingDialog animates `top`, `left`, `width`, `height`, and `border-radius` from the trigger's exact rect to the dialog's centred final size. The trick is making the browser do all the maths via CSS variables.

At click time, the component captures the trigger's bounding rect:

```
triggerRect = triggerEl.getBoundingClientRect()
// triggerRect = { top: 124, left: 56, width: 200, height: 80, ... }
```

It then writes those values as CSS custom properties on the dialog element:

```
--morph-start-x: 56px;
--morph-start-y: 124px;
--morph-start-w: 200px;
--morph-start-h: 80px;
--morph-duration: 400ms;
--morph-easing:   cubic-bezier(0.4, 0, 0.2, 1);
```

The dialog's CSS uses these variables as the *starting* values for the transition:

```css
.morphing-dialog {
  position: fixed;
  top:    var(--morph-start-y);
  left:   var(--morph-start-x);
  width:  var(--morph-start-w);
  height: var(--morph-start-h);
  border-radius: 8px;

  transition:
    top    var(--morph-duration) var(--morph-easing),
    left   var(--morph-duration) var(--morph-easing),
    width  var(--morph-duration) var(--morph-easing),
    height var(--morph-duration) var(--morph-easing),
    border-radius var(--morph-duration) var(--morph-easing);
}
```

A keyframe animation (`morph-to-center`) then sweeps those properties to the centred final size:

```css
@keyframes morph-to-center {
  0%   { /* trigger position via vars */ }
  100% {
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width:  min(var(--dialog-width, 560px), calc(100vw - 2rem));
    height: auto;
    border-radius: var(--dialog-radius, 16px);
  }
}
```

The result: the dialog box paints at the trigger's rect, then animates over `duration` ms to a centred box of size `dialogWidth`. On close, the same variables are re-read (in case the page has scrolled) and the dialog animates back.

```
phase: idle             phase: morphing-open      phase: open
nothing rendered    →   ┌─────────────┐       →    ┌───────────────────┐
                        │             │            │                   │
                        │  trigger    │            │   centred dialog  │
                        │  rect       │            │   (full content)  │
                        └─────────────┘            │                   │
                                                   └───────────────────┘
                        animates ──────────────────▶
```

## Focus Trapping

When the dialog opens, focus moves to the first focusable element inside. While open, Tab and Shift+Tab cycle focus inside the dialog only. On close, focus returns to whoever had it before the dialog opened — typically the trigger.

```
[trigger] ── click ──▶ [dialog opens]
                              │
                              ▼
                      first focusable inside dialog gets focus
                              │
                              ▼
                Tab        ──▶ next focusable
                Shift+Tab  ──▶ prev focusable
                Tab on last     ──▶ wrap to first
                Shift+Tab first ──▶ wrap to last
                              │
                  Escape / overlay click / close button
                              │
                              ▼
                      [dialog closes, animation runs]
                              │
                              ▼
                      previousFocus.focus()  // back to trigger
```

The focus trap is implemented inline in the global `keydown` handler:

```
on keydown Tab AND phase === 'open':
  focusables = dialogEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
  if focusables empty: return
  first = focusables[0]; last = focusables[last index]
  if Shift+Tab AND active === first: preventDefault; last.focus()
  if Tab       AND active === last:  preventDefault; first.focus()
```

The dialog itself carries `tabindex="-1"` so it can receive programmatic focus when there's no focusable content inside (e.g. a read-only confirmation message).

Scroll-locking is delegated to a shared utility (`$lib/scrollLock`) that snapshot-and-restores `body.style.overflow`, so a stylesheet that explicitly sets `body { overflow: scroll; }` is preserved on close.

## CSS Animation Strategy

Two transitions run in parallel:

1. **Dialog box morph** — `top`, `left`, `width`, `height`, `border-radius` driven by either the keyframe (open) or class change (close), all using the same `--morph-duration` and `--morph-easing`.
2. **Overlay fade** — `background-color` and `backdrop-filter: blur(...)` transition between transparent and the configured `overlayColor`/`overlayBlur`. Same duration and easing.

```css
.morphing-overlay {
  background-color: transparent;
  backdrop-filter: blur(0px);
  transition:
    background-color var(--morph-duration) var(--morph-easing),
    backdrop-filter  var(--morph-duration) var(--morph-easing);
}

.morphing-overlay--visible {
  background-color: var(--overlay-color);
  backdrop-filter: blur(var(--overlay-blur));
}
```

`reduced-motion` shortcuts the entire morph: `setTimeout(... duration)` is never queued; the dialog jumps from `idle` straight to `open` and back. The CSS layer also respects the preference:

```css
@media (prefers-reduced-motion: reduce) {
  .morphing-dialog,
  .morphing-overlay {
    transition-duration: 0ms !important;
    animation-duration:  0ms !important;
  }
}
```

`!important` is needed because the inline `style` attribute (which carries `--morph-duration: 400ms`) would otherwise win.

## Distinct From Drawer

Both are dismissable modal layers, but they're built for different jobs:

- **Drawer** slides in from a screen edge. Used when the relationship to the rest of the page is "this overlays everything from the side". Origin: an edge of the viewport.
- **MorphingDialog** animates from the trigger element itself. Used when the relationship is "this expanded view is *that* card you tapped". Origin: a specific DOM element on the page.

If you want to "expand a card into a detail view that visually grew out of the card", reach for MorphingDialog. If you want a side panel with filters or a navigation menu, reach for Drawer.

## State Flow Diagram

```
                     ┌────────────────────┐
                     │   IDLE             │
                     │   open  = false    │
                     │   phase = 'idle'   │
                     │   nothing rendered │
                     └─────────┬──────────┘
                               │ trigger click
                               ▼
                     ┌────────────────────────┐
                     │   MORPHING OPEN        │
                     │   phase = 'morphing-   │
                     │           open'        │
                     │   capture triggerRect  │
                     │   snapshot focus       │
                     │   lock scroll          │
                     │   dialog grows from    │
                     │   trigger to centre    │
                     │   over `duration` ms   │
                     └─────────┬──────────────┘
                               │ duration elapsed (or instant if reducedMotion)
                               ▼
                     ┌────────────────────────┐
                     │   OPEN                 │
                     │   phase = 'open'       │
                     │   dialog at centre     │
                     │   focus inside dialog  │
                     │   Tab cycles inside    │
                     │   Escape closes        │
                     │   overlay click closes │
                     └─────────┬──────────────┘
                               │ close request
                               ▼
                     ┌────────────────────────┐
                     │   MORPHING CLOSE       │
                     │   phase = 'morphing-   │
                     │           close'       │
                     │   re-measure trigger   │
                     │   dialog shrinks back  │
                     │   to trigger rect      │
                     └─────────┬──────────────┘
                               │ duration elapsed
                               ▼
                     ┌────────────────────────┐
                     │   CLEANUP → IDLE       │
                     │   unlockScroll         │
                     │   previousFocus.focus()│
                     │   open = false         │
                     │   phase = 'idle'       │
                     └────────────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Bindable. Whether the dialog is open. Parent can drive via `bind:open`. |
| `duration` | `number` | `400` | Morph duration in ms. Applies to open and close. |
| `easing` | `string` | `'cubic-bezier(0.4, 0, 0.2, 1)'` | CSS transition easing for the morph. |
| `overlayColor` | `string` | `'rgba(0, 0, 0, 0.5)'` | Backdrop colour at full visibility. |
| `overlayBlur` | `number` | `4` | Backdrop blur radius in pixels. |
| `dialogWidth` | `string` | `'560px'` | Final width of the centred dialog. CSS length. Capped at `calc(100vw - 2rem)`. |
| `dialogHeight` | `string` | `'auto'` | Final height of the centred dialog. CSS length or `'auto'`. |
| `borderRadius` | `string` | `'16px'` | Border radius of the centred dialog. The morph interpolates from 8 px (trigger) to this value. |
| `closeOnOverlay` | `boolean` | `true` | When false, clicking the backdrop does not close the dialog. |
| `closeOnEscape` | `boolean` | `true` | When false, Escape does not close the dialog. |
| `class` | `string` | `''` | Extra classes appended to the dialog. |
| `trigger` | `Snippet<[{ onclick, 'aria-expanded', 'aria-haspopup' }]>` | required | The trigger element. The snippet receives props that must be spread onto whatever you render. |
| `children` | `Snippet` | required | Dialog content. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| User scrolls the page while the dialog is open, then closes | Close handler re-measures `triggerRect` before starting the close morph. The dialog shrinks back to the trigger's *current* position, not its position at open time. |
| Trigger element is removed from the DOM while open | `triggerEl` is null when close fires; the close morph runs to the last-known rect, then cleans up silently. No exception. |
| Dialog opened from a deeply nested focused element | `previousFocus` snapshot captures the originally-focused element. On close, focus returns there — even if the trigger was a wrapper around a button, the inner button gets focus back. |
| User has `prefers-reduced-motion: reduce` | Morph animations are skipped entirely. Open and close are instant state swaps; focus management still runs. |
| Dialog content fills more than `100vh` | The dialog has `max-height: calc(100vh - 4rem)` and `overflow-y: auto`. Content scrolls inside the dialog without breaking the morph. |
| `dialogWidth` larger than the viewport | Width clamps via `min(var(--dialog-width), calc(100vw - 2rem))`. The dialog never exceeds the viewport. |
| `closeOnOverlay={false}` and `closeOnEscape={false}` | The only way to close is for the parent to flip `bind:open` to false, or for the user to click the rendered close button (always present). |
| Multiple MorphingDialogs stacked | Each has its own `phase` state. The most-recently-opened dialog's overlay sits at `z-index: 9999`; older dialogs underneath stay at the same z-index. Stacked is supported but visually confusing — design accordingly. |
| Server-side render | `phase` starts at `'idle'` and the conditional `{#if showDialog}` block renders nothing. No focus, no scroll lock, no reduced-motion check during SSR. |

## Dependencies

- **Svelte 5.x** — `$state`, `$bindable`, `$derived.by`, `$effect`, snippets, and `bind:this`.
- **`$lib/scrollLock`** — shared utility that snapshots/restores `body.style.overflow`. Avoids hard-coded body manipulation across components.
- Zero external dependencies — focus trap is hand-rolled, animation is pure CSS, the close-button SVG is inline.

## File Structure

```
src/lib/components/MorphingDialog.svelte         # implementation
src/lib/components/MorphingDialog.md             # this file
src/lib/components/MorphingDialog.test.ts        # vitest unit tests
src/lib/components/MorphingDialogTest.svelte     # internal harness used by tests
src/routes/morphingdialog/+page.svelte           # demo page
src/lib/scrollLock.ts                            # shared body-overflow lock utility
src/lib/types.ts                                 # MorphingDialogProps
```
