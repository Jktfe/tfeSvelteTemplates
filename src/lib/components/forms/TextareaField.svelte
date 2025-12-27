<script lang="ts">
	import FormField from './FormField.svelte';
	import type { TextareaFieldProps } from '$lib/types';

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
		rows = 4,
		maxlength,
		showCharCount = false,
		onblur,
		oninput
	}: TextareaFieldProps = $props();

	/**
	 * Generate IDs for aria associations
	 */
	let fieldId = $derived(`field-${name}`);
	let helpId = $derived(`${name}-help`);
	let errorId = $derived(`${name}-error`);
	let charCountId = $derived(`${name}-char-count`);

	/**
	 * Determine if field has error state for styling
	 */
	let hasError = $derived(touched && !!error);

	/**
	 * Calculate character count and remaining characters
	 */
	let charCount = $derived(value.length);
	let charsRemaining = $derived(maxlength ? maxlength - charCount : null);
	let isNearLimit = $derived(maxlength && charsRemaining !== null && charsRemaining <= 20);

	/**
	 * Handle input changes
	 * Updates bound value and triggers optional callback
	 */
	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
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
	<textarea
		id={fieldId}
		{name}
		{value}
		{placeholder}
		{required}
		{disabled}
		{readonly}
		{rows}
		{maxlength}
		class="textarea-field-input"
		class:error={hasError}
		aria-invalid={hasError}
		aria-describedby={[
			helpText ? helpId : undefined,
			showCharCount && maxlength ? charCountId : undefined
		]
			.filter(Boolean)
			.join(' ') || undefined}
		aria-errormessage={hasError ? errorId : undefined}
		aria-required={required}
		oninput={handleInput}
		onblur={handleBlur}
	></textarea>

	<!-- Character Count Display -->
	{#if showCharCount && maxlength}
		<div
			id={charCountId}
			class="char-count"
			class:near-limit={isNearLimit}
			aria-live="polite"
			aria-atomic="true"
		>
			{charCount} / {maxlength}
			{#if isNearLimit && charsRemaining !== null}
				<span class="chars-remaining">({charsRemaining} remaining)</span>
			{/if}
		</div>
	{/if}
</FormField>

<style>
	/**
	 * Textarea Field Styles
	 * Provides consistent styling for multiline text inputs
	 */

	.textarea-field-input {
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
		resize: vertical;
		min-height: 5rem;
	}

	.textarea-field-input::placeholder {
		color: #a0aec0;
	}

	/* Focus state */
	.textarea-field-input:focus {
		outline: none;
		border-color: #146ef5;
		box-shadow: 0 0 0 3px rgba(20, 110, 245, 0.1);
	}

	/* Hover state (when not disabled) */
	.textarea-field-input:not(:disabled):hover {
		border-color: #a0aec0;
	}

	/* Error state */
	.textarea-field-input.error {
		border-color: #dc2626;
		background-color: #fef2f2;
	}

	.textarea-field-input.error:focus {
		border-color: #dc2626;
		box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
	}

	/* Disabled state */
	.textarea-field-input:disabled {
		background-color: #f7fafc;
		color: #a0aec0;
		cursor: not-allowed;
		opacity: 0.6;
		resize: none;
	}

	/* Readonly state */
	.textarea-field-input:read-only {
		background-color: #f7fafc;
		cursor: default;
	}

	/* Character Count Display */
	.char-count {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.375rem;
		margin-top: 0.25rem;
		font-size: 0.8125rem;
		color: #6b7280;
	}

	.char-count.near-limit {
		color: #d97706;
		font-weight: 500;
	}

	.chars-remaining {
		color: inherit;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.textarea-field-input {
			font-size: 0.875rem;
			padding: 0.5rem 0.75rem;
		}

		.char-count {
			font-size: 0.75rem;
		}
	}
</style>

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
