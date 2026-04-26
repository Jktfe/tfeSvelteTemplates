<script lang="ts">
	import BentoGrid from '$lib/components/BentoGrid.svelte';
	import type { BentoItem } from '$lib/types';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';

	// Demo data for the Bento Grid showcase
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

	// Gallery style bento
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
</script>

<svelte:head>
	<title>Bento Grid | Svelte Templates</title>
	<meta name="description" content="Responsive Bento-box style grid component for Svelte 5" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-12">
		<h1 class="text-4xl font-bold tracking-tight mb-4">Bento Grid</h1>
		<p class="text-xl text-slate-600 dark:text-slate-400 mb-6">
			A flexible, responsive grid system inspired by "Bento box" designs.
		</p>
		<DatabaseStatus usingDatabase={false} />
	</div>

	<!-- Feature Showcase -->
	<section class="mb-20">
		<h2 class="text-2xl font-semibold mb-8">Feature Showcase</h2>
		<BentoGrid items={demoItems} cols={3} gap={24} />
	</section>

	<!-- Image Gallery Style -->
	<section class="mb-20">
		<h2 class="text-2xl font-semibold mb-8">Visual Gallery Style</h2>
		<p class="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl">
			Bento grids are excellent for visual portfolios. Each tile can feature high-quality imagery with text overlays.
		</p>
		<BentoGrid items={galleryItems} cols={3} gap={16} itemClass="!justify-center text-center" />
	</section>

	<!-- Usage Info -->
	<section class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
		<h2 class="text-2xl font-semibold mb-4">Why use a Bento Grid?</h2>
		<div class="grid md:grid-cols-3 gap-8">
			<div>
				<h3 class="font-bold mb-2">Visual Hierarchy</h3>
				<p class="text-slate-600 dark:text-slate-400">
					Varying tile sizes naturally guide the user's eye to the most important content.
				</p>
			</div>
			<div>
				<h3 class="font-bold mb-2">High Density</h3>
				<p class="text-slate-600 dark:text-slate-400">
					Pack a lot of information into a compact space without feeling cluttered.
				</p>
			</div>
			<div>
				<h3 class="font-bold mb-2">Refined Aesthetic</h3>
				<p class="text-slate-600 dark:text-slate-400">
					A modern, clean look that works perfectly for landing pages and dashboards.
				</p>
			</div>
		</div>
	</section>
</div>

<style>
	/* Custom demo page styles */
	.container {
		max-width: 1200px;
	}
</style>
