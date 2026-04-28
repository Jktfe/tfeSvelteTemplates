<script lang="ts">
	import LiquidTabBar from '$lib/components/LiquidTabBar.svelte';

	const demoTabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'integrations', label: 'Integrations' },
		{ id: 'settings', label: 'Settings' }
	];

	let activeTab1 = $state('overview');
	let activeTab2 = $state('annually');
</script>

<svelte:head>
	<title>LiquidTabBar | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-4xl mx-auto space-y-8">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">LiquidTabBar</h1>
			<p class="text-xl text-muted-foreground">
				A navigation tab bar with an organic, gooey transition effect.
			</p>
		</header>

		<div class="bg-neutral-950 rounded-2xl p-12 border border-neutral-800 shadow-2xl flex flex-col items-center justify-center space-y-12">
			<!-- Standard Demo -->
			<div class="flex flex-col items-center space-y-4">
				<h3 class="text-sm font-medium text-neutral-400">Standard Navigation</h3>
				<LiquidTabBar tabs={demoTabs} bind:activeTab={activeTab1} />
				<p class="text-xs text-neutral-500 mt-2">Active: {activeTab1}</p>
			</div>

			<!-- Secondary Demo -->
			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-800 w-full max-w-sm">
				<h3 class="text-sm font-medium text-neutral-400">Secondary Tabs</h3>
				<LiquidTabBar 
					tabs={[
						{ id: 'monthly', label: 'Monthly' },
						{ id: 'annually', label: 'Annually (-20%)' }
					]} 
					bind:activeTab={activeTab2} 
				/>
				<p class="text-xs text-neutral-500 mt-2">Active: {activeTab2}</p>
			</div>
		</div>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Organic "gooey" SVG filter transition</li>
					<li>Pure CSS transform motion (high performance)</li>
					<li>Accessible tab semantics</li>
					<li>Zero external dependencies</li>
					<li>Svelte 5 runes reactive state</li>
				</ul>
			</div>
			
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Usage</h2>
				<pre class="bg-neutral-900 p-4 rounded-lg overflow-x-auto text-sm border border-neutral-800">
<code>{`&lt;script lang="ts"&gt;
  import LiquidTabBar from '$lib/components/LiquidTabBar.svelte';
  
  const tabs = [
    { id: 't1', label: 'Tab 1' },
    { id: 't2', label: 'Tab 2' }
  ];
  let activeTab = $state('t1');
&lt;/script&gt;

&lt;LiquidTabBar {tabs} bind:activeTab /&gt;`}</code></pre>
			</div>
		</section>
	</div>
</div>
