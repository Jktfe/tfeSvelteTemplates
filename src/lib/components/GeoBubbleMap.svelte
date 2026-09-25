<!--
  ============================================================
  GeoBubbleMap.svelte - Geographic Bubble Visualization
  ============================================================

  [CR] WHAT IT DOES
  SVG-based bubble map using LayerChart for geographic point data visualization.
  Uses square root scaling for perceptually accurate bubble areas - larger values
  appear proportionally larger, not exponentially. Renders largest bubbles first
  so smaller ones stay visible on top.

  [NTL] THE SIMPLE VERSION
  Think of this as putting circles on a map where bigger circles mean bigger
  numbers! Great for showing city populations, store locations with sales data,
  or anything where you want to compare values at different places. Hover over
  a bubble to see the exact value.

  FEATURES
  • Bubble size proportional to data values (square root area scaling)
  • Optional background geography (country/region outlines)
  • Interactive hover tooltips with value display
  • Click handlers for point selection
  • Optional labels on large bubbles
  • Category-based coloring
  • Size legend showing min/max values

  USAGE
  <GeoBubbleMap
    geojson={ukOutline}
    data={cityPopulations}
    height={500}
    minRadius={4}
    maxRadius={40}
    onBubbleClick={(point) => console.log(point)}
  />

  DEPENDENCIES
  • layerchart - SVG charting library with geo support
  • d3-geo - Geographic projections (Mercator)
  • d3-scale - Square root scaling for bubble sizes

  THEMING (see docs/THEMING.md)
  Chrome flips under prefers-color-scheme: dark via --geo-* tokens on
  .geo-bubble-map (surface, land fill/stroke, legend, tooltip). The
  bubbleColor / bubbleStroke props and per-point colours are data, so
  they stay the same on both schemes.

  ============================================================
-->
<script lang="ts">
	/**
	 * @component GeoBubbleMap
	 */

	import { Chart, GeoContext, GeoPath, Svg, Circle } from 'layerchart';
	import { geoMercator } from 'd3-geo';
	import { scaleSqrt } from 'd3-scale';
	import type { GeoDataPoint } from '$lib/types';
	import type { GeoJSON } from 'geojson';

	// Props interface
	interface Props {
		geojson?: GeoJSON.FeatureCollection;
		data: GeoDataPoint[];
		height?: number;
		minRadius?: number;
		maxRadius?: number;
		bubbleColor?: string;
		bubbleStroke?: string;
		showLabels?: boolean;
		showTooltip?: boolean;
		onBubbleClick?: (point: GeoDataPoint) => void;
		class?: string;
	}

	let {
		geojson,
		data,
		height = 500,
		minRadius = 4,
		maxRadius = 40,
		bubbleColor = 'rgba(59, 130, 246, 0.6)',
		bubbleStroke = '#ffffff',
		showLabels = false,
		showTooltip = true,
		onBubbleClick,
		class: className = ''
	}: Props = $props();

	// Hovered point for tooltip
	let hoveredPoint = $state<GeoDataPoint | null>(null);
	let tooltipX = $state(0);
	let tooltipY = $state(0);

	// Calculate value domain for radius scaling
	const valueDomain = $derived(() => {
		const values = data.map((d) => d.value);
		if (values.length === 0) return [0, 100] as [number, number];
		return [Math.min(...values), Math.max(...values)] as [number, number];
	});

	// Create radius scale (square root for perceptually accurate area scaling)
	const radiusScale = $derived(() => {
		return scaleSqrt()
			.domain(valueDomain())
			.range([minRadius, maxRadius]);
	});

	/**
	 * Get radius for a data point
	 */
	function getRadius(point: GeoDataPoint): number {
		return radiusScale()(point.value);
	}

	/**
	 * Get fill color for a data point
	 */
	function getColor(point: GeoDataPoint): string {
		return point.color || bubbleColor;
	}

	/**
	 * Handle mouse move for tooltip positioning
	 */
	function handleMouseMove(e: PointerEvent, point: GeoDataPoint): void {
		if (showTooltip) {
			hoveredPoint = point;
			tooltipX = e.clientX;
			tooltipY = e.clientY;
		}
	}

	/**
	 * Keyboard focus shows the same tooltip as hover, anchored to the element
	 * itself since there is no pointer position to follow.
	 */
	function handleFocus(e: FocusEvent, point: GeoDataPoint): void {
		if (!showTooltip) return;
		const rect = (e.currentTarget as Element).getBoundingClientRect();
		hoveredPoint = point;
		tooltipX = rect.left + rect.width / 2;
		tooltipY = rect.top;
	}

	/**
	 * Handle mouse leave
	 */
	function handleMouseLeave(): void {
		hoveredPoint = null;
	}

	/**
	 * Handle point click
	 */
	function handleClick(point: GeoDataPoint): void {
		onBubbleClick?.(point);
	}

	// Sort data by value (largest first) so smaller bubbles render on top
	const sortedData = $derived(
		[...data].sort((a, b) => b.value - a.value)
	);

	// Create fit geometry combining geojson and point bounds
	const fitGeojson = $derived((): GeoJSON.FeatureCollection | undefined => {
		if (geojson) return geojson;
		// Create a bounding box from points if no geojson
		if (data.length === 0) return undefined;
		const longs = data.map((d) => d.long);
		const lats = data.map((d) => d.lat);
		return {
			type: 'FeatureCollection',
			features: [{
				type: 'Feature',
				geometry: {
					type: 'Polygon',
					coordinates: [[
						[Math.min(...longs) - 1, Math.min(...lats) - 1],
						[Math.max(...longs) + 1, Math.min(...lats) - 1],
						[Math.max(...longs) + 1, Math.max(...lats) + 1],
						[Math.min(...longs) - 1, Math.max(...lats) + 1],
						[Math.min(...longs) - 1, Math.min(...lats) - 1]
					]]
				},
				properties: {}
			}]
		};
	});

	// Background features
	const bgFeatures = $derived(geojson?.features || []);
</script>

<div class="geo-bubble-map {className}" style="height: {height}px;">
	<Chart data={sortedData}>
		<Svg>
			<!-- [CR] Using let:projection to access the projection function directly -->
			<!-- [NTL] Think of the projection like a translator that converts real-world coordinates (lat/long) into pixel positions on our screen! -->
			<GeoContext projection={geoMercator} fitGeojson={fitGeojson()} let:projection>
				<!-- Background geography if provided -->
				{#if geojson}
					{#each bgFeatures as feature, i (feature.id ?? feature.properties?.id ?? i)}
						<GeoPath
							geojson={feature}
							fill="#e5e7eb"
							stroke="#d1d5db"
							strokeWidth={0.5}
							class="background"
						/>
					{/each}
				{/if}

				<!-- Bubbles - using projection directly instead of GeoPoint -->
				<!-- [CR] Project each point's coordinates using the context's projection function -->
				{#each sortedData as point (point.id)}
					{@const projected = projection?.([point.long, point.lat])}
					{@const x = projected?.[0] ?? 0}
					{@const y = projected?.[1] ?? 0}
					<g
						class="bubble-group"
						role="button"
						tabindex="0"
						aria-label={`${point.name}: ${point.value}`}
						onpointermove={(e: PointerEvent) => handleMouseMove(e, point)}
						onpointerleave={handleMouseLeave}
						onfocus={(e: FocusEvent) => handleFocus(e, point)}
						onblur={handleMouseLeave}
						onclick={() => handleClick(point)}
						onkeydown={(e: KeyboardEvent) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								handleClick(point);
							}
						}}
					>
						<Circle
							cx={x}
							cy={y}
							r={getRadius(point)}
							fill={getColor(point)}
							stroke={bubbleStroke}
							strokeWidth={1.5}
							class="bubble"
						/>
						{#if showLabels && getRadius(point) > 15}
							<!-- [CR] Using native SVG text instead of LayerChart Text for reliable rendering -->
							<text
								x={x}
								y={y}
								text-anchor="middle"
								dominant-baseline="central"
								fill="white"
								font-size="10"
								font-weight="600"
								class="bubble-label"
							>
								{point.name}
							</text>
						{/if}
					</g>
				{/each}
			</GeoContext>
		</Svg>
	</Chart>

	{#if showTooltip && hoveredPoint}
		<div
			class="tooltip"
			style="left: {tooltipX + 12}px; top: {tooltipY - 12}px;"
		>
			<div class="tooltip-title">{hoveredPoint.name}</div>
			<div class="tooltip-value">
				{hoveredPoint.value.toLocaleString('en-GB')}
			</div>
			{#if hoveredPoint.category}
				<div class="tooltip-category">{hoveredPoint.category}</div>
			{/if}
		</div>
	{/if}

	<!-- Size legend -->
	<div class="size-legend">
		<div class="legend-title">Size by Value</div>
		<div class="legend-circles">
			<div class="legend-item">
				<svg width={minRadius * 2 + 4} height={minRadius * 2 + 4}>
					<circle
						cx={minRadius + 2}
						cy={minRadius + 2}
						r={minRadius}
						fill={bubbleColor}
						stroke={bubbleStroke}
						stroke-width="1"
					/>
				</svg>
				<span>{valueDomain()[0].toLocaleString('en-GB')}</span>
			</div>
			<div class="legend-item">
				<svg width={maxRadius * 2 + 4} height={maxRadius * 2 + 4}>
					<circle
						cx={maxRadius + 2}
						cy={maxRadius + 2}
						r={maxRadius}
						fill={bubbleColor}
						stroke={bubbleStroke}
						stroke-width="1"
					/>
				</svg>
				<span>{valueDomain()[1].toLocaleString('en-GB')}</span>
			</div>
		</div>
	</div>
</div>

<style>
	/*
	 * THEMING — chrome flips, brand stays (see docs/THEMING.md).
	 * Surface, land, legend and tooltip chrome are tokens with light
	 * defaults inline; the dark block below flips only those. The data
	 * colour props stay scheme-independent because they carry meaning.
	 */
	.geo-bubble-map {
		--geo-surface: #f9fafb;
		--geo-land-fill: #e5e7eb;
		--geo-land-stroke: #d1d5db;
		--geo-legend-bg: #ffffff;
		--geo-legend-fg: #374151;
		--geo-legend-muted: #6b7280;
		--geo-legend-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		--geo-tooltip-bg: rgba(0, 0, 0, 0.85);
		--geo-tooltip-fg: #ffffff;
		--geo-tooltip-muted: #9ca3af;
		--geo-tooltip-border: transparent;
	}

	@media (prefers-color-scheme: dark) {
		.geo-bubble-map {
			--geo-surface: #111827;
			--geo-land-fill: #374151;
			--geo-land-stroke: #4b5563;
			--geo-legend-bg: #1f2937;
			--geo-legend-fg: #e5e7eb;
			--geo-legend-muted: #9ca3af;
			--geo-legend-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
			--geo-tooltip-bg: rgba(3, 7, 18, 0.92);
			--geo-tooltip-border: rgba(255, 255, 255, 0.14);
		}
	}

	.geo-bubble-map {
		position: relative;
		width: 100%;
		background: var(--geo-surface);
		border-radius: 8px;
		overflow: hidden;
	}

	.geo-bubble-map :global(.background) {
		/* CSS beats the SVG presentation attributes, so the land flips with the scheme. */
		fill: var(--geo-land-fill);
		stroke: var(--geo-land-stroke);
		pointer-events: none;
	}

	.geo-bubble-map :global(.bubble-group) {
		cursor: pointer;
	}

	.geo-bubble-map :global(.bubble) {
		transition: opacity 0.15s ease, transform 0.15s ease;
	}

	.geo-bubble-map :global(.bubble-group:hover .bubble) {
		opacity: 0.9;
	}

	.geo-bubble-map :global(.bubble-label) {
		pointer-events: none;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.tooltip {
		position: fixed;
		z-index: 1000;
		pointer-events: none;
		background: var(--geo-tooltip-bg);
		color: var(--geo-tooltip-fg);
		border: 1px solid var(--geo-tooltip-border);
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 0.875rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		max-width: 200px;
	}

	.tooltip-title {
		font-weight: 600;
		margin-bottom: 2px;
	}

	.tooltip-value {
		color: var(--geo-tooltip-muted);
		font-size: 0.8125rem;
	}

	.tooltip-category {
		color: #60a5fa;
		font-size: 0.75rem;
		margin-top: 2px;
		text-transform: capitalize;
	}

	.size-legend {
		position: absolute;
		bottom: 16px;
		left: 16px;
		background: var(--geo-legend-bg);
		padding: 10px 14px;
		border-radius: 6px;
		box-shadow: var(--geo-legend-shadow);
	}

	.legend-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--geo-legend-fg);
		margin-bottom: 8px;
	}

	.legend-circles {
		display: flex;
		align-items: flex-end;
		gap: 16px;
	}

	.legend-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.legend-item span {
		font-size: 0.6875rem;
		color: var(--geo-legend-muted);
	}

	/* Keyboard users get a visible ring on the focused marker group */
	.geo-bubble-map :global(.bubble-group:focus) {
		outline: none;
	}

	.geo-bubble-map :global(.bubble-group:focus-visible) {
		outline: 2px solid #146ef5;
		outline-offset: 2px;
	}

	/* Hover feedback is instant for users who have asked for reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.geo-bubble-map :global(.bubble) {
			transition: none;
		}
	}
</style>

<!-- [CR] Component uses LayerChart + d3-geo (justified dependencies for geo viz). -->
