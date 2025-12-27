<!--
	============================================================
	ExplainerCanvas
	============================================================

	🎯 WHAT IT DOES
	An interactive knowledge visualization canvas with zoomable, pannable cards
	that can contain nested hierarchies, linked content, and fuzzy search.

	✨ FEATURES
	• Pan and zoom: Mouse drag, scroll wheel, and touch gestures
	• Expandable cards: Click to reveal detailed markdown content
	• Nested hierarchies: Dive into cards containing sub-canvases
	• Connection lines: Visual links between related cards (bezier/straight/orthogonal)
	• Fuzzy search: Find cards by title, summary, or content (Fuse.js)
	• Breadcrumb navigation: Track and navigate through nested levels
	• Tooltips: Hover definitions for technical terms
	• Mobile responsive: Simplified accordion view on small screens
	• Data loading: Direct data, JSON URL, or async loader function

	♿ ACCESSIBILITY
	• Keyboard: Tab to navigate cards, Enter to expand, Escape to close
	• Keyboard: Ctrl/Cmd+F for search, +/- for zoom
	• Screen readers: ARIA labels on all interactive elements
	• Motion: Respects prefers-reduced-motion for animations

	📦 DEPENDENCIES
	External libraries (justified):
	• @panzoom/panzoom - Complex touch/mouse canvas navigation
	• marked + highlight.js - Markdown rendering with code highlighting
	• fuse.js - Fast fuzzy search across nested content
	• isomorphic-dompurify - Security-critical XSS sanitization

	⚡ PERFORMANCE
	• Suitable for: Canvases with up to 100+ cards across hierarchy
	• Virtual scrolling for large search results
	• Lazy loading of nested content

	🎨 USAGE
	<ExplainerCanvas data={canvasData} />
	<ExplainerCanvas src="/data/canvas.json" />
	<ExplainerCanvas loader={async () => fetchData()} />

	📋 PROPS
	| Prop          | Type                        | Default    | Description                    |
	|---------------|------------------------------|------------|--------------------------------|
	| data          | ExplainerCanvasData          | -          | Direct data object             |
	| src           | string                       | -          | URL to JSON file               |
	| loader        | () => Promise<CanvasData>    | -          | Async loader function          |
	| initialCardId | string                       | -          | Override defaultCardId         |
	| lineStyle     | 'bezier'|'straight'|'ortho'  | 'bezier'   | Connection line style          |
	| class         | string                       | ''         | Additional CSS classes         |
	| onNavigate    | (id, path) => void           | -          | Card navigation callback       |
	| onExpand      | (id) => void                 | -          | Card expand callback           |
	| onCollapse    | (id) => void                 | -          | Card collapse callback         |
	| onSearch      | (query, results) => void     | -          | Search callback                |

	⚠️ KNOWN WARNINGS (Safe to ignore)
	• a11y_mouse_events_have_key_events: Canvas mouseover requires keyboard fallback
	  - Reason: Tooltip triggers use mouseover; keyboard accessible via focus events
	  - Impact: None - focus events provide same functionality for keyboard users

	============================================================

	CR Tag: This component orchestrates a complex interactive canvas system.
	The architecture separates concerns across 10 sub-components and 4 utility
	modules. Data flows down from props, state is managed via Svelte 5 runes,
	and callbacks bubble events back to parent components.

	Key patterns:
	• Factory pattern in utils/loader.ts for flexible data loading
	• Recursive structures for nested card hierarchies
	• Event delegation for tooltip handling (single listener, multiple triggers)
	• Path-based navigation for breadcrumbs and search results

	============================================================

	NTL Tag: Picture a digital corkboard where you've pinned index cards about
	different topics. Each card can be clicked to show more details, and some
	cards have links to other cards. The clever bit? Some cards are like folders
	- click "dive in" and you zoom into a whole new corkboard hidden inside!

	The search is fuzzy (like Google) so typing "react" finds "reactivity".
	On phones it becomes a simple list because tiny fingers + tiny cards = chaos.

	============================================================
-->
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

	/**
	 * Handle home button - reset to clean initial state
	 */
	function handleHome() {
		// Collapse any expanded card
		expandedCardId = null;
		hoveredCardId = null;

		// Navigate to root level
		currentPath = [];

		// Reset viewport to fit all cards
		if (viewportRef && canvasData) {
			setTimeout(() => {
				const cards = canvasData!.cards;
				if (cards.length > 0) {
					const bounds = getBoundingBox(cards.map((c: ExplainerCard) => c.position));
					const zoom = calculateFitZoom(bounds, containerRef?.clientWidth ?? 800, containerRef?.clientHeight ?? 600);
					const translation = calculateCenterTranslation(bounds, containerRef?.clientWidth ?? 800, containerRef?.clientHeight ?? 600, zoom);
					viewportRef?.zoomTo(Math.min(1, zoom), true);
					viewportRef?.panTo(translation.x, translation.y, true);
				}
			}, 50);
		}
	}

	/**
	 * Handle card position change (from dragging)
	 */
	function handleCardPositionChange(cardId: string, newPosition: { x: number; y: number }) {
		// Update the card's position in current cards
		const card = currentCards.find((c: ExplainerCard) => c.id === cardId);
		if (card) {
			card.position.x = newPosition.x;
			card.position.y = newPosition.y;
		}
	}

	/**
	 * Get names of child cards for tooltip
	 */
	function getChildrenNames(card: ExplainerCard): string[] {
		return card.children?.map((c: ExplainerCard) => c.title) ?? [];
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
	onfocusin={handleTooltipShow}
	onfocusout={handleTooltipHide}
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
				onHome={handleHome}
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
							childrenNames={getChildrenNames(card)}
							zoom={viewport.zoom}
							onExpand={() => handleCardExpand(card.id)}
							onCollapse={handleCardCollapse}
							onDiveIn={() => handleDiveIn(card.id)}
							onLinkClick={handleLinkClick}
							onHover={() => (hoveredCardId = card.id)}
							onHoverEnd={() => (hoveredCardId = null)}
							onPositionChange={(newPos) => handleCardPositionChange(card.id, newPos)}
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
