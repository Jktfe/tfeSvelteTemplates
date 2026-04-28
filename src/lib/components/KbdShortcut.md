---
title: KbdShortcut
description: Keyboard key cap display — single key or combo, Mac/Windows aware (⌘ vs Ctrl). Native <kbd> for screen readers, pure CSS bevel, zero dependencies.
category: Helpful UX
author: AntClaude
---

# KbdShortcut

Renders one or more keys as styled `<kbd>` caps so users can see at a glance which key combo triggers an action. Auto-detects platform to show ⌘ on Mac and Ctrl/Win on Windows, with a manual override if you want to force one look.

## Key Features

- Single key (`"Esc"`) or combo array (`["Cmd", "K"]`)
- Auto Mac vs Windows detection (Cmd → ⌘ / Win, Ctrl → ⌃ / Ctrl)
- Three sizes (`sm` / `md` / `lg`)
- Custom separator (`"+"`, `" → "`, or any string)
- Native `<kbd>` semantic element — free a11y from the browser
- Default `aria-label` spells out keys ("Cmd plus K") so SR says words, not glyphs
- Pure CSS bevel — no images, no font icons
- Zero dependencies

## Usage

```svelte
<script lang="ts">
  import KbdShortcut from '$lib/components/KbdShortcut.svelte';
</script>

<!-- Single key -->
<KbdShortcut keys="Esc" />

<!-- Mac combo (⌘ K rendered on Mac, Win + K on Windows) -->
<KbdShortcut keys={['Cmd', 'K']} />

<!-- Force Windows look -->
<KbdShortcut keys={['Ctrl', 'Shift', 'P']} mac={false} />

<!-- Sequential combo (press g, then s) -->
<KbdShortcut keys={['G', 'S']} separator=" → " />
```

## Props

| Prop        | Type                        | Default     | Description |
|-------------|-----------------------------|-------------|-------------|
| `keys`      | `string \| string[]`        | required    | Key or combo to display. |
| `mac`       | `boolean \| undefined`      | auto        | Force Mac (`true`) or Windows (`false`) symbols. |
| `size`      | `'sm' \| 'md' \| 'lg'`      | `'md'`      | Cap size and font scale. |
| `separator` | `string`                    | `'+'`       | Joiner between keys; ignored if `keys` is a string. |
| `ariaLabel` | `string`                    | auto        | Override the SR-announced label. |
| `class`     | `string`                    | `''`        | Extra classes on the wrapper. |

## When to use

- Search/command bar hints (next to the input)
- Tooltips and menu items showing the shortcut
- Keyboard shortcut documentation pages
- Onboarding tours teaching power-user keys

## When not to use

- For pressed-state visual feedback during interaction → use a button
- For text input examples (use `<code>` instead)
- When the shortcut isn't actually wired up — be honest with users

## Accessibility notes

The whole combo is wrapped in a single `<kbd>` so screen readers announce the entire shortcut as one unit. The default `aria-label` is the keys joined by `" plus "` (e.g. "Cmd plus K") rather than literal symbols, so SR users hear words, not "command-K-symbol". Separator characters (`+`, `→`) are `aria-hidden="true"` to avoid being announced literally.
