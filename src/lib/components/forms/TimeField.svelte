<script lang="ts">
	import FormField from './FormField.svelte';
	import type { TimeFieldProps } from '$lib/types';

	let {
		name,
		label,
		value = $bindable(''),
		placeholder = '',
		helpText = '',
		required = false,
		disabled = false,
		readonly = false,
		error = '',
		touched = false,
		min,
		max,
		onblur,
		oninput
	}: TimeFieldProps = $props();

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
		value = target.value;
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
	<input
		type="time"
		id={fieldId}
		{name}
		{value}
		{placeholder}
		{required}
		{disabled}
		{readonly}
		{min}
		{max}
		class="time-field-input"
		class:error={hasError}
		aria-invalid={hasError}
		aria-describedby={helpText ? helpId : undefined}
		aria-errormessage={hasError ? errorId : undefined}
		aria-required={required}
		oninput={handleInput}
		onblur={handleBlur}
	/>
</FormField>

<style>
	/**
	 * Time Field Styles
	 * Provides consistent styling for time inputs
	 */

	.time-field-input {
		width: 100%;
		padding: 0.625rem 0.875rem;
		font-size: 0.9375rem;
		line-height: 1.5;
		color: #1a202c;
		background-color: #ffffff;
		border: 1px solid #cbd5e0;
		border-radius: 0.375rem;
		transition: all 0.15s ease-in-out;
		font-family: inherit;
		cursor: pointer;
	}

	/* Time picker icon */
	.time-field-input::-webkit-calendar-picker-indicator {
		cursor: pointer;
		opacity: 0.7;
		transition: opacity 0.15s ease;
	}

	.time-field-input::-webkit-calendar-picker-indicator:hover {
		opacity: 1;
	}

	/* Focus state */
	.time-field-input:focus {
		outline: none;
		border-color: #146ef5;
		box-shadow: 0 0 0 3px rgba(20, 110, 245, 0.1);
	}

	/* Hover state (when not disabled) */
	.time-field-input:not(:disabled):hover {
		border-color: #a0aec0;
	}

	/* Error state */
	.time-field-input.error {
		border-color: #dc2626;
		background-color: #fef2f2;
	}

	.time-field-input.error:focus {
		border-color: #dc2626;
		box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
	}

	/* Disabled state */
	.time-field-input:disabled {
		background-color: #f7fafc;
		color: #a0aec0;
		cursor: not-allowed;
		opacity: 0.6;
	}

	/* Readonly state */
	.time-field-input:read-only {
		background-color: #f7fafc;
		cursor: default;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.time-field-input {
			font-size: 0.875rem;
			padding: 0.5rem 0.75rem;
		}
	}
</style>
