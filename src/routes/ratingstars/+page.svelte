<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import RatingStars from '$lib/components/RatingStars.svelte';

	const shell = catalogShellPropsForSlug('/ratingstars')!;

	let pizza = $state(4);
	let chef = $state(0);

	const reviews = [
		{ name: 'Aria J.', stars: 5, comment: 'Outstanding — would order again.' },
		{ name: 'Bilal K.', stars: 3.5, comment: 'Solid, but the dough was a bit dense.' },
		{ name: 'Carmen D.', stars: 4, comment: 'Loved the toppings. Delivery was slow.' }
	];

	const codeExplanation =
		'Each star is a real input[type="radio"] inside a radiogroup, so the keyboard story (Left/Right to move, Space/Enter to commit) comes from the platform. Hover styling is pure CSS sibling selectors — no JS hover state. Read-only mode swaps to role="img" with an aria-label of the value, and supports fractional values that render the trailing star half-filled via a clip-path overlay.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Radio', 'A11y', 'Keyboard', 'Theme-aware']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="rating-demo">
			<section>
				<h3>Interactive</h3>
				<div class="row">
					<RatingStars value={pizza} onChange={(v) => (pizza = v)} ariaLabel="Rate the pizza" />
					<span>Pizza: <strong>{pizza}</strong> / 5</span>
				</div>
				<div class="row">
					<RatingStars value={chef} onChange={(v) => (chef = v)} ariaLabel="Rate the chef" />
					<span>{chef === 0 ? 'No rating yet' : `Chef: ${chef} / 5`}</span>
				</div>
			</section>

			<section>
				<h3>Read-only with half stars</h3>
				<ul class="reviews">
					{#each reviews as review (review.name)}
						<li>
							<div>
								<div class="who">{review.name}</div>
								<div class="comment">{review.comment}</div>
							</div>
							<RatingStars value={review.stars} readonly size={20} />
						</li>
					{/each}
				</ul>
			</section>

			<section>
				<h3>Custom scales &amp; palettes</h3>
				<div class="row">
					<RatingStars value={7} max={10} size={22} readonly />
					<span>10-point scale, read-only.</span>
				</div>
				<div class="row">
					<RatingStars value={4} filledColor="#ef4444" emptyColor="#fee2e2" size={32} readonly />
					<span>Custom palette, 32 px.</span>
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
					<td><code>value</code></td>
					<td><code>number</code></td>
					<td><code>0</code></td>
					<td>Current rating; supports fractional values when readonly.</td>
				</tr>
				<tr>
					<td><code>max</code></td>
					<td><code>number</code></td>
					<td><code>5</code></td>
					<td>Total number of stars.</td>
				</tr>
				<tr>
					<td><code>readonly</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Render as a static rating display.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>number</code></td>
					<td><code>28</code></td>
					<td>Star edge length in pixels.</td>
				</tr>
				<tr>
					<td><code>filledColor</code> / <code>emptyColor</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Inline-style overrides for the SVG fills.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Rating'</code></td>
					<td>Group label announced by screen readers.</td>
				</tr>
				<tr>
					<td><code>onChange</code></td>
					<td><code>(value) =&gt; void</code></td>
					<td>—</td>
					<td>Fires when the user picks a new rating.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.rating-demo {
		display: grid;
		gap: 2rem;
	}

	.rating-demo h3 {
		font-size: 0.95rem;
		margin: 0 0 0.6rem;
		color: var(--fg-1);
	}

	.row {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.6rem;
		font-size: 0.9rem;
		color: var(--fg-2);
	}

	.reviews {
		list-style: none;
		padding: 0;
		margin: 0;
		border-top: 1px solid var(--border);
	}

	.reviews li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.85rem 0;
		border-bottom: 1px solid var(--border);
	}

	.who {
		font-weight: 600;
		color: var(--fg-1);
	}

	.comment {
		font-size: 0.85rem;
		color: var(--fg-2);
	}
</style>
