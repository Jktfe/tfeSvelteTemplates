<!--
  ============================================================
  BadgePill - Status / Category Pill
  ============================================================

  🎯 WHAT IT DOES
  A compact, rounded pill for status, categories, counts, and tags. Three
  visual variants (solid / soft / outline) crossed with six semantic tones
  (neutral / info / success / warning / danger / brand) give you 18 ready-
  made looks. Optional leading dot for status indicators and an optional
  dismiss button for tag-pickers.

  ✨ FEATURES
  • 3 variants × 6 tones × 3 sizes — 54 visual combinations from one prop set
  • Optional status dot (uses currentColor — matches the tone automatically)
  • Optional dismiss × button with onDismiss callback (event.stopPropagation)
  • Snippet OR plain `label` prop (use whichever fits the call site)
  • Pure CSS — no animations, no observers, zero JS overhead at rest
  • Honours prefers-reduced-motion (transitions disable cleanly)

  🌗 THEMING
  Dual light / dark via CSS custom properties (see docs/THEMING.md).
  Each .badge-<tone> class sets --badge-fg, --badge-soft-bg, --badge-border
  and --badge-solid-bg. Chrome (soft tint, text, border, dismiss hover)
  flips under prefers-color-scheme: dark to a deep tint of the same hue.
  Semantic: --badge-solid-bg never flips — green must read as "OK" on both
  schemes. Override one tone app-wide with doubled-class specificity:
      body .badge-brand.badge-brand { --badge-solid-bg: #0f766e; }

  ♿ ACCESSIBILITY
  • Dismiss button is a real <button> with aria-label="Dismiss"
  • Dot is decorative (aria-hidden) — colour alone never carries meaning
  • Focus ring on dismiss uses currentColor for tone-aware visibility
  • Hit area on dismiss is comfortable for touch (~22px tall in md size)

  📦 DEPENDENCIES
  Zero external dependencies. Pure Svelte 5 + scoped CSS.

  ⚡ PERFORMANCE
  Single inline-flex span. No reactive watchers. Suitable for thousands
  of pills on a page (e.g. tag clouds) without performance impact.

  🎨 USAGE
  <BadgePill label="New" tone="info" />
  <BadgePill label="Active" tone="success" variant="solid" dot />
  <BadgePill tone="warning" variant="outline">3 issues</BadgePill>
  <BadgePill label="Frontend" dismissible onDismiss={() => removeTag('frontend')} />

  📋 PROPS
  | Prop         | Type                                                      | Default     | Description |
  |--------------|-----------------------------------------------------------|-------------|-------------|
  | label        | string                                                    | undefined   | Text content (or use children snippet) |
  | tone         | 'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger' \| 'brand' | 'neutral'   | Semantic colour role |
  | variant      | 'solid' \| 'soft' \| 'outline'                            | 'soft'      | Visual weight |
  | size         | 'sm' \| 'md' \| 'lg'                                       | 'md'        | Pill size |
  | dot          | boolean                                                   | false       | Show leading status dot |
  | dismissible  | boolean                                                   | false       | Show trailing × button |
  | onDismiss    | () => void                                                | undefined   | Called when × is clicked |
  | class        | string                                                    | ''          | Extra container classes |
  | children     | Snippet                                                   | undefined   | Custom content (overrides label) |

  ============================================================
-->

<script lang="ts">
	import type { Snippet } from 'svelte';

	export type BadgePillTone =
		| 'neutral'
		| 'info'
		| 'success'
		| 'warning'
		| 'danger'
		| 'brand';

	export type BadgePillVariant = 'solid' | 'soft' | 'outline';
	export type BadgePillSize = 'sm' | 'md' | 'lg';

	interface Props {
		label?: string;
		tone?: BadgePillTone;
		variant?: BadgePillVariant;
		size?: BadgePillSize;
		dot?: boolean;
		dismissible?: boolean;
		onDismiss?: () => void;
		class?: string;
		children?: Snippet;
	}

	let {
		label,
		tone = 'neutral',
		variant = 'soft',
		size = 'md',
		dot = false,
		dismissible = false,
		onDismiss,
		class: extraClass = '',
		children
	}: Props = $props();

	function handleDismiss(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
		onDismiss?.();
	}
</script>

<span
	class="badge-pill badge-{tone} badge-{variant} badge-{size} {extraClass}"
	data-tone={tone}
	data-variant={variant}
>
	{#if dot}
		<span class="badge-dot" aria-hidden="true"></span>
	{/if}

	{#if children}
		{@render children()}
	{:else if label !== undefined}
		<span class="badge-label">{label}</span>
	{/if}

	{#if dismissible}
		<button
			type="button"
			class="badge-dismiss"
			onclick={handleDismiss}
			aria-label="Dismiss"
		>
			<svg
				width="10"
				height="10"
				viewBox="0 0 10 10"
				fill="none"
				aria-hidden="true"
				focusable="false"
			>
				<path
					d="M1 1l8 8M9 1l-8 8"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</svg>
		</button>
	{/if}
</span>

<style>
	.badge-pill {
		/* Shared chrome tokens — tone-specific ones live on .badge-<tone> below */
		--badge-solid-fg: #ffffff;
		--badge-dismiss-hover-bg: rgba(0, 0, 0, 0.08);

		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		border-radius: 9999px;
		font-weight: 500;
		line-height: 1;
		white-space: nowrap;
		transition:
			background-color 0.15s ease,
			color 0.15s ease,
			border-color 0.15s ease;
	}

	/* Sizes — padding scales with size, not just font */
	.badge-sm {
		padding: 0.125rem 0.5rem;
		font-size: 0.7rem;
		gap: 0.25rem;
	}
	.badge-md {
		padding: 0.25rem 0.625rem;
		font-size: 0.8125rem;
	}
	.badge-lg {
		padding: 0.375rem 0.875rem;
		font-size: 0.9rem;
	}

	/* Status dot — sized relative to text via em */
	.badge-dot {
		width: 0.5em;
		height: 0.5em;
		border-radius: 9999px;
		background: currentColor;
		flex-shrink: 0;
	}

	.badge-label {
		display: inline-block;
	}

	/* Dismiss × — currentColor inherits tone, hover lifts opacity */
	.badge-dismiss {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-left: 0.125rem;
		margin-right: -0.125rem;
		padding: 0.125rem;
		background: transparent;
		border: 0;
		border-radius: 9999px;
		color: inherit;
		cursor: pointer;
		opacity: 0.6;
		transition:
			opacity 0.15s ease,
			background-color 0.15s ease;
		font: inherit;
	}
	.badge-dismiss:hover {
		opacity: 1;
		background: var(--badge-dismiss-hover-bg);
	}
	.badge-dismiss:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 1px;
		opacity: 1;
	}

	/*
	 * Tone tokens — each tone class sets the same five custom properties and
	 * the variant classes below consume them. That keeps the 3 × 6 grid down
	 * to one rule per tone plus one per variant, and gives consumers a single
	 * place to retheme a tone (see docs/THEMING.md).
	 *
	 * --badge-solid-bg is semantic (green = OK on any surface) so it never
	 * flips. The soft tint, text and border are chrome — they have to sit on
	 * whatever surface the page provides, so they flip under dark mode while
	 * keeping the same hue.
	 */
	.badge-neutral {
		--badge-fg: #475569;
		--badge-soft-bg: #f1f5f9;
		--badge-border: #cbd5e1;
		--badge-solid-bg: #475569;
	}
	.badge-info {
		--badge-fg: #1d4ed8;
		--badge-soft-bg: #dbeafe;
		--badge-border: #93c5fd;
		--badge-solid-bg: #2563eb;
	}
	.badge-success {
		--badge-fg: #15803d;
		--badge-soft-bg: #dcfce7;
		--badge-border: #86efac;
		--badge-solid-bg: #16a34a;
	}
	.badge-warning {
		--badge-fg: #b45309;
		--badge-soft-bg: #fef3c7;
		--badge-border: #fcd34d;
		--badge-solid-bg: #d97706;
	}
	.badge-danger {
		--badge-fg: #b91c1c;
		--badge-soft-bg: #fee2e2;
		--badge-border: #fca5a5;
		--badge-solid-bg: #dc2626;
	}
	.badge-brand {
		--badge-fg: #6d28d9;
		--badge-soft-bg: #ede9fe;
		--badge-border: #c4b5fd;
		--badge-solid-bg: #7c3aed;
	}

	/* Soft variant — pastel bg + saturated text. Default look. */
	.badge-soft {
		background: var(--badge-soft-bg);
		color: var(--badge-fg);
	}

	/* Solid variant — saturated bg, white text. Maximum visual weight. */
	.badge-solid {
		background: var(--badge-solid-bg);
		color: var(--badge-solid-fg);
	}

	/* Outline variant — transparent bg, coloured border. Lightest weight. */
	.badge-outline {
		background: transparent;
		border: 1px solid var(--badge-border);
		color: var(--badge-fg);
	}

	/*
	 * Dark scheme — flip the chrome half of every tone (tint, text, border)
	 * to a deep tint of the same hue with a light foreground. Solid fills are
	 * semantic and deliberately left alone.
	 */
	@media (prefers-color-scheme: dark) {
		.badge-pill {
			--badge-dismiss-hover-bg: rgba(255, 255, 255, 0.14);
		}
		.badge-neutral {
			--badge-fg: #cbd5e1;
			--badge-soft-bg: #1e293b;
			--badge-border: #475569;
		}
		.badge-info {
			--badge-fg: #93c5fd;
			--badge-soft-bg: #172554;
			--badge-border: #1d4ed8;
		}
		.badge-success {
			--badge-fg: #86efac;
			--badge-soft-bg: #052e16;
			--badge-border: #15803d;
		}
		.badge-warning {
			--badge-fg: #fcd34d;
			--badge-soft-bg: #451a03;
			--badge-border: #b45309;
		}
		.badge-danger {
			--badge-fg: #fca5a5;
			--badge-soft-bg: #450a0a;
			--badge-border: #b91c1c;
		}
		.badge-brand {
			--badge-fg: #c4b5fd;
			--badge-soft-bg: #2e1065;
			--badge-border: #6d28d9;
		}
	}

	/* Reduced motion — transitions are subtle but kill them when requested */
	@media (prefers-reduced-motion: reduce) {
		.badge-pill,
		.badge-dismiss {
			transition: none;
		}
	}
</style>
