<script lang="ts">
	import MeshGradient from '$lib/components/MeshGradient.svelte';
	import type { Palette } from '$lib/components/MeshGradient.svelte';

	let livePalette = $state<Palette>('sunset');
	let liveBlobCount = $state(6);
	let liveBlur = $state(90);
	let liveOpacity = $state(0.75);
	let liveSpeed = $state(1);

	const paletteOptions: Palette[] = [
		'sunset',
		'aurora',
		'ember',
		'cosmic',
		'mint',
		'monochrome'
	];
</script>

<svelte:head>
	<title>MeshGradient — TFE Svelte Templates</title>
</svelte:head>

<main class="page">
	<header class="hero">
		<!-- Hero stage doubles as the first demo: the headline rides on
		     top of the mesh, exactly as you'd ship it on a real page. -->
		<div class="hero__stage">
			<MeshGradient palette="cosmic" blobCount={6} blur={110} opacity={0.85} />
			<div class="hero__inner">
				<span class="badge">Decorative</span>
				<h1>🎨 MeshGradient</h1>
				<p>
					An ambient animated mesh of large, blurry radial-gradient blobs.
					Stripe / Linear / Vercel marketing energy with zero canvas, zero
					rAF, and a single `filter: blur` layer doing the compositing.
				</p>
			</div>
		</div>
	</header>

	<section class="demo">
		<div class="demo__head">
			<h2>Sunset — default</h2>
			<p>
				Five blobs, palette <code>sunset</code>, drifting at baseline speed.
				This is the out-of-the-box configuration.
			</p>
		</div>
		<div class="demo__stage">
			<MeshGradient />
			<div class="demo__overlay">
				<h3>Sunset</h3>
				<p>palette="sunset" · blobCount=5 · blur=80 · speed=1</p>
			</div>
		</div>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Aurora — denser, softer</h2>
			<p>
				Eight blobs and a 110px blur for a fuller wash. Aurora's cool greens
				and blues read like the northern lights softened to a smear.
			</p>
		</div>
		<div class="demo__stage">
			<MeshGradient palette="aurora" blobCount={8} blur={110} opacity={0.85} />
			<div class="demo__overlay demo__overlay--light">
				<h3>Aurora</h3>
				<p>palette="aurora" · blobCount=8 · blur=110 · opacity=0.85</p>
			</div>
		</div>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Ember — slow burn</h2>
			<p>
				Half-speed drift on the warm ember palette. The slow drift suits
				splash pages and marketing surfaces where motion shouldn't compete
				with a primary message.
			</p>
		</div>
		<div class="demo__stage">
			<MeshGradient palette="ember" blobCount={5} blur={95} speed={0.5} />
			<div class="demo__overlay">
				<h3>Ember</h3>
				<p>palette="ember" · blobCount=5 · blur=95 · speed=0.5</p>
			</div>
		</div>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Mint — bright and quiet</h2>
			<p>
				Lighter palette suited to product surfaces that want lift without
				weight. Three blobs only — minimal busy.
			</p>
		</div>
		<div class="demo__stage demo__stage--light">
			<MeshGradient palette="mint" blobCount={3} blur={120} opacity={0.7} />
			<div class="demo__overlay">
				<h3>Mint</h3>
				<p>palette="mint" · blobCount=3 · blur=120 · opacity=0.7</p>
			</div>
		</div>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Palette gallery</h2>
			<p>All six palettes side by side at the same blob count and blur.</p>
		</div>
		<div class="palette-gallery">
			{#each paletteOptions as p (p)}
				<div class="palette-tile">
					<MeshGradient palette={p} blobCount={4} blur={70} opacity={0.85} />
					<div class="palette-tile__label">{p}</div>
				</div>
			{/each}
		</div>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Live controls</h2>
			<p>
				Adjust palette, blob count, blur, opacity, and speed in real time.
				All five controls feed inline custom properties; nothing re-renders.
			</p>
		</div>
		<div class="controls">
			<label>
				Palette:
				<select bind:value={livePalette}>
					{#each paletteOptions as p (p)}
						<option value={p}>{p}</option>
					{/each}
				</select>
			</label>
			<label>
				Blob count: <strong>{liveBlobCount}</strong>
				<input type="range" min="1" max="12" step="1" bind:value={liveBlobCount} />
			</label>
			<label>
				Blur: <strong>{liveBlur}px</strong>
				<input type="range" min="0" max="200" step="5" bind:value={liveBlur} />
			</label>
			<label>
				Opacity: <strong>{liveOpacity.toFixed(2)}</strong>
				<input type="range" min="0" max="1" step="0.05" bind:value={liveOpacity} />
			</label>
			<label>
				Speed: <strong>{liveSpeed.toFixed(1)}×</strong>
				<input type="range" min="0" max="3" step="0.1" bind:value={liveSpeed} />
			</label>
		</div>
		<div class="demo__stage demo__stage--live">
			<MeshGradient
				palette={livePalette}
				blobCount={liveBlobCount}
				blur={liveBlur}
				opacity={liveOpacity}
				speed={liveSpeed}
			/>
			<div class="demo__overlay">
				<h3>Live</h3>
				<p>palette={livePalette} · {liveBlobCount} blobs · {liveBlur}px blur</p>
			</div>
		</div>
	</section>
</main>

<style>
	.page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 4rem;
	}

	.hero {
		margin-bottom: 3rem;
	}

	.hero__stage {
		position: relative;
		min-height: 360px;
		border-radius: 24px;
		overflow: hidden;
		background: #0a0a1a;
		display: flex;
		align-items: center;
		padding: 2.5rem;
	}

	.hero__inner {
		position: relative;
		z-index: 1;
		max-width: 700px;
		color: #fff;
	}

	.badge {
		display: inline-block;
		background: rgba(255, 255, 255, 0.18);
		color: #fff;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
		margin-bottom: 0.75rem;
		backdrop-filter: blur(6px);
	}

	.hero__inner h1 {
		font-size: 2.5rem;
		margin: 0 0 1rem;
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
	}

	.hero__inner p {
		font-size: 1.125rem;
		color: rgba(255, 255, 255, 0.92);
		line-height: 1.6;
		margin: 0;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
	}

	.demo {
		margin-bottom: 4rem;
	}

	.demo__head {
		margin-bottom: 1.5rem;
	}

	.demo__head h2 {
		font-size: 1.5rem;
		margin: 0 0 0.5rem;
	}

	.demo__head p {
		color: #64748b;
		margin: 0;
		line-height: 1.5;
	}

	.demo__head code {
		background: #f1f5f9;
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		font-size: 0.85em;
	}

	.demo__stage {
		position: relative;
		min-height: 320px;
		border-radius: 16px;
		overflow: hidden;
		background: #0a0a1a;
		display: flex;
		align-items: flex-end;
		padding: 1.5rem;
	}

	.demo__stage--light {
		background: #f8fafc;
	}

	.demo__stage--live {
		min-height: 400px;
	}

	.demo__overlay {
		position: relative;
		z-index: 1;
		color: #fff;
	}

	.demo__overlay h3 {
		margin: 0 0 0.25rem;
		font-size: 1.25rem;
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
	}

	.demo__overlay p {
		margin: 0;
		font-size: 0.875rem;
		opacity: 0.85;
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
	}

	.demo__overlay--light {
		color: #0f172a;
	}

	.demo__overlay--light h3,
	.demo__overlay--light p {
		text-shadow: 0 1px 4px rgba(255, 255, 255, 0.5);
	}

	.palette-gallery {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}

	.palette-tile {
		position: relative;
		min-height: 180px;
		border-radius: 12px;
		overflow: hidden;
		background: #0a0a1a;
		display: flex;
		align-items: flex-end;
		padding: 1rem;
	}

	.palette-tile__label {
		position: relative;
		z-index: 1;
		color: #fff;
		font-size: 0.875rem;
		font-weight: 500;
		text-transform: capitalize;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
	}

	.controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.25rem;
		margin-bottom: 1.5rem;
	}

	.controls label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #334155;
	}

	.controls input[type='range'],
	.controls select {
		width: 100%;
	}
</style>
