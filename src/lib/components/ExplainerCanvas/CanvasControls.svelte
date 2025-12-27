<script lang="ts">
	/**
	 * Canvas Controls Component
	 *
	 * Fixed overlay UI containing zoom controls, search, and breadcrumbs.
	 *
	 * @component
	 */

	import Breadcrumbs from './Breadcrumbs.svelte';

	interface BreadcrumbItem {
		id: string;
		title: string;
	}

	interface Props {
		canvasTitle: string;
		breadcrumbPath?: BreadcrumbItem[];
		zoom?: number;
		minZoom?: number;
		maxZoom?: number;
		searchEnabled?: boolean;
		onZoomIn?: () => void;
		onZoomOut?: () => void;
		onZoomReset?: () => void;
		onSearchOpen?: () => void;
		onBreadcrumbNavigate?: (id: string | null) => void;
		onHome?: () => void;
	}

	let {
		canvasTitle,
		breadcrumbPath = [],
		zoom = 1,
		minZoom = 0.1,
		maxZoom = 2,
		searchEnabled = true,
		onZoomIn,
		onZoomOut,
		onZoomReset,
		onSearchOpen,
		onBreadcrumbNavigate,
		onHome
	}: Props = $props();

	// Format zoom percentage for display
	let zoomPercent = $derived(Math.round(zoom * 100));

	// Check if zoom limits are reached
	let canZoomIn = $derived(zoom < maxZoom);
	let canZoomOut = $derived(zoom > minZoom);
</script>

<div class="canvas-controls">
	<!-- Left: Breadcrumbs -->
	<div class="controls-left">
		<Breadcrumbs
			path={breadcrumbPath}
			{canvasTitle}
			onNavigate={onBreadcrumbNavigate}
		/>
	</div>

	<!-- Right: Zoom and Search controls -->
	<div class="controls-right">
		<!-- Home button -->
		<button
			type="button"
			class="control-btn home-btn"
			onclick={() => onHome?.()}
			aria-label="Reset to home view"
			title="Reset to home view"
		>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
				<polyline points="9 22 9 12 15 12 15 22" />
			</svg>
		</button>

		<!-- Search button -->
		{#if searchEnabled}
			<button
				type="button"
				class="control-btn search-btn"
				onclick={() => onSearchOpen?.()}
				aria-label="Search cards (Ctrl+F)"
				title="Search cards (Ctrl+F)"
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
			</button>
		{/if}

		<!-- Zoom controls -->
		<div class="zoom-controls">
			<button
				type="button"
				class="control-btn zoom-btn"
				onclick={() => onZoomOut?.()}
				disabled={!canZoomOut}
				aria-label="Zoom out"
				title="Zoom out"
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="5" y1="12" x2="19" y2="12" />
				</svg>
			</button>

			<button
				type="button"
				class="zoom-display"
				onclick={() => onZoomReset?.()}
				title="Reset zoom"
				aria-label="Zoom: {zoomPercent}%. Click to reset"
			>
				{zoomPercent}%
			</button>

			<button
				type="button"
				class="control-btn zoom-btn"
				onclick={() => onZoomIn?.()}
				disabled={!canZoomIn}
				aria-label="Zoom in"
				title="Zoom in"
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="12" y1="5" x2="12" y2="19" />
					<line x1="5" y1="12" x2="19" y2="12" />
				</svg>
			</button>
		</div>
	</div>
</div>

<style>
	.canvas-controls {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: var(--ec-bg-card, #ffffff);
		border-bottom: 1px solid var(--ec-border, #e0e0e0);
		z-index: 50;
	}

	.controls-left {
		flex: 1;
		min-width: 0;
	}

	.controls-right {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	.control-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		color: var(--ec-text-muted, #666);
		background: var(--ec-bg, #f5f5f5);
		border: 1px solid var(--ec-border, #e0e0e0);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.control-btn:hover:not(:disabled) {
		color: var(--ec-text, #1a1a1a);
		background: var(--ec-bg-card, #ffffff);
		border-color: var(--ec-primary, #3b82f6);
	}

	.control-btn:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
	}

	.control-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.home-btn {
		margin-right: 0.25rem;
	}

	.search-btn {
		margin-right: 0.5rem;
	}

	.zoom-controls {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem;
		background: var(--ec-bg, #f5f5f5);
		border: 1px solid var(--ec-border, #e0e0e0);
		border-radius: 10px;
	}

	.zoom-controls .zoom-btn {
		width: 32px;
		height: 32px;
		background: transparent;
		border: none;
	}

	.zoom-controls .zoom-btn:hover:not(:disabled) {
		background: var(--ec-bg-card, #ffffff);
		border: none;
	}

	.zoom-display {
		min-width: 50px;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--ec-text, #1a1a1a);
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: center;
		transition: all 0.15s ease;
	}

	.zoom-display:hover {
		color: var(--ec-primary, #3b82f6);
	}

	.zoom-display:focus {
		outline: none;
		background: rgba(59, 130, 246, 0.1);
		border-radius: 4px;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.canvas-controls {
			padding: 0.5rem 0.75rem;
		}

		.control-btn {
			width: 32px;
			height: 32px;
		}

		.zoom-display {
			min-width: 40px;
			font-size: 0.6875rem;
		}
	}
</style>
