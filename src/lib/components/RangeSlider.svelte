<!--
  ===========================================================
  RangeSlider
  ===========================================================
  WHAT — A dual-thumb range slider with a filled track, pointer drag, full
         keyboard control, and non-crossing thumbs.

  FEATURES
    • Two thumbs select a {min, max} value over a single track
    • Coloured fill drawn between the thumbs
    • Pointer drag (mouse + touch) with generous hit areas
    • Keyboard: Arrow keys step, Shift+Arrow large step, Home/End jump
    • Thumbs clamp so they can never cross
    • Value bubbles above each thumb
    • Optional value formatter for currency, units, etc.

  ACCESSIBILITY
    • Each thumb is role="slider" with aria-valuemin / aria-valuemax /
      aria-valuenow / aria-valuetext and a distinct aria-label
    • Full keyboard navigation; thumbs are in the tab order
    • Visible :focus-visible ring
    • Honours prefers-reduced-motion (drops thumb/fill transitions)

  DEPENDENCIES — Zero external dependencies.

  USAGE
    <script lang="ts">
      let range = $state({ min: 20, max: 80 });
    </script>
    <RangeSlider bind:value={range} min={0} max={100} step={1} />

  PROPS
    | Prop      | Type                          | Default          | Description                          |
    | --------- | ----------------------------- | ---------------- | ------------------------------------ |
    | value     | { min: number; max: number }  | { min, max }     | Bindable selected range              |
    | min       | number                        | 0                | Lowest selectable value              |
    | max       | number                        | 100              | Highest selectable value             |
    | step      | number                        | 1                | Arrow-key / drag granularity         |
    | largeStep | number                        | step * 10        | Shift+Arrow granularity              |
    | label     | string                        | 'Range'          | Group label for screen readers       |
    | format    | (value: number) => string     | String(value)    | Formats bubble + aria-valuetext      |
    | disabled  | boolean                       | false            | Disables all interaction             |
    | class     | string                        | ''               | Extra classes on the root            |
  ===========================================================
-->
<script lang="ts">
	interface RangeValue {
		min: number;
		max: number;
	}

	interface Props {
		/** Bindable selected range as a {min, max} pair. */
		value?: RangeValue;
		/** Lowest selectable value. */
		min?: number;
		/** Highest selectable value. */
		max?: number;
		/** Granularity of a single Arrow-key press or drag tick. */
		step?: number;
		/** Granularity of a Shift+Arrow press. Defaults to step * 10. */
		largeStep?: number;
		/** Group label announced to assistive tech. */
		label?: string;
		/** Formats the bubble text and aria-valuetext. */
		format?: (value: number) => string;
		/** Disables all interaction. */
		disabled?: boolean;
		/** Extra classes for the root element. */
		class?: string;
	}

	let {
		value = $bindable({ min: 20, max: 80 }),
		min = 0,
		max = 100,
		step = 1,
		largeStep,
		label = 'Range',
		format = (n: number) => String(n),
		disabled = false,
		class: className = ''
	}: Props = $props();

	// The big-jump increment falls back to ten ordinary steps when not supplied.
	const bigStep = $derived(largeStep ?? step * 10);

	// Which thumb the pointer is currently dragging, if any.
	let activeThumb: 'min' | 'max' | null = $state(null);
	// The track element gives us the geometry to translate pixels → values.
	let trackEl = $state<HTMLDivElement | null>(null);

	// Snap a raw number to the nearest step and keep it inside [min, max].
	function snap(raw: number): number {
		const stepped = Math.round((raw - min) / step) * step + min;
		const clamped = Math.min(max, Math.max(min, stepped));
		// Round away floating-point dust introduced by fractional steps.
		return Number(clamped.toFixed(6));
	}

	// Percentage offsets drive both the fill width and the thumb positions.
	const minPercent = $derived(((value.min - min) / (max - min)) * 100);
	const maxPercent = $derived(((value.max - min) / (max - min)) * 100);

	// Commit a new value for one thumb, clamping so the thumbs never cross.
	function setThumb(thumb: 'min' | 'max', raw: number) {
		const snapped = snap(raw);
		if (thumb === 'min') {
			value = { min: Math.min(snapped, value.max), max: value.max };
		} else {
			value = { min: value.min, max: Math.max(snapped, value.min) };
		}
	}

	// Translate a clientX coordinate into a value along the track.
	function valueFromClientX(clientX: number): number {
		if (!trackEl) return min;
		const rect = trackEl.getBoundingClientRect();
		const ratio = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;
		return min + ratio * (max - min);
	}

	function onPointerDown(thumb: 'min' | 'max', event: PointerEvent) {
		if (disabled) return;
		activeThumb = thumb;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function onPointerMove(event: PointerEvent) {
		if (!activeThumb || disabled) return;
		setThumb(activeThumb, valueFromClientX(event.clientX));
	}

	function onPointerUp(event: PointerEvent) {
		if (!activeThumb) return;
		const target = event.currentTarget as HTMLElement;
		if (target.hasPointerCapture(event.pointerId)) {
			target.releasePointerCapture(event.pointerId);
		}
		activeThumb = null;
	}

	// Clicking the bare track jumps the nearest thumb to the click point.
	function onTrackPointerDown(event: PointerEvent) {
		if (disabled) return;
		// Ignore clicks that originate on a thumb — those start a drag instead.
		if ((event.target as HTMLElement).closest('.rs-thumb')) return;
		const clicked = valueFromClientX(event.clientX);
		const distToMin = Math.abs(clicked - value.min);
		const distToMax = Math.abs(clicked - value.max);
		setThumb(distToMin <= distToMax ? 'min' : 'max', clicked);
	}

	function onKeyDown(thumb: 'min' | 'max', event: KeyboardEvent) {
		if (disabled) return;
		const current = thumb === 'min' ? value.min : value.max;
		let next: number | null = null;

		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowUp':
				next = current + (event.shiftKey ? bigStep : step);
				break;
			case 'ArrowLeft':
			case 'ArrowDown':
				next = current - (event.shiftKey ? bigStep : step);
				break;
			case 'PageUp':
				next = current + bigStep;
				break;
			case 'PageDown':
				next = current - bigStep;
				break;
			case 'Home':
				// Home pins the thumb to its floor: overall min, or the other thumb.
				next = thumb === 'min' ? min : value.min;
				break;
			case 'End':
				// End pins the thumb to its ceiling: overall max, or the other thumb.
				next = thumb === 'min' ? value.max : max;
				break;
			default:
				return;
		}

		event.preventDefault();
		setThumb(thumb, next);
	}
</script>

<div
	class="rs-root {className}"
	class:rs-disabled={disabled}
	role="group"
	aria-label={label}
>
	<!--
		The track is a button-like surface but we don't want it in the tab
		order: the two thumbs are the real focusable controls. A keydown
		handler on the thumbs covers all keyboard interaction.
	-->
	<div
		bind:this={trackEl}
		class="rs-track"
		onpointerdown={onTrackPointerDown}
	>
		<div class="rs-rail"></div>
		<div
			class="rs-fill"
			style:left="{minPercent}%"
			style:width="{maxPercent - minPercent}%"
		></div>

		<!-- Lower thumb -->
		<div
			class="rs-thumb rs-thumb-min"
			class:rs-active={activeThumb === 'min'}
			style:left="{minPercent}%"
			role="slider"
			tabindex={disabled ? -1 : 0}
			aria-label="{label} minimum"
			aria-valuemin={min}
			aria-valuemax={value.max}
			aria-valuenow={value.min}
			aria-valuetext={format(value.min)}
			aria-disabled={disabled}
			onpointerdown={(e) => onPointerDown('min', e)}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
			onkeydown={(e) => onKeyDown('min', e)}
		>
			<span class="rs-bubble">{format(value.min)}</span>
		</div>

		<!-- Upper thumb -->
		<div
			class="rs-thumb rs-thumb-max"
			class:rs-active={activeThumb === 'max'}
			style:left="{maxPercent}%"
			role="slider"
			tabindex={disabled ? -1 : 0}
			aria-label="{label} maximum"
			aria-valuemin={value.min}
			aria-valuemax={max}
			aria-valuenow={value.max}
			aria-valuetext={format(value.max)}
			aria-disabled={disabled}
			onpointerdown={(e) => onPointerDown('max', e)}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
			onkeydown={(e) => onKeyDown('max', e)}
		>
			<span class="rs-bubble">{format(value.max)}</span>
		</div>
	</div>
</div>

<style>
	.rs-root {
		/* Light defaults live here; the dark block below flips the chrome. */
		--rs-rail: #e2e8f0;
		--rs-fill: #4f46e5;
		--rs-thumb-bg: #ffffff;
		--rs-thumb-border: #4f46e5;
		--rs-bubble-bg: #1e293b;
		--rs-bubble-text: #f8fafc;
		--rs-focus-ring: #6366f1;

		width: 100%;
		padding: 2.25rem 0.75rem 0.75rem;
		box-sizing: border-box;
	}

	.rs-track {
		position: relative;
		height: 1.5rem; /* Generous touch target for the whole strip. */
		display: flex;
		align-items: center;
		touch-action: none; /* Stop the browser scrolling while we drag. */
		cursor: pointer;
	}

	.rs-rail {
		position: absolute;
		inset: 0 0;
		top: 50%;
		transform: translateY(-50%);
		height: 0.375rem;
		border-radius: 999px;
		background: var(--rs-rail);
	}

	.rs-fill {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		height: 0.375rem;
		border-radius: 999px;
		background: var(--rs-fill);
		transition: left 0.08s ease, width 0.08s ease;
	}

	.rs-thumb {
		position: absolute;
		top: 50%;
		/* Pull each thumb back by half its own width so it centres on the value. */
		transform: translate(-50%, -50%);
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 50%;
		background: var(--rs-thumb-bg);
		border: 2px solid var(--rs-thumb-border);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
		cursor: grab;
		touch-action: none;
		transition: left 0.08s ease, box-shadow 0.15s ease, transform 0.15s ease;
	}

	/* Invisible padded hit area so fingers find the thumb easily. */
	.rs-thumb::before {
		content: '';
		position: absolute;
		inset: -0.625rem;
		border-radius: 50%;
	}

	.rs-thumb-max {
		/* The upper thumb sits above the lower one when they meet. */
		z-index: 2;
	}

	.rs-thumb.rs-active,
	.rs-thumb:active {
		cursor: grabbing;
	}

	.rs-thumb:focus-visible {
		outline: none;
		box-shadow: 0 0 0 4px var(--rs-focus-ring);
	}

	.rs-bubble {
		position: absolute;
		bottom: calc(100% + 0.5rem);
		left: 50%;
		transform: translateX(-50%);
		padding: 0.15rem 0.45rem;
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1.2;
		white-space: nowrap;
		border-radius: 0.35rem;
		background: var(--rs-bubble-bg);
		color: var(--rs-bubble-text);
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.15s ease;
	}

	/* The bubble's little pointer arrow. */
	.rs-bubble::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 4px solid transparent;
		border-top-color: var(--rs-bubble-bg);
	}

	.rs-thumb:hover .rs-bubble,
	.rs-thumb:focus-visible .rs-bubble,
	.rs-thumb.rs-active .rs-bubble {
		opacity: 1;
	}

	.rs-disabled {
		opacity: 0.55;
	}

	.rs-disabled .rs-track,
	.rs-disabled .rs-thumb {
		cursor: not-allowed;
		pointer-events: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.rs-fill,
		.rs-thumb,
		.rs-bubble {
			transition: none;
		}
	}

	@media (prefers-color-scheme: dark) {
		.rs-root {
			--rs-rail: #334155;
			--rs-fill: #818cf8;
			--rs-thumb-bg: #1e293b;
			--rs-thumb-border: #818cf8;
			--rs-bubble-bg: #e2e8f0;
			--rs-bubble-text: #0f172a;
			--rs-focus-ring: #a5b4fc;
		}
	}
</style>
