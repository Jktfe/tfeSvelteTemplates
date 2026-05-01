# Breadcrumbs — Technical Logic Explainer

## What Does It Do? (Plain English)

A trail of links across the top of the page that tells the visitor where they are in the site's hierarchy. Each step in the trail is a link back up the tree (Home → Components → Navigation), except the last one — that's plain text because it represents the page they're already on.

When the path is too long to fit on one line, the middle collapses into a single `…` marker. The first crumb (usually Home) and the last crumb (the current page) are always preserved, because those are the two anchors users care about: where they started, and where they are now.

Think of it as a sat-nav for site structure: short turn-by-turn directions, with the bits in the middle elided when the route gets long.

## How It Works (Pseudo-Code)

```
state:
  items       = Crumb[]                // caller-supplied, full trail
  maxVisible  = number                 // 0 means "render everything"

derive visible[]:
  if maxVisible <= 0 OR items.length <= maxVisible:
    return items                       // trail fits — show all of it

  // trail too long — keep first, drop the middle, keep the tail
  tail = items[-(maxVisible - 2):]     // last (maxVisible - 2) items
  return [items[0], { ellipsis: true }, ...tail]

render:
  <nav aria-label={ariaLabel}>
    <ol>
      for each item, index in visible:
        isLast = index == visible.length - 1
        <li>
          if item is ellipsis:
            <span aria-hidden>…</span>
          else if isLast OR no href:
            <span aria-current={isLast ? 'page' : undefined}>label</span>
          else:
            <a href={item.href}>label</a>
          if not isLast:
            <span aria-hidden>{separator}</span>
        </li>
    </ol>
  </nav>
```

There's no internal mutable state. `items` and `maxVisible` come in as props; `visible` is a `$derived` value that recomputes whenever either changes. The component is a pure function from props to DOM — no events, no listeners, no timers.

## The Core Concept: Smart Truncation

The component's only piece of real logic is `buildVisible(crumbs, max)`. It answers a single question: *"if I can only show `max` crumbs, which ones do I drop?"*

The answer is governed by one rule and two facts:

- **Rule:** the first crumb and the last crumb are non-negotiable. They're the only two crumbs the user is guaranteed to want — the home anchor and the "you are here" marker.
- **Fact 1:** the ellipsis itself counts as one of the `max` slots. If `max = 4`, the row is `first + … + (max-2 = 2 trailing crumbs)`.
- **Fact 2:** the dropped middle is always *adjacent to the front*, never the back. The slice is `crumbs.slice(-(max - 2))`, which keeps the *last* `max-2` items. Crumbs near the current page survive; crumbs near the root (after the first) get sacrificed.

### Worked example

Trail: `Home → Docs → Components → Navigation → Breadcrumbs → Truncation`  (6 items)

| `maxVisible` | Output | Reasoning |
|---|---|---|
| `0` | `Home → Docs → Components → Navigation → Breadcrumbs → Truncation` | `0` means "no truncation" |
| `6` | full trail | `items.length <= max`, no truncation needed |
| `5` | `Home → … → Components → Navigation → Breadcrumbs → Truncation` | tail = last 3 items |
| `4` | `Home → … → Navigation → Breadcrumbs → Truncation` | tail = last 2 items |
| `3` | `Home → … → Breadcrumbs → Truncation` | tail = last 1 item |
| `2` | full trail (degenerate) | tail would be 0 — algorithm falls through to no-truncation behaviour |

That last row is a real edge case: `maxVisible = 2` and `maxVisible = 1` are nonsense (you can't render `first + … + last` in fewer than three slots), so the algorithm trips its own no-truncation guard and returns the full trail. The component fails open rather than rendering something visually broken.

### Why the front, not the middle?

A different breadcrumb library might bisect the trail and elide the *middle* of the middle, e.g. `Home → Docs → … → Breadcrumbs → Truncation`. That's a defensible choice but it doesn't match user behaviour: when a user looks at a breadcrumb to step *up* the tree, they almost always want to step up *one or two* levels, not jump back to the root. Preserving the tail (the closest ancestors of the current page) keeps the most-clicked crumbs visible. The Home anchor stays because it's the universal escape hatch.

## Accessibility Deep-Dive

Three things have to align for screen readers, keyboards, and search engines to all be happy.

**The semantic frame.** `<nav aria-label="Breadcrumb">` makes the trail a WAI-ARIA landmark distinct from main nav, footer nav, or any other `<nav>` on the page. The inner element is an `<ol>` — not a `<ul>` — because the order is meaningful: Home → Section → Page changes meaning if you swap items. Screen readers announce *"list with N items"* on entry.

**`aria-current="page"` on the tail.** The last crumb renders as `<span aria-current="page">`, never as a link, even if the caller passes an `href`. WAI-ARIA's breadcrumb pattern says the current page should be a non-interactive landmark; the attribute makes screen readers announce *"current page"* when the user reaches it. A link to the page you're already on is a UX papercut anyway — clicking it does nothing useful.

**Hidden separators.** Every `/` (or `›`, `→`, `·`) is wrapped in `<span aria-hidden="true">`. Without that, JAWS and NVDA literally read out *"slash"* between every crumb — *"Home, slash, Components, slash, Breadcrumbs"* — adding zero information and a lot of noise.

**Keyboard model.** No custom handling. `<a>` elements are tab-stops by default; the current-page `<span>` isn't. `Tab` and `Shift+Tab` walk the crumbs, `Enter` activates a link, `:focus-visible` paints a 2px outline using `--breadcrumbs-focus-ring`. This is a component where doing less is right: the more keyboard handling you add, the more you fight the browser's already-correct defaults.

## State Flow Diagram

Breadcrumbs is a pure render — no internal state, no events. The "state" is the relationship between props and the rendered list.

```
              ┌──────────────────────┐
              │ items, maxVisible    │  (props in)
              └──────────┬───────────┘
                         │
                         │ $derived
                         ▼
              ┌──────────────────────┐
              │ visible: RenderItem[]│
              │  = items, OR         │
              │  = [first, …, tail]  │
              └──────────┬───────────┘
                         │
                         │ render
                         ▼
              ┌──────────────────────┐
              │ <nav><ol>            │
              │   crumb | … | tail   │
              │ </ol></nav>          │
              └──────────────────────┘

  No events. Re-renders are driven entirely by parent prop changes.
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Crumb[]` | — | The full trail. Each `Crumb` is `{ label: string; href?: string }`. The last item is treated as the current page regardless of whether it has an `href`. |
| `separator` | `string` | `'/'` | Character or short string between crumbs. Common alternatives: `'›'`, `'→'`, `'·'`. |
| `maxVisible` | `number` | `0` | Maximum number of items to render. `0` disables truncation. When `items.length > maxVisible`, the middle collapses to a single `…` marker. |
| `ariaLabel` | `string` | `'Breadcrumb'` | The `aria-label` on the wrapper `<nav>`. Override for non-English locales. |
| `class` | `string` | `''` | Extra classes appended to the `<nav>`. Use this for theme overrides — see the theming notes inline in `Breadcrumbs.svelte`. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `items` is empty | Renders an empty `<nav><ol></ol></nav>`. No crash, no spurious separator. |
| Only one crumb | Renders that single crumb as the current page (`aria-current="page"`). No separator. |
| Last crumb has an `href` | The `href` is ignored; the crumb still renders as plain text with `aria-current="page"`. Matches WAI-ARIA pattern guidance. |
| Intermediate crumb has no `href` | Renders as a plain `<span>` (not a link), without `aria-current`. Useful for non-clickable parent labels. |
| `maxVisible = 1` or `maxVisible = 2` | Falls through to no-truncation behaviour because `first + ellipsis + tail` requires at least 3 slots. The component renders the full trail rather than something broken. |
| Very long single crumb label | Truncated by CSS: `max-width: 18ch` on links, `22ch` on the current crumb, with `text-overflow: ellipsis`. Hover/focus reveals the full label. |
| User has `prefers-reduced-motion: reduce` | Hover-background transitions disabled. The component is otherwise fully static, so there's nothing else to disable. |
| User has `prefers-color-scheme: dark` | All six chrome tokens flip to their dark-mode values automatically. Manual `.dark`-class toggling is **not** wired up. |

## Dependencies

- **Svelte 5.x** — `$props`, `$derived`, and `$bindable` aren't used here, but `$props` and `$derived` are. The component requires Svelte 5's runes API.
- Zero external dependencies — pure CSS, no motion library, no icon library.

## File Structure

```
src/lib/components/Breadcrumbs.svelte         # implementation
src/lib/components/Breadcrumbs.md             # this file (rendered inside ComponentPageShell)
src/lib/components/Breadcrumbs.test.ts        # vitest unit tests
src/routes/breadcrumbs/+page.svelte           # demo page
```
