<script lang="ts">
	/**
	 * Mobile View Component
	 *
	 * Simplified linear layout for mobile devices.
	 * Cards displayed as an accordion-style list instead of a canvas.
	 *
	 * @component
	 */

	import type { ExplainerCard, ExplainerTooltip } from '$lib/types';
	import CardContent from './CardContent.svelte';

	interface BreadcrumbItem {
		id: string;
		title: string;
	}

	interface Props {
		cards: ExplainerCard[];
		canvasTitle: string;
		breadcrumbPath?: BreadcrumbItem[];
		expandedCardId?: string | null;
		onCardExpand?: (cardId: string) => void;
		onCardCollapse?: () => void;
		onLinkClick?: (linkId: string) => void;
		onDiveIn?: (cardId: string) => void;
		onBreadcrumbNavigate?: (id: string | null) => void;
	}

	let {
		cards,
		canvasTitle,
		breadcrumbPath = [],
		expandedCardId = null,
		onCardExpand,
		onCardCollapse,
		onLinkClick,
		onDiveIn,
		onBreadcrumbNavigate
	}: Props = $props();

	/**
	 * Handle card header click
	 */
	function handleCardClick(cardId: string) {
		if (expandedCardId === cardId) {
			onCardCollapse?.();
		} else {
			onCardExpand?.(cardId);
		}
	}

	/**
	 * Check if card has children
	 */
	function hasChildren(card: ExplainerCard): boolean {
		return (card.children?.length ?? 0) > 0;
	}
</script>

<div class="mobile-view">
	<!-- Header with breadcrumbs -->
	<header class="mobile-header">
		{#if breadcrumbPath.length > 0}
			<button
				type="button"
				class="back-button"
				onclick={() => onBreadcrumbNavigate?.(breadcrumbPath.length > 1 ? breadcrumbPath[breadcrumbPath.length - 2].id : null)}
				aria-label="Go back"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="15 18 9 12 15 6" />
				</svg>
			</button>
		{/if}

		<div class="header-content">
			<h1 class="header-title">
				{#if breadcrumbPath.length > 0}
					{breadcrumbPath[breadcrumbPath.length - 1].title}
				{:else}
					{canvasTitle}
				{/if}
			</h1>
			{#if breadcrumbPath.length > 0}
				<div class="header-path">
					{canvasTitle}
					{#each breadcrumbPath.slice(0, -1) as item}
						<span class="path-separator">›</span>
						{item.title}
					{/each}
				</div>
			{/if}
		</div>
	</header>

	<!-- Card list -->
	<div class="card-list">
		{#each cards as card (card.id)}
			<article class="mobile-card" class:expanded={expandedCardId === card.id}>
				<!-- Card header (always visible) -->
				<button
					type="button"
					class="card-header"
					onclick={() => handleCardClick(card.id)}
					aria-expanded={expandedCardId === card.id}
				>
					<div class="card-header-content">
						<h2 class="card-title">{card.title}</h2>
						<p class="card-summary">{card.summary}</p>
					</div>

					<div class="card-indicators">
						{#if hasChildren(card)}
							<span class="children-badge" title="Has nested content">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="3" y="3" width="7" height="7" rx="1" />
									<rect x="14" y="3" width="7" height="7" rx="1" />
									<rect x="3" y="14" width="7" height="7" rx="1" />
									<rect x="14" y="14" width="7" height="7" rx="1" />
								</svg>
							</span>
						{/if}
						<svg
							class="expand-icon"
							class:rotated={expandedCardId === card.id}
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<polyline points="6 9 12 15 18 9" />
						</svg>
					</div>
				</button>

				<!-- Expanded content -->
				{#if expandedCardId === card.id}
					<div class="card-body">
						<CardContent content={card.content} tooltips={card.tooltips} />

						<!-- Links -->
						{#if card.links && card.links.length > 0}
							<nav class="card-links" aria-label="Related cards">
								<span class="links-label">Related:</span>
								<div class="links-list">
									{#each card.links as linkId}
										<button
											type="button"
											class="link-pill"
											onclick={() => onLinkClick?.(linkId)}
										>
											{linkId}
										</button>
									{/each}
								</div>
							</nav>
						{/if}

						<!-- Dive in button -->
						{#if hasChildren(card)}
							<button
								type="button"
								class="dive-in-btn"
								onclick={() => onDiveIn?.(card.id)}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<polyline points="9 18 15 12 9 6" />
								</svg>
								Explore {card.children?.length} nested items
							</button>
						{/if}
					</div>
				{/if}
			</article>
		{/each}
	</div>
</div>

<style>
	.mobile-view {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--ec-bg, #f9fafb);
	}

	/* Header */
	.mobile-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background: var(--ec-bg-card, #ffffff);
		border-bottom: 1px solid var(--ec-border, #e0e0e0);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.back-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		color: var(--ec-text-muted, #666);
		background: transparent;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.back-button:hover {
		color: var(--ec-text, #1a1a1a);
		background: var(--ec-bg, #f5f5f5);
	}

	.header-content {
		flex: 1;
		min-width: 0;
	}

	.header-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--ec-text, #1a1a1a);
		line-height: 1.3;
	}

	.header-path {
		font-size: 0.75rem;
		color: var(--ec-text-muted, #666);
		margin-top: 0.25rem;
	}

	.path-separator {
		margin: 0 0.25rem;
		opacity: 0.5;
	}

	/* Card list */
	.card-list {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* Card */
	.mobile-card {
		background: var(--ec-bg-card, #ffffff);
		border: 1px solid var(--ec-border, #e0e0e0);
		border-radius: 12px;
		overflow: hidden;
		transition: box-shadow 0.2s ease;
	}

	.mobile-card.expanded {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		width: 100%;
		padding: 1rem;
		text-align: left;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.card-header:hover {
		background: var(--ec-bg, #fafafa);
	}

	.card-header-content {
		flex: 1;
		min-width: 0;
	}

	.card-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--ec-text, #1a1a1a);
		line-height: 1.3;
	}

	.card-summary {
		margin: 0.375rem 0 0;
		font-size: 0.875rem;
		color: var(--ec-text-muted, #666);
		line-height: 1.5;
	}

	.card-indicators {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--ec-text-muted, #999);
	}

	.children-badge {
		display: flex;
		align-items: center;
		opacity: 0.7;
	}

	.expand-icon {
		transition: transform 0.2s ease;
	}

	.expand-icon.rotated {
		transform: rotate(180deg);
	}

	/* Card body (expanded) */
	.card-body {
		padding: 0 1rem 1rem;
		border-top: 1px solid var(--ec-border, #f0f0f0);
	}

	.card-links {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--ec-border, #f0f0f0);
	}

	.links-label {
		font-size: 0.75rem;
		color: var(--ec-text-muted, #666);
		font-weight: 500;
	}

	.links-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.link-pill {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.625rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--ec-primary, #3b82f6);
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: 999px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.link-pill:hover {
		background: rgba(59, 130, 246, 0.2);
		border-color: var(--ec-primary, #3b82f6);
	}

	.dive-in-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.75rem 1rem;
		margin-top: 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--ec-primary, #3b82f6);
		background: rgba(59, 130, 246, 0.08);
		border: 1px dashed rgba(59, 130, 246, 0.4);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.dive-in-btn:hover {
		background: rgba(59, 130, 246, 0.15);
		border-style: solid;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.expand-icon,
		.mobile-card {
			transition: none;
		}
	}
</style>
