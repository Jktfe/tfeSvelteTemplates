<!--
	EqualizerBars Demo Page (TFE shell)
-->

<script lang="ts">
	import EqualizerBars from '$lib/components/EqualizerBars.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/equalizerbars')!;

	const usageSnippet = `<script>
  import EqualizerBars from '$lib/components/EqualizerBars.svelte';
</${'script'}>

<EqualizerBars variant="equalizer" bars={16} height={96} color="#38bdf8" />`;

	const codeExplanation =
		'EqualizerBars draws N vertical bars and animates each with a CSS keyframe at a phase-shifted negative animation-delay. The visible wave is an illusion built from N independent CSS clocks — no JS clock, no rAF. Variants swap the keyframe shape (sine, peak-biased, binary, double-spike). Inactive mode freezes the bars at deterministic seeded heights for SSR-stable empty states.';
</script>

<svelte:head>
	<title>EqualizerBars — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Compact 'things are alive' indicator. Four variants, four sizes, fully decorative."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'CSS-only', 'Decorative', 'Reduced-motion safe']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="eq-demo">
			<section class="eq-section">
				<h3>Four variants</h3>
				<div class="eq-grid">
					<div class="eq-card">
						<div class="eq-vis"><EqualizerBars variant="equalizer" bars={16} height={96} color="#38bdf8" /></div>
						<h4>equalizer</h4>
						<p>Smooth sine — classic music meter.</p>
					</div>
					<div class="eq-card">
						<div class="eq-vis"><EqualizerBars variant="spectrum" bars={16} height={96} color="#a78bfa" /></div>
						<h4>spectrum</h4>
						<p>Peak-biased FFT shape.</p>
					</div>
					<div class="eq-card">
						<div class="eq-vis"><EqualizerBars variant="pulse" bars={16} height={96} color="#10b981" /></div>
						<h4>pulse</h4>
						<p>Binary high/low — heartbeat cadence.</p>
					</div>
					<div class="eq-card">
						<div class="eq-vis"><EqualizerBars variant="heartbeat" bars={16} height={96} color="#ff3a6e" /></div>
						<h4>heartbeat</h4>
						<p>Sparse double-spike with long tail.</p>
					</div>
				</div>
			</section>

			<section class="eq-section">
				<h3>Live status badges</h3>
				<div class="eq-badges">
					<div class="eq-badge">
						<span style="color: #10b981; display: inline-flex;">
							<EqualizerBars variant="pulse" bars={4} height={16} speed={1.4} color="auto" />
						</span>
						<span>LIVE — Operations dashboard</span>
					</div>
					<div class="eq-badge">
						<span style="color: #38bdf8; display: inline-flex;">
							<EqualizerBars variant="equalizer" bars={5} height={16} speed={1.6} color="auto" />
						</span>
						<span>Agent thinking</span>
					</div>
				</div>
			</section>

			<section class="eq-section">
				<h3>Inactive — seeded silhouette</h3>
				<div class="eq-grid">
					<div class="eq-card">
						<EqualizerBars active={false} bars={24} height={80} seed={1} color="#64748b" />
						<h4>seed = 1</h4>
					</div>
					<div class="eq-card">
						<EqualizerBars active={false} bars={24} height={80} seed={42} color="#64748b" />
						<h4>seed = 42</h4>
					</div>
					<div class="eq-card">
						<EqualizerBars active={false} bars={24} height={80} seed={1337} color="#64748b" />
						<h4>seed = 1337</h4>
					</div>
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
					<td><code>variant</code></td>
					<td><code>'equalizer' | 'spectrum' | 'pulse' | 'heartbeat'</code></td>
					<td><code>'equalizer'</code></td>
					<td>Keyframe shape — not just a colour swap.</td>
				</tr>
				<tr>
					<td><code>bars</code></td>
					<td><code>number</code></td>
					<td><code>16</code></td>
					<td>Bar count. Clamped to <code>[1, 64]</code>.</td>
				</tr>
				<tr>
					<td><code>height</code></td>
					<td><code>number</code></td>
					<td><code>96</code></td>
					<td>Container height in pixels.</td>
				</tr>
				<tr>
					<td><code>color</code></td>
					<td><code>string</code></td>
					<td><code>'currentColor'</code></td>
					<td>Bar fill colour. Use <code>'auto'</code> for currentColor inheritance.</td>
				</tr>
				<tr>
					<td><code>speed</code></td>
					<td><code>number</code></td>
					<td><code>1</code></td>
					<td>Cycle multiplier. Clamped to <code>[0.25, 4]</code>.</td>
				</tr>
				<tr>
					<td><code>active</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>When false, freezes the bars at <code>seed</code>-based heights.</td>
				</tr>
				<tr>
					<td><code>seed</code></td>
					<td><code>number</code></td>
					<td><code>1</code></td>
					<td>Deterministic silhouette seed for the inactive state.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.eq-demo {
		display: grid;
		gap: 24px;
	}
	.eq-section {
		display: grid;
		gap: 10px;
	}
	.eq-section h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.eq-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 12px;
	}
	.eq-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 18px;
		text-align: center;
	}
	.eq-vis {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		min-height: 100px;
		margin-bottom: 12px;
	}
	.eq-card h4 {
		margin: 0 0 4px;
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--fg-1);
	}
	.eq-card p {
		margin: 0;
		font-size: 13px;
		color: var(--fg-2);
		line-height: 1.5;
	}

	.eq-badges {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.eq-badge {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 10px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 999px;
		font-size: 14px;
		color: var(--fg-1);
		width: fit-content;
	}
</style>
