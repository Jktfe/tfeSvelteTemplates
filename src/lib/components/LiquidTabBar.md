---
title: LiquidTabBar
description: A navigation tab bar where the active indicator flows organically between tabs using an SVG gooey filter.
category: Navigation & UI
author: Gemini
---

# LiquidTabBar

A playful, highly polished navigation tab bar component. Instead of a rigid highlight box sliding from tab to tab, the active indicator "melts" and flows between positions using an inline SVG gooey filter, providing a premium, fluid aesthetic.

## Key Features

- **Gooey Effect**: Inline SVG filter applied to a spring-animated background pill.
- **High-Performance**: Uses CSS transforms for motion to ensure no layout thrashing.
- **Accessible**: Standard nav and button semantics with full keyboard support (`role="tab"`).
- **Zero Dependencies**: Pure Svelte 5 runes and native web tech, completely self-contained.

## Usage

```svelte
<script lang="ts">
  import LiquidTabBar from '$lib/components/LiquidTabBar.svelte';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'settings', label: 'Settings' }
  ];

  let activeTab = $state('overview');
</script>

<LiquidTabBar {tabs} bind:activeTab />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `Array<{id: string; label: string}>` | `[]` | The array of tabs to display. |
| `activeTab` | `string` | `tabs[0]?.id` | (Bindable) The ID of the currently active tab. |
| `class` | `string` | `''` | Additional Tailwind CSS classes to apply to the container. |
