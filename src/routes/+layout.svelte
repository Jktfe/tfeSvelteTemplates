<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { MenuCategory } from '$lib/types';
	import { page } from '$app/stores';
	import { browser, dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import { ClerkProvider } from 'svelte-clerk';
	import type { LayoutData } from './$types';

	// Get layout data from server
	let { data, children } = $props<{ data: LayoutData; children: any }>();

	// Check if Clerk is configured from server data
	const isClerkConfigured = $derived(data.isClerkConfigured);

	// Initialize Vercel Analytics (client-side only)
	if (browser) {
		inject({ mode: dev ? 'development' : 'production' });
	}

	// Get current path for active menu highlighting
	let currentPath = $derived($page.url.pathname);

	// Helper to check if a path is active
	const isActive = (href: string) =>
		href === '/' ? currentPath === '/' : currentPath.startsWith(href);

	// Categorised navigation menu - components organised by purpose
	const menuCategories: MenuCategory[] = $derived([
		{
			name: 'Home',
			icon: '🏠',
			items: [{ label: 'Home', href: '/', icon: '🏠', active: isActive('/') }]
		},
		{
			name: 'Navigation',
			icon: '☰',
			items: [
				{ label: 'Navbar', href: '/navbar', icon: '☰', active: isActive('/navbar') },
				{ label: 'SpeedDial', href: '/speeddial', icon: '⚡', active: isActive('/speeddial') }
			]
		},
		{
			name: 'Native UI',
			icon: '💫',
			items: [
				{ label: 'ShineBorder', href: '/shineborder', icon: '💫', active: isActive('/shineborder') },
				{ label: 'SwishButton', href: '/swishbutton', icon: '🎯', active: isActive('/swishbutton') },
				{ label: 'MagicCard', href: '/magiccard', icon: '✨', active: isActive('/magiccard') }
			]
		},
		{
			name: 'Helpful UX',
			icon: '🎭',
			items: [
				{ label: 'Marquee', href: '/marquee', icon: '🎭', active: isActive('/marquee') },
				{
					label: 'LinkImageHover',
					href: '/linkimagehover',
					icon: '🔗',
					active: isActive('/linkimagehover')
				},
				{
					label: 'AnimatedBeam',
					href: '/animatedbeam',
					icon: '✨',
					active: isActive('/animatedbeam')
				}
			]
		},
		{
			name: 'Cards',
			icon: '🃏',
			items: [
				{ label: 'CardStack', href: '/cardstack', icon: '🃏', active: isActive('/cardstack') },
				{
					label: 'ExpandingCard',
					href: '/expandingcard',
					icon: '🎴',
					active: isActive('/expandingcard')
				},
				{
					label: 'ScratchToReveal',
					href: '/scratchtoreveal',
					icon: '🎰',
					active: isActive('/scratchtoreveal')
				}
			]
		},
		{
			name: 'Data Visualisation',
			icon: '📊',
			items: [
				{ label: 'DataGrid', href: '/datagrid', icon: '📊', active: isActive('/datagrid') },
				{
					label: 'CalendarHeatmap',
					href: '/calendarheatmap',
					icon: '📅',
					active: isActive('/calendarheatmap')
				},
				{
					label: 'BubblePacking',
					href: '/bubblepacking',
					icon: '🫧',
					active: isActive('/bubblepacking')
				},
				{
					label: 'RadialCluster',
					href: '/radialcluster',
					icon: '🎯',
					active: isActive('/radialcluster')
				},
				{ label: 'Sunburst', href: '/sunburst', icon: '☀️', active: isActive('/sunburst') }
			]
		},
		{
			name: 'Interactive',
			icon: '🌊',
			items: [
				{ label: 'Sankey', href: '/sankey', icon: '🌊', active: isActive('/sankey') },
				{ label: 'FolderFiles', href: '/folderfiles', icon: '🗂️', active: isActive('/folderfiles') },
				{
					label: 'ExplainerCanvas',
					href: '/explainercanvas',
					icon: '🎓',
					active: isActive('/explainercanvas')
				}
			]
		},
		{
			name: 'Media & Images',
			icon: '🖼️',
			items: [
				{ label: 'BeforeAfter', href: '/beforeafter', icon: '↔️', active: isActive('/beforeafter') },
				{ label: 'DomeGallery', href: '/domegallery', icon: '🎪', active: isActive('/domegallery') }
			]
		},
		{
			name: 'Forms & CRUD',
			icon: '📝',
			items: [
				{ label: 'Forms', href: '/forms', icon: '📝', active: isActive('/forms') },
				{ label: 'Editor', href: '/editor', icon: '✏️', active: isActive('/editor') }
			]
		},
		{
			name: 'Location Ops',
			icon: '🗺️',
			items: [
				{ label: 'Maps', href: '/maps', icon: '🗺️', active: isActive('/maps') },
				{ label: 'GeoViz', href: '/geo', icon: '🌍', active: isActive('/geo') }
			]
		},
		{
			name: 'Authentication',
			icon: '🔐',
			items: [
				{ label: 'Auth Demo', href: '/auth', icon: '🔐', active: isActive('/auth') },
				{ label: 'Dashboard', href: '/dashboard', icon: '📊', active: isActive('/dashboard') },
				{ label: 'Profile', href: '/profile', icon: '👤', active: isActive('/profile') }
			]
		}
	]);

	// Determine current page title based on path
	let currentPageTitle = $derived.by(() => {
		for (const category of menuCategories) {
			const activeItem = category.items.find((item) => item.active);
			if (activeItem) return activeItem.label;
		}
		return 'Svelte Templates';
	});
</script>

{#if isClerkConfigured}
	<!-- Full Clerk authentication when configured -->
	<ClerkProvider>
		<div class="app">
			<Navbar {menuCategories} {currentPageTitle} {isClerkConfigured} />

			<main class="main">
				{@render children()}
			</main>

			<footer class="footer">
				<div class="container">
					<p class="footer-text">
						Built with <a href="https://svelte.dev" target="_blank" rel="noopener">Svelte 5</a> •
						<a href="https://kit.svelte.dev" target="_blank" rel="noopener">SvelteKit</a> •
						<a href="https://www.typescriptlang.org" target="_blank" rel="noopener">TypeScript</a>
					</p>
				</div>
			</footer>
		</div>
	</ClerkProvider>
{:else}
	<!-- Demo mode when Clerk is not configured -->
	<div class="app">
		<Navbar {menuCategories} {currentPageTitle} {isClerkConfigured} />

		<main class="main">
			{@render children()}
		</main>

		<footer class="footer">
			<div class="container">
				<p class="footer-text">
					Built with <a href="https://svelte.dev" target="_blank" rel="noopener">Svelte 5</a> •
					<a href="https://kit.svelte.dev" target="_blank" rel="noopener">SvelteKit</a> •
					<a href="https://www.typescriptlang.org" target="_blank" rel="noopener">TypeScript</a>
				</p>
			</div>
		</footer>
	</div>
{/if}

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
			sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		background-color: #ffffff;
		color: #1a202c;
		line-height: 1.6;
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.main {
		flex: 1;
		width: 100%;
	}

	.footer {
		background-color: #f7fafc;
		border-top: 1px solid #e2e8f0;
		padding: 2rem 0;
		margin-top: 4rem;
	}

	.footer-text {
		text-align: center;
		color: #718096;
		font-size: 0.9rem;
		margin: 0;
	}

	.footer-text a {
		color: #146ef5;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.footer-text a:hover {
		color: #0c5dd6;
		text-decoration: underline;
	}

	/* Responsive: Mobile */
	@media (max-width: 768px) {
		.container {
			padding: 0 1rem;
		}
	}
</style>
