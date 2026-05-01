<script lang="ts">
	import '../app.css';
	import AgentPromptCopy from '$lib/components/AgentPromptCopy.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import TfeFooter from '$lib/components/TfeFooter.svelte';
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
		logoSrc="/tfe/tfe-logo-blue.svg"
		logoAlt="TFE"
		logoText="TFE / Templates"
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

	.agent-prompt-shell {
		width: min(1120px, calc(100% - 2rem));
		margin: 3rem auto 0;
		min-width: 0;
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
