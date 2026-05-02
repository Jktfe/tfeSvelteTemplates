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

	// Subset a few folders for the compact variant — shows the component
	// gracefully handles smaller data sets without rebalancing the layout.
	const compactFolders = $derived(data.folders.slice(0, 3));
	const compactFiles = $derived(
		data.files.filter((f) => compactFolders.some((cf) => cf.id === f.folderId))
	);

	// Single-folder variant for the empty / sparse state — folder with no items.
	const sparseFolder = $derived(data.folders.length ? [data.folders[0]] : []);

	const usageSnippet = `<script>
  import FolderFiles from '$lib/components/FolderFiles.svelte';
  let { data } = $props();
</${'script'}>

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

			<section class="ff-section">
				<h4>Full data · {data.folders.length} folders, {data.files.length} files</h4>
				<p class="ff-section__hint">
					Server-loaded folders and items from the database, falling back to constants when
					<code>DATABASE_URL</code> is unset.
				</p>
				<div class="ff-stage">
					<FolderFiles folders={data.folders} files={data.files} />
				</div>
			</section>

			<section class="ff-section">
				<h4>Compact · first 3 folders, scoped items</h4>
				<p class="ff-section__hint">
					Smaller data set — useful for sidebars or constrained surfaces where the full cabinet
					would feel busy.
				</p>
				<div class="ff-stage">
					<FolderFiles folders={compactFolders} files={compactFiles} />
				</div>
			</section>

			<section class="ff-section">
				<h4>Sparse · single folder, no files</h4>
				<p class="ff-section__hint">
					Edge case — one folder with zero items. Verifies the empty-state rendering and that the
					folder still opens cleanly.
				</p>
				<div class="ff-stage">
					<FolderFiles folders={sparseFolder} files={[]} />
				</div>
			</section>
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
			</tbody>
		</table>
		<p class="ff-api-note">
			Display behaviour (3D depth, hover-reveal, drag-and-drop layout) is fixed inside the
			component — adjust by editing <code>FolderFiles.svelte</code> directly rather than via props.
		</p>
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

	.ff-section {
		display: grid;
		gap: 10px;
		padding: 18px 0 0;
		border-top: 1px solid var(--border);
	}
	.ff-section:first-of-type {
		padding-top: 0;
		border-top: none;
	}
	.ff-section h4 {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}
	.ff-section__hint {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--fg-2);
	}
	.ff-section__hint code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 5px;
		border-radius: var(--r-1);
	}
	.ff-api-note {
		margin: 14px 0 0;
		padding: 10px 12px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-1);
		font-size: 13px;
		line-height: 1.5;
		color: var(--fg-2);
	}
	.ff-api-note code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface);
		padding: 1px 5px;
		border-radius: var(--r-1);
	}
</style>
