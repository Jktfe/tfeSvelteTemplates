/**
 * ============================================================
 * Gantt Tests
 * ============================================================
 *
 * Verifies layout math, milestone vs bar rendering, dependency
 * arrows, weekend bands, today marker visibility, % complete
 * overlay, click + keyboard activation, and aria wiring.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Gantt from './Gantt.svelte';
import type { GanttTask } from '$lib/types';

function offsetISO(days: number): string {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() + days);
	return d.toISOString().slice(0, 10);
}

const baseTasks: GanttTask[] = [
	{ id: 'a', name: 'Task A', start: offsetISO(-2), end: offsetISO(2), progress: 50 },
	{ id: 'b', name: 'Task B', start: offsetISO(3), end: offsetISO(3), isMilestone: true, dependencies: ['a'] },
	{ id: 'c', name: 'Task C', start: offsetISO(4), end: offsetISO(8), dependencies: ['b'], progress: 0 }
];

describe('Gantt', () => {
	it('renders a row for every task', () => {
		const { container } = render(Gantt, { props: { tasks: baseTasks } });
		const rows = container.querySelectorAll('.gantt-label-row');
		expect(rows.length).toBe(baseTasks.length);
		for (const t of baseTasks) {
			expect(screen.getByText(t.name)).toBeTruthy();
		}
	});

	it('renders a bar for ranged tasks and a diamond for milestones', () => {
		const { container } = render(Gantt, { props: { tasks: baseTasks } });
		const bars = container.querySelectorAll('rect.gantt-bar');
		const diamonds = container.querySelectorAll('.gantt-milestone polygon');
		expect(bars.length).toBe(2);
		expect(diamonds.length).toBe(1);
	});

	it('renders a finish→start dependency arrow per declared dependency', () => {
		const { container } = render(Gantt, { props: { tasks: baseTasks } });
		const arrows = container.querySelectorAll('path.gantt-dependency');
		expect(arrows.length).toBe(2);
	});

	it('hides dependency arrows when showDependencies={false}', () => {
		const { container } = render(Gantt, {
			props: { tasks: baseTasks, showDependencies: false }
		});
		expect(container.querySelectorAll('path.gantt-dependency').length).toBe(0);
	});

	it('renders weekend bands when showWeekends is enabled', () => {
		const { container } = render(Gantt, { props: { tasks: baseTasks } });
		// At least one weekend exists in any 11-day window.
		expect(container.querySelectorAll('rect.gantt-weekend').length).toBeGreaterThan(0);
	});

	it('omits weekend bands when showWeekends={false}', () => {
		const { container } = render(Gantt, {
			props: { tasks: baseTasks, showWeekends: false }
		});
		expect(container.querySelectorAll('rect.gantt-weekend').length).toBe(0);
	});

	it('renders the today marker when today falls inside the chart range', () => {
		const { container } = render(Gantt, { props: { tasks: baseTasks } });
		expect(container.querySelector('g.gantt-today')).toBeTruthy();
	});

	it('omits the today marker when today is outside the chart range', () => {
		const tasks: GanttTask[] = [
			{ id: 'past1', name: 'Past A', start: offsetISO(-30), end: offsetISO(-25) },
			{ id: 'past2', name: 'Past B', start: offsetISO(-24), end: offsetISO(-20) }
		];
		const { container } = render(Gantt, { props: { tasks } });
		expect(container.querySelector('g.gantt-today')).toBeNull();
	});

	it('renders the progress overlay when progress > 0 and showProgress is enabled', () => {
		const { container } = render(Gantt, { props: { tasks: baseTasks } });
		expect(container.querySelectorAll('rect.gantt-bar-progress').length).toBeGreaterThan(0);
	});

	it('omits the progress overlay when showProgress={false}', () => {
		const { container } = render(Gantt, {
			props: { tasks: baseTasks, showProgress: false }
		});
		expect(container.querySelectorAll('rect.gantt-bar-progress').length).toBe(0);
	});

	it('clamps progress over 100 to a full overlay', () => {
		const { container } = render(Gantt, {
			props: {
				tasks: [{ id: 'big', name: 'Over', start: offsetISO(0), end: offsetISO(2), progress: 250 }]
			}
		});
		const bar = container.querySelector('rect.gantt-bar') as SVGRectElement;
		const overlay = container.querySelector('rect.gantt-bar-progress') as SVGRectElement;
		expect(bar).toBeTruthy();
		expect(overlay).toBeTruthy();
		expect(Number(overlay.getAttribute('width'))).toBeCloseTo(Number(bar.getAttribute('width')), 1);
	});

	it('does not render a progress overlay when progress is 0', () => {
		const { container } = render(Gantt, {
			props: {
				tasks: [{ id: 'zero', name: 'Idle', start: offsetISO(0), end: offsetISO(2), progress: 0 }]
			}
		});
		expect(container.querySelectorAll('rect.gantt-bar-progress').length).toBe(0);
	});

	it('renders click-bound bars as button-role groups when onTaskClick is supplied', () => {
		const onTaskClick = vi.fn();
		const { container } = render(Gantt, {
			props: { tasks: baseTasks, onTaskClick }
		});
		const buttons = container.querySelectorAll('g[role="button"]');
		expect(buttons.length).toBe(baseTasks.length);
	});

	it('omits role="button" when onTaskClick is not supplied', () => {
		const { container } = render(Gantt, { props: { tasks: baseTasks } });
		expect(container.querySelectorAll('g[role="button"]').length).toBe(0);
	});

	it('fires onTaskClick when a bar is clicked', async () => {
		const user = userEvent.setup();
		const onTaskClick = vi.fn();
		const { container } = render(Gantt, {
			props: { tasks: baseTasks, onTaskClick }
		});
		const button = container.querySelector('g[role="button"]') as Element;
		await user.click(button);
		expect(onTaskClick).toHaveBeenCalledTimes(1);
		expect(onTaskClick.mock.calls[0][0].id).toBe('a');
	});

	it('fires onTaskClick on Enter and Space when focused', async () => {
		const user = userEvent.setup();
		const onTaskClick = vi.fn();
		const { container } = render(Gantt, {
			props: { tasks: baseTasks, onTaskClick }
		});
		const button = container.querySelector('g[role="button"]') as HTMLElement;
		button.focus();
		await user.keyboard('{Enter}');
		expect(onTaskClick).toHaveBeenCalledTimes(1);
		await user.keyboard(' ');
		expect(onTaskClick).toHaveBeenCalledTimes(2);
	});

	it('attaches a descriptive aria-label to clickable bars', () => {
		const { container } = render(Gantt, {
			props: { tasks: baseTasks, onTaskClick: () => {} }
		});
		const button = container.querySelector('g[role="button"]') as Element;
		const label = button.getAttribute('aria-label') ?? '';
		expect(label).toContain('Task A');
		expect(label).toContain('50% complete');
	});

	it('describes the chart wrapper with task count summary', () => {
		const { container } = render(Gantt, { props: { tasks: baseTasks } });
		const wrapper = container.querySelector('.gantt') as HTMLElement;
		const label = wrapper.getAttribute('aria-label') ?? '';
		expect(label).toContain('Gantt chart');
		expect(label).toContain('3 tasks');
	});

	it('handles an empty task list without crashing', () => {
		const { container } = render(Gantt, { props: { tasks: [] } });
		const wrapper = container.querySelector('.gantt') as HTMLElement;
		expect(wrapper.getAttribute('aria-label')).toContain('Empty Gantt chart');
		expect(container.querySelectorAll('rect.gantt-bar').length).toBe(0);
		expect(container.querySelectorAll('.gantt-milestone polygon').length).toBe(0);
	});

	it('shrinks zero-progress milestone aria-label to just name + date', () => {
		const tasks: GanttTask[] = [
			{ id: 'm', name: 'Kick-off', start: offsetISO(0), end: offsetISO(0), isMilestone: true }
		];
		const { container } = render(Gantt, {
			props: { tasks, onTaskClick: () => {} }
		});
		const button = container.querySelector('g[role="button"]') as Element;
		const label = button.getAttribute('aria-label') ?? '';
		expect(label).toContain('Kick-off');
		expect(label).toContain('milestone');
	});

	it('places dependent arrows pointing to the dependent task', () => {
		const onTaskClick = vi.fn();
		const { container } = render(Gantt, {
			props: { tasks: baseTasks, onTaskClick }
		});
		const arrows = container.querySelectorAll('path.gantt-dependency');
		// Should be one a→b and one b→c
		expect(arrows.length).toBe(2);
		for (const arrow of arrows) {
			const d = arrow.getAttribute('d') ?? '';
			// elbow-routed paths have at least 5 line segments
			expect(d.split(/[ML]/).filter(Boolean).length).toBeGreaterThanOrEqual(5);
		}
	});

	it('renders the assignee inline with the label when supplied', () => {
		const tasks: GanttTask[] = [
			{ id: 'a', name: 'Solo', start: offsetISO(0), end: offsetISO(1), assignee: 'James' }
		];
		render(Gantt, { props: { tasks } });
		expect(screen.getByText('James')).toBeTruthy();
	});

	it('forwards the class prop onto the wrapper', () => {
		const { container } = render(Gantt, {
			props: { tasks: baseTasks, class: 'custom-gantt' }
		});
		expect(container.querySelector('.custom-gantt')).toBeTruthy();
	});
});
