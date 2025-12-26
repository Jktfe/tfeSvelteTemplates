# AnimatedBeam - Technical Logic Explainer

## What Does It Do? (Plain English)

AnimatedBeam draws animated lines ("beams") connecting circular nodes in an SVG diagram. The beams flow with a dashed animation effect, perfect for showing data flow, connections between services, or any system where things move from point A to point B.

**Think of it like:** A network diagram where you can see the data packets travelling along the wires!

---

## How It Works (Pseudo-Code)

```
WHEN component renders:
  1. CREATE SVG container with viewBox for responsive scaling
  2. IF gradient mode: DEFINE linearGradient for flowing particle effect

  3. FOR each connection:
     FIND source node coordinates
     FIND target node coordinates
     DRAW line from source to target
     APPLY dashed stroke animation

  4. FOR each node:
     DRAW circle at node position
     IF node has label: ADD text above circle

ANIMATION (pure CSS):
  - stroke-dasharray: 8 8  (creates dashed line)
  - Animate stroke-dashoffset from 100 to 0
  - Creates illusion of flowing dots
```

---

## The Flowing Animation Trick (Visual)

```
Static dashed line:
  ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━

stroke-dasharray: 8 8 means:
  8px dash, 8px gap, 8px dash, 8px gap...

Animating stroke-dashoffset:

Frame 1 (offset: 100):
  ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━

Frame 2 (offset: 75):
    ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━

Frame 3 (offset: 50):
      ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━

Result: Dashes appear to move along the line!
```

---

## CSS Animation Strategy

```css
/* The magic animation */
.beam {
  stroke-dasharray: 8 8;           /* Create dashed pattern */
  stroke-linecap: round;           /* Rounded dash ends */
  animation: beam-flow 2s linear infinite;
}

/* Forward flow (source → target) */
@keyframes beam-flow {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}

/* Reverse flow (target → source) */
@keyframes beam-flow-reverse {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: 100; }
}
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `600` | SVG viewBox width |
| `height` | `number` | `400` | SVG viewBox height |
| `nodes` | `BeamNode[]` | (defaults) | Array of node positions |
| `connections` | `BeamConnection[]` | (defaults) | Array of source→target pairs |
| `beamColor` | `string` | `'#3b82f6'` | Beam stroke colour |
| `beamWidth` | `number` | `2` | Beam stroke width |
| `beamSpeed` | `number` | `2` | Animation duration (seconds) |
| `bidirectional` | `boolean` | `false` | Default direction for all beams |
| `gradient` | `boolean` | `false` | Use gradient for flowing particle effect |
| `nodeSize` | `number` | `12` | Circle radius for nodes |
| `nodeColor` | `string` | `'#3b82f6'` | Node fill colour |

---

## Data Structures

### BeamNode
```typescript
interface BeamNode {
  id: string;       // Unique identifier (e.g., 'server-1')
  x: number;        // X position in viewBox coordinates
  y: number;        // Y position in viewBox coordinates
  label?: string;   // Optional text label above node
}
```

### BeamConnection
```typescript
interface BeamConnection {
  from: string;          // Source node ID
  to: string;            // Target node ID
  bidirectional?: boolean;  // Override global bidirectional setting
}
```

---

## SVG Coordinate System

```
viewBox="0 0 600 400"
          ↑       ↑
       width   height

┌─────────────────────────────────────────────┐ (0,0)
│                                             │
│         (100, 100)                          │
│              ●────────────●                 │
│           Node A      (300, 100)            │
│                        Node B               │
│                          │                  │
│                          │                  │
│                          ● (300, 300)       │
│                        Node C               │
│                                             │
└─────────────────────────────────────────────┘ (600, 400)

// SVG coordinates: (0,0) is top-left
// X increases rightward, Y increases downward
```

---

## Responsive Sizing

```svelte
<div style="--aspect-ratio: {width / height}; max-width: {width}px;">
  <svg width="100%" height="100%" viewBox="0 0 {width} {height}">
    <!-- Content scales to fit container -->
  </svg>
</div>

// CSS:
.animated-beam-container {
  width: 100%;
  aspect-ratio: var(--aspect-ratio);  // Maintains proportions
}

// Result: SVG scales smoothly on all screen sizes
```

---

## Gradient Mode

```svelte
{#if gradient}
  <defs>
    <linearGradient id="beam-gradient">
      <stop offset="0%" stop-color="transparent" />
      <stop offset="50%" stop-color={beamColor} />
      <stop offset="100%" stop-color="transparent" />
    </linearGradient>
  </defs>
{/if}

<line stroke={gradient ? 'url(#beam-gradient)' : beamColor} />

// Creates a "packet" effect:
//    ░░░░▓▓▓▓░░░░
// Transparent at edges, solid in middle
```

---

## Accessibility Features

```css
/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .beam {
    animation: none;        /* Stop animation */
    stroke-dasharray: none; /* Show solid line */
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .node-label {
    fill: #f3f4f6;  /* Light text on dark */
  }
}
```

---

## Layer Order

```
SVG Rendering Order (painter's algorithm):
1. Beams layer (rendered first, appears behind)
2. Nodes layer (rendered last, appears on top)

<g class="beams">
  <line ... />  ← Drawn first
</g>
<g class="nodes">
  <circle ... /> ← Drawn on top
</g>
```

---

## Animation Patterns

### Uni-directional (default)
```
  A ━━━━━━▶ B
  Data flows one way
```

### Bi-directional
```
  A ◀━━━━━▶ B
  Data flows both ways (two animations)
```

### Multi-input
```
  A ━━━━━━┓
          ┣━━▶ C
  B ━━━━━━┛
  Multiple sources feed into one target
```

---

## Common Use Cases

### System Architecture
```svelte
<AnimatedBeam
  nodes={[
    { id: 'client', x: 100, y: 200, label: 'Client' },
    { id: 'api', x: 300, y: 200, label: 'API' },
    { id: 'db', x: 500, y: 200, label: 'Database' }
  ]}
  connections={[
    { from: 'client', to: 'api' },
    { from: 'api', to: 'db' }
  ]}
/>
```

### Data Pipeline
```svelte
<AnimatedBeam
  nodes={[
    { id: 'source', x: 100, y: 100, label: 'Raw Data' },
    { id: 'transform', x: 300, y: 200, label: 'Transform' },
    { id: 'load', x: 500, y: 100, label: 'Data Lake' }
  ]}
  connections={[
    { from: 'source', to: 'transform' },
    { from: 'transform', to: 'load' }
  ]}
  beamSpeed={1.5}
  gradient={true}
/>
```

---

## Performance Considerations

- **CSS animations** - Offloaded to compositor, 60fps guaranteed
- **SVG viewBox** - Vector graphics scale without pixelation
- **No JavaScript animation** - All motion via CSS keyframes
- **Reduced motion** - Respects user preference, shows static lines

---

## Dependencies

- **$lib/types** (AnimatedBeamProps, BeamNode, BeamConnection)
- **$lib/constants** (default nodes and connections)
- **Zero external dependencies** - Pure SVG + CSS

---

## File Structure

```
AnimatedBeam.svelte   # The component
AnimatedBeam.test.ts  # Unit tests
AnimatedBeam.md       # This explainer
```

---

*Last updated: 26 December 2025*
