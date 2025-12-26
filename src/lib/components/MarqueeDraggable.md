# MarqueeDraggable - Technical Logic Explainer

## What Does It Do? (Plain English)

MarqueeDraggable is an enhanced Marquee component that adds manual control. Content scrolls automatically like a news ticker, but users can grab and drag it to explore at their own pace. When released, it picks up the direction you were dragging and keeps going - like pushing a skateboard!

**Think of it like:** A conveyor belt you can grab and push in any direction. When you let go, it keeps rolling that way!

---

## How It Works (Pseudo-Code)

```
WHEN component mounts:
  1. MEASURE container and content widths
  2. SET UP Intersection Observer (pause when off-screen)
  3. START automatic animation loop

ANIMATION LOOP (runs ~60fps):
  1. CALCULATE time since last frame (delta)
  2. COMPUTE distance = speed × delta
  3. UPDATE currentOffset
  4. APPLY CSS transform with modulo for infinite wrap
  5. REQUEST next frame

WHEN user starts dragging:
  1. STOP automatic animation
  2. CAPTURE pointer for smooth tracking
  3. RECORD start position and offset

WHILE user is dragging:
  1. CALCULATE delta from start position
  2. UPDATE currentOffset to follow finger/mouse
  3. TRACK velocity for momentum

WHEN user releases:
  1. IF velocity > threshold AND momentum enabled:
     SET direction based on drag velocity
  2. RESTART automatic animation
  3. Content now scrolls in the direction you pushed!
```

---

## The Infinite Loop Trick (Visual)

```
Container (overflow: hidden)
┌─────────────────────────────────────┐
│     [A][B][C]        [A][B][C]      │ ← Two identical copies
└─────────────────────────────────────┘
              ↑
        Visible area

As content scrolls left:
     ←←←←←←←←←←←←←←←←←←←←←←←←←←←←

When copy 1 exits, copy 2 takes over:
┌─────────────────────────────────────┐
│  [C]        [A][B][C]        [A][B] │
└─────────────────────────────────────┘

The modulo operation (%) wraps the offset:
  currentOffset = 1500px
  contentWidth × 2 = 1000px
  wrappedOffset = 1500 % 1000 = 500px  ← Back within visible range!
```

---

## RAF Animation Strategy

```javascript
// RequestAnimationFrame provides:
// 1. Smooth 60fps updates synced to display refresh
// 2. Automatic pause when tab is hidden
// 3. Battery-efficient rendering

const animate = (timestamp) => {
  // Calculate exact time between frames
  const delta = timestamp - lastTimestamp;  // ~16.67ms at 60fps

  // Speed = pixels per second
  // Distance = speed × time (in seconds)
  const speed = contentWidth / duration;  // e.g., 1000px / 40s = 25px/s
  const distance = (speed * delta) / 1000;  // Convert ms to seconds

  currentOffset += distance * direction;
  requestAnimationFrame(animate);
};
```

---

## Pointer Events vs Mouse/Touch Events

```
Traditional approach (problematic):
├── mousedown / mouseup / mousemove (desktop only)
├── touchstart / touchend / touchmove (mobile only)
└── Need to implement both, handle edge cases

Pointer Events (modern, unified):
├── pointerdown (works for mouse, touch, pen)
├── pointermove (unified tracking)
├── pointerup (unified release)
└── setPointerCapture() (continues tracking outside element)

Benefits:
✓ Single codebase for all input types
✓ Built-in pointer capture
✓ Pressure sensitivity (for stylus)
✓ Better browser support (IE11+)
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `vertical` | `boolean` | `false` | Scroll vertically instead of horizontally |
| `duration` | `number` | `40` | Seconds for one complete scroll cycle |
| `reverse` | `boolean` | `false` | Start scrolling in opposite direction |
| `dragEnabled` | `boolean` | `true` | Allow drag interaction |
| `dragMomentum` | `boolean` | `true` | Continue in drag direction after release |
| `class` | `string` | `''` | Additional CSS classes |
| `children` | `Snippet` | - | Content to scroll |

---

## Visibility Optimization

```javascript
// IntersectionObserver saves CPU when marquee is off-screen

observer = new IntersectionObserver((entries) => {
  isVisible = entries[0].isIntersecting;

  if (isVisible && !wasVisible) {
    startAnimation();  // Resume when visible
  } else if (!isVisible) {
    stopAnimation();   // Pause when hidden
  }
});

// Result: Marquees in long pages don't waste battery
// when scrolled out of view
```

---

## Momentum After Drag

```
User drags right quickly:
  ──────────────────────────►
  lastVelocity = +15 (positive = right)

Velocity check on release:
  if (Math.abs(lastVelocity) > threshold) {
    currentDirection = lastVelocity < 0 ? -1 : 1;
    // lastVelocity = +15, so direction = +1 (right)
  }

Animation continues rightward:
  ──────────────────────────►

This feels natural - like pushing a physical object!
```

---

## Differences from Standard Marquee

| Feature | Marquee | MarqueeDraggable |
|---------|---------|------------------|
| Animation | CSS-only | JavaScript RAF |
| User Control | Pause on hover | Drag to scroll |
| Direction | Fixed | Changes with drag |
| Momentum | N/A | ✓ Built-in |
| Performance | Lower CPU | Higher CPU |
| Use Case | Passive display | Interactive exploration |

---

## Performance Considerations

- **RAF animation** - ~60fps JavaScript updates (more CPU than CSS)
- **Pointer capture** - Ensures smooth drag even outside element
- **Visibility observer** - Pauses when off-screen to save battery
- **Two copies** - Fewer DOM nodes than Marquee (4 copies)
- **will-change: transform** - Hints GPU acceleration

---

## Common Use Cases

### Interactive Testimonials
```svelte
<MarqueeDraggable duration={60} dragMomentum={true}>
  {#each testimonials as t}
    <TestimonialCard {t} />
  {/each}
</MarqueeDraggable>
```

### Timeline Explorer
```svelte
<MarqueeDraggable vertical={true} duration={30}>
  {#each events as event}
    <TimelineItem {event} />
  {/each}
</MarqueeDraggable>
```

---

## Dependencies

- **$lib/utils** (cn helper for class merging)
- **Zero external dependencies**

---

## File Structure

```
MarqueeDraggable.svelte  # The component
MarqueeDraggable.test.ts # Unit tests
MarqueeDraggable.md      # This explainer
```

---

*Last updated: 26 December 2025*
