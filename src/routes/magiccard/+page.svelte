<!--
	MagicCard Component Demo Page

	This page demonstrates the MagicCard component with mouse-tracking spotlight effects.
	Shows interactive cards that respond to cursor movement with dynamic lighting.
-->

<script lang="ts">
	import MagicCard from '$lib/components/MagicCard.svelte';

	// Sample product/feature cards
	const products = [
		{
			icon: '⚡',
			title: 'Lightning Fast',
			description: 'Blazing fast performance with optimised rendering and minimal bundle size.'
		},
		{
			icon: '🎨',
			title: 'Beautiful Design',
			description: 'Modern, clean aesthetics that work seamlessly with your brand identity.'
		},
		{
			icon: '🔧',
			title: 'Easy to Use',
			description: 'Simple API with comprehensive TypeScript support and documentation.'
		},
		{
			icon: '📱',
			title: 'Responsive',
			description: 'Works perfectly across all devices from mobile to desktop screens.'
		},
		{
			icon: '♿',
			title: 'Accessible',
			description: 'Built with accessibility in mind, following WCAG 2.1 guidelines.'
		},
		{
			icon: '🚀',
			title: 'Production Ready',
			description: 'Battle-tested components used in production by teams worldwide.'
		}
	];
</script>

<svelte:head>
	<title>MagicCard Component - Svelte 5 Templates</title>
	<meta
		name="description"
		content="Interactive cards with mouse-tracking spotlight effects for Svelte 5"
	/>
</svelte:head>

<div class="page">
	<div class="container">
		<!-- Header Section -->
		<header>
			<h1>MagicCard Component</h1>
			<p class="subtitle">
				Interactive cards with dynamic spotlight effects that follow your cursor. Perfect for
				feature showcases, pricing tiers, or product cards.
			</p>
		</header>

		<!-- Main Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Interactive Feature Cards</h2>
				<div class="badge">Move Your Mouse</div>
			</div>

			<p class="description">
				Hover over any card to see the magic happen. The spotlight and border glow follow your
				cursor position in real-time, creating an engaging interactive experience.
			</p>

			<div class="cards-grid">
				{#each products as product}
					<MagicCard gradientColor="#146ef5" gradientOpacity={0.15}>
						<div class="product-card">
							<div class="product-icon">{product.icon}</div>
							<h3 class="product-title">{product.title}</h3>
							<p class="product-description">{product.description}</p>
						</div>
					</MagicCard>
				{/each}
			</div>

			<!-- Usage Example -->
			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`${'<'}script>
  import MagicCard from '$lib/components/MagicCard.svelte';
</script>

<MagicCard
  gradientColor="#146ef5"
  gradientOpacity={0.15}
 
>
  <div class="card-content">
    <h3>Card Title</h3>
    <p>Card description goes here...</p>
  </div>
</MagicCard>`}</code></pre>
			</details>
		</section>

		<!-- Colour Variants -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Colour Variants</h2>
				<div class="badge badge-purple">Customisable</div>
			</div>

			<p class="description">
				Customise the spotlight and border colours to match your brand or design system.
			</p>

			<div class="color-variants-grid">
				<MagicCard gradientColor="#146ef5">
					<div class="variant-card blue">
						<h3>Primary Blue</h3>
						<p>gradientColor="#146ef5"</p>
					</div>
				</MagicCard>

				<MagicCard gradientColor="#667eea">
					<div class="variant-card purple">
						<h3>Purple</h3>
						<p>gradientColor="#667eea"</p>
					</div>
				</MagicCard>

				<MagicCard gradientColor="#10b981">
					<div class="variant-card green">
						<h3>Green</h3>
						<p>gradientColor="#10b981"</p>
					</div>
				</MagicCard>

				<MagicCard gradientColor="#f59e0b">
					<div class="variant-card orange">
						<h3>Orange</h3>
						<p>gradientColor="#f59e0b"</p>
					</div>
				</MagicCard>
			</div>

			<!-- Usage Example -->
			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<!-- Blue variant -->
<MagicCard gradientColor="#146ef5">
  <div class="content">...</div>
</MagicCard>

<!-- Purple variant -->
<MagicCard gradientColor="#667eea">
  <div class="content">...</div>
</MagicCard>

<!-- Custom opacity -->
<MagicCard
  gradientColor="#10b981"
  gradientOpacity={0.2}
 
>
  <div class="content">...</div>
</MagicCard>`}</code></pre>
			</details>
		</section>

		<!-- Features Section -->
		<section class="features-section">
			<h2>Features</h2>
			<div class="features-grid">
				<div class="feature">
					<div class="feature-icon">🎯</div>
					<h3>Mouse Tracking</h3>
					<p>Real-time cursor position tracking with smooth animations</p>
				</div>
				<div class="feature">
					<div class="feature-icon">💡</div>
					<h3>Dynamic Spotlight</h3>
					<p>Radial gradient spotlight that follows your mouse</p>
				</div>
				<div class="feature">
					<div class="feature-icon">✨</div>
					<h3>Border Glow</h3>
					<p>Animated border highlight at cursor position</p>
				</div>
				<div class="feature">
					<div class="feature-icon">🎨</div>
					<h3>Customisable Colours</h3>
					<p>Full control over spotlight and border colours</p>
				</div>
				<div class="feature">
					<div class="feature-icon">⚡</div>
					<h3>Performant</h3>
					<p>GPU-accelerated animations for 60fps smoothness</p>
				</div>
				<div class="feature">
					<div class="feature-icon">📦</div>
					<h3>Any Content</h3>
					<p>Wrap any content - text, images, or complex layouts</p>
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
					<p>
						Copy <code>MagicCard.svelte</code> from <code>src/lib/components/</code> to your project.
					</p>
				</div>
			</div>

			<div class="guide-step">
				<div class="step-number">2</div>
				<div class="step-content">
					<h3>Wrap Your Content</h3>
					<p>
						Place your card content inside the MagicCard component. It works with any HTML or
						Svelte components.
					</p>
				</div>
			</div>

			<div class="guide-step">
				<div class="step-number">3</div>
				<div class="step-content">
					<h3>Customise Colours</h3>
					<p>
						Set <code>gradientColor</code>, <code>gradientOpacity</code>, and
						<code>borderColor</code> props to match your design. All props are optional with sensible
						defaults.
					</p>
				</div>
			</div>
		</section>
	</div>
</div>

<style>
	.page {
		padding: 4rem 0;
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
		line-height: 1.2;
	}

	.subtitle {
		font-size: 1.25rem;
		color: #718096;
		margin: 0;
		line-height: 1.6;
		max-width: 700px;
		margin-left: auto;
		margin-right: auto;
	}

	/* Demo Sections */
	.demo-section {
		margin-top: 2rem;
		margin-bottom: 5rem;
		padding-bottom: 5rem;
		border-bottom: 1px solid #e2e8f0;
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
		font-weight: 600;
		margin: 0;
		color: #1a202c;
	}

	.badge {
		padding: 0.25rem 0.75rem;
		background: #edf2f7;
		color: #4a5568;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.badge-purple {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.description {
		font-size: 1.125rem;
		color: #4a5568;
		line-height: 1.6;
		margin-bottom: 3rem;
	}

	/* Cards Grid */
	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.product-card {
		padding: 2.5rem;
		min-height: 250px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.product-icon {
		font-size: 4rem;
		margin-bottom: 1.5rem;
	}

	.product-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: #1a202c;
	}

	.product-description {
		font-size: 1rem;
		color: #718096;
		margin: 0;
		line-height: 1.6;
	}

	/* Colour Variants Grid */
	.color-variants-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin-bottom: 3rem;
	}

	:global(.variant-card) {
		padding: 3rem 2rem;
		text-align: center;
		min-height: 200px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	:global(.variant-card h3) {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #1a202c;
	}

	:global(.variant-card p) {
		font-size: 0.875rem;
		color: #718096;
		margin: 0;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
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
		color: #1a202c;
		user-select: none;
		transition: background 0.2s ease;
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
		background: #ffffff;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		transition: all 0.2s ease;
	}

	.feature:hover {
		transform: translateY(-2px);
		border-color: #146ef5;
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #1a202c;
	}

	.feature p {
		font-size: 0.95rem;
		color: #718096;
		margin: 0;
		line-height: 1.6;
	}

	/* Guide Section */
	.guide-section {
		margin: 4rem 0;
	}

	.guide-step {
		display: flex;
		gap: 2rem;
		margin-top: 2rem;
		padding: 2rem;
		background: #ffffff;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		transition: all 0.2s ease;
	}

	.guide-step:hover {
		border-color: #146ef5;
		transform: translateX(4px);
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

	.step-content code {
		padding: 0.125rem 0.375rem;
		background: #edf2f7;
		color: #146ef5;
		border-radius: 4px;
		font-size: 0.875rem;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.container {
			padding: 0 1rem;
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

		.cards-grid {
			grid-template-columns: 1fr;
		}

		.color-variants-grid {
			grid-template-columns: 1fr;
		}

		.features-grid {
			grid-template-columns: 1fr;
		}

		.guide-step {
			flex-direction: column;
			gap: 1rem;
		}
	}
</style>
