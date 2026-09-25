<!--
  ============================================================
  RoutePreviewRail — Visual Route Index with Screenshot Status
  ============================================================
  WHAT — A searchable strip of route cards, each with a screenshot,
  description, category and ready / review / missing status.

  WHY — A visual index for inspecting live component pages and spotting
  missing screenshot proof at a glance.

  FEATURES
  - Status summary counts in the header
  - Search across name, route, description and category
  - Status filter (all / ready / review / missing)
  - Items without a status count as ready
  - Pure helpers exported: routePreviewStatusLabel,
    summarizeRoutePreviews, filterRoutePreviews

  ACCESSIBILITY
  - <section> labelled by its heading; stats use a labelled <dl>
  - Native search input and select with visible labels
  - Cards are real links with descriptive screenshot alt text
  - Status written as text, not colour alone
  - No motion

  DEPENDENCIES — Zero. Pure Svelte 5 runes and scoped CSS.

  PERFORMANCE — Screenshots use loading="lazy"; filtering is one
  $derived pass.

  USAGE
      <RoutePreviewRail items={[
        { name: 'SpeedDial', href: '/speeddial', screenshot: '/shots/speeddial.png',
          description: 'Floating action menu', status: 'ready' }
      ]} />

  PROPS
  | Prop     | Type               | Default              | Description |
  |----------|--------------------|----------------------|-------------|
  | items    | RoutePreviewItem[] | required             | Routes to show |
  | title    | string             | 'Route preview rail' | Heading |
  | subtitle | string             | Short sample sentence| Line under the heading |
  | class    | string             | ''                   | Extra classes on the root |
  ============================================================
-->
<script lang="ts" module>
	export type RoutePreviewStatus = 'ready' | 'review' | 'missing';

	export interface RoutePreviewItem {
		name: string;
		href: string;
		screenshot: string;
		description: string;
		category?: string;
		status?: RoutePreviewStatus;
	}

	export function routePreviewStatusLabel(status: RoutePreviewStatus): string {
		const labels: Record<RoutePreviewStatus, string> = {
			ready: 'Ready',
			review: 'Review',
			missing: 'Missing'
		};
		return labels[status];
	}

	export function summarizeRoutePreviews(items: RoutePreviewItem[]): Record<RoutePreviewStatus, number> {
		return items.reduce(
			(counts, item) => {
				counts[item.status ?? 'ready'] += 1;
				return counts;
			},
			{ ready: 0, review: 0, missing: 0 } satisfies Record<RoutePreviewStatus, number>
		);
	}

	export function filterRoutePreviews(
		items: RoutePreviewItem[],
		query: string,
		status: RoutePreviewStatus | 'all' = 'all'
	): RoutePreviewItem[] {
		const normalQuery = query.trim().toLowerCase();
		return items.filter((item) => {
			const matchesStatus = status === 'all' || (item.status ?? 'ready') === status;
			if (!matchesStatus) return false;
			if (!normalQuery) return true;
			return [item.name, item.href, item.description, item.category ?? '']
				.join(' ')
				.toLowerCase()
				.includes(normalQuery);
		});
	}
</script>

<script lang="ts">
	interface Props {
		items: RoutePreviewItem[];
		title?: string;
		subtitle?: string;
		class?: string;
	}

	let {
		items,
		title = 'Route preview rail',
		subtitle = 'A visual route index for inspecting live component pages and missing screenshot proof.',
		class: extraClass = ''
	}: Props = $props();

	let query = $state('');
	let status = $state<RoutePreviewStatus | 'all'>('all');

	const summary = $derived(summarizeRoutePreviews(items));
	const visibleItems = $derived(filterRoutePreviews(items, query, status));
</script>

<section class="route-rail {extraClass}" aria-labelledby="route-rail-title">
	<header class="rr-head">
		<div>
			<p class="rr-kicker">Visual QA</p>
			<h2 id="route-rail-title">{title}</h2>
			<p>{subtitle}</p>
		</div>
		<dl class="rr-stats" aria-label="Preview status summary">
			{#each (['ready', 'review', 'missing'] as RoutePreviewStatus[]) as itemStatus (itemStatus)}
				<div>
					<dt>{routePreviewStatusLabel(itemStatus)}</dt>
					<dd>{summary[itemStatus]}</dd>
				</div>
			{/each}
		</dl>
	</header>

	<div class="rr-controls">
		<label>
			<span>Search routes</span>
			<input bind:value={query} type="search" placeholder="health, token, rail..." />
		</label>
		<label>
			<span>Status</span>
			<select bind:value={status}>
				<option value="all">All statuses</option>
				<option value="ready">Ready</option>
				<option value="review">Review</option>
				<option value="missing">Missing</option>
			</select>
		</label>
	</div>

	<div class="rr-strip" aria-label="Route previews">
		{#each visibleItems as item (item.href)}
			<a class="rr-card rr-card--{item.status ?? 'ready'}" href={item.href}>
				<figure>
					<img src={item.screenshot} alt={`${item.name} screenshot`} loading="lazy" />
				</figure>
				<span>{routePreviewStatusLabel(item.status ?? 'ready')}</span>
				<h3>{item.name}</h3>
				<p>{item.description}</p>
				{#if item.category}<em>{item.category}</em>{/if}
			</a>
		{/each}
	</div>

	{#if visibleItems.length === 0}
		<p class="rr-empty">No routes match this filter.</p>
	{/if}
</section>

<style>
	/*
	 * THEMING — see docs/THEMING.md. Chrome tokens read the host's shared
	 * tokens (--fg-1, --surface, --border, ...) first and fall back to
	 * built-in light/dark values, so the component works standalone too.
	 * Status tones are semantic: each keeps its hue on both schemes and only
	 * lightens its text / deepens its tint in dark mode for legibility.
	 */
	.route-rail {
		--rpr-fg-1: var(--fg-1, #111827);
		--rpr-fg-2: var(--fg-2, #4b5563);
		--rpr-fg-3: var(--fg-3, #6b7280);
		--rpr-border: var(--border, #d9dde5);
		--rpr-surface: var(--surface, #fff);
		--rpr-ready-accent: #15803d;
		--rpr-ready-bg: #dcfce7;
		--rpr-ready-border: #86efac;
		--rpr-review-accent: #92400e;
		--rpr-review-bg: #fef3c7;
		--rpr-review-border: #fcd34d;
		--rpr-missing-accent: #b91c1c;
		--rpr-missing-bg: #fee2e2;
		--rpr-missing-border: #fca5a5;
		--rpr-kicker: #9f1239;
		--rpr-frame-bg: #f1f5f9;
	}

	@media (prefers-color-scheme: dark) {
		.route-rail {
			--rpr-fg-1: var(--fg-1, #f3f4f6);
			--rpr-fg-2: var(--fg-2, #cbd5e1);
			--rpr-fg-3: var(--fg-3, #94a3b8);
			--rpr-border: var(--border, #334155);
			--rpr-surface: var(--surface, #111827);
			--rpr-ready-accent: #86efac;
			--rpr-ready-bg: rgba(22, 163, 74, 0.2);
			--rpr-ready-border: #166534;
			--rpr-review-accent: #fcd34d;
			--rpr-review-bg: rgba(245, 158, 11, 0.18);
			--rpr-review-border: #92400e;
			--rpr-missing-accent: #fca5a5;
			--rpr-missing-bg: rgba(220, 38, 38, 0.2);
			--rpr-missing-border: #991b1b;
			--rpr-kicker: #fda4af;
			--rpr-frame-bg: #1f2937;
		}
	}

	.route-rail {
		display: grid;
		gap: 18px;
		color: var(--rpr-fg-1);
	}

	.rr-head {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 18px;
		align-items: end;
	}

	.rr-kicker {
		margin: 0 0 6px;
		color: var(--rpr-kicker);
		font: 900 11px/1 var(--font-mono, ui-monospace, monospace);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.rr-head h2 {
		margin: 0;
		font: 900 clamp(1.6rem, 3vw, 2.5rem) / 1 var(--font-display, Georgia, serif);
	}

	.rr-head p {
		max-width: 68ch;
		margin: 8px 0 0;
		color: var(--rpr-fg-2);
	}

	.rr-stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(80px, 1fr));
		gap: 8px;
		margin: 0;
	}

	.rr-stats div {
		padding: 11px;
		border: 1px solid var(--rpr-border);
		border-radius: 6px;
		background: var(--rpr-surface);
		text-align: center;
	}

	.rr-stats dt {
		color: var(--rpr-fg-3);
		font: 900 10px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.rr-stats dd {
		margin: 5px 0 0;
		font: 900 1.4rem/1 var(--font-display, Georgia, serif);
	}

	.rr-controls {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(170px, 240px);
		gap: 12px;
	}

	.rr-controls label {
		display: grid;
		gap: 6px;
	}

	.rr-controls span {
		color: var(--rpr-fg-3);
		font: 900 10px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.rr-controls input,
	.rr-controls select {
		min-height: 42px;
		border: 1px solid var(--rpr-border);
		border-radius: 6px;
		background: var(--rpr-surface);
		color: inherit;
		padding: 0 12px;
		font: inherit;
	}

	.rr-strip {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(260px, 340px);
		gap: 14px;
		overflow-x: auto;
		overscroll-behavior-inline: contain;
		padding-bottom: 8px;
		scroll-snap-type: inline mandatory;
	}

	.rr-card {
		position: relative;
		display: grid;
		gap: 10px;
		min-height: 100%;
		padding: 12px;
		border: 1px solid var(--rr-border, var(--rpr-border));
		border-radius: 6px;
		background: var(--rpr-surface);
		color: inherit;
		text-decoration: none;
		scroll-snap-align: start;
	}

	.rr-card--ready { --rr-accent: var(--rpr-ready-accent); --rr-bg: var(--rpr-ready-bg); --rr-border: var(--rpr-ready-border); }
	.rr-card--review { --rr-accent: var(--rpr-review-accent); --rr-bg: var(--rpr-review-bg); --rr-border: var(--rpr-review-border); }
	.rr-card--missing { --rr-accent: var(--rpr-missing-accent); --rr-bg: var(--rpr-missing-bg); --rr-border: var(--rpr-missing-border); }

	.rr-card figure {
		aspect-ratio: 16 / 10;
		margin: 0;
		overflow: hidden;
		border: 1px solid var(--rpr-border);
		border-radius: 4px;
		background: var(--rpr-frame-bg);
	}

	.rr-card img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
		display: block;
	}

	.rr-card > span {
		width: max-content;
		padding: 5px 8px;
		border-radius: 4px;
		background: var(--rr-bg);
		color: var(--rr-accent);
		font: 900 10px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.rr-card h3 {
		margin: 0;
		font: 850 1.18rem/1.1 var(--font-display, Georgia, serif);
	}

	.rr-card p {
		margin: 0;
		color: var(--rpr-fg-2);
	}

	.rr-card em {
		color: var(--rpr-fg-3);
		font: 800 11px/1.2 var(--font-mono, ui-monospace, monospace);
		font-style: normal;
		text-transform: uppercase;
	}

	.rr-empty {
		margin: 0;
		padding: 16px;
		border: 1px dashed var(--rpr-border);
		border-radius: 6px;
		color: var(--rpr-fg-2);
		text-align: center;
	}

	@media (max-width: 760px) {
		.rr-head,
		.rr-controls {
			grid-template-columns: 1fr;
		}

		.rr-stats {
			width: 100%;
		}
	}
</style>
