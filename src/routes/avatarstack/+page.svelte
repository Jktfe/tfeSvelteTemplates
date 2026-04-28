<script lang="ts">
	import AvatarStack from '$lib/components/AvatarStack.svelte';

	const teamWithImages = [
		{ name: 'Ada Lovelace', src: 'https://i.pravatar.cc/96?img=1' },
		{ name: 'Grace Hopper', src: 'https://i.pravatar.cc/96?img=2' },
		{ name: 'Margaret Hamilton', src: 'https://i.pravatar.cc/96?img=3' },
		{ name: 'Katherine Johnson', src: 'https://i.pravatar.cc/96?img=4' },
		{ name: 'Hedy Lamarr', src: 'https://i.pravatar.cc/96?img=5' },
		{ name: 'Joan Clarke', src: 'https://i.pravatar.cc/96?img=6' },
		{ name: 'Annie Easley', src: 'https://i.pravatar.cc/96?img=7' }
	];

	const initialsOnly = [
		{ name: 'Ada Lovelace' },
		{ name: 'Grace Hopper' },
		{ name: 'Margaret Hamilton' },
		{ name: 'Katherine Johnson' }
	];

	const reactions = [
		{ name: 'Alex' },
		{ name: 'Bethany' },
		{ name: 'Camille' },
		{ name: 'Dylan' },
		{ name: 'Erin' },
		{ name: 'Felipe' },
		{ name: 'Gabi' },
		{ name: 'Hugo' },
		{ name: 'Ivy' },
		{ name: 'Jordan' },
		{ name: 'Kira' },
		{ name: 'Leo' }
	];

	const broken = [
		{ name: 'Broken Image User', src: 'https://invalid-host-404/never.jpg' },
		{ name: 'Working Image User', src: 'https://i.pravatar.cc/96?img=12' },
		{ name: 'Initials Only User' }
	];
</script>

<svelte:head>
	<title>AvatarStack | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-4xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">AvatarStack</h1>
			<p class="text-xl text-muted-foreground">
				Overlapping circular avatars with automatic <code>+N more</code> overflow, image fallbacks, and deterministic colours.
			</p>
		</header>

		<section class="bg-neutral-950 rounded-2xl p-12 border border-neutral-800 shadow-2xl space-y-12">
			<div class="flex flex-col items-center space-y-4">
				<h3 class="text-sm font-medium text-neutral-400">Team with images (max 4 of 7)</h3>
				<AvatarStack people={teamWithImages} max={4} />
			</div>

			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-800">
				<h3 class="text-sm font-medium text-neutral-400">Initials only — deterministic colours per name</h3>
				<AvatarStack people={initialsOnly} max={4} size={44} />
			</div>

			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-800">
				<h3 class="text-sm font-medium text-neutral-400">Reaction summary (max 5 of 12)</h3>
				<AvatarStack people={reactions} max={5} size={28} overlap={10} />
			</div>

			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-800">
				<h3 class="text-sm font-medium text-neutral-400">Graceful failure: 1 broken URL → initials swap</h3>
				<AvatarStack people={broken} max={5} size={48} />
				<p class="text-xs text-neutral-500">The first avatar's image URL 404s; it auto-falls back to initials.</p>
			</div>

			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-800">
				<h3 class="text-sm font-medium text-neutral-400">Hide the overflow tile</h3>
				<AvatarStack people={teamWithImages} max={3} showOverflow={false} />
			</div>
		</section>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Image → initials → deterministic colour fallback chain</li>
					<li>Configurable size, overlap, max, border colour</li>
					<li>Optional <code>+N</code> overflow with next-person tooltip</li>
					<li>Each avatar is a focusable button with aria-label</li>
					<li>Honours <code>prefers-reduced-motion</code></li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Usage</h2>
				<pre class="bg-neutral-900 p-4 rounded-lg overflow-x-auto text-sm border border-neutral-800"><code>{`<script lang="ts">
  import AvatarStack from '$lib/components/AvatarStack.svelte';

  const team = [
    { name: 'Ada Lovelace', src: '/img/ada.jpg' },
    { name: 'Grace Hopper' },
    { name: 'Margaret Hamilton' }
  ];
</${''}script>

<AvatarStack people={team} max={3} />`}</code></pre>
			</div>
		</section>
	</div>
</div>
