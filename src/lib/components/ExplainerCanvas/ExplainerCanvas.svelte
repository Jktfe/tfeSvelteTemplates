<script lang="ts">
	/**
	 * ExplainerCanvas Component
	 *
	 * A data-driven, interactive knowledge visualization component.
	 * Content is organised as cards on a zoomable, pannable canvas.
	 * Cards can contain nested sub-canvases, creating a hierarchical structure.
	 *
	 * Features:
	 * - Pan and zoom canvas (mouse and touch)
	 * - Click cards to expand/collapse
	 * - Navigate between linked cards with smooth animations
	 * - Dive into nested sub-canvases
	 * - Breadcrumb navigation
	 * - Fuzzy search across all cards
	 * - Responsive: simplified mobile view
	 * - Accessible: keyboard navigation, screen reader support
	 * - Respects prefers-reduced-motion
	 *
	 * Usage:
	 * ```svelte
	 * <ExplainerCanvas data={canvasData} />
	 * <ExplainerCanvas src="/data/canvas.json" />
	 * <ExplainerCanvas loader={async () => fetchData()} />
	 * ```
	 *
	 * @component
	 */

	import { onMount } from 'svelte';
	import type {
		ExplainerCanvasProps,
		ExplainerCanvasData,
		ExplainerCard,
		ExplainerViewport,
		ExplainerSearchResult,
		ConnectionLineStyle,
		CanvasBackground
	} from '$lib/types';

	import CanvasViewport from './CanvasViewport.svelte';
	import CanvasControls from './CanvasControls.svelte';
	import Card from './Card.svelte';
	import ConnectionLines from './ConnectionLines.svelte';
	import SearchPanel from './SearchPanel.svelte';
	import TooltipPortal from './TooltipPortal.svelte';
	import MobileView from './MobileView.svelte';

	import { resolveCanvasData, DataLoadError } from './utils/loader';
	import { createSearchIndex, searchCards, findCardById, buildBreadcrumbPath, getCardsAtPath } from './utils/search';
	import { getBoundingBox, calculateFitZoom, calculateCenterTranslation } from './utils/geometry';
	import type Fuse from 'fuse.js';

	let {
		data,
		src,
		loader,
		initialCardId,
		lazyLoadDepth = 2,
		class: className = '',
		lineStyle: propLineStyle,
		onNavigate,
		onExpand,
		onCollapse,
		onSearch
	}: ExplainerCanvasProps = $props();

	// Component state
	let canvasData = $state<ExplainerCanvasData | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Navigation state
	let currentPath = $state<string[]>([]);
	let expandedCardId = $state<string | null>(null);
	let hoveredCardId = $state<string | null>(null);

	// Viewport state
	let viewport = $state<ExplainerViewport>({ x: 0, y: 0, zoom: 1 });
	let viewportRef: CanvasViewport | undefined = $state();

	// Search state
	let searchOpen = $state(false);
	let searchQuery = $state('');
	let searchResults = $state<ExplainerSearchResult[]>([]);
	let searchIndex: Fuse<ExplainerCard> | null = null;

	// Tooltip state
	let tooltipVisible = $state(false);
	let tooltipContent = $state('');
	let tooltipX = $state(0);
	let tooltipY = $state(0);

	// Responsive: detect mobile
	let isMobile = $state(false);
	let containerRef: HTMLDivElement | undefined = $state();

	// Derived: effective configuration
	let effectiveLineStyle = $derived<ConnectionLineStyle>(
		propLineStyle ?? canvasData?.config?.lineStyle ?? 'bezier'
	);

	let effectiveBackground = $derived<CanvasBackground>(
		canvasData?.config?.background ?? { type: 'dots' }
	);

	let effectiveMaxZoomIn = $derived(canvasData?.config?.maxZoomIn ?? 2);
	let effectiveMaxZoomOut = $derived(canvasData?.config?.maxZoomOut ?? 0.1);
	let searchEnabled = $derived(canvasData?.config?.enableSearch !== false);

	// Derived: current level cards
	let currentCards = $derived.by(() => {
		if (!canvasData) return [];
		if (currentPath.length === 0) return canvasData.cards;
		return getCardsAtPath(canvasData.cards, currentPath) ?? [];
	});

	// Derived: breadcrumb path with titles
	let breadcrumbItems = $derived.by(() => {
		if (!canvasData) return [];
		return buildBreadcrumbPath(canvasData.cards, currentPath);
	});

	/**
	 * Load canvas data on mount
	 */
	onMount(async () => {
		// Check for mobile
		checkMobile();
		window.addEventListener('resize', checkMobile);

		// Load data
		try {
			canvasData = await resolveCanvasData({ data, src, loader });

			// Build search index
			searchIndex = createSearchIndex(canvasData.cards);

			// Navigate to initial card
			const startCardId = initialCardId ?? canvasData.defaultCardId;
			if (startCardId) {
				navigateToCard(startCardId, false);
			}

			loading = false;
		} catch (err) {
			loading = false;
			error = err instanceof DataLoadError
				? err.message
				: 'Failed to load canvas data';
			console.error('[ExplainerCanvas]', err);
		}

		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	});

	/**
	 * Check if viewport is mobile-sized
	 */
	function checkMobile() {
		isMobile = window.innerWidth < 768;
	}

	/**
	 * Navigate to a specific card
	 */
	function navigateToCard(cardId: string, animate = true) {
		if (!canvasData) return;

		const found = findCardById(canvasData.cards, cardId);
		if (!found) return;

		const { card, path } = found;

		// If card is in a nested level, update path
		if (path.length > 1) {
			// Navigate to the parent level of the card
			currentPath = path.slice(0, -1);
		} else {
			currentPath = [];
		}

		// Expand the card
		expandedCardId = cardId;

		// Pan to the card
		if (viewportRef && animate) {
			viewportRef.centerOn(card.position, 1);
		}

		onNavigate?.(cardId, path);
		onExpand?.(cardId);
	}

	/**
	 * Handle card expand
	 */
	function handleCardExpand(cardId: string) {
		expandedCardId = cardId;

		// Find card and center on it
		const card = currentCards.find((c: ExplainerCard) => c.id === cardId);
		if (card && viewportRef) {
			viewportRef.centerOn(card.position);
		}

		onExpand?.(cardId);
	}

	/**
	 * Handle card collapse
	 */
	function handleCardCollapse() {
		if (expandedCardId) {
			onCollapse?.(expandedCardId);
		}
		expandedCardId = null;
	}

	/**
	 * Handle diving into a card's children (nested canvas)
	 */
	function handleDiveIn(cardId: string) {
		currentPath = [...currentPath, cardId];
		expandedCardId = null;

		// Reset viewport for new level
		if (viewportRef) {
			setTimeout(() => {
				if (currentCards.length > 0) {
					const bounds = getBoundingBox(currentCards.map((c: ExplainerCard) => c.position));
					const zoom = calculateFitZoom(bounds, containerRef?.clientWidth ?? 800, containerRef?.clientHeight ?? 600);
					const translation = calculateCenterTranslation(bounds, containerRef?.clientWidth ?? 800, containerRef?.clientHeight ?? 600, zoom);
					viewportRef?.zoomTo(Math.min(1, zoom), false);
					viewportRef?.panTo(translation.x, translation.y, false);
				}
			}, 50);
		}
	}

	/**
	 * Handle link click (navigate to linked card)
	 */
	function handleLinkClick(linkId: string) {
		// Find the linked card in current level
		const targetCard = currentCards.find((c: ExplainerCard) => c.id === linkId);

		if (targetCard) {
			// Same level - just expand and pan
			expandedCardId = linkId;
			if (viewportRef) {
				viewportRef.centerOn(targetCard.position);
			}
			onNavigate?.(linkId, [...currentPath, linkId]);
		} else {
			// Different level - use full navigation
			navigateToCard(linkId);
		}
	}

	/**
	 * Handle breadcrumb navigation
	 */
	function handleBreadcrumbNavigate(targetId: string | null) {
		if (targetId === null) {
			// Navigate to root
			currentPath = [];
		} else {
			// Navigate to specific level
			const index = currentPath.indexOf(targetId);
			if (index >= 0) {
				currentPath = currentPath.slice(0, index + 1);
			}
		}
		expandedCardId = null;
	}

	/**
	 * Handle zoom controls
	 */
	function handleZoomIn() {
		viewportRef?.zoomIn();
	}

	function handleZoomOut() {
		viewportRef?.zoomOut();
	}

	function handleZoomReset() {
		viewportRef?.zoomToFit();
	}

	/**
	 * Handle search
	 */
	function handleSearchOpen() {
		searchOpen = true;
		searchQuery = '';
		searchResults = [];
	}

	function handleSearchClose() {
		searchOpen = false;
		searchQuery = '';
		searchResults = [];
	}

	function handleSearchQuery(query: string) {
		searchQuery = query;
		if (searchIndex && canvasData) {
			searchResults = searchCards(searchIndex, query, canvasData.cards);
			onSearch?.(query, searchResults.map(r => r.card));
		}
	}

	function handleSearchResultSelect(result: ExplainerSearchResult) {
		searchOpen = false;
		navigateToCard(result.card.id);
	}

	/**
	 * Handle keyboard shortcuts
	 */
	function handleKeydown(e: KeyboardEvent) {
		// Ctrl/Cmd + F: Open search
		if ((e.ctrlKey || e.metaKey) && e.key === 'f' && searchEnabled) {
			e.preventDefault();
			handleSearchOpen();
		}

		// Escape: Close expanded card or search
		if (e.key === 'Escape') {
			if (searchOpen) {
				handleSearchClose();
			} else if (expandedCardId) {
				handleCardCollapse();
			}
		}

		// +/-: Zoom
		if (e.key === '+' || e.key === '=') {
			handleZoomIn();
		} else if (e.key === '-') {
			handleZoomOut();
		}
	}

	/**
	 * Handle viewport change
	 */
	function handleViewportChange(newViewport: ExplainerViewport) {
		viewport = newViewport;
	}

	/**
	 * Handle tooltip show (from card content hover or focus)
	 */
	function handleTooltipShow(e: MouseEvent | FocusEvent) {
		const target = e.target as HTMLElement;
		if (target.classList.contains('ec-tooltip-trigger')) {
			const definition = target.dataset.definition;
			if (definition) {
				tooltipContent = definition;
				// Use element position for focus events, mouse position for mouse events
				if ('clientX' in e) {
					tooltipX = e.clientX;
					tooltipY = e.clientY;
				} else {
					const rect = target.getBoundingClientRect();
					tooltipX = rect.left + rect.width / 2;
					tooltipY = rect.top;
				}
				tooltipVisible = true;
			}
		}
	}

	function handleTooltipHide() {
		tooltipVisible = false;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<div
	bind:this={containerRef}
	class="explainer-canvas {className}"
	role="application"
	aria-label="Interactive knowledge canvas"
	onmouseover={handleTooltipShow}
	onmouseout={handleTooltipHide}
	onfocus={handleTooltipShow}
	onblur={handleTooltipHide}
>
	{#if loading}
		<!-- Loading state -->
		<div class="canvas-loading">
			<div class="loading-spinner"></div>
			<p class="loading-text">Loading canvas...</p>
		</div>
	{:else if error}
		<!-- Error state -->
		<div class="canvas-error" role="alert">
			<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="8" x2="12" y2="12" />
				<line x1="12" y1="16" x2="12.01" y2="16" />
			</svg>
			<p class="error-text">{error}</p>
		</div>
	{:else if canvasData}
		{#if isMobile}
			<!-- Mobile simplified view -->
			<MobileView
				cards={currentCards}
				canvasTitle={canvasData.title}
				breadcrumbPath={breadcrumbItems}
				{expandedCardId}
				onCardExpand={handleCardExpand}
				onCardCollapse={handleCardCollapse}
				onLinkClick={handleLinkClick}
				onDiveIn={handleDiveIn}
				onBreadcrumbNavigate={handleBreadcrumbNavigate}
			/>
		{:else}
			<!-- Desktop canvas view -->
			<CanvasControls
				canvasTitle={canvasData.title}
				breadcrumbPath={breadcrumbItems}
				zoom={viewport.zoom}
				minZoom={effectiveMaxZoomOut}
				maxZoom={effectiveMaxZoomIn}
				{searchEnabled}
				onZoomIn={handleZoomIn}
				onZoomOut={handleZoomOut}
				onZoomReset={handleZoomReset}
				onSearchOpen={handleSearchOpen}
				onBreadcrumbNavigate={handleBreadcrumbNavigate}
			/>

			{#if searchOpen}
				<SearchPanel
					isOpen={searchOpen}
					query={searchQuery}
					results={searchResults}
					onQueryChange={handleSearchQuery}
					onResultSelect={handleSearchResultSelect}
					onClose={handleSearchClose}
				/>
			{/if}

			<div class="canvas-body">
				<CanvasViewport
					bind:this={viewportRef}
					{viewport}
					background={effectiveBackground}
					minZoom={effectiveMaxZoomOut}
					maxZoom={effectiveMaxZoomIn}
					onViewportChange={handleViewportChange}
				>
					<!-- Connection lines layer -->
					<ConnectionLines
						cards={currentCards}
						lineStyle={effectiveLineStyle}
						activeCardId={expandedCardId}
						hoveredCardId={hoveredCardId}
					/>

					<!-- Cards layer -->
					{#each currentCards as card (card.id)}
						<Card
							{card}
							isExpanded={expandedCardId === card.id}
							isActive={expandedCardId === card.id || hoveredCardId === card.id}
							hasChildren={(card.children?.length ?? 0) > 0}
							zoom={viewport.zoom}
							onExpand={() => handleCardExpand(card.id)}
							onCollapse={handleCardCollapse}
							onDiveIn={() => handleDiveIn(card.id)}
							onLinkClick={handleLinkClick}
						/>
					{/each}
				</CanvasViewport>
			</div>

			<!-- Tooltip portal -->
			<TooltipPortal
				content={tooltipContent}
				x={tooltipX}
				y={tooltipY}
				visible={tooltipVisible}
			/>
		{/if}
	{/if}
</div>

<style>
	.explainer-canvas {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 400px;
		display: flex;
		flex-direction: column;
		background: var(--ec-bg, #f9fafb);
		border-radius: var(--ec-radius, 12px);
		overflow: hidden;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
	}

	.canvas-body {
		flex: 1;
		position: relative;
		overflow: hidden;
		/* Account for controls bar height */
		margin-top: 56px;
	}

	/* Loading state */
	.canvas-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 1rem;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--ec-border, #e0e0e0);
		border-top-color: var(--ec-primary, #3b82f6);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		margin: 0;
		font-size: 0.9375rem;
		color: var(--ec-text-muted, #666);
	}

	/* Error state */
	.canvas-error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 1rem;
		padding: 2rem;
		text-align: center;
		color: var(--ec-text-muted, #666);
	}

	.error-text {
		margin: 0;
		font-size: 0.9375rem;
		max-width: 400px;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.loading-spinner {
			animation-duration: 1.5s;
		}
	}
</style>
