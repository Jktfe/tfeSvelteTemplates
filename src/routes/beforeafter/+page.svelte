<script lang="ts">
	/**
	 * BeforeAfter Demo Page
	 *
	 * This page demonstrates the BeforeAfter component with multiple examples:
	 * - Basic image comparison (default settings)
	 * - Labeled comparison (with before/after labels)
	 * - Initial position preset (starts at 25%)
	 * - Styled variant (custom colours, square aspect ratio)
	 * - Features grid
	 * - Props reference
	 * - Use cases
	 *
	 * Serves as both a functional demo and documentation for developers.
	 */

	import BeforeAfter from '$lib/components/BeforeAfter.svelte';

	let currentPosition = $state(50);

	function handlePositionChange(position: number) {
		currentPosition = position;
	}
</script>

<svelte:head>
	<title>BeforeAfter Component | TFE Svelte Templates</title>
	<meta
		name="description"
		content="Interactive before/after comparison with draggable divider. Perfect for product improvements, image editing, and design iterations. Zero dependencies."
	/>
</svelte:head>

<div class="page-container">
	<!-- Page Header -->
	<header class="page-header">
		<h1 class="page-title">↔️ BeforeAfter Component</h1>
		<p class="page-description">
			Create interactive before/after comparisons with a draggable divider. Perfect for showcasing
			product improvements, image editing results, design iterations, and quality comparisons. Built
			with CSS clip-path for smooth GPU-accelerated reveals and zero external dependencies.
		</p>
	</header>

	<!-- Basic Image Comparison Example -->
	<section class="demo-section">
		<h2 class="section-title">Basic Image Comparison</h2>
		<p class="section-description">
			Simple before/after with two images. Drag the divider or use arrow keys to compare. Default
			16:9 aspect ratio with center-positioned divider.
		</p>
		<div class="demo-container">
			<BeforeAfter
				beforeImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop"
				afterImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop&sat=-100"
			/>
		</div>
		<div class="code-example">
			<pre><code>{`<BeforeAfter
  beforeImage="https://example.com/before.jpg"
  afterImage="https://example.com/after.jpg"
/>`}</code></pre>
		</div>
	</section>

	<!-- Labeled Comparison Example -->
	<section class="demo-section">
		<h2 class="section-title">Labeled Comparison</h2>
		<p class="section-description">
			Images with "Before" and "After" labels. Custom divider styling with thicker line and larger
			handle for better mobile interaction.
		</p>
		<div class="demo-container">
			<BeforeAfter
				beforeImage="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=450&fit=crop"
				afterImage="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=450&fit=crop&sat=-100&bri=50"
				beforeLabel="Before"
				afterLabel="After"
				dividerWidth={3}
				handleSize={56}
			/>
		</div>
		<div class="code-example">
			<pre><code>{`<BeforeAfter
  beforeImage="https://example.com/before.jpg"
  afterImage="https://example.com/after.jpg"
  beforeLabel="Before"
  afterLabel="After"
  dividerWidth={3}
  handleSize={56}
/>`}</code></pre>
		</div>
	</section>

	<!-- Initial Position Preset Example -->
	<section class="demo-section">
		<h2 class="section-title">Initial Position Preset</h2>
		<p class="section-description">
			Divider starts at 25% (mostly showing "after"). Useful for highlighting improvements. onChange
			callback tracks current position: <strong>{Math.round(currentPosition)}%</strong>
		</p>
		<div class="demo-container">
			<BeforeAfter
				beforeImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop"
				afterImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop&sat=-100&con=50"
				beforeLabel="Original"
				afterLabel="Enhanced"
				aspectRatio="1/1"
				initialPosition={25}
				onChange={handlePositionChange}
			/>
		</div>
		<div class="code-example">
			<pre><code>{`<BeforeAfter
  beforeImage="https://example.com/before.jpg"
  afterImage="https://example.com/after.jpg"
  beforeLabel="Original"
  afterLabel="Enhanced"
  aspectRatio="1/1"
  initialPosition={25}
  onChange={(pos) => console.log('Position:', pos)}
/>`}</code></pre>
		</div>
	</section>

	<!-- Styled Variant Example -->
	<section class="demo-section">
		<h2 class="section-title">Styled Variant</h2>
		<p class="section-description">
			Custom colours for divider and handle. Square aspect ratio perfect for product photos.
			Demonstrates full customisation capabilities.
		</p>
		<div class="demo-container">
			<BeforeAfter
				beforeImage="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&h=600&fit=crop"
				afterImage="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&h=600&fit=crop&sat=-100"
				beforeLabel="Low Quality"
				afterLabel="High Quality"
				aspectRatio="1/1"
				dividerColor="#3b82f6"
				dividerWidth={4}
				handleColor="#3b82f6"
				handleSize={60}
			/>
		</div>
		<div class="code-example">
			<pre><code>{`<BeforeAfter
  beforeImage="https://example.com/before.jpg"
  afterImage="https://example.com/after.jpg"
  beforeLabel="Low Quality"
  afterLabel="High Quality"
  aspectRatio="1/1"
  dividerColor="#3b82f6"
  dividerWidth={4}
  handleColor="#3b82f6"
  handleSize={60}
/>`}</code></pre>
		</div>
	</section>

	<!-- Features Grid -->
	<section class="features-section">
		<h2 class="section-title">Key Features</h2>
		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">🎨</div>
				<h3 class="feature-title">CSS-Based Clipping</h3>
				<p class="feature-description">
					GPU-accelerated clip-path for smooth image reveals. No Canvas manipulation required.
				</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🖱️</div>
				<h3 class="feature-title">Unified Input</h3>
				<p class="feature-description">
					Pointer Events API handles mouse, touch, and pen input seamlessly.
				</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">⌨️</div>
				<h3 class="feature-title">Keyboard Navigation</h3>
				<p class="feature-description">
					Arrow keys for precise control. Full ARIA labels for screen readers.
				</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🎯</div>
				<h3 class="feature-title">Customisable</h3>
				<p class="feature-description">
					Aspect ratio, divider styling, labels, and handle size all configurable.
				</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">📱</div>
				<h3 class="feature-title">Responsive</h3>
				<p class="feature-description">
					Works perfectly on mobile with touch support. Adapts to viewport size.
				</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">⚡</div>
				<h3 class="feature-title">Zero Dependencies</h3>
				<p class="feature-description">
					Pure CSS and Svelte. No external libraries. Copy-paste ready.
				</p>
			</div>
		</div>
	</section>

	<!-- Props Reference -->
	<section class="props-section">
		<h2 class="section-title">Props Reference</h2>
		<div class="props-table-container">
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
						<td><code>beforeImage</code></td>
						<td><code>string</code></td>
						<td>required</td>
						<td>URL for before image</td>
					</tr>
					<tr>
						<td><code>afterImage</code></td>
						<td><code>string</code></td>
						<td>required</td>
						<td>URL for after image</td>
					</tr>
					<tr>
						<td><code>beforeAlt</code></td>
						<td><code>string</code></td>
						<td><code>'Before'</code></td>
						<td>Alt text for before image</td>
					</tr>
					<tr>
						<td><code>afterAlt</code></td>
						<td><code>string</code></td>
						<td><code>'After'</code></td>
						<td>Alt text for after image</td>
					</tr>
					<tr>
						<td><code>beforeLabel</code></td>
						<td><code>string</code></td>
						<td>-</td>
						<td>Optional label shown on before side</td>
					</tr>
					<tr>
						<td><code>afterLabel</code></td>
						<td><code>string</code></td>
						<td>-</td>
						<td>Optional label shown on after side</td>
					</tr>
					<tr>
						<td><code>aspectRatio</code></td>
						<td><code>string</code></td>
						<td><code>'16/9'</code></td>
						<td>CSS aspect ratio (e.g., '1/1', '4/3')</td>
					</tr>
					<tr>
						<td><code>width</code></td>
						<td><code>number | string</code></td>
						<td><code>'100%'</code></td>
						<td>Container width (px or %)</td>
					</tr>
					<tr>
						<td><code>initialPosition</code></td>
						<td><code>number</code></td>
						<td><code>50</code></td>
						<td>Initial divider position (0-100)</td>
					</tr>
					<tr>
						<td><code>disabled</code></td>
						<td><code>boolean</code></td>
						<td><code>false</code></td>
						<td>Disable dragging interaction</td>
					</tr>
					<tr>
						<td><code>dividerColor</code></td>
						<td><code>string</code></td>
						<td><code>'#ffffff'</code></td>
						<td>Divider line colour (hex)</td>
					</tr>
					<tr>
						<td><code>dividerWidth</code></td>
						<td><code>number</code></td>
						<td><code>2</code></td>
						<td>Divider line width in pixels</td>
					</tr>
					<tr>
						<td><code>handleSize</code></td>
						<td><code>number</code></td>
						<td><code>48</code></td>
						<td>Handle circle size in pixels</td>
					</tr>
					<tr>
						<td><code>handleColor</code></td>
						<td><code>string</code></td>
						<td><code>'#ffffff'</code></td>
						<td>Handle background colour (hex)</td>
					</tr>
					<tr>
						<td><code>onChange</code></td>
						<td><code>(pos: number) => void</code></td>
						<td>-</td>
						<td>Callback fired when position changes</td>
					</tr>
					<tr>
						<td><code>class</code></td>
						<td><code>string</code></td>
						<td><code>''</code></td>
						<td>Additional CSS classes</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<!-- Use Cases -->
	<section class="use-cases-section">
		<h2 class="section-title">Use Cases</h2>
		<div class="use-cases-grid">
			<div class="use-case-card">
				<h3 class="use-case-title">🛠️ Product Improvements</h3>
				<p class="use-case-description">
					Show product evolution by comparing old vs. new versions. Perfect for highlighting
					upgrades and improvements.
				</p>
			</div>
			<div class="use-case-card">
				<h3 class="use-case-title">🎨 Image Editing</h3>
				<p class="use-case-description">
					Demonstrate before/after photo editing or filter effects. Showcase your editing skills or
					filter presets.
				</p>
			</div>
			<div class="use-case-card">
				<h3 class="use-case-title">💎 Design Iterations</h3>
				<p class="use-case-description">
					Compare design versions to visualize changes. Great for presenting redesigns to clients
					or stakeholders.
				</p>
			</div>
			<div class="use-case-card">
				<h3 class="use-case-title">⚖️ Quality Comparisons</h3>
				<p class="use-case-description">
					Show differences between standard vs. premium versions, compression levels, or quality
					tiers.
				</p>
			</div>
			<div class="use-case-card">
				<h3 class="use-case-title">🔬 A/B Testing</h3>
				<p class="use-case-description">
					Visual comparison of variants for marketing campaigns, landing pages, or UI changes.
				</p>
			</div>
			<div class="use-case-card">
				<h3 class="use-case-title">🏡 Real Estate</h3>
				<p class="use-case-description">
					Renovation before/after photos. Perfect for showcasing property transformations and
					improvements.
				</p>
			</div>
		</div>
	</section>

	<!-- Technical Implementation -->
	<section class="technical-section">
		<h2 class="section-title">Technical Implementation</h2>
		<div class="technical-grid">
			<div class="technical-card">
				<h3 class="technical-title">CSS Clip-Path</h3>
				<p class="technical-description">
					Uses CSS <code>clip-path: inset()</code> for GPU-accelerated clipping. No Canvas
					manipulation required for smooth 60fps performance.
				</p>
			</div>
			<div class="technical-card">
				<h3 class="technical-title">Pointer Events API</h3>
				<p class="technical-description">
					Unified handling for mouse, touch, and pen input. Pointer capture ensures smooth dragging
					even when cursor leaves element.
				</p>
			</div>
			<div class="technical-card">
				<h3 class="technical-title">Svelte 5 Runes</h3>
				<p class="technical-description">
					Uses <code>$state()</code> and <code>$derived()</code> for reactive state management.
					Automatic reactivity with minimal boilerplate.
				</p>
			</div>
			<div class="technical-card">
				<h3 class="technical-title">Accessibility</h3>
				<p class="technical-description">
					Full keyboard support with arrow keys. ARIA roles, labels, and live regions for screen
					readers. Respects reduced motion preferences.
				</p>
			</div>
		</div>
	</section>
</div>

<style>
	/* Page container */
	.page-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	/* Page header */
	.page-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 1rem;
		color: #1f2937;
	}

	.page-description {
		font-size: 1.125rem;
		color: #6b7280;
		max-width: 800px;
		margin: 0 auto;
		line-height: 1.7;
	}

	/* Demo sections */
	.demo-section {
		margin-bottom: 4rem;
	}

	.section-title {
		font-size: 1.875rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		color: #1f2937;
	}

	.section-description {
		font-size: 1rem;
		color: #6b7280;
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}

	.demo-container {
		background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
		padding: 3rem;
		border-radius: 12px;
		margin-bottom: 1.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.code-example {
		background: #1f2937;
		padding: 1.5rem;
		border-radius: 8px;
		overflow-x: auto;
	}

	.code-example pre {
		margin: 0;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.code-example code {
		color: #e5e7eb;
	}

	/* Features section */
	.features-section {
		margin-bottom: 4rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.feature-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.feature-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.feature-icon {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	.feature-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #1f2937;
	}

	.feature-description {
		font-size: 0.9375rem;
		color: #6b7280;
		line-height: 1.6;
	}

	/* Props table */
	.props-section {
		margin-bottom: 4rem;
	}

	.props-table-container {
		overflow-x: auto;
		margin-top: 2rem;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.props-table {
		width: 100%;
		border-collapse: collapse;
		background: white;
	}

	.props-table thead {
		background: #f9fafb;
	}

	.props-table th {
		text-align: left;
		padding: 1rem;
		font-weight: 600;
		color: #374151;
		border-bottom: 2px solid #e5e7eb;
	}

	.props-table td {
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
		color: #6b7280;
	}

	.props-table code {
		background: #f3f4f6;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
		color: #ef4444;
	}

	/* Use cases section */
	.use-cases-section {
		margin-bottom: 4rem;
	}

	.use-cases-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.use-case-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border-left: 4px solid #3b82f6;
	}

	.use-case-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		color: #1f2937;
	}

	.use-case-description {
		font-size: 0.9375rem;
		color: #6b7280;
		line-height: 1.6;
	}

	/* Technical section */
	.technical-section {
		margin-bottom: 4rem;
	}

	.technical-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.technical-card {
		background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
		padding: 2rem;
		border-radius: 12px;
		color: white;
	}

	.technical-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	.technical-description {
		font-size: 0.9375rem;
		line-height: 1.6;
		opacity: 0.95;
	}

	.technical-description code {
		background: rgba(255, 255, 255, 0.2);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.page-container {
			padding: 1rem;
		}

		.page-title {
			font-size: 2rem;
		}

		.page-description {
			font-size: 1rem;
		}

		.demo-container {
			padding: 1.5rem;
		}

		.features-grid,
		.use-cases-grid,
		.technical-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
