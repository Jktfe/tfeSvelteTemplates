<script lang="ts">
	import Tilt3D from '$lib/components/Tilt3D.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';

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

	const usageExample = String.raw`<` + String.raw`script lang="ts">
  import Tilt3D from '$lib/components/Tilt3D.svelte';
</` + String.raw`script>

<Tilt3D maxTilt={12} glare={true}>
  <article class="card">…</article>
</Tilt3D>`;
</script>

<svelte:head>
	<title>Tilt3D | TFE Svelte Templates</title>
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<h1>Tilt3D</h1>
		<p class="subtitle">
			Wrap any element. On hover the wrapped content tilts in 3D toward the cursor —
			Stripe / Linear / Apple product-page card depth — with an optional glare-sweep
			that follows the pointer.
		</p>
		<DatabaseStatus usingDatabase={false} />
	</header>

	<!-- Demo 1: Pricing card -->
	<section class="demo-section">
		<h2>Pricing card — soft default</h2>
		<p class="demo-caption">
			The default settings: 12-degree max tilt, 1000px perspective, glare on, 1.04 scale.
		</p>
		<div class="demo-stage">
			<Tilt3D>
				<article class="pricing-card">
					<div class="pricing-tier">Pro</div>
					<div class="pricing-amount">£29<span class="pricing-period">/month</span></div>
					<ul class="pricing-features">
						<li>Unlimited projects</li>
						<li>Priority support</li>
						<li>Advanced analytics</li>
						<li>Team collaboration</li>
					</ul>
					<div class="pricing-cta">Get started →</div>
				</article>
			</Tilt3D>
		</div>
	</section>

	<!-- Demo 2: Hero photo -->
	<section class="demo-section">
		<h2>Hero photo — stronger tilt</h2>
		<p class="demo-caption">
			A more dramatic 20-degree tilt with shorter perspective and brighter glare,
			the way Apple's product pages handle hero imagery.
		</p>
		<div class="demo-stage">
			<Tilt3D maxTilt={20} perspective={800} glareIntensity={0.5}>
				<div class="hero-frame">
					<div class="hero-gradient">
						<div class="hero-orb hero-orb--a"></div>
						<div class="hero-orb hero-orb--b"></div>
						<div class="hero-orb hero-orb--c"></div>
						<div class="hero-caption">Hover me</div>
					</div>
				</div>
			</Tilt3D>
		</div>
	</section>

	<!-- Demo 3: Icon grid -->
	<section class="demo-section">
		<h2>Icon grid — small individual tilts</h2>
		<p class="demo-caption">
			A subtle 8-degree tilt per tile gives a static feature grid a lot of life.
			Each tile is its own Tilt3D instance.
		</p>
		<div class="icon-grid">
			{#each features as feature (feature.title)}
				<Tilt3D maxTilt={8} perspective={1200} scale={1.03} glareIntensity={0.2}>
					<div class="icon-tile">
						<div class="icon-emoji">{feature.icon}</div>
						<div class="icon-title">{feature.title}</div>
						<div class="icon-body">{feature.body}</div>
					</div>
				</Tilt3D>
			{/each}
		</div>
	</section>

	<!-- Demo 4: Reset modes -->
	<section class="demo-section">
		<h2>Reset modes — spring vs instant vs none</h2>
		<p class="demo-caption">
			Three different leave behaviours. Spring eases back over ~12 frames,
			instant snaps to flat in one frame, none keeps the last cursor position.
		</p>
		<div class="reset-grid">
			<div class="reset-cell">
				<div class="reset-label">spring (default)</div>
				<Tilt3D reset="spring">
					<div class="reset-card">Eases back to flat</div>
				</Tilt3D>
			</div>
			<div class="reset-cell">
				<div class="reset-label">instant</div>
				<Tilt3D reset="instant">
					<div class="reset-card">Snaps on leave</div>
				</Tilt3D>
			</div>
			<div class="reset-cell">
				<div class="reset-label">none</div>
				<Tilt3D reset="none">
					<div class="reset-card">Stays where left</div>
				</Tilt3D>
			</div>
		</div>
	</section>

	<!-- Demo 5: Live controls -->
	<section class="demo-section">
		<h2>Live controls — feel the parameters</h2>
		<p class="demo-caption">
			Drag the sliders to dial in maxTilt, perspective, glareIntensity, and scale
			in real-time. Useful for finding the right values for your design.
		</p>
		<div class="controls-stage">
			<div class="controls-card">
				<Tilt3D
					maxTilt={demoMaxTilt}
					perspective={demoPerspective}
					glareIntensity={demoGlareIntensity}
					scale={demoScale}
				>
					<div class="live-card">
						<div class="live-card-title">Live preview</div>
						<div class="live-card-body">Hover and move your cursor.</div>
					</div>
				</Tilt3D>
			</div>
			<div class="controls-panel">
				<label class="control-row">
					<span class="control-label">maxTilt</span>
					<input type="range" min="0" max="30" step="1" bind:value={demoMaxTilt} />
					<span class="control-value">{demoMaxTilt}°</span>
				</label>
				<label class="control-row">
					<span class="control-label">perspective</span>
					<input type="range" min="400" max="2000" step="100" bind:value={demoPerspective} />
					<span class="control-value">{demoPerspective}px</span>
				</label>
				<label class="control-row">
					<span class="control-label">glareIntensity</span>
					<input type="range" min="0" max="1" step="0.05" bind:value={demoGlareIntensity} />
					<span class="control-value">{demoGlareIntensity.toFixed(2)}</span>
				</label>
				<label class="control-row">
					<span class="control-label">scale</span>
					<input type="range" min="1" max="1.2" step="0.01" bind:value={demoScale} />
					<span class="control-value">{demoScale.toFixed(2)}×</span>
				</label>
			</div>
		</div>
	</section>

	<!-- Usage -->
	<section class="demo-section">
		<h2>Usage</h2>
		<pre class="code-block"><code>{usageExample}</code></pre>
	</section>
</div>

<style>
	.page-container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
	}

	.page-header {
		margin-bottom: 2.5rem;
	}

	.page-header h1 {
		font-size: 2rem;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 0.5rem;
	}

	.subtitle {
		color: #64748b;
		font-size: 1.05rem;
		margin: 0 0 1rem;
		line-height: 1.5;
	}

	.demo-section {
		margin-bottom: 3rem;
	}

	.demo-section h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.5rem;
	}

	.demo-caption {
		color: #64748b;
		font-size: 0.95rem;
		margin: 0 0 1.25rem;
		line-height: 1.5;
	}

	.demo-stage {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 3rem 1rem;
		background: linear-gradient(135deg, #f0f9ff 0%, #f1f5f9 100%);
		border-radius: 14px;
		min-height: 320px;
	}

	/* Pricing card */
	.pricing-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		width: 280px;
		padding: 2rem 1.75rem;
		background: linear-gradient(160deg, #ffffff 0%, #f8fafc 100%);
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		box-shadow: 0 18px 32px -16px rgba(15, 23, 42, 0.18);
		text-align: left;
	}

	.pricing-tier {
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #6366f1;
	}

	.pricing-amount {
		font-size: 2.25rem;
		font-weight: 700;
		color: #0f172a;
	}

	.pricing-period {
		font-size: 0.9rem;
		font-weight: 400;
		color: #64748b;
	}

	.pricing-features {
		list-style: none;
		padding: 0;
		margin: 0.25rem 0 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.pricing-features li {
		font-size: 0.9rem;
		color: #475569;
		padding-left: 1.25rem;
		position: relative;
	}

	.pricing-features li::before {
		content: '✓';
		position: absolute;
		left: 0;
		color: #10b981;
		font-weight: 700;
	}

	.pricing-cta {
		margin-top: 0.5rem;
		padding: 0.75rem 1rem;
		background: #6366f1;
		color: white;
		border-radius: 10px;
		text-align: center;
		font-weight: 600;
		font-size: 0.95rem;
	}

	/* Hero photo */
	.hero-frame {
		width: 360px;
		height: 220px;
		border-radius: 18px;
		overflow: hidden;
		box-shadow: 0 24px 48px -16px rgba(15, 23, 42, 0.32);
	}

	.hero-gradient {
		position: relative;
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #0f172a 0%, #312e81 50%, #0ea5e9 100%);
		overflow: hidden;
	}

	.hero-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(20px);
		opacity: 0.7;
	}

	.hero-orb--a {
		width: 160px;
		height: 160px;
		background: #f59e0b;
		top: -40px;
		right: -30px;
	}

	.hero-orb--b {
		width: 120px;
		height: 120px;
		background: #ec4899;
		bottom: -30px;
		left: 30px;
	}

	.hero-orb--c {
		width: 90px;
		height: 90px;
		background: #10b981;
		top: 30%;
		left: 45%;
	}

	.hero-caption {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 700;
		font-size: 1.25rem;
		letter-spacing: 0.04em;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
	}

	/* Icon grid */
	.icon-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 1rem;
	}

	.icon-tile {
		padding: 1.5rem;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 14px;
		text-align: left;
		box-shadow: 0 4px 12px -4px rgba(15, 23, 42, 0.08);
	}

	.icon-emoji {
		font-size: 1.75rem;
		margin-bottom: 0.5rem;
	}

	.icon-title {
		font-size: 0.95rem;
		font-weight: 600;
		color: #0f172a;
		margin-bottom: 0.25rem;
	}

	.icon-body {
		font-size: 0.85rem;
		color: #64748b;
		line-height: 1.4;
	}

	/* Reset modes */
	.reset-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		padding: 2rem 1rem;
		background: #f8fafc;
		border-radius: 14px;
	}

	.reset-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.reset-label {
		font-family: 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.85rem;
		color: #6366f1;
		font-weight: 600;
	}

	.reset-card {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 180px;
		height: 100px;
		padding: 1rem;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		border-radius: 12px;
		font-weight: 600;
		text-align: center;
		font-size: 0.9rem;
	}

	/* Live controls */
	.controls-stage {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		padding: 2rem 1.5rem;
		background: linear-gradient(135deg, #f0f9ff 0%, #f1f5f9 100%);
		border-radius: 14px;
		align-items: center;
	}

	.controls-card {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 240px;
	}

	.live-card {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 240px;
		height: 200px;
		padding: 1.5rem;
		background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
		color: white;
		border-radius: 16px;
		text-align: center;
		box-shadow: 0 18px 32px -12px rgba(15, 23, 42, 0.4);
	}

	.live-card-title {
		font-size: 1.1rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.live-card-body {
		font-size: 0.85rem;
		color: #cbd5e1;
	}

	.controls-panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem;
		background: white;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
	}

	.control-row {
		display: grid;
		grid-template-columns: 110px 1fr 60px;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.85rem;
	}

	.control-label {
		font-family: 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
		color: #475569;
		font-weight: 600;
	}

	.control-row input[type='range'] {
		width: 100%;
	}

	.control-value {
		text-align: right;
		font-family: 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
		color: #6366f1;
		font-weight: 600;
	}

	/* Code block */
	.code-block {
		padding: 1.25rem;
		background: #1e293b;
		color: #e2e8f0;
		border-radius: 10px;
		overflow-x: auto;
		font-size: 0.8rem;
		line-height: 1.5;
	}

	.code-block code {
		font-family: 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
	}

	@media (max-width: 700px) {
		.controls-stage {
			grid-template-columns: 1fr;
		}
	}
</style>
