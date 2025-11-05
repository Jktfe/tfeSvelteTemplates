<!--
	CardStack Template Demo Page

	This page demonstrates both CardStack components with live examples.
	Shows how to import, use, and customize the components.

	STRUCTURE:
	- Header with component overview
	- Basic CardStack demo with code examples
	- Advanced CardStack demo with code examples
	- Features grid highlighting key capabilities
	- Quick start guide with step-by-step instructions
	- Footer with technology links
-->

<script lang="ts">
	import CardStack from '$lib/components/CardStack.svelte';
	import CardStackAdvanced from '$lib/components/CardStackAdvanced.svelte';
	import type { PageData } from './$types';

	// Receive card data from server load function
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>CardStack Template - Svelte 5 Component Library</title>
	<meta name="description" content="Interactive card stack components for Svelte 5" />
</svelte:head>

<main>
	<div class="container">
		<!-- Header Section -->
		<header>
			<h1>CardStack Components</h1>
			<p class="subtitle">Interactive horizontal card displays with hover and swipe interactions for Svelte 5</p>
		</header>

		<!-- Basic CardStack Example -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Basic CardStack</h2>
				<div class="badge">Default</div>
			</div>

			<p class="description">
				Cards arranged in a horizontal overlapping row. <strong>Hover</strong> to preview a card (it rises but stays partially behind its neighbor), then <strong>click</strong> to select and fully reveal it. Perfect for showcasing products, portfolios, or image galleries.
			</p>

			<div class="demo-container">
				<CardStack cards={data.cards} />
			</div>

			<!-- Usage Example -->
			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<script>
  import CardStack from '$lib/components/CardStack.svelte';

  const cards = [
    {
      image: '/path/to/image.jpg',
      title: 'Card Title',
      content: 'Card description or HTML content'
    },
    // ... more cards
  ];
</script>

<CardStack cards={cards} />

<!-- With custom dimensions -->
<CardStack
  cards={cards}
  cardWidth={350}
  cardHeight={450}
/>`}</code></pre>
			</details>
		</section>

		<!-- Advanced CardStack Example -->
		<section class="demo-section">
			<div class="section-header">
				<h2>CardStack Advanced</h2>
				<div class="badge badge-premium">Enhanced</div>
			</div>

			<p class="description">
				Enhanced version with the same two-stage interaction: <strong>hover to preview, click to reveal</strong>. Adds swipe-to-cycle on mobile (swipe left/right to roll cards through the stack) and keyboard navigation on desktop (arrow keys).
			</p>

			<div class="demo-container">
				<CardStackAdvanced cards={data.cards} />
			</div>

			<!-- Usage Example -->
			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<script>
  import CardStackAdvanced from '$lib/components/CardStackAdvanced.svelte';

  const cards = [
    {
      image: '/path/to/image.jpg',
      title: 'Card Title',
      content: 'Card description or HTML content'
    },
    // ... more cards
  ];
</script>

<CardStackAdvanced cards={cards} />

<!-- Supports keyboard navigation -->
<!-- Press ← and → arrow keys to navigate -->`}</code></pre>
			</details>
		</section>

		<!-- Features Section -->
		<section class="features-section">
			<h2>Features</h2>
			<div class="features-grid">
				<div class="feature">
					<div class="feature-icon">👆</div>
					<h3>Two-Stage Interaction</h3>
					<p>Hover to preview (partial reveal), click to select (full reveal)</p>
				</div>
				<div class="feature">
					<div class="feature-icon">📱</div>
					<h3>Swipe to Cycle</h3>
					<p>Mobile swipe gestures roll cards through the stack (Advanced version)</p>
				</div>
				<div class="feature">
					<div class="feature-icon">⚡</div>
					<h3>Smooth Animations</h3>
					<p>Cubic-bezier easing for natural, bouncy transitions</p>
				</div>
				<div class="feature">
					<div class="feature-icon">📐</div>
					<h3>Horizontal Overlap</h3>
					<p>Cards arranged in an elegant overlapping row layout</p>
				</div>
				<div class="feature">
					<div class="feature-icon">⌨️</div>
					<h3>Keyboard Support</h3>
					<p>Arrow key navigation cycles through cards (Advanced version)</p>
				</div>
				<div class="feature">
					<div class="feature-icon">♿</div>
					<h3>Accessible</h3>
					<p>Proper ARIA labels, keyboard focus, and semantic HTML</p>
				</div>
			</div>
		</section>

		<!-- Implementation Guide -->
		<section class="guide-section">
			<h2>Quick Start Guide</h2>

			<div class="guide-step">
				<div class="step-number">1</div>
				<div class="step-content">
					<h3>Copy the Component</h3>
					<p>Copy <code>CardStack.svelte</code> or <code>CardStackAdvanced.svelte</code> from <code>src/lib/components/</code> to your project.</p>
				</div>
			</div>

			<div class="guide-step">
				<div class="step-number">2</div>
				<div class="step-content">
					<h3>Prepare Your Data</h3>
					<p>Create an array of card objects with <code>image</code>, <code>title</code>, and <code>content</code> properties.</p>
				</div>
			</div>

			<div class="guide-step">
				<div class="step-number">3</div>
				<div class="step-content">
					<h3>Import and Use</h3>
					<p>Import the component and pass your cards array as a prop. That's it!</p>
				</div>
			</div>
		</section>

		<!-- Footer -->
		<footer>
			<p>
				Built with <a href="https://svelte.dev" target="_blank" rel="noopener noreferrer">Svelte 5</a> •
				Hosted on <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">Vercel</a> •
				Database by <a href="https://neon.tech" target="_blank" rel="noopener noreferrer">Neon</a>
			</p>
			<p class="small">Part of the TFE Svelte Templates collection</p>
		</footer>
	</div>
</main>

<style>
	/* Global Styles */
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			Cantarell, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
		color: #1a202c;
	}

	main {
		min-height: 100vh;
		padding: 2rem 1rem;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		background: white;
		border-radius: 24px;
		padding: 3rem 2rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	/* Header */
	header {
		text-align: center;
		margin-bottom: 4rem;
	}

	h1 {
		font-size: 3rem;
		font-weight: 800;
		margin: 0 0 0.5rem 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		font-size: 1.25rem;
		color: #718096;
		margin: 0;
	}

	/* Demo Sections */
	.demo-section {
		margin-bottom: 4rem;
		padding-bottom: 4rem;
		border-bottom: 2px solid #e2e8f0;
	}

	.demo-section:last-of-type {
		border-bottom: none;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	h2 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
		color: #2d3748;
	}

	.badge {
		padding: 0.25rem 0.75rem;
		background: #edf2f7;
		color: #4a5568;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.badge-premium {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.description {
		font-size: 1.125rem;
		color: #4a5568;
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	/* Demo Container */
	.demo-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 500px;
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		border-radius: 16px;
		padding: 3rem;
		margin-bottom: 2rem;
	}

	/* Code Block */
	.code-block {
		margin-top: 2rem;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		overflow: hidden;
	}

	.code-block summary {
		padding: 1rem 1.5rem;
		background: #f7fafc;
		cursor: pointer;
		font-weight: 600;
		color: #2d3748;
		user-select: none;
	}

	.code-block summary:hover {
		background: #edf2f7;
	}

	.code-block pre {
		margin: 0;
		padding: 1.5rem;
		background: #1a202c;
		overflow-x: auto;
	}

	.code-block code {
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.875rem;
		line-height: 1.6;
		color: #e2e8f0;
	}

	/* Features Section */
	.features-section {
		margin: 4rem 0;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
	}

	.feature {
		text-align: center;
		padding: 2rem;
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		border-radius: 16px;
		transition: transform 0.2s;
	}

	.feature:hover {
		transform: translateY(-4px);
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature h3 {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: #2d3748;
	}

	.feature p {
		font-size: 0.875rem;
		color: #718096;
		margin: 0;
	}

	/* Guide Section */
	.guide-section {
		margin: 4rem 0;
	}

	.guide-step {
		display: flex;
		gap: 1.5rem;
		margin-top: 2rem;
		padding: 1.5rem;
		background: #f7fafc;
		border-radius: 12px;
	}

	.step-number {
		flex-shrink: 0;
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-size: 1.5rem;
		font-weight: 700;
		border-radius: 50%;
	}

	.step-content h3 {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: #2d3748;
	}

	.step-content p {
		font-size: 1rem;
		color: #4a5568;
		margin: 0;
		line-height: 1.6;
	}

	.step-content code {
		padding: 0.125rem 0.375rem;
		background: #e2e8f0;
		color: #667eea;
		border-radius: 4px;
		font-size: 0.875rem;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}

	/* Footer */
	footer {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 2px solid #e2e8f0;
		text-align: center;
		color: #718096;
	}

	footer p {
		margin: 0.5rem 0;
	}

	footer a {
		color: #667eea;
		text-decoration: none;
		font-weight: 600;
	}

	footer a:hover {
		text-decoration: underline;
	}

	.small {
		font-size: 0.875rem;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.container {
			padding: 2rem 1rem;
			border-radius: 0;
		}

		h1 {
			font-size: 2rem;
		}

		.subtitle {
			font-size: 1rem;
		}

		h2 {
			font-size: 1.5rem;
		}

		.demo-container {
			padding: 2rem 1rem;
			min-height: 450px;
		}

		.features-grid {
			grid-template-columns: 1fr;
		}

		.guide-step {
			flex-direction: column;
		}
	}
</style>
