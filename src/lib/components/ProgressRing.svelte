<!--
  ============================================================
  ProgressRing - Circular Progress Indicator
  ============================================================

  🎯 WHAT IT DOES
  Renders a circular progress indicator. In determinate mode it shows a
  precise percentage; in indeterminate mode it spins to communicate
  "working but no progress information available". Pairs nicely with
  StatCard, EmptyState, and SkeletonLoader.

  ✨ FEATURES
  • Determinate (0–100) and indeterminate (spinning) modes
  • Configurable size and stroke thickness
  • Custom track / progress colours via props
  • Centred label snippet — show the % number, an icon, anything
  • Accessible — role="progressbar" with aria-valuenow / valuemin / valuemax
  • Honours prefers-reduced-motion (slow spin / fade)

  ♿ ACCESSIBILITY
  • role="progressbar" with aria-valuemin/max/now in determinate mode
  • aria-valuetext for human-readable announcement (e.g. "75 percent")
  • aria-label or aria-labelledby for the indicator's purpose
  • Indeterminate mode omits aria-valuenow per ARIA spec

  📦 DEPENDENCIES
  Zero external dependencies. Pure SVG + CSS animation.

  🎨 USAGE
  Determinate (75%):
  <ProgressRing value={75}>
    {#snippet label()}<strong>75%</strong>{/snippet}
  </ProgressRing>

  Indeterminate (loading):
  <ProgressRing indeterminate ariaLabel="Loading data" />

  Custom colours:
  <ProgressRing value={42} progressColor="#22c55e" trackColor="#dcfce7" />

  📋 PROPS
  | Prop           | Type      | Default     | Description |
  |----------------|-----------|-------------|-------------|
  | value          | number    | 0           | Progress 0–100 (ignored if indeterminate) |
  | indeterminate  | boolean   | false       | Spin without a fixed value |
  | size           | number    | 64          | Diameter in px |
  | stroke         | number    | 6           | Ring thickness in px |
  | trackColor     | string    | '#e2e8f0'   | Background ring colour |
  | progressColor  | string    | '#3b82f6'   | Foreground stroke colour |
  | ariaLabel      | string    | undefined   | Accessible label |
  | label          | Snippet   | undefined   | Centred label |
  | class          | string    | ''          | Extra classes |

  ============================================================
-->

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		value?: number;
		indeterminate?: boolean;
		size?: number;
		stroke?: number;
		trackColor?: string;
		progressColor?: string;
		ariaLabel?: string;
		label?: Snippet;
		class?: string;
	}

	let {
		value = 0,
		indeterminate = false,
		size = 64,
		stroke = 6,
		trackColor = '#e2e8f0',
		progressColor = '#3b82f6',
		ariaLabel,
		label,
		class: extraClass = ''
	}: Props = $props();

	let radius = $derived((size - stroke) / 2);
	let circumference = $derived(2 * Math.PI * radius);

	// Clamp value into [0, 100] so callers can't break the geometry.
	let clamped = $derived(Math.max(0, Math.min(100, value)));

	// In determinate mode, dashoffset shrinks as value grows.
	// In indeterminate mode, we use a fixed arc that gets spun by CSS.
	let dashOffset = $derived(circumference - (clamped / 100) * circumference);

	let valueText = $derived(indeterminate ? undefined : `${Math.round(clamped)} percent`);
</script>

<div
	class="progress-ring {extraClass}"
	class:progress-indeterminate={indeterminate}
	style:width="{size}px"
	style:height="{size}px"
	role="progressbar"
	aria-label={ariaLabel}
	aria-valuemin={indeterminate ? undefined : 0}
	aria-valuemax={indeterminate ? undefined : 100}
	aria-valuenow={indeterminate ? undefined : clamped}
	aria-valuetext={valueText}
>
	<svg
		class="progress-svg"
		viewBox="0 0 {size} {size}"
		width={size}
		height={size}
		aria-hidden="true"
	>
		<circle
			class="progress-track"
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke={trackColor}
			stroke-width={stroke}
		/>
		<circle
			class="progress-bar"
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke={progressColor}
			stroke-width={stroke}
			stroke-linecap="round"
			stroke-dasharray={circumference}
			stroke-dashoffset={indeterminate ? circumference * 0.75 : dashOffset}
			transform="rotate(-90 {size / 2} {size / 2})"
		/>
	</svg>

	{#if label}
		<span class="progress-label">
			{@render label()}
		</span>
	{/if}
</div>

<style>
	.progress-ring {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.progress-svg {
		display: block;
	}

	.progress-bar {
		transition: stroke-dashoffset 0.4s ease;
	}

	.progress-label {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: #0f172a;
		pointer-events: none;
	}

	/* Indeterminate spin: the SVG itself rotates so the visible arc sweeps. */
	.progress-indeterminate .progress-svg {
		animation: progress-spin 1s linear infinite;
	}
	.progress-indeterminate .progress-bar {
		transition: none;
	}

	@keyframes progress-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.progress-bar {
			transition: none;
		}
		.progress-indeterminate .progress-svg {
			animation-duration: 4s;
		}
	}
</style>
