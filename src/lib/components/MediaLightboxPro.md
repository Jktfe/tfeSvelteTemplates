# MediaLightboxPro

## What Does It Do? (Plain English)

`MediaLightboxPro` renders a thumbnail gallery and modal viewer for screenshot or media proof. It is intentionally dependency-free so teams can copy it into component docs or QA dashboards.

## How It Works (Pseudo-Code)

```text
receive media items
render thumbnail grid
open selected item in dialog
  remember the thumbnail that opened it
  lock body scroll, move focus to the Close button
previous/next controls (and ArrowLeft/ArrowRight) wrap through items
show counter and caption
Tab / Shift+Tab cycle inside the dialog only
Escape, Close or a backdrop click closes
  restore body scroll, return focus to the thumbnail
```

## Keyboard & Accessibility

| Key | Action |
| --- | --- |
| `Enter` / `Space` on a thumbnail | Opens the viewer at that item |
| `ArrowRight` / `ArrowLeft` | Next / previous item (wraps; ignored with a single item) |
| `Tab` / `Shift+Tab` | Cycles through the dialog's controls without escaping |
| `Escape` | Closes the viewer and returns focus to the thumbnail |

The viewer is a `role="dialog"` with `aria-modal="true"`, labelled by the active item's title. Previous/next controls are hidden when there is only one item. The backdrop fade is disabled under `prefers-reduced-motion: reduce`.

## Props Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `MediaLightboxItem[]` | Required | Media items with title, src, alt, and optional caption. |
| `title` | `string` | `"Media lightbox pro"` | Heading above the gallery. |
| `class` | `string` | `""` | Extra classes on the wrapper. |

## Dependencies

No external dependencies.
