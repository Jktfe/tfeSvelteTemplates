<script lang="ts">
	/**
	 * ScratchToReveal Demo Page
	 *
	 * This page demonstrates the ScratchToReveal component with multiple examples:
	 * - Basic text reveal with progress bar
	 * - Image texture (lottery card style)
	 * - Coupon code reveal (promotional use case)
	 * - Custom styling variations
	 * - Features grid
	 * - Props reference
	 * - Use cases
	 *
	 * Serves as both a functional demo and documentation for developers.
	 */

	import ScratchToReveal from '$lib/components/ScratchToReveal.svelte';

	let copiedCouponCode = $state(false);

	function copyCouponCode() {
		navigator.clipboard.writeText('SAVE50');
		copiedCouponCode = true;
		setTimeout(() => (copiedCouponCode = false), 2000);
	}
</script>

<svelte:head>
	<title>ScratchToReveal Component | TFE Svelte Templates</title>
	<meta
		name="description"
		content="Interactive scratch-off component revealing hidden content with HTML5 Canvas and zero dependencies"
	/>
</svelte:head>

<div class="page-container">
	<!-- Page Header -->
	<header class="page-header">
		<h1 class="page-title">🎫 ScratchToReveal Component</h1>
		<p class="page-description">
			Create interactive scratch-off experiences revealing hidden content underneath. Perfect for
			gamification, marketing promotions, interactive content, and educational applications. Built
			with HTML5 Canvas and pure native implementation for zero dependencies.
		</p>
	</header>

	<!-- Basic Text Reveal Example -->
	<section class="demo-section">
		<h2 class="section-title">Basic Text Reveal</h2>
		<p class="section-description">
			Simple scratch surface with text overlay and progress bar. Auto-reveals at 70% threshold.
			Demonstrates core functionality with minimal configuration.
		</p>
		<div class="demo-container">
			<ScratchToReveal
				scratchText="Scratch Here!"
				showProgress={true}
				revealThreshold={70}
				width={400}
				height={300}
			>
				<div class="prize-content">
					<div class="prize-emoji">🎉</div>
					<h3 class="prize-title">Congratulations!</h3>
					<p class="prize-text">You've revealed the hidden message!</p>
				</div>
			</ScratchToReveal>
		</div>
		<div class="code-example">
			<pre><code>{`<ScratchToReveal
  scratchText="Scratch Here!"
  showProgress={true}
  revealThreshold={70}
  width={400}
  height={300}
>
  <div class="prize-content">
    <h3>Congratulations!</h3>
    <p>You've revealed the hidden message!</p>
  </div>
</ScratchToReveal>`}</code></pre>
		</div>
	</section>

	<!-- Image Texture Example -->
	<section class="demo-section">
		<h2 class="section-title">Lottery Card Style</h2>
		<p class="section-description">
			Custom scratch surface with lottery ticket appearance. Shows how gamified experiences can be
			created with visual textures. Uses a solid grey surface to simulate metallic coating.
		</p>
		<div class="demo-container">
			<ScratchToReveal
				scratchText="🎰 SCRATCH TO WIN 🎰"
				scratchColor="#c0c0c0"
				scratchTextColor="#333333"
				scratchTextSize="20px"
				brushSize={50}
				width={400}
				height={300}
			>
				<div class="lottery-content">
					<div class="lottery-header">🎊 WINNER! 🎊</div>
					<div class="lottery-prize">£50</div>
					<div class="lottery-subtext">Prize Money</div>
				</div>
			</ScratchToReveal>
		</div>
		<div class="code-example">
			<pre><code>{`<ScratchToReveal
  scratchText="🎰 SCRATCH TO WIN 🎰"
  scratchColor="#c0c0c0"
  scratchTextColor="#333333"
  brushSize={50}
  width={400}
  height={300}
>
  <div class="lottery-content">
    <div class="lottery-header">🎊 WINNER! 🎊</div>
    <div class="lottery-prize">£50</div>
  </div>
</ScratchToReveal>`}</code></pre>
		</div>
	</section>

	<!-- Coupon Code Reveal -->
	<section class="demo-section">
		<h2 class="section-title">Promotional Coupon Code</h2>
		<p class="section-description">
			Marketing use case with coupon code reveal and copy functionality. Demonstrates custom
			revealed content with interactive elements.
		</p>
		<div class="demo-container">
			<ScratchToReveal
				scratchText="SCRATCH FOR DISCOUNT!"
				scratchColor="#ff6b6b"
				scratchTextColor="#ffffff"
				scratchTextSize="18px"
				width={400}
				height={300}
			>
				<div class="coupon-content">
					<div class="coupon-badge">50% OFF</div>
					<div class="coupon-code">SAVE50</div>
					<p class="coupon-text">Limited Time Offer</p>
					<button class="copy-button" onclick={copyCouponCode}>
						{copiedCouponCode ? '✓ Copied!' : 'Copy Code'}
					</button>
				</div>
			</ScratchToReveal>
		</div>
		<div class="code-example">
			<pre><code>{`<ScratchToReveal
  scratchText="SCRATCH FOR DISCOUNT!"
  scratchColor="#ff6b6b"
  scratchTextColor="#ffffff"
  width={400}
  height={300}
>
  <div class="coupon-content">
    <div class="coupon-badge">50% OFF</div>
    <div class="coupon-code">SAVE50</div>
    <button onclick={copyCouponCode}>Copy Code</button>
  </div>
</ScratchToReveal>`}</code></pre>
		</div>
	</section>

	<!-- Custom Styling Examples -->
	<section class="demo-section">
		<h2 class="section-title">Customization Options</h2>
		<p class="section-description">
			Customise colours, brush sizes, shapes, and behaviors to match your design system.
		</p>

		<div class="customization-grid">
			<!-- Large Brush -->
			<div class="custom-demo">
				<h3 class="custom-title">Large Brush (60px)</h3>
				<ScratchToReveal scratchText="Easy Mode!" brushSize={60} width={280} height={200}>
					<div class="simple-content">
						<p style="font-size: 2rem;">🌟</p>
						<p style="font-weight: 600;">Revealed!</p>
					</div>
				</ScratchToReveal>
			</div>

			<!-- Square Brush -->
			<div class="custom-demo">
				<h3 class="custom-title">Square Brush</h3>
				<ScratchToReveal
					scratchText="Pixelated"
					brushShape="square"
					brushSize={40}
					width={280}
					height={200}
				>
					<div class="simple-content">
						<p style="font-size: 2rem;">⬛</p>
						<p style="font-weight: 600;">Blocky!</p>
					</div>
				</ScratchToReveal>
			</div>

			<!-- Custom Colors -->
			<div class="custom-demo">
				<h3 class="custom-title">Custom Colors</h3>
				<ScratchToReveal
					scratchColor="#8b5cf6"
					scratchText="Purple!"
					scratchTextColor="#ffffff"
					width={280}
					height={200}
				>
					<div class="simple-content">
						<p style="font-size: 2rem;">💜</p>
						<p style="font-weight: 600;">Violet</p>
					</div>
				</ScratchToReveal>
			</div>

			<!-- Manual Reveal -->
			<div class="custom-demo">
				<h3 class="custom-title">Manual Reveal</h3>
				<ScratchToReveal
					scratchText="No Auto!"
					autoReveal={false}
					showProgress={true}
					width={280}
					height={200}
				>
					<div class="simple-content">
						<p style="font-size: 2rem;">⏸️</p>
						<p style="font-weight: 600;">Manual</p>
					</div>
				</ScratchToReveal>
			</div>
		</div>
	</section>

	<!-- Features Grid -->
	<section class="features-section">
		<h2 class="section-title">Component Features</h2>
		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">🎨</div>
				<h3 class="feature-title">Fully Customisable</h3>
				<p class="feature-text">
					Configure colours, textures, text, brush size, and behaviours via props. Supports both
					solid colours and image textures for scratch surfaces.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">⚡</div>
				<h3 class="feature-title">60fps Performance</h3>
				<p class="feature-text">
					RAF-based drawing with pixel sampling provides smooth scratching at 60fps even on mobile
					devices. Optimised for low CPU usage.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">📱</div>
				<h3 class="feature-title">Touch Optimised</h3>
				<p class="feature-text">
					Unified pointer events work with mouse, touch, and pen input. Touch-action CSS prevents
					page scrolling during scratch interaction.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">🔌</div>
				<h3 class="feature-title">Zero Dependencies</h3>
				<p class="feature-text">
					Pure HTML5 Canvas implementation with no external libraries. Fully self-contained and
					copy-paste ready to any project.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">♿</div>
				<h3 class="feature-title">Accessible</h3>
				<p class="feature-text">
					Keyboard shortcuts (Space/Enter to skip, 'r' to reset), ARIA labels, live regions for
					screen readers, and skip button for non-mouse users.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">🎯</div>
				<h3 class="feature-title">TypeScript Ready</h3>
				<p class="feature-text">
					Fully typed props with comprehensive interfaces. Svelte 5 snippets for revealed content
					with type safety.
				</p>
			</div>
		</div>
	</section>

	<!-- Props Reference -->
	<section class="props-section">
		<h2 class="section-title">Props Reference</h2>
		<div class="props-table-wrapper">
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
						<td><code>scratchColor</code></td>
						<td>string</td>
						<td>'#999999'</td>
						<td>Scratch surface colour</td>
					</tr>
					<tr>
						<td><code>scratchImage</code></td>
						<td>string</td>
						<td>undefined</td>
						<td>Optional texture image URL for scratch surface</td>
					</tr>
					<tr>
						<td><code>scratchText</code></td>
						<td>string</td>
						<td>undefined</td>
						<td>Overlay text on scratch surface</td>
					</tr>
					<tr>
						<td><code>scratchTextColor</code></td>
						<td>string</td>
						<td>'#ffffff'</td>
						<td>Colour of overlay text</td>
					</tr>
					<tr>
						<td><code>scratchTextSize</code></td>
						<td>string</td>
						<td>'24px'</td>
						<td>Font size of overlay text</td>
					</tr>
					<tr>
						<td><code>revealThreshold</code></td>
						<td>number</td>
						<td>70</td>
						<td>Percentage scratched to trigger auto-reveal (0-100)</td>
					</tr>
					<tr>
						<td><code>autoReveal</code></td>
						<td>boolean</td>
						<td>true</td>
						<td>Automatically reveal when threshold reached</td>
					</tr>
					<tr>
						<td><code>brushSize</code></td>
						<td>number</td>
						<td>40</td>
						<td>Size of scratch brush in pixels</td>
					</tr>
					<tr>
						<td><code>brushShape</code></td>
						<td>'circle' | 'square'</td>
						<td>'circle'</td>
						<td>Shape of scratch brush</td>
					</tr>
					<tr>
						<td><code>width</code></td>
						<td>number | 'auto'</td>
						<td>'auto'</td>
						<td>Canvas width in pixels or 'auto' to match content</td>
					</tr>
					<tr>
						<td><code>height</code></td>
						<td>number | 'auto'</td>
						<td>'auto'</td>
						<td>Canvas height in pixels or 'auto' to match content</td>
					</tr>
					<tr>
						<td><code>showProgress</code></td>
						<td>boolean</td>
						<td>false</td>
						<td>Show progress bar indicator</td>
					</tr>
					<tr>
						<td><code>progressColor</code></td>
						<td>string</td>
						<td>'#3b82f6'</td>
						<td>Colour of progress bar</td>
					</tr>
					<tr>
						<td><code>allowReset</code></td>
						<td>boolean</td>
						<td>true</td>
						<td>Show reset button after reveal</td>
					</tr>
					<tr>
						<td><code>resetButtonText</code></td>
						<td>string</td>
						<td>'Reset'</td>
						<td>Text for reset button</td>
					</tr>
					<tr>
						<td><code>skipText</code></td>
						<td>string</td>
						<td>'Skip'</td>
						<td>Text for skip button</td>
					</tr>
					<tr>
						<td><code>onReveal</code></td>
						<td>() => void</td>
						<td>undefined</td>
						<td>Callback fired when content is fully revealed</td>
					</tr>
					<tr>
						<td><code>onProgress</code></td>
						<td>(percentage) => void</td>
						<td>undefined</td>
						<td>Callback fired with scratch percentage (0-100)</td>
					</tr>
					<tr>
						<td><code>disabled</code></td>
						<td>boolean</td>
						<td>false</td>
						<td>Disable scratching interaction</td>
					</tr>
					<tr>
						<td><code>class</code></td>
						<td>string</td>
						<td>''</td>
						<td>Additional CSS classes for container</td>
					</tr>
					<tr>
						<td><code>children</code></td>
						<td>Snippet</td>
						<td>undefined</td>
						<td>Svelte 5 snippet for revealed content</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<!-- Use Cases -->
	<section class="use-cases-section">
		<h2 class="section-title">Use Cases</h2>
		<div class="use-cases-grid">
			<div class="use-case">
				<div class="use-case-icon">🎮</div>
				<h3 class="use-case-title">Gamification</h3>
				<p class="use-case-text">
					Lottery cards, scratch prizes, mystery reveals, and interactive games that engage users
					through tactile interaction.
				</p>
			</div>
			<div class="use-case">
				<div class="use-case-icon">🎁</div>
				<h3 class="use-case-title">Marketing</h3>
				<p class="use-case-text">
					Coupon codes, promotional offers, discount reveals, and flash sales that create excitement
					and increase conversion rates.
				</p>
			</div>
			<div class="use-case">
				<div class="use-case-icon">✨</div>
				<h3 class="use-case-title">Interactive Content</h3>
				<p class="use-case-text">
					Hidden messages, easter eggs, progressive disclosure, and surprise content that keeps users
					engaged and exploring.
				</p>
			</div>
			<div class="use-case">
				<div class="use-case-icon">📚</div>
				<h3 class="use-case-title">Education</h3>
				<p class="use-case-text">
					Quiz answers, learning reveals, memory games, and interactive lessons that make education
					fun and engaging.
				</p>
			</div>
		</div>
	</section>
</div>

<style>
	/* Page Container */
	.page-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 2rem;
	}

	/* Page Header */
	.page-header {
		text-align: center;
		margin-bottom: 4rem;
	}

	.page-title {
		font-size: 3rem;
		font-weight: 800;
		color: #111827;
		margin: 0 0 1rem 0;
		line-height: 1.2;
	}

	.page-description {
		font-size: 1.125rem;
		color: #6b7280;
		line-height: 1.75;
		margin: 0;
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
	}

	/* Demo Sections */
	.demo-section {
		margin-bottom: 4rem;
	}

	.section-title {
		font-size: 2rem;
		font-weight: 700;
		color: #111827;
		margin: 0 0 0.75rem 0;
	}

	.section-description {
		font-size: 1rem;
		color: #6b7280;
		line-height: 1.75;
		margin: 0 0 2rem 0;
		max-width: 800px;
	}

	.demo-container {
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		border-radius: 16px;
		padding: 3rem 2rem;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 400px;
		margin-bottom: 1.5rem;
	}

	/* Code Examples */
	.code-example {
		background-color: #1f2937;
		border-radius: 8px;
		padding: 1.5rem;
		overflow-x: auto;
	}

	.code-example pre {
		margin: 0;
		font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
		line-height: 1.7;
	}

	.code-example code {
		color: #e5e7eb;
	}

	/* Customization Grid */
	.customization-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
	}

	.custom-demo {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 16px;
		padding: 2rem 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 300px;
	}

	.custom-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: white;
		margin: 0 0 1.5rem 0;
		text-align: center;
	}

	/* Prize Content Styles */
	.prize-content {
		text-align: center;
		padding: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 12px;
		color: white;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.prize-emoji {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.prize-title {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
	}

	.prize-text {
		font-size: 1.125rem;
		margin: 0;
		opacity: 0.9;
	}

	/* Lottery Content Styles */
	.lottery-content {
		text-align: center;
		padding: 2rem;
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		border-radius: 12px;
		color: white;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.lottery-header {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 1rem;
	}

	.lottery-prize {
		font-size: 4rem;
		font-weight: 900;
		margin: 0.5rem 0;
	}

	.lottery-subtext {
		font-size: 1.125rem;
		opacity: 0.9;
	}

	/* Coupon Content Styles */
	.coupon-content {
		text-align: center;
		padding: 2rem;
		background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
		border-radius: 12px;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.coupon-badge {
		background-color: rgba(255, 255, 255, 0.3);
		border: 2px solid white;
		border-radius: 50px;
		padding: 0.5rem 1.5rem;
		font-size: 1.5rem;
		font-weight: 800;
		color: white;
		margin-bottom: 1rem;
	}

	.coupon-code {
		font-size: 3rem;
		font-weight: 900;
		color: white;
		letter-spacing: 0.1em;
		margin: 1rem 0;
		font-family: 'Courier New', monospace;
	}

	.coupon-text {
		font-size: 1.125rem;
		color: white;
		margin: 0.5rem 0 1.5rem 0;
	}

	.copy-button {
		background-color: white;
		color: #fa709a;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 2rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.copy-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.copy-button:active {
		transform: translateY(0);
	}

	/* Simple Content Styles */
	.simple-content {
		text-align: center;
		padding: 2rem;
		background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
		border-radius: 12px;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	/* Features Grid */
	.features-section {
		margin-bottom: 4rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
	}

	.feature-card {
		background-color: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
		transition: all 0.2s ease-in-out;
	}

	.feature-card:hover {
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}

	.feature-text {
		font-size: 0.875rem;
		color: #6b7280;
		line-height: 1.6;
		margin: 0;
	}

	/* Props Table */
	.props-section {
		margin-bottom: 4rem;
	}

	.props-table-wrapper {
		overflow-x: auto;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.props-table {
		width: 100%;
		border-collapse: collapse;
		background-color: white;
	}

	.props-table th {
		background-color: #f9fafb;
		padding: 0.75rem 1rem;
		text-align: left;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		border-bottom: 1px solid #e5e7eb;
	}

	.props-table td {
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: #6b7280;
		border-bottom: 1px solid #f3f4f6;
	}

	.props-table code {
		background-color: #f3f4f6;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-size: 0.8125rem;
		color: #111827;
		font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
	}

	.props-table tbody tr:last-child td {
		border-bottom: none;
	}

	/* Use Cases */
	.use-cases-section {
		margin-bottom: 4rem;
	}

	.use-cases-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.use-case {
		background-color: #f9fafb;
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
	}

	.use-case-icon {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	.use-case-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}

	.use-case-text {
		font-size: 0.875rem;
		color: #6b7280;
		line-height: 1.6;
		margin: 0;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.page-container {
			padding: 2rem 1rem;
		}

		.page-title {
			font-size: 2rem;
		}

		.section-title {
			font-size: 1.5rem;
		}

		.demo-container {
			padding: 2rem 1rem;
			min-height: auto;
		}

		.custom-demo {
			min-height: auto;
			padding: 1.5rem 1rem;
		}

		.customization-grid,
		.features-grid,
		.use-cases-grid {
			grid-template-columns: 1fr;
		}

		.code-example {
			font-size: 0.75rem;
		}

		.prize-emoji,
		.lottery-prize {
			font-size: 3rem;
		}

		.coupon-code {
			font-size: 2rem;
		}
	}
</style>
