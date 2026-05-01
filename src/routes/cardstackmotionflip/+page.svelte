<script lang="ts">
	import CardStackMotionFlip from '$lib/components/CardStackMotionFlip.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const shell = catalogShellPropsForSlug('/cardstackmotionflip')!;

	const heroCards = $derived(data.cards.slice(0, 5));
	const compactCards = $derived(data.cards.slice(0, 4));

	const usageSnippet = `<script>
  import CardStackMotionFlip from '$lib/components/CardStackMotionFlip.svelte';
<\/script>

<CardStackMotionFlip
  cards={cards}
  cardWidth={280}
  cardHeight={380}
  cardGap={38}
  swipeThreshold={80}
  enable3D={true}
/>`;

	const codeExplanation =
		'CardStackMotionFlip is a focused 3D deck. Drag in any direction to roll the top card off-screen with full rotation, then watch it reappear at the back of the stack. Keyboard control is intentionally scoped to focus inside the deck so global arrow handlers stay free for page navigation.';
</script>

<svelte:head>
	<title>CardStackMotionFlip — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="A focused 3D deck template for swipeable Svelte 5 product, gallery, and profile stacks."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', '3D', 'Swipe', 'Keyboard', 'Zero deps']}
>
	{#snippet demo()}
		<div class="csmf-status">
			<DatabaseStatus
				usingDatabase={data.usingDatabase}
				source={data.dataSource}
				message={data.dataSourceMessage}
			/>
		</div>
		<div class="csmf-stage csmf-stage--primary">
			<CardStackMotionFlip cards={heroCards} cardWidth={280} cardHeight={380} cardGap={38} />
		</div>

		<div class="csmf-variants">
			<div class="csmf-variant">
				<header>
					<h3>Compact</h3>
					<p>Smaller cards for constrained panels and mobile-first layouts.</p>
				</header>
				<div class="csmf-stage csmf-stage--compact">
					<CardStackMotionFlip
						cards={compactCards}
						cardWidth={230}
						cardHeight={320}
						cardGap={28}
						swipeThreshold={60}
					/>
				</div>
			</div>
			<div class="csmf-variant">
				<header>
					<h3>Flat motion</h3>
					<p>Same deck choreography with 3D rotation disabled.</p>
				</header>
				<div class="csmf-stage csmf-stage--compact">
					<CardStackMotionFlip
						cards={compactCards}
						cardWidth={230}
						cardHeight={320}
						cardGap={28}
						enable3D={false}
					/>
				</div>
			</div>
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
					<td>Array of cards rendered in the deck.</td>
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
					<td><code>cardGap</code></td>
					<td><code>number</code></td>
					<td><code>50</code></td>
					<td>Vertical gap between stacked cards.</td>
				</tr>
				<tr>
					<td><code>swipeThreshold</code></td>
					<td><code>number</code></td>
					<td><code>80</code></td>
					<td>Pixel distance before a swipe commits.</td>
				</tr>
				<tr>
					<td><code>enable3D</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Toggle full 3D roll rotation.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.csmf-status {
		margin-bottom: 16px;
	}
	.csmf-stage {
		display: grid;
		place-items: center;
		border-radius: var(--r-2);
		background: var(--surface-2);
		border: 1px solid var(--border);
	}
	.csmf-stage--primary {
		min-height: 520px;
		padding: 32px;
	}
	.csmf-stage--compact {
		min-height: 400px;
		padding: 20px;
	}
	.csmf-variants {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 16px;
		margin-top: 16px;
	}
	.csmf-variant {
		display: grid;
		gap: 12px;
		padding: 16px;
		border-radius: var(--r-2);
		border: 1px solid var(--border);
		background: var(--surface);
	}
	.csmf-variant header {
		display: grid;
		gap: 4px;
	}
	.csmf-variant h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.csmf-variant p {
		margin: 0;
		color: var(--fg-2);
		font-size: 13px;
		line-height: 1.5;
	}
</style>
