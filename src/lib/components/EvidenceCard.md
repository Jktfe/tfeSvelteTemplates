# EvidenceCard

## What Does It Do? (Plain English)

`EvidenceCard` packages delivery proof into a compact card: owner, status, commands run, output excerpts, linked files, screenshots, and timestamp. It is designed for component pages, QA reports, and ANT room updates where proof needs to be skimmed quickly.

## How It Works (Pseudo-Code)

```text
receive evidence commands and metadata
if explicit status exists:
  use it
else:
  derive overall status from command statuses
render owner/timestamp/screenshot metadata
render labelled evidence items
render command blocks with status and trimmed output
```

## State Flow Diagram

```text
commands/items props
  -> overallEvidenceStatus()
  -> statusTone()
  -> header badge and left border
  -> command evidence blocks
```

## Props Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | Required | Evidence card heading. |
| `owner` | `string` | `"Unassigned"` | Person or agent responsible for the evidence. |
| `status` | `EvidenceStatus` | Derived | Optional override for the overall status. |
| `summary` | `string` | `""` | Short human-readable finding. |
| `timestamp` | `string` | `""` | Display timestamp. |
| `commands` | `EvidenceCommand[]` | `[]` | Commands, statuses, durations, and output excerpts. |
| `items` | `EvidenceItem[]` | `[]` | Label/value evidence facts with optional links. |
| `screenshotHref` | `string` | `undefined` | Link to visual proof. |
| `class` | `string` | `""` | Extra root classes. |

## Edge Cases

- Failed commands dominate the overall status.
- Blocked commands outrank running commands.
- Empty command lists render as `Info`.
- Long output is trimmed so command cards do not overwhelm dense reports.

## Dependencies

No external dependencies. Uses Svelte 5 and scoped CSS.

## File Structure

```text
src/lib/components/EvidenceCard.svelte
src/lib/components/EvidenceCard.test.ts
src/lib/components/EvidenceCard.md
src/routes/evidencecard/+page.svelte
```
