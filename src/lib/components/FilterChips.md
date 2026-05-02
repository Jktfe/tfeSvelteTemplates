# FilterChips — Technical Logic Explainer

## What Does It Do? (Plain English)

A row of small toggleable pills used to filter content — blog tags, product facets, search categories, active filters in a dashboard. Each chip is an independent boolean by default (multi-select), so users can combine filters freely. Switch the mode to single-select and chips behave like radio buttons. An optional "All" reset chip clears the selection in one tap, and an optional × on each chip lets users dismiss filters individually without scrolling back to the list.

Think of it as a row of light switches versus a single mode dial. By default, every chip is its own switch. In single mode, the row becomes one dial with N positions — the joined "you can only pick one" feel of SegmentedControl, but with un-joined chips that wrap onto multiple rows.

## How It Works (Pseudo-Code)

```
state:
  selected[]   = bindable array of chip values currently active
  options[]    = chip definitions
  mode         = 'multi' | 'single'

events:
  on chip click(value):
    if mode === 'single':
      selected = isSelected(value) ? [] : [value]   // toggle or replace
    else:
      selected = isSelected(value)
        ? selected.filter(v => v !== value)         // remove
        : [...selected, value]                      // append
    fire onChange(selected)

  on × click(value):
    event.stopPropagation                           // don't toggle the chip
    selected = selected.filter(v => v !== value)
    fire onRemove(value)
    fire onChange(selected)

  on 'All' chip click:
    selected = []
    fire onChange([])

render:
  for each option:
    <button aria-pressed={isActive} onclick={() => toggle(value)}>
      label, optional count, optional × (if removable && isActive)
```

The mode prop changes the toggle behaviour but not the rendering — both modes use the same chip layout. Single-mode behaves like radios that allow zero selection (clicking the active chip clears it).

## The Core Concept: aria-pressed Over a Hidden Checkbox

A common mistake is to wrap a hidden `<input type="checkbox">` per chip. It works, but it's the wrong semantic. A checkbox implies a *form field* — the toggle is committing a value to be submitted later. Chips are *immediate filters* — toggling one re-renders the result list right now, no submit button.

The right pattern is `<button aria-pressed>`:

```
<button
  type="button"
  aria-pressed={isActive}
  onclick={toggle}
>
  {label}
</button>
```

`aria-pressed` is the WAI-ARIA pattern for toggle buttons — buttons that flip between two states. AT announces "*Design, toggle button, pressed*" or "*Design, toggle button, not pressed*". The whole row is wrapped in `<div role="group" aria-label={ariaLabel}>` so AT users get context for what the buttons control.

The trade-off: like Switch, you don't get free `<form>` submission. For modern apps that submit JSON, this is fine.

## Inner × Without Bubbling

The removable × is a tricky case: it's *inside* the chip's click target, but clicking it must *not* fire the chip's toggle. The standard fix is `event.stopPropagation()` inside the × handler:

```
function remove(value, event) {
  event.stopPropagation();              // don't toggle the chip
  selected = selected.filter(v => v !== value);
  onRemove?.(value);
  onChange?.(selected);
}
```

The × is rendered as a `<span role="button">` rather than a nested `<button>` because nested buttons are invalid HTML — the inner button would be parsed out of the outer one. Keyboard handling on the span is wired manually:

```
onkeydown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    remove(value, e);
  }
}}
```

Tab order: first the chip, then the ×. Users can Tab to a chip, Space to toggle, Tab again to reach its ×, Space to remove. The aria-label on the × is `"Remove {chip label}"` so AT users know which chip the × dismisses.

## State Flow Diagram

```
            ┌─────────────────────────────┐
            │   selected = []              │
            │   no chips active            │
            └────────────┬─────────────────┘
                         │
       ┌─────────────────┼──────────────────┐
       │                 │                  │
   click chip        click × on        click 'All'
   (multi)           active chip       reset chip
       │                 │                  │
       ▼                 ▼                  ▼
            ┌─────────────────────────────┐
            │   selected = [...]           │
            │   chips active per state     │
            │   onChange(selected) fires   │
            └────────────┬─────────────────┘
                         │
                         │  click another chip:
                         │    multi → append/remove
                         │    single → replace or clear
                         ▼
                    back to selected updated

  Keyboard:
    Tab     : move between chips and ×s
    Space   : toggle chip / fire ×
    Enter   : same as Space
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `{ value: string; label: string; count?: number }[]` | required | Chip data. Optional `count` renders as a small badge next to the label. |
| `selected` | `string[]` | `[]` | Active chip values. Use `bind:selected` for two-way sync. |
| `mode` | `'multi' \| 'single'` | `'multi'` | Selection behaviour. Single replaces; multi toggles independently. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Chip padding + font size. |
| `removable` | `boolean` | `false` | Show × on each *active* chip. |
| `onRemove` | `(value: string) => void` | — | Fires when × is clicked (in addition to `onChange`). |
| `showAll` | `boolean` | `false` | Show 'All' reset chip at the start of the row. |
| `allLabel` | `string` | `'All'` | Label for the reset chip. |
| `activeBg` | `string` | `'#1f2937'` | Active chip background colour. |
| `activeText` | `string` | `'#ffffff'` | Active chip text colour. |
| `ariaLabel` | `string` | `'Filters'` | Group label. |
| `onChange` | `(selected: string[]) => void` | — | Fires whenever selection changes (toggle or remove). |
| `class` | `string` | `''` | Extra classes on the wrapper. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `mode='single'` and user clicks the currently-active chip | `selected` becomes `[]` — the chip deselects. Single-mode allows zero selection (unlike a true radio group). |
| `removable={true}` but a chip is not active | The × is hidden — only active chips show the × (a chip that's not selected has nothing to remove). |
| 30+ chips on a narrow screen | The row wraps onto multiple lines (`flex-wrap: wrap`). Consider switching to a multi-select dropdown above ~12 chips. |
| User has `prefers-reduced-motion: reduce` | The 150 ms hover/active transition is removed; state changes are instant. |
| `options` includes a chip whose `value` already in `selected` is removed from `options` | The chip disappears from the row; the value stays in `selected` (component doesn't auto-prune). Parent can reconcile if needed. |
| `count` is `0` | Renders as `0` next to the label. Pass `undefined` (omit) to hide the count badge entirely. |
| User clicks the × via keyboard (Tab to it, Space) | `onkeydown` calls `preventDefault` so the page doesn't scroll on Space, then dispatches `remove`. |
| Multiple FilterChips on the same page | Each has its own group; toggles don't cross-interfere. Use distinct `ariaLabel` so AT announces them clearly. |

## Dependencies

- **Svelte 5.x** — `$bindable`, `$props`. One toggle handler, one remove handler.
- Zero external dependencies. Native `<button>`, scoped CSS, inline × SVG.

## File Structure

```
src/lib/components/FilterChips.svelte    # implementation
src/lib/components/FilterChips.md        # this file (rendered inside ComponentPageShell)
src/lib/components/FilterChips.test.ts   # vitest unit tests
src/routes/filterchips/+page.svelte      # demo page
```
