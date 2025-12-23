<!--
	SwishButton Component Demo Page

	This page demonstrates the SwishButton component with animated text and background effects.
	Shows various configurations and use cases.
-->

<script lang="ts">
	import SwishButton from '$lib/components/SwishButton.svelte';

	let clickCount = $state(0);

	function handleClick() {
		clickCount++;
	}
</script>

<svelte:head>
	<title>SwishButton Component - Svelte 5 Templates</title>
	<meta
		name="description"
		content="Animated button with swishing text transition and expanding background for Svelte 5"
	/>
</svelte:head>

<div class="page">
	<div class="container">
		<!-- Header Section -->
		<header>
			<h1>🎯 SwishButton Component</h1>
			<p class="subtitle">
				An interactive button with smooth text sliding animation and an expanding background dot
				effect. Perfect for CTAs, navigation buttons, or any interactive element that needs visual
				flair.
			</p>
		</header>

		<!-- Basic Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Basic Example</h2>
				<div class="badge">Hover Me</div>
			</div>

			<p class="description">
				Hover over the button to see the swishing text animation and expanding background effect.
				The button smoothly transitions from a compact state to an active state with an arrow
				icon.
			</p>

			<div class="demo-container">
				<SwishButton text="Get Started" />
			</div>

			<!-- Usage Example -->
			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`${'<'}script>
  import SwishButton from '$lib/components/SwishButton.svelte';
</script>

<SwishButton text="Get Started" />`}</code></pre>
			</details>
		</section>

		<!-- Interactive Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Interactive Example</h2>
			</div>

			<p class="description">
				The button supports all standard button events. Click to increment the counter below.
			</p>

			<div class="demo-container">
				<div style="text-align: center;">
					<SwishButton text="Click Me" onclick={handleClick} />
					<p class="counter">Clicked {clickCount} times</p>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`${'<'}script>
  import SwishButton from '$lib/components/SwishButton.svelte';

  let count = $state(0);
</script>

<SwishButton
  text="Click Me"
  onclick={() => count++}
/>
<p>Clicked {count} times</p>`}</code></pre>
			</details>
		</section>

		<!-- Text Variations -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Different Labels</h2>
			</div>

			<p class="description">Customise the button text for different use cases and contexts.</p>

			<div class="demo-grid">
				<div class="demo-item">
					<SwishButton text="Learn More" />
					<p class="label">Information</p>
				</div>

				<div class="demo-item">
					<SwishButton text="Buy Now" />
					<p class="label">E-commerce</p>
				</div>

				<div class="demo-item">
					<SwishButton text="Sign Up" />
					<p class="label">Registration</p>
				</div>

				<div class="demo-item">
					<SwishButton text="Contact" />
					<p class="label">Support</p>
				</div>

				<div class="demo-item">
					<SwishButton text="Download" />
					<p class="label">File Action</p>
				</div>

				<div class="demo-item">
					<SwishButton text="Continue" />
					<p class="label">Navigation</p>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<SwishButton text="Learn More" />
<SwishButton text="Buy Now" />
<SwishButton text="Sign Up" />`}</code></pre>
			</details>
		</section>

		<!-- Custom Styling -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Custom Styling</h2>
			</div>

			<p class="description">
				Use the <code>class</code> prop to apply custom Tailwind classes or your own CSS.
			</p>

			<div class="demo-grid">
				<div class="demo-item">
					<SwishButton text="Default" />
					<p class="label">Standard colours</p>
				</div>

				<div class="demo-item">
					<SwishButton text="Wide" class="w-40" />
					<p class="label">Wider button</p>
				</div>

				<div class="demo-item">
					<SwishButton text="Larger" class="w-36 p-3 text-lg" />
					<p class="label">Larger size</p>
				</div>

				<div class="demo-item">
					<SwishButton text="Custom" class="border-2 border-purple-500" />
					<p class="label">Custom border</p>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<SwishButton text="Wide" class="w-40" />

<SwishButton
  text="Larger"
  class="w-36 p-3 text-lg"
/>

<SwishButton
  text="Custom"
  class="border-2 border-purple-500"
/>`}</code></pre>
			</details>
		</section>

		<!-- Button States -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Button States</h2>
			</div>

			<p class="description">
				The component supports all native button attributes via <code>$$restProps</code>,
				including disabled state and button types.
			</p>

			<div class="demo-grid">
				<div class="demo-item">
					<SwishButton text="Disabled" disabled />
					<p class="label">Cannot interact</p>
				</div>

				<div class="demo-item">
					<SwishButton text="Submit" type="submit" />
					<p class="label">Form submission</p>
				</div>

				<div class="demo-item">
					<SwishButton text="Reset" type="reset" />
					<p class="label">Form reset</p>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<SwishButton text="Disabled" disabled />

<SwishButton text="Submit" type="submit" />

<SwishButton text="Reset" type="reset" />`}</code></pre>
			</details>
		</section>

		<!-- Features Grid -->
		<section class="features-section">
			<h2>Component Features</h2>
			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon">🎬</div>
					<h3>Smooth Animations</h3>
					<p>Coordinated text slide and background expansion with perfect timing.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🎨</div>
					<h3>Customisable</h3>
					<p>Apply custom classes, adjust sizing, and style with Tailwind utilities.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🚀</div>
					<h3>Zero Dependencies</h3>
					<p>No icon libraries required - uses inline SVG for the arrow.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">⚡</div>
					<h3>Native Events</h3>
					<p>Full support for all button events: onclick, onmouseenter, etc.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">♿</div>
					<h3>Accessible</h3>
					<p>Maintains semantic button element with proper focus states.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">📱</div>
					<h3>Responsive</h3>
					<p>Works perfectly on touch devices with hover state animations.</p>
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
							Copy <code>SwishButton.svelte</code> from <code>src/lib/components/</code> to your
							project. Ensure you have the <code>cn</code> utility from
							<code>src/lib/utils.ts</code>.
						</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">2</div>
					<div class="step-content">
						<h3>Import and Use</h3>
						<p>
							Import the component and use it like a standard button. The <code>text</code> prop
							controls the button label.
						</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">3</div>
					<div class="step-content">
						<h3>Add Interactions</h3>
						<p>
							Attach event handlers using standard Svelte syntax. All button attributes are
							supported via <code>$$restProps</code>.
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
							<td><code>text</code></td>
							<td>string</td>
							<td>'Button'</td>
							<td>Button text to display</td>
						</tr>
						<tr>
							<td><code>class</code></td>
							<td>string</td>
							<td>''</td>
							<td>Additional CSS classes for customisation</td>
						</tr>
						<tr>
							<td><code>...$$restProps</code></td>
							<td>any</td>
							<td>-</td>
							<td>All standard button attributes (onclick, disabled, type, etc.)</td>
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
		padding: 3rem 1rem;
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		border-radius: 12px;
		margin-bottom: 2rem;
		min-height: 200px;
	}

	.counter {
		margin-top: 2rem;
		font-size: 1.125rem;
		color: #4a5568;
		font-weight: 600;
	}

	.demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.demo-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem;
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		border-radius: 12px;
	}

	.label {
		font-size: 0.875rem;
		color: #718096;
		margin: 0;
		text-align: center;
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
