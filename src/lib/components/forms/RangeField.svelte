<script lang="ts">
	import FormField from './FormField.svelte';
	import type { RangeFieldProps } from '$lib/types';

	let {
		name,
		label,
		value = $bindable(0),
		helpText = '',
		required = false,
		disabled = false,
		readonly = false,
		error = '',
		touched = false,
		min,
		max,
		step = 1,
		showValue = false,
		showMinMax = false,
		onblur,
		oninput
	}: RangeFieldProps = $props();

	/**
	 * Generate IDs for aria associations
	 */
	let fieldId = $derived(`field-${name}`);
	let helpId = $derived(`${name}-help`);
	let errorId = $derived(`${name}-error`);

	/**
	 * Determine if field has error state for styling
	 */
	let hasError = $derived(touched && !!error);

	/**
	 * Calculate percentage for visual indicator
	 */
	let percentage = $derived(((value - min) / (max - min)) * 100);

	/**
	 * Handle input changes
	 * Updates bound value and triggers optional callback
	 */
	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = parseFloat(target.value);
		oninput?.(value);
	}

	/**
	 * Handle blur event
	 * Marks field as touched and triggers optional callback
	 */
	function handleBlur() {
		onblur?.();
	}
</script>

<FormField {name} {label} {required} {error} {touched} {helpText}>
	<div class="range-field-container">
		<!-- Min/Max Labels -->
		{#if showMinMax}
			<div class="range-labels">
				<span class="range-label-min">{min}</span>
				<span class="range-label-max">{max}</span>
			</div>
		{/if}

		<!-- Range Input with Custom Styling -->
		<div class="range-input-wrapper">
			<input
				type="range"
				id={fieldId}
				{name}
				{value}
				{min}
				{max}
				{step}
				{required}
				{disabled}
				readonly={readonly}
				class="range-input"
				class:error={hasError}
				style="--range-percentage: {percentage}%"
				aria-invalid={hasError}
				aria-describedby={helpText ? helpId : undefined}
				aria-errormessage={hasError ? errorId : undefined}
				aria-valuemin={min}
				aria-valuemax={max}
				aria-valuenow={value}
				oninput={handleInput}
				onblur={handleBlur}
			/>

			<!-- Current Value Display -->
			{#if showValue}
				<div class="range-value" aria-live="polite" aria-atomic="true">
					{value}
				</div>
			{/if}
		</div>
	</div>
</FormField>

<style>
	/**
	 * Range Field Styles
	 * Provides custom styling for range slider with visual feedback
	 */

	.range-field-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.range-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.8125rem;
		color: #6b7280;
	}

	.range-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	/* Range Input */
	.range-input {
		flex: 1;
		height: 0.5rem;
		-webkit-appearance: none;
		appearance: none;
		background: transparent;
		outline: none;
		cursor: pointer;
	}

	/* Track (Webkit/Blink) */
	.range-input::-webkit-slider-runnable-track {
		width: 100%;
		height: 0.5rem;
		background: linear-gradient(
				to right,
				#146ef5 0%,
				#146ef5 var(--range-percentage),
				#e2e8f0 var(--range-percentage),
				#e2e8f0 100%
			);
		border-radius: 0.25rem;
		transition: background 0.15s ease;
	}

	/* Track (Firefox) */
	.range-input::-moz-range-track {
		width: 100%;
		height: 0.5rem;
		background: #e2e8f0;
		border-radius: 0.25rem;
	}

	/* Progress (Firefox) */
	.range-input::-moz-range-progress {
		height: 0.5rem;
		background: #146ef5;
		border-radius: 0.25rem;
	}

	/* Thumb (Webkit/Blink) */
	.range-input::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 1.25rem;
		height: 1.25rem;
		background: #146ef5;
		border: 2px solid #ffffff;
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: all 0.15s ease;
	}

	/* Thumb (Firefox) */
	.range-input::-moz-range-thumb {
		width: 1.25rem;
		height: 1.25rem;
		background: #146ef5;
		border: 2px solid #ffffff;
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: all 0.15s ease;
	}

	/* Hover State */
	.range-input:not(:disabled):hover::-webkit-slider-thumb {
		background: #0c5dd6;
		transform: scale(1.1);
	}

	.range-input:not(:disabled):hover::-moz-range-thumb {
		background: #0c5dd6;
		transform: scale(1.1);
	}

	/* Focus State */
	.range-input:focus-visible::-webkit-slider-thumb {
		box-shadow: 0 0 0 3px rgba(20, 110, 245, 0.3);
	}

	.range-input:focus-visible::-moz-range-thumb {
		box-shadow: 0 0 0 3px rgba(20, 110, 245, 0.3);
	}

	/* Error State */
	.range-input.error::-webkit-slider-runnable-track {
		background: linear-gradient(
				to right,
				#dc2626 0%,
				#dc2626 var(--range-percentage),
				#fee2e2 var(--range-percentage),
				#fee2e2 100%
			);
	}

	.range-input.error::-moz-range-progress {
		background: #dc2626;
	}

	.range-input.error::-webkit-slider-thumb {
		background: #dc2626;
	}

	.range-input.error::-moz-range-thumb {
		background: #dc2626;
	}

	/* Disabled State */
	.range-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.range-input:disabled::-webkit-slider-thumb {
		cursor: not-allowed;
		background: #a0aec0;
	}

	.range-input:disabled::-moz-range-thumb {
		cursor: not-allowed;
		background: #a0aec0;
	}

	/* Current Value Display */
	.range-value {
		min-width: 3rem;
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #1a202c;
		background-color: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		text-align: center;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.range-labels {
			font-size: 0.75rem;
		}

		.range-input::-webkit-slider-thumb {
			width: 1.125rem;
			height: 1.125rem;
		}

		.range-input::-moz-range-thumb {
			width: 1.125rem;
			height: 1.125rem;
		}

		.range-value {
			min-width: 2.5rem;
			padding: 0.25rem 0.5rem;
			font-size: 0.8125rem;
		}
	}
</style>

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
