<script lang="ts">
	/*
	 * Slider
	 *
	 * Continuous-value range input. Built on a native <input type="range">
	 * so keyboard a11y is free (← → for step, Home/End for min/max,
	 * PageUp/PageDown for large step, screen readers announce role="slider"
	 * and current/min/max). We only style the track + thumb.
	 *
	 * Two-way bind:
	 *   <Slider bind:value={volume} min={0} max={100} />
	 *
	 * The value bubble (showValue=true) renders the current value above
	 * the thumb. Position is computed as a % of the track via $derived.
	 */

	type Size = 'sm' | 'md' | 'lg';
	type Variant = 'default' | 'success' | 'danger';

	type Props = {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		label?: string;
		showValue?: boolean;
		size?: Size;
		variant?: Variant;
		disabled?: boolean;
		id?: string;
		ariaLabel?: string;
		formatValue?: (v: number) => string;
		onChange?: (value: number) => void;
		class?: string;
	};

	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		label = '',
		showValue = false,
		size = 'md',
		variant = 'default',
		disabled = false,
		id,
		ariaLabel,
		formatValue,
		onChange,
		class: className = ''
	}: Props = $props();

	const inputId = $derived(id ?? `slider-${Math.random().toString(36).slice(2, 9)}`);
	const percent = $derived(((value - min) / (max - min)) * 100);
	const displayValue = $derived(formatValue ? formatValue(value) : String(value));

	function handleInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		value = Number(target.value);
		onChange?.(value);
	}
</script>

<div class="slider-wrapper slider-{size} {className}" class:slider-disabled={disabled}>
	{#if label}
		<label class="slider-label" for={inputId}>{label}</label>
	{/if}

	<div class="slider-track-wrapper">
		{#if showValue}
			<span class="slider-bubble" style="left: {percent}%">{displayValue}</span>
		{/if}
		<input
			id={inputId}
			type="range"
			class="slider-input slider-{variant}"
			{min}
			{max}
			{step}
			{value}
			{disabled}
			aria-label={ariaLabel ?? (label ? undefined : 'Slider')}
			oninput={handleInput}
			style="--percent: {percent}%"
		/>
	</div>
</div>

<style>
	.slider-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.slider-disabled {
		opacity: 0.5;
	}

	.slider-label {
		font-size: 0.875rem;
		color: #1a202c;
		font-weight: 500;
	}

	.slider-track-wrapper {
		position: relative;
		width: 100%;
	}

	.slider-bubble {
		position: absolute;
		bottom: calc(100% + 0.5rem);
		transform: translateX(-50%);
		background-color: #1a202c;
		color: #ffffff;
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.125rem 0.5rem;
		border-radius: 0.375rem;
		pointer-events: none;
		white-space: nowrap;
	}

	.slider-bubble::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 4px solid transparent;
		border-right: 4px solid transparent;
		border-top: 4px solid #1a202c;
	}

	/* Reset native styling */
	.slider-input {
		appearance: none;
		-webkit-appearance: none;
		width: 100%;
		background: transparent;
		cursor: pointer;
		margin: 0;
		padding: 0;
	}

	.slider-input:disabled {
		cursor: not-allowed;
	}

	.slider-input:focus {
		outline: none;
	}

	/* WebKit / Chromium / Safari track */
	.slider-input::-webkit-slider-runnable-track {
		height: var(--track-h, 6px);
		border-radius: 9999px;
		background: linear-gradient(
			to right,
			var(--fill-color, #146ef5) 0%,
			var(--fill-color, #146ef5) var(--percent),
			#e2e8f0 var(--percent),
			#e2e8f0 100%
		);
	}

	/* WebKit thumb */
	.slider-input::-webkit-slider-thumb {
		appearance: none;
		-webkit-appearance: none;
		width: var(--thumb-size, 18px);
		height: var(--thumb-size, 18px);
		border-radius: 9999px;
		background-color: #ffffff;
		border: 2px solid var(--fill-color, #146ef5);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
		margin-top: calc((var(--track-h, 6px) - var(--thumb-size, 18px)) / 2);
		cursor: grab;
		transition: transform 0.15s ease;
	}

	.slider-input:active::-webkit-slider-thumb {
		cursor: grabbing;
		transform: scale(1.15);
	}

	.slider-input:focus-visible::-webkit-slider-thumb {
		box-shadow: 0 0 0 4px rgba(20, 110, 245, 0.25);
	}

	/* Firefox track */
	.slider-input::-moz-range-track {
		height: var(--track-h, 6px);
		border-radius: 9999px;
		background-color: #e2e8f0;
	}

	.slider-input::-moz-range-progress {
		height: var(--track-h, 6px);
		border-radius: 9999px;
		background-color: var(--fill-color, #146ef5);
	}

	/* Firefox thumb */
	.slider-input::-moz-range-thumb {
		width: var(--thumb-size, 18px);
		height: var(--thumb-size, 18px);
		border-radius: 9999px;
		background-color: #ffffff;
		border: 2px solid var(--fill-color, #146ef5);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
		cursor: grab;
		transition: transform 0.15s ease;
	}

	.slider-input:active::-moz-range-thumb {
		cursor: grabbing;
		transform: scale(1.15);
	}

	/* Sizes */
	.slider-sm {
		--track-h: 4px;
		--thumb-size: 14px;
	}
	.slider-md {
		--track-h: 6px;
		--thumb-size: 18px;
	}
	.slider-lg {
		--track-h: 8px;
		--thumb-size: 22px;
	}

	/* Variants — fill colour */
	.slider-default {
		--fill-color: #146ef5;
	}
	.slider-success {
		--fill-color: #16a34a;
	}
	.slider-danger {
		--fill-color: #dc2626;
	}

	@media (prefers-reduced-motion: reduce) {
		.slider-input::-webkit-slider-thumb,
		.slider-input::-moz-range-thumb {
			transition: none;
		}
		.slider-input:active::-webkit-slider-thumb,
		.slider-input:active::-moz-range-thumb {
			transform: none;
		}
	}
</style>
