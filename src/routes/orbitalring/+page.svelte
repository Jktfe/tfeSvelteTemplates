<!--
	OrbitalRing Demo Page (TFE shell)
-->

<script lang="ts">
	import OrbitalRing from '$lib/components/OrbitalRing.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/orbitalring')!;

	const planets = [
		{ id: 'mercury', name: 'Mercury', symbol: '☿', color: '#9ca3af' },
		{ id: 'venus', name: 'Venus', symbol: '♀', color: '#fcd34d' },
		{ id: 'earth', name: 'Earth', symbol: '⊕', color: '#3b82f6' },
		{ id: 'mars', name: 'Mars', symbol: '♂', color: '#ef4444' },
		{ id: 'jupiter', name: 'Jupiter', symbol: '♃', color: '#f59e0b' },
		{ id: 'saturn', name: 'Saturn', symbol: '♄', color: '#a855f7' }
	];

	const testimonials = [
		{ id: 1, name: 'Maya', role: 'Designer', quote: 'Felt like satellites round a sun.' },
		{ id: 2, name: 'Jonas', role: 'PM', quote: 'Ships in a single commit, lovely.' },
		{ id: 3, name: 'Priya', role: 'Eng Lead', quote: 'Pure CSS — copy-paste perfect.' },
		{ id: 4, name: 'Caleb', role: 'Founder', quote: 'A radial hero that just works.' }
	];

	let liveRadius = $state(180);
	let liveSpinMs = $state(20000);
	let liveDirection = $state<'clockwise' | 'counter-clockwise'>('clockwise');
	let liveCounterRotate = $state(true);
	let liveAutoSpin = $state(true);
	let livePauseOnHover = $state(true);

	const liveItems = [
		{ id: 1, emoji: '🪐' },
		{ id: 2, emoji: '✨' },
		{ id: 3, emoji: '🌙' },
		{ id: 4, emoji: '☄️' },
		{ id: 5, emoji: '🌟' }
	];

	const usageSnippet = `<script>
  import OrbitalRing from '$lib/components/OrbitalRing.svelte';
</${'script'}>

<OrbitalRing items={planets} radius={200} spinDurationMs={30000}>
  {#snippet center()}<div class="sun">☀</div>{/snippet}
  {#snippet item(p)}<div class="planet">{p.symbol}</div>{/snippet}
</OrbitalRing>`;

	const codeExplanation =
		'OrbitalRing distributes any list of items evenly around a circle and rotates the ring with a CSS animation. Each item can be drawn through a snippet, so you keep full control of the inner DOM. Counter-rotation keeps content upright in world frame; switch it off and items rotate with the ring (constellation-style).';
</script>

<svelte:head>
	<title>OrbitalRing — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Circular orbital layout with auto-rotation, counter-rotation, and snippet-driven contents."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'CSS-only', 'Snippets', 'Hover-pause']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="or-demo">
			<section class="or-section">
				<h3>Solar system — counter-rotated planets</h3>
				<div class="or-stage or-stage--space">
					<OrbitalRing items={planets} radius={200} spinDurationMs={30000} itemSize={72}>
						{#snippet center()}
							<div class="or-sun" aria-hidden="true">☀</div>
						{/snippet}
						{#snippet item(p)}
							<div class="or-planet" style:background={p.color} title={p.name}>
								<span>{p.symbol}</span>
							</div>
						{/snippet}
					</OrbitalRing>
				</div>
			</section>

			<section class="or-section">
				<h3>Testimonial orbit — slow counter-clockwise</h3>
				<div class="or-stage">
					<OrbitalRing
						items={testimonials}
						radius={210}
						spinDurationMs={60000}
						direction="counter-clockwise"
						itemSize={150}
					>
						{#snippet item(t)}
							<figure class="or-quote">
								<blockquote>"{t.quote}"</blockquote>
								<figcaption><strong>{t.name}</strong> · {t.role}</figcaption>
							</figure>
						{/snippet}
					</OrbitalRing>
				</div>
			</section>

			<section class="or-section">
				<h3>Live controls</h3>
				<div class="or-controls">
					<label>Radius <strong>{liveRadius}px</strong>
						<input type="range" min="60" max="280" step="10" bind:value={liveRadius} />
					</label>
					<label>Spin <strong>{(liveSpinMs / 1000).toFixed(1)}s</strong>
						<input type="range" min="2000" max="60000" step="500" bind:value={liveSpinMs} />
					</label>
					<label>Direction
						<select bind:value={liveDirection}>
							<option value="clockwise">Clockwise</option>
							<option value="counter-clockwise">Counter-clockwise</option>
						</select>
					</label>
					<label class="or-controls__check"><input type="checkbox" bind:checked={liveAutoSpin} /> Auto-spin</label>
					<label class="or-controls__check"><input type="checkbox" bind:checked={livePauseOnHover} /> Pause on hover</label>
					<label class="or-controls__check"><input type="checkbox" bind:checked={liveCounterRotate} /> World-upright items</label>
				</div>
				<div class="or-stage">
					<OrbitalRing
						items={liveItems}
						radius={liveRadius}
						spinDurationMs={liveSpinMs}
						direction={liveDirection}
						autoSpin={liveAutoSpin}
						pauseOnHover={livePauseOnHover}
						counterRotateItems={liveCounterRotate}
						itemSize={56}
					>
						{#snippet item(d)}
							<div class="or-emoji">{d.emoji}</div>
						{/snippet}
					</OrbitalRing>
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
					<td><code>items</code></td>
					<td><code>T[]</code></td>
					<td>—</td>
					<td>Items distributed evenly around the ring.</td>
				</tr>
				<tr>
					<td><code>radius</code></td>
					<td><code>number</code></td>
					<td><code>160</code></td>
					<td>Ring radius in pixels.</td>
				</tr>
				<tr>
					<td><code>itemSize</code></td>
					<td><code>number</code></td>
					<td><code>80</code></td>
					<td>Per-item size in pixels.</td>
				</tr>
				<tr>
					<td><code>spinDurationMs</code></td>
					<td><code>number</code></td>
					<td><code>20000</code></td>
					<td>Time for one full revolution.</td>
				</tr>
				<tr>
					<td><code>startAngleDeg</code></td>
					<td><code>number</code></td>
					<td><code>0</code></td>
					<td>Angle of the first item, measured from the top.</td>
				</tr>
				<tr>
					<td><code>direction</code></td>
					<td><code>'clockwise' | 'counter-clockwise'</code></td>
					<td><code>'clockwise'</code></td>
					<td>Spin direction.</td>
				</tr>
				<tr>
					<td><code>counterRotateItems</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Keep each item upright in world frame.</td>
				</tr>
				<tr>
					<td><code>autoSpin</code> / <code>pauseOnHover</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Toggle auto-rotation and hover pause.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.or-demo {
		display: grid;
		gap: 24px;
	}
	.or-section {
		display: grid;
		gap: 10px;
	}
	.or-section h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.or-stage {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 480px;
		padding: 32px 16px;
		border-radius: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.or-stage--space {
		background: radial-gradient(circle at 50% 50%, #1e1b4b, #020617);
		min-height: 520px;
	}

	.or-sun {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #fde68a, #f59e0b 60%, #b45309);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28px;
		color: #78350f;
		box-shadow: 0 0 40px 10px rgba(251, 191, 36, 0.5);
	}
	.or-planet {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #0f172a;
		font-weight: 700;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
		font-size: 24px;
	}

	.or-quote {
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 14px;
		margin: 0;
		text-align: center;
	}
	.or-quote blockquote {
		margin: 0 0 6px;
		font-style: italic;
		font-size: 13px;
		color: var(--fg-1);
		line-height: 1.4;
	}
	.or-quote figcaption {
		font-size: 11px;
		color: var(--fg-3);
	}

	.or-emoji {
		font-size: 28px;
	}

	.or-controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 12px;
		padding: 18px;
		border-radius: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.or-controls label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 12px;
		color: var(--fg-2);
	}
	.or-controls label.or-controls__check {
		flex-direction: row;
		align-items: center;
		gap: 8px;
	}
	.or-controls input[type='range'],
	.or-controls select {
		width: 100%;
	}
</style>
