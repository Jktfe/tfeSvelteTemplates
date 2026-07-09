<!--
  ============================================================
  Storyboard Page (Dynamic Route)
  ============================================================

  Displays an interactive ExplainerCanvas storyboard for any component.
  The component name is extracted from the URL parameter.

  Route: /storyboard/[component]
  Example: /storyboard/shineborder

  ============================================================
-->

<script lang="ts">
	import { page } from '$app/stores';
	import ExplainerCanvas from '$lib/components/ExplainerCanvas/ExplainerCanvas.svelte';
	import { getStoryboard, getAvailableStoryboards } from '$lib/data/storyboards';

	// Get the component name from the URL parameter
	let componentName = $derived($page.params.component);

	// Look up the storyboard data
	let storyboardData = $derived(getStoryboard(componentName));

	// Get list of available storyboards for the 404 message
	let availableStoryboards = getAvailableStoryboards();
</script>

<svelte:head>
	{#if storyboardData}
		<title>{storyboardData.title} - Storyboard</title>
		<meta
			name="description"
			content={storyboardData.description || `Interactive storyboard for ${componentName}`}
		/>
	{:else}
		<title>Storyboard Not Found</title>
	{/if}
</svelte:head>

<div class="storyboard-page">
	{#if storyboardData}
		<!-- Breadcrumb navigation -->
		<nav class="breadcrumb" aria-label="Breadcrumb">
			<a href="/">Home</a>
			<span class="separator">/</span>
			<a href="/{componentName.toLowerCase()}">{storyboardData.title.replace(' Component', '')}</a>
			<span class="separator">/</span>
			<span class="current">Storyboard</span>
		</nav>

		<!-- Canvas container -->
		<div class="canvas-container">
			<ExplainerCanvas data={storyboardData} />
		</div>

		<!-- Footer with navigation hints -->
		<footer class="storyboard-footer">
			<p class="hint">
				<kbd>Click</kbd> cards to expand &bull;
				<kbd>Drag</kbd> to pan &bull;
				<kbd>Scroll</kbd> to zoom &bull;
				<kbd>/</kbd> to search
			</p>
			<a href="/{componentName.toLowerCase()}" class="back-link">
				← Back to {storyboardData.title.replace(' Component', '')} demo
			</a>
		</footer>
	{:else}
		<!-- 404: Storyboard not found -->
		<div class="not-found">
			<h1>Storyboard Not Found</h1>
			<p>
				No storyboard exists for "<code>{componentName}</code>".
			</p>

			{#if availableStoryboards.length > 0}
				<h2>Available Storyboards</h2>
				<ul class="storyboard-list">
					{#each availableStoryboards as name (name)}
						<li>
							<a href="/storyboard/{name}">{name}</a>
						</li>
					{/each}
				</ul>
			{/if}

			<a href="/" class="home-link">← Back to Home</a>
		</div>
	{/if}
</div>

<style>
	.storyboard-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--bg);
		color: var(--fg);
	}

	/* Breadcrumb navigation */
	.breadcrumb {
		padding: 1rem 2rem;
		background: var(--surface-2);
		border-bottom: 1px solid var(--border);
		font-size: 0.875rem;
	}

	.breadcrumb a {
		color: var(--accent);
		text-decoration: none;
	}

	.breadcrumb a:hover {
		text-decoration: underline;
	}

	.breadcrumb .separator {
		margin: 0 0.5rem;
		color: var(--fg-3);
	}

	.breadcrumb .current {
		color: var(--fg-2);
	}

	/* Canvas container - takes up most of the screen */
	.canvas-container {
		flex: 1;
		min-height: 600px;
	}

	/* Footer with hints */
	.storyboard-footer {
		padding: 1rem 2rem;
		background: var(--surface-2);
		border-top: 1px solid var(--border);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.hint {
		color: var(--fg-2);
		font-size: 0.875rem;
		margin: 0;
	}

	.hint kbd {
		background: var(--border);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-family: inherit;
		font-size: 0.75rem;
	}

	.back-link {
		color: var(--accent);
		text-decoration: none;
		font-size: 0.875rem;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	/* 404 Not Found */
	.not-found {
		max-width: 600px;
		margin: 4rem auto;
		padding: 2rem;
		text-align: center;
	}

	.not-found h1 {
		font-size: 2rem;
		color: var(--fg);
		margin-bottom: 1rem;
	}

	.not-found p {
		color: var(--fg-2);
		margin-bottom: 2rem;
	}

	.not-found code {
		background: var(--surface-2);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.not-found h2 {
		font-size: 1.25rem;
		color: var(--fg);
		margin-bottom: 1rem;
	}

	.storyboard-list {
		list-style: none;
		padding: 0;
		margin: 0 0 2rem;
	}

	.storyboard-list li {
		margin: 0.5rem 0;
	}

	.storyboard-list a {
		color: var(--accent);
		text-decoration: none;
		text-transform: capitalize;
	}

	.storyboard-list a:hover {
		text-decoration: underline;
	}

	.home-link {
		display: inline-block;
		color: var(--accent);
		text-decoration: none;
		padding: 0.5rem 1rem;
		border: 1px solid var(--accent);
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.home-link:hover {
		background: var(--accent);
		color: var(--fg-on-blue);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.breadcrumb {
			padding: 0.75rem 1rem;
		}

		.storyboard-footer {
			padding: 0.75rem 1rem;
			flex-direction: column;
			text-align: center;
		}

		.canvas-container {
			min-height: 400px;
		}
	}
</style>
