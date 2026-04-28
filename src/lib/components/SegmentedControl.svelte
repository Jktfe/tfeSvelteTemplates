<!--
  ============================================================
  SEGMENTED CONTROL
  ============================================================

  🎯 WHAT IT DOES
  A row of mutually-exclusive options visually joined into one
  control. iOS-style picker for switching between modes (List /
  Grid / Cards), time ranges (1D / 1W / 1M), or tabs.

  ✨ FEATURES
  • Single-select only (the joined look implies "one of these")
  • Sliding indicator animates between segments
  • Equal-width segments by default (toggle off for content-fit)
  • Two sizes: sm / md
  • Custom active palette via CSS vars
  • Optional icons per segment
  • Honours prefers-reduced-motion (skips the slide)

  ♿ ACCESSIBILITY
  • Native <input type="radio"> under the hood — browsers handle
    arrow-key navigation (← / → / ↑ / ↓) and Home / End for free.
    No custom ARIA gymnastics needed.
  • role="radiogroup" on the container with ariaLabel
  • Each radio is the actual click target (whole segment)
  • Visible focus ring via :focus-visible

  📦 DEPENDENCIES
  Zero external dependencies — pure CSS + native radios.

  ⚡ PERFORMANCE
  Suitable for 2-6 segments. Beyond that, switch to Tabs or a
  dropdown — segments get cramped and the joined affordance
  stops reading as "pick one".
-->

<script lang="ts">
	type Option = {
		value: string;
		label: string;
		icon?: string;
	};

	interface Props {
		options: Option[];
		value: string;
		size?: 'sm' | 'md';
		equalWidth?: boolean;
		activeBg?: string;
		activeText?: string;
		ariaLabel?: string;
		name?: string;
		onChange?: (value: string) => void;
		class?: string;
	}

	let {
		options,
		value = $bindable(''),
		size = 'md',
		equalWidth = true,
		activeBg = '#ffffff',
		activeText = '#1f2937',
		ariaLabel = 'Segmented control',
		name = `segmented-${Math.random().toString(36).slice(2, 9)}`,
		onChange,
		class: className = ''
	}: Props = $props();

	// The active index drives the sliding indicator's transform.
	// findIndex returns -1 when value isn't in options yet — clamp to 0
	// so the indicator doesn't fly off-screen during initial render.
	let activeIndex = $derived(Math.max(0, options.findIndex((o) => o.value === value)));

	function handleChange(newValue: string) {
		value = newValue;
		onChange?.(newValue);
	}
</script>

<div
	class="segmented segmented-{size} {equalWidth ? 'segmented-equal' : ''} {className}"
	role="radiogroup"
	aria-label={ariaLabel}
	style="--active-bg: {activeBg}; --active-text: {activeText}; --active-index: {activeIndex}; --option-count: {options.length};"
>
	{#each options as option (option.value)}
		<label class="segment" class:active={value === option.value}>
			<input
				type="radio"
				{name}
				value={option.value}
				checked={value === option.value}
				onchange={() => handleChange(option.value)}
			/>
			{#if option.icon}
				<span class="icon" aria-hidden="true">{option.icon}</span>
			{/if}
			<span class="label">{option.label}</span>
		</label>
	{/each}
</div>

<style>
	.segmented {
		position: relative;
		display: inline-flex;
		background: #f3f4f6;
		border-radius: 0.5rem;
		padding: 0.25rem;
		isolation: isolate;
		max-width: 100%;
	}

	/*
	 * The sliding indicator is a single ::before element that
	 * translates between segments. Cheaper than animating per-segment
	 * background changes, and gives that satisfying continuous slide.
	 */
	.segmented::before {
		content: '';
		position: absolute;
		top: 0.25rem;
		bottom: 0.25rem;
		left: 0.25rem;
		width: calc((100% - 0.5rem) / var(--option-count));
		background: var(--active-bg);
		border-radius: 0.375rem;
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.06),
			0 1px 3px rgba(0, 0, 0, 0.05);
		transform: translateX(calc(var(--active-index) * 100%));
		transition: transform 0.18s ease;
		z-index: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.segmented::before {
			transition: none;
		}
	}

	.segmented-equal .segment {
		flex: 1 1 0;
	}

	.segment {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		padding: 0 0.875rem;
		height: 2rem;
		cursor: pointer;
		color: #4b5563;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 0.375rem;
		user-select: none;
		transition: color 0.18s ease;
		white-space: nowrap;
	}

	.segmented-sm .segment {
		height: 1.75rem;
		padding: 0 0.625rem;
		font-size: 0.8125rem;
	}

	.segment.active {
		color: var(--active-text);
	}

	/*
	 * The native radio is hidden visually (still focusable) and
	 * stretched to cover the whole segment so the entire label
	 * is the click target.
	 */
	.segment input {
		position: absolute;
		inset: 0;
		opacity: 0;
		margin: 0;
		cursor: pointer;
	}

	.segment:has(input:focus-visible) {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.icon {
		font-size: 1em;
		line-height: 1;
	}
</style>
