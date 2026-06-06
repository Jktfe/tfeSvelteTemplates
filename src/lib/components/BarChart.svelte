<!--
  ===========================================================
  BAR CHART
  ===========================================================
  WHAT — A dependency-free SVG bar chart that renders grouped or stacked
         series with a value axis, gridlines, category labels and an
         interactive hover tooltip.

  FEATURES
    • Grouped mode (bars sit side-by-side) or stacked mode (bars sum vertically)
    • Auto-computed "nice" Y axis with evenly spaced gridlines
    • Optional value labels drawn above each bar / segment
    • One colour per series, with a legend
    • Hover (and keyboard focus) highlight plus a positioned tooltip
    • Bars animate their height on mount, honouring reduced-motion
    • Accessible data-table fallback exposed to assistive technology

  ACCESSIBILITY
    • The chart container is role="img" with a generated summary label
    • A visually-hidden <table> mirrors every value for screen readers
    • Each bar is focusable (tabindex=0) with an aria-label and a focus ring;
      arrow-free Tab navigation walks the bars in reading order
    • Tooltip content is announced via aria-live="polite"
    • Bar-grow animation is disabled under prefers-reduced-motion: reduce

  DEPENDENCIES — Zero external dependencies. Pure Svelte 5 + inline SVG + scoped CSS.

  USAGE
    <script lang="ts">
      import BarChart from '$lib/components/BarChart.svelte';
      const categories = [
        { label: 'Q1', values: [120, 80] },
        { label: 'Q2', values: [150, 110] }
      ];
      const series = [
        { name: 'Online', colour: '#6366f1' },
        { name: 'Retail', colour: '#10b981' }
      ];
    </script>
    <BarChart {categories} {series} mode="grouped" showValueLabels />

  PROPS
    | Prop            | Type                       | Default     | Description                              |
    | --------------- | -------------------------- | ----------- | ---------------------------------------- |
    | categories      | BarCategory[]              | []          | Each category + its per-series values    |
    | series          | BarSeries[]                | []          | Series metadata (name + colour)          |
    | mode            | 'grouped' \| 'stacked'     | 'grouped'   | Bar layout strategy                      |
    | showValueLabels | boolean                    | false       | Draw numeric labels above bars           |
    | showLegend      | boolean                    | true        | Show the series legend                   |
    | height          | number                     | 320         | SVG height in px (width is responsive)   |
    | yTickCount      | number                     | 5           | Target number of Y gridlines             |
    | valueFormat     | (n: number) => string      | String      | Formatter for axis + labels + tooltip    |
    | title           | string                     | 'Bar chart' | Accessible name / table caption          |
  ===========================================================
-->
<script module lang="ts">
	/** A single series: its display name and the colour used for its bars. */
	export interface BarSeries {
		name: string;
		colour: string;
	}

	/** A category (one X-axis group) holding one value per series, in series order. */
	export interface BarCategory {
		label: string;
		values: number[];
	}

	/**
	 * Compute a "nice" axis maximum and a matching tick step for a given raw
	 * maximum. We round the step up to the nearest 1/2/5 × 10ⁿ so gridlines land
	 * on human-friendly numbers (10, 25, 500…) rather than 13.7 or 412.
	 * Pure + exported so the test suite can assert the maths directly.
	 */
	export function niceScale(
		rawMax: number,
		tickCount: number
	): { max: number; step: number; ticks: number[] } {
		if (rawMax <= 0 || !Number.isFinite(rawMax)) {
			return { max: 1, step: 1, ticks: [0, 1] };
		}
		const safeTicks = Math.max(2, Math.floor(tickCount));
		const roughStep = rawMax / safeTicks;
		const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
		const normalised = roughStep / magnitude;
		let niceFactor: number;
		if (normalised <= 1) niceFactor = 1;
		else if (normalised <= 2) niceFactor = 2;
		else if (normalised <= 5) niceFactor = 5;
		else niceFactor = 10;
		const step = niceFactor * magnitude;
		const max = Math.ceil(rawMax / step) * step;
		const ticks: number[] = [];
		for (let t = 0; t <= max + step / 2; t += step) {
			ticks.push(Math.round(t * 1e6) / 1e6);
		}
		return { max, step, ticks };
	}

	/**
	 * The raw maximum a chart must accommodate: in stacked mode it's the tallest
	 * category total, in grouped mode it's the single largest value anywhere.
	 */
	export function computeRawMax(categories: BarCategory[], mode: 'grouped' | 'stacked'): number {
		let max = 0;
		for (const category of categories) {
			if (mode === 'stacked') {
				const total = category.values.reduce((sum, v) => sum + Math.max(0, v), 0);
				if (total > max) max = total;
			} else {
				for (const v of category.values) {
					if (v > max) max = v;
				}
			}
		}
		return max;
	}
</script>

<script lang="ts">
	interface Props {
		categories?: BarCategory[];
		series?: BarSeries[];
		mode?: 'grouped' | 'stacked';
		showValueLabels?: boolean;
		showLegend?: boolean;
		height?: number;
		yTickCount?: number;
		valueFormat?: (n: number) => string;
		title?: string;
	}

	let {
		categories = [],
		series = [],
		mode = 'grouped',
		showValueLabels = false,
		showLegend = true,
		height = 320,
		yTickCount = 5,
		valueFormat = (n: number) => String(n),
		title = 'Bar chart'
	}: Props = $props();

	// The SVG uses a fixed internal viewBox width; CSS scales it to the container,
	// so the chart stays crisp and responsive without measuring the DOM.
	const VIEW_W = 720;
	const PAD = { top: 24, right: 16, bottom: 48, left: 56 };

	const innerW = $derived(VIEW_W - PAD.left - PAD.right);
	const innerH = $derived(height - PAD.top - PAD.bottom);

	const rawMax = $derived(computeRawMax(categories, mode));
	const scale = $derived(niceScale(rawMax, yTickCount));

	// Convert a data value into a pixel height within the plot area.
	const valueToHeight = (v: number) => (scale.max <= 0 ? 0 : (Math.max(0, v) / scale.max) * innerH);
	// Y pixel coordinate (top-left origin) for a value sitting at the axis baseline.
	const valueToY = (v: number) => PAD.top + innerH - valueToHeight(v);

	// Even category slots across the plot, with a little breathing room each side.
	const slotW = $derived(categories.length > 0 ? innerW / categories.length : innerW);
	const groupPad = $derived(slotW * 0.18); // gap between categories
	const bandW = $derived(slotW - groupPad); // usable width inside one category
	// In grouped mode each series gets its own slice of the band.
	const groupedBarW = $derived(series.length > 0 ? (bandW / series.length) * 0.82 : bandW);
	const groupedBarGap = $derived(series.length > 0 ? (bandW / series.length) * 0.18 : 0);

	// Hover / focus state drives the highlight + tooltip.
	interface ActiveBar {
		categoryIndex: number;
		seriesIndex: number;
		value: number;
		x: number; // tooltip anchor (px, viewBox space)
		y: number;
	}
	let activeBar = $state<ActiveBar | null>(null);

	// Animate bars in on mount. We start at "ungrown" and flip a flag after the
	// first paint so the CSS transition runs. Reduced-motion skips straight to grown.
	let grown = $state(false);
	$effect(() => {
		const reduce =
			typeof window !== 'undefined' &&
			window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		if (reduce) {
			grown = true;
			return;
		}
		const id = requestAnimationFrame(() => {
			grown = true;
		});
		return () => cancelAnimationFrame(id);
	});

	const tooltipLabel = $derived(
		activeBar
			? `${categories[activeBar.categoryIndex]?.label ?? ''} · ${
					series[activeBar.seriesIndex]?.name ?? ''
				}: ${valueFormat(activeBar.value)}`
			: ''
	);

	const ariaSummary = $derived(
		`${title}: ${mode} bar chart with ${categories.length} categories and ${series.length} series.`
	);

	/** Horizontal start (left edge) of a category band. */
	const bandX = (categoryIndex: number) => PAD.left + categoryIndex * slotW + groupPad / 2;

	function setActive(categoryIndex: number, seriesIndex: number, value: number, x: number, y: number) {
		activeBar = { categoryIndex, seriesIndex, value, x, y };
	}
	function clearActive() {
		activeBar = null;
	}
	function isActive(categoryIndex: number, seriesIndex: number) {
		return (
			activeBar?.categoryIndex === categoryIndex && activeBar?.seriesIndex === seriesIndex
		);
	}
</script>

<figure
	class="bar-chart"
	style="--chart-h:{height}px"
	role="group"
	aria-label={ariaSummary}
>
	{#if showLegend && series.length > 0}
		<ul class="legend" aria-hidden="true">
			{#each series as s (s.name)}
				<li class="legend-item">
					<span class="legend-swatch" style="background:{s.colour}"></span>
					<span class="legend-label">{s.name}</span>
				</li>
			{/each}
		</ul>
	{/if}

	<div class="plot-wrap">
		<svg
			class="plot"
			viewBox="0 0 {VIEW_W} {height}"
			preserveAspectRatio="xMidYMid meet"
			role="img"
			aria-label={ariaSummary}
		>
			<!-- Gridlines + Y axis ticks -->
			<g class="grid" aria-hidden="true">
				{#each scale.ticks as tick (tick)}
					{@const y = valueToY(tick)}
					<line class="gridline" x1={PAD.left} x2={VIEW_W - PAD.right} y1={y} y2={y} />
					<text class="tick-label" x={PAD.left - 10} y={y} dy="0.32em" text-anchor="end">
						{valueFormat(tick)}
					</text>
				{/each}
				<!-- Baseline -->
				<line
					class="axis-line"
					x1={PAD.left}
					x2={VIEW_W - PAD.right}
					y1={PAD.top + innerH}
					y2={PAD.top + innerH}
				/>
			</g>

			<!-- Bars -->
			<g class="bars" class:grown>
				{#each categories as category, ci (category.label)}
					{@const x0 = bandX(ci)}
					{#if mode === 'stacked'}
						<!-- Stacked: each series sits atop the previous, tracking a running total. -->
						{@const w = bandW * 0.78}
						{@const bx = x0 + (bandW - w) / 2}
						{#each category.values as value, si (si)}
							{@const stackedBelow = category.values
								.slice(0, si)
								.reduce((sum, v) => sum + Math.max(0, v), 0)}
							{@const h = valueToHeight(value)}
							{@const y = valueToY(stackedBelow + value)}
							{@const colour = series[si]?.colour ?? '#888'}
							<rect
								class="bar"
								class:dim={activeBar && !isActive(ci, si)}
								x={bx}
								width={w}
								y={y}
								height={Math.max(0, h)}
								fill={colour}
								tabindex="0"
								role="button"
								aria-label={`${category.label}, ${series[si]?.name ?? `Series ${si + 1}`}: ${valueFormat(value)}`}
								style="--bar-h:{Math.max(0, h)}px; --bar-y:{y}px; transform-origin: {bx}px {PAD.top + innerH}px;"
								onmouseenter={() => setActive(ci, si, value, bx + w / 2, y)}
								onmouseleave={clearActive}
								onfocus={() => setActive(ci, si, value, bx + w / 2, y)}
								onblur={clearActive}
							></rect>
							{#if showValueLabels && value > 0}
								<text
									class="value-label stacked-label"
									x={bx + w / 2}
									y={y + h / 2}
									dy="0.32em"
									text-anchor="middle"
								>
									{valueFormat(value)}
								</text>
							{/if}
						{/each}
					{:else}
						<!-- Grouped: bars sit side-by-side within the band. -->
						{#each category.values as value, si (si)}
							{@const bx = x0 + si * (groupedBarW + groupedBarGap) + groupedBarGap / 2}
							{@const h = valueToHeight(value)}
							{@const y = valueToY(value)}
							{@const colour = series[si]?.colour ?? '#888'}
							<rect
								class="bar"
								class:dim={activeBar && !isActive(ci, si)}
								x={bx}
								width={groupedBarW}
								y={y}
								height={Math.max(0, h)}
								fill={colour}
								tabindex="0"
								role="button"
								aria-label={`${category.label}, ${series[si]?.name ?? `Series ${si + 1}`}: ${valueFormat(value)}`}
								style="--bar-h:{Math.max(0, h)}px; --bar-y:{y}px; transform-origin: {bx}px {PAD.top + innerH}px;"
								onmouseenter={() => setActive(ci, si, value, bx + groupedBarW / 2, y)}
								onmouseleave={clearActive}
								onfocus={() => setActive(ci, si, value, bx + groupedBarW / 2, y)}
								onblur={clearActive}
							></rect>
							{#if showValueLabels && value > 0}
								<text
									class="value-label"
									x={bx + groupedBarW / 2}
									y={y - 6}
									text-anchor="middle"
								>
									{valueFormat(value)}
								</text>
							{/if}
						{/each}
					{/if}
				{/each}
			</g>

			<!-- X category labels -->
			<g class="x-axis" aria-hidden="true">
				{#each categories as category, ci (category.label)}
					<text
						class="cat-label"
						x={bandX(ci) + bandW / 2}
						y={PAD.top + innerH + 22}
						text-anchor="middle"
					>
						{category.label}
					</text>
				{/each}
			</g>
		</svg>

		{#if activeBar}
			<!-- Tooltip positioned in percentage space so it tracks the responsive SVG. -->
			<div
				class="tooltip"
				style="left:{(activeBar.x / VIEW_W) * 100}%; top:{(activeBar.y / height) * 100}%;"
				role="status"
			>
				{tooltipLabel}
			</div>
		{/if}
	</div>

	<!-- Live region so screen readers announce the focused/hovered value. -->
	<div class="sr-only" aria-live="polite">{tooltipLabel}</div>

	<!-- Accessible data-table fallback. Visually hidden, fully readable by AT. -->
	<table class="sr-only">
		<caption>{title}</caption>
		<thead>
			<tr>
				<th scope="col">Category</th>
				{#each series as s (s.name)}
					<th scope="col">{s.name}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each categories as category (category.label)}
				<tr>
					<th scope="row">{category.label}</th>
					{#each series as s, si (si)}
						<td title={s.name}>{valueFormat(category.values[si] ?? 0)}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</figure>

<style>
	.bar-chart {
		/* Light defaults — overridden in the dark block below. */
		--bc-grid: #e5e7eb;
		--bc-axis: #9ca3af;
		--bc-text: #4b5563;
		--bc-label: #1f2937;
		--bc-tooltip-bg: #1f2937;
		--bc-tooltip-text: #f9fafb;
		--bc-focus: #6366f1;

		margin: 0;
		width: 100%;
		font-family:
			system-ui,
			-apple-system,
			'Segoe UI',
			sans-serif;
	}

	@media (prefers-color-scheme: dark) {
		.bar-chart {
			--bc-grid: #374151;
			--bc-axis: #6b7280;
			--bc-text: #9ca3af;
			--bc-label: #f3f4f6;
			--bc-tooltip-bg: #f9fafb;
			--bc-tooltip-text: #111827;
			--bc-focus: #818cf8;
		}
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		list-style: none;
		margin: 0 0 0.75rem;
		padding: 0;
	}

	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.8125rem;
		color: var(--bc-text);
	}

	.legend-swatch {
		width: 0.85rem;
		height: 0.85rem;
		border-radius: 3px;
		flex: none;
	}

	.plot-wrap {
		position: relative;
		width: 100%;
	}

	.plot {
		display: block;
		width: 100%;
		height: var(--chart-h);
		overflow: visible;
	}

	.gridline {
		stroke: var(--bc-grid);
		stroke-width: 1;
	}

	.axis-line {
		stroke: var(--bc-axis);
		stroke-width: 1.5;
	}

	.tick-label,
	.cat-label {
		fill: var(--bc-text);
		font-size: 12px;
	}

	.cat-label {
		font-weight: 600;
	}

	.value-label {
		fill: var(--bc-label);
		font-size: 11px;
		font-weight: 600;
		pointer-events: none;
	}

	.stacked-label {
		fill: #fff;
		mix-blend-mode: difference;
	}

	.bar {
		cursor: pointer;
		transition:
			opacity 0.15s ease,
			filter 0.15s ease;
		/* Grow animation: start flat at the baseline, scale to full height. */
		transform: scaleY(0);
	}

	.bars.grown .bar {
		transform: scaleY(1);
		transition:
			transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
			opacity 0.15s ease,
			filter 0.15s ease;
	}

	.bar:hover,
	.bar:focus-visible {
		filter: brightness(1.08);
	}

	.bar.dim {
		opacity: 0.35;
	}

	.bar:focus-visible {
		outline: none;
		stroke: var(--bc-focus);
		stroke-width: 3;
	}

	.tooltip {
		position: absolute;
		transform: translate(-50%, calc(-100% - 10px));
		background: var(--bc-tooltip-bg);
		color: var(--bc-tooltip-text);
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.35rem 0.55rem;
		border-radius: 6px;
		white-space: nowrap;
		pointer-events: none;
		box-shadow: 0 4px 12px rgb(0 0 0 / 0.18);
		z-index: 2;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.bar,
		.bars.grown .bar {
			transition: opacity 0.15s ease;
			transform: scaleY(1);
		}
	}
</style>
