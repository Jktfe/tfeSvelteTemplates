# Sankey — Technical Logic Explainer

## What Does It Do? (Plain English)

A flow diagram with drill-down. The component (named `ExpandableSankey` in the source — see **Naming note** below) renders nodes as vertical bars and connects them with proportionally-thick coloured ribbons that show how much "flows" from each source to each destination. Click an expandable node and its children fan out, replacing the aggregated link with detailed sub-flows. Click again to collapse — and any descendants you'd opened collapse with it, recursively.

The visual idiom comes from energy and budget reporting: "where does our power come from, and where does it go". It's the right shape whenever you have **directed, conserved flow** through stages — power generation → distribution → consumption, traffic sources → landing pages → conversions, ingredients → dishes → calories, money → departments → projects.

The expand/collapse interaction is what makes this version useful: a static Sankey of 200 leaves is a hairball, but a Sankey that starts with 6 collapsed top-level groups and lets the reader drill in is legible.

### Naming note

The component file is `ExpandableSankey.svelte`. The route is `/sankey`. The library catalog also calls it "Sankey". This is a deliberate naming asymmetry: the file name is technical (it describes the *behaviour*), the public-facing name is short (it describes the *thing*). When importing, you'll always write `import ExpandableSankey from '$lib/components/ExpandableSankey.svelte'`.

## How It Works (Pseudo-Code)

```
state:
  data = createSankeyData(nodes, links)    // visibility-aware data manager
  // sankeyData.nodes / .links are filtered views of the input

derive sankey rendering (delegated to Unovis):
  Unovis runs its own layout: assigns x positions by topological depth, y by
  cumulative flow, computes link curves between node ports

events:
  on node click(n):
    if !n.expandable: ignore
    else:
      if n.expanded: sankeyData.collapse(n)   // also collapses every descendant
      else:          sankeyData.expand(n)
      data = sankeyData                        // reassign to trigger Svelte 5 reactivity

callbacks fed to <VisSankey>:
  linkColor(d):  source node's colour or fallback grey
  nodeCursor(d): 'pointer' if expandable, else null
  events: { [Sankey.selectors.node]: { click: toggleGroup } }

createSankeyData(allNodes, allLinks) returns:
  expand(n)  → mark n.expanded = true; subsequent .nodes/.links views show n's children
  collapse(n) → mark n.expanded = false; recursively collapse descendants
  visibility rules:
    nodes: top-level (no parent) always visible; children visible iff parent.expanded
    links: source AND target both visible AND
             - if parent has children: aggregate link visible iff parent NOT expanded
             - child link visible iff parent IS expanded
```

The "magic" is in the visibility rules — there's no animation between states, no morph from aggregate to detail. Both link sets exist in the input data; visibility flips between them based on the parent's expanded state, and Unovis re-layouts to fill the new graph.

## Core Concept: Aggregate vs Detail Links + The Reactivity Trick

Two ideas you have to internalise to use this component.

### Aggregate vs detail links

When `Coal` is collapsed, you want a single thick ribbon from `Power Grid → Coal → Residential` summarising "100 MW total". When `Coal` is expanded, you want three separate ribbons: `Coal → Plant A → Residential` (40 MW), `Coal → Plant B → Residential` (35 MW), `Coal → Plant C → Residential` (25 MW).

You provide **both** in the input. The visibility rule decides which renders:

```
For a link L = (source → target, value):
  if source is expandable AND has children:
    show L iff source.expanded === false           // aggregate link
  if source has a parent that is expandable:
    show L iff source.parent.expanded === true     // detail link
```

The values must reconcile: the aggregate value must equal the sum of the detail values it replaces. This isn't enforced in code — it's your job. Mismatches don't crash; they produce a Sankey that looks slightly different sizes when you expand and collapse, which users will notice. Keep them aligned.

### The Svelte 5 reactivity trick

`createSankeyData` returns a stateful object whose `expand`/`collapse` methods mutate internal flags. Mutations to object properties don't trigger Svelte 5's `$state` reactivity — the runtime tracks reference identity, not deep changes.

The fix is the assignment-to-self pattern:

```typescript
let data = $state(sankeyData);

function toggleGroup(n) {
  if (n.expanded) sankeyData.collapse(n);
  else            sankeyData.expand(n);
  data = sankeyData;        // ← this looks redundant but isn't
}
```

`data = sankeyData` creates a new dependency-tracking entry even though the reference is identical. The `<VisSingleContainer {data}>` consumer sees a "change" and re-runs the Sankey layout against the now-different `data.nodes` / `data.links` views.

If you forget that line, the visibility flags update internally but Unovis never re-renders. This is the most common bug when adapting this component.

## Performance

The component delegates layout to **Unovis** (a D3-based viz library). Layout cost is linear in the number of *visible* nodes and links — typically 5–50 visible nodes at any one time, even with hundreds in the underlying dataset.

- **20–50 underlying nodes:** No perceptible cost. Click → expand → re-layout in <16 ms.
- **50–200 underlying nodes:** Layout takes 30–80 ms on expand, mainly Unovis's iterative node-ranking algorithm. Still feels instant.
- **200+ underlying nodes:** You'll start to notice the click → render delay. Mitigation: keep the initial state mostly collapsed, so layout always operates on a small visible set.

The bottleneck isn't expansion (Unovis handles it well) — it's the click-handler reactivity dance. Each toggle assignment triggers a full Unovis re-render. There's no cheaper path; Sankey layouts are inherently global (changing one node's connections shifts every other node's y-position).

There's also a known usability issue at small viewport widths: Sankey diagrams need horizontal space. The component pins `min-width: 800px` and the demo wraps it in a horizontal scroller, accepting that mobile users will swipe.

## State Flow Diagram

```
                  ┌────────────────────────┐
                  │  initial render        │
                  │  all top-level nodes   │
                  │  visible; expandables  │
                  │  collapsed by default  │
                  │  aggregate links shown │
                  └────────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │ click expand-  │ hover any node │ click expanded
              │ able node      │                │ node again
              ▼                │                ▼
       ┌──────────────────┐    │       ┌─────────────────────┐
       │ node.expanded =  │    │       │ collapse(node)      │
       │ true             │    │       │ recursively also    │
       │ children visible │    │       │ collapses every     │
       │ aggregate link   │    │       │ expanded descendant │
       │ hides            │    │       │ aggregate link      │
       │ detail links     │    │       │ returns             │
       │ appear           │    │       │ children hide       │
       │ Unovis re-layout │    │       │ Unovis re-layout    │
       └──────────────────┘    │       └─────────────────────┘
                               ▼
                       ┌────────────────┐
                       │ tooltip shown  │
                       │ (provided by   │
                       │ Unovis)        │
                       └────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `SankeyNode[]` | required | All nodes including hidden children. Top-level nodes have no `parent`. |
| `links` | `SankeyLink[]` | required | All flows. Includes both aggregate links (used when source collapsed) and detail links (used when source expanded). |
| `height` | `number` | `600` | Container height in pixels. Width is 100% of parent (with `min-width: 800px` floor). |

`SankeyNode`:

```typescript
interface SankeyNode {
  id: string;
  label: string;
  color?: string;          // hex; flows out of this node inherit it
  expandable?: boolean;    // does clicking expand this node?
  expanded?: boolean;      // current state (managed internally; pass false initially)
  parent?: string;         // id of parent node, if this is a child
}
```

`SankeyLink`:

```typescript
interface SankeyLink {
  source: string;          // id of source node
  target: string;          // id of target node
  value: number;           // flow magnitude; drives ribbon thickness
}
```

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Empty `nodes` and `links` | Unovis renders an empty container. No errors. |
| Node with `expandable: true` but no children | Cursor still becomes pointer; clicking sets `expanded = true` but no children appear. Don't do this — it confuses users. Set `expandable: false` if there are no children. |
| Aggregate link value ≠ sum of detail link values | No crash. The diagram changes slightly between collapsed/expanded. Audit your data; the values must reconcile. |
| Link references a non-existent node id | Unovis silently drops the link. Check the console for warnings if flows look incomplete. |
| Cyclic flows (A → B, B → A) | Sankey is directional; cycles produce undefined layout behaviour. Use a DAG only. |
| Recursive collapse | `collapse(grandparent)` walks descendants depth-first and collapses each in turn. State is consistent after a single click. |
| Expanding a node whose children are themselves expandable | Children appear collapsed by default. User can click again to drill another level. |
| Mobile viewport (<800 px) | Container has `min-width: 800px`; demo wraps it in `overflow-x: auto`. Users swipe horizontally. |
| Keyboard navigation | Not implemented — Unovis renders to SVG without focusable nodes. This is documented as a limitation. Use a different component (or contribute a focus-management overlay) for keyboard-critical flows. |
| `prefers-reduced-motion: reduce` | Unovis honours its own internal motion settings; the component does not add CSS transitions of its own. |
| Hover overlap on stacked links | Unovis handles it via z-stacking; tooltips show the topmost link's data. Increase `nodePadding` if collisions are frequent. |

## Dependencies

- **`@unovis/svelte`** + **`@unovis/ts`** — provides `VisSingleContainer`, `VisSankey`, the layout algorithm, link curves, tooltips, and SVG rendering. **Why external?** A native Sankey layout requires iterative node-ranking, link-routing through ports, and curve generation; building it from scratch is a 100+ hour project, and Unovis is a well-maintained library specifically optimised for D3-flavoured visualisations.
- **`./sankeyData.ts`** — local helper that exposes the visibility-aware `expand`/`collapse` API. Hand-rolled in this repo (~80 lines).
- **Svelte 5.x** — `$state`, `$props` for the reactivity dance.

## File Structure

```
src/lib/components/ExpandableSankey.svelte    # the component (named ExpandableSankey, route /sankey)
src/lib/components/sankeyData.ts              # createSankeyData() — visibility manager
src/lib/components/Sankey.md                  # this file
src/routes/sankey/+page.svelte                # demo page
src/routes/sankey/+page.server.ts             # SSR data load (with fallback)
src/lib/server/sankey.ts                      # loadSankeyDataFromDatabase + fallback
src/lib/types.ts                              # SankeyNode, SankeyLink, SankeyData, ExpandableSankeyProps
src/lib/constants.ts                          # FALLBACK_SANKEY_DATA
```
