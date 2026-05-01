<script lang="ts">
	/**
	 * Editor CRUD Demo Page (TFE shell)
	 *
	 * Adopts ComponentPageShell while keeping the full CRUD demo:
	 *  - Server-loaded data via +page.server.ts
	 *  - Database vs in-memory mode (driven by data.usingDatabase)
	 *  - Create / edit / delete through the Editor modal
	 */

	import type { EditorData } from '$lib/types';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import ExpandingCard from '$lib/components/ExpandingCard.svelte';
	import Editor from '$lib/components/Editor.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';

	const shell = catalogShellPropsForSlug('/editor')!;

	// Server-loaded data (preserved exactly as the load function returns it)
	let { data } = $props();

	// Reactive view of the loaded items — kept in sync with the server payload.
	let items = $derived(data.editorData);
	let editorOpen = $state(false);
	let editingItem = $state<EditorData | null>(null);
	let loading = $state(false);

	// Editor modal mode flips based on whether we have an item under edit.
	let editorMode = $derived<'create' | 'edit'>(editingItem ? 'edit' : 'create');

	function openCreateEditor() {
		editingItem = null;
		editorOpen = true;
	}

	function openEditEditor(item: EditorData) {
		editingItem = item;
		editorOpen = true;
	}

	function closeEditor() {
		editorOpen = false;
		editingItem = null;
	}

	async function handleSave(formData: EditorData) {
		loading = true;
		try {
			if (data.usingDatabase) {
				if (editorMode === 'create') {
					await handleDatabaseCreate(formData);
				} else {
					await handleDatabaseUpdate(formData);
				}
			} else {
				if (editorMode === 'create') {
					handleInMemoryCreate(formData);
				} else {
					handleInMemoryUpdate(formData);
				}
			}
			closeEditor();
		} catch (error) {
			console.error('Save failed:', error);
			alert('Failed to save changes. Please try again.');
		} finally {
			loading = false;
		}
	}

	async function handleDatabaseCreate(formData: EditorData) {
		const response = await fetch('/editor/api', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(formData)
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to create item');
		}
		const { data: newItem } = await response.json();
		data.editorData = [...data.editorData, newItem];
	}

	async function handleDatabaseUpdate(formData: EditorData) {
		const response = await fetch('/editor/api', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(formData)
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to update item');
		}
		const { data: updatedItem } = await response.json();
		data.editorData = data.editorData.map((item) =>
			item.id === updatedItem.id ? updatedItem : item
		);
	}

	function handleInMemoryCreate(formData: EditorData) {
		const newItem: EditorData = {
			...formData,
			id: -Date.now()
		};
		data.editorData = [...data.editorData, newItem];
	}

	function handleInMemoryUpdate(formData: EditorData) {
		data.editorData = data.editorData.map((item) =>
			item.id === formData.id ? formData : item
		);
	}

	async function handleDelete(item: EditorData) {
		const confirmed = confirm(`Delete "${item.heading}"?\n\nThis action cannot be undone.`);
		if (!confirmed) return;
		loading = true;
		try {
			if (data.usingDatabase) {
				await handleDatabaseDelete(item.id!);
			} else {
				handleInMemoryDelete(item.id!);
			}
		} catch (error) {
			console.error('Delete failed:', error);
			alert('Failed to delete item. Please try again.');
		} finally {
			loading = false;
		}
	}

	async function handleDatabaseDelete(id: number) {
		const response = await fetch(`/editor/api?id=${id}`, { method: 'DELETE' });
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to delete item');
		}
		data.editorData = data.editorData.filter((it) => it.id !== id);
	}

	function handleInMemoryDelete(id: number) {
		data.editorData = data.editorData.filter((it) => it.id !== id);
	}

	const codeExplanation =
		'Editor is a modal CRUD form wired to a small REST surface (GET/POST/PUT/DELETE under /editor/api). The demo page consumes server-loaded data and either persists changes through the API (when DATABASE_URL is set) or mutates local state in-memory. Validation, focus management, and error handling all live inside the Editor component itself.';

	const usageSnippet = `<script>
  import Editor from '$lib/components/Editor.svelte';
  let editorOpen = $state(false);
  let editingItem = $state(null);
<\/script>

{#if editorOpen}
  <Editor
    mode={editingItem ? 'edit' : 'create'}
    initialData={editingItem || {}}
    usingDatabase={data.usingDatabase}
    onSave={handleSave}
    onCancel={() => editorOpen = false}
  />
{/if}`;
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'CRUD', 'Forms', 'Database', 'A11y']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="ed-demo">
			<div class="ed-status">
				<DatabaseStatus usingDatabase={data.usingDatabase} />
			</div>

			<div class="ed-actions">
				<button class="ed-btn ed-btn--primary" onclick={openCreateEditor} disabled={loading}>
					<span class="ed-btn__icon" aria-hidden="true">+</span>
					Create new card
				</button>
				<div class="ed-count">
					{items.length}
					{items.length === 1 ? 'card' : 'cards'}
				</div>
			</div>

			{#if items.length > 0}
				<div class="ed-grid">
					{#each items as item (item.id)}
						<div class="ed-card">
							<ExpandingCard
								heading={item.heading}
								compactText={item.compactText}
								expandedText={item.expandedText}
								imageSrc={item.imageSrc}
								imageAlt={item.imageAlt}
								bgColor={item.bgColor}
							/>

							<div class="ed-card__actions">
								<button
									class="ed-action ed-action--edit"
									onclick={() => openEditEditor(item)}
									disabled={loading}
									aria-label="Edit {item.heading}"
								>
									<span aria-hidden="true">✏️</span>
								</button>
								<button
									class="ed-action ed-action--delete"
									onclick={() => handleDelete(item)}
									disabled={loading}
									aria-label="Delete {item.heading}"
								>
									<span aria-hidden="true">🗑️</span>
								</button>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="ed-empty">
					<div class="ed-empty__icon" aria-hidden="true">📝</div>
					<h3>No cards yet</h3>
					<p>Create your first card to get started.</p>
					<button class="ed-btn ed-btn--primary" onclick={openCreateEditor}>
						<span class="ed-btn__icon" aria-hidden="true">+</span>
						Create card
					</button>
				</div>
			{/if}

			{#if loading}
				<div class="ed-loading" aria-live="polite" aria-busy="true">
					<div class="ed-spinner"></div>
					<p>Processing…</p>
				</div>
			{/if}
		</div>

		{#if editorOpen}
			<Editor
				mode={editorMode}
				initialData={editingItem || {}}
				usingDatabase={data.usingDatabase}
				onSave={handleSave}
				onCancel={closeEditor}
			/>
		{/if}
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
					<td><code>mode</code></td>
					<td><code>'create' | 'edit'</code></td>
					<td><code>'create'</code></td>
					<td>Modal title, submit-button label, and validation messaging swap based on mode.</td>
				</tr>
				<tr>
					<td><code>initialData</code></td>
					<td><code>Partial&lt;EditorData&gt;</code></td>
					<td><code>{`{}`}</code></td>
					<td>Pre-fills the form when editing an existing item.</td>
				</tr>
				<tr>
					<td><code>usingDatabase</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Toggles a copy hint that warns when changes will not be persisted.</td>
				</tr>
				<tr>
					<td><code>onSave</code></td>
					<td><code>(data: EditorData) =&gt; void | Promise&lt;void&gt;</code></td>
					<td>—</td>
					<td>Called with the validated form payload. Async functions are awaited.</td>
				</tr>
				<tr>
					<td><code>onCancel</code></td>
					<td><code>() =&gt; void</code></td>
					<td>—</td>
					<td>Fires when the user closes the modal via the cancel button or Escape key.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ed-demo {
		display: grid;
		gap: 1.25rem;
	}

	.ed-status {
		display: flex;
		justify-content: flex-start;
	}

	.ed-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.ed-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.65rem 1.25rem;
		border-radius: var(--r-2, 8px);
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid transparent;
		transition: filter 0.15s ease, transform 0.15s ease;
	}

	.ed-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.ed-btn--primary {
		background: var(--brand, #146ef5);
		color: #fff;
	}

	.ed-btn--primary:hover:not(:disabled) {
		filter: brightness(0.95);
		transform: translateY(-1px);
	}

	.ed-btn__icon {
		font-size: 1.1rem;
		line-height: 1;
	}

	.ed-count {
		font-size: 0.85rem;
		color: var(--fg-2);
		padding: 0.4rem 0.8rem;
		background: var(--surface-muted, var(--surface));
		border: 1px solid var(--border);
		border-radius: var(--r-1, 6px);
	}

	.ed-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 1.5rem;
	}

	.ed-card {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 360px;
		padding: 1.5rem 0.75rem;
	}

	.ed-card__actions {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: flex;
		gap: 0.5rem;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.ed-card:hover .ed-card__actions,
	.ed-card:focus-within .ed-card__actions {
		opacity: 1;
	}

	.ed-action {
		width: 2.25rem;
		height: 2.25rem;
		border-radius: var(--r-1, 6px);
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--fg-1);
		cursor: pointer;
		font-size: 1rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.15s ease, background 0.15s ease;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
	}

	.ed-action:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.ed-action--edit:hover:not(:disabled) {
		background: rgba(20, 110, 245, 0.1);
		transform: scale(1.05);
	}

	.ed-action--delete:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.12);
		transform: scale(1.05);
	}

	.ed-empty {
		text-align: center;
		padding: 3rem 1.5rem;
		background: var(--surface-muted, var(--surface));
		border: 2px dashed var(--border);
		border-radius: var(--r-2, 12px);
		display: grid;
		gap: 0.5rem;
		justify-items: center;
	}

	.ed-empty__icon {
		font-size: 3rem;
	}

	.ed-empty h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		color: var(--fg-1);
	}

	.ed-empty p {
		margin: 0;
		color: var(--fg-2);
	}

	.ed-loading {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		color: #fff;
		z-index: 999;
	}

	.ed-spinner {
		width: 2.5rem;
		height: 2.5rem;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-top-color: #fff;
		border-radius: 50%;
		animation: ed-spin 0.8s linear infinite;
	}

	@keyframes ed-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 640px) {
		.ed-actions {
			flex-direction: column;
			align-items: stretch;
		}

		.ed-btn {
			width: 100%;
			justify-content: center;
		}

		.ed-count {
			text-align: center;
		}

		.ed-grid {
			grid-template-columns: 1fr;
		}

		.ed-card {
			min-height: 320px;
			padding: 1rem 0.25rem;
		}

		.ed-card__actions {
			opacity: 1;
		}
	}
</style>
