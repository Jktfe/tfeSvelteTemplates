<script lang="ts">
	import FloatingDock from '$lib/components/FloatingDock.svelte';
	import type { FloatingDockItem } from '$lib/types';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';

	// Custom items for the demo
	const customItems: FloatingDockItem[] = [
		{ id: 'f1', title: 'Folder', icon: '📁' },
		{ id: 'f2', title: 'Calendar', icon: '📅', href: '/calendarheatmap' },
		{ id: 'f3', title: 'Music', icon: '🎵' },
		{ id: 'f4', title: 'Photos', icon: '📸' },
		{ id: 'f5', title: 'Maps', icon: '🗺️', href: '/maps' },
		{ id: 'f6', title: 'Terminal', icon: '💻' }
	];

	const usageExample = [
		'<script lang="ts">',
		"  import FloatingDock from '$lib/components/FloatingDock.svelte';",
		'',
		'  const items = [',
		"    { id: 1, title: 'Home', icon: '🏠', href: '/' },",
		"    { id: 2, title: 'Docs', icon: '📚' }",
		'  ];',
		'<\\/script>',
		'',
		'<FloatingDock {items} magnification={2.5} distance={150} />'
	].join('\n').replace('<\\/script>', '<' + '/script>');
</script>

<svelte:head>
	<title>Floating Dock | Svelte Templates</title>
	<meta name="description" content="Interactive macOS-style floating navigation bar with hover magnification" />
</svelte:head>

<div class="container mx-auto px-4 py-8 pb-32">
	<div class="mb-12">
		<h1 class="text-4xl font-bold tracking-tight mb-4">Floating Dock</h1>
		<p class="text-xl text-slate-600 dark:text-slate-400 mb-6">
			A premium, high-interaction navigation bar with proximity-based icon magnification.
		</p>
		<DatabaseStatus usingDatabase={false} />
	</div>

	<!-- Interaction Showcase -->
	<section class="mb-48">
		<h2 class="text-2xl font-semibold mb-8">Interaction Showcase</h2>
		<div class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
			<p class="mb-4 text-slate-600 dark:text-slate-400 italic">
				Hover over the dock icons at the bottom of the screen to see the magnification effect.
			</p>
			<p class="text-sm text-blue-600 dark:text-blue-400 font-medium">
				Tip: The "Calendar" and "Maps" icons are functional links.
			</p>
		</div>
	</section>

	<!-- Config Variations -->
	<section class="grid md:grid-cols-2 gap-12 mb-20">
		<div>
			<h2 class="text-2xl font-semibold mb-4">Magnification Math</h2>
			<div class="prose dark:prose-invert">
				<p>
					The Floating Dock uses a <strong>cosine-based scaling function</strong> to create a smooth "wave" effect.
					As your mouse approaches an icon, it scales up dynamically based on its distance from the cursor.
				</p>
				<ul class="list-disc pl-5 space-y-2">
					<li><strong>Distance:</strong> Controls the range of influence (how far the mouse triggers scaling).</li>
					<li><strong>Magnification:</strong> Controls the maximum scale factor (how large the icon gets).</li>
					<li><strong>Responsiveness:</strong> On mobile, it automatically switches to a standard scrollable bar.</li>
				</ul>
			</div>
		</div>

		<div class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
			<h2 class="text-2xl font-semibold mb-4">Key Features</h2>
			<ul class="space-y-4">
				<li class="flex items-start gap-3">
					<span class="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full p-1 mt-1">
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
					</span>
					<span><strong>Zero Deps:</strong> Built purely with Svelte 5 and CSS.</span>
				</li>
				<li class="flex items-start gap-3">
					<span class="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full p-1 mt-1">
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
					</span>
					<span><strong>Smooth FPS:</strong> Optimized using CSS transforms for 60fps interaction.</span>
				</li>
				<li class="flex items-start gap-3">
					<span class="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full p-1 mt-1">
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
					</span>
					<span><strong>A11y First:</strong> Full keyboard navigation and screen reader support.</span>
				</li>
			</ul>
		</div>
	</section>

	<!-- Usage Info -->
	<section class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
		<h2 class="text-2xl font-semibold mb-4">Usage Example</h2>
		<pre class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>{usageExample}</code></pre>
	</section>

	<!-- The Docks -->
	<FloatingDock items={customItems} />
</div>

<style>
	.container {
		max-width: 1000px;
	}
</style>
