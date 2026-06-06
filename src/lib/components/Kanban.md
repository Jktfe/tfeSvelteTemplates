# Kanban

## What Does It Do? (Plain English)

Kanban is a Trello-style board. You get a row of columns (To Do, In Progress, Done…) and each column holds a stack of cards. You can drag a card to a new spot in its own column, or fling it across to another column, and the board updates instantly. Crucially, it also works with **just the keyboard**: focus a card, press Space to "pick it up", steer with the arrow keys, then press Space again to drop it — no mouse required.

**Think of it like:** a corkboard of sticky notes. Grab a note, slide it under another note or onto a different section of the board, and let go.

You bring the data and decide how a card looks (via a snippet); the component owns the dragging, reordering, keyboard moves, WIP-limit enforcement, and screen-reader announcements.

---

## How It Works (Pseudo-Code)

```
STATE:
  columns       — ordered list, each { id, title, cards[], wipLimit? }
  dragSource    — { col, idx } of the pointer-dragged card (or null)
  dropTarget    — { col, idx } where it would land (or null)
  keyboardLift  — { col, idx } of the keyboard-lifted card (or null)

ON pointer dragstart(col, idx):
  dragSource = { col, idx }

ON pointer dragover a card(col, idx):
  preventDefault                       # mark as a valid drop zone
  dropTarget = before-or-after idx, based on pointer Y vs card midpoint

ON pointer drop(col):
  moveCard(dragSource → dropTarget)
  clear dragSource, dropTarget

ON card keydown:
  Space/Enter:
    IF nothing lifted → keyboardLift = this card; ANNOUNCE "picked up"
    ELSE             → moveCard to keyboardLift position; ANNOUNCE "dropped"; clear
  Escape (while lifted): clear lift; ANNOUNCE "cancelled"
  Arrow Up/Down (while lifted): nudge target index within column
  Arrow Left/Right (while lifted): hop to adjacent column, clamp index

moveCard(fromCol, fromIdx, toCol, toIdx):
  IF crossing columns AND toCol is at wipLimit → REFUSE + announce
  splice card out of source; adjust index if same-column downward move; splice in
  reassign columns (new structure); call onChange
```

---

## The Two Move Models: Pointer and Keyboard

The component deliberately runs two parallel move models that both funnel into one `moveCard()` function, so behaviour stays identical regardless of input device.

**Pointer (HTML5 DnD).** `dragstart` records the source. `dragover` on each card calls `preventDefault()` (without which the browser refuses the drop) and computes whether the pointer is over the top or bottom half of the hovered card — that decides whether the dragged card lands *before* or *after* it. A thin accent bar (`.kb-drop`) renders at the computed slot so the user sees exactly where the card will go.

**Keyboard.** There is no native keyboard DnD, so we simulate it. Space "lifts" a card into `keyboardLift`; arrow keys mutate that target (`{col, idx}`) rather than moving anything yet; a second Space commits the move. This "lift → steer → commit" loop is the accessible-DnD pattern recommended for sortable lists, and Escape always restores the pre-lift state.

---

## WIP Limits

A column may declare a `wipLimit`. The count badge shows `n / limit` and turns red once full. `moveCard()` refuses any **incoming cross-column** card that would push a full column over its limit, announcing the refusal via the live region. Reordering *within* an already-full column is still allowed (the count doesn't change), which matches how real boards behave.

---

## State Flow Diagram

```
        ┌─────────── idle ───────────┐
        │                            │
  dragstart / Space            (no card held)
        │                            │
        ▼                            │
   ┌─────────┐   arrows/dragover  ┌──┴───────┐
   │ holding │ ─────────────────► │ retarget │
   └────┬────┘                    └────┬─────┘
        │ drop / Space (commit)        │ Escape
        ▼                              ▼
   moveCard() ──► onChange()        idle (unchanged)
        │
        ▼
       idle
```

---

## Props Reference

| Prop       | Type                                      | Default        | Description |
|------------|-------------------------------------------|----------------|-------------|
| `columns`  | `KanbanColumn<T>[]` (bindable)            | `[]`           | The board state. Each column is `{ id, title, cards, wipLimit? }`. |
| `card`     | `Snippet<[T, KanbanColumn<T>]>`           | — (required)   | Renders one card; receives the card item and its owning column. |
| `onChange` | `(columns: KanbanColumn<T>[]) => void`    | `undefined`    | Called with the new board after every successful move. |
| `getId`    | `(item: T) => string`                     | `item.id`      | Derives the stable `{#each}` key / drag payload for a card. |

`KanbanColumn<T>` = `{ id: string; title: string; cards: T[]; wipLimit?: number }`. Card type `T` must extend `{ id: string }`.

---

## Edge Cases

| Case | Behaviour |
|------|-----------|
| Drop into an empty column | `dragover` on column body targets index 0; a "Drop cards here" placeholder shows when empty. |
| Same-column downward reorder | Index is decremented by one after removal so the card lands exactly where the indicator showed. |
| Cross-column drop into a full column | Refused; live region announces "Cannot move — {column} is at its limit of {n}". |
| Reorder within a full column | Allowed — the count is unchanged, so no limit is breached. |
| Escape mid-keyboard-move | Lift is discarded; board returns to its pre-lift state, announced as "Move cancelled". |
| Arrow past the first/last column | Clamped — no wrap-around; target index is clamped to the new column's length. |
| Two-way binding | `bind:columns` and `onChange` both reflect the same new array reference after a move. |

---

## Dependencies

Zero. Pure Svelte 5 runes (`$state`, `$bindable`, `$props`), native HTML5 drag-and-drop, and a Svelte snippet for card rendering. No drag library, no icon library.

---

## File Structure

```
src/lib/components/
├── Kanban.svelte        # Component: columns, DnD + keyboard move logic, scoped CSS
├── Kanban.md            # This explainer
└── Kanban.test.ts       # Render, keyboard pick-up/move, WIP limit, ARIA assertions

src/routes/kanban/
└── +page.svelte         # Live demo (ComponentPageShell): basic board, WIP limits, custom cards
```
