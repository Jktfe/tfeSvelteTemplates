<!--
FolderFiles - Hierarchical Folder/File Viewer with Document Display

Features:
- Two-level hierarchy: Folders contain files
- Colour-coded folder tabs with icons and tooltips
- Hover preview tooltips showing file metadata
- Optional 3D folder opening animation
- File list grid with click-to-open functionality
- Document viewer with single-page and two-page spread modes
- Page navigation for multi-page documents
- Keyboard shortcuts for navigation
- Fully responsive design
- Zero external dependencies (except Svelte built-in transitions)

Perfect for:
- Document management systems
- File browsers with preview
- Hierarchical content viewers
- Archive exploration interfaces

Technical Implementation:
- Svelte 5 runes for reactive state
- CSS 3D transforms for folder opening animation
- Crossfade transitions for smooth content changes
- Scoped CSS styles (fully self-contained)
- HTML sanitization with DOMPurify
- Accessibility: ARIA labels, keyboard navigation, focus management

@component
-->

<script lang="ts">
	import type { FolderFilesProps, Folder, FileItem } from '$lib/types';
	import { sanitizeHTML } from '$lib/utils';
	import { crossfade, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	// Props with defaults
	let {
		folders = [],
		files = [],
		initialFolderId,
		viewMode = $bindable('single'),
		showMetadata = $bindable(true),
		enable3DEffect = false
	}: FolderFilesProps = $props();

	// ==================================================
	// STATE MANAGEMENT
	// ==================================================

	type FolderState = 'idle' | 'hovering' | 'opening' | 'opened' | 'viewing';

	let selectedFolder = $state<Folder | null>(null);
	let selectedFile = $state<FileItem | null>(null);
	let folderState = $state<FolderState>('idle');
	let currentPage = $state(0);
	let isAnimating = $state(false);

	// Tooltip state
	let hoveredFolder = $state<Folder | null>(null);
	let tooltipPosition = $state<{ x: number; y: number } | null>(null);

	// Derived state
	let filesInFolder = $derived(
		selectedFolder ? files.filter((f) => f.folderId === selectedFolder!.id) : []
	);

	let canInteract = $derived(!isAnimating);

	let pageCount = $derived(selectedFile?.pages?.length ?? 1);

	// For spread view mode
	let leftPage = $derived.by(() => {
		if (!selectedFile || viewMode !== 'spread') return null;
		if (selectedFile.pages) {
			return selectedFile.pages[currentPage * 2];
		}
		return selectedFile.content;
	});

	let rightPage = $derived.by(() => {
		if (!selectedFile || viewMode !== 'spread') return null;
		if (selectedFile.pages && currentPage * 2 + 1 < selectedFile.pages.length) {
			return selectedFile.pages[currentPage * 2 + 1];
		}
		return null;
	});

	// Crossfade for content transitions
	const [send, receive] = crossfade({
		duration: 400,
		easing: quintOut,
		fallback: (node) => {
			return {
				duration: 400,
				css: (t) => `opacity: ${t}`
			};
		}
	});

	// ==================================================
	// FOLDER TAB INTERACTIONS
	// ==================================================

	function handleFolderHover(folder: Folder, event: MouseEvent) {
		if (isAnimating || folderState === 'viewing') return;

		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const tooltipHeight = 100;
		const spaceAbove = rect.top;
		const y =
			spaceAbove > tooltipHeight + 10 ? rect.top - tooltipHeight - 10 : rect.bottom + 10;

		hoveredFolder = folder;
		folderState = 'hovering';
		tooltipPosition = { x: rect.left, y };
	}

	function handleFolderLeave() {
		if (folderState === 'hovering') {
			hoveredFolder = null;
			folderState = selectedFolder ? 'opened' : 'idle';
			tooltipPosition = null;
		}
	}

	async function openFolder(folder: Folder) {
		if (isAnimating || selectedFolder?.id === folder.id) return;

		isAnimating = true;
		selectedFolder = folder;
		selectedFile = null;
		currentPage = 0;
		folderState = 'opening';

		// Simulate folder opening animation
		await new Promise((resolve) => setTimeout(resolve, enable3DEffect ? 900 : 200));

		folderState = 'opened';
		isAnimating = false;
	}

	// ==================================================
	// FILE INTERACTIONS
	// ==================================================

	function selectFile(file: FileItem) {
		if (isAnimating) return;

		selectedFile = file;
		currentPage = 0;
		folderState = 'viewing';
	}

	function closeViewer() {
		selectedFile = null;
		folderState = 'opened';
		currentPage = 0;
	}

	// ==================================================
	// PAGE NAVIGATION
	// ==================================================

	function nextPage() {
		if (viewMode === 'single') {
			if (currentPage < pageCount - 1) currentPage++;
		} else {
			// Spread view: advance by 2
			if (currentPage * 2 + 2 < pageCount) currentPage++;
		}
	}

	function prevPage() {
		if (currentPage > 0) currentPage--;
	}

	function toggleViewMode() {
		if (!selectedFile || isAnimating) return;
		viewMode = viewMode === 'single' ? 'spread' : 'single';
		// Reset to page 0 when switching modes to avoid confusion
		currentPage = 0;
	}

	// ==================================================
	// KEYBOARD SHORTCUTS
	// ==================================================

	$effect(() => {
		if (typeof window === 'undefined') return;

		function handleKeydown(e: KeyboardEvent) {
			if (folderState !== 'viewing' || !selectedFile) return;

			switch (e.key) {
				case 'ArrowRight':
					e.preventDefault();
					nextPage();
					break;
				case 'ArrowLeft':
					e.preventDefault();
					prevPage();
					break;
				case 'v':
					e.preventDefault();
					toggleViewMode();
					break;
				case 'Escape':
					e.preventDefault();
					closeViewer();
					break;
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	// ==================================================
	// INITIALIZATION
	// ==================================================

	$effect(() => {
		if (initialFolderId && folders.length > 0) {
			const folder = folders.find((f) => f.id === initialFolderId);
			if (folder) openFolder(folder);
		}
	});
</script>

<div class="folderfiles-container">
	<!-- Folder Tabs -->
	<div class="folder-tabs">
		{#each folders as folder (folder.id)}
			<button
				class="folder-tab {folder.color} {folder.textColor}"
				class:active={selectedFolder?.id === folder.id}
				onclick={() => openFolder(folder)}
				onmouseenter={(e) => handleFolderHover(folder, e)}
				onmouseleave={handleFolderLeave}
				disabled={!canInteract}
				aria-label="Open {folder.label} folder"
			>
				{#if folder.icon}<span class="icon">{folder.icon}</span>{/if}
				<span class="label">{folder.label}</span>
			</button>
		{/each}
	</div>

	<!-- Hover Tooltip -->
	{#if hoveredFolder && tooltipPosition && folderState === 'hovering'}
		<div
			class="tooltip"
			style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;"
			in:fade={{ duration: 200 }}
			out:fade={{ duration: 150 }}
			role="tooltip"
		>
			<div class="tooltip-header">{hoveredFolder.label}</div>
			{#if hoveredFolder.description}
				<div class="tooltip-description">{hoveredFolder.description}</div>
			{/if}
			{#if filesInFolder.length > 0}
				<div class="tooltip-preview">{filesInFolder[0].previewText}</div>
				{#if filesInFolder[0].metadata?.date}
					<div class="tooltip-date">{filesInFolder[0].metadata.date}</div>
				{/if}
			{/if}
		</div>
	{/if}

	<!-- 3D Folder Opening Animation Layer -->
	{#if enable3DEffect && isAnimating && folderState === 'opening' && selectedFolder}
		<div class="folder-3d-animation" in:fade={{ duration: 300 }} out:fade={{ duration: 200 }}>
			<div class="folder-3d-container">
				<div class="folder-front {selectedFolder.color}">
					<span class="folder-label">{selectedFolder.label}</span>
				</div>
			</div>
		</div>
	{/if}

	<!-- File List (shown when folder selected but no file selected) -->
	{#if selectedFolder && !selectedFile && folderState !== 'opening'}
		<div class="file-list" in:fade={{ duration: 300 }}>
			<div class="file-list-header">
				<h2>{selectedFolder.label}</h2>
				<p class="file-count">{filesInFolder.length} file{filesInFolder.length !== 1 ? 's' : ''}</p>
			</div>

			{#if filesInFolder.length > 0}
				<div class="file-grid">
					{#each filesInFolder as file (file.id)}
						<button
							class="file-item"
							onclick={() => selectFile(file)}
							in:fade={{ duration: 300, delay: 50 }}
						>
							{#if file.thumbnailUrl}
								<img src={file.thumbnailUrl} alt={file.title} class="file-thumbnail" />
							{/if}
							<div class="file-info">
								<div class="file-title">{file.title}</div>
								{#if file.subtitle}
									<div class="file-subtitle">{file.subtitle}</div>
								{/if}
								<div class="file-preview-snippet">{file.previewText.slice(0, 120)}...</div>
							</div>
						</button>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<p>No files in this folder</p>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Document Viewer -->
	{#if selectedFile && folderState === 'viewing'}
		<div class="document-viewer" in:receive={{ key: selectedFile.id }} out:send={{ key: selectedFile.id }}>
			<!-- Viewer Toolbar -->
			<div class="viewer-toolbar">
				<button onclick={closeViewer} class="toolbar-btn" aria-label="Back to file list">
					← Back to Files
				</button>

				<div class="toolbar-center">
					<h3>{selectedFile.title}</h3>
					{#if selectedFile.subtitle}
						<span class="subtitle">{selectedFile.subtitle}</span>
					{/if}
				</div>

				<div class="toolbar-actions">
					{#if selectedFile.pages && selectedFile.pages.length > 1}
						<button
							onclick={toggleViewMode}
							class="toolbar-btn"
							aria-label="Toggle between single and spread view"
						>
							{viewMode === 'single' ? '📖 Spread View' : '📄 Single Page'}
						</button>
					{/if}

					<button
						onclick={() => (showMetadata = !showMetadata)}
						class="toolbar-btn"
						aria-label="Toggle metadata display"
					>
						{showMetadata ? 'Hide Info' : 'Show Info'}
					</button>
				</div>
			</div>

			<!-- Metadata Panel -->
			{#if showMetadata && selectedFile.metadata}
				<div class="metadata-panel" transition:fade={{ duration: 200 }}>
					{#if selectedFile.metadata.author}
						<span><strong>Author:</strong> {selectedFile.metadata.author}</span>
					{/if}
					{#if selectedFile.metadata.date}
						<span><strong>Date:</strong> {selectedFile.metadata.date}</span>
					{/if}
					{#if selectedFile.metadata.pageCount}
						<span><strong>Pages:</strong> {selectedFile.metadata.pageCount}</span>
					{/if}
					{#if selectedFile.metadata.wordCount}
						<span><strong>Words:</strong> {selectedFile.metadata.wordCount.toLocaleString()}</span>
					{/if}
					{#if selectedFile.metadata.fileNumber}
						<span><strong>File:</strong> {selectedFile.metadata.fileNumber}</span>
					{/if}
				</div>
			{/if}

			<!-- Page Container -->
			<div class="page-container" class:spread={viewMode === 'spread'}>
				{#if viewMode === 'single'}
					<!-- Single Page View -->
					{#key currentPage}
						<div class="document-page" in:fade={{ duration: 200 }}>
							<!-- Binder holes on left -->
							<div class="binder-holes holes-left">
								<div class="hole"></div>
								<div class="hole"></div>
								<div class="hole"></div>
							</div>

							<!-- Content -->
							<div class="content-area">
								{@html sanitizeHTML(selectedFile.pages?.[currentPage] ?? selectedFile.content ?? '')}
							</div>

							<!-- File number -->
							{#if selectedFile.metadata?.fileNumber}
								<div class="file-number">{selectedFile.metadata.fileNumber}</div>
							{/if}
						</div>
					{/key}
				{:else}
					<!-- Spread View (Two Pages Side-by-Side) -->
					<div class="spread-pages">
						{#if leftPage}
							{#key currentPage}
								<div class="document-page page-left" in:fade={{ duration: 200 }}>
									<!-- Binder holes on right for left page -->
									<div class="binder-holes holes-right">
										<div class="hole"></div>
										<div class="hole"></div>
										<div class="hole"></div>
									</div>

									<div class="content-area">
										{@html sanitizeHTML(leftPage)}
									</div>

									{#if selectedFile.metadata?.fileNumber}
										<div class="file-number">{selectedFile.metadata.fileNumber}</div>
									{/if}
								</div>
							{/key}
						{/if}

						{#if rightPage}
							{#key currentPage}
								<div class="document-page page-right" in:fade={{ duration: 200 }}>
									<!-- Binder holes on left for right page -->
									<div class="binder-holes holes-left">
										<div class="hole"></div>
										<div class="hole"></div>
										<div class="hole"></div>
									</div>

									<div class="content-area">
										{@html sanitizeHTML(rightPage)}
									</div>
								</div>
							{/key}
						{/if}
					</div>
				{/if}
			</div>

			<!-- Page Navigation -->
			{#if selectedFile.pages && selectedFile.pages.length > 1}
				<div class="page-navigation">
					<button
						onclick={prevPage}
						disabled={currentPage === 0}
						class="nav-btn"
						aria-label="Previous page"
					>
						← Previous
					</button>

					<span class="page-indicator">
						{#if viewMode === 'single'}
							Page {currentPage + 1} of {pageCount}
						{:else}
							Pages {currentPage * 2 + 1}{rightPage ? `-${currentPage * 2 + 2}` : ''} of {pageCount}
						{/if}
					</span>

					<button
						onclick={nextPage}
						disabled={viewMode === 'single' ? currentPage >= pageCount - 1 : currentPage * 2 + 2 >= pageCount}
						class="nav-btn"
						aria-label="Next page"
					>
						Next →
					</button>
				</div>

				<!-- Keyboard shortcut hints -->
				<div class="keyboard-hints">
					<span>← → Navigate</span>
					<span>V Toggle View</span>
					<span>Esc Close</span>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* ==================================================
   * CONTAINER & LAYOUT
   * ================================================== */

	.folderfiles-container {
		width: 100%;
		min-height: 400px;
		background: #f9fafb;
		border-radius: 8px;
		overflow: hidden;
	}

	/* ==================================================
   * FOLDER TABS
   * ================================================== */

	.folder-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 1.5rem;
		background: #ffffff;
		border-bottom: 2px solid #e5e7eb;
	}

	.folder-tab {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		font-weight: 500;
		font-size: 0.9375rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.folder-tab:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.folder-tab.active {
		transform: translateY(-3px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
		font-weight: 600;
	}

	.folder-tab:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.folder-tab .icon {
		font-size: 1.25rem;
	}

	/* ==================================================
   * TOOLTIP
   * ================================================== */

	.tooltip {
		position: fixed;
		z-index: 1000;
		background: rgba(0, 0, 0, 0.92);
		color: white;
		border-radius: 8px;
		padding: 1rem;
		max-width: 320px;
		pointer-events: none;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(10px);
	}

	.tooltip-header {
		font-weight: 600;
		font-size: 0.9375rem;
		margin-bottom: 0.5rem;
		color: #60a5fa;
	}

	.tooltip-description {
		font-size: 0.8125rem;
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 0.5rem;
	}

	.tooltip-preview {
		font-size: 0.8125rem;
		line-height: 1.4;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 0.5rem;
	}

	.tooltip-date {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.6);
		font-style: italic;
	}

	/* ==================================================
   * 3D FOLDER ANIMATION
   * ================================================== */

	.folder-3d-animation {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
	}

	.folder-3d-container {
		perspective: 1200px;
		transform-style: preserve-3d;
	}

	.folder-front {
		width: 400px;
		height: 250px;
		padding: 2rem;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
		animation: folder-open-3d 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		will-change: transform;
		backface-visibility: hidden;
	}

	.folder-label {
		font-size: 1.5rem;
		font-weight: 600;
		color: white;
	}

	@keyframes folder-open-3d {
		0% {
			transform: perspective(1200px) rotateX(0deg) translateZ(0px) scale(1);
		}
		40% {
			transform: perspective(1200px) rotateX(-15deg) translateZ(100px) scale(1.05);
		}
		60% {
			transform: perspective(1200px) rotateX(-25deg) translateZ(150px) scale(1.1);
		}
		100% {
			transform: perspective(1200px) rotateX(0deg) translateZ(0px) scale(1);
		}
	}

	/* ==================================================
   * FILE LIST
   * ================================================== */

	.file-list {
		padding: 2rem;
	}

	.file-list-header {
		margin-bottom: 1.5rem;
	}

	.file-list-header h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.file-count {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.file-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.file-item {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1.25rem;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.file-item:hover {
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
		transform: translateY(-4px);
		border-color: #3b82f6;
	}

	.file-thumbnail {
		width: 100%;
		height: 150px;
		object-fit: cover;
		border-radius: 0.25rem;
		margin-bottom: 1rem;
	}

	.file-title {
		font-weight: 600;
		font-size: 1rem;
		margin-bottom: 0.25rem;
		color: #111827;
	}

	.file-subtitle {
		font-size: 0.875rem;
		color: #6b7280;
		margin-bottom: 0.5rem;
	}

	.file-preview-snippet {
		font-size: 0.8125rem;
		color: #4b5563;
		line-height: 1.5;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: #6b7280;
	}

	/* ==================================================
   * DOCUMENT VIEWER
   * ================================================== */

	.document-viewer {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.viewer-toolbar {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: white;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		flex-wrap: wrap;
	}

	.toolbar-btn {
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.toolbar-btn:hover {
		background: #e5e7eb;
	}

	.toolbar-center {
		flex: 1;
		text-align: center;
	}

	.toolbar-center h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
	}

	.toolbar-center .subtitle {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.toolbar-actions {
		display: flex;
		gap: 0.5rem;
	}

	.metadata-panel {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
	}

	.metadata-panel span {
		color: #374151;
	}

	/* ==================================================
   * DOCUMENT PAGES
   * ================================================== */

	.page-container {
		margin: 2rem 0;
		transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.page-container.spread {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	@media (min-width: 900px) {
		.page-container.spread {
			grid-template-columns: 1fr 1fr;
		}
	}

	.spread-pages {
		display: flex;
		gap: 2rem;
		justify-content: center;
	}

	.document-page {
		background: white;
		padding: 3rem 2.5rem;
		min-height: 600px;
		border-radius: 0.375rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		position: relative;
		font-family: Georgia, 'Times New Roman', serif;
		line-height: 1.8;
	}

	.page-left,
	.page-right {
		flex: 1;
		max-width: 500px;
	}

	/* Binder holes */
	.binder-holes {
		position: absolute;
		top: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		padding: 3rem 0;
	}

	.binder-holes.holes-left {
		left: 1rem;
	}

	.binder-holes.holes-right {
		right: 1rem;
	}

	.hole {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	/* Content styling */
	.content-area :global(h1) {
		font-size: 2rem;
		font-style: italic;
		margin-bottom: 1.5rem;
		font-weight: 400;
	}

	.content-area :global(h2) {
		font-size: 1.5rem;
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	.content-area :global(p) {
		margin-bottom: 1.25rem;
		text-align: justify;
	}

	.content-area :global(ul),
	.content-area :global(ol) {
		margin-bottom: 1.25rem;
		padding-left: 2rem;
	}

	.content-area :global(li) {
		margin-bottom: 0.5rem;
	}

	.file-number {
		position: absolute;
		bottom: 1rem;
		right: 1.5rem;
		font-size: 0.875rem;
		color: rgba(0, 0, 0, 0.5);
		font-style: italic;
	}

	/* ==================================================
   * PAGE NAVIGATION
   * ================================================== */

	.page-navigation {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 2rem;
		margin-top: 2rem;
		padding: 1rem;
		background: white;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.nav-btn {
		padding: 0.5rem 1.5rem;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
	}

	.nav-btn:hover:not(:disabled) {
		background: #2563eb;
	}

	.nav-btn:disabled {
		background: #d1d5db;
		cursor: not-allowed;
	}

	.page-indicator {
		font-weight: 500;
		color: #374151;
	}

	.keyboard-hints {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		margin-top: 1rem;
		font-size: 0.75rem;
		color: #6b7280;
	}

	.keyboard-hints span {
		background: #f3f4f6;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
	}

	/* ==================================================
   * RESPONSIVE
   * ================================================== */

	@media (max-width: 768px) {
		.folder-tabs {
			padding: 1rem;
		}

		.folder-tab {
			padding: 0.625rem 1rem;
			font-size: 0.875rem;
		}

		.file-grid {
			grid-template-columns: 1fr;
		}

		.document-page {
			padding: 2rem 1.5rem;
		}

		.content-area :global(h1) {
			font-size: 1.5rem;
		}

		.binder-holes .hole {
			width: 30px;
			height: 30px;
		}

		.spread-pages {
			flex-direction: column;
		}

		.toolbar-actions {
			width: 100%;
		}
	}

	/* ==================================================
   * REDUCED MOTION
   * ================================================== */

	@media (prefers-reduced-motion: reduce) {
		* {
			animation-duration: 0.2s !important;
			transition-duration: 0.2s !important;
		}

		@keyframes folder-open-3d {
			0%,
			100% {
				opacity: 1;
			}
		}
	}
</style>
