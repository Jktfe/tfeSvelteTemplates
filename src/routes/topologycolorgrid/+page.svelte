<script lang="ts">
	import TopologyColorGrid, { type TopologySwatch } from '$lib/components/TopologyColorGrid.svelte';

	const signalSwatches: TopologySwatch[] = [
		{ id: 'ink', name: 'Ink Mesh', hex: '#0f172a', label: 'Node A1' },
		{ id: 'snow', name: 'Snow Field', hex: '#f8fafc', label: 'Node B5' },
		{ id: 'teal', name: 'Teal Current', hex: '#0f766e', label: 'Node C2' },
		{ id: 'flame', name: 'Flame Route', hex: '#ea580c', label: 'Core 01' },
		{ id: 'sun', name: 'Sun Relay', hex: '#facc15', label: 'Node D4' },
		{ id: 'clay', name: 'Clay Memory', hex: '#fecaca', label: 'Node E3' },
		{ id: 'wine', name: 'Wine Gate', hex: '#7f1d1d', label: 'Node F6' }
	];
</script>

<svelte:head>
	<title>TopologyColorGrid | TFE Svelte Templates</title>
	<meta
		name="description"
		content="A full-bleed Svelte 5 template for a Three.js and GSAP powered 3D colour topology grid."
	/>
</svelte:head>

<main class="page">
	<TopologyColorGrid swatches={signalSwatches} />

	<section class="detail">
		<div>
			<p class="eyebrow">Template Notes</p>
			<h2>Layered swatches on a live topology plane</h2>
		</div>
		<div class="notes">
			<article>
				<h3>Three.js Wireframe</h3>
				<p>Background geometry is client-only, animated, and disposed on unmount.</p>
			</article>
			<article>
				<h3>Depth Controls</h3>
				<p>Cards can sit in a stacked z-plane or flatten for a calmer presentation.</p>
			</article>
			<article>
				<h3>Accessible Cards</h3>
				<p>Every swatch is a real button with focus states, labels, and readable colour text.</p>
			</article>
		</div>
	</section>
</main>

<style>
	.page {
		min-height: 100vh;
		background: #020617;
		color: #f8fafc;
	}

	.detail {
		width: min(1120px, calc(100% - 2rem));
		margin: 0 auto;
		padding: clamp(2.5rem, 6vw, 5rem) 0;
		display: grid;
		grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
		gap: 2rem;
	}

	.eyebrow {
		margin: 0 0 0.75rem;
		color: #fbbf24;
		font-size: 0.78rem;
		font-weight: 850;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	h2,
	h3,
	p {
		margin: 0;
	}

	h2 {
		font-size: clamp(1.8rem, 4vw, 3.4rem);
		line-height: 1.02;
		letter-spacing: 0;
	}

	.notes {
		display: grid;
		gap: 0.75rem;
	}

	.notes article {
		padding: 1rem;
		border: 1px solid rgba(148, 163, 184, 0.22);
		border-radius: 8px;
		background: rgba(15, 23, 42, 0.72);
	}

	.notes h3 {
		font-size: 1rem;
		line-height: 1.2;
	}

	.notes p {
		margin-top: 0.4rem;
		color: #cbd5e1;
		line-height: 1.55;
	}

	@media (max-width: 760px) {
		.detail {
			grid-template-columns: 1fr;
		}
	}
</style>
