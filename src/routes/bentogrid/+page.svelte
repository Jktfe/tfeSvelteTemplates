<script lang="ts">
	import BentoGrid from '$lib/components/BentoGrid.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import type { BentoItem } from '$lib/types';

	const shell = catalogShellPropsForSlug('/bentogrid')!;

	const demoItems: BentoItem[] = [
		{
			id: 1,
			title: 'Core Engine',
			description: 'Powered by Svelte 5 runes for maximum performance and reactive clarity.',
			icon: '🚀',
			colSpan: 2,
			rowSpan: 2,
			class: 'bg-orange-50 dark:bg-orange-900/20'
		},
		{
			id: 2,
			title: 'Zero Deps',
			description: 'Pure Svelte and CSS. No bloated libraries.',
			icon: '📦',
			colSpan: 1,
			rowSpan: 1,
			class: 'bg-green-50 dark:bg-green-900/20'
		},
		{
			id: 3,
			title: 'Responsive by Design',
			description: 'Seamlessly reflows from mobile to desktop using CSS Grid.',
			icon: '📱',
			colSpan: 1,
			rowSpan: 1,
			class: 'bg-blue-50 dark:bg-blue-900/20'
		},
		{
			id: 4,
			title: 'Gold Standard',
			description: 'Following strict quality guidelines for production readiness.',
			icon: '🏆',
			colSpan: 1,
			rowSpan: 2,
			class: 'bg-amber-50 dark:bg-amber-900/20'
		},
		{
			id: 5,
			title: 'Dark Mode Support',
			description: 'Elegant aesthetics for any environment.',
			icon: '🌙',
			colSpan: 2,
			rowSpan: 1,
			class: 'bg-indigo-50 dark:bg-indigo-900/20'
		},
		{
			id: 6,
			title: 'Accessible',
			description: 'Semantic HTML and keyboard support out of the box.',
			icon: '♿',
			colSpan: 1,
			rowSpan: 1,
			class: 'bg-slate-50 dark:bg-slate-900/20'
		}
	];

	const galleryItems: BentoItem[] = [
		{
			id: 'g1',
			title: 'Mountain Retreat',
			image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
			colSpan: 2,
			rowSpan: 2
		},
		{
			id: 'g2',
			title: 'Ocean Breeze',
			image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop',
			colSpan: 1,
			rowSpan: 1
		},
		{
			id: 'g3',
			title: 'Forest Path',
			image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
			colSpan: 1,
			rowSpan: 1
		}
	];

	// Dense dashboard layout — a wide banner across the top, a 2x2 hero on the
	// left, then a cluster of 1x1 metric tiles filling the remaining cells.
	// Demonstrates how the grid copes with a high item count at four columns.
	const dashboardItems: BentoItem[] = [
		{
			id: 'd-banner',
			title: 'Q3 release highlights',
			description: 'Spans the full width — shipping themes, motion preset library, and 12 new components.',
			icon: '📣',
			colSpan: 4,
			rowSpan: 1,
			class: 'bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-900/30 dark:to-pink-900/30'
		},
		{
			id: 'd-hero',
			title: 'Active users',
			description: '24,318 — up 12% week on week.',
			icon: '📈',
			colSpan: 2,
			rowSpan: 2,
			class: 'bg-emerald-50 dark:bg-emerald-900/20'
		},
		{ id: 'd-1', title: 'Revenue', description: '£42,108', icon: '💷', class: 'bg-amber-50 dark:bg-amber-900/20' },
		{ id: 'd-2', title: 'Sessions', description: '187k', icon: '🌐', class: 'bg-sky-50 dark:bg-sky-900/20' },
		{ id: 'd-3', title: 'Bounce rate', description: '32.4%', icon: '↩️', class: 'bg-rose-50 dark:bg-rose-900/20' },
		{ id: 'd-4', title: 'Avg. session', description: '4m 12s', icon: '⏱️', class: 'bg-indigo-50 dark:bg-indigo-900/20' },
		{ id: 'd-5', title: 'New signups', description: '892', icon: '✨', class: 'bg-fuchsia-50 dark:bg-fuchsia-900/20' },
		{ id: 'd-6', title: 'Churn', description: '1.8%', icon: '🚪', class: 'bg-slate-50 dark:bg-slate-900/20' },
		{ id: 'd-7', title: 'NPS', description: '+47', icon: '💚', class: 'bg-lime-50 dark:bg-lime-900/20' },
		{ id: 'd-8', title: 'Tickets open', description: '14', icon: '🎫', class: 'bg-orange-50 dark:bg-orange-900/20' }
	];

	// Single hero, Guardian-style: one 2x2 lead surrounded by four 1x1
	// supporting tiles. Good for editorial or product-pitch homepages.
	const heroItems: BentoItem[] = [
		{
			id: 'h-lead',
			title: 'The lead story',
			description: 'A flagship feature card that anchors the layout and dominates the optical weight.',
			icon: '⭐',
			colSpan: 2,
			rowSpan: 2,
			class: 'bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30'
		},
		{ id: 'h-1', title: 'Supporting one', description: 'Context, depth, related angle.', icon: '📰', class: 'bg-blue-50 dark:bg-blue-900/20' },
		{ id: 'h-2', title: 'Supporting two', description: 'Counterpoint or commentary.', icon: '💬', class: 'bg-amber-50 dark:bg-amber-900/20' },
		{ id: 'h-3', title: 'Supporting three', description: 'Data point or quick read.', icon: '📊', class: 'bg-emerald-50 dark:bg-emerald-900/20' },
		{ id: 'h-4', title: 'Supporting four', description: 'Editorial pick or sidebar item.', icon: '🔖', class: 'bg-violet-50 dark:bg-violet-900/20' }
	];

	// Mosaic — irregular spans. Demonstrates how colSpan/rowSpan combine to
	// produce magazine-style asymmetric layouts. The 3x1 banner, 1x3 column
	// and central 2x2 force the auto-flow to interlock the smaller tiles.
	const mosaicItems: BentoItem[] = [
		{
			id: 'm-banner',
			title: 'Wide banner',
			description: 'Spans 3 columns — sets the editorial tone.',
			icon: '🎬',
			colSpan: 3,
			rowSpan: 1,
			class: 'bg-cyan-50 dark:bg-cyan-900/20'
		},
		{
			id: 'm-tower',
			title: 'Tall column',
			description: 'Spans 3 rows — perfect for a feature, table of contents, or vertical advert.',
			icon: '🏛️',
			colSpan: 1,
			rowSpan: 3,
			class: 'bg-fuchsia-50 dark:bg-fuchsia-900/20'
		},
		{
			id: 'm-square',
			title: 'Centre square',
			description: 'A 2x2 anchor — the optical centre of gravity.',
			icon: '🟪',
			colSpan: 2,
			rowSpan: 2,
			class: 'bg-amber-50 dark:bg-amber-900/20'
		},
		{ id: 'm-1', title: 'Filler one', icon: '🔹', class: 'bg-slate-50 dark:bg-slate-900/20' },
		{ id: 'm-2', title: 'Filler two', icon: '🔸', class: 'bg-rose-50 dark:bg-rose-900/20' }
	];

	const usageSnippet = `<script>
  import BentoGrid from '$lib/components/BentoGrid.svelte';
  import type { BentoItem } from '$lib/types';

  const items: BentoItem[] = [
    { id: 1, title: 'Core Engine', icon: '🚀', colSpan: 2, rowSpan: 2 },
    { id: 2, title: 'Zero Deps', icon: '📦' },
    // ...
  ];
</${'script'}>

<BentoGrid {items} cols={3} gap={24} />`;

	const codeExplanation =
		'BentoGrid is a CSS-grid layout primitive: each item declares its colSpan and rowSpan, the grid auto-flows the rest. Pair it with image-only items for a gallery, or icon + description items for a feature wall.';
</script>

<svelte:head>
	<title>Bento Grid — TFE / Svelte Templates</title>
	<meta name="description" content="Responsive Bento-box style grid component for Svelte 5." />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'CSS Grid', 'Responsive', 'Layout']}
>
	{#snippet demo()}
		<div class="bg-section">
			<header class="bg-section__header">
				<h3>Feature showcase — three columns</h3>
				<p>Six tiles, mixed spans, the canonical pitch-page layout.</p>
			</header>
			<BentoGrid items={demoItems} cols={3} gap={24} />
		</div>

		<div class="bg-section">
			<header class="bg-section__header">
				<h3>Visual gallery — image-only tiles</h3>
				<p>Same grid mechanics, but each tile is just an image. Centre-aligned captions.</p>
			</header>
			<BentoGrid items={galleryItems} cols={3} gap={16} itemClass="!justify-center text-center" />
		</div>

		<div class="bg-section">
			<header class="bg-section__header">
				<h3>Dense dashboard — four columns</h3>
				<p>
					A wide banner, a 2x2 hero, and a cluster of 1x1 KPI tiles. Demonstrates how the grid
					handles a higher item count and a denser layout.
				</p>
			</header>
			<BentoGrid items={dashboardItems} cols={4} gap={16} />
		</div>

		<div class="bg-section">
			<header class="bg-section__header">
				<h3>Single hero, four supporting tiles</h3>
				<p>
					Guardian-style editorial layout — one big lead anchored by smaller supporting items.
				</p>
			</header>
			<BentoGrid items={heroItems} cols={3} gap={16} />
		</div>

		<div class="bg-section">
			<header class="bg-section__header">
				<h3>Mosaic — irregular spans</h3>
				<p>
					A 3x1 banner, a 1x3 tower, a 2x2 centre square and two 1x1 fillers — proves the
					auto-flow algorithm interlocks irregular shapes cleanly.
				</p>
			</header>
			<BentoGrid items={mosaicItems} cols={4} gap={16} />
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
					<td><code>BentoItem[]</code></td>
					<td><code>[]</code></td>
					<td>Items to render. Each can declare title, description, icon, image, colSpan and rowSpan.</td>
				</tr>
				<tr>
					<td><code>cols</code></td>
					<td><code>number</code></td>
					<td><code>3</code></td>
					<td>Number of columns in the grid.</td>
				</tr>
				<tr>
					<td><code>gap</code></td>
					<td><code>number</code></td>
					<td><code>16</code></td>
					<td>Gap between cells in pixels.</td>
				</tr>
				<tr>
					<td><code>itemClass</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Additional class applied to every item.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.bg-section {
		display: grid;
		gap: 12px;
	}
	.bg-section + .bg-section {
		margin-top: 28px;
	}
	.bg-section__header h3 {
		margin: 0 0 4px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.bg-section__header p {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--fg-2);
	}
</style>
