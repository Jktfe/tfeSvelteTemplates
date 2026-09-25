<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import WaveText from '$lib/components/WaveText.svelte';
	import type { PathTextTrigger } from '$lib/types';

	const shell = catalogShellPropsForSlug('/wavetext')!;

	// Section 1 — hover to ripple, with a live state strip.
	let heroPlaying = $state(false);

	// Section 4 — decorative wave driven from outside.
	let externalPlaying = $state(false);

	// Playground state.
	const triggers: PathTextTrigger[] = ['hover', 'click', 'none'];
	const aligns = ['start', 'middle', 'end'] as const;

	let liveText = $state('Ride the wave');
	let liveAmplitude = $state(24);
	let liveWavelength = $state(240);
	let liveSpeed = $state(0.5);
	let liveSize = $state(32);
	let liveAlign = $state<(typeof aligns)[number]>('middle');
	let liveTrigger = $state<PathTextTrigger>('hover');
	let livePlaying = $state(false);

	const codeExplanation =
		'WaveText generates a sine-wave SVG path from amplitude and wavelength, then sets the phrase on it with <textPath>. While playing, a requestAnimationFrame loop advances the wave’s phase so the crests travel through the letters. The loop only exists while playing, on screen and motion is allowed; under prefers-reduced-motion the wave flips half a cycle in one step instead of animating. Styles are fully scoped and every mount gets its own path id, so many waves can share a page.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'SVG', 'A11y', 'Theme-aware', 'Zero-deps']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="wtx-demo">
			<section class="wtx-section">
				<h4>Hover to ripple · default</h4>
				<p class="wtx-hint">
					Mouse over it or Tab to it and the wave starts flowing. Tap it on a phone, or press Enter
					/ Space, to toggle.
				</p>
				<div class="wtx-stage">
					<WaveText text="Making waves" bind:playing={heroPlaying} />
				</div>
				<div class="wtx-state" role="status" aria-live="polite">
					<span>Active:</span> <code>{heroPlaying ? 'flowing' : 'still'}</code>
				</div>
			</section>

			<section class="wtx-section">
				<h4>Wave shapes · amplitude × wavelength</h4>
				<p class="wtx-hint">
					Two numbers shape the whole curve. Hover each one — the speed differs too.
				</p>
				<div class="wtx-stage wtx-stage--grid">
					<figure class="wtx-figure">
						<WaveText text="Gentle swell" amplitude={10} wavelength={400} speed={0.3} height={140} />
						<figcaption><code>amplitude=10</code> · <code>wavelength=400</code></figcaption>
					</figure>
					<figure class="wtx-figure">
						<WaveText text="Choppy water" amplitude={18} wavelength={90} speed={1.2} height={140} />
						<figcaption><code>amplitude=18</code> · <code>wavelength=90</code></figcaption>
					</figure>
					<figure class="wtx-figure">
						<WaveText text="Big surf" amplitude={48} wavelength={320} speed={0.6} height={180} />
						<figcaption><code>amplitude=48</code> · <code>wavelength=320</code></figcaption>
					</figure>
				</div>
			</section>

			<section class="wtx-section">
				<h4>Click to toggle · alignment + theming</h4>
				<p class="wtx-hint">
					<code>trigger="click"</code> ignores hover. These two also retheme through the token API and
					sit at the start and end of the wave.
				</p>
				<div class="wtx-stage wtx-stage--grid">
					<WaveText
						class="wtx-ocean"
						text="Low tide"
						trigger="click"
						align="start"
						amplitude={16}
						wavelength={220}
						height={150}
					/>
					<WaveText
						class="wtx-sunset"
						text="High tide"
						trigger="click"
						align="end"
						amplitude={28}
						wavelength={260}
						height={150}
					/>
				</div>
			</section>

			<section class="wtx-section">
				<h4>Decorative · driven from outside</h4>
				<p class="wtx-hint">
					<code>trigger="none"</code> renders <code>role="img"</code>; play and pause it from your own
					button through <code>bind:playing</code>.
				</p>
				<div class="wtx-buttons">
					<button
						type="button"
						class="wtx-pill"
						class:wtx-pill--active={externalPlaying}
						aria-pressed={externalPlaying}
						onclick={() => (externalPlaying = !externalPlaying)}
					>
						{externalPlaying ? 'Pause ripple' : 'Play ripple'}
					</button>
				</div>
				<div class="wtx-stage">
					<WaveText text="Now arriving" trigger="none" bind:playing={externalPlaying} height={160} />
				</div>
			</section>

			<section class="wtx-section">
				<h4>Live playground</h4>
				<p class="wtx-hint">Every control rebinds straight into the wave below.</p>
				<div class="wtx-controls">
					<div class="wtx-control">
						<label class="wtx-label" for="wtx-text">Text</label>
						<input id="wtx-text" class="wtx-input" type="text" maxlength="28" bind:value={liveText} />
					</div>
					<div class="wtx-control">
						<span class="wtx-label">Trigger</span>
						<div class="wtx-buttons">
							{#each triggers as t (t)}
								<button
									type="button"
									class="wtx-pill"
									class:wtx-pill--active={liveTrigger === t}
									aria-pressed={liveTrigger === t}
									onclick={() => (liveTrigger = t)}>{t}</button
								>
							{/each}
						</div>
					</div>
					<div class="wtx-control">
						<span class="wtx-label">Align</span>
						<div class="wtx-buttons">
							{#each aligns as a (a)}
								<button
									type="button"
									class="wtx-pill"
									class:wtx-pill--active={liveAlign === a}
									aria-pressed={liveAlign === a}
									onclick={() => (liveAlign = a)}>{a}</button
								>
							{/each}
						</div>
					</div>
					<div class="wtx-control">
						<label class="wtx-label" for="wtx-amp">Amplitude <strong>{liveAmplitude}</strong></label>
						<input id="wtx-amp" type="range" min="0" max="80" step="1" bind:value={liveAmplitude} />
					</div>
					<div class="wtx-control">
						<label class="wtx-label" for="wtx-wave">Wavelength <strong>{liveWavelength}</strong></label>
						<input id="wtx-wave" type="range" min="40" max="600" step="10" bind:value={liveWavelength} />
					</div>
					<div class="wtx-control">
						<label class="wtx-label" for="wtx-speed">Speed <strong>{liveSpeed} Hz</strong></label>
						<input id="wtx-speed" type="range" min="0.1" max="2" step="0.1" bind:value={liveSpeed} />
					</div>
					<div class="wtx-control">
						<label class="wtx-label" for="wtx-size">Font size <strong>{liveSize}px</strong></label>
						<input id="wtx-size" type="range" min="16" max="56" step="2" bind:value={liveSize} />
					</div>
					<div class="wtx-control">
						<span class="wtx-label">State</span>
						<div class="wtx-buttons">
							<button
								type="button"
								class="wtx-pill"
								class:wtx-pill--active={livePlaying}
								aria-pressed={livePlaying}
								onclick={() => (livePlaying = !livePlaying)}>Playing</button
							>
						</div>
					</div>
				</div>
				<div class="wtx-stage" style:--wave-text-size="{liveSize}px">
					<WaveText
						class="wtx-live"
						text={liveText || ' '}
						amplitude={liveAmplitude}
						wavelength={liveWavelength}
						speed={liveSpeed}
						align={liveAlign}
						trigger={liveTrigger}
						bind:playing={livePlaying}
					/>
				</div>
				<div class="wtx-state">
					<span>Active:</span> <code>{livePlaying ? 'flowing' : 'still'}</code> ·
					<code>trigger="{liveTrigger}"</code> · <code>align="{liveAlign}"</code>
				</div>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr>
					<th>Prop</th>
					<th>Type</th>
					<th>Default</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>text</code></td>
					<td><code>string</code></td>
					<td><code>'WAVING TEXT'</code></td>
					<td>The phrase set on the wave.</td>
				</tr>
				<tr>
					<td><code>amplitude</code></td>
					<td><code>number</code></td>
					<td><code>20</code></td>
					<td>Crest height in SVG units.</td>
				</tr>
				<tr>
					<td><code>wavelength</code></td>
					<td><code>number</code></td>
					<td><code>200</code></td>
					<td>Distance between crests in SVG units.</td>
				</tr>
				<tr>
					<td><code>playing</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Bindable — whether the ripple is flowing.</td>
				</tr>
				<tr>
					<td><code>trigger</code></td>
					<td><code>'hover' | 'click' | 'none'</code></td>
					<td><code>'hover'</code></td>
					<td>Interaction model. Hover also responds to keyboard focus and taps.</td>
				</tr>
				<tr>
					<td><code>speed</code></td>
					<td><code>number</code></td>
					<td><code>0.5</code></td>
					<td>Wave cycles per second while flowing.</td>
				</tr>
				<tr>
					<td><code>align</code></td>
					<td><code>'start' | 'middle' | 'end'</code></td>
					<td><code>'middle'</code></td>
					<td>Where the phrase sits along the wave.</td>
				</tr>
				<tr>
					<td><code>height</code></td>
					<td><code>number</code></td>
					<td><code>220</code></td>
					<td>Container height in px.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td><code>text</code></td>
					<td>Accessible name override.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.wtx-demo {
		display: grid;
		gap: 28px;
	}
	.wtx-section h4 {
		margin: 0 0 6px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.wtx-hint {
		margin: 0 0 12px;
		font-size: 14px;
		color: var(--fg-2);
	}
	.wtx-stage {
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.wtx-stage--grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 16px;
	}
	.wtx-figure {
		margin: 0;
		display: grid;
		gap: 6px;
	}
	.wtx-figure figcaption {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--fg-3);
		text-align: center;
	}
	.wtx-state {
		margin-top: 10px;
		padding: 10px 14px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		font-size: 13px;
		color: var(--fg-1);
	}
	.wtx-state span {
		color: var(--fg-3);
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin-right: 6px;
	}
	.wtx-controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 14px;
		padding: 16px;
		margin-bottom: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.wtx-control {
		display: grid;
		gap: 8px;
		align-content: start;
	}
	.wtx-control input[type='range'] {
		width: 100%;
	}
	.wtx-input {
		padding: 6px 10px;
		border: 1px solid var(--border);
		border-radius: var(--r-1);
		background: var(--surface-2);
		color: var(--fg-1);
		font: 500 13px var(--font-sans);
	}
	.wtx-input:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}
	.wtx-label {
		font: 500 11px var(--font-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.wtx-label strong {
		color: var(--fg-1);
		font-weight: 600;
		text-transform: none;
		letter-spacing: 0;
	}
	.wtx-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 10px;
	}
	.wtx-control .wtx-buttons {
		margin-bottom: 0;
	}
	.wtx-pill {
		padding: 6px 10px;
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--fg-2);
		border-radius: var(--r-1);
		font: 500 12px var(--font-sans);
		cursor: pointer;
	}
	.wtx-pill:hover {
		color: var(--fg-1);
		border-color: var(--accent);
	}
	.wtx-pill:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	.wtx-pill--active {
		background: var(--accent);
		color: var(--accent-on, #fff);
		border-color: var(--accent);
	}

	/*
	 * Token overrides for the themed pair. The doubled class beats the
	 * component's own scoped `.wt-root` rule — see docs/THEMING.md.
	 */
	.wtx-stage :global(.wtx-ocean.wtx-ocean) {
		--wave-text-bg: #0c4a6e;
		--wave-text-fg: #bae6fd;
		--wave-text-focus-ring: #fde68a;
		--wave-text-font: Georgia, 'Times New Roman', serif;
	}
	.wtx-stage :global(.wtx-sunset.wtx-sunset) {
		--wave-text-bg: #7c2d12;
		--wave-text-fg: #fed7aa;
		--wave-text-focus-ring: #fef08a;
		--wave-text-font: 'Anton', 'Impact', sans-serif;
	}
	/* The playground forwards its font-size slider through the token. */
	.wtx-stage :global(.wtx-live.wtx-live) {
		--wave-text-size: inherit;
	}
</style>
