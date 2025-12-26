# BeforeAfter - Technical Logic Explainer

## What Does It Do? (Plain English)

BeforeAfter creates an interactive image comparison slider where users drag a divider left and right to reveal different portions of two overlapping images. Perfect for "before and after" comparisons of photo edits, renovations, or any visual transformation.

**Think of it like:** Wiping a steamy mirror to reveal what's behind it! Drag the slider left to see more of the "after" image, right to see more of the "before" image.

---

## How It Works (Pseudo-Code)

```
WHEN component loads:
  1. RECEIVE two image URLs (before, after)
  2. SET divider position to initial value (default: 50%)
  3. CALCULATE clip-paths for both images
  4. RENDER overlapping images with divider handle

WHEN user presses down on divider:
  1. SET isDragging = true
  2. CAPTURE pointer (track it everywhere)
  3. CALCULATE position from click coordinates
  4. UPDATE divider position

WHEN user moves while dragging:
  1. IF not dragging: IGNORE
  2. GET pointer X position relative to container
  3. CONVERT pixels to percentage (0-100)
  4. CLAMP to valid range
  5. UPDATE divider position
  6. RECALCULATE clip-paths

WHEN user releases:
  1. SET isDragging = false
  2. RELEASE pointer capture

WHEN user presses arrow keys:
  1. Arrow Left: DECREASE position by 1%
  2. Arrow Right: INCREASE position by 1%
```

---

## The Core Concept

### Image Layering with Clip-Path

```
Container (relative positioning)
├── After Image  (absolute, full size, clipped from LEFT)
├── Before Image (absolute, full size, clipped from RIGHT)
└── Divider Handle (absolute, positioned at percentage)

At 50% position:
┌────────────────────────────────────┐
│  BEFORE          │          AFTER  │
│  (visible left)  │  (visible right)│
│                  │                 │
│        ◀─────────┼─────────▶       │
│                  │                 │
└────────────────────────────────────┘
```

### CSS Clip-Path Magic

The `inset()` function clips from edges: `inset(top right bottom left)`

```javascript
// Before image: clip from RIGHT edge
// At 30% position: show 30% of image (clip 70% from right)
beforeClip = `inset(0 70% 0 0)`;
//                    ▲ clips from right edge

// After image: clip from LEFT edge
// At 30% position: hide 30% (clip 30% from left)
afterClip = `inset(0 0 0 30%)`;
//                      ▲ clips from left edge
```

**Visual Example at 30%:**
```
Before Image Clip:     After Image Clip:
┌──────┬───────────┐   ┌───────────┬──────┐
│██████│           │   │           │██████│
│██████│  CLIPPED  │   │  CLIPPED  │██████│
│██████│           │   │           │██████│
└──────┴───────────┘   └───────────┴──────┘
  30%       70%            30%        70%
 visible                            visible
```

---

## Pointer Events vs Mouse/Touch Events

### Why Pointer Events?

```
Traditional Approach:
├── Mouse Events (onmousedown, onmousemove, onmouseup)
├── Touch Events (ontouchstart, ontouchmove, ontouchend)
└── Different handlers needed for each!

Pointer Events Approach:
└── Single set handles ALL input types:
    • Mouse
    • Touch (finger on screen)
    • Pen/Stylus
    • Any future pointing devices
```

### Pointer Capture

```javascript
// Problem: If user drags outside the container, we lose events
// Solution: setPointerCapture "locks" events to our element

containerEl.setPointerCapture(e.pointerId);
// Now we receive pointermove even outside the container!

// When done, release it:
containerEl.releasePointerCapture(e.pointerId);
```

**Without capture:**
```
Container bounds
┌─────────────────┐
│  ●───────────○  │ ← Drag starts
│             ╲   │
└─────────────│───┘
              │
              ○ ← Events LOST when cursor leaves!
```

**With capture:**
```
Container bounds
┌─────────────────┐
│  ●───────────○  │ ← Drag starts
│             ╲   │
└─────────────│───┘
              │
              ○ ← Events STILL RECEIVED!
```

---

## Dragging State Management

### The isDragging Flag Pattern

```javascript
let isDragging = $state(false);

// Only START dragging on pointer down
function handlePointerDown(e) {
  isDragging = true;
  // ...
}

// Only UPDATE position if already dragging
function handlePointerMove(e) {
  if (!isDragging) return;  // Guard clause!
  // ...
}

// STOP dragging on pointer up
function handlePointerUp(e) {
  if (!isDragging) return;
  isDragging = false;
  // ...
}
```

### Why the Guard Clause?

```
Without guard:
- User moves mouse over container
- handlePointerMove fires
- Position updates unexpectedly!

With guard:
- User moves mouse over container
- handlePointerMove fires
- isDragging is false → early return
- Position stays put ✓
```

---

## Position Calculation

### Converting Pixels to Percentage

```javascript
function updateDividerPosition(e: PointerEvent) {
  // 1. Get container's position and size
  const rect = containerEl.getBoundingClientRect();

  // 2. Calculate click position relative to container
  const x = e.clientX - rect.left;
  //        │           │
  //        │           └─ Container's left edge in viewport
  //        └─ Click position in viewport

  // 3. Convert to percentage
  const percentage = (x / rect.width) * 100;

  // 4. Clamp to valid range (0-100)
  dividerPosition = Math.max(0, Math.min(100, percentage));
}
```

**Visual:**
```
Viewport                    Container
┌───────────────────────────────────────────────┐
│                 ┌─────────────────────────┐   │
│                 │        rect.width       │   │
│                 │◄───────────────────────►│   │
│ rect.left       │           ●             │   │
│◄───────────────►│           ▲             │   │
│                 │           │ click       │   │
│                 └───────────│─────────────┘   │
└─────────────────────────────│─────────────────┘
                              │
                    e.clientX ▼
```

---

## CSS Transitions for Smoothness

### The Transition Toggle Pattern

```css
.divider-handle {
  transition: left 0.1s ease-out;  /* Smooth when NOT dragging */
}

.divider-handle.dragging {
  transition: none;  /* Instant when dragging */
}
```

### Why Toggle Transitions?

**With constant transition:**
```
User drags quickly: ●──────────●
Divider follows:    ○──────○──○ (laggy, feels "sticky")
```

**With toggled transition:**
```
User drags quickly: ●──────────●
Divider follows:    ●──────────● (instant, feels responsive)

User clicks new spot: ●        ●
Divider animates:     ○────────○ (smooth, feels polished)
```

---

## Keyboard Accessibility

### Arrow Key Navigation

```javascript
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') {
    e.preventDefault();  // Don't scroll page!
    dividerPosition = Math.max(0, dividerPosition - 1);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    dividerPosition = Math.min(100, dividerPosition + 1);
  }
}
```

### ARIA Attributes

```html
<div role="separator"
     aria-label="Draggable divider. Position: 50%"
     aria-valuenow={50}
     aria-valuemin={0}
     aria-valuemax={100}>
```

This tells screen readers:
- It's a separator (divider)
- Current value is 50%
- Range is 0-100

---

## Performance Considerations

### GPU Acceleration via clip-path

```css
/* clip-path is GPU-accelerated in modern browsers */
.panel {
  clip-path: inset(0 50% 0 0);  /* Composited on GPU! */
}
```

**Benefits:**
- No layout recalculation
- No paint operations
- Silky smooth 60fps

### Avoiding Layout Thrashing

```javascript
// Good: Read once, then update
const rect = containerEl.getBoundingClientRect();
const x = e.clientX - rect.left;
dividerPosition = (x / rect.width) * 100;

// Bad: Multiple reads and writes
const x = e.clientX - container.offsetLeft;  // Read
container.style.left = x + 'px';              // Write
const width = container.offsetWidth;          // Read (forces layout!)
```

---

## Edge Cases Handled

| Situation | Behaviour |
|-----------|-----------|
| Drag outside container | Pointer capture keeps tracking |
| Position < 0% | Clamped to 0% |
| Position > 100% | Clamped to 100% |
| Disabled state | All interactions ignored |
| Touch + mouse | Both work via Pointer Events |
| Reduced motion | CSS transitions disabled |
| Focus on container | Arrow keys work |

---

## What This Component Does NOT Do

- Does not lazy-load images (parent should handle)
- Does not support vertical comparison (horizontal only)
- Does not animate between positions programmatically
- Does not support pinch-to-zoom
- Does not provide image loading states

---

## Dependencies

**Zero external dependencies** - fully portable!

Uses:
- Svelte 5 runes (`$state()`, `$derived()`, `$effect()`)
- CSS `clip-path: inset()` for image clipping
- Pointer Events API for unified input handling
- Native CSS transitions and transforms

---

## File Structure

```
BeforeAfter.svelte    # The component
BeforeAfter.test.ts   # Unit tests
BeforeAfter.md        # This explainer
```

---

*Last updated: 26 December 2025*
