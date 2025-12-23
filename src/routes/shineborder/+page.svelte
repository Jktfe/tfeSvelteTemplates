<!--
	ShineBorder Component Demo Page

	This page demonstrates the ShineBorder component with animated border effects.
	Shows various configurations and customisation options.
-->

<script lang="ts">
	import ShineBorder from '$lib/components/ShineBorder.svelte';
</script>

<svelte:head>
	<title>ShineBorder Component - Svelte 5 Templates</title>
	<meta
		name="description"
		content="Animated border component with horizontal shine effect for Svelte 5"
	/>
</svelte:head>

<div class="page">
	<div class="container">
		<!-- Header Section -->
		<header>
			<h1>✨ ShineBorder Component</h1>
			<p class="subtitle">
				Wrap your content in an animated border with a smooth horizontal shine effect. Perfect
				for highlighting important cards, CTAs, or featured content.
			</p>
		</header>

		<!-- Basic Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Basic Example</h2>
			</div>

			<p class="description">
				The default ShineBorder with standard settings. Clean, subtle animation that draws
				attention without overwhelming your content.
			</p>

			<div class="demo-container">
				<ShineBorder>
					<div class="demo-card">
						<h3 class="card-title">Featured Content</h3>
						<p class="card-text">
							This card is wrapped in a ShineBorder component with default settings. The subtle
							animation adds visual interest without distraction.
						</p>
					</div>
				</ShineBorder>
			</div>

			<!-- Usage Example -->
			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`${'<'}script>
  import ShineBorder from '$lib/components/ShineBorder.svelte';
</script>

<ShineBorder>
  <div class="content">
    Your content here
  </div>
</ShineBorder>`}</code></pre>
			</details>
		</section>

		<!-- Colour Variations -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Colour Variations</h2>
			</div>

			<p class="description">
				Customise the border colour to match your brand or design system. Any CSS colour value is
				supported.
			</p>

			<div class="demo-grid">
				<ShineBorder color="#146ef5" duration={3}>
					<div class="demo-card-small">
						<div class="colour-swatch" style="background: #146ef5;"></div>
						<h4>Blue</h4>
						<code>#146ef5</code>
					</div>
				</ShineBorder>

				<ShineBorder color="#10b981" duration={3}>
					<div class="demo-card-small">
						<div class="colour-swatch" style="background: #10b981;"></div>
						<h4>Green</h4>
						<code>#10b981</code>
					</div>
				</ShineBorder>

				<ShineBorder color="#8b5cf6" duration={3}>
					<div class="demo-card-small">
						<div class="colour-swatch" style="background: #8b5cf6;"></div>
						<h4>Purple</h4>
						<code>#8b5cf6</code>
					</div>
				</ShineBorder>

				<ShineBorder color="#f59e0b" duration={3}>
					<div class="demo-card-small">
						<div class="colour-swatch" style="background: #f59e0b;"></div>
						<h4>Orange</h4>
						<code>#f59e0b</code>
					</div>
				</ShineBorder>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<ShineBorder color="#146ef5">
  <div>Blue border</div>
</ShineBorder>

<ShineBorder color="#10b981">
  <div>Green border</div>
</ShineBorder>`}</code></pre>
			</details>
		</section>

		<!-- Speed Variations -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Animation Speed</h2>
			</div>

			<p class="description">
				Control the animation speed with the <code>duration</code> prop (in seconds). Choose
				between fast, medium, and slow animations.
			</p>

			<div class="demo-grid">
				<ShineBorder color="#146ef5" duration={1.5}>
					<div class="demo-card-small">
						<h4>Fast</h4>
						<code>duration={1.5}</code>
						<p class="small-text">Quick, energetic animation</p>
					</div>
				</ShineBorder>

				<ShineBorder color="#146ef5" duration={3}>
					<div class="demo-card-small">
						<h4>Medium</h4>
						<code>duration={3}</code>
						<p class="small-text">Balanced, standard speed</p>
					</div>
				</ShineBorder>

				<ShineBorder color="#146ef5" duration={6}>
					<div class="demo-card-small">
						<h4>Slow</h4>
						<code>duration={6}</code>
						<p class="small-text">Subtle, gentle animation</p>
					</div>
				</ShineBorder>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<ShineBorder duration={1.5}>
  <div>Fast animation</div>
</ShineBorder>

<ShineBorder duration={6}>
  <div>Slow animation</div>
</ShineBorder>`}</code></pre>
			</details>
		</section>

		<!-- Border Width & Radius -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Border Styling</h2>
			</div>

			<p class="description">
				Customise the border width and corner radius to match your design needs.
			</p>

			<div class="demo-grid">
				<ShineBorder borderWidth={1} borderRadius={8}>
					<div class="demo-card-small">
						<h4>Thin Border</h4>
						<code>borderWidth={1}</code>
						<p class="small-text">Subtle, minimal outline</p>
					</div>
				</ShineBorder>

				<ShineBorder borderWidth={4} borderRadius={16}>
					<div class="demo-card-small">
						<h4>Thick Border</h4>
						<code>borderWidth={4}</code>
						<p class="small-text">Bold, prominent frame</p>
					</div>
				</ShineBorder>

				<ShineBorder borderWidth={2} borderRadius={0}>
					<div class="demo-card-small">
						<h4>Sharp Corners</h4>
						<code>borderRadius={0}</code>
						<p class="small-text">Square, modern look</p>
					</div>
				</ShineBorder>

				<ShineBorder borderWidth={2} borderRadius={32}>
					<div class="demo-card-small">
						<h4>Round Corners</h4>
						<code>borderRadius={32}</code>
						<p class="small-text">Soft, friendly style</p>
					</div>
				</ShineBorder>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<ShineBorder borderWidth={4} borderRadius={16}>
  <div>Thick border with rounded corners</div>
</ShineBorder>`}</code></pre>
			</details>
		</section>

		<!-- Features Grid -->
		<section class="features-section">
			<h2>Component Features</h2>
			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon">🎨</div>
					<h3>Customisable Colours</h3>
					<p>Use any CSS colour value - hex, RGB, HSL, or named colours.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">⚡</div>
					<h3>CSS Animations</h3>
					<p>Smooth, performant animations using native CSS with no JavaScript overhead.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🎯</div>
					<h3>Flexible Sizing</h3>
					<p>Automatically adapts to content size with configurable border width and radius.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🔧</div>
					<h3>Easy Integration</h3>
					<p>Simply wrap any content - works as a container component with Svelte snippets.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">📦</div>
					<h3>Zero Dependencies</h3>
					<p>Pure Svelte and CSS implementation with no external libraries required.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">♿</div>
					<h3>Accessible</h3>
					<p>Decorative element that doesn't interfere with screen readers or keyboard navigation.</p>
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
							Copy <code>ShineBorder.svelte</code> from
							<code>src/lib/components/</code> to your project.
						</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">2</div>
					<div class="step-content">
						<h3>Import and Use</h3>
						<p>
							Import the component and wrap your content. All props are optional with sensible
							defaults.
						</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">3</div>
					<div class="step-content">
						<h3>Customise</h3>
						<p>
							Adjust colour, duration, border width, and radius to match your design requirements.
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
							<td><code>color</code></td>
							<td>string</td>
							<td>'#146ef5'</td>
							<td>CSS colour value for the border shine</td>
						</tr>
						<tr>
							<td><code>duration</code></td>
							<td>number</td>
							<td>3</td>
							<td>Animation duration in seconds</td>
						</tr>
						<tr>
							<td><code>borderWidth</code></td>
							<td>number</td>
							<td>2</td>
							<td>Border width in pixels</td>
						</tr>
						<tr>
							<td><code>borderRadius</code></td>
							<td>number</td>
							<td>8</td>
							<td>Corner radius in pixels</td>
						</tr>
					</tbody>
				</table>
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
	.props-section {
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
		padding: 3rem 1rem;
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		border-radius: 12px;
		margin-bottom: 2rem;
	}

	.demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.demo-card {
		padding: 2rem;
		background: white;
		border-radius: 12px;
		max-width: 500px;
	}

	.demo-card-small {
		padding: 2rem;
		background: white;
		border-radius: 12px;
		text-align: center;
	}

	.card-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: #1a202c;
	}

	.card-text {
		font-size: 1rem;
		color: #4a5568;
		margin: 0;
		line-height: 1.6;
	}

	.demo-card-small h4 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0.5rem 0;
		color: #1a202c;
	}

	.colour-swatch {
		width: 4rem;
		height: 4rem;
		border-radius: 8px;
		margin: 0 auto 1rem auto;
	}

	.small-text {
		font-size: 0.875rem;
		color: #718096;
		margin: 0.5rem 0 0 0;
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

		.demo-grid {
			grid-template-columns: 1fr;
		}

		.step {
			flex-direction: column;
			gap: 1rem;
		}
	}
</style>
