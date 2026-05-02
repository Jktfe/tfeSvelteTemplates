<!--
	ClickSpark Demo Page (TFE shell)
-->

<script lang="ts">
	import ClickSpark from '$lib/components/ClickSpark.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/clickspark')!;

	let primaryClicks = $state(0);
	let likeCount = $state(48);
	let liked = $state(false);

	function handleLike() {
		liked = !liked;
		likeCount += liked ? 1 : -1;
	}

	// ----------------------------------------------------------------------
	// Live playground state. The ClickSpark wrapper around the playground
	// button reads each rune below and reconfigures its burst on the fly —
	// every click after a control change immediately reflects the new prop.
	// ----------------------------------------------------------------------
	type Shape = 'dot' | 'plus' | 'line' | 'star';
	let liveShape = $state<Shape>('star');
	let liveColor = $state('#fbbf24');
	let liveCount = $state(8);
	let liveSize = $state(10);
	let liveSpread = $state(60);
	let liveDuration = $state(500);
	let livePlaygroundClicks = $state(0);

	const shapes: { id: Shape; label: string }[] = [
		{ id: 'dot', label: 'Dot' },
		{ id: 'plus', label: 'Plus' },
		{ id: 'line', label: 'Line' },
		{ id: 'star', label: 'Star' }
	];

	const colorPresets: { hex: string; name: string }[] = [
		{ hex: '#fbbf24', name: 'Amber' },
		{ hex: '#f43f5e', name: 'Rose' },
		{ hex: '#22d3ee', name: 'Cyan' },
		{ hex: '#a855f7', name: 'Violet' },
		{ hex: '#10b981', name: 'Emerald' },
		{ hex: '#ffffff', name: 'White' }
	];

	const usageSnippet = `<script>
  import ClickSpark from '$lib/components/ClickSpark.svelte';
</${'script'}>

<ClickSpark sparkColor="#fbbf24" sparkCount={12} shape="star">
  <button>Try the demo</button>
</ClickSpark>`;

	const codeExplanation =
		'ClickSpark is a wrap-anything decoration. Each click spawns an independent burst of CSS-keyframed particles that origin from the actual click point — never the wrapper centre — so the burst feels tied to the gesture. Bursts self-clean on animation end, and reduced-motion users get the click semantics with no particles at all.';
</script>

<svelte:head>
	<title>ClickSpark — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Wrap any element to spray a configurable particle burst on click. Pure CSS, four shapes."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Click', 'CSS-only', 'Reduced-motion safe']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="cs-demo">
			<section class="cs-section">
				<h3>Default — try it</h3>
				<div class="cs-stage cs-stage--centered">
					<ClickSpark>
						<button class="cs-cta cs-cta--primary" onclick={() => primaryClicks++}>
							Click me · {primaryClicks}
						</button>
					</ClickSpark>
				</div>
			</section>

			<section class="cs-section">
				<h3>Four spark shapes</h3>
				<div class="cs-stage cs-stage--row">
					<ClickSpark sparkColor="#ffffff" shape="dot">
						<button class="cs-cta cs-cta--dark">dot</button>
					</ClickSpark>
					<ClickSpark sparkColor="#22d3ee" shape="plus" sparkCount={10}>
						<button class="cs-cta cs-cta--dark">plus</button>
					</ClickSpark>
					<ClickSpark sparkColor="#f97316" shape="line" sparkCount={12} sparkSize={14}>
						<button class="cs-cta cs-cta--dark">line</button>
					</ClickSpark>
					<ClickSpark sparkColor="#fbbf24" shape="star" sparkCount={6} sparkSize={14}>
						<button class="cs-cta cs-cta--dark">star</button>
					</ClickSpark>
				</div>
			</section>

			<section class="cs-section">
				<h3>Like — composes with stateful UI</h3>
				<div class="cs-stage cs-stage--centered">
					<ClickSpark
						sparkColor="#f43f5e"
						shape="star"
						sparkCount={10}
						spreadRadius={70}
						duration={650}
					>
						<button class="cs-like" class:liked onclick={handleLike} aria-pressed={liked}>
							<span class="cs-like__heart" aria-hidden="true">{liked ? '♥' : '♡'}</span>
							<span>{likeCount}</span>
						</button>
					</ClickSpark>
				</div>
			</section>

			<!-- Live playground.
			     Every control rebinds straight into the ClickSpark wrapping the
			     button below. Clicking the button after each tweak shows the
			     new burst — no page reload, no remount needed. -->
			<section class="cs-section">
				<h3>Live playground — tune every prop in real time</h3>

				<div class="cs-controls">
					<div class="cs-control">
						<span class="cs-control__label">Shape</span>
						<div class="cs-buttons">
							{#each shapes as opt (opt.id)}
								<button
									type="button"
									class="cs-pill"
									class:cs-pill--active={liveShape === opt.id}
									onclick={() => (liveShape = opt.id)}
								>{opt.label}</button>
							{/each}
						</div>
					</div>

					<div class="cs-control">
						<span class="cs-control__label">Colour</span>
						<div class="cs-swatches">
							{#each colorPresets as preset (preset.hex)}
								<button
									type="button"
									class="cs-swatch"
									class:cs-swatch--active={liveColor === preset.hex}
									style:background={preset.hex}
									title={preset.name}
									aria-label={`Use ${preset.name}`}
									onclick={() => (liveColor = preset.hex)}
								></button>
							{/each}
						</div>
					</div>

					<div class="cs-control">
						<span class="cs-control__label">Count <strong>{liveCount}</strong></span>
						<input type="range" min="2" max="24" step="1" bind:value={liveCount} aria-label="Spark count" />
					</div>

					<div class="cs-control">
						<span class="cs-control__label">Size <strong>{liveSize}px</strong></span>
						<input type="range" min="2" max="24" step="1" bind:value={liveSize} aria-label="Spark size" />
					</div>

					<div class="cs-control">
						<span class="cs-control__label">Spread <strong>{liveSpread}px</strong></span>
						<input type="range" min="20" max="160" step="5" bind:value={liveSpread} aria-label="Spread radius" />
					</div>

					<div class="cs-control">
						<span class="cs-control__label">Duration <strong>{liveDuration}ms</strong></span>
						<input type="range" min="200" max="1500" step="50" bind:value={liveDuration} aria-label="Burst duration" />
					</div>
				</div>

				<div class="cs-stage cs-stage--centered cs-stage--dark">
					<ClickSpark
						sparkColor={liveColor}
						shape={liveShape}
						sparkCount={liveCount}
						sparkSize={liveSize}
						spreadRadius={liveSpread}
						duration={liveDuration}
					>
						<button
							class="cs-cta cs-cta--primary"
							type="button"
							onclick={() => livePlaygroundClicks++}
						>Click anywhere on the button · {livePlaygroundClicks}</button>
					</ClickSpark>
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
					<td><code>sparkColor</code></td>
					<td><code>string</code></td>
					<td><code>'#ffffff'</code></td>
					<td>Hex / RGB colour for each particle.</td>
				</tr>
				<tr>
					<td><code>shape</code></td>
					<td><code>'dot' | 'plus' | 'line' | 'star'</code></td>
					<td><code>'dot'</code></td>
					<td>Particle shape rendered via pure CSS.</td>
				</tr>
				<tr>
					<td><code>sparkCount</code></td>
					<td><code>number</code></td>
					<td><code>8</code></td>
					<td>Number of particles per burst.</td>
				</tr>
				<tr>
					<td><code>sparkSize</code></td>
					<td><code>number</code></td>
					<td><code>10</code></td>
					<td>Base particle size in pixels.</td>
				</tr>
				<tr>
					<td><code>spreadRadius</code></td>
					<td><code>number</code></td>
					<td><code>60</code></td>
					<td>Distance particles travel from origin.</td>
				</tr>
				<tr>
					<td><code>duration</code></td>
					<td><code>number</code></td>
					<td><code>500</code></td>
					<td>Burst lifetime in milliseconds.</td>
				</tr>
				<tr>
					<td><code>easing</code></td>
					<td><code>string</code></td>
					<td><code>'cubic-bezier(0.25, 1, 0.5, 1)'</code></td>
					<td>CSS easing curve applied to each particle's flight.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.cs-demo {
		display: grid;
		gap: 20px;
	}
	.cs-section {
		display: grid;
		gap: 10px;
	}
	.cs-section h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.cs-stage {
		padding: 24px;
		border-radius: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.cs-stage--centered {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 120px;
	}
	.cs-stage--row {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		justify-content: center;
		align-items: center;
		min-height: 120px;
	}

	.cs-cta {
		padding: 10px 20px;
		font-size: 14px;
		font-weight: 500;
		border-radius: 8px;
		cursor: pointer;
		border: 1px solid transparent;
		transition: transform 120ms ease, background 120ms ease;
	}
	.cs-cta:active {
		transform: scale(0.97);
	}
	.cs-cta--primary {
		background: var(--accent);
		color: var(--accent-on);
		border-color: var(--accent-strong);
	}
	.cs-cta--primary:hover {
		background: var(--accent-strong);
	}
	.cs-cta--dark {
		background: #1e293b;
		color: white;
		border-color: #0f172a;
		min-width: 80px;
	}
	.cs-cta--dark:hover {
		background: #0f172a;
	}

	.cs-like {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		font-size: 16px;
		font-weight: 500;
		background: var(--surface-2);
		color: var(--fg-2);
		border: 1px solid var(--border-strong);
		border-radius: 999px;
		cursor: pointer;
		transition: color 200ms ease, background 200ms ease, border-color 200ms ease;
	}
	.cs-like__heart {
		font-size: 20px;
		line-height: 1;
	}
	.cs-like:hover {
		color: #f43f5e;
		border-color: #fecdd3;
	}
	.cs-like.liked {
		color: #f43f5e;
		background: #fff1f2;
		border-color: #fecdd3;
	}

	.cs-stage--dark {
		background: #0f172a;
		border-color: #1e293b;
	}
	.cs-controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 14px;
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		margin-bottom: 12px;
	}
	.cs-control {
		display: grid;
		gap: 8px;
	}
	.cs-control__label {
		font: 500 11px var(--font-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.cs-control__label strong {
		color: var(--fg-1);
		font-weight: 600;
		text-transform: none;
		letter-spacing: 0;
		font-family: var(--font-mono);
		font-size: 12px;
	}
	.cs-control input[type='range'] {
		width: 100%;
	}
	.cs-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.cs-pill {
		padding: 6px 10px;
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--fg-2);
		border-radius: var(--r-1);
		font: 500 12px var(--font-sans);
		cursor: pointer;
	}
	.cs-pill:hover {
		color: var(--fg-1);
		border-color: var(--accent);
	}
	.cs-pill--active {
		background: var(--accent);
		color: var(--accent-on, #fff);
		border-color: var(--accent);
	}
	.cs-swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.cs-swatch {
		width: 24px;
		height: 24px;
		padding: 0;
		border: 2px solid var(--border);
		border-radius: 999px;
		cursor: pointer;
		transition: transform 120ms ease, box-shadow 120ms ease;
	}
	.cs-swatch:hover {
		transform: scale(1.08);
	}
	.cs-swatch--active {
		border-color: var(--fg-1);
		box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--fg-1);
	}
</style>
