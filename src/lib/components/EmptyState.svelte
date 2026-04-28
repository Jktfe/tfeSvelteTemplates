<!--
  ============================================================
  EmptyState - Universal "Nothing Here Yet" Component
  ============================================================

  🎯 WHAT IT DOES
  Renders a friendly placeholder when a list, search result, dashboard,
  or any data-bearing region has nothing to show. Communicates context
  ("you have no orders" vs "no results found") and offers a path forward
  via an optional action slot.

  ✨ FEATURES
  • Icon snippet (any emoji, SVG, or component)
  • Title (required) and description (optional)
  • Optional action snippet for primary call-to-action
  • Three sizes (sm / md / lg) for inline / card / full-page contexts
  • Three variants — 'default' (subtle), 'card' (bordered), 'minimal' (no padding)
  • Accessible — uses role="status" for screen-reader announcement

  ♿ ACCESSIBILITY
  • Semantic structure: <section> with <h3> heading
  • role="status" announces the empty state to screen readers
  • Action element is keyboard-focusable (consumer's responsibility)
  • Honours prefers-reduced-motion (no animations to disable here)

  📦 DEPENDENCIES
  Zero external dependencies.

  🎨 USAGE
  <EmptyState title="No orders yet">
    {#snippet icon()}📦{/snippet}
    {#snippet description()}Place your first order to see it here.{/snippet}
  </EmptyState>

  <EmptyState title="No results" size="sm" variant="minimal">
    {#snippet icon()}🔍{/snippet}
    {#snippet description()}Try a different search term.{/snippet}
  </EmptyState>

  <EmptyState title="Welcome aboard">
    {#snippet icon()}🚀{/snippet}
    {#snippet description()}Get started by creating your first project.{/snippet}
    {#snippet action()}
      <button class="btn-primary">Create project</button>
    {/snippet}
  </EmptyState>

  📋 PROPS
  | Prop        | Type                              | Default     | Description |
  |-------------|-----------------------------------|-------------|-------------|
  | title       | string                            | ''          | Bold heading line |
  | size        | 'sm' \| 'md' \| 'lg'                | 'md'        | Vertical padding & font sizes |
  | variant     | 'default' \| 'card' \| 'minimal'    | 'default'   | Visual treatment |
  | icon        | Snippet                           | undefined   | Leading visual (emoji, SVG, etc.) |
  | description | Snippet                           | undefined   | Body copy under the title |
  | action      | Snippet                           | undefined   | CTA region under the description |
  | class       | string                            | ''          | Extra container classes |

  ============================================================
-->

<script lang="ts">
	import type { Snippet } from 'svelte';

	export type EmptyStateSize = 'sm' | 'md' | 'lg';
	export type EmptyStateVariant = 'default' | 'card' | 'minimal';

	interface Props {
		title?: string;
		size?: EmptyStateSize;
		variant?: EmptyStateVariant;
		icon?: Snippet;
		description?: Snippet;
		action?: Snippet;
		class?: string;
	}

	let {
		title = '',
		size = 'md',
		variant = 'default',
		icon,
		description,
		action,
		class: extraClass = ''
	}: Props = $props();
</script>

<section
	class="empty-state empty-{size} empty-{variant} {extraClass}"
	role="status"
	aria-live="polite"
>
	{#if icon}
		<div class="empty-icon" aria-hidden="true">
			{@render icon()}
		</div>
	{/if}

	{#if title}
		<h3 class="empty-title">{title}</h3>
	{/if}

	{#if description}
		<p class="empty-description">
			{@render description()}
		</p>
	{/if}

	{#if action}
		<div class="empty-action">
			{@render action()}
		</div>
	{/if}
</section>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 0.75rem;
	}

	/* Sizes — control padding and icon scale */
	.empty-sm {
		padding: 1.5rem 1rem;
	}
	.empty-sm .empty-icon {
		font-size: 2rem;
	}
	.empty-sm .empty-title {
		font-size: 0.95rem;
	}
	.empty-sm .empty-description {
		font-size: 0.8125rem;
	}

	.empty-md {
		padding: 2.5rem 1.5rem;
	}
	.empty-md .empty-icon {
		font-size: 3rem;
	}
	.empty-md .empty-title {
		font-size: 1.125rem;
	}
	.empty-md .empty-description {
		font-size: 0.9375rem;
	}

	.empty-lg {
		padding: 4rem 2rem;
		gap: 1rem;
	}
	.empty-lg .empty-icon {
		font-size: 4rem;
	}
	.empty-lg .empty-title {
		font-size: 1.5rem;
	}
	.empty-lg .empty-description {
		font-size: 1rem;
	}

	/* Variants — visual chrome */
	.empty-default {
		background: #fafafa;
		border: 1px dashed #e2e8f0;
		border-radius: 12px;
	}

	.empty-card {
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
	}

	.empty-minimal {
		background: transparent;
		border: 0;
		padding-left: 0;
		padding-right: 0;
	}

	.empty-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
		color: #94a3b8;
	}

	.empty-title {
		margin: 0;
		font-weight: 600;
		color: #0f172a;
		line-height: 1.3;
	}

	.empty-description {
		margin: 0;
		max-width: 32ch;
		color: #64748b;
		line-height: 1.5;
	}

	.empty-action {
		margin-top: 0.5rem;
	}
</style>
