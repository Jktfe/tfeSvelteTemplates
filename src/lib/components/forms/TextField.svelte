<script lang="ts">
	/**
	 * ============================================================
	 * TextField - Text Input Component
	 * ============================================================
	 *
	 * [CR] WHAT IT DOES
	 * Reusable text input supporting text/email/url/tel/password/search types.
	 * Wraps an HTML input with FormField for consistent styling and accessibility.
	 *
	 * [NTL] THE SIMPLE VERSION
	 * This is your standard text box! Type in your name, email, password...
	 * It handles all the common input types and makes them look nice.
	 *
	 * ============================================================
	 * @component
	 */

	// [CR] IMPORTS
	import FormField from './FormField.svelte';
	import type { TextFieldProps } from '$lib/types';

	// [CR] COMPONENT PROPS
	// [NTL] All the ways you can customise this text input!
	let {
		name,
		label,
		type = 'text', // [NTL] Can be: text, email, url, tel, password, search
		value = $bindable(''), // [CR] Two-way binding with $bindable rune
		placeholder = '',
		helpText = '',
		required = false,
		disabled = false,
		readonly = false,
		error = '',
		touched = false,
		maxlength,
		pattern, // [CR] Regex pattern for validation
		autocomplete, // [NTL] Browser's "remember this" feature
		onblur,
		oninput
	}: TextFieldProps = $props();

	// [CR] DERIVED VALUES - Computed IDs for accessibility
	let fieldId = $derived(`field-${name}`);
	let helpId = $derived(`${name}-help`);
	let errorId = $derived(`${name}-error`);

	// [CR] Error state for conditional styling
	// [NTL] Only show error styling after the field has been "touched"
	let hasError = $derived(touched && !!error);

	// [CR] EVENT HANDLERS

	/**
	 * [CR] Handle input changes - updates bound value and triggers callback
	 * [NTL] Every keystroke updates the value and lets the parent know!
	 */
	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		oninput?.(value);
	}

	/**
	 * [CR] Handle blur event - marks field as touched
	 * [NTL] When you click away from the field, we mark it as "touched"
	 */
	function handleBlur() {
		onblur?.();
	}
</script>

<FormField {name} {label} {required} {error} {touched} {helpText}>
	<input
		id={fieldId}
		{name}
		{type}
		{value}
		{placeholder}
		{required}
		{disabled}
		{readonly}
		{maxlength}
		{pattern}
		autocomplete={autocomplete as any}
		class="text-field-input"
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
	 * Text Field Input Styles
	 * Provides consistent styling for text-based inputs
	 */

	.text-field-input {
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
	}

	.text-field-input::placeholder {
		color: #a0aec0;
	}

	/* Focus state */
	.text-field-input:focus {
		outline: none;
		border-color: #146ef5;
		box-shadow: 0 0 0 3px rgba(20, 110, 245, 0.1);
	}

	/* Hover state (when not disabled) */
	.text-field-input:not(:disabled):hover {
		border-color: #a0aec0;
	}

	/* Error state */
	.text-field-input.error {
		border-color: #dc2626;
		background-color: #fef2f2;
	}

	.text-field-input.error:focus {
		border-color: #dc2626;
		box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
	}

	/* Disabled state */
	.text-field-input:disabled {
		background-color: #f7fafc;
		color: #a0aec0;
		cursor: not-allowed;
		opacity: 0.6;
	}

	/* Readonly state */
	.text-field-input:read-only {
		background-color: #f7fafc;
		cursor: default;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.text-field-input {
			font-size: 0.875rem;
			padding: 0.5rem 0.75rem;
		}
	}
</style>
