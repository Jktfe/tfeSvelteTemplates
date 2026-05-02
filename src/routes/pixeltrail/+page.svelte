<!--
	PixelTrail Demo Page (TFE shell)
-->

<script lang="ts">
	import PixelTrail from '$lib/components/PixelTrail.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/pixeltrail')!;

	const usageSnippet = `<script>
  import PixelTrail from '$lib/components/PixelTrail.svelte';
</${'script'}>

<PixelTrail size="medium" palette="cyber-cyan" trailLength={20}>
  <div class="hero">…</div>
</PixelTrail>`;

	const codeExplanation =
		'PixelTrail wraps any region and spawns a small <span> at the cursor every few pixels of travel. Each span has a CSS keyframe animation that fades, scales, and drifts before the per-pixel setTimeout removes it. Distance throttling keeps trail density consistent at any cursor speed; reduced-motion users see the underlying region untouched.';
</script>

<svelte:head>
	<title>PixelTrail — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Cursor-tracked decaying pixel trail with three sizes and three palettes."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Cursor', 'CSS-only', 'Reduced-motion safe']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="pt-demo">
			<section class="pt-section">
				<h3>1. Mono-white hero crackle</h3>
				<PixelTrail size="medium" palette="mono-white" trailLength={20}>
					<div class="pt-stage pt-stage--hero">
						<div class="pt-content">
							<div class="pt-eyebrow">A NICE TERMINAL</div>
							<h4 class="pt-title">Move the cursor.</h4>
							<p class="pt-sub">Pixels follow you, then fade.</p>
						</div>
					</div>
				</PixelTrail>
			</section>

			<section class="pt-section">
				<h3>2. Cyber-cyan terminal</h3>
				<PixelTrail size="small" palette="cyber-cyan" trailLength={32} duration={900}>
					<div class="pt-stage pt-stage--cyber">
						<pre class="pt-terminal">
$ ant deploy --target=mainnet
✓ build:    16.4s
✓ tests:    1.9s   1877/1877
✓ lint:     0.6s   0 errors
✓ release:  v2.4.0
</pre>
					</div>
				</PixelTrail>
			</section>

			<section class="pt-section">
				<h3>3. Sunset-warm marketing strip</h3>
				<PixelTrail size="large" palette="sunset-warm" trailLength={16} duration={1100}>
					<div class="pt-stage pt-stage--warm">
						<div class="pt-content">
							<div class="pt-tag">SUMMER · 26</div>
							<h4 class="pt-title pt-title--warm">Glide through golden hour.</h4>
						</div>
					</div>
				</PixelTrail>
			</section>

			<section class="pt-section">
				<h3>4. Three sizes side-by-side</h3>
				<div class="pt-grid">
					<PixelTrail size="small" palette="cyber-cyan" trailLength={20}>
						<div class="pt-card">
							<h4>Small</h4>
							<p>4px pixels<br />6px throttle<br />densely stippled</p>
						</div>
					</PixelTrail>
					<PixelTrail size="medium" palette="cyber-cyan" trailLength={20}>
						<div class="pt-card">
							<h4>Medium</h4>
							<p>8px pixels<br />10px throttle<br />editorial default</p>
						</div>
					</PixelTrail>
					<PixelTrail size="large" palette="cyber-cyan" trailLength={20}>
						<div class="pt-card">
							<h4>Large</h4>
							<p>16px pixels<br />18px throttle<br />arcade chunky</p>
						</div>
					</PixelTrail>
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
					<td><code>size</code></td>
					<td><code>'small' | 'medium' | 'large'</code></td>
					<td><code>'medium'</code></td>
					<td>Bundles pixel size + throttle distance.</td>
				</tr>
				<tr>
					<td><code>palette</code></td>
					<td><code>'mono-white' | 'cyber-cyan' | 'sunset-warm'</code></td>
					<td><code>'mono-white'</code></td>
					<td>Three-colour cycling palette.</td>
				</tr>
				<tr>
					<td><code>trailLength</code></td>
					<td><code>number</code></td>
					<td><code>16</code></td>
					<td>Maximum live pixels (FIFO eviction).</td>
				</tr>
				<tr>
					<td><code>duration</code></td>
					<td><code>number</code></td>
					<td><code>700</code></td>
					<td>Per-pixel lifetime in milliseconds.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.pt-demo {
		display: grid;
		gap: 24px;
	}
	.pt-section {
		display: grid;
		gap: 10px;
	}
	.pt-section h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.pt-stage {
		border-radius: 14px;
		padding: 64px 32px;
		min-height: 220px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		border: 1px solid var(--border);
	}
	.pt-stage--hero {
		background: radial-gradient(circle at 30% 50%, #181830, #0a0a14 70%);
	}
	.pt-stage--cyber {
		background: linear-gradient(135deg, #051d2e, #02101c);
		font-family: 'Fira Code', ui-monospace, monospace;
	}
	.pt-stage--warm {
		background: linear-gradient(135deg, #2a1a00, #4a0a2a);
	}
	.pt-content {
		text-align: center;
		pointer-events: none;
	}
	.pt-eyebrow {
		font-size: 11px;
		letter-spacing: 0.3em;
		color: #6c6c8c;
		margin-bottom: 10px;
	}
	.pt-title {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(28px, 4vw, 44px);
		margin: 0;
		color: #ffffff;
		text-transform: uppercase;
		letter-spacing: 0.01em;
	}
	.pt-title--warm {
		color: #ffea00;
	}
	.pt-sub {
		margin: 8px 0 0;
		color: #a8a8b8;
		font-size: 14px;
	}
	.pt-tag {
		font-size: 11px;
		letter-spacing: 0.3em;
		color: #ffb87a;
		margin-bottom: 10px;
	}
	.pt-terminal {
		margin: 0;
		font-size: 14px;
		color: #8ce4ff;
		line-height: 1.6;
		text-align: left;
		text-shadow: 0 0 8px rgba(0, 191, 255, 0.4);
		pointer-events: none;
	}
	.pt-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 16px;
	}
	.pt-card {
		background: #0a0a14;
		border: 1px solid #1f1f3a;
		border-radius: 14px;
		padding: 32px 16px;
		min-height: 200px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}
	.pt-card h4 {
		margin: 0 0 10px;
		color: #00bfff;
		font-size: 18px;
	}
	.pt-card p {
		margin: 0;
		font-size: 13px;
		line-height: 1.6;
		color: #8c8c9c;
		font-family: 'Fira Code', monospace;
	}
</style>
