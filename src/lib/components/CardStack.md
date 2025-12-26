# CardStack - Technical Logic Explainer

## What Does It Do? (Plain English)

CardStack displays a horizontal fan of overlapping cards that respond to hover and click interactions. When you hover over a card, it rises and shifts to preview itself. When you click (or use arrow keys/swipe), the card fully emerges to show its content.

**Think of it like:** A hand of playing cards fanned out on a table. Hover over one to peek at it, click to fully pull it out and read it!

---

## How It Works (Pseudo-Code)

```
WHEN component mounts:
  1. MEASURE container width
  2. MEASURE title and content heights from first card
  3. RUN constraint equations to calculate:
     - Card width and height
     - Overlap amount
     - Hover rise distance
     - Hover shift distance
  4. STORE calculated layout
  5. SET UP ResizeObserver to recalculate on resize

WHEN mouse ENTERS a card:
  1. DETECT which side of the card centre the mouse entered from
  2. IF entered from left → shift direction = right
  3. IF entered from right → shift direction = left
  4. LOCK this direction (won't change until mouse leaves)
  5. APPLY hover transform: rise up + shift sideways

WHEN card is CLICKED:
  1. IF already selected → deselect (return to stack)
  2. IF not selected → select (fully emerge with content visible)

WHEN arrow key PRESSED:
  1. RIGHT arrow → select next card (wraps to first)
  2. LEFT arrow → select previous card (wraps to last)
  3. ESCAPE → deselect current card

WHEN swipe detected (mobile):
  1. SWIPE left → select next card
  2. SWIPE right → select previous card
```

---

## The Core Concept: Constraint-Based Layout

Instead of hard-coding card sizes, CardStack uses **constraint equations** to calculate optimal dimensions at runtime. This ensures cards always fit and look good on any screen size.

### The Four Constraints

```
1. Container Fit:
   sum(card widths) × 1.1 + hoverShift × 2 ≤ containerWidth

   [NTL] All cards must fit in the container with room for hover animations

2. Title Visibility:
   hoverUp ≥ titleHeight × 1.2

   [NTL] When a card hovers up, the full title must be visible (with 20% margin)

3. Content Fit:
   cardHeight ≥ 1.1 × (titleHeight + bodyHeight)

   [NTL] Cards must be tall enough to show title + content without cramping

4. Hover Zone:
   hoverZoneWidth = 0.9 × overlap × 2

   [NTL] The direction-detection zone is proportional to card overlap
```

### How Overlapping Cards Fit

```
Container Width = 800px
Card Width = 220px
Overlap = 50px (22% of card width)

Visual layout (4 cards):
|← 800px →|
[Card 1][ard 2][ard 3][ard 4]
        ↑50px overlap each

Total visual width = 220 + (3 × 170) = 730px ✓ Fits!
                     ↑first card  ↑3 more cards showing 170px each
```

---

## Direction Detection: The "Entry Side" Trick

When you hover over a card, it shifts sideways - but which way? CardStack detects where your mouse came from:

```
         Mouse enters here
              ↓
    ┌─────────┬─────────┐
    │  LEFT   │  RIGHT  │
    │  ZONE   │  ZONE   │
    │         │         │
    │ Shift → │ ← Shift │
    │  RIGHT  │  LEFT   │
    └─────────┴─────────┘
         Card Centre
```

**The key insight:** Direction is **locked** when you enter. If you enter from the left and then move your mouse to the right side, the card still shifts right. This prevents "dancing" where the card rapidly flips direction as you move.

---

## State Architecture

```
hoveredCard = {
  index: 2,           // Which card (0-based)
  shiftDirection: 'right'  // Locked direction
}

selectedIndex = 2     // Fully emerged card (or null)

layout = {
  cardWidth: 200,     // Calculated dimensions
  cardHeight: 280,
  overlap: 44,
  hoverUp: 48,
  hoverShift: 42,
  hoverZoneWidth: 79
}
```

---

## The Hit Area vs. Visual Card Separation

A clever trick prevents "hover dancing":

```
┌─────────────────────┐  ← Hit Area (receives mouse events)
│                     │    Position: STATIC (never moves)
│  ┌───────────────┐  │
│  │               │  │  ← Visual Card (the pretty part)
│  │   Card Image  │  │    Position: TRANSFORMS on hover
│  │               │  │    pointer-events: none
│  └───────────────┘  │
│                     │
└─────────────────────┘
```

The hit area stays in place. The visual card transforms within it. Because the hit area doesn't move, the hover state is stable!

---

## Touch/Swipe Handling

```typescript
// Touch events need { passive: false } to allow preventDefault()
function attachTouchListeners(node: HTMLElement) {
  node.addEventListener('touchstart', handleTouchStart, { passive: false });
  node.addEventListener('touchmove', handleTouchMove, { passive: false });
  node.addEventListener('touchend', handleTouchEnd, { passive: false });
  // ...cleanup
}
```

**Swipe detection:**
1. Record start position on `touchstart`
2. Calculate delta on `touchend`
3. If horizontal delta > 50px AND dominates vertical → it's a swipe!

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cards` | `Card[]` | `[]` | Array of cards with image, title, content |
| `cardWidth` | `number` | `300` | Base width (may be scaled down) |
| `cardHeight` | `number` | `400` | Base height (may be scaled down) |
| `partialRevealSide` | `'left'│'right'` | `'right'` | Which side stays hidden on hover |

---

## Keyboard Controls

| Key | Action |
|-----|--------|
| `→` Right Arrow | Select next card (wraps) |
| `←` Left Arrow | Select previous card (wraps) |
| `Escape` | Deselect current card |
| `Enter`/`Space` | Toggle selection on focused card |
| `Tab` | Move focus between cards |

---

## Mobile Behaviour

On screens < 768px:
- Hover effects are reduced (less movement)
- Selected card expands to fixed position in viewport centre
- Swipe hint appears at bottom

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Single card | Takes up to 80% of available width |
| Zero cards | Empty container, no errors |
| Very narrow container | Cards shrink to minimum sizes (120×160px) |
| Fast hover switching | Direction locks immediately, no flicker |
| Keyboard + mouse together | Both work, last interaction wins |

---

## Performance Considerations

- **ResizeObserver** for responsive recalculation (more efficient than window resize)
- **will-change: transform** on card wrapper for GPU acceleration
- **pointer-events: none** on visual card prevents double event handling
- **requestAnimationFrame** for initial measurement (allows DOM to render first)

---

## Known Warnings (Safe to Ignore)

| Warning | Reason |
|---------|--------|
| `a11y_no_noninteractive_tabindex` | Container needs tabindex for keyboard nav |
| `a11y_no_noninteractive_element_interactions` | Touch handlers required for swipe |

---

## Dependencies

- **$lib/types**: CardStackProps, CardLayoutConfig, CalculatedCardLayout
- **Zero external dependencies**: Pure Svelte + CSS

---

## File Structure

```
CardStack.svelte      # The component
CardStack.test.ts     # Unit tests
CardStack.md          # This explainer
```

---

*Last updated: 26 December 2025*
