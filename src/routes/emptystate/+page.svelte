<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import BadgePill from '$lib/components/BadgePill.svelte';

	const shell = catalogShellPropsForSlug('/emptystate')!;

	let searchTerm = $state('');
	let dummyResults = $state<string[]>([]);
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Snippets', 'A11y', 'Zero deps']}
	codeExplanation="EmptyState is a snippet-driven placeholder for any 'nothing-here-yet' moment — empty inboxes, no search results, fresh dashboards. Pass an icon snippet (anything: emoji, SVG, image), a description snippet (any markup), and an optional action snippet for a CTA. Three variants control chrome (default dashed, card with shadow, minimal no-chrome) and three sizes scale the whole thing without re-typing styles. role='status' + aria-live='polite' lets screen readers announce the state when it appears."
>
	{#snippet demo()}
		<div class="es-stack">
			<div class="es-grid">
				<EmptyState title="Default">
					{#snippet icon()}📭{/snippet}
					{#snippet description()}Dashed border, soft grey background.{/snippet}
				</EmptyState>
				<EmptyState title="Card" variant="card">
					{#snippet icon()}🗂️{/snippet}
					{#snippet description()}Solid white card with a soft shadow.{/snippet}
				</EmptyState>
				<EmptyState title="Minimal" variant="minimal">
					{#snippet icon()}✨{/snippet}
					{#snippet description()}No chrome — drops into any layout.{/snippet}
				</EmptyState>
			</div>

			<EmptyState title="Welcome aboard" size="lg" variant="card">
				{#snippet icon()}🎉{/snippet}
				{#snippet description()}You haven't created any projects yet. Spin up your first one and get going.{/snippet}
				{#snippet action()}
					<button class="es-cta" onclick={() => alert('Imagine a creation flow!')}>Create your first project</button>
				{/snippet}
			</EmptyState>

			<div class="es-search">
				<input
					type="text"
					bind:value={searchTerm}
					placeholder="Search the empty void…"
					class="es-input"
				/>
				{#if searchTerm.trim() === ''}
					<EmptyState title="Start typing" variant="minimal" size="sm">
						{#snippet icon()}⌨️{/snippet}
						{#snippet description()}Enter a search term to filter the results.{/snippet}
					</EmptyState>
				{:else if dummyResults.length === 0}
					<EmptyState title="No results found" variant="minimal" size="sm">
						{#snippet icon()}🔍{/snippet}
						{#snippet description()}
							We couldn't find anything matching <strong>"{searchTerm}"</strong>. Try another term.
						{/snippet}
						{#snippet action()}
							<button class="es-link" onclick={() => (searchTerm = '')}>Clear search</button>
						{/snippet}
					</EmptyState>
				{/if}
			</div>

			<EmptyState title="No deployments in this branch" variant="card">
				{#snippet icon()}🌿{/snippet}
				{#snippet description()}
					You're on <BadgePill label="feature/empty-state" tone="info" size="sm" />. Push a commit to trigger your first deployment.
				{/snippet}
				{#snippet action()}
					<a href="/" class="es-link">View deployment guide →</a>
				{/snippet}
			</EmptyState>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>title</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Heading text rendered above the description.</td>
				</tr>
				<tr>
					<td><code>variant</code></td>
					<td><code>"default" | "card" | "minimal"</code></td>
					<td><code>"default"</code></td>
					<td>Chrome style — dashed default, solid card, or no chrome.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>"sm" | "md" | "lg"</code></td>
					<td><code>"md"</code></td>
					<td>Padding, icon size, and font scale.</td>
				</tr>
				<tr>
					<td><code>icon</code></td>
					<td><code>Snippet</code></td>
					<td>—</td>
					<td>Icon slot — emoji, inline SVG, or img tag.</td>
				</tr>
				<tr>
					<td><code>description</code></td>
					<td><code>Snippet</code></td>
					<td>—</td>
					<td>Body content — supports any markup.</td>
				</tr>
				<tr>
					<td><code>action</code></td>
					<td><code>Snippet</code></td>
					<td>—</td>
					<td>Optional CTA slot — typically a button or link.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>""</code></td>
					<td>Extra class names forwarded to the root element.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.es-stack {
		display: grid;
		gap: 18px;
	}
	.es-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 12px;
	}
	.es-search {
		display: grid;
		gap: 12px;
		padding: 16px;
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		background: var(--surface);
	}
	.es-input {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		background: var(--surface);
		color: var(--fg-1);
		font: 14px var(--font-sans);
	}
	.es-input:focus {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	.es-cta {
		padding: 8px 14px;
		background: var(--accent);
		color: #fff;
		border: 0;
		border-radius: var(--r-2);
		font: 600 13px var(--font-sans);
		cursor: pointer;
	}
	.es-cta:hover { filter: brightness(1.08); }
	.es-link {
		font: 500 13px var(--font-sans);
		color: var(--accent);
		background: transparent;
		border: 0;
		text-decoration: none;
		cursor: pointer;
	}
	.es-link:hover { text-decoration: underline; text-underline-offset: 3px; }
</style>
