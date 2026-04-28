<script lang="ts">
	import BadgePill from '$lib/components/BadgePill.svelte';

	let tags = $state(['Frontend', 'TypeScript', 'Svelte', 'Accessibility']);
	function removeTag(tag: string) {
		tags = tags.filter((t) => t !== tag);
	}
	function resetTags() {
		tags = ['Frontend', 'TypeScript', 'Svelte', 'Accessibility'];
	}

	const tones = ['neutral', 'info', 'success', 'warning', 'danger', 'brand'] as const;
	const variants = ['soft', 'solid', 'outline'] as const;
</script>

<svelte:head>
	<title>BadgePill | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-4xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">BadgePill</h1>
			<p class="text-xl text-muted-foreground">
				A compact rounded pill with 3 variants × 6 tones × 3 sizes — 54 ready-made looks from one component.
			</p>
		</header>

		<!-- Variant × Tone matrix -->
		<section class="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm space-y-8">
			<h2 class="text-2xl font-semibold">Variant × Tone matrix</h2>

			{#each variants as variant (variant)}
				<div class="space-y-3">
					<h3 class="text-sm font-medium text-neutral-500 uppercase tracking-wide">
						{variant}
					</h3>
					<div class="flex flex-wrap gap-2">
						{#each tones as tone (tone)}
							<BadgePill label={tone} {tone} {variant} />
						{/each}
					</div>
				</div>
			{/each}
		</section>

		<!-- Sizes -->
		<section class="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm space-y-4">
			<h2 class="text-2xl font-semibold">Sizes</h2>
			<div class="flex items-center gap-3 flex-wrap">
				<BadgePill label="Small" tone="info" size="sm" />
				<BadgePill label="Medium (default)" tone="info" size="md" />
				<BadgePill label="Large" tone="info" size="lg" />
			</div>
		</section>

		<!-- Status dots -->
		<section class="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm space-y-4">
			<h2 class="text-2xl font-semibold">Status indicators (with dot)</h2>
			<div class="flex flex-wrap gap-2">
				<BadgePill label="Active" tone="success" dot />
				<BadgePill label="Pending" tone="warning" dot />
				<BadgePill label="Failed" tone="danger" dot />
				<BadgePill label="Draft" tone="neutral" dot />
				<BadgePill label="Beta" tone="brand" dot variant="solid" />
				<BadgePill label="Reviewing" tone="info" dot variant="outline" />
			</div>
		</section>

		<!-- Dismissible tags -->
		<section class="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm space-y-4">
			<h2 class="text-2xl font-semibold">Dismissible tag picker</h2>
			<p class="text-sm text-neutral-500">
				Click the × on any pill to remove it. The state is local to this page.
			</p>
			<div class="flex flex-wrap gap-2 min-h-[2rem]">
				{#each tags as tag (tag)}
					<BadgePill
						label={tag}
						tone="info"
						dismissible
						onDismiss={() => removeTag(tag)}
					/>
				{/each}
				{#if tags.length === 0}
					<span class="text-sm text-neutral-400 italic">All tags dismissed.</span>
				{/if}
			</div>
			<button
				type="button"
				onclick={resetTags}
				class="text-sm font-medium text-blue-600 hover:underline"
			>
				Reset tags
			</button>
		</section>

		<!-- Real-world example: PR row -->
		<section class="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm space-y-4">
			<h2 class="text-2xl font-semibold">In context: pull request row</h2>
			<div class="border border-neutral-200 rounded-lg p-4 flex items-center gap-3 flex-wrap">
				<span class="font-medium text-neutral-900">#1247</span>
				<span class="text-neutral-700">feat: add BadgePill component to library</span>
				<BadgePill label="ready" tone="success" dot size="sm" />
				<BadgePill label="frontend" tone="info" variant="outline" size="sm" />
				<BadgePill label="needs-review" tone="warning" size="sm" />
				<BadgePill label="+12 / -3" tone="neutral" variant="outline" size="sm" />
			</div>
		</section>

		<!-- Custom snippet content -->
		<section class="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm space-y-4">
			<h2 class="text-2xl font-semibold">Custom snippet content</h2>
			<p class="text-sm text-neutral-500">
				Pass children as a snippet for more than just plain text.
			</p>
			<div class="flex flex-wrap gap-2">
				<BadgePill tone="brand" variant="solid">
					✨ <strong>Pro</strong>
				</BadgePill>
				<BadgePill tone="success">
					<strong>3</strong>&nbsp;passing
				</BadgePill>
				<BadgePill tone="danger">
					<strong>1</strong>&nbsp;failing
				</BadgePill>
			</div>
		</section>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Three variants (solid / soft / outline)</li>
					<li>Six tones with semantic meaning</li>
					<li>Three sizes (sm / md / lg)</li>
					<li>Optional leading status dot</li>
					<li>Optional dismiss <code>×</code> button</li>
					<li>Honours <code>prefers-reduced-motion</code></li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Usage</h2>
				<pre class="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm border border-neutral-800"><code>{`<script lang="ts">
  import BadgePill from '$lib/components/BadgePill.svelte';
</${''}script>

<BadgePill label="Active" tone="success" dot />

<BadgePill
  label="Frontend"
  tone="info"
  dismissible
  onDismiss={() => removeTag('frontend')}
/>`}</code></pre>
			</div>
		</section>
	</div>
</div>
