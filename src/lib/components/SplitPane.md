# SplitPane

## What Does It Do? (Plain English)

SplitPane cuts a rectangle into two panes with a draggable bar in the middle. Grab the bar and slide it, and the two panes trade space — one grows while the other shrinks. Let go and it stays put.

You choose the axis: **horizontal** puts the panes side-by-side with a vertical bar you drag left/right, and **vertical** stacks them with a horizontal bar you drag up/down. The classic uses are "code editor + live preview", "file list + detail view", and "sidebar + content".

**Think of it like:** two rooms sharing a sliding wall. Push the wall one way and the first room gets bigger; push it back and the second room reclaims the space. The wall can never slide off either end of the building — that's the min/max clamp.

---

## How It Works (Pseudo-Code)

```
STATE:
  size      = percentage of the container the FIRST pane occupies
  dragging  = is a pointer drag in progress?

LAYOUT:
  container is a flexbox (row for horizontal, column for vertical)
  first pane  → flex-basis: {size}%   (never grows/shrinks past it)
  divider     → fixed 10px bar
  second pane → flex: 1   (absorbs whatever is left)

WHEN pointer presses the divider:
  1. dragging = true
  2. setPointerCapture(pointerId)   // keep tracking even off the bar

WHEN pointer moves (and dragging):
  1. rect = container.getBoundingClientRect()
  2. IF horizontal → ratio = (clientX - rect.left) / rect.width
     IF vertical   → ratio = (clientY - rect.top)  / rect.height
  3. setSize(ratio * 100)

WHEN pointer releases:
  1. dragging = false
  2. releasePointerCapture(pointerId)

WHEN a key is pressed on the divider:
  1. pick the axis keys (Left/Right for horizontal, Up/Down for vertical)
  2. decrease key → setSize(size - step)
     increase key → setSize(size + step)
     Home         → setSize(min)
     End          → setSize(max)
  3. preventDefault so the page doesn't scroll

setSize(value):
  size = clamp(value, min, max)   // the ONE place size ever changes
```

---

## The Core Concept: Pointer Capture + Clamping

Two ideas do all the heavy lifting: **pointer capture** for smooth drags, and **clamping** for safe values.

### Pointer capture

The naïve way to track a drag is to listen for `mousemove` on the whole document while the button is held. That works, but it leaks global listeners and breaks the moment the pointer outruns your element. `setPointerCapture` is the modern answer:

```
divider.setPointerCapture(event.pointerId)
```

Once captured, **every** subsequent `pointermove` / `pointerup` for that pointer is delivered to the divider — even when the cursor races off the edge of the screen. No document-level listeners, no lost events, and touch + mouse + pen all go through the identical code path. On release we call `releasePointerCapture` and drop the `dragging` flag.

### Turning pixels into a percentage

The pointer gives us an absolute screen coordinate; the layout wants a percentage. We bridge them with the container's bounding box:

```
ratio = (clientX - rect.left) / rect.width      // 0 at the left edge, 1 at the right
size  = ratio * 100
```

For a vertical split we swap in `clientY`, `rect.top`, and `rect.height`. Storing a **percentage** rather than pixels means the split survives window resizes for free — 40% is 40% whether the container is 400px or 4000px wide.

### Clamping

Every write to `size` funnels through one function:

```
function setSize(value) {
  const bounded = Math.min(max, Math.max(min, value));
  size = Number(bounded.toFixed(4));   // trim floating-point dust
}
```

Because pointer drags, arrow nudges, and Home/End all call `setSize`, there is exactly one place the value can escape `[min, max]` — and it can't. A drag that flings the pointer to the far edge simply pins to `max`; there is no separate "out of bounds" branch to forget.

---

## Keyboard Resizing

A divider you can only drag is useless to keyboard and switch users, so the bar is a first-class focusable control: `role="separator"`, `tabindex="0"`, and it carries the live `aria-valuenow` / `aria-valuemin` / `aria-valuemax` so assistive tech announces "42%, minimum 10, maximum 90".

The arrow keys are chosen to match the split's physical axis, so the motion feels natural:

```
horizontal split (vertical bar):  ArrowLeft ← shrink   ArrowRight → grow
vertical split   (horizontal bar): ArrowUp   ↑ shrink   ArrowDown  ↓ grow
Home → jump to min          End → jump to max
```

Each handled key calls `event.preventDefault()` so the arrow keys resize the pane instead of scrolling the page. `aria-orientation` is set to `vertical` for a side-by-side split and `horizontal` for a stacked one — that is the orientation of the *bar itself*, which is what the ARIA separator pattern expects. There is no autoplay motion and the drag maps 1:1 to the pointer, so there is nothing to disable for reduced-motion users.

---

## State Flow Diagram

```
                     ┌─────────────┐
                     │    IDLE     │
                     │ dragging=F  │
                     └──────┬──────┘
                            │
        ┌───────────────────┼────────────────────┐
        │ pointerdown        │ keydown (arrows/    │
        │ on divider         │ Home / End)         │
        ▼                    │                     │
  ┌─────────────┐            │                     │
  │  DRAGGING   │            ▼                     │
  │ dragging=T  │      setSize(size ± step         │
  │ capture on  │        │ or min / max)           │
  └──────┬──────┘        │                         │
         │ pointermove   ▼                         │
         │ setSize(ratio)  ┌──────────────────┐    │
         │◄────────────────│  clamp to        │◄───┘
         │                 │  [min, max]      │
         │ pointerup       └────────┬─────────┘
         ▼                          │
  ┌─────────────┐                   ▼
  │    IDLE     │◄──────── size updated, panes reflow
  │ capture off │
  └─────────────┘
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Side-by-side (`horizontal`) or stacked (`vertical`) layout. |
| `initial` | `number` | `50` | Starting size of the first pane, as a percentage. |
| `size` | `number` | `initial` | **Bindable** current size of the first pane (%). |
| `min` | `number` | `10` | Lowest the first pane may shrink to (%). |
| `max` | `number` | `90` | Largest the first pane may grow to (%). |
| `step` | `number` | `2` | Percent moved per Arrow-key press. |
| `start` | `Snippet` | — | Content rendered in the first pane. |
| `end` | `Snippet` | — | Content rendered in the second pane. |
| `label` | `string` | `'Resize panes'` | Accessible name announced for the divider. |
| `class` | `string` | `''` | Extra classes on the root element. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `initial` outside `[min, max]` | The first *user* interaction clamps it; supply a sensible `initial` to avoid a visible snap. |
| Drag flung past an edge | `setSize` pins the value to `min` or `max` — no overshoot. |
| `min` greater than `max` | Values collapse toward `max` (the `Math.min(max, …)` wins); pass a valid range. |
| Missing `start` / `end` snippet | That pane renders empty (`{@render start?.()}` guards the call). |
| Container has zero width/height | Ratio maths divides by zero → guarded by the `containerEl` check; no drag occurs until it has a box. |
| Pointer leaves the divider mid-drag | `setPointerCapture` keeps events flowing to the divider, so tracking continues. |
| Reduced-motion users | Nothing to honour — there is no autoplay animation and the drag is 1:1. |

---

## Dependencies

- **Zero external dependencies.** Pointer events, `setPointerCapture`, flexbox, and scoped CSS are all native platform features.
- **Svelte 5 runes**: `$props`, `$bindable`, `$state`, `$derived`.
- **`Snippet`** type imported from `svelte` for the `start` / `end` pane content.

---

## File Structure

```
SplitPane.svelte      # The component
SplitPane.test.ts     # Unit tests
SplitPane.md          # This explainer
```
