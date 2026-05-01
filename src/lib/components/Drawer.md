# Drawer — Technical Logic Explainer

## What Does It Do? (Plain English)

A modal layer that slides in from one of the four screen edges — left, right, top, or bottom. Use it for mobile navigation menus, side panels for filters or settings, full-form bottom sheets, notification overlays, and anything that fits the "modal layer slides in from somewhere" pattern.

Think of it like a kitchen drawer that opens with a tug: it covers the underlying counter (the rest of your page), keeps your hands inside it until you push it shut, and slides cleanly back into the wall when you do. While the drawer is open, the page behind it is locked — you can't accidentally scroll it, you can't Tab into it, and AT only sees the drawer itself.

## How It Works (Pseudo-Code)

```
state:
  open                = false              // bindable
  drawerEl            = bound DOM ref
  previouslyFocused   = null               // snapshot at open time
  previousBodyOverflow = ''                 // snapshot at open time

derive sizeStyle:
  if size is undefined: return ''
  value = size as number → "{size}px"
        | size as string → size verbatim   // '70vh', '24rem', etc.
  if position is left or right: return "width: {value};"
  else:                          return "height: {value};"

events:
  on open transitions false → true:
    1. previouslyFocused   = document.activeElement
    2. previousBodyOverflow = body.style.overflow
    3. body.style.overflow  = 'hidden'           // lock page scroll
    4. requestAnimationFrame:
         first = drawerEl.querySelector(TABBABLE_SELECTOR)
         first.focus()                            // first tabbable inside

  on open transitions true → false (cleanup):
    1. cancel pending requestAnimationFrame
    2. body.style.overflow  = previousBodyOverflow  // restore, don't blanket-clear
    3. if previouslyFocused still in DOM:
         previouslyFocused.focus()                  // return focus to trigger

  on Escape (window keydown):
    if open and not persistent:
      open = false
      onClose?()

  on Tab (window keydown, while open):
    tabbables = drawerEl.querySelectorAll(TABBABLE_SELECTOR)
    if tabbables empty:
      preventDefault                              // pin focus on drawer panel
    else if Shift+Tab and active === first:
      preventDefault; last.focus()               // wrap backward
    else if Tab and active === last:
      preventDefault; first.focus()              // wrap forward
    // otherwise let the browser handle it

  on backdrop click:
    if not persistent:
      open = false
      onClose?()
```

The whole open/close lifecycle lives inside a single `$effect` that exits early when `open` is false. Because the cleanup function captures the snapshots taken at open time, restore-on-close works even if the drawer was opened from a deeply nested trigger and the user navigates with the keyboard before closing.

## Focus Trapping

The native `<dialog>` element with `showModal()` provides a built-in focus trap, ESC handling, and a `::backdrop` pseudo-element. Drawer chooses a manual implementation for three reasons:

1. **Animation control.** `<dialog>` opens via `showModal()` (imperative). Coordinating that with Svelte 5's declarative `{#if open}` plus CSS slide animations is awkward — the element has to mount, then receive `showModal()`, then animate, with no clean way to bind the lifecycle to a reactive `open` flag.
2. **Cross-browser focus-trap consistency.** Browser implementations of the native trap differ in subtle ways, especially with shadow DOM, iframes, and contenteditable regions. A handwritten trap behaves identically everywhere.
3. **Closer customisation.** Drawer controls the backdrop element directly, so the click target, animation, and `pointer-events` behaviour are predictable rather than negotiated with the user agent.

The trade-off is roughly thirty lines of JS for the trap, body lock, and focus restore. The accessibility outcome is identical to a well-implemented native dialog.

```
[trigger button] ── click ──▶ [drawer opens]
                                    │
                                    ▼
                          first tabbable focused
                                    │
                                    ▼
                       Tab ──▶ next tabbable
                       Shift+Tab ──▶ prev tabbable
                                    │
                       Tab at last  ──▶ wraps to first
                       Shift+Tab at first ──▶ wraps to last
                                    │
                                    ▼
                          [drawer closes]
                                    │
                                    ▼
                          previouslyFocused.focus()
                          (the original trigger)
```

The tabbable selector matches the elements browsers consider focusable in normal Tab order:

```
a[href],
button:not([disabled]),
input:not([disabled]),
select:not([disabled]),
textarea:not([disabled]),
[tabindex]:not([tabindex="-1"])
```

Disabled controls are excluded so the trap doesn't park focus on something the user can't interact with — browsers skip them naturally during Tab, and the trap follows that convention. The drawer panel itself carries `tabindex="-1"` so it can receive programmatic focus when the drawer has no tabbable content (think: read-only notification), without inserting itself into the Tab sequence.

Body scroll lock is **snapshot-and-restore**, not blanket-clear: if your CSS sets `body { overflow: scroll; }`, the drawer respects that on close. The same pattern applies to focus restoration — if the originally-focused element has been removed from the DOM by the time the drawer closes, focus falls through to `<body>` rather than throwing.

## CSS Animation Strategy

Each edge has its own slide-in keyframe driven by `transform`, which stays on the GPU and never thrashes layout:

```css
.drawer-right {
  top: 0; bottom: 0; right: 0;
  width: 320px; max-width: 90vw;
  animation: drawer-slide-right 280ms cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes drawer-slide-right {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
```

The `cubic-bezier(0.32, 0.72, 0, 1)` curve is the iOS-style "ease out, settle hard" easing — fast at the start, decelerating into place. It's the standard for any UI that simulates physical sliding mass. The 280 ms duration is deliberately short; longer feels rubbery, shorter feels like a pop.

The backdrop fades independently over 200 ms with a linear opacity ramp, so the drawer arrives *before* the backdrop has fully darkened — the eye perceives the drawer as the foreground actor and the backdrop as a passive consequence.

Reduced-motion gets a calm fade instead of a slide:

```css
@media (prefers-reduced-motion: reduce) {
  .drawer-left,
  .drawer-right,
  .drawer-top,
  .drawer-bottom {
    animation: drawer-fade-in 180ms ease-out;
  }
  @keyframes drawer-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
}
```

The drawer still appears with a visual cue — important for cognitive accessibility, since silently popping into existence is disorienting — but the horizontal/vertical movement that triggers vestibular discomfort is gone.

The `size` prop forwards as an inline style on the drawer element. Numbers become pixels (`size={400}` → `width: 400px;`), and any CSS length string passes through verbatim (`size="70vh"` for a bottom sheet at seventy percent of viewport height). The dimension swaps automatically based on `position`: left/right writes `width`, top/bottom writes `height`.

## Distinct From MorphingDialog

Both are dismissable modal layers, but they're built for different jobs:

- **Drawer** slides in from a screen edge and is anchored to the viewport. It's used when content needs *space* — navigation menus, side filters, full forms — and where the relationship to the rest of the page is "this overlays everything". Origin: an edge.
- **MorphingDialog** animates from the trigger element itself, growing out of the card or button you clicked. It's used for visual continuity — "this expanded view is *that* card you tapped". Origin: a triggering element.

If you find yourself wanting a Drawer that's anchored to a card, you want MorphingDialog. If you want to "expand" a row from a list into a full-form panel, you want Drawer.

## State Flow Diagram

```
                    ┌──────────────┐
                    │   CLOSED     │
                    │  open=false  │
                    └──────┬───────┘
                           │
                           │ parent sets open = true
                           ▼
                    ┌──────────────┐
                    │   OPENING    │  $effect runs:
                    │              │   • snapshot focus
                    │              │   • snapshot body.overflow
                    │              │   • body.overflow = 'hidden'
                    │              │   • rAF → focus first tabbable
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │     OPEN     │
                    │  open=true   │
                    │              │  Tab/Shift+Tab cycle inside
                    │              │  Escape closes (unless persistent)
                    │              │  Backdrop click closes (unless persistent)
                    └──────┬───────┘
                           │
       ┌───────────────────┼────────────────────┐
       │ Escape pressed    │ backdrop clicked   │ parent sets open = false
       │ (and !persistent) │ (and !persistent)  │
       ▼                   ▼                    ▼
                    ┌──────────────┐
                    │   CLOSING    │  $effect cleanup:
                    │              │   • cancelAnimationFrame
                    │              │   • body.overflow = previous
                    │              │   • restore previouslyFocused
                    │              │   • onClose?.()
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   CLOSED     │
                    └──────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Whether the drawer is visible. Bindable for parent control via `bind:open`. |
| `position` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | Which edge the drawer slides in from. |
| `size` | `number \| string` | `320` (px default in CSS) | Width (left/right) or height (top/bottom). Numbers become pixels; strings pass through as any CSS length (`'70vh'`, `'24rem'`). |
| `persistent` | `boolean` | `false` | When `true`, backdrop click and Escape do not close the drawer — useful for forms where the user must explicitly cancel or submit. |
| `ariaLabel` | `string` | `'Drawer'` | Accessible name for the dialog. Ignored if `ariaLabelledBy` is set. |
| `ariaLabelledBy` | `string` | `undefined` | ID of an element inside the drawer (typically a heading) that names the dialog. Preferred over `ariaLabel` when the content already has a visible heading. |
| `onClose` | `() => void` | `undefined` | Fires when the drawer closes via Escape, backdrop click, or any cause that flips `open` to false. Use for analytics, stale-form cleanup, etc. |
| `children` | `Snippet` | required | Drawer content. |
| `class` | `string` | `''` | Extra classes appended to the drawer panel. |

### Keyboard

| Key | Action |
|-----|--------|
| `Escape` | Closes the drawer (unless `persistent`). |
| `Tab` | Moves focus forward, trapped inside the drawer. |
| `Shift+Tab` | Moves focus backward, trapped inside the drawer. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Drawer opened with no tabbable content inside | First tab attempt is preventDefault'd; focus stays on the drawer panel itself (which has `tabindex="-1"`). The user can still Escape out. |
| Trigger element removed from the DOM while drawer is open | On close, `document.body.contains(previouslyFocused)` returns false; the focus restore is silently skipped and focus falls through to `<body>`. No exception. |
| Page CSS sets `body { overflow: scroll; }` | The drawer captures `style.overflow` at open, sets it to `'hidden'`, then restores the original value on close. Your stylesheet wins. |
| User has `prefers-reduced-motion: reduce` | Slide animation is replaced with a calm 180 ms opacity fade. The drawer still appears so users get a visual cue, just without horizontal/vertical motion. |
| `persistent` set and user presses Escape | Keypress is ignored; the drawer stays open. Same for backdrop click. The only way to close is for the parent to flip `bind:open` to false. |
| `size` passed as a string like `'70vh'` | Forwarded verbatim into the `width` or `height` inline style — any valid CSS length works (`vh`, `rem`, `%`, `calc(...)`, etc.). |
| Drawer rendered server-side | The mount effect short-circuits when `typeof document === 'undefined'`. No focus, no scroll lock, no errors during SSR. |
| `ariaLabelledBy` and `ariaLabel` both set | `ariaLabelledBy` wins; `aria-label` is omitted from the rendered DOM so AT only reads the labelled-by element. |

## Dependencies

- **Svelte 5.x** — `$state`, `$bindable`, `$derived.by`, `$effect`, `untrack`, and snippets. The whole open/close lifecycle leans on `$effect`'s cleanup function for restore-on-close.
- Zero external dependencies — the slide animation is pure CSS, the focus trap is hand-rolled, and the backdrop is a plain `<div>`. Fully copy-paste portable.

## File Structure

```
src/lib/components/Drawer.svelte         # implementation
src/lib/components/Drawer.md             # this file (rendered inside ComponentPageShell)
src/routes/drawer/+page.svelte           # demo page
src/lib/types.ts                         # DrawerProps + DrawerPosition (if extracted)
```
