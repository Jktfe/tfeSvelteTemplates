<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import GlitchText from '$lib/components/GlitchText.svelte';

	const shell = catalogShellPropsForSlug('/glitchtext')!;

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
	<title>GlitchText — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="RGB-channel-split text glitch with optional clip-path tear bands. Three intensities, three triggers, asset-free."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Effects', 'Theme-aware', 'A11y']}
	codeExplanation="GlitchText paints two pseudo-element clones of the text using attr(data-text), then animates their X offsets via CSS variables on a single requestAnimationFrame loop. Tear cadence picks a fresh delay in [0.5x, 1.5x] of jitterMs per cycle so concurrent instances do not pulse in unison. start() refuses to spawn the rAF loop when prefers-reduced-motion is set, and the stylesheet hides clones at the same media query as a belt-and-braces guard."
>
	{#snippet demo()}
		<div class="gt-demo">
			<div class="gt-row">
				<div class="gt-stage gt-stage--dark">
					<div class="gt-hero-stack">
						<p class="gt-hero-label">SECTOR-7 / NIGHT CITY UPLINK</p>
						<h3 class="gt-hero-title">
							<GlitchText text="SYSTEM 0V3R10AD" intensity="wild" trigger="auto" />
						</h3>
						<p class="gt-hero-sub">
							<GlitchText text="reroute through the spire" intensity="subtle" trigger="auto" />
						</p>
					</div>
				</div>
				<aside class="gt-meta">
					<h4>Cyberpunk hero</h4>
					<p>Wild intensity on the headline plus a subtle layer on the sub. Continuous trigger="auto".</p>
				</aside>
			</div>

			<div class="gt-row">
				<div class="gt-stage gt-stage--broadcast">
					<div class="gt-broadcast-card">
						<p class="gt-broadcast-flag">LIVE · 04:21:09 UTC</p>
						<h4 class="gt-broadcast-headline">
							<GlitchText text="BREAKING SIGNAL" intensity="moderate" trigger="auto" />
						</h4>
						<p class="gt-broadcast-body">
							Anomalous <GlitchText text="quantum drift" intensity="subtle" trigger="auto" /> detected
							along the orbital relay.
						</p>
					</div>
				</div>
				<aside class="gt-meta">
					<h4>Inline broadcast-tear</h4>
					<p>Moderate on the headline, subtle inline glitches on body terms — mixes well with regular prose.</p>
				</aside>
			</div>

			<div class="gt-row">
				<div class="gt-stage gt-stage--grid">
					<div class="gt-hover-grid">
						{#each [{ label: 'subtle', intensity: 'subtle' as Intensity }, { label: 'moderate', intensity: 'moderate' as Intensity }, { label: 'wild', intensity: 'wild' as Intensity }] as item (item.label)}
							<button class="gt-hover-card" type="button">
								<span class="gt-hover-label">{item.label}</span>
								<span class="gt-hover-text">
									<GlitchText text="HOVER ME" intensity={item.intensity} trigger="hover" />
								</span>
							</button>
						{/each}
					</div>
				</div>
				<aside class="gt-meta">
					<h4>Hover · keyboard parity</h4>
					<p>trigger="hover" rests clean and runs on focus too. Tab through to verify.</p>
				</aside>
			</div>

			<div class="gt-row">
				<div class="gt-stage gt-stage--controls">
					{#key liveKey}
						<div class="gt-live-stage">
							<GlitchText text={liveText} intensity={liveIntensity} trigger={liveTrigger} />
						</div>
					{/key}
					<form class="gt-live-controls" onsubmit={(e) => e.preventDefault()}>
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
						<button class="gt-restart" type="button" onclick={bumpLive}>Restart</button>
					</form>
				</div>
				<aside class="gt-meta">
					<h4>Live controls</h4>
					<p>Edit the text and switch intensity / trigger. Restart re-keys the host to remount cleanly.</p>
				</aside>
			</div>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>text</code></td><td><code>string</code></td><td>required</td><td>String to glitch.</td></tr>
				<tr><td><code>intensity</code></td><td><code>"subtle" | "moderate" | "wild"</code></td><td><code>"moderate"</code></td><td>Bundled offsetMax, tearMs, jitterMs preset.</td></tr>
				<tr><td><code>trigger</code></td><td><code>"auto" | "hover" | "viewport"</code></td><td><code>"auto"</code></td><td>auto runs continuously; hover runs while pointer/focus is in; viewport fires once on first intersection.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.gt-demo {
		display: grid;
		gap: 1.5rem;
	}
	.gt-row {
		display: grid;
		grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
		gap: 1.25rem;
	}
	@media (max-width: 720px) {
		.gt-row {
			grid-template-columns: 1fr;
		}
	}

	.gt-stage {
		border-radius: 18px;
		padding: 2rem;
		min-height: 220px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.gt-stage--dark {
		background: radial-gradient(circle at 30% 20%, #1e1b4b 0%, #020617 75%);
		color: #f1f5f9;
		font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
	}
	.gt-hero-stack {
		text-align: center;
	}
	.gt-hero-label {
		font-size: 0.7rem;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: #fde68a;
		margin: 0 0 0.5rem;
	}
	.gt-hero-title {
		font-size: clamp(1.5rem, 3.5vw, 2.4rem);
		margin: 0 0 0.6rem;
		font-weight: 900;
	}
	.gt-hero-sub {
		margin: 0;
		font-size: 1rem;
		color: #cbd5e1;
	}
	.gt-stage--broadcast {
		background: linear-gradient(135deg, #18181b 0%, #3f3f46 100%);
		color: #fafaf9;
	}
	.gt-broadcast-card {
		background: rgba(0, 0, 0, 0.6);
		border: 1px solid #f59e0b;
		border-radius: 14px;
		padding: 1.5rem;
		max-width: 460px;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
	}
	.gt-broadcast-flag {
		color: #fbbf24;
		font-size: 0.8rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		margin: 0 0 0.5rem;
	}
	.gt-broadcast-headline {
		font-size: 1.5rem;
		margin: 0 0 0.8rem;
		font-weight: 800;
	}
	.gt-broadcast-body {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.5;
		color: #e7e5e4;
	}
	.gt-stage--grid {
		background: linear-gradient(135deg, #0f172a 0%, #312e81 100%);
		padding: 2rem 1.5rem;
	}
	.gt-hover-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		width: 100%;
	}
	@media (max-width: 600px) {
		.gt-hover-grid {
			grid-template-columns: 1fr;
		}
	}
	.gt-hover-card {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 12px;
		padding: 1.25rem 1rem;
		color: #f8fafc;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
		cursor: pointer;
	}
	.gt-hover-card:hover,
	.gt-hover-card:focus-visible {
		background: rgba(255, 255, 255, 0.1);
	}
	.gt-hover-label {
		font-size: 0.7rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #c4b5fd;
	}
	.gt-hover-text {
		font-size: 1.1rem;
		font-weight: 800;
	}
	.gt-stage--controls {
		background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
		flex-direction: column;
		gap: 1.25rem;
		color: #f1f5f9;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
	}
	.gt-live-stage {
		font-size: clamp(1.6rem, 3.5vw, 2.4rem);
		font-weight: 900;
	}
	.gt-live-controls {
		display: grid;
		grid-template-columns: repeat(2, minmax(120px, 1fr)) auto;
		gap: 0.5rem 1rem;
		align-items: end;
		width: 100%;
		max-width: 520px;
	}
	@media (max-width: 540px) {
		.gt-live-controls {
			grid-template-columns: 1fr 1fr;
		}
	}
	.gt-live-controls label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #94a3b8;
	}
	.gt-live-controls input,
	.gt-live-controls select {
		font: inherit;
		padding: 0.4rem 0.6rem;
		background: rgba(255, 255, 255, 0.06);
		color: #f1f5f9;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 8px;
	}
	.gt-restart {
		grid-column: 1 / -1;
		justify-self: start;
		padding: 0.5rem 1rem;
		background: #f59e0b;
		color: #0f172a;
		font-weight: 700;
		border: none;
		border-radius: 8px;
		cursor: pointer;
	}
	.gt-restart:hover,
	.gt-restart:focus-visible {
		background: #fbbf24;
	}
	.gt-meta {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 1.1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		color: var(--fg-1);
	}
	.gt-meta h4 {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 700;
	}
	.gt-meta p {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--fg-2);
	}
</style>
