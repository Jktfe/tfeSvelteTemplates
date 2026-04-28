---
title: EmptyState
description: Universal "nothing here yet" placeholder for empty lists, search results, dashboards.
category: Helpful UX
author: AntClaude
---

# EmptyState

A friendly placeholder for any data-bearing region that has nothing to show. Pairs an icon, a clear title, optional descriptive copy, and an optional call-to-action so the user always has a path forward.

## Key Features

- **Three sizes** — `sm` (inline messages), `md` (cards / panels), `lg` (full-page dashboards)
- **Three variants** — `default` (dashed background), `card` (solid border), `minimal` (transparent)
- **Snippet-driven** — `icon`, `description`, and `action` are all snippets so you can pass any markup
- **Accessible** — uses `role="status"` and `aria-live="polite"` so screen readers announce the empty state
- **Zero dependencies**

## Usage

```svelte
<script lang="ts">
  import EmptyState from '$lib/components/EmptyState.svelte';
</script>

<!-- Minimal — search results -->
<EmptyState title="No results found" size="sm" variant="minimal">
  {#snippet icon()}🔍{/snippet}
  {#snippet description()}Try a different search term or check your spelling.{/snippet}
</EmptyState>

<!-- Default — empty list -->
<EmptyState title="No orders yet">
  {#snippet icon()}📦{/snippet}
  {#snippet description()}Place your first order to see it here.{/snippet}
</EmptyState>

<!-- Large with CTA — onboarding -->
<EmptyState title="Welcome aboard" size="lg" variant="card">
  {#snippet icon()}🚀{/snippet}
  {#snippet description()}Get started by creating your first project.{/snippet}
  {#snippet action()}
    <button class="btn-primary">Create project</button>
  {/snippet}
</EmptyState>
```

## Props

| Prop          | Type                              | Default     | Description |
|---------------|-----------------------------------|-------------|-------------|
| `title`       | `string`                          | `''`        | Bold heading line. |
| `size`        | `'sm' \| 'md' \| 'lg'`             | `'md'`      | Vertical padding & font sizes. |
| `variant`     | `'default' \| 'card' \| 'minimal'` | `'default'` | Visual treatment. |
| `icon`        | `Snippet`                         | `undefined` | Leading visual (emoji, SVG, component). |
| `description` | `Snippet`                         | `undefined` | Body copy under the title. |
| `action`      | `Snippet`                         | `undefined` | CTA region under the description. |
| `class`       | `string`                          | `''`        | Extra container classes. |

## When to use

- Empty inboxes, lists, search results
- First-time-user onboarding panels
- Filtered dashboards with no matching rows
- Error states that benefit from a retry CTA

## When not to use

- Page-level 404s — use a dedicated NotFound page so the URL/heading reflect the error
- Loading states — use a skeleton or spinner, since the data may still arrive
- Permission errors — these need their own treatment with sign-in prompts
