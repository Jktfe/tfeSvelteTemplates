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
