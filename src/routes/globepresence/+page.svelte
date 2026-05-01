<!--
	============================================================
	GlobePresence Demo Page (TFE shell)
	============================================================

	Adopts ComponentPageShell for the canvas-based 3D globe with
	plottable markers. The component spins up a render loop on
	mount so we gate it behind `browser` from $app/environment
	to keep SSR clean.
-->

<script lang="ts">
	import { browser } from '$app/environment';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import GlobePresence from '$lib/components/GlobePresence.svelte';
	import type { GlobeMarker } from '$lib/types';

	const shell = catalogShellPropsForSlug('/globepresence')!;

	const sampleMarkers: GlobeMarker[] = [
		{ id: '1', name: 'San Francisco', lat: 37.7749, long: -122.4194, label: 'Headquarters' },
		{ id: '2', name: 'London', lat: 51.5074, long: -0.1278, label: 'EMEA Hub' },
		{ id: '3', name: 'Tokyo', lat: 35.6762, long: 139.6503, label: 'APAC Hub' },
		{ id: '4', name: 'Sydney', lat: -33.8688, long: 151.2093, label: 'Australia Office' },
		{ id: '5', name: 'São Paulo', lat: -23.5505, long: -46.6333, label: 'LATAM Hub' },
		{ id: '6', name: 'Cape Town', lat: -33.9249, long: 18.4241, label: 'Africa Region' }
	];

	const codeExplanation =
		'GlobePresence renders an interactive sphere on a single &lt;canvas&gt; with a custom 60fps loop — no Three.js scene graph required. Markers are projected from latitude/longitude onto the sphere surface and tinted with a soft glow; pointer drag rotates the globe, and autoRotate keeps it drifting when idle. The render loop disposes its raf handle on destroy, so navigating away leaves no zombies.';
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
		<div class="globe-stage">
			{#if browser}
				<GlobePresence
					markers={sampleMarkers}
					autoRotate
					rotationSpeed={0.003}
					class="globe-stage__globe"
				/>
			{:else}
				<div class="globe-stage__placeholder">Loading globe…</div>
			{/if}
		</div>

		<ul class="globe-legend" aria-label="Marker locations">
			{#each sampleMarkers as marker (marker.id)}
				<li>
					<span class="globe-legend__dot" aria-hidden="true"></span>
					<span class="globe-legend__name">{marker.name}</span>
					<span class="globe-legend__label">{marker.label ?? ''}</span>
				</li>
			{/each}
		</ul>
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
					<td>Plottable points keyed by id with lat / long / optional label.</td>
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

	.globe-legend {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 8px;
		margin: 16px 0 0;
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
</style>
