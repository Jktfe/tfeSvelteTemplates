<!--
  ===========================================================
  SPLIT PANE
  ===========================================================
  WHAT — A resizable two-pane layout separated by a draggable divider.
         Drag (or keyboard-nudge) the divider to trade space between the
         first and second pane.

  WHY  — Reach for this when you want a classic "editor + preview",
         "sidebar + content", or "list + detail" arrangement where the
         reader controls how much room each half gets. Works either
         side-by-side (horizontal) or stacked (vertical).

  FEATURES
    • Horizontal (side-by-side) or vertical (stacked) split
    • Pointer drag with setPointerCapture — smooth on mouse + touch
    • Full keyboard control on the divider (Arrows / Home / End)
    • Bindable `size` (% of the first pane) with min/max clamping
    • `start` and `end` snippets render arbitrary pane content
    • Zero external dependencies, scoped styles, copy-paste portable

  ACCESSIBILITY
    • Divider is role="separator", tabindex=0, in the tab order
    • aria-orientation reflects the divider's physical orientation
    • aria-valuenow / aria-valuemin / aria-valuemax expose the size
    • Horizontal: ArrowLeft/ArrowRight nudge; Vertical: ArrowUp/ArrowDown
    • Home jumps to min, End jumps to max
    • Visible :focus-visible ring on the divider
    • No autoplay motion; drag is 1:1 with the pointer (no transition lag)

  DEPENDENCIES — Zero external dependencies.

  PERFORMANCE — Resizing writes a single CSS flex-basis percentage; no
    layout thrash beyond the natural reflow of the two panes. Pointer
    capture means we never attach global listeners.

  USAGE
    <script lang="ts">
      import SplitPane from '$lib/components/SplitPane.svelte';
      let size = $state(50);
    </script>
    <SplitPane direction="horizontal" bind:size min={20} max={80}>
      {#snippet start()}<div>Left pane</div>{/snippet}
      {#snippet end()}<div>Right pane</div>{/snippet}
    </SplitPane>

  PROPS
    | Prop      | Type                          | Default        | Description                              |
    | --------- | ----------------------------- | -------------- | ---------------------------------------- |
    | direction | 'horizontal' | 'vertical'     | 'horizontal'   | Side-by-side vs stacked layout           |
    | initial   | number                        | 50             | Starting size of the first pane (%)      |
    | size      | number                        | initial        | Bindable current size of the first pane  |
    | min       | number                        | 10             | Lower clamp for the size (%)             |
    | max       | number                        | 90             | Upper clamp for the size (%)             |
    | step      | number                        | 2              | Arrow-key nudge granularity (%)          |
    | start     | Snippet                       | —              | Content of the first pane                |
    | end       | Snippet                       | —              | Content of the second pane               |
    | label     | string                        | 'Resize panes' | Accessible name for the divider          |
    | class     | string                        | ''             | Extra classes on the root element        |
  ===========================================================
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Side-by-side ('horizontal') or stacked ('vertical') layout. */
		direction?: 'horizontal' | 'vertical';
		/** Starting size of the first pane, as a percentage of the container. */
		initial?: number;
		/** Bindable current size of the first pane (%). Defaults to `initial`. */
		size?: number;
		/** Lowest the first pane may shrink to (%). */
		min?: number;
		/** Largest the first pane may grow to (%). */
		max?: number;
		/** How many percent a single Arrow-key press moves the divider. */
		step?: number;
		/** Content rendered in the first pane. */
		start?: Snippet;
		/** Content rendered in the second pane. */
		end?: Snippet;
		/** Accessible name announced for the divider. */
		label?: string;
		/** Extra classes for the root element. */
		class?: string;
	}

	let {
		direction = 'horizontal',
		initial = 50,
		size = $bindable(initial),
		min = 10,
		max = 90,
		step = 2,
		start,
		end,
		label = 'Resize panes',
		class: className = ''
	}: Props = $props();

	// The container gives us the geometry to translate pointer pixels → percent.
	let containerEl = $state<HTMLElement | null>(null);
	// True while a pointer drag is in progress (drives the grabbing cursor).
	let dragging = $state(false);

	// Keep the size inside [min, max] and round away floating-point dust.
	function clamp(value: number): number {
		const bounded = Math.min(max, Math.max(min, value));
		return Number(bounded.toFixed(4));
	}

	// The single place we ever mutate `size` — everything clamps through here.
	function setSize(value: number) {
		size = clamp(value);
	}

	// Whole-number value for the ARIA attributes (assistive tech reads integers).
	const ariaValue = $derived(Math.round(size));

	// A side-by-side split uses a *vertical* bar; a stacked split a horizontal one.
	const orientation = $derived(direction === 'horizontal' ? 'vertical' : 'horizontal');

	function onPointerDown(event: PointerEvent) {
		dragging = true;
		// Capture the pointer so drags keep tracking even if it leaves the divider.
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function onPointerMove(event: PointerEvent) {
		if (!dragging || !containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		// Map the pointer onto the container's main axis, as a 0–1 ratio.
		const ratio =
			direction === 'horizontal'
				? (event.clientX - rect.left) / rect.width
				: (event.clientY - rect.top) / rect.height;
		setSize(ratio * 100);
	}

	function onPointerUp(event: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		const target = event.currentTarget as HTMLElement;
		if (target.hasPointerCapture(event.pointerId)) {
			target.releasePointerCapture(event.pointerId);
		}
	}

	function onKeyDown(event: KeyboardEvent) {
		// Which arrows resize depends on the split axis.
		const decreaseKey = direction === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
		const increaseKey = direction === 'horizontal' ? 'ArrowRight' : 'ArrowDown';

		switch (event.key) {
			case decreaseKey:
				setSize(size - step);
				break;
			case increaseKey:
				setSize(size + step);
				break;
			case 'Home':
				setSize(min);
				break;
			case 'End':
				setSize(max);
				break;
			default:
				return; // Let every other key behave normally.
		}
		event.preventDefault();
	}
</script>

<div
	bind:this={containerEl}
	class="sp-root {className}"
	class:sp-dragging={dragging}
	data-direction={direction}
>
	<!-- First pane — its main-axis size is the bound percentage. -->
	<div class="sp-pane sp-pane-start" style:flex-basis="{size}%">
		{@render start?.()}
	</div>

	<!--
		The divider is the real interactive control. It is the only element
		in the tab order; a keydown handler covers all keyboard resizing.
		A focusable separator (window splitter) is a valid interactive ARIA
		pattern — the linter can't tell, so we quiet its two false positives.
	-->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="sp-divider"
		role="separator"
		tabindex="0"
		aria-label={label}
		aria-orientation={orientation}
		aria-valuenow={ariaValue}
		aria-valuemin={min}
		aria-valuemax={max}
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
		onkeydown={onKeyDown}
	>
		<span class="sp-grip" aria-hidden="true"></span>
	</div>

	<!-- Second pane — absorbs the remaining space. -->
	<div class="sp-pane sp-pane-end">
		{@render end?.()}
	</div>
</div>

<style>
	.sp-root {
		/* Light defaults; the dark block below flips the chrome. */
		--sp-bg: #ffffff;
		--sp-border: #e2e8f0;
		--sp-divider: #eef2f7;
		--sp-divider-hover: #e0e7ff;
		--sp-grip: #94a3b8;
		--sp-focus-ring: #6366f1;

		display: flex;
		width: 100%;
		height: 100%;
		min-height: 0;
		min-width: 0;
		box-sizing: border-box;
		border: 1px solid var(--sp-border);
		border-radius: 0.5rem;
		overflow: hidden;
		background: var(--sp-bg);
	}

	.sp-root[data-direction='vertical'] {
		flex-direction: column;
	}

	.sp-pane {
		min-width: 0;
		min-height: 0;
		overflow: auto;
	}

	.sp-pane-start {
		/* flex-basis is set inline from `size`; never grow or shrink past it. */
		flex-grow: 0;
		flex-shrink: 0;
	}

	.sp-pane-end {
		/* Soak up whatever space the first pane and divider leave behind. */
		flex: 1 1 0;
	}

	.sp-divider {
		flex: 0 0 auto;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--sp-divider);
		/* Stop the browser scrolling/selecting while we drag. */
		touch-action: none;
		user-select: none;
	}

	.sp-root[data-direction='horizontal'] .sp-divider {
		width: 10px;
		cursor: col-resize;
		border-left: 1px solid var(--sp-border);
		border-right: 1px solid var(--sp-border);
	}

	.sp-root[data-direction='vertical'] .sp-divider {
		height: 10px;
		cursor: row-resize;
		border-top: 1px solid var(--sp-border);
		border-bottom: 1px solid var(--sp-border);
	}

	.sp-divider:hover {
		background: var(--sp-divider-hover);
	}

	.sp-divider:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 2px var(--sp-focus-ring);
	}

	/* The little grip — a short bar centred on the divider. */
	.sp-grip {
		background: var(--sp-grip);
		border-radius: 999px;
	}

	.sp-root[data-direction='horizontal'] .sp-grip {
		width: 3px;
		height: 28px;
	}

	.sp-root[data-direction='vertical'] .sp-grip {
		width: 28px;
		height: 3px;
	}

	/* While dragging, show the resize cursor everywhere so it never flickers. */
	.sp-root.sp-dragging[data-direction='horizontal'] {
		cursor: col-resize;
	}

	.sp-root.sp-dragging[data-direction='vertical'] {
		cursor: row-resize;
	}

	@media (prefers-color-scheme: dark) {
		.sp-root {
			--sp-bg: #0f172a;
			--sp-border: #334155;
			--sp-divider: #1e293b;
			--sp-divider-hover: #312e81;
			--sp-grip: #64748b;
			--sp-focus-ring: #a5b4fc;
		}
	}
</style>
