---
title: Drawer
description: Slide-in modal panel from any of four screen edges (left, right, top, bottom). Built-in keyboard focus trap, body scroll lock, focus restore on close, Escape and backdrop dismissal, and a respectful prefers-reduced-motion fallback.
category: Helpful UX
author: AntClaude
---

# Drawer

A modal layer that slides in from one of the four screen edges. Use it for navigation menus on mobile, side panels for filters / settings / details, full-form bottom sheets, and any other "modal layer that slides in from somewhere" pattern.

## Key Features

- Four edge positions — `left`, `right`, `top`, `bottom`
- Customisable size (`number` → px, or any CSS length string like `'70vh'` / `'24rem'`)
- Backdrop with click-to-close (disable via `persistent`)
- Escape-to-close (disabled when `persistent`)
- **Keyboard focus trap** — Tab cycles inside the drawer, Shift+Tab cycles backward, neither escapes to background content
- **Body scroll lock** — preserves the prior `body.style.overflow` and restores it on close (no blanket-clearing)
- **Focus restore** — the element that triggered the open is re-focused on close
- CSS slide animation per edge (`transform: translate*`)
- Honours `prefers-reduced-motion: reduce` (drops the slide, keeps an opacity fade so users still get a visual cue)
- Two-way `bind:open` for parent control
- `onClose` callback for side effects (analytics, stale-form cleanup, etc.)
- Zero dependencies, fully copy-paste portable

## Usage

```svelte
<script lang="ts">
  import Drawer from '$lib/components/Drawer.svelte';

  let open = $state(false);
</script>

<button onclick={() => (open = true)}>Settings</button>

<Drawer bind:open position="right" size={400} ariaLabel="Settings panel">
  <h2>Settings</h2>
  <p>Drawer content goes here.</p>
  <button onclick={() => (open = false)}>Close</button>
</Drawer>
```

## Persistent (no backdrop dismiss)

Useful for full forms where the user must explicitly cancel or submit:

```svelte
<Drawer bind:open persistent ariaLabel="New invoice">
  <form>
    <!-- ... -->
    <button type="button" onclick={() => (open = false)}>Cancel</button>
    <button type="submit">Save</button>
  </form>
</Drawer>
```

## Custom CSS length

`size` accepts any valid CSS length, not just pixels:

```svelte
<Drawer bind:open position="bottom" size="70vh">
  <!-- bottom sheet at 70% viewport height -->
</Drawer>
```

## Props

| Prop             | Type                                       | Default     | Description |
|------------------|--------------------------------------------|-------------|-------------|
| `open`           | `boolean` (bindable)                       | `false`     | Whether the drawer is visible. Bindable for parent control. |
| `position`       | `'left' \| 'right' \| 'top' \| 'bottom'`   | `'right'`   | Which edge the drawer slides in from. |
| `size`           | `number \| string`                         | `320` (px)  | Width (left/right) or height (top/bottom). Number → px; string → any CSS length. |
| `persistent`     | `boolean`                                  | `false`     | When `true`, backdrop click and Escape do NOT close the drawer. |
| `ariaLabel`      | `string`                                   | `'Drawer'`  | Accessible name for the dialog. Ignored if `ariaLabelledBy` is set. |
| `ariaLabelledBy` | `string`                                   | `undefined` | Use this if your content already has a heading you want AT to read. |
| `onClose`        | `() => void`                               | `undefined` | Called when the user dismisses (Escape / backdrop click) or your own `bind:open` flips to `false`. |
| `children`       | `Snippet`                                  | required    | Drawer content. |
| `class`          | `string`                                   | `''`        | Extra classes on the drawer panel. |

## Keyboard

| Key       | Action |
|-----------|--------|
| `Escape`  | Closes the drawer (unless `persistent`). |
| `Tab`     | Moves focus forward, trapped inside the drawer. |
| `Shift+Tab` | Moves focus backward, trapped inside the drawer. |

## When to use

- Mobile navigation menus (slide from left/right)
- Side panels for filters, settings, details, or sub-forms
- Bottom sheets for action menus (slide from bottom)
- Notifications / activity log overlays (slide from top or right)
- Any "modal layer slides in from somewhere" pattern

## When not to use

- Inline editing inside a list row → use [`Editor`](./Editor.svelte) (modal centred dialog)
- Visually morphing from a trigger element to expanded state → use [`MorphingDialog`](./MorphingDialog.svelte)
- Persistent navigation that's always on screen → use a regular sidebar or [`Navbar`](./Navbar.svelte)
- A small popover anchored to a trigger → use [`Tooltip`](./Tooltip.svelte) or a bespoke popover (drawer is heavier)
- Toast-style transient notifications → use [`ToastNotification`](./ToastNotification.svelte)

## Accessibility notes

- The drawer carries `role="dialog"` + `aria-modal="true"`. The backdrop is `role="presentation"` so AT only sees the dialog.
- The first tabbable element inside the drawer is auto-focused on open (after a `requestAnimationFrame` so the drawer has mounted).
- Focus is trapped manually for cross-browser consistency — the native `<dialog>` focus trap is inconsistent across browsers.
- On close, focus returns to whatever was active when the drawer opened. If that element has been removed from the DOM, focus falls through to `<body>` (browser default).
- Body scroll lock is *snapshot-and-restore*, not blanket-clear: if your CSS sets `body { overflow: scroll; }`, the drawer respects that on close.
- Reduced-motion: the slide animation is replaced with a calm opacity fade. The drawer still appears, just without horizontal/vertical movement that can trigger vestibular discomfort.
- The drawer panel has `tabindex="-1"` so it can receive programmatic focus without being part of the Tab order itself.

## Why a custom focus trap and not native `<dialog>`?

The native `<dialog>` element with `showModal()` provides built-in focus trap, ESC handling, and a `::backdrop` pseudo-element. We chose a manual implementation because:

1. **Animation control** — `<dialog>` opens via `showModal()` (imperative). Coordinating with Svelte 5's declarative `{#if open}` plus CSS transitions is awkward.
2. **Cross-browser focus trap consistency** — browser implementations of the trap differ in subtle ways, especially with shadow DOM / iframe content.
3. **Closer customisation** — we control the backdrop element directly, so the click-target / animation / pointer-events behaviour is predictable.

The trade-off is ~30 lines of JS for the trap + body lock + focus restore. The accessibility outcome is identical to a well-implemented native dialog.
