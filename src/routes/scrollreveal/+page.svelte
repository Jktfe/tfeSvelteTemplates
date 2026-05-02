<!--
	ScrollReveal Demo Page (TFE shell)
-->

<script lang="ts">
	import ScrollReveal from '$lib/components/ScrollReveal.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/scrollreveal')!;

	const cards = [
		{ title: 'Aurora', body: 'Conic ribbons drift through gradient space.' },
		{ title: 'Cardwall', body: 'A perspective billboard of pinned tiles.' },
		{ title: 'ClickSpark', body: 'Wrap-anything click-burst confetti.' },
		{ title: 'RippleGrid', body: 'A grid where clicks become waves.' },
		{ title: 'SplitFlap', body: 'Mechanical Solari-board character flips.' },
		{ title: 'Marquee', body: 'Seamless infinite scroll, pause-on-hover.' }
	];

	const features = [
		{ heading: 'IntersectionObserver-powered', detail: 'Compositor-side trigger, no scroll listeners.' },
		{ heading: 'Per-child stagger', detail: 'Per-index delay written once into a CSS variable.' },
		{ heading: 'One-shot or replay', detail: 'Reveal once, or re-hide on exit for hero sections.' },
		{ heading: 'Reduced-motion safe', detail: 'Children appear instantly via duration: 0.' }
	];

	const grid = Array.from({ length: 12 }, (_, i) => ({
		i,
		direction: (['up', 'down', 'left', 'right', 'scale', 'rotate'] as const)[i % 6]
	}));

	// ----------------------------------------------------------------------
	// Live playground state — visitors tweak these and the playground row
	// re-instantiates with a fresh `key` so each change replays the reveal.
	// `replayKey` is incremented manually because IntersectionObserver-based
	// reveal can only trigger once unless we re-mount or set replay=true.
	// ----------------------------------------------------------------------
	type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'rotate';
	let liveDirection = $state<Direction>('up');
	let liveDistance = $state(40);
	let liveDuration = $state(700);
	let liveStagger = $state(120);
	let liveReplay = $state(true);
	let replayKey = $state(0);

	const directions: { id: Direction; label: string }[] = [
		{ id: 'up', label: 'Up' },
		{ id: 'down', label: 'Down' },
		{ id: 'left', label: 'Left' },
		{ id: 'right', label: 'Right' },
		{ id: 'scale', label: 'Scale' },
		{ id: 'rotate', label: 'Rotate' }
	];

	const playgroundTiles = ['Tile A', 'Tile B', 'Tile C', 'Tile D', 'Tile E', 'Tile F'];

	function replay() {
		// Bump the keyed wrapper so ScrollReveal teardown + remount fires —
		// the simplest way to retrigger a one-shot reveal.
		replayKey += 1;
	}

	const usageSnippet = `<script>
  import ScrollReveal from '$lib/components/ScrollReveal.svelte';
</${'script'}>

<ScrollReveal direction="up" stagger={120} duration={650}>
  {#each items as item}
    <Card {item} />
  {/each}
</ScrollReveal>`;

	const codeExplanation =
		'ScrollReveal is one IntersectionObserver wrapping the children you pass. Each direct child receives a CSS-variable-driven delay so reveals cascade without per-frame JavaScript. Direction, distance, duration, and replay are all overridable per call site.';
</script>

<svelte:head>
	<title>ScrollReveal — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Viewport-entry stagger reveal primitive. Six directions, replay-on-leave option, reduced-motion safe."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'IntersectionObserver', 'Reduced-motion safe', 'Zero deps']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="sr-demo">
			<section class="sr-section">
				<h3>1. Default fade-up cascade</h3>
				<div class="sr-stage">
					<ScrollReveal class="sr-cards">
						{#each cards as card (card.title)}
							<article class="sr-card-tile">
								<h4>{card.title}</h4>
								<p>{card.body}</p>
							</article>
						{/each}
					</ScrollReveal>
				</div>
			</section>

			<section class="sr-section">
				<h3>2. Slide from left, longer distance</h3>
				<div class="sr-stage">
					<ScrollReveal class="sr-feature-stack" direction="left" distance={64} stagger={140} duration={750}>
						{#each features as f (f.heading)}
							<div class="sr-feature-row">
								<h4>{f.heading}</h4>
								<p>{f.detail}</p>
							</div>
						{/each}
					</ScrollReveal>
				</div>
			</section>

			<section class="sr-section">
				<h3>3. Per-tile direction grid</h3>
				<div class="sr-stage">
					<div class="sr-scatter">
						{#each grid as tile (tile.i)}
							<ScrollReveal direction={tile.direction} distance={40} stagger={0} duration={600}>
								<div class="sr-scatter-tile">{tile.i + 1}</div>
							</ScrollReveal>
						{/each}
					</div>
				</div>
			</section>

			<!-- 4. Live playground.
			     Every control rebinds straight into the ScrollReveal instance
			     in the stage below. Press Replay to remount and re-trigger the
			     entrance — the simplest way to demo direction/distance changes
			     without scrolling away and back. -->
			<section class="sr-section">
				<h3>4. Live playground — tune every prop in real time</h3>

				<div class="sr-controls">
					<div class="sr-control">
						<span class="sr-control__label">Direction</span>
						<div class="sr-buttons">
							{#each directions as opt (opt.id)}
								<button
									type="button"
									class="sr-pill"
									class:sr-pill--active={liveDirection === opt.id}
									onclick={() => (liveDirection = opt.id)}
								>{opt.label}</button>
							{/each}
						</div>
					</div>

					<div class="sr-control">
						<span class="sr-control__label">Distance <strong>{liveDistance}{liveDirection === 'rotate' ? '°' : 'px'}</strong></span>
						<input type="range" min="0" max="120" step="4" bind:value={liveDistance} aria-label="Reveal distance" />
					</div>

					<div class="sr-control">
						<span class="sr-control__label">Duration <strong>{liveDuration}ms</strong></span>
						<input type="range" min="100" max="1500" step="50" bind:value={liveDuration} aria-label="Reveal duration" />
					</div>

					<div class="sr-control">
						<span class="sr-control__label">Stagger <strong>{liveStagger}ms</strong></span>
						<input type="range" min="0" max="300" step="10" bind:value={liveStagger} aria-label="Per-child stagger" />
					</div>

					<div class="sr-control">
						<span class="sr-control__label">Replay on exit</span>
						<div class="sr-buttons">
							<button
								type="button"
								class="sr-pill"
								class:sr-pill--active={liveReplay}
								onclick={() => (liveReplay = true)}
							>On</button>
							<button
								type="button"
								class="sr-pill"
								class:sr-pill--active={!liveReplay}
								onclick={() => (liveReplay = false)}
							>One-shot</button>
						</div>
					</div>

					<div class="sr-control">
						<span class="sr-control__label">Trigger</span>
						<button class="sr-replay" type="button" onclick={replay}>Replay</button>
					</div>
				</div>

				<div class="sr-stage">
					{#key replayKey}
						<ScrollReveal
							class="sr-cards"
							direction={liveDirection}
							distance={liveDistance}
							duration={liveDuration}
							stagger={liveStagger}
							replay={liveReplay}
						>
							{#each playgroundTiles as title (title)}
								<article class="sr-card-tile">
									<h4>{title}</h4>
									<p>direction={liveDirection}, distance={liveDistance}, stagger={liveStagger}ms</p>
								</article>
							{/each}
						</ScrollReveal>
					{/key}
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
					<td><code>direction</code></td>
					<td><code>'up' | 'down' | 'left' | 'right' | 'scale' | 'rotate'</code></td>
					<td><code>'up'</code></td>
					<td>Which axis / transform the children reveal from.</td>
				</tr>
				<tr>
					<td><code>distance</code></td>
					<td><code>number</code></td>
					<td><code>32</code></td>
					<td>Pixels (or rotation degrees) the children travel during reveal.</td>
				</tr>
				<tr>
					<td><code>duration</code></td>
					<td><code>number</code></td>
					<td><code>700</code></td>
					<td>Per-child transition duration (ms).</td>
				</tr>
				<tr>
					<td><code>stagger</code></td>
					<td><code>number</code></td>
					<td><code>80</code></td>
					<td>Delay added per index (ms).</td>
				</tr>
				<tr>
					<td><code>replay</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Re-hide on exit so a re-scroll re-animates.</td>
				</tr>
				<tr>
					<td><code>threshold</code></td>
					<td><code>number</code></td>
					<td><code>0.15</code></td>
					<td>IntersectionObserver visibility ratio that triggers the reveal.</td>
				</tr>
				<tr>
					<td><code>rootMargin</code></td>
					<td><code>string</code></td>
					<td><code>'0px'</code></td>
					<td>IntersectionObserver root margin — push triggers earlier or later.</td>
				</tr>
				<tr>
					<td><code>intensity</code></td>
					<td><code>number</code></td>
					<td><code>1</code></td>
					<td>Multiplier applied to <code>distance</code> for fine-tuning the travel.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.sr-demo {
		display: grid;
		gap: 24px;
	}
	.sr-section {
		display: grid;
		gap: 10px;
	}
	.sr-section h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.sr-stage {
		padding: 24px;
		border-radius: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
	}

	:global(.sr-cards) {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 12px;
	}
	.sr-card-tile {
		padding: 14px;
		border-radius: 10px;
		background: var(--surface-2);
		border: 1px solid var(--border);
	}
	.sr-card-tile h4 {
		margin: 0 0 4px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 16px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.sr-card-tile p {
		margin: 0;
		font-size: 13px;
		color: var(--fg-2);
		line-height: 1.5;
	}

	:global(.sr-feature-stack) {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.sr-feature-row {
		padding: 14px 16px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-left: 3px solid var(--accent);
		border-radius: 0 10px 10px 0;
	}
	.sr-feature-row h4 {
		margin: 0 0 4px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 14px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.sr-feature-row p {
		margin: 0;
		font-size: 13px;
		color: var(--fg-2);
		line-height: 1.5;
	}

	.sr-scatter {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
	}
	.sr-scatter-tile {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		font-weight: 700;
		color: var(--accent);
		background: var(--surface-2);
		border-radius: 8px;
		border: 1px solid var(--border);
	}

	.sr-controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 14px;
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		margin-bottom: 12px;
	}
	.sr-control {
		display: grid;
		gap: 8px;
	}
	.sr-control__label {
		font: 500 11px var(--font-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.sr-control__label strong {
		color: var(--fg-1);
		font-weight: 600;
		text-transform: none;
		letter-spacing: 0;
		font-family: var(--font-mono);
		font-size: 12px;
	}
	.sr-control input[type='range'] {
		width: 100%;
	}
	.sr-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.sr-pill {
		padding: 6px 10px;
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--fg-2);
		border-radius: var(--r-1);
		font: 500 12px var(--font-sans);
		cursor: pointer;
	}
	.sr-pill:hover {
		color: var(--fg-1);
		border-color: var(--accent);
	}
	.sr-pill--active {
		background: var(--accent);
		color: var(--accent-on, #fff);
		border-color: var(--accent);
	}
	.sr-replay {
		padding: 8px 12px;
		background: var(--accent);
		color: var(--accent-on, #fff);
		border: 1px solid var(--accent);
		border-radius: var(--r-1);
		font: 600 13px var(--font-sans);
		cursor: pointer;
	}
	.sr-replay:hover {
		filter: brightness(1.05);
	}
</style>
