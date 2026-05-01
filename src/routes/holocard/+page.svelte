<script lang="ts">
	import HoloCard from '$lib/components/HoloCard.svelte';
	import Tilt3D from '$lib/components/Tilt3D.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/holocard')!;

	const usageSnippet = `<script>
  import HoloCard from '$lib/components/HoloCard.svelte';
  import Tilt3D from '$lib/components/Tilt3D.svelte';
</${'script'}>

<Tilt3D maxTilt={18}>
  <HoloCard intensity="iridescent" palette="rainbow">
    <article class="card">…</article>
  </HoloCard>
</Tilt3D>`;

	const codeExplanation =
		'HoloCard wraps any element with a cursor-driven holographic foil. A conic-gradient ring rotates with the cursor angle from the centre of the host while a diagonal sheen tracks the pointer position. Three intensities and four palettes preset the foil and sheen strengths together. HoloCard does not rotate — wrap it inside Tilt3D for the full Pokemon-card foil-on-tilt feel. Reduced motion locks the foil to a low-opacity static appearance.';
</script>

<svelte:head>
	<title>HoloCard — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Cursor-driven holographic-foil shimmer wrapper. Three intensities, four palettes, composes with Tilt3D, reduced-motion safe."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Pointer', 'CSS-only', 'Reduced-motion safe']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="hc-stack">
			<!-- Stages alternate between dark (rare card / cosmic feel) and light (product thumbs).
			     Both are deliberate demo content — foil reads differently on each. -->
			<div class="hc-stage hc-stage--trading">
				<HoloCard intensity="iridescent" palette="rainbow">
					<article class="hc-card">
						<div class="hc-art">⚡</div>
						<h3>Pikachu</h3>
						<div class="hc-meta">
							<span>HP 60</span>
							<span class="hc-rare">★ Rare</span>
						</div>
						<p>A mouse-like Pokemon with electric attacks.</p>
					</article>
				</HoloCard>
			</div>

			<div class="hc-stage hc-stage--badge">
				<HoloCard intensity="cosmic" palette="cosmic">
					<span class="hc-badge">PRO MEMBER</span>
				</HoloCard>
				<HoloCard intensity="cosmic" palette="gold">
					<span class="hc-badge hc-badge--gold">VIP</span>
				</HoloCard>
				<HoloCard intensity="iridescent" palette="rainbow">
					<span class="hc-badge hc-badge--rainbow">UNLOCKED</span>
				</HoloCard>
			</div>

			<div class="hc-stage hc-stage--products">
				<HoloCard intensity="subtle" palette="pastel">
					<figure class="hc-product">
						<div class="hc-product__img" style="background: linear-gradient(135deg, #ffd6e0, #cce5ff);">📷</div>
						<figcaption>
							<strong>Camera</strong>
							<span>£249</span>
						</figcaption>
					</figure>
				</HoloCard>
				<HoloCard intensity="subtle" palette="pastel">
					<figure class="hc-product">
						<div class="hc-product__img" style="background: linear-gradient(135deg, #fff2b3, #d6f5d6);">🎧</div>
						<figcaption>
							<strong>Headphones</strong>
							<span>£189</span>
						</figcaption>
					</figure>
				</HoloCard>
				<HoloCard intensity="subtle" palette="pastel">
					<figure class="hc-product">
						<div class="hc-product__img" style="background: linear-gradient(135deg, #e0ccff, #ffd6e0);">⌚</div>
						<figcaption>
							<strong>Watch</strong>
							<span>£329</span>
						</figcaption>
					</figure>
				</HoloCard>
			</div>

			<div class="hc-stage hc-stage--compose">
				<Tilt3D maxTilt={18} perspective={1000}>
					<HoloCard intensity="cosmic" palette="rainbow">
						<article class="hc-card hc-card--compose">
							<div class="hc-art">🌟</div>
							<h3>Legendary</h3>
							<div class="hc-meta">
								<span>HP 240</span>
								<span class="hc-legendary">✦ Legendary</span>
							</div>
							<p>Foil + tilt — the way physical rare cards feel in the hand.</p>
						</article>
					</HoloCard>
				</Tilt3D>
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
					<td><code>intensity</code></td>
					<td><code>'subtle' | 'iridescent' | 'cosmic'</code></td>
					<td><code>'iridescent'</code></td>
					<td>Bundles foil opacity with sheen strength.</td>
				</tr>
				<tr>
					<td><code>palette</code></td>
					<td><code>'rainbow' | 'pastel' | 'cosmic' | 'gold'</code></td>
					<td><code>'rainbow'</code></td>
					<td>Conic-gradient palette preset.</td>
				</tr>
				<tr>
					<td><code>children</code></td>
					<td><code>Snippet</code></td>
					<td>—</td>
					<td>The element the foil should drape over.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.hc-stack {
		display: grid;
		gap: 1.25rem;
	}
	.hc-stage {
		padding: 2rem;
		border-radius: var(--r-2);
		display: flex;
		gap: 1.25rem;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
	}
	/* Dark stages are deliberate demo content — foil reads on dark backdrops. */
	.hc-stage--trading {
		background: radial-gradient(circle at 30% 20%, #1a1a2e 0%, #0f0f1f 100%);
	}
	.hc-stage--badge {
		background: #0f0f1f;
		gap: 1rem;
	}
	.hc-stage--compose {
		background: radial-gradient(circle at 50% 30%, #2a1a3e 0%, #0a0a1f 80%);
		min-height: 360px;
	}
	/* Light stage is also deliberate — foil should read soft on bright product surfaces. */
	.hc-stage--products {
		background: var(--surface);
		border: 1px solid var(--border);
		gap: 1rem;
	}

	.hc-card {
		width: 220px;
		padding: 1.1rem;
		border-radius: 14px;
		background: linear-gradient(160deg, #fef3c7 0%, #fcd34d 100%);
		color: #1f1d12;
		border: 2px solid rgba(0, 0, 0, 0.15);
		display: block;
	}
	.hc-card--compose {
		width: 260px;
		background: linear-gradient(160deg, #1a1a2e 0%, #2a1a3e 100%);
		color: #f5f5ff;
		border: 2px solid rgba(255, 255, 255, 0.15);
	}
	.hc-card h3 {
		margin: 0.25rem 0 0.4rem;
		font-size: 1.05rem;
	}
	.hc-card p {
		font-size: 0.8rem;
		line-height: 1.4;
		margin: 0.4rem 0 0;
	}
	.hc-art {
		font-size: 3rem;
		text-align: center;
		padding: 0.4rem 0;
	}
	.hc-meta {
		display: flex;
		justify-content: space-between;
		font-size: 0.8rem;
		color: #6b5800;
	}
	.hc-card--compose .hc-meta {
		color: #c9c9d1;
	}
	.hc-rare {
		color: #b91c1c;
		font-weight: 600;
	}
	.hc-legendary {
		color: #c026d3;
		font-weight: 700;
	}
	.hc-badge {
		display: inline-block;
		padding: 0.5rem 1.1rem;
		border-radius: 999px;
		background: linear-gradient(135deg, #240046, #5a189a);
		color: #fff;
		font-weight: 700;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
	}
	.hc-badge--gold {
		background: linear-gradient(135deg, #7a4f01, #e6b800);
		color: #1a1100;
	}
	.hc-badge--rainbow {
		background: linear-gradient(135deg, #ff006e, #06d6a0, #118ab2);
	}
	.hc-product {
		width: 150px;
		margin: 0;
		padding: 0.9rem;
		border-radius: 12px;
		background: #fff;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.hc-product__img {
		width: 100%;
		aspect-ratio: 1;
		border-radius: 8px;
		display: grid;
		place-items: center;
		font-size: 2.25rem;
	}
	.hc-product figcaption {
		display: flex;
		justify-content: space-between;
		font-size: 0.8rem;
	}
</style>
