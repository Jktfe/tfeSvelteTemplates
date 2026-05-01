<script lang="ts">
	/**
	 * FolderFiles Demo Page (TFE shell)
	 *
	 * Adopts ComponentPageShell while preserving server-loaded folder/file data.
	 */

	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import FolderFiles from '$lib/components/FolderFiles.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';

	const shell = catalogShellPropsForSlug('/folderfiles')!;

	let { data } = $props();

	const usageSnippet = `<script>
  import FolderFiles from '$lib/components/FolderFiles.svelte';
  let { data } = $props();
<\/script>

<FolderFiles
  folders={data.folders}
  files={data.files}
/>`;

	const codeExplanation =
		'FolderFiles renders a 3D filing-cabinet metaphor. Folders stack with subtle depth shading; hovering a folder drops the ones beneath it to reveal more tabs. Selecting a folder swaps a two-panel drag-and-drop surface for organising the nested file items. Server-loaded folders/files flow straight through the props; database fallback is handled in the load function.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Drag & Drop', '3D', 'Database', 'A11y']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="ff-demo">
			<div class="ff-status">
				<DatabaseStatus usingDatabase={data.usingDatabase} />
			</div>

			<p class="ff-instructions">
				<strong>How to use:</strong> Hover a folder to reveal more tabs beneath, click to open it,
				then drag items between the “Selected” and “All Items” panels.
			</p>

			<div class="ff-stage">
				<FolderFiles folders={data.folders} files={data.files} />
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
					<td><code>folders</code></td>
					<td><code>Folder[]</code></td>
					<td><code>[]</code></td>
					<td>Folder records: <code>id</code>, <code>label</code>, <code>color</code>, optional <code>icon</code>, <code>description</code>, <code>category</code>.</td>
				</tr>
				<tr>
					<td><code>files</code></td>
					<td><code>FileItem[]</code></td>
					<td><code>[]</code></td>
					<td>File items linked to a folder via <code>folderId</code>; carry <code>title</code>, optional <code>subtitle</code>, and <code>previewText</code>.</td>
				</tr>
				<tr>
					<td><code>initialFolderId</code></td>
					<td><code>number</code></td>
					<td>—</td>
					<td>Open a specific folder on first render.</td>
				</tr>
				<tr>
					<td><code>viewMode</code></td>
					<td><code>'single' | 'spread'</code></td>
					<td><code>'single'</code></td>
					<td>Single-panel inspector or two-panel drag surface.</td>
				</tr>
				<tr>
					<td><code>showMetadata</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Show item counts and folder descriptions in tooltips.</td>
				</tr>
				<tr>
					<td><code>enable3DEffect</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Toggle the depth/shadow transforms on folder stacks.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ff-demo {
		display: grid;
		gap: 1rem;
	}

	.ff-status {
		display: flex;
		justify-content: flex-start;
	}

	.ff-instructions {
		margin: 0;
		padding: 0.85rem 1rem;
		background: var(--surface-muted, var(--surface));
		border: 1px solid var(--border);
		border-left: 4px solid var(--brand, #146ef5);
		border-radius: var(--r-1, 6px);
		color: var(--fg-1);
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.ff-stage {
		border: 1px solid var(--border);
		border-radius: var(--r-2, 12px);
		overflow: hidden;
		background: var(--surface);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
	}
</style>
