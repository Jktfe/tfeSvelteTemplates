<script lang="ts">
	import FormField from './FormField.svelte';
	import type { NumberFieldProps } from '$lib/types';

	let {
		name,
		label,
		value = $bindable(0),
		placeholder = '',
		helpText = '',
		required = false,
		disabled = false,
		readonly = false,
		error = '',
		touched = false,
		min,
		max,
		step = 1,
		onblur,
		oninput
	}: NumberFieldProps = $props();

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
	 * Handle input changes
	 * Updates bound value and triggers optional callback
	 */
	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const numValue = target.value === '' ? 0 : parseFloat(target.value);
		value = isNaN(numValue) ? 0 : numValue;
		oninput?.(value);
	}

	/**
	 * Handle blur event
	 * Marks field as touched and triggers optional callback
	 */
	function handleBlur() {
		onblur?.();
	}

	/**
	 * Increment value by step
	 * Respects max constraint
	 */
	function increment() {
		if (disabled || readonly) return;
		const newValue = value + step;
		if (max !== undefined && newValue > max) return;
		value = newValue;
		oninput?.(value);
	}

	/**
	 * Decrement value by step
	 * Respects min constraint
	 */
	function decrement() {
		if (disabled || readonly) return;
		const newValue = value - step;
		if (min !== undefined && newValue < min) return;
		value = newValue;
		oninput?.(value);
	}
</script>

<FormField {name} {label} {required} {error} {touched} {helpText}>
	<div class="number-field-container">
		<input
			id={fieldId}
			{name}
			type="number"
			{value}
			{placeholder}
			{required}
			{disabled}
			{readonly}
			{min}
			{max}
			{step}
			class="number-field-input"
			class:error={hasError}
			aria-invalid={hasError}
			aria-describedby={helpText ? helpId : undefined}
			aria-errormessage={hasError ? errorId : undefined}
			aria-required={required}
			oninput={handleInput}
			onblur={handleBlur}
		/>

		<!-- Increment/Decrement Controls -->
		{#if !readonly}
			<div class="number-controls">
				<button
					type="button"
					class="number-btn increment"
					onclick={increment}
					disabled={disabled || (max !== undefined && value >= max)}
					aria-label="Increment {label}"
					tabindex="-1"
				>
					<svg
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M6 2L6 10M2 6L10 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
				</button>
				<button
					type="button"
					class="number-btn decrement"
					onclick={decrement}
					disabled={disabled || (min !== undefined && value <= min)}
					aria-label="Decrement {label}"
					tabindex="-1"
				>
					<svg
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M2 6L10 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
				</button>
			</div>
		{/if}
	</div>
</FormField>

<style>
	/**
	 * Number Field Styles
	 * Provides consistent styling for numeric inputs with controls
	 */

	.number-field-container {
		position: relative;
		display: flex;
		align-items: stretch;
	}

	.number-field-input {
		flex: 1;
		width: 100%;
		padding: 0.625rem 0.875rem;
		padding-right: 3.5rem; /* Space for controls */
		font-size: 0.9375rem;
		line-height: 1.5;
		color: #1a202c;
		background-color: #ffffff;
		border: 1px solid #cbd5e0;
		border-radius: 0.375rem;
		transition: all 0.15s ease-in-out;
		font-family: inherit;
	}

	/* Hide native number input spinners (use custom controls instead) */
	.number-field-input::-webkit-inner-spin-button,
	.number-field-input::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.number-field-input[type='number'] {
		appearance: textfield; /* Standard property */
		-moz-appearance: textfield; /* Firefox fallback */
	}

	.number-field-input::placeholder {
		color: #a0aec0;
	}

	/* Focus state */
	.number-field-input:focus {
		outline: none;
		border-color: #146ef5;
		box-shadow: 0 0 0 3px rgba(20, 110, 245, 0.1);
	}

	/* Hover state (when not disabled) */
	.number-field-input:not(:disabled):hover {
		border-color: #a0aec0;
	}

	/* Error state */
	.number-field-input.error {
		border-color: #dc2626;
		background-color: #fef2f2;
	}

	.number-field-input.error:focus {
		border-color: #dc2626;
		box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
	}

	/* Disabled state */
	.number-field-input:disabled {
		background-color: #f7fafc;
		color: #a0aec0;
		cursor: not-allowed;
		opacity: 0.6;
	}

	/* Readonly state */
	.number-field-input:read-only {
		background-color: #f7fafc;
		cursor: default;
		padding-right: 0.875rem; /* No controls in readonly */
	}

	/* Number Controls */
	.number-controls {
		position: absolute;
		right: 0.25rem;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.number-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.25rem;
		padding: 0;
		background-color: #f7fafc;
		border: 1px solid #cbd5e0;
		border-radius: 0.25rem;
		color: #4a5568;
		cursor: pointer;
		transition: all 0.15s ease-in-out;
	}

	.number-btn:hover:not(:disabled) {
		background-color: #edf2f7;
		border-color: #a0aec0;
		color: #2d3748;
	}

	.number-btn:active:not(:disabled) {
		background-color: #e2e8f0;
		transform: scale(0.95);
	}

	.number-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.number-btn:focus-visible {
		outline: 2px solid #146ef5;
		outline-offset: 1px;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.number-field-input {
			font-size: 0.875rem;
			padding: 0.5rem 0.75rem;
			padding-right: 3rem;
		}

		.number-btn {
			width: 1.5rem;
			height: 1.125rem;
		}
	}
</style>

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
