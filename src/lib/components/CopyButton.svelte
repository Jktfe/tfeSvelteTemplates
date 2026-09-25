<!--
  ============================================================
  CopyButton - One-click Copy-to-Clipboard with Feedback
  ============================================================

  WHAT IT DOES
  Copies a string to the clipboard when clicked, then flips its label
  to a brief confirmation ("Copied!") for a configurable duration.
  Useful next to code blocks, share URLs, API keys, invite codes.

  FEATURES
  - Three variants: 'text' (label only), 'icon' (clipboard glyph only), 'both' (icon + label)
  - Three sizes (sm / md / lg)
  - Configurable copiedDuration (ms) and copiedLabel
  - Optional onCopy callback fires after successful copy
  - Honours prefers-reduced-motion (no transition flicker)
  - Pure Svelte 5 runes, zero dependencies

  THEMING
  - Dual light / dark via --copy-* custom properties on .copy-btn
  - Chrome (surface, border, text, hover / active) flips under
    prefers-color-scheme: dark
  - The copied state is semantic green: its border never flips and its
    tint keeps the same hue on both schemes (docs/THEMING.md)

  ACCESSIBILITY
  - Native button with aria-label fallback
  - aria-live="polite" region announces the copied state to screen readers
  - Status text is paired with a visual checkmark glyph so colour is not
    the only indicator of success

  USAGE
  Plain copy button:
      CopyButton value="hello"

  Icon-only inside a code block:
      CopyButton value={apiKey} variant="icon" ariaLabel="Copy API key"

  With completion callback:
      CopyButton value={inviteUrl} onCopy={(v) => analytics.track('share', v)}

  PROPS
  | Prop            | Type                            | Default     | Description |
  |-----------------|---------------------------------|-------------|-------------|
  | value           | string                          | required    | Text to copy to clipboard |
  | label           | string                          | 'Copy'      | Idle button text |
  | copiedLabel     | string                          | 'Copied!'   | Success label after click |
  | variant         | 'text' | 'icon' | 'both'        | 'both'      | Visual treatment |
  | size            | 'sm' | 'md' | 'lg'              | 'md'        | Padding + font scale |
  | copiedDuration  | number                          | 2000        | ms to keep success state |
  | ariaLabel       | string                          | label       | Override SR label |
  | onCopy          | (value: string) => void         | undefined   | Fired after a successful copy |
  | class           | string                          | ''          | Extra classes on the button |

  ============================================================
-->

<script lang="ts">
	export type CopyButtonVariant = 'text' | 'icon' | 'both';
	export type CopyButtonSize = 'sm' | 'md' | 'lg';

	interface Props {
		value: string;
		label?: string;
		copiedLabel?: string;
		variant?: CopyButtonVariant;
		size?: CopyButtonSize;
		copiedDuration?: number;
		ariaLabel?: string;
		onCopy?: (value: string) => void;
		class?: string;
	}

	let {
		value,
		label = 'Copy',
		copiedLabel = 'Copied!',
		variant = 'both',
		size = 'md',
		copiedDuration = 2000,
		ariaLabel,
		onCopy,
		class: extraClass = ''
	}: Props = $props();

	let copied = $state(false);
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	async function handleClick() {
		try {
			await navigator.clipboard.writeText(value);
			copied = true;
			onCopy?.(value);
			if (resetTimer) clearTimeout(resetTimer);
			resetTimer = setTimeout(() => {
				copied = false;
			}, copiedDuration);
		} catch {
			// Clipboard API unavailable or denied — leave copied=false so the
			// button label stays in idle state. Consumers can wire onCopy to
			// detect success only.
		}
	}

	let displayLabel = $derived(copied ? copiedLabel : label);
</script>

<button
	type="button"
	class="copy-btn copy-{size} copy-{variant} {copied ? 'is-copied' : ''} {extraClass}"
	aria-label={ariaLabel ?? displayLabel}
	onclick={handleClick}
>
	{#if variant !== 'text'}
		<span class="copy-icon" aria-hidden="true">
			{#if copied}
				<!-- Checkmark glyph -->
				<svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="3 8 7 12 13 4" />
				</svg>
			{:else}
				<!-- Clipboard glyph -->
				<svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<rect x="4" y="3" width="8" height="11" rx="1" />
					<path d="M6 3V2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1" />
				</svg>
			{/if}
		</span>
	{/if}

	{#if variant !== 'icon'}
		<span class="copy-label">{displayLabel}</span>
	{/if}

	<span class="sr-only" role="status" aria-live="polite">
		{copied ? copiedLabel : ''}
	</span>
</button>

<style>
	/* Theme tokens — light defaults; chrome flips in the dark block at the
	   end of this stylesheet. See docs/THEMING.md. */
	.copy-btn {
		--copy-border: #d4d4d8;
		--copy-fg: #18181b;
		--copy-bg-hover: #fafafa;
		--copy-border-hover: #a1a1aa;
		--copy-focus-ring: #3b82f6;
		--copy-bg-active: #f4f4f5;
		--copy-success-bg: #ecfdf5;
		--copy-success-border: #10b981;
		--copy-success-fg: #065f46;
		--copy-bg: #ffffff;
	}

	.copy-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		border: 1px solid var(--copy-border);
		border-radius: 0.5rem;
		background: var(--copy-bg);
		color: var(--copy-fg);
		cursor: pointer;
		font-family: inherit;
		font-weight: 500;
		line-height: 1;
		transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
	}

	.copy-btn:hover {
		background: var(--copy-bg-hover);
		border-color: var(--copy-border-hover);
	}

	.copy-btn:focus-visible {
		outline: 2px solid var(--copy-focus-ring);
		outline-offset: 2px;
	}

	.copy-btn:active {
		background: var(--copy-bg-active);
	}

	.copy-btn.is-copied {
		background: var(--copy-success-bg);
		border-color: var(--copy-success-border);
		color: var(--copy-success-fg);
	}

	/* Sizes */
	.copy-sm {
		padding: 0.25rem 0.55rem;
		font-size: 0.75rem;
	}
	.copy-md {
		padding: 0.4rem 0.75rem;
		font-size: 0.875rem;
	}
	.copy-lg {
		padding: 0.55rem 1rem;
		font-size: 1rem;
	}

	/* Icon-only collapses padding to a square */
	.copy-icon-only,
	.copy-icon.copy-sm {
		padding: 0.3rem;
	}
	.copy-icon.copy-md {
		padding: 0.45rem;
	}
	.copy-icon.copy-lg {
		padding: 0.6rem;
	}

	.copy-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.copy-btn {
			transition: none;
		}
	}

	/*
	 * Dark scheme — chrome flips; the copied-state green keeps its hue.
	 */
	@media (prefers-color-scheme: dark) {
		.copy-btn {
			--copy-border: #3f3f46;
			--copy-fg: #f4f4f5;
			--copy-bg-hover: #27272a;
			--copy-border-hover: #71717a;
			--copy-bg-active: #3f3f46;
			--copy-success-bg: #022c22;
			--copy-success-fg: #6ee7b7;
			--copy-bg: #18181b;
		}
	}
</style>
