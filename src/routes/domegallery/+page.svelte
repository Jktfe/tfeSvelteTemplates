<script lang="ts">
	/**
	 * DomeGallery Demo Page
	 *
	 * This page demonstrates the DomeGallery component - an interactive 3D spherical
	 * image gallery with drag-to-rotate and click-to-enlarge functionality.
	 *
	 * Features showcased:
	 * - Full viewport 3D sphere gallery
	 * - Drag to rotate with momentum/inertia
	 * - Click images to enlarge
	 * - Configurable segments, grayscale, and styling
	 *
	 * Inspired by ReactBits DomeGallery (https://reactbits.dev/components/dome-gallery)
	 * Implemented as pure Svelte 5 with zero external dependencies.
	 */

	import DomeGallery from '$lib/components/DomeGallery.svelte';

	// Sample images - expanded set for better sphere coverage
	// Using smaller 300x300 for faster mobile loading
	const demoImages = [
		// Abstract gradients
		{ src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=300&fit=crop', alt: 'Abstract gradient art' },
		{ src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&h=300&fit=crop', alt: 'Colorful gradient' },
		{ src: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=300&h=300&fit=crop', alt: 'Purple abstract' },
		{ src: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=300&h=300&fit=crop', alt: 'Fluid art' },
		{ src: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=300&h=300&fit=crop', alt: 'Abstract pink gradient' },
		// Textures and patterns
		{ src: 'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=300&h=300&fit=crop', alt: 'Neon lights' },
		{ src: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=300&h=300&fit=crop', alt: 'Abstract waves' },
		{ src: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=300&h=300&fit=crop', alt: 'Digital art' },
		{ src: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=300&h=300&fit=crop', alt: 'Geometric patterns' },
		{ src: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=300&h=300&fit=crop', alt: 'Holographic texture' },
		// Nature abstracts
		{ src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop', alt: 'Ocean waves' },
		{ src: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop', alt: 'Mountain peaks' },
		{ src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop', alt: 'Alpine landscape' },
		{ src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop', alt: 'Forest sunlight' },
		{ src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&h=300&fit=crop', alt: 'Misty forest' },
		// Space and cosmos
		{ src: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=300&h=300&fit=crop', alt: 'Galaxy nebula' },
		{ src: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=300&h=300&fit=crop', alt: 'Starry night' },
		{ src: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&h=300&fit=crop', alt: 'Milky way' },
		// More gradients and art
		{ src: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&h=300&fit=crop', alt: 'Neon pink' },
		{ src: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=300&h=300&fit=crop', alt: 'Gradient blur' },
		{ src: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=300&h=300&fit=crop', alt: 'Paint swirl' },
		{ src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=300&fit=crop', alt: 'Smoke art' },
		{ src: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=300&h=300&fit=crop', alt: 'Light trails' },
		{ src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', alt: 'Bokeh lights' },
		// Architecture and geometry
		{ src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=300&h=300&fit=crop', alt: 'Building facade' },
		{ src: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=300&h=300&fit=crop', alt: 'City skyline' },
		{ src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop', alt: 'Urban architecture' },
		{ src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&h=300&fit=crop', alt: 'Night city' },
		// Water and sky
		{ src: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=300&h=300&fit=crop', alt: 'Ocean sunset' },
		{ src: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=300&h=300&fit=crop', alt: 'Cloud formations' }
	];

	// Configurable demo state
	let showOverlay = $state(false);
</script>

<svelte:head>
	<title>DomeGallery Component | TFE Svelte Templates</title>
	<meta
		name="description"
		content="Interactive 3D spherical image gallery with drag-to-rotate and click-to-enlarge. Pure Svelte 5 implementation with momentum physics."
	/>
</svelte:head>

<!-- Full viewport gallery demo -->
<div class="gallery-wrapper">
	<DomeGallery images={demoImages} grayscale={true} segments={35} />

	<!-- Overlay toggle button -->
	<button class="info-toggle" onclick={() => (showOverlay = !showOverlay)} aria-label="Toggle info">
		<span class="info-icon">{showOverlay ? '×' : 'ℹ'}</span>
	</button>

	<!-- Info overlay -->
	{#if showOverlay}
		<div class="info-overlay">
			<div class="info-card">
				<h2>DomeGallery</h2>
				<p class="tagline">Interactive 3D Spherical Image Gallery</p>

				<div class="instructions">
					<div class="instruction">
						<span class="icon">👆</span>
						<span>Drag to rotate the dome</span>
					</div>
					<div class="instruction">
						<span class="icon">🖱️</span>
						<span>Click any image to enlarge</span>
					</div>
					<div class="instruction">
						<span class="icon">⌨️</span>
						<span>Press ESC to close enlarged image</span>
					</div>
					<div class="instruction">
						<span class="icon">🎯</span>
						<span>Momentum physics after release</span>
					</div>
				</div>

				<div class="props-summary">
					<h3>Key Props</h3>
					<ul>
						<li><code>images</code> - Array of image URLs or {'{src, alt}'} objects</li>
						<li><code>segments</code> - Grid resolution (default: 35)</li>
						<li><code>grayscale</code> - Apply grayscale filter (default: true)</li>
						<li><code>dragSensitivity</code> - Control rotation speed</li>
						<li><code>enlargeTransitionMs</code> - Animation duration</li>
					</ul>
				</div>

				<a href="#details" class="scroll-hint" onclick={() => (showOverlay = false)}>
					↓ Scroll for documentation
				</a>
			</div>
		</div>
	{/if}
</div>

<!-- Documentation section -->
<div id="details" class="page-container">
	<!-- Page Header -->
	<header class="page-header">
		<h1 class="page-title">🌐 DomeGallery Component</h1>
		<p class="page-description">
			A stunning 3D spherical image gallery where photos are arranged on a dome surface. Drag to
			rotate with realistic momentum physics, click any image to enlarge with smooth animated
			transitions. Pure Svelte 5 implementation with zero external dependencies. Inspired by <a
				href="https://reactbits.dev/components/dome-gallery"
				target="_blank"
				rel="noopener">ReactBits DomeGallery</a
			>.
		</p>
	</header>

	<!-- Features Grid -->
	<section class="features-section">
		<h2 class="section-title">Key Features</h2>
		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">🔮</div>
				<h3 class="feature-title">3D CSS Transforms</h3>
				<p class="feature-description">
					Images positioned on a spherical surface using CSS 3D transforms with perspective.
					Hardware-accelerated for smooth 60fps performance.
				</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🎮</div>
				<h3 class="feature-title">Drag & Inertia</h3>
				<p class="feature-description">
					Drag to rotate with velocity tracking. Release to coast with realistic momentum physics
					and configurable dampening.
				</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🔍</div>
				<h3 class="feature-title">Click to Enlarge</h3>
				<p class="feature-description">
					Click any tile to enlarge with smooth FLIP-style animation. Scrim backdrop with blur
					effect and ESC to close.
				</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">📐</div>
				<h3 class="feature-title">Responsive Radius</h3>
				<p class="feature-description">
					ResizeObserver automatically calculates optimal sphere radius based on container size with
					configurable min/max bounds.
				</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🎨</div>
				<h3 class="feature-title">Grayscale Filter</h3>
				<p class="feature-description">
					Optional grayscale filter on tiles for artistic effect. Easy to toggle on/off via prop.
				</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">📱</div>
				<h3 class="feature-title">Touch Support</h3>
				<p class="feature-description">
					Full touch and pointer events support for mobile devices. Scroll locking prevents page
					bounce during interaction.
				</p>
			</div>
		</div>
	</section>

	<!-- Usage Example -->
	<section class="demo-section">
		<h2 class="section-title">Basic Usage</h2>
		<p class="section-description">
			Import the component and provide an array of images. Images can be simple string URLs or
			objects with <code>src</code> and <code>alt</code> properties.
		</p>
		<div class="code-example">
			<pre><code>{`${'<'}script>
  import DomeGallery from '$lib/components/DomeGallery.svelte';

  const images = [
    { src: 'https://example.com/image1.jpg', alt: 'Description 1' },
    { src: 'https://example.com/image2.jpg', alt: 'Description 2' },
    'https://example.com/image3.jpg', // Simple string URL also works
  ];
${'<'}/script>

<div style="height: 100vh;">
  <DomeGallery {images} />
</div>`}</code></pre>
		</div>
	</section>

	<!-- Customisation Example -->
	<section class="demo-section">
		<h2 class="section-title">Customisation</h2>
		<p class="section-description">
			Configure the gallery behaviour with props for sensitivity, animation timing, colours, and
			more.
		</p>
		<div class="code-example">
			<pre><code>{`<DomeGallery
  images={images}
  segments={35}
  grayscale={false}
  dragSensitivity={15}
  dragDampening={1.5}
  enlargeTransitionMs={400}
  overlayBlurColor="#1a1a2e"
  imageBorderRadius="16px"
  openedImageWidth="400px"
  openedImageHeight="500px"
/>`}</code></pre>
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
						<td><code>images</code></td>
						<td><code>(string | {'{src, alt}'})[]</code></td>
						<td><code>[]</code></td>
						<td>Array of image URLs or objects with src/alt</td>
					</tr>
					<tr>
						<td><code>segments</code></td>
						<td><code>number</code></td>
						<td><code>35</code></td>
						<td>Grid resolution (affects tile count)</td>
					</tr>
					<tr>
						<td><code>grayscale</code></td>
						<td><code>boolean</code></td>
						<td><code>true</code></td>
						<td>Apply grayscale filter to images</td>
					</tr>
					<tr>
						<td><code>fit</code></td>
						<td><code>number</code></td>
						<td><code>0.5</code></td>
						<td>Radius as fraction of container dimension</td>
					</tr>
					<tr>
						<td><code>fitBasis</code></td>
						<td><code>'auto' | 'min' | 'max' | 'width' | 'height'</code></td>
						<td><code>'auto'</code></td>
						<td>Which dimension to base radius on</td>
					</tr>
					<tr>
						<td><code>minRadius</code></td>
						<td><code>number</code></td>
						<td><code>600</code></td>
						<td>Minimum radius in pixels</td>
					</tr>
					<tr>
						<td><code>maxRadius</code></td>
						<td><code>number</code></td>
						<td><code>Infinity</code></td>
						<td>Maximum radius in pixels</td>
					</tr>
					<tr>
						<td><code>dragSensitivity</code></td>
						<td><code>number</code></td>
						<td><code>20</code></td>
						<td>Drag sensitivity (higher = less sensitive)</td>
					</tr>
					<tr>
						<td><code>dragDampening</code></td>
						<td><code>number</code></td>
						<td><code>2</code></td>
						<td>Inertia dampening (0-1, higher = longer coast)</td>
					</tr>
					<tr>
						<td><code>maxVerticalRotationDeg</code></td>
						<td><code>number</code></td>
						<td><code>5</code></td>
						<td>Maximum vertical rotation in degrees</td>
					</tr>
					<tr>
						<td><code>enlargeTransitionMs</code></td>
						<td><code>number</code></td>
						<td><code>300</code></td>
						<td>Animation duration for enlarge/close</td>
					</tr>
					<tr>
						<td><code>overlayBlurColor</code></td>
						<td><code>string</code></td>
						<td><code>'#060010'</code></td>
						<td>Edge fade/blur overlay colour</td>
					</tr>
					<tr>
						<td><code>imageBorderRadius</code></td>
						<td><code>string</code></td>
						<td><code>'30px'</code></td>
						<td>Border radius of tile images</td>
					</tr>
					<tr>
						<td><code>openedImageBorderRadius</code></td>
						<td><code>string</code></td>
						<td><code>'30px'</code></td>
						<td>Border radius of enlarged image</td>
					</tr>
					<tr>
						<td><code>openedImageWidth</code></td>
						<td><code>string</code></td>
						<td><code>'250px'</code></td>
						<td>Width of enlarged image</td>
					</tr>
					<tr>
						<td><code>openedImageHeight</code></td>
						<td><code>string</code></td>
						<td><code>'350px'</code></td>
						<td>Height of enlarged image</td>
					</tr>
					<tr>
						<td><code>padFactor</code></td>
						<td><code>number</code></td>
						<td><code>0.25</code></td>
						<td>Viewer padding as fraction of container</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<!-- Technical Implementation -->
	<section class="technical-section">
		<h2 class="section-title">Technical Implementation</h2>
		<div class="technical-grid">
			<div class="technical-card">
				<h3 class="technical-title">3D Sphere Geometry</h3>
				<p class="technical-description">
					Items positioned using <code>rotateX/Y</code> and <code>translateZ</code> to place them on
					a spherical surface. CSS <code>perspective</code> creates depth.
				</p>
			</div>
			<div class="technical-card">
				<h3 class="technical-title">Velocity Tracking</h3>
				<p class="technical-description">
					Pointer move events track velocity using time deltas. On release, velocity feeds into
					inertia animation with configurable friction.
				</p>
			</div>
			<div class="technical-card">
				<h3 class="technical-title">FLIP Animation</h3>
				<p class="technical-description">
					Click-to-enlarge uses FLIP technique: First (tile position), Last (enlarged position),
					Invert, Play for smooth transitions.
				</p>
			</div>
			<div class="technical-card">
				<h3 class="technical-title">ResizeObserver</h3>
				<p class="technical-description">
					Responsive radius recalculation on container resize. CSS custom properties updated
					dynamically for optimal sizing.
				</p>
			</div>
		</div>
	</section>

	<!-- Use Cases -->
	<section class="use-cases-section">
		<h2 class="section-title">Use Cases</h2>
		<div class="use-cases-grid">
			<div class="use-case-card">
				<h3 class="use-case-title">🖼️ Portfolio Galleries</h3>
				<p class="use-case-description">
					Showcase photography, artwork, or design work in an immersive 3D gallery experience.
				</p>
			</div>
			<div class="use-case-card">
				<h3 class="use-case-title">🛍️ Product Showcases</h3>
				<p class="use-case-description">
					Display product images in an interactive format that encourages exploration.
				</p>
			</div>
			<div class="use-case-card">
				<h3 class="use-case-title">🏢 Team Introductions</h3>
				<p class="use-case-description">
					Creative way to display team member photos on an "About" or company page.
				</p>
			</div>
			<div class="use-case-card">
				<h3 class="use-case-title">🎭 Event Galleries</h3>
				<p class="use-case-description">
					Display event photos, conference speakers, or exhibition highlights.
				</p>
			</div>
			<div class="use-case-card">
				<h3 class="use-case-title">🏠 Real Estate</h3>
				<p class="use-case-description">
					Property photo galleries with an immersive feel. Each image expands to full view.
				</p>
			</div>
			<div class="use-case-card">
				<h3 class="use-case-title">📸 Instagram/Social Feeds</h3>
				<p class="use-case-description">
					Alternative display for social media image grids with a unique 3D presentation.
				</p>
			</div>
		</div>
	</section>
</div>

<style>
	/* Gallery wrapper - full viewport */
	.gallery-wrapper {
		position: relative;
		width: 100%;
		height: 100vh;
		background: #060010;
		overflow: hidden;
	}

	/* Info toggle button */
	.info-toggle {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		z-index: 100;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			background 0.2s ease,
			transform 0.2s ease;
	}

	.info-toggle:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: scale(1.05);
	}

	.info-icon {
		font-size: 1.5rem;
		line-height: 1;
	}

	/* Info overlay */
	.info-overlay {
		position: absolute;
		inset: 0;
		z-index: 50;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.info-card {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		padding: 2rem;
		max-width: 500px;
		color: white;
		text-align: center;
	}

	.info-card h2 {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.tagline {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.7);
		margin-bottom: 2rem;
	}

	.instructions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.instruction {
		display: flex;
		align-items: center;
		gap: 1rem;
		text-align: left;
	}

	.instruction .icon {
		font-size: 1.5rem;
		width: 2rem;
	}

	.props-summary {
		text-align: left;
		margin-bottom: 2rem;
	}

	.props-summary h3 {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		color: rgba(255, 255, 255, 0.8);
	}

	.props-summary ul {
		list-style: none;
		padding: 0;
		margin: 0;
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.props-summary li {
		margin-bottom: 0.5rem;
	}

	.props-summary code {
		background: rgba(255, 255, 255, 0.15);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.8rem;
	}

	.scroll-hint {
		display: inline-block;
		color: rgba(255, 255, 255, 0.7);
		text-decoration: none;
		font-size: 0.875rem;
		transition: color 0.2s ease;
	}

	.scroll-hint:hover {
		color: white;
	}

	/* Page container - documentation below gallery */
	.page-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 4rem 2rem;
		background: #f9fafb;
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

	.page-description a {
		color: #3b82f6;
		text-decoration: underline;
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

	.section-description code {
		background: #e5e7eb;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
		color: #374151;
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
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
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
		border-left: 4px solid #8b5cf6;
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
		background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
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
		.gallery-wrapper {
			height: 80vh;
		}

		.page-container {
			padding: 2rem 1rem;
		}

		.page-title {
			font-size: 2rem;
		}

		.page-description {
			font-size: 1rem;
		}

		.info-card {
			padding: 1.5rem;
		}

		.features-grid,
		.use-cases-grid,
		.technical-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
