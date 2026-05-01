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
			<h3>Feature showcase</h3>
			<BentoGrid items={demoItems} cols={3} gap={24} />
		</div>
		<div class="bg-section">
			<h3>Visual gallery</h3>
			<BentoGrid items={galleryItems} cols={3} gap={16} itemClass="!justify-center text-center" />
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
		margin-top: 24px;
	}
	.bg-section h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
</style>
