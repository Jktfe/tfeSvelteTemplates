# Navbar — Technical Logic Explainer

## What Does It Do? (Plain English)

Navbar provides a responsive navigation bar with a hamburger menu that opens a sliding side panel. The panel organises 28+ components into collapsible categories — click a category header to expand or collapse its items. The category containing the page you're currently looking at auto-expands when the panel opens, so you always see your context.

**Think of it like:** A filing cabinet on the side of the screen. Each drawer (category) opens to reveal the files (links) inside. Press Escape or click outside to close the whole cabinet.

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

WHEN user presses Tab inside the panel:
  1. IF at last focusable element: WRAP to first
  2. IF Shift+Tab at first element: WRAP to last
  3. KEEP focus trapped inside panel
```

## The Core Concept: Two-Level Navigation

```
Hamburger → Panel → Categories → Items
    ☰       slide    expand      click
            in       collapse    navigate
```

Category expansion pattern:

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

## State Management

Expansion state lives in a reactive `SvelteSet<string>` keyed by category name:

```javascript
expandedCategories = new SvelteSet(['Data Viz', 'Cards']);

// Check
expandedCategories.has('Data Viz');  // true
expandedCategories.has('Forms');     // false

// Mutate
expandedCategories.add('Forms');
expandedCategories.delete('Cards');
```

**Why a Set?** O(1) `has()` lookup for every render of every category, O(1) `add`/`delete` for toggles, natural uniqueness (no duplicates), and a clean toggle API. `SvelteSet` (from `svelte/reactivity`) gives you the reactivity that a plain `Set` lacks — mutations trigger re-renders without the rebuild-the-set workaround.

## Focus Trapping

When the panel is open, Tab navigation cycles only inside it:

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

The implementation queries the panel for focusable descendants and intercepts Tab to wrap:

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

The panel itself takes `tabindex="-1"` so it can receive programmatic focus on open without joining the Tab order. On close, focus returns to the hamburger button — the originating control.

## Scroll Lock Coordination

Multiple components can want to lock scrolling at the same time (Navbar panel open, then Editor opens on top, etc.). The shared `lockScroll` utility from `$lib/scrollLock` reference-counts lock requests so unlocking one doesn't accidentally unlock the page while another is still active:

```javascript
import { lockScroll } from '$lib/scrollLock';

// On open
unlockScroll = lockScroll();   // returns a cleanup function

// On close
unlockScroll();                // releases this component's lock
unlockScroll = null;
```

If Editor opens while Navbar is open and the user closes Navbar first, the page stays locked until Editor also releases — preventing the "background suddenly scrolls" bug that plagues stacked overlays.

## Hamburger Animation

Three lines transform into an X using pure CSS transforms:

```
Closed:              Open:
─────                  ╲
─────         →         ╳
─────                  ╱

Line 1: translateY(7px) rotate(45deg)
Line 2: scaleX(0) opacity(0)
Line 3: translateY(-7px) rotate(-45deg)
```

Compositor-only properties (transform + opacity), so the animation is GPU-accelerated and can't trigger layout. Honours `prefers-reduced-motion: reduce` by replacing the transition with an instant state swap.

## State Flow Diagram

```
                    ┌──────────────┐
                    │   closed     │  ← initial state
                    │  panel hidden│
                    └──────┬───────┘
                           │ click hamburger
                           ▼
                    ┌──────────────┐
                    │    open      │  ── scroll locked
                    │  panel visible│  ── focus on panel
                    │  active cat   │  ── auto-expanded category
                    │  expanded     │
                    └──┬─────────┬─┘
                       │         │
       click category  │         │  Esc / outside click / link click
       header          │         │
                       ▼         ▼
                ┌─────────────┐  ┌──────────────┐
                │ category    │  │   closed     │
                │ toggle      │  │  scroll free │
                │ (Set add /  │  │  focus → ☰   │
                │  delete)    │  └──────────────┘
                └─────┬───────┘
                      │ remains in "open"
                      ▼
                  back to "open"
```

## Data Format

```javascript
const menuCategories: MenuCategory[] = [
  {
    name: 'Data Visualisation',
    icon: '📊',
    items: [
      { label: 'CalendarHeatmap', href: '/calendarheatmap', active: false },
      { label: 'Sunburst', href: '/sunburst', active: true }
    ]
  },
  {
    name: 'Cards',
    icon: '🃏',
    items: [
      { label: 'CardStack', href: '/cardstack', active: false }
    ]
  }
];
```

Categories with only one item collapse the chevron and render as a direct link:

```
┌─────────────────────┐
│ 🏠 Home             │  ← direct link, no chevron
├─────────────────────┤
│ ▼ Data Viz    (5)   │  ← expandable, chevron present
└─────────────────────┘
```

## Performance Notes

- **CSS transitions only** — no JS-driven animation; the compositor handles open/close/chevron rotation.
- **`SvelteSet` lookups** — O(1) `has()` for every category render, no `Array.includes` scans.
- **Lazy item rendering** — category items only mount when expanded; collapsed categories are header-only.
- **`backdrop-filter: blur()`** on the sticky header — handled natively by modern browsers, gracefully ignored elsewhere.

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `menuCategories` | `MenuCategory[]` | `[]` | Grouped navigation items. Each category has `{ name, icon, items: MenuItem[] }`. |
| `menuItems` | `MenuItem[]` | `[]` | Legacy flat list — use `menuCategories` for new code; this is kept for backwards compatibility. |
| `currentPageTitle` | `string` | `'Home'` | Display label for the active page (rendered in some compact layouts). |
| `logoIcon` | `string` | `'⚡'` | Emoji or character used as the logo when `logoSrc` is empty. |
| `logoSrc` | `string` | `''` | Optional image URL — when provided, replaces `logoIcon` with `<img src={logoSrc}>`. |
| `logoAlt` | `string` | `''` | Alt text for `logoSrc`. Falls back to `logoText` when empty. |
| `logoText` | `string` | `'Svelte Templates'` | Text shown next to the logo. |
| `logoHref` | `string` | `'/'` | Destination when the logo is clicked. |
| `isAuthConfigured` | `boolean` | `false` | When `true`, auth UI renders; when `false`, an "Auth Offline" badge appears in the panel. |
| `authUser` | `AuthUser \| null` | `null` | Current signed-in user from the root layout's load function, or `null` for signed-out / demo mode. |
| `githubUrl` | `string` | `''` | When non-empty, a GitHub icon button appears in the panel header. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| No active page (no `active: true` item) | Panel opens with all categories collapsed; user expands manually. |
| Empty category | Header renders, no items below; chevron doesn't appear. |
| Single-item category | Renders as a direct link, no expand affordance. |
| Auth not configured | Shows "Auth Offline" badge in the panel; sign-in/out controls suppressed. |
| Panel open + page navigation | Panel closes automatically on `goto()`; scroll lock released. |
| Rapid hamburger toggle | Debounced by the CSS transition timing; no flicker. |
| User has `prefers-reduced-motion: reduce` | Transitions disabled; open/close becomes an instant state swap. |
| Window resized while panel open | Panel layout reflows responsively; scroll lock and focus trap remain intact. |
| Multiple modal overlays open simultaneously | `lockScroll`'s ref-count keeps the page locked until the last consumer releases. |

## What This Component Does NOT Do

- No nested categories — only one level of grouping.
- No persistence of expansion state across page loads.
- No search/filter for menu items (use the catalog's `FilterChips` on the home page instead).
- No right-to-left (RTL) layout support yet.
- No drag-to-reorder for categories.

## Dependencies

- **Svelte 5.x** — `$state`, `$effect`, `$derived`, `svelte/reactivity` (`SvelteSet`), and Svelte actions for the focus trap.
- **`$lib/scrollLock`** — the reference-counted scroll-lock utility (in-repo, not external).
- **`better-auth`** *(optional)* — only used when `isAuthConfigured` is `true`; the navbar otherwise renders without it.

## File Structure

```
src/lib/components/Navbar.svelte         # implementation
src/lib/components/Navbar.md             # this file (rendered inside ComponentPageShell)
src/lib/components/Navbar.test.ts        # unit tests
src/lib/scrollLock.ts                    # shared scroll-lock utility
src/lib/types.ts                         # NavbarProps, MenuCategory, MenuItem, AuthUser
src/routes/navbar/+page.svelte           # demo page
```
