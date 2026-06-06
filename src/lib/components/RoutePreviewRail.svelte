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
	.route-rail {
		display: grid;
		gap: 18px;
		color: var(--fg-1, #111827);
	}

	.rr-head {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 18px;
		align-items: end;
	}

	.rr-kicker {
		margin: 0 0 6px;
		color: #9f1239;
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
		color: var(--fg-2, #4b5563);
	}

	.rr-stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(80px, 1fr));
		gap: 8px;
		margin: 0;
	}

	.rr-stats div {
		padding: 11px;
		border: 1px solid var(--border, #d9dde5);
		border-radius: 6px;
		background: var(--surface, #fff);
		text-align: center;
	}

	.rr-stats dt {
		color: var(--fg-3, #6b7280);
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
		color: var(--fg-3, #6b7280);
		font: 900 10px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.rr-controls input,
	.rr-controls select {
		min-height: 42px;
		border: 1px solid var(--border, #d9dde5);
		border-radius: 6px;
		background: var(--surface, #fff);
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
		border: 1px solid var(--rr-border, #d9dde5);
		border-radius: 6px;
		background: var(--surface, #fff);
		color: inherit;
		text-decoration: none;
		scroll-snap-align: start;
	}

	.rr-card--ready { --rr-accent: #15803d; --rr-bg: #dcfce7; --rr-border: #86efac; }
	.rr-card--review { --rr-accent: #92400e; --rr-bg: #fef3c7; --rr-border: #fcd34d; }
	.rr-card--missing { --rr-accent: #b91c1c; --rr-bg: #fee2e2; --rr-border: #fca5a5; }

	.rr-card figure {
		aspect-ratio: 16 / 10;
		margin: 0;
		overflow: hidden;
		border: 1px solid var(--border, #d9dde5);
		border-radius: 4px;
		background: #f1f5f9;
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
		color: var(--fg-2, #4b5563);
	}

	.rr-card em {
		color: var(--fg-3, #6b7280);
		font: 800 11px/1.2 var(--font-mono, ui-monospace, monospace);
		font-style: normal;
		text-transform: uppercase;
	}

	.rr-empty {
		margin: 0;
		padding: 16px;
		border: 1px dashed var(--border, #d9dde5);
		border-radius: 6px;
		color: var(--fg-2, #4b5563);
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
