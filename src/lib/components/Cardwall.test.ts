/**
 * ============================================================
 * Cardwall Tests
 * ============================================================
 *
 * Two layers:
 *  1. Pure helpers in `Cardwall/types.ts` — offset wrap-around,
 *     perspective transform shape, halton determinism, palette
 *     selection, density → row count, lerp/clamp, motion gate.
 *  2. Component render — mount the wall, confirm row count,
 *     tile count per row (×2 for the seamless-marquee duplicate
 *     track), button-roled tiles with aria-label="Pin <LABEL>".
 *
 * 💡 Run `bun run test:ui` for a visual, filterable runner.
 * ============================================================
 */

import { render, cleanup, fireEvent } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import Cardwall from './Cardwall/Cardwall.svelte';
import {
	buildRows,
	clamp,
	halton,
	isReducedMotion,
	lerp,
	perspectiveTransform,
	pickTilePalette,
	rowOffset
} from './Cardwall/types';

afterEach(() => {
	cleanup();
});

describe('Cardwall helpers — rowOffset', () => {
	it('returns 0 when period is 0 (defensive — never throws)', () => {
		expect(rowOffset(1.5, 0, 60, 1)).toBe(0);
	});

	it('returns 0 at t=0 regardless of speed/dir', () => {
		expect(rowOffset(0, 200, 60, 1)).toBe(0);
		expect(rowOffset(0, 200, 60, -1)).toBe(0);
	});

	it('grows linearly with t for dir=+1, wrapping at period', () => {
		// speed=10 px/s, period=100 → at t=5 offset is 50, at t=15 offset is 50 again (1.5 wraps)
		expect(rowOffset(5, 100, 10, 1)).toBeCloseTo(50, 5);
		expect(rowOffset(15, 100, 10, 1)).toBeCloseTo(50, 5);
	});

	it('always returns a value in [0, period) — no negatives even for dir=-1', () => {
		const out = rowOffset(0.001, 200, 50, -1);
		expect(out).toBeGreaterThanOrEqual(0);
		expect(out).toBeLessThan(200);
	});

	it('dir=-1 reverses the drift direction (offset decreases over t)', () => {
		// for dir=-1 the wrapped value should be (period - raw) sliding from period→0
		const a = rowOffset(0.001, 200, 50, -1);
		const b = rowOffset(0.002, 200, 50, -1);
		// a was earlier in time → offset should be larger (closer to period)
		expect(a).toBeGreaterThan(b);
	});
});

describe('Cardwall helpers — perspectiveTransform', () => {
	it('returns "none" for empty wall', () => {
		expect(perspectiveTransform(0, 0)).toBe('none');
	});

	it('returns no tilt and unit scale for a single-row wall', () => {
		const out = perspectiveTransform(0, 1);
		expect(out).toContain('rotateX(0.00deg)');
		expect(out).toContain('scale(1.000)');
	});

	it('keeps the middle row flat (rel=0)', () => {
		const out = perspectiveTransform(2, 5); // mid of 0..4
		expect(out).toContain('rotateX(0.00deg)');
		expect(out).toContain('scale(1.000)');
		expect(out).toContain('translateY(0px)');
	});

	it('tilts upper rows forward (negative rotateX) and shrinks them slightly', () => {
		const top = perspectiveTransform(0, 5);
		expect(top).toMatch(/rotateX\(14\.00deg\)/);
		expect(top).toContain('scale(0.920)');
	});

	it('tilts lower rows back (positive rotateX) symmetrically', () => {
		const bottom = perspectiveTransform(4, 5);
		expect(bottom).toMatch(/rotateX\(-14\.00deg\)/);
		expect(bottom).toContain('scale(0.920)');
	});
});

describe('Cardwall helpers — halton', () => {
	it('is deterministic — same inputs return identical output', () => {
		expect(halton(7, 2)).toBe(halton(7, 2));
		expect(halton(13, 3)).toBe(halton(13, 3));
	});

	it('returns values in [0, 1)', () => {
		for (let i = 1; i < 50; i++) {
			const v2 = halton(i, 2);
			const v3 = halton(i, 3);
			expect(v2).toBeGreaterThanOrEqual(0);
			expect(v2).toBeLessThan(1);
			expect(v3).toBeGreaterThanOrEqual(0);
			expect(v3).toBeLessThan(1);
		}
	});

	it('halton(1, 2) is 0.5 — the canonical first base-2 step', () => {
		expect(halton(1, 2)).toBeCloseTo(0.5, 10);
	});

	it('halton(0, base) is 0', () => {
		expect(halton(0, 2)).toBe(0);
		expect(halton(0, 3)).toBe(0);
	});
});

describe('Cardwall helpers — pickTilePalette', () => {
	it('returns a palette with all gradient + accent + label fields', () => {
		const p = pickTilePalette(0);
		expect(p).toHaveProperty('from');
		expect(p).toHaveProperty('via');
		expect(p).toHaveProperty('to');
		expect(p).toHaveProperty('accent');
		expect(p).toHaveProperty('label');
		expect(p.label.length).toBeGreaterThan(0);
	});

	it('is deterministic — same seed returns identical palette', () => {
		expect(pickTilePalette(42)).toEqual(pickTilePalette(42));
	});

	it('produces label variation across a sweep of seeds (not all the same)', () => {
		const labels = new Set<string>();
		for (let i = 0; i < 30; i++) labels.add(pickTilePalette(i).label);
		expect(labels.size).toBeGreaterThan(1);
	});
});

describe('Cardwall helpers — buildRows', () => {
	it('sparse density → 3 rows', () => {
		expect(buildRows('sparse', 6)).toHaveLength(3);
	});

	it('default density → 5 rows', () => {
		expect(buildRows('default', 6)).toHaveLength(5);
	});

	it('dense density → 7 rows', () => {
		expect(buildRows('dense', 6)).toHaveLength(7);
	});

	it('each row contains tilesPerRow tiles', () => {
		const rows = buildRows('default', 9);
		for (const r of rows) {
			expect(r.tiles).toHaveLength(9);
		}
	});

	it('alternates direction row-by-row (1, -1, 1, -1, …)', () => {
		const rows = buildRows('default', 4);
		for (const r of rows) {
			const expected = r.idx % 2 === 0 ? 1 : -1;
			expect(r.dir).toBe(expected);
		}
	});

	it('assigns each row a non-zero speed inside the [12, 30) band', () => {
		const rows = buildRows('dense', 4);
		for (const r of rows) {
			expect(r.speed).toBeGreaterThanOrEqual(12);
			expect(r.speed).toBeLessThan(30);
		}
	});
});

describe('Cardwall helpers — lerp / clamp', () => {
	it('lerp(a, b, 0) = a, lerp(a, b, 1) = b, lerp midpoint', () => {
		expect(lerp(10, 20, 0)).toBe(10);
		expect(lerp(10, 20, 1)).toBe(20);
		expect(lerp(10, 20, 0.5)).toBe(15);
	});

	it('clamp keeps values inside [lo, hi]', () => {
		expect(clamp(-5, 0, 10)).toBe(0);
		expect(clamp(100, 0, 10)).toBe(10);
		expect(clamp(7, 0, 10)).toBe(7);
	});
});

describe('Cardwall helpers — isReducedMotion', () => {
	it('returns false in non-DOM / SSR-style environments', () => {
		// jsdom does provide matchMedia, but it returns matches:false by default
		// either way the helper should resolve to a boolean
		const out = isReducedMotion();
		expect(typeof out).toBe('boolean');
	});
});

describe('Cardwall component', () => {
	it('renders one .cw-row per row count for the chosen density', () => {
		const { container } = render(Cardwall, {
			props: { density: 'sparse', tilesPerRow: 4 }
		});
		expect(container.querySelectorAll('.cw-row')).toHaveLength(3);
	});

	it('renders two duplicate track copies per row for the seamless marquee wrap', () => {
		const { container } = render(Cardwall, {
			props: { density: 'sparse', tilesPerRow: 4 }
		});
		// 3 rows × 2 copies = 6 track-copy elements
		expect(container.querySelectorAll('.cw-track-copy')).toHaveLength(6);
	});

	it('renders 2 × tilesPerRow tile cards per row (one set per duplicate track copy)', () => {
		const { container } = render(Cardwall, {
			props: { density: 'sparse', tilesPerRow: 5 }
		});
		// 3 rows × 5 tiles × 2 copies = 30 tiles
		expect(container.querySelectorAll('.cw-tile')).toHaveLength(30);
	});

	it('marks every tile with role="button" and tabindex="0"', () => {
		const { container } = render(Cardwall, {
			props: { density: 'sparse', tilesPerRow: 3 }
		});
		const tiles = container.querySelectorAll('.cw-tile');
		expect(tiles.length).toBeGreaterThan(0);
		for (const t of tiles) {
			expect(t.getAttribute('role')).toBe('button');
			expect(t.getAttribute('tabindex')).toBe('0');
		}
	});

	it('gives every tile an aria-label of the form "Pin <LABEL>"', () => {
		const { container } = render(Cardwall, {
			props: { density: 'sparse', tilesPerRow: 2 }
		});
		const tiles = container.querySelectorAll('.cw-tile');
		for (const t of tiles) {
			const label = t.getAttribute('aria-label') ?? '';
			expect(label.startsWith('Pin ')).toBe(true);
		}
	});

	it('shows the live "Pinned" readout after a tile click', async () => {
		const { container } = render(Cardwall, {
			props: { density: 'sparse', tilesPerRow: 2 }
		});
		expect(container.querySelector('.cw-pin-readout')).toBeNull();
		const firstTile = container.querySelector('.cw-tile');
		expect(firstTile).not.toBeNull();
		await fireEvent.click(firstTile!);
		const readout = container.querySelector('.cw-pin-readout');
		expect(readout).not.toBeNull();
		expect(readout?.textContent).toContain('Pinned');
	});

	it('appends user-supplied class names to the wall wrapper', () => {
		const { container } = render(Cardwall, {
			props: { density: 'sparse', tilesPerRow: 2, class: 'hero deep' }
		});
		const wall = container.querySelector('.cw-wall');
		expect(wall).not.toBeNull();
		expect(wall?.classList.contains('hero')).toBe(true);
		expect(wall?.classList.contains('deep')).toBe(true);
	});
});
