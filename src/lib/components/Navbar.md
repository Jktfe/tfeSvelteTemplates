# Navbar - Technical Logic Explainer

## What Does It Do? (Plain English)

Navbar provides a responsive navigation bar with a hamburger menu that opens a sliding side panel. The panel organises 28+ components into collapsible categories - click a category header to expand/collapse its items.

**Think of it like:** A filing cabinet on the side of the screen! Each drawer (category) can be opened to reveal the files (links) inside. Press Escape or click outside to close the whole cabinet.

---

## How It Works (Pseudo-Code)

```
WHEN component loads:
  1. RECEIVE menu categories from parent
  2. FIND category containing the active page
  3. AUTO-EXPAND that category (so users see where they are)
  4. RENDER hamburger button + logo in sticky header

WHEN user clicks hamburger button:
  1. TOGGLE panel open/closed state
  2. ADD or REMOVE "open" class for CSS animations
  3. LOCK page scroll when open (prevent background scrolling)
  4. FOCUS the panel element for keyboard navigation

WHEN user clicks category header:
  1. CHECK if category is already expanded
  2. IF expanded: COLLAPSE it (remove from expanded set)
  3. IF collapsed: EXPAND it (add to expanded set)
  4. ANIMATE chevron rotation (180° flip)

WHEN user clicks navigation link:
  1. CLOSE the panel
  2. NAVIGATE to the new page

WHEN user presses Escape:
  1. CLOSE the panel
  2. RETURN focus to hamburger button

WHEN user presses Tab:
  1. IF at last focusable element: WRAP to first
  2. IF Shift+Tab at first element: WRAP to last
  3. KEEP focus trapped inside panel
```

---

## The Core Concept

### Two-Level Navigation

```
Hamburger → Panel → Categories → Items
    ☰       slide    expand      click
            in       collapse    navigate
```

### Category Expansion Pattern

```
Before Click (Collapsed):
┌─────────────────────┐
│ ▼ Data Viz    (5)   │  ← Click to expand
└─────────────────────┘

After Click (Expanded):
┌─────────────────────┐
│ ▲ Data Viz    (5)   │  ← Click to collapse
├─────────────────────┤
│   • CalendarHeatmap │
│   • BubblePacking   │
│   • RadialCluster   │
│   • Sunburst        │
│   • Sankey          │
└─────────────────────┘
```

---

## State Management

### Expanded Categories (Set)

```javascript
expandedCategories = new Set(['Data Viz', 'Cards']);

// Check if expanded
expandedCategories.has('Data Viz');  // true
expandedCategories.has('Forms');     // false

// Toggle
expandedCategories.add('Forms');     // Now expanded
expandedCategories.delete('Cards');  // Now collapsed

// Trigger reactivity (Svelte 5 requires new reference)
expandedCategories = new Set(expandedCategories);
```

### Why a Set?

- O(1) lookup for `has()` checks
- O(1) add/delete operations
- Natural uniqueness (no duplicates)
- Clean API for toggle logic

---

## Focus Trap Pattern

When the panel is open, Tab navigation is "trapped" inside:

```
┌───────────────────────────────────┐
│  Panel (tabindex="-1")            │
│                                   │
│  [First Link]  ← Tab wraps here   │
│  [Second Link]                    │
│  [Third Link]                     │
│  [Last Link]   → Tab wraps back   │
│                                   │
└───────────────────────────────────┘

Tab at [Last Link]     → Focus [First Link]
Shift+Tab at [First]   → Focus [Last Link]
```

### Implementation

```javascript
const focusableElements = panel.querySelectorAll(
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
);

const first = focusableElements[0];
const last = focusableElements[focusableElements.length - 1];

if (e.key === 'Tab') {
  if (e.shiftKey && activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
```

---

## Scroll Lock Coordination

Multiple components may want to lock scrolling (Navbar, Editor, FolderFiles). We use a shared utility to prevent conflicts:

```javascript
import { lockScroll } from '$lib/scrollLock';

// When panel opens
unlockScroll = lockScroll();  // Returns cleanup function

// When panel closes
unlockScroll();  // Restores scroll ability
unlockScroll = null;
```

The utility tracks lock count, so if Editor opens while Navbar is open, scroll stays locked until both close.

---

## Hamburger Animation

Three lines transform into an X when open:

```
Closed:              Open:
─────                  ╲
─────         →         ╳
─────                  ╱

CSS Transform:
Line 1: translateY(7px) rotate(45deg)
Line 2: scaleX(0) opacity(0)
Line 3: translateY(-7px) rotate(-45deg)
```

---

## Data Format

```javascript
const menuCategories: MenuCategory[] = [
  {
    name: 'Data Visualisation',
    icon: '📊',
    items: [
      { label: 'CalendarHeatmap', href: '/calendarheatmap', active: false },
      { label: 'Sunburst', href: '/sunburst', active: true },
    ]
  },
  {
    name: 'Cards',
    icon: '🃏',
    items: [
      { label: 'CardStack', href: '/cardstack', active: false },
    ]
  }
];
```

---

## Single-Item Categories

Categories with only one item render as direct links (no expand/collapse):

```
┌─────────────────────┐
│ 🏠 Home             │  ← Direct link, no chevron
├─────────────────────┤
│ ▼ Data Viz    (5)   │  ← Expandable category
└─────────────────────┘
```

---

## Performance Notes

- **CSS Transitions:** All animations are CSS-only for 60fps smoothness
- **Set Operations:** O(1) lookups for category expansion checks
- **Lazy Rendering:** Category items only rendered when expanded
- **Sticky Header:** Uses `backdrop-filter: blur()` for modern browsers

---

## Edge Cases Handled

| Situation | Behaviour |
|-----------|-----------|
| No active page | No category auto-expands |
| Empty categories | Renders header but no items |
| Single-item category | Direct link, no expand |
| Auth not configured | Shows "Auth Offline" badge |
| Panel open + page nav | Panel closes automatically |
| Rapid toggle clicks | Debounced by CSS transition |

---

## What This Component Does NOT Do

- Does not support nested categories (only one level deep)
- Does not remember expansion state across page loads
- Does not provide search/filter for menu items
- Does not support right-to-left (RTL) layouts yet
- Does not have drag-to-reorder categories

---

## Dependencies

**Optional: better-auth** (for authentication UI)

Otherwise zero external dependencies. Uses:
- Svelte 5 runes (`$state()`, `$effect()`, `$derived()`)
- Svelte actions (`use:setupFocusTrap`)
- Native CSS animations and transitions

---

## File Structure

```
Navbar.svelte      # The component
Navbar.test.ts     # Unit tests
Navbar.md          # This explainer
```

---

*Last updated: 26 December 2025*
