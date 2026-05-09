/**
 * ============================================================
 * Cardwall Tests
 * ============================================================
 *
 * Verifies row construction by density, perspective transforms,
 * row offset wrapping, and the live Cardwall component renders
 * the expected number of marquee tracks with two seamless copies.
 *
 * Maths helpers in ./types are unit-tested directly so the
 * component remains reactive-safe even if the rAF tick is hard
 * to drive in JSDOM.
 * ============================================================
 */

import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Cardwall from './Cardwall.svelte';
import {
	buildRows,
	clamp,
	lerp,
	pickTilePalette,
	rowOffset,
	perspectiveTransform
} from './types';

describe('Cardwall maths helpers', () => {
	it('clamp clamps below and above the bounds', () => {
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(-1, 0, 10)).toBe(0);
		expect(clamp(11, 0, 10)).toBe(10);
	});

	it('lerp interpolates linearly', () => {
		expect(lerp(0, 10, 0)).toBe(0);
		expect(lerp(0, 10, 1)).toBe(10);
		expect(lerp(0, 10, 0.5)).toBe(5);
	});

	it('pickTilePalette returns a palette with the required keys', () => {
		const p = pickTilePalette(42);
		expect(p.label).toBeTruthy();
		expect(p.from).toBeTruthy();
		expect(p.to).toBeTruthy();
	});

	it('rowOffset stays inside [0, period) for direction +1', () => {
		const period = 1000;
		const speed = 60;
		const off = rowOffset(50, period, speed, 1);
		expect(off).toBeGreaterThanOrEqual(0);
		expect(off).toBeLessThan(period);
	});

	it('rowOffset stays inside [0, period) for direction -1', () => {
		const period = 800;
		const speed = 80;
		const off = rowOffset(7, period, speed, -1);
		expect(off).toBeGreaterThanOrEqual(0);
		expect(off).toBeLessThan(period);
	});

	it('perspectiveTransform returns a CSS transform string', () => {
		const t = perspectiveTransform(0, 5);
		expect(typeof t).toBe('string');
		expect(t.length).toBeGreaterThan(0);
	});

	it('buildRows produces more rows for "dense" than "sparse"', () => {
		const sparse = buildRows('sparse', 8);
		const dense = buildRows('dense', 8);
		expect(dense.length).toBeGreaterThan(sparse.length);
	});

	it('buildRows uses the requested tilesPerRow', () => {
		const rows = buildRows('default', 6);
		for (const row of rows) {
			expect(row.tiles.length).toBe(6);
		}
	});
});

describe('Cardwall component', () => {
	it('renders the wall with an aria-label', () => {
		const { container } = render(Cardwall, { props: {} });
		const wall = container.querySelector('.cw-wall');
		expect(wall).toBeTruthy();
		expect(wall?.getAttribute('aria-label')).toBe('Decorative billboard wall');
	});

	it('renders one .cw-row per built row', () => {
		const { container } = render(Cardwall, { props: { density: 'sparse', tilesPerRow: 6 } });
		const rows = container.querySelectorAll('.cw-row');
		const expected = buildRows('sparse', 6).length;
		expect(rows.length).toBe(expected);
	});

	it('renders two seamless track copies per row', () => {
		const { container } = render(Cardwall, { props: { density: 'sparse', tilesPerRow: 4 } });
		const rows = container.querySelectorAll('.cw-row');
		for (const row of rows) {
			const copies = row.querySelectorAll('.cw-track-copy');
			expect(copies.length).toBe(2);
		}
	});

	it('forwards class prop onto the wall', () => {
		const { container } = render(Cardwall, { props: { class: 'extra-cw' } });
		expect(container.querySelector('.cw-wall.extra-cw')).toBeTruthy();
	});

	it('hides the duplicate track copy from assistive tech', () => {
		const { container } = render(Cardwall, { props: { density: 'sparse', tilesPerRow: 4 } });
		const copies = container.querySelectorAll('.cw-track-copy');
		const hidden = Array.from(copies).filter((c) => c.getAttribute('aria-hidden') === 'true');
		// Half of the copies should be aria-hidden (one per row)
		expect(hidden.length).toBe(copies.length / 2);
	});
});
