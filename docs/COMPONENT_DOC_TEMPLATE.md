# <Component Name> — Technical Logic Explainer

> **HOW TO USE THIS TEMPLATE**
> Copy this file alongside the component (e.g. `src/lib/components/Foo.md`) and rename. Replace `<Component Name>` with the component's display name. Fill every required section. Pick 2–3 deep-dive sections that fit the component, drop the rest. Do **not** add YAML front-matter, author lines, or timestamps.
>
> The pipeline (`getDocsHtmlForPath`) renders this file inside `ComponentPageShell`, stripping the leading H1 because the host page already shows one. Section ordering matters — the test in `componentDocs.test.ts` pins the exact required H2 strings.

## What Does It Do? (Plain English)

Two or three sentences in plain English describing what this component does and the everyday problem it solves. End with a short analogy where useful — *"Think of it as a remote control for ..."* — to anchor the mental model for readers who don't know the technical name yet.

## How It Works (Pseudo-Code)

Show the state and event flow as indented pseudo-code. Don't paste real code; this is the mental model.

```
state:
  open = false
  activeIndex = null

events:
  on click trigger:
    open = !open
    if open: activeIndex = 0

  on keydown ArrowDown:
    if open: activeIndex = (activeIndex + 1) mod items.length

  on keydown Escape:
    open = false
```

<!-- ============================================================ -->
<!-- Pick 2–3 deep-dive sections from the list below. Each one    -->
<!-- explains *why* this component justifies its existence over   -->
<!-- a plainer alternative. Delete the headings you don't use.    -->
<!-- ============================================================ -->

## The Core Concept: <Bespoke Topic>

Use this slot for the central idea that distinguishes the component — trigonometric positioning for a SpeedDial, ellipsis algorithm for Pagination, FLIP animation for a card swap, magnification curve for a Dock, etc. ASCII diagrams encouraged. Math goes here. Walk through one realistic example end-to-end.

## Focus Trapping

For modal/overlay components: explain the focus trap, what's first-focused on open, what restores focus on close, and how Tab/Shift+Tab cycles. Include the implementation snippet that handles it.

## XSS Protection

Where the component renders user-supplied strings: show the escape strategy, what's allowed, what's stripped, and why DOMPurify (or `escapeHtml`) is necessary at this boundary.

## CSS Animation Strategy

Where motion is non-trivial: show the keyframes, easing curves, GPU-accelerated properties (transform/opacity vs. layout-thrashing top/left), and how `prefers-reduced-motion` is honoured.

## Performance

Where the component scales with input: explain the budget (e.g. "smooth at 1k items via virtual scroll"), the bottleneck, and how the implementation avoids it. Mention any `requestAnimationFrame`/`IntersectionObserver`/throttle/debounce.

## Recipes

2–4 real-world usage patterns as code blocks, each preceded by a short headline like *"With async data"*, *"Inside a Drawer"*, *"As a controlled component"*. Link each recipe back to a concrete use case rather than a contrived example.

## Browser Support

Where the component depends on a non-universal API (Container Queries, View Transitions, Web Animations API, IntersectionObserver, etc.) — name the API, list which browsers ship it today, and describe the no-JS / older-browser fallback.

## Distinct From <Similar Component>

Where users might confuse this with another component in the library — make the comparison crisp, e.g. *"Drawer vs. MorphingDialog: the Drawer slides in from an edge and is dismissable from any container; MorphingDialog animates from a triggering element and is anchored to it."*

<!-- ============================================================ -->
<!-- Required sections from here on — every component has these.  -->
<!-- ============================================================ -->

## State Flow Diagram

ASCII flowchart showing the component's internal states and the events that move between them. Boxes for states, arrows labelled with the triggering event. Keep it readable in a monospace font without scrolling.

```
  [closed] ──click trigger──▶ [open]
     ▲                          │
     │                          │ click outside / Escape
     └──────────────────────────┘
```

## Props Reference

Single GFM table. Use TypeScript types verbatim (`string`, `boolean`, `'left' | 'right'`, `(value: T) => void`). Defaults shown literally. Description in one sentence ending with a full stop.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Whether the component is currently expanded. |
| `onOpenChange` | `(open: boolean) => void` | — | Fires whenever the open state changes for any reason. |
| `placement` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'right'` | Side the component is anchored to. |

## Edge Cases

Single GFM table. Each row is a real situation a user might run into and the component's defined behaviour. Avoid hypotheticals.

| Situation | Behaviour |
|-----------|-----------|
| Trigger element is removed from the DOM while open | Component closes silently and fires `onOpenChange(false)`. |
| Window resized below the component's minimum width | Component becomes scrollable; never overflows the viewport. |
| User has `prefers-reduced-motion: reduce` | Animations skip; transitions become instant state swaps. |

## Dependencies

Bullet list. State the version where it matters; otherwise just the package. End each bullet with a one-sentence reason for the dependency.

- **Svelte 5.x** — runes (`$state`, `$derived`, `$effect`) and snippets are core to the implementation.
- **`@humanspeak/svelte-motion`** ^0.1 — used for the open/close spring; pure CSS would be jankier on low-end devices.

If the component is zero-dep, write a single bullet: *"Zero external dependencies — pure Svelte 5."*

## File Structure

Code block listing the files that ship with the component, with one-line purposes.

```
src/lib/components/Foo.svelte         # implementation
src/lib/components/Foo.md             # this file (rendered inside ComponentPageShell)
src/lib/components/Foo.test.ts        # vitest unit tests
src/routes/foo/+page.svelte           # demo page
src/lib/data/storyboards/foo.ts       # interactive storyboard data
```
