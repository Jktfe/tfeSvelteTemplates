<script lang="ts">
	import CardStack from '$lib/components/CardStack.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const shell = catalogShellPropsForSlug('/cardstack')!;

	const usageSnippet = `<script>
  import CardStack from '$lib/components/CardStack.svelte';

  const cards = [
    { image: '/path/to/image.jpg', title: 'Card Title', content: 'Card description' },
    // ...more cards
  ];
</${'script'}>

<CardStack {cards} cardWidth={350} cardHeight={450} />

<!-- Keyboard: Arrow keys navigate, Escape deselects -->
<!-- Mobile: swipe left/right to navigate -->`;

	const codeExplanation =
		'CardStack arranges cards in a horizontal overlapping row. Hover detects entry direction and lifts each card outward; click selects and reveals it fully. Arrow keys, swipe gestures and prefers-reduced-motion are all wired in scoped CSS — no animation library required.';
</script>

<svelte:head>
	<title>CardStack — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Interactive horizontal card stack for Svelte 5 with hover, swipe and keyboard support."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'Hover', 'Swipe', 'Keyboard', 'Theme-aware']}
>
	{#snippet demo()}
		<div class="cs-status">
			<DatabaseStatus
				usingDatabase={data.usingDatabase}
				source={data.dataSource}
				message={data.dataSourceMessage}
			/>
		</div>
		<div class="cs-stage">
			<CardStack cards={data.cards} />
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr>
					<th>Prop</th>
					<th>Type</th>
					<th>Default</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>cards</code></td>
					<td><code>Card[]</code></td>
					<td><code>[]</code></td>
					<td>Array of card objects with <code>image</code>, <code>title</code> and <code>content</code>.</td>
				</tr>
				<tr>
					<td><code>cardWidth</code></td>
					<td><code>number</code></td>
					<td><code>300</code></td>
					<td>Card width in pixels.</td>
				</tr>
				<tr>
					<td><code>cardHeight</code></td>
					<td><code>number</code></td>
					<td><code>400</code></td>
					<td>Card height in pixels.</td>
				</tr>
				<tr>
					<td><code>partialRevealSide</code></td>
					<td><code>'left' | 'right'</code></td>
					<td><code>'right'</code></td>
					<td>Side of the stack the unselected cards peek out from.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.cs-status {
		margin-bottom: 16px;
	}
	.cs-stage {
		display: grid;
		place-items: center;
		min-height: 460px;
		padding: 24px;
		border-radius: var(--r-2);
		background: var(--surface-2);
		border: 1px solid var(--border);
	}
</style>
