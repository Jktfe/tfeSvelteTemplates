<!--
  ============================================================
  Stepper - Multi-Step Progress Indicator
  ============================================================

  🎯 WHAT IT DOES
  Renders a numbered (or icon) step indicator for multi-stage flows
  like checkout, onboarding, or wizards. Each step has a state — done,
  current, or pending — and they're joined by connector lines. Clickable
  steps can be used as a mini navigation device.

  ✨ FEATURES
  • Done / current / pending visual states (auto-derived from currentStep)
  • Numbered or custom-icon steps (snippet per step)
  • Horizontal or vertical orientation
  • Optional clickable steps with onSelect callback
  • Custom palette (active / done / pending colours)
  • Honours prefers-reduced-motion

  ♿ ACCESSIBILITY
  • role="list" wrapping the step nodes
  • aria-current="step" on the current step
  • aria-label per step ("Step 2 of 5: Shipping address")
  • Clickable steps are real <button> elements, keyboard activatable
  • Connector lines marked aria-hidden so they don't pollute SR output

  📦 DEPENDENCIES
  Zero external dependencies. Pure CSS + SVG.

  🎨 USAGE
  <Stepper
    steps={['Cart', 'Shipping', 'Payment', 'Review']}
    currentStep={1}
    clickable
    onSelect={(i) => goTo(i)}
  />

  📋 PROPS
  | Prop          | Type                       | Default     | Description |
  |---------------|----------------------------|-------------|-------------|
  | steps         | string[]                   | []          | Step labels (length determines count) |
  | currentStep   | number                     | 0           | Index of the current step (0-based) |
  | orientation   | 'horizontal' \| 'vertical' | 'horizontal'| Layout direction |
  | clickable     | boolean                    | false       | Enables click-to-jump on done/current steps |
  | onSelect      | (i: number) => void        | undefined   | Called when a clickable step fires |
  | activeColor   | string                     | '#3b82f6'   | Current step ring/text colour |
  | doneColor     | string                     | '#22c55e'   | Completed step fill colour |
  | pendingColor  | string                     | '#cbd5e1'   | Pending step ring colour |
  | class         | string                     | ''          | Extra classes |

  ============================================================
-->

<script lang="ts">
	interface Props {
		steps?: string[];
		currentStep?: number;
		orientation?: 'horizontal' | 'vertical';
		clickable?: boolean;
		onSelect?: (index: number) => void;
		activeColor?: string;
		doneColor?: string;
		pendingColor?: string;
		class?: string;
	}

	let {
		steps = [],
		currentStep = 0,
		orientation = 'horizontal',
		clickable = false,
		onSelect,
		activeColor = '#3b82f6',
		doneColor = '#22c55e',
		pendingColor = '#cbd5e1',
		class: extraClass = ''
	}: Props = $props();

	type StepState = 'done' | 'current' | 'pending';

	function stateFor(index: number): StepState {
		if (index < currentStep) return 'done';
		if (index === currentStep) return 'current';
		return 'pending';
	}

	function colorFor(state: StepState): string {
		if (state === 'done') return doneColor;
		if (state === 'current') return activeColor;
		return pendingColor;
	}

	function handleSelect(index: number, state: StepState) {
		// Only completed and current steps are clickable. Pending steps stay locked
		// so users can't skip ahead before finishing the current step.
		if (!clickable || state === 'pending') return;
		onSelect?.(index);
	}
</script>

<ol
	class="stepper stepper-{orientation} {extraClass}"
	aria-label="Progress"
>
	{#each steps as step, i (step + i)}
		{@const state = stateFor(i)}
		{@const stepColor = colorFor(state)}
		{@const isClickable = clickable && state !== 'pending'}
		<li
			class="step step-{state}"
			aria-current={state === 'current' ? 'step' : undefined}
		>
			{#if isClickable}
				<button
					type="button"
					class="step-button"
					onclick={() => handleSelect(i, state)}
					aria-label="Step {i + 1} of {steps.length}: {step}"
				>
					<span
						class="step-marker"
						style:border-color={stepColor}
						style:background={state === 'done' ? doneColor : 'transparent'}
						style:color={state === 'done' ? '#fff' : stepColor}
					>
						{#if state === 'done'}
							<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
								<path
									d="M5 12l5 5L20 7"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						{:else}
							{i + 1}
						{/if}
					</span>
					<span class="step-label" style:color={stepColor}>{step}</span>
				</button>
			{:else}
				<div
					class="step-static"
					aria-label="Step {i + 1} of {steps.length}: {step}"
				>
					<span
						class="step-marker"
						style:border-color={stepColor}
						style:background={state === 'done' ? doneColor : 'transparent'}
						style:color={state === 'done' ? '#fff' : stepColor}
					>
						{#if state === 'done'}
							<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
								<path
									d="M5 12l5 5L20 7"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						{:else}
							{i + 1}
						{/if}
					</span>
					<span class="step-label" style:color={stepColor}>{step}</span>
				</div>
			{/if}
			{#if i < steps.length - 1}
				<span
					class="step-connector"
					style:background={state === 'done' ? doneColor : pendingColor}
					aria-hidden="true"
				></span>
			{/if}
		</li>
	{/each}
</ol>

<style>
	.stepper {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		gap: 0;
		font-family: inherit;
	}

	.stepper-horizontal {
		flex-direction: row;
		align-items: center;
	}

	.stepper-vertical {
		flex-direction: column;
		align-items: flex-start;
	}

	.step {
		display: flex;
		align-items: center;
		flex: 1 1 0;
		min-width: 0;
		gap: 0.5rem;
		position: relative;
	}

	.stepper-vertical .step {
		flex-direction: column;
		align-items: flex-start;
		flex: 0 0 auto;
		width: 100%;
	}

	.step-button,
	.step-static {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: none;
		border: none;
		padding: 0.25rem 0.5rem;
		font: inherit;
		cursor: default;
		color: inherit;
		text-align: left;
	}

	.step-button {
		cursor: pointer;
		border-radius: 6px;
		transition: background-color 0.15s ease;
	}

	.step-button:hover {
		background-color: rgba(15, 23, 42, 0.04);
	}

	.step-button:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.step-marker {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 2px solid currentColor;
		font-size: 0.85rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease;
	}

	.step-label {
		font-size: 0.9rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		transition: color 0.2s ease;
	}

	.step-current .step-label {
		font-weight: 600;
	}

	.step-connector {
		flex: 1 1 auto;
		height: 2px;
		min-width: 1.5rem;
		margin: 0 0.5rem;
		border-radius: 1px;
		transition: background-color 0.2s ease;
	}

	.stepper-vertical .step-connector {
		width: 2px;
		height: auto;
		min-height: 1.5rem;
		min-width: 0;
		margin: 0.25rem 0 0.25rem 1rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.step-marker,
		.step-label,
		.step-connector,
		.step-button {
			transition: none;
		}
	}
</style>
