<!--
  ============================================================
  Tooltip - Accessible Hover/Focus Tooltip
  ============================================================

  WHAT IT DOES
  Wraps any trigger element (button, link, icon) and shows a small floating
  panel with helpful text on hover or keyboard focus. Hides on mouse leave,
  blur, or pressing Escape. The trigger is linked to the tooltip body via
  aria-describedby so screen readers announce the description after the
  element's own name.

  FEATURES
  - Four placements: top / right / bottom / left
  - Configurable show / hide delays (ms)
  - Plain string or rich snippet content
  - Hover AND focus both trigger (touch and keyboard supported)
  - Escape closes the tooltip if it's open
  - Honours prefers-reduced-motion (no fade)
  - Honours prefers-color-scheme (dark flip via CSS custom properties)
  - Pure Svelte 5 runes, zero dependencies

  THEMING
  Three CSS custom properties on .tooltip-wrap, light defaults inline,
  flipped automatically under @media (prefers-color-scheme: dark):
  - --tooltip-fg     foreground (light: #f9fafb / dark: #111827)
  - --tooltip-bg     background and arrow fill (light: #111827 / dark: #f9fafb)
  - --tooltip-shadow drop shadow under the body
  Override the chrome tokens by targeting .tooltip-wrap directly with
  at least 2-class specificity. An ancestor :root or body rule only
  inherits the variable, so the component's own declared default still
  wins — see docs/THEMING.md for the full mechanism. Doubled-class
  trick is the cheapest unconditional override:
      body .tooltip-wrap.tooltip-wrap { --tooltip-bg: #1e3a8a; --tooltip-fg: #fff; }

  ACCESSIBILITY
  - Trigger gets aria-describedby pointing at the tooltip element
  - Tooltip element has role="tooltip"
  - Works with keyboard alone (Tab to focus the trigger, Esc to dismiss)
  - We use aria-describedby (not aria-labelledby) so the trigger keeps
    its own accessible name and the tooltip is supplemental description

  USAGE
  Wrapping a button:
      Tooltip text="Save your changes"
        button class="save"
          Save
        /button
      /Tooltip

  Different placement:
      Tooltip text="Permanent action" placement="right"
        button class="danger"
          Delete
        /button
      /Tooltip

  Rich tooltip body:
      Tooltip
        Snippet#tip
          strong Pro tip /strong
          : keyboard shortcut Cmd+S
        /Snippet
        button Save /button
      /Tooltip

  PROPS
  | Prop        | Type                                       | Default | Description |
  |-------------|--------------------------------------------|---------|-------------|
  | text        | string                                     | ''      | Tooltip text (use 'tip' snippet for rich content) |
  | placement   | 'top' | 'right' | 'bottom' | 'left'        | 'top'   | Side of the trigger |
  | showDelay   | number                                     | 200     | ms before showing on hover/focus |
  | hideDelay   | number                                     | 0       | ms before hiding on leave/blur |
  | id          | string                                     | auto    | aria id linking trigger to tooltip |
  | class       | string                                     | ''      | Extra classes on the wrapper |

  ============================================================
-->

<script lang="ts">
	import type { Snippet } from 'svelte';

	export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

	interface Props {
		text?: string;
		placement?: TooltipPlacement;
		showDelay?: number;
		hideDelay?: number;
		id?: string;
		class?: string;
		children?: Snippet;
		tip?: Snippet;
	}

	let {
		text = '',
		placement = 'top',
		showDelay = 200,
		hideDelay = 0,
		id,
		class: extraClass = '',
		children,
		tip
	}: Props = $props();

	let tooltipId = $derived(id ?? `tooltip-${Math.random().toString(36).slice(2, 9)}`);

	let visible = $state(false);
	let showTimer: ReturnType<typeof setTimeout> | undefined;
	let hideTimer: ReturnType<typeof setTimeout> | undefined;

	function clearTimers() {
		if (showTimer) {
			clearTimeout(showTimer);
			showTimer = undefined;
		}
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = undefined;
		}
	}

	function show() {
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = undefined;
		}
		if (visible || showTimer) return;
		showTimer = setTimeout(() => {
			visible = true;
			showTimer = undefined;
		}, showDelay);
	}

	function hide() {
		if (showTimer) {
			clearTimeout(showTimer);
			showTimer = undefined;
		}
		if (!visible || hideTimer) return;
		if (hideDelay === 0) {
			visible = false;
			return;
		}
		hideTimer = setTimeout(() => {
			visible = false;
			hideTimer = undefined;
		}, hideDelay);
	}

	function handleKey(event: KeyboardEvent) {
		if (event.key === 'Escape' && visible) {
			clearTimers();
			visible = false;
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
	class="tooltip-wrap {extraClass}"
	onmouseenter={show}
	onmouseleave={hide}
	onfocusin={show}
	onfocusout={hide}
	onkeydown={handleKey}
>
	<span class="tooltip-trigger" aria-describedby={visible ? tooltipId : undefined}>
		{@render children?.()}
	</span>

	{#if visible}
		<span
			id={tooltipId}
			role="tooltip"
			class="tooltip-body tooltip-{placement}"
		>
			{#if tip}
				{@render tip()}
			{:else}
				{text}
			{/if}
			<span class="tooltip-arrow tooltip-arrow-{placement}" aria-hidden="true"></span>
		</span>
	{/if}
</span>

<style>
	.tooltip-wrap {
		/*
		 * Theming tokens — light defaults here, dark flip in the media
		 * block at the bottom of this stylesheet. To retheme, target
		 * .tooltip-wrap directly with ≥2-class specificity (an ancestor
		 * :root rule only inherits, so this declared default would still
		 * win). See docs/THEMING.md for override patterns.
		 */
		--tooltip-fg: #f9fafb;
		--tooltip-bg: #111827;
		--tooltip-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);

		position: relative;
		display: inline-block;
	}

	.tooltip-trigger {
		display: inline-block;
	}

	.tooltip-body {
		position: absolute;
		z-index: 1000;
		max-width: 240px;
		padding: 0.5rem 0.75rem;
		font-size: 0.8125rem;
		line-height: 1.4;
		color: var(--tooltip-fg);
		background-color: var(--tooltip-bg);
		border-radius: 6px;
		box-shadow: var(--tooltip-shadow);
		white-space: normal;
		pointer-events: none;
		animation: tooltip-fade 0.12s ease-out;
	}

	.tooltip-top {
		bottom: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
	}

	.tooltip-bottom {
		top: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
	}

	.tooltip-left {
		right: calc(100% + 8px);
		top: 50%;
		transform: translateY(-50%);
	}

	.tooltip-right {
		left: calc(100% + 8px);
		top: 50%;
		transform: translateY(-50%);
	}

	.tooltip-arrow {
		position: absolute;
		width: 8px;
		height: 8px;
		background-color: var(--tooltip-bg);
		transform: rotate(45deg);
	}

	.tooltip-arrow-top {
		bottom: -3px;
		left: 50%;
		margin-left: -4px;
	}

	.tooltip-arrow-bottom {
		top: -3px;
		left: 50%;
		margin-left: -4px;
	}

	.tooltip-arrow-left {
		right: -3px;
		top: 50%;
		margin-top: -4px;
	}

	.tooltip-arrow-right {
		left: -3px;
		top: 50%;
		margin-top: -4px;
	}

	@keyframes tooltip-fade {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(2px);
		}
		to {
			opacity: 1;
		}
	}

	.tooltip-left,
	.tooltip-right {
		animation-name: tooltip-fade-side;
	}

	@keyframes tooltip-fade-side {
		from {
			opacity: 0;
			transform: translateY(-50%) translateX(2px);
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tooltip-body {
			animation: none;
		}
	}

	/*
	 * Dark mode — invert fg/bg so the tooltip stays high-contrast on dark
	 * pages. Heavier shadow because dark surfaces swallow light shadows.
	 * Consumer overrides that target .tooltip-wrap with ≥2-class
	 * specificity (e.g. body .tooltip-wrap.tooltip-wrap) still win in
	 * dark mode — they cascade after this block. See docs/THEMING.md.
	 */
	@media (prefers-color-scheme: dark) {
		.tooltip-wrap {
			--tooltip-fg: #111827;
			--tooltip-bg: #f9fafb;
			--tooltip-shadow: 0 4px 14px rgba(0, 0, 0, 0.55);
		}
	}
</style>
