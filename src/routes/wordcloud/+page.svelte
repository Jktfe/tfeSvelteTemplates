<!--
	============================================================
	WordCloud Demo Page (TFE shell)
	============================================================
-->

<script lang="ts">
	import WordCloud from '$lib/components/WordCloud.svelte';
	import type { WordCloudWord } from '$lib/components/WordCloud.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/wordcloud')!;

	const blogTags: WordCloudWord[] = [
		{ text: 'svelte', weight: 84 },
		{ text: 'reactivity', weight: 62 },
		{ text: 'rune', weight: 58 },
		{ text: 'kit', weight: 51 },
		{ text: 'snippet', weight: 47 },
		{ text: 'effect', weight: 42 },
		{ text: 'store', weight: 39, href: '#store' },
		{ text: 'state', weight: 35 },
		{ text: 'derived', weight: 32 },
		{ text: 'props', weight: 29 },
		{ text: 'css', weight: 26 },
		{ text: 'transitions', weight: 23 },
		{ text: 'animation', weight: 21 },
		{ text: 'router', weight: 19 },
		{ text: 'forms', weight: 17 },
		{ text: 'typescript', weight: 15 },
		{ text: 'vite', weight: 13 },
		{ text: 'ssr', weight: 12 },
		{ text: 'hydration', weight: 10 },
		{ text: 'preprocess', weight: 8 }
	];

	const aiTokens: WordCloudWord[] = [
		{ text: 'context', weight: 91 },
		{ text: 'token', weight: 78 },
		{ text: 'prompt', weight: 70 },
		{ text: 'agent', weight: 64 },
		{ text: 'tool', weight: 58 },
		{ text: 'model', weight: 53 },
		{ text: 'embedding', weight: 47 },
		{ text: 'memory', weight: 41 },
		{ text: 'retrieval', weight: 38 },
		{ text: 'rag', weight: 33 },
		{ text: 'function', weight: 30 },
		{ text: 'inference', weight: 27 },
		{ text: 'fine-tune', weight: 24 },
		{ text: 'eval', weight: 21 }
	];

	const teamFacets: WordCloudWord[] = [
		{ text: 'design', weight: 60 },
		{ text: 'engineering', weight: 55 },
		{ text: 'research', weight: 48 },
		{ text: 'product', weight: 43 },
		{ text: 'analytics', weight: 38 },
		{ text: 'support', weight: 33 },
		{ text: 'marketing', weight: 28 },
		{ text: 'operations', weight: 24 },
		{ text: 'finance', weight: 20 }
	];

	const surveyThemes: WordCloudWord[] = [
		{ text: 'fast', weight: 78 },
		{ text: 'simple', weight: 65 },
		{ text: 'reliable', weight: 58 },
		{ text: 'beautiful', weight: 49 },
		{ text: 'consistent', weight: 41 },
		{ text: 'accessible', weight: 36 },
		{ text: 'flexible', weight: 31 },
		{ text: 'documented', weight: 27 },
		{ text: 'open-source', weight: 23 },
		{ text: 'modern', weight: 19 },
		{ text: 'responsive', weight: 15 },
		{ text: 'lightweight', weight: 12 }
	];

	let lastClicked = $state<string | null>(null);

	const usageSnippet = `<script>
  import WordCloud from '$lib/components/WordCloud.svelte';
</${'script'}>

<WordCloud
  words={tags}
  variant="organic"
  minSize={14}
  maxSize={48}
/>`;

	const codeExplanation =
		'WordCloud takes an array of {text, weight, href?} tuples and renders them with size proportional to weight via a clamped linear scale. Three pure-CSS variants share the same data shape: organic uses flex-wrap, grid uses CSS grid with auto-fit columns, and radial places words in concentric rings. Palettes are deterministic — a hashed word always renders the same colour. Zero canvas, zero D3.';
</script>

<svelte:head>
	<title>WordCloud — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Frequency-weighted text-cloud component with organic, grid, and radial variants. Pure CSS layout, zero dependencies."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'CSS-only', 'Zero deps', 'A11y']}
>
	{#snippet demo()}
		<div class="wc-demo">
			<section class="wc-demo__block">
				<h3>Organic — flex-wrap line flow</h3>
				<div class="wc-demo__container">
					<WordCloud
						words={blogTags}
						variant="organic"
						minSize={14}
						maxSize={48}
						aria-label="Top 20 blog tags by frequency"
					/>
				</div>
			</section>

			<section class="wc-demo__block">
				<h3>Grid — typographic poster (alternating rotation)</h3>
				<div class="wc-demo__container">
					<WordCloud
						words={teamFacets}
						variant="grid"
						rotation="alternating"
						minSize={18}
						maxSize={42}
						aria-label="Team facets"
					/>
				</div>
			</section>

			<section class="wc-demo__block">
				<h3>Radial — concentric rings (seeded random rotation)</h3>
				<div class="wc-demo__container wc-demo__container--radial">
					<WordCloud
						words={aiTokens}
						variant="radial"
						rotation="random"
						seed={42}
						minSize={16}
						maxSize={56}
						aria-label="AI prompt-token frequency"
					/>
				</div>
			</section>

			<section class="wc-demo__block">
				<h3>Branded palette + click handler</h3>
				<div class="wc-demo__container">
					<WordCloud
						words={surveyThemes}
						variant="organic"
						palette={['#6366f1', '#06b6d4', '#10b981']}
						minSize={16}
						maxSize={42}
						onWordClick={(w) => (lastClicked = w.text)}
						aria-label="Customer survey themes"
					/>
				</div>
				<p class="wc-demo__status">
					{#if lastClicked}
						Last clicked: <strong>{lastClicked}</strong>
					{:else}
						Click any word to record a selection.
					{/if}
				</p>
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
					<td><code>words</code></td>
					<td><code>WordCloudWord[]</code></td>
					<td>required</td>
					<td>Array of <code>{`{ text, weight, href? }`}</code>.</td>
				</tr>
				<tr>
					<td><code>variant</code></td>
					<td><code>'organic' | 'grid' | 'radial'</code></td>
					<td><code>'organic'</code></td>
					<td>Layout mode. Organic uses flex-wrap, grid uses CSS grid, radial uses polar rings.</td>
				</tr>
				<tr>
					<td><code>rotation</code></td>
					<td><code>'none' | 'alternating' | 'random'</code></td>
					<td><code>'none'</code></td>
					<td>Per-word rotation. Random uses <code>seed</code> for reproducibility.</td>
				</tr>
				<tr>
					<td><code>minSize</code> / <code>maxSize</code></td>
					<td><code>number</code></td>
					<td><code>14</code> / <code>48</code></td>
					<td>Pixel range for the linear weight scale.</td>
				</tr>
				<tr>
					<td><code>palette</code></td>
					<td><code>string[]</code></td>
					<td>8-colour default</td>
					<td>Hashed deterministically from word text.</td>
				</tr>
				<tr>
					<td><code>seed</code></td>
					<td><code>number</code></td>
					<td><code>0</code></td>
					<td>Seeds random rotation so every render produces the same angles.</td>
				</tr>
				<tr>
					<td><code>onWordClick</code></td>
					<td><code>(w: WordCloudWord) =&gt; void</code></td>
					<td>—</td>
					<td>Renders words as focusable buttons. Without it words are spans (or anchors via <code>href</code>).</td>
				</tr>
				<tr>
					<td><code>srTable</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Hides cloud from screen readers and emits a visually-hidden ranked table instead.</td>
				</tr>
				<tr>
					<td><code>aria-label</code></td>
					<td><code>string</code></td>
					<td><code>'Word cloud'</code></td>
					<td>Accessible label for the cloud region.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.wc-demo {
		display: grid;
		gap: 24px;
	}
	.wc-demo__block h3 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		margin: 0 0 10px;
		color: var(--fg-1);
	}
	.wc-demo__container {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		min-height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
	}
	.wc-demo__container--radial {
		min-height: 420px;
		padding: 0;
	}
	.wc-demo__status {
		margin: 8px 0 0;
		font-size: 13px;
		color: var(--fg-2);
	}
</style>
