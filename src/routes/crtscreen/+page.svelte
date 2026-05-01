<script lang="ts">
	import CRTScreen from '$lib/components/CRTScreen.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/crtscreen')!;

	let density = $state(3);
	let aberration = $state(1);
	let rollOn = $state(true);
	let rollSpeed = $state(4);
	let curved = $state(true);

	const usageSnippet = `<script>
  import CRTScreen from '$lib/components/CRTScreen.svelte';
<\/script>

<CRTScreen profile="amber" density={3} aberration={1} curved>
  <pre>&gt; BOOT v3.14
&gt; SYSTEM READY
  </pre>
</CRTScreen>`;

	const codeExplanation =
		'CRTScreen wraps any content in a CRT frame. Scanlines come from a single repeating-linear-gradient under mix-blend-mode: multiply; chromatic aberration is a two-stop text-shadow on the slot; tracking roll is one keyframe drifting a soft band top to bottom; vignette is a corner-darkening radial-gradient. Four named profiles (amber, green, broadcast, modern) preset every colour together. Reduced motion strips the roll and the channel-split shadow.';
</script>

<svelte:head>
	<title>CRTScreen — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Retro CRT-monitor frame for arbitrary content. Scanlines, chromatic aberration, optional roll, four named profiles."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'CSS-only', 'Retro', 'Reduced-motion safe']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="cs-stack">
			<!-- Dark stages are deliberate demo content — CRT looks need a dark room. -->
			<div class="cs-brick">
				<CRTScreen profile="amber" density={3} aberration={1} curved>
					<div class="cs-terminal">
						<p>&gt; BOOT v3.14 …</p>
						<p>&gt; LOADING SECTOR 0x1A — OK</p>
						<p>&gt; LOADING SECTOR 0x1B — OK</p>
						<p>&gt; SYSTEM READY ▌</p>
					</div>
				</CRTScreen>
			</div>

			<div class="cs-brick">
				<CRTScreen profile="green" density={2} aberration={0.6} roll={4}>
					<div class="cs-phosphor">
						<h3>SYS::HEALTH</h3>
						<dl>
							<dt>cpu</dt><dd>42%</dd>
							<dt>mem</dt><dd>1.8 GB / 8 GB</dd>
							<dt>net</dt><dd>OK · 14ms</dd>
							<dt>disk</dt><dd>312 GB / 1 TB</dd>
						</dl>
					</div>
				</CRTScreen>
			</div>

			<div class="cs-brick">
				<CRTScreen profile="broadcast" density={4} aberration={1.5} curved>
					<div class="cs-broadcast">
						<span class="cs-tag">BREAKING</span>
						<h3>Markets close higher on tech rally</h3>
						<p>FTSE 100 +1.2% · S&amp;P 500 +0.9% · Nasdaq +1.4%</p>
					</div>
				</CRTScreen>
			</div>

			<div class="cs-brick cs-brick--stacked">
				<CRTScreen
					profile="amber"
					{density}
					{aberration}
					roll={rollOn ? rollSpeed : false}
					{curved}
				>
					<div class="cs-controls-content">
						<h3>LIVE FEED</h3>
						<p>density {density}px · aberration {aberration.toFixed(1)}px</p>
						<p>roll {rollOn ? `speed ${rollSpeed}` : 'off'} · curved {curved ? 'on' : 'off'}</p>
					</div>
				</CRTScreen>

				<div class="cs-controls">
					<label class="cs-slider">
						<span>density</span>
						<input type="range" min="1" max="8" step="1" bind:value={density} />
						<span class="cs-slider__value">{density}px</span>
					</label>
					<label class="cs-slider">
						<span>aberration</span>
						<input type="range" min="0" max="3" step="0.1" bind:value={aberration} />
						<span class="cs-slider__value">{aberration.toFixed(1)}px</span>
					</label>
					<label class="cs-slider">
						<span>roll speed</span>
						<input
							type="range"
							min="1"
							max="10"
							step="1"
							bind:value={rollSpeed}
							disabled={!rollOn}
						/>
						<span class="cs-slider__value">{rollSpeed}</span>
					</label>
					<div class="cs-toggles">
						<label class="cs-toggle">
							<input type="checkbox" bind:checked={rollOn} /> roll
						</label>
						<label class="cs-toggle">
							<input type="checkbox" bind:checked={curved} /> curved
						</label>
					</div>
				</div>
			</div>
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
					<td><code>profile</code></td>
					<td><code>'amber' | 'green' | 'broadcast' | 'modern'</code></td>
					<td><code>'amber'</code></td>
					<td>Bundles foreground, background, scan alpha, and channel-split colours.</td>
				</tr>
				<tr>
					<td><code>density</code></td>
					<td><code>number</code></td>
					<td><code>3</code></td>
					<td>Scanline cycle height in pixels.</td>
				</tr>
				<tr>
					<td><code>intensity</code></td>
					<td><code>number</code></td>
					<td><code>1</code></td>
					<td>Scanline opacity multiplier.</td>
				</tr>
				<tr>
					<td><code>aberration</code></td>
					<td><code>number</code></td>
					<td><code>1</code></td>
					<td>Channel-split offset in pixels.</td>
				</tr>
				<tr>
					<td><code>roll</code></td>
					<td><code>boolean | number</code></td>
					<td><code>false</code></td>
					<td>True / number enables the tracking-roll keyframe; the number is its speed.</td>
				</tr>
				<tr>
					<td><code>vignette</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Corner-darkening radial overlay.</td>
				</tr>
				<tr>
					<td><code>curved</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Apply a slight CSS curve to fake a CRT bulb.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.cs-stack {
		display: grid;
		gap: 1rem;
	}
	/* Dark stages are deliberate demo content — CRTs are seen in dark rooms. */
	.cs-brick {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		gap: 1.5rem;
		padding: 2rem 1.5rem;
		background: radial-gradient(ellipse at 50% 100%, rgba(15, 23, 42, 0.8) 0%, #050409 70%);
		border-radius: var(--r-2);
		border: 1px solid rgba(255, 255, 255, 0.04);
	}
	.cs-brick--stacked {
		flex-direction: column;
		gap: 1.25rem;
	}
	.cs-terminal {
		font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.95rem;
		line-height: 1.6;
		min-width: 20rem;
	}
	.cs-terminal p {
		margin: 0;
	}
	.cs-phosphor {
		min-width: 20rem;
		font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
	}
	.cs-phosphor h3 {
		margin: 0 0 0.6rem;
		font-size: 0.9rem;
		letter-spacing: 0.08em;
	}
	.cs-phosphor dl {
		margin: 0;
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.25rem 1.25rem;
		font-size: 0.9rem;
	}
	.cs-phosphor dt {
		opacity: 0.75;
	}
	.cs-phosphor dd {
		margin: 0;
	}
	.cs-broadcast {
		min-width: 22rem;
		font-family: 'Helvetica Neue', Arial, sans-serif;
	}
	.cs-tag {
		display: inline-block;
		font-weight: 700;
		letter-spacing: 0.16em;
		font-size: 0.7rem;
		padding: 0.25rem 0.6rem;
		background: #c0392b;
		color: #fff;
		border-radius: 0.15rem;
		margin-bottom: 0.5rem;
	}
	.cs-broadcast h3 {
		margin: 0 0 0.4rem;
		font-size: 1.2rem;
		font-weight: 700;
	}
	.cs-broadcast p {
		margin: 0;
		font-size: 0.9rem;
		opacity: 0.85;
	}
	.cs-controls-content {
		min-width: 20rem;
		font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
	}
	.cs-controls-content h3 {
		margin: 0 0 0.4rem;
		font-size: 0.9rem;
		letter-spacing: 0.08em;
	}
	.cs-controls-content p {
		margin: 0.15rem 0;
		font-size: 0.85rem;
	}
	.cs-controls {
		display: grid;
		gap: 0.6rem;
		width: 100%;
		max-width: 28rem;
		padding: 0.9rem 1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.cs-slider {
		display: grid;
		grid-template-columns: 6rem 1fr 4rem;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.8rem;
		color: var(--fg-2);
	}
	.cs-slider input[type='range'] {
		width: 100%;
	}
	.cs-slider__value {
		text-align: right;
		font-variant-numeric: tabular-nums;
		color: var(--fg-1);
	}
	.cs-toggles {
		display: flex;
		gap: 1.25rem;
		font-size: 0.8rem;
		color: var(--fg-2);
	}
	.cs-toggle {
		display: inline-flex;
		gap: 0.4rem;
		align-items: center;
		cursor: pointer;
	}
</style>
