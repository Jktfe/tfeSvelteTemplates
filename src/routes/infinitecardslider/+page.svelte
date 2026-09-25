<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import InfiniteCardSlider, { type SliderItem } from '$lib/components/InfiniteCardSlider.svelte';

	const shell = catalogShellPropsForSlug('/infinitecardslider')!;

	const trips: SliderItem[] = [
		{ id: 'aurora', title: 'Northern Lights', description: 'Five nights chasing aurora above the Arctic Circle.' },
		{ id: 'coast', title: 'Coastal Path', description: 'Cliff-top walking with a pub at every cove.' },
		{ id: 'alpine', title: 'Alpine Rail', description: 'Glaciers from the window of a panoramic carriage.' },
		{ id: 'desert', title: 'Desert Stars', description: 'Dark-sky camping far from any city glow.' },
		{ id: 'islands', title: 'Island Hop', description: 'Ferries, beaches and very slow lunches.' },
		{ id: 'fjord', title: 'Fjord Kayak', description: 'Paddle mirror-still water under waterfalls.' },
		{ id: 'forest', title: 'Forest Cabin', description: 'A wood-burner, no signal and a stack of books.' },
		{ id: 'city', title: 'City Weekend', description: 'Galleries by day, tiny jazz bars by night.' }
	];

	// Real component pages from this site, so the default chrome can show
	// screenshots and genuine links.
	const templates: SliderItem[] = [
		{ id: 'speeddial', name: 'SpeedDial', href: '/speeddial', screenshot: '/ComponentScreenshots/SpeedDialShot.webp', description: 'Floating action trigger with radial shortcuts.' },
		{ id: 'drawer', name: 'Drawer', href: '/drawer', screenshot: '/ComponentScreenshots/DrawerShot.webp', description: 'Slide-in modal panel from any edge.' },
		{ id: 'magiccard', name: 'MagicCard', href: '/magiccard', screenshot: '/ComponentScreenshots/MagicCardShot.webp', description: 'Card spotlight driven by pointer position.' },
		{ id: 'marquee', name: 'Marquee', href: '/marquee', screenshot: '/ComponentScreenshots/MarqueeShot.webp', description: 'Infinite horizontal scroll of testimonials or logos.' },
		{ id: 'tabs', name: 'Tabs', href: '/tabs', screenshot: '/ComponentScreenshots/TabsShot.webp', description: 'Accessible tablist with keyboard roving focus.' },
		{ id: 'switch', name: 'Switch', href: '/switch', screenshot: '/ComponentScreenshots/SwitchShot.webp', description: 'Toggle switch with sizes and colour variants.' }
	];

	interface Swatch extends SliderItem {
		hex: string;
	}

	const swatches: Swatch[] = [
		{ id: 'ink', title: 'Ink', hex: '#111315' },
		{ id: 'cobalt', title: 'Cobalt', hex: '#2b59c3' },
		{ id: 'teal', title: 'Teal', hex: '#0f766e' },
		{ id: 'saffron', title: 'Saffron', hex: '#f4a300' },
		{ id: 'coral', title: 'Coral', hex: '#f25f5c' },
		{ id: 'plum', title: 'Plum', hex: '#6d3b8c' }
	];

	let cardWidth = $state(260);
	let gap = $state(24);
	let maxVisible = $state(3);
	let playgroundKey = $state(0);
	let activeIndex = $state(0);
	let activeTitle = $state(trips[0].title ?? '');

	const visibleOptions = [1, 2, 3, 4];

	function handleChange(index: number, item: SliderItem) {
		activeIndex = index;
		activeTitle = item.title ?? item.name ?? '';
	}

	function resetPlayground() {
		cardWidth = 260;
		gap = 24;
		maxVisible = 3;
		activeIndex = 0;
		activeTitle = trips[0].title ?? '';
		playgroundKey++;
	}

	const codeExplanation =
		'InfiniteCardSlider never clones DOM nodes. Each card is absolutely positioned and its offset from the focal card is computed with wrappedOffset(), which folds any index into the shortest path around the loop — so card 8 of 8 sits just left of card 1. Dragging writes transforms directly; on release the offset snaps to the nearest whole card and GSAP eases everything into place (or snaps instantly under prefers-reduced-motion). Off-stage cards are aria-hidden and inert, so keyboard users only ever reach cards they can see.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'GSAP', 'Carousel', 'A11y', 'Reduced motion']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="ics-demo">
			<section class="ics-section">
				<h4>Playground · geometry controls</h4>
				<p class="ics-hint">
					Drag, use the arrows, or focus the stage and press ← → Home End. Sliders reshape the
					same live instance.
				</p>

				<div class="ics-controls-panel">
					<label class="ics-slider">
						<span class="ics-label">Card width · {cardWidth}px</span>
						<input type="range" min="180" max="360" step="10" bind:value={cardWidth} />
					</label>
					<label class="ics-slider">
						<span class="ics-label">Gap · {gap}px</span>
						<input type="range" min="0" max="64" step="4" bind:value={gap} />
					</label>
					<div class="ics-control">
						<span class="ics-label">Max visible each side</span>
						<div class="ics-buttons">
							{#each visibleOptions as n (n)}
								<button
									type="button"
									class="ics-btn"
									class:ics-btn--active={maxVisible === n}
									aria-pressed={maxVisible === n}
									onclick={() => (maxVisible = n)}
								>
									{n}
								</button>
							{/each}
							<button type="button" class="ics-btn" onclick={resetPlayground}>Reset</button>
						</div>
					</div>
				</div>

				<div class="ics-stage-wrap">
					{#key playgroundKey}
						<InfiniteCardSlider
							items={trips}
							{cardWidth}
							{gap}
							{maxVisible}
							onchange={handleChange}
							ariaLabel="Trips"
						/>
					{/key}
				</div>

				<p class="ics-state" role="status" aria-live="polite">
					Active: <code>{activeIndex}</code> · <code>{activeTitle}</code>
				</p>
			</section>

			<section class="ics-section">
				<h4>Default chrome · screenshots and links</h4>
				<p class="ics-hint">
					Pass <code>href</code> and <code>screenshot</code> and each card becomes a real link.
					Taps navigate; only drags past 6px are treated as swipes.
				</p>
				<div class="ics-stage-wrap">
					<InfiniteCardSlider items={templates} cardWidth={300} ariaLabel="Template shelf" />
				</div>
			</section>

			<section class="ics-section">
				<h4>Custom snippet · colour swatches</h4>
				<p class="ics-hint">
					The <code>children</code> snippet replaces the default card with anything you like.
				</p>
				<div class="ics-stage-wrap">
					<InfiniteCardSlider items={swatches} cardWidth={200} gap={16} initialIndex={2} ariaLabel="Palette">
						{#snippet children(item: Swatch)}
							<div class="ics-swatch" style:--swatch={item.hex}>
								<span class="ics-swatch__name">{item.title}</span>
								<code class="ics-swatch__hex">{item.hex}</code>
							</div>
						{/snippet}
					</InfiniteCardSlider>
				</div>
			</section>

			<section class="ics-section">
				<h4>Short loop · three cards</h4>
				<p class="ics-hint">
					Even three items loop seamlessly — the wrap maths always picks the nearer side.
				</p>
				<div class="ics-stage-wrap">
					<InfiniteCardSlider
						items={trips.slice(0, 3)}
						cardWidth={220}
						maxVisible={1}
						ariaLabel="Short loop"
					/>
				</div>
			</section>
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
					<td><code>items</code></td>
					<td><code>T[]</code> (<code>T extends SliderItem</code>)</td>
					<td>required</td>
					<td>Slide data. Give each item a stable <code>id</code> (or <code>href</code>) for keyed rendering.</td>
				</tr>
				<tr>
					<td><code>cardWidth</code></td>
					<td><code>number</code></td>
					<td><code>280</code></td>
					<td>Card width in px. Stage height is derived from it.</td>
				</tr>
				<tr>
					<td><code>gap</code></td>
					<td><code>number</code></td>
					<td><code>24</code></td>
					<td>Space between neighbouring cards in px.</td>
				</tr>
				<tr>
					<td><code>initialIndex</code></td>
					<td><code>number</code></td>
					<td><code>0</code></td>
					<td>Starting focal card; wrapped into range on mount.</td>
				</tr>
				<tr>
					<td><code>maxVisible</code></td>
					<td><code>number</code></td>
					<td><code>4</code></td>
					<td>Cards shown on each side of the centre; the rest are hidden and inert.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Carousel'</code></td>
					<td>Accessible name of the carousel region.</td>
				</tr>
				<tr>
					<td><code>children</code></td>
					<td><code>Snippet&lt;[T, number]&gt;</code></td>
					<td>—</td>
					<td>Custom card body, called with <code>(item, index)</code>.</td>
				</tr>
				<tr>
					<td><code>onchange</code></td>
					<td><code>(index: number, item: T) =&gt; void</code></td>
					<td>—</td>
					<td>Fires whenever the focal card changes.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ics-demo {
		display: grid;
		gap: 32px;
	}
	.ics-section h4 {
		margin: 0 0 4px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.ics-hint {
		margin: 0 0 12px;
		color: var(--fg-2);
		font-size: 14px;
		line-height: 1.5;
	}
	.ics-hint code,
	.ics-state code {
		font-family: var(--font-mono);
		color: var(--fg-1);
	}
	.ics-controls-panel {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
		padding: 18px 20px;
		margin-bottom: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.ics-slider,
	.ics-control {
		display: grid;
		gap: 8px;
		align-content: start;
	}
	.ics-slider input {
		width: 100%;
		accent-color: var(--accent);
	}
	.ics-label {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}
	.ics-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.ics-btn {
		appearance: none;
		border: 1px solid var(--border);
		background: var(--surface);
		padding: 7px 12px;
		border-radius: var(--r-1);
		font-size: 13px;
		cursor: pointer;
		color: var(--fg-1);
		transition:
			border-color var(--dur-fast),
			color var(--dur-fast),
			background var(--dur-fast);
	}
	.ics-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.ics-btn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	.ics-btn--active,
	.ics-btn--active:hover {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--fg-on-dark, #ffffff);
	}
	.ics-stage-wrap {
		padding: 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.ics-state {
		margin: 12px 0 0;
		font-size: 13px;
		color: var(--fg-2);
	}
	.ics-swatch {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		gap: 4px;
		padding: 18px;
		border-radius: 14px;
		background: var(--swatch);
		color: #ffffff;
		box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
	}
	.ics-swatch__name {
		font-family: var(--font-display);
		font-size: 22px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
	}
	.ics-swatch__hex {
		font-family: var(--font-mono);
		font-size: 12px;
		opacity: 0.9;
	}
</style>
