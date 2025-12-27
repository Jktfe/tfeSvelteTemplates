<script lang="ts">
	/**
	 * ============================================================
	 * FolderFiles - 3D Filing Cabinet Component
	 * ============================================================
	 *
	 * [CR] WHAT IT DOES
	 * A 3D filing cabinet system with stacked folders. Each folder has a
	 * colored tab - hover reveals folders beneath (cascade effect), click
	 * opens a full-screen modal with two-panel drag-and-drop organization.
	 *
	 * [NTL] THE SIMPLE VERSION
	 * Remember those old filing cabinets with colored folder tabs sticking
	 * out? This is the digital version! Hover over a tab and the folders
	 * beneath drop down like a reveal. Click to open and drag files between
	 * "Selected" and "All Items" panels - like sorting papers on your desk.
	 *
	 * [CR] TECHNICAL APPROACH
	 * - CSS 3D transforms with perspective for depth illusion
	 * - Native HTML5 Drag-and-Drop API (no external libraries)
	 * - Mobile: Tap-to-select with action bar (no drag on touch)
	 * - Svelte 5 runes for all state management
	 * - Focus trap + scroll lock for modal accessibility
	 *
	 * [CR] DEPENDENCIES
	 * - $lib/types (Folder, FileItem interfaces)
	 * - $lib/scrollLock (coordinated body scroll prevention)
	 * - Zero external animation/UI libraries
	 *
	 * [CR] KNOWN SVELTE WARNINGS (Safe to ignore)
	 * - a11y_no_noninteractive_element_interactions: Intentional - listbox items need click
	 * - a11y_click_events_have_key_events: Handled via onkeydown on same element
	 * - a11y_no_static_element_interactions: Container click clears mobile preview state
	 *
	 * ============================================================
	 * @component
	 */

	// [CR] IMPORTS
	import type { Folder, FileItem } from '$lib/types';
	import { lockScroll } from '$lib/scrollLock';

	// [CR] COMPONENT PROPS
	// [NTL] Pass in your folders and files - the component handles the rest!
	let {
		folders = [], // [CR] Array of folder objects with id, label, color
		files = [] // [CR] Array of file items, each referencing a folderId
	}: {
		folders: Folder[];
		files: FileItem[];
	} = $props();

	// ============================================================
	// [CR] STATE MANAGEMENT (Svelte 5 Runes)
	// [NTL] All the "memory" the component needs to track what's happening
	// ============================================================

	// [CR] Hover state - which folder tab is being hovered?
	// [NTL] When you hover over a folder tab, this remembers which one
	let hoveredIndex = $state<number | null>(null);

	// [CR] Open state - which folder is currently opened in modal view?
	// [NTL] null = cabinet view, Folder object = modal is showing that folder
	let openFolder = $state<Folder | null>(null);

	// [CR] Panel organization - tracks which items are in which panel
	// [NTL] Left panel = "Selected" (initially empty), Right = "All Items"
	let leftPanelItems = $state<FileItem[]>([]);
	let rightPanelItems = $state<FileItem[]>([]);

	// [CR] Desktop drag-and-drop state
	// [NTL] Tracks what you're dragging and where you're hovering over
	let draggedItem = $state<FileItem | null>(null);
	let dragOverPanel = $state<'left' | 'right' | null>(null);

	// [CR] Mobile detection - coarse pointer (finger) + narrow screen
	// [NTL] Desktop touchscreens still get drag-and-drop (fine pointer)
	let isTouchDevice = $state(false);

	// [CR] Mobile selection state - Set of selected item IDs for tap-to-select
	// [NTL] On mobile, you tap items to select them, then use buttons to move
	let selectedItems = $state<Set<number>>(new Set());

	// [CR] Mobile preview state - tracks which folder is "previewed" (first tap)
	// [NTL] On mobile: first tap shows cascade + tooltip, second tap opens folder
	let mobilePreviewIndex = $state<number | null>(null);

	// [CR] Scroll lock cleanup function - prevents body scroll while modal is open
	let unlockScroll: (() => void) | null = null;

	// ============================================================
	// [CR] MOBILE DETECTION EFFECT
	// [NTL] Figure out if the user is on a phone (finger-based input)
	// ============================================================
	$effect(() => {
		if (typeof window !== 'undefined') {
			// [CR] pointer: coarse = finger/stylus (not mouse), <= 768px = mobile width
			// [NTL] This combo tells us "real mobile phone" vs "laptop with touchscreen"
			const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
			const isMobileWidth = window.innerWidth <= 768;
			isTouchDevice = coarsePointer && isMobileWidth;
		}
	});

	// ============================================================
	// [CR] COMPUTED VALUES
	// ============================================================

	/**
	 * [CR] Get file count for tooltip display
	 * [NTL] Shows "Inbox (5 items)" when hovering over folder tab
	 */
	function getFileCount(folder: Folder): number {
		return files.filter((f) => f.folderId === folder.id).length;
	}

	// ============================================================
	// [CR] FOLDER MANAGEMENT FUNCTIONS
	// [NTL] Controls for the filing cabinet - hover, click, open, close
	// ============================================================

	/** [CR] Track which folder is being hovered for cascade effect */
	function handleFolderHover(index: number) {
		hoveredIndex = index;
	}

	/** [CR] Clear hover state when mouse leaves folder */
	function handleFolderLeave() {
		hoveredIndex = null;
	}

	/**
	 * [CR] Handle folder click - implements two-tap pattern on mobile
	 * [NTL] On mobile: first tap shows cascade + tooltip, second tap opens!
	 * Desktop users click once to open (hover already showed the preview).
	 */
	function handleFolderClick(folder: Folder, index: number) {
		if (isTouchDevice) {
			// [CR] Mobile two-tap pattern
			if (mobilePreviewIndex === index) {
				// [NTL] Second tap on same folder → open it!
				openFolderView(folder);
				mobilePreviewIndex = null;
			} else {
				// [NTL] First tap → show cascade effect and tooltip
				hoveredIndex = index;
				mobilePreviewIndex = index;
			}
		} else {
			// [CR] Desktop: single click opens (hover already showed preview)
			openFolderView(folder);
		}
	}

	/**
	 * [CR] Clear mobile preview when tapping outside folders
	 * [NTL] Tap elsewhere → reset the preview state
	 */
	function clearMobilePreview() {
		if (isTouchDevice && mobilePreviewIndex !== null) {
			mobilePreviewIndex = null;
			hoveredIndex = null;
		}
	}

	/**
	 * [CR] Open folder modal view
	 * [NTL] Click a folder tab → opens the big modal with two panels!
	 */
	function openFolderView(folder: Folder) {
		openFolder = folder;

		// [CR] Filter files belonging to this folder
		const folderFiles = files.filter((f) => f.folderId === folder.id);

		// [CR] Initialize: Left panel empty, right has all files
		// [NTL] Fresh start - everything in "All Items", nothing "Selected" yet
		leftPanelItems = [];
		rightPanelItems = folderFiles;

		// [CR] Lock body scroll using coordinated utility
		// [NTL] Stops the page from scrolling behind the modal
		unlockScroll = lockScroll();
	}

	/**
	 * [CR] Close folder modal and reset state
	 * [NTL] Click X or Escape → back to the cabinet view
	 */
	function closeFolderView() {
		openFolder = null;
		leftPanelItems = [];
		rightPanelItems = [];

		// [CR] Restore body scroll
		if (unlockScroll) {
			unlockScroll();
			unlockScroll = null;
		}
	}

	// ============================================================
	// [CR] DRAG-AND-DROP HANDLERS (Native HTML5 API)
	// [NTL] The magic that lets you grab items and move them between panels!
	// Only used on desktop - mobile gets tap-to-select instead.
	// ============================================================

	/**
	 * [CR] Start drag operation - set data transfer and track dragged item
	 * [NTL] Pick up the file card - now you're holding it!
	 */
	function handleDragStart(e: DragEvent, item: FileItem) {
		draggedItem = item;

		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', item.id.toString());
		}
	}

	/**
	 * [CR] Handle drag over panel - must prevent default to allow drop
	 * [NTL] Hover over a panel while dragging → cursor changes to show it's OK to drop
	 */
	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
	}

	/**
	 * [CR] Clear drag-over visual state when leaving panel
	 * [NTL] Move your cursor away → panel stops glowing
	 */
	function handleDragLeave(e: DragEvent) {
		// [CR] Only clear if leaving the panel itself, not a child element
		if (e.currentTarget === e.target) {
			dragOverPanel = null;
		}
	}

	/**
	 * [CR] Handle drop - move item between panels
	 * [NTL] Let go of the file → it lands in the new panel!
	 */
	function handleDrop(e: DragEvent, targetPanel: 'left' | 'right') {
		e.preventDefault();

		if (!draggedItem) return;

		// [CR] Capture reference - $state variables need this for TypeScript narrowing
		const item = draggedItem;
		const sourcePanel = leftPanelItems.includes(item) ? 'left' : 'right';

		// [CR] Dropping in same panel = no-op
		if (sourcePanel === targetPanel) {
			dragOverPanel = null;
			return;
		}

		// [CR] Move item: remove from source, add to target
		// [NTL] File moves from one panel to the other - like sorting papers!
		if (targetPanel === 'left') {
			rightPanelItems = rightPanelItems.filter((f) => f.id !== item.id);
			leftPanelItems = [...leftPanelItems, item];
		} else {
			leftPanelItems = leftPanelItems.filter((f) => f.id !== item.id);
			rightPanelItems = [...rightPanelItems, item];
		}

		dragOverPanel = null;
	}

	/**
	 * [CR] Cleanup drag state when drag operation ends
	 * [NTL] Done dragging → forget what we were holding
	 */
	function handleDragEnd() {
		draggedItem = null;
		dragOverPanel = null;
	}

	// ============================================================
	// [CR] MOBILE TOUCH SELECTION FUNCTIONS
	// [NTL] On phones, you can't drag - so we use "tap to select" instead!
	// These only activate when isTouchDevice === true
	// ============================================================

	/**
	 * [CR] Toggle selection of an item (tap-to-select for mobile)
	 * [NTL] Tap a file card → checkmark appears. Tap again → checkmark gone.
	 */
	function toggleSelection(item: FileItem) {
		const newSet = new Set(selectedItems);
		if (newSet.has(item.id)) {
			newSet.delete(item.id);
		} else {
			newSet.add(item.id);
		}
		// [CR] Must reassign Set to trigger Svelte reactivity
		selectedItems = newSet;
	}

	/**
	 * [CR] Clear all selections
	 * [NTL] "Clear" button - uncheck everything
	 */
	function clearSelection() {
		selectedItems = new Set();
	}

	/**
	 * [CR] Move selected items from right → left panel
	 * [NTL] "Move to Selected" button moves checked items to the left panel
	 */
	function moveSelectedToLeft() {
		const itemsToMove = rightPanelItems.filter((item) => selectedItems.has(item.id));
		rightPanelItems = rightPanelItems.filter((item) => !selectedItems.has(item.id));
		leftPanelItems = [...leftPanelItems, ...itemsToMove];
		clearSelection();
	}

	/**
	 * [CR] Move selected items from left → right panel
	 * [NTL] "Move to All" button moves checked items back to the right panel
	 */
	function moveSelectedToRight() {
		const itemsToMove = leftPanelItems.filter((item) => selectedItems.has(item.id));
		leftPanelItems = leftPanelItems.filter((item) => !selectedItems.has(item.id));
		rightPanelItems = [...rightPanelItems, ...itemsToMove];
		clearSelection();
	}

	/**
	 * [CR] Count selected items in a specific panel (for action bar display)
	 * [NTL] Shows "3 selected" text in the action bar
	 */
	function getSelectedCountInPanel(panel: 'left' | 'right'): number {
		const items = panel === 'left' ? leftPanelItems : rightPanelItems;
		return items.filter((item) => selectedItems.has(item.id)).length;
	}

	// ============================================================
	// [CR] FOCUS TRAP FOR MODAL ACCESSIBILITY
	// [NTL] Keep Tab key trapped inside the modal - can't accidentally escape!
	// This is critical for screen reader and keyboard-only users.
	// ============================================================

	/**
	 * [CR] Svelte action: Setup focus trap on mount, cleanup on destroy
	 * [NTL] This is like an invisible fence around the modal - Tab key cycles
	 * through buttons inside, never escaping to the page behind.
	 */
	function setupFocusTrap(node: HTMLElement) {
		// [CR] Selector for all focusable elements (buttons, links, inputs, draggables)
		const focusableSelector =
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [draggable="true"]';

		function updateFocusableElements() {
			return node.querySelectorAll<HTMLElement>(focusableSelector);
		}

		/**
		 * [CR] Tab key handler - wraps focus from last→first or first→last
		 * [NTL] At the end? Tab takes you back to start. At start? Shift+Tab goes to end.
		 */
		function handleTabKey(e: KeyboardEvent) {
			if (e.key !== 'Tab') return;

			const focusableElements = updateFocusableElements();
			if (focusableElements.length === 0) return;

			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			// [CR] Shift+Tab at first element → jump to last
			if (e.shiftKey && document.activeElement === firstElement) {
				e.preventDefault();
				lastElement?.focus();
			}
			// [CR] Tab at last element → jump to first
			else if (!e.shiftKey && document.activeElement === lastElement) {
				e.preventDefault();
				firstElement?.focus();
			}
		}

		node.addEventListener('keydown', handleTabKey);

		// [CR] Auto-focus close button on mount - good UX for keyboard users
		const closeButton = node.querySelector<HTMLElement>('.close-btn');
		closeButton?.focus();

		// [CR] Return Svelte action cleanup
		return {
			destroy() {
				node.removeEventListener('keydown', handleTabKey);
			}
		};
	}
</script>

<!-- FILING CABINET VIEW (closed state) -->
{#if !openFolder}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="filing-cabinet-container"
		role="region"
		aria-label="Filing cabinet with folders"
		onclick={clearMobilePreview}
	>
		<div class="folder-stack">
			{#each folders as folder, index (folder.id)}
				<div
					class="folder-wrapper"
					class:is-beneath-hover={hoveredIndex !== null && index > hoveredIndex}
					class:is-previewed={mobilePreviewIndex === index}
					style="--folder-index: {index}; --folder-color: {folder.color}; z-index: {index};"
					role="group"
				>
					<button
						class="folder-container"
						onclick={(e) => { e.stopPropagation(); handleFolderClick(folder, index); }}
						onmouseenter={() => handleFolderHover(index)}
						onmouseleave={handleFolderLeave}
						aria-label="{isTouchDevice && mobilePreviewIndex !== index ? 'Preview' : 'Open'} {folder.label} folder ({getFileCount(folder)} items)"
					>
						<!-- Folder Tab (protruding top portion) -->
						<div
							class="folder-tab"
							style="{index % 3 === 2 ? 'margin-left: auto; margin-right: 0;' : `margin-left: calc(${index % 3} * 15%);`}"
						>
							<span class="folder-label">{folder.label}</span>

							<!-- Hover tooltip (on mobile, shows "Tap to open" hint) -->
							{#if hoveredIndex === index}
								<div class="tooltip">
									{folder.label} ({getFileCount(folder)} items)
									{#if isTouchDevice && mobilePreviewIndex === index}
										<div class="tap-hint">Tap to open</div>
									{/if}
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
		height: 400px;
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

	/**
	 * MOBILE PREVIEW STATE
	 * [CR] Visual feedback when folder is previewed (first tap on mobile)
	 * [NTL] Glowing border says "tap again to open me!"
	 */
	.folder-wrapper.is-previewed .folder-tab {
		box-shadow:
			0 0 0 3px rgba(255, 255, 255, 0.8),
			0 0 12px rgba(255, 255, 255, 0.4),
			0 -2px 6px rgba(0, 0, 0, 0.15),
			inset 0 1px 3px rgba(255, 255, 255, 0.3);
	}

	.folder-wrapper.is-previewed .folder-body {
		box-shadow:
			0 0 0 3px rgba(255, 255, 255, 0.8),
			0 0 12px rgba(255, 255, 255, 0.4),
			0 6px 16px rgba(0, 0, 0, 0.25),
			inset 0 -2px 8px rgba(0, 0, 0, 0.15),
			inset 0 2px 6px rgba(255, 255, 255, 0.15);
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

	/* [CR] Mobile tap hint - shows "Tap to open" on second line */
	.tap-hint {
		margin-top: 0.375rem;
		padding-top: 0.375rem;
		border-top: 1px solid rgba(255, 255, 255, 0.3);
		font-size: 0.75rem;
		font-weight: 500;
		color: #4ade80;
		text-transform: uppercase;
		letter-spacing: 0.05em;
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
			height: 300px;
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

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
