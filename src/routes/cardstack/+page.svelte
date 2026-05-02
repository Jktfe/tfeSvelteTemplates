<script lang="ts">
	import CardStack from '$lib/components/CardStack.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import type { PageData } from './$types';
	import type { Card } from '$lib/types';

	let { data }: { data: PageData } = $props();

	const shell = catalogShellPropsForSlug('/cardstack')!;

	// A trimmed three-card subset for the narrow stack — keeps the layout
	// readable in a 600px container without overflow.
	const trio: Card[] = $derived((data.cards ?? []).slice(0, 3));

	// A single card to verify the component degrades gracefully when the
	// caller only has one item to show (no fan, just the centred card).
	const solo: Card[] = $derived((data.cards ?? []).slice(0, 1));

	// Portrait sample: tall, narrow cards with hand-picked photography that
	// flatters a 240×420 frame. We pull from the loaded cards so titles match
	// whatever data source is active (DB or fallback).
	const portrait: Card[] = $derived(
		(data.cards ?? []).slice(0, 4).map((c) => ({
			...c
		}))
	);

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

		<section class="cs-section">
			<header class="cs-section__header">
				<h3>Default — full width, right reveal</h3>
				<p>The flagship configuration: cards splay rightward as you hover left to right.</p>
			</header>
			<div class="cs-stage">
				<CardStack cards={data.cards} />
			</div>
		</section>

		<section class="cs-section">
			<header class="cs-section__header">
				<h3>Three-card narrow stack</h3>
				<p>
					Constrained to a 600px container with a smaller card footprint (240×340) — useful inside
					side-bars or split-pane layouts.
				</p>
			</header>
			<div class="cs-stage cs-stage--narrow">
				<div class="cs-narrow">
					<CardStack cards={trio} cardWidth={240} cardHeight={340} />
				</div>
			</div>
		</section>

		<section class="cs-section">
			<header class="cs-section__header">
				<h3>Reverse partial reveal — <code>partialRevealSide="left"</code></h3>
				<p>
					Mirrors the entrance direction. Handy for right-to-left readers or when the stack lives
					on the right edge of a layout.
				</p>
			</header>
			<div class="cs-stage">
				<CardStack cards={trio} partialRevealSide="left" />
			</div>
		</section>

		<section class="cs-section">
			<header class="cs-section__header">
				<h3>Portrait orientation — 240×420</h3>
				<p>
					Tall, narrow proportions for poster / cover art use cases. The component
					recalculates spacing and hover-shift to suit the new aspect ratio.
				</p>
			</header>
			<div class="cs-stage cs-stage--tall">
				<CardStack cards={portrait} cardWidth={240} cardHeight={420} />
			</div>
		</section>

		<section class="cs-section">
			<header class="cs-section__header">
				<h3>Single-card edge case</h3>
				<p>
					When only one card is supplied, there is no fan to hover through — the card simply
					sits centred. This verifies the layout maths handles <code>cards.length === 1</code>
					without divide-by-zero or overflow glitches.
				</p>
			</header>
			<div class="cs-stage cs-stage--solo">
				{#if solo.length > 0}
					<CardStack cards={solo} cardWidth={300} cardHeight={400} />
				{:else}
					<p class="cs-empty">No cards available to render the edge-case demo.</p>
				{/if}
			</div>
		</section>
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
	.cs-section {
		display: grid;
		gap: 12px;
	}
	.cs-section + .cs-section {
		margin-top: 28px;
	}
	.cs-section__header h3 {
		margin: 0 0 4px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.cs-section__header p {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--fg-2);
	}
	.cs-section__header code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
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
	.cs-stage--narrow {
		min-height: 400px;
	}
	.cs-narrow {
		width: 100%;
		max-width: 600px;
	}
	.cs-stage--tall {
		min-height: 500px;
	}
	.cs-stage--solo {
		min-height: 460px;
	}
	.cs-empty {
		margin: 0;
		font-size: 13px;
		color: var(--fg-3);
	}
</style>
