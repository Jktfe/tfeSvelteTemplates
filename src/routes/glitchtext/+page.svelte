<script lang="ts">
	import GlitchText from '$lib/components/GlitchText.svelte';

	type Intensity = 'subtle' | 'moderate' | 'wild';
	type Trigger = 'auto' | 'hover' | 'viewport';

	let liveIntensity: Intensity = $state('moderate');
	let liveTrigger: Trigger = $state('auto');
	let liveText = $state('GLITCHED');
	let liveKey = $state(0);

	function bumpLive() {
		liveKey++;
	}
</script>

<svelte:head>
	<title>GlitchText — TFE Svelte Templates</title>
</svelte:head>

<main class="page">
	<header class="hero">
		<p class="eyebrow">Helpful UX · Text effect</p>
		<h1>GlitchText</h1>
		<p class="lede">
			RGB-channel-split text glitch primitive with optional clip-path tear bands. Asset-free,
			reduced-motion safe, three intensities, three triggers.
		</p>
	</header>

	<!-- Demo 1: Cyberpunk hero -->
	<section class="demo demo-hero">
		<div class="stage stage-dark">
			<div class="hero-stack">
				<p class="hero-label">SECTOR-7 / NIGHT CITY UPLINK</p>
				<h2 class="hero-title">
					<GlitchText text="SYSTEM 0V3R10AD" intensity="wild" trigger="auto" />
				</h2>
				<p class="hero-sub">
					<GlitchText text="reroute through the spire" intensity="subtle" trigger="auto" />
				</p>
			</div>
		</div>
		<aside class="meta">
			<h3>Cyberpunk hero</h3>
			<p>
				Wild intensity on the headline (6px RGB offset, 220ms tear cadence) with a subtle layer on
				the sub. <code>auto</code> trigger so it runs continuously while the section is mounted.
			</p>
			<p class="hint">
				Composes naturally with <code>CRTScreen</code> for a fully period-correct broadcast-monitor
				vibe.
			</p>
		</aside>
	</section>

	<!-- Demo 2: Broadcast-tear card -->
	<section class="demo">
		<div class="stage stage-broadcast">
			<div class="broadcast-card">
				<p class="broadcast-flag">LIVE · 04:21:09 UTC</p>
				<h3 class="broadcast-headline">
					<GlitchText text="BREAKING SIGNAL" intensity="moderate" trigger="auto" />
				</h3>
				<p class="broadcast-body">
					Anomalous <GlitchText text="quantum drift" intensity="subtle" trigger="auto" /> detected
					along the orbital relay. Engineering reports tear-band frequency steady at
					<GlitchText text="380ms ± 50%" intensity="subtle" trigger="auto" />.
				</p>
			</div>
		</div>
		<aside class="meta">
			<h3>Inline broadcast-tear</h3>
			<p>
				Moderate on the headline, subtle inline glitches on body-text terms. Tear cadence varies in
				<code>[0.5x, 1.5x]</code> of jitterMs so the tears don't beat in time across multiple
				instances.
			</p>
		</aside>
	</section>

	<!-- Demo 3: Hover-only grid -->
	<section class="demo">
		<div class="stage stage-grid">
			<div class="hover-grid">
				{#each [{ label: 'subtle', intensity: 'subtle' as Intensity }, { label: 'moderate', intensity: 'moderate' as Intensity }, { label: 'wild', intensity: 'wild' as Intensity }] as item (item.label)}
					<button class="hover-card" type="button">
						<span class="hover-label">{item.label}</span>
						<span class="hover-text">
							<GlitchText text="HOVER ME" intensity={item.intensity} trigger="hover" />
						</span>
					</button>
				{/each}
			</div>
		</div>
		<aside class="meta">
			<h3>Hover-only · keyboard parity</h3>
			<p>
				<code>trigger="hover"</code> rests clean (no rAF, no timers). Glitches on
				<code>mouseenter</code>
				or
				<code>focusin</code> — tab through to verify keyboard parity. Stops on leave/blur and
				resets visuals to zero offset.
			</p>
		</aside>
	</section>

	<!-- Demo 4: Viewport trigger -->
	<section class="demo">
		<div class="stage stage-viewport">
			<div class="viewport-spacer">scroll target ↓</div>
			<div class="viewport-stage">
				<h3 class="viewport-title">
					<GlitchText text="DETECTED ONSCREEN" intensity="wild" trigger="viewport" />
				</h3>
				<p class="viewport-sub">
					<GlitchText
						text="IntersectionObserver fires once, then disconnects."
						intensity="subtle"
						trigger="viewport"
					/>
				</p>
			</div>
		</div>
		<aside class="meta">
			<h3>One-shot viewport trigger</h3>
			<p>
				<code>trigger="viewport"</code> uses <code>IntersectionObserver</code> to fire
				<code>start()</code>
				on first intersection, then disconnects. After that the effect runs steady-state — no
				re-triggering on scroll-out / scroll-in. Cheap on steady state, no observer left dangling.
			</p>
		</aside>
	</section>

	<!-- Demo 5: Live controls -->
	<section class="demo">
		<div class="stage stage-controls">
			{#key liveKey}
				<div class="live-stage">
					<GlitchText text={liveText} intensity={liveIntensity} trigger={liveTrigger} />
				</div>
			{/key}
			<form class="live-controls" onsubmit={(e) => e.preventDefault()}>
				<label>
					<span>Text</span>
					<input type="text" bind:value={liveText} maxlength="40" />
				</label>
				<label>
					<span>Intensity</span>
					<select bind:value={liveIntensity}>
						<option value="subtle">subtle</option>
						<option value="moderate">moderate</option>
						<option value="wild">wild</option>
					</select>
				</label>
				<label>
					<span>Trigger</span>
					<select bind:value={liveTrigger}>
						<option value="auto">auto</option>
						<option value="hover">hover</option>
						<option value="viewport">viewport</option>
					</select>
				</label>
				<button class="restart" type="button" onclick={bumpLive}>Restart</button>
			</form>
		</div>
		<aside class="meta">
			<h3>Live controls · &lt;GlitchText /&gt;</h3>
			<p>
				Edit the text and switch intensity / trigger. Restart re-keys the host to remount the
				component cleanly — useful when switching trigger from <code>viewport</code> back to
				<code>auto</code> while the element is already onscreen.
			</p>
		</aside>
	</section>

	<!-- Meta cards -->
	<section class="cards">
		<article class="card">
			<h3>Three intensities</h3>
			<p>
				<code>subtle</code> · <code>moderate</code> · <code>wild</code>. Each preset bundles
				offsetMax, tearMs, jitterMs cadence and clone opacity into a single <code>pickIntensity</code> call so the API stays one prop.
			</p>
		</article>
		<article class="card">
			<h3>Deterministic per-seed</h3>
			<p>
				<code>jitterOffset</code> and <code>tearBand</code> are pure functions of an integer seed.
				Same seed always produces the same offsets — keeps the visual stable enough not to feel like
				random white noise.
			</p>
		</article>
		<article class="card">
			<h3>Pseudo-element clones</h3>
			<p>
				The cyan and magenta clones are CSS <code>::before</code> / <code>::after</code> pseudo-elements
				rendered from <code>attr(data-text)</code>. Invisible to AT, no extra DOM nodes, just CSS variables for the per-frame offsets.
			</p>
		</article>
		<article class="card">
			<h3>Reduced-motion belt + braces</h3>
			<p>
				<code>start()</code> refuses to spin the rAF loop if <code>isReducedMotion()</code> is true.
				The stylesheet also hides clones and the tear band via
				<code>@media (prefers-reduced-motion: reduce)</code> — defends against any future code path that activates without the JS guard.
			</p>
		</article>
		<article class="card">
			<h3>Tear cadence variance</h3>
			<p>
				<code>scheduleNextTear</code> picks a fresh delay in <code>[0.5x, 1.5x]</code> of jitterMs
				per cycle. Multiple GlitchText instances on the same page tear at different moments, so
				the page doesn't pulse in unison.
			</p>
		</article>
		<article class="card">
			<h3>One rAF per active component</h3>
			<p>
				The jitter loop is a single <code>requestAnimationFrame</code> tick per running instance.
				Frame work is integer math and CSS variable writes — no layout thrash. Tear band is one
				absolutely-positioned span mounted only while visible.
			</p>
		</article>
	</section>
</main>

<style>
	.page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
		color: #0f172a;
	}

	.hero {
		margin-bottom: 2.5rem;
	}

	.eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.18em;
		font-size: 0.75rem;
		color: #b45309;
		margin: 0 0 0.4rem;
	}

	.hero h1 {
		font-size: clamp(2rem, 5vw, 3rem);
		margin: 0 0 0.6rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.lede {
		font-size: 1.05rem;
		color: #475569;
		max-width: 60ch;
		margin: 0;
	}

	.demo {
		display: grid;
		grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
		gap: 1.5rem;
		margin-bottom: 2.5rem;
	}

	@media (max-width: 720px) {
		.demo {
			grid-template-columns: 1fr;
		}
	}

	.stage {
		border-radius: 18px;
		padding: 2rem;
		min-height: 240px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.stage-dark {
		background: radial-gradient(circle at 30% 20%, #1e1b4b 0%, #020617 75%);
		color: #f1f5f9;
		font-family:
			'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace;
	}

	.hero-stack {
		text-align: center;
	}

	.hero-label {
		font-size: 0.7rem;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: #fde68a;
		margin: 0 0 0.5rem;
	}

	.hero-title {
		font-size: clamp(1.6rem, 4vw, 2.6rem);
		margin: 0 0 0.6rem;
		font-weight: 900;
		letter-spacing: -0.01em;
	}

	.hero-sub {
		margin: 0;
		font-size: 1rem;
		color: #cbd5e1;
	}

	.stage-broadcast {
		background: linear-gradient(135deg, #18181b 0%, #3f3f46 100%);
		color: #fafaf9;
	}

	.broadcast-card {
		background: rgba(0, 0, 0, 0.6);
		border: 1px solid #f59e0b;
		border-radius: 14px;
		padding: 1.5rem;
		max-width: 480px;
		font-family:
			'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace;
	}

	.broadcast-flag {
		color: #fbbf24;
		font-size: 0.8rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		margin: 0 0 0.5rem;
	}

	.broadcast-headline {
		font-size: 1.6rem;
		margin: 0 0 0.8rem;
		font-weight: 800;
	}

	.broadcast-body {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.5;
		color: #e7e5e4;
	}

	.stage-grid {
		background: linear-gradient(135deg, #0f172a 0%, #312e81 100%);
		padding: 2.5rem 1.5rem;
	}

	.hover-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		width: 100%;
		max-width: 600px;
	}

	@media (max-width: 600px) {
		.hover-grid {
			grid-template-columns: 1fr;
		}
	}

	.hover-card {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 12px;
		padding: 1.5rem 1rem;
		color: #f8fafc;
		font-family:
			'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		align-items: center;
		cursor: pointer;
		transition: background 200ms ease;
	}

	.hover-card:hover,
	.hover-card:focus-visible {
		background: rgba(255, 255, 255, 0.1);
	}

	.hover-label {
		font-size: 0.7rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #c4b5fd;
	}

	.hover-text {
		font-size: 1.2rem;
		font-weight: 800;
	}

	.stage-viewport {
		background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
		flex-direction: column;
		gap: 4rem;
		color: #ecfdf5;
		padding: 2.5rem 1.5rem;
	}

	.viewport-spacer {
		font-size: 0.8rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #6ee7b7;
		opacity: 0.7;
	}

	.viewport-stage {
		text-align: center;
		font-family:
			'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace;
	}

	.viewport-title {
		font-size: clamp(1.6rem, 4vw, 2.4rem);
		margin: 0 0 0.6rem;
		font-weight: 900;
	}

	.viewport-sub {
		margin: 0;
		color: #a7f3d0;
	}

	.stage-controls {
		background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
		flex-direction: column;
		gap: 1.5rem;
		color: #f1f5f9;
		padding: 2.5rem 1.5rem;
		font-family:
			'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace;
	}

	.live-stage {
		font-size: clamp(1.8rem, 4vw, 2.6rem);
		font-weight: 900;
	}

	.live-controls {
		display: grid;
		grid-template-columns: repeat(2, minmax(120px, 1fr)) auto;
		gap: 0.6rem 1rem;
		align-items: end;
		width: 100%;
		max-width: 560px;
	}

	@media (max-width: 540px) {
		.live-controls {
			grid-template-columns: 1fr 1fr;
		}
	}

	.live-controls label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #94a3b8;
	}

	.live-controls input,
	.live-controls select {
		font: inherit;
		padding: 0.5rem 0.6rem;
		background: rgba(255, 255, 255, 0.06);
		color: #f1f5f9;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 8px;
	}

	.restart {
		grid-column: 1 / -1;
		justify-self: start;
		font: inherit;
		padding: 0.55rem 1rem;
		background: #f59e0b;
		color: #0f172a;
		font-weight: 700;
		border: none;
		border-radius: 8px;
		cursor: pointer;
	}

	.restart:hover,
	.restart:focus-visible {
		background: #fbbf24;
	}

	.meta {
		background: #fffbeb;
		border: 1px solid #fde68a;
		border-radius: 14px;
		padding: 1.25rem 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		color: #422006;
	}

	.meta h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 700;
	}

	.meta p {
		margin: 0;
		font-size: 0.92rem;
		line-height: 1.55;
	}

	.meta .hint {
		color: #92400e;
		font-style: italic;
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-top: 2rem;
	}

	@media (max-width: 900px) {
		.cards {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 600px) {
		.cards {
			grid-template-columns: 1fr;
		}
	}

	.card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.1rem 1.2rem;
	}

	.card h3 {
		margin: 0 0 0.4rem;
		font-size: 0.95rem;
		font-weight: 700;
	}

	.card p {
		margin: 0;
		font-size: 0.88rem;
		line-height: 1.5;
		color: #475569;
	}

	code {
		font-family:
			'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.85em;
		background: rgba(15, 23, 42, 0.06);
		padding: 1px 5px;
		border-radius: 4px;
	}

</style>
