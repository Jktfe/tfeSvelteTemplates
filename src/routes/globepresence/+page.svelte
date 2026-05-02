<!--
	============================================================
	GlobePresence Demo Page (TFE shell)
	============================================================

	Live demo expanded to gold standard:
	  • Original 6-marker office globe preserved
	  • Three brand-coloured "presence sets" rendered side-by-side
	    (Live Users / Monthly Actives / Geographic Spread) with
	    distinct dot colours per preset
	  • Paused-rotation variant — same data, autoRotate={false}
	  • Mobile-sized 240px globe in a sidebar context
	  • Light-theme variant to show the palette switch

	The component runs a render loop on mount, so every globe is
	gated on `browser` to keep SSR clean.
-->

<script lang="ts">
	import { browser } from '$app/environment';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import GlobePresence from '$lib/components/GlobePresence.svelte';
	import type { GlobeMarker } from '$lib/types';

	const shell = catalogShellPropsForSlug('/globepresence')!;

	type Variant = 'offices' | 'presence' | 'paused' | 'mobile' | 'light';
	let variant = $state<Variant>('offices');

	// ---------------------------------------------------------------------------
	// Original office locations (6 markers, the existing demo)
	// ---------------------------------------------------------------------------
	const officeMarkers: GlobeMarker[] = [
		{ id: 'sf', name: 'San Francisco', lat: 37.7749, long: -122.4194, label: 'Headquarters' },
		{ id: 'ldn', name: 'London', lat: 51.5074, long: -0.1278, label: 'EMEA Hub' },
		{ id: 'tyo', name: 'Tokyo', lat: 35.6762, long: 139.6503, label: 'APAC Hub' },
		{ id: 'syd', name: 'Sydney', lat: -33.8688, long: 151.2093, label: 'Australia Office' },
		{ id: 'sao', name: 'São Paulo', lat: -23.5505, long: -46.6333, label: 'LATAM Hub' },
		{ id: 'cpt', name: 'Cape Town', lat: -33.9249, long: 18.4241, label: 'Africa Region' }
	];

	// ---------------------------------------------------------------------------
	// Three presence sets — same world, three different "user populations".
	// Each set has its own brand colour to show how `marker.color` lets you
	// tag a globe with meaning.
	// ---------------------------------------------------------------------------
	const liveUsers: GlobeMarker[] = [
		{ id: 'lu1', name: 'New York', lat: 40.7128, long: -74.006, color: '#22d3ee', value: 412 },
		{ id: 'lu2', name: 'London', lat: 51.5074, long: -0.1278, color: '#22d3ee', value: 318 },
		{ id: 'lu3', name: 'Berlin', lat: 52.52, long: 13.405, color: '#22d3ee', value: 184 },
		{ id: 'lu4', name: 'Singapore', lat: 1.3521, long: 103.8198, color: '#22d3ee', value: 142 },
		{ id: 'lu5', name: 'Sydney', lat: -33.8688, long: 151.2093, color: '#22d3ee', value: 96 }
	];

	const monthlyActives: GlobeMarker[] = [
		{ id: 'ma1', name: 'San Francisco', lat: 37.7749, long: -122.4194, color: '#a855f7', value: 14_280 },
		{ id: 'ma2', name: 'Toronto', lat: 43.6532, long: -79.3832, color: '#a855f7', value: 8_440 },
		{ id: 'ma3', name: 'London', lat: 51.5074, long: -0.1278, color: '#a855f7', value: 12_900 },
		{ id: 'ma4', name: 'Paris', lat: 48.8566, long: 2.3522, color: '#a855f7', value: 7_120 },
		{ id: 'ma5', name: 'Mumbai', lat: 19.076, long: 72.8777, color: '#a855f7', value: 6_640 },
		{ id: 'ma6', name: 'Tokyo', lat: 35.6762, long: 139.6503, color: '#a855f7', value: 9_800 },
		{ id: 'ma7', name: 'São Paulo', lat: -23.5505, long: -46.6333, color: '#a855f7', value: 5_290 }
	];

	const geographicSpread: GlobeMarker[] = [
		{ id: 'gs1', name: 'Reykjavík', lat: 64.1466, long: -21.9426, color: '#f97316' },
		{ id: 'gs2', name: 'Cairo', lat: 30.0444, long: 31.2357, color: '#f97316' },
		{ id: 'gs3', name: 'Nairobi', lat: -1.2921, long: 36.8219, color: '#f97316' },
		{ id: 'gs4', name: 'Buenos Aires', lat: -34.6037, long: -58.3816, color: '#f97316' },
		{ id: 'gs5', name: 'Auckland', lat: -36.8485, long: 174.7633, color: '#f97316' },
		{ id: 'gs6', name: 'Anchorage', lat: 61.2181, long: -149.9003, color: '#f97316' },
		{ id: 'gs7', name: 'Vladivostok', lat: 43.1155, long: 131.8855, color: '#f97316' },
		{ id: 'gs8', name: 'Cape Town', lat: -33.9249, long: 18.4241, color: '#f97316' }
	];

	const presenceSets = [
		{
			id: 'live',
			title: 'Live users',
			caption: 'Active sessions in the last 60 seconds',
			markers: liveUsers,
			color: '#22d3ee'
		},
		{
			id: 'monthly',
			title: 'Monthly actives',
			caption: '30-day rolling DAU rollup',
			markers: monthlyActives,
			color: '#a855f7'
		},
		{
			id: 'spread',
			title: 'Geographic spread',
			caption: 'Customer reach across continents',
			markers: geographicSpread,
			color: '#f97316'
		}
	];

	const codeExplanation =
		'GlobePresence renders an interactive sphere on a single &lt;canvas&gt; with a custom 60fps loop — no Three.js scene graph required. Markers are projected from latitude/longitude onto the sphere surface and tinted with a soft glow; pointer drag rotates the globe, and autoRotate keeps it drifting when idle. Each marker can carry a `color` to brand the dot. The render loop disposes its raf handle on destroy, so navigating away leaves no zombies.';
</script>

<svelte:head>
	<title>GlobePresence — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Canvas-based 3D globe with plottable markers, 60fps rotation, and pointer drag navigation."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Canvas 3D', '60fps', 'Pointer drag', 'Zero deps']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="globe-demo">
			<div class="globe-demo__tabs" role="tablist" aria-label="Globe variants">
				<button type="button" role="tab" class="globe-demo__tab" class:active={variant === 'offices'} aria-selected={variant === 'offices'} onclick={() => (variant = 'offices')}>Offices</button>
				<button type="button" role="tab" class="globe-demo__tab" class:active={variant === 'presence'} aria-selected={variant === 'presence'} onclick={() => (variant = 'presence')}>Presence sets</button>
				<button type="button" role="tab" class="globe-demo__tab" class:active={variant === 'paused'} aria-selected={variant === 'paused'} onclick={() => (variant = 'paused')}>Paused rotation</button>
				<button type="button" role="tab" class="globe-demo__tab" class:active={variant === 'mobile'} aria-selected={variant === 'mobile'} onclick={() => (variant = 'mobile')}>Mobile sidebar</button>
				<button type="button" role="tab" class="globe-demo__tab" class:active={variant === 'light'} aria-selected={variant === 'light'} onclick={() => (variant = 'light')}>Light theme</button>
			</div>

			<p class="globe-demo__hint">
				{#if variant === 'offices'}
					Six office locations, default theme. Drag to rotate manually — the auto-spin resumes when you release.
				{:else if variant === 'presence'}
					Three brand-coloured datasets side-by-side. Each dot inherits its preset's colour via the <code>marker.color</code> field.
				{:else if variant === 'paused'}
					Same offices, but <code>autoRotate={'{false}'}</code>. Use this when you need a static-looking hero whose only motion is on user interaction.
				{:else if variant === 'mobile'}
					A 240px globe nestled in a sidebar context — proves the canvas scales down without losing pointer accuracy.
				{:else}
					The light-theme palette pairs better with bright pages. Marker glows shift from cyan to deep blue.
				{/if}
			</p>

			{#if variant === 'offices'}
				<div class="globe-stage">
					{#if browser}
						<GlobePresence
							markers={officeMarkers}
							autoRotate
							rotationSpeed={0.003}
							class="globe-stage__globe"
						/>
					{:else}
						<div class="globe-stage__placeholder">Loading globe…</div>
					{/if}
				</div>

				<ul class="globe-legend" aria-label="Marker locations">
					{#each officeMarkers as marker (marker.id)}
						<li>
							<span class="globe-legend__dot" aria-hidden="true"></span>
							<span class="globe-legend__name">{marker.name}</span>
							<span class="globe-legend__label">{marker.label ?? ''}</span>
						</li>
					{/each}
				</ul>
			{:else if variant === 'presence'}
				<div class="globe-grid">
					{#each presenceSets as set (set.id)}
						<figure class="globe-grid__card">
							<figcaption class="globe-grid__caption">
								<span class="globe-grid__swatch" style="background: {set.color}; box-shadow: 0 0 8px {set.color}88;" aria-hidden="true"></span>
								<span class="globe-grid__title">{set.title}</span>
								<span class="globe-grid__sub">{set.caption}</span>
							</figcaption>
							<div class="globe-grid__stage">
								{#if browser}
									<GlobePresence
										markers={set.markers}
										autoRotate
										rotationSpeed={0.0025}
										class="globe-stage__globe"
									/>
								{:else}
									<div class="globe-stage__placeholder">Loading globe…</div>
								{/if}
							</div>
							<dl class="globe-grid__stats">
								<div><dt>Markers</dt><dd>{set.markers.length}</dd></div>
								<div><dt>Total value</dt><dd>{set.markers.reduce((s, m) => s + (m.value ?? 0), 0).toLocaleString('en-GB')}</dd></div>
							</dl>
						</figure>
					{/each}
				</div>
			{:else if variant === 'paused'}
				<div class="globe-stage globe-stage--paused">
					{#if browser}
						<GlobePresence
							markers={officeMarkers}
							autoRotate={false}
							class="globe-stage__globe"
						/>
					{:else}
						<div class="globe-stage__placeholder">Loading globe…</div>
					{/if}
				</div>
				<p class="globe-demo__note">
					Drag the sphere — manual rotation still works. Idle drift is disabled, so the view stays where you leave it.
				</p>
			{:else if variant === 'mobile'}
				<div class="globe-mobile">
					<div class="globe-mobile__sidebar">
						<h4>Live presence</h4>
						<p class="globe-mobile__caption">5 active regions</p>
						<div class="globe-mobile__stage">
							{#if browser}
								<GlobePresence
									markers={liveUsers}
									autoRotate
									rotationSpeed={0.004}
									class="globe-stage__globe"
								/>
							{:else}
								<div class="globe-stage__placeholder">Loading globe…</div>
							{/if}
						</div>
						<ul class="globe-mobile__list">
							{#each liveUsers as marker (marker.id)}
								<li>
									<span class="globe-legend__dot" style="background: {marker.color}; box-shadow: 0 0 6px {marker.color}88;" aria-hidden="true"></span>
									<span class="globe-legend__name">{marker.name}</span>
									<span class="globe-legend__label">{marker.value} users</span>
								</li>
							{/each}
						</ul>
					</div>
					<div class="globe-mobile__body">
						<h4>Article body</h4>
						<p>The 240px globe is sized to fit beside long-form prose. It keeps the viewer oriented to where activity is happening without commanding the page.</p>
						<p>Pointer drag is preserved at small sizes — but on touch devices, plan to widen the globe to ~280px so the rotation gesture has more room to land.</p>
					</div>
				</div>
			{:else}
				<div class="globe-stage globe-stage--light">
					{#if browser}
						<GlobePresence
							markers={geographicSpread}
							autoRotate
							rotationSpeed={0.0035}
							theme="light"
							class="globe-stage__globe"
						/>
					{:else}
						<div class="globe-stage__placeholder">Loading globe…</div>
					{/if}
				</div>
			{/if}

			<div class="globe-recipes">
				<h3 class="globe-recipes__title">Recipes</h3>
				<ul class="globe-recipes__list">
					<li>
						<strong>"Where our users are right now" hero.</strong> Pass live-session data with one brand colour. Set <code>rotationSpeed={'{0.003}'}</code> for a calm idle drift; users still get drag for inspection.
					</li>
					<li>
						<strong>Three-up dashboard.</strong> Render multiple globes in a CSS grid (the "Presence sets" tab above). Each globe owns its dataset, so dots can carry different brand colours per metric.
					</li>
					<li>
						<strong>Static hero (no autoRotate).</strong> Set <code>autoRotate={'{false}'}</code>. Pair with a CSS <code>contain: layout paint</code> wrapper to keep the canvas from blowing past its column.
					</li>
					<li>
						<strong>Sidebar context globe.</strong> 240px wide, light theme, paused-on-load. Good fit for marketing pages that need world-scale signal without becoming the thing readers scroll past.
					</li>
				</ul>
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
					<td><code>markers</code></td>
					<td><code>GlobeMarker[]</code></td>
					<td><code>[]</code></td>
					<td>Plottable points keyed by id with lat / long / optional label / optional color / optional value.</td>
				</tr>
				<tr>
					<td><code>autoRotate</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Continue rotating when no pointer is interacting.</td>
				</tr>
				<tr>
					<td><code>rotationSpeed</code></td>
					<td><code>number</code></td>
					<td><code>0.005</code></td>
					<td>Radians per frame for the idle rotation drift.</td>
				</tr>
				<tr>
					<td><code>interactive</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Allow pointer/touch drag to override the auto rotation.</td>
				</tr>
				<tr>
					<td><code>theme</code></td>
					<td><code>'light' | 'dark'</code></td>
					<td><code>'dark'</code></td>
					<td>Selects palette and grid contrast for the canvas render.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra utility classes appended to the wrapper.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.globe-demo {
		display: grid;
		gap: 16px;
	}
	.globe-demo__tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.globe-demo__tab {
		flex: 1 1 130px;
		padding: 8px 12px;
		font-size: 13px;
		font-weight: 600;
		color: var(--fg-2);
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--r-1);
		cursor: pointer;
		transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
	}
	.globe-demo__tab:hover {
		color: var(--fg-1);
		background: var(--surface-2);
	}
	.globe-demo__tab.active {
		color: var(--fg-1);
		background: var(--bg);
		border-color: var(--border);
	}
	.globe-demo__hint {
		margin: 0;
		padding: 12px 16px;
		font-size: 13px;
		line-height: 1.55;
		color: var(--fg-2);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.globe-demo__hint code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
	}
	.globe-demo__note {
		margin: 0;
		font-size: 12px;
		color: var(--fg-2);
		text-align: center;
	}
	.globe-stage {
		position: relative;
		display: grid;
		place-items: center;
		padding: clamp(12px, 3vw, 32px);
		border-radius: var(--r-2);
		border: 1px solid var(--border);
		background:
			radial-gradient(circle at 50% 40%, rgba(20, 110, 245, 0.18), transparent 65%),
			var(--surface);
		contain: layout paint;
	}
	.globe-stage--paused {
		background:
			radial-gradient(circle at 50% 40%, rgba(124, 58, 237, 0.18), transparent 65%),
			var(--surface);
	}
	.globe-stage--light {
		background:
			radial-gradient(circle at 50% 40%, rgba(249, 115, 22, 0.18), transparent 65%),
			#fafafa;
	}
	:global(.globe-stage__globe) {
		max-width: min(420px, 100%);
		margin: 0 auto;
	}
	.globe-stage__placeholder {
		display: grid;
		place-items: center;
		aspect-ratio: 1 / 1;
		width: min(420px, 100%);
		color: var(--fg-2);
		font-size: 14px;
	}

	.globe-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}
	@media (min-width: 900px) {
		.globe-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.globe-grid__card {
		margin: 0;
		padding: 14px 14px 16px;
		display: grid;
		gap: 10px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.globe-grid__caption {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: auto auto;
		column-gap: 10px;
		align-items: center;
	}
	.globe-grid__swatch {
		grid-row: 1 / 3;
		width: 12px;
		height: 12px;
		border-radius: 50%;
	}
	.globe-grid__title {
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-1);
	}
	.globe-grid__sub {
		font-size: 11px;
		color: var(--fg-2);
	}
	.globe-grid__stage {
		display: grid;
		place-items: center;
		padding: 10px;
		background:
			radial-gradient(circle at 50% 40%, rgba(20, 110, 245, 0.12), transparent 65%),
			var(--surface-2, var(--surface));
		border-radius: var(--r-1);
		contain: layout paint;
	}
	.globe-grid__stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px 12px;
		margin: 0;
	}
	.globe-grid__stats div {
		display: grid;
		gap: 2px;
	}
	.globe-grid__stats dt {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--fg-2);
	}
	.globe-grid__stats dd {
		margin: 0;
		font-size: 13px;
		font-weight: 600;
		color: var(--fg-1);
	}

	.globe-mobile {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
		align-items: start;
	}
	@media (min-width: 800px) {
		.globe-mobile {
			grid-template-columns: 280px 1fr;
		}
	}
	.globe-mobile__sidebar {
		padding: 14px;
		display: grid;
		gap: 10px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.globe-mobile__sidebar h4 {
		margin: 0;
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-1);
	}
	.globe-mobile__caption {
		margin: 0;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--fg-2);
	}
	.globe-mobile__stage {
		display: grid;
		place-items: center;
		padding: 8px;
		background:
			radial-gradient(circle at 50% 40%, rgba(34, 211, 238, 0.18), transparent 65%),
			var(--surface-2, var(--surface));
		border-radius: var(--r-1);
		contain: layout paint;
	}
	.globe-mobile__stage :global(.globe-stage__globe) {
		max-width: 240px;
	}
	.globe-mobile__list {
		display: grid;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.globe-mobile__list li {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		font-size: 12px;
		background: var(--surface-2, var(--surface));
		border-radius: var(--r-1);
	}
	.globe-mobile__body {
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		font-size: 14px;
		line-height: 1.6;
		color: var(--fg-2);
	}
	.globe-mobile__body h4 {
		margin: 0 0 6px;
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-1);
	}
	.globe-mobile__body p {
		margin: 0 0 10px;
	}

	.globe-legend {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.globe-legend li {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-1);
		font-size: 13px;
	}
	.globe-legend__dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #146ef5;
		box-shadow: 0 0 6px rgba(20, 110, 245, 0.6);
	}
	.globe-legend__name {
		color: var(--fg-1);
		font-weight: 600;
	}
	.globe-legend__label {
		color: var(--fg-2);
		font-size: 12px;
	}

	.globe-recipes {
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.globe-recipes__title {
		margin: 0 0 10px;
		font-size: 14px;
		font-weight: 700;
		color: var(--fg-1);
	}
	.globe-recipes__list {
		margin: 0;
		padding-left: 18px;
		display: grid;
		gap: 10px;
		font-size: 13px;
		line-height: 1.55;
		color: var(--fg-2);
	}
	.globe-recipes__list strong {
		color: var(--fg-1);
	}
	.globe-recipes__list code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
	}
</style>
