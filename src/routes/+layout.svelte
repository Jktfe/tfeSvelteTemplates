<script lang="ts">
	import '../app.css';
	import AgentPromptCopy from '$lib/components/AgentPromptCopy.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import {
		buildMenuCategories,
		getCatalogEntryByHref,
		getCatalogPageTitle,
		themeSupportLabel
	} from '$lib/componentCatalog';
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
	const currentCatalogEntry = $derived(getCatalogEntryByHref(currentPath));
	const agentPromptNotes = $derived.by(() => {
		if (!currentCatalogEntry) return undefined;
		const { item } = currentCatalogEntry;
		const relatedFiles =
			item.relatedFiles.length > 0
				? `Related files:\n${item.relatedFiles.map((file) => `- ${file}`).join('\n')}`
				: '';
		return [`Theme support: ${themeSupportLabel(item.themeSupport)}`, item.agentHint, relatedFiles]
			.filter(Boolean)
			.join('\n\n');
	});
</script>

<div class="app">
	<Navbar
		{menuCategories}
		{currentPageTitle}
		{isAuthConfigured}
		{authUser}
		githubUrl="https://github.com/Jktfe/tfeSvelteTemplates"
	/>

	<main class="main">
		{@render children()}
		{#if currentCatalogEntry}
			<section class="agent-prompt-shell" aria-label="Copy this component for your local agent">
				<AgentPromptCopy
					name={currentCatalogEntry.item.name}
					summary={currentCatalogEntry.item.description}
					componentPath={currentCatalogEntry.item.source}
					demoPath={currentCatalogEntry.item.demo}
					deps={currentCatalogEntry.item.dependencies}
					propsSignature={`// See ${currentCatalogEntry.item.source} for exported props and defaults.`}
					usage={currentCatalogEntry.item.usage}
					notes={agentPromptNotes}
				/>
			</section>
		{/if}
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

	:global(html) {
		overflow-x: hidden;
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
		overflow-x: hidden;
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

	.agent-prompt-shell {
		width: min(1120px, calc(100% - 2rem));
		margin: 3rem auto 0;
		min-width: 0;
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

	@media (max-width: 768px) {
		.container {
			padding: 0 1rem;
		}

		.main :global(table) {
			display: block;
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
		}
	}

	@media (prefers-color-scheme: dark) {
		:global(body) {
			background-color: #0f172a;
			color: #f8fafc;
		}

		.footer {
			background-color: #111827;
			border-top-color: rgba(226, 232, 240, 0.12);
		}

		.footer-text {
			color: #94a3b8;
		}

		.footer-text a {
			color: #60a5fa;
		}

		.footer-text a:hover {
			color: #93c5fd;
		}
	}
</style>
