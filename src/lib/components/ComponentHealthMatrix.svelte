<!--
  ============================================================
  ComponentHealthMatrix — Catalogue QA Table
  ============================================================
  WHAT — A searchable, filterable table showing, for every catalogue
  component, whether its source, docs, demo, screenshot and tests exist,
  plus an overall ready / partial / missing verdict.

  WHY — Keeps a large component library honest: missing screenshots or
  tests surface immediately instead of in review.

  FEATURES
  - Rows prebuilt with createHealthRows(entries, files) from sets of
    known file paths (the component never reads the filesystem)
  - Test detection from colocated .test.ts, .test.svelte and
    TestHarness.test.svelte candidates
  - Search across name, category, route, source and dependencies
  - Status and theme-support (light / dual) filters
  - Headline ready / partial / missing totals and per-column counts
  - Pure helpers exported: normalisePath, statusFromPresence,
    combineHealthStatus, testCandidatesFor, createHealthRows, countByStatus

  ACCESSIBILITY
  - <section> labelled by its heading; score has a descriptive aria-label
  - Native search input and selects with visible labels
  - Status shown as text, not colour alone
  - No motion

  DEPENDENCIES — Zero beyond Svelte (svelte/reactivity SvelteSet).

  PERFORMANCE — Filtering is a single $derived pass; comfortable for
  a few hundred rows.

  USAGE
      // in the page script
      import ComponentHealthMatrix, { createHealthRows } from '$lib/components/ComponentHealthMatrix.svelte';
      const rows = createHealthRows(entries, files);

      // in the markup
      <ComponentHealthMatrix {rows} />

  PROPS
  | Prop  | Type                 | Default                   | Description |
  |-------|----------------------|---------------------------|-------------|
  | rows  | ComponentHealthRow[] | required                  | Rows from createHealthRows() |
  | title | string               | 'Component health matrix' | Table heading |
  ============================================================
-->
<script lang="ts" module>
	import { SvelteSet } from 'svelte/reactivity';

	export type HealthStatus = 'ready' | 'partial' | 'missing';

	export interface ComponentHealthEntry {
		name: string;
		href: string;
		category: string;
		source: string;
		docs: string;
		demo: string;
		screenshot: string;
		themeSupport: 'light' | 'dual';
		dependencies: string[];
		relatedFiles: string[];
	}

	export interface ComponentHealthFiles {
		source: Set<string>;
		docs: Set<string>;
		demo: Set<string>;
		screenshot: Set<string>;
		test: Set<string>;
	}

	export interface ComponentHealthRow extends ComponentHealthEntry {
		sourceStatus: HealthStatus;
		docsStatus: HealthStatus;
		demoStatus: HealthStatus;
		screenshotStatus: HealthStatus;
		testStatus: HealthStatus;
		overallStatus: HealthStatus;
		testCandidates: string[];
		dependencyLabel: string;
	}

	export function normalisePath(path: string): string {
		return path.replace(/^\/+/, '');
	}

	export function statusFromPresence(present: boolean): HealthStatus {
		return present ? 'ready' : 'missing';
	}

	export function combineHealthStatus(statuses: HealthStatus[]): HealthStatus {
		if (statuses.every((status) => status === 'ready')) return 'ready';
		if (statuses.some((status) => status === 'ready' || status === 'partial')) return 'partial';
		return 'missing';
	}

	export function testCandidatesFor(entry: Pick<ComponentHealthEntry, 'source' | 'relatedFiles'>): string[] {
		const paths = [entry.source, ...entry.relatedFiles];
		const candidates = new SvelteSet<string>();

		for (const path of paths) {
			const normalized = normalisePath(path);
			if (!normalized.endsWith('.svelte')) continue;
			const withoutExt = normalized.slice(0, -'.svelte'.length);
			candidates.add(`${withoutExt}.test.ts`);
			candidates.add(`${withoutExt}.test.svelte`);

			const slash = withoutExt.lastIndexOf('/');
			const dir = slash >= 0 ? withoutExt.slice(0, slash) : '';
			const base = slash >= 0 ? withoutExt.slice(slash + 1) : withoutExt;
			if (base.includes('/')) continue;
			candidates.add(`${dir}/${base}TestHarness.test.svelte`);
		}

		return [...candidates];
	}

	export function createHealthRows(
		entries: ComponentHealthEntry[],
		files: ComponentHealthFiles
	): ComponentHealthRow[] {
		return entries.map((entry) => {
			const screenshotPath = `static/${normalisePath(entry.screenshot)}`;
			const testCandidates = testCandidatesFor(entry);
			const statuses = {
				source: statusFromPresence(files.source.has(normalisePath(entry.source))),
				docs: statusFromPresence(files.docs.has(normalisePath(entry.docs))),
				demo: statusFromPresence(files.demo.has(normalisePath(entry.demo))),
				screenshot: statusFromPresence(files.screenshot.has(screenshotPath)),
				test: statusFromPresence(testCandidates.some((candidate) => files.test.has(candidate)))
			};

			return {
				...entry,
				sourceStatus: statuses.source,
				docsStatus: statuses.docs,
				demoStatus: statuses.demo,
				screenshotStatus: statuses.screenshot,
				testStatus: statuses.test,
				overallStatus: combineHealthStatus([
					statuses.source,
					statuses.docs,
					statuses.demo,
					statuses.screenshot,
					statuses.test
				]),
				testCandidates,
				dependencyLabel: entry.dependencies.length ? entry.dependencies.join(', ') : 'None'
			};
		});
	}

	export function countByStatus(rows: ComponentHealthRow[], key: keyof ComponentHealthRow): Record<HealthStatus, number> {
		const counts: Record<HealthStatus, number> = { ready: 0, partial: 0, missing: 0 };
		for (const row of rows) {
			const status = row[key];
			if (status === 'ready' || status === 'partial' || status === 'missing') counts[status] += 1;
		}
		return counts;
	}
</script>

<script lang="ts">
	interface Props {
		rows: ComponentHealthRow[];
		title?: string;
	}

	let { rows, title = 'Component health matrix' }: Props = $props();
	let query = $state('');
	let statusFilter = $state<'all' | HealthStatus>('all');
	let themeFilter = $state<'all' | 'light' | 'dual'>('all');

	const filteredRows = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return rows.filter((row) => {
			const matchesQuery =
				q.length === 0 ||
				[row.name, row.category, row.href, row.source, row.dependencyLabel]
					.join(' ')
					.toLowerCase()
					.includes(q);
			const matchesStatus = statusFilter === 'all' || row.overallStatus === statusFilter;
			const matchesTheme = themeFilter === 'all' || row.themeSupport === themeFilter;
			return matchesQuery && matchesStatus && matchesTheme;
		});
	});

	const totals = $derived({
		ready: rows.filter((row) => row.overallStatus === 'ready').length,
		partial: rows.filter((row) => row.overallStatus === 'partial').length,
		missing: rows.filter((row) => row.overallStatus === 'missing').length
	});

	const docsCounts = $derived(countByStatus(rows, 'docsStatus'));
	const screenshotCounts = $derived(countByStatus(rows, 'screenshotStatus'));
	const testCounts = $derived(countByStatus(rows, 'testStatus'));
</script>

<section class="health-matrix" aria-labelledby="health-title">
	<header class="hm-head">
		<div>
			<p class="hm-kicker">Catalogue QA</p>
			<h2 id="health-title">{title}</h2>
			<p>Docs, demos, screenshots, tests, and theme support from the live component registry.</p>
		</div>
		<div class="hm-score" aria-label={`${totals.ready} ready, ${totals.partial} partial, ${totals.missing} missing`}>
			<span><b>{totals.ready}</b> ready</span>
			<span><b>{totals.partial}</b> partial</span>
			<span><b>{totals.missing}</b> missing</span>
		</div>
	</header>

	<div class="hm-controls" aria-label="Health matrix filters">
		<label>
			<span>Search</span>
			<input bind:value={query} type="search" placeholder="Component, shelf, dependency..." />
		</label>
		<label>
			<span>Status</span>
			<select bind:value={statusFilter}>
				<option value="all">All</option>
				<option value="ready">Ready</option>
				<option value="partial">Partial</option>
				<option value="missing">Missing</option>
			</select>
		</label>
		<label>
			<span>Theme</span>
			<select bind:value={themeFilter}>
				<option value="all">All</option>
				<option value="dual">Dual</option>
				<option value="light">Light</option>
			</select>
		</label>
	</div>

	<div class="hm-summary" aria-label="Health summary">
		<div><span>Docs</span><b>{docsCounts.ready}/{rows.length}</b></div>
		<div><span>Screenshots</span><b>{screenshotCounts.ready}/{rows.length}</b></div>
		<div><span>Tests</span><b>{testCounts.ready}/{rows.length}</b></div>
	</div>

	<div class="hm-table-wrap">
		<table class="hm-table">
			<thead>
				<tr>
					<th scope="col">Component</th>
					<th scope="col">Shelf</th>
					<th scope="col">Overall</th>
					<th scope="col">Docs</th>
					<th scope="col">Demo</th>
					<th scope="col">Shot</th>
					<th scope="col">Tests</th>
					<th scope="col">Theme</th>
					<th scope="col">Deps</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredRows as row (row.href)}
					<tr>
						<th scope="row">
							<a href={row.href}>{row.name}</a>
							<small>{row.source}</small>
						</th>
						<td>{row.category}</td>
						<td><span class="hm-badge hm-badge--{row.overallStatus}">{row.overallStatus}</span></td>
						<td><span class="hm-dot hm-dot--{row.docsStatus}" aria-label={`Docs ${row.docsStatus}`}></span></td>
						<td><span class="hm-dot hm-dot--{row.demoStatus}" aria-label={`Demo ${row.demoStatus}`}></span></td>
						<td><span class="hm-dot hm-dot--{row.screenshotStatus}" aria-label={`Screenshot ${row.screenshotStatus}`}></span></td>
						<td><span class="hm-dot hm-dot--{row.testStatus}" aria-label={`Tests ${row.testStatus}`}></span></td>
						<td>{row.themeSupport === 'dual' ? 'Dual' : 'Light'}</td>
						<td class="hm-deps">{row.dependencyLabel}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if filteredRows.length === 0}
			<p class="hm-empty">No components match the current filters.</p>
		{/if}
	</div>
</section>

<style>
	/*
	 * THEMING — see docs/THEMING.md. Chrome tokens read the host's shared
	 * tokens (--fg-1, --surface, --border, ...) first and fall back to
	 * built-in light/dark values, so the component works standalone too.
	 * Status tones are semantic: each keeps its hue on both schemes and only
	 * lightens its text / deepens its tint in dark mode for legibility.
	 */
	.health-matrix {
		--hm-fg-1: var(--fg-1, #111827);
		--hm-fg-2: var(--fg-2, #4b5563);
		--hm-fg-3: var(--fg-3, #6b7280);
		--hm-border: var(--border, #d9dde5);
		--hm-surface: var(--surface, #fff);
		--hm-surface-2: var(--surface-2, #f8fafc);
		--hm-accent: var(--accent, #315f9f);
		--hm-ready-bg: #dcfce7;
		--hm-ready-fg: #166534;
		--hm-partial-bg: #fef3c7;
		--hm-partial-fg: #92400e;
		--hm-missing-bg: #fee2e2;
		--hm-missing-fg: #991b1b;
		--hm-ready-dot-ring: #15803d;
		--hm-partial-dot-ring: #b45309;
		--hm-missing-dot-ring: #b91c1c;
	}

	@media (prefers-color-scheme: dark) {
		.health-matrix {
			--hm-fg-1: var(--fg-1, #f3f4f6);
			--hm-fg-2: var(--fg-2, #cbd5e1);
			--hm-fg-3: var(--fg-3, #94a3b8);
			--hm-border: var(--border, #334155);
			--hm-surface: var(--surface, #111827);
			--hm-surface-2: var(--surface-2, #1f2937);
			--hm-accent: var(--accent, #8bb8ff);
			--hm-ready-bg: rgba(22, 163, 74, 0.2);
			--hm-ready-fg: #86efac;
			--hm-partial-bg: rgba(245, 158, 11, 0.18);
			--hm-partial-fg: #fcd34d;
			--hm-missing-bg: rgba(220, 38, 38, 0.2);
			--hm-missing-fg: #fca5a5;
			--hm-ready-dot-ring: #86efac;
			--hm-partial-dot-ring: #fcd34d;
			--hm-missing-dot-ring: #fca5a5;
		}
	}

	.health-matrix {
		display: grid;
		gap: 18px;
		color: var(--hm-fg-1);
	}

	.hm-head {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 18px;
		align-items: start;
	}

	.hm-kicker {
		margin: 0 0 6px;
		font: 700 11px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--hm-accent);
	}

	.hm-head h2 {
		margin: 0;
		font: 700 clamp(1.5rem, 3vw, 2.4rem)/0.95 var(--font-display, Georgia, serif);
	}

	.hm-head p {
		margin: 8px 0 0;
		max-width: 58ch;
		color: var(--hm-fg-2);
	}

	.hm-score,
	.hm-summary,
	.hm-controls {
		border: 1px solid var(--hm-border);
		background: var(--hm-surface);
	}

	.hm-score {
		display: grid;
		min-width: 160px;
	}

	.hm-score span {
		display: flex;
		justify-content: space-between;
		gap: 14px;
		padding: 10px 12px;
		border-bottom: 1px solid var(--hm-border);
		font: 600 12px/1.2 var(--font-sans, system-ui, sans-serif);
	}

	.hm-score span:last-child { border-bottom: 0; }

	.hm-controls {
		display: grid;
		grid-template-columns: minmax(220px, 1fr) 150px 150px;
		gap: 12px;
		padding: 12px;
	}

	.hm-controls label {
		display: grid;
		gap: 5px;
		font: 700 11px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
		color: var(--hm-fg-3);
	}

	.hm-controls input,
	.hm-controls select {
		width: 100%;
		min-height: 38px;
		border: 1px solid var(--hm-border);
		border-radius: 4px;
		background: var(--hm-surface-2);
		color: var(--hm-fg-1);
		font: 500 14px/1.2 var(--font-sans, system-ui, sans-serif);
	}

	.hm-controls input { padding: 0 10px; }
	.hm-controls select { padding: 0 8px; }

	.hm-summary {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.hm-summary div {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 12px;
		border-right: 1px solid var(--hm-border);
	}

	.hm-summary div:last-child { border-right: 0; }
	.hm-summary span { color: var(--hm-fg-2); }

	.hm-table-wrap {
		overflow-x: auto;
		border: 1px solid var(--hm-border);
		background: var(--hm-surface);
	}

	.hm-table {
		width: 100%;
		min-width: 920px;
		border-collapse: collapse;
		font: 500 13px/1.35 var(--font-sans, system-ui, sans-serif);
	}

	.hm-table th,
	.hm-table td {
		padding: 10px 12px;
		border-bottom: 1px solid var(--hm-border);
		text-align: left;
		vertical-align: top;
	}

	.hm-table thead th {
		position: sticky;
		top: 0;
		z-index: 1;
		background: var(--hm-surface-2);
		font: 700 11px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--hm-fg-3);
	}

	.hm-table tbody tr:hover { background: color-mix(in srgb, var(--hm-accent) 6%, transparent); }

	.hm-table a {
		color: var(--hm-fg-1);
		font-weight: 800;
		text-decoration: none;
	}

	.hm-table a:hover { text-decoration: underline; }

	.hm-table small {
		display: block;
		margin-top: 3px;
		color: var(--hm-fg-3);
		font: 500 11px/1.2 var(--font-mono, ui-monospace, monospace);
	}

	.hm-badge {
		display: inline-flex;
		align-items: center;
		min-width: 58px;
		justify-content: center;
		padding: 4px 7px;
		border-radius: 4px;
		font: 800 10px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.hm-badge--ready { background: var(--hm-ready-bg); color: var(--hm-ready-fg); }
	.hm-badge--partial { background: var(--hm-partial-bg); color: var(--hm-partial-fg); }
	.hm-badge--missing { background: var(--hm-missing-bg); color: var(--hm-missing-fg); }

	.hm-dot {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid currentColor;
	}

	.hm-dot--ready { background: #22c55e; color: var(--hm-ready-dot-ring); }
	.hm-dot--partial { background: #f59e0b; color: var(--hm-partial-dot-ring); }
	.hm-dot--missing { background: #ef4444; color: var(--hm-missing-dot-ring); }

	.hm-deps {
		max-width: 220px;
		color: var(--hm-fg-2);
	}

	.hm-empty {
		margin: 0;
		padding: 24px;
		color: var(--hm-fg-2);
	}

	@media (max-width: 720px) {
		.hm-head,
		.hm-controls,
		.hm-summary {
			grid-template-columns: 1fr;
		}

		.hm-summary div,
		.hm-score span {
			border-right: 0;
		}
	}
</style>
