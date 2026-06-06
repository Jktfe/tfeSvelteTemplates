<script lang="ts" module>
	export type LaneState = 'active' | 'review' | 'blocked' | 'done';

	export interface AgentLane {
		id: string;
		title: string;
		owner: string;
		status: LaneState;
		gate: string;
		eta?: string;
		files?: string[];
		evidence?: string[];
	}

	export function laneStateLabel(status: LaneState): string {
		const labels: Record<LaneState, string> = {
			active: 'Active',
			review: 'Review',
			blocked: 'Blocked',
			done: 'Done'
		};
		return labels[status];
	}

	export function laneStateTone(status: LaneState): 'progress' | 'warn' | 'bad' | 'good' {
		if (status === 'active') return 'progress';
		if (status === 'review') return 'warn';
		if (status === 'blocked') return 'bad';
		return 'good';
	}

	export function countLanesByState(lanes: AgentLane[]): Record<LaneState, number> {
		return lanes.reduce(
			(counts, lane) => {
				counts[lane.status] += 1;
				return counts;
			},
			{ active: 0, review: 0, blocked: 0, done: 0 } satisfies Record<LaneState, number>
		);
	}

	export function completionPercent(lanes: AgentLane[]): number {
		if (lanes.length === 0) return 0;
		return Math.round((countLanesByState(lanes).done / lanes.length) * 100);
	}

	export function nextActionLane(lanes: AgentLane[]): AgentLane | undefined {
		return (
			lanes.find((lane) => lane.status === 'blocked') ??
			lanes.find((lane) => lane.status === 'review') ??
			lanes.find((lane) => lane.status === 'active') ??
			lanes.find((lane) => lane.status === 'done')
		);
	}
</script>

<script lang="ts">
	interface Props {
		lanes: AgentLane[];
		title?: string;
		subtitle?: string;
		class?: string;
	}

	let {
		lanes,
		title = 'Agent lane board',
		subtitle = 'Delivery ownership, gates, and blockers in one room-visible board.',
		class: extraClass = ''
	}: Props = $props();

	let statusFilter = $state<LaneState | 'all'>('all');

	const counts = $derived(countLanesByState(lanes));
	const percent = $derived(completionPercent(lanes));
	const nextLane = $derived(nextActionLane(lanes));
	const visibleLanes = $derived(
		statusFilter === 'all' ? lanes : lanes.filter((lane) => lane.status === statusFilter)
	);
</script>

<section class="lane-board {extraClass}" aria-labelledby="lane-board-title">
	<header class="lb-head">
		<div>
			<p class="lb-kicker">Delivery board</p>
			<h2 id="lane-board-title">{title}</h2>
			<p>{subtitle}</p>
		</div>
		<div class="lb-score" aria-label={`${percent}% complete`}>
			<strong>{percent}%</strong>
			<span>complete</span>
		</div>
	</header>

	<div class="lb-summary" aria-label="Lane summary">
		{#each (['active', 'review', 'blocked', 'done'] as LaneState[]) as state (state)}
			<button
				type="button"
				class:active={statusFilter === state}
				onclick={() => (statusFilter = statusFilter === state ? 'all' : state)}
			>
				<span>{laneStateLabel(state)}</span>
				<b>{counts[state]}</b>
			</button>
		{/each}
	</div>

	{#if nextLane}
		<aside class="lb-next">
			<span>Next attention</span>
			<b>{nextLane.title}</b>
			<em>{nextLane.owner} · {laneStateLabel(nextLane.status)}</em>
		</aside>
	{/if}

	<div class="lb-grid">
		{#each visibleLanes as lane (lane.id)}
			<article class="lb-card lb-card--{laneStateTone(lane.status)}">
				<header>
					<div>
						<p>{lane.owner}</p>
						<h3>{lane.title}</h3>
					</div>
					<span>{laneStateLabel(lane.status)}</span>
				</header>

				<dl>
					<div>
						<dt>Acceptance gate</dt>
						<dd>{lane.gate}</dd>
					</div>
					{#if lane.eta}
						<div>
							<dt>ETA</dt>
							<dd>{lane.eta}</dd>
						</div>
					{/if}
				</dl>

				{#if lane.files?.length}
					<ul class="lb-files" aria-label={`${lane.title} files`}>
						{#each lane.files as file (file)}
							<li><code>{file}</code></li>
						{/each}
					</ul>
				{/if}

				{#if lane.evidence?.length}
					<ul class="lb-evidence" aria-label={`${lane.title} evidence`}>
						{#each lane.evidence as item (item)}
							<li>{item}</li>
						{/each}
					</ul>
				{/if}
			</article>
		{/each}
	</div>
</section>

<style>
	.lane-board {
		display: grid;
		gap: 18px;
		color: var(--fg-1, #111827);
	}

	.lb-head {
		display: flex;
		justify-content: space-between;
		gap: 18px;
		align-items: end;
		padding: 20px;
		border: 1px solid var(--border, #d9dde5);
		border-radius: 6px;
		background: linear-gradient(135deg, #f8fafc, #ecfdf5);
	}

	.lb-kicker {
		margin: 0 0 6px;
		color: #047857;
		font: 900 11px/1 var(--font-mono, ui-monospace, monospace);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.lb-head h2 {
		margin: 0;
		font: 900 clamp(1.6rem, 3vw, 2.6rem) / 1 var(--font-display, Georgia, serif);
	}

	.lb-head p:not(.lb-kicker) {
		max-width: 64ch;
		margin: 8px 0 0;
		color: var(--fg-2, #4b5563);
	}

	.lb-score {
		display: grid;
		min-width: 112px;
		place-items: center;
		padding: 16px;
		border: 1px solid #86efac;
		border-radius: 6px;
		background: #dcfce7;
		color: #14532d;
	}

	.lb-score strong {
		font: 900 2rem/1 var(--font-display, Georgia, serif);
	}

	.lb-score span {
		font: 800 11px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.lb-summary {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 8px;
	}

	.lb-summary button {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 12px;
		border: 1px solid var(--border, #d9dde5);
		border-radius: 6px;
		background: var(--surface, #fff);
		color: inherit;
		cursor: pointer;
	}

	.lb-summary button.active {
		border-color: #0f766e;
		box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.14);
	}

	.lb-summary span {
		font: 800 11px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.lb-summary b {
		font-size: 1.1rem;
	}

	.lb-next {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 14px;
		align-items: baseline;
		padding: 12px 14px;
		border-left: 4px solid #f59e0b;
		background: #fffbeb;
		color: #78350f;
	}

	.lb-next span,
	.lb-next em {
		font: 800 11px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.lb-next em {
		font-style: normal;
		opacity: 0.78;
	}

	.lb-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 14px;
	}

	.lb-card {
		display: grid;
		gap: 14px;
		padding: 16px;
		border: 1px solid var(--lane-border, #d9dde5);
		border-top-width: 4px;
		border-radius: 6px;
		background: var(--surface, #fff);
	}

	.lb-card--progress { --lane-accent: #2563eb; --lane-bg: #dbeafe; --lane-border: #93c5fd; }
	.lb-card--warn { --lane-accent: #92400e; --lane-bg: #fef3c7; --lane-border: #fcd34d; }
	.lb-card--bad { --lane-accent: #b91c1c; --lane-bg: #fee2e2; --lane-border: #fca5a5; }
	.lb-card--good { --lane-accent: #15803d; --lane-bg: #dcfce7; --lane-border: #86efac; }

	.lb-card header {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		align-items: start;
	}

	.lb-card header p {
		margin: 0 0 5px;
		color: var(--lane-accent);
		font: 900 11px/1 var(--font-mono, ui-monospace, monospace);
	}

	.lb-card h3 {
		margin: 0;
		font: 850 1.2rem/1.1 var(--font-display, Georgia, serif);
	}

	.lb-card header span {
		flex: 0 0 auto;
		padding: 5px 8px;
		border-radius: 4px;
		background: var(--lane-bg);
		color: var(--lane-accent);
		font: 900 10px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.lb-card dl {
		display: grid;
		gap: 8px;
		margin: 0;
	}

	.lb-card dt {
		margin-bottom: 4px;
		color: var(--fg-3, #6b7280);
		font: 800 10px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.lb-card dd {
		margin: 0;
		color: var(--fg-2, #4b5563);
		font-weight: 700;
	}

	.lb-files,
	.lb-evidence {
		display: grid;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.lb-files code {
		display: block;
		padding: 7px 8px;
		background: var(--surface-2, #f8fafc);
		border: 1px solid var(--border, #d9dde5);
		font-size: 12px;
		overflow-wrap: anywhere;
	}

	.lb-evidence li {
		padding-left: 10px;
		border-left: 2px solid var(--lane-border);
		color: var(--fg-2, #4b5563);
	}

	@media (max-width: 760px) {
		.lb-head,
		.lb-card header {
			display: grid;
		}

		.lb-summary {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
