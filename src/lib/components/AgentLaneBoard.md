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
