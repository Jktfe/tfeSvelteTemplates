<script lang="ts">
	import FormField from './FormField.svelte';
	import type { ColorFieldProps } from '$lib/types';

	let {
		name,
		label,
		value = $bindable('#146ef5'),
		helpText = '',
		required = false,
		disabled = false,
		readonly = false,
		error = '',
		touched = false,
		presetColors = [],
		showPresets = true,
		onblur,
		oninput
	}: ColorFieldProps = $props();

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
	 * Handle preset colour selection
	 */
	function selectPreset(presetValue: string) {
		if (disabled || readonly) return;
		value = presetValue;
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
	<div class="color-field-container">
		<!-- Colour Preview and Input -->
		<div class="color-input-wrapper">
			<div class="color-preview" style="background-color: {value};" aria-hidden="true"></div>

			<input
				type="color"
				id={fieldId}
				{name}
				{value}
				{required}
				{disabled}
				readonly={readonly}
				class="color-input"
				aria-invalid={hasError}
				aria-describedby={helpText ? helpId : undefined}
				aria-errormessage={hasError ? errorId : undefined}
				aria-required={required}
				oninput={handleInput}
				onblur={handleBlur}
			/>

			<input
				type="text"
				{value}
				readonly
				class="color-hex"
				class:error={hasError}
				aria-label="Colour hex value"
			/>
		</div>

		<!-- Preset Colours -->
		{#if showPresets && presetColors.length > 0}
			<div class="color-presets" role="group" aria-label="Preset colours">
				{#each presetColors as preset (preset)}
					<button
						type="button"
						class="preset-swatch"
						class:active={value.toLowerCase() === preset.toLowerCase()}
						style="background-color: {preset};"
						disabled={disabled || readonly}
						title={preset}
						aria-label="Select colour {preset}"
						onclick={() => selectPreset(preset)}
						tabindex={disabled || readonly ? -1 : 0}
					>
						{#if value.toLowerCase() === preset.toLowerCase()}
							<!-- Checkmark for selected preset -->
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								class="preset-check"
							>
								<path
									d="M3 8L6.5 11.5L13 5"
									stroke="white"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</FormField>

<style>
	/**
	 * Colour Field Styles
	 * Provides enhanced UI for colour picker with preview and presets
	 */

	.color-field-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.color-input-wrapper {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	/* Colour Preview Square */
	.color-preview {
		width: 2.5rem;
		height: 2.5rem;
		border: 2px solid #cbd5e0;
		border-radius: 0.375rem;
		flex-shrink: 0;
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	/* Hidden Native Colour Input */
	.color-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
		pointer-events: none;
	}

	/* Hex Value Display */
	.color-hex {
		flex: 1;
		padding: 0.625rem 0.875rem;
		font-size: 0.9375rem;
		font-family: 'Courier New', monospace;
		line-height: 1.5;
		color: #1a202c;
		background-color: #f7fafc;
		border: 1px solid #cbd5e0;
		border-radius: 0.375rem;
		cursor: default;
		text-transform: uppercase;
	}

	.color-hex.error {
		border-color: #dc2626;
		background-color: #fef2f2;
	}

	/* Preset Colours Grid */
	.color-presets {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(2.5rem, 1fr));
		gap: 0.5rem;
		padding: 0.5rem;
		background-color: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
	}

	.preset-swatch {
		position: relative;
		width: 2.5rem;
		height: 2.5rem;
		border: 2px solid transparent;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.15s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.preset-swatch:hover:not(:disabled) {
		transform: scale(1.1);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
	}

	.preset-swatch:focus-visible {
		outline: 2px solid #146ef5;
		outline-offset: 2px;
	}

	.preset-swatch.active {
		border-color: #146ef5;
		box-shadow: 0 0 0 3px rgba(20, 110, 245, 0.2);
	}

	.preset-swatch:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Checkmark for selected preset */
	.preset-check {
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.color-preview {
			width: 2.25rem;
			height: 2.25rem;
		}

		.color-hex {
			font-size: 0.875rem;
			padding: 0.5rem 0.75rem;
		}

		.color-presets {
			grid-template-columns: repeat(auto-fill, minmax(2.25rem, 1fr));
			gap: 0.375rem;
			padding: 0.375rem;
		}

		.preset-swatch {
			width: 2.25rem;
			height: 2.25rem;
		}
	}
</style>

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
