<script lang="ts">
	/**
	 * ExplainerCanvas Card Component
	 *
	 * Individual card with expand/collapse functionality.
	 * Shows summary when collapsed, full content when expanded.
	 *
	 * @component
	 */

	import type { ExplainerCard, ExplainerPosition } from '$lib/types';
	import CardContent from './CardContent.svelte';
	import { DEFAULT_CARD_WIDTH, DEFAULT_CARD_HEIGHT } from './utils/geometry';

	interface Props {
		card: ExplainerCard;
		isExpanded?: boolean;
		isActive?: boolean;
		hasChildren?: boolean;
		childrenNames?: string[];
		zoom?: number;
		onExpand?: () => void;
		onCollapse?: () => void;
		onDiveIn?: () => void;
		onLinkClick?: (linkId: string) => void;
		onHover?: () => void;
		onHoverEnd?: () => void;
		onPositionChange?: (newPosition: ExplainerPosition) => void;
	}

	let {
		card,
		isExpanded = false,
		isActive = false,
		hasChildren = false,
		childrenNames = [],
		zoom = 1,
		onExpand,
		onCollapse,
		onDiveIn,
		onLinkClick,
		onHover,
		onHoverEnd,
		onPositionChange
	}: Props = $props();

	// Drag state
	let isDragging = $state(false);
	let dragStartPos = $state({ x: 0, y: 0 });
	let cardStartPos = $state({ x: 0, y: 0 });

	// Card dimensions - use shared constants from geometry.ts
	const CARD_WIDTH = DEFAULT_CARD_WIDTH;
	const CARD_MIN_HEIGHT = DEFAULT_CARD_HEIGHT;

	// Derived: should we show as a dot at very low zoom?
	let showAsDot = $derived(zoom < 0.25);

	/**
	 * Handle card click - toggle expand/collapse
	 */
	function handleClick(e: MouseEvent) {
		// Don't toggle if clicking on interactive elements
		if ((e.target as HTMLElement).closest('a, button, .card-links')) {
			return;
		}

		if (isExpanded) {
			onCollapse?.();
		} else {
			onExpand?.();
		}
	}

	/**
	 * Handle keyboard navigation
	 */
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (isExpanded) {
				onCollapse?.();
			} else {
				onExpand?.();
			}
		} else if (e.key === 'Escape' && isExpanded) {
			e.preventDefault();
			onCollapse?.();
		}
	}

	/**
	 * Handle link click
	 */
	function handleLinkClick(e: MouseEvent, linkId: string) {
		e.stopPropagation();
		onLinkClick?.(linkId);
	}

	/**
	 * Handle dive into children
	 */
	function handleDiveIn(e: MouseEvent) {
		e.stopPropagation();
		onDiveIn?.();
	}

	/**
	 * Build tooltip text showing children names
	 */
	let childrenTooltip = $derived(() => {
		if (!hasChildren || childrenNames.length === 0) return 'Has nested content';
		if (childrenNames.length <= 3) {
			return `Contains: ${childrenNames.join(', ')}`;
		}
		return `Contains: ${childrenNames.slice(0, 3).join(', ')} +${childrenNames.length - 3} more`;
	});

	/**
	 * Handle drag start on the drag handle
	 */
	function handleDragStart(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		isDragging = true;
		dragStartPos = { x: e.clientX, y: e.clientY };
		cardStartPos = { x: card.position.x, y: card.position.y };

		window.addEventListener('mousemove', handleDragMove);
		window.addEventListener('mouseup', handleDragEnd);
	}

	/**
	 * Handle drag move
	 */
	function handleDragMove(e: MouseEvent) {
		if (!isDragging) return;

		const dx = (e.clientX - dragStartPos.x) / zoom;
		const dy = (e.clientY - dragStartPos.y) / zoom;

		const newPosition = {
			x: cardStartPos.x + dx,
			y: cardStartPos.y + dy
		};

		onPositionChange?.(newPosition);
	}

	/**
	 * Handle drag end
	 */
	function handleDragEnd() {
		isDragging = false;
		window.removeEventListener('mousemove', handleDragMove);
		window.removeEventListener('mouseup', handleDragEnd);
	}
</script>

{#if showAsDot}
	<!-- Dot representation at very low zoom -->
	<div
		class="card-dot"
		class:active={isActive}
		style:left="{card.position.x + CARD_WIDTH / 2}px"
		style:top="{card.position.y + CARD_MIN_HEIGHT / 2}px"
		title={card.title}
	></div>
{:else}
	<!-- Full card representation -->
	<div
		class="explainer-card"
		class:expanded={isExpanded}
		class:active={isActive}
		class:dragging={isDragging}
		style:left="{card.position.x}px"
		style:top="{card.position.y}px"
		style:width="{isExpanded ? CARD_WIDTH + 100 : CARD_WIDTH}px"
		role="button"
		tabindex="0"
		onclick={handleClick}
		onkeydown={handleKeydown}
		onmouseenter={onHover}
		onmouseleave={onHoverEnd}
		aria-expanded={isExpanded}
		aria-label={card.title}
	>
		<!-- Card header - sticky when expanded -->
		<header class="card-header">
			<!-- Drag handle -->
			<button
				type="button"
				class="drag-handle"
				onmousedown={handleDragStart}
				aria-label="Drag to reposition card"
				data-tooltip="Drag to move"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
					<circle cx="9" cy="6" r="2" />
					<circle cx="15" cy="6" r="2" />
					<circle cx="9" cy="12" r="2" />
					<circle cx="15" cy="12" r="2" />
					<circle cx="9" cy="18" r="2" />
					<circle cx="15" cy="18" r="2" />
				</svg>
			</button>
			<h3 class="card-title">{card.title}</h3>
			{#if hasChildren}
				<span class="children-indicator" data-tooltip={childrenTooltip()}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="3" width="7" height="7" rx="1" />
						<rect x="14" y="3" width="7" height="7" rx="1" />
						<rect x="3" y="14" width="7" height="7" rx="1" />
						<rect x="14" y="14" width="7" height="7" rx="1" />
					</svg>
				</span>
			{/if}
		</header>

		<!-- Card body - scrollable when expanded -->
		<div class="card-body">
			{#if isExpanded}
				<!-- Expanded view -->
				<div class="card-expanded">
					<CardContent content={card.content} tooltips={card.tooltips} />

					<!-- Links to other cards -->
					{#if card.links && card.links.length > 0}
						<nav class="card-links" aria-label="Related cards">
							<span class="links-label">Related:</span>
							{#each card.links as linkId (linkId)}
								<button
									type="button"
									class="link-pill"
									onclick={(e) => handleLinkClick(e, linkId)}
								>
									{linkId}
								</button>
							{/each}
						</nav>
					{/if}

					<!-- Dive in button for cards with children -->
					{#if hasChildren}
						<button
							type="button"
							class="dive-in-btn"
							onclick={handleDiveIn}
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M12 5v14M5 12l7 7 7-7" />
							</svg>
							Explore nested content
						</button>
					{/if}
				</div>
			{:else}
				<!-- Collapsed view - summary -->
				<p class="card-summary">{card.summary}</p>
			{/if}
		</div>

		<!-- Expand/collapse indicator -->
		<div class="card-expand-indicator">
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				class:rotated={isExpanded}
			>
				<path d="M6 9l6 6 6-6" />
			</svg>
		</div>
	</div>
{/if}

<style>
	/* Dot representation for very low zoom */
	.card-dot {
		position: absolute;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--ec-primary, #3b82f6);
		transform: translate(-50%, -50%);
		transition: transform 0.2s ease;
		cursor: pointer;
	}

	.card-dot:hover,
	.card-dot.active {
		transform: translate(-50%, -50%) scale(1.5);
		background: var(--ec-primary, #2563eb);
	}

	/* Card container */
	.explainer-card {
		position: absolute;
		background: var(--ec-bg-card, #ffffff);
		border: 1px solid var(--ec-border, #e0e0e0);
		border-radius: var(--ec-radius, 12px);
		box-shadow: var(--ec-shadow, 0 4px 12px rgba(0, 0, 0, 0.1));
		cursor: pointer;
		transition:
			box-shadow 0.2s ease,
			border-color 0.2s ease,
			width 0.3s ease;
		display: flex;
		flex-direction: column;
		min-height: 160px; /* DEFAULT_CARD_HEIGHT from geometry.ts */
		overflow: hidden;
	}

	.explainer-card:hover {
		border-color: var(--ec-primary, #3b82f6);
		box-shadow: var(--ec-shadow, 0 8px 24px rgba(0, 0, 0, 0.15));
	}

	.explainer-card:focus {
		outline: none;
		border-color: var(--ec-primary, #3b82f6);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
	}

	.explainer-card.active {
		border-color: var(--ec-primary, #3b82f6);
		box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
	}

	.explainer-card.expanded {
		z-index: 10;
		max-height: 500px;
		overflow-y: auto;
	}

	/* Card header - sticky when expanded */
	.card-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1rem 0.5rem;
		border-bottom: 1px solid var(--ec-border, #e8e8e8);
		background: var(--ec-bg, #fafafa);
		position: sticky;
		top: 0;
		z-index: 1;
	}

	/* Drag handle for repositioning cards */
	.drag-handle {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		border: none;
		background: transparent;
		color: var(--ec-text-muted, #999);
		cursor: grab;
		border-radius: 4px;
		transition: all 0.15s ease;
		flex-shrink: 0;
		position: relative;
	}

	/* Fast CSS tooltip for drag handle */
	.drag-handle[data-tooltip]::after {
		content: attr(data-tooltip);
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%) translateY(-4px);
		margin-top: 6px;
		padding: 0.375rem 0.5rem;
		font-size: 0.6875rem;
		font-weight: 500;
		color: white;
		background: var(--ec-text, #1a1a1a);
		border-radius: 4px;
		white-space: nowrap;
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
		z-index: 100;
		pointer-events: none;
	}

	.drag-handle[data-tooltip]:hover::after {
		opacity: 1;
		visibility: visible;
		transform: translateX(-50%) translateY(0);
	}

	.drag-handle:hover {
		background: var(--ec-border, #e8e8e8);
		color: var(--ec-text, #1a1a1a);
	}

	.drag-handle:active,
	.explainer-card.dragging .drag-handle {
		cursor: grabbing;
		background: var(--ec-primary, #3b82f6);
		color: white;
	}

	.explainer-card.dragging {
		cursor: grabbing;
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
		z-index: 100;
	}

	.card-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--ec-text, #1a1a1a);
		line-height: 1.3;
		flex: 1;
		min-width: 0;
	}

	.children-indicator {
		display: flex;
		align-items: center;
		color: var(--ec-text-muted, #666);
		opacity: 0.7;
		position: relative;
		cursor: help;
	}

	/* Fast CSS tooltip - no delay */
	.children-indicator[data-tooltip]::after {
		content: attr(data-tooltip);
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 6px;
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 500;
		line-height: 1.4;
		color: white;
		background: var(--ec-text, #1a1a1a);
		border-radius: 6px;
		white-space: nowrap;
		opacity: 0;
		visibility: hidden;
		transform: translateY(-4px);
		transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
		z-index: 100;
		pointer-events: none;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.children-indicator[data-tooltip]:hover::after {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
	}

	/* Card body */
	.card-body {
		padding: 0.75rem 1rem;
		flex: 1;
	}

	.card-summary {
		margin: 0;
		font-size: 0.875rem;
		color: var(--ec-text-muted, #666);
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Expanded content */
	.card-expanded {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Links section */
	.card-links {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--ec-border, #e8e8e8);
	}

	.links-label {
		font-size: 0.75rem;
		color: var(--ec-text-muted, #666);
		font-weight: 500;
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
		transition: all 0.2s ease;
	}

	.link-pill:hover {
		background: rgba(59, 130, 246, 0.2);
		border-color: var(--ec-primary, #3b82f6);
	}

	/* Dive in button */
	.dive-in-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.625rem 1rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--ec-primary, #3b82f6);
		background: rgba(59, 130, 246, 0.08);
		border: 1px dashed rgba(59, 130, 246, 0.4);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.dive-in-btn:hover {
		background: rgba(59, 130, 246, 0.15);
		border-style: solid;
	}

	/* Expand indicator */
	.card-expand-indicator {
		display: flex;
		justify-content: center;
		padding: 0.375rem;
		color: var(--ec-text-muted, #999);
		transition: color 0.2s ease;
	}

	.explainer-card:hover .card-expand-indicator {
		color: var(--ec-primary, #3b82f6);
	}

	.card-expand-indicator svg {
		transition: transform 0.2s ease;
	}

	.card-expand-indicator svg.rotated {
		transform: rotate(180deg);
	}
</style>

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
