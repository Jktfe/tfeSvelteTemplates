<script lang="ts">
	import EmptyState from '$lib/components/EmptyState.svelte';
	import BadgePill from '$lib/components/BadgePill.svelte';

	let searchTerm = $state('');
	let dummyResults = $state<string[]>([]);
</script>

<svelte:head>
	<title>EmptyState | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-5xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">EmptyState</h1>
			<p class="text-xl text-muted-foreground">
				Universal "nothing here yet" placeholder. Three sizes, three variants, snippet-driven.
			</p>
		</header>

		<!-- Variants -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Variants</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
		</section>

		<!-- Sizes -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Sizes</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<EmptyState title="Small" size="sm" variant="card">
					{#snippet icon()}🔍{/snippet}
					{#snippet description()}For inline empty messages.{/snippet}
				</EmptyState>

				<EmptyState title="Medium" size="md" variant="card">
					{#snippet icon()}📦{/snippet}
					{#snippet description()}Default size — works for cards and panels.{/snippet}
				</EmptyState>

				<EmptyState title="Large" size="lg" variant="card">
					{#snippet icon()}🚀{/snippet}
					{#snippet description()}Hero-sized for full-page empty states.{/snippet}
				</EmptyState>
			</div>
		</section>

		<!-- With action -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">With a call-to-action</h2>
			<EmptyState title="Welcome aboard" size="lg" variant="card">
				{#snippet icon()}🎉{/snippet}
				{#snippet description()}You haven't created any projects yet. Spin up your first one and get going.{/snippet}
				{#snippet action()}
					<button
						class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
						onclick={() => alert('Imagine a creation flow!')}
					>
						Create your first project
					</button>
				{/snippet}
			</EmptyState>
		</section>

		<!-- Live search example -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Live search example</h2>
			<p class="text-sm text-neutral-500">
				Search anything — the empty state appears when nothing matches.
			</p>
			<div class="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
				<input
					type="text"
					bind:value={searchTerm}
					placeholder="Search the empty void…"
					class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
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
							<button
								class="text-sm text-blue-600 hover:underline"
								onclick={() => (searchTerm = '')}
							>
								Clear search
							</button>
						{/snippet}
					</EmptyState>
				{/if}
			</div>
		</section>

		<!-- Composing with BadgePill -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Composing with other primitives</h2>
			<p class="text-sm text-neutral-500">
				EmptyState's snippets accept any markup — pair it with BadgePill, icons, or links.
			</p>
			<EmptyState title="No deployments in this branch" variant="card">
				{#snippet icon()}🌿{/snippet}
				{#snippet description()}
					You're on <BadgePill label="feature/empty-state" tone="info" size="sm" />. Push a commit
					to trigger your first deployment.
				{/snippet}
				{#snippet action()}
					<a href="/" class="text-sm text-blue-600 hover:underline">View deployment guide →</a>
				{/snippet}
			</EmptyState>
		</section>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Three sizes (sm / md / lg)</li>
					<li>Three variants (default / card / minimal)</li>
					<li>Snippet-driven icon / description / action</li>
					<li><code>role="status"</code> + <code>aria-live="polite"</code> for screen readers</li>
					<li>Composes with BadgePill, buttons, links — any markup</li>
					<li>Zero dependencies</li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Usage</h2>
				<pre
					class="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm border border-neutral-800"><code>{`<script lang="ts">
  import EmptyState from '$lib/components/EmptyState.svelte';
</${''}script>

<EmptyState title="No orders yet">
  {#snippet icon()}📦{/snippet}
  {#snippet description()}
    Place your first order to see it here.
  {/snippet}
  {#snippet action()}
    <button>Browse catalogue</button>
  {/snippet}
</EmptyState>`}</code></pre>
			</div>
		</section>
	</div>
</div>
