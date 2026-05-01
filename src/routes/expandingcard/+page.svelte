<script lang="ts">
	import ExpandingCard from '$lib/components/ExpandingCard.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const shell = catalogShellPropsForSlug('/expandingcard')!;

	const usageSnippet = `<script>
  import ExpandingCard from '$lib/components/ExpandingCard.svelte';
</${'script'}>

<ExpandingCard
  imageSrc="https://example.com/image.jpg"
  imageAlt="Description"
  heading="Card Title"
  compactText="Short preview text"
  expandedText="Detailed description with more information"
  bgColor="bg-lime-100"
/>`;

	const codeExplanation =
		'ExpandingCard uses Svelte\'s built-in crossfade transition to morph the image, heading and copy between a compact (vertical) and expanded (horizontal) layout. Each ExpandingCard owns its open state — click the card to toggle.';
</script>

<svelte:head>
	<title>ExpandingCard — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Interactive card with expandable layouts using Svelte crossfade transitions."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'Crossfade', 'Click', 'Tailwind', 'Theme-aware']}
>
	{#snippet demo()}
		<div class="ec-status">
			<DatabaseStatus usingDatabase={data.usingDatabase} />
		</div>

		<div class="ec-stage">
			<ExpandingCard
				imageSrc="https://i.pinimg.com/564x/b3/7c/fa/b37cfa52ac8e142ffe42772712f6e33d.jpg"
				imageAlt="Saturn Artwork"
				heading="Mumbai City"
				compactText="Thank you Sikandar Bhide for this awesome element"
				expandedText="Most of the edits are to update or remove the dependencies. but you started it all. Thank you!"
			/>
		</div>

		{#if data.expandingCards?.length}
			<h3 class="ec-section-h">Database content</h3>
			<div class="ec-stack">
				{#each data.expandingCards as card (card.heading)}
					<div class="ec-stage ec-stage--inner">
						<ExpandingCard
							imageSrc={card.imageSrc}
							imageAlt={card.imageAlt}
							heading={card.heading}
							compactText={card.compactText}
							expandedText={card.expandedText}
							bgColor={card.bgColor}
						/>
					</div>
				{/each}
			</div>
		{/if}

		<h3 class="ec-section-h">Background colours</h3>
		<div class="ec-grid">
			<div class="ec-stage ec-stage--inner">
				<ExpandingCard
					imageSrc="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop"
					imageAlt="Forest"
					heading="Forest Path"
					compactText="Through emerald canopies"
					expandedText="Wandering through ancient woods filled with life"
					bgColor="bg-green-100"
				/>
			</div>
			<div class="ec-stage ec-stage--inner">
				<ExpandingCard
					imageSrc="https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&h=400&fit=crop"
					imageAlt="Desert"
					heading="Desert Dunes"
					compactText="Golden sands sculpted by wind"
					expandedText="Creating an ever-changing landscape of beauty"
					bgColor="bg-orange-100"
				/>
			</div>
			<div class="ec-stage ec-stage--inner">
				<ExpandingCard
					imageSrc="https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=400&fit=crop"
					imageAlt="Ocean"
					heading="Ocean Waves"
					compactText="Rhythmic dance of nature"
					expandedText="The timeless symphony of waves meeting shore"
					bgColor="bg-cyan-100"
				/>
			</div>
			<div class="ec-stage ec-stage--inner">
				<ExpandingCard
					imageSrc="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=400&fit=crop"
					imageAlt="Aurora"
					heading="Northern Lights"
					compactText="Nature's light show"
					expandedText="Ethereal colours painting the Arctic sky"
					bgColor="bg-purple-100"
				/>
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
					<td><code>imageSrc</code></td>
					<td><code>string</code></td>
					<td>placeholder</td>
					<td>URL of the card image.</td>
				</tr>
				<tr>
					<td><code>imageAlt</code></td>
					<td><code>string</code></td>
					<td><code>'Card Image'</code></td>
					<td>Alt text for the image.</td>
				</tr>
				<tr>
					<td><code>heading</code></td>
					<td><code>string</code></td>
					<td><code>'Card Title'</code></td>
					<td>Card heading text.</td>
				</tr>
				<tr>
					<td><code>compactText</code></td>
					<td><code>string</code></td>
					<td><code>'Hello Devs...'</code></td>
					<td>Text shown in compact layout.</td>
				</tr>
				<tr>
					<td><code>expandedText</code></td>
					<td><code>string</code></td>
					<td><code>'Yoo devs...'</code></td>
					<td>Text shown in expanded layout.</td>
				</tr>
				<tr>
					<td><code>bgColor</code></td>
					<td><code>string</code></td>
					<td><code>'bg-lime-100'</code></td>
					<td>Tailwind background class. Database values must be present in your CSS or safelist.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ec-status {
		margin-bottom: 16px;
	}
	.ec-section-h {
		margin: 24px 0 12px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.ec-stage {
		display: grid;
		place-items: center;
		min-height: 460px;
		padding: 24px;
		border-radius: var(--r-2);
		background: var(--surface-2);
		border: 1px solid var(--border);
	}
	.ec-stage--inner {
		min-height: 380px;
		padding: 18px;
	}
	.ec-stack {
		display: grid;
		gap: 12px;
	}
	.ec-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 12px;
	}
</style>
