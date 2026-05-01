<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import TfeFooter from '$lib/components/TfeFooter.svelte';
	import { buildMenuCategories, getCatalogPageTitle } from '$lib/componentCatalog';
	import { page } from '$app/stores';
	import { browser, dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import type { LayoutData } from './$types';

	let { data, children } = $props<{ data: LayoutData; children: any }>();

	const isAuthConfigured = $derived(data.isAuthConfigured);
	const authUser = $derived(data.authUser);

	if (browser) {
		inject({ mode: dev ? 'development' : 'production' });
	}

	let currentPath = $derived($page.url.pathname);
	const menuCategories = $derived(buildMenuCategories(currentPath));
	const currentPageTitle = $derived(getCatalogPageTitle(currentPath));
</script>

<div class="app">
	<Navbar
		{menuCategories}
		{currentPageTitle}
		{isAuthConfigured}
		{authUser}
		logoSrc="/tfe/tfe-logo-blue.svg"
		logoAlt="TFE"
		logoText="TFE / Templates"
		githubUrl="https://github.com/Jktfe/tfeSvelteTemplates"
	/>

	<main class="main">
		{@render children()}
	</main>

	<TfeFooter />
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	/*
	 * NOTE: Use `overflow-x: clip` not `hidden` so we don't create a
	 * scroll container on body — that would break `position: sticky`
	 * on the Navbar.
	 */
	:global(html) {
		overflow-x: clip;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		background-color: var(--bg, #ffffff);
		color: var(--fg, #1a202c);
		line-height: 1.6;
		overflow-x: clip;
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.main {
		flex: 1;
		width: 100%;
		min-width: 0;
	}

	.main :global(pre),
	.main :global(table) {
		max-width: 100%;
	}

	.main :global(pre) {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	@media (max-width: 768px) {
		.main :global(table) {
			display: block;
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
		}
	}

	/* Body already pulls var(--bg)/var(--fg) — those tokens flip under prefers-color-scheme: dark. */
</style>
