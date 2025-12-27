<script lang="ts">
	/**
	 * Card Content Component
	 *
	 * Renders the expanded content of an ExplainerCanvas card.
	 * Supports markdown, images, and embeds.
	 *
	 * @component
	 */

	import type { ExplainerContentBlock, ExplainerTooltip } from '$lib/types';
	import { renderMarkdown, addTooltipTriggers } from './utils/markdown';

	interface Props {
		content: ExplainerContentBlock[];
		tooltips?: ExplainerTooltip[];
	}

	let { content, tooltips = [] }: Props = $props();

	/**
	 * Render a content block to HTML
	 */
	function renderBlock(block: ExplainerContentBlock): string {
		if (block.type === 'markdown') {
			let html = renderMarkdown(block.content);
			if (tooltips.length > 0) {
				html = addTooltipTriggers(html, tooltips);
			}
			return html;
		}
		return '';
	}
</script>

<div class="card-content">
	{#each content as block, index (index)}
		{#if block.type === 'markdown'}
			<div class="content-block content-markdown">
				{@html renderBlock(block)}
			</div>
		{:else if block.type === 'image'}
			<figure class="content-block content-image">
				<img
					src={block.src}
					alt={block.alt || ''}
					loading="lazy"
					class="content-img"
				/>
				{#if block.caption}
					<figcaption class="content-caption">{block.caption}</figcaption>
				{/if}
			</figure>
		{:else if block.type === 'embed'}
			<div
				class="content-block content-embed"
				style:aspect-ratio={block.aspectRatio || '16/9'}
			>
				<iframe
					src={block.url}
					title="Embedded content"
					loading="lazy"
					allowfullscreen
				></iframe>
			</div>
		{/if}
	{/each}
</div>

<style>
	.card-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.content-block {
		width: 100%;
	}

	/* Markdown content styling */
	.content-markdown {
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--ec-text, #1a1a1a);
	}

	/* Markdown elements */
	.content-markdown :global(h1),
	.content-markdown :global(h2),
	.content-markdown :global(h3),
	.content-markdown :global(h4) {
		margin: 1rem 0 0.5rem;
		font-weight: 600;
		color: var(--ec-text, #1a1a1a);
	}

	.content-markdown :global(h1) {
		font-size: 1.5rem;
	}

	.content-markdown :global(h2) {
		font-size: 1.25rem;
	}

	.content-markdown :global(h3) {
		font-size: 1.125rem;
	}

	.content-markdown :global(p) {
		margin: 0.5rem 0;
	}

	.content-markdown :global(ul),
	.content-markdown :global(ol) {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.content-markdown :global(li) {
		margin: 0.25rem 0;
	}

	.content-markdown :global(code) {
		background: var(--ec-bg-code, #f5f5f5);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-family: 'SF Mono', Monaco, 'Courier New', monospace;
		font-size: 0.875em;
	}

	.content-markdown :global(pre) {
		background: var(--ec-bg-code, #1e1e1e);
		color: #e0e0e0;
		padding: 1rem;
		border-radius: 8px;
		overflow-x: auto;
		margin: 0.75rem 0;
	}

	.content-markdown :global(pre code) {
		background: transparent;
		padding: 0;
		color: inherit;
	}

	.content-markdown :global(blockquote) {
		border-left: 3px solid var(--ec-primary, #3b82f6);
		margin: 0.75rem 0;
		padding-left: 1rem;
		color: var(--ec-text-muted, #666);
		font-style: italic;
	}

	.content-markdown :global(a) {
		color: var(--ec-primary, #3b82f6);
		text-decoration: none;
	}

	.content-markdown :global(a:hover) {
		text-decoration: underline;
	}

	.content-markdown :global(strong) {
		font-weight: 600;
	}

	/* Tooltip triggers */
	.content-markdown :global(.ec-tooltip-trigger) {
		border-bottom: 1px dashed var(--ec-primary, #3b82f6);
		cursor: help;
	}

	/* Image styling */
	.content-image {
		margin: 0;
	}

	.content-img {
		width: 100%;
		height: auto;
		border-radius: 8px;
		display: block;
	}

	.content-caption {
		font-size: 0.8125rem;
		color: var(--ec-text-muted, #666);
		text-align: center;
		margin-top: 0.5rem;
		font-style: italic;
	}

	/* Embed styling */
	.content-embed {
		width: 100%;
		border-radius: 8px;
		overflow: hidden;
		background: var(--ec-bg, #f5f5f5);
	}

	.content-embed iframe {
		width: 100%;
		height: 100%;
		border: none;
	}
</style>

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
