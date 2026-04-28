<!--
  ============================================================
  StatCard - KPI Card with Optional Trend
  ============================================================

  🎯 WHAT IT DOES
  Displays a single key metric — title, big number, and optional trend.
  The trend automatically colours green for "good" or red for "bad" based
  on the metric's `positiveDirection` (so a falling page-load time can
  still read as good).

  ✨ FEATURES
  • Auto-colours the delta (green for positive, red for negative, grey for flat)
  • `positiveDirection` flips the colour map — for metrics where down = good
  • Optional leading icon (snippet) and trailing footer label (e.g. "vs last week")
  • Three sizes (sm / md / lg) for sidebars, dashboards, and hero KPIs
  • Pure CSS — no observers, no animations beyond CSS transitions

  ♿ ACCESSIBILITY
  • Semantic structure: <article> with implicit heading from <h3>
  • Trend is announced as text ("up 8.2 percent vs last week") via sr-only span
  • Colour alone never carries meaning — there is always an accompanying ↑/↓ glyph
  • Honours prefers-reduced-motion

  📦 DEPENDENCIES
  Zero external dependencies.

  🎨 USAGE
  <StatCard title="Revenue" value="£12,450" delta={8.2} deltaSuffix="%" deltaLabel="vs last week" />
  <StatCard title="Page load" value="1.4s" delta={-12} deltaSuffix="%" positiveDirection="down" />
  <StatCard title="Active users" value={4271} delta={0} deltaLabel="vs yesterday" />

  📋 PROPS
  | Prop              | Type                         | Default | Description |
  |-------------------|------------------------------|---------|-------------|
  | title             | string                       | ''      | Metric label |
  | value             | string \| number              | ''      | The big number (pre-formatted by caller) |
  | delta             | number                       | undefined | Trend value — sign drives the arrow |
  | deltaSuffix       | string                       | ''      | E.g. '%' or 'pts' |
  | deltaLabel        | string                       | ''      | Footer text (e.g. 'vs last week') |
  | positiveDirection | 'up' \| 'down'                | 'up'    | Which direction is "good" |
  | size              | 'sm' \| 'md' \| 'lg'           | 'md'    | Card size |
  | icon              | Snippet                      | undefined | Leading icon |
  | class             | string                       | ''      | Extra container classes |

  ============================================================
-->

<script lang="ts">
	import type { Snippet } from 'svelte';

	export type StatCardSize = 'sm' | 'md' | 'lg';
	export type StatCardDirection = 'up' | 'down';

	interface Props {
		title?: string;
		value?: string | number;
		delta?: number;
		deltaSuffix?: string;
		deltaLabel?: string;
		positiveDirection?: StatCardDirection;
		size?: StatCardSize;
		icon?: Snippet;
		class?: string;
	}

	let {
		title = '',
		value = '',
		delta,
		deltaSuffix = '',
		deltaLabel = '',
		positiveDirection = 'up',
		size = 'md',
		icon,
		class: extraClass = ''
	}: Props = $props();

	// Trend direction from delta sign — positive = up, negative = down, zero = flat.
	let trend = $derived<'up' | 'down' | 'flat'>(
		delta === undefined || delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down'
	);

	// Sentiment: does the trend match what we consider "good"?
	// For most metrics positiveDirection='up' so an upward trend reads positive.
	// For metrics like load time, errors, costs — positiveDirection='down' inverts this.
	let sentiment = $derived<'positive' | 'negative' | 'neutral'>(
		trend === 'flat'
			? 'neutral'
			: trend === positiveDirection
				? 'positive'
				: 'negative'
	);

	// Absolute formatted delta for display (sign comes from the arrow glyph).
	let deltaDisplay = $derived(
		delta === undefined ? '' : `${Math.abs(delta)}${deltaSuffix}`
	);

	// Screen-reader sentence — colour-blind / non-visual users get the full picture.
	let trendSrText = $derived(
		delta === undefined
			? ''
			: trend === 'flat'
				? `No change${deltaLabel ? ` ${deltaLabel}` : ''}`
				: `${trend === 'up' ? 'Up' : 'Down'} ${deltaDisplay}${deltaLabel ? ` ${deltaLabel}` : ''}`
	);
</script>

<article
	class="stat-card stat-{size} {extraClass}"
	data-trend={trend}
	data-sentiment={sentiment}
>
	<header class="stat-header">
		{#if icon}
			<span class="stat-icon" aria-hidden="true">
				{@render icon()}
			</span>
		{/if}
		<h3 class="stat-title">{title}</h3>
	</header>

	<div class="stat-value">{value}</div>

	{#if delta !== undefined}
		<footer class="stat-footer">
			<span class="stat-delta sentiment-{sentiment}">
				<span class="stat-arrow" aria-hidden="true">
					{#if trend === 'up'}↑{:else if trend === 'down'}↓{:else}—{/if}
				</span>
				<span>{deltaDisplay}</span>
			</span>
			{#if deltaLabel}
				<span class="stat-delta-label">{deltaLabel}</span>
			{/if}
			<span class="sr-only">{trendSrText}</span>
		</footer>
	{/if}
</article>

<style>
	.stat-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1.25rem;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}
	.stat-card:hover {
		border-color: #cbd5e1;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	/* Sizes — value font scales most, padding scales modestly */
	.stat-sm {
		padding: 0.875rem 1rem;
		gap: 0.375rem;
	}
	.stat-sm .stat-value {
		font-size: 1.5rem;
	}
	.stat-sm .stat-title {
		font-size: 0.7rem;
	}

	.stat-md .stat-value {
		font-size: 1.875rem;
	}

	.stat-lg {
		padding: 1.75rem;
		gap: 0.625rem;
	}
	.stat-lg .stat-value {
		font-size: 2.5rem;
	}
	.stat-lg .stat-title {
		font-size: 0.875rem;
	}

	.stat-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.stat-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		font-size: 1rem;
		color: #64748b;
		flex-shrink: 0;
	}

	.stat-title {
		margin: 0;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #64748b;
	}

	.stat-value {
		font-weight: 700;
		font-size: 1.875rem;
		line-height: 1.1;
		color: #0f172a;
		font-variant-numeric: tabular-nums;
	}

	.stat-footer {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		font-size: 0.8125rem;
	}

	.stat-delta {
		display: inline-flex;
		align-items: center;
		gap: 0.125rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.stat-arrow {
		font-weight: 700;
	}

	/* Sentiment — colour comes from whether the trend matches positiveDirection,
	   not from up/down absolutely. A falling load time looks positive (green). */
	.sentiment-positive {
		color: #15803d;
	}
	.sentiment-negative {
		color: #b91c1c;
	}
	.sentiment-neutral {
		color: #64748b;
	}

	.stat-delta-label {
		color: #94a3b8;
	}

	/* Visually hidden but read by screen readers */
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
		.stat-card {
			transition: none;
		}
	}
</style>
