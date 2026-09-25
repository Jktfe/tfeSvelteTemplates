# MediaLightboxPro - Technical Logic Explainer

## What Does It Do? (Plain English)

MediaLightboxPro renders a responsive grid of thumbnails and, when one is clicked, opens it in a larger viewer with its title, caption, a "3 / 8" counter and Previous/Next controls that wrap round the ends. It is intentionally dependency-free so teams can drop it into component docs, QA dashboards or release notes as screenshot proof.

**Think of it like:** a contact sheet on a light table. Glance across the small prints, then pull one under the loupe and slide along to its neighbours.

---

## How It Works (Pseudo-Code)

```
state:
  open        = false
  activeIndex = 0
  opener      = null        # the thumbnail that opened the viewer

derived:
  active = items[activeIndex]

ON thumbnail click (index):
  opener = that thumbnail
  activeIndex = index
  open = true
  lock body scroll, move focus to the Close button

ON Next click / ArrowRight (more than one item):
  activeIndex = nextMediaIndex(activeIndex, items.length)       # (i + 1) mod n

ON Previous click / ArrowLeft (more than one item):
  activeIndex = previousMediaIndex(activeIndex, items.length)   # (i - 1 + n) mod n

ON Tab / Shift+Tab inside the dialog:
  wrap focus between the first and last control (focus trap)

ON Close click / Escape / backdrop click:
  open = false
  restore body scroll, return focus to opener

RENDER dialog only when open AND active exists:
  counter = mediaCounter(activeIndex, items.length)             # "i+1 / n"
```

---

## The Core Concept: Modular Index Arithmetic

Wrapping navigation is handled by two pure helpers, so the edges never need special-casing in the markup:

```
n = 5
index:      0   1   2   3   4
next:       1   2   3   4   0   ← wraps forward
previous:   4   0   1   2   3   ← wraps back
```

`previousMediaIndex` adds `length` before taking the modulus because JavaScript's `%` keeps the sign of the left operand (`-1 % 5 === -1`). Both helpers return `0` for an empty list rather than `NaN`.

### Exported helpers

| Export | Purpose |
|--------|---------|
| `nextMediaIndex(current, length)` | Next index, wrapping to `0`. |
| `previousMediaIndex(current, length)` | Previous index, wrapping to `length - 1`. |
| `mediaCounter(index, length)` | Human counter such as `"3 / 8"`, or `"0 / 0"` when empty. |

---

## Keyboard & Accessibility

| Key | Action |
| --- | --- |
| `Enter` / `Space` on a thumbnail | Opens the viewer at that item |
| `ArrowRight` / `ArrowLeft` | Next / previous item (wraps; ignored with a single item) |
| `Tab` / `Shift+Tab` | Cycles through the dialog's controls without escaping |
| `Escape` | Closes the viewer and returns focus to the thumbnail |

The viewer panel is a `role="dialog"` with `aria-modal="true"`, labelled by the active item's title. Previous/next controls are hidden when there is only one item. The backdrop fade is disabled under `prefers-reduced-motion: reduce`.

---

## State Flow Diagram

```
   ┌──────────────────────┐   click thumbnail i   ┌───────────────────────────┐
   │  GRID                │ ────────────────────▶ │  VIEWER OPEN              │
   │  open = false        │                       │  activeIndex = i          │
   │  thumbnails visible  │ ◀──────────────────── │  role="dialog", trapped   │
   └──────────────────────┘  Close / Escape /     │  counter + caption        │
     (focus back on the       backdrop click      └──────┬─────────────┬──────┘
      opening thumbnail)                   Previous / ←  │             │ Next / →
                                           (wraps)       ▼             ▼ (wraps)
                                                  activeIndex ± 1 mod n
                                                         │
                                                         ▼
                                                   VIEWER OPEN
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MediaLightboxItem[]` | — (required) | Media with `id`, `title`, `src`, `alt`, optional `caption` and optional `type` (`'image' \| 'video'`). |
| `title` | `string` | `'Media lightbox pro'` | Heading above the gallery. |
| `class` | `string` | `''` | Extra classes on the root `<section>`. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `items` is empty | Grid renders empty; the viewer cannot open. |
| Only one item | Previous/Next are hidden and the arrow keys do nothing. |
| `items` shrinks while the viewer is open on a removed index | `active` becomes `undefined` and the viewer closes itself. |
| Unmounted while open | Body scroll lock is released so the page is not left frozen. |
| Item has no `caption` | The `<figcaption>` is omitted. |
| `type: 'video'` | Currently rendered as an `<img>`; the field is reserved for a future video viewer. |
| Many thumbnails | Thumbnails use `loading="lazy"` so off-screen images do not block first paint. |

---

## Dependencies

- Zero external dependencies — pure Svelte 5 (`$state`, `$derived`, `$props`) and scoped CSS.

---

## File Structure

```
src/lib/components/MediaLightboxPro.svelte     # implementation + exported index helpers
src/lib/components/MediaLightboxPro.md         # this file (rendered inside ComponentPageShell)
src/lib/components/MediaLightboxPro.test.ts    # vitest unit tests
src/routes/medialightboxpro/+page.svelte       # demo page
```
