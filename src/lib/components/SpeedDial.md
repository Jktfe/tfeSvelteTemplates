# SpeedDial - Technical Logic Explainer

## What Does It Do? (Plain English)

SpeedDial is a floating action button (FAB) that expands to reveal multiple action items when clicked. Think of it like a flower blooming - when you tap the main button, smaller buttons "bloom" around it in various patterns (straight line, circle, semi-circle, or quarter-circle).

**Think of it like:** A Swiss Army knife. The main tool is always visible, but click it and other tools pop out ready to use!

---

## How It Works (Pseudo-Code)

```
WHEN component loads:
  1. SET isOpen to false
  2. STORE references to all buttons
  3. SET up keyboard listener on window

WHEN main button CLICKED:
  1. IF disabled → do nothing
  2. TOGGLE isOpen state
  3. FOR each action item:
     - CALCULATE position using layout type
     - APPLY staggered animation delay
     - ANIMATE into position

WHEN action item CLICKED:
  1. IF not disabled → execute action callback
  2. CLOSE the menu
  3. RETURN focus to main button

WHEN Escape key PRESSED:
  1. IF isOpen → close menu and focus main button

WHEN Tab key PRESSED (while open):
  1. FIND currently focused button
  2. IF at end → wrap to first
  3. IF at start + Shift → wrap to last
  4. PREVENT default (trap focus in menu)

WHEN clicking OUTSIDE:
  1. IF isOpen AND click not on container
  2. CLOSE menu
```

---

## The Core Concept: Trigonometric Positioning

The "magic" of SpeedDial is positioning action items in circular patterns. This requires basic trigonometry!

### The Unit Circle

Imagine a clock face centred on the main button. Each action item sits on the edge of this circle at a specific angle.

```
        90° (up)
          │
          │
  180° ───┼─── 0° (right)
  (left)  │
          │
        270° (down)
```

### Converting Angles to Positions

For any angle, we calculate X and Y positions using:
- `x = cos(angle) × radius` → horizontal distance
- `y = sin(angle) × radius` → vertical distance

```
Example: Position at 45° with radius 80px

         .  ← Target position
        /│
       / │
      /  │ y = sin(45°) × 80 = 56.57px
     /   │
    /45° │
   ●─────┴─────
   ↑     x = cos(45°) × 80 = 56.57px
Main Button
```

### Layout Types

**Linear (simple)**
```
direction="up"
    3
    │
    2
    │
    1
    │
   [●]  ← Main button
```

**Circle (360°)**
```
direction="up" (starts at 90°)
       1
     /   \
    4     2
     \   /
       3
      [●]
```

**Semi-Circle (180°)**
```
direction="up"
    1   2   3
     \  │  /
      \ │ /
       \│/
       [●]
```

**Quarter-Circle (90°)**
```
direction="up" (bottom-right corner placement)
    1
     \
      2
       \
        3
        [●]  ← Perfect for corners!
```

---

## Focus Trapping

When the menu is open, Tab key cycles through action items without leaving the menu. This is essential for keyboard accessibility.

```
[Main Button] → [Action 1] → [Action 2] → [Action 3]
       ↑                                      │
       └──────────────────────────────────────┘
                    (wraps around)
```

**Implementation:**
1. Track which button is focused using `document.activeElement`
2. Find its index in the enabled buttons array
3. On Tab: move to next (or wrap to first)
4. On Shift+Tab: move to previous (or wrap to last)
5. Call `event.preventDefault()` to override default Tab behaviour

---

## XSS Protection

Icons can be SVG strings, which creates an XSS risk. We use DOMPurify to sanitize:

```typescript
// Unsafe: action.icon could contain malicious script
{@html action.icon}

// Safe: sanitizeSVG strips dangerous elements
{@html sanitizeSVG(action.icon)}
```

The `sanitizeSVG` function (from `$lib/utils`) uses DOMPurify with strict configuration to allow only safe SVG elements and attributes.

---

## State Flow Diagram

```
                    ┌──────────────┐
                    │   CLOSED     │
                    │  isOpen=false│
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │ click on main  │ click outside  │ Escape key
          │ button         │                │
          ▼                │                │
    ┌──────────────┐       │                │
    │    OPEN      │       │                │
    │ isOpen=true  │───────┴────────────────┘
    └──────┬───────┘
           │
           │ click on action
           │
           ▼
    ┌──────────────┐
    │ EXECUTE      │
    │ action.onclick│
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   CLOSED     │
    │ focus→trigger│
    └──────────────┘
```

---

## CSS Animation Strategy

### Staggered Entrance

Each action item has a delay based on its index:

```css
.speed-dial-action {
  transition-delay: var(--delay, 0ms);
}
```

```typescript
style="--delay: {index * transitionDelay}ms;"
```

With `transitionDelay=30`, three items animate:
- Item 0: 0ms delay
- Item 1: 30ms delay
- Item 2: 60ms delay

This creates a satisfying "cascade" effect.

### Position Animation

Items animate from `scale(0)` at centre to `scale(1)` at target position:

```css
/* Closed state */
.speed-dial-action {
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
}

/* Open state */
.is-visible .speed-dial-action {
  transform: translate(calc(-50% + var(--item-x)), calc(-50% + var(--item-y))) scale(1);
  opacity: 1;
}
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `actions` | `SpeedDialAction[]` | `[]` | Action items to display |
| `direction` | `'up'│'down'│'left'│'right'` | `'up'` | Which way items expand |
| `type` | `'linear'│'circle'│'semi-circle'│'quarter-circle'` | `'linear'` | Layout pattern |
| `radius` | `number` | `80` | Distance from main button (circular layouts) |
| `transitionDelay` | `number` | `30` | ms delay between item animations |
| `showTooltip` | `boolean` | `true` | Show labels on hover |
| `tooltipPosition` | `'auto'│'left'│'right'│'top'│'bottom'` | `'auto'` | Tooltip placement |
| `mask` | `boolean` | `false` | Show backdrop overlay |
| `disabled` | `boolean` | `false` | Disable all interactions |
| `buttonIcon` | `string` | - | Custom icon (emoji or SVG) |
| `buttonLabel` | `string` | `'Open menu'` | ARIA label for main button |
| `isOpen` | `boolean` | `false` | Bindable open state |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Zero actions | Menu opens but shows nothing |
| One action | Linear: appears directly above/below/etc |
| One action (circular) | Positioned at start angle |
| All actions disabled | Menu opens, items visible but not clickable |
| Quick open/close | Animations complete cleanly |
| Click during animation | State updates immediately |

---

## Dependencies

- **DOMPurify** (external): XSS protection for SVG icons
- **$lib/types**: SpeedDialProps, SpeedDialAction interfaces
- **$lib/utils**: sanitizeSVG function

---

## File Structure

```
SpeedDial.svelte      # The component
SpeedDial.test.ts     # Unit tests
SpeedDial.md          # This explainer
```

---

*Last updated: 26 December 2025*
