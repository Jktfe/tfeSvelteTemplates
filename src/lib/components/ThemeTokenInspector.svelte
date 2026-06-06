<script lang="ts" module>
	import { SvelteMap } from 'svelte/reactivity';

	export type ThemeTokenKind = 'chrome' | 'brand' | 'semantic';
	export type ThemePreviewMode = 'light' | 'dark';
	export type ContrastTone = 'high' | 'ok' | 'low' | 'n/a';

	export interface ThemeTokenRow {
		property: string;
		kind: ThemeTokenKind;
		component: string;
		selector: string;
		role: string;
		light: string;
		dark?: string;
		note: string;
	}

	export interface ContrastResult {
		ratio: number | null;
		tone: ContrastTone;
		label: string;
	}

	export const themeKindLabels: Record<ThemeTokenKind, string> = {
		chrome: 'Chrome',
		brand: 'Brand',
		semantic: 'Semantic'
	};

	export const defaultThemeTokenRows: ThemeTokenRow[] = [
		{
			property: '--tooltip-bg',
			kind: 'chrome',
			component: 'Tooltip',
			selector: 'body .tooltip-wrap.tooltip-wrap',
			role: 'Panel background and arrow fill',
			light: '#111827',
			dark: '#f9fafb',
			note: 'Structural surface; flips between schemes.'
		},
		{
			property: '--tooltip-fg',
			kind: 'chrome',
			component: 'Tooltip',
			selector: 'body .tooltip-wrap.tooltip-wrap',
			role: 'Tooltip body text',
			light: '#f9fafb',
			dark: '#111827',
			note: 'Foreground paired with tooltip background.'
		},
		{
			property: '--kbd-bg-top',
			kind: 'chrome',
			component: 'KbdShortcut',
			selector: 'body .kbd.kbd',
			role: 'Key cap bevel top',
			light: '#ffffff',
			dark: '#1f2937',
			note: 'Chrome surface; dark mode deepens the cap.'
		},
		{
			property: '--kbd-bg-bottom',
			kind: 'chrome',
			component: 'KbdShortcut',
			selector: 'body .kbd.kbd',
			role: 'Key cap bevel bottom',
			light: '#f3f4f6',
			dark: '#111827',
			note: 'Chrome surface; flips with the cap body.'
		},
		{
			property: '--kbd-border',
			kind: 'chrome',
			component: 'KbdShortcut',
			selector: 'body .kbd.kbd',
			role: 'Key cap outline',
			light: '#d1d5db',
			dark: '#4b5563',
			note: 'Structural border; follows the surface.'
		},
		{
			property: '--rating-star-empty',
			kind: 'chrome',
			component: 'RatingStars',
			selector: 'body .rating-stars.rating-stars',
			role: 'Empty star fill',
			light: '#e5e7eb',
			dark: '#374151',
			note: 'Inactive chrome; flips for dark surfaces.'
		},
		{
			property: '--rating-focus-ring',
			kind: 'chrome',
			component: 'RatingStars',
			selector: 'body .rating-stars.rating-stars',
			role: 'Keyboard focus ring',
			light: '#3b82f6',
			dark: '#60a5fa',
			note: 'Focus chrome; kept visible in both schemes.'
		},
		{
			property: '--rating-star-filled',
			kind: 'brand',
			component: 'RatingStars',
			selector: 'body .rating-stars.rating-stars',
			role: 'Filled rating star',
			light: '#fbbf24',
			note: 'Brand gold stays stable across schemes.'
		},
		{
			property: '--fill-color',
			kind: 'brand',
			component: 'Slider',
			selector: 'body .slider-wrap.slider-wrap',
			role: 'Variant accent fill',
			light: '#3b82f6',
			note: 'Variant identity; consumers opt into changes.'
		},
		{
			property: '--accent',
			kind: 'brand',
			component: 'App chrome',
			selector: ':root',
			role: 'Shared product accent',
			light: '#315f9f',
			note: 'Product identity token; not part of a dark flip.'
		},
		{
			property: '--success',
			kind: 'semantic',
			component: 'Status UI',
			selector: ':root',
			role: 'Success state',
			light: '#16a34a',
			note: 'Meaning comes from the color family.'
		},
		{
			property: '--warning',
			kind: 'semantic',
			component: 'Status UI',
			selector: ':root',
			role: 'Warning state',
			light: '#d97706',
			note: 'Warning should remain recognisable.'
		},
		{
			property: '--error',
			kind: 'semantic',
			component: 'Status UI',
			selector: ':root',
			role: 'Error state',
			light: '#dc2626',
			note: 'Error stays red unless explicitly themed.'
		},
		{
			property: '--info',
			kind: 'semantic',
			component: 'Status UI',
			selector: ':root',
			role: 'Informational state',
			light: '#2563eb',
			note: 'Informational blue keeps its meaning.'
		}
	];

	export function groupTokenRows(rows: ThemeTokenRow[]): Record<ThemeTokenKind, ThemeTokenRow[]> {
		return {
			chrome: rows.filter((row) => row.kind === 'chrome'),
			brand: rows.filter((row) => row.kind === 'brand'),
			semantic: rows.filter((row) => row.kind === 'semantic')
		};
	}

	export function tokenValueForMode(row: Pick<ThemeTokenRow, 'light' | 'dark'>, mode: ThemePreviewMode): string {
		return mode === 'dark' ? row.dark ?? row.light : row.light;
	}

	export function flipsInDark(row: Pick<ThemeTokenRow, 'light' | 'dark'>): boolean {
		return Boolean(row.dark && row.dark.toLowerCase() !== row.light.toLowerCase());
	}

	export function hexToRgb(value: string): { r: number; g: number; b: number } | null {
		const match = value.trim().match(/^#([0-9a-f]{6})$/i);
		if (!match) return null;
		const raw = match[1];
		return {
			r: Number.parseInt(raw.slice(0, 2), 16),
			g: Number.parseInt(raw.slice(2, 4), 16),
			b: Number.parseInt(raw.slice(4, 6), 16)
		};
	}

	export function relativeLuminance(value: string): number | null {
		const rgb = hexToRgb(value);
		if (!rgb) return null;
		const channel = (part: number) => {
			const normalized = part / 255;
			return normalized <= 0.03928
				? normalized / 12.92
				: ((normalized + 0.055) / 1.055) ** 2.4;
		};
		return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
	}

	export function contrastRatio(foreground: string, background: string): number | null {
		const fg = relativeLuminance(foreground);
		const bg = relativeLuminance(background);
		if (fg === null || bg === null) return null;
		const lighter = Math.max(fg, bg);
		const darker = Math.min(fg, bg);
		return (lighter + 0.05) / (darker + 0.05);
	}

	export function contrastLabel(value: string, mode: ThemePreviewMode): ContrastResult {
		const background = mode === 'dark' ? '#111827' : '#ffffff';
		const ratio = contrastRatio(value, background);
		if (ratio === null) return { ratio: null, tone: 'n/a', label: 'N/A' };
		if (ratio >= 7) return { ratio, tone: 'high', label: `${ratio.toFixed(1)}:1 high` };
		if (ratio >= 3) return { ratio, tone: 'ok', label: `${ratio.toFixed(1)}:1 ok` };
		return { ratio, tone: 'low', label: `${ratio.toFixed(1)}:1 low` };
	}

	export function cssOverrideSnippet(rows: ThemeTokenRow[], mode: ThemePreviewMode): string {
		const bySelector = new SvelteMap<string, ThemeTokenRow[]>();
		for (const row of rows) {
			const bucket = bySelector.get(row.selector) ?? [];
			bucket.push(row);
			bySelector.set(row.selector, bucket);
		}

		return [...bySelector.entries()]
			.map(([selector, selectorRows]) => {
				const declarations = selectorRows
					.map((row) => `  ${row.property}: ${tokenValueForMode(row, mode)};`)
					.join('\n');
				const rule = `${selector} {\n${declarations}\n}`;
				return mode === 'dark' && selectorRows.some(flipsInDark)
					? `:root.dark ${selector.replace(/^body\s+/, '')} {\n${declarations}\n}`
					: rule;
			})
			.join('\n\n');
	}
</script>

<script lang="ts">
	interface Props {
		rows?: ThemeTokenRow[];
		title?: string;
		initialMode?: ThemePreviewMode;
	}

	let {
		rows = defaultThemeTokenRows,
		title = 'Theme token inspector',
		initialMode = 'light'
	}: Props = $props();

	let mode = $derived(initialMode);
	let activeKind = $state<ThemeTokenKind>('chrome');
	let copiedKey = $state<string | null>(null);
	let clearCopiedTimer: ReturnType<typeof setTimeout> | undefined;

	const groupedRows = $derived(groupTokenRows(rows));
	const activeRows = $derived(groupedRows[activeKind]);
	const activeSnippet = $derived(cssOverrideSnippet(activeRows, mode));
	const activeSummary = $derived({
		total: activeRows.length,
		flipping: activeRows.filter(flipsInDark).length,
		stable: activeRows.filter((row) => !flipsInDark(row)).length
	});

	async function copyText(value: string, key: string) {
		try {
			await navigator.clipboard.writeText(value);
			copiedKey = key;
			if (clearCopiedTimer) clearTimeout(clearCopiedTimer);
			clearCopiedTimer = setTimeout(() => {
				copiedKey = null;
			}, 1600);
		} catch {
			copiedKey = null;
		}
	}
</script>

<section class="tti" class:tti-dark={mode === 'dark'} aria-labelledby="tti-title">
	<header class="tti-head">
		<div>
			<p class="tti-kicker">Theming convention</p>
			<h2 id="tti-title">{title}</h2>
			<p>Chrome flips. Brand stays. Semantic stays.</p>
		</div>
		<div class="tti-toggle" aria-label="Preview mode">
			<button
				type="button"
				class:active={mode === 'light'}
				aria-pressed={mode === 'light'}
				onclick={() => (mode = 'light')}
			>
				Light
			</button>
			<button
				type="button"
				class:active={mode === 'dark'}
				aria-pressed={mode === 'dark'}
				onclick={() => (mode = 'dark')}
			>
				Dark
			</button>
		</div>
	</header>

	<div class="tti-rule-strip" aria-label="Token taxonomy summary">
		{#each (['chrome', 'brand', 'semantic'] as ThemeTokenKind[]) as kind (kind)}
			<button
				type="button"
				class="tti-rule"
				class:active={activeKind === kind}
				aria-pressed={activeKind === kind}
				onclick={() => (activeKind = kind)}
			>
				<span>{themeKindLabels[kind]}</span>
				<b>{groupedRows[kind].length}</b>
			</button>
		{/each}
	</div>

	<div class="tti-preview" aria-label={`${themeKindLabels[activeKind]} token preview`}>
		<div class="tti-preview-card">
			<span class="tti-preview-label">{themeKindLabels[activeKind]}</span>
			<strong>{activeSummary.flipping} flipping / {activeSummary.stable} stable</strong>
			<p>
				{#if activeKind === 'chrome'}
					Structural surfaces should change with the preview mode.
				{:else if activeKind === 'brand'}
					Identity tokens should remain recognisable unless a consumer opts in.
				{:else}
					State colors should keep their meaning across schemes.
				{/if}
			</p>
		</div>
		<div class="tti-swatch-cloud">
			{#each activeRows.slice(0, 8) as row (row.property)}
				{@const value = tokenValueForMode(row, mode)}
				<span class="tti-cloud-chip" style={`--swatch-color: ${value}`}>
					<span class="tti-cloud-dot" aria-hidden="true"></span>
					{row.property}
				</span>
			{/each}
		</div>
	</div>

	<div class="tti-table-wrap">
		<table class="tti-table">
			<thead>
				<tr>
					<th scope="col">Token</th>
					<th scope="col">Kind</th>
					<th scope="col">Light</th>
					<th scope="col">Dark</th>
					<th scope="col">Preview</th>
					<th scope="col">Contrast-ish</th>
					<th scope="col">Override</th>
				</tr>
			</thead>
			<tbody>
				{#each activeRows as row (row.property)}
					{@const value = tokenValueForMode(row, mode)}
					{@const contrast = contrastLabel(value, mode)}
					<tr>
						<th scope="row">
							<code>{row.property}</code>
							<small>{row.component} - {row.role}</small>
						</th>
						<td><span class="tti-kind tti-kind-{row.kind}">{themeKindLabels[row.kind]}</span></td>
						<td>
							<span class="tti-swatch-line">
								<span class="tti-swatch" style={`--swatch-color: ${row.light}`} aria-hidden="true"></span>
								<code>{row.light}</code>
							</span>
						</td>
						<td>
							<span class="tti-swatch-line">
								<span
									class="tti-swatch"
									class:stable={!flipsInDark(row)}
									style={`--swatch-color: ${row.dark ?? row.light}`}
									aria-hidden="true"
								></span>
								<code>{row.dark ?? 'same'}</code>
							</span>
						</td>
						<td>
							<span class="tti-swatch-line">
								<span class="tti-swatch active" style={`--swatch-color: ${value}`} aria-hidden="true"></span>
								<code>{value}</code>
							</span>
						</td>
						<td>
							<span class="tti-contrast tti-contrast-{contrast.tone}">{contrast.label}</span>
						</td>
						<td>
							<button
								type="button"
								class="tti-copy-mini"
								aria-label={`Copy ${row.property} override`}
								onclick={() => copyText(cssOverrideSnippet([row], mode), row.property)}
							>
								{copiedKey === row.property ? 'Copied' : 'Copy'}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<section class="tti-snippet" aria-labelledby="tti-snippet-title">
		<header>
			<div>
				<p class="tti-kicker">Copy override</p>
				<h3 id="tti-snippet-title">{themeKindLabels[activeKind]} CSS snippet</h3>
			</div>
			<button type="button" class="tti-copy" onclick={() => copyText(activeSnippet, 'snippet')}>
				{copiedKey === 'snippet' ? 'Copied' : 'Copy CSS'}
			</button>
		</header>
		<pre><code>{activeSnippet}</code></pre>
	</section>
</section>

<style>
	.tti {
		--tti-bg: #ffffff;
		--tti-panel: #f8fafc;
		--tti-panel-strong: #f1f5f9;
		--tti-fg: #111827;
		--tti-muted: #64748b;
		--tti-border: #dbe3ef;
		--tti-accent: #315f9f;
		--tti-code: #0f172a;
		display: grid;
		gap: 18px;
		color: var(--tti-fg);
	}

	.tti-dark {
		--tti-bg: #111827;
		--tti-panel: #172033;
		--tti-panel-strong: #1f2937;
		--tti-fg: #f9fafb;
		--tti-muted: #a7b3c6;
		--tti-border: #334155;
		--tti-accent: #8bb8ff;
		--tti-code: #eef2ff;
	}

	.tti-head {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 16px;
		align-items: start;
	}

	.tti-kicker {
		margin: 0 0 6px;
		color: var(--tti-accent);
		font: 700 11px/1 var(--font-mono, ui-monospace, monospace);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.tti h2,
	.tti h3,
	.tti p {
		margin: 0;
	}

	.tti h2 {
		font-size: clamp(1.6rem, 4vw, 2.5rem);
		line-height: 1.02;
		letter-spacing: 0;
	}

	.tti h3 {
		font-size: 1rem;
		line-height: 1.2;
	}

	.tti-head p:last-child,
	.tti-preview-card p {
		margin-top: 8px;
		color: var(--tti-muted);
		line-height: 1.55;
	}

	.tti-toggle,
	.tti-rule-strip {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.tti-toggle {
		justify-content: flex-end;
		padding: 4px;
		border: 1px solid var(--tti-border);
		border-radius: 8px;
		background: var(--tti-panel);
	}

	.tti-toggle button,
	.tti-rule,
	.tti-copy,
	.tti-copy-mini {
		border: 1px solid var(--tti-border);
		border-radius: 8px;
		background: var(--tti-bg);
		color: var(--tti-fg);
		cursor: pointer;
		font: 700 12px/1 var(--font-sans, system-ui, sans-serif);
	}

	.tti-toggle button {
		min-width: 70px;
		padding: 9px 12px;
	}

	.tti-toggle button.active,
	.tti-rule.active {
		border-color: var(--tti-accent);
		background: color-mix(in srgb, var(--tti-accent) 14%, var(--tti-bg));
		color: var(--tti-fg);
	}

	.tti-rule-strip {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.tti-rule {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
		min-height: 46px;
		padding: 12px;
		text-align: left;
	}

	.tti-rule b {
		color: var(--tti-accent);
		font-family: var(--font-mono, ui-monospace, monospace);
	}

	.tti-preview,
	.tti-snippet,
	.tti-table-wrap {
		border: 1px solid var(--tti-border);
		border-radius: 8px;
		background: var(--tti-bg);
		box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
		overflow: hidden;
	}

	.tti-preview {
		display: grid;
		grid-template-columns: minmax(220px, 0.4fr) minmax(0, 1fr);
		gap: 16px;
		padding: 16px;
	}

	.tti-preview-card {
		padding: 16px;
		border: 1px solid var(--tti-border);
		border-radius: 8px;
		background: var(--tti-panel);
	}

	.tti-preview-label,
	.tti-kind,
	.tti-contrast {
		display: inline-flex;
		align-items: center;
		width: fit-content;
		border-radius: 999px;
		font: 700 11px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.tti-preview-label {
		margin-bottom: 10px;
		color: var(--tti-accent);
	}

	.tti-preview-card strong {
		display: block;
		font-size: 1.25rem;
		line-height: 1.2;
	}

	.tti-swatch-cloud {
		display: flex;
		flex-wrap: wrap;
		align-content: start;
		gap: 10px;
		padding: 16px;
		border-radius: 8px;
		background: var(--tti-panel);
	}

	.tti-cloud-chip {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 34px;
		padding: 7px 10px;
		border: 1px solid var(--tti-border);
		border-radius: 8px;
		background: var(--tti-bg);
		color: var(--tti-fg);
		font: 700 12px/1 var(--font-mono, ui-monospace, monospace);
	}

	.tti-cloud-dot,
	.tti-swatch {
		background: var(--swatch-color);
	}

	.tti-cloud-dot {
		width: 16px;
		height: 16px;
		border: 1px solid rgba(15, 23, 42, 0.2);
		border-radius: 999px;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
	}

	.tti-table-wrap {
		overflow-x: auto;
	}

	.tti-table {
		width: 100%;
		min-width: 820px;
		border-collapse: collapse;
	}

	.tti-table th,
	.tti-table td {
		padding: 12px;
		border-bottom: 1px solid var(--tti-border);
		text-align: left;
		vertical-align: top;
		font-size: 13px;
	}

	.tti-table thead th {
		background: var(--tti-panel);
		color: var(--tti-muted);
		font: 700 11px/1 var(--font-mono, ui-monospace, monospace);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.tti-table tbody tr:last-child th,
	.tti-table tbody tr:last-child td {
		border-bottom: 0;
	}

	.tti-table code,
	.tti-snippet code {
		color: var(--tti-code);
		font-family: var(--font-mono, ui-monospace, monospace);
	}

	.tti-table small {
		display: block;
		margin-top: 5px;
		color: var(--tti-muted);
		line-height: 1.35;
	}

	.tti-kind,
	.tti-contrast {
		padding: 6px 8px;
		border: 1px solid var(--tti-border);
		background: var(--tti-panel);
	}

	.tti-kind-chrome {
		color: #315f9f;
	}

	.tti-kind-brand {
		color: #9a3412;
	}

	.tti-kind-semantic {
		color: #047857;
	}

	.tti-swatch-line {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		white-space: nowrap;
	}

	.tti-swatch {
		width: 22px;
		height: 22px;
		flex: 0 0 auto;
		border: 1px solid rgba(15, 23, 42, 0.22);
		border-radius: 6px;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.42);
	}

	.tti-swatch.active {
		outline: 2px solid var(--tti-accent);
		outline-offset: 2px;
	}

	.tti-swatch.stable {
		background-image: linear-gradient(135deg, transparent 0 44%, rgba(15, 23, 42, 0.28) 45% 55%, transparent 56%);
	}

	.tti-contrast-high {
		color: #047857;
	}

	.tti-contrast-ok {
		color: #9a3412;
	}

	.tti-contrast-low {
		color: #b91c1c;
	}

	.tti-copy-mini {
		padding: 8px 10px;
	}

	.tti-snippet {
		display: grid;
	}

	.tti-snippet header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border-bottom: 1px solid var(--tti-border);
		background: var(--tti-panel);
	}

	.tti-copy {
		padding: 10px 12px;
	}

	.tti-copy:hover,
	.tti-copy-mini:hover,
	.tti-rule:hover,
	.tti-toggle button:hover {
		border-color: var(--tti-accent);
	}

	.tti-snippet pre {
		margin: 0;
		padding: 16px;
		overflow-x: auto;
		background: var(--tti-panel-strong);
		font-size: 13px;
		line-height: 1.55;
	}

	@media (max-width: 760px) {
		.tti-head,
		.tti-preview {
			grid-template-columns: 1fr;
		}

		.tti-toggle {
			justify-content: stretch;
		}

		.tti-toggle button {
			flex: 1;
		}

		.tti-rule-strip {
			grid-template-columns: 1fr;
		}
	}
</style>
