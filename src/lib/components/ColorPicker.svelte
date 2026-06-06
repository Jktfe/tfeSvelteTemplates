<!--
  ===========================================================
  COLOR PICKER
  ===========================================================
  WHAT — An HSV colour picker with a draggable saturation/value plane, a vertical hue slider, preset swatches, a hex input, and an optional EyeDropper button.
  FEATURES
    - 2D saturation/value field driven by pointer drag and keyboard arrows
    - Vertical hue slider (pointer + arrow keys)
    - Hex text input with live validation and normalisation
    - Row of preset swatches you can supply
    - Optional native EyeDropper button (feature-detected, hidden when unsupported)
    - Bindable `value` as a 6-digit hex string
    - Inline HSV ⇄ RGB ⇄ hex conversion helpers (no dependencies)
  ACCESSIBILITY
    - Both handles expose ARIA slider semantics with aria-valuetext
    - Arrow keys move the SV handle and hue; Home/End jump hue extremes
    - Visible :focus-visible ring on every control
    - Honours prefers-reduced-motion (no handle transitions)
  DEPENDENCIES — Zero external dependencies.
  USAGE
    <script>
      import ColorPicker from '$lib/components/ColorPicker.svelte';
      let colour = $state('#3b82f6');
    </script>
    <ColorPicker bind:value={colour} />
  PROPS
    | Prop      | Type       | Default                       | Description                              |
    | --------- | ---------- | ----------------------------- | ---------------------------------------- |
    | value     | string     | '#3b82f6'                     | Bindable selected colour as hex          |
    | swatches  | string[]   | curated palette               | Preset hex swatches shown beneath        |
    | showHex   | boolean    | true                          | Show the hex text input                  |
    | showEyeDropper | boolean | true                         | Offer EyeDropper button when supported   |
    | label     | string     | 'Colour picker'               | ARIA label for the picker group          |
  ===========================================================
-->
<script lang="ts">
	interface Props {
		/** Bindable selected colour as a 6-digit hex string (e.g. '#3b82f6'). */
		value?: string;
		/** Preset swatches shown in a row beneath the picker. */
		swatches?: string[];
		/** Show the editable hex input. */
		showHex?: boolean;
		/** Offer the native EyeDropper button when the browser supports it. */
		showEyeDropper?: boolean;
		/** ARIA label for the overall picker group. */
		label?: string;
	}

	let {
		value = $bindable('#3b82f6'),
		swatches = [
			'#ef4444',
			'#f97316',
			'#eab308',
			'#22c55e',
			'#14b8a6',
			'#3b82f6',
			'#6366f1',
			'#a855f7',
			'#ec4899',
			'#0f172a',
			'#64748b',
			'#f8fafc'
		],
		showHex = true,
		showEyeDropper = true,
		label = 'Colour picker'
	}: Props = $props();

	// ---- Colour maths (all pure, all inline) -------------------------------

	/** Clamp a number into the inclusive [min, max] range. */
	function clamp(n: number, min: number, max: number): number {
		return Math.min(max, Math.max(min, n));
	}

	/** Convert HSV (h: 0–360, s/v: 0–1) to an {r,g,b} object with 0–255 channels. */
	function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
		const c = v * s;
		const hp = (h % 360) / 60;
		const x = c * (1 - Math.abs((hp % 2) - 1));
		let r = 0;
		let g = 0;
		let b = 0;
		if (hp >= 0 && hp < 1) [r, g, b] = [c, x, 0];
		else if (hp < 2) [r, g, b] = [x, c, 0];
		else if (hp < 3) [r, g, b] = [0, c, x];
		else if (hp < 4) [r, g, b] = [0, x, c];
		else if (hp < 5) [r, g, b] = [x, 0, c];
		else [r, g, b] = [c, 0, x];
		const m = v - c;
		return {
			r: Math.round((r + m) * 255),
			g: Math.round((g + m) * 255),
			b: Math.round((b + m) * 255)
		};
	}

	/** Convert RGB (0–255 channels) to HSV (h: 0–360, s/v: 0–1). */
	function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
		const rn = r / 255;
		const gn = g / 255;
		const bn = b / 255;
		const max = Math.max(rn, gn, bn);
		const min = Math.min(rn, gn, bn);
		const d = max - min;
		let h = 0;
		if (d !== 0) {
			if (max === rn) h = ((gn - bn) / d) % 6;
			else if (max === gn) h = (bn - rn) / d + 2;
			else h = (rn - gn) / d + 4;
			h *= 60;
			if (h < 0) h += 360;
		}
		const s = max === 0 ? 0 : d / max;
		return { h, s, v: max };
	}

	/** Turn a 0–255 channel into a two-digit hex pair. */
	function channelToHex(n: number): string {
		return clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
	}

	/** Convert {r,g,b} to a lower-case '#rrggbb' string. */
	function rgbToHex(r: number, g: number, b: number): string {
		return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
	}

	/** Parse a #rgb or #rrggbb string into {r,g,b}, or null if it is not valid. */
	function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
		let clean = hex.trim().replace(/^#/, '');
		if (/^[0-9a-fA-F]{3}$/.test(clean)) {
			clean = clean
				.split('')
				.map((ch) => ch + ch)
				.join('');
		}
		if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
		return {
			r: parseInt(clean.slice(0, 2), 16),
			g: parseInt(clean.slice(2, 4), 16),
			b: parseInt(clean.slice(4, 6), 16)
		};
	}

	// ---- State -------------------------------------------------------------
	// HSV is the source of truth while interacting: it keeps hue stable even
	// when saturation or value hit zero (where hex alone would lose the hue).
	const initial = hexToRgb(value) ?? { r: 59, g: 130, b: 246 };
	const initialHsv = rgbToHsv(initial.r, initial.g, initial.b);

	let hue = $state(initialHsv.h);
	let sat = $state(initialHsv.s);
	let val = $state(initialHsv.v);

	// What sits in the hex input while the user is mid-edit (may be invalid).
	let hexDraft = $state(value);

	// Derived current colour, always recomputed from the HSV source of truth.
	const rgb = $derived(hsvToRgb(hue, sat, val));
	const hex = $derived(rgbToHex(rgb.r, rgb.g, rgb.b));

	// Hue-only colour used to paint the SV plane background.
	const hueRgb = $derived(hsvToRgb(hue, 1, 1));
	const hueHex = $derived(rgbToHex(hueRgb.r, hueRgb.g, hueRgb.b));

	// Push the derived hex back up to the bound value whenever it changes.
	$effect(() => {
		value = hex;
	});

	// If a parent rewrites `value` to something we did not produce, re-sync HSV.
	$effect(() => {
		const incoming = value;
		if (incoming.toLowerCase() === hex.toLowerCase()) return;
		const parsed = hexToRgb(incoming);
		if (!parsed) return;
		const next = rgbToHsv(parsed.r, parsed.g, parsed.b);
		hue = next.h;
		sat = next.s;
		val = next.v;
		hexDraft = incoming;
	});

	// Keep the hex input mirrored to the live value unless the user is editing.
	let hexFocused = $state(false);
	$effect(() => {
		if (!hexFocused) hexDraft = hex;
	});

	// ---- EyeDropper feature detection --------------------------------------
	const eyeDropperSupported = $derived(typeof window !== 'undefined' && 'EyeDropper' in window);

	// ---- Saturation / value plane interaction ------------------------------
	let plane = $state<HTMLDivElement | null>(null);

	/** Translate a pointer position over the plane into sat/val [0,1] values. */
	function setSvFromPointer(clientX: number, clientY: number) {
		if (!plane) return;
		const rect = plane.getBoundingClientRect();
		sat = clamp((clientX - rect.left) / rect.width, 0, 1);
		// Top of the plane is value=1, bottom is value=0.
		val = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
	}

	function onPlanePointerDown(event: PointerEvent) {
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		setSvFromPointer(event.clientX, event.clientY);
	}

	function onPlanePointerMove(event: PointerEvent) {
		if (event.buttons === 0) return;
		setSvFromPointer(event.clientX, event.clientY);
	}

	function onPlaneKeydown(event: KeyboardEvent) {
		const step = event.shiftKey ? 0.1 : 0.02;
		let handled = true;
		switch (event.key) {
			case 'ArrowLeft':
				sat = clamp(sat - step, 0, 1);
				break;
			case 'ArrowRight':
				sat = clamp(sat + step, 0, 1);
				break;
			case 'ArrowUp':
				val = clamp(val + step, 0, 1);
				break;
			case 'ArrowDown':
				val = clamp(val - step, 0, 1);
				break;
			default:
				handled = false;
		}
		if (handled) event.preventDefault();
	}

	// ---- Hue slider interaction --------------------------------------------
	let hueTrack = $state<HTMLDivElement | null>(null);

	/** Translate a vertical pointer position over the hue track into 0–360. */
	function setHueFromPointer(clientY: number) {
		if (!hueTrack) return;
		const rect = hueTrack.getBoundingClientRect();
		// Top of the track is hue 0, bottom is hue 360.
		hue = clamp(((clientY - rect.top) / rect.height) * 360, 0, 360);
	}

	function onHuePointerDown(event: PointerEvent) {
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		setHueFromPointer(event.clientY);
	}

	function onHuePointerMove(event: PointerEvent) {
		if (event.buttons === 0) return;
		setHueFromPointer(event.clientY);
	}

	function onHueKeydown(event: KeyboardEvent) {
		const step = event.shiftKey ? 10 : 2;
		let handled = true;
		switch (event.key) {
			case 'ArrowUp':
			case 'ArrowLeft':
				hue = clamp(hue - step, 0, 360);
				break;
			case 'ArrowDown':
			case 'ArrowRight':
				hue = clamp(hue + step, 0, 360);
				break;
			case 'Home':
				hue = 0;
				break;
			case 'End':
				hue = 360;
				break;
			default:
				handled = false;
		}
		if (handled) event.preventDefault();
	}

	// ---- Hex input ---------------------------------------------------------
	function commitHex() {
		const parsed = hexToRgb(hexDraft);
		if (!parsed) {
			// Snap back to the live colour on invalid input.
			hexDraft = hex;
			return;
		}
		const next = rgbToHsv(parsed.r, parsed.g, parsed.b);
		hue = next.h;
		sat = next.s;
		val = next.v;
	}

	function onHexKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			commitHex();
			(event.currentTarget as HTMLInputElement).blur();
		}
	}

	// ---- Swatches ----------------------------------------------------------
	function selectSwatch(swatch: string) {
		const parsed = hexToRgb(swatch);
		if (!parsed) return;
		const next = rgbToHsv(parsed.r, parsed.g, parsed.b);
		hue = next.h;
		sat = next.s;
		val = next.v;
	}

	// ---- EyeDropper --------------------------------------------------------
	async function pickWithEyeDropper() {
		if (typeof window === 'undefined' || !('EyeDropper' in window)) return;
		try {
			// EyeDropper is not yet in the standard lib typings; narrow locally.
			const Picker = (window as unknown as { EyeDropper: new () => { open(): Promise<{ sRGBHex: string }> } })
				.EyeDropper;
			const result = await new Picker().open();
			selectSwatch(result.sRGBHex);
		} catch {
			// User dismissed the eyedropper — nothing to do.
		}
	}

	// ---- Derived ARIA text -------------------------------------------------
	const satPct = $derived(Math.round(sat * 100));
	const valPct = $derived(Math.round(val * 100));
	const hueDeg = $derived(Math.round(hue));
	const svValueText = $derived(`saturation ${satPct}%, brightness ${valPct}%`);
	const hueValueText = $derived(`hue ${hueDeg} degrees`);
</script>

<div class="cp" role="group" aria-label={label}>
	<div class="cp-fields">
		<!-- Saturation / value plane -->
		<div
			class="cp-plane"
			bind:this={plane}
			role="slider"
			tabindex="0"
			aria-label="Saturation and brightness"
			aria-valuetext={svValueText}
			aria-valuenow={satPct}
			aria-valuemin="0"
			aria-valuemax="100"
			style="--hue-color: {hueHex};"
			onpointerdown={onPlanePointerDown}
			onpointermove={onPlanePointerMove}
			onkeydown={onPlaneKeydown}
		>
			<div class="cp-plane-white"></div>
			<div class="cp-plane-black"></div>
			<span
				class="cp-plane-handle"
				style="left: {sat * 100}%; top: {(1 - val) * 100}%; --handle-color: {hex};"
				aria-hidden="true"
			></span>
		</div>

		<!-- Hue slider -->
		<div
			class="cp-hue"
			bind:this={hueTrack}
			role="slider"
			tabindex="0"
			aria-label="Hue"
			aria-valuetext={hueValueText}
			aria-valuenow={hueDeg}
			aria-valuemin="0"
			aria-valuemax="360"
			onpointerdown={onHuePointerDown}
			onpointermove={onHuePointerMove}
			onkeydown={onHueKeydown}
		>
			<span
				class="cp-hue-handle"
				style="top: {(hue / 360) * 100}%; --handle-color: {hueHex};"
				aria-hidden="true"
			></span>
		</div>
	</div>

	<!-- Preview + hex + eyedropper -->
	<div class="cp-readout">
		<span class="cp-preview" style="--preview-color: {hex};" aria-hidden="true"></span>

		{#if showHex}
			<label class="cp-hex">
				<span class="cp-hex-label">Hex</span>
				<input
					type="text"
					class="cp-hex-input"
					value={hexDraft}
					spellcheck="false"
					autocomplete="off"
					aria-label="Hex colour value"
					maxlength="7"
					oninput={(e) => (hexDraft = e.currentTarget.value)}
					onfocus={() => (hexFocused = true)}
					onblur={() => {
						hexFocused = false;
						commitHex();
					}}
					onkeydown={onHexKeydown}
				/>
			</label>
		{/if}

		{#if showEyeDropper && eyeDropperSupported}
			<button type="button" class="cp-eyedropper" onclick={pickWithEyeDropper} aria-label="Pick a colour from the screen">
				<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
					<path
						d="M17.5 2.5a2.83 2.83 0 0 1 4 4l-1.6 1.6 1 1-1.4 1.4-1-1L11 17.5 6.5 19 5 17.5 13 9.5l-1-1 1.4-1.4 1 1 1.6-1.6a2.83 2.83 0 0 1 0-4z"
						fill="none"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		{/if}
	</div>

	<!-- Preset swatches -->
	{#if swatches.length > 0}
		<div class="cp-swatches" role="group" aria-label="Preset colours">
			{#each swatches as swatch (swatch)}
				<button
					type="button"
					class="cp-swatch"
					class:is-active={swatch.toLowerCase() === hex.toLowerCase()}
					style="--swatch-color: {swatch};"
					aria-label={`Select colour ${swatch}`}
					aria-pressed={swatch.toLowerCase() === hex.toLowerCase()}
					onclick={() => selectSwatch(swatch)}
				></button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.cp {
		/* Light defaults; flipped under prefers-color-scheme: dark below. */
		--cp-surface: #ffffff;
		--cp-border: #d4d4d8;
		--cp-text: #18181b;
		--cp-muted: #71717a;
		--cp-ring: #3b82f6;
		--cp-handle-stroke: #ffffff;
		--cp-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		width: 100%;
		max-width: 19rem;
		padding: 0.875rem;
		background: var(--cp-surface);
		border: 1px solid var(--cp-border);
		border-radius: 0.75rem;
		box-shadow: var(--cp-shadow);
		color: var(--cp-text);
		font-family: inherit;
		box-sizing: border-box;
	}

	.cp-fields {
		display: flex;
		gap: 0.75rem;
	}

	/* --- Saturation / value plane --- */
	.cp-plane {
		position: relative;
		flex: 1 1 auto;
		aspect-ratio: 4 / 3;
		min-height: 9rem;
		border-radius: 0.5rem;
		background: var(--hue-color);
		cursor: crosshair;
		touch-action: none;
		overflow: hidden;
		outline: none;
	}

	.cp-plane-white,
	.cp-plane-black {
		position: absolute;
		inset: 0;
		pointer-events: none;
		border-radius: inherit;
	}

	/* White at left → transparent at right (saturation axis). */
	.cp-plane-white {
		background: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0));
	}

	/* Transparent at top → black at bottom (value axis). */
	.cp-plane-black {
		background: linear-gradient(to top, #000000, rgba(0, 0, 0, 0));
	}

	.cp-plane-handle {
		position: absolute;
		width: 0.9rem;
		height: 0.9rem;
		border-radius: 50%;
		background: var(--handle-color);
		border: 2px solid var(--cp-handle-stroke);
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
		transform: translate(-50%, -50%);
		pointer-events: none;
		transition:
			left 0.04s linear,
			top 0.04s linear;
	}

	/* --- Hue slider --- */
	.cp-hue {
		position: relative;
		flex: 0 0 1.25rem;
		border-radius: 0.5rem;
		cursor: ns-resize;
		touch-action: none;
		outline: none;
		background: linear-gradient(
			to bottom,
			#ff0000 0%,
			#ffff00 17%,
			#00ff00 33%,
			#00ffff 50%,
			#0000ff 67%,
			#ff00ff 83%,
			#ff0000 100%
		);
	}

	.cp-hue-handle {
		position: absolute;
		left: 50%;
		width: 1.5rem;
		height: 0.55rem;
		border-radius: 0.3rem;
		background: var(--handle-color);
		border: 2px solid var(--cp-handle-stroke);
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
		transform: translate(-50%, -50%);
		pointer-events: none;
		transition: top 0.04s linear;
	}

	/* --- Readout row --- */
	.cp-readout {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.cp-preview {
		flex: 0 0 auto;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		background: var(--preview-color);
		border: 1px solid var(--cp-border);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
	}

	.cp-hex {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex: 1 1 auto;
	}

	.cp-hex-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--cp-muted);
	}

	.cp-hex-input {
		flex: 1 1 auto;
		min-width: 0;
		width: 100%;
		padding: 0.4rem 0.55rem;
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 0.85rem;
		color: var(--cp-text);
		background: var(--cp-surface);
		border: 1px solid var(--cp-border);
		border-radius: 0.4rem;
		box-sizing: border-box;
	}

	.cp-eyedropper {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
		width: 2rem;
		height: 2rem;
		padding: 0;
		color: var(--cp-text);
		background: var(--cp-surface);
		border: 1px solid var(--cp-border);
		border-radius: 0.4rem;
		cursor: pointer;
	}

	.cp-eyedropper:hover {
		border-color: var(--cp-ring);
		color: var(--cp-ring);
	}

	/* --- Swatches --- */
	.cp-swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.cp-swatch {
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		border-radius: 0.35rem;
		background: var(--swatch-color);
		border: 1px solid var(--cp-border);
		cursor: pointer;
	}

	.cp-swatch.is-active {
		box-shadow:
			0 0 0 2px var(--cp-surface),
			0 0 0 4px var(--cp-ring);
	}

	/* --- Focus visibility --- */
	.cp-plane:focus-visible,
	.cp-hue:focus-visible,
	.cp-hex-input:focus-visible,
	.cp-eyedropper:focus-visible,
	.cp-swatch:focus-visible {
		outline: 2px solid var(--cp-ring);
		outline-offset: 2px;
	}

	/* --- Dark scheme --- */
	@media (prefers-color-scheme: dark) {
		.cp {
			--cp-surface: #18181b;
			--cp-border: #3f3f46;
			--cp-text: #f4f4f5;
			--cp-muted: #a1a1aa;
			--cp-ring: #60a5fa;
			--cp-handle-stroke: #ffffff;
			--cp-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
		}
	}

	/* --- Reduced motion --- */
	@media (prefers-reduced-motion: reduce) {
		.cp-plane-handle,
		.cp-hue-handle {
			transition: none;
		}
	}
</style>
