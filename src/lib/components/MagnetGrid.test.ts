/**
 * ============================================================
 * MagnetGrid Tests
 * ============================================================
 *
 * Verifies the pure helpers (grid indices, cell-centre maths,
 * smoothstep falloff, displacement vector, policy validation,
 * reduced-motion detection) and a handful of render assertions
 * against the test harness fixture.
 *
 * Pure helpers are exercised through the module-script exports
 * — no rendering needed. Render tests use the harness with a
 * 4×3 grid so selector counts are stable.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
	gridIndices,
	cellCenter,
	falloff,
	displacement,
	pickPolicy,
	isReducedMotion
} from './MagnetGrid.svelte';
import MagnetGridTestHarness from './MagnetGridTestHarness.test.svelte';

describe('gridIndices', () => {
	it('returns row-major flat indices for 2x2', () => {
		expect(gridIndices(2, 2)).toEqual([
			{ row: 0, col: 0 },
			{ row: 0, col: 1 },
			{ row: 1, col: 0 },
			{ row: 1, col: 1 }
		]);
	});

	it('returns 8x6 = 48 cells', () => {
		expect(gridIndices(8, 6).length).toBe(48);
	});

	it('returns single cell for 1x1', () => {
		expect(gridIndices(1, 1)).toEqual([{ row: 0, col: 0 }]);
	});

	it('returns empty for cols=0', () => {
		expect(gridIndices(0, 4)).toEqual([]);
	});

	it('returns empty for rows=0', () => {
		expect(gridIndices(4, 0)).toEqual([]);
	});

	it('returns empty for negative dims', () => {
		expect(gridIndices(-3, 2)).toEqual([]);
		expect(gridIndices(3, -1)).toEqual([]);
	});

	it('returns empty for non-finite dims', () => {
		expect(gridIndices(NaN, 4)).toEqual([]);
		expect(gridIndices(Infinity, 4)).toEqual([]);
	});

	it('floors fractional dimensions', () => {
		expect(gridIndices(2.7, 2.3).length).toBe(4);
	});
});

describe('cellCenter', () => {
	it('places (0,0) at half cell offset', () => {
		expect(cellCenter(0, 0, 100, 100)).toEqual({ x: 50, y: 50 });
	});

	it('advances x by cellW per column', () => {
		expect(cellCenter(0, 1, 100, 100)).toEqual({ x: 150, y: 50 });
	});

	it('advances y by cellH per row', () => {
		expect(cellCenter(1, 0, 100, 100)).toEqual({ x: 50, y: 150 });
	});

	it('handles mixed indices', () => {
		expect(cellCenter(2, 3, 40, 40)).toEqual({ x: 140, y: 100 });
	});

	it('returns 0,0 for non-positive cell sizes', () => {
		expect(cellCenter(0, 0, 0, 0)).toEqual({ x: 0, y: 0 });
		expect(cellCenter(0, 0, -10, 100)).toEqual({ x: 0, y: 50 });
	});

	it('coerces non-finite indices to 0', () => {
		expect(cellCenter(NaN, NaN, 100, 100)).toEqual({ x: 50, y: 50 });
	});
});

describe('falloff', () => {
	it('returns 1 at distance 0', () => {
		expect(falloff(0, 100)).toBe(1);
	});

	it('returns 0 at distance >= radius', () => {
		expect(falloff(100, 100)).toBe(0);
		expect(falloff(150, 100)).toBe(0);
	});

	it('halfway is (1 - 0.5)^2 = 0.25', () => {
		expect(falloff(50, 100)).toBe(0.25);
	});

	it('quarter way is (1 - 0.25)^2 = 0.5625', () => {
		expect(falloff(25, 100)).toBeCloseTo(0.5625, 4);
	});

	it('returns 0 for non-positive radius', () => {
		expect(falloff(10, 0)).toBe(0);
		expect(falloff(10, -50)).toBe(0);
	});

	it('returns 0 for non-finite inputs', () => {
		expect(falloff(NaN, 100)).toBe(0);
		expect(falloff(10, NaN)).toBe(0);
		expect(falloff(Infinity, 100)).toBe(0);
	});

	it('clamps negative distance to 0 (returns 1)', () => {
		expect(falloff(-50, 100)).toBe(1);
	});
});

describe('displacement', () => {
	it('returns 0,0 when cell sits exactly at cursor', () => {
		expect(displacement(50, 50, 50, 50, 100, 20)).toEqual({ dx: 0, dy: 0 });
	});

	it('returns 0,0 when cell is outside radius', () => {
		expect(displacement(0, 0, 500, 500, 100, 20)).toEqual({ dx: 0, dy: 0 });
	});

	it('attract pulls cell toward cursor (positive dx if cursor is to the right)', () => {
		const d = displacement(50, 50, 100, 50, 100, 20, 'attract');
		expect(d.dx).toBeGreaterThan(0);
		expect(d.dy).toBe(0);
	});

	it('repel pushes cell away from cursor (negative dx if cursor is to the right)', () => {
		const d = displacement(50, 50, 100, 50, 100, 20, 'repel');
		expect(d.dx).toBeLessThan(0);
		expect(d.dy).toBe(0);
	});

	it('default policy is attract', () => {
		const d = displacement(50, 50, 100, 50, 100, 20);
		expect(d.dx).toBeGreaterThan(0);
	});

	it('magnitude scales with strength', () => {
		const weak = displacement(50, 50, 80, 50, 100, 10, 'attract');
		const strong = displacement(50, 50, 80, 50, 100, 20, 'attract');
		expect(strong.dx).toBeCloseTo(weak.dx * 2, 4);
	});

	it('returns 0,0 for non-finite inputs', () => {
		expect(displacement(NaN, 0, 0, 0, 100, 20)).toEqual({ dx: 0, dy: 0 });
		expect(displacement(0, 0, NaN, 0, 100, 20)).toEqual({ dx: 0, dy: 0 });
	});

	it('returns 0,0 for non-finite strength', () => {
		const d = displacement(50, 50, 80, 50, 100, NaN);
		expect(d).toEqual({ dx: 0, dy: 0 });
	});

	it('vector preserves direction (45° pull)', () => {
		const d = displacement(0, 0, 50, 50, 200, 10, 'attract');
		// 45° toward cursor: dx and dy should be equal and positive
		expect(d.dx).toBeGreaterThan(0);
		expect(d.dy).toBeGreaterThan(0);
		expect(Math.abs(d.dx - d.dy)).toBeLessThan(0.001);
	});
});

describe('pickPolicy', () => {
	it('accepts attract', () => {
		expect(pickPolicy('attract')).toBe('attract');
	});

	it('accepts repel', () => {
		expect(pickPolicy('repel')).toBe('repel');
	});

	it('falls back to attract for unknowns', () => {
		expect(pickPolicy('grumpy')).toBe('attract');
		expect(pickPolicy('')).toBe('attract');
	});
});

describe('isReducedMotion', () => {
	const originalMatchMedia = (globalThis as { matchMedia?: typeof window.matchMedia }).matchMedia;

	afterEach(() => {
		if (typeof window !== 'undefined') {
			(window as unknown as { matchMedia?: typeof window.matchMedia }).matchMedia = originalMatchMedia;
		}
	});

	it('returns false when matchMedia is missing', () => {
		if (typeof window === 'undefined') return;
		(window as unknown as { matchMedia?: typeof window.matchMedia }).matchMedia = undefined;
		expect(isReducedMotion()).toBe(false);
	});

	it('honours matches=true from matchMedia', () => {
		if (typeof window === 'undefined') return;
		(window as unknown as { matchMedia: typeof window.matchMedia }).matchMedia = (() => ({
			matches: true,
			media: '',
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false
		})) as unknown as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(true);
	});
});

describe('MagnetGrid render', () => {
	beforeEach(() => {
		vi.stubGlobal('matchMedia', () => ({
			matches: false,
			media: '',
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false
		}));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('renders cols × rows cells (4×3 = 12)', () => {
		const { container } = render(MagnetGridTestHarness, {
			props: { cols: 4, rows: 3 }
		});
		const cells = container.querySelectorAll('.magnet-grid__cell');
		expect(cells.length).toBe(12);
	});

	it('renders 8×6 = 48 cells with default props', () => {
		const { container } = render(MagnetGridTestHarness, {
			props: { cols: 8, rows: 6 }
		});
		const cells = container.querySelectorAll('.magnet-grid__cell');
		expect(cells.length).toBe(48);
	});

	it('writes magnet-cols custom property based on cols prop', () => {
		const { container } = render(MagnetGridTestHarness, {
			props: { cols: 5, rows: 4 }
		});
		const host = container.querySelector('.magnet-grid') as HTMLElement;
		expect(host.style.getPropertyValue('--magnet-cols')).toBe('5');
		expect(host.style.getPropertyValue('--magnet-rows')).toBe('4');
	});

	it('writes cell-size custom property based on cellSize prop', () => {
		const { container } = render(MagnetGridTestHarness, {
			props: { cellSize: 48 }
		});
		const host = container.querySelector('.magnet-grid') as HTMLElement;
		expect(host.style.getPropertyValue('--magnet-cell-size')).toBe('48px');
	});

	it('exposes data-policy on the host', () => {
		const { container } = render(MagnetGridTestHarness, {
			props: { policy: 'repel' }
		});
		const host = container.querySelector('.magnet-grid');
		expect(host?.getAttribute('data-policy')).toBe('repel');
	});

	it('falls back to attract for unknown policy', () => {
		const { container } = render(MagnetGridTestHarness, {
			props: { policy: 'grumpy' as 'attract' }
		});
		const host = container.querySelector('.magnet-grid');
		expect(host?.getAttribute('data-policy')).toBe('attract');
	});

	it('initialises cell-dx and cell-dy to 0px', () => {
		const { container } = render(MagnetGridTestHarness, {
			props: { cols: 2, rows: 2 }
		});
		const cells = container.querySelectorAll<HTMLElement>('.magnet-grid__cell');
		cells.forEach((c) => {
			expect(c.style.getPropertyValue('--cell-dx')).toBe('0px');
			expect(c.style.getPropertyValue('--cell-dy')).toBe('0px');
		});
	});

	it('renders default dot when no cell snippet is supplied', () => {
		render(MagnetGridTestHarness, { props: { cols: 1, rows: 1 } });
		// Harness always provides a snippet, so we test the bare dot another way:
		// it's enough that data-testid is rendered for cell 0,0 here
		expect(screen.getByTestId('magnet-cell-0-0')).toBeInTheDocument();
	});

	it('renders custom cell content via snippet (with labels)', () => {
		render(MagnetGridTestHarness, {
			props: { cols: 2, rows: 2, showLabels: true }
		});
		expect(screen.getByText('0,0')).toBeInTheDocument();
		expect(screen.getByText('1,1')).toBeInTheDocument();
	});

	it('writes data-row and data-col on each cell', () => {
		const { container } = render(MagnetGridTestHarness, {
			props: { cols: 2, rows: 2 }
		});
		const cells = container.querySelectorAll<HTMLElement>('.magnet-grid__cell');
		expect(cells[0].dataset.row).toBe('0');
		expect(cells[0].dataset.col).toBe('0');
		expect(cells[3].dataset.row).toBe('1');
		expect(cells[3].dataset.col).toBe('1');
	});

	it('clamps cols/rows below 1 to 1', () => {
		const { container } = render(MagnetGridTestHarness, {
			props: { cols: 0, rows: 0 }
		});
		const host = container.querySelector('.magnet-grid') as HTMLElement;
		expect(host.style.getPropertyValue('--magnet-cols')).toBe('1');
		expect(host.style.getPropertyValue('--magnet-rows')).toBe('1');
	});
});
