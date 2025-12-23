<!--
	SpeedDial Component Demo Page

	This page demonstrates the SpeedDial component with various layout types,
	directions, and configurations. Inspired by PrimeReact's SpeedDial but
	built as a native Svelte 5 component with zero dependencies.
-->

<script lang="ts">
	import SpeedDial from '$lib/components/SpeedDial.svelte';
	import type { SpeedDialAction } from '$lib/types';

	// Track which action was last clicked
	let lastAction = $state('');

	// Sample actions with emoji icons
	const basicActions: SpeedDialAction[] = [
		{
			id: 'add',
			label: 'Add Item',
			icon: '➕',
			onclick: () => (lastAction = 'Add Item clicked')
		},
		{
			id: 'edit',
			label: 'Edit',
			icon: '✏️',
			onclick: () => (lastAction = 'Edit clicked')
		},
		{
			id: 'delete',
			label: 'Delete',
			icon: '🗑️',
			onclick: () => (lastAction = 'Delete clicked')
		}
	];

	// Extended actions for circular demos
	const circularActions: SpeedDialAction[] = [
		{ id: 'home', label: 'Home', icon: '🏠', onclick: () => (lastAction = 'Home') },
		{ id: 'search', label: 'Search', icon: '🔍', onclick: () => (lastAction = 'Search') },
		{ id: 'bookmark', label: 'Bookmark', icon: '⭐', onclick: () => (lastAction = 'Bookmark') },
		{ id: 'share', label: 'Share', icon: '🔗', onclick: () => (lastAction = 'Share') },
		{ id: 'settings', label: 'Settings', icon: '⚙️', onclick: () => (lastAction = 'Settings') },
		{ id: 'help', label: 'Help', icon: '❓', onclick: () => (lastAction = 'Help') }
	];

	// Social sharing actions with custom SVG icons
	const socialActions: SpeedDialAction[] = [
		{
			id: 'facebook',
			label: 'Facebook',
			icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>',
			onclick: () => (lastAction = 'Share to Facebook')
		},
		{
			id: 'twitter',
			label: 'Twitter',
			icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>',
			onclick: () => (lastAction = 'Share to Twitter')
		},
		{
			id: 'linkedin',
			label: 'LinkedIn',
			icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>',
			onclick: () => (lastAction = 'Share to LinkedIn')
		},
		{
			id: 'email',
			label: 'Email',
			icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
			onclick: () => (lastAction = 'Share via Email')
		}
	];

	// Custom button icon (hamburger menu)
	const menuIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
</script>

<svelte:head>
	<title>SpeedDial Component - Svelte 5 Templates</title>
	<meta
		name="description"
		content="Floating action button with expandable menu supporting linear, circle, semi-circle, and quarter-circle layouts for Svelte 5"
	/>
</svelte:head>

<div class="page">
	<div class="container">
		<!-- Header Section -->
		<header>
			<h1>🚀 SpeedDial Component</h1>
			<p class="subtitle">
				A floating action button (FAB) with an expandable action menu. Supports multiple layout
				types including linear, circle, semi-circle, and quarter-circle arrangements. Features
				staggered animations, tooltips, and full keyboard accessibility.
			</p>
		</header>

		<!-- Last Action Display -->
		{#if lastAction}
			<div class="action-toast">
				<span>Last action:</span> {lastAction}
			</div>
		{/if}

		<!-- Linear Layout Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Linear Layout</h2>
				<div class="badge">Default</div>
			</div>

			<p class="description">
				Items arranged in a straight line. Choose from four directions: up, down, left, or right.
				Perfect for edge-of-screen positioning.
			</p>

			<div class="demo-container linear-demo">
				<div class="demo-item">
					<div class="demo-area">
						<SpeedDial actions={basicActions} direction="up" />
					</div>
					<p class="label">Direction: Up</p>
				</div>

				<div class="demo-item">
					<div class="demo-area">
						<SpeedDial actions={basicActions} direction="down" />
					</div>
					<p class="label">Direction: Down</p>
				</div>

				<div class="demo-item">
					<div class="demo-area">
						<SpeedDial actions={basicActions} direction="left" />
					</div>
					<p class="label">Direction: Left</p>
				</div>

				<div class="demo-item">
					<div class="demo-area">
						<SpeedDial actions={basicActions} direction="right" />
					</div>
					<p class="label">Direction: Right</p>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<script>
  import SpeedDial from '$lib/components/SpeedDial.svelte';

  const actions = [
    { id: 'add', label: 'Add', icon: '➕', onclick: () => console.log('Add') },
    { id: 'edit', label: 'Edit', icon: '✏️', onclick: () => console.log('Edit') },
    { id: 'delete', label: 'Delete', icon: '🗑️', onclick: () => console.log('Delete') }
  ];
</script>

<SpeedDial {actions} direction="up" />
<SpeedDial {actions} direction="down" />
<SpeedDial {actions} direction="left" />
<SpeedDial {actions} direction="right" />`}</code></pre>
			</details>
		</section>

		<!-- Circle Layout Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Circle Layout</h2>
				<div class="badge">360°</div>
			</div>

			<p class="description">
				Items arranged in a full circle around the button. Great for center-of-screen positioning or
				when you need many actions accessible from all directions.
			</p>

			<div class="demo-container circle-demo">
				<div class="demo-area large">
					<SpeedDial actions={circularActions} type="circle" direction="up" radius={90} />
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<SpeedDial
  actions={actions}
  type="circle"
  direction="up"
  radius={90}
/>`}</code></pre>
			</details>
		</section>

		<!-- Semi-Circle Layout Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Semi-Circle Layout</h2>
				<div class="badge">180°</div>
			</div>

			<p class="description">
				Items arranged in a half-circle. Ideal for edge positioning where the button is near a
				screen boundary.
			</p>

			<div class="demo-container semi-demo">
				<div class="demo-item">
					<div class="demo-area medium">
						<SpeedDial
							actions={circularActions.slice(0, 5)}
							type="semi-circle"
							direction="up"
							radius={80}
						/>
					</div>
					<p class="label">Direction: Up</p>
				</div>

				<div class="demo-item">
					<div class="demo-area medium">
						<SpeedDial
							actions={circularActions.slice(0, 5)}
							type="semi-circle"
							direction="down"
							radius={80}
						/>
					</div>
					<p class="label">Direction: Down</p>
				</div>

				<div class="demo-item">
					<div class="demo-area medium">
						<SpeedDial
							actions={circularActions.slice(0, 5)}
							type="semi-circle"
							direction="left"
							radius={80}
						/>
					</div>
					<p class="label">Direction: Left</p>
				</div>

				<div class="demo-item">
					<div class="demo-area medium">
						<SpeedDial
							actions={circularActions.slice(0, 5)}
							type="semi-circle"
							direction="right"
							radius={80}
						/>
					</div>
					<p class="label">Direction: Right</p>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<SpeedDial
  actions={actions}
  type="semi-circle"
  direction="up"
  radius={80}
/>`}</code></pre>
			</details>
		</section>

		<!-- Quarter-Circle Layout Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Quarter-Circle Layout</h2>
				<div class="badge">90°</div>
			</div>

			<p class="description">
				Items arranged in a quarter-circle arc. Perfect for corner positioning where the button sits
				at the corner of the screen.
			</p>

			<div class="demo-container quarter-demo">
				<div class="quarter-grid">
					<div class="corner top-left">
						<SpeedDial actions={basicActions} type="quarter-circle" direction="down" radius={70} />
						<span class="corner-label">Top-Left Corner</span>
					</div>

					<div class="corner top-right">
						<SpeedDial actions={basicActions} type="quarter-circle" direction="left" radius={70} />
						<span class="corner-label">Top-Right Corner</span>
					</div>

					<div class="corner bottom-left">
						<SpeedDial actions={basicActions} type="quarter-circle" direction="right" radius={70} />
						<span class="corner-label">Bottom-Left Corner</span>
					</div>

					<div class="corner bottom-right">
						<SpeedDial actions={basicActions} type="quarter-circle" direction="up" radius={70} />
						<span class="corner-label">Bottom-Right Corner</span>
					</div>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<!-- Bottom-right corner positioning -->
<div class="fixed bottom-4 right-4">
  <SpeedDial
    actions={actions}
    type="quarter-circle"
    direction="up"
    radius={70}
  />
</div>`}</code></pre>
			</details>
		</section>

		<!-- Mask/Backdrop Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>With Modal Mask</h2>
			</div>

			<p class="description">
				Add a semi-transparent backdrop when the menu is open. Useful for focusing user attention
				and providing a clear dismiss target.
			</p>

			<div class="demo-container">
				<div class="demo-area">
					<SpeedDial actions={basicActions} direction="up" mask={true} />
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<SpeedDial
  actions={actions}
  direction="up"
  mask={true}
/>`}</code></pre>
			</details>
		</section>

		<!-- Custom Icons Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Social Sharing</h2>
				<div class="badge">SVG Icons</div>
			</div>

			<p class="description">
				Use custom SVG icons for a polished look. The icon prop accepts emoji, HTML strings, or SVG
				markup.
			</p>

			<div class="demo-container">
				<div class="demo-area">
					<SpeedDial
						actions={socialActions}
						type="semi-circle"
						direction="up"
						radius={80}
						buttonLabel="Share"
					/>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`const socialActions = [
  {
    id: 'facebook',
    label: 'Facebook',
    icon: '<svg>...</svg>',
    onclick: () => shareToFacebook()
  },
  // ...more actions
];

<SpeedDial
  actions={socialActions}
  type="semi-circle"
  direction="up"
  radius={80}
  buttonLabel="Share"
/>`}</code></pre>
			</details>
		</section>

		<!-- Custom Button Icon Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Custom Button Icon</h2>
			</div>

			<p class="description">
				Replace the default plus icon with your own. Use the <code>buttonIcon</code> prop to set a custom
				icon.
			</p>

			<div class="demo-container demo-row">
				<div class="demo-item">
					<div class="demo-area">
						<SpeedDial actions={basicActions} direction="up" buttonIcon="☰" buttonLabel="Menu" />
					</div>
					<p class="label">Emoji Icon</p>
				</div>

				<div class="demo-item">
					<div class="demo-area">
						<SpeedDial
							actions={basicActions}
							direction="up"
							buttonIcon={menuIcon}
							buttonLabel="Navigation"
						/>
					</div>
					<p class="label">SVG Icon</p>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<!-- Emoji button icon -->
<SpeedDial
  actions={actions}
  buttonIcon="☰"
  buttonLabel="Menu"
/>

<!-- SVG button icon -->
<SpeedDial
  actions={actions}
  buttonIcon={menuIcon}
  buttonLabel="Navigation"
/>`}</code></pre>
			</details>
		</section>

		<!-- Animation Delay Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Animation Timing</h2>
			</div>

			<p class="description">
				Control the stagger delay between item animations with the <code>transitionDelay</code> prop.
				Higher values create more dramatic cascading effects.
			</p>

			<div class="demo-container demo-row">
				<div class="demo-item">
					<div class="demo-area">
						<SpeedDial actions={circularActions.slice(0, 4)} direction="up" transitionDelay={0} />
					</div>
					<p class="label">No Delay (0ms)</p>
				</div>

				<div class="demo-item">
					<div class="demo-area">
						<SpeedDial actions={circularActions.slice(0, 4)} direction="up" transitionDelay={30} />
					</div>
					<p class="label">Default (30ms)</p>
				</div>

				<div class="demo-item">
					<div class="demo-area">
						<SpeedDial actions={circularActions.slice(0, 4)} direction="up" transitionDelay={100} />
					</div>
					<p class="label">Slow (100ms)</p>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<SpeedDial actions={actions} transitionDelay={0} />   <!-- Simultaneous -->
<SpeedDial actions={actions} transitionDelay={30} />  <!-- Default cascade -->
<SpeedDial actions={actions} transitionDelay={100} /> <!-- Dramatic cascade -->`}</code></pre>
			</details>
		</section>

		<!-- Tooltip Positions Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Tooltip Positions</h2>
			</div>

			<p class="description">
				Tooltips auto-position based on direction, or set explicitly with <code
					>tooltipPosition</code
				>. Disable tooltips entirely with <code>showTooltip={'{false}'}</code>.
			</p>

			<div class="demo-container demo-row">
				<div class="demo-item">
					<div class="demo-area">
						<SpeedDial actions={basicActions} direction="right" tooltipPosition="top" />
					</div>
					<p class="label">Top Tooltips</p>
				</div>

				<div class="demo-item">
					<div class="demo-area">
						<SpeedDial actions={basicActions} direction="right" tooltipPosition="bottom" />
					</div>
					<p class="label">Bottom Tooltips</p>
				</div>

				<div class="demo-item">
					<div class="demo-area">
						<SpeedDial actions={basicActions} direction="up" showTooltip={false} />
					</div>
					<p class="label">No Tooltips</p>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<SpeedDial actions={actions} tooltipPosition="top" />
<SpeedDial actions={actions} tooltipPosition="bottom" />
<SpeedDial actions={actions} showTooltip={false} />`}</code></pre>
			</details>
		</section>

		<!-- Features Grid -->
		<section class="features-section">
			<h2>Component Features</h2>
			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon">🎯</div>
					<h3>Multiple Layouts</h3>
					<p>Linear, circle, semi-circle, and quarter-circle arrangements for any use case.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🎬</div>
					<h3>Smooth Animations</h3>
					<p>Staggered entrance/exit with configurable timing and GPU-accelerated transforms.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">💬</div>
					<h3>Smart Tooltips</h3>
					<p>Auto-positioning tooltips with manual override options and smooth transitions.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🎭</div>
					<h3>Modal Mask</h3>
					<p>Optional backdrop overlay for focused interactions and easy dismissal.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">⌨️</div>
					<h3>Keyboard Accessible</h3>
					<p>Full keyboard navigation with Tab, Enter, and Escape support.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🎨</div>
					<h3>Customisable</h3>
					<p>Custom icons, colours, and styling. Works with emoji, SVG, or HTML icons.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🌙</div>
					<h3>Dark Mode</h3>
					<p>Automatic dark mode support via CSS media queries.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🚀</div>
					<h3>Zero Dependencies</h3>
					<p>Pure Svelte 5 with no external libraries. Copy-paste ready.</p>
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
							<td><code>actions</code></td>
							<td>SpeedDialAction[]</td>
							<td>[]</td>
							<td>Array of action items to display</td>
						</tr>
						<tr>
							<td><code>direction</code></td>
							<td>'up' | 'down' | 'left' | 'right'</td>
							<td>'up'</td>
							<td>Direction for linear layouts / start angle for circular</td>
						</tr>
						<tr>
							<td><code>type</code></td>
							<td>'linear' | 'circle' | 'semi-circle' | 'quarter-circle'</td>
							<td>'linear'</td>
							<td>Layout arrangement of action items</td>
						</tr>
						<tr>
							<td><code>radius</code></td>
							<td>number</td>
							<td>80</td>
							<td>Distance from center for circular layouts (px)</td>
						</tr>
						<tr>
							<td><code>transitionDelay</code></td>
							<td>number</td>
							<td>30</td>
							<td>Stagger delay between item animations (ms)</td>
						</tr>
						<tr>
							<td><code>showTooltip</code></td>
							<td>boolean</td>
							<td>true</td>
							<td>Show tooltip labels on hover</td>
						</tr>
						<tr>
							<td><code>tooltipPosition</code></td>
							<td>'auto' | 'left' | 'right' | 'top' | 'bottom'</td>
							<td>'auto'</td>
							<td>Position of tooltips relative to items</td>
						</tr>
						<tr>
							<td><code>mask</code></td>
							<td>boolean</td>
							<td>false</td>
							<td>Show modal backdrop when open</td>
						</tr>
						<tr>
							<td><code>disabled</code></td>
							<td>boolean</td>
							<td>false</td>
							<td>Disable the SpeedDial</td>
						</tr>
						<tr>
							<td><code>buttonIcon</code></td>
							<td>string</td>
							<td>'+' SVG</td>
							<td>Custom icon for main button (emoji, HTML, or SVG)</td>
						</tr>
						<tr>
							<td><code>buttonLabel</code></td>
							<td>string</td>
							<td>'Open menu'</td>
							<td>Accessible label for main button</td>
						</tr>
						<tr>
							<td><code>isOpen</code></td>
							<td>boolean</td>
							<td>false</td>
							<td>Bindable state for open/closed</td>
						</tr>
					</tbody>
				</table>
			</div>

			<h3 class="sub-heading">SpeedDialAction Interface</h3>
			<div class="props-table">
				<table>
					<thead>
						<tr>
							<th>Property</th>
							<th>Type</th>
							<th>Required</th>
							<th>Description</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><code>id</code></td>
							<td>string</td>
							<td>Yes</td>
							<td>Unique identifier for the action</td>
						</tr>
						<tr>
							<td><code>label</code></td>
							<td>string</td>
							<td>Yes</td>
							<td>Accessible label (shown in tooltip)</td>
						</tr>
						<tr>
							<td><code>icon</code></td>
							<td>string</td>
							<td>Yes</td>
							<td>Emoji, HTML, or SVG string for icon</td>
						</tr>
						<tr>
							<td><code>onclick</code></td>
							<td>() => void</td>
							<td>No</td>
							<td>Callback when action is clicked</td>
						</tr>
						<tr>
							<td><code>disabled</code></td>
							<td>boolean</td>
							<td>No</td>
							<td>Disable this action</td>
						</tr>
						<tr>
							<td><code>class</code></td>
							<td>string</td>
							<td>No</td>
							<td>Additional CSS classes</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

		<!-- Quick Start Guide -->
		<section class="guide-section">
			<h2>Quick Start Guide</h2>
			<div class="guide-steps">
				<div class="step">
					<div class="step-number">1</div>
					<div class="step-content">
						<h3>Copy the Component</h3>
						<p>
							Copy <code>SpeedDial.svelte</code> from <code>src/lib/components/</code> and the
							type definitions from <code>src/lib/types.ts</code> to your project.
						</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">2</div>
					<div class="step-content">
						<h3>Define Your Actions</h3>
						<p>
							Create an array of <code>SpeedDialAction</code> objects with id, label, icon, and onclick
							handler for each action.
						</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">3</div>
					<div class="step-content">
						<h3>Choose Layout & Position</h3>
						<p>
							Select the layout type and direction that fits your UI. Position the SpeedDial using
							CSS (e.g., <code>fixed bottom-4 right-4</code>).
						</p>
					</div>
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
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
		line-height: 1.6;
	}

	/* Action Toast */
	.action-toast {
		position: fixed;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		padding: 0.75rem 1.5rem;
		background: #1a202c;
		color: white;
		border-radius: 8px;
		font-size: 0.875rem;
		z-index: 100;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.action-toast span {
		color: #a0aec0;
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

	.sub-heading {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1a202c;
		margin: 2rem 0 1rem 0;
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
		flex-wrap: wrap;
		gap: 3rem;
		padding: 3rem 1rem;
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		border-radius: 12px;
		margin-bottom: 2rem;
		min-height: 200px;
	}

	.demo-container.linear-demo {
		padding: 4rem 2rem;
	}

	.demo-container.demo-row {
		flex-direction: row;
		justify-content: center;
	}

	.demo-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.demo-area {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 200px;
		height: 200px;
		position: relative;
	}

	.demo-area.large {
		width: 250px;
		height: 250px;
	}

	.demo-area.medium {
		width: 220px;
		height: 220px;
	}

	.label {
		font-size: 0.875rem;
		color: #718096;
		margin: 0;
		text-align: center;
		font-weight: 500;
	}

	/* Quarter Circle Demo */
	.quarter-demo {
		padding: 2rem;
	}

	.quarter-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: 0;
		width: 100%;
		max-width: 600px;
		height: 400px;
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
	}

	.corner {
		position: relative;
		display: flex;
		padding: 1rem;
		border: 1px solid #e2e8f0;
	}

	.corner.top-left {
		align-items: flex-start;
		justify-content: flex-start;
	}

	.corner.top-right {
		align-items: flex-start;
		justify-content: flex-end;
	}

	.corner.bottom-left {
		align-items: flex-end;
		justify-content: flex-start;
	}

	.corner.bottom-right {
		align-items: flex-end;
		justify-content: flex-end;
	}

	.corner-label {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 0.75rem;
		color: #a0aec0;
		white-space: nowrap;
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
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.feature-card {
		text-align: center;
		padding: 1.5rem;
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
	}

	.feature-icon {
		font-size: 2.5rem;
		margin-bottom: 0.75rem;
	}

	.feature-card h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #1a202c;
	}

	.feature-card p {
		font-size: 0.875rem;
		color: #718096;
		margin: 0;
		line-height: 1.5;
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

		.demo-container {
			padding: 2rem 1rem;
			gap: 2rem;
		}

		.demo-area {
			width: 150px;
			height: 150px;
		}

		.quarter-grid {
			height: 300px;
		}

		.step {
			flex-direction: column;
			gap: 1rem;
		}
	}
</style>
