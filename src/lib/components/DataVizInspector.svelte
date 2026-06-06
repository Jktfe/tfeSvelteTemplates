<script lang="ts" module>
	export interface DataVizSpec {
		title: string;
		chartType: 'bar' | 'line' | 'scatter' | 'map' | 'table';
		rowCount: number;
		hasSource: boolean;
		hasAltText: boolean;
		hasUnits: boolean;
		hasColorLegend: boolean;
	}

	export interface DataVizCheck {
		label: string;
		pass: boolean;
		reason: string;
	}

	export function dataVizChecks(spec: DataVizSpec): DataVizCheck[] {
		return [
			{ label: 'Title', pass: spec.title.trim().length > 0, reason: 'Reader needs a visible chart title.' },
			{ label: 'Rows', pass: spec.rowCount > 0, reason: 'Charts need at least one data row.' },
			{ label: 'Source', pass: spec.hasSource, reason: 'Source metadata should travel with the chart.' },
			{ label: 'Alt text', pass: spec.hasAltText, reason: 'Visuals need accessible summaries.' },
			{ label: 'Units', pass: spec.hasUnits, reason: 'Axes and measures should expose units.' },
			{
				label: 'Legend',
				pass: spec.chartType === 'table' || spec.hasColorLegend,
				reason: 'Grouped visual encodings need a visible legend.'
			}
		];
	}

	export function dataVizScore(spec: DataVizSpec): number {
		const checks = dataVizChecks(spec);
		return Math.round((checks.filter((check) => check.pass).length / checks.length) * 100);
	}

	export function dataVizVerdict(score: number): 'ready' | 'review' | 'blocked' {
		if (score >= 90) return 'ready';
		if (score >= 60) return 'review';
		return 'blocked';
	}
</script>

<script lang="ts">
	interface Props {
		specs: DataVizSpec[];
		title?: string;
		class?: string;
	}

	let { specs, title = 'Data viz inspector', class: extraClass = '' }: Props = $props();

	let activeTitle = $state('');
	$effect(() => {
		if (!activeTitle && specs[0]) activeTitle = specs[0].title;
	});

	const active = $derived(specs.find((spec) => spec.title === activeTitle) ?? specs[0]);
	const checks = $derived(active ? dataVizChecks(active) : []);
	const score = $derived(active ? dataVizScore(active) : 0);
	const verdict = $derived(dataVizVerdict(score));
</script>

<section class="viz-inspector {extraClass}" aria-labelledby="viz-title">
	<header>
		<p>Chart QA</p>
		<h2 id="viz-title">{title}</h2>
	</header>

	<div class="vi-layout">
		<nav aria-label="Chart specs">
			{#each specs as spec (spec.title)}
				<button
					type="button"
					class:active={spec.title === active?.title}
					onclick={() => (activeTitle = spec.title)}
				>
					<span>{spec.chartType}</span>
					{spec.title}
				</button>
			{/each}
		</nav>

		{#if active}
			<article class="vi-report vi-report--{verdict}">
				<div class="vi-score">
					<strong>{score}</strong>
					<span>{verdict}</span>
				</div>
				<div>
					<h3>{active.title}</h3>
					<p>{active.chartType} · {active.rowCount.toLocaleString()} rows</p>
					<ul>
					{#each checks as check (check.label)}
							<li class:pass={check.pass}>
								<b>{check.pass ? 'Pass' : 'Review'}</b>
								<span>{check.label}</span>
								<em>{check.reason}</em>
							</li>
						{/each}
					</ul>
				</div>
			</article>
		{/if}
	</div>
</section>

<style>
	.viz-inspector {
		display: grid;
		gap: 18px;
	}

	.viz-inspector header p {
		margin: 0 0 6px;
		color: #0369a1;
		font: 900 11px/1 var(--font-mono, ui-monospace, monospace);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.viz-inspector h2,
	.viz-inspector h3 {
		margin: 0;
		font-family: var(--font-display, Georgia, serif);
	}

	.viz-inspector h2 {
		font-size: clamp(1.7rem, 3vw, 2.5rem);
		line-height: 1;
	}

	.vi-layout {
		display: grid;
		grid-template-columns: minmax(190px, 280px) minmax(0, 1fr);
		gap: 14px;
	}

	.vi-layout nav {
		display: grid;
		gap: 8px;
	}

	.vi-layout button {
		display: grid;
		gap: 5px;
		padding: 11px;
		border: 1px solid var(--border, #d9dde5);
		border-radius: 6px;
		background: var(--surface, #fff);
		color: inherit;
		text-align: left;
		cursor: pointer;
	}

	.vi-layout button.active {
		border-color: #0369a1;
		box-shadow: 0 0 0 2px rgba(3, 105, 161, 0.14);
	}

	.vi-layout button span {
		color: #0369a1;
		font: 900 10px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.vi-report {
		display: grid;
		grid-template-columns: 130px minmax(0, 1fr);
		gap: 16px;
		padding: 16px;
		border: 1px solid var(--vi-border, #bae6fd);
		border-radius: 6px;
		background: var(--surface, #fff);
	}

	.vi-report--ready { --vi-accent: #15803d; --vi-bg: #dcfce7; --vi-border: #86efac; }
	.vi-report--review { --vi-accent: #92400e; --vi-bg: #fef3c7; --vi-border: #fcd34d; }
	.vi-report--blocked { --vi-accent: #b91c1c; --vi-bg: #fee2e2; --vi-border: #fca5a5; }

	.vi-score {
		display: grid;
		place-items: center;
		align-content: center;
		min-height: 130px;
		border-radius: 6px;
		background: var(--vi-bg);
		color: var(--vi-accent);
	}

	.vi-score strong {
		font: 900 2.4rem/1 var(--font-display, Georgia, serif);
	}

	.vi-score span {
		font: 900 10px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.vi-report p {
		margin: 7px 0 12px;
		color: var(--fg-2, #4b5563);
	}

	.vi-report ul {
		display: grid;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.vi-report li {
		display: grid;
		grid-template-columns: 70px 100px minmax(0, 1fr);
		gap: 8px;
		padding: 9px;
		border: 1px solid #fecaca;
		border-radius: 4px;
		background: #fff1f2;
	}

	.vi-report li.pass {
		border-color: #bbf7d0;
		background: #f0fdf4;
	}

	.vi-report li b,
	.vi-report li span {
		font: 900 10px/1.3 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.vi-report li em {
		color: var(--fg-2, #4b5563);
		font-style: normal;
	}

	@media (max-width: 820px) {
		.vi-layout,
		.vi-report {
			grid-template-columns: 1fr;
		}
	}
</style>
