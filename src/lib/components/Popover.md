# Popover

## What Does It Do? (Plain English)

Popover is a small floating panel that opens when you click a trigger button and stays anchored to that button. It is the right tool for a lightweight, *interactive* overlay — an account menu, a filter form, a colour picker, a "more details" card — anything that needs real focusable content but doesn't warrant a full modal.

**Think of it as** the little bubble that pops up when you click a toolbar button: it points at what you clicked, holds a few controls, and dismisses the moment you click away or press Escape.

## How It Works (Pseudo-Code)

```
state:
  open = false
  resolvedPlacement = 'bottom'
  posTop, posLeft = 0, 0

events:
  on click trigger:
    open = !open
    if open:
      await render of panel        # so we can measure it
      measure()                    # flip + position
      focus first focusable in panel (or the panel itself)

  on measure():
    t = triggerRect()              # getBoundingClientRect
    p = panelRect()
    resolvedPlacement = flip(preferred, t, p, viewport, offset)
    { posTop, posLeft } = computePosition(resolvedPlacement, t, p, viewport, offset)

  on window mousedown (target outside trigger AND panel):
    open = false                   # do NOT steal focus back

  on window keydown Escape:
    open = false
    return focus to the trigger button

  on window scroll / resize (while open):
    measure()                      # keep the panel glued to the trigger
```

## The Core Concept: Edge-Aware Placement

A naïve popover just renders below its trigger. That breaks the instant the trigger sits near the bottom of the viewport — the panel spills off-screen. Popover measures both the trigger and the panel with `getBoundingClientRect()` and decides the side to render on at open time.

The flip rule is deliberately conservative: only flip to the opposite side if the preferred side genuinely lacks room **and** the opposite side has *strictly more* space. That prevents the panel ping-ponging between two equally cramped sides.

```
                 viewport
   ┌───────────────────────────────────────┐
   │                                        │
   │   space.top = trigger.top              │
   │        ▲                               │
   │        │                               │
   │   ┌─────────┐                          │
   │   │ trigger │  space.right ───────────▶│
   │   └─────────┐                          │
   │        │                               │
   │        ▼                               │
   │   space.bottom = viewportH - trigger.bottom
   │                                        │
   └───────────────────────────────────────┘

   need = (vertical ? panelHeight : panelWidth) + offset
   if space[preferred] < need AND space[opposite] > space[preferred]:
        placement = opposite
   else:
        placement = preferred
```

Once the side is chosen, `computePosition` centres the panel on the trigger's cross-axis, then **clamps** the result so the panel never bleeds past the viewport edge (with an 8px safety pad). So a bottom-placed panel under a far-left trigger slides right just enough to stay fully visible — it flips on the main axis, clamps on the cross axis. Both helpers are exported from the component's module script and unit-tested without a DOM.

## Focus Trapping

Popover is interactive, so keyboard users must be able to reach its content. On open, focus moves to the first focusable element inside the panel (`button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])`), falling back to the panel itself (`tabindex="-1"`) when it holds only static content.

```
click trigger ──▶ panel mounts ──▶ focus first focusable child
                                         │
                              Escape / click-outside
                                         │
                                         ▼
                         panel unmounts ──▶ focus returns to trigger
```

Unlike a modal, Popover deliberately does **not** trap Tab inside the panel or lock page scroll — it is a transient, non-modal surface (`aria-modal="false"`). Escape always closes and hands focus back to the trigger button so keyboard flow is never stranded. Click-outside closes *without* yanking focus, so tabbing onward from the trigger feels natural.

## Distinct From Tooltip

Three library components float content near an anchor; they are not interchangeable.

- **Tooltip** — opens on *hover/focus*, holds *non-interactive* text, and is `role="tooltip"`. You can't click into it. Use it for hints and labels.
- **Popover** (this) — opens on *click*, holds *interactive* content, is `role="dialog"` + `aria-modal="false"`, and is anchored to its trigger with edge-aware flipping. Use it for menus, mini-forms, and detail cards.
- **MorphingDialog** — a full *modal*: it centres on screen, locks page scroll, traps focus, dims the page behind an overlay, and morphs out of its trigger. Use it for focused tasks that should block the rest of the page.

If the content is read-only → Tooltip. If it must block the page → MorphingDialog. Everything in between → Popover.

## State Flow Diagram

```
        ┌────────────────┐
        │     CLOSED      │
        │   open = false  │
        └───────┬────────┘
                │ click trigger
                ▼
        ┌────────────────┐   scroll / resize
        │   MEASURING     │◀───────────────┐
        │  flip + place   │                │
        └───────┬────────┘                │
                │ positioned = true        │
                ▼                          │
        ┌────────────────┐─────────────────┘
        │      OPEN       │
        │  focus in panel │
        └───────┬────────┘
                │ Escape ▶ focus returns to trigger
                │ click-outside ▶ focus left as-is
                │ click trigger again
                ▼
        ┌────────────────┐
        │     CLOSED      │
        └────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Bindable open state; set it to open/close programmatically. |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Preferred side to anchor on; flips automatically on overflow. |
| `offset` | `number` | `8` | Gap in pixels between the trigger and the panel. |
| `ariaLabel` | `string` | `'Popover'` | Accessible name announced for the dialog. |
| `class` | `string` | `''` | Extra CSS class applied to the panel element. |
| `trigger` | `Snippet<[{ onclick, 'aria-expanded', 'aria-haspopup' }]>` | — | Renders the trigger; spread the received props onto your button. |
| `children` | `Snippet` | — | The panel content. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Trigger sits near the bottom edge and `placement="bottom"` | Panel flips to `top` if the top has more room. |
| Trigger near the left edge, wide panel | Panel keeps its side but clamps horizontally so it stays fully on-screen. |
| Panel is taller than the viewport on both sides | Keeps the preferred side (no useful flip); clamped to the 8px pad. |
| Page scrolls or window resizes while open | Panel re-measures and stays glued to the trigger. |
| Panel holds no focusable elements | Focus lands on the panel itself (`tabindex="-1"`). |
| User presses Escape | Panel closes and focus returns to the trigger button. |
| User clicks inside the panel | Panel stays open (click-outside only fires for presses outside both trigger and panel). |
| `prefers-reduced-motion: reduce` | The entrance transform/opacity transition is skipped — the panel simply appears. |

## Dependencies

- Zero external dependencies — pure Svelte 5 (`$state`, `$bindable`, `$props`, snippets) + scoped CSS.

## File Structure

```
src/lib/components/Popover.svelte              # implementation (inline Props + exported placement helpers)
src/lib/components/Popover.md                  # this file (rendered inside ComponentPageShell)
src/lib/components/Popover.test.ts             # vitest unit + interaction tests
src/lib/components/PopoverTestHarness.test.svelte  # snippet harness used by the tests
src/routes/popover/+page.svelte                # demo page
```
