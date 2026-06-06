# Sidebar

## What Does It Do? (Plain English)

Sidebar is the left-hand navigation rail of an app shell. On the desktop it shows a list of links — each with an icon and label — and can shrink to an icon-only strip to reclaim screen space; in that collapsed mode each icon grows a tooltip on hover so you never lose the label. Links can be grouped into nested sections that expand and collapse. The currently-open page is highlighted and marked for screen readers. On a phone the rail steps out of the way entirely and becomes an off-canvas drawer that you summon with a hamburger button and dismiss with a tap on the backdrop or the Escape key.

**Think of it like:** a filing cabinet that lives against the wall. Pull it open for the full labelled drawers, push it flat for just the icon tabs, and on a cramped desk it tucks away until you slide it back out.

---

## How It Works (Pseudo-Code)

```
ON mount:
  IF a stored collapsed preference exists (localStorage, SSR-guarded)
    ADOPT it

WHEN collapse toggle CLICKED:
  FLIP collapsed
  PERSIST collapsed to localStorage under storageKey

WHEN rendering each item:
  IF item has children → render a group button (aria-expanded)
    a group starts open if it OWNS the active href
  ELSE → render a link
    IF href === activeHref → add .active + aria-current="page"

WHEN hamburger CLICKED (mobile):
  SET mobileOpen = true
  MOVE focus to first focusable inside the drawer

WHILE drawer open:
  TRAP Tab focus between first and last focusable
  ON Escape → close drawer, RESTORE focus to hamburger
  ON backdrop click → close drawer
```

---

## Collapsed Mode and Tooltips

When `collapsed` is true the rail narrows to 64px via a CSS width transition and every label is hidden. To keep the nav usable, each link renders a `.sb-tooltip` positioned to the right of the icon; it is invisible (`opacity: 0`, `pointer-events: none`) until the link is hovered or receives `:focus-visible`. Because the tooltip is a real DOM child of the link rather than a portal, it inherits the rail's stacking context — which is why the demo wraps the rail in a positioned stage so the tooltip never escapes to the viewport edge.

## The Mobile Drawer and Focus Trap

At `max-width: 640px` the rail switches to `position: absolute` and is pushed off-canvas with `transform: translateX(-110%)`. Adding `.mobile-open` slides it back to `translateX(0)`. While open, a `$effect` installs a `keydown` listener that (a) closes on Escape and (b) keeps Tab cycling between the first and last focusable element so keyboard users can't tab into the page behind the backdrop. Closing the drawer returns focus to the hamburger trigger, satisfying the "focus restoration" expectation for modal-style surfaces. The rail uses `position: absolute` (not `fixed`) so it resolves to the nearest positioned ancestor — drop it inside an app-shell wrapper and it stays inside that wrapper.

## SSR-Guarded Persistence

The collapsed preference is read and written through `window.localStorage`, but every access is guarded with `typeof window === 'undefined'` so the component renders cleanly during server-side rendering. The initial read happens inside a `$effect` (client-only by definition) and only overrides the `collapsed` prop when a stored value actually exists, so a caller-supplied default still wins on first ever visit. Set `storageKey=""` to disable persistence entirely.

---

## State Flow Diagram

```
            ┌──────────── desktop ────────────┐
            │                                  │
  expanded ──(toggle)──▶ collapsed ──(toggle)──▶ expanded
   (labels)             (icons+tooltips)
            │                                  │
            └──────── persisted to localStorage ┘

            ┌──────────── mobile ─────────────┐
  closed ──(hamburger)──▶ open (focus trapped)
   │                        │
   └──◀(Esc | backdrop)─────┘  (focus → hamburger)
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `SidebarItem[]` | `[]` | Navigation tree. Each item is `{ label, href?, icon?, children? }`; one level of nesting via `children`. |
| `activeHref` | `string` | `''` | href of the current page — drives `.active` and `aria-current="page"`. |
| `title` | `string` | `'Menu'` | Heading at the top of the rail; hidden when collapsed. |
| `collapsed` | `boolean` (bindable) | `false` | Icon-only mode. Overridden on mount by any stored preference. |
| `storageKey` | `string` | `'tfe-sidebar-collapsed'` | localStorage key for persistence. Empty string disables persistence. |
| `ariaLabel` | `string` | `'Main navigation'` | Accessible name for the `<nav>` landmark and the drawer dialog. |
| `mobileOpen` | `boolean` (bindable) | `false` | True while the mobile drawer is open. |

---

## Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| SSR / no `window` | All localStorage access is guarded; the rail renders with the prop defaults and adopts any stored value once hydrated. |
| `storageKey=""` | Persistence is skipped; collapsed state lives only in memory. |
| Item with no `href` and no `children` | Renders as a non-navigating link (anchor with `href={undefined}`); treat as a label or supply children. |
| Group containing the active child | Starts expanded automatically so the highlighted item is visible. |
| Collapsed + nested group | Groups don't expand inline while collapsed; the parent shows its icon + tooltip only. |
| Drawer open with zero focusables | Focus trap no-ops gracefully; Escape and backdrop still close. |
| `prefers-reduced-motion` | Width, slide, chevron, and tooltip transitions are disabled; the backdrop fade is removed. |

---

## Dependencies

None. Inline SVG for the hamburger, collapse chevron, and close glyphs; all styling is scoped CSS with `prefers-color-scheme` for dark mode. No icon library, no animation library, no Svelte stores — collapsed/open state uses `$state` and `$bindable` runes.

---

## File Structure

```
src/lib/components/Sidebar.svelte   — component (markup + scoped CSS + logic)
src/lib/components/Sidebar.md       — this explainer (rendered in the page shell)
src/lib/components/Sidebar.test.ts  — vitest + @testing-library/svelte
src/routes/sidebar/+page.svelte     — demo wrapped in ComponentPageShell
```
