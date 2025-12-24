<script lang="ts">
	/**
	 * Tooltip Portal Component
	 *
	 * Renders tooltips for term definitions outside the normal DOM flow.
	 * Handles positioning and visibility based on trigger element location.
	 *
	 * @component
	 */

	import { renderMarkdown } from './utils/markdown';

	interface Props {
		content?: string;
		x?: number;
		y?: number;
		visible?: boolean;
	}

	let { content = '', x = 0, y = 0, visible = false }: Props = $props();

	// Rendered HTML content
	let renderedContent = $derived(content ? renderMarkdown(content) : '');

	// Tooltip positioning with viewport constraints
	let tooltipStyle = $derived(() => {
		if (!visible) return 'display: none;';

		// Position tooltip above the cursor with some offset
		const offsetY = -10;
		const left = Math.max(10, x);
		const top = Math.max(10, y + offsetY);

		return `
			left: ${left}px;
			top: ${top}px;
			transform: translateX(-50%) translateY(-100%);
		`;
	});
</script>

{#if visible && content}
	<div
		class="tooltip-portal"
		style={tooltipStyle()}
		role="tooltip"
		aria-live="polite"
	>
		<div class="tooltip-content">
			{@html renderedContent}
		</div>
		<div class="tooltip-arrow"></div>
	</div>
{/if}

<style>
	.tooltip-portal {
		position: fixed;
		z-index: 1000;
		max-width: 300px;
		pointer-events: none;
		animation: tooltipFadeIn 0.15s ease;
	}

	@keyframes tooltipFadeIn {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-100%) translateY(5px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(-100%);
		}
	}

	.tooltip-content {
		padding: 0.625rem 0.875rem;
		font-size: 0.8125rem;
		line-height: 1.5;
		color: #ffffff;
		background: #1a1a1a;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.tooltip-content :global(p) {
		margin: 0;
	}

	.tooltip-content :global(p + p) {
		margin-top: 0.5rem;
	}

	.tooltip-content :global(code) {
		background: rgba(255, 255, 255, 0.15);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-size: 0.875em;
	}

	.tooltip-content :global(strong) {
		color: #ffffff;
		font-weight: 600;
	}

	.tooltip-arrow {
		position: absolute;
		bottom: -6px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 6px solid transparent;
		border-right: 6px solid transparent;
		border-top: 6px solid #1a1a1a;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.tooltip-portal {
			animation: none;
		}
	}
</style>
