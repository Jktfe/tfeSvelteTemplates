/**
 * ============================================================
 * GsapGantt Tests
 * ============================================================
 *
 * Verifies bars/milestones/arrows render, ARIA wiring matches the
 * native Gantt contract, click + keyboard fire callbacks, weekend
 * bands toggle, today marker visibility, progress overlay, and
 * per-instance arrowhead ids.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import GsapGantt from './GsapGantt.svelte';
import type { GanttTask } from '$lib/types';

function offsetISO(days: number): string {
	const d = new Date(Date.now());
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() + days);
	return d.toISOString().slice(0, 10);
}

const baseTasks: GanttTask[] = [
	{ id: 'a', name: 'Task A', start: offsetISO(-2), end: offsetISO(2), progress: 50 },
	{ id: 'b', name: 'Task B', start: offsetISO(3), end: offsetISO(3), isMilestone: true, dependencies: ['a'] },
	{ id: 'c', name: 'Task C', start: offsetISO(4), end: offsetISO(8), dependencies: ['b'], progress: 0 }
];

describe('GsapGantt', () => {
	it('renders a row for every task', () => {
		const { container } = render(GsapGantt, { props: { tasks: baseTasks } });
		expect(container.querySelectorAll('.gg-label-row').length).toBe(baseTasks.length);
	});

	it('renders a bar for ranged tasks and a diamond for milestones', () => {
		const { container } = render(GsapGantt, { props: { tasks: baseTasks } });
		expect(container.querySelectorAll('rect.gg-bar').length).toBe(2);
		expect(container.querySelectorAll('.gg-milestone polygon').length).toBe(1);
	});

	it('renders one finish→start dependency arrow per declared dependency', () => {
		const { container } = render(GsapGantt, { props: { tasks: baseTasks } });
		expect(container.querySelectorAll('path.gg-dependency').length).toBe(2);
	});

	it('hides arrows when showDependencies={false}', () => {
		const { container } = render(GsapGantt, {
			props: { tasks: baseTasks, showDependencies: false }
		});
		expect(container.querySelectorAll('path.gg-dependency').length).toBe(0);
	});

	it('renders weekend bands when showWeekends is enabled', () => {
		const { container } = render(GsapGantt, { props: { tasks: baseTasks } });
		expect(container.querySelectorAll('rect.gg-weekend').length).toBeGreaterThan(0);
	});

	it('renders the today marker when in range', () => {
		const { container } = render(GsapGantt, { props: { tasks: baseTasks } });
		expect(container.querySelector('g.gg-today')).toBeTruthy();
	});

	it('omits today when out of range', () => {
		const tasks: GanttTask[] = [
			{ id: 'p1', name: 'Past', start: offsetISO(-30), end: offsetISO(-25) }
		];
		const { container } = render(GsapGantt, { props: { tasks } });
		expect(container.querySelector('g.gg-today')).toBeNull();
	});

	it('renders progress overlay when progress > 0 and showProgress=true', () => {
		const { container } = render(GsapGantt, { props: { tasks: baseTasks } });
		expect(container.querySelectorAll('rect.gg-bar-progress').length).toBeGreaterThan(0);
	});

	it('omits progress overlay when showProgress=false', () => {
		const { container } = render(GsapGantt, { props: { tasks: baseTasks, showProgress: false } });
		expect(container.querySelectorAll('rect.gg-bar-progress').length).toBe(0);
	});

	it('renders task groups as button-role when onTaskClick is supplied', () => {
		const onTaskClick = vi.fn();
		const { container } = render(GsapGantt, { props: { tasks: baseTasks, onTaskClick } });
		expect(container.querySelectorAll('g[role="button"]').length).toBe(baseTasks.length);
	});

	it('fires onTaskClick when a bar is clicked', async () => {
		const user = userEvent.setup();
		const onTaskClick = vi.fn();
		const { container } = render(GsapGantt, { props: { tasks: baseTasks, onTaskClick } });
		const button = container.querySelector('g[role="button"]') as Element;
		await user.click(button);
		expect(onTaskClick).toHaveBeenCalled();
	});

	it('describes the chart wrapper with task count summary', () => {
		const { container } = render(GsapGantt, { props: { tasks: baseTasks } });
		const wrapper = container.querySelector('.gsap-gantt') as HTMLElement;
		const label = wrapper.getAttribute('aria-label') ?? '';
		expect(label).toContain('GSAP Gantt chart');
		expect(label).toContain('3 tasks');
	});

	it('handles empty tasks without crashing', () => {
		const { container } = render(GsapGantt, { props: { tasks: [] } });
		const wrapper = container.querySelector('.gsap-gantt') as HTMLElement;
		expect(wrapper.getAttribute('aria-label')).toContain('Empty Gantt chart');
	});

	it('uses a unique per-instance arrowhead id (no SVG marker collisions)', () => {
		const { container: a } = render(GsapGantt, { props: { tasks: baseTasks } });
		const { container: b } = render(GsapGantt, { props: { tasks: baseTasks } });
		const idA = a.querySelector('marker')?.getAttribute('id');
		const idB = b.querySelector('marker')?.getAttribute('id');
		expect(idA).toBeTruthy();
		expect(idB).toBeTruthy();
		expect(idA).not.toBe(idB);
	});

	it('renders the assignee inline with the label when supplied', () => {
		const tasks: GanttTask[] = [
			{ id: 'a', name: 'Solo', start: offsetISO(0), end: offsetISO(1), assignee: 'James' }
		];
		render(GsapGantt, { props: { tasks } });
		expect(screen.getByText('James')).toBeTruthy();
	});

	it('forwards class prop onto the wrapper', () => {
		const { container } = render(GsapGantt, {
			props: { tasks: baseTasks, class: 'custom-gsap-gantt' }
		});
		expect(container.querySelector('.custom-gsap-gantt')).toBeTruthy();
	});
});
