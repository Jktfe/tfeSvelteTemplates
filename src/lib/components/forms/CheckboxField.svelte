<script lang="ts">
	import FormField from './FormField.svelte';
	import type { CheckboxFieldProps } from '$lib/types';

	let {
		name,
		label,
		checked = $bindable(false),
		helpText = '',
		required = false,
		disabled = false,
		readonly = false,
		error = '',
		touched = false,
		onblur,
		oninput
	}: CheckboxFieldProps = $props();

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
	 * Handle checkbox toggle
	 * Updates bound checked value and triggers optional callback
	 */
	function handleChange(e: Event) {
		if (readonly) return;
		const target = e.target as HTMLInputElement;
		checked = target.checked;
		oninput?.(checked);
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
	<label class="checkbox-container" class:disabled class:readonly class:error={hasError}>
		<input
			type="checkbox"
			id={fieldId}
			{name}
			{checked}
			{required}
			{disabled}
			readonly={readonly}
			class="checkbox-input"
			aria-invalid={hasError}
			aria-describedby={helpText ? helpId : undefined}
			aria-errormessage={hasError ? errorId : undefined}
			aria-required={required}
			onchange={handleChange}
			onblur={handleBlur}
		/>
		<span class="checkbox-custom" aria-hidden="true">
			<!-- Checkmark SVG (only visible when checked) -->
			{#if checked}
				<svg
					width="14"
					height="11"
					viewBox="0 0 14 11"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M1 5.5L5 9.5L13 1.5"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			{/if}
		</span>
		<span class="checkbox-label">{label}</span>
	</label>
</FormField>

<style>
	/**
	 * Checkbox Field Styles
	 * Provides consistent styling for single checkbox with custom indicator
	 */

	.checkbox-container {
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
		cursor: pointer;
		user-select: none;
		padding: 0.5rem 0;
	}

	.checkbox-container.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.checkbox-container.readonly {
		cursor: default;
		pointer-events: none;
	}

	/* Hide native checkbox input */
	.checkbox-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
		pointer-events: none;
	}

	/* Custom checkbox indicator */
	.checkbox-custom {
		position: relative;
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid #cbd5e0;
		border-radius: 0.25rem;
		background-color: #ffffff;
		transition: all 0.15s ease-in-out;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ffffff;
		margin-top: 0.125rem; /* Align with first line of label text */
	}

	/* Checkbox label text */
	.checkbox-label {
		font-size: 0.9375rem;
		line-height: 1.5;
		color: #1a202c;
		flex: 1;
	}

	/* Hover state */
	.checkbox-container:not(.disabled):not(.readonly):hover .checkbox-custom {
		border-color: #146ef5;
	}

	/* Focus state */
	.checkbox-input:focus-visible + .checkbox-custom {
		border-color: #146ef5;
		box-shadow: 0 0 0 3px rgba(20, 110, 245, 0.1);
	}

	/* Checked state */
	.checkbox-input:checked + .checkbox-custom {
		border-color: #146ef5;
		background-color: #146ef5;
	}

	/* Error state */
	.checkbox-container.error .checkbox-custom {
		border-color: #dc2626;
	}

	.checkbox-container.error .checkbox-input:checked + .checkbox-custom {
		border-color: #dc2626;
		background-color: #dc2626;
	}

	/* Disabled checked state */
	.checkbox-container.disabled .checkbox-input:checked + .checkbox-custom {
		background-color: #a0aec0;
		border-color: #a0aec0;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.checkbox-container {
			gap: 0.5rem;
			padding: 0.375rem 0;
		}

		.checkbox-custom {
			width: 1.125rem;
			height: 1.125rem;
		}

		.checkbox-label {
			font-size: 0.875rem;
		}
	}
</style>
