---
title: KbdShortcut
description: Keyboard key cap display — single key or combo, Mac/Windows aware (⌘ vs Ctrl). Native <kbd> for screen readers, pure CSS bevel, zero dependencies.
category: Controls & Input
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

## Theming

Seven dark-aware CSS custom properties on `.kbd`. Light defaults are inline; a `@media (prefers-color-scheme: dark)` block flips the whole set automatically when the user prefers dark. Unlike Slider or RatingStars, there are **no brand-tinted variants on a kbd cap** — bg, fg, border, and shadow are all chrome — so the whole token set flips together (no Pattern #67 split needed).

| Property            | Light default        | Dark default         | Used by               |
|---------------------|----------------------|----------------------|-----------------------|
| `--kbd-fg`          | `#374151`            | `#d1d5db`            | Cap text colour       |
| `--kbd-bg-top`      | `#ffffff`            | `#1f2937`            | Bevel gradient top    |
| `--kbd-bg-bottom`   | `#f3f4f6`            | `#111827`            | Bevel gradient bottom |
| `--kbd-border`      | `#d1d5db`            | `#4b5563`            | Cap outline           |
| `--kbd-shadow-inner`| `#d1d5db`            | `#4b5563`            | Inset depth-line      |
| `--kbd-shadow-drop` | `rgba(0,0,0,0.05)`   | `rgba(0,0,0,0.4)`    | Outer drop-shadow     |
| `--kbd-sep-color`   | `#9ca3af`            | `#6b7280`            | Separator (`+`, `→`)  |

Override at any scope — `:root`, an app shell, or a single section — without forking the component:

```css
:root {
  --kbd-bg-top: #fef3c7;     /* warm beige cap */
  --kbd-bg-bottom: #fde68a;
  --kbd-border: #f59e0b;
  --kbd-fg: #78350f;
}
```

If your app already manages its own dark-mode strategy (manual class toggle rather than `prefers-color-scheme`), set the seven tokens inside your own `.dark { ... }` selector and the system-preference block becomes a no-op for users who haven't set the OS preference.

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
