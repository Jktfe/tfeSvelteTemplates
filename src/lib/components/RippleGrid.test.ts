/**
 * ============================================================
 * RippleGrid Tests
 * ============================================================
 *
 * Two layers:
 *  1. Pure helpers (gridDistance, delayForCell, cellIntensity,
 *     composeRipples, clampConcurrent, rippleLifetime,
 *     isReducedMotion) — exported from the module-script.
 *  2. Component render — mount the grid, confirm cell counts,
 *     ARIA roles, ripple layers on click, focus management,
 *     and the reduced-motion branch.
 *
 * 💡 Run `bun run test:ui` for a visual, filterable runner.
 * ============================================================
 */

import { fireEvent, render, cleanup } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import RippleGrid, {
	cellIntensity,
	clampConcurrent,
	composeRipples,
	delayForCell,
	gridDistance,
	isReducedMotion,
	rippleLifetime,
	type Ripple
} from './RippleGrid.svelte';

afterEach(() => {
	cleanup();
});

describe('RippleGrid helpers', () => {
	describe('gridDistance', () => {
		it('returns 0 for the same point in every mode', () => {
			const p = { row: 3, col: 4 };
			expect(gridDistance(p, p, 'manhattan')).toBe(0);
			expect(gridDistance(p, p, 'chebyshev')).toBe(0);
			expect(gridDistance(p, p, 'euclidean')).toBe(0);
		});

		it('manhattan: |dr| + |dc|', () => {
			expect(gridDistance({ row: 0, col: 0 }, { row: 3, col: 4 }, 'manhattan')).toBe(7);
			expect(gridDistance({ row: 5, col: 2 }, { row: 1, col: 6 }, 'manhattan')).toBe(8);
		});

		it('chebyshev: max(|dr|, |dc|)', () => {
			expect(gridDistance({ row: 0, col: 0 }, { row: 3, col: 4 }, 'chebyshev')).toBe(4);
			expect(gridDistance({ row: 5, col: 2 }, { row: 1, col: 6 }, 'chebyshev')).toBe(4);
		});

		it('euclidean: classic 3-4-5 triangle', () => {
			expect(gridDistance({ row: 0, col: 0 }, { row: 3, col: 4 }, 'euclidean')).toBe(5);
		});

		it('defaults to euclidean when mode is omitted', () => {
			expect(gridDistance({ row: 0, col: 0 }, { row: 3, col: 4 })).toBe(5);
		});

		it('is symmetric in every mode', () => {
			const a = { row: 2, col: 7 };
			const b = { row: 9, col: 1 };
			for (const mode of ['manhattan', 'chebyshev', 'euclidean'] as const) {
				expect(gridDistance(a, b, mode)).toBe(gridDistance(b, a, mode));
			}
		});
	});

	describe('delayForCell', () => {
		it('returns 0 when origin equals cell', () => {
			expect(delayForCell({ row: 5, col: 5 }, { row: 5, col: 5 }, 10)).toBe(0);
		});

		it('scales inversely with speed', () => {
			const fast = delayForCell({ row: 0, col: 0 }, { row: 0, col: 6 }, 12);
			const slow = delayForCell({ row: 0, col: 0 }, { row: 0, col: 6 }, 6);
			expect(slow).toBeCloseTo(fast * 2, 5);
		});

		it('returns 0 when speed is 0 (defensive)', () => {
			expect(delayForCell({ row: 0, col: 0 }, { row: 5, col: 5 }, 0)).toBe(0);
		});

		it('returns 0 for negative speed (defensive)', () => {
			expect(delayForCell({ row: 0, col: 0 }, { row: 5, col: 5 }, -3)).toBe(0);
		});

		it('uses the chosen distance mode', () => {
			const m = delayForCell({ row: 0, col: 0 }, { row: 3, col: 4 }, 10, 'manhattan');
			const e = delayForCell({ row: 0, col: 0 }, { row: 3, col: 4 }, 10, 'euclidean');
			expect(m).toBeCloseTo(700, 5);
			expect(e).toBeCloseTo(500, 5);
		});
	});

	describe('cellIntensity', () => {
		const ripple: Ripple = {
			id: 0,
			origin: { row: 0, col: 0 },
			startedAt: 0
		};

		it('is 0 before the wave arrives at the cell', () => {
			const i = cellIntensity(ripple, { row: 0, col: 6 }, 100, 500, 12, 'euclidean');
			expect(i).toBe(0);
		});

		it('is 0 after the wave passes', () => {
			const i = cellIntensity(ripple, { row: 0, col: 0 }, 600, 500, 12, 'euclidean');
			expect(i).toBe(0);
		});

		it('peaks at 1 in the middle of the active window', () => {
			const i = cellIntensity(ripple, { row: 0, col: 0 }, 250, 500, 12, 'euclidean');
			expect(i).toBeCloseTo(1, 5);
		});

		it('returns 0 when duration is 0 (defensive)', () => {
			const i = cellIntensity(ripple, { row: 0, col: 0 }, 0, 0, 12, 'euclidean');
			expect(i).toBe(0);
		});
	});

	describe('composeRipples', () => {
		it('returns 0 when there are no active ripples', () => {
			const i = composeRipples([], { row: 0, col: 0 }, 100, 500, 12, 'euclidean');
			expect(i).toBe(0);
		});

		it('takes the max across overlapping ripples', () => {
			const a: Ripple = { id: 0, origin: { row: 0, col: 0 }, startedAt: 0 };
			const b: Ripple = { id: 1, origin: { row: 0, col: 0 }, startedAt: 250 };
			// at t=250: ripple a is at peak (sin(π/2)=1), ripple b just started (sin(0)=0)
			const i = composeRipples([a, b], { row: 0, col: 0 }, 250, 500, 12, 'euclidean');
			expect(i).toBeCloseTo(1, 5);
		});

		it('never exceeds 1 even with many overlapping ripples', () => {
			const ripples: Ripple[] = Array.from({ length: 5 }, (_, idx) => ({
				id: idx,
				origin: { row: 0, col: 0 },
				startedAt: 0
			}));
			const i = composeRipples(ripples, { row: 0, col: 0 }, 250, 500, 12);
			expect(i).toBeLessThanOrEqual(1);
		});
	});

	describe('clampConcurrent', () => {
		const make = (n: number): Ripple[] =>
			Array.from({ length: n }, (_, idx) => ({
				id: idx,
				origin: { row: 0, col: 0 },
				startedAt: idx
			}));

		it('returns the array unchanged when at or below the cap', () => {
			const r = make(3);
			expect(clampConcurrent(r, 5)).toHaveLength(3);
			expect(clampConcurrent(r, 3)).toHaveLength(3);
		});

		it('drops the oldest ripples when over the cap', () => {
			const r = make(5);
			const clamped = clampConcurrent(r, 3);
			expect(clamped).toHaveLength(3);
			expect(clamped[0].id).toBe(2);
			expect(clamped[2].id).toBe(4);
		});

		it('returns an empty array when max is 0 or negative', () => {
			expect(clampConcurrent(make(3), 0)).toHaveLength(0);
			expect(clampConcurrent(make(3), -1)).toHaveLength(0);
		});

		it('returns a fresh copy (not the original reference)', () => {
			const r = make(2);
			const clamped = clampConcurrent(r, 5);
			expect(clamped).not.toBe(r);
		});
	});

	describe('rippleLifetime', () => {
		it('grows with grid size', () => {
			const small = rippleLifetime(5, 5, 12, 500);
			const large = rippleLifetime(20, 20, 12, 500);
			expect(large).toBeGreaterThan(small);
		});

		it('returns just the duration when speed is 0', () => {
			expect(rippleLifetime(20, 20, 0, 500)).toBe(500);
		});

		it('depends on the chosen distance mode', () => {
			const m = rippleLifetime(10, 10, 12, 500, 'manhattan');
			const e = rippleLifetime(10, 10, 12, 500, 'euclidean');
			expect(m).toBeGreaterThan(e);
		});
	});

	describe('isReducedMotion', () => {
		it('returns a boolean (jsdom defaults to false)', () => {
			expect(typeof isReducedMotion()).toBe('boolean');
		});
	});
});

describe('RippleGrid component', () => {
	it('renders the right number of cells for default props', () => {
		const { container } = render(RippleGrid, { props: { rows: 3, cols: 4 } });
		const cells = container.querySelectorAll('[role="gridcell"]');
		expect(cells).toHaveLength(12);
	});

	it('exposes role="grid" on the wrapper with an aria-label', () => {
		const { container } = render(RippleGrid, {
			props: { rows: 2, cols: 2, ariaLabel: 'Demo grid' }
		});
		const grid = container.querySelector('[role="grid"]');
		expect(grid).not.toBeNull();
		expect(grid?.getAttribute('aria-label')).toBe('Demo grid');
	});

	it('clicking a cell adds a ripple layer inside it', async () => {
		const { container } = render(RippleGrid, { props: { rows: 2, cols: 2 } });
		const firstCell = container.querySelector('[role="gridcell"]') as HTMLElement;
		expect(firstCell).not.toBeNull();
		expect(firstCell.querySelectorAll('.layer')).toHaveLength(0);
		await fireEvent.click(firstCell);
		expect(firstCell.querySelectorAll('.layer').length).toBeGreaterThan(0);
	});

	it('fires the onRipple callback with the cell coordinates', async () => {
		const onRipple = vi.fn();
		const { container } = render(RippleGrid, {
			props: { rows: 2, cols: 3, onRipple }
		});
		const cells = container.querySelectorAll('[role="gridcell"]');
		await fireEvent.click(cells[4] as HTMLElement); // row 1, col 1
		expect(onRipple).toHaveBeenCalledTimes(1);
		expect(onRipple).toHaveBeenCalledWith({ row: 1, col: 1 });
	});

	it('appends extra classes to the wrapper', () => {
		const { container } = render(RippleGrid, {
			props: { rows: 1, cols: 1, class: 'demo-extra' }
		});
		const grid = container.querySelector('.ripple-grid');
		expect(grid?.classList.contains('demo-extra')).toBe(true);
	});

	it('marks the hex variant via the .hex class on the wrapper', () => {
		const { container } = render(RippleGrid, {
			props: { rows: 2, cols: 2, variant: 'hex' }
		});
		const grid = container.querySelector('.ripple-grid');
		expect(grid?.classList.contains('hex')).toBe(true);
	});

	it('writes the cellSize and colour through CSS custom properties', () => {
		const { container } = render(RippleGrid, {
			props: { rows: 1, cols: 1, cellSize: 32, colour: '#ff00aa' }
		});
		const grid = container.querySelector('.ripple-grid') as HTMLElement;
		const style = grid.getAttribute('style') ?? '';
		expect(style).toContain('--rg-cell: 32px');
		expect(style).toContain('--rg-colour: #ff00aa');
	});

	it('only one cell is in the tab order at a time (roving tabindex)', () => {
		const { container } = render(RippleGrid, { props: { rows: 2, cols: 3 } });
		const cells = container.querySelectorAll('[role="gridcell"]');
		const focusable = Array.from(cells).filter(
			(c) => (c as HTMLElement).getAttribute('tabindex') === '0'
		);
		expect(focusable).toHaveLength(1);
	});

	it('renders empty when rows or cols are 0', () => {
		const { container } = render(RippleGrid, { props: { rows: 0, cols: 5 } });
		expect(container.querySelectorAll('[role="gridcell"]')).toHaveLength(0);
	});

	it('clamps concurrent ripples to maxConcurrent', async () => {
		const { container } = render(RippleGrid, {
			props: { rows: 2, cols: 2, maxConcurrent: 2 }
		});
		const firstCell = container.querySelector('[role="gridcell"]') as HTMLElement;
		await fireEvent.click(firstCell);
		await fireEvent.click(firstCell);
		await fireEvent.click(firstCell);
		await fireEvent.click(firstCell);
		// Each layer represents one active ripple in this cell — capped at 2.
		expect(firstCell.querySelectorAll('.layer').length).toBeLessThanOrEqual(2);
	});
});
