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

derived:
  active = items[activeIndex]

ON thumbnail click (index):
  activeIndex = index
  open = true

ON Next click:
  activeIndex = nextMediaIndex(activeIndex, items.length)       # (i + 1) mod n

ON Previous click:
  activeIndex = previousMediaIndex(activeIndex, items.length)   # (i - 1 + n) mod n

ON Close click:
  open = false

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

## State Flow Diagram

```
   ┌──────────────────────┐   click thumbnail i   ┌───────────────────────────┐
   │  GRID                │ ────────────────────▶ │  VIEWER OPEN              │
   │  open = false        │                       │  activeIndex = i          │
   │  thumbnails visible  │ ◀──────────────────── │  role="dialog"            │
   └──────────────────────┘      click Close      │  counter + caption        │
                                                  └──────┬─────────────┬──────┘
                                           Previous      │             │ Next
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
| Only one item | Previous and Next both stay on the same item. |
| `items` shrinks while the viewer is open on a removed index | `active` becomes `undefined` and the viewer closes itself. |
| Item has no `caption` | The `<figcaption>` is omitted. |
| `type: 'video'` | Currently rendered as an `<img>`; the field is reserved for a future video viewer. |
| Keyboard users | All controls are native buttons, but Escape-to-close and a focus trap are not built in — add them if the viewer is used as a true modal. |
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
