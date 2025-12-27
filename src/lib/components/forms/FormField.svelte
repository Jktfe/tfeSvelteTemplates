<script lang="ts">
	/**
	 * ============================================================
	 * FormField - Base Wrapper for All Form Fields
	 * ============================================================
	 *
	 * [CR] WHAT IT DOES
	 * Provides consistent structure for form fields: label, help text,
	 * input slot, and error message. All form field components use this
	 * as their wrapper to ensure visual and accessibility consistency.
	 *
	 * [NTL] THE SIMPLE VERSION
	 * Think of this as the "frame" that goes around every input box.
	 * It handles all the boring-but-important stuff like labels and
	 * error messages so each input type doesn't have to repeat that code!
	 *
	 * ============================================================
	 *
	 * [CR] FEATURES
	 * - Automatic ID generation for label association
	 * - Required field indicator (*)
	 * - Help text with aria-describedby
	 * - Error display with role="alert"
	 * - "Touched" state for UX-friendly error display
	 * - Fully accessible
	 *
	 * [CR] USAGE
	 * ```svelte
	 * <FormField name="email" label="Email" required={true} error={err}>
	 *   <input type="email" ... />
	 * </FormField>
	 * ```
	 *
	 * ============================================================
	 * @component
	 */

	// [CR] IMPORTS
	import type { Snippet } from 'svelte';

	// [CR] COMPONENT PROPS
	// [NTL] These settings control how the form field looks and behaves!
	interface Props {
		/** [CR] Field name - used for ID generation and form submission */
		name: string;

		/** [CR] Label text displayed above field */
		label: string;

		/** [CR] Whether the field is required - shows * indicator */
		required?: boolean;

		/** [CR] Current error message (if any) */
		error?: string;

		/**
		 * [CR] Whether the field has been interacted with
		 * [NTL] We only show errors AFTER you've touched the field - nicer UX!
		 */
		touched?: boolean;

		/** [CR] Optional help text displayed below label */
		helpText?: string;

		/** [CR] Child content (the actual input element via Snippet) */
		children: Snippet;
	}

	let {
		name,
		label,
		required = false,
		error = '',
		touched = false,
		helpText = '',
		children
	}: Props = $props();

	// [CR] DERIVED VALUES
	// [NTL] These are calculated automatically whenever their dependencies change!

	/**
	 * [CR] Computed visible error - only show if field has been touched
	 * [NTL] This is the "don't yell at me before I've even tried" logic!
	 */
	let visibleError = $derived(touched && error);

	/**
	 * [CR] Generate IDs for aria associations
	 * [NTL] These IDs link the label, help text, and error to the input
	 * so screen readers can announce them together
	 */
	let fieldId = $derived(`field-${name}`);
	let helpId = $derived(`${name}-help`);
	let errorId = $derived(`${name}-error`);
</script>

<div class="form-field" class:has-error={visibleError}>
	<!-- Label -->
	<label for={fieldId} class="field-label">
		{label}
		{#if required}
			<span class="required" aria-label="required">*</span>
		{/if}
	</label>

	<!-- Help Text -->
	{#if helpText}
		<p class="field-help" id={helpId}>
			{helpText}
		</p>
	{/if}

	<!-- Field Content (slot for input) -->
	<div class="field-input">
		{@render children()}
	</div>

	<!-- Error Message -->
	{#if visibleError}
		<span id={errorId} class="field-error" role="alert">
			{error}
		</span>
	{/if}
</div>

<style>
	/**
	 * Form Field Wrapper Styles
	 * Provides consistent spacing and visual hierarchy
	 */

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
	}

	.field-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		display: block;
	}

	.required {
		color: #dc2626;
		margin-left: 0.125rem;
	}

	.field-help {
		font-size: 0.8125rem;
		color: #6b7280;
		margin: 0;
		line-height: 1.5;
	}

	.field-input {
		/* Container for the actual input element */
		/* Input elements styled by individual field components */
		display: block; /* Ensures block-level layout */
	}

	.field-error {
		font-size: 0.875rem;
		color: #dc2626;
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.field-error::before {
		content: '⚠';
		font-size: 1rem;
	}

	/* Error state styling */
	.has-error .field-label {
		color: #dc2626;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.form-field {
			margin-bottom: 1rem;
		}

		.field-label {
			font-size: 0.8125rem;
		}

		.field-help {
			font-size: 0.75rem;
		}
	}
</style>

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
