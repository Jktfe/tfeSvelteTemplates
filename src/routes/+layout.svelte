<script lang="ts">
	import '../app.css';
	import StaggeredMenu from '$lib/components/StaggeredMenu.svelte';
	import type { MenuItem } from '$lib/types';
	import { page } from '$app/stores';

	// Get current path for active menu highlighting
	let currentPath = $derived($page.url.pathname);

	// Define navigation menu items
	const menuItems: MenuItem[] = $derived([
		{
			label: 'Home',
			href: '/',
			icon: '🏠',
			active: currentPath === '/'
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
		}
	]);

	let { children } = $props();
</script>

<div class="app">
	<header class="header">
		<div class="container">
			<div class="header-content">
				<a href="/" class="logo">
					<span class="logo-icon">⚡</span>
					<span class="logo-text">Svelte Templates</span>
				</a>
				<StaggeredMenu items={menuItems} />
			</div>
		</div>
	</header>

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

	.header {
		background-color: #ffffff;
		border-bottom: 1px solid #e2e8f0;
		position: sticky;
		top: 0;
		z-index: 100;
		backdrop-filter: blur(10px);
		background-color: rgba(255, 255, 255, 0.95);
	}

	.container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.25rem 0;
		gap: 2rem;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		text-decoration: none;
		color: #1a202c;
		font-weight: 600;
		font-size: 1.25rem;
		transition: transform 0.2s ease;
	}

	.logo:hover {
		transform: scale(1.02);
	}

	.logo-icon {
		font-size: 1.5rem;
		line-height: 1;
	}

	.logo-text {
		line-height: 1;
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

		.header-content {
			flex-direction: column;
			gap: 1rem;
			padding: 1rem 0;
		}

		.logo {
			font-size: 1.1rem;
		}
	}
</style>
