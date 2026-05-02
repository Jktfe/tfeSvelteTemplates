# CommandPalette — Technical Logic Explainer

## What Does It Do? (Plain English)

A keyboard-first overlay for searching and executing commands — VS Code's ⌘K, Linear's command bar, Raycast on the web. The user presses ⌘K (or Ctrl+K) anywhere in the app, an overlay appears with a search box, they type a few characters, fuzzy-matched commands appear scored by relevance and grouped by section, arrow keys move the highlight, Enter activates, Escape closes. The entire interaction happens without ever moving the hand off the keyboard.

Think of it like Spotlight on macOS or `Cmd-Shift-P` in your editor — a floating "what do you want to do?" prompt that's faster than navigating menus, and that turns the whole app's surface area into one autocomplete.

## How It Works (Pseudo-Code)

```
state:
  isOpen           = bindable boolean
  query            = current search text
  activeIndex      = highlighted item in the flat list
  previouslyFocused = element that was focused before the palette opened

on global keydown (Cmd/Ctrl + shortcutKey):
  preventDefault
  if isOpen: close() else: open()

open():
  previouslyFocused = document.activeElement
  isOpen = true
  query = ''
  activeIndex = 0
  rAF → inputEl.focus()        // wait for mount, then focus the search input

close():
  isOpen = false
  query = ''
  rAF → previouslyFocused?.focus()
  fire onClose()

derive filteredItems:
  for each enabled item:
    score = max(
      fuzzyScore(label) * 2,
      fuzzyScore(description) * 1,
      max(fuzzyScore(kw) * 1.5 for kw in keywords)
    )
  drop score === 0
  sort descending by score
  slice to maxResults

derive groupedItems = flatItems grouped by item.group
derive flatItems    = groupedItems.flatMap(g => g.items)   // for keyboard indexing

events while open:
  on input change (typing): activeIndex = 0  (jump back to top)
  on ArrowDown: activeIndex = (activeIndex + 1) mod flatItems.length; scroll
  on ArrowUp:   activeIndex = (activeIndex - 1 + n) mod n; scroll
  on Enter:     selectItem(flatItems[activeIndex])
  on Escape:    close()
  on Tab / Shift+Tab: focus trap cycles within dialog
  on backdrop mousedown (target === backdrop): close()

selectItem(item):
  if item.disabled: return
  item.onSelect?.()
  fire onSelect(item)
  if item.href: window.location.href = item.href
  close()
```

The `requestAnimationFrame` calls around focus are critical — `inputEl` doesn't exist until the dialog has mounted (after `isOpen` becomes true and the next tick renders). rAF defers the focus call until after the DOM update, so `inputEl?.focus()` actually finds an element to focus.

## The Core Concept: Fuzzy Scoring

The heart of the palette is `fuzzyScore`, a relevance-ranking function. The naïve approach is "include all items where the label contains the query as a substring", which misses common patterns like typing `gpw` to find `Git Push` (skipping characters), or `prefs` to find `Settings → Preferences`.

The two-tier algorithm:

```
1. Exact substring match (fast path):
   if label.toLowerCase().includes(query.toLowerCase()):
     return 100 + (50 if label starts with query else 0) - indexOf(query)
```

Exact matches score 100+, with a 50-point bonus for prefix matches and a small penalty proportional to where the match starts. So "Save" scores 150 for query `sav`, while "Search Archives" scores ~100 for the same query — both match, but the prefix wins.

```
2. Character-by-character fuzzy:
   walk query characters left-to-right
   for each query char, find the next matching char in label
   score += 10 + consecutive * 5     // bonus for sequential matches
   if all query chars found: return score (typically 30-80)
   else: return 0 (drop from results)
```

So `gpw` against `git push` walks: find `g` at 0 (+10), find `p` at 4 (+10, consecutive broken), find `w` — not found, return 0. `gpu` against `git push`: `g` at 0 (+10), `p` at 4 (+10), `u` at 6 (+15 consecutive bonus) = 35. Match.

The per-field weighting:

- `label` × 2 — what the user is most likely searching for
- `description` × 1 — secondary context
- `keywords` × 1.5 — hidden synonyms ("kbd", "shortcut", "keyboard" all match KbdShortcut)

`Math.max(...)` across the three fields means the best match wins, not the sum — a perfect description match doesn't outscore a partial label match.

## Focus Trapping & XSS-Safe Highlighting

Two security/UX details worth calling out:

**Focus trap.** While open, Tab cycles within the dialog. The handler queries `dialogEl.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])')`, finds the first and last, and intercepts:

```
on Tab:
  if Shift+Tab and active === first: preventDefault; last.focus()
  if !Shift   and active === last:  preventDefault; first.focus()
```

When the palette closes, focus returns to `previouslyFocused` — captured at open-time — so the user lands back where they were before the overlay.

**XSS-safe match highlighting.** A common mistake is to do `{@html label.replaceAll(query, '<mark>...</mark>')}` so matches are bolded. That's a script-injection vector if `label` comes from a user-supplied source. This component avoids `@html` entirely:

```
function getSegments(text, search):
  idx = text.toLowerCase().indexOf(search.toLowerCase())
  return [
    { text: text.slice(0, idx),        highlight: false },
    { text: text.slice(idx, idx+len),  highlight: true  },
    { text: text.slice(idx + len),     highlight: false }
  ]

template:
  {#each getSegments(item.label, query) as seg}
    {#if seg.highlight}<mark>{seg.text}</mark>{:else}{seg.text}{/if}
  {/each}
```

Each segment renders through Svelte's normal text interpolation, which escapes HTML. User-supplied labels can contain `<script>` tags and they'll display literally, not execute.

## State Flow Diagram

```
                  ┌──────────────────┐
                  │     CLOSED       │
                  │   isOpen=false   │
                  └─────────┬────────┘
                            │
                  Cmd/Ctrl + shortcutKey
                            │
                            ▼
                  ┌──────────────────┐
                  │  OPENING         │
                  │  snapshot focus  │
                  │  isOpen = true   │
                  │  rAF → focus     │
                  │   search input   │
                  └─────────┬────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │     OPEN         │
                  │  type query →    │ ◀── fuzzy score → group → flat
                  │  ArrowKeys move  │     → render
                  │  highlight       │
                  │  Tab cycles      │
                  │   (focus trap)   │
                  └─────────┬────────┘
                            │
        ┌───────────────────┼─────────────────────┐
        │                    │                     │
    Enter on item       Escape pressed       backdrop click
        │                    │                     │
        ▼                    ▼                     ▼
                  ┌──────────────────┐
                  │   CLOSING        │
                  │  selectItem?     │
                  │  isOpen = false  │
                  │  rAF → restore   │
                  │   focus          │
                  │  onClose() fires │
                  └──────────────────┘
                            │
                            ▼
                       back to CLOSED
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `CommandPaletteItem[]` | required | Available commands. Each item: `{ id, label, description?, group?, icon?, shortcut?, keywords?, href?, onSelect?, disabled? }`. |
| `placeholder` | `string` | `'Type a command or search...'` | Search input placeholder. |
| `emptyMessage` | `string` | `'No results found.'` | Message shown when the filter returns no matches. |
| `shortcutKey` | `string` | `'k'` | Single character that, with Cmd/Ctrl, opens the palette. |
| `maxResults` | `number` | `10` | Hard cap on rendered results — keeps the DOM lean for large `items` arrays. |
| `isOpen` | `boolean` | `false` | Bindable open state — for parent-controlled show/hide. |
| `onSelect` | `(item: CommandPaletteItem) => void` | `undefined` | Fires when an item is selected (Enter or click). |
| `onClose` | `() => void` | `undefined` | Fires after the palette closes for any reason. |
| `class` | `string` | `''` | Extra classes on the backdrop wrapper. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| User opens, types nothing, presses Enter | `flatItems[0]` is the highest-scored item with `query=''` (all items pass with score 1, so they keep their original order). It activates. |
| Empty `items` array | Empty state ("No results found.") renders. |
| User has 500 items and types `s` | Every item is scored; sort is O(n log n); slice to `maxResults` keeps the DOM at 10 rows. Fine for ~500 items. Beyond that, consider server-side filtering. |
| `Cmd+K` is bound by the browser (e.g. Chrome's address bar) | The handler calls `preventDefault` *before* the browser default fires, so the palette opens reliably. |
| User holds Cmd+K with palette already open | The handler toggles — the palette closes. Same shortcut, opposite direction. |
| Item has `href` and `onSelect` | Both run: `onSelect` first, then `window.location.href = item.href`. Order matters if `onSelect` does analytics. |
| User navigates to a result that opens a modal — modal also uses Escape | Escape closes the palette first (since it's already closed by the time the modal mounts). The two don't conflict. |
| User has `prefers-reduced-motion: reduce` | The 150 ms backdrop fade and palette slide-in are removed; the palette appears instantly. |
| User-supplied `label` contains HTML | Rendered as text via segment iteration; no `@html`. Tags display literally. |
| User selects a `disabled` item | `selectItem` short-circuits; nothing fires. (Disabled items are also filtered out of `filteredItems`, so this is defensive only.) |

## Dependencies

- **Svelte 5.x** — `$state`, `$bindable`, `$derived.by`, `$effect`, snippets. Global keydown listener is mounted/unmounted via the `$effect` return.
- **`svelte/reactivity`** — `SvelteMap` for the group bucket (reactive Map so the derive tracks correctly).
- Zero other external dependencies. Native search input, scoped CSS, inline search SVG.

## File Structure

```
src/lib/components/CommandPalette.svelte    # implementation
src/lib/components/CommandPalette.md        # this file (rendered inside ComponentPageShell)
src/routes/commandpalette/+page.svelte      # demo page
src/lib/types.ts                            # CommandPaletteItem + CommandPaletteProps
```
