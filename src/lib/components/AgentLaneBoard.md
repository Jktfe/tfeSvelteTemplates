# AgentLaneBoard

## What Does It Do? (Plain English)

`AgentLaneBoard` shows who owns each delivery lane, what state the lane is in, what files it touches, and which acceptance gate proves it is done. It is designed for room-led development where agents need a compact status surface rather than a long chat thread.

## How It Works (Pseudo-Code)

```text
receive lanes
count lanes by status
derive completion percentage from done lanes
choose next attention lane: blocked -> review -> active -> done
render summary filters and lane cards
```

## State Flow Diagram

```text
AgentLane[]
  -> countLanesByState()
  -> completionPercent()
  -> nextActionLane()
  -> filter by status button
  -> lane cards
```

## Props Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `lanes` | `AgentLane[]` | Required | Delivery lanes with owner, status, gate, files, and evidence. |
| `title` | `string` | `"Agent lane board"` | Board heading. |
| `subtitle` | `string` | Delivery-focused default | Short context below the heading. |

## Theming

Follows `docs/THEMING.md`: tokens live on `.lane-board` with light defaults inline and a `@media (prefers-color-scheme: dark)` flip. Chrome tokens read the host app's shared tokens first (`--fg-1`, `--fg-2`, `--fg-3`, `--border`, `--surface`, `--surface-2`, `--accent`) and fall back to built-in values, so the component flips correctly both inside this showcase and when copied into an app that defines none of them. If your host defines those tokens but never flips them, override the component tokens directly.

| Property | Light | Dark | Used by |
| --- | --- | --- | --- |
| `--lb-fg` / `--lb-fg-2` / `--lb-fg-3` | `var(--fg-*, …)` light greys | `var(--fg-*, …)` light-on-dark greys | Text tiers |
| `--lb-border` / `--lb-surface` / `--lb-surface-2` | `var(--border/--surface/--surface-2, …)` | dark fallbacks | Cards, summary buttons, file chips |
| `--lb-hero-bg` | `linear-gradient(135deg, #f8fafc, #ecfdf5)` | `linear-gradient(135deg, #111827, #052e24)` | Board header |
| `--lb-kicker` | `#047857` | `#34d399` | Header kicker |
| `--lb-score-bg` / `--lb-score-border` / `--lb-score-fg` | `#dcfce7` / `#86efac` / `#14532d` | green tint / `#166534` / `#bbf7d0` | Completion score |
| `--lb-active-ring` / `--lb-active-glow` | `#0f766e` / teal alpha | `#2dd4bf` / teal alpha | Selected summary filter |
| `--lb-next-bg` / `--lb-next-fg` | `#fffbeb` / `#78350f` | amber tint / `#fde68a` | "Next attention" strip (border stays `#f59e0b`) |
| `--lb-{progress,warn,bad,good}-{accent,bg,border}` | blue / amber / red / green pastels | same hues, deep tints, light text | Lane cards and status chips |

Lane tones are semantic: active stays blue, review amber, blocked red, done green on both schemes.

```css
/* Tighter contrast for a projector-friendly dashboard */
body .lane-board.lane-board {
  --lb-border: #94a3b8;
}
```

## Edge Cases

- Empty lane arrays show `0%` complete and no next-attention block.
- Blocked lanes are prioritised above review lanes because they need intervention before review can complete.
- Files and evidence are optional so the same component can show early claims and final proof.

## Dependencies

No external dependencies.

## File Structure

```text
src/lib/components/AgentLaneBoard.svelte
src/lib/components/AgentLaneBoard.test.ts
src/lib/components/AgentLaneBoard.md
src/routes/agentlaneboard/+page.svelte
```
