# DomeGallery - Technical Logic Explainer

## What Does It Do? (Plain English)

DomeGallery creates a stunning 3D spherical gallery where images are arranged on a dome surface. Users can drag to spin the globe, watch it coast with momentum, and click any image to view it enlarged. It's like a futuristic photo viewer from a sci-fi movie!

**Think of it like:** A snow globe filled with photos instead of snowflakes. You can spin it around by dragging, and it keeps spinning after you let go (like a globe on a desk). Click any photo to see it bigger.

---

## How It Works (Pseudo-Code)

```
WHEN component loads:
  1. BUILD grid of image tiles arranged on sphere surface
  2. CALCULATE sphere radius based on container size
  3. RENDER tiles with CSS 3D transforms
  4. SET UP event listeners for interaction

WHEN user drags on sphere:
  1. CAPTURE starting position and rotation
  2. TRACK velocity (speed + direction) during drag
  3. UPDATE rotation based on movement
  4. APPLY transforms to spin the sphere

WHEN user releases drag:
  1. IF velocity > threshold:
     - START inertia animation
     - APPLY friction each frame
     - STOP when velocity < threshold
  2. RECORD drag end time (for click detection)

WHEN user clicks an image tile:
  1. IGNORE if it was actually a drag (moved too far)
  2. LOCK page scrolling
  3. CREATE overlay element at tile's position
  4. ANIMATE overlay to screen centre
  5. OPTIONALLY resize to custom dimensions

WHEN user closes enlarged image:
  1. ANIMATE overlay back to tile position
  2. FADE out and show original tile
  3. UNLOCK page scrolling
```

---

## The Core Concept: CSS 3D Transforms

### Building a Sphere from Flat Tiles

The "sphere" isn't actually a sphere - it's a collection of flat images positioned in 3D space to *appear* like a sphere surface.

```
How tiles are positioned:

  Stage (perspective container)
  │
  └── Sphere (translateZ back)
      │
      ├── Tile 1: rotateY(α) rotateX(β) translateZ(radius)
      ├── Tile 2: rotateY(α) rotateX(β) translateZ(radius)
      └── Tile N: rotateY(α) rotateX(β) translateZ(radius)

Each tile is:
1. Rotated to its position (latitude + longitude)
2. Pushed outward to the sphere's surface (translateZ)
```

### The Transform Chain

```css
/* Step 1: Push sphere back (centre at viewer position) */
.sphere {
  transform: translateZ(calc(var(--radius) * -1));
}

/* Step 2: Position each tile on sphere surface */
.item {
  transform:
    rotateY(longitude)    /* Turn to horizontal position */
    rotateX(latitude)     /* Tilt to vertical position */
    translateZ(radius);   /* Push out to surface */
}
```

**Visual Explanation:**

```
Top-down view (rotateY determines position):

         North
           ↑
           │
    ┌──────┼──────┐
    │      │      │
West ←──── ● ────→ East
    │   viewer    │
    │      │      │
    └──────┼──────┘
           │
           ↓
         South

Side view (rotateX determines position):

           Up
           ↑
    ┌──────┼──────┐
    │      │      │
    │   viewer    │
    │      ●      │
    │             │
    └──────┼──────┘
           │
           ↓
          Down
```

---

## The Grid Layout: Staggered Brick Pattern

Images aren't arranged in a boring grid - they use a "brick pattern" for visual interest.

```javascript
// Even columns have these Y offsets
const evenYs = [-4, -2, 0, 2, 4];

// Odd columns have these Y offsets (shifted by 1)
const oddYs = [-3, -1, 1, 3, 5];

// This creates:
//   Even     Odd      Even     Odd
//   ┌──┐             ┌──┐
//   │  │    ┌──┐     │  │    ┌──┐
//   └──┘    │  │     └──┘    │  │
//   ┌──┐    └──┘     ┌──┐    └──┘
//   │  │    ┌──┐     │  │    ┌──┐
//   └──┘    │  │     └──┘    │  │
//           └──┘             └──┘
```

---

## Physics-Based Inertia

### Velocity Tracking

During drag, we track velocity (speed + direction):

```javascript
// Each frame during drag:
const now = performance.now();
const dt = now - lastMoveTime;  // Time since last move

velocity = {
  x: (currentX - lastX) / dt,   // Horizontal speed
  y: (currentY - lastY) / dt    // Vertical speed
};
```

### Friction Animation

When you release, velocity decays exponentially:

```javascript
function startInertia(vx, vy) {
  const friction = 0.94;  // ~6% speed loss per frame

  const step = () => {
    // Apply friction
    vX *= friction;
    vY *= friction;

    // Stop when too slow
    if (Math.abs(vX) < threshold) return;

    // Update rotation
    rotation.y += vX / 200;
    rotation.x += vY / 200;

    // Next frame
    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}
```

**Velocity Decay Over Time:**

```
100% ████████████████████
 80% ████████████████
 60% ████████████
 45% █████████
 34% ███████
 26% █████
 19% ████
 14% ███
 10% ██
  7% █
     ─────────────────────→
     Frame 0  →  Frame 20
```

---

## Click vs Drag Detection

How do we know if you clicked or dragged?

```javascript
// Threshold: 4 pixels (squared for cheaper comparison)
const DRAG_THRESHOLD_SQUARED = 16;

// During drag:
const dxTotal = currentX - startX;
const dyTotal = currentY - startY;
const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;

if (dist2 > DRAG_THRESHOLD_SQUARED) {
  moved = true;  // It's a drag, not a click
}

// On click handler:
if (moved) return;  // Was actually a drag
if (performance.now() - lastDragEndTime < 80) return;  // Debounce
openImage();  // It's a real click!
```

---

## Image Enlargement Animation

### Opening Animation

```
Step 1: Calculate tile's screen position
┌──────────────────────────────────┐
│                                  │
│      ┌───┐                       │
│      │ * │ ← Tile on sphere      │
│      └───┘                       │
│                                  │
└──────────────────────────────────┘

Step 2: Create overlay at tile position
┌──────────────────────────────────┐
│                                  │
│      ┌───┐                       │
│      │ ▣ │ ← Overlay (same pos)  │
│      └───┘                       │
│                                  │
└──────────────────────────────────┘

Step 3: Animate to centre
┌──────────────────────────────────┐
│                                  │
│        ┌─────────────┐           │
│        │             │           │
│        │      ▣      │ ← Enlarged│
│        │             │           │
│        └─────────────┘           │
│                                  │
└──────────────────────────────────┘
```

### The Transform Math

```javascript
// Initial position (at tile)
const tx0 = tileRect.left - frameRect.left;
const ty0 = tileRect.top - frameRect.top;
const sx0 = tileRect.width / frameRect.width;
const sy0 = tileRect.height / frameRect.height;

// Set initial transform
overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${sx0}, ${sy0})`;

// Animate to final position
overlay.style.transform = 'translate(0, 0) scale(1, 1)';
```

---

## Responsive Radius Calculation

The sphere radius adapts to container size:

```javascript
// In ResizeObserver callback:
const w = containerWidth;
const h = containerHeight;
const aspect = w / h;

// Choose basis dimension based on fitBasis prop
let basis;
switch (fitBasis) {
  case 'min': basis = Math.min(w, h); break;
  case 'max': basis = Math.max(w, h); break;
  case 'width': basis = w; break;
  case 'height': basis = h; break;
  default: basis = aspect >= 1.3 ? w : Math.min(w, h);  // Auto
}

// Calculate radius with guards
let radius = basis * fit;
radius = Math.min(radius, h * 1.35);  // Don't exceed 135% height
radius = clamp(radius, minRadius, maxRadius);
```

---

## CSS Custom Properties

The component uses CSS variables for dynamic values:

| Variable | Purpose | Set By |
|----------|---------|--------|
| `--radius` | Sphere radius | ResizeObserver |
| `--segments-x/y` | Grid divisions | Props |
| `--circ` | Circumference | Calculated |
| `--rot-x/y` | Degrees per grid unit | Calculated |
| `--item-width/height` | Tile dimensions | Calculated |
| `--tile-radius` | Tile border radius | Props |
| `--enlarge-radius` | Enlarged image radius | Props |
| `--image-filter` | Grayscale filter | Props |
| `--overlay-blur-color` | Edge fade colour | Props |

---

## Performance Optimisations

### 1. GPU-Accelerated Transforms

```css
.sphere { will-change: transform; }
.item__image { transform: translateZ(0); }  /* Force layer */
```

### 2. Backface Culling

```css
.item { backface-visibility: hidden; }
/* Tiles facing away from viewer aren't rendered */
```

### 3. Layout Containment

```css
.stage { contain: layout paint size; }
/* Changes inside don't trigger parent relayout */
```

### 4. Minimal Reactive State

```javascript
// These don't trigger re-renders:
let dragging = false;        // Plain variable
let velocity = { x: 0, y: 0 }; // Plain object

// This does trigger re-renders:
let rotation = $state({ x: 0, y: 0 }); // Only when needed
```

---

## Edge Cases Handled

| Situation | Behaviour |
|-----------|-----------|
| Drag outside container | Pointer capture continues tracking |
| Very fast drag | Velocity clamped to MAX_VELOCITY |
| Click right after drag | 80ms debounce prevents accidental open |
| No images provided | Empty tiles rendered |
| Too many images | Warning logged, excess ignored |
| Image load failure | Broken image shows in tile |
| Escape key pressed | Enlarged image closes |
| Page scroll during enlarge | Scroll locked |
| Component unmount | Scroll lock cleaned up |
| Container resize | Radius recalculated |

---

## Accessibility Features

### Keyboard Navigation

- **Tab**: Focus tiles sequentially
- **Enter/Space**: Open focused tile
- **Escape**: Close enlarged image

### ARIA Attributes

```html
<div
  role="button"
  tabindex="0"
  aria-label="Open image: {alt text}"
>
```

### Focus Management

- Tiles receive focus outline (can be customised)
- Focus returns to tile after closing enlarged view

---

## What This Component Does NOT Do

- Does not support vertical (up/down) scrolling
- Does not lazy-load images (parent should handle)
- Does not support pinch-to-zoom on enlarged images
- Does not persist rotation state between sessions
- Does not support dynamic image addition/removal
- Does not provide image download functionality
- Does not animate between multiple enlarged images

---

## Dependencies

**Zero external dependencies** - fully portable!

Uses:
- Svelte 5 runes (`$state()`, `$derived()`, `$effect()`)
- CSS 3D transforms and perspective
- Pointer Events API for unified input handling
- ResizeObserver API for responsive sizing
- requestAnimationFrame for smooth animation

---

## File Structure

```
DomeGallery.svelte    # The component
DomeGallery.test.ts   # Unit tests
DomeGallery.md        # This explainer
```

---

## Props Quick Reference

| Prop | Default | Purpose |
|------|---------|---------|
| `images` | `[]` | Image data (URLs or {src, alt}) |
| `segments` | `35` | Grid divisions (more = smaller tiles) |
| `fit` | `0.5` | Radius multiplier (0-1) |
| `minRadius` | `600` | Minimum sphere radius |
| `maxRadius` | `Infinity` | Maximum sphere radius |
| `dragSensitivity` | `20` | Drag responsiveness |
| `dragDampening` | `0.8` | Inertia duration (0-1) |
| `enlargeTransitionMs` | `300` | Animation duration |
| `grayscale` | `true` | Apply grayscale filter |
| `overlayBlurColor` | `'#060010'` | Edge fade colour |

---

*Last updated: 26 December 2025*
