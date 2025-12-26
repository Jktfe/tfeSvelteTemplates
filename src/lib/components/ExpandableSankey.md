# ExpandableSankey - Technical Logic Explainer

## What Does It Do? (Plain English)

ExpandableSankey displays flow data (like energy distribution or budget breakdowns) as a diagram where ribbons connect sources to destinations. The clever bit: you can click on nodes to expand them and see the detailed breakdown hiding underneath!

**Think of it like:** A river that splits into streams! Click on "Coal" to see it split into "Coal Plant A" and "Coal Plant B". Click again to merge them back into one river.

---

## How It Works (Pseudo-Code)

```
WHEN component loads:
  1. CREATE data manager with all nodes and links
  2. MARK all nodes as "collapsed" initially
  3. FILTER to show only top-level nodes
  4. FILTER links to show only aggregate flows
  5. RENDER the Sankey diagram

WHEN user clicks an expandable node:
  IF node is collapsed:
    1. SET node.expanded = true
    2. SHOW child nodes
    3. HIDE aggregate links (parent → destination)
    4. SHOW child links (parent → children, children → destination)
  ELSE:
    1. SET node.expanded = false
    2. HIDE child nodes (and all their descendants!)
    3. SHOW aggregate links
    4. HIDE child links

AFTER any expand/collapse:
  1. RECALCULATE visible nodes and links
  2. TRIGGER Svelte reactivity
  3. UNOVIS animates the transition
```

---

## The Core Concept

### Before Expand (Collapsed View)

```
                    ┌──────────────┐
Energy ───────────► │    Coal      │ ════════════► Residential
                    │  (click me!) │ ════════════► Industrial
                    └──────────────┘
                         ↓
                    (30 units total, aggregated)
```

### After Expand (Detailed View)

```
                    ┌──────────────┐
                 ┌─►│ Coal Plant A │ ─────► Residential
                 │  └──────────────┘ ─────► Industrial
Energy ──► Coal ─┤
                 │  ┌──────────────┐
                 └─►│   Coal BBQs  │ ─────► Residential
                    └──────────────┘
```

The total flow is the same (30 units), but now you see the breakdown!

---

## Visibility Rules

### Nodes

| Node Type | When Visible? |
|-----------|---------------|
| Top-level (no parent) | Always |
| Child node | Only when parent is expanded |
| Grandchild | Only when parent AND grandparent expanded |

### Links

| Link Type | When Visible? |
|-----------|---------------|
| Source → Destination (aggregate) | When source is collapsed |
| Parent → Child | When parent is expanded |
| Child → Destination (detail) | When parent is expanded |

---

## The Aggregate Link Trick

This is the clever part! We store **two versions** of each flow:

```javascript
// Aggregate link (shown when collapsed)
{ source: 'coal', target: 'residential', value: 18 }

// Detailed links (shown when expanded)
{ source: 'coal-plant-a', target: 'residential', value: 12 }
{ source: 'coal-bbqs', target: 'residential', value: 6 }
```

The values match! 12 + 6 = 18. When you expand, the aggregate disappears and the details appear.

---

## Data Manager Pattern

Instead of a class, we use a **factory function** that returns a plain object:

```javascript
const manager = createSankeyData(nodes, links);

// The manager has:
manager.nodes  // Currently visible nodes
manager.links  // Currently visible links
manager.expand(node)   // Show children
manager.collapse(node) // Hide children
```

### Why This Pattern?

Svelte 5's `$state()` works best with plain objects. We reassign `data = manager` after changes to trigger reactivity.

---

## Recursive Collapse

When you collapse a parent, ALL descendants collapse too:

```
Before: Gas → Gas Plant B → Substation Z (all expanded)
After:  Gas (collapsed) - everything underneath hidden

This prevents "orphaned" expanded nodes that you can't see!
```

---

## Unovis Integration

We use the Unovis library (`@unovis/svelte`) for rendering because Sankey layout is complex:

```svelte
<VisSingleContainer {data}>
  <VisSankey
    linkColor={getLinkColor}
    nodeCursor={getNodeCursor}
    events={{
      [Sankey.selectors.node]: { click: toggleGroup }
    }}
  />
</VisSingleContainer>
```

### Why Not Native?

Sankey layout requires:
- Node positioning algorithms
- Link curve calculations
- Flow width calculations
- Collision avoidance

This would take 100+ hours to build natively. Unovis provides battle-tested implementations.

---

## Link Colouring

Each link inherits its colour from the **source node**:

```javascript
linkColor: (link) => {
  const sourceNode = nodes.find(n => n.id === link.source.id);
  return sourceNode?.color ?? '#ccc';
}
```

This creates a visual flow where you can trace where things come from.

---

## Data Format

```javascript
{
  nodes: [
    { id: 'energy', label: 'Energy Sources', color: '#6366f1' },
    { id: 'coal', label: 'Coal', color: '#8B4513', expandable: true },
    { id: 'coal-plant-a', label: 'Plant A', color: '#8B4513', parent: 'coal' },
    { id: 'residential', label: 'Residential', color: '#32CD32' }
  ],
  links: [
    { source: 'energy', target: 'coal', value: 30 },
    { source: 'coal', target: 'coal-plant-a', value: 20 },
    { source: 'coal-plant-a', target: 'residential', value: 20 },
    { source: 'coal', target: 'residential', value: 20 } // Aggregate
  ]
}
```

---

## Mobile Handling

On mobile, the diagram has a minimum width of 800px and the container scrolls horizontally:

```css
.sankey-container {
  min-width: 800px;  /* Ensures readability */
}

/* In the demo page: */
.scroll-wrapper {
  overflow-x: auto;   /* Horizontal scroll */
}
```

---

## Performance Notes

- **Unovis Handles Rendering:** Layout calculations are optimised
- **Single Data Object:** Reactivity triggered by reassignment, not deep watching
- **CSS Transitions:** Unovis handles smooth animations internally

---

## Edge Cases Handled

| Situation | Behaviour |
|-----------|-----------|
| Click non-expandable node | Nothing happens |
| Collapse already-collapsed | No effect |
| Empty children | Node still expandable but no children appear |
| Deep nesting | All levels work recursively |

---

## What This Component Does NOT Do

- Does not support drag-to-reorder nodes
- Does not animate individual links (Unovis handles this)
- Does not have search/filter functionality
- Does not support horizontal layout (always left-to-right)

---

## Dependencies

**External: @unovis/svelte, @unovis/ts**

Justification: Sankey layout algorithms are extremely complex. Building natively would take 100+ hours. Unovis is well-maintained and provides smooth transitions.

---

## File Structure

```
ExpandableSankey.svelte      # The component
sankeyData.ts                # Data manager factory
ExpandableSankey.test.ts     # Unit tests (26 tests)
ExpandableSankey.md          # This explainer
```

---

*Last updated: 26 December 2025*
