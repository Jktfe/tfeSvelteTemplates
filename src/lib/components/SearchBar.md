# SearchBar - Technical Logic Explainer

> **Site infrastructure.** SearchBar powers the component filter on the home page (`src/routes/+page.svelte`). It is not registered in the component catalogue and has no demo route of its own, but it follows the same conventions as the templates and is safe to copy.

## What Does It Do? (Plain English)

SearchBar is a pill-shaped text field for search queries. It shows a magnifier on the left, and as soon as you type anything a small "×" appears on the right to wipe the query. The current text is exposed through `bind:value`, so the parent can filter a list as you type.

**Think of it like:** the search box at the top of a library catalogue — type to narrow things down, tap the cross (or press Escape) to start again.

---

## How It Works (Pseudo-Code)

```
props:
  value (bindable, default '')
  placeholder, ariaLabel, class

derived:
  clearVisible = value.length > 0

on input:
  value = input.value          → parent's bound variable updates

on click "Clear search":
  value = ''
  input.value = ''             → keep the DOM in sync immediately
  focus the input              → user can type the next query straight away

on keydown Escape:
  IF value is non-empty:
    preventDefault + clear()
  ELSE:
    let the event bubble        → an enclosing dialog can still close
```

---

## The Core Concept: One Clear Control

`<input type="search">` gives you semantics for free — a `searchbox` role, a mobile "search" keyboard key, and Escape-to-clear in some browsers. It also gives WebKit/Blink browsers their own grey "×". Showing two clear buttons is confusing, so the component:

1. Hides the native one with `::-webkit-search-cancel-button { appearance: none; }`.
2. Renders its own `<button aria-label="Clear search">` only while there is text.
3. Implements Escape itself, so the behaviour is identical in every browser.

The custom button also returns focus to the input after clearing. Without that, a keyboard user who tabbed to the "×" would be left on a button that has just disappeared, and focus would fall back to `<body>`.

---

## Distinct From Combobox and CommandPalette

- **SearchBar** is just a query field. Filtering, results and highlighting are the parent's job.
- **Combobox** owns a listbox of options, active-descendant keyboard navigation and selection.
- **CommandPalette** is a modal overlay with its own shortcut, result list and actions.

Reach for SearchBar when the results are already on the page (a grid, a table, shelves of cards) and you only need a tidy input to drive them.

---

## State Flow Diagram

```
          ┌──────────────────────┐
          │        EMPTY         │
          │  value = ''          │
          │  no clear button     │
          └──────────┬───────────┘
                     │ type a character
                     ▼
          ┌──────────────────────┐
          │       HAS QUERY      │
          │  value = 'abc'       │
          │  clear button shown  │
          └──┬───────────────┬───┘
   click ×   │               │ Escape
             ▼               ▼
      value = '' + focus input
             │
             ▼
           EMPTY

  EMPTY + Escape → event bubbles unchanged (no state change)
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Bindable. The current query. |
| `placeholder` | `string` | `'Search components…'` | Placeholder text. Change it for anything other than the home page. |
| `ariaLabel` | `string` | `'Search components'` | Accessible name for the input (there is no visible label). |
| `class` | `string` | `''` | Extra classes on the wrapper, e.g. to lift the 320px `max-width`. |

The props interface is exported from the module script as `SearchBarProps`.

### Theming tokens

The component reads the site's shared tokens with sensible fallbacks, so it works on a bare page too: `--fg-1`, `--fg-2`, `--surface`, `--surface-2`, `--border`, `--accent`.

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Parent sets `value` programmatically | Input reflects it; the clear button appears if non-empty |
| Whitespace-only query | Treated as non-empty (clear button shows) — trim in the parent if needed |
| Escape on an empty field | Not prevented, so a surrounding drawer/dialog can handle it |
| Browser's native "×" | Hidden in WebKit/Blink; Firefox never shows one |
| Very long queries | Text scrolls inside the input; right padding keeps it clear of the "×" |
| Reduced motion | Border, focus-ring and hover transitions are removed |
| Expensive filtering | Every keystroke updates `value` — debounce in the parent |

---

## Dependencies

**Zero external dependencies.**

- Svelte 5 runes (`$props`, `$bindable`, `$state`, `$derived`)
- Inline SVG icons (no icon library)

---

## File Structure

```
src/lib/components/SearchBar.svelte    # component (+ exported SearchBarProps)
src/lib/components/SearchBar.md        # this explainer
src/lib/components/SearchBar.test.ts   # unit tests
src/routes/+page.svelte                # home-page component filter (consumer)
```
