# CardStackMotionFlip - Technical Logic Explainer

## What Does It Do? (Plain English)

CardStackMotionFlip is a 3D card deck where you can flick the top card away in any direction (left, right, up, down) and it rolls off-screen with a 3D spinning effect, then reappears at the back of the deck.

**Think of it like:** A deck of cards on a table. Grab the top card and flick it away - it spins off and magically teleports to the bottom of the deck!

---

## How It Works (Pseudo-Code)

```
WHEN component mounts:
  1. CREATE cardOrder array [0, 1, 2, 3, ...n]
  2. SET currentState to 'idle'
  3. LISTEN for keyboard events

WHEN pointer DOWN on top card:
  1. LOCK page scroll (prevents page scrolling during drag)
  2. RECORD start position
  3. SET currentState to 'dragging'
  4. CAPTURE pointer (keeps events even if cursor leaves card)

WHILE dragging:
  1. CALCULATE delta from start position
  2. APPLY damped translation (card follows at 50% speed)
  3. APPLY rotation preview based on drag direction:
     - Horizontal drag → rotateY
     - Vertical drag → rotateX

WHEN pointer UP:
  1. UNLOCK page scroll
  2. CALCULATE final delta
  3. IF delta > swipeThreshold:
     - DETERMINE direction (L/R/U/D)
     - TRIGGER roll animation
  4. ELSE:
     - SNAP back to 'idle'

ROLL ANIMATION (state machine):
  1. 'rolling-*' → Card flies off-screen with 180° rotation
  2. WAIT rollDuration ms
  3. 'repositioning' → Card teleports to back (invisible)
  4. WAIT 16ms (one frame)
  5. 'entering' → Card fades in at back position
  6. WAIT enterDuration ms
  7. 'idle' → Ready for next interaction
```

---

## The State Machine

CardStackMotionFlip uses a finite state machine to manage complex multi-phase animations:

```
                                    ┌─────────────┐
                                    │    idle     │◄────────────────┐
                                    └─────┬───────┘                 │
                                          │ pointer down            │
                                          ▼                         │
                                    ┌─────────────┐                 │
                                    │  dragging   │                 │
                                    └─────┬───────┘                 │
                                          │ pointer up              │
                          ┌───────────────┼───────────────┐         │
                          │               │               │         │
              threshold   │    threshold  │   threshold   │ no      │
              met (left)  │    met (up)   │   met (down)  │ threshold│
                          ▼               ▼               ▼         │
                   ┌──────────┐    ┌──────────┐    ┌──────────┐     │
                   │rolling-L │    │rolling-U │    │rolling-D │ ────┘
                   └────┬─────┘    └────┬─────┘    └────┬─────┘
                        │               │               │
                        └───────────────┼───────────────┘
                                        │ rollDuration ms
                                        ▼
                              ┌─────────────────┐
                              │  repositioning  │
                              └────────┬────────┘
                                       │ 16ms
                                       ▼
                              ┌─────────────────┐
                              │    entering     │
                              └────────┬────────┘
                                       │ enterDuration ms
                                       ▼
                                    (back to idle)
```

---

## 3D Rotation Explained

When rolling, the card rotates 180° on the appropriate axis:

**Horizontal Swipe (Left/Right)**
```
rotateY: -180° (left) or +180° (right)

      ┌────┐         ┌────┐         ┌────┐
      │ A  │   →     │    │   →     │  A │  (flipped!)
      └────┘         └────┘         └────┘
     0° rotateY    90° rotateY   180° rotateY
```

**Vertical Swipe (Up/Down)**
```
rotateX: -180° (up) or +180° (down)

      ┌────┐
      │ A  │         ← Card flips top-over-bottom (or vice versa)
      └────┘
```

---

## Card Order Management

The deck maintains a `cardOrder` array that tracks display positions:

```typescript
// Initial: [0, 1, 2, 3]
// Card 0 is at position 0 (front), Card 3 is at position 3 (back)

// After rolling the top card:
cardOrder = [...cardOrder.slice(1), cardOrder[0]];
// Result: [1, 2, 3, 0]
// Card 1 is now at front, Card 0 is at back
```

This lets us reorder the visual display without mutating the original `cards` prop.

---

## Pointer Events API

We use Pointer Events instead of separate mouse/touch handlers:

```typescript
// One handler works for mouse, touch, and stylus!
onpointerdown={(e) => handlePointerDown(e, displayIndex)}
onpointermove={handlePointerMove}
onpointerup={handlePointerUp}
onpointercancel={handlePointerUp}  // Handle interruptions
```

**Key technique:** `setPointerCapture()` keeps receiving events even if the pointer leaves the element:

```typescript
(event.currentTarget as HTMLElement)?.setPointerCapture(event.pointerId);
```

---

## Scroll Locking

When dragging on mobile, we need to prevent the page from scrolling:

```typescript
import { lockScroll } from '$lib/scrollLock';

function handlePointerDown() {
  unlockScroll = lockScroll();  // Returns cleanup function
}

function handlePointerUp() {
  unlockScroll?.();  // Restore scrolling
  unlockScroll = null;
}
```

The `scrollLock` utility coordinates with other components (modals, drawers) to prevent conflicts.

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cards` | `Card[]` | `[]` | Array of cards with image, title, content |
| `cardWidth` | `number` | `300` | Width of each card in pixels |
| `cardHeight` | `number` | `400` | Height of each card in pixels |
| `cardGap` | `number` | `50` | Horizontal offset between stacked cards |
| `swipeThreshold` | `number` | `80` | Minimum drag distance to trigger roll |
| `rollDuration` | `number` | `400` | Roll animation duration (ms) |
| `enterDuration` | `number` | `200` | Fade-in animation duration (ms) |
| `enable3D` | `boolean` | `true` | Enable 3D rotation (false for 2D) |

---

## Keyboard Controls

| Key | Action |
|-----|--------|
| `←` Left Arrow | Roll card left |
| `→` Right Arrow | Roll card right |
| `↑` Up Arrow | Roll card up |
| `↓` Down Arrow | Roll card down |

---

## CSS 3D Setup

The container establishes a 3D perspective:

```css
.card-deck {
  perspective: 1000px;          /* Distance from viewer */
  perspective-origin: center;   /* Vanishing point */
}

.card-wrapper {
  transform-style: preserve-3d; /* Enable 3D for children */
  backface-visibility: hidden;  /* Hide back of card */
}
```

---

## Performance Considerations

- **will-change: transform, opacity** on animating cards (removed after animation)
- **Pointer capture** prevents event spam
- **touch-action: none** on top card prevents browser gesture interference
- **Reduced motion support** - animations shortened to 150ms

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Drag cancelled (e.g., phone call) | `pointercancel` handler restores state |
| Rapid drags | State machine prevents mid-animation drags |
| Zero cards | Empty deck, no errors |
| Single card | Card rolls and reappears at same position |
| Keyboard during animation | Ignored until idle |

---

## Known Warnings

| Warning | Reason |
|---------|--------|
| `state_referenced_locally` | `cardOrder` initialised from `cards.length` |

---

## Dependencies

- **$lib/types**: CardStackMotionFlipProps
- **$lib/scrollLock**: Coordinated scroll lock utility
- **Zero animation libraries**: Pure CSS 3D transforms

---

## File Structure

```
CardStackMotionFlip.svelte      # The component
CardStackMotionFlip.test.ts     # Unit tests
CardStackMotionFlip.md          # This explainer
```

---

*Last updated: 26 December 2025*
