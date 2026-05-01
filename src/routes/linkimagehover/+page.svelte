<!--
	LinkImageHover Demo Page (TFE shell)
-->

<script lang="ts">
	import LinkImageHover from '$lib/components/LinkImageHover.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import type { PageData } from './$types';

	const shell = catalogShellPropsForSlug('/linkimagehover')!;

	let { data }: { data: PageData } = $props();
	let cityLinks = $derived(data.cityLinks);
	let natureLinks = $derived(data.natureLinks);

	const usageSnippet = `<script>
  import LinkImageHover from '$lib/components/LinkImageHover.svelte';
</${'script'}>

<LinkImageHover
  href="https://en.wikipedia.org/wiki/Mumbai"
  text="Mumbai"
  imageSrc="https://example.com/mumbai.jpg"
  imageAlt="Mumbai skyline"
  imageWidth="h-44 w-44"
/>`;

	const codeExplanation =
		'LinkImageHover keeps the link as a real anchor — accessible by default — and conditionally renders a floating preview while the cursor is over it. Svelte transitions handle the blur fade-in, so there is no animation library to import. Touch users get the link without the preview because the hover state never activates.';
</script>

<svelte:head>
	<title>LinkImageHover — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Inline links that reveal an image preview on hover. Pure Svelte 5, accessible by default."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Hover', 'Accessible', 'Database-backed']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="lh-demo">
			<section class="lh-section">
				<h3>Single link</h3>
				<div class="lh-stage">
					<LinkImageHover
						href="https://en.wikipedia.org/wiki/Mumbai"
						text="Mumbai City"
						imageSrc="https://i.pinimg.com/736x/7e/61/74/7e6174c858a5aa169de033f55fc3050c.jpg"
						imageAlt="Mumbai City"
					/>
				</div>
			</section>

			<section class="lh-section">
				<h3>Cities — database-backed grid</h3>
				<div class="lh-stage">
					<div class="lh-grid">
						{#each cityLinks as link (link.href)}
							<LinkImageHover
								href={link.href}
								text={link.text}
								imageSrc={link.imageSrc}
								imageAlt={link.imageAlt}
							/>
						{/each}
					</div>
				</div>
			</section>

			<section class="lh-section">
				<h3>Nature — alternate category</h3>
				<div class="lh-stage">
					<div class="lh-grid">
						{#each natureLinks as link (link.href)}
							<LinkImageHover
								href={link.href}
								text={link.text}
								imageSrc={link.imageSrc}
								imageAlt={link.imageAlt}
							/>
						{/each}
					</div>
				</div>
			</section>

			<section class="lh-section">
				<h3>Custom image sizes</h3>
				<div class="lh-stage lh-stage--row">
					<div class="lh-size">
						<LinkImageHover
							href="https://example.com"
							text="Small"
							imageSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"
							imageAlt="Mountain"
							imageWidth="h-32 w-32"
						/>
						<span class="lh-size__label">h-32 w-32</span>
					</div>
					<div class="lh-size">
						<LinkImageHover
							href="https://example.com"
							text="Medium"
							imageSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"
							imageAlt="Mountain"
							imageWidth="h-44 w-44"
						/>
						<span class="lh-size__label">h-44 w-44</span>
					</div>
					<div class="lh-size">
						<LinkImageHover
							href="https://example.com"
							text="Large"
							imageSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"
							imageAlt="Mountain"
							imageWidth="h-64 w-64"
						/>
						<span class="lh-size__label">h-64 w-64</span>
					</div>
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
					<td><code>href</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Destination URL for the link.</td>
				</tr>
				<tr>
					<td><code>text</code></td>
					<td><code>string</code></td>
					<td><code>'Link Text'</code></td>
					<td>Visible link label.</td>
				</tr>
				<tr>
					<td><code>imageSrc</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>URL for the preview image.</td>
				</tr>
				<tr>
					<td><code>imageAlt</code></td>
					<td><code>string</code></td>
					<td><code>'Preview Image'</code></td>
					<td>Alt text for the preview image.</td>
				</tr>
				<tr>
					<td><code>imageWidth</code></td>
					<td><code>string</code></td>
					<td><code>'h-44 w-44'</code></td>
					<td>Tailwind size classes applied to the preview.</td>
				</tr>
				<tr>
					<td><code>target</code></td>
					<td><code>string</code></td>
					<td><code>'_blank'</code></td>
					<td>Standard anchor <code>target</code> attribute.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.lh-demo {
		display: grid;
		gap: 24px;
	}
	.lh-section {
		display: grid;
		gap: 10px;
	}
	.lh-section h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.lh-stage {
		padding: 64px 32px;
		border-radius: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		min-height: 220px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.lh-stage--row {
		gap: 32px;
	}
	.lh-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 32px;
		width: 100%;
		max-width: 600px;
	}
	.lh-size {
		display: grid;
		gap: 12px;
		justify-items: center;
	}
	.lh-size__label {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
</style>
