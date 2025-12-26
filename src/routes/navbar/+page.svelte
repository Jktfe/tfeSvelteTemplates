<script lang="ts">
	import type { MenuCategory, MenuItem } from '$lib/types';

	// Example categorised menu for the demo (mirrors the actual app structure)
	const demoCategories: MenuCategory[] = [
		{
			name: 'Home',
			icon: '🏠',
			items: [{ label: 'Home', href: '/', icon: '🏠', active: false }]
		},
		{
			name: 'Cards & Layouts',
			icon: '🃏',
			items: [
				{ label: 'CardStack', href: '/cardstack', icon: '🃏', active: false },
				{ label: 'ExpandingCard', href: '/expandingcard', icon: '🎴', active: false },
				{ label: 'MagicCard', href: '/magiccard', icon: '✨', active: false }
			]
		},
		{
			name: 'Navigation',
			icon: '☰',
			items: [{ label: 'Navbar', href: '/navbar', icon: '☰', active: true }]
		}
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
			a left-sliding panel with <strong>collapsible category sections</strong>, smooth animations,
			and backdrop overlay.
		</p>
	</div>

	<section class="section">
		<h2 class="section-title">Features</h2>
		<ul class="features-list">
			<li>Hamburger button that opens a left-sliding panel</li>
			<li><strong>Collapsible category sections</strong> for organising many navigation items</li>
			<li>Single-item categories render as direct links (e.g., Home)</li>
			<li>Multi-item categories expand/collapse with chevron indicators</li>
			<li>Active page highlighting with blue accent and indicator dot</li>
			<li>Auto-expands the category containing the active page</li>
			<li>Smooth staggered animations for menu items</li>
			<li>Backdrop overlay when panel is open</li>
			<li>Keyboard accessible (Tab navigation, Escape to close, focus trap)</li>
			<li>Sticky positioning with backdrop blur</li>
			<li>Optional Clerk authentication UI integration</li>
		</ul>
	</section>

	<section class="section">
		<h2 class="section-title">Interactive Demo</h2>
		<p class="section-description">
			Click the hamburger menu (☰) in the top-left corner to see the navbar in action. The current
			navbar you're using <em>is</em> the component! Try expanding different categories and
			navigating between pages.
		</p>
	</section>

	<section class="section">
		<h2 class="section-title">Usage (Categorised Navigation)</h2>
		<div class="code-block">
			<pre><code>{`${'<'}script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import type { MenuCategory } from '$lib/types';

  const menuCategories: MenuCategory[] = [
    {
      name: 'Home',
      icon: '🏠',
      items: [{ label: 'Home', href: '/', icon: '🏠', active: true }]
    },
    {
      name: 'Components',
      icon: '🧩',
      items: [
        { label: 'CardStack', href: '/cardstack', icon: '🃏', active: false },
        { label: 'MagicCard', href: '/magiccard', icon: '✨', active: false }
      ]
    }
  ];
${'<'}/script>

<Navbar {menuCategories} currentPageTitle="Home" />`}</code></pre>
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
						<td><code>menuCategories</code></td>
						<td><code>MenuCategory[]</code></td>
						<td><code>[]</code></td>
						<td>Categorised navigation items (recommended)</td>
					</tr>
					<tr>
						<td><code>menuItems</code></td>
						<td><code>MenuItem[]</code></td>
						<td><code>[]</code></td>
						<td>Legacy flat menu items (for backwards compatibility)</td>
					</tr>
					<tr>
						<td><code>currentPageTitle</code></td>
						<td><code>string</code></td>
						<td><code>'Home'</code></td>
						<td>Title of the current page (for accessibility)</td>
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
					<tr>
						<td><code>isClerkConfigured</code></td>
						<td><code>boolean</code></td>
						<td><code>false</code></td>
						<td>Show Clerk auth UI (SignIn/UserButton) or demo badge</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="section">
		<h2 class="section-title">Type Definitions</h2>
		<div class="code-block">
			<pre><code>{`// Categorised navigation (recommended)
interface MenuCategory {
  name: string;       // Category display name
  icon?: string;      // Optional category icon/emoji
  items: MenuItem[];  // Items in this category
}

// Individual menu item
interface MenuItem {
  label: string;      // Display text
  href: string;       // Link URL
  icon?: string;      // Optional icon/emoji
  active?: boolean;   // Whether this is the active page
}`}</code></pre>
		</div>
	</section>

	<section class="section">
		<h2 class="section-title">Category Behaviour</h2>
		<ul class="features-list">
			<li>
				<strong>Single-item categories:</strong> Render as direct links without expand/collapse (e.g.,
				Home)
			</li>
			<li>
				<strong>Multi-item categories:</strong> Show a collapsible header with chevron; click to expand/collapse
			</li>
			<li>
				<strong>Auto-expand:</strong> The category containing the active page automatically expands on
				load
			</li>
			<li>
				<strong>Active highlighting:</strong> Active items show blue text and a small indicator dot
			</li>
		</ul>
	</section>

	<section class="section">
		<h2 class="section-title">Implementation Notes</h2>
		<ul class="features-list">
			<li>
				<strong>Panel Scrolling:</strong> The panel automatically becomes scrollable if menu items exceed
				viewport height
			</li>
			<li>
				<strong>Body Scroll Lock:</strong> When panel is open, body scrolling is prevented (coordinated
				with other components via scrollLock utility)
			</li>
			<li>
				<strong>Close Triggers:</strong> Panel closes when clicking a menu item, clicking overlay, or
				pressing Escape
			</li>
			<li>
				<strong>Focus Trap:</strong> Tab navigation stays within the panel when open (WCAG 2.4.3)
			</li>
			<li>
				<strong>Responsive:</strong> Panel width adapts based on screen size (280px mobile, 320px tablet+)
			</li>
			<li>
				<strong>Accessibility:</strong> ARIA labels, expanded states, focus management, and reduced motion
				support
			</li>
		</ul>
	</section>

	<section class="section">
		<h2 class="section-title">Clerk Integration</h2>
		<p class="section-description">
			When <code>isClerkConfigured</code> is <code>true</code>, the navbar displays Clerk's
			authentication UI in the right section:
		</p>
		<ul class="features-list">
			<li><strong>Signed out:</strong> Shows a "Sign in" button</li>
			<li><strong>Signed in:</strong> Shows the UserButton avatar with dropdown menu</li>
			<li><strong>Not configured:</strong> Shows a "Demo Mode" badge</li>
		</ul>
	</section>

	<section class="section">
		<h2 class="section-title">Copy the Component</h2>
		<p class="section-description">
			This component is self-contained and can be copied directly into your project. You'll need:
		</p>
		<ul class="features-list">
			<li><code>src/lib/components/Navbar.svelte</code> - The component file</li>
			<li><code>src/lib/types.ts</code> - MenuCategory, MenuItem, and NavbarProps interfaces</li>
			<li><code>src/lib/scrollLock.ts</code> - Scroll lock utility (optional, for coordination)</li>
			<li><code>svelte-clerk</code> - Only if using Clerk auth integration</li>
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
