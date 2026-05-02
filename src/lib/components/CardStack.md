# CardStack — Technical Logic Explainer

## What Does It Do? (Plain English)

CardStack lays a small set of cards out as a horizontal fan, each card overlapping the next so only its leading edge peeks out. Hover over a card and it rises and slides sideways to give you a preview; click (or press Enter, or swipe on mobile, or arrow-key in) and it fully emerges with its title and body visible. Click again to slot it back into the stack.

Think of it like a hand of playing cards fanned out on the table — peek at one, pull it out to read it, push it back in when you're done.

## How It Works (Pseudo-Code)

```
state:
  hoveredCard      = null         // { index, shiftDirection } when something is being hovered
  selectedIndex    = null         // which card is fully emerged, if any
  layout           = null         // computed dimensions from the constraint solver
  containerWidth   = 0            // measured

derive layout (whenever container, cards, or measured text heights change):
  solve four constraints:
    (1) container fit:    sum(card widths) × 1.1 + hoverShift × 2 ≤ containerWidth
    (2) title visibility: hoverUp ≥ titleHeight × 1.2
    (3) content fit:      cardHeight ≥ 1.1 × (titleHeight + bodyHeight)
    (4) hover zone:       hoverZoneWidth = 0.9 × overlap × 2

events:
  on mouseenter card[i] (relative x within card width):
    if relative x < width / 2: shiftDirection = 'right'    // entered from left
    else:                      shiftDirection = 'left'     // entered from right
    hoveredCard = { index: i, shiftDirection }              // direction LOCKED until mouseleave

  on mouseleave card[i]:
    hoveredCard = null

  on click card[i]:
    selectedIndex = (selectedIndex === i) ? null : i

  on keydown ArrowRight:
    selectedIndex = (selectedIndex == null ? 0 : (selectedIndex + 1) mod cards.length)

  on keydown ArrowLeft:
    selectedIndex = (selectedIndex == null ? last : (selectedIndex - 1 + cards.length) mod cards.length)

  on keydown Escape:
    selectedIndex = null

  on swipe (touch dx > 50 and dominates dy):
    dx < 0 → ArrowRight equivalent
    dx > 0 → ArrowLeft equivalent

  on container resize (ResizeObserver):
    re-measure → re-derive layout
```

The whole layout — card width, height, overlap, hover rise, hover shift — is recomputed from container width and the measured first card's title/body heights. Nothing is hard-coded except the safety margins inside the constraint equations.

## The Core Concept: Constraint-Based Layout

Hard-coding card dimensions ("each card is 300×400") works until the screen narrows or the cards have unusually long titles. CardStack flips that on its head: the developer asks for an **ideal** card size, and a runtime solver hands back the **largest values that satisfy all four constraints** for the actual container and content.

### The four constraints

```
(1) Container fit
    sum(card widths) × 1.1 + hoverShift × 2 ≤ containerWidth
    Cards must fit horizontally with 10% padding for breathing room and
    enough slack on either side that a hover-shift never falls off the edge.

(2) Title visibility
    hoverUp ≥ titleHeight × 1.2
    A hovered card must rise at least 20% farther than the title is tall,
    so the title never gets clipped by the card above it in the fan.

(3) Content fit
    cardHeight ≥ 1.1 × (titleHeight + bodyHeight)
    Every card must be tall enough to show its full content with 10%
    margin — no clipping, no awkward truncation.

(4) Hover zone
    hoverZoneWidth = 0.9 × overlap × 2
    The mouse-direction-detection zone is anchored to overlap so it
    scales with the visible-leading-edge real estate.
```

### How overlap works visually

```
container width = 800 px
card width      = 220 px
overlap         = 50 px (≈ 22% of card width)

[Card 1][ard 2][ard 3][ard 4]
        ↑     ↑     ↑   each card overlaps its neighbour by 50 px

visual width = 220 + (3 × 170) = 730 px ✓ fits comfortably
              ↑first  ↑three more cards each contribute (220 − 50)
```

If the container is narrower, the solver shrinks `cardWidth` and `cardHeight` proportionally rather than overflowing. There is a hard floor of 120 × 160 px below which cards stop shrinking and accept that they'll truncate.

## Direction Detection: The "Entry Side" Trick

When a card is hovered, it slides sideways — but which way? CardStack picks the direction based on **where the cursor crossed the card boundary**, not where the cursor currently is. Once chosen, the direction is locked until the cursor leaves.

```
   mouse enters here
        ↓
  ┌──────────┬──────────┐
  │   LEFT   │  RIGHT   │
  │   ZONE   │   ZONE   │
  │          │          │
  │  shifts  │  shifts  │
  │  RIGHT → │  ← LEFT  │
  └──────────┴──────────┘
       card centre
```

Without locking, the card would dance — slide right when the cursor was on the left, slide left when the cursor crossed the centre, slide right again when it crossed back. Locking on entry means the card commits to one direction for the whole hover, which feels stable rather than twitchy.

## The Hit Area / Visual Card Split

A subtle trick prevents another flavour of hover dancing — the kind where the hovered card's transform moves it out from under the cursor, which fires `mouseleave`, which removes the transform, which fires `mouseenter` again, ad infinitum.

```
┌───────────────────────┐  ← Hit area: receives pointer events
│                       │    Position: STATIC, never transforms
│   ┌───────────────┐   │
│   │               │   │  ← Visual card: the pretty bit
│   │  Card image   │   │    Position: transformed on hover
│   │               │   │    pointer-events: none
│   └───────────────┘   │
│                       │
└───────────────────────┘
```

The hit area is a fixed-position wrapper that owns the `mouseenter`/`mouseleave` events. The visual card sits inside it and is the only thing that moves; because it has `pointer-events: none`, it cannot fire pointer events of its own. The hover state stays rock-steady regardless of what the visual card is doing.

## Touch & Swipe Handling

Touch needs `{ passive: false }` so the component can call `preventDefault()` and stop the page scrolling underneath a horizontal swipe.

```
on touchstart: record (startX, startY)
on touchmove:  if abs(currentX − startX) > scroll-threshold AND
                  abs(dx) > abs(dy): preventDefault()
on touchend:   dx = endX − startX
               if abs(dx) > 50 AND abs(dx) > abs(dy):
                 dx < 0 → next card
                 dx > 0 → previous card
```

The "horizontal dominates vertical" test is what stops a near-vertical scroll being misread as a swipe — only when the user clearly intends horizontal motion does the component grab the gesture.

## State Flow Diagram

```
                     ┌─────────────────────┐
                     │   IDLE              │
                     │   hovered  = null   │
                     │   selected = null   │
                     └────────┬────────────┘
                              │
        mouseenter card[i] ───┤
                              ▼
                     ┌─────────────────────┐
                     │   HOVERED           │
                     │   hovered = {i,dir} │ ──┐
                     │   selected may be   │   │ click card[i]
                     │   null or some j    │   │
                     └────────┬────────────┘   │
                              │ mouseleave     ▼
                              ▼          ┌─────────────────────┐
                     ┌─────────────────────┐ │ SELECTED            │
                     │   IDLE              │ │ selected = i        │
                     └─────────────────────┘ │                     │
                                             │ click again         │
                                             │ → selected = null   │
                                             │ Escape              │
                                             │ → selected = null   │
                                             │ ArrowLeft / Right   │
                                             │ → selected = (i±1)  │
                                             │   mod length        │
                                             └─────────────────────┘

 ResizeObserver fires ─► layout re-derived (no state change to hovered/selected)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cards` | `Card[]` | `[]` | The cards to display. Each needs `image`, `title`, and `content`. |
| `cardWidth` | `number` | `300` | Ideal card width in pixels. The solver may shrink it to satisfy the container-fit constraint. |
| `cardHeight` | `number` | `400` | Ideal card height in pixels. The solver may shrink it to satisfy the content-fit constraint. |
| `partialRevealSide` | `'left' \| 'right'` | `'right'` | Which side of each card stays visible in the fan. Defaults to right (cards fan right-to-left). |

### Keyboard

| Key | Action |
|-----|--------|
| `→` | Select next card (wraps). |
| `←` | Select previous card (wraps). |
| `Enter` / `Space` | Toggle selection on the focused card. |
| `Escape` | Deselect. |
| `Tab` | Move focus between cards. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Single card | Card takes up to 80% of container width; fan layout collapses gracefully. |
| Zero cards | Renders an empty container, no errors. |
| Very narrow container | Solver shrinks card dimensions to a hard floor of 120 × 160 px before tolerating clipping. |
| Container resized at runtime | `ResizeObserver` re-measures and re-derives layout; hovered/selected state preserved. |
| Fast hover-switching between adjacent cards | Direction lock fires on each `mouseenter`; no flicker, no dancing. |
| Keyboard and mouse used together | Both feed the same `selectedIndex`; whichever happens last wins, no conflict. |
| Touch swipe on a near-vertical motion | Vertical-dominates-horizontal test rejects the gesture; page scroll is preserved. |
| User has `prefers-reduced-motion: reduce` | Hover transforms are dampened to a fraction of their normal distance. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$effect`, snippets, and `bind:this` underpin the layout and hover state.
- Zero external dependencies — the layout solver, hover detection, swipe handling, and animations are all hand-rolled and pure CSS / pure DOM.

## File Structure

```
src/lib/components/CardStack.svelte         # implementation
src/lib/components/CardStack.md             # this file
src/lib/components/CardStack.test.ts        # vitest unit tests
src/routes/cardstack/+page.svelte           # demo page
src/routes/cardstack/+page.server.ts        # SSR data loader
src/lib/types.ts                            # CardStackProps, Card, CalculatedCardLayout
```
