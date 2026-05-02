<script lang="ts">
	import StreamShowcase from '$lib/components/StreamShowcase/StreamShowcase.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import type { Playlist } from '$lib/components/StreamShowcase/types';

	const shell = catalogShellPropsForSlug('/streamshowcase')!;

	// Default-deck state for the flagship demo. We track both the active
	// (centred) index and the most recently selected playlist for the live
	// state read-out below the deck.
	let lastSelected = $state<Playlist | null>(null);
	let active = $state(5);

	function handleSelect(p: Playlist) {
		lastSelected = p;
	}

	// Light-theme deck — fewer cards in the fan, separate state so toggling
	// through it does not stomp on the dark deck above.
	let lightActive = $state(3);
	let lightLastSelected = $state<Playlist | null>(null);

	function handleLightSelect(p: Playlist) {
		lightLastSelected = p;
	}

	// Custom-playlists deck — a smaller, hand-rolled set with bespoke covers
	// and a “last-selected” toast to demonstrate the onSelect callback.
	const customPlaylists: Playlist[] = [
		{
			slug: 'dawn-patrol',
			title: 'Dawn Patrol',
			tag: 'Daily ritual',
			description: 'Six-minute morning rundowns: today’s weather, headlines, and one good idea.',
			cover: { from: '#f59e0b', to: '#b45309', accent: '#fef3c7' },
			episodeCount: 60
		},
		{
			slug: 'studio-notes',
			title: 'Studio Notes',
			tag: 'Working sessions',
			description: 'Unedited working sessions from a small product studio. Mistakes left in.',
			cover: { from: '#0ea5e9', to: '#0369a1', accent: '#bae6fd' },
			episodeCount: 22
		},
		{
			slug: 'night-shift',
			title: 'Night Shift',
			tag: 'Slow tech',
			description: 'Quiet, late-night programming streams. Lo-fi soundtrack, long pauses, deep work.',
			cover: { from: '#312e81', to: '#1e1b4b', accent: '#c7d2fe' },
			episodeCount: 14
		},
		{
			slug: 'weekend-build',
			title: 'Weekend Build',
			tag: 'Side projects',
			description: 'One project, one weekend, one finished thing. Saturday brief, Sunday demo.',
			cover: { from: '#15803d', to: '#14532d', accent: '#bbf7d0' },
			episodeCount: 9
		}
	];

	let customActive = $state(2);
	let customLastSelected = $state<Playlist | null>(null);

	function handleCustomSelect(p: Playlist) {
		customLastSelected = p;
	}

	const usageSnippet = `<script>
  import StreamShowcase from '$lib/components/StreamShowcase/StreamShowcase.svelte';

  let active = $state(5);
  function handleSelect(p) {
    console.log('selected', p.slug);
  }
</${'script'}>

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
		<section class="ss-section">
			<header class="ss-section__header">
				<h3>Default deck — 10 cards, dark theme</h3>
				<p>The flagship configuration: full sample playlists, drag/keyboard/click all wired in.</p>
			</header>
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
		</section>

		<section class="ss-section">
			<header class="ss-section__header">
				<h3>Light theme — fewer cards (count = 7)</h3>
				<p>
					Same component with <code>theme="light"</code> and a tighter 7-card fan. Useful for
					editorial pages on light backgrounds.
				</p>
			</header>
			<div class="ss-shell">
				<StreamShowcase
					theme="light"
					count={7}
					eyebrow="Featured this week"
					topLine="Read up."
					bottomLine="Tune in."
					bind:active={lightActive}
					onSelect={handleLightSelect}
					class="ss-frame"
				/>
			</div>
			<div class="ss-meta">
				<div class="ss-meta__card">
					<h3>State</h3>
					<dl>
						<dt>Active card index</dt>
						<dd><code>{lightActive}</code></dd>
						<dt>Last selected playlist</dt>
						<dd>
							{#if lightLastSelected}
								<code>{lightLastSelected.slug}</code> — {lightLastSelected.title}
							{:else}
								<em>None yet</em>
							{/if}
						</dd>
					</dl>
				</div>
			</div>
		</section>

		<section class="ss-section">
			<header class="ss-section__header">
				<h3>Custom playlists — 4 hand-rolled cards</h3>
				<p>
					A bespoke <code>playlists</code> array with custom titles, tags and gradient covers,
					plus a tighter <code>count={4}</code>. The toast below updates whenever you press
					<kbd>Enter</kbd> on the centre card.
				</p>
			</header>
			<div class="ss-shell">
				<StreamShowcase
					playlists={customPlaylists}
					count={4}
					eyebrow="Studio picks"
					topLine="Make time."
					bottomLine="Press play."
					bind:active={customActive}
					onSelect={handleCustomSelect}
					class="ss-frame"
				/>
			</div>
			<div class="ss-toast" aria-live="polite">
				{#if customLastSelected}
					<strong>Selected:</strong>
					<code>{customLastSelected.slug}</code> — {customLastSelected.title}
					<span class="ss-toast__tag">{customLastSelected.tag}</span>
				{:else}
					<em>Select a playlist to see the <code>onSelect</code> payload here.</em>
				{/if}
			</div>
		</section>
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
					<td><code>playlists</code></td>
					<td><code>Playlist[]</code></td>
					<td>sample set</td>
					<td>Array of playlist objects rendered in the fan.</td>
				</tr>
				<tr>
					<td><code>count</code></td>
					<td><code>number</code></td>
					<td><code>10</code></td>
					<td>Number of card slots in the fan (cycles through <code>playlists</code>).</td>
				</tr>
				<tr>
					<td><code>theme</code></td>
					<td><code>'light' | 'dark'</code></td>
					<td><code>'dark'</code></td>
					<td>Background palette for the showcase canvas.</td>
				</tr>
				<tr>
					<td><code>eyebrow</code></td>
					<td><code>string</code></td>
					<td><code>'Now browsing'</code></td>
					<td>Small label above the headline.</td>
				</tr>
				<tr>
					<td><code>topLine</code> / <code>bottomLine</code></td>
					<td><code>string</code></td>
					<td><code>'Queue up.'</code> / <code>'Level up.'</code></td>
					<td>Two-line headline above the carousel.</td>
				</tr>
				<tr>
					<td><code>active</code></td>
					<td><code>number</code></td>
					<td><code>floor(count / 2)</code></td>
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
	.ss-section {
		display: grid;
		gap: 12px;
	}
	.ss-section + .ss-section {
		margin-top: 32px;
	}
	.ss-section__header h3 {
		margin: 0 0 4px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.ss-section__header p {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--fg-2);
	}
	.ss-section__header code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
	}
	.ss-section__header kbd {
		font-family: var(--font-mono);
		font-size: 11px;
		background: var(--surface-2);
		padding: 1px 6px;
		border: 1px solid var(--border-strong);
		border-bottom-width: 2px;
		border-radius: var(--r-1);
	}
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
	.ss-toast {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin-top: 16px;
		padding: 12px 16px;
		border-radius: var(--r-2);
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--fg-2);
		font-size: 13px;
	}
	.ss-toast strong {
		color: var(--fg-1);
	}
	.ss-toast code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
	}
	.ss-toast__tag {
		margin-left: auto;
		font-family: var(--font-mono);
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--fg-3);
	}
</style>
