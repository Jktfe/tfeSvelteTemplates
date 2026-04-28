---
title: AvatarStack
description: Overlapping group of circular avatars with an automatic "+N more" overflow tile, deterministic colour fallbacks, and zero dependencies.
category: Helpful UX
author: AntClaude
---

# AvatarStack

A horizontal group of overlapping circular avatars with optional `+N` overflow. Each avatar gracefully degrades from image → explicit initials → derived initials → deterministic background colour, so the component looks complete even when image URLs fail.

## Key Features

- **Image + initials fallback** — `<img onerror>` swaps to initials when a URL 404s.
- **Deterministic colours** — initials get a stable colour per name from an 8-step palette.
- **Configurable** — `size`, `overlap`, `max`, `borderColor`, `showOverflow`.
- **Accessible** — each avatar is a focusable `<button>` with `aria-label`, native tooltip, and visible focus ring.
- **Reduced-motion aware** — disables hover lift when `prefers-reduced-motion: reduce`.
- **Zero dependencies** — Svelte 5 runes + Tailwind only.

## Usage

```svelte
<script lang="ts">
  import AvatarStack from '$lib/components/AvatarStack.svelte';

  const team = [
    { name: 'Ada Lovelace', src: '/img/ada.jpg' },
    { name: 'Grace Hopper' },
    { name: 'Margaret Hamilton' },
    { name: 'Katherine Johnson' },
    { name: 'Hedy Lamarr' }
  ];
</script>

<AvatarStack people={team} max={3} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `people` | `AvatarStackPerson[]` | `[]` | List of people to render. |
| `max` | `number` | `4` | Avatars shown before collapsing into the `+N` tile. |
| `size` | `number` | `36` | Avatar diameter (px). |
| `overlap` | `number` | `12` | Pixel overlap between avatars. |
| `borderColor` | `string` | `'white'` | Ring colour separating overlapping avatars. |
| `showOverflow` | `boolean` | `true` | Render the `+N` tile when needed. |
| `class` | `string` | `''` | Extra classes on the outer container. |

### `AvatarStackPerson`

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Display name. Used for alt text, tooltip, and initials fallback. |
| `src?` | `string` | Image URL. Falls back to initials when missing or failing to load. |
| `alt?` | `string` | Optional explicit alt text override. Defaults to `name`. |
| `initials?` | `string` | Optional explicit initials override (max 2 chars). |
| `color?` | `string` | Optional explicit background for initials fallback. |

## When to use

- Collaborator lists on cards, tasks, or PRs.
- "Who's online" badges in headers.
- Reaction or mention summaries (`+12 more`).

## When not to use

- Single avatars — use a plain `<img>` instead.
- Long sortable people pickers — use a list/table.
