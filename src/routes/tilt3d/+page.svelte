<!--
	Tilt3D Demo Page (TFE shell)
-->

<script lang="ts">
	import Tilt3D from '$lib/components/Tilt3D.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/tilt3d')!;

	let demoMaxTilt = $state(15);
	let demoGlareIntensity = $state(0.4);
	let demoPerspective = $state(900);
	let demoScale = $state(1.05);

	const features = [
		{ icon: '🎯', title: 'Cursor-tracking', body: 'Real-time 3D rotation follows the pointer.' },
		{ icon: '✨', title: 'Glare highlight', body: 'Optional radial-gradient overlay tracks the cursor.' },
		{ icon: '🎬', title: 'Three reset modes', body: 'Spring, instant, or stay-where-left.' },
		{ icon: '♿', title: 'Reduced-motion safe', body: 'Tilt locks flat under prefers-reduced-motion.' },
		{ icon: '📦', title: 'Zero dependencies', body: 'Pure CSS perspective + transform.' },
		{ icon: '⚡', title: 'GPU-composited', body: 'Transform writes hit only the compositor thread.' }
	];

	const usageSnippet = `<script>
  import Tilt3D from '$lib/components/Tilt3D.svelte';
<\/script>

<Tilt3D maxTilt={12} glare={true}>
  <article class="card">…</article>
</Tilt3D>`;

	const codeExplanation =
		'Tilt3D wraps any element in a perspective container and rotates it on hover by mapping the cursor offset to two rotation axes. The optional glare layer is a single radial gradient pinned to the cursor. Three reset modes (spring, instant, none) cover the common leave behaviours; reduced-motion users see a flat card.';
</script>

<svelte:head>
	<title>Tilt3D — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Cursor-driven 3D rotation wrapper with glare highlight and three reset modes."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Hover', 'CSS-only', 'Reduced-motion safe']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="t3-demo">
			<section class="t3-section">
				<h3>Pricing card — soft default</h3>
				<div class="t3-stage">
					<Tilt3D>
						<article class="t3-pricing">
							<div class="t3-tier">Pro</div>
							<div class="t3-amount">£29<span>/month</span></div>
							<ul>
								<li>Unlimited projects</li>
								<li>Priority support</li>
								<li>Advanced analytics</li>
								<li>Team collaboration</li>
							</ul>
							<div class="t3-cta">Get started →</div>
						</article>
					</Tilt3D>
				</div>
			</section>

			<section class="t3-section">
				<h3>Hero photo — stronger tilt</h3>
				<div class="t3-stage">
					<Tilt3D maxTilt={20} perspective={800} glareIntensity={0.5}>
						<div class="t3-hero">
							<div class="t3-orb t3-orb--a"></div>
							<div class="t3-orb t3-orb--b"></div>
							<div class="t3-orb t3-orb--c"></div>
							<div class="t3-hero-caption">Hover me</div>
						</div>
					</Tilt3D>
				</div>
			</section>

			<section class="t3-section">
				<h3>Icon grid — small individual tilts</h3>
				<div class="t3-icon-grid">
					{#each features as feature (feature.title)}
						<Tilt3D maxTilt={8} perspective={1200} scale={1.03} glareIntensity={0.2}>
							<div class="t3-tile">
								<div class="t3-tile__emoji">{feature.icon}</div>
								<div class="t3-tile__title">{feature.title}</div>
								<div class="t3-tile__body">{feature.body}</div>
							</div>
						</Tilt3D>
					{/each}
				</div>
			</section>

			<section class="t3-section">
				<h3>Reset modes — spring vs instant vs none</h3>
				<div class="t3-reset">
					<div class="t3-reset__cell">
						<span class="t3-reset__label">spring</span>
						<Tilt3D reset="spring">
							<div class="t3-reset__card">Eases back to flat</div>
						</Tilt3D>
					</div>
					<div class="t3-reset__cell">
						<span class="t3-reset__label">instant</span>
						<Tilt3D reset="instant">
							<div class="t3-reset__card">Snaps on leave</div>
						</Tilt3D>
					</div>
					<div class="t3-reset__cell">
						<span class="t3-reset__label">none</span>
						<Tilt3D reset="none">
							<div class="t3-reset__card">Stays where left</div>
						</Tilt3D>
					</div>
				</div>
			</section>

			<section class="t3-section">
				<h3>Live controls</h3>
				<div class="t3-live">
					<div class="t3-live__stage">
						<Tilt3D
							maxTilt={demoMaxTilt}
							perspective={demoPerspective}
							glareIntensity={demoGlareIntensity}
							scale={demoScale}
						>
							<div class="t3-live__card">
								<div class="t3-live__title">Live preview</div>
								<div class="t3-live__body">Hover and move your cursor.</div>
							</div>
						</Tilt3D>
					</div>
					<div class="t3-live__panel">
						<label>maxTilt <strong>{demoMaxTilt}°</strong>
							<input type="range" min="0" max="30" step="1" bind:value={demoMaxTilt} />
						</label>
						<label>perspective <strong>{demoPerspective}px</strong>
							<input type="range" min="400" max="2000" step="100" bind:value={demoPerspective} />
						</label>
						<label>glareIntensity <strong>{demoGlareIntensity.toFixed(2)}</strong>
							<input type="range" min="0" max="1" step="0.05" bind:value={demoGlareIntensity} />
						</label>
						<label>scale <strong>{demoScale.toFixed(2)}×</strong>
							<input type="range" min="1" max="1.2" step="0.01" bind:value={demoScale} />
						</label>
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
					<td><code>maxTilt</code></td>
					<td><code>number</code></td>
					<td><code>12</code></td>
					<td>Maximum rotation in degrees on each axis.</td>
				</tr>
				<tr>
					<td><code>perspective</code></td>
					<td><code>number</code></td>
					<td><code>1000</code></td>
					<td>CSS perspective distance in pixels.</td>
				</tr>
				<tr>
					<td><code>glare</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Toggle the cursor-following highlight overlay.</td>
				</tr>
				<tr>
					<td><code>glareIntensity</code></td>
					<td><code>number</code></td>
					<td><code>0.4</code></td>
					<td>0–1 strength of the highlight.</td>
				</tr>
				<tr>
					<td><code>scale</code></td>
					<td><code>number</code></td>
					<td><code>1.04</code></td>
					<td>Multiplier applied while hovering.</td>
				</tr>
				<tr>
					<td><code>reset</code></td>
					<td><code>'spring' | 'instant' | 'none'</code></td>
					<td><code>'spring'</code></td>
					<td>Behaviour when the cursor leaves.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.t3-demo {
		display: grid;
		gap: 24px;
	}
	.t3-section {
		display: grid;
		gap: 10px;
	}
	.t3-section h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.t3-stage {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 36px 16px;
		min-height: 300px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
	}

	.t3-pricing {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 280px;
		padding: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		text-align: left;
	}
	.t3-tier {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--accent);
	}
	.t3-amount {
		font-size: 32px;
		font-weight: 700;
		color: var(--fg-1);
	}
	.t3-amount span {
		font-size: 14px;
		font-weight: 400;
		color: var(--fg-3);
	}
	.t3-pricing ul {
		list-style: none;
		padding: 0;
		margin: 8px 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.t3-pricing li {
		font-size: 13px;
		color: var(--fg-2);
		padding-left: 18px;
		position: relative;
	}
	.t3-pricing li::before {
		content: '✓';
		position: absolute;
		left: 0;
		color: #10b981;
		font-weight: 700;
	}
	.t3-cta {
		padding: 10px 14px;
		background: var(--accent);
		color: var(--accent-on);
		border-radius: 10px;
		text-align: center;
		font-weight: 600;
		font-size: 14px;
	}

	.t3-hero {
		position: relative;
		width: 360px;
		height: 220px;
		border-radius: 18px;
		overflow: hidden;
		background: linear-gradient(135deg, #0f172a 0%, #312e81 50%, #0ea5e9 100%);
	}
	.t3-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(20px);
		opacity: 0.7;
	}
	.t3-orb--a {
		width: 160px;
		height: 160px;
		background: #f59e0b;
		top: -40px;
		right: -30px;
	}
	.t3-orb--b {
		width: 120px;
		height: 120px;
		background: #ec4899;
		bottom: -30px;
		left: 30px;
	}
	.t3-orb--c {
		width: 90px;
		height: 90px;
		background: #10b981;
		top: 30%;
		left: 45%;
	}
	.t3-hero-caption {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 700;
		font-size: 18px;
	}

	.t3-icon-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 12px;
	}
	.t3-tile {
		padding: 18px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 14px;
	}
	.t3-tile__emoji {
		font-size: 22px;
		margin-bottom: 6px;
	}
	.t3-tile__title {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 14px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
		margin-bottom: 4px;
	}
	.t3-tile__body {
		font-size: 12px;
		color: var(--fg-2);
		line-height: 1.4;
	}

	.t3-reset {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 16px;
		padding: 24px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
	}
	.t3-reset__cell {
		display: grid;
		justify-items: center;
		gap: 10px;
	}
	.t3-reset__label {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.t3-reset__card {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 180px;
		height: 100px;
		padding: 14px;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		border-radius: 12px;
		font-weight: 600;
		text-align: center;
		font-size: 13px;
	}

	.t3-live {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		padding: 24px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		align-items: center;
	}
	.t3-live__stage {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 240px;
	}
	.t3-live__card {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 240px;
		height: 200px;
		padding: 18px;
		background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
		color: white;
		border-radius: 16px;
		text-align: center;
	}
	.t3-live__title {
		font-size: 16px;
		font-weight: 700;
		margin-bottom: 6px;
	}
	.t3-live__body {
		font-size: 12px;
		color: #cbd5e1;
	}
	.t3-live__panel {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 10px;
	}
	.t3-live__panel label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 12px;
		color: var(--fg-2);
	}
	.t3-live__panel input[type='range'] {
		width: 100%;
	}

	@media (max-width: 700px) {
		.t3-live {
			grid-template-columns: 1fr;
		}
	}
</style>
