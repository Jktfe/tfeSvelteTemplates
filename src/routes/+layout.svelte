<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { MenuItem } from '$lib/types';
	import { page } from '$app/stores';
	import { browser, dev } from '$app/environment';
	import { inject } from '@vercel/analytics';

	// Initialize Vercel Analytics (client-side only)
	if (browser) {
		inject({ mode: dev ? 'development' : 'production' });
	}

	// Get current path for active menu highlighting
	let currentPath = $derived($page.url.pathname);

	// All navigation menu items for the panel
	const menuItems: MenuItem[] = $derived([
		{
			label: 'Home',
			href: '/',
			icon: '🏠',
			active: currentPath === '/'
		},
		{
			label: 'Navbar',
			href: '/navbar',
			icon: '☰',
			active: currentPath.startsWith('/navbar')
		},
		{
			label: 'CardStack',
			href: '/cardstack',
			icon: '🃏',
			active: currentPath.startsWith('/cardstack')
		},
		{
			label: 'Marquee',
			href: '/marquee',
			icon: '🎭',
			active: currentPath.startsWith('/marquee')
		},
		{
			label: 'MagicCard',
			href: '/magiccard',
			icon: '✨',
			active: currentPath.startsWith('/magiccard')
		},
		{
			label: 'ShineBorder',
			href: '/shineborder',
			icon: '💫',
			active: currentPath.startsWith('/shineborder')
		},
		{
			label: 'SwishButton',
			href: '/swishbutton',
			icon: '🎯',
			active: currentPath.startsWith('/swishbutton')
		},
		{
			label: 'ExpandingCard',
			href: '/expandingcard',
			icon: '🎴',
			active: currentPath.startsWith('/expandingcard')
		},
		{
			label: 'LinkImageHover',
			href: '/linkimagehover',
			icon: '🔗',
			active: currentPath.startsWith('/linkimagehover')
		},
		{
			label: 'Editor (CRUD)',
			href: '/editor',
			icon: '✏️',
			active: currentPath.startsWith('/editor')
		},
		{
			label: 'Forms',
			href: '/forms',
			icon: '📝',
			active: currentPath.startsWith('/forms')
		},
		{
			label: 'DataGrid',
			href: '/datagrid',
			icon: '📊',
			active: currentPath.startsWith('/datagrid')
		},
		{
			label: 'Sankey',
			href: '/sankey',
			icon: '🌊',
			active: currentPath.startsWith('/sankey')
		}
	]);

	// Determine current page title based on path
	let currentPageTitle = $derived.by(() => {
		const activeItem = menuItems.find((item) => item.active);
		return activeItem ? activeItem.label : 'Svelte Templates';
	});

	let { children } = $props();
</script>

<div class="app">
	<Navbar {menuItems} {currentPageTitle} />

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
