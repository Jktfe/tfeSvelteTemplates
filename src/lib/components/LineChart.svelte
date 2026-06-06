<!--
  ===========================================================
  LINE CHART
  ===========================================================
  WHAT — A responsive, pure-SVG multi-series line chart with axes, gridlines,
         a nice-scaled value axis, a hover crosshair tooltip, a legend and a
         visually-hidden data-table fallback for screen readers.

  FEATURES
    • Multi-series: each series is { name, colour, points: { x, y }[] }
    • Auto "nice" Y scale (1 / 2 / 5 / 10 step rounding) with tick gridlines
    • X axis built from the union of all series x-values, evenly spaced
    • Hover (and keyboard arrow) crosshair snaps to the nearest x and shows a
      tooltip listing every series' value at that x
    • Responsive: a ResizeObserver tracks the container width and the SVG uses
      a viewBox so geometry scales without re-layout thrash
    • Legend with per-series colour swatches
    • Honours prefers-reduced-motion and prefers-colour-scheme

  ACCESSIBILITY
    • role="application" with an aria-label; the surface is focusable for arrow-key use
    • A visually-hidden <table> mirrors every data point for screen readers
    • The plot area is focusable; Left/Right arrows move the crosshair,
      Home/End jump to first/last x, Escape clears it
    • :focus-visible ring on the interactive plot surface
    • All motion suppressed under prefers-reduced-motion

  DEPENDENCIES — Zero external dependencies (pure Svelte 5 + scoped CSS + inline SVG).

  USAGE
    <script lang="ts">
      import LineChart from '$lib/components/LineChart.svelte';
      const series = [
        { name: 'Revenue', colour: '#4f7cff', points: [ { x: 1, y: 10 }, { x: 2, y: 18 } ] }
      ];
    </script>
    <LineChart {series} xLabel="Quarter" yLabel="£m" />

  PROPS
    | Prop          | Type            | Default        | Description                                  |
    | ------------- | --------------- | -------------- | -------------------------------------------- |
    | series        | LineSeries[]    | []             | Array of { name, colour, points: {x,y}[] }.  |
    | height        | number          | 320            | Plot height in px (width is responsive).     |
    | xLabel        | string          | ''             | Axis label under the X axis.                 |
    | yLabel        | string          | ''             | Axis label rotated beside the Y axis.        |
    | yTicks        | number          | 5              | Target number of Y gridlines (nice-scaled).  |
    | showDots      | boolean         | true           | Draw a marker at each data point.            |
    | showLegend    | boolean         | true           | Show the series legend below the chart.      |
    | formatX       | (x)=>string     | String         | Formatter for X tick + tooltip labels.       |
    | formatY       | (y)=>string     | compact number | Formatter for Y tick + tooltip values.       |
    | ariaLabel     | string          | auto-generated | Accessible name for the chart image.         |
    | class         | string          | ''             | Extra class on the wrapper.                  |
  ===========================================================
-->
<script lang="ts">
	interface LinePoint {
		x: number;
		y: number;
	}
	interface LineSeries {
		name: string;
		colour: string;
		points: LinePoint[];
	}
	interface Props {
		series?: LineSeries[];
		height?: number;
		xLabel?: string;
		yLabel?: string;
		yTicks?: number;
		showDots?: boolean;
		showLegend?: boolean;
		formatX?: (x: number) => string;
		formatY?: (y: number) => string;
		ariaLabel?: string;
		class?: string;
	}

	let {
		series = [],
		height = 320,
		xLabel = '',
		yLabel = '',
		yTicks = 5,
		showDots = true,
		showLegend = true,
		formatX = (x) => String(x),
		formatY = defaultFormatY,
		ariaLabel,
		class: className = ''
	}: Props = $props();

	// Compact default for the value axis — keeps "12,000" as "12k" so ticks stay legible.
	function defaultFormatY(y: number): string {
		const abs = Math.abs(y);
		if (abs >= 1_000_000) return `${trim(y / 1_000_000)}m`;
		if (abs >= 1_000) return `${trim(y / 1_000)}k`;
		return trim(y);
	}
	function trim(n: number): string {
		return Number(n.toFixed(2)).toString();
	}

	// --- Responsive width -------------------------------------------------
	// We measure the container, not the SVG, so the viewBox can map 1:1 to px
	// and stroke widths stay crisp at any size.
	let containerWidth = $state(640);
	let plotEl: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!plotEl) return;
		const ro = new ResizeObserver((entries) => {
			const w = entries[0]?.contentRect.width;
			if (w && w > 0) containerWidth = w;
		});
		ro.observe(plotEl);
		return () => ro.disconnect();
	});

	// --- Geometry ---------------------------------------------------------
	const margin = { top: 16, right: 18, bottom: 40, left: 52 };
	let width = $derived(Math.max(containerWidth, 240));
	let innerW = $derived(Math.max(width - margin.left - margin.right, 10));
	let innerH = $derived(Math.max(height - margin.top - margin.bottom, 10));

	// Union of x-values across all series, sorted — these are the categorical slots.
	let xValues = $derived.by(() => {
		const xs: number[] = [];
		for (const s of series) for (const p of s.points) if (!xs.includes(p.x)) xs.push(p.x);
		return xs.sort((a, b) => a - b);
	});

	// "Nice" Y scale: round the data extent out to a tidy step (1/2/5 × 10ⁿ).
	let yScale = $derived.by(() => {
		let min = Infinity;
		let max = -Infinity;
		for (const s of series)
			for (const p of s.points) {
				if (p.y < min) min = p.y;
				if (p.y > max) max = p.y;
			}
		if (!isFinite(min) || !isFinite(max)) return { min: 0, max: 1, ticks: [0, 1] };
		if (min === max) {
			// Flat data — pad so the line sits mid-plot rather than on an edge.
			const pad = Math.abs(min) || 1;
			min -= pad;
			max += pad;
		}
		min = Math.min(min, 0 <= max && min > 0 ? 0 : min); // include zero baseline when natural
		const span = niceNum(max - min, false);
		const step = niceNum(span / Math.max(yTicks - 1, 1), true);
		const niceMin = Math.floor(min / step) * step;
		const niceMax = Math.ceil(max / step) * step;
		const ticks: number[] = [];
		for (let v = niceMin; v <= niceMax + step / 2; v += step) ticks.push(round(v));
		return { min: niceMin, max: niceMax, ticks };
	});

	function niceNum(range: number, round: boolean): number {
		if (range === 0) return 1;
		const exp = Math.floor(Math.log10(range));
		const frac = range / Math.pow(10, exp);
		let nice: number;
		if (round) {
			if (frac < 1.5) nice = 1;
			else if (frac < 3) nice = 2;
			else if (frac < 7) nice = 5;
			else nice = 10;
		} else {
			if (frac <= 1) nice = 1;
			else if (frac <= 2) nice = 2;
			else if (frac <= 5) nice = 5;
			else nice = 10;
		}
		return nice * Math.pow(10, exp);
	}
	function round(n: number): number {
		return Number(n.toFixed(6));
	}

	// Pixel mappers (note: SVG y grows downward, so we invert).
	function xPos(x: number): number {
		const i = xValues.indexOf(x);
		if (xValues.length <= 1) return margin.left + innerW / 2;
		return margin.left + (i / (xValues.length - 1)) * innerW;
	}
	function yPos(y: number): number {
		const { min, max } = yScale;
		const t = max === min ? 0.5 : (y - min) / (max - min);
		return margin.top + (1 - t) * innerH;
	}

	// Build an SVG path "M x y L x y …" per series.
	function pathFor(s: LineSeries): string {
		const pts = [...s.points].sort((a, b) => a.x - b.x);
		return pts
			.map((p, i) => `${i === 0 ? 'M' : 'L'}${xPos(p.x).toFixed(2)},${yPos(p.y).toFixed(2)}`)
			.join(' ');
	}

	// --- Hover / keyboard crosshair --------------------------------------
	let activeIndex = $state<number | null>(null);
	let activeX = $derived(activeIndex == null ? null : xValues[activeIndex]);

	// Value of each series at the active x (or null if that series skips this x).
	let activeReadout = $derived.by(() => {
		if (activeX == null) return [];
		return series.map((s) => {
			const hit = s.points.find((p) => p.x === activeX);
			return { name: s.name, colour: s.colour, value: hit ? hit.y : null };
		});
	});

	function nearestIndexFromClientX(clientX: number): number | null {
		if (!plotEl || xValues.length === 0) return null;
		const rect = plotEl.getBoundingClientRect();
		const localX = ((clientX - rect.left) / rect.width) * width;
		let best = 0;
		let bestDist = Infinity;
		for (let i = 0; i < xValues.length; i++) {
			const d = Math.abs(xPos(xValues[i]) - localX);
			if (d < bestDist) {
				bestDist = d;
				best = i;
			}
		}
		return best;
	}

	function onPointerMove(e: PointerEvent) {
		activeIndex = nearestIndexFromClientX(e.clientX);
	}
	function clearActive() {
		activeIndex = null;
	}
	function onKeydown(e: KeyboardEvent) {
		if (xValues.length === 0) return;
		const last = xValues.length - 1;
		if (e.key === 'ArrowRight') {
			activeIndex = activeIndex == null ? 0 : Math.min(activeIndex + 1, last);
			e.preventDefault();
		} else if (e.key === 'ArrowLeft') {
			activeIndex = activeIndex == null ? last : Math.max(activeIndex - 1, 0);
			e.preventDefault();
		} else if (e.key === 'Home') {
			activeIndex = 0;
			e.preventDefault();
		} else if (e.key === 'End') {
			activeIndex = last;
			e.preventDefault();
		} else if (e.key === 'Escape') {
			activeIndex = null;
		}
	}

	// Keep the tooltip inside the plot horizontally.
	let tooltipX = $derived(activeX == null ? 0 : xPos(activeX));
	let tooltipFlip = $derived(tooltipX > margin.left + innerW * 0.62);

	let computedAriaLabel = $derived(
		ariaLabel ??
			`Line chart with ${series.length} series: ${series.map((s) => s.name).join(', ')}.`
	);

	let hasData = $derived(series.length > 0 && xValues.length > 0);
</script>

<div class="lc {className}" class:lc--empty={!hasData}>
	<!--
		role="application" marks this as a self-contained interactive widget so the
		arrow keys drive the crosshair instead of being intercepted by the screen
		reader's browse mode. The visually-hidden table below is the real data source
		for assistive tech, so these listeners on the surface are intentional.
	-->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="lc-plot"
		bind:this={plotEl}
		role="application"
		aria-label={computedAriaLabel}
		tabindex="0"
		onpointermove={onPointerMove}
		onpointerleave={clearActive}
		onkeydown={onKeydown}
		onblur={clearActive}
	>
		{#if hasData}
			<svg
				class="lc-svg"
				viewBox="0 0 {width} {height}"
				width="100%"
				{height}
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<!-- Horizontal gridlines + Y tick labels -->
				{#each yScale.ticks as tick (tick)}
					<line
						class="lc-grid"
						x1={margin.left}
						y1={yPos(tick)}
						x2={margin.left + innerW}
						y2={yPos(tick)}
					/>
					<text class="lc-tick lc-tick--y" x={margin.left - 8} y={yPos(tick)}>
						{formatY(tick)}
					</text>
				{/each}

				<!-- Axis baselines -->
				<line
					class="lc-axis"
					x1={margin.left}
					y1={margin.top}
					x2={margin.left}
					y2={margin.top + innerH}
				/>
				<line
					class="lc-axis"
					x1={margin.left}
					y1={margin.top + innerH}
					x2={margin.left + innerW}
					y2={margin.top + innerH}
				/>

				<!-- X tick labels -->
				{#each xValues as xv (xv)}
					<text class="lc-tick lc-tick--x" x={xPos(xv)} y={margin.top + innerH + 18}>
						{formatX(xv)}
					</text>
				{/each}

				<!-- Crosshair -->
				{#if activeX != null}
					<line
						class="lc-crosshair"
						x1={xPos(activeX)}
						y1={margin.top}
						x2={xPos(activeX)}
						y2={margin.top + innerH}
					/>
				{/if}

				<!-- Series lines -->
				{#each series as s (s.name)}
					<path class="lc-line" d={pathFor(s)} stroke={s.colour} fill="none" />
				{/each}

				<!-- Data points -->
				{#if showDots}
					{#each series as s (s.name)}
						{#each s.points as p (p.x)}
							<circle
								class="lc-dot"
								class:lc-dot--active={activeX === p.x}
								cx={xPos(p.x)}
								cy={yPos(p.y)}
								r={activeX === p.x ? 5 : 3}
								fill={s.colour}
							/>
						{/each}
					{/each}
				{/if}

				<!-- Axis titles -->
				{#if xLabel}
					<text class="lc-axis-label" x={margin.left + innerW / 2} y={height - 4}>
						{xLabel}
					</text>
				{/if}
				{#if yLabel}
					<text
						class="lc-axis-label"
						x={14}
						y={margin.top + innerH / 2}
						transform="rotate(-90 14 {margin.top + innerH / 2})"
					>
						{yLabel}
					</text>
				{/if}
			</svg>

			<!-- Tooltip (HTML overlay so text stays unscaled and crisp) -->
			{#if activeX != null}
				<div
					class="lc-tooltip"
					class:lc-tooltip--flip={tooltipFlip}
					style="left: {(tooltipX / width) * 100}%; top: {(margin.top / height) * 100}%"
					aria-hidden="true"
				>
					<div class="lc-tooltip-x">{formatX(activeX)}</div>
					<ul class="lc-tooltip-list">
						{#each activeReadout as row (row.name)}
							<li>
								<span class="lc-swatch" style="background: {row.colour}"></span>
								<span class="lc-tooltip-name">{row.name}</span>
								<span class="lc-tooltip-val">
									{row.value == null ? '—' : formatY(row.value)}
								</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		{:else}
			<p class="lc-empty-msg">No data to display.</p>
		{/if}
	</div>

	{#if showLegend && hasData}
		<ul class="lc-legend">
			{#each series as s (s.name)}
				<li class="lc-legend-item">
					<span class="lc-swatch" style="background: {s.colour}"></span>
					<span>{s.name}</span>
				</li>
			{/each}
		</ul>
	{/if}

	<!-- Visually-hidden data table — the accessible source of truth. -->
	{#if hasData}
		<div class="lc-sr-only">
			<table>
				<caption>{computedAriaLabel}</caption>
				<thead>
					<tr>
						<th scope="col">{xLabel || 'X'}</th>
						{#each series as s (s.name)}
							<th scope="col">{s.name}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each xValues as xv (xv)}
						<tr>
							<th scope="row">{formatX(xv)}</th>
							{#each series as s (s.name)}
								{@const hit = s.points.find((p) => p.x === xv)}
								<td>{hit ? formatY(hit.y) : '—'}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.lc {
		/* Light defaults — flipped under prefers-colour-scheme: dark below. */
		--lc-grid: #e6e8ee;
		--lc-axis: #aab1bd;
		--lc-tick: #5c636e;
		--lc-label: #2a2f37;
		--lc-tooltip-bg: #ffffff;
		--lc-tooltip-border: #d7dbe3;
		--lc-tooltip-fg: #1d2127;
		--lc-tooltip-shadow: 0 8px 24px rgba(20, 24, 32, 0.16);
		--lc-crosshair: #8b93a1;
		--lc-focus: #4f7cff;

		display: grid;
		gap: 12px;
		width: 100%;
		color: var(--lc-label);
		font-family:
			system-ui,
			-apple-system,
			'Segoe UI',
			sans-serif;
	}

	.lc-plot {
		position: relative;
		width: 100%;
		border-radius: 8px;
		outline: none;
		touch-action: pan-y;
	}
	.lc-plot:focus-visible {
		outline: 2px solid var(--lc-focus);
		outline-offset: 3px;
	}

	.lc-svg {
		display: block;
		width: 100%;
		overflow: visible;
	}

	.lc-grid {
		stroke: var(--lc-grid);
		stroke-width: 1;
		vector-effect: non-scaling-stroke;
	}
	.lc-axis {
		stroke: var(--lc-axis);
		stroke-width: 1;
		vector-effect: non-scaling-stroke;
	}
	.lc-crosshair {
		stroke: var(--lc-crosshair);
		stroke-width: 1;
		stroke-dasharray: 4 4;
		vector-effect: non-scaling-stroke;
	}

	.lc-line {
		stroke-width: 2;
		stroke-linejoin: round;
		stroke-linecap: round;
		vector-effect: non-scaling-stroke;
	}

	.lc-dot {
		vector-effect: non-scaling-stroke;
		transition: r 0.12s ease;
	}
	.lc-dot--active {
		stroke: var(--lc-tooltip-bg);
		stroke-width: 2;
	}

	.lc-tick {
		font-size: 11px;
		fill: var(--lc-tick);
	}
	.lc-tick--y {
		text-anchor: end;
		dominant-baseline: middle;
	}
	.lc-tick--x {
		text-anchor: middle;
		dominant-baseline: hanging;
	}
	.lc-axis-label {
		font-size: 11px;
		font-weight: 600;
		fill: var(--lc-tick);
		text-anchor: middle;
		letter-spacing: 0.02em;
	}

	.lc-tooltip {
		position: absolute;
		transform: translate(10px, 0);
		min-width: 120px;
		padding: 8px 10px;
		background: var(--lc-tooltip-bg);
		border: 1px solid var(--lc-tooltip-border);
		border-radius: 8px;
		box-shadow: var(--lc-tooltip-shadow);
		color: var(--lc-tooltip-fg);
		font-size: 12px;
		pointer-events: none;
		z-index: 2;
	}
	.lc-tooltip--flip {
		transform: translate(calc(-100% - 10px), 0);
	}
	.lc-tooltip-x {
		font-weight: 600;
		margin-bottom: 5px;
		font-variant-numeric: tabular-nums;
	}
	.lc-tooltip-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 3px;
	}
	.lc-tooltip-list li {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 8px;
	}
	.lc-tooltip-name {
		color: var(--lc-tick);
	}
	.lc-tooltip-val {
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.lc-legend {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 8px 16px;
		font-size: 12px;
		color: var(--lc-label);
	}
	.lc-legend-item {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.lc-swatch {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 3px;
		flex: none;
	}

	.lc-empty-msg {
		margin: 0;
		padding: 40px 12px;
		text-align: center;
		color: var(--lc-tick);
		font-size: 13px;
	}

	/* Visually hidden but available to assistive tech. */
	.lc-sr-only {
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

	@media (prefers-color-scheme: dark) {
		.lc {
			--lc-grid: #2a2f3a;
			--lc-axis: #4a515e;
			--lc-tick: #9aa3b2;
			--lc-label: #e6e9ef;
			--lc-tooltip-bg: #1b1f27;
			--lc-tooltip-border: #353c49;
			--lc-tooltip-fg: #f0f2f6;
			--lc-tooltip-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
			--lc-crosshair: #6b7382;
			--lc-focus: #7d9bff;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.lc-dot {
			transition: none;
		}
	}
</style>
