<script lang="ts">
	import FolderFiles from '$lib/components/FolderFiles.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';

	let { data } = $props();

	let viewMode = $state<'single' | 'spread'>('single');
	let showMetadata = $state(true);
	let enable3DEffect = $state(true);
</script>

<svelte:head>
	<title>FolderFiles Demo - Hierarchical Document Viewer</title>
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<h1>FolderFiles Component</h1>
		<p>Hierarchical folder/file viewer with document display capabilities</p>
		<DatabaseStatus usingDatabase={data.usingDatabase} />
	</header>

	<section class="demo-section">
		<h2>Interactive Demo</h2>
		<p class="demo-instructions">
			<strong>How to use:</strong> Click a folder tab to view its files → Click a file to open
			the document viewer → Use keyboard shortcuts (← → to navigate, V to toggle view, Esc to
			close)
		</p>

		<!-- Component Options -->
		<div class="component-options">
			<label class="option">
				<input type="checkbox" bind:checked={enable3DEffect} />
				<span>Enable 3D folder opening animation</span>
			</label>
		</div>

		<div class="demo-container">
			<FolderFiles
				folders={data.folders}
				files={data.files}
				bind:viewMode
				bind:showMetadata
				{enable3DEffect}
			/>
		</div>
	</section>

	<section class="features-section">
		<h2>Component Features</h2>
		<div class="features-grid">
			<div class="feature-card">
				<h3>🗂️ Two-Level Hierarchy</h3>
				<p>Folders contain files. Navigate through folders to explore their contents.</p>
			</div>

			<div class="feature-card">
				<h3>🎨 Colour-Coded Tabs</h3>
				<p>Each folder has customisable background colour, text colour, and icon.</p>
			</div>

			<div class="feature-card">
				<h3>👁️ Hover Previews</h3>
				<p>Tooltips show file metadata and preview text when hovering over folder tabs.</p>
			</div>

			<div class="feature-card">
				<h3>📐 3D Animations</h3>
				<p>Optional 3D folder opening animation with CSS perspective transforms.</p>
			</div>

			<div class="feature-card">
				<h3>📄 Document Viewer</h3>
				<p>Rich HTML document rendering with single-page and two-page spread modes.</p>
			</div>

			<div class="feature-card">
				<h3>📖 Multi-Page Support</h3>
				<p>Navigate through multi-page documents with page indicators and controls.</p>
			</div>

			<div class="feature-card">
				<h3>⌨️ Keyboard Shortcuts</h3>
				<p>Arrow keys for navigation, V to toggle view mode, Esc to close viewer.</p>
			</div>

			<div class="feature-card">
				<h3>💾 Database Integration</h3>
				<p>Neon PostgreSQL with graceful fallback to constants when DB unavailable.</p>
			</div>

			<div class="feature-card">
				<h3>♿ Accessible</h3>
				<p>ARIA labels, keyboard navigation, focus management, reduced motion support.</p>
			</div>

			<div class="feature-card">
				<h3>📱 Responsive</h3>
				<p>Mobile-friendly layout adapts to all screen sizes automatically.</p>
			</div>

			<div class="feature-card">
				<h3>🔒 Secure</h3>
				<p>HTML sanitization with DOMPurify prevents XSS attacks.</p>
			</div>

			<div class="feature-card">
				<h3>📦 Self-Contained</h3>
				<p>Copy-paste ready with all styles scoped. Zero external dependencies.</p>
			</div>
		</div>
	</section>

	<section class="usage-section">
		<h2>Usage Example</h2>

		<div class="code-block">
			<pre><code>{`<script>
  import FolderFiles from '$lib/components/FolderFiles.svelte';

  let { data } = $props();
  let viewMode = $state('single');
</script>

<FolderFiles
  folders={data.folders}
  files={data.files}
  bind:viewMode
  enable3DEffect={true}
/>`}</code></pre>
		</div>

		<h3>Props</h3>
		<table class="props-table">
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
					<td>Folder[]</td>
					<td>[]</td>
					<td>Array of folder objects</td>
				</tr>
				<tr>
					<td><code>files</code></td>
					<td>FileItem[]</td>
					<td>[]</td>
					<td>Array of file objects</td>
				</tr>
				<tr>
					<td><code>initialFolderId</code></td>
					<td>number?</td>
					<td>undefined</td>
					<td>Folder to open on mount</td>
				</tr>
				<tr>
					<td><code>viewMode</code></td>
					<td>'single' | 'spread'</td>
					<td>'single'</td>
					<td>Document viewer mode (bindable)</td>
				</tr>
				<tr>
					<td><code>showMetadata</code></td>
					<td>boolean</td>
					<td>true</td>
					<td>Show file metadata panel (bindable)</td>
				</tr>
				<tr>
					<td><code>enable3DEffect</code></td>
					<td>boolean</td>
					<td>false</td>
					<td>Enable 3D folder opening animation</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section class="data-structure-section">
		<h2>Data Structure</h2>

		<h3>Folder Interface</h3>
		<div class="code-block">
			<pre><code>{`interface Folder {
  id: number;
  label: string;              // Display name
  color: string;              // Tailwind class (e.g., 'bg-blue-500')
  textColor?: string;         // Tailwind class (e.g., 'text-white')
  icon?: string;              // Emoji or character
  description?: string;       // For tooltip
  category?: string;          // For filtering
}`}</code></pre>
		</div>

		<h3>FileItem Interface</h3>
		<div class="code-block">
			<pre><code>{`interface FileItem {
  id: number;
  folderId: number;           // Parent folder ID
  title: string;
  subtitle?: string;
  previewText: string;        // For tooltip preview
  content?: string;           // Single page HTML
  pages?: string[];           // Multi-page HTML array
  thumbnailUrl?: string;
  metadata?: FileMetadata;
  fileType?: 'document' | 'image' | 'pdf' | 'text';
}`}</code></pre>
		</div>
	</section>

	<section class="tips-section">
		<h2>Implementation Tips</h2>

		<div class="tips-grid">
			<div class="tip-card">
				<h3>📝 Content Format</h3>
				<p>
					Store content as HTML strings in the <code>content</code> field (single page) or
					<code>pages</code>
					array (multi-page). HTML is sanitized automatically with DOMPurify.
				</p>
			</div>

			<div class="tip-card">
				<h3>🎨 Styling Documents</h3>
				<p>
					Use inline styles in your HTML content for custom formatting. Typography uses serif fonts
					(Georgia, Times New Roman) for document authenticity.
				</p>
			</div>

			<div class="tip-card">
				<h3>🗃️ Database Schema</h3>
				<p>
					Run <code>database/schema_folderfiles.sql</code> in Neon to create tables. Uses JSON columns
					for flexible metadata and pages storage.
				</p>
			</div>

			<div class="tip-card">
				<h3>🔄 Fallback Data</h3>
				<p>
					Component works without database using <code>FALLBACK_FOLDERS</code> and
					<code>FALLBACK_FILES</code> from constants.ts.
				</p>
			</div>
		</div>
	</section>
</div>

<style>
	.page-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		margin-bottom: 3rem;
		text-align: center;
	}

	.page-header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
		color: #111827;
	}

	.page-header p {
		font-size: 1.125rem;
		color: #6b7280;
		margin-bottom: 1rem;
	}

	.demo-section {
		margin-bottom: 4rem;
	}

	.demo-section h2 {
		font-size: 1.875rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #111827;
	}

	.demo-instructions {
		background: #eff6ff;
		border-left: 4px solid #3b82f6;
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.component-options {
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 0.5rem;
	}

	.option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.option input[type='checkbox'] {
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
	}

	.demo-container {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
	}

	.features-section {
		margin-bottom: 4rem;
	}

	.features-section h2 {
		font-size: 1.875rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		color: #111827;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.feature-card {
		background: white;
		padding: 1.5rem;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.feature-card h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #111827;
	}

	.feature-card p {
		font-size: 0.9375rem;
		color: #6b7280;
		line-height: 1.5;
	}

	.usage-section,
	.data-structure-section {
		margin-bottom: 4rem;
	}

	.usage-section h2,
	.data-structure-section h2 {
		font-size: 1.875rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		color: #111827;
	}

	.usage-section h3,
	.data-structure-section h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 2rem;
		margin-bottom: 1rem;
		color: #374151;
	}

	.code-block {
		background: #1f2937;
		color: #f3f4f6;
		padding: 1.5rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin-bottom: 2rem;
	}

	.code-block pre {
		margin: 0;
	}

	.code-block code {
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.props-table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 2rem;
	}

	.props-table th,
	.props-table td {
		padding: 0.75rem;
		text-align: left;
		border: 1px solid #e5e7eb;
	}

	.props-table th {
		background: #f3f4f6;
		font-weight: 600;
		color: #374151;
	}

	.props-table code {
		background: #f3f4f6;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
	}

	.tips-section {
		margin-bottom: 4rem;
	}

	.tips-section h2 {
		font-size: 1.875rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		color: #111827;
	}

	.tips-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.tip-card {
		background: #fef3c7;
		padding: 1.5rem;
		border-radius: 0.5rem;
		border-left: 4px solid #f59e0b;
	}

	.tip-card h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #92400e;
	}

	.tip-card p {
		font-size: 0.9375rem;
		color: #78350f;
		line-height: 1.6;
	}

	.tip-card code {
		background: rgba(120, 53, 15, 0.1);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
	}

	@media (max-width: 768px) {
		.page-container {
			padding: 1rem;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.features-grid,
		.tips-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
