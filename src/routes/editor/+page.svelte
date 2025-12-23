<script lang="ts">
	/**
	 * Editor CRUD Demo Page
	 *
	 * This page demonstrates a complete CRUD (Create, Read, Update, Delete) implementation
	 * using the Editor component and ExpandingCard display. It showcases:
	 * - Database integration with graceful fallback
	 * - Real-time UI updates after CRUD operations
	 * - In-memory mode when database unavailable
	 * - Loading states and error handling
	 * - Accessible interaction patterns
	 *
	 * This serves as both a functional demo and a learning resource for developers
	 * implementing similar patterns in their own projects.
	 *
	 * @component
	 */

	import type { EditorData } from '$lib/types';
	import ExpandingCard from '$lib/components/ExpandingCard.svelte';
	import Editor from '$lib/components/Editor.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';

	// Server-loaded data
	let { data } = $props();

	/**
	 * Component state using Svelte 5 $state rune
	 * - items: Reactive reference to server data (stays synced with data prop)
	 * - editorOpen: Whether the editor modal is visible
	 * - editingItem: Item being edited (null for create mode)
	 * - loading: Global loading state for async operations
	 */
	let items = $derived(data.editorData);
	let editorOpen = $state(false);
	let editingItem = $state<EditorData | null>(null);
	let loading = $state(false);

	/**
	 * Computed editor mode based on editingItem
	 * If editingItem exists, we're in edit mode; otherwise create mode
	 */
	let editorMode = $derived<'create' | 'edit'>(editingItem ? 'edit' : 'create');

	/**
	 * Open editor in create mode
	 * Clears editingItem and shows modal
	 */
	function openCreateEditor() {
		editingItem = null;
		editorOpen = true;
	}

	/**
	 * Open editor in edit mode with existing item
	 * @param item - The item to edit
	 */
	function openEditEditor(item: EditorData) {
		editingItem = item;
		editorOpen = true;
	}

	/**
	 * Close editor modal
	 * Resets state and hides modal
	 */
	function closeEditor() {
		editorOpen = false;
		editingItem = null;
	}

	/**
	 * Handle save from editor (Create or Update)
	 * @param formData - Data from editor form
	 */
	async function handleSave(formData: EditorData) {
		loading = true;

		try {
			if (data.usingDatabase) {
				// Database mode: Persist to server
				if (editorMode === 'create') {
					await handleDatabaseCreate(formData);
				} else {
					await handleDatabaseUpdate(formData);
				}
			} else {
				// In-memory mode: Update local state only
				if (editorMode === 'create') {
					handleInMemoryCreate(formData);
				} else {
					handleInMemoryUpdate(formData);
				}
			}

			// Close editor on success
			closeEditor();
		} catch (error) {
			console.error('Save failed:', error);
			alert('Failed to save changes. Please try again.');
		} finally {
			loading = false;
		}
	}

	/**
	 * Create item in database via API
	 */
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

		// Add to items array
		data.editorData = [...data.editorData, newItem];
	}

	/**
	 * Update item in database via API
	 */
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

		// Update items array
		data.editorData = data.editorData.map((item) => (item.id === updatedItem.id ? updatedItem : item));
	}

	/**
	 * Create item in-memory (no database)
	 * Uses negative timestamp as temporary ID
	 */
	function handleInMemoryCreate(formData: EditorData) {
		const newItem: EditorData = {
			...formData,
			id: -Date.now() // Temporary negative ID
		};

		data.editorData = [...data.editorData, newItem];
	}

	/**
	 * Update item in-memory (no database)
	 */
	function handleInMemoryUpdate(formData: EditorData) {
		data.editorData = data.editorData.map((item) => (item.id === formData.id ? formData : item));
	}

	/**
	 * Handle delete with confirmation
	 * @param item - Item to delete
	 */
	async function handleDelete(item: EditorData) {
		// Confirm deletion
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

	/**
	 * Delete item from database via API
	 */
	async function handleDatabaseDelete(id: number) {
		const response = await fetch(`/editor/api?id=${id}`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to delete item');
		}

		// Remove from items array
		data.editorData = data.editorData.filter((item) => item.id !== id);
	}

	/**
	 * Delete item from in-memory state
	 */
	function handleInMemoryDelete(id: number) {
		data.editorData = data.editorData.filter((item) => item.id !== id);
	}
</script>

<svelte:head>
	<title>Editor (CRUD Demo) | TFE Svelte Templates</title>
	<meta name="description" content="Full CRUD demonstration with database integration and graceful fallback" />
</svelte:head>

<div class="page-container">
	<!-- Page Header -->
	<header class="page-header">
		<h1 class="page-title">Editor Component - CRUD Demo</h1>
		<p class="page-description">
			Complete Create, Read, Update, and Delete operations with database integration and graceful fallback.
			This demo uses the <strong>ExpandingCard</strong> component to display data.
		</p>

		<!-- Database Status Indicator -->
		<DatabaseStatus usingDatabase={data.usingDatabase} />
	</header>

	<!-- Actions Bar -->
	<div class="actions-bar">
		<button class="btn btn-primary" onclick={openCreateEditor} disabled={loading}>
			<span class="btn-icon" aria-hidden="true">+</span>
			Create New Card
		</button>

		<div class="item-count">
			{items.length} {items.length === 1 ? 'card' : 'cards'}
		</div>
	</div>

	<!-- Cards Grid -->
	{#if items.length > 0}
		<div class="cards-grid">
			{#each items as item (item.id)}
				<div class="card-wrapper">
					<!-- Expanding Card Display -->
					<ExpandingCard
						heading={item.heading}
						compactText={item.compactText}
						expandedText={item.expandedText}
						imageSrc={item.imageSrc}
						imageAlt={item.imageAlt}
						bgColor={item.bgColor}
					/>

					<!-- Card Actions Overlay -->
					<div class="card-actions">
						<button
							class="action-btn action-btn-edit"
							onclick={() => openEditEditor(item)}
							disabled={loading}
							aria-label="Edit {item.heading}"
						>
							<span aria-hidden="true">✏️</span>
						</button>
						<button
							class="action-btn action-btn-delete"
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
		<!-- Empty State -->
		<div class="empty-state">
			<div class="empty-icon" aria-hidden="true">📝</div>
			<h3 class="empty-title">No cards yet</h3>
			<p class="empty-text">Create your first card to get started</p>
			<button class="btn btn-primary" onclick={openCreateEditor}>
				<span class="btn-icon" aria-hidden="true">+</span>
				Create Card
			</button>
		</div>
	{/if}

	<!-- Loading Overlay -->
	{#if loading}
		<div class="loading-overlay" aria-live="polite" aria-busy="true">
			<div class="loading-spinner"></div>
			<p class="loading-text">Processing...</p>
		</div>
	{/if}
</div>

<!-- Editor Modal -->
{#if editorOpen}
	<Editor
		mode={editorMode}
		initialData={editingItem || {}}
		usingDatabase={data.usingDatabase}
		onSave={handleSave}
		onCancel={closeEditor}
	/>
{/if}

<style>
	/**
	 * Page Layout Styles
	 * Scoped to this demo page only
	 */

	.page-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	/* Header */
	.page-header {
		margin-bottom: 2rem;
	}

	.page-title {
		font-size: 2rem;
		font-weight: 700;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}

	.page-description {
		font-size: 1rem;
		color: #6b7280;
		margin: 0 0 1rem 0;
		line-height: 1.6;
	}

	/* Actions Bar */
	.actions-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		gap: 1rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
		border: none;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background-color: #3b82f6;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: #2563eb;
		transform: translateY(-1px);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.btn-icon {
		font-size: 1.25rem;
		line-height: 1;
	}

	.item-count {
		font-size: 0.875rem;
		color: #6b7280;
		padding: 0.5rem 1rem;
		background-color: #f3f4f6;
		border-radius: 6px;
	}

	/* Cards Grid */
	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.card-wrapper {
		position: relative;
	}

	/* Card Actions */
	.card-actions {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: flex;
		gap: 0.5rem;
		opacity: 0;
		transition: opacity 0.2s ease-in-out;
	}

	.card-wrapper:hover .card-actions,
	.card-wrapper:focus-within .card-actions {
		opacity: 1;
	}

	.action-btn {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 6px;
		border: none;
		cursor: pointer;
		font-size: 1.125rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease-in-out;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.action-btn-edit {
		background-color: white;
	}

	.action-btn-edit:hover:not(:disabled) {
		background-color: #3b82f6;
		transform: scale(1.1);
	}

	.action-btn-delete {
		background-color: white;
	}

	.action-btn-delete:hover:not(:disabled) {
		background-color: #ef4444;
		transform: scale(1.1);
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background-color: #f9fafb;
		border-radius: 12px;
		border: 2px dashed #d1d5db;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.empty-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}

	.empty-text {
		font-size: 1rem;
		color: #6b7280;
		margin: 0 0 1.5rem 0;
	}

	/* Loading Overlay */
	.loading-overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		z-index: 999;
	}

	.loading-spinner {
		width: 3rem;
		height: 3rem;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		color: white;
		font-size: 1rem;
		font-weight: 500;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.page-title {
			font-size: 1.5rem;
		}

		.actions-bar {
			flex-direction: column;
			align-items: stretch;
		}

		.btn {
			width: 100%;
			justify-content: center;
		}

		.item-count {
			text-align: center;
		}

		.cards-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.card-actions {
			opacity: 1; /* Always visible on mobile */
		}
	}
</style>
