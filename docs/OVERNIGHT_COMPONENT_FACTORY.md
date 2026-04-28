# Overnight Component Factory

Date: 2026-04-28
Target window: now to 07:00
Target output: 20+ merged, visible, tested components if the lane queue stays small and low-risk.

## Operating Rule

Drop rounds. Rounds are too slow.

Each agent runs an independent loop:

1. Pitch a small component.
2. Get accept/reject from Claude or James.
3. Build it.
4. Post evidence.
5. Claude reviews/merges or fixes directly.
6. Immediately pitch again.

Nobody waits for every agent to pitch. Nobody waits for every agent to deliver. If a pitch stalls, it moves to backlog and the agent pitches another.

## Roles

Claude:
- Final quality and merge authority.
- Reviews code.
- If a lane is close but stuck, fixes and ships it.
- Keeps active lanes small enough to merge in under an hour.

Codex:
- Dispatcher and throughput owner.
- Maintains the hub ledger and active lane list.
- Calls idle/stalled lanes.
- Pushes idle agents to pitch, review, test, screenshot, or document.

Gemma:
- Visual QA, review, screenshots, docs polish, component naming, and cheerleading.
- Can pitch components, but should not block delivery.
- Tracks who is idle and asks for evidence.
- Reviews demos for "is this good enough for TFE?".

Other agents:
- Pull from the accepted queue.
- Build one small component at a time.
- Report evidence in the required format.

## Evidence Format

Every active lane update must fit this shape:

```text
Component:
Owner:
Files changed:
Demo route:
Screenshot:
Tests/checks run:
Blocker:
ETA:
```

If an agent cannot provide that, the lane is not active.

## Acceptance Bar

Every merged component needs:

- `src/lib/components/<Name>.svelte`
- Focused tests where logic exists.
- Demo route at `src/routes/<name>/+page.svelte`
- Home/nav visibility.
- Screenshot in `static/ComponentScreenshots/`
- Accessible keyboard/focus states where interactive.
- `prefers-reduced-motion` handling where animated.
- No unnecessary external dependencies.

## Lane States

Active:
- Accepted, owned, ETA posted, building now.

Review:
- Code exists, tests/checks/screenshots posted, waiting on Claude.

Backlog:
- Duplicate, too large, no owner, missing evidence, or blocked by a dead agent.

Cut:
- Explicitly removed from tonight's work.

## Midnight Goal

By 00:00:

- One source-of-truth ledger in the TFE hub.
- No active orphan chatrooms.
- At least 3 active lanes.
- At least 1 component merged after this reset.
- A queue of 20 small components ready to pull.

## 07:00 Goal

By 07:00:

- 20+ new components delivered if the team keeps scope tight.
- No component larger than one hour unless Claude explicitly approves it.
- Large ideas are backlog, not blockers.

## Pull Queue: Small Components

Prefer these over large systems:

1. AvatarStack
2. BadgePill
3. StatCard
4. EmptyState
5. SkeletonLoader
6. ProgressRing
7. Stepper
8. Breadcrumbs
9. Pagination
10. RatingStars
11. CopyButton
12. Tooltip
13. AlertBanner
14. FeatureCard
15. PricingToggle
16. KpiGrid
17. StatusDot
18. UserMention
19. TagInput
20. SearchInput
21. FilterChips
22. NotificationBell
23. InlineEditable
24. Accordion
25. PopoverMenu
26. Tabs
27. SegmentedControl
28. CodeBlock
29. MetricDelta
30. FileIcon

Before building, check for duplicates in `src/lib/components` and `src/routes`.

## Cut/Backlog Tonight

These are not active unless Claude or James explicitly revives them:

- ActivityTimeline: duplicate of existing Timeline.
- FormBuilder/FieldKit: too large, previous owner gone.
- Aurora/AuroraBackground: visual but not urgent.
- CommandMenu/CommandMenu replacement: only revive if scoped under one hour.
- Any multi-day data/workflow component.

## Hub Prompt

Use this when the room slows down:

```text
Capacity check. If you are not actively building or reviewing, pitch one small component from the pull queue now. If your lane has no evidence, it moves to backlog. Next merge target is within 60 minutes.
```
