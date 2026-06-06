# NotificationCentre

## What Does It Do? (Plain English)

NotificationCentre is the bell-and-badge you see in the corner of most apps. A bell button shows a small red badge counting how many notifications you haven't read yet. Click the bell and a dropdown inbox slides open, listing your notifications split into **Today** and **Earlier**. Each row shows an optional icon, a title, a short body, and a human-friendly timestamp like "2 hours ago", plus a dot marking unread items.

**Think of it like:** the little post tray on a hotel reception desk. The number of slips waiting is visible at a glance; open the tray and the newest slips sit on top, today's separated from the rest. Picking one up marks it as seen, and you can sweep the whole tray clear with one button.

Clicking a row marks just that one as read; "Mark all as read" clears every dot at once; an optional × dismisses a row entirely.

---

## How It Works (Pseudo-Code)

```
COMPUTE unreadCount = count of notifications where read is false

COMPUTE groups:
  SORT notifications newest-first by timestamp
  PARTITION into "Today" (same calendar day as `now`) and "Earlier"
  DROP any empty group

WHEN bell CLICKED:
  TOGGLE panel open
  IF now open → focus the first item on the next microtask

WHEN an item CLICKED:
  REPLACE that item with a copy where read = true
  CALL onChange(notifications)

WHEN "Mark all as read" CLICKED:
  MAP every unread item to a read copy
  CALL onChange(notifications)

WHEN dismiss (×) CLICKED:
  FILTER the item out of the list
  CALL onChange(notifications)

WHEN key pressed inside panel:
  Escape    → close panel, return focus to bell
  ArrowDown → focus next item (wraps)
  ArrowUp   → focus previous item (wraps)
  Home/End  → focus first / last item

WHEN pointer pressed outside trigger AND panel:
  close panel (without stealing focus)
```

---

## Deterministic Relative Time

The trickiest design decision here is **time**. Relative phrasing ("3 minutes ago") needs a reference "now". Reading `Date.now()` at module load would make the component non-deterministic — it would render differently on the server than the client (hydration mismatch) and would be impossible to snapshot in a test.

So `now` is a **required prop**: an ISO-8601 string supplied by the caller. Every timestamp is compared against it.

```
diffSec = (itemTime - nowTime) / 1000
choose the largest unit that fits:
  < 60s     → seconds
  < 1h      → minutes
  < 1 day   → hours
  < 1 week  → days
  otherwise → weeks
format with Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' })
```

`numeric: 'auto'` is what turns "1 day ago" into the friendlier "yesterday". The formatter is constructed once, not per row.

---

## Immutable Updates Keep Binding Honest

Every mutation (`markRead`, `markAllRead`, `dismiss`) **reassigns** `notifications` to a brand-new array rather than mutating items in place. Two reasons:

1. `notifications` is `$bindable`, so a fresh reference is what propagates back through `bind:notifications` to the parent.
2. `$derived` values (`unreadCount`, `groups`) only recompute when the reference changes — in-place mutation would leave the badge stale.

`onChange` fires after each mutation so a parent can persist the new state (e.g. POST the read flag to a server) without setting up its own `$effect`.

---

## State Flow Diagram

```
                         ┌──────────────────────────┐
   bell click  ─────────▶│  open = true              │
                         │  focus first item         │
                         └─────────────┬─────────────┘
                                       │
        ┌──────────────────────────────┼───────────────────────────┐
        ▼                               ▼                           ▼
  item click                    ArrowUp/Down/Home/End         Escape / outside
  read = true                   move roving focus             open = false
  onChange()                    (wraps at ends)               (Escape restores
        │                                                      focus to bell)
        ▼
  unreadCount $derived recomputes ──▶ badge + aria-live update
```

---

## Props Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `notifications` | `NotificationItem[]` (bindable) | `[]` | The inbox list. Each item: `{ id, title, body?, timestamp, read, icon? }`. |
| `now` | `string` (ISO 8601) | — (required) | Reference time used for relative timestamps and Today/Earlier grouping. Never read from the system clock internally. |
| `label` | `string` | `'Notifications'` | Accessible name for the trigger and panel; also used in the unread aria-label. |
| `allowDismiss` | `boolean` | `true` | When true, each row shows a × button that removes it from the list. |
| `onChange` | `(items: NotificationItem[]) => void` | `undefined` | Called after any read/dismiss mutation with the new array. |

---

## Edge Cases

| Scenario | Behaviour |
| --- | --- |
| Empty `notifications` | Panel shows the "You're all caught up" empty state; badge hidden. |
| Unread count over 99 | Badge displays `99+` to avoid overflowing the dot. |
| Invalid ISO in `timestamp` or `now` | `relativeTime` returns an empty string rather than "Invalid Date". |
| All items already read | "Mark all as read" is disabled (greyed, not focusable as an action). |
| Item dismissed while focused | Focus is not forcibly restored; remaining items keep their tab order, panel stays open. |
| Click outside while open | Panel closes without moving focus (no surprise focus jump on a stray click). |
| `prefers-reduced-motion` | Panel open animation and trigger transition are removed. |
| Future-dated timestamp | `Intl.RelativeTimeFormat` renders forward phrasing ("in 5 minutes"); grouping still uses calendar-day comparison. |

---

## Dependencies

Zero runtime dependencies. Uses the built-in `Intl.RelativeTimeFormat` for timestamps and inline SVG for the bell, empty-state, and dismiss glyphs — no icon library. All styling is scoped, theme-aware via CSS custom properties.

---

## File Structure

```
src/lib/components/
  NotificationCentre.svelte   — component (markup, logic, scoped styles)
  NotificationCentre.md       — this document
  NotificationCentre.test.ts  — vitest + @testing-library/svelte coverage
src/routes/notificationcentre/
  +page.svelte                — ComponentPageShell demo (badge, grouping, empty, dismiss)
```
