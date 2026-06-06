<!--
  ===========================================================
  TREEVIEW
  ===========================================================
  WHAT — An accessible hierarchical tree (role=tree) with expand/collapse,
         roving-tabindex keyboard navigation and optional tri-state checkboxes
         whose state cascades down to children and bubbles up to parents.

  FEATURES
    - WAI-ARIA tree pattern: role=tree / treeitem / group
    - Roving tabindex: the whole tree is a single Tab stop
    - Arrow keys, Home/End, Enter/Space per the APG tree spec
    - Optional tri-state checkboxes (checked / unchecked / indeterminate)
    - Cascade down + bubble up selection logic, derived not stored
    - Recursive rendering via a self-referencing Svelte snippet
    - Bindable expanded set and selected set

  ACCESSIBILITY
    - role=tree on the container, role=treeitem on each node, role=group on
      child lists; aria-expanded, aria-selected, aria-level, aria-checked
    - Single tab stop (roving tabindex) so the tree behaves like one widget
    - Keyboard: Up/Down move between visible nodes, Right expands or descends,
      Left collapses or ascends, Home/End jump to first/last, Enter/Space toggle
    - Visible :focus-visible ring; honours prefers-reduced-motion

  DEPENDENCIES — Zero external dependencies (pure Svelte 5 + scoped CSS + inline SVG).

  USAGE
    <script lang="ts">
      import TreeView from '$lib/components/TreeView.svelte';
      const nodes = [
        { id: 'src', label: 'src', children: [
          { id: 'app', label: 'app.ts' }
        ] }
      ];
    </script>
    <TreeView {nodes} checkboxes />

  PROPS
    | Prop          | Type                  | Default          | Description |
    | nodes         | TreeNode[]            | []               | The hierarchical data |
    | checkboxes    | boolean               | false            | Show tri-state checkboxes |
    | expanded      | Set<string> (bindable)| new Set()        | IDs of expanded nodes |
    | selected      | Set<string> (bindable)| new Set()        | IDs of checked LEAF nodes |
    | defaultExpandAll | boolean            | false            | Expand every branch on mount |
    | label         | string                | 'Tree'           | aria-label for the tree |
    | onselect      | (id, sel) => void     | undefined        | Fired when a node is activated |
  ===========================================================
-->
<script lang="ts" module>
  /** A single node in the tree. Children are optional — a leaf has none. */
  export interface TreeNode {
    id: string;
    label: string;
    children?: TreeNode[];
  }
</script>

<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';

  interface Props {
    /** Hierarchical data to render. */
    nodes?: TreeNode[];
    /** Render tri-state checkboxes that cascade down and bubble up. */
    checkboxes?: boolean;
    /** IDs of expanded branches (bindable). */
    expanded?: Set<string>;
    /** IDs of CHECKED LEAF nodes (bindable). Parents are derived, never stored. */
    selected?: Set<string>;
    /** Expand every branch on first render. */
    defaultExpandAll?: boolean;
    /** Accessible name for the tree container. */
    label?: string;
    /** Called whenever a node is activated (Enter/Space/click on the label). */
    onselect?: (id: string, isExpandedOrChecked: boolean) => void;
  }

  let {
    nodes = [],
    checkboxes = false,
    expanded = $bindable(new SvelteSet<string>()),
    selected = $bindable(new SvelteSet<string>()),
    defaultExpandAll = false,
    label = 'Tree',
    onselect
  }: Props = $props();

  // ---------------------------------------------------------------------------
  // One-time expansion seeding. We collect every branch id and pre-fill the set
  // so consumers get a fully open tree without managing state themselves.
  // ---------------------------------------------------------------------------
  function collectBranchIds(list: TreeNode[], acc: string[] = []): string[] {
    for (const n of list) {
      if (n.children && n.children.length > 0) {
        acc.push(n.id);
        collectBranchIds(n.children, acc);
      }
    }
    return acc;
  }

  $effect(() => {
    if (defaultExpandAll && expanded.size === 0) {
      expanded = new SvelteSet(collectBranchIds(nodes));
    }
  });

  // ---------------------------------------------------------------------------
  // Visible-order flattening. The keyboard model (Up/Down/Home/End) walks the
  // tree as the user *sees* it: depth-first, skipping collapsed subtrees. We
  // derive that flat list so navigation is a simple index step.
  // ---------------------------------------------------------------------------
  interface FlatNode {
    node: TreeNode;
    level: number;
    parentId: string | null;
    hasChildren: boolean;
  }

  function flatten(
    list: TreeNode[],
    level: number,
    parentId: string | null,
    open: Set<string>,
    acc: FlatNode[]
  ): FlatNode[] {
    for (const node of list) {
      const hasChildren = !!node.children && node.children.length > 0;
      acc.push({ node, level, parentId, hasChildren });
      if (hasChildren && open.has(node.id)) {
        flatten(node.children!, level + 1, node.id, open, acc);
      }
    }
    return acc;
  }

  const visible = $derived(flatten(nodes, 1, null, expanded, []));

  // The id of the node that currently owns the single tab stop (roving tabindex).
  let activeId = $state<string | null>(null);

  // Keep the active node valid: default to the first node, and recover if the
  // active node scrolls out of the visible set (e.g. its parent collapsed).
  $effect(() => {
    if (visible.length === 0) {
      activeId = null;
      return;
    }
    if (activeId === null || !visible.some((v) => v.node.id === activeId)) {
      activeId = visible[0].node.id;
    }
  });

  // ---------------------------------------------------------------------------
  // Tri-state checkbox maths. We store only CHECKED LEAVES in `selected`. A
  // branch's state is always derived from its descendants:
  //   all leaves checked      -> checked
  //   no leaves checked       -> unchecked
  //   some leaves checked     -> indeterminate
  // This keeps a single source of truth and avoids drift between parent/child.
  // ---------------------------------------------------------------------------
  function leafIds(node: TreeNode, acc: string[] = []): string[] {
    if (!node.children || node.children.length === 0) {
      acc.push(node.id);
    } else {
      for (const c of node.children) leafIds(c, acc);
    }
    return acc;
  }

  type CheckState = 'checked' | 'unchecked' | 'indeterminate';

  function checkStateOf(node: TreeNode, sel: Set<string>): CheckState {
    const leaves = leafIds(node);
    if (leaves.length === 0) return 'unchecked';
    const checkedCount = leaves.filter((id) => sel.has(id)).length;
    if (checkedCount === 0) return 'unchecked';
    if (checkedCount === leaves.length) return 'checked';
    return 'indeterminate';
  }

  function toggleCheck(node: TreeNode) {
    const next = new SvelteSet(selected);
    const leaves = leafIds(node);
    const state = checkStateOf(node, selected);
    // Checked or partly-checked -> clear; fully unchecked -> select all leaves.
    if (state === 'checked') {
      for (const id of leaves) next.delete(id);
    } else {
      for (const id of leaves) next.add(id);
    }
    selected = next;
    onselect?.(node.id, state !== 'checked');
  }

  // ---------------------------------------------------------------------------
  // Expand / collapse helpers (immutable Set swaps keep reactivity honest).
  // ---------------------------------------------------------------------------
  function expand(id: string) {
    if (expanded.has(id)) return;
    expanded = new SvelteSet(expanded).add(id);
  }
  function collapse(id: string) {
    if (!expanded.has(id)) return;
    const next = new SvelteSet(expanded);
    next.delete(id);
    expanded = next;
  }
  function toggleExpand(node: TreeNode) {
    if (!node.children || node.children.length === 0) return;
    if (expanded.has(node.id)) collapse(node.id);
    else expand(node.id);
    onselect?.(node.id, expanded.has(node.id));
  }

  // ---------------------------------------------------------------------------
  // Focus management. We move focus by id, letting the DOM ref carry the visual
  // focus. Buttons are addressed via data-tree-id so we never hold stale refs.
  // ---------------------------------------------------------------------------
  let treeEl = $state<HTMLDivElement>();

  function focusId(id: string | null) {
    if (!id || !treeEl) return;
    activeId = id;
    const el = treeEl.querySelector<HTMLElement>(`[data-tree-id="${cssEscape(id)}"]`);
    el?.focus();
  }

  // Minimal attribute-selector escaper — ids are author-supplied, so guard the
  // characters that would break a querySelector without pulling in a library.
  function cssEscape(value: string): string {
    return value.replace(/["\\\]]/g, '\\$&');
  }

  function indexOfActive(): number {
    return visible.findIndex((v) => v.node.id === activeId);
  }

  function onKeydown(e: KeyboardEvent, flat: FlatNode) {
    const { node, hasChildren, parentId } = flat;
    const isOpen = expanded.has(node.id);
    const i = indexOfActive();

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (i < visible.length - 1) focusId(visible[i + 1].node.id);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (i > 0) focusId(visible[i - 1].node.id);
        break;
      }
      case 'ArrowRight': {
        e.preventDefault();
        if (hasChildren && !isOpen) {
          expand(node.id);
        } else if (hasChildren && isOpen) {
          // Already open -> descend to first child (it is the next visible row).
          if (i < visible.length - 1) focusId(visible[i + 1].node.id);
        }
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        if (hasChildren && isOpen) {
          collapse(node.id);
        } else if (parentId) {
          focusId(parentId);
        }
        break;
      }
      case 'Home': {
        e.preventDefault();
        if (visible.length > 0) focusId(visible[0].node.id);
        break;
      }
      case 'End': {
        e.preventDefault();
        if (visible.length > 0) focusId(visible[visible.length - 1].node.id);
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (checkboxes) toggleCheck(node);
        else if (hasChildren) toggleExpand(node);
        else onselect?.(node.id, true);
        break;
      }
    }
  }
</script>

<!--
  The recursive renderer. A snippet that calls itself is the cleanest way to
  render arbitrary depth in Svelte 5 — each level renders a <ul role="group">.
-->
{#snippet branch(list: TreeNode[], level: number, parentId: string | null)}
  <ul role={level === 1 ? undefined : 'group'} class="tree-list">
    {#each list as node (node.id)}
      {@const hasChildren = !!node.children && node.children.length > 0}
      {@const isOpen = expanded.has(node.id)}
      {@const state = checkboxes ? checkStateOf(node, selected) : 'unchecked'}
      <li
        role="treeitem"
        aria-level={level}
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-selected={checkboxes ? state === 'checked' : activeId === node.id}
        class="tree-item"
      >
        <div
          class="tree-row"
          class:is-active={activeId === node.id}
          data-tree-id={node.id}
          role="button"
          tabindex={activeId === node.id ? 0 : -1}
          style="--level: {level};"
          onkeydown={(e) =>
            onKeydown(e, { node, level, parentId, hasChildren })}
          onclick={() => {
            activeId = node.id;
            // In checkbox mode a row click ticks the node; the twisty (below)
            // owns expansion. Otherwise a click on a branch toggles expansion.
            if (checkboxes) toggleCheck(node);
            else if (hasChildren) toggleExpand(node);
            else onselect?.(node.id, true);
          }}
        >
          <span
            class="tree-twisty"
            class:is-toggle={hasChildren && checkboxes}
            role={hasChildren && checkboxes ? 'button' : undefined}
            aria-label={hasChildren && checkboxes
              ? `${isOpen ? 'Collapse' : 'Expand'} ${node.label}`
              : undefined}
            onclick={hasChildren && checkboxes
              ? (e) => {
                  // Stop the row's check toggle when the user means "expand".
                  e.stopPropagation();
                  toggleExpand(node);
                }
              : undefined}
          >
            {#if hasChildren}
              <svg
                viewBox="0 0 16 16"
                width="14"
                height="14"
                class="tree-chevron"
                class:is-open={isOpen}
                aria-hidden="true"
              >
                <path
                  d="M6 4l4 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            {/if}
          </span>

          {#if checkboxes}
            <span
              class="tree-check"
              class:is-checked={state === 'checked'}
              class:is-indeterminate={state === 'indeterminate'}
              aria-hidden="true"
            >
              {#if state === 'checked'}
                <svg viewBox="0 0 16 16" width="11" height="11">
                  <path
                    d="M3 8.5l3 3 7-7"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              {:else if state === 'indeterminate'}
                <svg viewBox="0 0 16 16" width="11" height="11">
                  <path
                    d="M3.5 8h9"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                  />
                </svg>
              {/if}
            </span>
          {/if}

          <span class="tree-label">{node.label}</span>
        </div>

        {#if hasChildren && isOpen}
          {@render branch(node.children!, level + 1, node.id)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<div
  bind:this={treeEl}
  role="tree"
  aria-label={label}
  aria-multiselectable={checkboxes ? true : undefined}
  class="tree"
>
  {#if nodes.length === 0}
    <p class="tree-empty">No items to display.</p>
  {:else}
    {@render branch(nodes, 1, null)}
  {/if}
</div>

<style>
  /* Light defaults on the root; the dark block below flips chrome tokens. */
  .tree {
    --tree-fg: #1f2933;
    --tree-muted: #6b7280;
    --tree-row-hover: #f1f5f9;
    --tree-row-active: #e0ecff;
    --tree-accent: #2563eb;
    --tree-check-border: #b4bdc9;
    --tree-empty: #9aa3af;
    --tree-focus: #2563eb;

    color: var(--tree-fg);
    font-size: 0.95rem;
    line-height: 1.4;
    user-select: none;
  }

  .tree-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .tree-item {
    margin: 0;
  }

  .tree-row {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    /* Indentation grows with depth; the twisty/checkbox stay aligned. */
    padding: 0.32rem 0.5rem 0.32rem calc(0.4rem + (var(--level) - 1) * 1.15rem);
    border-radius: 0.4rem;
    cursor: pointer;
    transition: background-color 120ms ease;
    outline: none;
  }

  .tree-row:hover {
    background: var(--tree-row-hover);
  }

  .tree-row.is-active {
    background: var(--tree-row-active);
  }

  .tree-row:focus-visible {
    box-shadow: 0 0 0 2px var(--tree-focus);
  }

  .tree-twisty {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    flex: 0 0 14px;
    color: var(--tree-muted);
    border: none;
    background: none;
    padding: 0;
  }
  /* In checkbox mode the twisty is the dedicated expand/collapse target. */
  .tree-twisty.is-toggle {
    cursor: pointer;
    border-radius: 0.25rem;
  }
  .tree-twisty.is-toggle:hover {
    color: var(--tree-fg);
  }

  .tree-chevron {
    transition: transform 150ms ease;
  }
  .tree-chevron.is-open {
    transform: rotate(90deg);
  }

  .tree-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex: 0 0 16px;
    border: 1.5px solid var(--tree-check-border);
    border-radius: 0.28rem;
    color: #fff;
    transition:
      background-color 120ms ease,
      border-color 120ms ease;
  }
  .tree-check.is-checked,
  .tree-check.is-indeterminate {
    background: var(--tree-accent);
    border-color: var(--tree-accent);
  }

  .tree-label {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tree-empty {
    margin: 0;
    padding: 0.5rem;
    color: var(--tree-empty);
    font-style: italic;
  }

  @media (prefers-color-scheme: dark) {
    .tree {
      --tree-fg: #e5e9f0;
      --tree-muted: #8b96a8;
      --tree-row-hover: #232a36;
      --tree-row-active: #1e3a5f;
      --tree-accent: #60a5fa;
      --tree-check-border: #4b5563;
      --tree-empty: #6b7280;
      --tree-focus: #60a5fa;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tree-row,
    .tree-chevron,
    .tree-check {
      transition: none;
    }
  }
</style>
