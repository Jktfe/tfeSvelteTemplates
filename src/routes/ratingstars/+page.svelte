<script lang="ts">
	import RatingStars from '$lib/components/RatingStars.svelte';

	let pizza = $state(4);
	let chef = $state(0);

	const reviews = [
		{ name: 'Aria J.', stars: 5, comment: 'Outstanding — would order again.' },
		{ name: 'Bilal K.', stars: 3.5, comment: 'Solid, but the dough was a bit dense.' },
		{ name: 'Carmen D.', stars: 4, comment: 'Loved the toppings. Delivery was slow.' }
	];
</script>

<svelte:head>
	<title>RatingStars | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-5xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">RatingStars</h1>
			<p class="text-xl text-muted-foreground">
				Click to rate, hover to preview, keyboard arrows to navigate. Real radio inputs under the
				hood.
			</p>
		</header>

		<!-- Interactive -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Interactive</h2>
			<p class="text-sm text-neutral-500">
				Hover any star to preview the new value, click or press space/enter to commit.
			</p>
			<div class="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
				<div class="flex items-center gap-4">
					<RatingStars value={pizza} onChange={(v) => (pizza = v)} ariaLabel="Rate the pizza" />
					<span class="text-sm text-neutral-600">
						Pizza: <strong>{pizza}</strong> / 5
					</span>
				</div>
				<div class="flex items-center gap-4">
					<RatingStars value={chef} onChange={(v) => (chef = v)} ariaLabel="Rate the chef" />
					<span class="text-sm text-neutral-600">
						{chef === 0 ? 'No rating yet' : `Chef: ${chef} / 5`}
					</span>
				</div>
			</div>
		</section>

		<!-- Read-only with half stars -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Read-only (with half stars)</h2>
			<p class="text-sm text-neutral-500">
				For displaying existing ratings. Pass a fractional <code>value</code> like 3.5 and the last
				star renders half-filled.
			</p>
			<div class="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
				{#each reviews as review (review.name)}
					<div class="flex items-center justify-between p-4">
						<div>
							<div class="font-semibold text-neutral-900">{review.name}</div>
							<div class="text-sm text-neutral-500">{review.comment}</div>
						</div>
						<RatingStars value={review.stars} readonly size={20} />
					</div>
				{/each}
			</div>
		</section>

		<!-- Custom scales / colours -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Custom scales &amp; palettes</h2>
			<div class="grid md:grid-cols-2 gap-4">
				<div class="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
					<div class="text-sm font-semibold text-neutral-500 uppercase tracking-wide">10-point</div>
					<RatingStars value={7} max={10} size={22} readonly />
					<div class="text-sm text-neutral-500">A 10-star scale at 22px size, read-only.</div>
				</div>
				<div class="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
					<div class="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Brand</div>
					<RatingStars
						value={4}
						filledColor="#ef4444"
						emptyColor="#fee2e2"
						size={32}
						readonly
					/>
					<div class="text-sm text-neutral-500">Custom palette + 32px size.</div>
				</div>
			</div>
		</section>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Real <code>&lt;input type="radio"&gt;</code> elements — keyboard a11y for free</li>
					<li>Click to rate, hover to preview the new value</li>
					<li>Configurable max (default 5)</li>
					<li>Read-only mode with optional half stars (fractional values)</li>
					<li>Custom filled / empty colours and size</li>
					<li><code>role="radiogroup"</code> interactive, <code>role="img"</code> read-only</li>
					<li>Honours <code>prefers-reduced-motion</code></li>
					<li>Pure inline SVG, zero dependencies</li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Usage</h2>
				<pre
					class="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm border border-neutral-800"><code>{`<script lang="ts">
  import RatingStars from '$lib/components/RatingStars.svelte';

  let rating = $state(3);
</${''}script>

<!-- Interactive -->
<RatingStars value={rating} onChange={(v) => rating = v} />

<!-- Read-only with half stars -->
<RatingStars value={4.5} readonly />`}</code></pre>
			</div>
		</section>
	</div>
</div>
