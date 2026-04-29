---
title: Avatar
description: Single user identity element with image, initials fallback, deterministic colour-from-name palette, three sizes, three shapes, and optional status dot.
category: Helpful UX
author: AntClaude
---

# Avatar

A single user avatar primitive. Renders a photo when a `src` is provided, with automatic fallback to the user's initials on a deterministically-coloured background derived from their name. Same name produces the same colour everywhere — no persistence required.

## Key Features

- **Image with auto-fallback** — `<img>` with `onerror` flips a state flag and the template re-renders with initials.
- **Deterministic colour** — character-code sum of the name modulo an 8-colour accessible palette → same name always gets the same colour.
- **Initials extraction** — first letter of the first two name tokens, uppercased; missing name shows `?`.
- **Three sizes** — `sm` (32px), `md` (48px), `lg` (72px).
- **Three shapes** — `circle`, `rounded`, `square`.
- **Optional status dot** — `online` / `away` / `busy` / `offline`, positioned bottom-right with white border.
- **Accessible** — `role="img"` + `aria-label` on the wrapper; inner image and initials are `aria-hidden` to prevent AT double-announcement.
- **Custom content slot** — pass a `children` snippet to render arbitrary content inside the wrapper (e.g. an icon avatar).

## Usage

```svelte
<script lang="ts">
  import Avatar from '$lib/components/Avatar.svelte';
</script>

<!-- Photo avatar -->
<Avatar src="/users/ada.jpg" name="Ada Lovelace" />

<!-- Initials fallback (no src) -->
<Avatar name="Grace Hopper" />

<!-- Custom size and shape -->
<Avatar name="Ada Lovelace" size="lg" shape="rounded" />

<!-- With status dot -->
<Avatar name="Ada Lovelace" status="online" />

<!-- Photo that auto-falls-back to initials on error -->
<Avatar src="/broken.jpg" name="Ada Lovelace" />

<!-- Custom alt for screen readers -->
<Avatar src="/ada.jpg" name="Ada" alt="Ada Lovelace, founder" />
```

## Props

| Prop     | Type                                              | Default    | Description |
|----------|---------------------------------------------------|------------|-------------|
| `src`    | `string`                                          | —          | Image URL. If unset or fails to load, initials render instead. |
| `name`   | `string`                                          | —          | User's name. Drives initials and the deterministic background colour. |
| `alt`    | `string`                                          | name       | Accessible label override; falls back to `name`, then `'User'`. |
| `size`   | `'sm' \| 'md' \| 'lg'`                            | `'md'`     | 32 / 48 / 72 px. |
| `shape`  | `'circle' \| 'rounded' \| 'square'`               | `'circle'` | Border radius variant. |
| `status` | `'online' \| 'away' \| 'busy' \| 'offline'`       | —          | Optional status dot in the bottom-right corner. |
| `class`  | `string`                                          | `''`       | Extra classes merged on the wrapper. |
| `children` | `Snippet`                                       | —          | Custom inner content (overrides image and initials). |

## Accessibility

- The wrapper uses `role="img"` with `aria-label={alt ?? name ?? 'User'}` so a single, meaningful announcement is made.
- The inner `<img>` is given an empty `alt=""` and `aria-hidden="true"` to avoid double-announcement.
- Status dots are decorative (`aria-hidden`) — their meaning belongs in surrounding UI text or a tooltip if needed.
- Colours from the palette are tuned for white text contrast at AA at the default font weight.

## When to use

- User identity in lists, comment threads, navigation bars, mention chips.
- Any time you want to show "who" without occupying much space.
- Profile headers (use `lg` shape).

## When not to use

- For a group of overlapping avatars with a `+N` overflow, use **AvatarStack**.
- For a labelled status pill (text + icon), use **BadgePill**.
- For a card-sized empty placeholder, use **EmptyState**.
