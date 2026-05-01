<!--
	============================================================
	PortfolioPhotographer Demo Page (TFE shell)
	============================================================

	Migrated onto ComponentPageShell. The editorial hero, lens
	wireframe, drifting photo reel, and Halton-scatter dots all
	stay intact — only the surrounding scaffold is shared with
	the rest of the catalogue.
-->

<script lang="ts">
	import PortfolioPhotographer from '$lib/components/PortfolioPhotographer/PortfolioPhotographer.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/portfolio-photographer')!;

	const usageSnippet = `<script>
  import PortfolioPhotographer from
    '$lib/components/PortfolioPhotographer/PortfolioPhotographer.svelte';
  import { SAMPLE_PHOTOS } from
    '$lib/components/PortfolioPhotographer/photos';
</${'script'}>

<PortfolioPhotographer
  photos={SAMPLE_PHOTOS}
  name="Aria Lindqvist"
  tagline="photographs of light, distance, and quiet rooms"
  years="2018 — 2026"
  theme="dark"
/>`;

	const codeExplanation =
		'PortfolioPhotographer composes a wireframe lens SVG, a marquee-style photo reel, a Halton low-discrepancy dot scatter, and a serif display name into one editorial hero. Each photo tile is a three-stop CSS gradient (asset-free fallback) — pass real images through the photos prop to swap in your own work. The reel auto-pauses on hover/focus and respects prefers-reduced-motion.';
</script>

<svelte:head>
	<title>PortfolioPhotographer — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Editorial photographer-portfolio hero for Svelte 5: wireframe lens, drifting photo reel, Halton-scatter focal dots. Asset-free CSS gradients."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'Editorial', 'Marquee', 'Halton scatter', 'Reduced motion']}
>
	{#snippet demo()}
		<div class="pp-demo">
			<div class="pp-demo__frame pp-demo__frame--dark">
				<PortfolioPhotographer theme="dark" class="pp-demo__hero" />
			</div>

			<div class="pp-demo__frame pp-demo__frame--light">
				<PortfolioPhotographer
					theme="light"
					name="Mira Holm"
					tagline="quiet portraits, slow streets"
					years="2020 — 2026"
					class="pp-demo__hero"
				/>
			</div>

			<div class="pp-demo__notes">
				<div class="pp-demo__note">
					<h3>Try it</h3>
					<ul>
						<li>Hover the reel — the drift pauses</li>
						<li>Tab into a tile — drift pauses and the tile lifts</li>
						<li>
							Toggle <code>prefers-reduced-motion</code> — drift, lens spin and dot pulse stop
						</li>
					</ul>
				</div>
				<div class="pp-demo__note">
					<h3>Asset-free by default</h3>
					<p>
						No external images, no Unsplash, no GSAP. Each tile is a three-stop CSS gradient with an
						accent vignette. Pass real <code>src</code> values through the
						<code>photos</code> prop to swap in your own work.
					</p>
				</div>
				<div class="pp-demo__note">
					<h3>Halton scatter</h3>
					<p>
						The 24 dots use the <code>halton(i, 2)</code> / <code>halton(i, 3)</code>
						low-discrepancy sequence biased toward the centre — scattered, not random; no clumping,
						no grid feel.
					</p>
				</div>
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
					<td><code>photos</code></td>
					<td><code>Photo[]</code></td>
					<td><code>SAMPLE_PHOTOS</code></td>
					<td>
						Array of photo descriptors (id, gradient stops, optional <code>src</code>). Each
						descriptor renders as one tile in the drifting reel.
					</td>
				</tr>
				<tr>
					<td><code>name</code></td>
					<td><code>string</code></td>
					<td><code>'Aria Lindqvist'</code></td>
					<td>Photographer name rendered as the editorial <code>&lt;h1&gt;</code>.</td>
				</tr>
				<tr>
					<td><code>tagline</code></td>
					<td><code>string</code></td>
					<td><code>'photographs of light, distance, …'</code></td>
					<td>Subtitle line beneath the name.</td>
				</tr>
				<tr>
					<td><code>years</code></td>
					<td><code>string</code></td>
					<td><code>'2018 — 2026'</code></td>
					<td>Date range shown in the eyebrow.</td>
				</tr>
				<tr>
					<td><code>dotCount</code></td>
					<td><code>number</code></td>
					<td><code>24</code></td>
					<td>Number of Halton-scatter focal dots in the background.</td>
				</tr>
				<tr>
					<td><code>duration</code></td>
					<td><code>number</code></td>
					<td><code>36</code></td>
					<td>Seconds per full reel-drift cycle.</td>
				</tr>
				<tr>
					<td><code>theme</code></td>
					<td><code>'light' | 'dark'</code></td>
					<td><code>'dark'</code></td>
					<td>Editorial palette — warm dark or paper light.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra classes on the outer <code>&lt;section&gt;</code>.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.pp-demo {
		display: grid;
		gap: 24px;
	}

	.pp-demo__frame {
		position: relative;
		border-radius: var(--r-2);
		overflow: hidden;
		border: 1px solid var(--border);
		box-shadow:
			0 30px 60px -30px rgba(15, 23, 42, 0.25),
			0 4px 12px -2px rgba(15, 23, 42, 0.08);
	}
	.pp-demo__frame--dark {
		background: #0c0a09;
	}
	.pp-demo__frame--light {
		background: #fafaf9;
	}

	/* The component is min-height: 100vh by default — clamp it so two
	   themed frames fit comfortably on one page. */
	:global(.pp-demo__hero) {
		min-height: clamp(420px, 60vh, 640px) !important;
	}

	.pp-demo__notes {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 12px;
	}
	.pp-demo__note {
		padding: 16px 18px;
		border-radius: var(--r-2);
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.pp-demo__note h3 {
		margin: 0 0 8px;
		font-family: var(--font-display);
		font-size: 14px;
		font-weight: 500;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--fg-1);
	}
	.pp-demo__note p,
	.pp-demo__note li {
		margin: 0;
		font-size: 13px;
		line-height: 1.55;
		color: var(--fg-2);
	}
	.pp-demo__note ul {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 4px;
	}
	.pp-demo__note code {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 12px;
		padding: 1px 5px;
		border-radius: 4px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--fg-1);
	}
</style>
