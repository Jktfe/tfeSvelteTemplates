<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import TrueFocus from '$lib/components/TrueFocus.svelte';

	const shell = catalogShellPropsForSlug('/truefocus')!;
</script>

<svelte:head>
	<title>TrueFocus — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Word-by-word phrase focus with a single morphing frame. Hover-pause, click-to-pin, ResizeObserver-aware."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Typography', 'Hover', 'A11y']}
	codeExplanation="TrueFocus measures every word's bounding rect once, then animates a single absolutely-positioned frame between them. ResizeObserver re-measures on layout change. Click or Enter pins a word; hover pauses the cycle. prefers-reduced-motion disables the morph transition entirely."
>
	{#snippet demo()}
		<div class="tf-demo">
			<div class="tf-card tf-card--centered">
				<h3 class="tf-headline">
					<TrueFocus text="True focus on the present" />
				</h3>
			</div>

			<div class="tf-card tf-card--centered">
				<span class="tf-display-2">
					<TrueFocus text="Build something extraordinary." cycleDuration={1800} color="#a855f7" glow={true} />
				</span>
			</div>

			<div class="tf-card tf-card--centered tf-card--dark">
				<span class="tf-display-1 tf-light">
					<TrueFocus text="The mind moves in many directions" order="random" cycleDuration={1200} color="#fbbf24" />
				</span>
			</div>

			<div class="tf-card tf-card--centered">
				<span class="tf-display-2">
					<TrueFocus text="Pin a word with click or Enter" autoStart={false} color="#0ea5e9" />
				</span>
			</div>

			<div class="tf-card tf-card--centered tf-card--poem">
				<span class="tf-display-2">
					<TrueFocus
						text="Two roads diverged in a yellow wood and sorry I could not travel both"
						cycleDuration={900}
						color="#16a34a"
						paddingX={6}
						paddingY={3}
					/>
				</span>
			</div>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>text</code></td><td><code>string</code></td><td>required</td><td>Phrase to highlight word-by-word.</td></tr>
				<tr><td><code>cycleDuration</code></td><td><code>number</code></td><td><code>1500</code></td><td>Hold time per word, ms.</td></tr>
				<tr><td><code>order</code></td><td><code>"sequential" | "random"</code></td><td><code>"sequential"</code></td><td>Cycle order.</td></tr>
				<tr><td><code>autoStart</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Start cycling on mount.</td></tr>
				<tr><td><code>color</code></td><td><code>string</code></td><td><code>"#4338ca"</code></td><td>Frame border and glow colour.</td></tr>
				<tr><td><code>glow</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Render a soft glow around the frame.</td></tr>
				<tr><td><code>paddingX</code></td><td><code>number</code></td><td><code>4</code></td><td>Horizontal padding around each word, px.</td></tr>
				<tr><td><code>paddingY</code></td><td><code>number</code></td><td><code>2</code></td><td>Vertical padding around each word, px.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.tf-demo {
		display: grid;
		gap: 16px;
	}
	.tf-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 2.5rem 1.5rem;
		color: var(--fg-1);
	}
	.tf-card--centered {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 160px;
		text-align: center;
	}
	.tf-card--dark {
		background: #0f172a;
		border-color: #1e293b;
	}
	.tf-card--poem {
		min-height: 220px;
		padding: 3rem 2.5rem;
		line-height: 1.8;
	}
	.tf-headline {
		margin: 0;
		font-size: 1.85rem;
		font-weight: 700;
		line-height: 1.45;
	}
	.tf-display-1 {
		font-size: 2.25rem;
		font-weight: 700;
		line-height: 1.5;
	}
	.tf-light {
		color: #f1f5f9;
	}
	.tf-display-2 {
		font-size: 1.65rem;
		font-weight: 700;
		line-height: 1.6;
	}
</style>
