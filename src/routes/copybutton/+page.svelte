<script lang="ts">
	import CopyButton from '$lib/components/CopyButton.svelte';

	const apiKey = 'tfe_demo_4f8ab4d2e9c3401a9fd2b1c8e7d5a3f0';
	const inviteUrl = 'https://tfe-templates.example.com/invite/g7n2-x9k4';
	const sampleSnippet = `import CopyButton from '$lib/components/CopyButton.svelte';

<CopyButton value={apiKey} variant="icon" />`;

	let lastCopied = $state<string | null>(null);
</script>

<svelte:head>
	<title>CopyButton | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-4xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">CopyButton</h1>
			<p class="text-xl text-muted-foreground">
				One-click copy-to-clipboard with a brief <code>Copied!</code> confirmation, three variants, and an accessible live region.
			</p>
		</header>

		<section class="bg-neutral-950 rounded-2xl p-12 border border-neutral-800 shadow-2xl space-y-12">
			<div class="flex flex-col items-center space-y-4">
				<h3 class="text-sm font-medium text-neutral-400">Default — icon + text</h3>
				<CopyButton value="Hello, world" />
			</div>

			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-800">
				<h3 class="text-sm font-medium text-neutral-400">Variants</h3>
				<div class="flex flex-wrap gap-3 justify-center">
					<CopyButton value="text variant" variant="text" label="Copy text" />
					<CopyButton value="both variant" variant="both" />
					<CopyButton value="icon variant" variant="icon" ariaLabel="Copy icon-only" />
				</div>
			</div>

			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-800">
				<h3 class="text-sm font-medium text-neutral-400">Sizes</h3>
				<div class="flex flex-wrap gap-3 justify-center items-center">
					<CopyButton value="sm" size="sm" label="Small" />
					<CopyButton value="md" size="md" label="Medium" />
					<CopyButton value="lg" size="lg" label="Large" />
				</div>
			</div>

			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-800">
				<h3 class="text-sm font-medium text-neutral-400">In context — API key row</h3>
				<div class="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 font-mono text-sm text-neutral-300">
					<code class="truncate max-w-xs">{apiKey}</code>
					<CopyButton value={apiKey} variant="icon" size="sm" ariaLabel="Copy API key" />
				</div>
				<p class="text-xs text-neutral-500">Click the icon to copy the API key.</p>
			</div>

			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-800">
				<h3 class="text-sm font-medium text-neutral-400">With <code>onCopy</code> callback</h3>
				<CopyButton
					value={inviteUrl}
					label="Copy invite link"
					onCopy={(v) => (lastCopied = v)}
				/>
				{#if lastCopied}
					<p class="text-xs text-neutral-400">
						Last copied: <code class="text-neutral-300">{lastCopied}</code>
					</p>
				{/if}
			</div>

			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-800">
				<h3 class="text-sm font-medium text-neutral-400">Custom labels and faster reset</h3>
				<CopyButton
					value={sampleSnippet}
					label="Copy snippet"
					copiedLabel="Snippet copied"
					copiedDuration={1200}
				/>
			</div>
		</section>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Three variants — text, icon, both</li>
					<li>Three sizes — <code>sm</code>, <code>md</code>, <code>lg</code></li>
					<li>Configurable <code>copiedLabel</code> and <code>copiedDuration</code></li>
					<li>Optional <code>onCopy</code> callback</li>
					<li>Accessible — <code>aria-live</code> region announces success</li>
					<li>Honours <code>prefers-reduced-motion</code></li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">When to use</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Next to a code snippet, share URL, API key, or invite code</li>
					<li>Modal headers showing a generated value</li>
					<li>Admin dashboards copying IDs for support tickets</li>
				</ul>
			</div>
		</section>
	</div>
</div>
