# Sunburst - Technical Logic Explainer

## What Does It Do? (Plain English)

Sunburst displays hierarchical data as concentric rings, like rings on a tree trunk. Each segment's size shows its proportion of the parent. Click any segment to zoom in and explore deeper levels - it's like drilling down into your data!

**Think of it like:** A pie chart that keeps splitting into smaller pies! The inner ring shows top-level categories, click one to zoom in and see its subcategories fill the whole chart.

---

## How It Works (Pseudo-Code)

```
WHEN component loads:
  1. CALCULATE total value of root
  2. FOR each node, CALCULATE:
     - Start angle (where segment begins)
     - End angle (where segment ends)
     - Inner radius (distance from centre)
     - Outer radius (thickness of ring)
  3. DRAW arc segments for visible nodes
  4. ADD labels to large enough segments

WHEN user clicks a segment:
  1. SET clicked node as new "root"
  2. ANIMATE all segments to new positions
  3. UPDATE breadcrumb trail
  4. FADE out segments not in new subtree

WHEN user clicks centre or breadcrumb:
  1. ZOOM back out to parent level
  2. ANIMATE segments back to previous positions
```

---

## The Core Concept

### Hierarchical Rings

```
        Level 2 (outer ring)
       /
      ├── Level 1 (middle ring)
     /
Root (centre)

          ╭─────────╮
        ╭─┤  B1  B2 ├─╮
       A  ╰─────────╯  C
        ╰──────┬──────╯
              [R]  ← Root (centre)
```

Each level adds another ring around the centre.

### Arc Geometry

Each segment is defined by four values:
- **startAngle**: Where it begins (in radians)
- **endAngle**: Where it ends (in radians)
- **innerRadius**: Distance from centre to inner edge
- **outerRadius**: Distance from centre to outer edge

```
                 outerRadius
                    ↓
          ╭─────────────────╮
          │   SEGMENT ARC   │
          ╰─────────────────╯
                    ↑
               innerRadius
```

---

## Partition Algorithm

The layout uses a **partition** algorithm:

### Step 1: Calculate Values
Each node's value = sum of children's values (or its own if leaf)

```
        [100]              ← Root total = 100
       /     \
    [60]     [40]          ← Branch totals
    / \        |
 [40] [20]   [40]          ← Leaf values
```

### Step 2: Assign Angles
Angles are proportional to values:

```
Total: 360°
Node A (60%): 0° to 216°
Node B (40%): 216° to 360°
```

### Step 3: Assign Radii
Based on depth in tree:

```
Depth 0 (root): radius 0 to 100
Depth 1: radius 100 to 200
Depth 2: radius 200 to 300
```

---

## Zoom Animation

When you click to zoom:

### Before (Root View)
```
      ╭─────────────╮
    A │      B      │ C
      ╰──────┬──────╯
            [R]
```

### After (Zoomed to B)
```
      ╭─────────────╮
   B1 │     B2      │ B3
      ╰──────┬──────╯
            [B]  ← B is now the centre
```

The animation interpolates:
- Angles expand (B's children now fill 360°)
- Radii shift (B moves to centre)
- Other segments fade out

---

## Arc Path Generation

Each segment is drawn using SVG arc commands:

```javascript
function arcPath(startAngle, endAngle, innerRadius, outerRadius) {
  return `
    M ${x1} ${y1}           // Move to start of outer arc
    A ${outerR} ${outerR}   // Draw outer arc
    L ${x2} ${y2}           // Line to inner arc
    A ${innerR} ${innerR}   // Draw inner arc (reverse)
    Z                       // Close path
  `;
}
```

---

## Label Visibility

Labels only show if the segment is "big enough":

```
IF (endAngle - startAngle) > labelMinAngle:
  SHOW label
ELSE:
  HIDE label (too cramped)
```

Labels are positioned at the midpoint of the arc and rotated to follow the curve.

---

## Breadcrumb Navigation

The breadcrumb shows your current path:

```
Root > Category A > Subcategory B
  ↑        ↑             ↑
Click to zoom back to that level
```

---

## Data Format

```javascript
{
  name: "Root",
  children: [
    {
      name: "Category A",
      children: [
        { name: "Item 1", value: 100 },
        { name: "Item 2", value: 50 }
      ]
    },
    {
      name: "Category B",
      value: 75  // Leaf node with direct value
    }
  ]
}
```

---

## Performance Notes

- **SVG Paths:** Uses `<path>` elements for smooth arcs
- **Transition Interpolation:** Animates angle/radius values, not DOM positions
- **Visibility Culling:** Off-screen segments not rendered during zoom
- **CSS will-change:** Hints browser about animated properties

---

## Edge Cases Handled

| Situation | Behaviour |
|-----------|-----------|
| Single segment | Fills entire ring |
| Zero values | Segment has no width |
| Very deep trees | May run out of radius space |
| Many siblings | Each gets proportional slice |
| Click root | No zoom (already at root) |

---

## What This Component Does NOT Do

- Does not support dragging/rotating the view
- Does not have search/filter functionality
- Does not support horizontal (icicle) layout
- Does not auto-collapse small segments

---

## Dependencies

**Zero external dependencies.**

This component uses only:
- Svelte 5 (`$props()`, `$state()`, `$derived()` runes)
- Standard SVG elements (`<path>`, `<text>`, `<g>`)
- Native JavaScript trigonometry and animation

Inspired by D3's zoomable sunburst example, but rewritten entirely in native Svelte.

---

## File Structure

```
Sunburst.svelte      # The component
Sunburst.test.ts     # Unit tests
Sunburst.md          # This explainer
```

---

*Last updated: 26 December 2025*
