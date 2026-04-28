---
title: Tabs
description: Classic tabbed content switcher with full WAI-ARIA tablist semantics, roving tabindex, two visual variants, two orientations, and keyboard navigation.
category: Helpful UX
author: AntClaude
---

# Tabs

A horizontal or vertical tabbed interface for switching between mutually exclusive content panels. Renders proper ARIA roles (`tablist` / `tab` / `tabpanel`) with roving tabindex so keyboard users land on the active tab and arrow-key around — never the wrong "Tab key visits every option" footgun.

## Key Features

- **Full WAI-ARIA tablist** — `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`, `aria-labelledby`, `aria-orientation`.
- **Roving tabindex** — only the active tab is `tabindex="0"`; Tab key moves to/past the tablist as a single stop.
- **Keyboard nav** — ←/→ (or ↑/↓ vertical) moves focus and wraps; Home/End jump to first/last; Enter/Space activate the focused tab.
- **Two visual variants** — `underline` (animated underline under active tab) and `pill` (rounded pill on a tray).
- **Two orientations** — `horizontal` (default) and `vertical`.
- **Disabled tabs** — skipped by keyboard navigation and click activation.
- **Two-way binding** — `bind:active` for full controlled/uncontrolled use.
- **Snippet panel** — render the active panel via a `panel(id)` snippet — branch on id without coupling to a panels prop.
- **Reduced-motion aware** — transitions skipped under `prefers-reduced-motion: reduce`.

## Usage

```svelte
<script lang="ts">
  import Tabs from '$lib/components/Tabs.svelte';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'specs', label: 'Specifications' },
    { id: 'reviews', label: 'Reviews' }
  ];

  let active = $state('overview');
</script>

<Tabs {tabs} bind:active>
  {#snippet panel(id)}
    {#if id === 'overview'}
      <p>This product is great…</p>
    {:else if id === 'specs'}
      <ul><li>Weight: 2 kg</li><li>Battery: 12 h</li></ul>
    {:else}
      <p>4.8 ★ from 312 reviews</p>
    {/if}
  {/snippet}
</Tabs>

<!-- Pill variant -->
<Tabs {tabs} variant="pill" bind:active>...</Tabs>

<!-- Vertical orientation -->
<Tabs {tabs} orientation="vertical" bind:active>...</Tabs>

<!-- Tabs with icons and a disabled item -->
<Tabs
  tabs={[
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'pro', label: 'Pro', icon: '⭐' },
    { id: 'soon', label: 'Coming soon', icon: '🔒', disabled: true }
  ]}
  bind:active
>
  {#snippet panel(id)}{id} content here{/snippet}
</Tabs>
```

## Props

| Prop          | Type                              | Default        | Description |
|---------------|-----------------------------------|----------------|-------------|
| `tabs`        | `TabItem[]`                       | required       | Array of tab items: `{ id, label, icon?, disabled? }`. |
| `active`      | `string` (bindable)               | `tabs[0].id`   | Active tab id. Two-way bindable. |
| `orientation` | `'horizontal' \| 'vertical'`      | `'horizontal'` | Layout direction; sets `aria-orientation`. |
| `variant`     | `'underline' \| 'pill'`           | `'underline'`  | Visual style. |
| `ariaLabel`   | `string`                          | `'Tabs'`       | Accessible name for the tablist. |
| `class`       | `string`                          | `''`           | Extra classes on the wrapper. |
| `panel`       | `Snippet<[string]>`               | —              | Snippet that receives the active id and renders the panel. |

## Keyboard

| Key                    | Action                                    |
|------------------------|-------------------------------------------|
| `Tab`                  | Move into the tablist (lands on active)   |
| `→` / `↓` (vertical)   | Focus next tab (wraps; skips disabled)    |
| `←` / `↑` (vertical)   | Focus previous tab (wraps; skips disabled)|
| `Home`                 | Focus first tab                           |
| `End`                  | Focus last tab                            |
| `Enter` / `Space`      | Activate focused tab                      |

## Accessibility

- `tablist` ↔ `tab` ↔ `tabpanel` relationships are wired via `aria-controls` and `aria-labelledby`.
- Roving tabindex puts only one tab in the tab order — the active one. Inactive tabs are reachable via arrow keys.
- `aria-orientation` is set automatically based on the `orientation` prop.
- The panel itself is `tabindex="0"` so its content is reachable from the active tab.

## When to use

- Settings panels with grouped options (Account / Notifications / Privacy).
- Product detail pages (Overview / Specs / Reviews / Q&A).
- Dashboards with multiple data slices on the same page.
- Docs sidebars (vertical variant).

## When not to use

- Sequential, ordered progress — use **Stepper**.
- All content needs to be visible together — use **Accordion**.
- Mobile bottom navigation — use **LiquidTabBar**.
- Picking a value rather than swapping content — use **SegmentedControl**.
