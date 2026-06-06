# Combobox

## What Does It Do? (Plain English)

A Combobox is a text input fused with a dropdown list. You start typing, and the list filters down to the options whose labels contain what you typed — case-insensitively. Pick one with the mouse, or drive the whole thing from the keyboard with the arrow keys and Enter. Flip the `multiple` prop and it becomes a tag picker: each chosen option turns into a removable chip, and the list hides anything you've already picked.

The selection itself lives outside the component, in a `bind:value` prop. In single mode that's a `string | null`; in multiple mode it's a `string[]`. Everything else — the open/closed state, the query text, which row is highlighted — is internal UI plumbing the component manages for you.

## How It Works (Pseudo-Code)

```
state: query = '', open = false, activeIndex = -1
prop:  value (bindable)  -> string | null   (single)
                          -> string[]        (multiple)

selectedValues = normalise(value) into an array   # one code path for both modes
labelByValue   = Map(option.value -> option.label) # for chips + single display

filtered = options.filter(o ->
    (multiple AND already-selected(o)) ? drop
    : query is empty ? keep
    : o.label.toLowerCase().includes(query.toLowerCase())
)

filterText shown in the <input>:
    multiple OR open -> the live query
    else             -> label of the single chosen value (so it reads as "selected")

on input        -> query = text; open = true; activeIndex = 0
on ArrowDown/Up  -> wrap activeIndex within filtered
on Enter         -> commit(filtered[activeIndex])
on Escape        -> close, reset query (single)
on Backspace     -> if multiple AND query empty -> remove last chip

commit(option):
    multiple -> push value (if absent), clear query, keep open, refocus input
    single   -> set value, clear query, close
```

## Filtering & The `filterText` Trick

The dropdown is driven by one `$derived` list, `filtered`. It does double duty: substring-matching on the lowercased query, and — in multiple mode only — excluding options already in the selection so you never pick the same tag twice.

The subtle part is what the `<input>` displays. In multiple mode (or whenever the list is open) the input mirrors the raw `query`. But in single mode, once you've chosen and closed, the input should read like a settled value — so `filterText` falls back to the chosen option's label looked up via `labelByValue`. This is why selecting "France" leaves "France" sitting in the field rather than an empty box.

## Keyboard Navigation & ARIA Wiring

`activeIndex` tracks the highlighted row. ArrowDown/ArrowUp wrap with modulo arithmetic so you loop top-to-bottom; Home/End jump to the ends. The highlighted row's id is fed to `aria-activedescendant` on the input, which is the correct pattern for a combobox — focus stays on the input while screen readers announce the "active" option. The input carries `role="combobox"`, `aria-expanded`, `aria-controls` (pointing at the listbox id), `aria-autocomplete="list"`, and `aria-labelledby` (pointing at a visually-hidden label span). Each row is `role="option"` with `aria-selected`.

## Closing Behaviour

Two independent escape hatches close the popup. A `focusout` handler checks `event.relatedTarget` — if focus is moving to something still inside the root element, it stays open; otherwise it closes. Separately, a `$effect` registers a document-level `pointerdown` listener only while open, closing the list on any click outside the root. The effect's cleanup removes the listener, so there's no leak when the popup closes.

## State Flow Diagram

```
                 focus / ArrowDown                 Enter (on active row)
   [closed] ───────────────────────▶ [open] ──────────────────────────┐
      ▲                                 │  │                           │
      │  Escape / outside-click /        │  │ type                      │ single
      │  focusout / select(single)       │  └──────▶ filter list        ▼
      └──────────────────────────────────┘         (activeIndex=0)   [closed,
                                                                       value set]
   multiple: select ─▶ push chip, clear query, stay [open], refocus input
   multiple: Backspace on empty query ─▶ pop last chip
```

## Props Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `ComboOption[]` | `[]` | Selectable items, each `{ value, label }`. |
| `value` | `string \| null \| string[]` (bindable) | `null` / `[]` | Selected value(s); a `string[]` when `multiple` is true, otherwise a single `string` or `null`. |
| `multiple` | `boolean` | `false` | Enables multi-select chip mode. |
| `placeholder` | `string` | `'Search…'` | Placeholder text for the input. |
| `emptyMessage` | `string` | `'No matches'` | Shown inside the popup when the filter yields nothing. |
| `disabled` | `boolean` | `false` | Disables the input and chip-remove buttons. |
| `id` | `string` | auto-generated | Base id used to wire the ARIA relationships. Supply a stable one for testing. |
| `label` | `string` | `'Combobox'` | Accessible name for the control (visually hidden, used by `aria-labelledby` and the listbox). |
| `class` | `string` | `''` | Extra classes appended to the root for layout/positioning. |

## Edge Cases

| Situation | Behaviour |
| --- | --- |
| `value` set but not in `options` | The chip / single display falls back to showing the raw value string (no label lookup match). |
| Duplicate selection in multiple mode | `commit` checks `includes` before pushing, so the same value can't be added twice. |
| All options already selected (multiple) | `filtered` is empty, so the popup shows `emptyMessage`. |
| Backspace with text in the query | Normal text deletion — chip removal only triggers when the query is empty. |
| Selecting in single mode | Closes the popup and resets `query` so the chosen label is shown, not stale text. |
| Disabled | `openList`, `onKeydown` early-return; the input and every chip-remove button are disabled. |
| Outside click vs. focusout | Both close the list; the `pointerdown` listener only exists while open, so there's no idle global handler. |

## Dependencies

Zero external dependencies. Pure Svelte 5 runes (`$state`, `$derived`, `$derived.by`, `$bindable`, `$effect`), scoped CSS, and inline SVG for the search, tick, and chip-remove icons. No icon library, no popover library, no positioning library — the listbox is absolutely positioned against the relatively-positioned root.

## File Structure

```
src/lib/components/Combobox.svelte    # the component (interface ComboOption + Props inline)
src/lib/components/Combobox.md        # this document
src/lib/components/Combobox.test.ts   # vitest + @testing-library/svelte
src/routes/combobox/+page.svelte      # demo wrapped in ComponentPageShell
```
