<script lang="ts">
	import CardStackMotionFlip from '$lib/components/CardStackMotionFlip.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const heroCards = $derived(data.cards.slice(0, 5));
	const compactCards = $derived(data.cards.slice(0, 4));
</script>

<svelte:head>
	<title>CardStackMotionFlip | TFE Svelte Templates</title>
	<meta
		name="description"
		content="Standalone CardStackMotionFlip template with scoped keyboard control and 4-direction rolling deck motion."
	/>
</svelte:head>

<main class="page">
	<section class="intro" aria-labelledby="page-title">
		<div class="intro__copy">
			<a class="back" href="/cardstack">Back to CardStack</a>
			<p class="eyebrow">Cards and layout</p>
			<h1 id="page-title">CardStackMotionFlip</h1>
			<p class="lede">
				A focused 3D deck template for swipeable product, gallery, and profile stacks.
			</p>
		</div>
		<DatabaseStatus
			usingDatabase={data.usingDatabase}
			source={data.dataSource}
			message={data.dataSourceMessage}
			class="status-badge"
		/>
	</section>

	<section class="showcase" aria-label="CardStackMotionFlip demo">
		<div class="stage stage--primary">
			<CardStackMotionFlip cards={heroCards} cardWidth={280} cardHeight={380} cardGap={38} />
		</div>

		<div class="control-panel" aria-label="Template notes">
			<div>
				<span class="metric">4</span>
				<span class="label">roll directions</span>
			</div>
			<div>
				<span class="metric">0</span>
				<span class="label">animation deps</span>
			</div>
			<div>
				<span class="metric">1</span>
				<span class="label">focused deck</span>
			</div>
		</div>
	</section>

	<section class="variant-grid" aria-label="CardStackMotionFlip variants">
		<div class="variant">
			<header>
				<h2>Compact</h2>
				<p>Smaller cards for constrained panels and mobile-first layouts.</p>
			</header>
			<div class="stage stage--compact">
				<CardStackMotionFlip
					cards={compactCards}
					cardWidth={230}
					cardHeight={320}
					cardGap={28}
					swipeThreshold={60}
				/>
			</div>
		</div>

		<div class="variant">
			<header>
				<h2>Flat Motion</h2>
				<p>Same deck choreography with 3D rotation disabled.</p>
			</header>
			<div class="stage stage--compact">
				<CardStackMotionFlip
					cards={compactCards}
					cardWidth={230}
					cardHeight={320}
					cardGap={28}
					enable3D={false}
				/>
			</div>
		</div>
	</section>
</main>

<style>
	.page {
		--page-bg: #f8fafc;
		--page-text: #0f172a;
		--page-muted: #475569;
		--panel-bg: #ffffff;
		--panel-border: #dbe3ef;
		--stage-bg-a: #e0f2fe;
		--stage-bg-b: #f8fafc;
		--accent: #2563eb;

		min-height: 100vh;
		background:
			linear-gradient(180deg, rgba(37, 99, 235, 0.08), transparent 34rem),
			var(--page-bg);
		color: var(--page-text);
		padding: 3rem 1.25rem 4rem;
	}

	.intro,
	.showcase,
	.variant-grid {
		width: min(1120px, 100%);
		margin: 0 auto;
	}

	.intro {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.intro__copy {
		min-width: 0;
	}

	.back {
		display: inline-flex;
		margin-bottom: 1rem;
		color: var(--accent);
		font-weight: 700;
		text-decoration: none;
	}

	.back:hover {
		text-decoration: underline;
	}

	.eyebrow {
		margin: 0 0 0.5rem;
		color: var(--page-muted);
		font-size: 0.8rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	h1,
	h2,
	p {
		margin: 0;
	}

	h1 {
		font-size: clamp(2.25rem, 7vw, 4.5rem);
		line-height: 0.95;
		letter-spacing: 0;
	}

	.lede {
		max-width: 56ch;
		margin-top: 1rem;
		color: var(--page-muted);
		font-size: 1.05rem;
		line-height: 1.6;
	}

	.intro :global(.status-badge) {
		flex: 0 0 auto;
	}

	.showcase {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(220px, 300px);
		gap: 1rem;
		align-items: stretch;
	}

	.stage,
	.control-panel,
	.variant {
		border: 1px solid var(--panel-border);
		border-radius: 8px;
		background: var(--panel-bg);
	}

	.stage {
		display: grid;
		place-items: center;
		min-width: 0;
		overflow: hidden;
		background:
			radial-gradient(circle at 28% 18%, rgba(20, 184, 166, 0.2), transparent 16rem),
			linear-gradient(135deg, var(--stage-bg-a), var(--stage-bg-b));
	}

	.stage--primary {
		min-height: 520px;
		padding: 2rem;
	}

	.control-panel {
		display: grid;
		align-content: center;
		gap: 1rem;
		padding: 1rem;
	}

	.control-panel div {
		display: grid;
		gap: 0.35rem;
		padding: 1rem;
		border-radius: 8px;
		background: color-mix(in srgb, var(--panel-bg) 86%, var(--accent));
	}

	.metric {
		font-size: 2rem;
		font-weight: 900;
		line-height: 1;
	}

	.label {
		color: var(--page-muted);
		font-size: 0.8rem;
		font-weight: 800;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.variant-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.variant {
		display: grid;
		gap: 1rem;
		padding: 1rem;
	}

	.variant header {
		display: grid;
		gap: 0.35rem;
	}

	.variant h2 {
		font-size: 1rem;
	}

	.variant p {
		color: var(--page-muted);
		line-height: 1.5;
	}

	.stage--compact {
		min-height: 400px;
		padding: 1.25rem;
	}

	@media (max-width: 820px) {
		.page {
			padding-inline: 1rem;
		}

		.intro,
		.showcase,
		.variant-grid {
			grid-template-columns: 1fr;
		}

		.intro {
			align-items: flex-start;
			flex-direction: column;
		}

		.stage--primary {
			min-height: 470px;
			padding-inline: 0.75rem;
		}
	}

	@media (prefers-color-scheme: dark) {
		.page {
			--page-bg: #07111f;
			--page-text: #e5edf7;
			--page-muted: #a6b3c3;
			--panel-bg: #0d1827;
			--panel-border: #223247;
			--stage-bg-a: #123045;
			--stage-bg-b: #07111f;
			--accent: #5eead4;
		}
	}
</style>
