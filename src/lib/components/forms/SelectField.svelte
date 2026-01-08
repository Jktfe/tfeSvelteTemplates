<script lang="ts">
	import FormField from './FormField.svelte';
	import type { SelectFieldProps } from '$lib/types';

	let {
		name,
		label,
		value = $bindable(''),
		options,
		placeholder = '',
		helpText = '',
		required = false,
		disabled = false,
		readonly = false,
		error = '',
		touched = false,
		onblur,
		oninput
	}: SelectFieldProps = $props();

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
	 * Handle selection changes
	 * Updates bound value and triggers optional callback
	 */
	function handleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
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
	<div class="select-field-container">
		<select
			id={fieldId}
			{name}
			{value}
			{required}
			{disabled}
			class="select-field-input"
			class:error={hasError}
			class:readonly={readonly}
			aria-invalid={hasError}
			aria-describedby={helpText ? helpId : undefined}
			aria-errormessage={hasError ? errorId : undefined}
			aria-required={required}
			onchange={handleChange}
			onblur={handleBlur}
		>
			<!-- Placeholder option -->
			{#if placeholder}
				<option value="" disabled selected={value === ''}>
					{placeholder}
				</option>
			{/if}

			<!-- Options list -->
			{#each options as option (option.value)}
				<option value={option.value} disabled={option.disabled} selected={value === option.value}>
					{option.label}
				</option>
			{/each}
		</select>

		<!-- Custom dropdown arrow icon -->
		<div class="select-arrow" aria-hidden="true">
			<svg
				width="12"
				height="8"
				viewBox="0 0 12 8"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M1 1.5L6 6.5L11 1.5"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</div>
	</div>
</FormField>

<style>
	/**
	 * Select Field Styles
	 * Provides consistent styling for dropdown selects with custom arrow
	 */

	.select-field-container {
		position: relative;
		display: flex;
		align-items: stretch;
	}

	.select-field-input {
		flex: 1;
		width: 100%;
		padding: 0.625rem 2.5rem 0.625rem 0.875rem;
		font-size: 0.9375rem;
		line-height: 1.5;
		color: #1a202c;
		background-color: #ffffff;
		border: 1px solid #cbd5e0;
		border-radius: 0.375rem;
		transition: all 0.15s ease-in-out;
		font-family: inherit;
		cursor: pointer;
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
	}

	/* Focus state */
	.select-field-input:focus {
		outline: none;
		border-color: #146ef5;
		box-shadow: 0 0 0 3px rgba(20, 110, 245, 0.1);
	}

	/* Hover state (when not disabled) */
	.select-field-input:not(:disabled):hover {
		border-color: #a0aec0;
	}

	/* Error state */
	.select-field-input.error {
		border-color: #dc2626;
		background-color: #fef2f2;
	}

	.select-field-input.error:focus {
		border-color: #dc2626;
		box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
	}

	/* Disabled state */
	.select-field-input:disabled {
		background-color: #f7fafc;
		color: #a0aec0;
		cursor: not-allowed;
		opacity: 0.6;
	}

	/* Readonly state (simulated - select doesn't have readonly) */
	.select-field-input.readonly {
		background-color: #f7fafc;
		cursor: default;
		pointer-events: none;
	}

	/* Placeholder option styling */
	.select-field-input option[value=''] {
		color: #a0aec0;
	}

	.select-field-input option:not([value='']) {
		color: #1a202c;
	}

	/* Custom dropdown arrow */
	.select-arrow {
		position: absolute;
		right: 0.875rem;
		top: 50%;
		transform: translateY(-50%);
		pointer-events: none;
		color: #4a5568;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.select-field-input:disabled ~ .select-arrow {
		opacity: 0.4;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.select-field-input {
			font-size: 0.875rem;
			padding: 0.5rem 2.25rem 0.5rem 0.75rem;
		}

		.select-arrow {
			right: 0.75rem;
		}
	}
</style>

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
