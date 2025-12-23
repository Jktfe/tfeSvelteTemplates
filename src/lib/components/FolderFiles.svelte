<script lang="ts">
	/**
	 * FolderFiles Component - 3D Filing Cabinet Design
	 *
	 * A 3D filing cabinet drawer system with stacked folders inspired by physical file folders:
	 * - Folders stacked vertically showing only their colored tabs
	 * - Hover over a tab to reveal folders beneath (cascade effect)
	 * - Click to open 95vw × 95vh modal with two-panel organization system
	 * - Native HTML5 drag-and-drop between panels
	 * - Zero external libraries (pure Svelte 5 + CSS 3D transforms)
	 *
	 * Features:
	 * - 3D perspective with subtle depth and tilt
	 * - Smooth hover animations (folders drop down)
	 * - Click opens large modal container
	 * - Drag content items between left/right panels
	 * - Fully responsive with mobile support
	 * - Database integration with graceful fallback
	 *
	 * @component
	 */

	import type { Folder, FileItem } from '$lib/types';
	import { lockScroll } from '$lib/scrollLock';

	/**
	 * Component props
	 */
	let {
		folders = [],
		files = []
	}: {
		folders: Folder[];
		files: FileItem[];
	} = $props();

	/**
	 * State Management (Svelte 5 Runes)
	 */

	// Hover state - track which folder tab is hovered
	let hoveredIndex = $state<number | null>(null);

	// Open state - track which folder is opened
	let openFolder = $state<Folder | null>(null);

	// Panel organization (for modal)
	let leftPanelItems = $state<FileItem[]>([]);
	let rightPanelItems = $state<FileItem[]>([]);

	// Drag-and-drop state (desktop only)
	let draggedItem = $state<FileItem | null>(null);
	let dragOverPanel = $state<'left' | 'right' | null>(null);

	// Mobile touch device detection
	// Only true on actual touch devices with coarse pointer (finger) AND mobile width
	// Desktop users with touchscreens will still get drag-and-drop
	let isTouchDevice = $state(false);

	// Mobile selection state - for tap-to-select on touch devices
	let selectedItems = $state<Set<number>>(new Set());

	// Scroll lock cleanup function - coordinated via scrollLock utility
	let unlockScroll: (() => void) | null = null;

	/**
	 * Mobile Detection Effect
	 * Detects touch devices with coarse pointer (finger) as primary input
	 * Combined with screen width check to catch actual mobile devices
	 * Desktop touchscreens will get drag-and-drop (fine pointer + larger width)
	 */
	$effect(() => {
		if (typeof window !== 'undefined') {
			const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
			const isMobileWidth = window.innerWidth <= 768;
			isTouchDevice = coarsePointer && isMobileWidth;
		}
	});

	/**
	 * Computed values
	 */

	// Get file count for each folder (for tooltip)
	function getFileCount(folder: Folder): number {
		return files.filter((f) => f.folderId === folder.id).length;
	}

	/**
	 * Folder Management Functions
	 */

	function handleFolderHover(index: number) {
		hoveredIndex = index;
	}

	function handleFolderLeave() {
		hoveredIndex = null;
	}

	function openFolderView(folder: Folder) {
		openFolder = folder;

		// Get files for this folder
		const folderFiles = files.filter((f) => f.folderId === folder.id);

		// Initialize panels (all files in right, left empty)
		leftPanelItems = [];
		rightPanelItems = folderFiles;

		// Lock body scroll using coordinated utility (prevents conflicts with other modals)
		unlockScroll = lockScroll();
	}

	function closeFolderView() {
		openFolder = null;
		leftPanelItems = [];
		rightPanelItems = [];

		// Unlock body scroll
		if (unlockScroll) {
			unlockScroll();
			unlockScroll = null;
		}
	}

	/**
	 * Drag-and-Drop Handlers (Native HTML5 API)
	 */

	function handleDragStart(e: DragEvent, item: FileItem) {
		draggedItem = item;

		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', item.id.toString());
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDragLeave(e: DragEvent) {
		if (e.currentTarget === e.target) {
			dragOverPanel = null;
		}
	}

	function handleDrop(e: DragEvent, targetPanel: 'left' | 'right') {
		e.preventDefault();

		if (!draggedItem) return;

		// Capture reference to satisfy TypeScript narrowing for $state variables
		const item = draggedItem;
		const sourcePanel = leftPanelItems.includes(item) ? 'left' : 'right';

		if (sourcePanel === targetPanel) {
			dragOverPanel = null;
			return;
		}

		// Move item between panels
		if (targetPanel === 'left') {
			rightPanelItems = rightPanelItems.filter((f) => f.id !== item.id);
			leftPanelItems = [...leftPanelItems, item];
		} else {
			leftPanelItems = leftPanelItems.filter((f) => f.id !== item.id);
			rightPanelItems = [...rightPanelItems, item];
		}

		dragOverPanel = null;
	}

	function handleDragEnd() {
		draggedItem = null;
		dragOverPanel = null;
	}

	/**
	 * Mobile Touch Selection Functions
	 * These only activate on touch devices (isTouchDevice === true)
	 * Desktop users continue to use drag-and-drop
	 */

	/**
	 * Toggle selection of an item (mobile tap-to-select)
	 */
	function toggleSelection(item: FileItem) {
		const newSet = new Set(selectedItems);
		if (newSet.has(item.id)) {
			newSet.delete(item.id);
		} else {
			newSet.add(item.id);
		}
		selectedItems = newSet; // Reassign to trigger reactivity
	}

	/**
	 * Clear all selected items
	 */
	function clearSelection() {
		selectedItems = new Set();
	}

	/**
	 * Move selected items from right panel to left (Selected) panel
	 */
	function moveSelectedToLeft() {
		const itemsToMove = rightPanelItems.filter((item) => selectedItems.has(item.id));
		rightPanelItems = rightPanelItems.filter((item) => !selectedItems.has(item.id));
		leftPanelItems = [...leftPanelItems, ...itemsToMove];
		clearSelection();
	}

	/**
	 * Move selected items from left (Selected) panel to right panel
	 */
	function moveSelectedToRight() {
		const itemsToMove = leftPanelItems.filter((item) => selectedItems.has(item.id));
		leftPanelItems = leftPanelItems.filter((item) => !selectedItems.has(item.id));
		rightPanelItems = [...rightPanelItems, ...itemsToMove];
		clearSelection();
	}

	/**
	 * Get count of selected items in a specific panel
	 */
	function getSelectedCountInPanel(panel: 'left' | 'right'): number {
		const items = panel === 'left' ? leftPanelItems : rightPanelItems;
		return items.filter((item) => selectedItems.has(item.id)).length;
	}

	/**
	 * Focus trap for modal accessibility
	 * Keeps focus within modal when Tab/Shift+Tab pressed
	 */
	function setupFocusTrap(node: HTMLElement) {
		const focusableSelector =
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [draggable="true"]';

		function updateFocusableElements() {
			return node.querySelectorAll<HTMLElement>(focusableSelector);
		}

		function handleTabKey(e: KeyboardEvent) {
			if (e.key !== 'Tab') return;

			const focusableElements = updateFocusableElements();
			if (focusableElements.length === 0) return;

			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			if (e.shiftKey && document.activeElement === firstElement) {
				e.preventDefault();
				lastElement?.focus();
			} else if (!e.shiftKey && document.activeElement === lastElement) {
				e.preventDefault();
				firstElement?.focus();
			}
		}

		node.addEventListener('keydown', handleTabKey);

		// Focus close button on mount for accessibility
		const closeButton = node.querySelector<HTMLElement>('.close-btn');
		closeButton?.focus();

		return {
			destroy() {
				node.removeEventListener('keydown', handleTabKey);
			}
		};
	}
</script>

<!-- FILING CABINET VIEW (closed state) -->
{#if !openFolder}
	<div class="filing-cabinet-container" role="region" aria-label="Filing cabinet with folders">
		<div class="folder-stack">
			{#each folders as folder, index (folder.id)}
				<div
					class="folder-wrapper"
					class:is-beneath-hover={hoveredIndex !== null && index > hoveredIndex}
					style="--folder-index: {index}; --folder-color: {folder.color}; z-index: {index};"
					role="group"
				>
					<button
						class="folder-container"
						onclick={() => openFolderView(folder)}
						onmouseenter={() => handleFolderHover(index)}
						onmouseleave={handleFolderLeave}
						aria-label="Open {folder.label} folder ({getFileCount(folder)} items)"
					>
						<!-- Folder Tab (protruding top portion) -->
						<div
							class="folder-tab"
							style="{index % 3 === 2 ? 'margin-left: auto; margin-right: 0;' : `margin-left: calc(${index % 3} * 15%);`}"
						>
							<span class="folder-label">{folder.label}</span>

							<!-- Hover tooltip -->
							{#if hoveredIndex === index}
								<div class="tooltip">
									{folder.label} ({getFileCount(folder)} items)
								</div>
							{/if}
						</div>

						<!-- Folder Body (visible rectangular portion) -->
						<div class="folder-body"></div>
					</button>
				</div>
			{/each}
		</div>
	</div>
{/if}

<!-- Keyboard support: Escape key closes modal (must be at top level, not in {#if}) -->
<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && openFolder) {
			e.preventDefault();
			closeFolderView();
		}
	}}
/>

<!-- MODAL VIEW (open state) - 95vw × 95vh -->
{#if openFolder}
	<div class="folder-modal" role="dialog" aria-modal="true" aria-label="{openFolder.label} folder">
		<!-- Modal backdrop -->
		<div class="modal-backdrop" onclick={closeFolderView} aria-hidden="true"></div>

		<!-- Modal content with focus trap for accessibility -->
		<div class="modal-content" use:setupFocusTrap>
			<!-- Close button -->
			<button class="close-btn" onclick={closeFolderView} aria-label="Close folder view">
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M18 6L6 18M6 6l12 12"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
			</button>

			<!-- Two-panel drag system -->
			<div class="folder-panels">
				<!-- Left panel (initially empty) -->
				<div
					class="panel panel-left"
					class:drag-over={dragOverPanel === 'left'}
					style="background-color: {openFolder.color};"
					ondragover={handleDragOver}
					ondragenter={() => (dragOverPanel = 'left')}
					ondragleave={handleDragLeave}
					ondrop={(e) => handleDrop(e, 'left')}
					role="region"
					aria-label="Selected items"
					aria-live="polite"
				>
					<div class="panel-header">
						<div class="panel-label">Selected</div>
						{#if leftPanelItems.length === 0}
							<div class="empty-message" role="status" aria-live="polite">
								{isTouchDevice ? 'Tap items to select, then move here' : 'Drag items here to select them'}
							</div>
						{:else}
							<div class="sr-only" role="status" aria-live="polite">
								{leftPanelItems.length} item{leftPanelItems.length !== 1 ? 's' : ''} selected
							</div>
						{/if}
					</div>

					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<div class="content-grid" role="listbox" aria-label="Selected items list">
						{#each leftPanelItems as item (item.id)}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<div
								draggable={!isTouchDevice}
								ondragstart={(e) => !isTouchDevice && handleDragStart(e, item)}
								ondragend={handleDragEnd}
								onclick={() => isTouchDevice && toggleSelection(item)}
								onkeydown={(e) => isTouchDevice && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleSelection(item))}
								class="content-item"
								class:dragging={draggedItem?.id === item.id}
								class:selected={selectedItems.has(item.id)}
								class:touch-mode={isTouchDevice}
								role="option"
								tabindex={isTouchDevice ? 0 : -1}
								aria-selected={selectedItems.has(item.id)}
							>
								{#if isTouchDevice}
									<div class="selection-indicator" aria-hidden="true">
										{#if selectedItems.has(item.id)}
											<svg class="checkmark" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
											</svg>
										{/if}
									</div>
								{/if}
								<div class="content-item-title">{item.title}</div>
								{#if item.subtitle}
									<div class="content-item-subtitle">{item.subtitle}</div>
								{/if}
								{#if item.previewText}
									<p class="content-item-preview">{item.previewText}</p>
								{/if}
							</div>
						{/each}
					</div>

					<!-- Mobile Action Bar for Left Panel -->
					{#if isTouchDevice && getSelectedCountInPanel('left') > 0}
						<div class="mobile-action-bar">
							<span class="selection-count">{getSelectedCountInPanel('left')} selected</span>
							<button type="button" class="action-btn clear-btn" onclick={clearSelection}>
								Clear
							</button>
							<button type="button" class="action-btn move-btn" onclick={moveSelectedToRight}>
								Move to All →
							</button>
						</div>
					{/if}
				</div>

				<!-- Right panel (all files initially) -->
				<div
					class="panel panel-right"
					class:drag-over={dragOverPanel === 'right'}
					style="background-color: {openFolder.color};"
					ondragover={handleDragOver}
					ondragenter={() => (dragOverPanel = 'right')}
					ondragleave={handleDragLeave}
					ondrop={(e) => handleDrop(e, 'right')}
					role="region"
					aria-label="All items"
					aria-live="polite"
				>
					<div class="panel-header">
						<div class="panel-label">All Items</div>
						<div class="sr-only" role="status" aria-live="polite">
							{rightPanelItems.length} item{rightPanelItems.length !== 1 ? 's' : ''} available
						</div>
					</div>

					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<div class="content-grid" role="listbox" aria-label="All items list">
						{#each rightPanelItems as item (item.id)}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<div
								draggable={!isTouchDevice}
								ondragstart={(e) => !isTouchDevice && handleDragStart(e, item)}
								ondragend={handleDragEnd}
								onclick={() => isTouchDevice && toggleSelection(item)}
								onkeydown={(e) => isTouchDevice && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleSelection(item))}
								class="content-item"
								class:dragging={draggedItem?.id === item.id}
								class:selected={selectedItems.has(item.id)}
								class:touch-mode={isTouchDevice}
								role="option"
								tabindex={isTouchDevice ? 0 : -1}
								aria-selected={selectedItems.has(item.id)}
							>
								{#if isTouchDevice}
									<div class="selection-indicator" aria-hidden="true">
										{#if selectedItems.has(item.id)}
											<svg class="checkmark" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
											</svg>
										{/if}
									</div>
								{/if}
								<div class="content-item-title">{item.title}</div>
								{#if item.subtitle}
									<div class="content-item-subtitle">{item.subtitle}</div>
								{/if}
								{#if item.previewText}
									<p class="content-item-preview">{item.previewText}</p>
								{/if}
							</div>
						{/each}
					</div>

					<!-- Mobile Action Bar for Right Panel -->
					{#if isTouchDevice && getSelectedCountInPanel('right') > 0}
						<div class="mobile-action-bar">
							<span class="selection-count">{getSelectedCountInPanel('right')} selected</span>
							<button type="button" class="action-btn clear-btn" onclick={clearSelection}>
								Clear
							</button>
							<button type="button" class="action-btn move-btn" onclick={moveSelectedToLeft}>
								← Move to Selected
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/**
	 * FILING CABINET CONTAINER
	 * 3D perspective for folder stack
	 */

	.filing-cabinet-container {
		perspective: 1000px;
		min-height: 600px;
		padding: 3rem 2rem;
		background: linear-gradient(to bottom, #f5f5f5 0%, #e8e8e8 100%);
		overflow: visible;
	}

	.folder-stack {
		position: relative;
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
		/* Reserve space for all stacked folders with bodies */
		min-height: 550px;
	}

	/**
	 * FOLDER WRAPPER AND CONTAINER
	 * 3D transform-based stacking with hover effects
	 */

	.folder-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		transform-origin: top center;

		/* Base stacking: larger vertical offset to show more of each folder */
		transform: translateY(calc(var(--folder-index, 0) * 60px))
			translateZ(calc(var(--folder-index, 0) * -5px)) rotateX(2deg);

		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* When hovering, folders beneath drop down */
	.folder-wrapper.is-beneath-hover {
		transform: translateY(calc(var(--folder-index, 0) * 60px + 80px))
			translateZ(calc(var(--folder-index, 0) * -5px)) rotateX(2deg);
	}

	.folder-container {
		width: 100%;
		border: none;
		background: transparent;
		cursor: pointer;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.folder-container:focus-visible {
		outline: 3px solid #146ef5;
		outline-offset: 2px;
		z-index: 1000;
	}

	/* Folder Tab - protruding top portion with label */
	.folder-tab {
		background: var(--folder-color);
		color: white;
		height: 45px;
		width: 70%;
		border-radius: 8px 8px 0 0;
		box-shadow:
			0 -2px 4px rgba(0, 0, 0, 0.1),
			inset 0 1px 2px rgba(255, 255, 255, 0.2);
		padding: 0 2rem;
		display: flex;
		align-items: center;
		font-size: 1rem;
		font-weight: 500;
		transition: all 0.2s ease;
		position: relative;
	}

	/* Folder Body - visible rectangular portion */
	.folder-body {
		background: var(--folder-color);
		width: 100%;
		height: 120px;
		border-radius: 0 8px 8px 8px;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.2),
			inset 0 -2px 6px rgba(0, 0, 0, 0.1),
			inset 0 2px 4px rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(0, 0, 0, 0.15);
		transition: all 0.2s ease;
	}

	.folder-container:hover .folder-tab {
		box-shadow:
			0 -2px 6px rgba(0, 0, 0, 0.15),
			inset 0 1px 3px rgba(255, 255, 255, 0.3);
	}

	.folder-container:hover .folder-body {
		box-shadow:
			0 6px 16px rgba(0, 0, 0, 0.25),
			inset 0 -2px 8px rgba(0, 0, 0, 0.15),
			inset 0 2px 6px rgba(255, 255, 255, 0.15);
		transform: translateZ(5px);
	}

	.folder-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Tooltip */
	.tooltip {
		position: absolute;
		top: calc(100% + 0.75rem);
		left: 50%;
		transform: translateX(-50%);
		padding: 0.625rem 1rem;
		background: rgba(0, 0, 0, 0.9);
		color: white;
		border-radius: 6px;
		white-space: nowrap;
		font-size: 0.875rem;
		font-weight: 400;
		pointer-events: none;
		z-index: 10000;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.tooltip::after {
		content: '';
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 6px solid transparent;
		border-bottom-color: rgba(0, 0, 0, 0.9);
	}

	/**
	 * MODAL VIEW (95vw × 95vh)
	 * Full-screen modal with backdrop
	 */

	.folder-modal {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
	}

	.modal-backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(2px);
	}

	.modal-content {
		position: relative;
		width: 95vw;
		height: 95vh;
		background: white;
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
		overflow: hidden;
		z-index: 1;
	}

	.close-btn {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: white;
		border: 2px solid #e2e8f0;
		cursor: pointer;
		transition: all 0.2s ease;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #4a5568;
	}

	.close-btn:hover {
		background: #f7fafc;
		border-color: #cbd5e0;
		transform: rotate(90deg);
		color: #2d3748;
	}

	.close-btn:focus-visible {
		outline: 3px solid #146ef5;
		outline-offset: 2px;
	}

	/**
	 * TWO-PANEL SYSTEM
	 * Left and right panels for organizing content
	 */

	.folder-panels {
		display: grid;
		grid-template-columns: 1fr 1fr;
		height: 100%;
		gap: 1px;
		background: #e2e8f0;
	}

	.panel {
		padding: 2rem;
		overflow-y: auto;
	}

	.panel-header {
		margin-bottom: 2rem;
	}

	.panel-label {
		font-size: 1.25rem;
		font-weight: 600;
		color: rgba(0, 0, 0, 0.8);
		margin-bottom: 0.5rem;
	}

	.empty-message {
		font-size: 1rem;
		color: rgba(0, 0, 0, 0.5);
		font-style: italic;
	}

	.panel.drag-over {
		border: 3px dashed rgba(0, 0, 0, 0.3);
		background: rgba(255, 255, 255, 0.2) !important;
	}

	/**
	 * CONTENT GRID AND ITEMS
	 * Draggable content items in panels
	 */

	.content-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.content-item {
		background: white;
		border: 2px solid #4ade80;
		border-radius: 8px;
		padding: 1.5rem;
		cursor: grab;
		transition: all 0.2s ease;
		user-select: none;
	}

	.content-item:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.content-item:active {
		cursor: grabbing;
	}

	.content-item.dragging {
		opacity: 0.5;
		cursor: grabbing;
	}

	.content-item:focus-visible {
		outline: 3px solid #146ef5;
		outline-offset: 2px;
	}

	.content-item-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #1a202c;
	}

	.content-item-subtitle {
		font-size: 0.875rem;
		color: #718096;
		margin-bottom: 0.75rem;
	}

	.content-item-preview {
		font-size: 0.9375rem;
		color: #4a5568;
		line-height: 1.6;
		margin: 0;
	}

	/**
	 * RESPONSIVE DESIGN
	 * Mobile and tablet adaptations
	 */

	@media (max-width: 768px) {
		.filing-cabinet-container {
			padding: 2rem 1rem;
			min-height: 500px;
		}

		.folder-stack {
			min-height: 450px;
		}

		.folder-wrapper {
			/* Reduce spacing on mobile */
			transform: translateY(calc(var(--folder-index, 0) * 50px)) !important;
		}

		.folder-wrapper.is-beneath-hover {
			transform: translateY(calc(var(--folder-index, 0) * 50px + 60px)) !important;
		}

		.folder-tab {
			height: 40px;
			padding: 0 1rem;
			font-size: 0.9375rem;
			width: 75%;
		}

		.folder-body {
			height: 100px;
		}

		.modal-content {
			width: 100vw;
			height: 100vh;
			border-radius: 0;
		}

		.folder-panels {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr 1fr;
		}

		.panel {
			padding: 1rem;
		}

		.content-grid {
			grid-template-columns: 1fr;
		}
	}

	/**
	 * REDUCED MOTION SUPPORT
	 * Respect user preference for reduced animations (accessibility requirement)
	 * Users with vestibular disorders can experience nausea from animations
	 */
	@media (prefers-reduced-motion: reduce) {
		.folder-wrapper,
		.folder-tab,
		.folder-body,
		.content-item,
		.close-btn {
			transition: none;
		}

		.folder-wrapper {
			/* Disable 3D transforms for reduced motion - use simple vertical offset */
			transform: translateY(calc(var(--folder-index, 0) * 60px)) !important;
		}

		.folder-wrapper.is-beneath-hover {
			/* Maintain reveal functionality but without animation */
			transform: translateY(calc(var(--folder-index, 0) * 60px + 80px)) !important;
		}
	}

	/**
	 * MOBILE TOUCH SELECTION STYLES
	 * Tap-to-select UI for touch devices
	 * Only visible on mobile (isTouchDevice === true)
	 */

	/* Selection indicator container (top-right of card) */
	.selection-indicator {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 2px solid #cbd5e0;
		background: white;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}

	/* Checkmark icon */
	.checkmark {
		width: 16px;
		height: 16px;
		color: white;
	}

	/* Content item in touch mode - pointer cursor, relative for indicator */
	.content-item.touch-mode {
		cursor: pointer;
		position: relative;
		/* Ensure room for selection indicator */
		padding-right: 3rem;
	}

	.content-item.touch-mode:hover {
		/* Override desktop hover lift on mobile */
		transform: none;
	}

	.content-item.touch-mode:active {
		/* Active press feedback */
		transform: scale(0.98);
		cursor: pointer;
	}

	/* Selected state styling */
	.content-item.selected {
		background: #ebf5ff;
		border-color: #3b82f6;
	}

	.content-item.selected .selection-indicator {
		background: #3b82f6;
		border-color: #3b82f6;
	}

	/**
	 * MOBILE ACTION BAR
	 * Sticky bar at bottom of panel for move/clear actions
	 */
	.mobile-action-bar {
		position: sticky;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		padding: 0.875rem 1rem;
		border-top: 1px solid #e2e8f0;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
		margin-top: 1rem;
		border-radius: 0 0 8px 8px;
		z-index: 10;
	}

	.selection-count {
		font-size: 0.875rem;
		font-weight: 500;
		color: #4a5568;
		flex-shrink: 0;
	}

	.action-btn {
		padding: 0.625rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		border: none;
		white-space: nowrap;
	}

	.clear-btn {
		background: #f1f5f9;
		color: #64748b;
		margin-left: auto;
	}

	.clear-btn:hover {
		background: #e2e8f0;
		color: #475569;
	}

	.move-btn {
		background: #3b82f6;
		color: white;
	}

	.move-btn:hover {
		background: #2563eb;
	}

	.action-btn:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/**
	 * MOBILE-SPECIFIC ENHANCEMENTS
	 * Compact layout and larger touch targets
	 */
	@media (max-width: 768px) {
		/* Compact card padding on mobile */
		.content-item {
			padding: 1rem;
			min-height: 44px; /* Touch target minimum */
		}

		.content-item.touch-mode {
			padding-right: 2.5rem;
		}

		.content-item-title {
			font-size: 1rem;
		}

		.content-item-subtitle {
			font-size: 0.8125rem;
			margin-bottom: 0.5rem;
		}

		.content-item-preview {
			font-size: 0.875rem;
			line-height: 1.5;
		}

		/* Smaller selection indicator on mobile */
		.selection-indicator {
			width: 22px;
			height: 22px;
			top: 0.625rem;
			right: 0.625rem;
		}

		.checkmark {
			width: 14px;
			height: 14px;
		}

		/* Adjust action bar for mobile */
		.mobile-action-bar {
			padding: 0.75rem;
			gap: 0.5rem;
			flex-wrap: wrap;
		}

		.selection-count {
			font-size: 0.8125rem;
		}

		.action-btn {
			padding: 0.5rem 0.875rem;
			font-size: 0.8125rem;
		}

		/* Stack panels need overflow visible for action bars */
		.panel {
			display: flex;
			flex-direction: column;
			overflow-y: auto;
		}

		.content-grid {
			flex: 1;
		}
	}

	/**
	 * SCREEN READER ONLY CONTENT
	 * Visually hidden but announced to screen readers for accessibility
	 * Used for live announcements of panel state changes
	 */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
