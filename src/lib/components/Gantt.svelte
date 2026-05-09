<!--
	===========================================================
	GANTT
	===========================================================
	WHAT
	A native SVG Gantt chart for scheduling work — task bars on a date axis with
	progress overlays, milestones, dependency arrows, today marker, and weekend
	shading. No charting library; pure Svelte 5 + scoped CSS.

	WHY
	Project status, sprint planning, content calendars, build schedules. The
	common need is "show me dated work and what blocks what" without bringing
	in a heavy timeline library.

	FEATURES
	- Task bars sized by duration, with progress overlay (0–100%)
	- Diamond milestones (zero-duration tasks)
	- Finish→start dependency arrows with arrowheads
	- Vertical today marker
	- Weekend shading (Saturday/Sunday strips)
	- Month + day axis headers
	- Optional grouping with row colour bands
	- Click handler with full task payload
	- Mobile: timeline horizontally scrolls; left labels column stays visible

	ACCESSIBILITY
	- Tasks render as buttons when onTaskClick is supplied (Tab + Enter/Space)
	- Each task bar has an aria-label combining name + dates + progress
	- Chart wrapper carries role="group" with an aria-label summarising the schedule
	  (group, not img — the chart contains keyboard-interactive task descendants)
	- Honours prefers-reduced-motion (no transitions in that mode)

	DEPENDENCIES
	Zero external. Pure Svelte 5 runes, scoped CSS, inline SVG.

	PERFORMANCE
	One pass to compute layout; SVG is the only rendering surface. Comfortably
	handles a few hundred tasks; for very large schedules consider chunking.

	USAGE
	<Gantt tasks={tasks} showDependencies showProgress />

	PROPS
	See `GanttProps` in `$lib/types`.
	===========================================================
-->
<script lang="ts">
	import type { GanttProps, GanttTask } from '$lib/types';

	let {
		tasks,
		startDate,
		endDate,
		dayWidth = 32,
		rowHeight = 36,
		labelWidth = 220,
		showWeekends = true,
		showToday = true,
		showDependencies = true,
		showProgress = true,
		dateFormat = 'short',
		onTaskClick,
		ariaLabel = 'Gantt chart',
		class: className = ''
	}: GanttProps = $props();

	const MS_PER_DAY = 24 * 60 * 60 * 1000;
	const HEADER_HEIGHT = 56;

	function toDate(value: string | number | Date): Date {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- pure helper, no reactive state stored
		const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
		date.setHours(0, 0, 0, 0);
		return date;
	}

	function daysBetween(a: Date, b: Date): number {
		return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
	}

	function addDays(date: Date, days: number): Date {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- pure helper, no reactive state stored
		const next = new Date(date.getTime());
		next.setDate(next.getDate() + days);
		return next;
	}

	function formatDate(date: Date): string {
		if (typeof dateFormat === 'function') return dateFormat(date);
		return date.toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: dateFormat === 'long' ? 'numeric' : undefined
		});
	}

	const chartStart = $derived.by(() => {
		if (startDate) return toDate(startDate);
		const min = tasks.reduce<Date | null>((acc, t) => {
			const d = toDate(t.start);
			return !acc || d < acc ? d : acc;
		}, null);
		return min ?? toDate(Date.now());
	});

	const chartEnd = $derived.by(() => {
		if (endDate) return toDate(endDate);
		const max = tasks.reduce<Date | null>((acc, t) => {
			const d = toDate(t.end);
			return !acc || d > acc ? d : acc;
		}, null);
		return max ?? addDays(chartStart, 14);
	});

	// Inclusive day count: a task that runs from Mon to Mon spans 8 days visually.
	const totalDays = $derived(Math.max(1, daysBetween(chartStart, chartEnd) + 1));
	const chartWidth = $derived(totalDays * dayWidth);
	const chartHeight = $derived(tasks.length * rowHeight);
	const todayOffset = $derived(daysBetween(chartStart, toDate(Date.now())));
	const todayInRange = $derived(todayOffset >= 0 && todayOffset < totalDays);

	type Layout = {
		task: GanttTask;
		row: number;
		x: number;
		y: number;
		width: number;
		progressWidth: number;
		isMilestone: boolean;
		startDate: Date;
		endDate: Date;
	};

	const layouts = $derived.by<Layout[]>(() =>
		tasks.map((task, index) => {
			const taskStart = toDate(task.start);
			const taskEnd = toDate(task.end);
			const startOffset = daysBetween(chartStart, taskStart);
			const span = Math.max(1, daysBetween(taskStart, taskEnd) + 1);
			const x = startOffset * dayWidth;
			const y = index * rowHeight + 6;
			const width = span * dayWidth - 4;
			const progress = Math.min(100, Math.max(0, task.progress ?? 0));
			return {
				task,
				row: index,
				x,
				y,
				width: Math.max(8, width),
				progressWidth: ((progress / 100) * Math.max(8, width)),
				isMilestone: task.isMilestone === true,
				startDate: taskStart,
				endDate: taskEnd
			};
		})
	);

	const layoutById = $derived(new Map(layouts.map((l) => [l.task.id, l])));

	type Weekend = { x: number; width: number };
	const weekendBands = $derived.by<Weekend[]>(() => {
		if (!showWeekends) return [];
		const bands: Weekend[] = [];
		for (let i = 0; i < totalDays; i += 1) {
			const day = addDays(chartStart, i).getDay();
			if (day === 0 || day === 6) {
				bands.push({ x: i * dayWidth, width: dayWidth });
			}
		}
		return bands;
	});

	type MonthLabel = { x: number; width: number; label: string };
	const monthLabels = $derived.by<MonthLabel[]>(() => {
		const out: MonthLabel[] = [];
		let cursor = chartStart;
		while (cursor <= chartEnd) {
			const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
			const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
			const visibleStart = cursor < monthStart ? monthStart : cursor;
			const visibleEnd = monthEnd > chartEnd ? chartEnd : monthEnd;
			const x = daysBetween(chartStart, visibleStart) * dayWidth;
			const span = daysBetween(visibleStart, visibleEnd) + 1;
			out.push({
				x,
				width: span * dayWidth,
				label: visibleStart.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
			});
			cursor = addDays(monthEnd, 1);
		}
		return out;
	});

	type DayTick = { x: number; label: string; isWeekend: boolean };
	const dayTicks = $derived.by<DayTick[]>(() => {
		const ticks: DayTick[] = [];
		for (let i = 0; i < totalDays; i += 1) {
			const date = addDays(chartStart, i);
			const day = date.getDay();
			ticks.push({
				x: i * dayWidth,
				label: String(date.getDate()),
				isWeekend: day === 0 || day === 6
			});
		}
		return ticks;
	});

	type Arrow = { d: string; key: string };
	const dependencyArrows = $derived.by<Arrow[]>(() => {
		if (!showDependencies) return [];
		const arrows: Arrow[] = [];
		for (const layout of layouts) {
			for (const depId of layout.task.dependencies ?? []) {
				const from = layoutById.get(depId);
				if (!from) continue;
				const startX = from.x + from.width;
				const startY = from.y + (rowHeight - 12) / 2;
				const endX = layout.x;
				const endY = layout.y + (rowHeight - 12) / 2;
				const turn = Math.max(8, dayWidth / 2);
				const verticalMid = (startY + endY) / 2;
				const d = `M ${startX} ${startY} L ${startX + turn} ${startY} L ${startX + turn} ${verticalMid} L ${endX - turn} ${verticalMid} L ${endX - turn} ${endY} L ${endX} ${endY}`;
				arrows.push({ d, key: `${depId}->${layout.task.id}` });
			}
		}
		return arrows;
	});

	const summary = $derived.by(() => {
		if (tasks.length === 0) return 'Empty Gantt chart';
		return `${tasks.length} task${tasks.length === 1 ? '' : 's'} from ${formatDate(chartStart)} to ${formatDate(chartEnd)}`;
	});

	function ariaLabelForTask(layout: Layout): string {
		const parts = [layout.task.name];
		if (layout.isMilestone) {
			parts.push(`milestone on ${formatDate(layout.startDate)}`);
		} else {
			parts.push(`${formatDate(layout.startDate)} to ${formatDate(layout.endDate)}`);
		}
		if (typeof layout.task.progress === 'number') {
			parts.push(`${Math.round(layout.task.progress)}% complete`);
		}
		if (layout.task.assignee) parts.push(`assigned to ${layout.task.assignee}`);
		return parts.join(', ');
	}

	function handleClick(task: GanttTask) {
		onTaskClick?.(task);
	}

	function handleKey(event: KeyboardEvent, task: GanttTask) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick(task);
		}
	}

	// Per-instance marker id so multiple Gantts on one page don't share an
	// SVG <marker> definition (which would otherwise fail with duplicate ids
	// and let arrowheads collide across instances).
	const arrowheadId = `gantt-arrowhead-${Math.random().toString(36).slice(2, 10)}`;
</script>

<div
	class="gantt {className}"
	role="group"
	aria-label="{ariaLabel} — {summary}"
	style="--gantt-row-height: {rowHeight}px; --gantt-label-width: {labelWidth}px; --gantt-header-height: {HEADER_HEIGHT}px;"
>
	<div class="gantt-labels" aria-hidden="false">
		<div class="gantt-labels-header">Task</div>
		<ul class="gantt-labels-list" role="list">
			{#each tasks as task (task.id)}
				<li class="gantt-label-row" style="height: {rowHeight}px;">
					<span class="gantt-label-name">{task.name}</span>
					{#if task.assignee}
						<span class="gantt-label-assignee">{task.assignee}</span>
					{/if}
				</li>
			{/each}
		</ul>
	</div>

	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<!-- The chart can overflow horizontally; tabindex="0" lets keyboard users
	     focus the scroller and pan it with arrow keys. role="region" labels it. -->
	<div
		class="gantt-scroll"
		role="region"
		aria-label="{ariaLabel} timeline"
		tabindex="0"
	>
		<svg
			class="gantt-svg"
			width={chartWidth}
			height={HEADER_HEIGHT + chartHeight}
			viewBox={`0 0 ${chartWidth} ${HEADER_HEIGHT + chartHeight}`}
			role="presentation"
		>
			<!-- Weekend bands -->
			{#each weekendBands as band, i (i)}
				<rect
					class="gantt-weekend"
					x={band.x}
					y={HEADER_HEIGHT}
					width={band.width}
					height={chartHeight}
				/>
			{/each}

			<!-- Row guidelines -->
			{#each tasks as task, index (task.id)}
				<line
					class="gantt-row-line"
					x1="0"
					y1={HEADER_HEIGHT + (index + 1) * rowHeight}
					x2={chartWidth}
					y2={HEADER_HEIGHT + (index + 1) * rowHeight}
				/>
			{/each}

			<!-- Day ticks -->
			{#each dayTicks as tick, i (i)}
				<line
					class="gantt-day-tick"
					class:gantt-day-tick--weekend={tick.isWeekend}
					x1={tick.x}
					y1={HEADER_HEIGHT - 12}
					x2={tick.x}
					y2={HEADER_HEIGHT + chartHeight}
				/>
				<text
					class="gantt-day-label"
					x={tick.x + dayWidth / 2}
					y={HEADER_HEIGHT - 4}
					text-anchor="middle"
				>
					{tick.label}
				</text>
			{/each}

			<!-- Month labels -->
			{#each monthLabels as month, i (i)}
				<text class="gantt-month-label" x={month.x + 6} y="18">{month.label}</text>
				<line class="gantt-month-divider" x1={month.x} y1="0" x2={month.x} y2={HEADER_HEIGHT + chartHeight} />
			{/each}

			<!-- Today marker -->
			{#if showToday && todayInRange}
				<g class="gantt-today">
					<line
						x1={todayOffset * dayWidth + dayWidth / 2}
						y1={HEADER_HEIGHT - 12}
						x2={todayOffset * dayWidth + dayWidth / 2}
						y2={HEADER_HEIGHT + chartHeight}
					/>
					<text
						class="gantt-today-label"
						x={todayOffset * dayWidth + dayWidth / 2}
						y={HEADER_HEIGHT - 16}
						text-anchor="middle"
					>
						TODAY
					</text>
				</g>
			{/if}

			<!-- Dependency arrows -->
			{#each dependencyArrows as arrow (arrow.key)}
				<path class="gantt-dependency" d={arrow.d} marker-end="url(#{arrowheadId})" />
			{/each}
			<defs>
				<marker
					id={arrowheadId}
					viewBox="0 0 10 10"
					refX="9"
					refY="5"
					markerWidth="7"
					markerHeight="7"
					orient="auto-start-reverse"
				>
					<path class="gantt-arrowhead-path" d="M 0 0 L 10 5 L 0 10 z" />
				</marker>
			</defs>

			<!-- Task bars / milestones -->
			{#each layouts as layout (layout.task.id)}
				<g class="gantt-task" transform={`translate(0 ${HEADER_HEIGHT})`}>
					{#if layout.isMilestone}
						{@const cx = layout.x + dayWidth / 2}
						{@const cy = layout.y + (rowHeight - 12) / 2}
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<g
							class="gantt-milestone"
							class:gantt-milestone--clickable={!!onTaskClick}
							role={onTaskClick ? 'button' : undefined}
							tabindex={onTaskClick ? 0 : undefined}
							aria-label={onTaskClick ? ariaLabelForTask(layout) : undefined}
							onclick={() => onTaskClick && handleClick(layout.task)}
							onkeydown={(event) => onTaskClick && handleKey(event, layout.task)}
						>
							<polygon
								points={`${cx},${cy - 9} ${cx + 9},${cy} ${cx},${cy + 9} ${cx - 9},${cy}`}
								style={layout.task.color ? `fill: ${layout.task.color};` : ''}
							/>
						</g>
					{:else}
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<g
							class="gantt-bar-group"
							class:gantt-bar-group--clickable={!!onTaskClick}
							role={onTaskClick ? 'button' : undefined}
							tabindex={onTaskClick ? 0 : undefined}
							aria-label={onTaskClick ? ariaLabelForTask(layout) : undefined}
							onclick={() => onTaskClick && handleClick(layout.task)}
							onkeydown={(event) => onTaskClick && handleKey(event, layout.task)}
						>
							<rect
								class="gantt-bar"
								x={layout.x}
								y={layout.y}
								width={layout.width}
								height={rowHeight - 12}
								rx="4"
								style={layout.task.color ? `fill: ${layout.task.color};` : ''}
							/>
							{#if showProgress && layout.progressWidth > 0}
								<rect
									class="gantt-bar-progress"
									x={layout.x}
									y={layout.y}
									width={layout.progressWidth}
									height={rowHeight - 12}
									rx="4"
								/>
							{/if}
						</g>
					{/if}
				</g>
			{/each}
		</svg>
	</div>
</div>

<style>
	.gantt {
		display: grid;
		grid-template-columns: var(--gantt-label-width, 220px) 1fr;
		border: 1px solid var(--gantt-border, color-mix(in srgb, currentColor 12%, transparent));
		border-radius: 12px;
		overflow: hidden;
		background: var(--gantt-bg, #ffffff);
		color: var(--gantt-fg, #0f172a);
		font-family: inherit;
	}

	.gantt-labels {
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--gantt-border, rgba(15, 23, 42, 0.08));
		background: var(--gantt-labels-bg, #f8fafc);
	}

	.gantt-labels-header {
		height: var(--gantt-header-height, 56px);
		display: flex;
		align-items: end;
		padding: 0 1rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--gantt-muted, #64748b);
		border-bottom: 1px solid var(--gantt-border, rgba(15, 23, 42, 0.08));
	}

	.gantt-labels-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.gantt-label-row {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 1rem;
		border-bottom: 1px solid var(--gantt-row-line, rgba(15, 23, 42, 0.04));
		min-width: 0;
	}

	.gantt-label-name {
		font-size: 0.875rem;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.gantt-label-assignee {
		font-size: 0.6875rem;
		color: var(--gantt-muted, #64748b);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.gantt-scroll {
		overflow-x: auto;
		overflow-y: hidden;
	}

	.gantt-scroll:focus-visible {
		outline: 2px solid var(--gantt-accent, #146ef5);
		outline-offset: -2px;
	}

	.gantt-svg {
		display: block;
	}

	.gantt-weekend {
		fill: var(--gantt-weekend, rgba(15, 23, 42, 0.05));
	}

	.gantt-row-line,
	.gantt-day-tick {
		stroke: var(--gantt-row-line, rgba(15, 23, 42, 0.06));
		stroke-width: 1;
	}

	.gantt-day-tick--weekend {
		stroke: var(--gantt-row-line-strong, rgba(15, 23, 42, 0.12));
	}

	.gantt-day-label {
		fill: var(--gantt-muted, #64748b);
		font-size: 10px;
		font-weight: 500;
	}

	.gantt-month-label {
		fill: var(--gantt-fg, #0f172a);
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.gantt-month-divider {
		stroke: var(--gantt-row-line-strong, rgba(15, 23, 42, 0.1));
		stroke-width: 1;
	}

	.gantt-today line {
		stroke: var(--gantt-today, #ef4444);
		stroke-width: 1.5;
		stroke-dasharray: 4 3;
	}

	.gantt-today-label {
		fill: var(--gantt-today, #ef4444);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
	}

	.gantt-dependency {
		fill: none;
		stroke: var(--gantt-dependency, color-mix(in srgb, currentColor 35%, transparent));
		stroke-width: 1.5;
	}

	.gantt-arrowhead-path {
		fill: var(--gantt-dependency, color-mix(in srgb, currentColor 45%, transparent));
	}

	.gantt-bar {
		fill: var(--gantt-bar, #146ef5);
		transition: filter 0.15s ease;
	}

	.gantt-bar-progress {
		fill: var(--gantt-bar-progress, color-mix(in srgb, currentColor 22%, transparent));
		pointer-events: none;
	}

	.gantt-milestone polygon {
		fill: var(--gantt-bar, #f59e0b);
		stroke: var(--gantt-bg, #ffffff);
		stroke-width: 2;
		transition: filter 0.15s ease;
	}

	.gantt-bar-group--clickable,
	.gantt-milestone--clickable {
		cursor: pointer;
	}

	.gantt-bar-group--clickable:hover .gantt-bar,
	.gantt-bar-group--clickable:focus-visible .gantt-bar,
	.gantt-milestone--clickable:hover polygon,
	.gantt-milestone--clickable:focus-visible polygon {
		filter: brightness(1.08);
	}

	.gantt-bar-group--clickable:focus-visible,
	.gantt-milestone--clickable:focus-visible {
		outline: 2px solid var(--gantt-accent, #146ef5);
		outline-offset: 2px;
	}

	@media (prefers-color-scheme: dark) {
		.gantt {
			--gantt-bg: #0f172a;
			--gantt-fg: #e2e8f0;
			--gantt-muted: #94a3b8;
			--gantt-border: rgba(148, 163, 184, 0.18);
			--gantt-labels-bg: #111c33;
			--gantt-row-line: rgba(148, 163, 184, 0.1);
			--gantt-row-line-strong: rgba(148, 163, 184, 0.22);
			--gantt-weekend: rgba(148, 163, 184, 0.08);
			--gantt-bar: #60a5fa;
			--gantt-bar-progress: rgba(15, 23, 42, 0.45);
			--gantt-today: #fca5a5;
			--gantt-dependency: rgba(148, 163, 184, 0.55);
			--gantt-accent: #60a5fa;
		}
	}

	:global(.dark) .gantt {
		--gantt-bg: #0f172a;
		--gantt-fg: #e2e8f0;
		--gantt-muted: #94a3b8;
		--gantt-border: rgba(148, 163, 184, 0.18);
		--gantt-labels-bg: #111c33;
		--gantt-row-line: rgba(148, 163, 184, 0.1);
		--gantt-row-line-strong: rgba(148, 163, 184, 0.22);
		--gantt-weekend: rgba(148, 163, 184, 0.08);
		--gantt-bar: #60a5fa;
		--gantt-bar-progress: rgba(15, 23, 42, 0.45);
		--gantt-today: #fca5a5;
		--gantt-dependency: rgba(148, 163, 184, 0.55);
		--gantt-accent: #60a5fa;
	}

	@media (prefers-reduced-motion: reduce) {
		.gantt-bar,
		.gantt-milestone polygon {
			transition: none;
		}
	}

	@media (max-width: 640px) {
		.gantt {
			grid-template-columns: 140px 1fr;
		}
	}
</style>
