<!--
	SwishButton Demo Page (TFE shell)
-->

<script lang="ts">
	import SwishButton from '$lib/components/SwishButton.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/swishbutton')!;

	let clickCount = $state(0);

	const usageSnippet = `<script>
  import SwishButton from '$lib/components/SwishButton.svelte';

  let count = $state(0);
</${'script'}>

<SwishButton text="Get started" onclick={() => count++} />`;

	const codeExplanation =
		'SwishButton swaps a static label for a sliding text track on hover. The accent dot expands behind the arrow on the same timeline, so the motion always reads as one gesture. Native button semantics, focus ring, and disabled state all stay intact — extra Tailwind utilities can be passed via the class prop without touching the component source.';
</script>

<svelte:head>
	<title>SwishButton — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Animated button with sliding text and an expanding accent. Pure Svelte 5, native button semantics."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Hover', 'Tailwind-friendly', 'Accessible']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="sw-demo">
			<div class="sw-row sw-row--hero">
				<SwishButton text="Get started" onclick={() => clickCount++} />
				<p class="sw-counter">Clicked {clickCount} times</p>
			</div>

			<div class="sw-grid">
				<div class="sw-cell">
					<SwishButton text="Learn more" />
					<span class="sw-cell__label">Information</span>
				</div>
				<div class="sw-cell">
					<SwishButton text="Buy now" />
					<span class="sw-cell__label">E-commerce</span>
				</div>
				<div class="sw-cell">
					<SwishButton text="Sign up" />
					<span class="sw-cell__label">Registration</span>
				</div>
				<div class="sw-cell">
					<SwishButton text="Download" />
					<span class="sw-cell__label">File action</span>
				</div>
			</div>

			<div class="sw-row">
				<SwishButton text="Wide" class="w-40" />
				<SwishButton text="Larger" class="w-36 p-3 text-lg" />
				<SwishButton text="Disabled" disabled />
			</div>
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
					<td><code>text</code></td>
					<td><code>string</code></td>
					<td><code>'Button'</code></td>
					<td>Visible button label.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Additional Tailwind / utility classes appended to the button element.</td>
				</tr>
				<tr>
					<td><code>...rest</code></td>
					<td><code>HTMLButtonAttributes</code></td>
					<td>—</td>
					<td>Native button props (<code>onclick</code>, <code>disabled</code>, <code>type</code>, etc.) flow through.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.sw-demo {
		display: grid;
		gap: 28px;
		justify-items: center;
	}
	.sw-row {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		align-items: center;
		justify-content: center;
	}
	.sw-row--hero {
		flex-direction: column;
		gap: 12px;
	}
	.sw-counter {
		margin: 0;
		font-size: 13px;
		color: var(--fg-2);
	}
	.sw-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 16px;
		width: 100%;
	}
	.sw-cell {
		display: grid;
		gap: 8px;
		justify-items: center;
		padding: 18px;
		border-radius: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.sw-cell__label {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
</style>
