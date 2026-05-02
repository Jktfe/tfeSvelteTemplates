<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';

	const shell = catalogShellPropsForSlug('/segmentedcontrol')!;

	let view = $state<'list' | 'grid' | 'cards'>('list');
	let range = $state<'1d' | '1w' | '1m' | '1y'>('1w');
	let theme = $state<'auto' | 'light' | 'dark'>('auto');
	let plan = $state<'starter' | 'pro' | 'team'>('pro');
	let align = $state<'left' | 'center' | 'right' | 'justify'>('left');
	let density = $state<'compact' | 'comfortable' | 'roomy' | 'expansive ultra-wide' | 'auto'>(
		'comfortable'
	);

	const viewOptions = [
		{ value: 'list', label: 'List', icon: '☰' },
		{ value: 'grid', label: 'Grid', icon: '▦' },
		{ value: 'cards', label: 'Cards', icon: '🃏' }
	];

	const rangeOptions = [
		{ value: '1d', label: '1D' },
		{ value: '1w', label: '1W' },
		{ value: '1m', label: '1M' },
		{ value: '1y', label: '1Y' }
	];

	const themeOptions = [
		{ value: 'auto', label: 'Auto' },
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' }
	];

	const planOptions = [
		{ value: 'starter', label: 'Starter' },
		{ value: 'pro', label: 'Pro' },
		{ value: 'team', label: 'Team' }
	];

	// Icons-only: pass an empty label so the segment renders the glyph alone.
	// Crucial bit: the icon is enough on its own here, but ariaLabel still
	// names the control for screen readers.
	const alignOptions = [
		{ value: 'left', label: '', icon: '⇤' },
		{ value: 'center', label: '', icon: '↔' },
		{ value: 'right', label: '', icon: '⇥' },
		{ value: 'justify', label: '', icon: '☰' }
	];

	// Wildly varying label widths to prove equalWidth=false truly fits content.
	const densityOptions = [
		{ value: 'compact', label: 'XS' },
		{ value: 'comfortable', label: 'Comfortable' },
		{ value: 'roomy', label: 'Roomy default' },
		{ value: 'expansive ultra-wide', label: 'Expansive ultra-wide' },
		{ value: 'auto', label: 'Auto' }
	];

	const items = [
		{ id: 1, title: 'A modest case for monochrome UI', tag: 'design' },
		{ id: 2, title: 'Owning your design tokens', tag: 'engineering' },
		{ id: 3, title: 'Why we picked SvelteKit over Next', tag: 'engineering' },
		{ id: 4, title: 'Listening better in user interviews', tag: 'research' }
	];

	const codeExplanation =
		'Each segment is a hidden native radio input wrapped by a label, so a single arrow-key tab handles selection — no JS keyboard plumbing required. The visual "pill" you see is a single transform: translateX() shifted to match the active index, which means the slide animation stays smooth no matter how many segments you add.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Radio', 'A11y', 'Keyboard', 'CSS-only']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="seg-demo">
			<section>
				<h3>View mode switcher</h3>
				<SegmentedControl options={viewOptions} bind:value={view} ariaLabel="View mode" />

				{#if view === 'list'}
					<ul class="list">
						{#each items as item (item.id)}
							<li>
								<span>{item.title}</span>
								<span class="tag">{item.tag}</span>
							</li>
						{/each}
					</ul>
				{:else if view === 'grid'}
					<div class="grid">
						{#each items as item (item.id)}
							<div class="grid-cell">
								<div class="tag">{item.tag}</div>
								<div class="title">{item.title}</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="cards">
						{#each items as item (item.id)}
							<div class="card">
								<div class="tag">{item.tag}</div>
								<div class="title">{item.title}</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<section>
				<h3>Time range (size="sm")</h3>
				<SegmentedControl options={rangeOptions} bind:value={range} size="sm" ariaLabel="Time range" />
				<p class="note">Showing data for: <strong>{range.toUpperCase()}</strong></p>
			</section>

			<section>
				<h3>Custom palette</h3>
				<SegmentedControl
					options={themeOptions}
					bind:value={theme}
					activeBg="#7c3aed"
					activeText="#ffffff"
					ariaLabel="Theme preference"
				/>
				<p class="note">Theme: <strong>{theme}</strong></p>
			</section>

			<section>
				<h3>Content width (equalWidth=false)</h3>
				<SegmentedControl
					options={planOptions}
					bind:value={plan}
					equalWidth={false}
					ariaLabel="Plan tier"
				/>
				<p class="note">Plan: <strong>{plan}</strong></p>
			</section>

			<section>
				<h3>Icons-only · narrow toolbar</h3>
				<p class="note">Glyph-only segments for compact toolbars. The label is empty, so each pill collapses to just the icon.</p>
				<div class="seg-narrow">
					<SegmentedControl
						options={alignOptions}
						bind:value={align}
						size="sm"
						ariaLabel="Text alignment"
					/>
				</div>
				<p class="note">Alignment: <strong>{align}</strong></p>
			</section>

			<section>
				<h3>Content-fit with mixed widths</h3>
				<p class="note">
					<code>equalWidth=&#123;false&#125;</code> lets each segment hug its label, so &ldquo;XS&rdquo; stays tight while &ldquo;Expansive ultra-wide&rdquo; gets the room it needs.
				</p>
				<SegmentedControl
					options={densityOptions}
					bind:value={density}
					equalWidth={false}
					ariaLabel="Layout density"
				/>
				<p class="note">Density: <strong>{density}</strong></p>
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
					<td><code>options</code></td>
					<td><code>{'Array<{ value, label, icon? }>'}</code></td>
					<td>—</td>
					<td>Required. List of segments.</td>
				</tr>
				<tr>
					<td><code>value</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Bindable currently selected value.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>'sm' | 'md'</code></td>
					<td><code>'md'</code></td>
					<td>Compact or default segment height.</td>
				</tr>
				<tr>
					<td><code>equalWidth</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Force every segment to share the same width, or fit to content.</td>
				</tr>
				<tr>
					<td><code>activeBg</code> / <code>activeText</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Custom palette for the active pill.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Segmented control'</code></td>
					<td>Group label for assistive tech.</td>
				</tr>
				<tr>
					<td><code>name</code></td>
					<td><code>string</code></td>
					<td>auto</td>
					<td>Form name for the underlying radio group. Auto-generated if omitted.</td>
				</tr>
				<tr>
					<td><code>onChange</code></td>
					<td><code>(value) =&gt; void</code></td>
					<td>—</td>
					<td>Fires when the selection changes.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.seg-demo {
		display: grid;
		gap: 2rem;
	}

	.seg-demo h3 {
		font-size: 0.95rem;
		margin: 0 0 0.65rem;
		color: var(--fg-1);
	}

	.note {
		margin: 0.6rem 0 0;
		color: var(--fg-2);
		font-size: 0.85rem;
	}

	.list {
		list-style: none;
		padding: 0;
		margin: 1rem 0 0;
		border-top: 1px solid var(--border);
	}

	.list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.7rem 0;
		border-bottom: 1px solid var(--border);
		font-size: 0.9rem;
		color: var(--fg-1);
	}

	.tag {
		font-size: 0.72rem;
		color: var(--fg-2);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.grid-cell,
	.card {
		border: 1px solid var(--border);
		border-radius: 0.6rem;
		padding: 0.85rem;
		background: var(--surface);
		display: grid;
		gap: 0.4rem;
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.title {
		font-size: 0.92rem;
		font-weight: 500;
		color: var(--fg-1);
	}

	.seg-narrow {
		max-width: 14rem;
	}
</style>
