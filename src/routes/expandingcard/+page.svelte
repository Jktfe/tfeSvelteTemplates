<script lang="ts">
	import ExpandingCard from '$lib/components/ExpandingCard.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const shell = catalogShellPropsForSlug('/expandingcard')!;

	// A long-form expanded body to demonstrate how the component handles
	// substantially more text than the default. The compact face stays terse
	// so the size delta is the entire story.
	const longExpandedText =
		'Long-form expanded text stress-tests the layout. The compact face stays terse — just a tag-line — but once the user clicks, the card pivots to the horizontal layout and reveals every paragraph below. This is where you put the marketing prose: who it is for, what problem it solves, why this approach beats the alternative, the trade-offs you have made, and what the user gets when they sign up. The crossfade transition handles the morph for you, so all you have to think about is editorial pacing.';

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

		<section class="ec-section">
			<header class="ec-section__header">
				<h3>Default — square cover image</h3>
				<p>The flagship configuration: ~1:1 image, short compact body, crossfade on click.</p>
			</header>
			<div class="ec-stage">
				<ExpandingCard
					imageSrc="https://i.pinimg.com/564x/b3/7c/fa/b37cfa52ac8e142ffe42772712f6e33d.jpg"
					imageAlt="Saturn Artwork"
					heading="Mumbai City"
					compactText="Thank you Sikandar Bhide for this awesome element"
					expandedText="Most of the edits are to update or remove the dependencies. but you started it all. Thank you!"
				/>
			</div>
		</section>

		{#if data.expandingCards?.length}
			<section class="ec-section">
				<header class="ec-section__header">
					<h3>Database content</h3>
					<p>Cards loaded from Neon (or fallback constants when <code>DATABASE_URL</code> is absent).</p>
				</header>
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
			</section>
		{/if}

		<section class="ec-section">
			<header class="ec-section__header">
				<h3>Background colours</h3>
				<p>Same shape, four palette swaps via Tailwind <code>bgColor</code>.</p>
			</header>
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
		</section>

		<section class="ec-section">
			<header class="ec-section__header">
				<h3>Landscape image (16:9)</h3>
				<p>
					Forced 16:9 aspect via a wider crop — the card still composes correctly because the
					inner <code>img</code> uses fixed Tailwind sizing that crops to fit.
				</p>
			</header>
			<div class="ec-stage ec-stage--inner">
				<ExpandingCard
					imageSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop"
					imageAlt="Mountain panorama, 16:9 framing"
					heading="Wide Vista"
					compactText="Cinematic 16:9 framing"
					expandedText="A landscape crop demonstrates that the card crops the image to the fixed inner frame, regardless of source aspect ratio."
					bgColor="bg-sky-100"
				/>
			</div>
		</section>

		<section class="ec-section">
			<header class="ec-section__header">
				<h3>Portrait image (9:16)</h3>
				<p>
					Same component, an explicit 9:16 source. Useful for posters, magazine covers and
					mobile-first hero imagery.
				</p>
			</header>
			<div class="ec-stage ec-stage--inner">
				<ExpandingCard
					imageSrc="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=720&h=1280&fit=crop"
					imageAlt="Aurora portrait, 9:16 framing"
					heading="Tall Story"
					compactText="Vertical 9:16 source crop"
					expandedText="Portrait imagery crops cleanly into the same fixed inner frame — the visible composition simply changes."
					bgColor="bg-pink-100"
				/>
			</div>
		</section>

		<section class="ec-section">
			<header class="ec-section__header">
				<h3>Narrow column (320px)</h3>
				<p>
					The same card mounted inside a 320px-wide wrapper, simulating a sidebar or a phone
					viewport. The inner Tailwind responsive classes keep the card legible.
				</p>
			</header>
			<div class="ec-stage ec-stage--inner">
				<div class="ec-narrow">
					<ExpandingCard
						imageSrc="https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=400&fit=crop"
						imageAlt="Wildflowers"
						heading="Side-bar Fit"
						compactText="Lives happily in 320px"
						expandedText="When the viewport (or wrapper) shrinks, the responsive Tailwind classes inside the card scale the image and tighten the spacing automatically."
						bgColor="bg-yellow-100"
					/>
				</div>
			</div>
		</section>

		<section class="ec-section">
			<header class="ec-section__header">
				<h3>Long-form expanded copy</h3>
				<p>
					Click to expand and see how a paragraph-length <code>expandedText</code> wraps inside
					the horizontal layout.
				</p>
			</header>
			<div class="ec-stage ec-stage--inner ec-stage--tall">
				<ExpandingCard
					imageSrc="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400&h=400&fit=crop"
					imageAlt="Open notebook with pen"
					heading="The long version"
					compactText="Click to read the full pitch"
					expandedText={longExpandedText}
					bgColor="bg-stone-100"
				/>
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
	.ec-section {
		display: grid;
		gap: 12px;
	}
	.ec-section + .ec-section {
		margin-top: 28px;
	}
	.ec-section__header h3 {
		margin: 0 0 4px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.ec-section__header p {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--fg-2);
	}
	.ec-section__header code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
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
	.ec-stage--tall {
		min-height: 520px;
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
	.ec-narrow {
		width: 100%;
		max-width: 320px;
	}
</style>
