<!--
  ============================================================
  Spinner — Indeterminate loading indicator
  ============================================================

  WHAT IT DOES
  Visual feedback for an in-progress operation of unknown
  duration. Unlike ProgressBar / ProgressRing (which display a
  determinate %), Spinner just signals "something is happening"
  and keeps animating until you remove it.

  FEATURES
  - Four visual variants:
      ring   — classic 270° rotating arc (default, most familiar)
      dots   — three bouncing dots (friendly, less mechanical)
      bars   — vertical bars in a wave (audio / processing vibe)
      pulse  — concentric expanding rings (calm, ambient)
  - Three sizes: sm / md / lg
  - Inherits parent text colour by default (currentColor) — drop
    it inside any text-coloured element and it picks up the hue.
  - Optional `label` prop renders a visible caption next to the
    spinner. Always included for screen readers via aria-label
    even when not visible.
  - Pure CSS keyframes — zero JS animation loop, zero deps.
  - Respects `prefers-reduced-motion` — falls back to a slow
    fade-pulse (still indicates activity, no spinning).

  ACCESSIBILITY
  - role="status" so AT announces it as a status region.
  - aria-live="polite" — surfaces the label without interrupting.
  - aria-label always set (visible label OR fallback "Loading").
  - The visual animation is decorative — the textual label is the
    accessible content.
  - `prefers-reduced-motion: reduce` respected at the CSS level.

  USAGE
  Default (ring, md, currentColor):
      <Spinner />

  Inside a button while submitting:
      <button class="loading">
          <Spinner size="sm" />
          Submitting…
      </button>

  Centred page-level:
      <Spinner size="lg" variant="dots" label="Loading data" />

  Custom colour:
      <Spinner color="#10b981" />

  PROPS
  | Prop      | Type                                       | Default     |
  |-----------|--------------------------------------------|-------------|
  | variant   | 'ring' \| 'dots' \| 'bars' \| 'pulse'      | 'ring'      |
  | size      | 'sm' \| 'md' \| 'lg'                       | 'md'        |
  | color     | string (any CSS color)                     | currentColor|
  | label     | string                                     | ''          |
  | ariaLabel | string                                     | 'Loading'   |
  | class     | string                                     | ''          |
  ============================================================
-->

<script lang="ts">
	export type SpinnerVariant = 'ring' | 'dots' | 'bars' | 'pulse';
	export type SpinnerSize = 'sm' | 'md' | 'lg';

	interface Props {
		variant?: SpinnerVariant;
		size?: SpinnerSize;
		color?: string;
		label?: string;
		ariaLabel?: string;
		class?: string;
	}

	let {
		variant = 'ring',
		size = 'md',
		color,
		label = '',
		ariaLabel = 'Loading',
		class: extraClass = ''
	}: Props = $props();

	// The visible label takes precedence over ariaLabel for screen readers,
	// since reading the same text twice would be redundant.
	const effectiveAriaLabel = $derived(label || ariaLabel);

	// `color` is forwarded as an inline custom property so each variant's
	// CSS can pick it up without us repeating `style="background: ..."`
	// across every animated element.
	const colorStyle = $derived(color ? `--spinner-color: ${color};` : '');
</script>

<div
	class="spinner spinner-{variant} spinner-{size} {extraClass}"
	style={colorStyle}
	role="status"
	aria-live="polite"
	aria-label={effectiveAriaLabel}
>
	{#if variant === 'ring'}
		<svg class="ring-svg" viewBox="0 0 50 50" aria-hidden="true">
			<circle class="ring-track" cx="25" cy="25" r="20" fill="none" stroke-width="5" />
			<circle class="ring-arc" cx="25" cy="25" r="20" fill="none" stroke-width="5" />
		</svg>
	{:else if variant === 'dots'}
		<span class="dots" aria-hidden="true">
			<span class="dot dot-1"></span>
			<span class="dot dot-2"></span>
			<span class="dot dot-3"></span>
		</span>
	{:else if variant === 'bars'}
		<span class="bars" aria-hidden="true">
			<span class="bar bar-1"></span>
			<span class="bar bar-2"></span>
			<span class="bar bar-3"></span>
			<span class="bar bar-4"></span>
		</span>
	{:else if variant === 'pulse'}
		<span class="pulse" aria-hidden="true">
			<span class="pulse-ring pulse-ring-1"></span>
			<span class="pulse-ring pulse-ring-2"></span>
			<span class="pulse-ring pulse-ring-3"></span>
		</span>
	{/if}

	{#if label}
		<span class="spinner-label">{label}</span>
	{/if}
</div>

<style>
	.spinner {
		--spinner-color: currentColor;
		--spinner-track: color-mix(in srgb, currentColor 18%, transparent);
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		color: inherit;
		vertical-align: middle;
	}

	.spinner-label {
		font-size: 0.95em;
		color: inherit;
	}

	/* ─────────── Sizes (drive the visual block in em so SVG/dots/bars
	   scale uniformly with the chosen size) ─────────── */
	.spinner-sm {
		font-size: 0.875rem;
	}
	.spinner-sm .ring-svg,
	.spinner-sm .dots,
	.spinner-sm .bars,
	.spinner-sm .pulse {
		width: 1rem;
		height: 1rem;
	}

	.spinner-md {
		font-size: 1rem;
	}
	.spinner-md .ring-svg,
	.spinner-md .dots,
	.spinner-md .bars,
	.spinner-md .pulse {
		width: 1.5rem;
		height: 1.5rem;
	}

	.spinner-lg {
		font-size: 1.125rem;
	}
	.spinner-lg .ring-svg,
	.spinner-lg .dots,
	.spinner-lg .bars,
	.spinner-lg .pulse {
		width: 2.25rem;
		height: 2.25rem;
	}

	/* ─────────── Ring variant ─────────── */
	.ring-svg {
		display: block;
		animation: spinner-rotate 0.9s linear infinite;
	}

	.ring-track {
		stroke: var(--spinner-track);
	}

	.ring-arc {
		stroke: var(--spinner-color);
		stroke-linecap: round;
		stroke-dasharray: 90 150;
		stroke-dashoffset: 0;
	}

	@keyframes spinner-rotate {
		to {
			transform: rotate(360deg);
		}
	}

	/* ─────────── Dots variant ─────────── */
	.dots {
		display: inline-flex;
		gap: 0.18em;
		align-items: flex-end;
		justify-content: center;
	}

	.dot {
		display: block;
		width: 22%;
		height: 22%;
		background: var(--spinner-color);
		border-radius: 50%;
		animation: spinner-bounce 1s ease-in-out infinite;
	}

	.dot-2 {
		animation-delay: 0.15s;
	}
	.dot-3 {
		animation-delay: 0.3s;
	}

	@keyframes spinner-bounce {
		0%,
		60%,
		100% {
			transform: translateY(0);
			opacity: 0.45;
		}
		30% {
			transform: translateY(-50%);
			opacity: 1;
		}
	}

	/* ─────────── Bars variant ─────────── */
	.bars {
		display: inline-flex;
		gap: 0.12em;
		align-items: center;
		justify-content: center;
	}

	.bar {
		display: block;
		width: 14%;
		height: 100%;
		background: var(--spinner-color);
		border-radius: 0.1em;
		animation: spinner-bar 1.1s ease-in-out infinite;
	}

	.bar-2 {
		animation-delay: 0.12s;
	}
	.bar-3 {
		animation-delay: 0.24s;
	}
	.bar-4 {
		animation-delay: 0.36s;
	}

	@keyframes spinner-bar {
		0%,
		100% {
			transform: scaleY(0.35);
			opacity: 0.5;
		}
		50% {
			transform: scaleY(1);
			opacity: 1;
		}
	}

	/* ─────────── Pulse variant ─────────── */
	.pulse {
		position: relative;
		display: inline-block;
	}

	.pulse-ring {
		position: absolute;
		inset: 0;
		border: 2px solid var(--spinner-color);
		border-radius: 50%;
		opacity: 0;
		animation: spinner-pulse 1.6s ease-out infinite;
	}

	.pulse-ring-2 {
		animation-delay: 0.5s;
	}
	.pulse-ring-3 {
		animation-delay: 1s;
	}

	@keyframes spinner-pulse {
		0% {
			transform: scale(0.3);
			opacity: 0.9;
		}
		100% {
			transform: scale(1);
			opacity: 0;
		}
	}

	/* ─────────── Reduced motion fallback ───────────
	   Drop the spin / bounce / wave / pulse — replace with a calm
	   opacity fade that still signals "activity in progress" without
	   triggering vestibular discomfort. */
	@media (prefers-reduced-motion: reduce) {
		.ring-svg {
			animation: spinner-fade 1.4s ease-in-out infinite;
		}
		.ring-arc {
			stroke-dasharray: none;
		}
		.dot,
		.bar {
			animation: spinner-fade 1.4s ease-in-out infinite;
		}
		.dot-2,
		.bar-2 {
			animation-delay: 0.2s;
		}
		.dot-3,
		.bar-3 {
			animation-delay: 0.4s;
		}
		.bar-4 {
			animation-delay: 0.6s;
		}
		.pulse-ring {
			animation: spinner-fade 1.4s ease-in-out infinite;
			transform: scale(0.85);
		}
		.pulse-ring-2 {
			animation-delay: 0.4s;
		}
		.pulse-ring-3 {
			animation-delay: 0.8s;
		}
	}

	@keyframes spinner-fade {
		0%,
		100% {
			opacity: 0.35;
		}
		50% {
			opacity: 1;
		}
	}
</style>
