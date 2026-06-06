# TreeView

## What Does It Do? (Plain English)

TreeView renders nested data — a file system, a category taxonomy, an org chart — as an indented, collapsible tree. Each branch can be opened or closed, and the whole widget behaves like a single control: you Tab into it once, then drive everything from the keyboard. Turn on `checkboxes` and every branch shows a tri-state box that fills in when all its children are ticked, half-fills when only some are, and clears when none are.

**Think of it as** the left-hand pane of a file explorer: folders twist open, files sit at the leaves, and ticking a folder ticks everything inside it.

## How It Works (Pseudo-Code)

```
state:
  expanded  = Set<id>      // which branches are open
  selected  = Set<leafId>  // ONLY checked leaves are stored
  activeId  = id | null    // the single roving tab stop

derived:
  visible = flatten(nodes, expanded)   // depth-first, skip closed subtrees

events:
  on click row:
    activeId = node.id
    if node has children: toggleExpand(node)
    else if checkboxes:   toggleCheck(node)

  on keydown:
    ArrowDown -> focus next visible row
    ArrowUp   -> focus previous visible row
    ArrowRight-> if closed branch: expand
                 else if open branch: focus first child
    ArrowLeft -> if open branch: collapse
                 else: focus parent
    Home/End  -> focus first / last visible row
    Enter/Spc -> checkboxes ? toggleCheck : toggleExpand
```

## The Core Concept: Derived Tri-State, Not Stored

The trap with tri-state checkboxes is storing a checked flag on every node — parent and child state then drift apart and you spend the rest of the project re-syncing them. TreeView refuses that. The `selected` Set holds **only checked leaf ids**. Every branch's appearance is computed on demand:

```
checkStateOf(branch):
  leaves = all leaf descendants of branch
  n      = how many of those leaves are in `selected`
  if n == 0            -> 'unchecked'
  if n == leaves.count -> 'checked'
  else                 -> 'indeterminate'
```

Toggling a branch is symmetric: if it is fully or partly checked, remove all its leaves from the Set; if it is empty, add them all. Because parent state is never written down, it can never disagree with its children — there is one source of truth.

```
        [ ] Documents            indeterminate  (1 of 3 leaves)
         ├ [x] cv.pdf            in `selected`
         ├ [ ] notes.md
         └ [ ] budget.xlsx
```

## Recursive Snippet Rendering

Arbitrary depth needs a renderer that calls itself. Svelte 5 snippets can do exactly that — `branch` renders a `<ul role="group">` of rows and, for any open branch, calls `{@render branch(node.children, level + 1, node.id)}`. No separate child component, no prop-drilling: one snippet, one set of styles, any depth.

The visible-order keyboard model is kept separate from rendering. A `flatten()` pass walks the tree depth-first, **skipping collapsed subtrees**, producing the exact row order the user sees. Up/Down then become a single index step in that flat array, and Right/Left map cleanly onto expand/descend and collapse/ascend.

## State Flow Diagram

```
                 ┌───────────────────┐
                 │   COLLAPSED leaf  │
                 │  (no children)    │
                 └─────────┬─────────┘
       Enter/Space/click   │ (checkboxes) toggles its own leaf id
                           ▼
                 ┌───────────────────┐
        ArrowRight │      BRANCH      │ ArrowLeft
        (expand) ◀─┤  expanded? open  ├─▶ (collapse)
                 │  : closed         │
                 └───────────────────┘
                           │
              ArrowRight on │ open branch
              (descend)     ▼
                 ┌───────────────────┐
                 │   first child row │  ← activeId moves, roving tabindex follows
                 └───────────────────┘

  Any collapse that hides activeId  ->  $effect re-homes activeId to the first
                                        still-visible row.
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `TreeNode[]` | `[]` | Hierarchical data: `{ id, label, children? }` |
| `checkboxes` | `boolean` | `false` | Show tri-state checkboxes that cascade and bubble |
| `expanded` | `Set<string>` (bindable) | `new Set()` | IDs of currently open branches |
| `selected` | `Set<string>` (bindable) | `new Set()` | IDs of **checked leaf** nodes (parents are derived) |
| `defaultExpandAll` | `boolean` | `false` | Expand every branch on first render |
| `label` | `string` | `'Tree'` | `aria-label` for the tree container |
| `onselect` | `(id: string, state: boolean) => void` | `undefined` | Fired when a node is activated (toggle/check) |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `nodes` empty | Renders an italic "No items to display." message |
| Leaf node | No twisty rendered; `aria-expanded` omitted; Enter checks it (if checkboxes) |
| Branch with `children: []` | Treated as a leaf — no twisty, no expansion |
| Collapse hides the active node | An `$effect` re-homes `activeId` to the first visible row |
| ArrowRight on an open branch | Moves focus to the first child rather than re-expanding |
| ArrowLeft on a top-level leaf | No-op (no parent to ascend to) |
| Ticking a branch that is partly checked | Clears all its leaves (matches native folder-checkbox behaviour) |
| Duplicate ids | Selection/expansion keyed by id will collide — ids must be unique |
| Ids containing `"`, `\`, or `]` | Escaped before the focus `querySelector`; no library needed |

## Dependencies

Zero external dependencies. Pure Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`, `$bindable`), a self-referencing snippet, inline SVG icons, and scoped CSS. No icon library, no state-management library.

## File Structure

```
TreeView.svelte    # Component (module-block exports the TreeNode interface)
TreeView.md        # This explainer
TreeView.test.ts   # Vitest + @testing-library/svelte behaviour tests
```
