<!--
	LinkImageHover Component Demo Page

	This page demonstrates the LinkImageHover component with image preview on hover.
	Shows various configurations and use cases.
-->

<script lang="ts">
	import LinkImageHover from '$lib/components/LinkImageHover.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
	import type { PageData } from './$types';

	// Get server data
	let { data }: { data: PageData } = $props();

	// Destructure link data from server
	const cityLinks = data.cityLinks;
	const natureLinks = data.natureLinks;
</script>

<svelte:head>
	<title>LinkImageHover Component - Svelte 5 Templates</title>
	<meta
		name="description"
		content="Interactive link component with image preview on hover for Svelte 5"
	/>
</svelte:head>

<div class="page">
	<div class="container">
		<!-- Header Section -->
		<header>
			<h1>🔗 LinkImageHover Component</h1>
			<p class="subtitle">
				A link component that displays an image preview when you hover over it. Perfect for adding
				visual context to text links, creating engaging navigation menus, or enhancing article
				references.
			</p>
			<DatabaseStatus usingDatabase={data.usingDatabase} class="status-badge" />
		</header>

		<!-- Basic Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Basic Example</h2>
				<div class="badge">Hover to Preview</div>
			</div>

			<p class="description">
				Hover over the link below to see the image preview appear above it with a smooth blur
				transition.
			</p>

			<div class="demo-container">
				<LinkImageHover
					href="https://en.wikipedia.org/wiki/Mumbai"
					text="Mumbai City"
					imageSrc="https://i.pinimg.com/736x/7e/61/74/7e6174c858a5aa169de033f55fc3050c.jpg"
					imageAlt="Mumbai City"
				/>
			</div>

			<!-- Usage Example -->
			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<script>
  import LinkImageHover from '$lib/components/LinkImageHover.svelte';
</script>

<LinkImageHover
  href="https://example.com"
  text="Link Text"
  imageSrc="https://example.com/image.jpg"
  imageAlt="Image description"
/>`}</code></pre>
			</details>
		</section>

		<!-- City Links Grid -->
		<section class="demo-section">
			<div class="section-header">
				<h2>City Links Grid</h2>
			</div>

			<p class="description">
				A grid layout displaying major cities around the world. Hover over each city to see its preview image.
			</p>

			<div class="demo-container">
				<div class="links-grid">
					{#each cityLinks as link}
						<LinkImageHover
							href={link.href}
							text={link.text}
							imageSrc={link.imageSrc}
							imageAlt={link.imageAlt}
						/>
					{/each}
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<div class="grid">
  {#each cityLinks as link}
    <LinkImageHover
      href={link.href}
      text={link.text}
      imageSrc={link.imageSrc}
      imageAlt={link.imageAlt}
    />
  {/each}
</div>`}</code></pre>
			</details>
		</section>

		<!-- Grid Layout -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Navigation Grid</h2>
			</div>

			<p class="description">
				Use in a grid layout for navigation menus or category listings with visual previews.
			</p>

			<div class="demo-container">
				<div class="links-grid">
					{#each natureLinks as link}
						<LinkImageHover
							href={link.href}
							text={link.text}
							imageSrc={link.imageSrc}
							imageAlt={link.imageAlt}
						/>
					{/each}
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<div class="grid">
  {#each links as link}
    <LinkImageHover
      href={link.href}
      text={link.text}
      imageSrc={link.imageSrc}
      imageAlt={link.imageAlt}
    />
  {/each}
</div>`}</code></pre>
			</details>
		</section>

		<!-- Custom Sizing -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Custom Image Sizes</h2>
			</div>

			<p class="description">
				Control the preview image size using the <code>imageWidth</code> prop with Tailwind
				classes.
			</p>

			<div class="demo-grid-sizes">
				<div class="size-demo">
					<LinkImageHover
						href="https://example.com"
						text="Small Preview"
						imageSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"
						imageAlt="Mountain"
						imageWidth="h-32 w-32"
					/>
					<p class="size-label">Small (h-32 w-32)</p>
				</div>

				<div class="size-demo">
					<LinkImageHover
						href="https://example.com"
						text="Medium Preview"
						imageSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"
						imageAlt="Mountain"
						imageWidth="h-44 w-44"
					/>
					<p class="size-label">Medium (h-44 w-44)</p>
				</div>

				<div class="size-demo">
					<LinkImageHover
						href="https://example.com"
						text="Large Preview"
						imageSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"
						imageAlt="Mountain"
						imageWidth="h-64 w-64"
					/>
					<p class="size-label">Large (h-64 w-64)</p>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<LinkImageHover imageWidth="h-32 w-32" ... />
<LinkImageHover imageWidth="h-44 w-44" ... />
<LinkImageHover imageWidth="h-64 w-64" ... />`}</code></pre>
			</details>
		</section>

		<!-- Features Grid -->
		<section class="features-section">
			<h2>Component Features</h2>
			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon">🎬</div>
					<h3>Smooth Transitions</h3>
					<p>Uses Svelte's built-in blur transition for elegant image appearance.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🎯</div>
					<h3>Positioned Perfectly</h3>
					<p>Image appears above the link with consistent spacing and positioning.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🔧</div>
					<h3>Customisable Size</h3>
					<p>Control preview image dimensions with Tailwind width/height classes.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🚀</div>
					<h3>Zero Dependencies</h3>
					<p>Pure Svelte implementation with no external libraries required.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">♿</div>
					<h3>Accessible</h3>
					<p>Proper link semantics with alt text, external link attributes, and keyboard support.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">⚡</div>
					<h3>Lightweight</h3>
					<p>Minimal JavaScript with efficient event handling and cleanup.</p>
				</div>
			</div>
		</section>

		<!-- Implementation Guide -->
		<section class="guide-section">
			<h2>Quick Start Guide</h2>
			<div class="guide-steps">
				<div class="step">
					<div class="step-number">1</div>
					<div class="step-content">
						<h3>Copy the Component</h3>
						<p>
							Copy <code>LinkImageHover.svelte</code> from <code>src/lib/components/</code> to
							your project.
						</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">2</div>
					<div class="step-content">
						<h3>Prepare Content</h3>
						<p>
							Gather your link URLs and corresponding preview images. Ensure images are optimised
							for web display.
						</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">3</div>
					<div class="step-content">
						<h3>Use in Your Layout</h3>
						<p>
							Import and place links in paragraphs, grids, or navigation menus. The component
							handles all hover interactions automatically.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Props Reference -->
		<section class="props-section">
			<h2>Props Reference</h2>
			<div class="props-table">
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
							<td><code>href</code></td>
							<td>string</td>
							<td>'https://example.com'</td>
							<td>URL the link points to</td>
						</tr>
						<tr>
							<td><code>text</code></td>
							<td>string</td>
							<td>'Link Text'</td>
							<td>Link text to display</td>
						</tr>
						<tr>
							<td><code>imageSrc</code></td>
							<td>string</td>
							<td>placeholder</td>
							<td>URL to the preview image</td>
						</tr>
						<tr>
							<td><code>imageAlt</code></td>
							<td>string</td>
							<td>'Preview Image'</td>
							<td>Alt text for the preview image</td>
						</tr>
						<tr>
							<td><code>imageWidth</code></td>
							<td>string</td>
							<td>'h-44 w-44'</td>
							<td>Tailwind width/height classes for image</td>
						</tr>
						<tr>
							<td><code>target</code></td>
							<td>string</td>
							<td>'_blank'</td>
							<td>Link target attribute</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

		<!-- Use Cases -->
		<section class="use-cases-section">
			<h2>Use Cases</h2>
			<div class="use-cases-grid">
				<div class="use-case">
					<h3>📚 Documentation</h3>
					<p>Add visual previews to reference links in documentation and technical articles.</p>
				</div>

				<div class="use-case">
					<h3>🗺️ Travel Guides</h3>
					<p>Show location previews when users hover over destination names and places.</p>
				</div>

				<div class="use-case">
					<h3>📰 Article References</h3>
					<p>Display thumbnails for cited sources and related articles in blog posts.</p>
				</div>

				<div class="use-case">
					<h3>🛍️ Product Links</h3>
					<p>Preview product images when hovering over product names in descriptions.</p>
				</div>

				<div class="use-case">
					<h3>👥 Team Directory</h3>
					<p>Show profile photos when hovering over team member names in lists.</p>
				</div>

				<div class="use-case">
					<h3>🎨 Portfolio</h3>
					<p>Preview artwork or project images when browsing project names and categories.</p>
				</div>
			</div>
		</section>
	</div>
</div>

<style>
	/* Page Layout */
	.page {
		padding: 4rem 0;
		min-height: 100vh;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	/* Header */
	header {
		text-align: center;
		margin-bottom: 4rem;
	}

	h1 {
		font-size: 3rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: #1a202c;
	}

	.subtitle {
		font-size: 1.25rem;
		color: #718096;
		margin: 0;
		max-width: 700px;
		margin-left: auto;
		margin-right: auto;
		line-height: 1.6;
	}

	/* Sections */
	.demo-section,
	.features-section,
	.guide-section,
	.props-section,
	.use-cases-section {
		margin-bottom: 4rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	h2 {
		font-size: 2rem;
		font-weight: 600;
		color: #1a202c;
		margin: 0;
	}

	.badge {
		padding: 0.25rem 0.75rem;
		background: #edf2f7;
		color: #4a5568;
		font-size: 0.875rem;
		font-weight: 600;
		border-radius: 9999px;
	}

	.description {
		font-size: 1rem;
		color: #4a5568;
		margin: 0 0 2rem 0;
		line-height: 1.6;
	}

	/* Demo Container */
	.demo-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 6rem 2rem;
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		border-radius: 12px;
		margin-bottom: 2rem;
		min-height: 300px;
	}

	.links-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 3rem;
		width: 100%;
		max-width: 600px;
	}

	.demo-grid-sizes {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 3rem;
		margin-bottom: 2rem;
	}

	.size-demo {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		padding: 4rem 2rem;
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		border-radius: 12px;
		min-height: 250px;
		justify-content: center;
	}

	.size-label {
		font-size: 0.875rem;
		color: #718096;
		margin: 0;
		text-align: center;
		font-weight: 600;
	}

	/* Code Blocks */
	code {
		padding: 0.125rem 0.375rem;
		background: #edf2f7;
		color: #146ef5;
		border-radius: 4px;
		font-size: 0.875rem;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}

	.code-block {
		margin-top: 2rem;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		overflow: hidden;
	}

	.code-block summary {
		padding: 1rem 1.5rem;
		background: #f7fafc;
		cursor: pointer;
		font-weight: 600;
		color: #1a202c;
		user-select: none;
	}

	.code-block summary:hover {
		background: #edf2f7;
	}

	.code-block pre {
		margin: 0;
		padding: 1.5rem;
		background: #1a202c;
		color: #e2e8f0;
		overflow-x: auto;
	}

	.code-block code {
		background: transparent;
		color: #e2e8f0;
		padding: 0;
	}

	/* Features Grid */
	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
	}

	.feature-card {
		text-align: center;
		padding: 2rem;
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature-card h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
		color: #1a202c;
	}

	.feature-card p {
		font-size: 0.95rem;
		color: #718096;
		margin: 0;
		line-height: 1.6;
	}

	/* Guide Steps */
	.guide-steps {
		max-width: 800px;
		margin: 0 auto;
	}

	.step {
		display: flex;
		gap: 2rem;
		margin-bottom: 2rem;
		padding: 2rem;
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
	}

	.step-number {
		flex-shrink: 0;
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #146ef5 0%, #667eea 100%);
		color: white;
		font-size: 1.5rem;
		font-weight: 700;
		border-radius: 50%;
	}

	.step-content h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #1a202c;
	}

	.step-content p {
		font-size: 1rem;
		color: #4a5568;
		margin: 0;
		line-height: 1.6;
	}

	/* Props Table */
	.props-table {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		background: white;
		border-radius: 8px;
		overflow: hidden;
	}

	th,
	td {
		padding: 1rem;
		text-align: left;
		border-bottom: 1px solid #e2e8f0;
	}

	th {
		background: #f7fafc;
		font-weight: 600;
		color: #1a202c;
	}

	td {
		color: #4a5568;
	}

	tr:last-child td {
		border-bottom: none;
	}

	/* Use Cases */
	.use-cases-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.use-case {
		padding: 2rem;
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
	}

	.use-case h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
		color: #1a202c;
	}

	.use-case p {
		font-size: 0.95rem;
		color: #718096;
		margin: 0;
		line-height: 1.6;
	}

	/* Responsive */
	@media (max-width: 768px) {
		h1 {
			font-size: 2rem;
		}

		h2 {
			font-size: 1.5rem;
		}

		.subtitle {
			font-size: 1.1rem;
		}

		.demo-grid-sizes {
			grid-template-columns: 1fr;
		}

		.step {
			flex-direction: column;
			gap: 1rem;
		}
	}
</style>
