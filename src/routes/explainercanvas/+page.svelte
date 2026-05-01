<!--
	============================================================
	ExplainerCanvas Demo Page (TFE shell)
	============================================================
-->

<script lang="ts">
	import ExplainerCanvas from '$lib/components/ExplainerCanvas/ExplainerCanvas.svelte';
	import { FALLBACK_EXPLAINER_CANVAS_DATA } from '$lib/constants';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/explainercanvas')!;
	const canvasData = FALLBACK_EXPLAINER_CANVAS_DATA;

	const usageSnippet = `<script>
  import ExplainerCanvas from '$lib/components/ExplainerCanvas/ExplainerCanvas.svelte';
  import { myCanvasData } from './data';
<\/script>

<ExplainerCanvas
  data={myCanvasData}
  onNavigate={(cardId, path) => console.log('Navigated:', cardId)}
  onExpand={(cardId) => console.log('Expanded:', cardId)}
/>`;

	const codeExplanation =
		'ExplainerCanvas builds a pannable / zoomable concept map from structured data. Each card holds markdown content, optional images and embeds, links to related cards, and an optional nested sub-canvas for unlimited drill-down. Search uses fuzzy matching across the whole tree, and breadcrumbs track the navigation path. Keyboard, focus management, and ARIA labels are baked in.';
</script>

<svelte:head>
	<title>ExplainerCanvas — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Pan/zoom concept-mapping canvas with nested hierarchies, fuzzy search and markdown content."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'Canvas', 'Pan & zoom', 'Markdown', 'A11y']}
>
	{#snippet demo()}
		<div class="ec-demo">
			<p class="ec-demo__hint">
				<strong>Click</strong> any card to expand. <strong>Click links</strong> to navigate.
				Cards with a grid icon contain nested sub-canvases. <strong>Ctrl/Cmd + F</strong> to search.
				Drag to pan, scroll to zoom.
			</p>
			<div class="ec-demo__stage">
				<ExplainerCanvas
					data={canvasData}
					onNavigate={(cardId, path) => console.log('Navigated to:', cardId, path)}
					onExpand={(cardId) => console.log('Expanded:', cardId)}
					onCollapse={(cardId) => console.log('Collapsed:', cardId)}
				/>
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
					<td><code>data</code></td>
					<td><code>ExplainerCanvasData</code></td>
					<td>—</td>
					<td>Direct data object with cards, links and config.</td>
				</tr>
				<tr>
					<td><code>src</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>URL to a JSON file. Loaded on mount.</td>
				</tr>
				<tr>
					<td><code>loader</code></td>
					<td><code>() =&gt; Promise&lt;ExplainerCanvasData&gt;</code></td>
					<td>—</td>
					<td>Custom async loader (e.g. fetch from your own API).</td>
				</tr>
				<tr>
					<td><code>initialCardId</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Override the data's <code>defaultCardId</code>.</td>
				</tr>
				<tr>
					<td><code>lineStyle</code></td>
					<td><code>'straight' | 'bezier' | 'orthogonal'</code></td>
					<td><code>'bezier'</code></td>
					<td>Connection-line shape between cards.</td>
				</tr>
				<tr>
					<td><code>onNavigate</code></td>
					<td><code>(cardId, path) =&gt; void</code></td>
					<td>—</td>
					<td>Fires when navigating between cards.</td>
				</tr>
				<tr>
					<td><code>onExpand</code> / <code>onCollapse</code></td>
					<td><code>(cardId) =&gt; void</code></td>
					<td>—</td>
					<td>Fires on card open/close. Useful for analytics.</td>
				</tr>
				<tr>
					<td><code>onSearch</code></td>
					<td><code>(query, results) =&gt; void</code></td>
					<td>—</td>
					<td>Fires when the search panel runs a query.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ec-demo {
		display: grid;
		gap: 16px;
	}
	.ec-demo__hint {
		margin: 0;
		padding: 12px 16px;
		font-size: 13px;
		line-height: 1.55;
		color: var(--fg-2);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.ec-demo__stage {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		height: 600px;
		overflow: hidden;
	}
</style>
