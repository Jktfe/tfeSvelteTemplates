<script lang="ts">
	import SplitFlap from '$lib/components/SplitFlap.svelte';
	import { onMount } from 'svelte';

	let clockValue = $state('12:34:56');
	let counterValue = $state('00000');
	let destinationIdx = $state(0);
	let destinations = ['LONDON', 'PARIS  ', 'TOKYO  ', 'NEW YORK', 'SYDNEY '];
	let destination = $derived(destinations[destinationIdx % destinations.length]);

	function pad(n: number, w = 2): string {
		return String(n).padStart(w, '0');
	}

	function tickClock() {
		const now = new Date();
		clockValue = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
	}

	function bumpCounter() {
		const next = (parseInt(counterValue, 10) + 1) % 100000;
		counterValue = pad(next, 5);
	}

	function rotateDestination() {
		destinationIdx = (destinationIdx + 1) % destinations.length;
	}

	onMount(() => {
		tickClock();
		const clock = setInterval(tickClock, 1000);
		const dest = setInterval(rotateDestination, 4500);
		return () => {
			clearInterval(clock);
			clearInterval(dest);
		};
	});
</script>

<svelte:head>
	<title>SplitFlap · Svelte 5 Templates</title>
	<meta
		name="description"
		content="Mechanical Solari-board character flip — 3D top-half drops down through intermediate charset positions, bottom catches the new glyph, per-character stagger creates a left-to-right cascade. Pure CSS 3D, asset-free, prefers-reduced-motion safe."
	/>
</svelte:head>

<main class="page">
	<header class="intro">
		<a class="back" href="/">← All components</a>
		<h1>SplitFlap</h1>
		<p class="lede">
			Mechanical Solari-board character flip. Each character is a 3D card; on a value change the
			top half rotates down through intermediate charset positions while the bottom catches the new
			glyph. Per-character stagger creates a left-to-right cascade — the same effect old airport
			arrivals boards used.
		</p>
	</header>

	<section class="demo-block board">
		<div class="block-label">
			<h2>Departures board</h2>
			<p class="block-help">Solari charset · forward direction · auto-rotates every 4.5 s</p>
		</div>
		<div class="board-frame">
			<div class="board-row">
				<span class="board-eyebrow">Now boarding</span>
				<SplitFlap value={destination} charset="solari" size="lg" stagger={70} flipDuration={320} />
			</div>
			<div class="board-row board-meta">
				<span class="board-meta-label">Gate</span>
				<SplitFlap value="A14" charset="alnum" size="md" stagger={50} flipDuration={260} />
				<span class="board-meta-label">Status</span>
				<SplitFlap value="ON TIME" charset="alpha" size="md" stagger={45} flipDuration={250} />
			</div>
		</div>
	</section>

	<section class="demo-block">
		<div class="block-label">
			<h2>Live clock</h2>
			<p class="block-help">Solari charset · ticks every second</p>
		</div>
		<div class="centred">
			<SplitFlap value={clockValue} charset="solari" size="lg" stagger={40} flipDuration={240} />
		</div>
	</section>

	<section class="demo-block">
		<div class="block-label">
			<h2>Counter — shortest path</h2>
			<p class="block-help">Digits only · click to bump</p>
		</div>
		<div class="centred">
			<button class="counter-btn" type="button" onclick={bumpCounter}>
				<SplitFlap
					value={counterValue}
					charset="digits"
					size="lg"
					direction="shortest"
					stagger={50}
					flipDuration={260}
				/>
				<span class="counter-hint">+1</span>
			</button>
		</div>
	</section>

	<section class="demo-block">
		<div class="block-label">
			<h2>Cascade intensity</h2>
			<p class="block-help">Same value, three intensities</p>
		</div>
		<div class="grid-3">
			<div class="cell">
				<span class="cell-tag">0.5×</span>
				<SplitFlap value="HELLO" charset="alpha" size="md" intensity={0.5} stagger={80} />
			</div>
			<div class="cell">
				<span class="cell-tag">1.0×</span>
				<SplitFlap value="HELLO" charset="alpha" size="md" intensity={1} stagger={80} />
			</div>
			<div class="cell">
				<span class="cell-tag">1.6×</span>
				<SplitFlap value="HELLO" charset="alpha" size="md" intensity={1.6} stagger={80} />
			</div>
		</div>
	</section>

	<section class="meta">
		<div class="meta-card">
			<h2>Why a charset</h2>
			<p>
				Solari boards mechanically traverse a fixed sequence of glyphs because every flap is
				physical. SplitFlap mirrors that — each cell ticks through the charset one position at a
				time, so going from A → Z visibly costs more flips than A → B. That's the iconic feel.
				Use <code>direction="shortest"</code> when you want to lose the mechanical character (e.g.
				clocks, counters where minimum motion reads as snappier).
			</p>
		</div>

		<div class="meta-card">
			<h2>Stagger × intensity</h2>
			<p>
				<code>stagger</code> is the per-cell start delay; <code>intensity</code> multiplies it. The
				combination is what makes the cascade feel like wind moving through the row rather than
				every cell flipping at once. Lower intensity for a snappier reveal, higher for a luxurious
				wave.
			</p>
		</div>

		<div class="meta-card">
			<h2>SSR-safe first paint</h2>
			<p>
				The component renders the target value statically on the server and on first paint, then
				kicks off the cascade only after <code>onMount</code>. Server HTML matches the post-cascade
				state — no hydration mismatch warning, no flash of empty cells.
			</p>
		</div>

		<div class="meta-card">
			<h2>Reduced motion</h2>
			<p>
				<code>prefers-reduced-motion: reduce</code> swaps glyphs instantly. CSS animations are also
				disabled at the stylesheet layer as a belt-and-braces guarantee, and the component listens
				for live changes to the media query rather than only reading it once at mount.
			</p>
		</div>

		<div class="meta-card">
			<h2>Accessible by default</h2>
			<p>
				The wrapper is a <code>role="group"</code> aria-live region. <code>aria-label</code> always
				reflects the target value, so screen readers announce the final string — they never see the
				intermediate flip glyphs. <code>aria-busy</code> toggles while the cascade is in flight.
			</p>
		</div>

		<div class="meta-card">
			<h2>Restyle via CSS variables</h2>
			<p>
				Override <code>--sf-bg</code>, <code>--sf-bg-hi</code>, <code>--sf-fg</code>,
				<code>--sf-radius</code>, <code>--sf-divider</code>, <code>--sf-cell-w</code>, or
				<code>--sf-cell-h</code> on the root or on a parent to retheme without touching the
				component.
			</p>
		</div>
	</section>
</main>

<style>
	.page {
		min-height: 100vh;
		background: #fff;
		color: #0f172a;
	}
	.intro {
		max-width: 900px;
		margin: 0 auto;
		padding: 3rem 1.5rem 2rem;
	}
	.back {
		display: inline-block;
		margin-bottom: 1.25rem;
		font-size: 0.85rem;
		color: #475569;
		text-decoration: none;
	}
	.back:hover {
		color: #0f172a;
	}
	.intro h1 {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		font-weight: 700;
	}
	.lede {
		margin: 0;
		max-width: 60ch;
		line-height: 1.6;
		color: #475569;
	}

	.demo-block {
		max-width: 1100px;
		margin: 2rem auto;
		padding: 0 1.5rem;
	}
	.block-label {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}
	.block-label h2 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #1e293b;
	}
	.block-help {
		margin: 0;
		font-size: 0.85rem;
		color: #64748b;
	}

	.board-frame {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 2rem;
		background: linear-gradient(180deg, #18223a 0%, #0a1020 100%);
		border-radius: 1rem;
		box-shadow:
			0 30px 60px -30px rgba(15, 23, 42, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.06);
	}
	.board-row {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		flex-wrap: wrap;
	}
	.board-eyebrow {
		font-family: ui-sans-serif, system-ui, sans-serif;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: #94a3b8;
	}
	.board-meta {
		gap: 1rem;
	}
	.board-meta-label {
		font-family: ui-sans-serif, system-ui, sans-serif;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: #64748b;
	}

	.centred {
		display: flex;
		justify-content: center;
		padding: 1.5rem;
		background: #f8fafc;
		border-radius: 0.75rem;
		border: 1px solid #e2e8f0;
	}
	.counter-btn {
		display: inline-flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.5rem;
		background: transparent;
		border: 0;
		cursor: pointer;
		font: inherit;
	}
	.counter-btn:focus-visible {
		outline: 2px solid #6366f1;
		outline-offset: 4px;
		border-radius: 0.5rem;
	}
	.counter-hint {
		font-family: ui-sans-serif, system-ui, sans-serif;
		font-size: 0.85rem;
		font-weight: 600;
		color: #6366f1;
	}

	.grid-3 {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
	}
	.cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1.25rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
	}
	.cell-tag {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.75rem;
		color: #64748b;
		letter-spacing: 0.08em;
	}

	.meta {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
		max-width: 1100px;
		margin: 3rem auto 4rem;
		padding: 0 1.5rem;
	}
	.meta-card {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
		padding: 1.25rem 1.5rem;
	}
	.meta-card h2 {
		margin: 0 0 0.75rem;
		font-size: 0.95rem;
		font-weight: 600;
	}
	.meta-card p {
		font-size: 0.875rem;
		line-height: 1.55;
		color: #334155;
	}
	.meta-card code {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.8125rem;
		background: #fff;
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		border: 1px solid #e2e8f0;
	}
</style>
