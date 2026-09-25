<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import AnimatedText from '$lib/components/AnimatedText.svelte';
	import type { AnimatedTextDirection, PathTextTrigger } from '$lib/types';

	const shell = catalogShellPropsForSlug('/animated-text')!;

	// Section 1 — hover to reveal, with a live state strip.
	let heroMorphed = $state(false);

	// Section 4 — decorative ribbon driven entirely from outside.
	let externalMorphed = $state(false);
	let externalPaused = $state(false);

	// Playground state.
	const pathPresets = [
		{ id: 'curve', label: 'S-curve', d: 'M -300 150 Q 0 -50 300 150 T 900 150 T 1500 150 T 2100 150' },
		{ id: 'swell', label: 'Swell', d: 'M -300 200 C 100 20, 500 20, 900 200 S 1700 380, 2100 150' },
		{ id: 'line', label: 'Straight', d: 'M -300 150 L 2100 150' },
		{ id: 'arch', label: 'Arch', d: 'M -200 260 Q 600 -120 1400 260' }
	] as const;
	const triggers: PathTextTrigger[] = ['hover', 'click', 'none'];
	const directions: AnimatedTextDirection[] = ['left', 'right'];

	let liveSpeed = $state(30);
	let liveRepeat = $state(4);
	let liveSize = $state(20);
	let liveHeight = $state(200);
	let liveDirection = $state<AnimatedTextDirection>('left');
	let liveTrigger = $state<PathTextTrigger>('hover');
	let livePath = $state<(typeof pathPresets)[number]['id']>('curve');
	let livePaused = $state(false);
	let liveMorphed = $state(false);

	const livePathD = $derived(pathPresets.find((p) => p.id === livePath)?.d ?? pathPresets[0].d);

	const codeExplanation =
		'AnimatedText lays a repeated phrase along an SVG <textPath> and slides its startOffset one "cell" at a time, measured from the rendered text, so the loop never visibly jumps. A second layer holds the morph phrase on the same path and cross-fades in on hover, keyboard focus, tap, Enter or Space. The requestAnimationFrame loop only runs while the ribbon is on screen, unpaused and motion is allowed — under prefers-reduced-motion it stands still and the morph becomes an instant swap.';
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
		<div class="atx-demo">
			<section class="atx-section">
				<h4>Hover to reveal · default</h4>
				<p class="atx-hint">
					Mouse over it, or Tab to it with the keyboard — the ribbon cross-fades into its hidden
					phrase. On a phone, tap to toggle.
				</p>
				<div class="atx-stage">
					<AnimatedText
						originalText="STATIC DRIFT TRANSMIT RECEIVE"
						morphedText="SIGNAL FOUND — SAY HELLO"
						bind:morphed={heroMorphed}
					/>
				</div>
				<div class="atx-state" role="status" aria-live="polite">
					<span>Active:</span> <code>{heroMorphed ? 'morphed' : 'original'}</code>
				</div>
			</section>

			<section class="atx-section">
				<h4>Click to toggle · rightward drift</h4>
				<p class="atx-hint">
					<code>trigger="click"</code> ignores hover entirely — click, tap, Enter or Space flips it,
					Escape puts it back.
				</p>
				<div class="atx-stage">
					<AnimatedText
						originalText="NOW BOOKING SPRING TOURS"
						morphedText="TWELVE CITIES · ONE STAGE"
						trigger="click"
						direction="right"
						speed={45}
					/>
				</div>
			</section>

			<section class="atx-section">
				<h4>Custom paths · themed with CSS variables</h4>
				<p class="atx-hint">
					Any SVG path works. Both ribbons here retheme through the token API — no forked styles.
				</p>
				<div class="atx-stage atx-stage--grid">
					<AnimatedText
						class="atx-neon"
						originalText="AFTER HOURS"
						morphedText="DOORS AT TEN"
						path="M -300 200 C 100 20, 500 20, 900 200 S 1700 380, 2100 150"
						speed={20}
						height={180}
					/>
					<AnimatedText
						class="atx-paper"
						originalText="Fresh bread daily"
						morphedText="Sourdough at seven"
						path="M -300 150 L 2100 150"
						speed={60}
						repeat={6}
						height={120}
					/>
				</div>
			</section>

			<section class="atx-section">
				<h4>Decorative · driven from outside</h4>
				<p class="atx-hint">
					<code>trigger="none"</code> renders <code>role="img"</code>. Drive <code>morphed</code> and
					<code>paused</code> from your own controls.
				</p>
				<div class="atx-buttons">
					<button
						type="button"
						class="atx-pill"
						class:atx-pill--active={externalMorphed}
						aria-pressed={externalMorphed}
						onclick={() => (externalMorphed = !externalMorphed)}>Reveal phrase</button
					>
					<button
						type="button"
						class="atx-pill"
						class:atx-pill--active={externalPaused}
						aria-pressed={externalPaused}
						onclick={() => (externalPaused = !externalPaused)}>Pause drift</button
					>
				</div>
				<div class="atx-stage">
					<AnimatedText
						originalText="ORBIT · SIGNAL · RETURN"
						morphedText="HOUSTON, WE HEAR YOU"
						trigger="none"
						morphed={externalMorphed}
						paused={externalPaused}
						height={160}
					/>
				</div>
			</section>

			<section class="atx-section">
				<h4>Live playground</h4>
				<p class="atx-hint">Every control rebinds straight into the ribbon below.</p>
				<div class="atx-controls">
					<div class="atx-control">
						<span class="atx-label">Path</span>
						<div class="atx-buttons">
							{#each pathPresets as preset (preset.id)}
								<button
									type="button"
									class="atx-pill"
									class:atx-pill--active={livePath === preset.id}
									aria-pressed={livePath === preset.id}
									onclick={() => (livePath = preset.id)}>{preset.label}</button
								>
							{/each}
						</div>
					</div>
					<div class="atx-control">
						<span class="atx-label">Trigger</span>
						<div class="atx-buttons">
							{#each triggers as t (t)}
								<button
									type="button"
									class="atx-pill"
									class:atx-pill--active={liveTrigger === t}
									aria-pressed={liveTrigger === t}
									onclick={() => (liveTrigger = t)}>{t}</button
								>
							{/each}
						</div>
					</div>
					<div class="atx-control">
						<span class="atx-label">Direction</span>
						<div class="atx-buttons">
							{#each directions as d (d)}
								<button
									type="button"
									class="atx-pill"
									class:atx-pill--active={liveDirection === d}
									aria-pressed={liveDirection === d}
									onclick={() => (liveDirection = d)}>{d}</button
								>
							{/each}
						</div>
					</div>
					<div class="atx-control">
						<label class="atx-label" for="atx-speed">Speed <strong>{liveSpeed}</strong></label>
						<input id="atx-speed" type="range" min="0" max="120" step="5" bind:value={liveSpeed} />
					</div>
					<div class="atx-control">
						<label class="atx-label" for="atx-repeat">Repeat <strong>{liveRepeat}</strong></label>
						<input id="atx-repeat" type="range" min="1" max="8" step="1" bind:value={liveRepeat} />
					</div>
					<div class="atx-control">
						<label class="atx-label" for="atx-size">Font size <strong>{liveSize}px</strong></label>
						<input id="atx-size" type="range" min="12" max="40" step="1" bind:value={liveSize} />
					</div>
					<div class="atx-control">
						<label class="atx-label" for="atx-height">Height <strong>{liveHeight}px</strong></label>
						<input id="atx-height" type="range" min="100" max="320" step="10" bind:value={liveHeight} />
					</div>
					<div class="atx-control">
						<span class="atx-label">State</span>
						<div class="atx-buttons">
							<button
								type="button"
								class="atx-pill"
								class:atx-pill--active={livePaused}
								aria-pressed={livePaused}
								onclick={() => (livePaused = !livePaused)}>Paused</button
							>
							<button
								type="button"
								class="atx-pill"
								class:atx-pill--active={liveMorphed}
								aria-pressed={liveMorphed}
								onclick={() => (liveMorphed = !liveMorphed)}>Morphed</button
							>
						</div>
					</div>
				</div>
				<div class="atx-stage" style:--animated-text-size="{liveSize}px">
					<AnimatedText
						class="atx-live"
						originalText="TUNE EVERY PROP LIVE"
						morphedText="AND WATCH IT RESPOND"
						path={livePathD}
						trigger={liveTrigger}
						direction={liveDirection}
						speed={liveSpeed}
						repeat={liveRepeat}
						height={liveHeight}
						paused={livePaused}
						bind:morphed={liveMorphed}
					/>
				</div>
				<div class="atx-state">
					<span>Active:</span> <code>{liveMorphed ? 'morphed' : 'original'}</code> ·
					<code>trigger="{liveTrigger}"</code> · <code>direction="{liveDirection}"</code>
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
					<td><code>originalText</code></td>
					<td><code>string</code></td>
					<td>required</td>
					<td>Resting phrase laid along the path.</td>
				</tr>
				<tr>
					<td><code>morphedText</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Phrase revealed on trigger. Empty renders a non-interactive <code>role="img"</code>.</td>
				</tr>
				<tr>
					<td><code>morphed</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Bindable morph state.</td>
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
					<td><code>30</code></td>
					<td>Drift in SVG units per second. <code>0</code> holds still.</td>
				</tr>
				<tr>
					<td><code>direction</code></td>
					<td><code>'left' | 'right'</code></td>
					<td><code>'left'</code></td>
					<td>Which way the ribbon drifts.</td>
				</tr>
				<tr>
					<td><code>paused</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Freeze the drift without unmounting.</td>
				</tr>
				<tr>
					<td><code>repeat</code></td>
					<td><code>number</code></td>
					<td><code>4</code></td>
					<td>Copies of the phrase along the path — raise it for short phrases.</td>
				</tr>
				<tr>
					<td><code>path</code></td>
					<td><code>string</code></td>
					<td>S-curve</td>
					<td>SVG path <code>d</code> in a 1200×300 viewBox.</td>
				</tr>
				<tr>
					<td><code>height</code></td>
					<td><code>number</code></td>
					<td><code>200</code></td>
					<td>Container height in px.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td>both phrases</td>
					<td>Accessible name override.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.atx-demo {
		display: grid;
		gap: 28px;
	}
	.atx-section h4 {
		margin: 0 0 6px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.atx-hint {
		margin: 0 0 12px;
		font-size: 14px;
		color: var(--fg-2);
	}
	.atx-stage {
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.atx-stage--grid {
		display: grid;
		gap: 16px;
	}
	.atx-state {
		margin-top: 10px;
		padding: 10px 14px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		font-size: 13px;
		color: var(--fg-1);
	}
	.atx-state span {
		color: var(--fg-3);
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin-right: 6px;
	}
	.atx-controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 14px;
		padding: 16px;
		margin-bottom: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.atx-control {
		display: grid;
		gap: 8px;
		align-content: start;
	}
	.atx-control input[type='range'] {
		width: 100%;
	}
	.atx-label {
		font: 500 11px var(--font-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.atx-label strong {
		color: var(--fg-1);
		font-weight: 600;
		text-transform: none;
		letter-spacing: 0;
	}
	.atx-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 10px;
	}
	.atx-control .atx-buttons {
		margin-bottom: 0;
	}
	.atx-pill {
		padding: 6px 10px;
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--fg-2);
		border-radius: var(--r-1);
		font: 500 12px var(--font-sans);
		cursor: pointer;
	}
	.atx-pill:hover {
		color: var(--fg-1);
		border-color: var(--accent);
	}
	.atx-pill:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	.atx-pill--active {
		background: var(--accent);
		color: var(--accent-on, #fff);
		border-color: var(--accent);
	}

	/*
	 * Token overrides for the themed gallery. The doubled class lifts the
	 * selector above the component's own scoped `.at-root` rule — see
	 * docs/THEMING.md ("Why the doubled class").
	 */
	.atx-stage :global(.atx-neon.atx-neon) {
		--animated-text-bg: #0b0620;
		--animated-text-fg: #c4b5fd;
		--animated-text-accent: #f0abfc;
		--animated-text-font: 'Anton', 'Impact', sans-serif;
		--animated-text-size: 34px;
	}
	.atx-stage :global(.atx-paper.atx-paper) {
		--animated-text-bg: #fdf6e3;
		--animated-text-fg: #7c2d12;
		--animated-text-accent: #15803d;
		--animated-text-font: Georgia, 'Times New Roman', serif;
		--animated-text-size: 26px;
	}
	/* The playground forwards its font-size slider through the token. */
	.atx-stage :global(.atx-live.atx-live) {
		--animated-text-size: inherit;
	}
</style>
