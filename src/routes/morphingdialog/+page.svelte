<!--
	MorphingDialog Component Demo Page

	Demonstrates the MorphingDialog component with various trigger types
	and content configurations. Shows the shared-element morph transition
	in action with different visual styles.
-->

<script lang="ts">
	import MorphingDialog from '$lib/components/MorphingDialog.svelte';
</script>

<svelte:head>
	<title>MorphingDialog Component - Svelte 5 Templates</title>
	<meta
		name="description"
		content="Shared-element transition dialog that morphs from trigger to full modal for Svelte 5"
	/>
</svelte:head>

<div class="page">
	<div class="container">
		<!-- Header Section -->
		<header>
			<h1>🪄 MorphingDialog Component</h1>
			<p class="subtitle">
				A modal that morphs seamlessly from the trigger element into a full dialog overlay.
				Click any card below to see the shared-element transition in action.
			</p>
		</header>

		<!-- Demo 1: Card Trigger -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Card Trigger</h2>
			</div>
			<p class="description">
				Click the card to see it morph into a full dialog. The dialog expands from the card's
				exact position and size, giving spatial context to where the content came from.
			</p>

			<div class="demo-container">
				<MorphingDialog>
					{#snippet trigger(props)}
						<button class="card-trigger" {...props}>
							<div class="card-trigger__image">
								<svg viewBox="0 0 400 200" width="100%" height="160" aria-hidden="true">
									<defs>
										<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
											<stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
										</linearGradient>
									</defs>
									<rect width="400" height="200" fill="url(#grad1)" rx="0"/>
									<text x="200" y="105" text-anchor="middle" fill="white" font-size="20" font-family="system-ui">Click to expand</text>
								</svg>
							</div>
							<div class="card-trigger__body">
								<h3>Project Update</h3>
								<p>Q4 performance metrics and roadmap changes...</p>
							</div>
						</button>
					{/snippet}

					<div class="dialog-content">
						<h2>Project Update — Q4 2025</h2>
						<p>
							This is the expanded dialog content that morphed from the card.
							Notice how the transition felt natural — the card appeared to grow
							into this dialog, maintaining spatial context.
						</p>
						<h3>Key Metrics</h3>
						<ul>
							<li>Revenue: <strong>£2.4M</strong> (+18% QoQ)</li>
							<li>Active Users: <strong>45,200</strong> (+12% QoQ)</li>
							<li>Retention: <strong>94.2%</strong> (stable)</li>
							<li>NPS: <strong>72</strong> (+5 points)</li>
						</ul>
						<h3>Roadmap Changes</h3>
						<p>
							We're shifting focus from feature expansion to platform stability
							in Q1 2026. The engineering team will prioritise performance
							optimisation and accessibility improvements across all components.
						</p>
					</div>
				</MorphingDialog>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<MorphingDialog>
  {#snippet trigger(props)}
    <button class="card" {...props}>
      <h3>Project Update</h3>
      <p>Click to expand...</p>
    </button>
  {/snippet}

  <div class="content">
    <h2>Full Details</h2>
    <p>Expanded content here...</p>
  </div>
</MorphingDialog>`}</code></pre>
			</details>
		</section>

		<!-- Demo 2: Button Trigger -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Button Trigger</h2>
			</div>
			<p class="description">
				A simple button that morphs into a confirmation dialog. Great for actions
				that need user confirmation with a premium feel.
			</p>

			<div class="demo-container">
				<MorphingDialog dialogWidth="420px" borderRadius="12px">
					{#snippet trigger(props)}
						<button class="btn-trigger" {...props}>
							Delete Account
						</button>
					{/snippet}

					<div class="dialog-content dialog-content--compact">
						<div class="confirm-icon">
							<svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
								<circle cx="24" cy="24" r="22" stroke="#ef4444" stroke-width="2.5" fill="#fef2f2"/>
								<path d="M24 14v12M24 30v4" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
							</svg>
						</div>
						<h2 class="confirm-title">Delete your account?</h2>
						<p class="confirm-text">
							This action is permanent and cannot be undone. All your data,
							projects, and settings will be permanently removed.
						</p>
						<div class="confirm-actions">
							<button class="btn btn--secondary">Cancel</button>
							<button class="btn btn--danger">Yes, delete</button>
						</div>
					</div>
				</MorphingDialog>
			</div>
		</section>

		<!-- Demo 3: Image Lightbox -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Image Lightbox</h2>
			</div>
			<p class="description">
				Click a thumbnail to expand it into a lightbox. The morph creates a smooth
				zoom effect from the thumbnail's position.
			</p>

			<div class="demo-container demo-container--grid">
				<MorphingDialog dialogWidth="700px" overlayBlur={8}>
					{#snippet trigger(props)}
						<button class="thumb-trigger" {...props}>
							<svg viewBox="0 0 300 200" width="100%" height="140" aria-hidden="true">
								<defs>
									<linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
										<stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
									</linearGradient>
								</defs>
								<rect width="300" height="200" fill="url(#grad2)" rx="8"/>
								<text x="150" y="95" text-anchor="middle" fill="white" font-size="36" font-family="system-ui">🏔️</text>
								<text x="150" y="125" text-anchor="middle" fill="white" font-size="14" font-family="system-ui">Mountain Vista</text>
							</svg>
						</button>
					{/snippet}

					<div class="lightbox-content">
						<svg viewBox="0 0 700 400" width="100%" height="auto" aria-hidden="true">
							<defs>
								<linearGradient id="grad2b" x1="0%" y1="0%" x2="100%" y2="100%">
									<stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
									<stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
								</linearGradient>
							</defs>
							<rect width="700" height="400" fill="url(#grad2b)" rx="12"/>
							<text x="350" y="180" text-anchor="middle" fill="white" font-size="72" font-family="system-ui">🏔️</text>
							<text x="350" y="240" text-anchor="middle" fill="white" font-size="24" font-family="system-ui">Mountain Vista — Full Resolution</text>
						</svg>
						<div class="lightbox-caption">
							<h3>Mountain Vista</h3>
							<p>Captured at dawn from the south ridge. The gradient effect simulates
							the warm tones of golden hour lighting.</p>
						</div>
					</div>
				</MorphingDialog>

				<MorphingDialog dialogWidth="700px" overlayBlur={8}>
					{#snippet trigger(props)}
						<button class="thumb-trigger" {...props}>
							<svg viewBox="0 0 300 200" width="100%" height="140" aria-hidden="true">
								<defs>
									<linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
										<stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
									</linearGradient>
								</defs>
								<rect width="300" height="200" fill="url(#grad3)" rx="8"/>
								<text x="150" y="95" text-anchor="middle" fill="white" font-size="36" font-family="system-ui">🌊</text>
								<text x="150" y="125" text-anchor="middle" fill="white" font-size="14" font-family="system-ui">Ocean Waves</text>
							</svg>
						</button>
					{/snippet}

					<div class="lightbox-content">
						<svg viewBox="0 0 700 400" width="100%" height="auto" aria-hidden="true">
							<defs>
								<linearGradient id="grad3b" x1="0%" y1="0%" x2="100%" y2="100%">
									<stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
									<stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
								</linearGradient>
							</defs>
							<rect width="700" height="400" fill="url(#grad3b)" rx="12"/>
							<text x="350" y="180" text-anchor="middle" fill="white" font-size="72" font-family="system-ui">🌊</text>
							<text x="350" y="240" text-anchor="middle" fill="white" font-size="24" font-family="system-ui">Ocean Waves — Full Resolution</text>
						</svg>
						<div class="lightbox-caption">
							<h3>Ocean Waves</h3>
							<p>Turquoise waters meeting the shore. The cool gradient captures
							the transition from deep ocean to shallow reef.</p>
						</div>
					</div>
				</MorphingDialog>
			</div>
		</section>

		<!-- Demo 4: Custom Configuration -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Custom Configuration</h2>
			</div>
			<p class="description">
				Slow morph with custom overlay and dimensions. Shows how to configure
				duration, easing, overlay colour, and dialog sizing.
			</p>

			<div class="demo-container">
				<MorphingDialog
					duration={600}
					easing="cubic-bezier(0.34, 1.56, 0.64, 1)"
					overlayColor="rgba(30, 41, 59, 0.7)"
					overlayBlur={12}
					dialogWidth="480px"
					borderRadius="24px"
				>
					{#snippet trigger(props)}
						<button class="fancy-trigger" {...props}>
							<span class="fancy-trigger__icon">✨</span>
							<span class="fancy-trigger__text">Slow & Springy</span>
						</button>
					{/snippet}

					<div class="dialog-content dialog-content--centered">
						<div class="success-icon">🎉</div>
						<h2>Custom Animation!</h2>
						<p>
							This dialog uses a slower 600ms duration with a springy easing curve
							(<code>cubic-bezier(0.34, 1.56, 0.64, 1)</code>), a darker overlay
							with more blur, and a rounder border radius.
						</p>
						<p class="muted">
							Adjust <code>duration</code>, <code>easing</code>, <code>overlayColor</code>,
							<code>overlayBlur</code>, <code>dialogWidth</code>, and <code>borderRadius</code>
							props to customise the morph to your design system.
						</p>
					</div>
				</MorphingDialog>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<MorphingDialog
  duration={600}
  easing="cubic-bezier(0.34, 1.56, 0.64, 1)"
  overlayColor="rgba(30, 41, 59, 0.7)"
  overlayBlur={12}
  dialogWidth="480px"
  borderRadius="24px"
>
  {#snippet trigger(props)}
    <button {...props}>Open</button>
  {/snippet}

  <div>Custom dialog content</div>
</MorphingDialog>`}</code></pre>
			</details>
		</section>

		<!-- Props Reference -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Props Reference</h2>
			</div>

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
							<td><code>open</code></td>
							<td>boolean</td>
							<td>false</td>
							<td>Dialog open state (bindable)</td>
						</tr>
						<tr>
							<td><code>duration</code></td>
							<td>number</td>
							<td>400</td>
							<td>Morph animation duration in milliseconds</td>
						</tr>
						<tr>
							<td><code>easing</code></td>
							<td>string</td>
							<td><code>cubic-bezier(0.4, 0, 0.2, 1)</code></td>
							<td>CSS transition easing function</td>
						</tr>
						<tr>
							<td><code>overlayColor</code></td>
							<td>string</td>
							<td><code>rgba(0, 0, 0, 0.5)</code></td>
							<td>Overlay background colour</td>
						</tr>
						<tr>
							<td><code>overlayBlur</code></td>
							<td>number</td>
							<td>4</td>
							<td>Backdrop blur amount in pixels</td>
						</tr>
						<tr>
							<td><code>dialogWidth</code></td>
							<td>string</td>
							<td><code>560px</code></td>
							<td>Maximum width of the expanded dialog</td>
						</tr>
						<tr>
							<td><code>dialogHeight</code></td>
							<td>string</td>
							<td><code>auto</code></td>
							<td>Height of the dialog (auto fits content)</td>
						</tr>
						<tr>
							<td><code>borderRadius</code></td>
							<td>string</td>
							<td><code>16px</code></td>
							<td>Border radius of the expanded dialog</td>
						</tr>
						<tr>
							<td><code>closeOnOverlay</code></td>
							<td>boolean</td>
							<td>true</td>
							<td>Close when clicking the overlay</td>
						</tr>
						<tr>
							<td><code>closeOnEscape</code></td>
							<td>boolean</td>
							<td>true</td>
							<td>Close when pressing Escape key</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

		<!-- Accessibility Section -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Accessibility</h2>
			</div>

			<div class="a11y-grid">
				<div class="a11y-card">
					<h3>⌨️ Keyboard</h3>
					<ul>
						<li><kbd>Escape</kbd> closes the dialog</li>
						<li><kbd>Tab</kbd> / <kbd>Shift+Tab</kbd> cycles focus within dialog</li>
						<li>Focus is trapped inside the open dialog</li>
						<li>Focus returns to trigger on close</li>
					</ul>
				</div>
				<div class="a11y-card">
					<h3>🔊 Screen Readers</h3>
					<ul>
						<li><code>role="dialog"</code> with <code>aria-modal="true"</code></li>
						<li>Trigger has <code>aria-expanded</code> and <code>aria-haspopup</code></li>
						<li>Close button has descriptive <code>aria-label</code></li>
					</ul>
				</div>
				<div class="a11y-card">
					<h3>🎥 Motion</h3>
					<ul>
						<li>Respects <code>prefers-reduced-motion</code></li>
						<li>Morph animation skipped entirely when reduced motion is on</li>
						<li>Dialog appears/disappears instantly instead</li>
					</ul>
				</div>
			</div>
		</section>
	</div>
</div>

<style>
	/* ============================================================
	   Page Layout
	   ============================================================ */

	.page {
		padding: 2rem 0 4rem;
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	header {
		margin-bottom: 3rem;
	}

	header h1 {
		font-size: 2.2rem;
		font-weight: 700;
		color: #1a202c;
		margin: 0 0 0.75rem;
	}

	.subtitle {
		font-size: 1.1rem;
		color: #64748b;
		line-height: 1.6;
		margin: 0;
	}

	/* ============================================================
	   Demo Sections
	   ============================================================ */

	.demo-section {
		margin-bottom: 3.5rem;
	}

	.section-header h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.5rem;
	}

	.description {
		color: #64748b;
		line-height: 1.6;
		margin: 0 0 1.5rem;
	}

	.demo-container {
		display: flex;
		gap: 1.5rem;
		align-items: flex-start;
		flex-wrap: wrap;
	}

	.demo-container--grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	}

	/* ============================================================
	   Card Trigger Style
	   ============================================================ */

	.card-trigger {
		display: block;
		width: 320px;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		overflow: hidden;
		background: #ffffff;
		cursor: pointer;
		text-align: left;
		padding: 0;
		transition: box-shadow 0.2s ease, transform 0.2s ease;
		font-family: inherit;
	}

	.card-trigger:hover {
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		transform: translateY(-2px);
	}

	.card-trigger:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.card-trigger__image {
		display: block;
		line-height: 0;
	}

	.card-trigger__body {
		padding: 1rem 1.25rem;
	}

	.card-trigger__body h3 {
		font-size: 1.1rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.25rem;
	}

	.card-trigger__body p {
		font-size: 0.9rem;
		color: #64748b;
		margin: 0;
	}

	/* ============================================================
	   Button Trigger Style
	   ============================================================ */

	.btn-trigger {
		padding: 0.75rem 1.5rem;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.15s ease, transform 0.15s ease;
		font-family: inherit;
	}

	.btn-trigger:hover {
		background: #dc2626;
		transform: scale(1.02);
	}

	.btn-trigger:focus-visible {
		outline: 2px solid #ef4444;
		outline-offset: 3px;
	}

	/* ============================================================
	   Thumbnail Trigger Style
	   ============================================================ */

	.thumb-trigger {
		display: block;
		border: none;
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		padding: 0;
		background: transparent;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		line-height: 0;
	}

	.thumb-trigger:hover {
		transform: scale(1.03);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
	}

	.thumb-trigger:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/* ============================================================
	   Fancy Trigger Style
	   ============================================================ */

	.fancy-trigger {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
		border: none;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		font-family: inherit;
	}

	.fancy-trigger:hover {
		transform: scale(1.05);
		box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
	}

	.fancy-trigger:focus-visible {
		outline: 2px solid #667eea;
		outline-offset: 3px;
	}

	.fancy-trigger__icon {
		font-size: 1.2rem;
	}

	/* ============================================================
	   Dialog Content Styles
	   ============================================================ */

	.dialog-content h2 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 1rem;
	}

	.dialog-content h3 {
		font-size: 1.15rem;
		font-weight: 600;
		color: #334155;
		margin: 1.25rem 0 0.5rem;
	}

	.dialog-content p {
		color: #475569;
		line-height: 1.7;
		margin: 0 0 0.75rem;
	}

	.dialog-content ul {
		color: #475569;
		line-height: 1.8;
		padding-left: 1.25rem;
	}

	.dialog-content--compact {
		text-align: center;
		padding: 1rem 0;
	}

	.dialog-content--centered {
		text-align: center;
	}

	/* Confirmation dialog */
	.confirm-icon {
		margin-bottom: 1rem;
	}

	.confirm-title {
		font-size: 1.3rem;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 0.5rem;
	}

	.confirm-text {
		color: #64748b;
		font-size: 0.95rem;
		line-height: 1.6;
		margin: 0 0 1.5rem;
	}

	.confirm-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
	}

	.btn {
		padding: 0.6rem 1.25rem;
		border: none;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.15s ease;
		font-family: inherit;
	}

	.btn--secondary {
		background: #f1f5f9;
		color: #475569;
	}

	.btn--secondary:hover {
		background: #e2e8f0;
	}

	.btn--danger {
		background: #ef4444;
		color: white;
	}

	.btn--danger:hover {
		background: #dc2626;
	}

	/* Lightbox */
	.lightbox-content {
		padding: 0;
	}

	.lightbox-caption {
		padding: 1rem 1.5rem 0.5rem;
	}

	.lightbox-caption h3 {
		font-size: 1.1rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.25rem;
	}

	.lightbox-caption p {
		color: #64748b;
		font-size: 0.9rem;
		line-height: 1.5;
		margin: 0;
	}

	/* Success/custom dialog */
	.success-icon {
		font-size: 3rem;
		margin-bottom: 0.75rem;
	}

	.muted {
		font-size: 0.85rem;
		color: #94a3b8;
	}

	.muted code {
		background: #f1f5f9;
		padding: 0.15rem 0.35rem;
		border-radius: 4px;
		font-size: 0.8rem;
	}

	/* ============================================================
	   Code Blocks
	   ============================================================ */

	.code-block {
		margin-top: 1.25rem;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		overflow: hidden;
	}

	.code-block summary {
		padding: 0.75rem 1rem;
		background: #f8fafc;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		color: #475569;
		user-select: none;
	}

	.code-block summary:hover {
		background: #f1f5f9;
	}

	.code-block pre {
		margin: 0;
		padding: 1rem;
		background: #1e293b;
		overflow-x: auto;
	}

	.code-block code {
		color: #e2e8f0;
		font-family: 'SF Mono', 'Fira Code', monospace;
		font-size: 0.85rem;
		line-height: 1.6;
	}

	/* ============================================================
	   Props Table
	   ============================================================ */

	.props-table-wrapper {
		overflow-x: auto;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
	}

	.props-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	.props-table th {
		background: #f8fafc;
		padding: 0.75rem 1rem;
		text-align: left;
		font-weight: 600;
		color: #374151;
		border-bottom: 1px solid #e2e8f0;
	}

	.props-table td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #f1f5f9;
		color: #475569;
	}

	.props-table code {
		background: #f1f5f9;
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		font-size: 0.8rem;
	}

	/* ============================================================
	   Accessibility Section
	   ============================================================ */

	.a11y-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.a11y-card {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		padding: 1.25rem;
	}

	.a11y-card h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.75rem;
	}

	.a11y-card ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.a11y-card li {
		font-size: 0.9rem;
		color: #475569;
		line-height: 1.6;
		padding: 0.15rem 0;
	}

	.a11y-card kbd {
		display: inline-block;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		padding: 0.1rem 0.4rem;
		font-size: 0.8rem;
		font-family: 'SF Mono', monospace;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.a11y-card code {
		background: white;
		padding: 0.1rem 0.3rem;
		border-radius: 3px;
		font-size: 0.8rem;
	}

	/* ============================================================
	   Responsive
	   ============================================================ */

	@media (max-width: 640px) {
		header h1 {
			font-size: 1.6rem;
		}

		.card-trigger {
			width: 100%;
		}
	}
</style>
