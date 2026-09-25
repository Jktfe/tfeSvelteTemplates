# RoutePreviewRail

## What Does It Do? (Plain English)

`RoutePreviewRail` turns route metadata into a visual inspection strip. It is useful when a component library needs to prove that each pitch has a live page and screenshot proof, not just a catalogue entry.

## How It Works (Pseudo-Code)

```text
receive preview items
summarise ready, review, and missing statuses
filter by search text and status
render horizontal cards with screenshots and route links
```

## State Flow Diagram

```text
RoutePreviewItem[]
  -> summarizeRoutePreviews()
  -> query/status controls
  -> filterRoutePreviews()
  -> scrollable route cards
```

## Props Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `RoutePreviewItem[]` | Required | Route cards with name, href, screenshot, description, and status. |
| `title` | `string` | `"Route preview rail"` | Heading shown above the rail. |
| `subtitle` | `string` | Visual-QA default | Context below the heading. |

## Theming

Follows `docs/THEMING.md`: tokens live on `.route-rail` with light defaults inline and a `@media (prefers-color-scheme: dark)` flip. Chrome tokens read the host app's shared tokens first (`--fg-1`, `--fg-2`, `--fg-3`, `--border`, `--surface`, `--surface-2`, `--accent`) and fall back to built-in values, so the component flips correctly both inside this showcase and when copied into an app that defines none of them. If your host defines those tokens but never flips them, override the component tokens directly.

| Property | Light | Dark | Used by |
| --- | --- | --- | --- |
| `--rpr-fg-1` / `--rpr-fg-2` / `--rpr-fg-3` | `var(--fg-*, …)` | `var(--fg-*, …)` dark fallbacks | Text tiers |
| `--rpr-border` / `--rpr-surface` | `var(--border/--surface, …)` | dark fallbacks | Cards, search, status filter |
| `--rpr-kicker` | `#9f1239` | `#fda4af` | Header kicker |
| `--rpr-frame-bg` | `#f1f5f9` | `#1f2937` | Screenshot frame behind images |
| `--rpr-{ready,review,missing}-{accent,bg,border}` | green / amber / red pastels | same hues, deep tints, light text | Route cards and status chips |

Status tones are semantic and keep their hue on both schemes. Screenshots are content and are shown as-is.

```css
/* Tighter contrast for a projector-friendly dashboard */
body .route-rail.route-rail {
  --rpr-border: #94a3b8;
}
```

## Edge Cases

- Items without a status are treated as `ready`; route-level code can mark missing screenshots as `missing`.
- Search covers name, route, description, and category so shelf-level filtering stays useful.
- The rail uses native horizontal scrolling so it remains copy-paste friendly without a carousel dependency.

## Dependencies

No external dependencies.

## File Structure

```text
src/lib/components/RoutePreviewRail.svelte
src/lib/components/RoutePreviewRail.test.ts
src/lib/components/RoutePreviewRail.md
src/routes/routepreviewrail/+page.svelte
```
