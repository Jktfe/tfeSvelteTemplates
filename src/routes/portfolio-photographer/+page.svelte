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

	// ---------------------------------------------------------------
	// Interactive playground state — drives the third (live) instance.
	// ---------------------------------------------------------------
	let playTheme = $state<'light' | 'dark'>('dark');
	let playDotCount = $state<number>(24);
	let playDuration = $state<number>(36);

	// Derived label for the live state strip — converts the duration
	// (seconds per full reel cycle) into a more friendly "drift speed"
	// percentage where shorter cycles read as faster.
	const driftSpeedPct = $derived(Math.round((36 / playDuration) * 100));
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
			<!-- Mounted-variant gallery: stacks on mobile, side-by-side on tablet+. -->
			<div class="pp-demo__gallery">
				<section class="pp-demo__variant">
					<h4>Dark — default voice</h4>
					<p class="pp-demo__hint">
						Warm dark palette, full default photo set, Aria Lindqvist as the byline.
					</p>
					<div class="pp-demo__frame pp-demo__frame--dark">
						<PortfolioPhotographer theme="dark" class="pp-demo__hero" />
					</div>
				</section>

				<section class="pp-demo__variant">
					<h4>Light — paper edit</h4>
					<p class="pp-demo__hint">
						Same component, paper-light surface, custom name and tagline. Glow opacity adapts.
					</p>
					<div class="pp-demo__frame pp-demo__frame--light">
						<PortfolioPhotographer
							theme="light"
							name="Mira Holm"
							tagline="quiet portraits, slow streets"
							years="2020 — 2026"
							class="pp-demo__hero"
						/>
					</div>
				</section>
			</div>

			<!-- Interactive playground: one live instance, three controls. -->
			<section class="pp-demo__playground" aria-labelledby="pp-playground-title">
				<header class="pp-demo__playground-head">
					<h4 id="pp-playground-title">Interactive playground</h4>
					<p>Adjust the live instance below — every control rebinds the same hero.</p>
				</header>

				<div class="pp-demo__controls">
					<div class="pp-control">
						<span class="pp-control__label">Theme</span>
						<div class="pp-control__buttons">
							<button
								class="pp-btn"
								class:pp-btn--active={playTheme === 'dark'}
								onclick={() => (playTheme = 'dark')}
								type="button"
							>
								Dark
							</button>
							<button
								class="pp-btn"
								class:pp-btn--active={playTheme === 'light'}
								onclick={() => (playTheme = 'light')}
								type="button"
							>
								Light
							</button>
						</div>
					</div>

					<div class="pp-control">
						<label class="pp-control__label" for="pp-dotcount">
							Dot count <span class="pp-control__value">{playDotCount}</span>
						</label>
						<input
							id="pp-dotcount"
							type="range"
							min="0"
							max="48"
							step="1"
							bind:value={playDotCount}
						/>
					</div>

					<div class="pp-control">
						<label class="pp-control__label" for="pp-duration">
							Drift duration <span class="pp-control__value">{playDuration}s</span>
						</label>
						<input
							id="pp-duration"
							type="range"
							min="12"
							max="80"
							step="2"
							bind:value={playDuration}
						/>
					</div>
				</div>

				<div
					class="pp-demo__frame"
					class:pp-demo__frame--dark={playTheme === 'dark'}
					class:pp-demo__frame--light={playTheme === 'light'}
				>
					<PortfolioPhotographer
						theme={playTheme}
						dotCount={playDotCount}
						duration={playDuration}
						class="pp-demo__hero"
					/>
				</div>

				<!-- Live state strip — derived speed from the duration prop. -->
				<div class="pp-demo__state" role="status" aria-live="polite">
					<span>Theme: <code>{playTheme}</code></span>
					<span>Dots: <code>{playDotCount}</code></span>
					<span>Drift speed: <code>{driftSpeedPct}%</code> of default</span>
				</div>
			</section>

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
						The dots use the <code>halton(i, 2)</code> / <code>halton(i, 3)</code>
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
		gap: 28px;
	}

	/* Side-by-side hero pair on tablet+, stacks on mobile.
	   minmax(360px, 1fr) lets each variant own a full row when there
	   isn't room for two — no media-query needed. */
	.pp-demo__gallery {
		display: grid;
		gap: 20px;
		grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
	}
	.pp-demo__variant {
		display: grid;
		gap: 8px;
	}
	.pp-demo__variant h4 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 14px;
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--fg-1);
	}
	.pp-demo__hint {
		margin: 0 0 6px;
		font-size: 13px;
		line-height: 1.55;
		color: var(--fg-2);
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

	/* The component now defaults to clamp(420px, 60vh, 720px) — no
	   need for a !important override. Slightly tighter ceiling so
	   the playground instance plays nicely with the controls above. */
	:global(.pp-demo__hero) {
		min-height: clamp(380px, 56vh, 600px);
	}

	/* ---- Playground ----------------------------------------------- */
	.pp-demo__playground {
		display: grid;
		gap: 16px;
		padding: 18px 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.pp-demo__playground-head h4 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 16px;
		font-weight: 500;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.pp-demo__playground-head p {
		margin: 4px 0 0;
		font-size: 13px;
		line-height: 1.55;
		color: var(--fg-2);
	}

	.pp-demo__controls {
		display: grid;
		gap: 14px;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}
	.pp-control {
		display: grid;
		gap: 8px;
	}
	.pp-control__label {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}
	.pp-control__value {
		font-size: 12px;
		color: var(--fg-1);
		letter-spacing: 0.04em;
		text-transform: none;
	}
	.pp-control__buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.pp-btn {
		appearance: none;
		border: 1px solid var(--border);
		background: var(--surface);
		padding: 7px 14px;
		border-radius: var(--r-1);
		font-size: 13px;
		cursor: pointer;
		color: var(--fg-1);
		transition: all var(--dur-fast, 120ms) ease;
	}
	.pp-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.pp-btn--active {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--fg-on-dark, #ffffff);
	}
	.pp-control input[type='range'] {
		width: 100%;
		accent-color: var(--accent);
	}

	.pp-demo__state {
		display: flex;
		flex-wrap: wrap;
		gap: 14px 22px;
		padding: 10px 14px;
		font-size: 13px;
		color: var(--fg-2);
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-1);
	}
	.pp-demo__state code {
		font-family: var(--font-mono);
		font-size: 12px;
		padding: 1px 6px;
		border-radius: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--fg-1);
	}

	/* ---- Notes (unchanged behaviour, kept for context) ------------ */
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
