<script lang="ts">
	import FolderFiles from '$lib/components/FolderFiles.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>FolderFiles Demo - Hierarchical Document Viewer</title>
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<h1>FolderFiles Component</h1>
		<p>3D filing cabinet with stacked folders and drag-and-drop organisation</p>
		<DatabaseStatus usingDatabase={data.usingDatabase} />
	</header>

	<section class="demo-section">
		<h2>Interactive Demo</h2>
		<p class="demo-instructions">
			<strong>How to use:</strong> Hover over a folder to reveal more tabs beneath → Click a folder to open it → Drag items between "Selected" and "All Items" panels to organise content
		</p>

		<div class="demo-container">
			<FolderFiles folders={data.folders} files={data.files} />
		</div>
	</section>

	<section class="features-section">
		<h2>Component Features</h2>
		<div class="features-grid">
			<div class="feature-card">
				<h3>🗂️ 3D Filing Cabinet</h3>
				<p>Folders stacked with subtle 3D transforms and depth effects, like a physical filing cabinet drawer.</p>
			</div>

			<div class="feature-card">
				<h3>🎨 Colour-Coded Folders</h3>
				<p>Each folder has a vibrant colour with visible body and protruding tab for easy identification.</p>
			</div>

			<div class="feature-card">
				<h3>📑 Staggered Tabs</h3>
				<p>Folder tabs positioned in left-center-right pattern for easy access, like real filing folders.</p>
			</div>

			<div class="feature-card">
				<h3>👁️ Hover Animation</h3>
				<p>Hovering over a folder drops folders beneath to reveal more tabs with smooth animation.</p>
			</div>

			<div class="feature-card">
				<h3>🔄 Drag & Drop</h3>
				<p>Native HTML5 drag-and-drop between two panels for organising content items.</p>
			</div>

			<div class="feature-card">
				<h3>💬 Smart Tooltips</h3>
				<p>Tooltips appear below tabs in the revealed space, showing folder name and item count.</p>
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
			<pre><code>{`${'<'}script>
  import FolderFiles from '$lib/components/FolderFiles.svelte';

  let { data } = $props();
</script>

<FolderFiles
  folders={data.folders}
  files={data.files}
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
					<td>Array of folder objects with id, label, color</td>
				</tr>
				<tr>
					<td><code>files</code></td>
					<td>FileItem[]</td>
					<td>[]</td>
					<td>Array of file items with title, subtitle, previewText</td>
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
  previewText: string;        // Brief description
}`}</code></pre>
		</div>
	</section>

	<section class="tips-section">
		<h2>Implementation Tips</h2>

		<div class="tips-grid">
			<div class="tip-card">
				<h3>🎨 Folder Colours</h3>
				<p>
					Use hex colour codes for folders (e.g., <code>#a855f7</code>). The component applies
					these colours to both the folder tab and body with automatic depth shading.
				</p>
			</div>

			<div class="tip-card">
				<h3>📑 Tab Positioning</h3>
				<p>
					Tabs automatically stagger left-center-right using modulo pattern. First folder left,
					second center-left, third center-right, then repeats.
				</p>
			</div>

			<div class="tip-card">
				<h3>🗃️ Database Schema</h3>
				<p>
					Run <code>database/schema_folderfiles.sql</code> in Neon to create tables. Simple
					structure with folders and files tables linked by folderId.
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
