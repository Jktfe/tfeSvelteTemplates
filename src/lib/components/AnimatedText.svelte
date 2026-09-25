<!--
	===========================================================
	AnimatedText
	===========================================================
	WHAT — A ribbon of text drifts along a curved SVG path and
	cross-fades into a second phrase when someone hovers, focuses
	or taps it.

	WHY — Reach for it when a hero, footer or section break wants a
	little kinetic personality without a heavyweight animation
	library. The morph gives the ribbon a "hidden message" moment.

	FEATURES
	• Text follows any SVG path (`path` prop) — defaults to a gentle S-curve
	• Seamless infinite drift: the loop length is measured from the
	  rendered text, so the seam never jumps
	• Cross-fade morph between `originalText` and `morphedText`
	• Three interaction models: 'hover' | 'click' | 'none'
	• Bindable `morphed` state, `paused` and `direction` controls
	• Unique ids per instance — mount as many as you like on one page
	• Themable through CSS custom properties, light + dark

	ACCESSIBILITY
	• Interactive modes render a real <button> with aria-pressed;
	  Enter / Space toggle the morph, Escape resets it
	• Keyboard focus (focus-visible) morphs just like mouse hover
	• Touch: a tap toggles (there is no hover on touch screens)
	• 'none' mode renders role="img" with the current phrase as its name
	• The SVG itself is aria-hidden so the repeated ribbon is not
	  read out four times
	• prefers-reduced-motion: drift stops and the morph becomes an
	  instant swap (no fade)

	DEPENDENCIES — Zero. Uses `$props.id()` (Svelte 5.20+) for ids.

	PERFORMANCE
	• One requestAnimationFrame loop per instance, only while the
	  ribbon is on screen, not paused and motion is allowed
	• Each frame writes a single number (the distance travelled);
	  both layers derive their startOffset from it

	USAGE
	<AnimatedText
		originalText="STATIC DRIFT TRANSMIT RECEIVE"
		morphedText="SIGNAL FOUND — SAY HELLO"
	/>

	PROPS
	| Prop         | Type                         | Default        | Description                                 |
	|--------------|------------------------------|----------------|---------------------------------------------|
	| originalText | string                       | required       | Resting phrase                              |
	| morphedText  | string                       | ''             | Phrase revealed on trigger ('' = no morph)  |
	| morphed      | boolean (bindable)           | false          | Current morph state                         |
	| trigger      | 'hover' \| 'click' \| 'none' | 'hover'        | Interaction model                           |
	| speed        | number                       | 30             | Drift in SVG units per second (0 = still)   |
	| direction    | 'left' \| 'right'            | 'left'         | Drift direction                             |
	| paused       | boolean                      | false          | Freeze the drift                            |
	| repeat       | number                       | 4              | Copies of the phrase along the path         |
	| path         | string                       | S-curve        | SVG path `d` inside a 1200×300 viewBox      |
	| height       | number                       | 200            | Container height in px                      |
	| label        | string                       | originalText   | Accessible name override                    |
	| class        | string                       | ''             | Extra classes on the root element           |
	===========================================================
-->
<script lang="ts" module>
	import type { AnimatedTextDirection, PathTextTrigger } from '$lib/types';

	/** Gentle S-curve that overshoots the 1200-wide viewBox on both sides. */
	export const DEFAULT_ANIMATED_TEXT_PATH =
		'M -300 150 Q 0 -50 300 150 T 900 150 T 1500 150 T 2100 150';

	/** Separator between repeated copies — keeps the seam readable. */
	export const RIBBON_SEPARATOR = ' · ';

	/**
	 * Lay `repeat` copies of the phrase end to end. Every copy carries a
	 * trailing separator so each "cell" is exactly the same width — that's
	 * what lets the loop wrap without a visible hiccup.
	 */
	export function buildRibbon(text: string, repeat: number): string {
		const copies = Math.max(1, Math.floor(Number.isFinite(repeat) ? repeat : 1));
		if (!text) return '';
		return `${text}${RIBBON_SEPARATOR}`.repeat(copies);
	}

	/** Wrap any distance into [0, loopLength). A non-positive loop means "don't move". */
	export function wrapDistance(distance: number, loopLength: number): number {
		if (!(loopLength > 0) || !Number.isFinite(distance)) return 0;
		return ((distance % loopLength) + loopLength) % loopLength;
	}

	/**
	 * Convert the distance travelled into a textPath startOffset.
	 * Leftward drift slides from 0 down to -loop; rightward drift slides
	 * from -loop back up to 0. Either way we only ever show one copy's
	 * worth of travel, then quietly wrap.
	 */
	export function ribbonOffset(
		distance: number,
		loopLength: number,
		direction: AnimatedTextDirection
	): number {
		if (!(loopLength > 0)) return 0;
		const phase = wrapDistance(distance, loopLength);
		if (direction === 'right') return phase - loopLength;
		// `0 - 0` would be -0; keep the resting offset a clean 0.
		return phase === 0 ? 0 : -phase;
	}

	/** Only 'hover' and 'click' turn the ribbon into a button. */
	export function isInteractiveTrigger(trigger: PathTextTrigger, hasMorph: boolean): boolean {
		return hasMorph && trigger !== 'none';
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
	import type { AnimatedTextProps } from '$lib/types';

	let {
		originalText,
		morphedText = '',
		morphed = $bindable(false),
		trigger = 'hover',
		speed = 30,
		direction = 'left',
		paused = false,
		repeat = 4,
		path = DEFAULT_ANIMATED_TEXT_PATH,
		height = 200,
		label,
		class: className = ''
	}: AnimatedTextProps = $props();

	// Unique per instance, so two ribbons never fight over the same <path id>.
	const uid = $props.id();
	const pathId = `animated-text-path-${uid}`;

	const hasMorph = $derived(morphedText.trim().length > 0);
	const interactive = $derived(isInteractiveTrigger(trigger, hasMorph));
	const showMorph = $derived(hasMorph && morphed);

	const originalRibbon = $derived(buildRibbon(originalText, repeat));
	const morphedRibbon = $derived(buildRibbon(morphedText, repeat));

	// Distance travelled along the path in SVG units. One number drives both layers.
	let distance = $state(0);
	// Measured width of ONE copy for each layer (0 until measured / in jsdom).
	let originalLoop = $state(0);
	let morphedLoop = $state(0);

	let reducedMotion = $state(false);
	let onScreen = $state(true);

	let rootEl: HTMLElement | undefined = $state();
	let originalTextEl: SVGTextElement | undefined = $state();
	let morphedTextEl: SVGTextElement | undefined = $state();

	// Track why we're morphed so blur doesn't undo a hover (and vice versa).
	let hovering = false;
	let focusMorph = false;

	const originalOffset = $derived(ribbonOffset(distance, originalLoop, direction));
	const morphedOffset = $derived(ribbonOffset(distance, morphedLoop, direction));

	const accessibleName = $derived(
		label ??
			(interactive
				? `${originalText} — ${morphedText}`
				: showMorph
					? morphedText
					: originalText)
	);

	/** Measure one copy's width. getComputedTextLength is missing in jsdom, hence the guard. */
	function measure(el: SVGTextElement | undefined): number {
		if (!el || typeof el.getComputedTextLength !== 'function') return 0;
		const total = el.getComputedTextLength();
		const copies = Math.max(1, Math.floor(repeat));
		return total > 0 ? total / copies : 0;
	}

	// Re-measure whenever the text, repeat count or the fonts change.
	$effect(() => {
		void originalRibbon;
		void morphedRibbon;
		const update = () => {
			originalLoop = measure(originalTextEl);
			morphedLoop = measure(morphedTextEl);
		};
		update();
		let cancelled = false;
		// Web fonts often arrive after first paint and change the glyph widths.
		document.fonts?.ready?.then(() => {
			if (!cancelled) update();
		});
		return () => {
			cancelled = true;
		};
	});

	// Follow the OS motion preference live — someone may flip it mid-session.
	$effect(() => {
		reducedMotion = prefersReducedMotion();
		if (typeof window.matchMedia !== 'function') return;
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		const onChange = () => (reducedMotion = mq.matches);
		mq.addEventListener?.('change', onChange);
		return () => mq.removeEventListener?.('change', onChange);
	});

	// No point animating a ribbon nobody can see.
	$effect(() => {
		if (!rootEl || typeof IntersectionObserver === 'undefined') return;
		const io = new IntersectionObserver((entries) => {
			onScreen = entries.some((entry) => entry.isIntersecting);
		});
		io.observe(rootEl);
		return () => io.disconnect();
	});

	// The drift loop. Runs only when every condition says "yes, move".
	$effect(() => {
		if (paused || reducedMotion || !onScreen || !(speed > 0)) return;
		let frame = 0;
		let last: number | undefined;
		const tick = (now: number) => {
			if (last !== undefined) {
				// Clamp big gaps (tab was hidden) so the ribbon doesn't lurch.
				const dt = Math.min((now - last) / 1000, 0.1);
				distance += speed * dt;
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
			// Very old engines: assume keyboard so focus still reveals the morph.
			return true;
		}
	}

	function handlePointerEnter(event: PointerEvent) {
		if (trigger !== 'hover' || event.pointerType === 'touch') return;
		hovering = true;
		morphed = true;
	}

	function handlePointerLeave() {
		if (!hovering) return;
		hovering = false;
		if (!focusMorph) morphed = false;
	}

	function handleFocus(event: FocusEvent) {
		if (trigger !== 'hover') return;
		if (!isFocusVisible(event.currentTarget as Element)) return;
		focusMorph = true;
		morphed = true;
	}

	function handleBlur() {
		if (!focusMorph) return;
		focusMorph = false;
		if (!hovering) morphed = false;
	}

	function handleClick(event: MouseEvent) {
		// A mouse already hovering has morphed the ribbon; a click shouldn't undo it.
		// Keyboard activation (detail === 0) and touch taps still toggle.
		if (trigger === 'hover' && hovering && event.detail > 0) return;
		morphed = !morphed;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && morphed) {
			morphed = false;
			focusMorph = false;
		}
	}
</script>

{#snippet ribbon()}
	<svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
		<path id={pathId} d={path} fill="none" stroke="none" />
		<text
			bind:this={originalTextEl}
			class="at-layer at-layer--original"
			class:at-layer--hidden={showMorph}
		>
			<textPath href={`#${pathId}`} startOffset={originalOffset}>{originalRibbon}</textPath>
		</text>
		{#if hasMorph}
			<text
				bind:this={morphedTextEl}
				class="at-layer at-layer--morph"
				class:at-layer--hidden={!showMorph}
			>
				<textPath href={`#${pathId}`} startOffset={morphedOffset}>{morphedRibbon}</textPath>
			</text>
		{/if}
	</svg>
{/snippet}

{#if interactive}
	<button
		bind:this={rootEl}
		type="button"
		class="at-root at-root--interactive {className}"
		style:--at-height="{height}px"
		aria-pressed={morphed}
		aria-label={accessibleName}
		data-morphed={morphed}
		onpointerenter={handlePointerEnter}
		onpointerleave={handlePointerLeave}
		onfocus={handleFocus}
		onblur={handleBlur}
		onclick={handleClick}
		onkeydown={handleKeydown}
	>
		{@render ribbon()}
	</button>
{:else}
	<div
		bind:this={rootEl}
		class="at-root {className}"
		style:--at-height="{height}px"
		role="img"
		aria-label={accessibleName}
		data-morphed={morphed}
	>
		{@render ribbon()}
	</div>
{/if}

<style>
	/*
	 * Chrome tokens (flip in dark): bg, fg, focus ring.
	 * Brand token (stays put): accent — the morph colour is the "reveal",
	 * so it should read as the same colour on both schemes.
	 */
	.at-root {
		--animated-text-bg: #fafafa;
		--animated-text-fg: #111827;
		--animated-text-accent: #e11d48;
		--animated-text-focus-ring: #2563eb;
		--animated-text-font: 'Space Mono', 'Courier New', monospace;
		--animated-text-size: 20px;
		--animated-text-radius: 12px;
		--animated-text-fade: 450ms;

		display: block;
		box-sizing: border-box;
		width: 100%;
		height: var(--at-height, 200px);
		margin: 0;
		padding: 0;
		overflow: hidden;
		border: 0;
		border-radius: var(--animated-text-radius);
		background: var(--animated-text-bg);
		color: var(--animated-text-fg);
		font: inherit;
		text-align: inherit;
	}

	@media (prefers-color-scheme: dark) {
		.at-root {
			--animated-text-bg: #111318;
			--animated-text-fg: #f3f4f6;
			--animated-text-focus-ring: #93c5fd;
		}
	}

	.at-root--interactive {
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.at-root--interactive:focus-visible {
		outline: 2px solid var(--animated-text-focus-ring);
		outline-offset: 3px;
	}

	svg {
		display: block;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.at-layer {
		font-family: var(--animated-text-font);
		font-size: var(--animated-text-size);
		letter-spacing: 0.15em;
		text-transform: uppercase;
		fill: var(--animated-text-fg);
		opacity: 1;
		transition: opacity var(--animated-text-fade) ease;
	}

	.at-layer--morph {
		fill: var(--animated-text-accent);
	}

	.at-layer--hidden {
		opacity: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.at-layer {
			transition: none;
		}
	}
</style>
