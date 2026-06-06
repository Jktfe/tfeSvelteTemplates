<!--
  ===========================================================
  SPARKLINE
  ===========================================================
  WHAT — A tiny inline SVG trend line for tables, stat cards, and dashboards.
  FEATURES
    - Pure SVG, zero dependencies — auto-scales the polyline to the data range
    - Optional area fill under the curve and an optional dot on the last point
    - Optional min/max override to pin the baseline across multiple sparklines
    - Handles empty, single-value, and flat datasets without breaking layout
    - preserveAspectRatio="none" for crisp edge-to-edge fit in any box
  ACCESSIBILITY
    - role="img" with a computed aria-label summarising the trend
      (first value, last value, percentage change) for screen readers
    - Honours prefers-reduced-motion (the draw-in animation is suppressed)
  DEPENDENCIES — Zero external dependencies — pure Svelte 5.
  USAGE
    <Sparkline data={[3, 7, 4, 9, 6, 11]} />
    <Sparkline data={values} stroke="#16a34a" fill last label="Revenue" />
  PROPS
    | Prop    | Type                 | Default      | Description                                   |
    | ------- | -------------------- | ------------ | --------------------------------------------- |
    | data    | number[]             | []           | The series to plot, left to right.            |
    | width   | number               | 120          | SVG viewBox width in user units.              |
    | height  | number               | 32           | SVG viewBox height in user units.             |
    | stroke  | string               | currentColor | Line colour (any CSS colour).                 |
    | fill    | boolean              | false        | Draw a soft area beneath the line.            |
    | last    | boolean              | false        | Render a dot on the final data point.         |
    | min     | number \| undefined  | undefined    | Override the scale minimum.                   |
    | max     | number \| undefined  | undefined    | Override the scale maximum.                   |
    | label   | string               | ''           | Prefix for the computed aria-label.           |
  ===========================================================
-->
<script lang="ts">
	interface Props {
		/** The series to plot, left to right. */
		data?: number[];
		/** SVG viewBox width in user units. */
		width?: number;
		/** SVG viewBox height in user units. */
		height?: number;
		/** Line colour (any CSS colour). */
		stroke?: string;
		/** Draw a soft area beneath the line. */
		fill?: boolean;
		/** Render a dot on the final data point. */
		last?: boolean;
		/** Override the scale minimum. */
		min?: number;
		/** Override the scale maximum. */
		max?: number;
		/** Prefix for the computed aria-label. */
		label?: string;
	}

	let {
		data = [],
		width = 120,
		height = 32,
		stroke = 'currentColor',
		fill = false,
		last = false,
		min,
		max,
		label = ''
	}: Props = $props();

	// A little breathing room so the stroke and last-point dot never clip the edges.
	const PAD = 3;

	// Only finite numbers can be plotted — silently drop NaN/Infinity so a bad
	// cell in a table doesn't blow up the whole row.
	const clean = $derived(data.filter((n) => typeof n === 'number' && Number.isFinite(n)));

	// The scale domain. Callers can pin min/max to keep several sparklines comparable.
	const lo = $derived(min ?? (clean.length ? Math.min(...clean) : 0));
	const hi = $derived(max ?? (clean.length ? Math.max(...clean) : 0));

	// Map each value to an [x, y] point inside the padded box. A flat series
	// (range of zero) sits on the vertical centre line rather than the top edge.
	const points = $derived.by(() => {
		const n = clean.length;
		if (n === 0) return [] as Array<[number, number]>;

		const span = hi - lo;
		const innerW = width - PAD * 2;
		const innerH = height - PAD * 2;

		return clean.map((v, i) => {
			// One point would divide by zero — anchor it at the left edge instead.
			const x = n === 1 ? PAD : PAD + (i / (n - 1)) * innerW;
			// SVG y grows downward, so invert: high values rise to the top.
			const t = span === 0 ? 0.5 : (v - lo) / span;
			const y = PAD + (1 - t) * innerH;
			return [x, y] as [number, number];
		});
	});

	const linePath = $derived(points.map(([x, y]) => `${x},${y}`).join(' '));

	// The area polygon closes the line down to the baseline and back, so the
	// fill sits neatly under the curve no matter how the series moves.
	const area = $derived.by(() => {
		if (points.length < 2) return '';
		const base = height - PAD;
		const segs = points.map(([x, y]) => `${x},${y}`).join(' L ');
		const [firstX] = points[0];
		const [lastX] = points[points.length - 1];
		return `M ${firstX},${base} L ${segs} L ${lastX},${base} Z`;
	});

	const lastPoint = $derived(points.length ? points[points.length - 1] : null);

	// A human-readable trend summary for assistive technology.
	const summary = $derived.by(() => {
		const prefix = label ? `${label}: ` : '';
		if (clean.length === 0) return `${prefix}No data`.trim();
		if (clean.length === 1) return `${prefix}Single value ${clean[0]}`.trim();

		const first = clean[0];
		const final = clean[clean.length - 1];
		const direction = final > first ? 'up' : final < first ? 'down' : 'flat';
		let change = '';
		if (first !== 0) {
			const pct = ((final - first) / Math.abs(first)) * 100;
			change = `, ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
		}
		return `${prefix}Trend ${direction} from ${first} to ${final}${change}`.trim();
	});
</script>

<svg
	class="sparkline"
	viewBox="0 0 {width} {height}"
	preserveAspectRatio="none"
	role="img"
	aria-label={summary}
	style:--spark-stroke={stroke}
>
	{#if area && fill}
		<path class="sparkline__area" d={area} />
	{/if}

	{#if points.length >= 2}
		<polyline class="sparkline__line" points={linePath} />
	{:else if points.length === 1}
		<!-- A lone reading still deserves a mark so the cell isn't visually empty. -->
		<circle class="sparkline__dot" cx={points[0][0]} cy={points[0][1]} r="2.5" />
	{/if}

	{#if last && lastPoint && points.length >= 2}
		<circle class="sparkline__dot" cx={lastPoint[0]} cy={lastPoint[1]} r="2.5" />
	{/if}
</svg>

<style>
	/*
	  Light defaults live on the element; the dark block below only flips the
	  fallback chrome colour. An explicit `stroke` prop always wins via the
	  --spark-stroke custom property.
	*/
	.sparkline {
		--spark-fallback: #2563eb;
		display: inline-block;
		width: 100%;
		height: 100%;
		overflow: visible;
		vertical-align: middle;
		color: var(--spark-fallback);
	}

	.sparkline__line {
		fill: none;
		stroke: var(--spark-stroke, currentColor);
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
		stroke-dasharray: 1000;
		stroke-dashoffset: 0;
		animation: spark-draw 0.8s ease-out;
	}

	.sparkline__area {
		fill: var(--spark-stroke, currentColor);
		opacity: 0.14;
		stroke: none;
	}

	.sparkline__dot {
		fill: var(--spark-stroke, currentColor);
		stroke: var(--spark-dot-ring, #ffffff);
		stroke-width: 1;
		vector-effect: non-scaling-stroke;
	}

	@keyframes spark-draw {
		from {
			stroke-dashoffset: 1000;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	@media (prefers-color-scheme: dark) {
		.sparkline {
			--spark-fallback: #60a5fa;
		}
		.sparkline__dot {
			--spark-dot-ring: #0b1220;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sparkline__line {
			animation: none;
			stroke-dasharray: none;
		}
	}
</style>
