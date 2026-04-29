<script lang="ts">
	import HoldToConfirm from '$lib/components/HoldToConfirm.svelte';

	let lastFired = $state<string | null>(null);
	let confirmCount = $state(0);
	let cancelCount = $state(0);

	function onConfirmRing() {
		lastFired = 'ring';
		confirmCount += 1;
	}
	function onConfirmBar() {
		lastFired = 'bar';
		confirmCount += 1;
	}
	function onConfirmGlow() {
		lastFired = 'glow';
		confirmCount += 1;
	}
	function onCancel() {
		cancelCount += 1;
	}
</script>

<svelte:head>
	<title>HoldToConfirm · TFE Svelte Templates</title>
</svelte:head>

<main class="page">
	<header class="hero">
		<h1>HoldToConfirm</h1>
		<p>
			A press-and-hold confirmation button for destructive UX flows. Hold to delete, hold to send,
			hold to leave the call. Release before completion cancels; release after completion fires
			<code>onConfirm</code>. The gesture cost defeats habituation — users cannot accidentally
			tap-confirm an irreversible action. Pointer + keyboard parity from line one;
			<code>prefers-reduced-motion</code> collapses to a single-press confirm with visible text
			fallback.
		</p>
	</header>

	<section class="demo">
		<h2>1. The three variants</h2>
		<p class="caption">
			Same gesture, three visual rhythms. <code>ring</code> fills an SVG stroke; <code>bar</code>
			grows a horizontal background fill; <code>glow</code> pulses a radial gradient out from the
			centre. Pick the one that fits the surrounding UI density.
		</p>
		<div class="variant-grid">
			<div class="variant-card">
				<h3>ring</h3>
				<p>SVG <code>stroke-dashoffset</code> sweep around a circular gauge.</p>
				<HoldToConfirm
					variant="ring"
					label="Hold to delete"
					duration={1500}
					onConfirm={onConfirmRing}
					{onCancel}
				/>
			</div>
			<div class="variant-card">
				<h3>bar</h3>
				<p>Linear horizontal fill expanding behind the label.</p>
				<HoldToConfirm
					variant="bar"
					label="Hold to send"
					duration={1500}
					onConfirm={onConfirmBar}
					{onCancel}
				/>
			</div>
			<div class="variant-card">
				<h3>glow</h3>
				<p>Radial pulse blooming from the centre of the button.</p>
				<HoldToConfirm
					variant="glow"
					label="Hold to leave call"
					duration={1500}
					onConfirm={onConfirmGlow}
					{onCancel}
				/>
			</div>
		</div>
		<div class="readout">
			<span>
				<strong>{confirmCount}</strong>
				confirm{confirmCount === 1 ? '' : 's'} ·
				<strong>{cancelCount}</strong>
				cancel{cancelCount === 1 ? '' : 's'}
			</span>
			{#if lastFired}
				<span class="readout-tag">last fired: <code>{lastFired}</code></span>
			{/if}
		</div>
	</section>

	<section class="demo">
		<h2>2. Duration sweep — same variant, different gesture cost</h2>
		<p class="caption">
			<code>duration</code> is clamped to <code>[200, 10000]</code> ms. Below 200 ms the gesture
			collapses into a tap and defeats the point; above 10 s the UX becomes hostile. Use longer
			durations for higher-stakes confirms.
		</p>
		<div class="duration-grid">
			<div class="duration-card">
				<HoldToConfirm
					variant="ring"
					duration={500}
					label="0.5s · twitch test"
					onConfirm={onConfirmRing}
					{onCancel}
				/>
				<p>Fast — accidental holds possible</p>
			</div>
			<div class="duration-card">
				<HoldToConfirm
					variant="ring"
					duration={1500}
					label="1.5s · default"
					onConfirm={onConfirmRing}
					{onCancel}
				/>
				<p>Default — feels deliberate</p>
			</div>
			<div class="duration-card">
				<HoldToConfirm
					variant="ring"
					duration={3000}
					label="3s · destructive"
					onConfirm={onConfirmRing}
					{onCancel}
				/>
				<p>High-stakes — actively uncomfortable</p>
			</div>
		</div>
	</section>

	<section class="demo">
		<h2>3. Disabled state</h2>
		<p class="caption">
			With <code>disabled={'{true}'}</code> the button ignores pointer and keyboard input,
			<code>aria-disabled</code> reflects the state, and the native <code>disabled</code> attribute
			prevents form submission. Use this while a parent action is in flight.
		</p>
		<div class="single-row">
			<HoldToConfirm disabled label="Saving — please wait" />
		</div>
	</section>

	<section class="demo">
		<h2>4. Keyboard parity</h2>
		<p class="caption">
			Tab to the button, then press and hold <kbd>Enter</kbd> (or <kbd>Space</kbd>) for the full
			duration. Releasing the key before completion cancels — exactly as releasing the pointer would.
			Repeat events are filtered so holding the key does not start a second cycle.
		</p>
		<div class="single-row">
			<HoldToConfirm
				variant="bar"
				label="Tab here, then hold Enter"
				duration={1500}
				onConfirm={onConfirmBar}
				{onCancel}
			/>
		</div>
	</section>

	<section class="meta">
		<div class="meta-grid">
			<div class="meta-card">
				<h3>Pointer + keyboard parity</h3>
				<p>
					<code>pointerdown</code> / <code>pointerup</code> for mouse / touch / pen.
					<kbd>Enter</kbd> and <kbd>Space</kbd> trigger a programmatic hold cycle for keyboard
					users. No 2-step click fakery — the gesture is the safety, regardless of input device.
				</p>
			</div>
			<div class="meta-card">
				<h3>Pointer capture</h3>
				<p>
					<code>setPointerCapture</code> on <code>pointerdown</code> keeps the gesture alive
					even if the user drags outside the button. Release anywhere to cancel — no
					<em>“my finger slipped, did it commit?”</em> ambiguity.
				</p>
			</div>
			<div class="meta-card">
				<h3>Reduced-motion bypass</h3>
				<p>
					<code>prefers-reduced-motion: reduce</code> collapses the gesture to a single-press
					confirm. A visible text fallback (<em>“Press and hold for 1.5s”</em>) explains the
					original contract. Safety preserved, animation removed.
				</p>
			</div>
			<div class="meta-card">
				<h3>GPU-composited fill</h3>
				<p>
					Visible progress is CSS — <code>stroke-dashoffset</code> (ring),
					<code>width</code> (bar), <code>opacity + scale</code> (glow). JS only fires the
					<code>setTimeout</code> for the confirm callback.
				</p>
			</div>
			<div class="meta-card">
				<h3>Confirmed-state hold</h3>
				<p>
					After <code>onConfirm</code> fires the visible <em>“Confirmed”</em> state holds for
					700 ms before resetting, so the user sees their action register before the button
					returns to idle.
				</p>
			</div>
			<div class="meta-card">
				<h3>Defeats habituation</h3>
				<p>
					Native <code>confirm()</code> dialogs become noise users dismiss without reading.
					Sustained pressure cannot be muscle-memoried — the user has to make an explicit,
					ongoing decision for the entire duration.
				</p>
			</div>
		</div>
	</section>
</main>

<style>
	.page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 3rem 1.5rem 6rem;
		color: #e6e6e6;
	}

	.hero {
		margin-bottom: 3rem;
	}

	.hero h1 {
		font-size: clamp(2.5rem, 5vw, 4rem);
		margin: 0 0 0.5rem;
		background: linear-gradient(135deg, #ffffff, #c9c9d1, #6d6d7a);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.hero p {
		font-size: 1.125rem;
		line-height: 1.6;
		max-width: 720px;
		color: #a8a8b8;
	}

	.hero code,
	.caption code,
	.meta-card code,
	.variant-card code {
		background: #1a1a2e;
		padding: 0.1em 0.35em;
		border-radius: 4px;
		font-size: 0.9em;
		color: #c9c9d1;
	}

	kbd {
		font-family: 'Fira Code', monospace;
		background: #1a1a2e;
		border: 1px solid #2a2a3e;
		border-bottom-width: 2px;
		padding: 0.1em 0.45em;
		border-radius: 4px;
		font-size: 0.85em;
		color: #c9c9d1;
	}

	.demo {
		margin-bottom: 4rem;
	}

	.demo h2 {
		font-size: 1.5rem;
		margin: 0 0 0.5rem;
		color: #fff;
	}

	.caption {
		color: #8c8c9c;
		font-size: 0.95rem;
		margin: 0 0 1.5rem;
		line-height: 1.6;
	}

	.variant-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
	}

	.variant-card {
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		text-align: center;
	}

	.variant-card h3 {
		margin: 0;
		font-family: 'Fira Code', monospace;
		font-size: 0.95rem;
		color: #c9c9d1;
	}

	.variant-card p {
		margin: 0;
		font-size: 0.85rem;
		color: #8c8c9c;
		line-height: 1.5;
	}

	.duration-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}

	.duration-card {
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		text-align: center;
	}

	.duration-card p {
		margin: 0;
		font-size: 0.85rem;
		color: #8c8c9c;
	}

	.single-row {
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		justify-content: center;
	}

	.readout {
		margin-top: 1.5rem;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
		font-size: 0.9rem;
		color: #a8a8b8;
	}

	.readout-tag code {
		color: #38bdf8;
	}

	.meta {
		margin-top: 5rem;
		border-top: 1px solid #1f1f3a;
		padding-top: 3rem;
	}

	.meta-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.5rem;
	}

	.meta-card {
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: 12px;
		padding: 1.25rem;
	}

	.meta-card h3 {
		font-size: 1rem;
		margin: 0 0 0.5rem;
		color: #c9c9d1;
	}

	.meta-card p {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.6;
		color: #a8a8b8;
	}
</style>
