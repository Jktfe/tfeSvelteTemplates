<script lang="ts">
	import FormField from './FormField.svelte';
	import type { CheckboxGroupProps } from '$lib/types';

	let {
		name,
		label,
		values = $bindable<string[]>([]),
		options,
		helpText = '',
		required = false,
		disabled = false,
		readonly = false,
		error = '',
		touched = false,
		orientation = 'vertical',
		minSelected,
		maxSelected,
		onblur,
		oninput
	}: CheckboxGroupProps = $props();

	/**
	 * Generate IDs for aria associations
	 */
	let groupId = $derived(`checkbox-group-${name}`);
	let helpId = $derived(`${name}-help`);
	let errorId = $derived(`${name}-error`);

	/**
	 * Determine if field has error state for styling
	 */
	let hasError = $derived(touched && !!error);

	/**
	 * Check if a specific option is checked
	 */
	function isChecked(optionValue: string | number): boolean {
		return values.includes(String(optionValue));
	}

	/**
	 * Check if max selections reached
	 */
	let isMaxReached = $derived(maxSelected !== undefined && values.length >= maxSelected);

	/**
	 * Handle checkbox toggle
	 * Updates bound values array and triggers optional callback
	 */
	function handleChange(optionValue: string | number) {
		if (readonly) return;

		const valueStr = String(optionValue);
		const currentIndex = values.indexOf(valueStr);

		if (currentIndex === -1) {
			// Add value (if not at max)
			if (!isMaxReached) {
				values = [...values, valueStr];
			}
		} else {
			// Remove value
			values = values.filter((v) => v !== valueStr);
		}

		oninput?.(values);
	}

	/**
	 * Handle blur event on checkbox group
	 * Marks field as touched and triggers optional callback
	 */
	function handleBlur() {
		onblur?.();
	}
</script>

<FormField {name} {label} {required} {error} {touched} {helpText}>
	<div
		role="group"
		id={groupId}
		class="checkbox-group"
		class:horizontal={orientation === 'horizontal'}
		class:vertical={orientation === 'vertical'}
		class:error={hasError}
		onblur={handleBlur}
	>
		{#each options as option, index}
			{@const optionId = `${name}-${index}`}
			{@const isDisabled = disabled || option.disabled || (isMaxReached && !isChecked(option.value))}
			{@const checked = isChecked(option.value)}

			<label class="checkbox-option" class:disabled={isDisabled} class:readonly={readonly}>
				<input
					type="checkbox"
					id={optionId}
					{name}
					value={option.value}
					{checked}
					disabled={isDisabled}
					readonly={readonly}
					class="checkbox-input"
					onchange={() => handleChange(option.value)}
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
				<span class="checkbox-label">{option.label}</span>
			</label>
		{/each}
	</div>

	<!-- Selection count (if min/max specified) -->
	{#if (minSelected !== undefined || maxSelected !== undefined) && values.length > 0}
		<div class="selection-count" aria-live="polite">
			{values.length} selected
			{#if minSelected !== undefined && maxSelected !== undefined}
				(min: {minSelected}, max: {maxSelected})
			{:else if minSelected !== undefined}
				(min: {minSelected})
			{:else if maxSelected !== undefined}
				(max: {maxSelected})
			{/if}
		</div>
	{/if}
</FormField>

<style>
	/**
	 * Checkbox Group Styles
	 * Provides consistent styling for checkbox groups with custom indicators
	 */

	.checkbox-group {
		display: flex;
		gap: 0.75rem;
	}

	.checkbox-group.vertical {
		flex-direction: column;
	}

	.checkbox-group.horizontal {
		flex-direction: row;
		flex-wrap: wrap;
	}

	/* Checkbox Option Container */
	.checkbox-option {
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
		cursor: pointer;
		user-select: none;
		padding: 0.5rem 0;
	}

	.checkbox-option.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.checkbox-option.readonly {
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
	.checkbox-option:not(.disabled):not(.readonly):hover .checkbox-custom {
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
	.checkbox-group.error .checkbox-custom {
		border-color: #dc2626;
	}

	.checkbox-group.error .checkbox-input:checked + .checkbox-custom {
		border-color: #dc2626;
		background-color: #dc2626;
	}

	/* Disabled checked state */
	.checkbox-option.disabled .checkbox-input:checked + .checkbox-custom {
		background-color: #a0aec0;
		border-color: #a0aec0;
	}

	/* Selection Count Display */
	.selection-count {
		margin-top: 0.5rem;
		font-size: 0.8125rem;
		color: #6b7280;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.checkbox-group {
			gap: 0.5rem;
		}

		.checkbox-option {
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

		.selection-count {
			font-size: 0.75rem;
		}

		/* Force vertical on mobile for horizontal groups */
		.checkbox-group.horizontal {
			flex-direction: column;
		}
	}
</style>

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
