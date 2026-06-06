<!--
  ===========================================================
  DONUT CHART
  ===========================================================
  WHAT — A pure-SVG donut/pie chart with legend, centre label and arc hover-to-raise.
  FEATURES
    • Pure SVG arc maths via stroke-dasharray on overlaid <circle> rings — no canvas, no libs
    • Donut vs pie purely from the `thickness` prop (set thickness to the radius for a solid pie)
    • Legend lists every slice with its value and computed percentage
    • Hovering or focusing a slice raises it (scales out) and shows a tooltip
    • Centre label slot for a total / headline figure (donut mode only)
    • Light + dark mode via CSS custom properties; honours prefers-reduced-motion
  ACCESSIBILITY
    • The chart figure carries role="img" with an aria-label summarising every slice
    • A visually-hidden <ul> mirrors the data so screen readers get a real list fallback
    • Each slice is keyboard-focusable (Tab), raises on :focus-visible, and announces its label/value
    • Tooltip text is also exposed via aria so it is not purely visual
  DEPENDENCIES — Zero external dependencies (pure Svelte 5 + scoped CSS + inline SVG).
  USAGE
    <script lang="ts">
      import DonutChart from '$lib/components/DonutChart.svelte';
      const data = [
        { label: 'Direct', value: 42, colour: '#6366f1' },
        { label: 'Search', value: 30, colour: '#22c55e' },
        { label: 'Social', value: 28, colour: '#f97316' }
      ];
    </script>
    <DonutChart {data} centreLabel="100%" thickness={26} />
  PROPS
    | Prop         | Type           | Default       | Description                                              |
    |--------------|----------------|---------------|----------------------------------------------------------|
    | data         | DonutSlice[]   | []            | Slices: { label, value, colour }                         |
    | thickness    | number         | 26            | Ring thickness in px; >= radius renders a solid pie      |
    | size         | number         | 220           | Chart width/height in px                                 |
    | centreLabel  | string         | ''            | Headline text shown in the donut hole (ignored for pie)  |
    | centreSub    | string         | ''            | Smaller caption beneath the centre label                 |
    | showLegend   | boolean        | true          | Render the legend beside/under the chart                 |
    | gap          | number         | 1.5           | Gap between slices, in percent of the circumference      |
    | ariaLabel    | string         | auto-generated| Override the figure's aria-label                         |
  ===========================================================
-->

<script lang="ts">
	/** A single slice of the chart. */
	interface DonutSlice {
		label: string;
		value: number;
		colour: string;
	}

	interface Props {
		data?: DonutSlice[];
		thickness?: number;
		size?: number;
		centreLabel?: string;
		centreSub?: string;
		showLegend?: boolean;
		gap?: number;
		ariaLabel?: string;
	}

	let {
		data = [],
		thickness = 26,
		size = 220,
		centreLabel = '',
		centreSub = '',
		showLegend = true,
		gap = 1.5,
		ariaLabel
	}: Props = $props();

	// The SVG viewBox is a fixed 100×100 grid so the maths stays simple regardless of `size`.
	// We draw on a circle whose radius leaves room for the stroke without clipping.
	const VIEW = 100;
	const cx = VIEW / 2;
	const cy = VIEW / 2;

	// Stroke width in viewBox units, derived from the pixel thickness the caller asked for.
	const strokeVB = $derived((thickness / size) * VIEW);

	// Radius of the centre-line the stroke is painted around — pulled in by half the stroke
	// plus a small margin so the ring never touches the edge of the box.
	const radius = $derived(Math.max(1, VIEW / 2 - strokeVB / 2 - 1));
	const circumference = $derived(2 * Math.PI * radius);

	// A solid pie is just a donut whose hole has collapsed: when thickness reaches the
	// radius there is no inner hole left, so we treat the centre label as meaningless.
	const isPie = $derived(thickness >= size / 2);

	const total = $derived(data.reduce((sum, d) => sum + Math.max(0, d.value), 0));

	// Pre-compute each slice's dash geometry once per data change.
	// `offset` rotates the slice into place; `dash` is its visible length; the gap is
	// subtracted so neighbouring slices read as distinct wedges.
	interface Segment extends DonutSlice {
		percent: number;
		dash: number;
		offset: number;
	}

	const segments = $derived.by<Segment[]>(() => {
		if (total <= 0) return [];
		const gapVB = (gap / 100) * circumference;
		let cursor = 0;
		return data.map((d) => {
			const v = Math.max(0, d.value);
			const fraction = v / total;
			const slice = fraction * circumference;
			// Never let the gap eat the whole slice; clamp so very thin slices stay visible.
			const visible = Math.max(0, slice - Math.min(gapVB, slice * 0.5));
			const seg: Segment = {
				...d,
				percent: fraction * 100,
				dash: visible,
				// stroke-dashoffset runs clockwise from 12 o'clock once we rotate the SVG -90deg.
				offset: -cursor
			};
			cursor += slice;
			return seg;
		});
	});

	let active = $state<number | null>(null);

	const autoLabel = $derived(
		segments.length === 0
			? 'Chart with no data'
			: `${isPie ? 'Pie' : 'Donut'} chart: ` +
					segments
						.map((s) => `${s.label} ${s.value} (${s.percent.toFixed(0)}%)`)
						.join(', ')
	);

	const figureLabel = $derived(ariaLabel ?? autoLabel);

	function fmtPercent(p: number): string {
		return `${p.toFixed(p < 10 ? 1 : 0)}%`;
	}

	function setActive(i: number | null) {
		active = i;
	}
</script>

<div class="donut" style="--donut-size: {size}px;">
	<div class="donut__chart-wrap">
		<!-- role="img" + aria-label gives assistive tech a single spoken summary;
		     the hidden list below provides the granular fallback. -->
		<svg
			class="donut__svg"
			class:donut--pie={isPie}
			viewBox="0 0 {VIEW} {VIEW}"
			role="img"
			aria-label={figureLabel}
		>
			{#if segments.length === 0}
				<circle
					class="donut__track"
					{cx}
					{cy}
					r={radius}
					fill="none"
					stroke-width={strokeVB}
				/>
			{:else}
				<!-- Faint track behind the slices keeps a donut readable even with tiny values. -->
				{#if !isPie}
					<circle
						class="donut__track"
						{cx}
						{cy}
						r={radius}
						fill="none"
						stroke-width={strokeVB}
					/>
				{/if}
				<g class="donut__rings" transform="rotate(-90 {cx} {cy})">
					{#each segments as seg, i (seg.label + i)}
						<circle
							class="donut__seg"
							class:donut__seg--active={active === i}
							class:donut__seg--dim={active !== null && active !== i}
							{cx}
							{cy}
							r={radius}
							fill="none"
							stroke={seg.colour}
							stroke-width={strokeVB}
							stroke-dasharray="{seg.dash} {circumference - seg.dash}"
							stroke-dashoffset={seg.offset}
							stroke-linecap="butt"
							tabindex="0"
							role="button"
							aria-label="{seg.label}: {seg.value}, {fmtPercent(seg.percent)}"
							onmouseenter={() => setActive(i)}
							onmouseleave={() => setActive(null)}
							onfocus={() => setActive(i)}
							onblur={() => setActive(null)}
						/>
					{/each}
				</g>
			{/if}
		</svg>

		<!-- Centre label only makes sense when there is a hole to put it in. -->
		{#if !isPie && (centreLabel || centreSub || active !== null)}
			<div class="donut__centre" aria-hidden="true">
				{#if active !== null && segments[active]}
					<span class="donut__centre-value">{fmtPercent(segments[active].percent)}</span>
					<span class="donut__centre-sub">{segments[active].label}</span>
				{:else}
					{#if centreLabel}<span class="donut__centre-value">{centreLabel}</span>{/if}
					{#if centreSub}<span class="donut__centre-sub">{centreSub}</span>{/if}
				{/if}
			</div>
		{/if}

		<!-- Tooltip floats above the chart on hover/focus; text duplicated into aria above. -->
		{#if active !== null && segments[active]}
			<div class="donut__tooltip" role="status">
				<span class="donut__tooltip-dot" style="background:{segments[active].colour};"></span>
				<strong>{segments[active].label}</strong>
				<span class="donut__tooltip-val"
					>{segments[active].value} · {fmtPercent(segments[active].percent)}</span
				>
			</div>
		{/if}
	</div>

	{#if showLegend && segments.length > 0}
		<ul class="donut__legend">
			{#each segments as seg, i (seg.label + i)}
				<li>
					<button
						type="button"
						class="donut__legend-item"
						class:donut__legend-item--active={active === i}
						onmouseenter={() => setActive(i)}
						onmouseleave={() => setActive(null)}
						onfocus={() => setActive(i)}
						onblur={() => setActive(null)}
					>
						<span class="donut__swatch" style="background:{seg.colour};"></span>
						<span class="donut__legend-label">{seg.label}</span>
						<span class="donut__legend-value">{seg.value}</span>
						<span class="donut__legend-pct">{fmtPercent(seg.percent)}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	<!-- Visually-hidden data table fallback for assistive tech and no-CSS contexts. -->
	<ul class="donut__sr">
		{#each segments as seg, i (seg.label + 'sr' + i)}
			<li>{seg.label}: {seg.value} ({fmtPercent(seg.percent)})</li>
		{/each}
	</ul>
</div>

<style>
	.donut {
		/* Light defaults live on the component root; the dark block below flips chrome only. */
		--donut-track: #e7e8ee;
		--donut-text: #1c1d22;
		--donut-muted: #6b6f76;
		--donut-tooltip-bg: #ffffff;
		--donut-tooltip-border: #e2e3e9;
		--donut-tooltip-shadow: rgba(20, 22, 30, 0.16);
		--donut-focus: #4f46e5;
		--donut-legend-hover: #f3f4f8;

		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1.5rem;
		color: var(--donut-text);
		font-family:
			ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
	}

	.donut__chart-wrap {
		position: relative;
		width: var(--donut-size);
		height: var(--donut-size);
		flex: 0 0 auto;
	}

	.donut__svg {
		width: 100%;
		height: 100%;
		overflow: visible;
		display: block;
	}

	.donut__track {
		stroke: var(--donut-track);
	}

	.donut__seg {
		cursor: pointer;
		transition:
			transform 180ms ease,
			opacity 180ms ease,
			filter 180ms ease;
		transform-box: fill-box;
		transform-origin: center;
		outline: none;
	}

	/* Raise = scale the wedge out from the centre so it reads as "lifted". */
	.donut__seg--active {
		transform: scale(1.06);
		filter: drop-shadow(0 1px 3px var(--donut-tooltip-shadow));
	}

	.donut__seg--dim {
		opacity: 0.4;
	}

	.donut__seg:focus-visible {
		filter: drop-shadow(0 0 0 3px var(--donut-focus));
	}

	.donut__centre {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		pointer-events: none;
		padding: 18%;
	}

	.donut__centre-value {
		font-size: clamp(1.1rem, 5vw, 1.6rem);
		font-weight: 700;
		line-height: 1.1;
	}

	.donut__centre-sub {
		font-size: 0.72rem;
		color: var(--donut-muted);
		margin-top: 0.15rem;
	}

	.donut__tooltip {
		position: absolute;
		top: -0.5rem;
		left: 50%;
		transform: translate(-50%, -100%);
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		white-space: nowrap;
		background: var(--donut-tooltip-bg);
		border: 1px solid var(--donut-tooltip-border);
		border-radius: 0.5rem;
		padding: 0.35rem 0.55rem;
		font-size: 0.78rem;
		box-shadow: 0 6px 18px var(--donut-tooltip-shadow);
		z-index: 2;
		pointer-events: none;
	}

	.donut__tooltip-dot {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		flex: 0 0 auto;
	}

	.donut__tooltip-val {
		color: var(--donut-muted);
	}

	.donut__legend {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.donut__legend-item {
		display: grid;
		grid-template-columns: auto 1fr auto auto;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		background: none;
		border: 1px solid transparent;
		border-radius: 0.5rem;
		padding: 0.3rem 0.5rem;
		font: inherit;
		color: inherit;
		cursor: pointer;
		text-align: left;
	}

	.donut__legend-item:hover,
	.donut__legend-item--active {
		background: var(--donut-legend-hover);
	}

	.donut__legend-item:focus-visible {
		outline: 2px solid var(--donut-focus);
		outline-offset: 1px;
	}

	.donut__swatch {
		width: 0.8rem;
		height: 0.8rem;
		border-radius: 0.2rem;
		flex: 0 0 auto;
	}

	.donut__legend-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.donut__legend-value {
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}

	.donut__legend-pct {
		font-variant-numeric: tabular-nums;
		color: var(--donut-muted);
		min-width: 2.8rem;
		text-align: right;
	}

	/* Screen-reader-only fallback list. */
	.donut__sr {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	@media (prefers-color-scheme: dark) {
		.donut {
			--donut-track: #2b2d36;
			--donut-text: #eceef4;
			--donut-muted: #9aa0ac;
			--donut-tooltip-bg: #1b1d24;
			--donut-tooltip-border: #343742;
			--donut-tooltip-shadow: rgba(0, 0, 0, 0.5);
			--donut-focus: #818cf8;
			--donut-legend-hover: #23262f;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.donut__seg {
			transition: none;
		}
	}
</style>
