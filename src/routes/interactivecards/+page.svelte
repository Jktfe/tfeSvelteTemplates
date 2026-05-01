<script lang="ts">
	import InteractiveCards from '$lib/components/InteractiveCards.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/interactivecards')!;

	const usageSnippet = `<script>
  import InteractiveCards from '$lib/components/InteractiveCards.svelte';
<\/script>

<!-- The component manages its own sticky-pinned scroll region -->
<InteractiveCards />`;

	const codeExplanation =
		'InteractiveCards is a multi-phase scroll-driven gallery: cards rise from below, fan into a parabolic arc, then travel along a curved diagonal conveyor. Click a card for a detail view with size, material and add-to-cart pills. Layout pinning uses native position: sticky inside a tall outer spacer — no GSAP required — and per-frame spring interpolation runs through requestAnimationFrame.';
</script>

<svelte:head>
	<title>InteractiveCards — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Scroll-driven Svelte 5 paintings portfolio with fan-to-conveyor card animation and detail view."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'Scroll', 'Sticky pin', 'Spring', 'Reduced-motion']}
>
	{#snippet demo()}
		<p class="ic-note">
			Scroll the page to step through the three phases: <strong>fan</strong> →
			<strong>conveyor</strong> → <strong>detail view</strong> (click a card). The component owns its
			own sticky pin and tall scroll spacer, so let it fill the route below.
		</p>
		<div class="ic-frame">
			<InteractiveCards />
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
					<td><code>projects</code></td>
					<td><code>InteractiveProject[]</code></td>
					<td>fallback constants</td>
					<td>Paintings to render in the conveyor and detail view.</td>
				</tr>
				<tr>
					<td><code>testimonials</code></td>
					<td><code>InteractiveTestimonial[]</code></td>
					<td>fallback constants</td>
					<td>Testimonials shown in the awards / quotes section.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ic-note {
		margin: 0 0 16px;
		color: var(--fg-2);
		font-size: 14px;
		line-height: 1.6;
	}
	.ic-note strong {
		color: var(--fg-1);
	}
	.ic-frame {
		border-radius: var(--r-2);
		overflow: hidden;
		border: 1px solid var(--border);
		background: var(--surface);
	}
</style>
