<script lang="ts">
	/**
	 * GeoSpikeMap Component
	 *
	 * SVG-based spike map using LayerChart for geographic point data visualization.
	 * Displays vertical spikes at geographic coordinates with height based on data values.
	 * Creates a dramatic 3D-like effect ideal for showing density or magnitude.
	 *
	 * Features:
	 * - Spike height proportional to data values
	 * - Optional background geography (country/region outlines)
	 * - Interactive hover tooltips
	 * - Click handlers for spike selection
	 * - Customizable spike width and color
	 * - Gradient fills for 3D effect
	 *
	 * Dependencies: layerchart, d3-geo, d3-scale
	 *
	 * Usage:
	 * ```svelte
	 * <GeoSpikeMap
	 *   geojson={ukOutline}
	 *   data={cityPopulations}
	 *   height={500}
	 *   minSpikeHeight={5}
	 *   maxSpikeHeight={80}
	 *   onSpikeClick={(point) => console.log(point)}
	 * />
	 * ```
	 *
	 * @component
	 */

	import { Chart, GeoContext, GeoPath, GeoPoint, Svg } from 'layerchart';
	import { geoMercator } from 'd3-geo';
	import { scaleLinear } from 'd3-scale';
	import type { GeoDataPoint } from '$lib/types';

	// Props interface
	interface Props {
		geojson?: GeoJSON.FeatureCollection;
		data: GeoDataPoint[];
		height?: number;
		minSpikeHeight?: number;
		maxSpikeHeight?: number;
		spikeWidth?: number;
		spikeColor?: string;
		showTooltip?: boolean;
		onSpikeClick?: (point: GeoDataPoint) => void;
		class?: string;
	}

	let {
		geojson,
		data,
		height = 500,
		minSpikeHeight = 5,
		maxSpikeHeight = 80,
		spikeWidth = 3,
		spikeColor = '#ef4444',
		showTooltip = true,
		onSpikeClick,
		class: className = ''
	}: Props = $props();

	// Hovered point for tooltip
	let hoveredPoint = $state<GeoDataPoint | null>(null);
	let tooltipX = $state(0);
	let tooltipY = $state(0);

	// Calculate value domain for height scaling
	const valueDomain = $derived(() => {
		const values = data.map((d) => d.value);
		if (values.length === 0) return [0, 100] as [number, number];
		return [Math.min(...values), Math.max(...values)] as [number, number];
	});

	// Create height scale
	const heightScale = $derived(() => {
		return scaleLinear()
			.domain(valueDomain())
			.range([minSpikeHeight, maxSpikeHeight]);
	});

	/**
	 * Get spike height for a data point
	 */
	function getSpikeHeight(point: GeoDataPoint): number {
		return heightScale()(point.value);
	}

	/**
	 * Get fill color for a data point
	 */
	function getColor(point: GeoDataPoint): string {
		return point.color || spikeColor;
	}

	/**
	 * Generate spike path (triangle pointing up)
	 * Origin at bottom center, spike points upward
	 */
	function getSpikePath(spikeHeight: number): string {
		const halfWidth = spikeWidth / 2;
		return `M 0,0 L ${-halfWidth},0 L 0,${-spikeHeight} L ${halfWidth},0 Z`;
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
	 * Handle spike click
	 */
	function handleClick(point: GeoDataPoint): void {
		onSpikeClick?.(point);
	}

	// Sort data by latitude (northernmost first) for proper overlap rendering
	const sortedData = $derived(
		[...data].sort((a, b) => b.lat - a.lat)
	);

	// Create fit geometry
	const fitGeojson = $derived((): GeoJSON.FeatureCollection | undefined => {
		if (geojson) return geojson;
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

	// Unique ID for gradients
	const gradientId = `spike-gradient-${Math.random().toString(36).slice(2, 9)}`;

	// Background features
	const bgFeatures = $derived(geojson?.features || []);
</script>

<div class="geo-spike-map {className}" style="height: {height}px;">
	<Chart data={sortedData}>
		<Svg>
			<!-- Gradient definition for 3D effect -->
			<defs>
				<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" stop-color={spikeColor} stop-opacity="0.4" />
					<stop offset="50%" stop-color={spikeColor} stop-opacity="1" />
					<stop offset="100%" stop-color={spikeColor} stop-opacity="0.6" />
				</linearGradient>
			</defs>

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

				<!-- Spikes -->
				{#each sortedData as point (point.id)}
					<GeoPoint lat={point.lat} long={point.long}>
						{#snippet children({ x, y }: { x: number; y: number })}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<g
								class="spike-group"
								transform="translate({x}, {y})"
								onpointermove={(e: PointerEvent) => handleMouseMove(e, point)}
								onpointerleave={handleMouseLeave}
								onclick={() => handleClick(point)}
							>
								<!-- Shadow/base -->
								<ellipse
									cx="0"
									cy="0"
									rx={spikeWidth + 1}
									ry={spikeWidth / 3}
									fill="rgba(0,0,0,0.2)"
									class="spike-shadow"
								/>
								<!-- Spike triangle -->
								<path
									d={getSpikePath(getSpikeHeight(point))}
									fill="url(#{gradientId})"
									stroke={getColor(point)}
									stroke-width="0.5"
									class="spike"
								/>
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

	<!-- Height legend -->
	<div class="height-legend">
		<div class="legend-title">Height by Value</div>
		<div class="legend-spikes">
			<div class="legend-item">
				<svg width={spikeWidth * 2 + 4} height={minSpikeHeight + 4}>
					<path
						d={getSpikePath(minSpikeHeight)}
						transform="translate({spikeWidth + 2}, {minSpikeHeight + 2})"
						fill={spikeColor}
					/>
				</svg>
				<span>{valueDomain()[0].toLocaleString('en-GB')}</span>
			</div>
			<div class="legend-item">
				<svg width={spikeWidth * 2 + 4} height={maxSpikeHeight + 4}>
					<path
						d={getSpikePath(maxSpikeHeight)}
						transform="translate({spikeWidth + 2}, {maxSpikeHeight + 2})"
						fill={spikeColor}
					/>
				</svg>
				<span>{valueDomain()[1].toLocaleString('en-GB')}</span>
			</div>
		</div>
	</div>
</div>

<style>
	.geo-spike-map {
		position: relative;
		width: 100%;
		background: #f9fafb;
		border-radius: 8px;
		overflow: hidden;
	}

	.geo-spike-map :global(.background) {
		pointer-events: none;
	}

	.geo-spike-map :global(.spike-group) {
		cursor: pointer;
	}

	.geo-spike-map :global(.spike) {
		transition: opacity 0.15s ease;
	}

	.geo-spike-map :global(.spike-group:hover .spike) {
		opacity: 0.85;
		filter: brightness(1.1);
	}

	.geo-spike-map :global(.spike-shadow) {
		pointer-events: none;
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
		color: #f87171;
		font-size: 0.75rem;
		margin-top: 2px;
		text-transform: capitalize;
	}

	.height-legend {
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

	.legend-spikes {
		display: flex;
		align-items: flex-end;
		gap: 20px;
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
