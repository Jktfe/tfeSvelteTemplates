<!--
  ============================================================
  BACK TO TOP

  🎯 WHAT IT DOES
  A floating button that stays out of the way until the reader
  has scrolled past a threshold, then fades in from a screen
  corner. Clicking (or activating with the keyboard) smooth-
  scrolls the page — or a named scroll container — back to the
  top. The classic "jump to top" affordance for long articles,
  docs, feeds, and infinite lists.

  💡 WHY
  On long pages the scrollbar is a poor way home. A single,
  predictable control that appears only when it's useful keeps
  the chrome quiet while still giving readers a fast way back
  to the top without hammering Home/⌘↑.

  ✨ FEATURES
  • Appears only after `threshold` px of scroll (default 300)
  • Tracks `window` by default, or any scrollable element /
    CSS selector via the `target` prop
  • Two corner positions — bottom-right (default) or bottom-left
  • rAF-throttled scroll listener — one state write per frame
  • Smooth or instant scroll via the `smooth` prop
  • `label` doubles as the aria-label and (optionally) visible text
  • `class` forwards to the button for further styling

  ♿ ACCESSIBILITY
  • A real <button> with an aria-label — announced correctly
  • Not rendered at all while hidden, so it is never a phantom
    tab stop — keyboard users only reach it when it is useful
  • Visible focus ring (:focus-visible)
  • prefers-reduced-motion → the fade-in transition is dropped
    AND the scroll jump becomes instant (behavior: 'auto')

  📦 DEPENDENCIES
  Zero external dependencies — pure Svelte 5 + scoped CSS.
  Inline SVG icon, no icon library.

  ⚡ PERFORMANCE
  • Single passive, rAF-throttled scroll listener
  • One boolean state write per animation frame
  • Listener + pending rAF are removed/cancelled on unmount

  🎨 USAGE
  <BackToTop />

  <BackToTop threshold={600} position="bottom-left" showLabel />

  <BackToTop target="#article-body" smooth={false} label="Jump up" />

  📋 PROPS
  | Prop      | Type                                    | Default        |
  |-----------|-----------------------------------------|----------------|
  | threshold | number (px scrolled before it appears)  | 300            |
  | smooth    | boolean                                 | true           |
  | label     | string (aria-label + optional text)     | 'Back to top'  |
  | showLabel | boolean (render `label` as visible text)| false          |
  | position  | 'bottom-right' \| 'bottom-left'         | 'bottom-right' |
  | target    | Window \| HTMLElement \| string (selector) | window (undef) |
  | class     | string                                  | ''             |

  ============================================================
-->

<script lang="ts" module>
	export type BackToTopPosition = 'bottom-right' | 'bottom-left';

	export const VALID_POSITIONS: readonly BackToTopPosition[] = ['bottom-right', 'bottom-left'];

	export function isValidPosition(p: unknown): p is BackToTopPosition {
		return typeof p === 'string' && (VALID_POSITIONS as readonly string[]).includes(p);
	}

	/** Coerce arbitrary input to a supported position, defaulting to bottom-right. */
	export function pickPosition(p: unknown): BackToTopPosition {
		return isValidPosition(p) ? p : 'bottom-right';
	}

	/**
	 * Should the button be visible? True once the reader has scrolled
	 * strictly past the threshold. Non-finite inputs read as "not past".
	 */
	export function isPastThreshold(scrollTop: unknown, threshold: unknown): boolean {
		const top = typeof scrollTop === 'number' ? scrollTop : Number(scrollTop);
		const limit = typeof threshold === 'number' ? threshold : Number(threshold);
		if (!Number.isFinite(top) || !Number.isFinite(limit)) return false;
		return top > limit;
	}

	/**
	 * Resolve the scroll behaviour. Smooth only when the caller asked for
	 * it AND the user has not requested reduced motion — otherwise instant.
	 */
	export function resolveScrollBehavior(smooth: boolean, reduced: boolean): ScrollBehavior {
		return smooth && !reduced ? 'smooth' : 'auto';
	}

	/** Read the current scroll offset from a window or element target. */
	export function readScrollTop(target: Window | HTMLElement | null | undefined): number {
		if (!target) return 0;
		if (typeof window !== 'undefined' && target === window) {
			return window.scrollY || document.documentElement.scrollTop || 0;
		}
		const el = target as HTMLElement;
		return el && typeof el.scrollTop === 'number' ? el.scrollTop : 0;
	}

	/** Probe prefers-reduced-motion without throwing on SSR / old browsers. */
	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
		try {
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		} catch {
			return false;
		}
	}
</script>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';

	interface Props {
		/** Pixels scrolled before the button appears. */
		threshold?: number;
		/** Smooth-scroll on click (ignored when prefers-reduced-motion). */
		smooth?: boolean;
		/** aria-label, and the visible text when `showLabel` is set. */
		label?: string;
		/** Render `label` as visible text next to the icon. */
		showLabel?: boolean;
		/** Which corner the button sits in. */
		position?: BackToTopPosition | string;
		/** Scroll source — window (default), an element, or a CSS selector. */
		target?: Window | HTMLElement | string;
		/** Extra classes forwarded to the button. */
		class?: string;
	}

	let {
		threshold = 300,
		smooth = true,
		label = 'Back to top',
		showLabel = false,
		position = 'bottom-right',
		target,
		class: className = ''
	}: Props = $props();

	const resolvedPosition = $derived(pickPosition(position));

	let visible = $state(false);
	let reduced = $state(false);
	let rafId = 0;
	let scrollTarget: Window | HTMLElement | null = null;

	/** Turn the `target` prop into a concrete scroll source. */
	function resolveTarget(): Window | HTMLElement | null {
		if (target == null) return window;
		if (typeof target === 'string') {
			return target.length > 0 ? (document.querySelector(target) as HTMLElement | null) : window;
		}
		return target;
	}

	function update() {
		rafId = 0;
		visible = isPastThreshold(readScrollTop(scrollTarget), threshold);
	}

	// rAF throttle — collapse a burst of scroll events into one write per frame.
	function handleScroll() {
		if (rafId) return;
		rafId = requestAnimationFrame(update);
	}

	function scrollToTop() {
		const behavior = resolveScrollBehavior(smooth, reduced);
		const dest = scrollTarget ?? window;
		if (typeof (dest as HTMLElement | Window).scrollTo === 'function') {
			(dest as HTMLElement | Window).scrollTo({ top: 0, behavior });
		}
	}

	onMount(() => {
		reduced = isReducedMotion();
		scrollTarget = resolveTarget();
		if (!scrollTarget) return;

		scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
		update(); // initial state — may already be scrolled (e.g. restored position)
	});

	onDestroy(() => {
		if (rafId) cancelAnimationFrame(rafId);
		if (scrollTarget) scrollTarget.removeEventListener('scroll', handleScroll);
	});
</script>

{#if visible}
	<button
		type="button"
		class="back-to-top pos-{resolvedPosition} {className}"
		class:has-label={showLabel}
		aria-label={label}
		onclick={scrollToTop}
		transition:fly={{ y: 12, duration: reduced ? 0 : 220 }}
	>
		<svg
			class="btt-icon"
			viewBox="0 0 24 24"
			width="20"
			height="20"
			aria-hidden="true"
			focusable="false"
		>
			<path
				d="M12 5v14M12 5l-6 6M12 5l6 6"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		{#if showLabel}<span class="btt-text">{label}</span>{/if}
	</button>
{/if}

<style>
	.back-to-top {
		position: fixed;
		bottom: 24px;
		z-index: 9999;

		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;

		height: 48px;
		min-width: 48px;
		padding: 0;

		border: 1px solid var(--border, rgba(0, 0, 0, 0.12));
		border-radius: 999px;
		background: var(--accent, #6366f1);
		color: var(--fg-on-dark, #ffffff);

		cursor: pointer;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
		transition:
			transform 160ms ease,
			box-shadow 160ms ease,
			background 160ms ease;
	}

	.back-to-top.pos-bottom-right {
		right: 24px;
	}

	.back-to-top.pos-bottom-left {
		left: 24px;
	}

	.back-to-top.has-label {
		padding: 0 18px 0 14px;
	}

	.btt-icon {
		display: block;
		flex: none;
	}

	.btt-text {
		font-size: 14px;
		font-weight: 600;
		line-height: 1;
		white-space: nowrap;
	}

	.back-to-top:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 26px rgba(0, 0, 0, 0.24);
	}

	.back-to-top:active {
		transform: translateY(0);
	}

	.back-to-top:focus-visible {
		outline: 3px solid var(--focus-ring, #f59e0b);
		outline-offset: 3px;
	}

	@media (prefers-reduced-motion: reduce) {
		.back-to-top {
			transition: none;
		}
		.back-to-top:hover {
			transform: none;
		}
	}
</style>
