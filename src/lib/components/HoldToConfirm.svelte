<!--
  ============================================================
  HoldToConfirm

  WHAT
  Press-and-hold confirmation button for destructive UX flows
  (hold-to-delete, hold-to-send, hold-to-leave-call). Fills a
  ring / bar / glow as the user holds; release-before-complete
  cancels, release-after-complete fires onConfirm. Designed to
  defeat habituation — users cannot accidentally tap-confirm.

  FEATURES
  • 3 variants — ring (SVG stroke-dashoffset), bar (linear
    horizontal fill), glow (radial pulse fill)
  • Pointer events — pointerdown starts the hold; pointerup,
    pointercancel and pointerleave reset it. Pointer capture
    keeps the gesture alive even if the user drags outside.
  • Keyboard parity — Enter starts a programmatic hold cycle,
    held until Enter is released (or duration completes). The
    gesture works for keyboard users without faking a 2-step
    click.
  • Reduced-motion bypass — instant single-press confirm with
    a visible "Press and hold for {duration}s" text fallback.
    The dialog text is the fallback safety; the gesture is the
    primary safety.
  • Pure CSS animation driving the visible fill. Width / stroke
    progress is GPU-composited.
  • Confirmed state holds for 700 ms before resetting so the
    user sees their action register before the button returns
    to idle.

  ACCESSIBILITY
  • role="button", aria-pressed reflects the holding state,
    aria-disabled when disabled. Visible focus ring.
  • Keyboard Enter triggers the same hold cycle as pointerdown;
    keyup before duration cancels (mirrors release-to-cancel).
  • prefers-reduced-motion: reduce → bypass to a single-press
    confirm + visible text fallback that explains the original
    contract.

  DEPENDENCIES
  Zero external — pure Svelte 5 + scoped CSS.

  PERFORMANCE
  • One <button> + one fill element + one label. No per-frame
    JS while holding — CSS animation drives the visible
    progress; the JS timer only fires the confirm callback.
  • Helpers exported from the module script for unit-testing
    without a DOM.

  USAGE
  <HoldToConfirm onConfirm={() => deleteAccount()} />
  <HoldToConfirm variant="bar" duration={2000} label="Hold to send" />
  <HoldToConfirm variant="glow" label="Hold to leave call" duration={1500} />

  PROPS
  | Prop      | Type                            | Default                  |
  |-----------|---------------------------------|--------------------------|
  | duration  | number  (clamped 200–10000 ms)  | 1500                     |
  | label     | string                          | 'Hold to confirm'        |
  | variant   | 'ring' \| 'bar' \| 'glow'        | 'ring'                   |
  | onConfirm | () => void                      | () => {}                 |
  | onCancel  | () => void                      | () => {}                 |
  | disabled  | boolean                         | false                    |
  | ariaLabel | string                          | label value              |
  | class     | string                          | ''                       |
  ============================================================
-->

<script lang="ts" module>
	// ============================================================
	// HoldToConfirm — pure helpers + types
	//
	// All validation lives in module scope so the test suite can
	// verify it without rendering. clampDuration uses ms because
	// every consumer naturally thinks in ms for setTimeout.
	// ============================================================

	export type HoldToConfirmVariant = 'ring' | 'bar' | 'glow';

	const VALID_VARIANTS: readonly HoldToConfirmVariant[] = ['ring', 'bar', 'glow'];

	export function isValidVariant(name: unknown): name is HoldToConfirmVariant {
		return typeof name === 'string' && (VALID_VARIANTS as readonly string[]).includes(name);
	}

	export function pickVariant(name: unknown): HoldToConfirmVariant {
		return isValidVariant(name) ? name : 'ring';
	}

	/**
	 * Clamp the hold duration into [200, 10000] ms.
	 * • Below 200 ms the gesture is indistinguishable from a tap
	 *   and defeats the entire point of the primitive.
	 * • Above 10 s the UX becomes hostile — even destructive
	 *   actions should not require ten seconds of pressure.
	 * Non-numeric / non-finite input falls back to 1500 ms.
	 */
	export function clampDuration(n: unknown): number {
		if (typeof n !== 'number' || !Number.isFinite(n)) return 1500;
		if (n < 200) return 200;
		if (n > 10000) return 10000;
		return n;
	}

	/**
	 * Browser-safe `prefers-reduced-motion: reduce` probe. Returns
	 * false during SSR / Node test runs so the server-rendered
	 * markup matches the default-animated client render before
	 * onMount has a chance to flip the gate.
	 */
	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
			return false;
		}
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}
</script>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	type Props = {
		duration?: number;
		label?: string;
		variant?: HoldToConfirmVariant;
		onConfirm?: () => void;
		onCancel?: () => void;
		disabled?: boolean;
		ariaLabel?: string;
		class?: string;
	};

	let {
		duration = 1500,
		label = 'Hold to confirm',
		variant = 'ring',
		onConfirm = () => {},
		onCancel = () => {},
		disabled = false,
		ariaLabel,
		class: extraClass = ''
	}: Props = $props();

	const safeDuration = $derived(clampDuration(duration));
	const safeVariant = $derived(pickVariant(variant));
	const resolvedAriaLabel = $derived(ariaLabel ?? label);

	let holding = $state(false);
	let confirmed = $state(false);
	let reduced = $state(false);
	let timer: ReturnType<typeof setTimeout> | null = null;
	let resetTimer: ReturnType<typeof setTimeout> | null = null;

	onMount(() => {
		reduced = isReducedMotion();
	});

	onDestroy(() => {
		if (timer) clearTimeout(timer);
		if (resetTimer) clearTimeout(resetTimer);
	});

	function startHold() {
		if (disabled || confirmed || holding) return;
		holding = true;
		timer = setTimeout(() => {
			holding = false;
			confirmed = true;
			timer = null;
			onConfirm();
			// Hold the confirmed state long enough to register
			// visually, then reset so the button can be reused.
			resetTimer = setTimeout(() => {
				confirmed = false;
				resetTimer = null;
			}, 700);
		}, safeDuration);
	}

	function cancelHold() {
		if (!holding) return;
		holding = false;
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		onCancel();
	}

	function handlePointerDown(event: PointerEvent) {
		if (disabled) return;
		// In reduced-motion mode the gesture collapses to a single
		// press → confirm. The text fallback below explains the
		// original contract for users who land in this mode.
		if (reduced) {
			if (confirmed) return;
			confirmed = true;
			onConfirm();
			resetTimer = setTimeout(() => {
				confirmed = false;
				resetTimer = null;
			}, 700);
			return;
		}
		(event.currentTarget as Element)?.setPointerCapture?.(event.pointerId);
		startHold();
	}

	function handlePointerEnd() {
		cancelHold();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (disabled) return;
		// Repeat events fire while the key is held — we only want
		// the first one to start the cycle, the rest are ignored.
		if (event.repeat) return;
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		if (reduced) {
			if (confirmed) return;
			confirmed = true;
			onConfirm();
			resetTimer = setTimeout(() => {
				confirmed = false;
				resetTimer = null;
			}, 700);
			return;
		}
		startHold();
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		cancelHold();
	}
</script>

<button
	type="button"
	class="htc {extraClass}"
	class:htc-holding={holding}
	class:htc-confirmed={confirmed}
	class:htc-disabled={disabled}
	class:htc-reduced={reduced}
	data-holdtoconfirm-variant={safeVariant}
	aria-label={resolvedAriaLabel}
	aria-pressed={holding}
	aria-disabled={disabled}
	disabled={disabled || undefined}
	style="--htc-duration:{safeDuration}ms;"
	onpointerdown={handlePointerDown}
	onpointerup={handlePointerEnd}
	onpointercancel={handlePointerEnd}
	onpointerleave={handlePointerEnd}
	onkeydown={handleKeyDown}
	onkeyup={handleKeyUp}
>
	{#if safeVariant === 'ring'}
		<svg class="htc-ring" viewBox="0 0 44 44" aria-hidden="true">
			<circle class="htc-ring-track" cx="22" cy="22" r="20" />
			<circle class="htc-ring-fill" cx="22" cy="22" r="20" />
		</svg>
	{:else if safeVariant === 'bar'}
		<span class="htc-bar" aria-hidden="true">
			<span class="htc-bar-fill"></span>
		</span>
	{:else}
		<span class="htc-glow" aria-hidden="true"></span>
	{/if}

	<span class="htc-label">
		{#if confirmed}
			Confirmed
		{:else if holding}
			Keep holding…
		{:else}
			{label}
		{/if}
	</span>

	{#if reduced}
		<span class="htc-fallback-text">
			Press and hold for {(safeDuration / 1000).toFixed(1)}s — reduced-motion mode collapses to a
			single press.
		</span>
	{/if}
</button>

<style>
	.htc {
		--htc-color: #38bdf8;
		--htc-fg: #ffffff;
		--htc-bg: #0d0d1a;
		--htc-border: #1f1f3a;

		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1.25rem;
		border: 1px solid var(--htc-border);
		border-radius: 999px;
		background: var(--htc-bg);
		color: var(--htc-fg);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		touch-action: manipulation;
		overflow: hidden;
		transition: border-color 160ms ease, color 160ms ease;
	}

	.htc:focus-visible {
		outline: 2px solid var(--htc-color);
		outline-offset: 2px;
	}

	.htc-disabled,
	.htc:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.htc-confirmed {
		border-color: #10b981;
		color: #10b981;
	}

	.htc-label {
		position: relative;
		z-index: 2;
		font-size: 0.95rem;
		letter-spacing: 0.01em;
	}

	.htc-fallback-text {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	/* ---- ring variant -------------------------------------------- */
	.htc-ring {
		position: relative;
		z-index: 2;
		width: 24px;
		height: 24px;
		flex-shrink: 0;
		transform: rotate(-90deg);
	}

	.htc-ring-track {
		fill: none;
		stroke: var(--htc-border);
		stroke-width: 4;
	}

	.htc-ring-fill {
		fill: none;
		stroke: var(--htc-color);
		stroke-width: 4;
		stroke-linecap: round;
		/* circumference of r=20 ≈ 125.66, rounded to 126 for the
		   dasharray. The fill animates from 126 → 0 over duration. */
		stroke-dasharray: 126;
		stroke-dashoffset: 126;
	}

	.htc-holding[data-holdtoconfirm-variant='ring'] .htc-ring-fill {
		animation: htc-ring-fill var(--htc-duration, 1500ms) linear forwards;
	}

	.htc-confirmed[data-holdtoconfirm-variant='ring'] .htc-ring-fill {
		stroke-dashoffset: 0;
		stroke: #10b981;
	}

	@keyframes htc-ring-fill {
		from {
			stroke-dashoffset: 126;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	/* ---- bar variant --------------------------------------------- */
	.htc-bar {
		position: absolute;
		inset: 0;
		z-index: 1;
		background: transparent;
		overflow: hidden;
		border-radius: 999px;
		pointer-events: none;
	}

	.htc-bar-fill {
		display: block;
		height: 100%;
		width: 0%;
		background: var(--htc-color);
		opacity: 0.18;
		transform-origin: 0% 50%;
	}

	.htc-holding[data-holdtoconfirm-variant='bar'] .htc-bar-fill {
		animation: htc-bar-fill var(--htc-duration, 1500ms) linear forwards;
	}

	.htc-confirmed[data-holdtoconfirm-variant='bar'] .htc-bar-fill {
		width: 100%;
		background: #10b981;
		opacity: 0.22;
	}

	@keyframes htc-bar-fill {
		from {
			width: 0%;
		}
		to {
			width: 100%;
		}
	}

	/* ---- glow variant -------------------------------------------- */
	.htc-glow {
		position: absolute;
		inset: 0;
		z-index: 1;
		border-radius: 999px;
		pointer-events: none;
		background: radial-gradient(
			circle at 50% 50%,
			color-mix(in srgb, var(--htc-color) 32%, transparent) 0%,
			transparent 70%
		);
		opacity: 0;
		transform: scale(0.6);
	}

	.htc-holding[data-holdtoconfirm-variant='glow'] .htc-glow {
		animation: htc-glow-pulse var(--htc-duration, 1500ms) ease-out forwards;
	}

	.htc-confirmed[data-holdtoconfirm-variant='glow'] .htc-glow {
		opacity: 1;
		transform: scale(1);
		background: radial-gradient(
			circle at 50% 50%,
			color-mix(in srgb, #10b981 38%, transparent) 0%,
			transparent 75%
		);
	}

	@keyframes htc-glow-pulse {
		from {
			opacity: 0;
			transform: scale(0.6);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* ---- reduced motion ------------------------------------------
	   In reduced-motion mode the fill animations are suppressed —
	   the component collapses to a single-press confirm. The
	   visible label still flips through "Keep holding…" briefly
	   in case the user manages a short hold, but the gesture
	   itself is no longer required. */
	.htc-reduced .htc-ring-fill,
	.htc-reduced .htc-bar-fill,
	.htc-reduced .htc-glow {
		animation: none !important;
	}

	.htc-reduced .htc-fallback-text {
		position: static;
		left: auto;
		width: auto;
		height: auto;
		margin-left: 0.5rem;
		font-size: 0.75rem;
		font-weight: 400;
		opacity: 0.7;
	}

	@media (prefers-reduced-motion: reduce) {
		.htc-ring-fill,
		.htc-bar-fill,
		.htc-glow {
			animation: none !important;
		}
	}
</style>
