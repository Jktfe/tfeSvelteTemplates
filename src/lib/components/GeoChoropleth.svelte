<script lang="ts">
	/**
	 * GeoChoropleth Component
	 *
	 * SVG-based choropleth map using LayerChart for geographic data visualization.
	 * Displays regions colored by data values with interactive tooltips.
	 *
	 * Features:
	 * - Automatic color scaling based on data values
	 * - Interactive hover tooltips showing region details
	 * - Click handlers for region selection
	 * - Configurable color scales (sequential, diverging)
	 * - Automatic projection fitting to container
	 * - Legend display with value labels
	 *
	 * Dependencies: layerchart, d3-geo, d3-scale
	 *
	 * Usage:
	 * ```svelte
	 * <GeoChoropleth
	 *   geojson={ukRegionsGeoJSON}
	 *   data={regionData}
	 *   height={500}
	 *   onRegionClick={(region) => console.log(region)}
	 * />
	 * ```
	 *
	 * @component
	 */

	import { Chart, GeoContext, GeoPath, Svg } from 'layerchart';
	import { geoMercator } from 'd3-geo';
	import { scaleSequential, scaleLinear } from 'd3-scale';
	import { interpolateBlues, interpolateOrRd } from 'd3-scale-chromatic';
	import type { GeoRegionProperties, GeoRegionData, GeoColorScale } from '$lib/types';
	import { GEO_COLOR_SCALES } from '$lib/constants';

	// Props interface inline to avoid import issues
	interface Props {
		geojson: GeoJSON.FeatureCollection;
		data?: GeoRegionData[];
		colorScale?: GeoColorScale;
		height?: number;
		showLegend?: boolean;
		showTooltip?: boolean;
		strokeColor?: string;
		strokeWidth?: number;
		onRegionClick?: (region: GeoRegionProperties) => void;
		onRegionHover?: (region: GeoRegionProperties | null) => void;
		class?: string;
	}

	let {
		geojson,
		data = [],
		colorScale = { type: 'sequential', colors: [...GEO_COLOR_SCALES.blues] },
		height = 500,
		showLegend = true,
		showTooltip = true,
		strokeColor = '#ffffff',
		strokeWidth = 1,
		onRegionClick,
		onRegionHover,
		class: className = ''
	}: Props = $props();

	// Hovered region for tooltip
	let hoveredRegion = $state<GeoRegionProperties | null>(null);
	let tooltipX = $state(0);
	let tooltipY = $state(0);

	// Create a lookup map from regionId to value
	const dataLookup = $derived(() => {
		const map = new Map<string, GeoRegionData>();
		data.forEach((d) => map.set(d.regionId, d));
		return map;
	});

	// Calculate min/max values for color scale
	const valueDomain = $derived(() => {
		if (colorScale.domain) return colorScale.domain;
		const values = data.map((d) => d.value);
		if (values.length === 0) return [0, 100] as [number, number];
		return [Math.min(...values), Math.max(...values)] as [number, number];
	});

	// Create color scale function
	const getColor = $derived(() => {
		const [min, max] = valueDomain();
		if (colorScale.type === 'sequential') {
			// Check if using default blue scale
			const isBlueScale = colorScale.colors.length === GEO_COLOR_SCALES.blues.length &&
				colorScale.colors[0] === GEO_COLOR_SCALES.blues[0];
			const isOrangeScale = colorScale.colors.length === GEO_COLOR_SCALES.orangeRed.length &&
				colorScale.colors[0] === GEO_COLOR_SCALES.orangeRed[0];

			if (isBlueScale) {
				return scaleSequential(interpolateBlues).domain([min, max]);
			}
			if (isOrangeScale) {
				return scaleSequential(interpolateOrRd).domain([min, max]);
			}
			// Custom color array - create multi-step domain to use ALL colors
			const colors = colorScale.colors;
			const step = (max - min) / (colors.length - 1);
			const domain = colors.map((_, i) => min + step * i);
			return scaleLinear<string>()
				.domain(domain)
				.range([...colors]);
		}
		// Diverging scale - create multi-step domain using all colors
		const colors = colorScale.colors;
		const step = (max - min) / (colors.length - 1);
		const domain = colors.map((_, i) => min + step * i);
		return scaleLinear<string>()
			.domain(domain)
			.range([...colors]);
	});

	/**
	 * Get fill color for a feature based on its data value
	 */
	function getFeatureColor(feature: GeoJSON.Feature): string {
		const props = feature.properties as Record<string, unknown>;
		const regionId = (props?.RGN24CD || props?.id || feature.id) as string;
		const regionData = dataLookup().get(regionId);
		if (regionData) {
			return getColor()(regionData.value) as string;
		}
		return '#e5e7eb'; // Default gray for regions without data
	}

	/**
	 * Get region properties for tooltip/click handlers
	 */
	function getRegionProps(feature: GeoJSON.Feature): GeoRegionProperties {
		const props = feature.properties as Record<string, unknown>;
		const regionId = (props?.RGN24CD || props?.id || feature.id) as string;
		const regionData = dataLookup().get(regionId);
		return {
			id: regionId,
			name: (props?.RGN24NM || props?.name || 'Unknown') as string,
			value: regionData?.value,
			label: regionData?.label || (props?.RGN24NM || props?.name) as string
		};
	}

	/**
	 * Handle mouse move for tooltip positioning
	 */
	function handleMouseMove(e: PointerEvent, feature: GeoJSON.Feature): void {
		if (showTooltip) {
			hoveredRegion = getRegionProps(feature);
			tooltipX = e.clientX;
			tooltipY = e.clientY;
			onRegionHover?.(hoveredRegion);
		}
	}

	/**
	 * Handle mouse leave
	 */
	function handleMouseLeave(): void {
		hoveredRegion = null;
		onRegionHover?.(null);
	}

	/**
	 * Handle region click
	 */
	function handleClick(feature: GeoJSON.Feature): void {
		onRegionClick?.(getRegionProps(feature));
	}

	// Legend items for display
	const legendItems = $derived(() => {
		const [min, max] = valueDomain();
		const steps = 5;
		const items: { value: number; color: string; label: string }[] = [];
		for (let i = 0; i <= steps; i++) {
			const value = min + (max - min) * (i / steps);
			items.push({
				value,
				color: getColor()(value) as string,
				label: value.toFixed(1)
			});
		}
		return items;
	});

	// Features array for iteration
	const features = $derived(geojson?.features || []);
</script>

<div class="geo-choropleth {className}" style="height: {height}px;">
	<Chart data={features}>
		<Svg>
			<GeoContext projection={geoMercator} fitGeojson={geojson}>
				{#each features as feature (feature.id || feature.properties?.RGN24CD)}
					<GeoPath
						geojson={feature}
						fill={getFeatureColor(feature)}
						stroke={strokeColor}
						strokeWidth={strokeWidth}
						class="region"
						onpointermove={(e: PointerEvent) => handleMouseMove(e, feature)}
						onpointerleave={handleMouseLeave}
						onclick={() => handleClick(feature)}
					/>
				{/each}
			</GeoContext>
		</Svg>
	</Chart>

	{#if showTooltip && hoveredRegion}
		<div
			class="tooltip"
			style="left: {tooltipX + 12}px; top: {tooltipY - 12}px;"
		>
			<div class="tooltip-title">{hoveredRegion.name}</div>
			{#if hoveredRegion.value !== undefined}
				<div class="tooltip-value">
					{hoveredRegion.label || hoveredRegion.value.toLocaleString('en-GB')}
				</div>
			{/if}
		</div>
	{/if}

	{#if showLegend && data.length > 0}
		<div class="legend">
			<div class="legend-gradient">
				{#each legendItems() as item}
					<div
						class="legend-color"
						style="background-color: {item.color}"
					></div>
				{/each}
			</div>
			<div class="legend-labels">
				<span>{valueDomain()[0].toFixed(1)}</span>
				<span>{valueDomain()[1].toFixed(1)}</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.geo-choropleth {
		position: relative;
		width: 100%;
		background: #f9fafb;
		border-radius: 8px;
		overflow: hidden;
	}

	.geo-choropleth :global(.region) {
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.geo-choropleth :global(.region:hover) {
		opacity: 0.8;
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

	.legend {
		position: absolute;
		bottom: 16px;
		right: 16px;
		background: white;
		padding: 8px 12px;
		border-radius: 6px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.legend-gradient {
		display: flex;
		height: 12px;
		border-radius: 2px;
		overflow: hidden;
		margin-bottom: 4px;
	}

	.legend-color {
		flex: 1;
	}

	.legend-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: #6b7280;
	}
</style>
