<script lang="ts">
	import Cardwall from '$lib/components/Cardwall/Cardwall.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/cardwall')!;

	const usageSnippet = `<script>
  import Cardwall from '$lib/components/Cardwall/Cardwall.svelte';
</${'script'}>

<Cardwall density="default" tilesPerRow={8} />
<Cardwall density="sparse" tilesPerRow={6} />
<Cardwall density="dense" tilesPerRow={10} tileWidth={180} tileGap={14} />`;

	const codeExplanation =
		'Cardwall renders rows of CSS-gradient tiles drifting across a CSS perspective container. A single requestAnimationFrame loop wraps each row offset around its period for a seamless seam, and SSR-deterministic Halton(2,3) sequences pick the gradient + label for each tile so server and client agree byte-for-byte. Click any tile to pin it — the rest of the wall keeps drifting.';
</script>

<svelte:head>
	<title>Cardwall — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Full-bleed perspective billboard wall of CSS-gradient tiles drifting on a tilted plane."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'CSS perspective', 'rAF', 'SSR-safe', 'Asset-free']}
>
	{#snippet demo()}
		<div class="cw-block">
			<header class="cw-label">
				<h3>Default · 5 rows</h3>
				<p>8 tiles per row, 220 px tile width — the headline configuration.</p>
			</header>
			<div class="cw-frame">
				<Cardwall density="default" tilesPerRow={8} />
			</div>
		</div>

		<div class="cw-block">
			<header class="cw-label">
				<h3>Sparse · 3 rows</h3>
				<p>Quieter — suits hero sections that want the wall as a backdrop.</p>
			</header>
			<div class="cw-frame">
				<Cardwall density="sparse" tilesPerRow={6} />
			</div>
		</div>

		<div class="cw-block">
			<header class="cw-label">
				<h3>Dense · 7 rows</h3>
				<p>Cinematic city of tiles — pair with a foreground headline overlay.</p>
			</header>
			<div class="cw-frame">
				<Cardwall density="dense" tilesPerRow={10} tileWidth={180} tileGap={14} />
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
					<td><code>density</code></td>
					<td><code>'sparse' | 'default' | 'dense'</code></td>
					<td><code>'default'</code></td>
					<td>Number of rows: 3 / 5 / 7.</td>
				</tr>
				<tr>
					<td><code>tilesPerRow</code></td>
					<td><code>number</code></td>
					<td><code>8</code></td>
					<td>Tiles before the row repeats (rendered twice for seamless drift).</td>
				</tr>
				<tr>
					<td><code>tileWidth</code></td>
					<td><code>number</code></td>
					<td><code>220</code></td>
					<td>Tile width in pixels.</td>
				</tr>
				<tr>
					<td><code>tileGap</code></td>
					<td><code>number</code></td>
					<td><code>16</code></td>
					<td>Gap between tiles in pixels.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.cw-block + .cw-block {
		margin-top: 24px;
	}
	.cw-label {
		display: grid;
		gap: 4px;
		margin-bottom: 8px;
	}
	.cw-label h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 16px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--fg-1);
	}
	.cw-label p {
		margin: 0;
		font-size: 13px;
		color: var(--fg-2);
	}
	.cw-frame {
		border-radius: var(--r-2);
		overflow: hidden;
		box-shadow:
			0 50px 100px -40px rgba(15, 23, 42, 0.25),
			0 4px 12px -2px rgba(15, 23, 42, 0.08);
	}
</style>
