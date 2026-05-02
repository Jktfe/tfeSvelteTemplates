# ContextMenu — Technical Logic Explainer

## What Does It Do? (Plain English)

A right-click / long-press menu primitive. Wrap any trigger content in `<ContextMenu>` and right-click on it shows a custom menu at the click position — the native browser menu is suppressed. Items are passed in declaratively as a prop array, including dividers and danger-styled destructive choices. Pointer and keyboard parity from line one: Shift+F10 and the dedicated ContextMenu key open the menu without a mouse, arrow keys navigate (skipping dividers and disabled items), Enter activates, Escape closes.

Think of it as the "dropdown that follows the cursor" — file-tree row actions, image overlays, table-row context menus. Where a button's dropdown is anchored to the button, this menu is anchored to the click point.

## How It Works (Pseudo-Code)

```
state:
  open         = boolean
  position     = { x, y } in viewport coords
  activeIndex  = currently-highlighted item (skips dividers/disabled)
  reduced      = prefers-reduced-motion check (set onMount)
  triggerEl    = ref to the wrapped content
  menuEl       = ref to the menu (only when open)

events:
  on contextmenu (right-click) on trigger:
    preventDefault                       // suppress native menu
    openAt(event.clientX, event.clientY)

  on keydown on trigger (Shift+F10 or ContextMenu key):
    rect = triggerEl.getBoundingClientRect()
    openAt(rect.left, rect.bottom)

  openAt(x, y):
    if disabled or no items: return
    position = { x, y }
    open = true
    activeIndex = nextEnabledIndex(items, -1, +1)   // first enabled
    tick():
      rect = menuEl.getBoundingClientRect()
      position = clampToViewport(x, y, rect.width, rect.height, viewW, viewH)
      itemEls[activeIndex].focus()

  on menu keydown:
    ArrowDown: activeIndex = nextEnabledIndex(..., +1); focus
    ArrowUp:   activeIndex = nextEnabledIndex(..., -1); focus
    Home:      activeIndex = nextEnabledIndex(items, -1, +1)
    End:       activeIndex = nextEnabledIndex(items, length, -1)
    Enter / Space: selectIndex(activeIndex)
    Escape / Tab: close

  selectIndex(i):
    if items[i] is divider or disabled: return
    fire onSelect(items[i].id)
    close()

  on window mousedown (svelte:window):
    if open and target outside menu and outside trigger: close()

close():
  open = false
  triggerEl?.focus()                     // return focus to trigger
```

The menu is fixed-positioned, mounted only when `open`. Closed state has zero menu DOM cost beyond the trigger wrapper.

## The Core Concept: Viewport Clamping

A right-click near the bottom-right corner of the screen would naïvely render the menu off the visible area. The fix is `clampToViewport` — a pure function that flips the menu when it would overflow:

```
clampToViewport(x, y, menuW, menuH, viewportW, viewportH, padding=8):
  if x + menuW + padding > viewportW: x = max(padding, x - menuW)   // flip left
  if y + menuH + padding > viewportH: y = max(padding, y - menuH)   // flip up
  if x < padding: x = padding                                        // clamp left
  if y < padding: y = padding                                        // clamp top
  return { x, y }
```

So a click at `(viewportW - 50, viewportH - 50)` doesn't open a menu that runs off the corner. It opens a menu whose *bottom-right* corner is at the click point — the menu grows up-and-left from the click. This is the macOS Finder behaviour and matches user expectation.

The 8 px padding ensures the menu never sits flush against the viewport edge — small comfort margin for users who move the cursor immediately after clicking.

The function is exported from the module script for unit testing — you can call `clampToViewport(990, 700, 200, 300, 1024, 768)` directly in vitest without rendering anything.

## Pointer + Keyboard Parity

A common shortcut is to make the menu pointer-driven and bolt keyboard support on later. This component does the opposite: keyboard support is built in from the start, exported as a pure helper:

```
nextEnabledIndex(items, current, direction):
  for step in 1..items.length:
    i = (current + direction * step) wrapped into [0, length)
    if items[i] is interactive and not disabled: return i
  return -1
```

ArrowDown calls `nextEnabledIndex(items, activeIndex, +1)`. ArrowUp passes `-1`. Home is "find first enabled from -1 going forward". End is "find last enabled from `length` going backward". Wrapping is built in — ArrowDown on the last enabled item lands on the first.

Disabled items and dividers are both skipped: the type guard `isInteractiveItem` strips dividers, and the `!item.disabled` check strips disabled items. So a menu of `[Edit, divider, Copy, Delete (disabled), divider, Quit]` cycles `Edit → Copy → Quit → Edit`.

## Suppression of the Native Menu

The trigger wrapper has `oncontextmenu={handleContextMenu}`, which calls `event.preventDefault()` before opening the custom menu. Without this, both menus would open simultaneously — the OS menu and ours, stacked. The `preventDefault` happens unconditionally (even if the trigger is `disabled`, in which case we then bail without opening anything) because letting the native menu show on a disabled trigger is more disruptive than suppressing it.

## State Flow Diagram

```
              ┌──────────────────────────────┐
              │   CLOSED                      │
              │   open=false, no menu in DOM  │
              └──────────┬────────────────────┘
                         │
            ┌────────────┼─────────────┬─────────────┐
            │            │              │             │
       right-click   Shift+F10 /    keyboard:    parent passes
       on trigger   ContextMenu     focus on     items but never
                    key on trigger  trigger      clicks (n/a)
            │            │              │
            ▼            ▼              ▼
              ┌──────────────────────────────┐
              │   OPENING                     │
              │   position = click coords     │
              │   open = true                 │
              │   activeIndex = first enabled │
              │   tick → measure → clamp →    │
              │     focus active item         │
              └──────────┬────────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   OPEN                        │
              │   ArrowKeys cycle activeIndex │
              │   (skip dividers/disabled)    │
              │   Enter/Space activates       │
              └──────────┬────────────────────┘
                         │
        ┌────────────────┼─────────────────┐
        │                │                  │
    Enter / Space    Escape / Tab       click outside
    on enabled item                    (svelte:window)
        │                │                  │
        ▼                ▼                  ▼
   onSelect(id)         close → triggerEl.focus()
        │
        ▼
   close() → triggerEl.focus()
                         │
                         ▼
                    back to CLOSED
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ContextMenuItem[]` | required | Menu items. Each is either `{ type: 'divider' }` or `{ id, label, shortcut?, disabled?, danger? }`. Validated via `normalizeItems`; invalid entries dropped. |
| `onSelect` | `(id: string) => void` | no-op | Fires on item click / Enter / Space with the selected item's `id`. |
| `ariaLabel` | `string` | `'Context menu'` | Used as the menu's `aria-label`. |
| `disabled` | `boolean` | `false` | Trigger ignores `contextmenu` and keyboard activators. |
| `class` | `string` | `''` | Extra classes on the trigger wrapper. |
| `children` | `Snippet` | default text | Trigger content rendered inside the wrapper. |

### Item shape

```typescript
type ContextMenuItem =
  | { type: 'divider' }
  | {
      id: string;       // unique stable identifier passed to onSelect
      label: string;    // visible label
      shortcut?: string; // optional right-aligned hint, e.g. '⌘C'
      disabled?: boolean; // greyed out, skipped by keyboard nav, no click effect
      danger?: boolean;  // styled in red for destructive actions
    };
```

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Right-click near the bottom-right corner | `clampToViewport` flips the menu so its bottom-right corner is at the click point. Menu grows up-and-left. |
| Right-click in the very corner with menu larger than viewport | Both axes clamp to padding (8 px from each edge). The menu may overlap the click point in extreme cases. |
| `items` contains an entry with no `id` or no `label` | `normalizeItems` drops it silently. Invalid items never reach the render. |
| Two items with the same `id` | First wins; second is dropped by `normalizeItems`. |
| All items disabled | Menu opens; `nextEnabledIndex` returns `-1`; no item gets focus. Keyboard nav is a no-op. Escape closes. |
| User has `prefers-reduced-motion: reduce` | The 120 ms scale-up open animation is replaced with instant render. The contract — open, navigate, select, close — is preserved. |
| User clicks inside the menu but on the gap between items | No item handler fires; `svelte:window` mousedown sees the click is *inside* `menuEl` and doesn't close. |
| User Shift-Tabs back to the trigger while menu is open | Tab handler closes the menu; focus returns to trigger. Shift+Tab moves to the previous focusable element. |
| Menu opens, parent re-renders `items` to a different array | `safeItems = $derived(normalizeItems(items))` re-runs; the menu's contents update. `activeIndex` may now point at a different item — no crash, but the highlight may visibly jump. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$props`, `onMount`, `tick`, snippets, `svelte:window`. The pure helpers (`normalizeItems`, `clampToViewport`, `nextEnabledIndex`, `isInteractiveItem`, `isReducedMotion`) are exported from the module script for testing without a DOM.
- Zero external dependencies. Native event handling, scoped CSS, no animation library.

## File Structure

```
src/lib/components/ContextMenu.svelte    # implementation
src/lib/components/ContextMenu.md        # this file (rendered inside ComponentPageShell)
src/lib/components/ContextMenu.test.ts   # vitest unit tests (uses exported helpers)
src/routes/contextmenu/+page.svelte      # demo page
```
