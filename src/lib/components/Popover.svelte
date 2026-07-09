<!--
  ===========================================================
  POPOVER
  ===========================================================
  WHAT — A click-triggered panel that anchors to a trigger button and
         flips its placement when it would overflow the viewport.
  WHY  — Reach for this when you need a small, interactive floating panel
         (a menu, a mini-form, a details card) tethered to a button. It is
         NOT a hover tooltip (see Tooltip — hover, non-interactive) and NOT
         a full modal (see MorphingDialog — centred, scroll-locked, morphs
         from its trigger). A Popover is light, click-anchored, and does not
         trap the page behind an overlay.
  FEATURES
    • Click trigger toggles open/closed; click outside or Escape closes.
    • Edge-aware placement — measures with getBoundingClientRect and flips
      to the opposite side when the preferred side would overflow.
    • Four placements: top | bottom | left | right, plus a cross-axis clamp
      so the panel never spills past the viewport edge.
    • Bindable `open` for two-way / programmatic control.
    • Snippet API: `trigger` (receives the props to spread onto your button)
      and `children` (the panel content).
  ACCESSIBILITY
    • Trigger carries aria-expanded + aria-haspopup="dialog".
    • Panel is role="dialog" aria-modal="false" and is labelled by an
      optional ariaLabel.
    • On open, focus moves to the first focusable element inside the panel
      (or the panel itself). Escape closes and returns focus to the trigger.
    • Open/close transition is gated on prefers-reduced-motion.
  DEPENDENCIES — Zero external. Pure Svelte 5 + scoped CSS.
  PERFORMANCE — The panel only mounts while open; when closed the DOM cost is
                just the inline trigger wrapper. Position is measured once per
                open (and on window resize/scroll while open).
  USAGE
    <Popover placement="bottom">
      {#snippet trigger(props)}
        <button {...props}>Open</button>
      {/snippet}
      <div>Panel content</div>
    </Popover>
  PROPS
    | Prop      | Type                                   | Default    | Description                          |
    |-----------|----------------------------------------|------------|--------------------------------------|
    | open      | boolean                                | false      | Panel open state (bindable)          |
    | placement | 'top'|'bottom'|'left'|'right'          | 'bottom'   | Preferred side; flips on overflow    |
    | offset    | number                                 | 8          | Gap in px between trigger and panel  |
    | ariaLabel | string                                 | 'Popover'  | Accessible name on the dialog        |
    | class     | string                                 | ''         | Extra class on the panel             |
    | trigger   | Snippet<[triggerProps]>                | —          | Renders the trigger button           |
    | children  | Snippet                                | —          | The panel content                    |
  ===========================================================
-->

<script lang="ts" module>
	// ============================================================
	// Popover — pure placement helpers
	//
	// The edge-aware maths lives in module scope so it can be
	// unit-tested without rendering the component.
	// ============================================================

	export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

	/** A minimal rect shape — everything the placement maths needs. */
	export interface RectLike {
		top: number;
		left: number;
		right: number;
		bottom: number;
		width: number;
		height: number;
	}

	const OPPOSITE: Record<PopoverPlacement, PopoverPlacement> = {
		top: 'bottom',
		bottom: 'top',
		left: 'right',
		right: 'left'
	};

	/**
	 * Decide the actual side to render on. If the preferred side lacks room
	 * for the panel (plus the gap) and the opposite side has strictly more
	 * space, flip to the opposite side. Otherwise keep the preference.
	 */
	export function flipPlacement(
		preferred: PopoverPlacement,
		trigger: RectLike,
		panelW: number,
		panelH: number,
		viewportW: number,
		viewportH: number,
		offset: number
	): PopoverPlacement {
		const space = {
			top: trigger.top,
			bottom: viewportH - trigger.bottom,
			left: trigger.left,
			right: viewportW - trigger.right
		};
		const isVertical = preferred === 'top' || preferred === 'bottom';
		const need = (isVertical ? panelH : panelW) + offset;
		const opp = OPPOSITE[preferred];
		if (space[preferred] < need && space[opp] > space[preferred]) {
			return opp;
		}
		return preferred;
	}

	/**
	 * Compute the fixed-position top/left for the panel given a resolved
	 * placement. The panel is centred on the trigger's cross-axis, then
	 * clamped so it never spills past the viewport edge (with `pad` breathing
	 * room). Coordinates are viewport-relative, to pair with position: fixed.
	 */
	export function computePosition(
		placement: PopoverPlacement,
		trigger: RectLike,
		panelW: number,
		panelH: number,
		viewportW: number,
		viewportH: number,
		offset: number,
		pad = 8
	): { top: number; left: number } {
		let top = 0;
		let left = 0;

		switch (placement) {
			case 'top':
				top = trigger.top - panelH - offset;
				left = trigger.left + (trigger.width - panelW) / 2;
				break;
			case 'bottom':
				top = trigger.bottom + offset;
				left = trigger.left + (trigger.width - panelW) / 2;
				break;
			case 'left':
				left = trigger.left - panelW - offset;
				top = trigger.top + (trigger.height - panelH) / 2;
				break;
			case 'right':
				left = trigger.right + offset;
				top = trigger.top + (trigger.height - panelH) / 2;
				break;
		}

		// Cross-axis clamp so the panel stays on-screen.
		const maxLeft = Math.max(pad, viewportW - panelW - pad);
		const maxTop = Math.max(pad, viewportH - panelH - pad);
		left = Math.min(Math.max(pad, left), maxLeft);
		top = Math.min(Math.max(pad, top), maxTop);

		return { top, left };
	}

	/** Browser-safe `prefers-reduced-motion: reduce` probe (false during SSR). */
	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
			return false;
		}
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}
</script>

<script lang="ts">
	import { tick, type Snippet } from 'svelte';

	interface Props {
		/** Panel open state — bindable for two-way / programmatic control. */
		open?: boolean;
		/** Preferred side to anchor on; flips automatically on overflow. */
		placement?: PopoverPlacement;
		/** Gap in pixels between the trigger and the panel. */
		offset?: number;
		/** Accessible name announced for the dialog. */
		ariaLabel?: string;
		/** Extra class on the panel element. */
		class?: string;
		/** Renders the trigger — spread the received props onto your button. */
		trigger: Snippet<
			[{ onclick: () => void; 'aria-expanded': boolean; 'aria-haspopup': 'dialog' }]
		>;
		/** The panel content. */
		children: Snippet;
	}

	let {
		open = $bindable(false),
		placement = 'bottom',
		offset = 8,
		ariaLabel = 'Popover',
		class: className = '',
		trigger,
		children
	}: Props = $props();

	// The inline wrapper around the trigger button — measured for placement.
	let triggerEl = $state<HTMLElement | null>(null);
	// The panel element — measured for placement + focus management.
	let panelEl = $state<HTMLElement | null>(null);

	// Resolved (post-flip) placement and viewport-relative position. Seeded to
	// 'bottom' and overwritten by measure() before the panel becomes visible.
	let resolvedPlacement = $state<PopoverPlacement>('bottom');
	let posTop = $state(0);
	let posLeft = $state(0);
	// Gates the entrance transition; false until the panel is positioned so it
	// doesn't flash at 0,0 before the first measure.
	let positioned = $state(false);

	let reducedMotion = $state(false);

	/** Toggle handler handed to the trigger snippet. */
	function toggle() {
		if (open) {
			closePopover();
		} else {
			openPopover();
		}
	}

	async function openPopover() {
		open = true;
		positioned = false;
		reducedMotion = isReducedMotion();
		// Wait for the panel to mount so we can measure it, then position + focus.
		await tick();
		measure();
		focusPanel();
	}

	function closePopover(returnFocus = true) {
		if (!open) return;
		open = false;
		positioned = false;
		if (returnFocus) {
			// Return focus to the trigger button inside the wrapper.
			const btn = triggerEl?.querySelector<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			(btn ?? triggerEl)?.focus();
		}
	}

	/** Measure trigger + panel, flip if needed, and set the position. */
	function measure() {
		if (!triggerEl || !panelEl) return;
		const t = triggerEl.getBoundingClientRect();
		const p = panelEl.getBoundingClientRect();
		const vw = window.innerWidth;
		const vh = window.innerHeight;

		resolvedPlacement = flipPlacement(placement, t, p.width, p.height, vw, vh, offset);
		const pos = computePosition(
			resolvedPlacement,
			t,
			p.width,
			p.height,
			vw,
			vh,
			offset
		);
		posTop = pos.top;
		posLeft = pos.left;
		positioned = true;
	}

	/** Move focus into the panel — first focusable child, or the panel itself. */
	function focusPanel() {
		if (!panelEl) return;
		const focusable = panelEl.querySelector<HTMLElement>(
			'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		(focusable ?? panelEl).focus();
	}

	/** Close when a pointer press lands outside both the trigger and the panel. */
	function handlePointerDown(event: MouseEvent) {
		if (!open) return;
		const target = event.target as Node;
		if (triggerEl?.contains(target) || panelEl?.contains(target)) return;
		closePopover(false);
	}

	/** Escape closes and returns focus; keep it a window handler for reliability. */
	function handleKeydown(event: KeyboardEvent) {
		if (!open) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			closePopover(true);
		}
	}

	/** Reposition while open if the page scrolls or the viewport resizes. */
	function handleReflow() {
		if (open) measure();
	}
</script>

<svelte:window
	onmousedown={handlePointerDown}
	onkeydown={handleKeydown}
	onresize={handleReflow}
	onscroll={handleReflow}
/>

<!-- Trigger wrapper — inline so it doesn't disturb the surrounding layout. -->
<span class="popover-trigger" bind:this={triggerEl}>
	{@render trigger({
		onclick: toggle,
		'aria-expanded': open,
		'aria-haspopup': 'dialog'
	})}
</span>

{#if open}
	<div
		bind:this={panelEl}
		class="popover-panel {className}"
		class:popover-panel--ready={positioned}
		class:popover-panel--animate={!reducedMotion}
		data-placement={resolvedPlacement}
		role="dialog"
		aria-modal="false"
		aria-label={ariaLabel}
		tabindex="-1"
		style="top: {posTop}px; left: {posLeft}px;"
	>
		{@render children()}
	</div>
{/if}

<style>
	/* The trigger wrapper stays inline so button flow is untouched. */
	.popover-trigger {
		display: inline-block;
	}

	/* The floating panel. Fixed positioning pairs with getBoundingClientRect,
	   which returns viewport-relative coordinates. */
	.popover-panel {
		position: fixed;
		z-index: 1000;
		min-width: 180px;
		max-width: min(360px, calc(100vw - 16px));
		padding: 12px 14px;
		background: #ffffff;
		color: #111827;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 10px;
		box-shadow:
			0 10px 30px -12px rgba(0, 0, 0, 0.35),
			0 2px 8px -4px rgba(0, 0, 0, 0.2);
		outline: none;
		/* Hidden until positioned so it never flashes at the top-left corner. */
		opacity: 0;
	}

	.popover-panel--ready {
		opacity: 1;
	}

	.popover-panel:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/* Entrance transition — only applied when motion is allowed. A tiny
	   directional nudge based on the resolved placement. */
	.popover-panel--animate {
		transition:
			opacity 0.14s ease,
			transform 0.14s ease;
	}

	.popover-panel--animate:not(.popover-panel--ready) {
		transform: scale(0.97);
	}
	.popover-panel--animate[data-placement='top']:not(.popover-panel--ready) {
		transform: translateY(4px);
	}
	.popover-panel--animate[data-placement='bottom']:not(.popover-panel--ready) {
		transform: translateY(-4px);
	}
	.popover-panel--animate[data-placement='left']:not(.popover-panel--ready) {
		transform: translateX(4px);
	}
	.popover-panel--animate[data-placement='right']:not(.popover-panel--ready) {
		transform: translateX(-4px);
	}

	.popover-panel--ready {
		transform: none;
	}

	/* Respect the user's motion preference — no entrance movement at all. */
	@media (prefers-reduced-motion: reduce) {
		.popover-panel {
			transition: none !important;
			transform: none !important;
		}
	}

	/* Dark scheme support (dual theme). */
	@media (prefers-color-scheme: dark) {
		.popover-panel {
			background: #1f2430;
			color: #e5e7eb;
			border-color: rgba(255, 255, 255, 0.12);
			box-shadow:
				0 10px 30px -12px rgba(0, 0, 0, 0.7),
				0 2px 8px -4px rgba(0, 0, 0, 0.5);
		}
	}
</style>
