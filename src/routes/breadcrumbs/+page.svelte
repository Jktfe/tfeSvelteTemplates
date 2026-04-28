<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	const shortTrail = [
		{ label: 'Home', href: '/' },
		{ label: 'Components', href: '/components' },
		{ label: 'Breadcrumbs' }
	];

	const fullTrail = [
		{ label: 'Home', href: '/' },
		{ label: 'Components', href: '/components' },
		{ label: 'Navigation', href: '/components/navigation' },
		{ label: 'Breadcrumbs' }
	];

	const longTrail = [
		{ label: 'Home', href: '/' },
		{ label: 'Workspace', href: '/workspace' },
		{ label: 'Projects', href: '/workspace/projects' },
		{ label: 'Q2 Initiatives', href: '/workspace/projects/q2' },
		{ label: 'Mobile App Redesign', href: '/workspace/projects/q2/mobile-redesign' },
		{ label: 'Design Reviews', href: '/workspace/projects/q2/mobile-redesign/reviews' },
		{ label: 'Round 3 — Onboarding flow' }
	];

	const ecommerceTrail = [
		{ label: 'Home', href: '/' },
		{ label: 'Men', href: '/men' },
		{ label: 'Outerwear', href: '/men/outerwear' },
		{ label: 'Down jackets', href: '/men/outerwear/down' },
		{ label: 'Patagonia Down Sweater Hoody — Black' }
	];
</script>

<svelte:head>
	<title>Breadcrumbs | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-4xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">Breadcrumbs</h1>
			<p class="text-xl text-muted-foreground">
				Hierarchical path navigation with smart truncation, ARIA-correct semantics, and customisable separators.
			</p>
		</header>

		<section class="bg-white rounded-2xl p-12 border border-neutral-200 shadow-xl space-y-12">
			<div class="space-y-3">
				<h3 class="text-sm font-medium text-neutral-500">Short trail — default separator</h3>
				<Breadcrumbs items={shortTrail} />
			</div>

			<div class="space-y-3 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">Four levels — chevron separator</h3>
				<Breadcrumbs items={fullTrail} separator="›" />
			</div>

			<div class="space-y-3 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">Long trail — full path (7 levels)</h3>
				<Breadcrumbs items={longTrail} separator="/" />
				<p class="text-xs text-neutral-500">
					Long names get truncated to 18ch with ellipsis to keep the row tidy.
				</p>
			</div>

			<div class="space-y-3 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">Long trail — collapsed (maxVisible=4)</h3>
				<Breadcrumbs items={longTrail} separator="/" maxVisible={4} />
				<p class="text-xs text-neutral-500">
					First + … + last (maxVisible − 2). Always preserves where you started and where you are.
				</p>
			</div>

			<div class="space-y-3 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">E-commerce — arrow separator</h3>
				<Breadcrumbs items={ecommerceTrail} separator="→" />
				<p class="text-xs text-neutral-500">
					Useful for category pages where users want to step back up the tree.
				</p>
			</div>

			<div class="space-y-3 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">Custom aria-label</h3>
				<Breadcrumbs items={fullTrail} ariaLabel="You are here" />
				<p class="text-xs text-neutral-500">
					i18n-friendly — the wrapper nav reads "You are here" to assistive tech.
				</p>
			</div>
		</section>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Semantic <code>nav</code> &gt; <code>ol</code> &gt; <code>li</code> structure</li>
					<li><code>aria-current="page"</code> on the current crumb</li>
					<li>Separators are <code>aria-hidden</code> — never read aloud</li>
					<li>Customisable separator string (any glyph or short text)</li>
					<li>Smart truncation via <code>maxVisible</code> — keeps first &amp; last</li>
					<li>i18n-friendly <code>ariaLabel</code></li>
					<li>Honours <code>prefers-reduced-motion</code></li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">When to use</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Admin dashboards with deep object hierarchies</li>
					<li>E-commerce category drilldowns</li>
					<li>Documentation sites with section/sub-section/page nesting</li>
					<li>File-system-style applications</li>
				</ul>
			</div>
		</section>
	</div>
</div>
