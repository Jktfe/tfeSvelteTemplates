# RadialCluster - Technical Logic Explainer

## What Does It Do? (Plain English)

RadialCluster displays hierarchical data (like a family tree or file system) in a circular layout. The root is at the centre, and branches spread outward like spokes on a wheel, connected by smooth curved lines.

**Think of it like:** A family tree arranged in a circle! Grandparents in the middle, their children in the next ring, grandchildren in the outer ring - all connected by curved lines showing relationships.

---

## How It Works (Pseudo-Code)

```
WHEN component loads:
  1. PARSE hierarchical data into tree structure
  2. CALCULATE depth of each node (distance from root)
  3. ASSIGN angles to leaf nodes (spread evenly around circle)
  4. CALCULATE parent angles (average of children)
  5. DRAW curved links between parents and children
  6. PLACE nodes and labels at calculated positions

FOR each node:
  - CALCULATE angle (theta) based on position among siblings
  - CALCULATE radius based on depth level
  - CONVERT polar (angle, radius) to cartesian (x, y)

FOR each link:
  - DRAW curved Bézier path from parent to child
```

---

## The Core Concept

### Radial Layout

Unlike a top-down tree, a radial cluster uses **polar coordinates**:

```
Standard Tree:           Radial Cluster:
    [Root]                    ○
   /  |  \                  / | \
  A   B   C              ○   ○   ○
 /\       |            /  \       \
D  E      F          ○    ○       ○

                    (arranged in a circle)
```

### Polar to Cartesian Conversion

Every point is calculated using:
```
x = radius × cos(angle)
y = radius × sin(angle)
```

Where:
- **angle** = position around the circle (0 to 2π radians)
- **radius** = distance from centre (based on depth)

---

## Layout Algorithm

### Step 1: Count Leaves
```
function countLeaves(node):
  IF node has no children:
    return 1
  ELSE:
    return SUM of countLeaves(child) for each child
```

### Step 2: Assign Angles
Leaf nodes are spread evenly around the full circle (360°):

```
Total leaves: 8
Each leaf gets: 360° / 8 = 45°

Angles assigned: 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
```

### Step 3: Parent Positioning
Parents are placed at the **average angle** of their children:

```
Parent with children at 45° and 90°:
Parent angle = (45° + 90°) / 2 = 67.5°
```

---

## Curved Links (Bézier Paths)

Links use **cubic Bézier curves** for smooth connections:

```
M (start point)
C (control point 1) (control point 2) (end point)
```

The control points create a curve that follows the radial direction:

```
              ○ Child
             /
            /   ← Curved link
           /
      ○───○ Parent
```

---

## Label Rotation

Labels rotate to follow the circle, making them easier to read:

```
Left side (180°-360°):     Right side (0°-180°):
    ┤ Label                    Label ├
    (text-anchor: end)         (text-anchor: start)
```

Labels on the left side are flipped 180° so they're not upside down.

---

## Data Format

```javascript
{
  name: "Root",
  children: [
    {
      name: "Branch A",
      children: [
        { name: "Leaf 1" },
        { name: "Leaf 2" }
      ]
    },
    {
      name: "Branch B",
      children: [
        { name: "Leaf 3" }
      ]
    }
  ]
}
```

---

## Visual Structure

```
                    Leaf
                   /
              Branch ─── Leaf
             /
    Centre ─┤
             \
              Branch ─── Leaf
                   \
                    Leaf

All arranged in a circle, not linear!
```

---

## Performance Notes

- **SVG Paths:** Uses SVG `<path>` for smooth Bézier curves
- **Single Pass Layout:** Tree traversed once to calculate positions
- **CSS Transitions:** Hover effects use CSS for smoothness
- **Lazy Labels:** Labels hidden for very small nodes

---

## Edge Cases Handled

| Situation | Behaviour |
|-----------|-----------|
| Single node | Dot in centre, no links |
| Very deep tree | Inner rings get smaller |
| Many siblings | Nodes spread evenly |
| Long labels | May overlap (rotate helps) |
| Empty children array | Treated as leaf node |

---

## What This Component Does NOT Do

- Does not support collapsible branches (see ExpandableSankey)
- Does not animate layout changes
- Does not auto-size labels to fit
- Does not have zoom/pan features

---

## Dependencies

**Zero external dependencies.**

This component uses only:
- Svelte 5 (`$props()`, `$state()`, `$derived()` runes)
- Standard SVG elements (`<path>`, `<circle>`, `<text>`)
- Native JavaScript trigonometry (Math.sin, Math.cos)

Inspired by D3's radial cluster example, but rewritten entirely in native Svelte.

---

## File Structure

```
RadialCluster.svelte      # The component
RadialCluster.test.ts     # Unit tests
RadialCluster.md          # This explainer
```

---

*Last updated: 26 December 2025*
