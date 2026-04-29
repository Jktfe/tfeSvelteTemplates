<!--
  ============================================================
  Drawer — Slide-in modal panel from any screen edge
  ============================================================

  WHAT IT DOES
  A modal layer that slides in from one of the four screen edges
  (left, right, top, bottom). While open, it traps keyboard focus
  inside itself, locks page scroll, and restores focus to whatever
  was focused before it opened. Click the backdrop or press
  Escape to close (unless `persistent` is set).

  FEATURES
  - Four edge positions (left / right / top / bottom)
  - Customisable size (number → px, or any CSS length)
  - Backdrop with click-to-close (disable via `persistent`)
  - Escape-to-close (disabled when `persistent`)
  - Keyboard focus trap (Tab cycles inside, never escapes)
  - Body scroll lock (preserves and restores prior overflow)
  - Focus restored to triggering element on close
  - CSS slide animation per edge (transform translate)
  - Respects `prefers-reduced-motion` (fade-only fallback)
  - Two-way `bind:open` for parent control
  - `onClose` callback for side effects on close

  ACCESSIBILITY
  - role="dialog" + aria-modal="true"
  - Auto-focuses the first tabbable element on open
  - Focus trap implemented manually for cross-browser
    consistency (the native <dialog> trap is inconsistent)
  - Restores focus to `document.activeElement` snapshot taken
    at open time
  - Honours `prefers-reduced-motion: reduce` (skip slide,
    use opacity fade only)

  USAGE
  Controlled with bind:open:

      <script>
          let open = $state(false);
      </script>

      <button onclick={() => open = true}>Show drawer</button>

      <Drawer bind:open position="right" size={400}>
          <h2>Hello</h2>
          <p>Drawer content here.</p>
      </Drawer>

  Persistent (no backdrop dismiss):

      <Drawer bind:open persistent>
          <form>...</form>
      </Drawer>

  PROPS
  | Prop           | Type                                      | Default     |
  |----------------|-------------------------------------------|-------------|
  | open           | boolean (bindable)                        | false       |
  | position       | 'left' \| 'right' \| 'top' \| 'bottom'    | 'right'     |
  | size           | number \| string                          | 320 (px)    |
  | persistent     | boolean                                   | false       |
  | ariaLabel      | string                                    | 'Drawer'    |
  | ariaLabelledBy | string                                    | undefined   |
  | onClose        | () => void                                | undefined   |
  | children       | Snippet                                   | required    |
  | class          | string                                    | ''          |
  ============================================================
-->

<script lang="ts">
	import { untrack, type Snippet } from 'svelte';

	export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

	interface Props {
		open?: boolean;
		position?: DrawerPosition;
		size?: number | string;
		persistent?: boolean;
		ariaLabel?: string;
		ariaLabelledBy?: string;
		onClose?: () => void;
		children?: Snippet;
		class?: string;
	}

	let {
		open = $bindable(false),
		position = 'right',
		size,
		persistent = false,
		ariaLabel = 'Drawer',
		ariaLabelledBy,
		onClose,
		children,
		class: extraClass = ''
	}: Props = $props();

	// Selector matching the elements browsers consider tabbable.
	// Disabled buttons / inputs are skipped so focus trap doesn't
	// land on them (browsers skip them naturally during Tab too).
	const TABBABLE_SELECTOR =
		'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

	let drawerEl: HTMLDivElement | undefined = $state();

	// We need to remember three things while the drawer is open so
	// that we can restore them cleanly on close.
	let previouslyFocused: HTMLElement | null = null;
	let previousBodyOverflow = '';

	// Forward `size` as an inline width (left/right) or height (top/bottom).
	// Numbers become px; any CSS length string (`'70vh'`, `'24rem'`) is
	// passed through verbatim.
	const sizeStyle = $derived.by(() => {
		if (size === undefined) return '';
		const value = typeof size === 'number' ? `${size}px` : size;
		if (position === 'left' || position === 'right') return `width: ${value};`;
		return `height: ${value};`;
	});

	// Open/close lifecycle: snapshot focus + body scroll, lock body,
	// schedule first-tabbable focus. On cleanup (close), restore
	// everything we touched. Wrapping the inner reads in `untrack` so
	// the effect only re-runs when `open` itself changes.
	$effect(() => {
		if (!open) return;
		if (typeof document === 'undefined') return;

		untrack(() => {
			previouslyFocused = document.activeElement as HTMLElement | null;
			previousBodyOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
		});

		// Wait one frame so Svelte has bound `drawerEl` and child
		// elements have mounted, then focus the first tabbable inside.
		const rafId = requestAnimationFrame(() => {
			if (!drawerEl) return;
			const first = drawerEl.querySelector<HTMLElement>(TABBABLE_SELECTOR);
			first?.focus();
		});

		return () => {
			cancelAnimationFrame(rafId);
			if (typeof document === 'undefined') return;
			document.body.style.overflow = previousBodyOverflow;
			if (previouslyFocused && document.body.contains(previouslyFocused)) {
				previouslyFocused.focus();
			}
		};
	});

	function close() {
		if (!open) return;
		open = false;
		onClose?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;

		if (e.key === 'Escape' && !persistent) {
			e.preventDefault();
			close();
			return;
		}

		if (e.key === 'Tab' && drawerEl) {
			const tabbables = Array.from(
				drawerEl.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)
			);
			if (tabbables.length === 0) {
				// Nothing to focus — keep focus trapped on the drawer
				// itself by preventing Tab from escaping.
				e.preventDefault();
				return;
			}
			const first = tabbables[0];
			const last = tabbables[tabbables.length - 1];
			const active = document.activeElement;

			if (e.shiftKey && active === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && active === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	function handleBackdropClick() {
		if (persistent) return;
		close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop is decorative + click target only — `role=presentation`
	     so AT doesn't announce it. The drawer itself carries the
	     dialog semantics. -->
	<div
		class="drawer-backdrop"
		onclick={handleBackdropClick}
		role="presentation"
	></div>

	<div
		bind:this={drawerEl}
		class="drawer drawer-{position} {extraClass}"
		style={sizeStyle}
		role="dialog"
		aria-modal="true"
		aria-label={ariaLabelledBy ? undefined : ariaLabel}
		aria-labelledby={ariaLabelledBy}
		tabindex="-1"
	>
		{@render children?.()}
	</div>
{/if}

<style>
	.drawer-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(15, 23, 42, 0.5);
		z-index: 999;
		animation: drawer-backdrop-in 200ms ease-out;
	}

	.drawer {
		position: fixed;
		background: #ffffff;
		color: #111827;
		z-index: 1000;
		overflow: auto;
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.25),
			0 0 0 1px rgba(0, 0, 0, 0.05);
	}

	/* Per-edge default sizing + slide-in animation. The `size` prop
	   overrides the dimension (width for left/right, height for
	   top/bottom) via inline style. */
	.drawer-left {
		top: 0;
		bottom: 0;
		left: 0;
		width: 320px;
		max-width: 90vw;
		animation: drawer-slide-left 280ms cubic-bezier(0.32, 0.72, 0, 1);
	}

	.drawer-right {
		top: 0;
		bottom: 0;
		right: 0;
		width: 320px;
		max-width: 90vw;
		animation: drawer-slide-right 280ms cubic-bezier(0.32, 0.72, 0, 1);
	}

	.drawer-top {
		top: 0;
		left: 0;
		right: 0;
		height: 320px;
		max-height: 90vh;
		animation: drawer-slide-top 280ms cubic-bezier(0.32, 0.72, 0, 1);
	}

	.drawer-bottom {
		bottom: 0;
		left: 0;
		right: 0;
		height: 320px;
		max-height: 90vh;
		animation: drawer-slide-bottom 280ms cubic-bezier(0.32, 0.72, 0, 1);
	}

	@keyframes drawer-backdrop-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes drawer-slide-left {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(0);
		}
	}

	@keyframes drawer-slide-right {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	@keyframes drawer-slide-top {
		from {
			transform: translateY(-100%);
		}
		to {
			transform: translateY(0);
		}
	}

	@keyframes drawer-slide-bottom {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	/* Reduced-motion: drop the translate, keep an opacity fade so the
	   user still has a visual cue that the drawer appeared. */
	@media (prefers-reduced-motion: reduce) {
		.drawer-left,
		.drawer-right,
		.drawer-top,
		.drawer-bottom {
			animation: drawer-fade-in 180ms ease-out;
		}
		@keyframes drawer-fade-in {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}
	}
</style>
