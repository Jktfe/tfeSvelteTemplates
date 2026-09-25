# StaggeredMenu - Technical Logic Explainer

## What Does It Do? (Plain English)

StaggeredMenu renders a list of navigation links that cascade in one after another whenever the menu opens. The first link appears straight away, the second a beat later, the third a beat after that — a small waterfall that makes an on-demand menu feel intentional instead of abrupt.

**Think of it like:** dealing a hand of cards. The dealer doesn't drop the whole deck at once; each card lands a moment after the last, so your eye follows the motion down the table.

---

## How It Works (Pseudo-Code)

```
props:
  items, isOpen (bindable), staggerMs, durationMs, orientation

derived:
  safeStagger  = max(0, staggerMs)   (NaN → 50)
  safeDuration = max(0, durationMs)  (NaN → 300)

render:
  <nav aria-label> is always present (keeps the landmark stable)
  IF isOpen:
    FOR each item at index i:
      <li style="--stagger-delay: i × safeStagger ms">
        CSS keyframe: opacity 0 → 1, translateY(-10px) → 0
        animation-delay: var(--stagger-delay)

WHEN isOpen flips false → true:
  the <ul> remounts → every <li> starts its keyframe again
  → the cascade replays from the top

WHEN prefers-reduced-motion: reduce:
  animation: none; opacity: 1  → links appear instantly
```

---

## The Core Concept: One Custom Property Per Item

The whole cascade is a single keyframe plus one number per item. There are no JavaScript timers and no Svelte transitions — the browser schedules every item as soon as the list mounts.

```
index:     0      1      2      3      4
delay:     0ms    50ms   100ms  150ms  200ms
           │      │      │      │      │
time ──────●──────●──────●──────●──────●──────────▶
           └─300ms─┘
                  └─300ms─┘
                         └─300ms─┘ …
```

Total time for the menu to settle is `(items − 1) × staggerMs + durationMs`. For five items at the defaults that's `4 × 50 + 300 = 500ms`. Keep that number under about 600ms for menus people open often; longer cascades start to feel like waiting.

Because the delay is written to `--stagger-delay` on each `<li>` (via `style:--stagger-delay`), consumers can also override the keyframe itself from outside without touching the component.

---

## CSS Animation Strategy

```css
.menu-item {
  opacity: 0;
  animation: staggered-menu-in var(--staggered-menu-duration) ease-out forwards;
  animation-delay: var(--stagger-delay, 0ms);
}

@keyframes staggered-menu-in {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .menu-item { animation: none; opacity: 1; transform: none; }
}
```

- **Only `opacity` and `transform` animate**, so the work stays on the compositor and never triggers layout.
- **`forwards` fill mode** keeps each item at its final frame once its animation ends.
- **Reduced motion wins outright** — the starting `opacity: 0` is overridden too, otherwise a user who disabled motion would be left with invisible links.
- Earlier versions ran a Svelte `fly` transition *and* the CSS keyframe on the same element. That doubled the work and ignored reduced motion; the CSS-only path does both jobs.

---

## Theming

Chrome tokens flip under `prefers-color-scheme: dark`; the accent is brand and stays constant (see `docs/THEMING.md`).

| Token | Kind | Light | Dark |
|-------|------|-------|------|
| `--staggered-menu-fg` | chrome | `#4a5568` | `#cbd5e1` |
| `--staggered-menu-hover-bg` | chrome | blue at 6% | blue at 12% |
| `--staggered-menu-accent` | brand | `#146ef5` | `#146ef5` |
| `--staggered-menu-accent-2` | brand | `#667eea` | `#667eea` |

Override any of them on a wrapper: `.my-nav { --staggered-menu-accent: #e11d48; }`.

---

## State Flow Diagram

```
          ┌────────────────────┐
          │      CLOSED        │
          │  isOpen = false    │
          │  <nav> only, no ul │
          └─────────┬──────────┘
                    │ isOpen = true (toggle / bind)
                    ▼
          ┌────────────────────┐
          │     CASCADING      │
          │  <li> i waits      │
          │  i × staggerMs     │
          └─────────┬──────────┘
                    │ last keyframe ends
                    ▼
          ┌────────────────────┐
          │      SETTLED       │
          │  all links visible │
          └─────────┬──────────┘
                    │ isOpen = false
                    ▼
               back to CLOSED
                (instant; no exit animation)

 reduced motion: CLOSED ──open──▶ SETTLED (skips CASCADING)
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MenuItem[]` | required | Links to render. `href` must be unique — it's the keyed-each key. |
| `isOpen` | `boolean` | `true` | Bindable. When false the `<ul>` unmounts; reopening replays the cascade. |
| `staggerMs` | `number` | `50` | Delay between consecutive items, in ms. Negative/NaN values are clamped. |
| `durationMs` | `number` | `300` | Length of each item's entrance, in ms. |
| `orientation` | `'auto' \| 'horizontal' \| 'vertical'` | `'auto'` | `auto` is a row above 768px and a stack below it. |
| `ariaLabel` | `string` | `'Main navigation'` | Accessible name of the `<nav>` landmark. Give each menu on a page a distinct label. |
| `id` | `string` | — | Applied to the `<nav>`, so a toggle button can reference it with `aria-controls`. |
| `class` | `string` | `''` | Extra classes forwarded to the `<nav>`. |

### MenuItem

```typescript
interface MenuItem {
  label: string;    // Visible link text
  href: string;     // Destination (also the each-block key)
  icon?: string;    // Emoji or single glyph, hidden from screen readers
  active?: boolean; // Adds aria-current="page" and the underline
}
```

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Empty `items` | Renders an empty `<ul>` inside the landmark — no errors |
| Duplicate `href` values | Svelte throws on duplicate keys; make each `href` unique (add a hash like `/docs#a`) |
| `staggerMs` negative or NaN | Clamped to `0` / defaulted to `50` so delays never go negative |
| `durationMs = 0` | Items appear instantly but still honour the stagger offset |
| Many items (20+) | Cascade gets long — lower `staggerMs` so the total stays under ~600ms |
| Toggled rapidly | Each reopen remounts the list; the cascade restarts cleanly from item 0 |
| Reduced motion | No animation, no hover lift; links are visible immediately |
| Multiple menus on one page | Pass a unique `ariaLabel` to each so landmarks are distinguishable |

---

## Dependencies

**Zero external dependencies.**

- Svelte 5 runes (`$props`, `$bindable`, `$derived`)
- `$lib/types` — `StaggeredMenuProps`, `MenuItem` (inline them if copying to another project)
- Plain CSS keyframes and custom properties

---

## File Structure

```
src/lib/components/StaggeredMenu.svelte      # component
src/lib/components/StaggeredMenu.md          # this explainer
src/lib/components/StaggeredMenu.test.ts     # unit tests
src/lib/types.ts                             # StaggeredMenuProps, MenuItem
src/routes/staggeredmenu/+page.svelte        # demo page
```
