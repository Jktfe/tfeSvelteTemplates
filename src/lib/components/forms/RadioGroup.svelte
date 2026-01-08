<script lang="ts">
	import FormField from './FormField.svelte';
	import type { RadioGroupProps } from '$lib/types';

	let {
		name,
		label,
		value = $bindable(''),
		options,
		helpText = '',
		required = false,
		disabled = false,
		readonly = false,
		error = '',
		touched = false,
		orientation = 'vertical',
		onblur,
		oninput
	}: RadioGroupProps = $props();

	/**
	 * Generate IDs for aria associations
	 */
	let groupId = $derived(`radio-group-${name}`);
	let helpId = $derived(`${name}-help`);
	let errorId = $derived(`${name}-error`);

	/**
	 * Determine if field has error state for styling
	 */
	let hasError = $derived(touched && !!error);

	/**
	 * Handle radio selection changes
	 * Updates bound value and triggers optional callback
	 */
	function handleChange(optionValue: string | number) {
		if (disabled || readonly) return;
		value = String(optionValue);
		oninput?.(value);
	}

	/**
	 * Handle blur event on radio group
	 * Marks field as touched and triggers optional callback
	 */
	function handleBlur() {
		onblur?.();
	}
</script>

<FormField {name} {label} {required} {error} {touched} {helpText}>
	<div
		role="radiogroup"
		id={groupId}
		class="radio-group"
		class:horizontal={orientation === 'horizontal'}
		class:vertical={orientation === 'vertical'}
		class:error={hasError}
		aria-invalid={hasError}
		aria-describedby={helpText ? helpId : undefined}
		aria-errormessage={hasError ? errorId : undefined}
		aria-required={required}
		onblur={handleBlur}
	>
		{#each options as option, index (option.value)}
			{@const optionId = `${name}-${index}`}
			{@const isDisabled = disabled || option.disabled}
			{@const isChecked = String(value) === String(option.value)}

			<label class="radio-option" class:disabled={isDisabled} class:readonly={readonly}>
				<input
					type="radio"
					id={optionId}
					{name}
					value={option.value}
					checked={isChecked}
					disabled={isDisabled}
					readonly={readonly}
					class="radio-input"
					onchange={() => handleChange(option.value)}
				/>
				<span class="radio-custom" aria-hidden="true"></span>
				<span class="radio-label">{option.label}</span>
			</label>
		{/each}
	</div>
</FormField>

<style>
	/**
	 * Radio Group Styles
	 * Provides consistent styling for radio button groups with custom radio indicators
	 */

	.radio-group {
		display: flex;
		gap: 0.75rem;
	}

	.radio-group.vertical {
		flex-direction: column;
	}

	.radio-group.horizontal {
		flex-direction: row;
		flex-wrap: wrap;
	}

	/* Radio Option Container */
	.radio-option {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		cursor: pointer;
		user-select: none;
		position: relative;
		padding: 0.5rem 0;
	}

	.radio-option.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.radio-option.readonly {
		cursor: default;
		pointer-events: none;
	}

	/* Hide native radio input */
	.radio-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
		pointer-events: none;
	}

	/* Custom radio indicator */
	.radio-custom {
		position: relative;
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid #cbd5e0;
		border-radius: 50%;
		background-color: #ffffff;
		transition: all 0.15s ease-in-out;
		flex-shrink: 0;
	}

	/* Radio label text */
	.radio-label {
		font-size: 0.9375rem;
		line-height: 1.5;
		color: #1a202c;
	}

	/* Hover state */
	.radio-option:not(.disabled):not(.readonly):hover .radio-custom {
		border-color: #146ef5;
	}

	/* Focus state */
	.radio-input:focus-visible + .radio-custom {
		border-color: #146ef5;
		box-shadow: 0 0 0 3px rgba(20, 110, 245, 0.1);
	}

	/* Checked state */
	.radio-input:checked + .radio-custom {
		border-color: #146ef5;
		background-color: #146ef5;
	}

	/* Checked indicator (inner dot) */
	.radio-input:checked + .radio-custom::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background-color: #ffffff;
	}

	/* Error state */
	.radio-group.error .radio-custom {
		border-color: #dc2626;
	}

	.radio-group.error .radio-input:checked + .radio-custom {
		border-color: #dc2626;
		background-color: #dc2626;
	}

	/* Disabled checked state */
	.radio-option.disabled .radio-input:checked + .radio-custom {
		background-color: #a0aec0;
		border-color: #a0aec0;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.radio-group {
			gap: 0.5rem;
		}

		.radio-option {
			gap: 0.5rem;
			padding: 0.375rem 0;
		}

		.radio-custom {
			width: 1.125rem;
			height: 1.125rem;
		}

		.radio-label {
			font-size: 0.875rem;
		}

		/* Force vertical on mobile for horizontal groups */
		.radio-group.horizontal {
			flex-direction: column;
		}
	}
</style>

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
