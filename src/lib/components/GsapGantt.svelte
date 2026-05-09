<!--
	===========================================================
	GSAP GANTT
	===========================================================
	WHAT
	A GSAP-driven sibling of the native Gantt component. Same
	GanttTask[] prop interface — drop-in compatible — but the
	entrance animation is staged by `gsap.timeline()`: bars draw
	from left to right with a stagger, dependency arrows fade in
	once the bars they connect have landed, milestones pop with a
	`back.out` overshoot.

	WHY
	When the design system already speaks GSAP, picking the GSAP
	variant keeps the easing curves consistent with the rest of the
	suite. Use the native Gantt when zero external deps matter; use
	this one when you'd benefit from gsap.timeline composition.

	FEATURES
	- Same `GanttTask[]` data shape as the native Gantt (drop-in)
	- Bars enter via `gsap.fromTo` `scaleX 0 → 1` from the left edge
	- Milestones pop with `back.out(1.7)` overshoot
	- Dependency arrows fade in after their endpoints have animated
	- Today line + weekend bands paint statically (no entrance) — the
	  context shouldn't fight the timeline
	- Honours prefers-reduced-motion (paints assembled state)

	ACCESSIBILITY
	- Same role / aria contract as the native Gantt:
	  wrapper role="group" with aria-label summary,
	  scroll region role="region" + aria-label,
	  task bars buttonised when onTaskClick is supplied

	DEPENDENCIES
	`gsap` core (already a project dep). No business plugins.

	USAGE
	<GsapGantt tasks={schedule} />

	PROPS
	See `GsapGanttProps` in `$lib/types`.
	===========================================================
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { loadGsap, type Gsap } from '$lib/gsapMotion';
	import type { GsapGanttProps, GanttTask } from '$lib/types';

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
		ariaLabel = 'GSAP Gantt chart',
		class: className = ''
	}: GsapGanttProps = $props();

	const MS_PER_DAY = 24 * 60 * 60 * 1000;
	const HEADER_HEIGHT = 56;

	let rootEl: HTMLElement | undefined = $state();
	let gsapInstance: Gsap | null = null;
	let prefersReduced = $state(false);
	let played = false;

	function toDate(value: string | number | Date): Date {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
		date.setHours(0, 0, 0, 0);
		return date;
	}
	function daysBetween(a: Date, b: Date): number {
		return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
	}
	function addDays(date: Date, days: number): Date {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
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
			if (day === 0 || day === 6) bands.push({ x: i * dayWidth, width: dayWidth });
		}
		return bands;
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
		if (layout.isMilestone) parts.push(`milestone on ${formatDate(layout.startDate)}`);
		else parts.push(`${formatDate(layout.startDate)} to ${formatDate(layout.endDate)}`);
		if (typeof layout.task.progress === 'number') parts.push(`${Math.round(layout.task.progress)}% complete`);
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

	const arrowheadId = `gsap-gantt-arrowhead-${Math.random().toString(36).slice(2, 10)}`;

	function play() {
		if (played || !rootEl || !gsapInstance) return;
		played = true;
		const bars = rootEl.querySelectorAll<SVGRectElement>('rect.gg-bar');
		const milestones = rootEl.querySelectorAll<SVGPolygonElement>('.gg-milestone polygon');
		const arrows = rootEl.querySelectorAll<SVGPathElement>('path.gg-dependency');
		const tl = gsapInstance.timeline();
		if (bars.length > 0) {
			tl.fromTo(
				bars,
				{ scaleX: 0, transformOrigin: 'left center' },
				{
					scaleX: 1,
					duration: 0.55,
					ease: 'power3.out',
					stagger: { each: 0.06 }
				},
				0
			);
		}
		if (milestones.length > 0) {
			tl.fromTo(
				milestones,
				{ scale: 0, transformOrigin: 'center center' },
				{
					scale: 1,
					duration: 0.45,
					ease: 'back.out(1.7)',
					stagger: { each: 0.08 }
				},
				0.15
			);
		}
		if (arrows.length > 0) {
			tl.fromTo(
				arrows,
				{ opacity: 0 },
				{ opacity: 1, duration: 0.4, ease: 'power2.out', stagger: { each: 0.04 } },
				0.45
			);
		}
	}

	onMount(() => {
		prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		// Hoist the observer out of the async IIFE so the onMount cleanup
		// return below actually disconnects on unmount.
		let observer: IntersectionObserver | null = null;
		(async () => {
			gsapInstance = await loadGsap();
			if (prefersReduced || !rootEl || typeof IntersectionObserver === 'undefined') {
				played = true;
				return;
			}
			observer = new IntersectionObserver(
				(entries) => {
					if (entries[0]?.isIntersecting) {
						play();
						observer?.disconnect();
					}
				},
				{ threshold: 0.15 }
			);
			observer.observe(rootEl);
		})();
		return () => {
			observer?.disconnect();
		};
	});
</script>

<div
	bind:this={rootEl}
	class="gsap-gantt {className}"
	class:gsap-gantt--reduced={prefersReduced}
	role="group"
	aria-label="{ariaLabel} — {summary}"
	style="--gg-row-height: {rowHeight}px; --gg-label-width: {labelWidth}px; --gg-header-height: {HEADER_HEIGHT}px;"
>
	<div class="gg-labels">
		<div class="gg-labels-header">Task</div>
		<ul class="gg-labels-list" role="list">
			{#each tasks as task (task.id)}
				<li class="gg-label-row" style="height: {rowHeight}px;">
					<span class="gg-label-name">{task.name}</span>
					{#if task.assignee}<span class="gg-label-assignee">{task.assignee}</span>{/if}
				</li>
			{/each}
		</ul>
	</div>

	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="gg-scroll"
		role="region"
		aria-label="{ariaLabel} timeline"
		tabindex="0"
	>
		<svg
			class="gg-svg"
			width={chartWidth}
			height={HEADER_HEIGHT + chartHeight}
			viewBox={`0 0 ${chartWidth} ${HEADER_HEIGHT + chartHeight}`}
			role="presentation"
		>
			{#each weekendBands as band, i (i)}
				<rect class="gg-weekend" x={band.x} y={HEADER_HEIGHT} width={band.width} height={chartHeight} />
			{/each}

			{#each tasks as task, index (task.id)}
				<line
					class="gg-row-line"
					x1="0"
					y1={HEADER_HEIGHT + (index + 1) * rowHeight}
					x2={chartWidth}
					y2={HEADER_HEIGHT + (index + 1) * rowHeight}
				/>
			{/each}

			{#if showToday && todayInRange}
				<g class="gg-today">
					<line
						x1={todayOffset * dayWidth + dayWidth / 2}
						y1={HEADER_HEIGHT - 12}
						x2={todayOffset * dayWidth + dayWidth / 2}
						y2={HEADER_HEIGHT + chartHeight}
					/>
					<text
						class="gg-today-label"
						x={todayOffset * dayWidth + dayWidth / 2}
						y={HEADER_HEIGHT - 16}
						text-anchor="middle"
					>TODAY</text>
				</g>
			{/if}

			{#each dependencyArrows as arrow (arrow.key)}
				<path class="gg-dependency" d={arrow.d} marker-end="url(#{arrowheadId})" />
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
					<path class="gg-arrowhead-path" d="M 0 0 L 10 5 L 0 10 z" />
				</marker>
			</defs>

			{#each layouts as layout (layout.task.id)}
				<g class="gg-task" transform={`translate(0 ${HEADER_HEIGHT})`}>
					{#if layout.isMilestone}
						{@const cx = layout.x + dayWidth / 2}
						{@const cy = layout.y + (rowHeight - 12) / 2}
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<g
							class="gg-milestone"
							class:gg-milestone--clickable={!!onTaskClick}
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
							class="gg-bar-group"
							class:gg-bar-group--clickable={!!onTaskClick}
							role={onTaskClick ? 'button' : undefined}
							tabindex={onTaskClick ? 0 : undefined}
							aria-label={onTaskClick ? ariaLabelForTask(layout) : undefined}
							onclick={() => onTaskClick && handleClick(layout.task)}
							onkeydown={(event) => onTaskClick && handleKey(event, layout.task)}
						>
							<rect
								class="gg-bar"
								x={layout.x}
								y={layout.y}
								width={layout.width}
								height={rowHeight - 12}
								rx="4"
								style={layout.task.color ? `fill: ${layout.task.color};` : ''}
							/>
							{#if showProgress && layout.progressWidth > 0}
								<rect
									class="gg-bar-progress"
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
	.gsap-gantt {
		display: grid;
		grid-template-columns: var(--gg-label-width, 220px) 1fr;
		border: 1px solid var(--gg-border, color-mix(in srgb, currentColor 12%, transparent));
		border-radius: 12px;
		overflow: hidden;
		background: var(--gg-bg, #ffffff);
		color: var(--gg-fg, #0f172a);
	}

	.gg-labels {
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--gg-border, rgba(15, 23, 42, 0.08));
		background: var(--gg-labels-bg, #f8fafc);
	}

	.gg-labels-header {
		height: var(--gg-header-height, 56px);
		display: flex;
		align-items: end;
		padding: 0 1rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--gg-muted, #64748b);
		border-bottom: 1px solid var(--gg-border, rgba(15, 23, 42, 0.08));
	}

	.gg-labels-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.gg-label-row {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 1rem;
		border-bottom: 1px solid var(--gg-row-line, rgba(15, 23, 42, 0.04));
		min-width: 0;
	}

	.gg-label-name {
		font-size: 0.875rem;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.gg-label-assignee {
		font-size: 0.6875rem;
		color: var(--gg-muted, #64748b);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.gg-scroll {
		overflow-x: auto;
		overflow-y: hidden;
	}

	.gg-scroll:focus-visible {
		outline: 2px solid var(--gg-accent, #146ef5);
		outline-offset: -2px;
	}

	.gg-svg {
		display: block;
	}

	.gg-weekend {
		fill: var(--gg-weekend, rgba(15, 23, 42, 0.05));
	}

	.gg-row-line {
		stroke: var(--gg-row-line, rgba(15, 23, 42, 0.06));
		stroke-width: 1;
	}

	.gg-today line {
		stroke: var(--gg-today, #ef4444);
		stroke-width: 1.5;
		stroke-dasharray: 4 3;
	}

	.gg-today-label {
		fill: var(--gg-today, #ef4444);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
	}

	.gg-dependency {
		fill: none;
		stroke: var(--gg-dependency, color-mix(in srgb, currentColor 35%, transparent));
		stroke-width: 1.5;
	}

	.gg-arrowhead-path {
		fill: var(--gg-dependency, color-mix(in srgb, currentColor 45%, transparent));
	}

	.gg-bar {
		fill: var(--gg-bar, #146ef5);
	}

	.gg-bar-progress {
		fill: var(--gg-bar-progress, color-mix(in srgb, currentColor 22%, transparent));
		pointer-events: none;
	}

	.gg-milestone polygon {
		fill: var(--gg-bar, #f59e0b);
		stroke: var(--gg-bg, #ffffff);
		stroke-width: 2;
	}

	.gg-bar-group--clickable,
	.gg-milestone--clickable {
		cursor: pointer;
	}

	.gg-bar-group--clickable:hover .gg-bar,
	.gg-bar-group--clickable:focus-visible .gg-bar,
	.gg-milestone--clickable:hover polygon,
	.gg-milestone--clickable:focus-visible polygon {
		filter: brightness(1.08);
	}

	.gg-bar-group--clickable:focus-visible,
	.gg-milestone--clickable:focus-visible {
		outline: 2px solid var(--gg-accent, #146ef5);
		outline-offset: 2px;
	}

	@media (prefers-color-scheme: dark) {
		.gsap-gantt {
			--gg-bg: #0f172a;
			--gg-fg: #e2e8f0;
			--gg-muted: #94a3b8;
			--gg-border: rgba(148, 163, 184, 0.18);
			--gg-labels-bg: #111c33;
			--gg-row-line: rgba(148, 163, 184, 0.1);
			--gg-weekend: rgba(148, 163, 184, 0.08);
			--gg-bar: #60a5fa;
			--gg-bar-progress: rgba(15, 23, 42, 0.45);
			--gg-today: #fca5a5;
			--gg-dependency: rgba(148, 163, 184, 0.55);
			--gg-accent: #60a5fa;
		}
	}

	:global(.dark) .gsap-gantt {
		--gg-bg: #0f172a;
		--gg-fg: #e2e8f0;
		--gg-muted: #94a3b8;
		--gg-border: rgba(148, 163, 184, 0.18);
		--gg-labels-bg: #111c33;
		--gg-row-line: rgba(148, 163, 184, 0.1);
		--gg-weekend: rgba(148, 163, 184, 0.08);
		--gg-bar: #60a5fa;
		--gg-bar-progress: rgba(15, 23, 42, 0.45);
		--gg-today: #fca5a5;
		--gg-dependency: rgba(148, 163, 184, 0.55);
		--gg-accent: #60a5fa;
	}

	@media (max-width: 640px) {
		.gsap-gantt {
			grid-template-columns: 140px 1fr;
		}
	}
</style>
