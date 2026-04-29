<script lang="ts">
	import OrbitalRing from '$lib/components/OrbitalRing.svelte';

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

	const stars = [
		{ id: 1 },
		{ id: 2 },
		{ id: 3 },
		{ id: 4 },
		{ id: 5 },
		{ id: 6 },
		{ id: 7 },
		{ id: 8 },
		{ id: 9 },
		{ id: 10 }
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
</script>

<svelte:head>
	<title>OrbitalRing — TFE Svelte Templates</title>
</svelte:head>

<main class="page">
	<header class="hero">
		<div class="hero__lede">
			<span class="badge">Helpful UX</span>
			<h1>🛸 OrbitalRing</h1>
			<p>
				A circular orbital layout for arbitrary children. Items distribute evenly
				around a ring that auto-rotates clockwise or counter-clockwise — each one
				stays upright in world frame (planet orientation) or rotates with the ring
				(constellation orientation). Pure CSS transforms, single rAF dispatcher,
				zero dependencies.
			</p>
		</div>
	</header>

	<section class="demo">
		<div class="demo__head">
			<h2>Solar system — planets orbit a star</h2>
			<p>Six planets orbit a centred sun. Counter-rotation on, items stay upright.</p>
		</div>
		<div class="demo__stage demo__stage--space">
			<OrbitalRing items={planets} radius={200} spinDurationMs={30000} itemSize={72}>
				{#snippet center()}
					<div class="sun" aria-hidden="true">☀</div>
				{/snippet}
				{#snippet item(p)}
					<div class="planet" style:background={p.color} title={p.name}>
						<span class="planet__sym">{p.symbol}</span>
					</div>
				{/snippet}
			</OrbitalRing>
		</div>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Testimonial orbit — counter-clockwise, slow</h2>
			<p>
				A 60-second revolution lets readers parse each card as it drifts past. Hover
				the ring to pause.
			</p>
		</div>
		<div class="demo__stage">
			<OrbitalRing
				items={testimonials}
				radius={210}
				spinDurationMs={60000}
				direction="counter-clockwise"
				itemSize={150}
			>
				{#snippet item(t)}
					<figure class="quote">
						<blockquote>"{t.quote}"</blockquote>
						<figcaption>
							<strong>{t.name}</strong> &middot; {t.role}
						</figcaption>
					</figure>
				{/snippet}
			</OrbitalRing>
		</div>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Constellation — items rotate with the ring</h2>
			<p>
				<code>counterRotateItems={'{false}'}</code> turns every star into a fixed
				point on the ring. The whole constellation rotates together.
			</p>
		</div>
		<div class="demo__stage demo__stage--constellation">
			<OrbitalRing
				items={stars}
				radius={170}
				spinDurationMs={45000}
				counterRotateItems={false}
				itemSize={32}
			>
				{#snippet item()}
					<span class="star" aria-hidden="true">★</span>
				{/snippet}
			</OrbitalRing>
		</div>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Live controls</h2>
			<p>Adjust radius, spin duration, direction, and orientation modes in real time.</p>
		</div>
		<div class="controls">
			<label>
				Radius: <strong>{liveRadius}px</strong>
				<input type="range" min="60" max="280" step="10" bind:value={liveRadius} />
			</label>
			<label>
				Spin duration: <strong>{(liveSpinMs / 1000).toFixed(1)}s</strong>
				<input type="range" min="2000" max="60000" step="500" bind:value={liveSpinMs} />
			</label>
			<label>
				Direction:
				<select bind:value={liveDirection}>
					<option value="clockwise">Clockwise</option>
					<option value="counter-clockwise">Counter-clockwise</option>
				</select>
			</label>
			<label class="check">
				<input type="checkbox" bind:checked={liveAutoSpin} />
				Auto-spin
			</label>
			<label class="check">
				<input type="checkbox" bind:checked={livePauseOnHover} />
				Pause on hover
			</label>
			<label class="check">
				<input type="checkbox" bind:checked={liveCounterRotate} />
				Counter-rotate items (world-upright)
			</label>
		</div>
		<div class="demo__stage">
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
					<div class="emoji">{d.emoji}</div>
				{/snippet}
			</OrbitalRing>
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

	.hero__lede {
		max-width: 820px;
	}

	.badge {
		display: inline-block;
		background: #ede9fe;
		color: #5b21b6;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
		margin-bottom: 0.75rem;
	}

	h1 {
		font-size: 2.5rem;
		margin: 0 0 1rem;
	}

	.hero p {
		font-size: 1.125rem;
		color: #475569;
		line-height: 1.6;
		margin: 0;
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
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 2.5rem 1rem;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 480px;
	}

	.demo__stage--space {
		background: radial-gradient(circle at 50% 50%, #1e1b4b, #020617);
		min-height: 520px;
	}

	.demo__stage--constellation {
		background: radial-gradient(circle at 50% 50%, #0f172a, #000);
		min-height: 440px;
	}

	.sun {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #fde68a, #f59e0b 60%, #b45309);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.75rem;
		color: #78350f;
		box-shadow: 0 0 40px 10px rgba(251, 191, 36, 0.5);
	}

	.planet {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #0f172a;
		font-weight: 700;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
	}

	.planet__sym {
		font-size: 1.5rem;
	}

	.quote {
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1rem;
		margin: 0;
		text-align: center;
		box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
	}

	.quote blockquote {
		margin: 0 0 0.5rem;
		font-style: italic;
		color: #1e293b;
		font-size: 0.875rem;
		line-height: 1.4;
	}

	.quote figcaption {
		font-size: 0.75rem;
		color: #64748b;
	}

	.star {
		display: inline-block;
		font-size: 1.5rem;
		color: #fde68a;
		text-shadow: 0 0 8px rgba(251, 191, 36, 0.7);
	}

	.emoji {
		font-size: 1.75rem;
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

	.controls label.check {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}

	.controls input[type='range'],
	.controls select {
		width: 100%;
	}
</style>
