<script lang="ts">
	import StreamShowcase from '$lib/components/StreamShowcase/StreamShowcase.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import type { Playlist } from '$lib/components/StreamShowcase/types';

	const shell = catalogShellPropsForSlug('/streamshowcase')!;

	let lastSelected = $state<Playlist | null>(null);
	let active = $state(5);

	function handleSelect(p: Playlist) {
		lastSelected = p;
	}

	const usageSnippet = `<script>
  import StreamShowcase from '$lib/components/StreamShowcase/StreamShowcase.svelte';

  let active = $state(5);
  function handleSelect(p) {
    console.log('selected', p.slug);
  }
<\/script>

<StreamShowcase bind:active onSelect={handleSelect} />`;

	const codeExplanation =
		'StreamShowcase pairs a brush-script hero with a 10-card fan carousel. Side cards splay around a pivot below the deck; click a side card to bring it to centre, drag horizontally to spin, or use Arrow / Home / End / Enter for keyboard control. No external assets — card art is pure CSS gradients with color-mix tints.';
</script>

<svelte:head>
	<title>StreamShowcase — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Editorial streaming-platform shelf with brush-script hero and 10-card fan carousel."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'Carousel', 'Drag', 'Keyboard', 'Asset-free']}
>
	{#snippet demo()}
		<div class="ss-shell">
			<StreamShowcase bind:active onSelect={handleSelect} class="ss-frame" />
		</div>

		<div class="ss-meta">
			<div class="ss-meta__card">
				<h3>State</h3>
				<dl>
					<dt>Active card index</dt>
					<dd><code>{active}</code></dd>
					<dt>Last selected playlist</dt>
					<dd>
						{#if lastSelected}
							<code>{lastSelected.slug}</code> — {lastSelected.title}
						{:else}
							<em>None yet — press Enter on the centre card</em>
						{/if}
					</dd>
				</dl>
			</div>
			<div class="ss-meta__card">
				<h3>Try it</h3>
				<ul>
					<li><kbd>←</kbd> / <kbd>→</kbd> — browse</li>
					<li><kbd>Home</kbd> / <kbd>End</kbd> — jump to first / last</li>
					<li><kbd>Enter</kbd> on centre — fires <code>onSelect</code></li>
					<li>Click side card — bring to centre</li>
					<li>Drag horizontally — spin and snap</li>
				</ul>
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
					<td><code>active</code></td>
					<td><code>number</code></td>
					<td><code>5</code></td>
					<td>Bindable — index of the centred card.</td>
				</tr>
				<tr>
					<td><code>onSelect</code></td>
					<td><code>(p: Playlist) =&gt; void</code></td>
					<td><code>undefined</code></td>
					<td>Fires when the centre card is activated (Enter or click).</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Pass-through class for the outer frame.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ss-shell {
		margin: -8px;
	}
	:global(.ss-frame) {
		border-radius: var(--r-2);
		overflow: hidden;
		box-shadow:
			0 50px 100px -40px rgba(15, 23, 42, 0.25),
			0 4px 12px -2px rgba(15, 23, 42, 0.08);
	}
	.ss-meta {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 12px;
		margin-top: 20px;
	}
	.ss-meta__card {
		display: grid;
		gap: 8px;
		padding: 16px 18px;
		border-radius: var(--r-2);
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--fg-1);
	}
	.ss-meta__card h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 14px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.ss-meta__card dl {
		margin: 0;
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 4px 12px;
	}
	.ss-meta__card dt {
		color: var(--fg-3);
		font-size: 13px;
	}
	.ss-meta__card dd {
		margin: 0;
		color: var(--fg-2);
		font-size: 13px;
	}
	.ss-meta__card ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 6px;
		color: var(--fg-2);
		font-size: 13px;
	}
	.ss-meta__card kbd {
		font-family: var(--font-mono);
		font-size: 11px;
		background: var(--surface-2);
		padding: 1px 6px;
		margin: 0 2px;
		border: 1px solid var(--border-strong);
		border-bottom-width: 2px;
		border-radius: var(--r-1);
		color: var(--fg-1);
	}
	.ss-meta__card code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
	}
</style>
