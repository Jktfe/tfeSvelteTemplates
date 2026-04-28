---
title: Divider
description: Structural section separator with optional label, horizontal or vertical orientation, three thicknesses, three line styles, and proper ARIA semantics.
category: Helpful UX
author: AntClaude
---

# Divider

A visual separator between sections — between form sections, "OR" between login methods, between menu items, between flexbox toolbar groups. Renders as a native `<hr>` when there's no label (free `role="separator"` from the browser) or as a `<div role="separator">` with flanking lines when there's text content.

## Key Features

- **Two orientations** — `horizontal` (default) and `vertical`.
- **Optional label** — text or any snippet content centred or left/right aligned within the line.
- **Three thicknesses** — `thin` (1 px), `medium` (2 px), `thick` (4 px).
- **Three line styles** — `solid`, `dashed`, `dotted`.
- **Custom colour** — pass any CSS colour value to override the default neutral grey.
- **Native `<hr>`** when possible — semantic separator for free.
- **`role="separator"` + `aria-orientation`** — clean ARIA when label or vertical.
- **`decorative` flag** — hides from assistive tech entirely when the separator is purely visual.
- **Zero dependencies** — pure CSS, no JS.

## Usage

```svelte
<script lang="ts">
  import Divider from '$lib/components/Divider.svelte';
</script>

<!-- plain horizontal -->
<Divider />

<!-- with centre label -->
<Divider label="OR" />

<!-- left-aligned section header -->
<Divider label="Recently active" labelPosition="left" />

<!-- thick dashed brand colour -->
<Divider thickness="thick" lineStyle="dashed" colour="#146ef5" />

<!-- vertical between toolbar groups -->
<div style="display: flex; gap: 0.75rem;">
  <button>Bold</button><button>Italic</button>
  <Divider orientation="vertical" />
  <button>Link</button><button>Code</button>
</div>

<!-- snippet content for icon labels -->
<Divider>
  {#snippet children()}
    <span class="flex items-center gap-1">⭐ Featured</span>
  {/snippet}
</Divider>
```

## Props

| Prop            | Type                                  | Default        | Description |
|-----------------|---------------------------------------|----------------|-------------|
| `orientation`   | `'horizontal' \| 'vertical'`          | `'horizontal'` | Direction of the separator. |
| `thickness`     | `'thin' \| 'medium' \| 'thick'`       | `'thin'`       | Line weight (1 / 2 / 4 px). |
| `lineStyle`     | `'solid' \| 'dashed' \| 'dotted'`     | `'solid'`      | CSS border-style for the line. |
| `label`         | `string`                              | `''`           | Visible label text. Omit for plain line. |
| `labelPosition` | `'left' \| 'center' \| 'right'`       | `'center'`     | Where the label sits along the line. |
| `colour`        | `string`                              | `#e2e8f0`      | Any CSS colour value (sets `--divider-colour`). |
| `decorative`    | `boolean`                             | `false`        | Add `aria-hidden="true"` to skip assistive tech. |
| `class`         | `string`                              | `''`           | Extra classes on the wrapper. |
| `children`      | `Snippet`                             | —              | Custom label content (overrides `label`). |

## Accessibility

- Plain horizontal: native `<hr>` — browsers automatically expose `role="separator"`.
- Labelled / vertical: `<div role="separator">` so SR announces it. Vertical sets `aria-orientation="vertical"`.
- Set `decorative` for purely visual breaks where no separator semantics are needed.

## When to use

- Splitting form sections (Personal info / Address / Payment).
- "OR" / "AND" between login or signup options.
- Between dropdown-menu groups.
- Between toolbar button groups (vertical).
- Section headers in long content (with left-aligned label).

## When not to use

- Adding empty space — use margin/padding.
- Decorative flourishes — use a styled element, not a separator.
- Grouping items semantically — use `<fieldset>` / `<section>` instead.
