<script lang="ts">
	import FormField from './FormField.svelte';
	import type { SwitchFieldProps } from '$lib/types';

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
		labelPosition = 'right',
		onblur,
		oninput
	}: SwitchFieldProps = $props();

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
	 * Handle switch toggle
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
	<label
		class="switch-container"
		class:disabled
		class:readonly
		class:error={hasError}
		class:label-left={labelPosition === 'left'}
		class:label-right={labelPosition === 'right'}
	>
		{#if labelPosition === 'left'}
			<span class="switch-label">{label}</span>
		{/if}

		<input
			type="checkbox"
			id={fieldId}
			{name}
			{checked}
			{required}
			{disabled}
			readonly={readonly}
			class="switch-input"
			role="switch"
			aria-checked={checked}
			aria-invalid={hasError}
			aria-describedby={helpText ? helpId : undefined}
			aria-errormessage={hasError ? errorId : undefined}
			aria-required={required}
			onchange={handleChange}
			onblur={handleBlur}
		/>

		<!-- Custom switch indicator -->
		<div class="switch-track" aria-hidden="true">
			<div class="switch-thumb"></div>
		</div>

		{#if labelPosition === 'right'}
			<span class="switch-label">{label}</span>
		{/if}
	</label>
</FormField>

<style>
	/**
	 * Switch Field Styles
	 * iOS-style toggle switch with smooth animation
	 */

	.switch-container {
		display: flex;
		align-items: center;
		cursor: pointer;
		user-select: none;
		padding: 0.5rem 0;
	}

	.switch-container.label-left {
		gap: 0.75rem;
	}

	.switch-container.label-right {
		gap: 0.75rem;
		flex-direction: row-reverse;
		justify-content: flex-end;
	}

	.switch-container.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.switch-container.readonly {
		cursor: default;
		pointer-events: none;
	}

	/* Hide native checkbox */
	.switch-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
		pointer-events: none;
	}

	/* Switch Track */
	.switch-track {
		position: relative;
		width: 3rem;
		height: 1.75rem;
		background-color: #cbd5e0;
		border-radius: 1rem;
		transition: background-color 0.25s ease;
		flex-shrink: 0;
	}

	/* Switch Thumb */
	.switch-thumb {
		position: absolute;
		top: 0.25rem;
		left: 0.25rem;
		width: 1.25rem;
		height: 1.25rem;
		background-color: #ffffff;
		border-radius: 50%;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		transition: transform 0.25s ease;
	}

	/* Switch Label */
	.switch-label {
		font-size: 0.9375rem;
		line-height: 1.5;
		color: #1a202c;
	}

	/* Checked State */
	.switch-input:checked + .switch-track {
		background-color: #146ef5;
	}

	.switch-input:checked + .switch-track .switch-thumb {
		transform: translateX(1.25rem);
	}

	/* Hover State */
	.switch-container:not(.disabled):not(.readonly):hover .switch-track {
		opacity: 0.9;
	}

	/* Focus State */
	.switch-input:focus-visible + .switch-track {
		box-shadow: 0 0 0 3px rgba(20, 110, 245, 0.2);
	}

	/* Error State */
	.switch-container.error .switch-input:checked + .switch-track {
		background-color: #dc2626;
	}

	/* Disabled State */
	.switch-container.disabled .switch-track {
		background-color: #e2e8f0;
	}

	.switch-container.disabled .switch-input:checked + .switch-track {
		background-color: #a0aec0;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.switch-container {
			padding: 0.375rem 0;
		}

		.switch-track {
			width: 2.75rem;
			height: 1.625rem;
		}

		.switch-thumb {
			width: 1.125rem;
			height: 1.125rem;
		}

		.switch-input:checked + .switch-track .switch-thumb {
			transform: translateX(1.125rem);
		}

		.switch-label {
			font-size: 0.875rem;
		}
	}
</style>
