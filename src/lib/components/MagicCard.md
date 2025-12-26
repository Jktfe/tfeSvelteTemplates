# MagicCard - Technical Logic Explainer

## What Does It Do? (Plain English)

MagicCard is an interactive card component with a radial gradient spotlight that follows your mouse cursor. When you hover over the card, a glowing circle appears and tracks your movement, creating a magical "torch beam" effect.

**Think of it like:** Shining a torch on a dark wall - wherever you point, there's a bright circle of light. Move your mouse and the spotlight follows!

---

## How It Works (Pseudo-Code)

```
WHEN card loads:
  1. SET spotlight position to off-screen (hidden)
  2. SET isHovering to false
  3. CALCULATE gradient CSS string (but it's invisible)

WHEN mouse ENTERS card:
  1. SET isHovering to true
  2. SPOTLIGHT becomes visible (opacity changes)

WHEN mouse MOVES over card:
  1. GET card's position on screen
  2. CALCULATE mouse position relative to card's corner
  3. UPDATE mouseX and mouseY state
  4. GRADIENT automatically recalculates (reactive)
  5. SPOTLIGHT moves to new position

WHEN mouse LEAVES card:
  1. SET isHovering to false
  2. MOVE spotlight off-screen (reset position)
  3. SPOTLIGHT fades out (opacity → 0)
```

---

## The Core Concept

### Two-Layer Architecture

The card uses two overlapping layers:

```
┌─────────────────────────────────┐
│                                 │
│  ┌─────────────────────────┐   │  ← Layer 2: Content (z-10)
│  │                         │   │     Your actual content sits here
│  │     Your Content        │   │     (text, images, buttons)
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  ○  ← Spotlight (z-0)          │  ← Layer 1: Spotlight
│     Radial gradient that moves │     Positioned behind content
│                                 │
└─────────────────────────────────┘
```

### Reactive Gradient Calculation

The magic is in this line:

```typescript
let bg = $derived(
  `radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)`
);
```

**Breaking it down:**
- `$derived` = Svelte 5 reactive computed value
- `radial-gradient` = CSS function for circular gradients
- `${gradientSize}px circle` = Size of the spotlight
- `at ${mouseX}px ${mouseY}px` = Position of the spotlight centre
- `${gradientColor}, transparent` = Colour fades to transparent

Whenever `mouseX` or `mouseY` changes, the gradient string recalculates automatically!

---

## Mouse Position Calculation

```typescript
const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
mouseX = e.clientX - rect.left;
mouseY = e.clientY - rect.top;
```

**What's happening:**
1. `getBoundingClientRect()` = Get card's position on screen
2. `e.clientX` = Mouse X position on the whole page
3. `rect.left` = Card's left edge position
4. `e.clientX - rect.left` = Mouse position INSIDE the card

**Example:**
- Card is at position (100, 200) on the page
- Mouse is at (150, 250)
- Mouse inside card = (50, 50) ← This is what the spotlight needs!

---

## The "Hide Off-Screen" Trick

When the mouse leaves, we don't just set opacity to 0 - we also move the spotlight off-screen:

```typescript
mouseX = -gradientSize;
mouseY = -gradientSize;
```

If `gradientSize` is 200, we set position to (-200, -200). This ensures the gradient is completely outside the card, even if there's a brief moment before opacity fades.

---

## Performance Notes

- **No animation library needed**: Pure CSS transitions handle the fade
- **Minimal re-renders**: Only the bg string updates on mouse move
- **GPU accelerated**: Opacity transitions use hardware acceleration
- **Pointer-events: none**: Spotlight doesn't interfere with clicks

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gradientSize` | `number` | `200` | Spotlight radius in pixels |
| `gradientColor` | `string` | `'#262626'` | Spotlight colour |
| `gradientOpacity` | `number` | `0.8` | Opacity when visible (0-1) |
| `class` | `string` | `''` | Additional CSS classes |
| `children` | `Snippet` | - | Content to render |

---

## Known Warnings (Safe to Ignore)

| Warning | Reason |
|---------|--------|
| `state_referenced_locally` | Initial mouse position uses `gradientSize` prop - this is intentional |
| `a11y_no_static_element_interactions` | Mouse tracking is decorative - the div has `role="region"` |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| No children | Shows "Magic Card" placeholder text |
| Very small gradientSize | Spotlight is tiny (may not be noticeable) |
| gradientOpacity = 0 | Spotlight is invisible even on hover |
| gradientOpacity = 1 | Full-strength glow |
| Fast mouse movement | Tracks smoothly due to continuous updates |

---

## Dependencies

- **$lib/utils**: Uses `cn()` for class merging
- **TailwindCSS**: Utility classes for layout
- **Zero animation libraries**: Pure CSS + Svelte reactivity

---

## File Structure

```
MagicCard.svelte      # The component
MagicCard.test.ts     # Unit tests
MagicCard.md          # This explainer
```

---

*Last updated: 26 December 2025*
