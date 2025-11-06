<!--
	Marquee Component Demo Page

	This page demonstrates both Marquee variants:
	- Static Marquee (CSS-based, pause on hover)
	- Interactive MarqueeDraggable (click-and-drag control)
-->

<script lang="ts">
	import Marquee from '$lib/components/Marquee.svelte';
	import MarqueeDraggable from '$lib/components/MarqueeDraggable.svelte';

	// Testimonial data for static marquee
	const testimonials = [
		{
			name: 'Sarah Chen',
			role: 'Product Designer',
			company: 'TechCorp',
			quote: 'These components saved us weeks of development time. Absolutely brilliant!',
			avatar: '👩‍💼'
		},
		{
			name: 'James Rodriguez',
			role: 'Engineering Lead',
			company: 'StartupXYZ',
			quote: 'Clean, performant, and beautifully designed. Exactly what we needed.',
			avatar: '👨‍💻'
		},
		{
			name: 'Emily Watson',
			role: 'Frontend Developer',
			company: 'DesignStudio',
			quote: 'The TypeScript support and documentation are top-notch. Highly recommend!',
			avatar: '👩‍🎨'
		},
		{
			name: 'Michael Park',
			role: 'CTO',
			company: 'InnovateLabs',
			quote: 'Production-ready components that just work. Our team loves them!',
			avatar: '👨‍💼'
		},
		{
			name: 'Lisa Thompson',
			role: 'UI Engineer',
			company: 'CloudSystems',
			quote: 'Responsive, accessible, and easy to customise. Perfect for our projects.',
			avatar: '👩‍🔬'
		}
	];

	// Company logos (using emojis for demo)
	const companies = ['🚀 SpaceX', '🍎 Apple', '🔍 Google', '💼 Microsoft', '⚡ Tesla', '🎵 Spotify'];

	// Features for static marquee
	const features = [
		'⚡ Lightning Fast',
		'📱 Mobile Responsive',
		'♿ Fully Accessible',
		'🎨 Customisable',
		'🚀 Zero Dependencies',
		'📝 TypeScript Support'
	];

	// Product data for draggable marquee
	const products = [
		{ emoji: '⌚', name: 'Smartwatch' },
		{ emoji: '🎧', name: 'Headphones' },
		{ emoji: '💻', name: 'Laptop' },
		{ emoji: '📱', name: 'Smartphone' },
		{ emoji: '🖥️', name: 'Monitor' },
		{ emoji: '⌨️', name: 'Keyboard' }
	];

	// Testimonials for draggable marquee
	const testimonialsInteractive = [
		{
			name: 'Alex Morgan',
			role: 'UX Designer',
			company: 'TechFlow',
			quote: 'The drag interaction is incredibly smooth and intuitive!',
			avatar: '👨‍💼'
		},
		{
			name: 'Sophia Chen',
			role: 'Product Manager',
			company: 'InnovateHub',
			quote: 'Users love being able to control the marquee speed themselves.',
			avatar: '👩‍💻'
		},
		{
			name: 'Marcus Johnson',
			role: 'Developer',
			company: 'CodeCraft',
			quote: 'Easy to implement and the momentum feels natural.',
			avatar: '👨‍🔬'
		},
		{
			name: 'Emma Wilson',
			role: 'Marketing Lead',
			company: 'BrandBoost',
			quote: 'Perfect for showcasing content in an engaging way!',
			avatar: '👩‍💼'
		}
	];

	// Features for draggable marquee
	const featuresInteractive = [
		'👆 Click & Drag',
		'🚀 Momentum Scrolling',
		'🔄 Direction Control',
		'📱 Touch Support',
		'⚡ GPU Accelerated',
		'♿ Accessible'
	];
</script>

<svelte:head>
	<title>Marquee Components - Svelte 5 Templates</title>
	<meta
		name="description"
		content="Continuous scrolling marquee components for Svelte 5 - static with pause on hover and interactive with click-and-drag"
	/>
</svelte:head>

<div class="page">
	<div class="container">
		<!-- Header Section -->
		<header>
			<h1>Marquee Components</h1>
			<p class="subtitle">
				Two variants available: Static marquee with pause-on-hover, or interactive marquee with
				click-and-drag control. Both feature seamless infinite loop animation.
			</p>
		</header>

		<!-- Static Marquee Section -->
		<section class="variant-section">
			<div class="variant-header">
				<h2>
					<span class="variant-icon">⏸️</span>
					Static Marquee
				</h2>
				<div class="variant-badges">
					<span class="badge badge-css">CSS Only</span>
					<span class="badge badge-static">Pause on Hover</span>
				</div>
			</div>
			<p class="variant-description">
				Pure CSS implementation with zero dependencies. Automatically scrolls and pauses when users
				hover to read content. Lightweight and performant.
			</p>

			<!-- Testimonials Example -->
			<div class="demo-section">
				<div class="section-header">
					<h3>Testimonials Marquee</h3>
					<div class="badge">Default Speed</div>
				</div>

				<p class="description">
					Showcase customer reviews with an elegant scrolling animation. Hover to pause and read the
					testimonials.
				</p>

				<div class="demo-container">
					<Marquee pauseOnHover={true} duration={60}>
						{#each testimonials as testimonial}
							<div class="testimonial-card">
								<div class="avatar">{testimonial.avatar}</div>
								<p class="quote">"{testimonial.quote}"</p>
								<div class="author">
									<strong>{testimonial.name}</strong>
									<span class="role">{testimonial.role} at {testimonial.company}</span>
								</div>
							</div>
						{/each}
					</Marquee>
				</div>

				<details class="code-block">
					<summary>View Code Example</summary>
					<pre><code
							>{`<script>
  import Marquee from '$lib/components/Marquee.svelte';

  const testimonials = [
    {
      name: 'Sarah Chen',
      quote: 'Amazing components!',
      role: 'Designer'
    },
    // ... more testimonials
  ];
</script>

<Marquee pauseOnHover={true} duration={60}>
  {#each testimonials as testimonial}
    <div class="testimonial-card">
      <p>{testimonial.quote}</p>
      <strong>{testimonial.name}</strong>
    </div>
  {/each}
</Marquee>`}</code
						></pre>
				</details>
			</div>

			<!-- Company Logos Example -->
			<div class="demo-section">
				<div class="section-header">
					<h3>Company Logos</h3>
					<div class="badge badge-fast">Fast</div>
				</div>

				<p class="description">
					Display partner logos or brand names with a faster scrolling speed. Clean and minimal
					presentation.
				</p>

				<div class="demo-container">
					<Marquee pauseOnHover={true} duration={20}>
						{#each companies as company}
							<div class="logo-card">{company}</div>
						{/each}
					</Marquee>
				</div>

				<details class="code-block">
					<summary>View Code Example</summary>
					<pre><code
							>{`<Marquee pauseOnHover={true} duration={20}>
  {#each companies as company}
    <div class="logo-card">{company}</div>
  {/each}
</Marquee>`}</code
						></pre>
				</details>
			</div>

			<!-- Features Example (Right to Left) -->
			<div class="demo-section">
				<div class="section-header">
					<h3>Features Banner</h3>
					<div class="badge badge-reverse">Reverse Direction</div>
				</div>

				<p class="description">
					Scrolling from right to left with feature badges. Demonstrates direction customisation.
				</p>

				<div class="demo-container">
					<Marquee pauseOnHover={true} reverse={true} duration={40}>
						{#each features as feature}
							<div class="feature-badge">{feature}</div>
						{/each}
					</Marquee>
				</div>

				<details class="code-block">
					<summary>View Code Example</summary>
					<pre><code
							>{`<Marquee pauseOnHover={true} reverse={true} duration={40}>
  {#each features as feature}
    <div class="feature-badge">{feature}</div>
  {/each}
</Marquee>`}</code
						></pre>
				</details>
			</div>
		</section>

		<!-- Interactive Marquee Section -->
		<section class="variant-section interactive">
			<div class="variant-header">
				<h2>
					<span class="variant-icon">👆</span>
					Interactive Marquee
				</h2>
				<div class="variant-badges">
					<span class="badge badge-interactive">Click & Drag</span>
					<span class="badge badge-momentum">Momentum</span>
				</div>
			</div>
			<p class="variant-description">
				Click-and-drag control with momentum scrolling. Built with pure Svelte and native DOM APIs
				for smooth physics-based animations. Users can control speed and direction by dragging.
			</p>

			<!-- Product Showcase Example -->
			<div class="demo-section">
				<div class="section-header">
					<h3>Product Showcase</h3>
					<div class="badge badge-interactive">Interactive</div>
				</div>

				<p class="description">
					Drag left or right to browse products at your own pace. Release to continue scrolling in
					that direction.
				</p>

				<div class="demo-container">
					<MarqueeDraggable duration={30} dragMomentum={true}>
						{#each products as product}
							<div class="product-card">
								<div class="product-emoji">{product.emoji}</div>
								<p class="product-name">{product.name}</p>
							</div>
						{/each}
					</MarqueeDraggable>
				</div>

				<details class="code-block">
					<summary>View Code Example</summary>
					<pre><code
							>{`<script>
  import MarqueeDraggable from '$lib/components/MarqueeDraggable.svelte';

  const products = [
    { emoji: '⌚', name: 'Smartwatch' },
    { emoji: '🎧', name: 'Headphones' },
    // ... more products
  ];
</script>

<MarqueeDraggable duration={30} dragMomentum={true}>
  {#each products as product}
    <div class="product-card">
      <div class="product-emoji">{product.emoji}</div>
      <p class="product-name">{product.name}</p>
    </div>
  {/each}
</MarqueeDraggable>`}</code
						></pre>
				</details>
			</div>

			<!-- Testimonials Example -->
			<div class="demo-section">
				<div class="section-header">
					<h3>Customer Testimonials</h3>
					<div class="badge">Slow Scroll</div>
				</div>

				<p class="description">
					Drag to pause and read testimonials. Slower animation speed for better readability.
				</p>

				<div class="demo-container">
					<MarqueeDraggable duration={50} dragMomentum={true}>
						{#each testimonialsInteractive as testimonial}
							<div class="testimonial-card">
								<div class="avatar">{testimonial.avatar}</div>
								<p class="quote">"{testimonial.quote}"</p>
								<div class="author">
									<strong>{testimonial.name}</strong>
									<span class="role">{testimonial.role} at {testimonial.company}</span>
								</div>
							</div>
						{/each}
					</MarqueeDraggable>
				</div>

				<details class="code-block">
					<summary>View Code Example</summary>
					<pre><code
							>{`<MarqueeDraggable duration={50} dragMomentum={true}>
  {#each testimonials as testimonial}
    <div class="testimonial-card">
      <div class="avatar">{testimonial.avatar}</div>
      <p class="quote">"{testimonial.quote}"</p>
      <div class="author">
        <strong>{testimonial.name}</strong>
        <span class="role">{testimonial.role}</span>
      </div>
    </div>
  {/each}
</MarqueeDraggable>`}</code
						></pre>
				</details>
			</div>

			<!-- Features Banner -->
			<div class="demo-section">
				<div class="section-header">
					<h3>Features Banner</h3>
					<div class="badge badge-fast">Fast Scroll</div>
				</div>

				<p class="description">
					Fast-scrolling feature badges. Starts scrolling right, drag to change direction.
				</p>

				<div class="demo-container">
					<MarqueeDraggable duration={20} reverse={true} dragMomentum={true}>
						{#each featuresInteractive as feature}
							<div class="feature-badge interactive">{feature}</div>
						{/each}
					</MarqueeDraggable>
				</div>

				<details class="code-block">
					<summary>View Code Example</summary>
					<pre><code
							>{`<MarqueeDraggable duration={20} reverse={true} dragMomentum={true}>
  {#each features as feature}
    <div class="feature-badge">{feature}</div>
  {/each}
</MarqueeDraggable>`}</code
						></pre>
				</details>
			</div>
		</section>

		<!-- Comparison Section -->
		<section class="comparison-section">
			<h2>Choosing the Right Variant</h2>
			<div class="comparison-grid">
				<div class="comparison-card">
					<h3>
						<span class="variant-icon">⏸️</span>
						Static Marquee
					</h3>
					<ul>
						<li><strong>Dependencies:</strong> Zero - pure CSS</li>
						<li><strong>Interaction:</strong> Pause on hover</li>
						<li><strong>Performance:</strong> Extremely lightweight</li>
						<li><strong>Best for:</strong> Simple scrolling content, logos, testimonials</li>
						<li><strong>File size:</strong> ~2KB</li>
					</ul>
				</div>
				<div class="comparison-card">
					<h3>
						<span class="variant-icon">👆</span>
						Interactive Marquee
					</h3>
					<ul>
						<li><strong>Dependencies:</strong> None - pure Svelte</li>
						<li><strong>Interaction:</strong> Click-and-drag control with momentum</li>
						<li><strong>Performance:</strong> GPU-accelerated with requestAnimationFrame</li>
						<li><strong>Best for:</strong> Product showcases, interactive galleries</li>
						<li><strong>File size:</strong> ~8KB</li>
					</ul>
				</div>
			</div>
		</section>

		<!-- Combined Features Grid -->
		<section class="features-section">
			<h2>Features</h2>
			<div class="features-grid">
				<div class="feature">
					<div class="feature-icon">🔄</div>
					<h3>Infinite Loop</h3>
					<p>Seamless continuous scrolling with perfect loop animation</p>
				</div>
				<div class="feature">
					<div class="feature-icon">⏸️</div>
					<h3>Pause on Hover</h3>
					<p>Static variant pauses when users hover to read content</p>
				</div>
				<div class="feature">
					<div class="feature-icon">👆</div>
					<h3>Click & Drag</h3>
					<p>Interactive variant lets users control speed and direction by dragging</p>
				</div>
				<div class="feature">
					<div class="feature-icon">↔️</div>
					<h3>Direction Control</h3>
					<p>Scroll left or right with the reverse prop</p>
				</div>
				<div class="feature">
					<div class="feature-icon">⚡</div>
					<h3>Configurable Speed</h3>
					<p>Adjust scrolling speed with duration prop</p>
				</div>
				<div class="feature">
					<div class="feature-icon">🚀</div>
					<h3>GPU Accelerated</h3>
					<p>Smooth 60fps animation using CSS transforms</p>
				</div>
			</div>
		</section>

		<!-- Implementation Guide -->
		<section class="guide-section">
			<h2>Quick Start Guide</h2>

			<div class="guide-step">
				<div class="step-number">1</div>
				<div class="step-content">
					<h3>Choose Your Variant</h3>
					<p>
						Use <code>Marquee.svelte</code> for simple hover-to-pause functionality, or
						<code>MarqueeDraggable.svelte</code> for interactive click-and-drag control.
					</p>
				</div>
			</div>

			<div class="guide-step">
				<div class="step-number">2</div>
				<div class="step-content">
					<h3>Copy the Component</h3>
					<p>
						Copy your chosen component from <code>src/lib/components/</code> to your project. Both components
						are pure Svelte with no external dependencies required.
							</p>
				</div>
			</div>

			<div class="guide-step">
				<div class="step-number">3</div>
				<div class="step-content">
					<h3>Configure & Use</h3>
					<p>
						Both components accept <code>duration</code> and <code>reverse</code> props. Static marquee
						has <code>pauseOnHover</code>, Interactive has <code>dragEnabled</code> and
						<code>dragMomentum</code>.
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
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
	}

	/* Variant Sections */
	.variant-section {
		margin-bottom: 5rem;
		padding: 3rem;
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		border-radius: 24px;
		border: 2px solid #e2e8f0;
	}

	.variant-section.interactive {
		background: linear-gradient(135deg, #ebf4ff 0%, #e9d5ff 100%);
		border-color: #c7d2fe;
	}

	.variant-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.variant-header h2 {
		font-size: 2.25rem;
		font-weight: 700;
		color: #1a202c;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: 0;
	}

	.variant-icon {
		font-size: 2.5rem;
	}

	.variant-badges {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.variant-description {
		font-size: 1.125rem;
		color: #4a5568;
		line-height: 1.6;
		margin-bottom: 3rem;
	}

	/* Demo Sections */
	.demo-section {
		margin-bottom: 3rem;
		padding: 2rem;
		background: white;
		border-radius: 16px;
		border: 2px solid #e2e8f0;
	}

	.demo-section:last-child {
		margin-bottom: 0;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	h3 {
		font-size: 1.5rem;
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

	.badge-css {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
	}

	.badge-static {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		color: white;
	}

	.badge-fast {
		background: linear-gradient(135deg, #146ef5 0%, #667eea 100%);
		color: white;
	}

	.badge-reverse {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.badge-interactive {
		background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
		color: white;
	}

	.badge-momentum {
		background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
		color: white;
	}

	.description {
		font-size: 1rem;
		color: #4a5568;
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	/* Demo Container */
	.demo-container {
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		border-radius: 16px;
		padding: 3rem 0;
		margin-bottom: 2rem;
		overflow: hidden;
	}

	/* Testimonial Cards */
	:global(.testimonial-card) {
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		padding: 2rem;
		min-width: 350px;
		max-width: 350px;
	}

	:global(.testimonial-card .avatar) {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	:global(.testimonial-card .quote) {
		font-size: 0.95rem;
		color: #4a5568;
		line-height: 1.6;
		margin: 0 0 1.5rem 0;
		font-style: italic;
	}

	:global(.testimonial-card .author) {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	:global(.testimonial-card .author strong) {
		color: #1a202c;
		font-size: 1rem;
	}

	:global(.testimonial-card .role) {
		color: #718096;
		font-size: 0.875rem;
	}

	/* Logo Cards */
	:global(.logo-card) {
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		padding: 2rem 3rem;
		font-size: 1.5rem;
		font-weight: 600;
		color: #1a202c;
		white-space: nowrap;
	}

	/* Feature Badges */
	:global(.feature-badge) {
		background: linear-gradient(135deg, #146ef5 0%, #667eea 100%);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 9999px;
		font-weight: 600;
		font-size: 1rem;
		white-space: nowrap;
	}

	:global(.feature-badge.interactive) {
		background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
	}

	/* Product Cards */
	.product-card {
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		padding: 2rem 1.5rem;
		min-width: 160px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s;
	}

	.product-card:hover {
		transform: translateY(-4px);
	}

	.product-emoji {
		font-size: 3rem;
	}

	.product-name {
		font-weight: 600;
		color: #2d3748;
		font-size: 1rem;
		margin: 0;
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

	/* Comparison Section */
	.comparison-section {
		margin: 4rem 0;
		padding: 3rem;
		background: white;
		border-radius: 24px;
		border: 2px solid #e2e8f0;
	}

	.comparison-section h2 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 2rem 0;
		color: #1a202c;
		text-align: center;
	}

	.comparison-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.comparison-card {
		padding: 2rem;
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		border-radius: 16px;
		border: 2px solid #e2e8f0;
	}

	.comparison-card h3 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.comparison-card ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.comparison-card li {
		padding: 0.75rem 0;
		color: #4a5568;
		line-height: 1.6;
		border-bottom: 1px solid #e2e8f0;
	}

	.comparison-card li:last-child {
		border-bottom: none;
	}

	/* Features Section */
	.features-section {
		margin: 4rem 0;
	}

	.features-section h2 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 2rem 0;
		color: #1a202c;
		text-align: center;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
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

	.guide-section h2 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 2rem 0;
		color: #1a202c;
		text-align: center;
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

		.variant-header h2 {
			font-size: 1.75rem;
		}

		.variant-section {
			padding: 2rem 1.5rem;
		}

		.demo-section {
			padding: 1.5rem;
		}

		.demo-container {
			padding: 2rem 0;
		}

		:global(.testimonial-card) {
			min-width: 280px;
			max-width: 280px;
			padding: 1.5rem;
		}

		.features-grid {
			grid-template-columns: 1fr;
		}

		.guide-step {
			flex-direction: column;
			gap: 1rem;
		}

		.comparison-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
