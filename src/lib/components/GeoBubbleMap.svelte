<script lang="ts">
	/**
	 * GeoBubbleMap Component
	 *
	 * SVG-based bubble map using LayerChart for geographic point data visualization.
	 * Displays sized circles at geographic coordinates based on data values.
	 *
	 * Features:
	 * - Bubble size proportional to data values (area scaling)
	 * - Optional background geography (country/region outlines)
	 * - Interactive hover tooltips
	 * - Click handlers for point selection
	 * - Optional labels on bubbles
	 * - Category-based coloring
	 *
	 * Dependencies: layerchart, d3-geo, d3-scale
	 *
	 * Usage:
	 * ```svelte
	 * <GeoBubbleMap
	 *   geojson={ukOutline}
	 *   data={cityPopulations}
	 *   height={500}
	 *   minRadius={4}
	 *   maxRadius={40}
	 *   onBubbleClick={(point) => console.log(point)}
	 * />
	 * ```
	 *
	 * @component
	 */

	import { Chart, GeoContext, GeoPath, GeoPoint, Svg, Circle, Text } from 'layerchart';
	import { geoMercator } from 'd3-geo';
	import { scaleSqrt } from 'd3-scale';
	import type { GeoDataPoint } from '$lib/types';

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
			<GeoContext projection={geoMercator} fitGeojson={fitGeojson()}>
				<!-- Background geography if provided -->
				{#if geojson}
					{#each bgFeatures as feature}
						<GeoPath
							geojson={feature}
							fill="#e5e7eb"
							stroke="#d1d5db"
							strokeWidth={0.5}
							class="background"
						/>
					{/each}
				{/if}

				<!-- Bubbles -->
				{#each sortedData as point (point.id)}
					<GeoPoint lat={point.lat} long={point.long}>
						{#snippet children({ x, y }: { x: number; y: number })}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<g
								class="bubble-group"
								onpointermove={(e: PointerEvent) => handleMouseMove(e, point)}
								onpointerleave={handleMouseLeave}
								onclick={() => handleClick(point)}
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
									<Text
										x={x}
										y={y}
										textAnchor="middle"
										dy="0.35em"
										fill="white"
										fontSize={10}
										fontWeight={600}
										class="bubble-label"
									>
										{point.name}
									</Text>
								{/if}
							</g>
						{/snippet}
					</GeoPoint>
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
	.geo-bubble-map {
		position: relative;
		width: 100%;
		background: #f9fafb;
		border-radius: 8px;
		overflow: hidden;
	}

	.geo-bubble-map :global(.background) {
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
		background: rgba(0, 0, 0, 0.85);
		color: white;
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
		color: #9ca3af;
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
		background: white;
		padding: 10px 14px;
		border-radius: 6px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.legend-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: #374151;
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
		color: #6b7280;
	}
</style>
