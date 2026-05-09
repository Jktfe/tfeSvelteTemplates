<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Gantt from '$lib/components/Gantt.svelte';
	import type { GanttTask } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const shell = catalogShellPropsForSlug('/gantt')!;
	const tasks = $derived(data.gantt.data);

	let lastClicked = $state<GanttTask | null>(null);

	let dayWidth = $state(32);
	let showWeekends = $state(true);
	let showToday = $state(true);
	let showDeps = $state(true);
	let showProgress = $state(true);

	const sprint: GanttTask[] = [
		{
			id: 'spec',
			name: 'Spec & approvals',
			start: offsetISO(-3),
			end: offsetISO(0),
			progress: 100,
			group: 'Plan'
		},
		{
			id: 'spec-signoff',
			name: 'Spec sign-off',
			start: offsetISO(0),
			end: offsetISO(0),
			isMilestone: true,
			dependencies: ['spec'],
			color: '#8b5cf6'
		},
		{
			id: 'impl',
			name: 'Implementation',
			start: offsetISO(1),
			end: offsetISO(8),
			progress: 35,
			dependencies: ['spec-signoff']
		},
		{
			id: 'qa',
			name: 'QA pass',
			start: offsetISO(7),
			end: offsetISO(10),
			progress: 0,
			dependencies: ['impl']
		},
		{
			id: 'release',
			name: 'Release',
			start: offsetISO(11),
			end: offsetISO(11),
			isMilestone: true,
			dependencies: ['qa'],
			color: '#10b981'
		}
	];

	const release: GanttTask[] = [
		{ id: 'r1', name: 'Plan release notes', start: offsetISO(-2), end: offsetISO(2), progress: 80 },
		{ id: 'r2', name: 'Cut RC build', start: offsetISO(3), end: offsetISO(3), isMilestone: true, dependencies: ['r1'], color: '#f59e0b' },
		{ id: 'r3', name: 'Bake & smoke tests', start: offsetISO(4), end: offsetISO(7), progress: 20, dependencies: ['r2'] },
		{ id: 'r4', name: 'Ship to production', start: offsetISO(8), end: offsetISO(8), isMilestone: true, dependencies: ['r3'], color: '#10b981' }
	];

	function offsetISO(days: number): string {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- pure helper, no reactive state stored
		const d = new Date(Date.now());
		d.setHours(0, 0, 0, 0);
		d.setDate(d.getDate() + days);
		return d.toISOString().slice(0, 10);
	}

	function handleClick(task: GanttTask) {
		lastClicked = task;
	}
</script>

<svelte:head>
	<title>Gantt — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Native SVG Gantt chart with task bars, milestones, dependency arrows, today marker, weekend shading, % complete, light + dark, and mobile horizontal scrolling."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'SVG', 'Schedule', 'A11y', 'Theme-aware', 'Zero-dep']}
	codeExplanation="Gantt is a dependency-free SVG chart. It computes day offsets from the earliest task start, places each task as a rect (or diamond for milestones), and draws elbow-routed arrows between dependent tasks. Today, weekends, and progress are all derived state — change tasks and the chart re-renders without any imperative drawing code."
>
	{#snippet demo()}
		<div class="g-demo">
			<div class="g-status">
				<DatabaseStatus
					usingDatabase={data.gantt.usingDatabase}
					source={data.gantt.source}
					message={data.gantt.message}
				/>
			</div>
			<section class="g-section">
				<header>
					<h4>Project schedule</h4>
					<p>Multi-stream plan with dependencies, two milestones, weekends shaded, today marker live.</p>
				</header>
				<div class="g-stage">
					<Gantt tasks={tasks} onTaskClick={handleClick} />
				</div>
				<p class="g-state">
					Last clicked: <code>{lastClicked ? lastClicked.name : '—'}</code>
				</p>
			</section>

			<section class="g-section">
				<header>
					<h4>Sprint board</h4>
					<p>Tighter cadence — Spec → Impl → QA → Release with milestones either end.</p>
				</header>
				<div class="g-stage">
					<Gantt tasks={sprint} dayWidth={36} />
				</div>
			</section>

			<section class="g-section">
				<header>
					<h4>Release train</h4>
					<p>Smaller schedule, no dependency arrows — just the bars and milestones.</p>
				</header>
				<div class="g-stage">
					<Gantt tasks={release} dayWidth={40} showDependencies={false} />
				</div>
			</section>

			<section class="g-section">
				<header>
					<h4>Interactive playground</h4>
					<p>Toggle features and re-size the day width to see the chart adapt.</p>
				</header>
				<div class="g-controls" role="group" aria-label="Gantt playground controls">
					<label>
						Day width
						<input type="range" min="18" max="64" step="2" bind:value={dayWidth} />
						<output>{dayWidth}px</output>
					</label>
					<label>
						<input type="checkbox" bind:checked={showWeekends} /> Weekend shading
					</label>
					<label>
						<input type="checkbox" bind:checked={showToday} /> Today marker
					</label>
					<label>
						<input type="checkbox" bind:checked={showDeps} /> Dependency arrows
					</label>
					<label>
						<input type="checkbox" bind:checked={showProgress} /> Progress overlay
					</label>
				</div>
				<div class="g-stage">
					<Gantt
						tasks={tasks}
						{dayWidth}
						showWeekends={showWeekends}
						showToday={showToday}
						showDependencies={showDeps}
						showProgress={showProgress}
						onTaskClick={handleClick}
					/>
				</div>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<table class="cp-api-table">
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>tasks</code></td><td><code>GanttTask[]</code></td><td>required</td><td>Rows in display order.</td></tr>
				<tr><td><code>startDate</code></td><td><code>string | Date</code></td><td><code>min(task.start)</code></td><td>Earliest date the chart covers.</td></tr>
				<tr><td><code>endDate</code></td><td><code>string | Date</code></td><td><code>max(task.end)</code></td><td>Latest date the chart covers.</td></tr>
				<tr><td><code>dayWidth</code></td><td><code>number</code></td><td><code>32</code></td><td>Pixels per day on the timeline.</td></tr>
				<tr><td><code>rowHeight</code></td><td><code>number</code></td><td><code>36</code></td><td>Pixel height of a task row.</td></tr>
				<tr><td><code>labelWidth</code></td><td><code>number</code></td><td><code>220</code></td><td>Pixel width of the labels column.</td></tr>
				<tr><td><code>showWeekends</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Shade Saturdays and Sundays.</td></tr>
				<tr><td><code>showToday</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Vertical line + label at today.</td></tr>
				<tr><td><code>showDependencies</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Render finish→start arrows.</td></tr>
				<tr><td><code>showProgress</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Overlay percent-complete shading.</td></tr>
				<tr><td><code>dateFormat</code></td><td><code>'short' | 'long' | (d) => string</code></td><td><code>'short'</code></td><td>Header/label date format.</td></tr>
				<tr><td><code>onTaskClick</code></td><td><code>(task) => void</code></td><td>—</td><td>Receives the clicked task.</td></tr>
				<tr><td><code>ariaLabel</code></td><td><code>string</code></td><td><code>'Gantt chart'</code></td><td>Wrapper aria-label.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.g-demo {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	.g-status {
		display: flex;
		justify-content: flex-start;
		margin-bottom: 0.5rem;
	}
	.g-section header {
		margin-bottom: 0.75rem;
	}
	.g-section h4 {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.g-section p {
		margin: 0.25rem 0 0;
		font-size: 0.875rem;
		color: var(--cp-muted, #64748b);
	}
	.g-stage {
		container-type: inline-size;
	}
	.g-state {
		margin-top: 0.75rem;
		font-size: 0.875rem;
		color: var(--cp-muted, #64748b);
	}
	.g-state code {
		background: color-mix(in srgb, currentColor 8%, transparent);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.8125rem;
	}
	.g-controls {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 1.25rem;
		padding: 0.75rem 1rem;
		margin-bottom: 0.75rem;
		border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
		border-radius: 0.5rem;
		background: color-mix(in srgb, currentColor 4%, transparent);
		font-size: 0.875rem;
	}
	.g-controls label {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}
	.g-controls output {
		font-variant-numeric: tabular-nums;
		min-width: 3.5rem;
	}
	.cp-api-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}
	.cp-api-table th,
	.cp-api-table td {
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
		text-align: left;
		vertical-align: top;
	}
	.cp-api-table th {
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 0.75rem;
	}
	.cp-api-table code {
		font-size: 0.8125rem;
	}
</style>
