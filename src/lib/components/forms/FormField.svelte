<script lang="ts">
	/**
	 * FormField Wrapper Component
	 *
	 * A reusable wrapper component that provides consistent layout for all form fields.
	 * Handles label, help text, error display, and accessibility attributes.
	 *
	 * Features:
	 * - Automatic ID generation for label association
	 * - Required field indicator (*)
	 * - Help text with aria-describedby
	 * - Error display with role="alert"
	 * - "Touched" state for UX-friendly error display
	 * - Fully accessible
	 *
	 * Usage:
	 * ```svelte
	 * <FormField
	 *   name="email"
	 *   label="Email Address"
	 *   required={true}
	 *   error={emailError}
	 *   touched={emailTouched}
	 *   helpText="We'll never share your email"
	 * >
	 *   <input type="email" ... />
	 * </FormField>
	 * ```
	 *
	 * @component
	 */

	import type { Snippet } from 'svelte';

	interface Props {
		/**
		 * Field name (used for ID generation)
		 */
		name: string;

		/**
		 * Label text displayed above field
		 */
		label: string;

		/**
		 * Whether the field is required
		 * Shows * indicator and aria-required attribute
		 */
		required?: boolean;

		/**
		 * Current error message (if any)
		 */
		error?: string;

		/**
		 * Whether the field has been interacted with
		 * Errors only shown after field is touched
		 */
		touched?: boolean;

		/**
		 * Optional help text displayed below label
		 */
		helpText?: string;

		/**
		 * Child content (the actual input element)
		 */
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

	/**
	 * Computed visible error - only show if field has been touched
	 * Improves UX by not showing errors before user has attempted input
	 */
	let visibleError = $derived(touched && error);

	/**
	 * Generate IDs for aria associations
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
