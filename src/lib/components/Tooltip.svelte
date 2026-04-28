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
  - Pure Svelte 5 runes, zero dependencies

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
		color: #f9fafb;
		background-color: #111827;
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
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
		background-color: #111827;
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
</style>
