<!--
  ============================================================
  AlertBanner - Inline status banner
  ============================================================

  🎯 WHAT IT DOES
  Renders an inline alert/notice banner you can drop into a page to
  communicate state — info, success, warning, or error. Optionally
  dismissable. Distinct from a Toast: this lives in the document flow
  and stays put, where a Toast floats and disappears on its own.

  ✨ FEATURES
  • Four variants: info, success, warning, error (colours + icon)
  • Optional bold title + message body
  • Optional dismiss button (×)
  • Action slot via children snippet (e.g. a "View details" button)
  • Inline SVG icons — no icon library
  • Honours prefers-reduced-motion (skips slide-in)

  ♿ ACCESSIBILITY
  • role="alert" for error/warning (assertive — screen reader interrupts)
  • role="status" for info/success (polite — waits its turn)
  • Dismiss button has aria-label="Dismiss"
  • Focus-visible ring on dismiss button

  📦 DEPENDENCIES
  Zero dependencies. Inline SVG + scoped CSS.

  🎨 USAGE
  <AlertBanner variant="success" title="Saved!" message="Your changes are live." />
  <AlertBanner variant="error" message="Something went wrong." dismissable onDismiss={() => shown = false} />
  <AlertBanner variant="warning" title="Heads up">
    <a href="/billing">Update billing →</a>
  </AlertBanner>

  📋 PROPS
  | Prop         | Type                              | Default | Description |
  |--------------|-----------------------------------|---------|-------------|
  | variant      | 'info'\|'success'\|'warning'\|'error' | 'info' | Visual + a11y role |
  | title        | string                            | ''      | Optional bold heading |
  | message      | string                            | ''      | Optional body text |
  | dismissable  | boolean                           | false   | Show × button |
  | onDismiss    | () => void                        | -       | Fired when × clicked |
  | children     | Snippet                           | -       | Optional action area (links/buttons) |
  | class        | string                            | ''      | Extra classes |

  ============================================================
-->

<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'info' | 'success' | 'warning' | 'error';

	interface Props {
		variant?: Variant;
		title?: string;
		message?: string;
		dismissable?: boolean;
		onDismiss?: () => void;
		children?: Snippet;
		class?: string;
	}

	let {
		variant = 'info',
		title = '',
		message = '',
		dismissable = false,
		onDismiss,
		children,
		class: extraClass = ''
	}: Props = $props();

	// Errors and warnings interrupt screen readers (assertive); info and success
	// wait their turn (polite). This matches the semantic intent of each variant.
	let role = $derived(variant === 'error' || variant === 'warning' ? 'alert' : 'status');
</script>

<div
	class="alert-banner alert-{variant} {extraClass}"
	{role}
	aria-live={role === 'alert' ? 'assertive' : 'polite'}
>
	<span class="alert-icon" aria-hidden="true">
		{#if variant === 'info'}
			<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="16" x2="12" y2="12" />
				<line x1="12" y1="8" x2="12.01" y2="8" />
			</svg>
		{:else if variant === 'success'}
			<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
				<polyline points="22 4 12 14.01 9 11.01" />
			</svg>
		{:else if variant === 'warning'}
			<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
				<line x1="12" y1="9" x2="12" y2="13" />
				<line x1="12" y1="17" x2="12.01" y2="17" />
			</svg>
		{:else}
			<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10" />
				<line x1="15" y1="9" x2="9" y2="15" />
				<line x1="9" y1="9" x2="15" y2="15" />
			</svg>
		{/if}
	</span>

	<div class="alert-body">
		{#if title}
			<div class="alert-title">{title}</div>
		{/if}
		{#if message}
			<div class="alert-message">{message}</div>
		{/if}
		{#if children}
			<div class="alert-actions">
				{@render children()}
			</div>
		{/if}
	</div>

	{#if dismissable}
		<button
			type="button"
			class="alert-dismiss"
			aria-label="Dismiss"
			onclick={() => onDismiss?.()}
		>
			<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</button>
	{/if}
</div>

<style>
	.alert-banner {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid transparent;
		font-size: 0.9375rem;
		line-height: 1.5;
		animation: slide-in 0.2s ease;
	}

	@media (prefers-reduced-motion: reduce) {
		.alert-banner {
			animation: none;
		}
	}

	@keyframes slide-in {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.alert-info {
		background: #eff6ff;
		border-color: #bfdbfe;
		color: #1e40af;
	}

	.alert-success {
		background: #ecfdf5;
		border-color: #a7f3d0;
		color: #065f46;
	}

	.alert-warning {
		background: #fffbeb;
		border-color: #fde68a;
		color: #92400e;
	}

	.alert-error {
		background: #fef2f2;
		border-color: #fecaca;
		color: #991b1b;
	}

	.alert-icon {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-top: 0.0625rem;
	}

	.alert-body {
		flex: 1;
		min-width: 0;
	}

	.alert-title {
		font-weight: 600;
		margin-bottom: 0.125rem;
	}

	.alert-message {
		opacity: 0.95;
	}

	.alert-actions {
		margin-top: 0.5rem;
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.alert-dismiss {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		background: transparent;
		border: 0;
		border-radius: 0.25rem;
		color: inherit;
		opacity: 0.65;
		cursor: pointer;
		transition: opacity 0.15s ease, background 0.15s ease;
	}

	.alert-dismiss:hover {
		opacity: 1;
		background: rgba(0, 0, 0, 0.06);
	}

	.alert-dismiss:focus-visible {
		opacity: 1;
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}
</style>
