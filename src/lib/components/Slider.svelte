<script lang="ts">
	/*
	 * ============================================================
	 * Slider — Continuous-Value Range Input
	 * ============================================================
	 *
	 * WHAT IT DOES
	 * Continuous-value range input. Built on a native input type=range
	 * so keyboard a11y is free (Left/Right for step, Home/End for min/max,
	 * PageUp/PageDown for large step, screen readers announce role=slider
	 * and current/min/max). We only style the track + thumb.
	 *
	 * FEATURES
	 * - Three sizes: sm / md / lg (track height + thumb size)
	 * - Three variants: default / success / danger (fill colour)
	 * - Optional value bubble above the thumb (showValue=true)
	 * - Optional label
	 * - Honours prefers-reduced-motion (no thumb-grow on press)
	 * - Honours prefers-color-scheme (dark flip via CSS custom properties)
	 * - Pure Svelte 5 runes, zero dependencies
	 *
	 * THEMING
	 * Six dark-aware tokens on .slider-wrapper, light defaults inline,
	 * flipped automatically under @media (prefers-color-scheme: dark).
	 * Plus the existing variant tokens kept for prop-driven recolouring:
	 * - --slider-track-bg     empty track fill (light: #e2e8f0 / dark: #1f2937)
	 * - --slider-thumb-bg     thumb background (light: #ffffff / dark: #f9fafb)
	 * - --slider-label-fg     label text colour
	 * - --slider-bubble-bg    bubble background and arrow fill
	 * - --slider-bubble-fg    bubble text colour
	 * - --slider-focus-ring   focus-visible ring colour
	 * - --fill-color          owned by `variant` prop, overridable
	 * - --track-h, --thumb-size  owned by `size` prop, overridable
	 * Override the chrome tokens by targeting .slider-wrapper directly with
	 * at least 2-class specificity — required to overcome the (0,2,0)
	 * specificity of the component's scoped internal styles. Svelte appends
	 * a hash class to every selector, so an ancestor :root or body rule only
	 * inherits the variable and lands at (0,1,0) — the component's own
	 * declared default still wins. See docs/THEMING.md for the full
	 * specificity arithmetic. Doubled-class trick is the cheapest
	 * unconditional override:
	 *     body .slider-wrapper.slider-wrapper { --slider-track-bg: #fef3c7; --fill-color: #f59e0b; }
	 *
	 * USAGE
	 * Two-way bind:
	 *     Slider bind:value={volume} min={0} max={100}
	 *
	 * The value bubble (showValue=true) renders the current value above
	 * the thumb. Position is computed as a % of the track via $derived.
	 *
	 * ============================================================
	 */

	type Size = 'sm' | 'md' | 'lg';
	type Variant = 'default' | 'success' | 'danger';

	type Props = {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		label?: string;
		showValue?: boolean;
		size?: Size;
		variant?: Variant;
		disabled?: boolean;
		id?: string;
		ariaLabel?: string;
		formatValue?: (v: number) => string;
		onChange?: (value: number) => void;
		class?: string;
	};

	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		label = '',
		showValue = false,
		size = 'md',
		variant = 'default',
		disabled = false,
		id,
		ariaLabel,
		formatValue,
		onChange,
		class: className = ''
	}: Props = $props();

	const inputId = $derived(id ?? `slider-${Math.random().toString(36).slice(2, 9)}`);
	const percent = $derived(((value - min) / (max - min)) * 100);
	const displayValue = $derived(formatValue ? formatValue(value) : String(value));

	function handleInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		value = Number(target.value);
		onChange?.(value);
	}
</script>

<div class="slider-wrapper slider-{size} {className}" class:slider-disabled={disabled}>
	{#if label}
		<label class="slider-label" for={inputId}>{label}</label>
	{/if}

	<div class="slider-track-wrapper">
		{#if showValue}
			<span class="slider-bubble" style="left: {percent}%">{displayValue}</span>
		{/if}
		<input
			id={inputId}
			type="range"
			class="slider-input slider-{variant}"
			{min}
			{max}
			{step}
			{value}
			{disabled}
			aria-label={ariaLabel ?? (label ? undefined : 'Slider')}
			oninput={handleInput}
			style="--percent: {percent}%"
		/>
	</div>
</div>

<style>
	.slider-wrapper {
		/*
		 * Theming tokens — light defaults here, dark flip in the media
		 * block at the bottom of this stylesheet. To retheme, target
		 * .slider-wrapper with ≥2-class specificity — required to
		 * overcome this rule's (0,2,0) scoped specificity. An ancestor
		 * :root rule only inherits the token (lands at (0,1,0)) and
		 * loses to this declared default. See docs/THEMING.md for the
		 * full arithmetic.
		 */
		--slider-track-bg: #e2e8f0;
		--slider-thumb-bg: #ffffff;
		--slider-label-fg: #1a202c;
		--slider-bubble-bg: #1a202c;
		--slider-bubble-fg: #ffffff;
		--slider-focus-ring: rgba(20, 110, 245, 0.25);

		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.slider-disabled {
		opacity: 0.5;
	}

	.slider-label {
		font-size: 0.875rem;
		color: var(--slider-label-fg);
		font-weight: 500;
	}

	.slider-track-wrapper {
		position: relative;
		width: 100%;
	}

	.slider-bubble {
		position: absolute;
		bottom: calc(100% + 0.5rem);
		transform: translateX(-50%);
		background-color: var(--slider-bubble-bg);
		color: var(--slider-bubble-fg);
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.125rem 0.5rem;
		border-radius: 0.375rem;
		pointer-events: none;
		white-space: nowrap;
	}

	.slider-bubble::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 4px solid transparent;
		border-right: 4px solid transparent;
		border-top: 4px solid var(--slider-bubble-bg);
	}

	/* Reset native styling */
	.slider-input {
		appearance: none;
		-webkit-appearance: none;
		width: 100%;
		background: transparent;
		cursor: pointer;
		margin: 0;
		padding: 0;
	}

	.slider-input:disabled {
		cursor: not-allowed;
	}

	.slider-input:focus {
		outline: none;
	}

	/* WebKit / Chromium / Safari track */
	.slider-input::-webkit-slider-runnable-track {
		height: var(--track-h, 6px);
		border-radius: 9999px;
		background: linear-gradient(
			to right,
			var(--fill-color, #146ef5) 0%,
			var(--fill-color, #146ef5) var(--percent),
			var(--slider-track-bg) var(--percent),
			var(--slider-track-bg) 100%
		);
	}

	/* WebKit thumb */
	.slider-input::-webkit-slider-thumb {
		appearance: none;
		-webkit-appearance: none;
		width: var(--thumb-size, 18px);
		height: var(--thumb-size, 18px);
		border-radius: 9999px;
		background-color: var(--slider-thumb-bg);
		border: 2px solid var(--fill-color, #146ef5);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
		margin-top: calc((var(--track-h, 6px) - var(--thumb-size, 18px)) / 2);
		cursor: grab;
		transition: transform 0.15s ease;
	}

	.slider-input:active::-webkit-slider-thumb {
		cursor: grabbing;
		transform: scale(1.15);
	}

	.slider-input:focus-visible::-webkit-slider-thumb {
		box-shadow: 0 0 0 4px var(--slider-focus-ring);
	}

	.slider-input:focus-visible::-moz-range-thumb {
		box-shadow: 0 0 0 4px var(--slider-focus-ring);
	}

	/* Firefox track */
	.slider-input::-moz-range-track {
		height: var(--track-h, 6px);
		border-radius: 9999px;
		background-color: var(--slider-track-bg);
	}

	.slider-input::-moz-range-progress {
		height: var(--track-h, 6px);
		border-radius: 9999px;
		background-color: var(--fill-color, #146ef5);
	}

	/* Firefox thumb */
	.slider-input::-moz-range-thumb {
		width: var(--thumb-size, 18px);
		height: var(--thumb-size, 18px);
		border-radius: 9999px;
		background-color: var(--slider-thumb-bg);
		border: 2px solid var(--fill-color, #146ef5);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
		cursor: grab;
		transition: transform 0.15s ease;
	}

	.slider-input:active::-moz-range-thumb {
		cursor: grabbing;
		transform: scale(1.15);
	}

	/* Sizes */
	.slider-sm {
		--track-h: 4px;
		--thumb-size: 14px;
	}
	.slider-md {
		--track-h: 6px;
		--thumb-size: 18px;
	}
	.slider-lg {
		--track-h: 8px;
		--thumb-size: 22px;
	}

	/* Variants — fill colour */
	.slider-default {
		--fill-color: #146ef5;
	}
	.slider-success {
		--fill-color: #16a34a;
	}
	.slider-danger {
		--fill-color: #dc2626;
	}

	@media (prefers-reduced-motion: reduce) {
		.slider-input::-webkit-slider-thumb,
		.slider-input::-moz-range-thumb {
			transition: none;
		}
		.slider-input:active::-webkit-slider-thumb,
		.slider-input:active::-moz-range-thumb {
			transform: none;
		}
	}

	/*
	 * Dark mode — flip the empty-track grey, thumb white, label charcoal,
	 * bubble charcoal/white and focus ring tint so the slider stays
	 * high-contrast on dark pages. Variant fill colours (--fill-color)
	 * stay vivid in both modes — they read fine on either background.
	 * Consumer overrides that reach ≥2-class specificity (e.g. body
	 * .slider-wrapper.slider-wrapper) still win in dark mode — they
	 * clear the component's scoped (0,2,0) baseline and cascade after
	 * this block. See docs/THEMING.md for the full arithmetic.
	 */
	@media (prefers-color-scheme: dark) {
		.slider-wrapper {
			--slider-track-bg: #1f2937;
			--slider-thumb-bg: #f9fafb;
			--slider-label-fg: #f9fafb;
			--slider-bubble-bg: #f9fafb;
			--slider-bubble-fg: #111827;
			--slider-focus-ring: rgba(96, 165, 250, 0.4);
		}
	}
</style>
