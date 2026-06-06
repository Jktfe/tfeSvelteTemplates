# MediaLightboxPro

## What Does It Do? (Plain English)

`MediaLightboxPro` renders a thumbnail gallery and modal viewer for screenshot or media proof. It is intentionally dependency-free so teams can copy it into component docs or QA dashboards.

## How It Works (Pseudo-Code)

```text
receive media items
render thumbnail grid
open selected item in dialog
previous/next controls wrap through items
show counter and caption
```

## Props Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `MediaLightboxItem[]` | Required | Media items with title, src, alt, and optional caption. |
| `title` | `string` | `"Media lightbox pro"` | Heading above the gallery. |

## Dependencies

No external dependencies.
