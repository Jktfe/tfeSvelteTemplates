<!--
	===========================================================
	WaveText
	===========================================================
	WHAT — Sets a phrase on a generated sine wave, and lets that
	wave ripple through the letters when someone hovers, focuses
	or taps it.

	WHY — A lightweight way to add playful, on-brand typography
	(headings, badges, section breaks) without canvas, WebGL or an
	animation library. The shape is tunable with two numbers.

	FEATURES
	• Sine wave built from `amplitude` + `wavelength` — no hand-drawn path
	• Flowing ripple: the wave's phase advances while `playing`
	• Three interaction models: 'hover' | 'click' | 'none'
	• Bindable `playing` state for external play / pause controls
	• Start / middle / end alignment along the wave
	• Unique ids per instance — many waves can share a page
	• Themable through CSS custom properties, light + dark

	ACCESSIBILITY
	• Interactive modes render a real <button> with aria-pressed;
	  Enter / Space toggle the ripple, Escape stops it
	• Keyboard focus (focus-visible) starts the ripple like hover
	• Touch: a tap toggles (touch screens have no hover)
	• 'none' mode renders role="img" named after the phrase
	• The SVG is aria-hidden; the phrase is exposed once, as a name
	• prefers-reduced-motion: no flowing ripple — instead the wave
	  flips half a cycle in one step so the state change is still
	  visible without any movement

	DEPENDENCIES — Zero. Uses `$props.id()` (Svelte 5.20+) for ids.

	PERFORMANCE
	• requestAnimationFrame runs only while playing, on screen and
	  motion is allowed; idle waves cost nothing
	• Path sample count is capped so tiny wavelengths can't explode
	  the point count

	USAGE
	<WaveText text="Making waves" amplitude={24} wavelength={240} />

	PROPS
	| Prop       | Type                           | Default        | Description                              |
	|------------|--------------------------------|----------------|------------------------------------------|
	| text       | string                         | 'WAVING TEXT'  | The phrase to render                     |
	| amplitude  | number                         | 20             | Wave height in SVG units                 |
	| wavelength | number                         | 200            | Distance between peaks in SVG units      |
	| playing    | boolean (bindable)             | false          | Whether the ripple is flowing            |
	| trigger    | 'hover' \| 'click' \| 'none'   | 'hover'        | Interaction model                        |
	| speed      | number                         | 0.5            | Wave cycles per second while flowing     |
	| align      | 'start' \| 'middle' \| 'end'   | 'middle'       | Where the phrase sits along the wave     |
	| height     | number                         | 220            | Container height in px                   |
	| label      | string                         | text           | Accessible name override                 |
	| class      | string                         | ''             | Extra classes on the root element        |
	===========================================================
-->
<script lang="ts" module>
	/** Width of the drawing surface in SVG user units. */
	export const WAVE_VIEW_WIDTH = 1200;
	/** Height of the drawing surface; the wave is centred vertically. */
	export const WAVE_VIEW_HEIGHT = 300;
	/** Hard cap on path points so a 1-unit wavelength can't produce thousands. */
	export const MAX_WAVE_POINTS = 600;

	const TAU = Math.PI * 2;

	/**
	 * Build the `d` attribute for a sine wave across the viewBox.
	 * `phase` (radians) slides the crests sideways — advancing it over
	 * time is what makes the ripple "flow" through the letters.
	 */
	export function buildWavePath(
		amplitude: number,
		wavelength: number,
		phase = 0,
		width = WAVE_VIEW_WIDTH,
		centreY = WAVE_VIEW_HEIGHT / 2
	): string {
		const amp = Number.isFinite(amplitude) ? amplitude : 0;
		// A non-positive wavelength has no sensible sine — draw a flat line instead.
		if (!(wavelength > 0) || !Number.isFinite(wavelength)) {
			return `M 0 ${round(centreY)} L ${round(width)} ${round(centreY)}`;
		}
		const step = Math.max(wavelength / 24, width / MAX_WAVE_POINTS);
		const parts: string[] = [];
		for (let x = 0; x <= width + step; x += step) {
			const y = centreY + amp * Math.sin((TAU * x) / wavelength - phase);
			parts.push(`${parts.length === 0 ? 'M' : 'L'} ${round(x)} ${round(y)}`);
		}
		return parts.join(' ');
	}

	function round(n: number): number {
		return Math.round(n * 100) / 100;
	}

	/** Advance the phase by `speed` cycles per second over `dt` seconds, wrapped into [0, 2π). */
	export function advancePhase(phase: number, speed: number, dt: number): number {
		if (!Number.isFinite(speed) || !Number.isFinite(dt)) return phase;
		const next = phase + TAU * speed * dt;
		return ((next % TAU) + TAU) % TAU;
	}

	/** Map the `align` prop to the textPath offset + text-anchor pair that realises it. */
	export function alignToAnchor(align: 'start' | 'middle' | 'end'): {
		startOffset: string;
		textAnchor: 'start' | 'middle' | 'end';
	} {
		if (align === 'start') return { startOffset: '2%', textAnchor: 'start' };
		if (align === 'end') return { startOffset: '98%', textAnchor: 'end' };
		return { startOffset: '50%', textAnchor: 'middle' };
	}

	/** Safe read of the OS reduced-motion preference (false on the server). */
	export function prefersReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
		try {
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		} catch {
			return false;
		}
	}
</script>

<script lang="ts">
	import type { WaveTextProps } from '$lib/types';

	let {
		text = 'WAVING TEXT',
		amplitude = 20,
		wavelength = 200,
		playing = $bindable(false),
		trigger = 'hover',
		speed = 0.5,
		align = 'middle',
		height = 220,
		label,
		class: className = ''
	}: WaveTextProps = $props();

	// Unique per instance — hard-coded ids collide the moment you mount two.
	const uid = $props.id();
	const pathId = `wave-text-path-${uid}`;

	let phase = $state(0);
	let reducedMotion = $state(false);
	let onScreen = $state(true);
	let rootEl: HTMLElement | undefined = $state();

	let hovering = false;
	let focusPlay = false;

	const interactive = $derived(trigger !== 'none');
	const anchor = $derived(alignToAnchor(align));

	// Reduced motion: swap the flow for a single half-cycle flip so "playing"
	// still has a visible (but motionless) state.
	const effectivePhase = $derived(reducedMotion ? (playing ? Math.PI : 0) : phase);
	const pathData = $derived(buildWavePath(amplitude, wavelength, effectivePhase));
	const accessibleName = $derived(label ?? text);

	$effect(() => {
		reducedMotion = prefersReducedMotion();
		if (typeof window.matchMedia !== 'function') return;
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		const onChange = () => (reducedMotion = mq.matches);
		mq.addEventListener?.('change', onChange);
		return () => mq.removeEventListener?.('change', onChange);
	});

	$effect(() => {
		if (!rootEl || typeof IntersectionObserver === 'undefined') return;
		const io = new IntersectionObserver((entries) => {
			onScreen = entries.some((entry) => entry.isIntersecting);
		});
		io.observe(rootEl);
		return () => io.disconnect();
	});

	// Flow loop — only while playing, visible and motion is welcome.
	$effect(() => {
		if (!playing || reducedMotion || !onScreen || !(speed > 0)) return;
		let frame = 0;
		let last: number | undefined;
		const tick = (now: number) => {
			if (last !== undefined) {
				// Clamp long gaps (background tab) so the wave doesn't jump.
				phase = advancePhase(phase, speed, Math.min((now - last) / 1000, 0.1));
			}
			last = now;
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});

	function isFocusVisible(el: Element): boolean {
		try {
			return el.matches(':focus-visible');
		} catch {
			return true;
		}
	}

	function handlePointerEnter(event: PointerEvent) {
		if (trigger !== 'hover' || event.pointerType === 'touch') return;
		hovering = true;
		playing = true;
	}

	function handlePointerLeave() {
		if (!hovering) return;
		hovering = false;
		if (!focusPlay) playing = false;
	}

	function handleFocus(event: FocusEvent) {
		if (trigger !== 'hover') return;
		if (!isFocusVisible(event.currentTarget as Element)) return;
		focusPlay = true;
		playing = true;
	}

	function handleBlur() {
		if (!focusPlay) return;
		focusPlay = false;
		if (!hovering) playing = false;
	}

	function handleClick(event: MouseEvent) {
		// Hovering with a mouse already plays the wave — don't let the click stop it.
		if (trigger === 'hover' && hovering && event.detail > 0) return;
		playing = !playing;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && playing) {
			playing = false;
			focusPlay = false;
		}
	}
</script>

{#snippet wave()}
	<svg
		viewBox="0 0 {WAVE_VIEW_WIDTH} {WAVE_VIEW_HEIGHT}"
		preserveAspectRatio="xMidYMid meet"
		aria-hidden="true"
		focusable="false"
	>
		<path id={pathId} d={pathData} fill="none" stroke="none" />
		<text class="wt-text" text-anchor={anchor.textAnchor}>
			<textPath href={`#${pathId}`} startOffset={anchor.startOffset}>{text}</textPath>
		</text>
	</svg>
{/snippet}

{#if interactive}
	<button
		bind:this={rootEl}
		type="button"
		class="wt-root wt-root--interactive {className}"
		style:--wt-height="{height}px"
		aria-pressed={playing}
		aria-label={accessibleName}
		data-playing={playing}
		onpointerenter={handlePointerEnter}
		onpointerleave={handlePointerLeave}
		onfocus={handleFocus}
		onblur={handleBlur}
		onclick={handleClick}
		onkeydown={handleKeydown}
	>
		{@render wave()}
	</button>
{:else}
	<div
		bind:this={rootEl}
		class="wt-root {className}"
		style:--wt-height="{height}px"
		role="img"
		aria-label={accessibleName}
		data-playing={playing}
	>
		{@render wave()}
	</div>
{/if}

<style>
	/*
	 * Every token here is chrome (it just needs to read on its surface),
	 * so fg + focus ring flip in dark mode. The background defaults to
	 * transparent so the wave sits on whatever the host page provides.
	 */
	.wt-root {
		--wave-text-fg: #111827;
		--wave-text-bg: transparent;
		--wave-text-focus-ring: #2563eb;
		--wave-text-font: 'Space Mono', 'Courier New', monospace;
		--wave-text-size: 32px;
		--wave-text-radius: 12px;

		display: block;
		box-sizing: border-box;
		width: 100%;
		height: var(--wt-height, 220px);
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: var(--wave-text-radius);
		background: var(--wave-text-bg);
		color: var(--wave-text-fg);
		font: inherit;
		overflow: hidden;
	}

	@media (prefers-color-scheme: dark) {
		.wt-root {
			--wave-text-fg: #f3f4f6;
			--wave-text-focus-ring: #93c5fd;
		}
	}

	.wt-root--interactive {
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.wt-root--interactive:focus-visible {
		outline: 2px solid var(--wave-text-focus-ring);
		outline-offset: 3px;
	}

	svg {
		display: block;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.wt-text {
		font-family: var(--wave-text-font);
		font-size: var(--wave-text-size);
		letter-spacing: 0.15em;
		text-transform: uppercase;
		fill: var(--wave-text-fg);
	}
</style>
