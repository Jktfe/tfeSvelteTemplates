<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import type { MenuItem } from '$lib/types';

	// Example menu items for the demo
	const demoMenuItems: MenuItem[] = [
		{ label: 'Dashboard', href: '#dashboard', icon: '📊', active: false },
		{ label: 'Profile', href: '#profile', icon: '👤', active: false },
		{ label: 'Settings', href: '#settings', icon: '⚙️', active: true },
		{ label: 'Messages', href: '#messages', icon: '💬', active: false },
		{ label: 'Notifications', href: '#notifications', icon: '🔔', active: false }
	];
</script>

<div class="page-container">
	<div class="page-header">
		<h1 class="page-title">
			<span class="page-icon">☰</span>
			Navbar Component
		</h1>
		<p class="page-description">
			A responsive navigation bar with hamburger menu following Framework7's panel pattern. Features
			a left-sliding panel menu with smooth animations and backdrop overlay.
		</p>
	</div>

	<section class="section">
		<h2 class="section-title">Features</h2>
		<ul class="features-list">
			<li>Hamburger button that opens a left-sliding panel</li>
			<li>Scrollable panel menu for any number of navigation items</li>
			<li>Active state highlighting with blue accent</li>
			<li>Smooth staggered animations for menu items</li>
			<li>Backdrop overlay when panel is open</li>
			<li>Keyboard accessible (Escape to close)</li>
			<li>Sticky positioning with backdrop blur</li>
			<li>Zero external dependencies</li>
		</ul>
	</section>

	<section class="section">
		<h2 class="section-title">Interactive Demo</h2>
		<p class="section-description">
			Click the hamburger menu (☰) in the top-left corner of the page to see the navbar in action.
			The current navbar you're using is the component itself!
		</p>
	</section>

	<section class="section">
		<h2 class="section-title">Usage</h2>
		<div class="code-block">
			<pre><code>{`${'<'}script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import type { MenuItem } from '$lib/types';

  const menuItems: MenuItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: '🏠',
      active: true
    },
    {
      label: 'About',
      href: '/about',
      icon: 'ℹ️',
      active: false
    }
  ];
${'<'}/script>

<Navbar {menuItems} />`}</code></pre>
		</div>
	</section>

	<section class="section">
		<h2 class="section-title">Props</h2>
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
						<td><code>menuItems</code></td>
						<td><code>MenuItem[]</code></td>
						<td><em>required</em></td>
						<td>Array of navigation menu items</td>
					</tr>
					<tr>
						<td><code>currentPageTitle</code></td>
						<td><code>string</code></td>
						<td><code>'Home'</code></td>
						<td>Title of the current page (not displayed, for accessibility)</td>
					</tr>
					<tr>
						<td><code>logoIcon</code></td>
						<td><code>string</code></td>
						<td><code>'⚡'</code></td>
						<td>Logo icon or emoji</td>
					</tr>
					<tr>
						<td><code>logoText</code></td>
						<td><code>string</code></td>
						<td><code>'Svelte Templates'</code></td>
						<td>Logo text displayed next to icon</td>
					</tr>
					<tr>
						<td><code>logoHref</code></td>
						<td><code>string</code></td>
						<td><code>'/'</code></td>
						<td>URL the logo links to</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="section">
		<h2 class="section-title">MenuItem Interface</h2>
		<div class="code-block">
			<pre><code>{`interface MenuItem {
  label: string;    // Display text
  href: string;     // Link URL
  icon?: string;    // Optional icon/emoji
  active?: boolean; // Whether this is the active page
}`}</code></pre>
		</div>
	</section>

	<section class="section">
		<h2 class="section-title">Implementation Notes</h2>
		<ul class="features-list">
			<li>
				<strong>Panel Scrolling:</strong> The panel automatically becomes scrollable if menu items exceed
				viewport height
			</li>
			<li>
				<strong>Body Scroll Lock:</strong> When panel is open, body scrolling is prevented to improve UX
			</li>
			<li>
				<strong>Close Triggers:</strong> Panel closes when clicking a menu item, clicking overlay, or
				pressing Escape
			</li>
			<li>
				<strong>Responsive:</strong> Panel width adapts based on screen size (280px mobile, 320px
				tablet+)
			</li>
			<li>
				<strong>Accessibility:</strong> Includes proper ARIA labels, focus management, and reduced
				motion support
			</li>
		</ul>
	</section>

	<section class="section">
		<h2 class="section-title">Copy the Component</h2>
		<p class="section-description">
			This component is self-contained and can be copied directly into your project. You'll need:
		</p>
		<ul class="features-list">
			<li><code>src/lib/components/Navbar.svelte</code> - The component file</li>
			<li><code>src/lib/types.ts</code> - MenuItem and NavbarProps interfaces</li>
		</ul>
	</section>
</div>

<style>
	.page-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		margin-bottom: 3rem;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: #1a202c;
		margin: 0 0 1rem 0;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.page-icon {
		font-size: 2.5rem;
	}

	.page-description {
		font-size: 1.125rem;
		color: #4a5568;
		line-height: 1.7;
		margin: 0;
	}

	.section {
		margin-bottom: 3rem;
	}

	.section-title {
		font-size: 1.75rem;
		font-weight: 600;
		color: #1a202c;
		margin: 0 0 1rem 0;
	}

	.section-description {
		font-size: 1rem;
		color: #4a5568;
		line-height: 1.7;
		margin: 0 0 1rem 0;
	}

	.features-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.features-list li {
		padding: 0.75rem 0;
		border-bottom: 1px solid #e2e8f0;
		color: #2d3748;
		line-height: 1.6;
	}

	.features-list li:last-child {
		border-bottom: none;
	}

	.code-block {
		background-color: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		padding: 1.5rem;
		overflow-x: auto;
	}

	.code-block pre {
		margin: 0;
		font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New',
			monospace;
		font-size: 0.875rem;
		line-height: 1.6;
		color: #2d3748;
	}

	.code-block code {
		font-family: inherit;
	}

	.props-table {
		overflow-x: auto;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9375rem;
	}

	thead {
		background-color: #f7fafc;
	}

	th {
		text-align: left;
		padding: 1rem;
		font-weight: 600;
		color: #2d3748;
		border-bottom: 2px solid #e2e8f0;
	}

	td {
		padding: 1rem;
		color: #4a5568;
		border-bottom: 1px solid #e2e8f0;
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	code {
		background-color: #f7fafc;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New',
			monospace;
		font-size: 0.875em;
		color: #d73a49;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.page-container {
			padding: 1.5rem 1rem;
		}

		.page-title {
			font-size: 2rem;
		}

		.page-icon {
			font-size: 2rem;
		}

		.section-title {
			font-size: 1.5rem;
		}

		.props-table {
			font-size: 0.875rem;
		}

		th,
		td {
			padding: 0.75rem 0.5rem;
		}
	}
</style>
