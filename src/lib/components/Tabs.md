# Tabs — Technical Logic Explainer

## What Does It Do? (Plain English)

A horizontal or vertical tabbed interface for switching between mutually exclusive content panels. Click a tab — or arrow-key to it — and the corresponding panel renders below or beside the tablist. Implements the full WAI-ARIA tablist pattern: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-controls`, `aria-labelledby`, plus roving tabindex so the Tab key visits the active tab as a single stop instead of paging through every option.

Think of it like a folder of paper-clipped sections: each tab on the cover sticks out the side, and tapping a tab brings that section to the top. Only one section is visible at a time, and the cover stays the same shape regardless of which one is active.

## How It Works (Pseudo-Code)

```
state:
  tabs[]  = [{ id, label, icon?, disabled? }]
  active  = bindable id of the active tab (defaults to tabs[0].id)
  buttons[] = bound DOM refs, one per tab

events:
  on tab click(id):
    if tabs[id].disabled: return
    active = id

  on tablist keydown:
    next  = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'
    prev  = orientation === 'horizontal' ? 'ArrowLeft'  : 'ArrowUp'
    if key === next:  focusTab(currentIdx + 1)         // wraps + skips disabled
    if key === prev:  focusTab(currentIdx - 1)
    if key === 'Home': focusTab(0)
    if key === 'End':  focusTab(tabs.length - 1)
    if key === 'Enter' or ' ':
      activate the focused tab

focusTab(idx):
  i = idx mod tabs.length (positive)
  while tabs[i].disabled and tries < length:
    i = (i + 1) mod length     // walk past disabled
  buttons[i].focus()

render:
  <div role="tablist" aria-orientation={orientation} onkeydown={...}>
    for each tab:
      <button role="tab"
              aria-selected={tab.id === active}
              aria-controls="panel-{id}"
              tabindex={tab.id === active ? 0 : -1}
              disabled={tab.disabled}>
        icon? + label
      </button>
  </div>
  <div role="tabpanel" id="panel-{active}" aria-labelledby="tab-{active}">
    {@render panel(active)}
  </div>
```

The tablist + tabpanel are wired with two id pairs: `id="tab-{id}"` on the button is referenced by `aria-labelledby` on the panel, and `id="panel-{id}"` on the panel is referenced by `aria-controls` on the button. Screen readers use these to announce the relationship — "*tab Overview, selected, controls panel Overview content*".

## The Core Concept: Roving Tabindex

A naïve tablist gives every tab `tabindex="0"`, putting all of them in the document tab order. The user has to Tab through every tab to escape the tablist — a known accessibility footgun.

The WAI-ARIA pattern is **roving tabindex**: only the *active* tab is `tabindex="0"`; inactive tabs are `tabindex="-1"`. The user's first Tab into the tablist lands on the active tab; the next Tab leaves the tablist entirely. Within the tablist, arrow keys move focus.

```
<button role="tab" tabindex={tab.id === active ? 0 : -1}>
```

Combined with the keyboard handler:

```
ArrowRight / ArrowDown → focusTab(currentIdx + 1)
ArrowLeft  / ArrowUp   → focusTab(currentIdx - 1)
Home                    → focusTab(0)
End                     → focusTab(tabs.length - 1)
Enter / Space           → activate focused tab
```

The `focusTab` helper does two clever things: **wrapping** (`((idx % total) + total) % total` handles negative indices for ArrowLeft on the first tab) and **skipping disabled tabs** (a while-loop walks past disabled entries up to `total` times to avoid infinite loops if every tab is disabled).

Note that arrow keys move *focus*, not *selection*. The user can arrow-key through tabs to read their labels without committing — Enter or Space activates. This matches the WAI-ARIA tabs pattern's "manual activation" mode. (Some tab implementations use "automatic activation" where arrow keys also activate; we chose manual because it's friendlier when tab activation is expensive — fetching the panel's content, for example.)

## Two Visual Variants, One Layout

The component supports two visual styles via the `variant` prop:

- **`underline`** (default): tabs sit on a thin horizontal border; the active tab gets a 2px coloured under-bar that visually replaces the border at its position.
- **`pill`**: the tablist sits in a rounded grey tray; the active tab gets a white pill background with a subtle drop-shadow.

Both work with both orientations (horizontal and vertical). For vertical underline, the under-bar becomes a side-bar on the right (`border-right-color`); for vertical pill, the tray flexes column-wise instead of row-wise.

The two variants share the same DOM structure — only CSS differs. Switching `variant` at runtime is free, no re-mount.

## State Flow Diagram

```
            ┌──────────────────────────┐
            │   active = tabs[0].id    │
            │   first tab tabindex=0   │
            │   others tabindex=-1     │
            └──────────┬───────────────┘
                       │
       ┌───────────────┼─────────────────┬─────────────────┐
       │               │                  │                 │
   click tab      ArrowRight / Down   Home / End       Enter / Space
   (mouse / tap)  (focus moves only)   (focus jumps)   (activate focused)
       │               │                  │                 │
       │               ▼                  ▼                 │
       │        focus advances to    focus to first/last    │
       │        next enabled tab     enabled tab            │
       │        (no activation)      (no activation)        │
       │                                                     │
       ▼                                                     ▼
            ┌──────────────────────────┐
            │   active = newId         │
            │   roving tabindex shifts │
            │   panel re-renders via   │
            │   {@render panel(active)}│
            │   bind:active fires      │
            └──────────────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `TabItem[]` | required | Array of tab items: `{ id, label, icon?, disabled? }`. |
| `active` | `string` | `tabs[0].id` | Active tab id. Bindable via `bind:active`. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction; sets `aria-orientation` and remaps the arrow-key axis. |
| `variant` | `'underline' \| 'pill'` | `'underline'` | Visual style: under-bar vs pill on a tray. |
| `ariaLabel` | `string` | `'Tabs'` | Accessible name for the tablist. |
| `class` | `string` | `''` | Extra classes on the wrapper. |
| `panel` | `Snippet<[string]>` | — | Snippet that receives the active id and renders the panel. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `tabs` is empty | Tablist renders empty; no panel content. `active` defaults to `''` because `tabs[0]?.id` is `undefined`. |
| `active` doesn't match any tab id | The panel renders with `aria-labelledby="tab-"` and no tab is visually selected. Keyboard handler walks from index `-1`. |
| All tabs disabled | `focusTab` walks the whole array hitting only disabled tabs, exhausts its `tries` budget, and silently returns. No focus moves. |
| Disabled tab is the current `active` | The disabled tab still renders as selected; the panel still renders. Arrow keys skip it on subsequent navigation. Avoid setting `active` to a disabled id. |
| User has `prefers-reduced-motion: reduce` | The colour and background transitions on tabs are removed; the panel swap is instant. |
| Panel content is heavy (e.g. data fetch) | The `panel` snippet runs on every active change; render-side caching is the consumer's responsibility. Common pattern: render a wrapper component per tab id and let it manage its own load. |
| Vertical orientation in a constrained-height container | The tablist becomes a vertical flex column, panel shares the row. Set `min-width` on the tablist if labels are long; otherwise it'll squeeze. |
| Two Tabs on the same page sharing tab ids | DOM uses `id="tab-{id}"` and `id="panel-{id}"` — duplicate ids break aria-labelledby. Use unique ids across the page. |

## Dependencies

- **Svelte 5.x** — `$bindable`, `$state`, `$props`, snippets (`panel`). The roving tabindex flips with one ternary on render.
- Zero external dependencies. Native `<button>`, scoped CSS.

## File Structure

```
src/lib/components/Tabs.svelte    # implementation
src/lib/components/Tabs.md        # this file (rendered inside ComponentPageShell)
src/lib/components/Tabs.test.ts   # vitest unit tests
src/routes/tabs/+page.svelte      # demo page
```
