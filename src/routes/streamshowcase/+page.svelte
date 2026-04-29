<script lang="ts">
	import StreamShowcase from '$lib/components/StreamShowcase/StreamShowcase.svelte';
	import type { Playlist } from '$lib/components/StreamShowcase/types';

	let lastSelected = $state<Playlist | null>(null);
	let active = $state(5);

	function handleSelect(p: Playlist) {
		lastSelected = p;
	}
</script>

<svelte:head>
	<title>StreamShowcase · Svelte 5 Templates</title>
	<meta
		name="description"
		content="Editorial streaming-platform shelf with brush-script hero and 10-card fan carousel. Click, drag or use arrow keys."
	/>
</svelte:head>

<main class="page">
	<header class="intro">
		<a class="back" href="/">← All components</a>
		<h1>StreamShowcase</h1>
		<p class="lede">
			A statement-piece editorial section combining a brush-script hero with a 10-card fan carousel
			that splays cards around a shared pivot below the deck. Click a side card to bring it to
			centre. Drag horizontally to spin the fan. Arrow keys, Home / End, Enter all wired.
		</p>
	</header>

	<StreamShowcase bind:active onSelect={handleSelect} class="showcase-frame" />

	<section class="meta">
		<div class="meta-card">
			<h2>State</h2>
			<dl>
				<dt>Active card index</dt>
				<dd><code>{active}</code></dd>
				<dt>Last selected playlist</dt>
				<dd>
					{#if lastSelected}
						<code>{lastSelected.slug}</code> — {lastSelected.title}
					{:else}
						<em>None yet — press Enter on the centre card</em>
					{/if}
				</dd>
			</dl>
		</div>

		<div class="meta-card">
			<h2>Try it</h2>
			<ul>
				<li><kbd>←</kbd> / <kbd>→</kbd> — browse</li>
				<li><kbd>Home</kbd> / <kbd>End</kbd> — jump to first / last</li>
				<li><kbd>Enter</kbd> on centre — select (fires <code>onSelect</code>)</li>
				<li>Click side card — bring to centre</li>
				<li>Drag horizontally — spin the fan, snap on release</li>
			</ul>
		</div>

		<div class="meta-card">
			<h2>M1 scope</h2>
			<p>
				This is milestone 1: hero + carousel + interactions only. The FLIP modal, inline YouTube
				playback, and <code>?playlist=slug</code> URL sync are scoped for M2 / M3.
			</p>
		</div>

		<div class="meta-card">
			<h2>Asset-free</h2>
			<p>
				No external images, no GSAP, no font CDN. Card art is pure CSS gradients with
				<code>color-mix()</code> tints. The brush-script title falls back through
				<code>'Caveat Brush' → 'Caveat' → cursive</code>; install
				<code>@fontsource/caveat-brush</code> in your app for crisp rendering.
			</p>
		</div>

		<div class="meta-card">
			<h2>Reduced motion</h2>
			<p>
				When <code>prefers-reduced-motion: reduce</code> is set: letter entrance is skipped, card
				deal-out is skipped, and drag-to-rotate is disabled. Click and keyboard navigation continue
				to work — just without the animated transitions between states.
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
		color: #475569;
		line-height: 1.6;
		max-width: 60ch;
	}

	:global(.showcase-frame) {
		border-radius: 1.25rem;
		margin: 0 1.5rem;
		max-width: calc(1400px - 3rem);
		margin-left: auto;
		margin-right: auto;
		box-shadow:
			0 50px 100px -40px rgba(15, 23, 42, 0.25),
			0 4px 12px -2px rgba(15, 23, 42, 0.08);
		overflow: hidden;
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
		letter-spacing: 0.02em;
	}
	.meta-card p,
	.meta-card li,
	.meta-card dt,
	.meta-card dd {
		font-size: 0.875rem;
		line-height: 1.55;
		color: #334155;
	}
	.meta-card ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.meta-card dl {
		margin: 0;
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.5rem 1rem;
	}
	.meta-card dt {
		color: #64748b;
		font-weight: 500;
	}
	.meta-card dd {
		margin: 0;
	}
	.meta-card code {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.8125rem;
		background: #fff;
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		border: 1px solid #e2e8f0;
	}
	.meta-card kbd {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.75rem;
		background: #fff;
		padding: 0.1rem 0.4rem;
		margin: 0 0.1rem;
		border: 1px solid #cbd5e1;
		border-bottom-width: 2px;
		border-radius: 0.25rem;
	}
</style>
