<script lang="ts">
	/**
	 * Canvas Viewport Component
	 *
	 * Handles pan (drag) and zoom (scroll/pinch) for the canvas content.
	 * Uses @panzoom/panzoom for smooth transformations.
	 *
	 * @component
	 */

	import { onMount, onDestroy, type Snippet } from 'svelte';
	import Panzoom from '@panzoom/panzoom';
	import type { ExplainerViewport, CanvasBackground, ExplainerPosition } from '$lib/types';
	import { DEFAULT_CARD_WIDTH, DEFAULT_CARD_HEIGHT } from './utils/geometry';

	interface Props {
		viewport?: ExplainerViewport;
		background?: CanvasBackground;
		minZoom?: number;
		maxZoom?: number;
		children?: Snippet;
		onViewportChange?: (viewport: ExplainerViewport) => void;
	}

	let {
		viewport = { x: 0, y: 0, zoom: 1 },
		background = { type: 'dots' },
		minZoom = 0.1,
		maxZoom = 2,
		children,
		onViewportChange
	}: Props = $props();

	let containerRef: HTMLDivElement | undefined = $state();
	let contentRef: HTMLDivElement | undefined = $state();
	let panzoomInstance: ReturnType<typeof Panzoom> | null = null;

	// Track if we should skip viewport sync (during programmatic updates)
	let skipViewportSync = false;

	/**
	 * Generate background style based on configuration
	 */
	function getBackgroundStyle(bg: CanvasBackground): string {
		switch (bg.type) {
			case 'dots': {
				const color = bg.color || 'rgba(0, 0, 0, 0.1)';
				const size = bg.size || 2;
				const gap = bg.gap || 24;
				return `
					background-image: radial-gradient(circle, ${color} ${size}px, transparent ${size}px);
					background-size: ${gap}px ${gap}px;
				`;
			}
			case 'grid': {
				const color = bg.color || 'rgba(0, 0, 0, 0.1)';
				const size = bg.size || 24;
				return `
					background-image:
						linear-gradient(${color} 1px, transparent 1px),
						linear-gradient(90deg, ${color} 1px, transparent 1px);
					background-size: ${size}px ${size}px;
				`;
			}
			case 'custom':
				return bg.css;
			case 'none':
			default:
				return '';
		}
	}

	let backgroundStyle = $derived(getBackgroundStyle(background));

	/**
	 * Sync panzoom position from viewport prop
	 */
	function syncFromViewport() {
		if (!panzoomInstance || skipViewportSync) return;

		const currentPan = panzoomInstance.getPan();
		const currentScale = panzoomInstance.getScale();

		// Only update if values are significantly different
		if (
			Math.abs(currentPan.x - viewport.x) > 1 ||
			Math.abs(currentPan.y - viewport.y) > 1 ||
			Math.abs(currentScale - viewport.zoom) > 0.01
		) {
			skipViewportSync = true;
			panzoomInstance.zoom(viewport.zoom, { animate: false });
			panzoomInstance.pan(viewport.x, viewport.y, { animate: false });
			setTimeout(() => {
				skipViewportSync = false;
			}, 0);
		}
	}

	/**
	 * Handle panzoom events
	 */
	function handlePanzoomChange(e: Event) {
		if (skipViewportSync || !panzoomInstance) return;

		const pan = panzoomInstance.getPan();
		const scale = panzoomInstance.getScale();

		onViewportChange?.({
			x: pan.x,
			y: pan.y,
			zoom: scale
		});
	}

	/**
	 * Handle wheel events for zoom (only when Shift is held)
	 * Without Shift, normal scroll is allowed for page navigation
	 */
	function handleWheel(e: WheelEvent) {
		if (!panzoomInstance) return;
		// Only zoom when Shift is held, otherwise allow normal scroll
		if (e.shiftKey) {
			panzoomInstance.zoomWithWheel(e);
		}
	}

	onMount(() => {
		if (!contentRef) return;

		// Initialize panzoom
		panzoomInstance = Panzoom(contentRef, {
			minScale: minZoom,
			maxScale: maxZoom,
			startX: viewport.x,
			startY: viewport.y,
			startScale: viewport.zoom,
			cursor: 'grab',
			panOnlyWhenZoomed: false,
			animate: true,
			duration: 200,
			easing: 'ease-out'
		});

		// Listen for panzoom events
		contentRef.addEventListener('panzoomchange', handlePanzoomChange);
		contentRef.addEventListener('panzoomend', handlePanzoomChange);

		// Enable Shift+scroll wheel zoom (normal scroll allowed for navigation)
		containerRef?.addEventListener('wheel', handleWheel);
	});

	onDestroy(() => {
		// Clean up wheel event listener
		containerRef?.removeEventListener('wheel', handleWheel);
		// Clean up panzoom events
		if (contentRef) {
			contentRef.removeEventListener('panzoomchange', handlePanzoomChange);
			contentRef.removeEventListener('panzoomend', handlePanzoomChange);
		}
		panzoomInstance?.destroy();
	});

	// Sync when viewport prop changes
	$effect(() => {
		// Access viewport to track it
		const _ = viewport;
		syncFromViewport();
	});

	/**
	 * Programmatic zoom controls (called from parent)
	 */
	export function zoomIn() {
		panzoomInstance?.zoomIn();
	}

	export function zoomOut() {
		panzoomInstance?.zoomOut();
	}

	export function zoomToFit() {
		panzoomInstance?.reset();
	}

	export function panTo(x: number, y: number, animate = true) {
		panzoomInstance?.pan(x, y, { animate });
	}

	export function zoomTo(scale: number, animate = true) {
		panzoomInstance?.zoom(scale, { animate });
	}

	/**
	 * Pan and zoom to center a specific position
	 */
	export function centerOn(position: ExplainerPosition, scale?: number) {
		if (!containerRef || !panzoomInstance) return;

		const containerRect = containerRef.getBoundingClientRect();
		const currentScale = scale ?? panzoomInstance.getScale();

		// Calculate pan to center the position (offset by half card dimensions)
		const cardCenterOffsetX = (DEFAULT_CARD_WIDTH / 2) * currentScale;
		const cardCenterOffsetY = (DEFAULT_CARD_HEIGHT / 2) * currentScale;
		const targetX = containerRect.width / 2 - position.x * currentScale - cardCenterOffsetX;
		const targetY = containerRect.height / 2 - position.y * currentScale - cardCenterOffsetY;

		skipViewportSync = true;
		if (scale) {
			panzoomInstance.zoom(scale, { animate: true });
		}
		setTimeout(() => {
			panzoomInstance?.pan(targetX, targetY, { animate: true });
			setTimeout(() => {
				skipViewportSync = false;
			}, 250);
		}, scale ? 150 : 0);
	}
</script>

<div
	bind:this={containerRef}
	class="canvas-viewport"
	style={backgroundStyle}
>
	<div
		bind:this={contentRef}
		class="canvas-content"
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>

<style>
	.canvas-viewport {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background-color: var(--ec-bg, #f9fafb);
		cursor: grab;
	}

	.canvas-viewport:active {
		cursor: grabbing;
	}

	.canvas-content {
		position: relative;
		width: 100%;
		height: 100%;
		transform-origin: 0 0;
	}
</style>

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
