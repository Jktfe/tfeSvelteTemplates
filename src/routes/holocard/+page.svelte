<script lang="ts">
	import HoloCard from '$lib/components/HoloCard.svelte';
	import Tilt3D from '$lib/components/Tilt3D.svelte';
</script>

<svelte:head>
	<title>HoloCard · TFE Svelte Templates</title>
</svelte:head>

<main class="page">
	<header class="hero">
		<h1>HoloCard</h1>
		<p>
			Cursor-driven holographic-foil shimmer. A conic-gradient ring rotates with the
			cursor's angle from center while a diagonal sheen tracks the pointer position. Wraps
			any element. Asset-free, prefers-reduced-motion safe, composes naturally with Tilt3D
			for the full Pokemon-card-foil experience.
		</p>
	</header>

	<section class="demo">
		<h2>1. Rare trading-card</h2>
		<p class="caption">Iridescent rainbow foil over a card. Move the cursor across to rotate the foil.</p>
		<div class="stage stage-trading">
			<HoloCard intensity="iridescent" palette="rainbow">
				<article class="card-trading">
					<div class="card-art">⚡</div>
					<h3>Pikachu</h3>
					<div class="card-meta">
						<span>HP 60</span>
						<span class="rare">★ Rare</span>
					</div>
					<p>A mouse-like Pokemon with electric attacks. Once stored too much electricity, exploded.</p>
				</article>
			</HoloCard>
		</div>
	</section>

	<section class="demo">
		<h2>2. Premium-badge sticker</h2>
		<p class="caption">Cosmic palette on a pill badge — perfect for "Pro" / "Premium" affordances.</p>
		<div class="stage stage-badge">
			<HoloCard intensity="cosmic" palette="cosmic">
				<span class="badge-pro">PRO MEMBER</span>
			</HoloCard>
			<HoloCard intensity="cosmic" palette="gold">
				<span class="badge-pro badge-gold">VIP</span>
			</HoloCard>
			<HoloCard intensity="iridescent" palette="rainbow">
				<span class="badge-pro badge-rainbow">UNLOCKED</span>
			</HoloCard>
		</div>
	</section>

	<section class="demo">
		<h2>3. Achievement-unlocked tile</h2>
		<p class="caption">Subtle intensity on a level-up callout, gold palette for a "treasure" feel.</p>
		<div class="stage stage-achievement">
			<HoloCard intensity="subtle" palette="gold">
				<div class="achievement">
					<div class="achievement-icon">🏆</div>
					<div class="achievement-body">
						<h3>Achievement Unlocked</h3>
						<p>Shipped 10 components in a single coordination sprint.</p>
					</div>
				</div>
			</HoloCard>
		</div>
	</section>

	<section class="demo">
		<h2>4. Product-thumb hover</h2>
		<p class="caption">Pastel palette on a small product card. Subtle is the right call here — foil should not steal focus from the product.</p>
		<div class="stage stage-products">
			<HoloCard intensity="subtle" palette="pastel">
				<figure class="product">
					<div class="product-img" style="background: linear-gradient(135deg, #ffd6e0, #cce5ff);">📷</div>
					<figcaption>
						<strong>Camera</strong>
						<span>£249</span>
					</figcaption>
				</figure>
			</HoloCard>
			<HoloCard intensity="subtle" palette="pastel">
				<figure class="product">
					<div class="product-img" style="background: linear-gradient(135deg, #fff2b3, #d6f5d6);">🎧</div>
					<figcaption>
						<strong>Headphones</strong>
						<span>£189</span>
					</figcaption>
				</figure>
			</HoloCard>
			<HoloCard intensity="subtle" palette="pastel">
				<figure class="product">
					<div class="product-img" style="background: linear-gradient(135deg, #e0ccff, #ffd6e0);">⌚</div>
					<figcaption>
						<strong>Watch</strong>
						<span>£329</span>
					</figcaption>
				</figure>
			</HoloCard>
		</div>
	</section>

	<section class="demo">
		<h2>5. Composition: HoloCard inside Tilt3D</h2>
		<p class="caption">The full Pokemon-card behaviour. Tilt3D handles the X/Y rotation; HoloCard handles the foil. Each tracks the cursor independently and they compose into a single physical object.</p>
		<div class="stage stage-compose">
			<Tilt3D maxTilt={18} perspective={1000}>
				<HoloCard intensity="cosmic" palette="rainbow">
					<article class="card-compose">
						<div class="card-art-compose">🌟</div>
						<h3>Legendary</h3>
						<div class="card-meta">
							<span>HP 240</span>
							<span class="legendary">✦ Legendary</span>
						</div>
						<p>One in a thousand. Holographic foil + tilt — the way physical rare cards feel in the hand.</p>
					</article>
				</HoloCard>
			</Tilt3D>
		</div>
	</section>

	<section class="meta">
		<div class="card">
			<h3>Three intensities</h3>
			<p>
				<code>subtle</code> — opacity 0.18, sheen 0.25 (premium-but-restrained — for product thumbs and
				premium tiles where the foil shouldn't steal focus).
			</p>
			<p>
				<code>iridescent</code> — opacity 0.32, sheen 0.45 (default — collectible-card vibe).
			</p>
			<p>
				<code>cosmic</code> — opacity 0.5, sheen 0.6 (statement piece — for rare items and hero spots).
			</p>
		</div>

		<div class="card">
			<h3>Four palettes</h3>
			<p>
				<code>rainbow</code> — full-spectrum hot pink → orange → yellow → green → blue → violet.
			</p>
			<p>
				<code>pastel</code> — softer iridescent muted pastels.
			</p>
			<p>
				<code>cosmic</code> — deep purple gradient with violet-to-lavender highlights.
			</p>
			<p>
				<code>gold</code> — antique gold with foil-like white highlights, treasure-feel.
			</p>
		</div>

		<div class="card">
			<h3>Pure helpers</h3>
			<p>
				Module-script exports —
				<code>pickIntensity</code>, <code>pickPalette</code>, <code>cursorAngle</code>,
				<code>hueAtAngle</code>, <code>sheenAtAngle</code>, <code>clamp01</code>,
				<code>isReducedMotion</code>. All deterministic and unit-tested.
			</p>
		</div>

		<div class="card">
			<h3>Accessibility</h3>
			<p>
				Slotted content stays in the DOM and a11y tree. Foil and sheen overlays are
				<code>aria-hidden</code>. Pointer handlers are no-ops under
				<code>prefers-reduced-motion: reduce</code>; CSS-layer fallback locks foil and
				sheen to a low-opacity static appearance regardless of JS state.
			</p>
		</div>

		<div class="card">
			<h3>Composes with Tilt3D</h3>
			<p>
				HoloCard does not rotate — it only colour-shifts. Wrap it inside Tilt3D for the
				full Pokemon-card foil-on-tilt behaviour. Each tracks the cursor independently;
				the foil rotation and the 3D tilt come from the same physical motion.
			</p>
		</div>

		<div class="card">
			<h3>Asset-free</h3>
			<p>
				Pure CSS conic-gradient + linear-gradient + transform. Zero deps, no SVG, no
				canvas, no fonts loaded. Works inside any container, inherits border-radius,
				does not affect the slotted layout box.
			</p>
		</div>
	</section>
</main>

<style>
	.page {
		max-width: 980px;
		margin: 0 auto;
		padding: 2rem 1.25rem 4rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	.hero {
		text-align: center;
		margin-bottom: 3rem;
	}

	.hero h1 {
		font-size: 2.75rem;
		margin: 0 0 0.5rem;
		letter-spacing: -0.02em;
	}

	.hero p {
		max-width: 640px;
		margin: 0 auto;
		color: #555;
		line-height: 1.55;
	}

	.demo {
		margin-bottom: 2.75rem;
	}

	.demo h2 {
		font-size: 1.25rem;
		margin: 0 0 0.5rem;
	}

	.caption {
		color: #666;
		font-size: 0.92rem;
		margin: 0 0 1rem;
	}

	.stage {
		padding: 2rem;
		border-radius: 18px;
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
	}

	.stage-trading {
		background: radial-gradient(circle at 30% 20%, #1a1a2e 0%, #0f0f1f 100%);
	}

	.stage-badge {
		background: #0f0f1f;
		gap: 1rem;
	}

	.stage-achievement {
		background: linear-gradient(135deg, #1a1a2e 0%, #2a1a3e 100%);
	}

	.stage-products {
		background: #f8fafc;
		gap: 1.25rem;
	}

	.stage-compose {
		background: radial-gradient(circle at 50% 30%, #2a1a3e 0%, #0a0a1f 80%);
		min-height: 380px;
	}

	.card-trading {
		width: 240px;
		padding: 1.25rem;
		border-radius: 14px;
		background: linear-gradient(160deg, #fef3c7 0%, #fcd34d 100%);
		color: #1f1d12;
		border: 2px solid rgba(0, 0, 0, 0.15);
		display: block;
	}

	.card-trading h3 {
		margin: 0.25rem 0 0.5rem;
		font-size: 1.1rem;
	}

	.card-trading p {
		font-size: 0.85rem;
		line-height: 1.4;
		margin: 0.5rem 0 0;
	}

	.card-art {
		font-size: 4rem;
		text-align: center;
		padding: 0.5rem 0;
	}

	.card-meta {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
		color: #6b5800;
	}

	.rare {
		color: #b91c1c;
		font-weight: 600;
	}

	.legendary {
		color: #c026d3;
		font-weight: 700;
	}

	.badge-pro {
		display: inline-block;
		padding: 0.5rem 1.1rem;
		border-radius: 999px;
		background: linear-gradient(135deg, #240046, #5a189a);
		color: white;
		font-weight: 700;
		font-size: 0.78rem;
		letter-spacing: 0.06em;
	}

	.badge-gold {
		background: linear-gradient(135deg, #7a4f01, #e6b800);
		color: #1a1100;
	}

	.badge-rainbow {
		background: linear-gradient(135deg, #ff006e, #06d6a0, #118ab2);
	}

	.achievement {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.25rem;
		border-radius: 12px;
		background: linear-gradient(135deg, #fffbeb, #fef3c7);
		color: #4a3500;
		max-width: 360px;
	}

	.achievement-icon {
		font-size: 2rem;
	}

	.achievement-body h3 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
	}

	.achievement-body p {
		margin: 0;
		font-size: 0.85rem;
		line-height: 1.4;
	}

	.product {
		width: 160px;
		margin: 0;
		padding: 1rem;
		border-radius: 12px;
		background: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.product-img {
		width: 100%;
		aspect-ratio: 1;
		border-radius: 8px;
		display: grid;
		place-items: center;
		font-size: 2.5rem;
	}

	.product figcaption {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
	}

	.card-compose {
		width: 280px;
		padding: 1.5rem;
		border-radius: 16px;
		background: linear-gradient(160deg, #1a1a2e 0%, #2a1a3e 100%);
		color: #f5f5ff;
		border: 2px solid rgba(255, 255, 255, 0.15);
		display: block;
	}

	.card-compose h3 {
		margin: 0.25rem 0 0.5rem;
		font-size: 1.25rem;
		text-align: center;
	}

	.card-compose p {
		font-size: 0.85rem;
		line-height: 1.4;
		margin: 0.5rem 0 0;
	}

	.card-art-compose {
		font-size: 4.5rem;
		text-align: center;
		padding: 0.5rem 0;
	}

	.meta {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.25rem;
		margin-top: 3rem;
	}

	.card {
		padding: 1.25rem;
		border-radius: 12px;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
	}

	.card h3 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
	}

	.card p {
		font-size: 0.9rem;
		line-height: 1.55;
		color: #475569;
		margin: 0 0 0.5rem;
	}

	.card p:last-child {
		margin-bottom: 0;
	}

	.card code {
		background: #e2e8f0;
		padding: 0.1rem 0.35rem;
		border-radius: 4px;
		font-size: 0.85em;
	}
</style>
