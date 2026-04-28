<!--
  ============================================================
  ProgressBar — Linear progress indicator
  ============================================================

  WHAT IT DOES
  A horizontal bar that fills to show how much of a task is done.
  Pass a number 0–100 for determinate progress, or pass `value={null}`
  for an indeterminate animated stripe (we don't know the % yet).

  FEATURES
  - Determinate (0–100) or indeterminate animated mode
  - Three sizes (sm / md / lg) and four colour variants
  - Optional value label — above the bar, inline-end, or hidden
  - Custom percent formatter (e.g. "42%" → "42 of 100")
  - Custom max value (default 100)
  - Auto "complete" state at 100% (different colour pulse)
  - Honours prefers-reduced-motion (no stripe animation)
  - Pure Svelte 5 runes, zero dependencies

  ACCESSIBILITY
  - Uses semantic <progress> element under the hood — screen readers
    announce "X percent" automatically
  - aria-label or aria-labelledby for context
  - Indeterminate: omit `value` so SR announces "loading"
  - Stripe animation respects prefers-reduced-motion

  USAGE
  Determinate (you know the percent):
      <ProgressBar value={40} ariaLabel="Upload progress" />

  Indeterminate (still working, no estimate):
      <ProgressBar value={null} ariaLabel="Loading" />

  Inline value with custom format:
      <ProgressBar value={3} max={5} showValue="inline"
                   format={(v, m) => `${v} of ${m} steps`} />

  Variant for completed/error:
      <ProgressBar value={100} variant="success" />

  PROPS
  | Prop       | Type                            | Default     | Description |
  |------------|---------------------------------|-------------|-------------|
  | value      | number \| null                  | 0           | Current progress; null = indeterminate |
  | max        | number                          | 100         | Maximum value |
  | size       | 'sm' \| 'md' \| 'lg'            | 'md'        | Bar height |
  | variant    | 'default' \| 'success' \| 'warning' \| 'danger' | 'default' | Colour scheme |
  | showValue  | 'above' \| 'inline' \| 'none'   | 'none'      | Where the label sits |
  | format     | (value, max) => string          | percent fn  | Custom label formatter |
  | ariaLabel  | string                          | 'Progress'  | aria-label on the bar |
  | class      | string                          | ''          | Extra classes on the wrapper |
  ============================================================
-->

<script lang="ts">
	export type ProgressBarSize = 'sm' | 'md' | 'lg';
	export type ProgressBarVariant = 'default' | 'success' | 'warning' | 'danger';
	export type ProgressBarLabelPosition = 'above' | 'inline' | 'none';

	interface Props {
		value?: number | null;
		max?: number;
		size?: ProgressBarSize;
		variant?: ProgressBarVariant;
		showValue?: ProgressBarLabelPosition;
		format?: (value: number, max: number) => string;
		ariaLabel?: string;
		class?: string;
	}

	let {
		value = 0,
		max = 100,
		size = 'md',
		variant = 'default',
		showValue = 'none',
		format,
		ariaLabel = 'Progress',
		class: extraClass = ''
	}: Props = $props();

	// Indeterminate mode kicks in when value is explicitly null — not zero!
	// (zero is a valid determinate state: "0% done")
	const isIndeterminate = $derived(value === null);

	// Clamp value into [0, max] so a runaway data feed can't break the layout
	const safeValue = $derived(
		isIndeterminate ? 0 : Math.max(0, Math.min(max, value as number))
	);

	const percent = $derived(isIndeterminate ? 0 : (safeValue / max) * 100);
	const isComplete = $derived(!isIndeterminate && safeValue >= max);

	// Default formatter shows whole-number percent — easy to override
	const labelText = $derived(
		isIndeterminate
			? ''
			: format
				? format(safeValue, max)
				: `${Math.round(percent)}%`
	);
</script>

<div
	class="pb pb-{size} pb-{variant} {isComplete ? 'pb-complete' : ''} {extraClass}"
	class:pb-indeterminate={isIndeterminate}
>
	{#if showValue === 'above' && !isIndeterminate}
		<div class="pb-label pb-label-above">
			<span class="pb-label-text">{ariaLabel}</span>
			<span class="pb-label-value">{labelText}</span>
		</div>
	{/if}

	<div class="pb-row">
		<div class="pb-track">
			<!--
				The native <progress> element is hidden visually but kept in the DOM
				so screen readers announce "X percent" without us re-implementing
				the announcement contract. The visible bar is a styled <div> sibling
				because <progress> styling is inconsistent across browsers.
			-->
			<progress
				class="pb-native"
				value={isIndeterminate ? undefined : safeValue}
				{max}
				aria-label={ariaLabel}
			></progress>
			<div
				class="pb-fill"
				style:width={isIndeterminate ? undefined : `${percent}%`}
				aria-hidden="true"
			></div>
		</div>

		{#if showValue === 'inline' && !isIndeterminate}
			<span class="pb-label-inline" aria-hidden="true">{labelText}</span>
		{/if}
	</div>
</div>

<style>
	.pb {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		font-family: inherit;
	}

	.pb-row {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.pb-label-above {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-size: 0.875rem;
	}

	.pb-label-text {
		color: #374151;
		font-weight: 500;
	}

	.pb-label-value {
		color: #6b7280;
		font-variant-numeric: tabular-nums;
	}

	.pb-label-inline {
		font-size: 0.875rem;
		color: #6b7280;
		font-variant-numeric: tabular-nums;
		min-width: 3rem;
		text-align: right;
	}

	.pb-track {
		position: relative;
		flex: 1;
		min-width: 0;
		background: #e5e7eb;
		border-radius: 9999px;
		overflow: hidden;
	}

	.pb-sm .pb-track {
		height: 4px;
	}

	.pb-md .pb-track {
		height: 8px;
	}

	.pb-lg .pb-track {
		height: 12px;
	}

	/* Visually hide the native progress but keep it accessible */
	.pb-native {
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

	.pb-fill {
		height: 100%;
		background: #146ef5;
		border-radius: inherit;
		transition: width 0.3s ease;
	}

	.pb-success .pb-fill {
		background: #16a34a;
	}

	.pb-warning .pb-fill {
		background: #f59e0b;
	}

	.pb-danger .pb-fill {
		background: #dc2626;
	}

	.pb-complete .pb-fill {
		background: #16a34a;
	}

	/*
	  Indeterminate stripe animation: a 50%-wide gradient slides across
	  the track on repeat. We use background-position rather than transform
	  so the stripe never escapes the rounded clip mask.
	*/
	.pb-indeterminate .pb-fill {
		width: 50%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			#146ef5 50%,
			transparent 100%
		);
		animation: pb-slide 1.5s ease-in-out infinite;
	}

	.pb-indeterminate.pb-success .pb-fill {
		background: linear-gradient(90deg, transparent 0%, #16a34a 50%, transparent 100%);
	}

	.pb-indeterminate.pb-warning .pb-fill {
		background: linear-gradient(90deg, transparent 0%, #f59e0b 50%, transparent 100%);
	}

	.pb-indeterminate.pb-danger .pb-fill {
		background: linear-gradient(90deg, transparent 0%, #dc2626 50%, transparent 100%);
	}

	@keyframes pb-slide {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(200%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pb-fill {
			transition: none;
		}
		.pb-indeterminate .pb-fill {
			animation: none;
			width: 100%;
			opacity: 0.5;
		}
	}
</style>
