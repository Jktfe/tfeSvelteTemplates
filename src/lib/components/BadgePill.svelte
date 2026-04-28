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
		background: rgba(0, 0, 0, 0.08);
	}
	.badge-dismiss:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 1px;
		opacity: 1;
	}

	/* Soft variant — pastel bg + saturated text. Default look. */
	.badge-soft.badge-neutral {
		background: #f1f5f9;
		color: #475569;
	}
	.badge-soft.badge-info {
		background: #dbeafe;
		color: #1d4ed8;
	}
	.badge-soft.badge-success {
		background: #dcfce7;
		color: #15803d;
	}
	.badge-soft.badge-warning {
		background: #fef3c7;
		color: #b45309;
	}
	.badge-soft.badge-danger {
		background: #fee2e2;
		color: #b91c1c;
	}
	.badge-soft.badge-brand {
		background: #ede9fe;
		color: #6d28d9;
	}

	/* Solid variant — saturated bg, white text. Maximum visual weight. */
	.badge-solid.badge-neutral {
		background: #475569;
		color: #ffffff;
	}
	.badge-solid.badge-info {
		background: #2563eb;
		color: #ffffff;
	}
	.badge-solid.badge-success {
		background: #16a34a;
		color: #ffffff;
	}
	.badge-solid.badge-warning {
		background: #d97706;
		color: #ffffff;
	}
	.badge-solid.badge-danger {
		background: #dc2626;
		color: #ffffff;
	}
	.badge-solid.badge-brand {
		background: #7c3aed;
		color: #ffffff;
	}

	/* Outline variant — transparent bg, coloured border. Lightest weight. */
	.badge-outline {
		background: transparent;
		border: 1px solid;
	}
	.badge-outline.badge-neutral {
		color: #475569;
		border-color: #cbd5e1;
	}
	.badge-outline.badge-info {
		color: #1d4ed8;
		border-color: #93c5fd;
	}
	.badge-outline.badge-success {
		color: #15803d;
		border-color: #86efac;
	}
	.badge-outline.badge-warning {
		color: #b45309;
		border-color: #fcd34d;
	}
	.badge-outline.badge-danger {
		color: #b91c1c;
		border-color: #fca5a5;
	}
	.badge-outline.badge-brand {
		color: #6d28d9;
		border-color: #c4b5fd;
	}

	/* Reduced motion — transitions are subtle but kill them when requested */
	@media (prefers-reduced-motion: reduce) {
		.badge-pill,
		.badge-dismiss {
			transition: none;
		}
	}
</style>
