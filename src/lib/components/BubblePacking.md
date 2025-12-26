# BubblePacking - Technical Logic Explainer

## What Does It Do? (Plain English)

BubblePacking arranges data as circles (bubbles) where each bubble's size represents its value. Bigger values = bigger bubbles. The bubbles use a physics simulation to push each other around until they find a comfortable arrangement.

**Think of it like:** Filling a jar with different-sized marbles! They jostle around until they settle into place, with big marbles taking more room and small ones fitting in the gaps.

---

## How It Works (Pseudo-Code)

```
WHEN component loads:
  1. CALCULATE radius for each bubble based on value
  2. ASSIGN colours based on group
  3. START physics simulation

PHYSICS SIMULATION (runs ~60 times per second):
  1. FOR each bubble:
     - APPLY force toward centre (gravity)
     - CHECK for collisions with other bubbles
     - IF overlapping, PUSH bubbles apart
  2. MOVE bubbles based on accumulated forces
  3. REPEAT until stable (or max iterations)

WHEN user hovers over a bubble:
  1. HIGHLIGHT the bubble (opacity + stroke)
  2. SHOW tooltip with label and value

WHEN user clicks a bubble:
  1. CALL the onBubbleClick handler with bubble data
```

---

## The Core Concept

### Size Calculation

Bubble radius is proportional to the **square root** of the value (not linear):

```
radius = sqrt(value) × scaleFactor
```

Why square root? Because we perceive **area**, not radius. Doubling the radius makes a circle 4x larger visually. Using square root keeps perception linear.

```
Value: 100    Value: 400
radius: 10    radius: 20
area: 314     area: 1256 (4x larger, correct!)
```

---

## Force Simulation

The physics engine applies three forces:

### 1. Centre Gravity
Pulls all bubbles toward the centre:
```
force_x = (centre_x - bubble_x) × 0.01
force_y = (centre_y - bubble_y) × 0.01
```

### 2. Collision Detection
Pushes overlapping bubbles apart:
```
FOR each pair of bubbles:
  distance = sqrt((x2-x1)² + (y2-y1)²)
  overlap = (radius1 + radius2) - distance

  IF overlap > 0:
    PUSH bubbles apart proportionally
```

### 3. Velocity Damping
Slows movement over time (like friction):
```
velocity = velocity × 0.9
```

---

## Layout Algorithm (Simplified)

```
┌─────────────────────────────────┐
│                                 │
│       ○ ○    ○                  │
│     ○     ⬤                     │
│       ○       ○                 │
│         ○   ○                   │
│                                 │
└─────────────────────────────────┘

Legend:
⬤ = Large value (big bubble)
○ = Small value (small bubble)
```

Bubbles naturally cluster with larger ones in the middle (more gravitational pull) and smaller ones around the edges.

---

## Group Colouring

Each bubble can belong to a group, and groups share colours:

```javascript
const colorScheme = [
  '#4285f4', // Group 0 - Blue
  '#ea4335', // Group 1 - Red
  '#fbbc04', // Group 2 - Yellow
  '#34a853', // Group 3 - Green
  // ... more colours
];

bubble.color = colorScheme[bubble.group % colorScheme.length];
```

---

## Data Format

```javascript
[
  { id: 'a', label: 'Apple', value: 100, group: 'fruits' },
  { id: 'b', label: 'Banana', value: 50, group: 'fruits' },
  { id: 'c', label: 'Carrot', value: 75, group: 'vegetables' },
]
```

---

## Hover Effects

The component uses CSS-only hover effects (no scale/transform to prevent movement):

```css
.bubble-circle {
  opacity: 0.85;
  transition: opacity 0.15s, stroke-width 0.15s;
}

.bubble-circle:hover {
  opacity: 1;
  stroke-width: 3px;
  stroke: rgba(255, 255, 255, 0.9);
}
```

---

## Performance Notes

- **SVG Rendering:** Uses SVG circles for smooth scaling
- **Force Simulation:** Runs at 60fps using requestAnimationFrame
- **Early Exit:** Simulation stops when velocity drops below threshold
- **CSS Transitions:** Hover effects are CSS-only for smoothness

---

## Edge Cases Handled

| Situation | Behaviour |
|-----------|-----------|
| Empty data | Nothing rendered |
| Single bubble | Centres in container |
| Very small values | Minimum radius applied |
| Many bubbles | May take longer to stabilize |
| Identical values | All same size, spread evenly |

---

## What This Component Does NOT Do

- Does not support nested/hierarchical bubbles (use Sunburst for that)
- Does not animate value changes (re-renders with new positions)
- Does not support dragging bubbles
- Does not have zoom/pan features

---

## Dependencies

**Zero external dependencies.**

This component uses only:
- Svelte 5 (`$props()`, `$state()`, `$effect()` runes)
- Standard SVG elements
- Native JavaScript physics calculations

---

## File Structure

```
BubblePacking.svelte      # The component
BubblePacking.test.ts     # Unit tests
BubblePacking.md          # This explainer
```

---

*Last updated: 26 December 2025*
