/**
 * ============================================================
 * MeshGradient Tests
 * ============================================================
 *
 * Verifies the pure helpers (palette pickers, blob layout maths,
 * clamps, animation timing, reduced-motion detection) and a set
 * of render assertions against the test harness fixture.
 *
 * Pure helpers run module-side so we exercise them through the
 * MeshGradient.svelte module exports — no rendering needed.
 * Render tests use the harness with deterministic props so
 * selector counts and custom-property values stay stable.
 * ============================================================
 */

import { render } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
	pickPalette,
	getPaletteColors,
	clamp01,
	clampPositive,
	clampInt,
	blobPosition,
	blobAnimation,
	blobColor,
	blobSize,
	buildBlobLayout,
	isReducedMotion
} from './MeshGradient.svelte';
import MeshGradientTestHarness from './MeshGradientTestHarness.test.svelte';

describe('pickPalette', () => {
	it('accepts each named palette', () => {
		expect(pickPalette('sunset')).toBe('sunset');
		expect(pickPalette('aurora')).toBe('aurora');
		expect(pickPalette('ember')).toBe('ember');
		expect(pickPalette('cosmic')).toBe('cosmic');
		expect(pickPalette('mint')).toBe('mint');
		expect(pickPalette('monochrome')).toBe('monochrome');
	});

	it('falls back to sunset for unknown names', () => {
		expect(pickPalette('grumpy')).toBe('sunset');
		expect(pickPalette('')).toBe('sunset');
		expect(pickPalette('SUNSET')).toBe('sunset');
	});
});

describe('getPaletteColors', () => {
	it('returns 5 colours for each named palette', () => {
		expect(getPaletteColors('sunset')).toHaveLength(5);
		expect(getPaletteColors('aurora')).toHaveLength(5);
		expect(getPaletteColors('ember')).toHaveLength(5);
		expect(getPaletteColors('cosmic')).toHaveLength(5);
		expect(getPaletteColors('mint')).toHaveLength(5);
		expect(getPaletteColors('monochrome')).toHaveLength(5);
	});

	it('returns sunset colours for unknown palette', () => {
		expect(getPaletteColors('grumpy')).toEqual(getPaletteColors('sunset'));
	});

	it('returns hex strings starting with #', () => {
		const colors = getPaletteColors('aurora');
		colors.forEach((c) => {
			expect(c).toMatch(/^#[0-9a-fA-F]{6}$/);
		});
	});
});

describe('clamp01', () => {
	it('returns 0 at lower bound', () => {
		expect(clamp01(0)).toBe(0);
	});

	it('returns 1 at upper bound', () => {
		expect(clamp01(1)).toBe(1);
	});

	it('passes through values inside range', () => {
		expect(clamp01(0.5)).toBe(0.5);
		expect(clamp01(0.7)).toBe(0.7);
	});

	it('clamps negatives to 0', () => {
		expect(clamp01(-1)).toBe(0);
		expect(clamp01(-0.5)).toBe(0);
	});

	it('clamps values >1 to 1', () => {
		expect(clamp01(1.5)).toBe(1);
		expect(clamp01(100)).toBe(1);
	});

	it('coerces non-finite to 0', () => {
		expect(clamp01(NaN)).toBe(0);
		expect(clamp01(Infinity)).toBe(0);
		expect(clamp01(-Infinity)).toBe(0);
	});
});

describe('clampPositive', () => {
	it('passes through positive numbers', () => {
		expect(clampPositive(5)).toBe(5);
		expect(clampPositive(80)).toBe(80);
	});

	it('clamps negatives to 0', () => {
		expect(clampPositive(-5)).toBe(0);
	});

	it('returns fallback for non-finite', () => {
		expect(clampPositive(NaN, 80)).toBe(80);
		expect(clampPositive(Infinity, 80)).toBe(80);
	});

	it('returns 0 when fallback is missing for non-finite', () => {
		expect(clampPositive(NaN)).toBe(0);
	});

	it('clamps negative fallback to 0', () => {
		expect(clampPositive(NaN, -10)).toBe(0);
	});
});

describe('clampInt', () => {
	it('floors fractional values', () => {
		expect(clampInt(3.7, 1, 12)).toBe(3);
	});

	it('clamps below min', () => {
		expect(clampInt(0, 1, 12)).toBe(1);
		expect(clampInt(-5, 1, 12)).toBe(1);
	});

	it('clamps above max', () => {
		expect(clampInt(20, 1, 12)).toBe(12);
	});

	it('passes through values inside range', () => {
		expect(clampInt(5, 1, 12)).toBe(5);
	});

	it('returns min for non-finite', () => {
		expect(clampInt(NaN, 1, 12)).toBe(1);
		expect(clampInt(Infinity, 1, 12)).toBe(1);
	});
});

describe('blobPosition', () => {
	it('returns centre for single blob', () => {
		expect(blobPosition(0, 1)).toEqual({ xPercent: 50, yPercent: 50 });
	});

	it('returns centre for out-of-range index', () => {
		expect(blobPosition(5, 3)).toEqual({ xPercent: 50, yPercent: 50 });
		expect(blobPosition(-1, 3)).toEqual({ xPercent: 50, yPercent: 50 });
	});

	it('returns centre for non-finite inputs', () => {
		expect(blobPosition(NaN, 3)).toEqual({ xPercent: 50, yPercent: 50 });
		expect(blobPosition(0, NaN)).toEqual({ xPercent: 50, yPercent: 50 });
	});

	it('returns centre for invalid count', () => {
		expect(blobPosition(0, 0)).toEqual({ xPercent: 50, yPercent: 50 });
		expect(blobPosition(0, -1)).toEqual({ xPercent: 50, yPercent: 50 });
	});

	it('keeps positions inside [12, 88] for any valid index/count', () => {
		// radiusPercent=38, so positions stay inside 50±38 = [12, 88]
		for (let count = 1; count <= 12; count += 1) {
			for (let i = 0; i < count; i += 1) {
				const p = blobPosition(i, count);
				expect(p.xPercent).toBeGreaterThanOrEqual(12);
				expect(p.xPercent).toBeLessThanOrEqual(88);
				expect(p.yPercent).toBeGreaterThanOrEqual(12);
				expect(p.yPercent).toBeLessThanOrEqual(88);
			}
		}
	});

	it('produces distinct positions for distinct indices', () => {
		const positions = [0, 1, 2, 3, 4].map((i) => blobPosition(i, 5));
		const seen = new Set<string>();
		positions.forEach((p) => {
			seen.add(`${p.xPercent.toFixed(2)},${p.yPercent.toFixed(2)}`);
		});
		expect(seen.size).toBe(5);
	});

	it('floors fractional indices', () => {
		const a = blobPosition(2, 5);
		const b = blobPosition(2.7, 5);
		expect(a).toEqual(b);
	});
});

describe('blobAnimation', () => {
	it('first blob runs at base duration with zero delay', () => {
		const a = blobAnimation(0, 5);
		expect(a.durationMs).toBe(18000);
		expect(a.delayMs).toBe(0);
	});

	it('subsequent blobs run slower', () => {
		const a = blobAnimation(0, 5);
		const b = blobAnimation(1, 5);
		const c = blobAnimation(2, 5);
		expect(b.durationMs).toBeGreaterThan(a.durationMs);
		expect(c.durationMs).toBeGreaterThan(b.durationMs);
	});

	it('produces negative delays so blobs start mid-cycle', () => {
		const a = blobAnimation(2, 5);
		expect(a.delayMs).toBeLessThan(0);
	});

	it('honours custom base duration', () => {
		const a = blobAnimation(0, 5, 30000);
		expect(a.durationMs).toBe(30000);
	});

	it('clamps base duration to 1000ms minimum', () => {
		const a = blobAnimation(0, 5, 100);
		expect(a.durationMs).toBe(1000);
	});

	it('returns safe defaults for non-finite index', () => {
		const a = blobAnimation(NaN, 5);
		expect(a.durationMs).toBe(18000);
		expect(a.delayMs).toBe(0);
	});

	it('returns safe defaults for negative index', () => {
		const a = blobAnimation(-1, 5);
		expect(a.delayMs).toBe(0);
	});
});

describe('blobColor', () => {
	it('returns the i-th palette colour', () => {
		const colors = getPaletteColors('sunset');
		expect(blobColor(0, 'sunset')).toBe(colors[0]);
		expect(blobColor(1, 'sunset')).toBe(colors[1]);
	});

	it('cycles past palette length', () => {
		const colors = getPaletteColors('aurora');
		expect(blobColor(colors.length, 'aurora')).toBe(colors[0]);
		expect(blobColor(colors.length + 1, 'aurora')).toBe(colors[1]);
	});

	it('falls back to sunset for unknown palette', () => {
		const sunset = getPaletteColors('sunset');
		expect(blobColor(0, 'grumpy')).toBe(sunset[0]);
	});

	it('coerces non-finite index to 0', () => {
		const sunset = getPaletteColors('sunset');
		expect(blobColor(NaN, 'sunset')).toBe(sunset[0]);
	});

	it('takes absolute value of negative index', () => {
		const sunset = getPaletteColors('sunset');
		expect(blobColor(-1, 'sunset')).toBe(sunset[1]);
	});
});

describe('blobSize', () => {
	it('returns 90 for single blob', () => {
		expect(blobSize(1)).toBe(90);
	});

	it('shrinks as count grows', () => {
		const s1 = blobSize(1);
		const s5 = blobSize(5);
		const s12 = blobSize(12);
		expect(s5).toBeLessThan(s1);
		expect(s12).toBeLessThan(s5);
	});

	it('stays inside [40, 90]', () => {
		for (let count = 1; count <= 12; count += 1) {
			const s = blobSize(count);
			expect(s).toBeGreaterThanOrEqual(40);
			expect(s).toBeLessThanOrEqual(90);
		}
	});

	it('returns safe default for invalid count', () => {
		expect(blobSize(0)).toBe(70);
		expect(blobSize(NaN)).toBe(70);
	});
});

describe('buildBlobLayout', () => {
	it('returns one entry per blob', () => {
		expect(buildBlobLayout(3, 'sunset')).toHaveLength(3);
		expect(buildBlobLayout(7, 'aurora')).toHaveLength(7);
	});

	it('clamps blob count to [1, 12]', () => {
		expect(buildBlobLayout(0, 'sunset')).toHaveLength(1);
		expect(buildBlobLayout(20, 'sunset')).toHaveLength(12);
	});

	it('cycles colours from the active palette', () => {
		const layout = buildBlobLayout(5, 'sunset');
		const expected = getPaletteColors('sunset');
		layout.forEach((blob, i) => {
			expect(blob.color).toBe(expected[i % expected.length]);
		});
	});

	it('falls back to sunset palette for unknown name', () => {
		const layout = buildBlobLayout(3, 'grumpy');
		const expected = getPaletteColors('sunset');
		layout.forEach((blob, i) => {
			expect(blob.color).toBe(expected[i % expected.length]);
		});
	});

	it('positions stay within [12, 88]', () => {
		const layout = buildBlobLayout(6, 'cosmic');
		layout.forEach((blob) => {
			expect(blob.xPercent).toBeGreaterThanOrEqual(12);
			expect(blob.xPercent).toBeLessThanOrEqual(88);
		});
	});

	it('every blob carries a positive duration and a delay ≤0', () => {
		const layout = buildBlobLayout(5, 'sunset');
		layout.forEach((blob) => {
			expect(blob.durationMs).toBeGreaterThan(0);
			expect(blob.delayMs).toBeLessThanOrEqual(0);
		});
	});
});

describe('isReducedMotion', () => {
	const originalMatchMedia = (
		globalThis as { matchMedia?: typeof window.matchMedia }
	).matchMedia;

	afterEach(() => {
		if (typeof window !== 'undefined') {
			(window as unknown as { matchMedia?: typeof window.matchMedia }).matchMedia =
				originalMatchMedia;
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

describe('MeshGradient render', () => {
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

	it('renders one blob per blobCount (5 by default)', () => {
		const { container } = render(MeshGradientTestHarness, {
			props: { blobCount: 5 }
		});
		const blobs = container.querySelectorAll('.mesh-gradient__blob');
		expect(blobs.length).toBe(5);
	});

	it('renders with explicit blob count of 8', () => {
		const { container } = render(MeshGradientTestHarness, {
			props: { blobCount: 8 }
		});
		const blobs = container.querySelectorAll('.mesh-gradient__blob');
		expect(blobs.length).toBe(8);
	});

	it('clamps blobCount=0 up to 1', () => {
		const { container } = render(MeshGradientTestHarness, {
			props: { blobCount: 0 }
		});
		const blobs = container.querySelectorAll('.mesh-gradient__blob');
		expect(blobs.length).toBe(1);
	});

	it('clamps blobCount=20 down to 12', () => {
		const { container } = render(MeshGradientTestHarness, {
			props: { blobCount: 20 }
		});
		const blobs = container.querySelectorAll('.mesh-gradient__blob');
		expect(blobs.length).toBe(12);
	});

	it('writes data-palette on the host', () => {
		const { container } = render(MeshGradientTestHarness, {
			props: { palette: 'aurora' }
		});
		const host = container.querySelector('.mesh-gradient');
		expect(host?.getAttribute('data-palette')).toBe('aurora');
	});

	it('falls back to sunset palette for unknown name', () => {
		const { container } = render(MeshGradientTestHarness, {
			props: { palette: 'grumpy' }
		});
		const host = container.querySelector('.mesh-gradient');
		expect(host?.getAttribute('data-palette')).toBe('sunset');
	});

	it('writes mesh-blur custom property based on blur prop', () => {
		const { container } = render(MeshGradientTestHarness, {
			props: { blur: 100 }
		});
		const host = container.querySelector('.mesh-gradient') as HTMLElement;
		expect(host.style.getPropertyValue('--mesh-blur')).toBe('100px');
	});

	it('clamps negative blur to 0', () => {
		const { container } = render(MeshGradientTestHarness, {
			props: { blur: -50 }
		});
		const host = container.querySelector('.mesh-gradient') as HTMLElement;
		expect(host.style.getPropertyValue('--mesh-blur')).toBe('0px');
	});

	it('writes mesh-opacity custom property based on opacity prop', () => {
		const { container } = render(MeshGradientTestHarness, {
			props: { opacity: 0.5 }
		});
		const host = container.querySelector('.mesh-gradient') as HTMLElement;
		expect(host.style.getPropertyValue('--mesh-opacity')).toBe('0.5');
	});

	it('clamps opacity above 1 to 1', () => {
		const { container } = render(MeshGradientTestHarness, {
			props: { opacity: 5 }
		});
		const host = container.querySelector('.mesh-gradient') as HTMLElement;
		expect(host.style.getPropertyValue('--mesh-opacity')).toBe('1');
	});

	it('writes mesh-speed of 0 when speed=0', () => {
		const { container } = render(MeshGradientTestHarness, {
			props: { speed: 0 }
		});
		const host = container.querySelector('.mesh-gradient') as HTMLElement;
		expect(host.style.getPropertyValue('--mesh-speed')).toBe('0');
	});

	it('inverts speed for inline custom property (speed=2 → 0.5)', () => {
		const { container } = render(MeshGradientTestHarness, {
			props: { speed: 2 }
		});
		const host = container.querySelector('.mesh-gradient') as HTMLElement;
		expect(host.style.getPropertyValue('--mesh-speed')).toBe('0.5');
	});

	it('exposes role="presentation" on the host', () => {
		const { container } = render(MeshGradientTestHarness);
		const host = container.querySelector('.mesh-gradient');
		expect(host?.getAttribute('role')).toBe('presentation');
	});

	it('writes blob-color custom property on each blob', () => {
		const { container } = render(MeshGradientTestHarness, {
			props: { blobCount: 3, palette: 'sunset' }
		});
		const blobs = container.querySelectorAll<HTMLElement>('.mesh-gradient__blob');
		const expected = getPaletteColors('sunset');
		blobs.forEach((blob, i) => {
			expect(blob.style.getPropertyValue('--blob-color')).toBe(expected[i]);
		});
	});

	it('writes blob-x and blob-y as percentages on each blob', () => {
		const { container } = render(MeshGradientTestHarness, {
			props: { blobCount: 3 }
		});
		const blobs = container.querySelectorAll<HTMLElement>('.mesh-gradient__blob');
		blobs.forEach((blob) => {
			expect(blob.style.getPropertyValue('--blob-x')).toMatch(/^[0-9.]+%$/);
			expect(blob.style.getPropertyValue('--blob-y')).toMatch(/^[0-9.]+%$/);
		});
	});

	it('writes data-index attribute reflecting blob position', () => {
		const { container } = render(MeshGradientTestHarness, {
			props: { blobCount: 4 }
		});
		const blobs = container.querySelectorAll<HTMLElement>('.mesh-gradient__blob');
		blobs.forEach((blob, i) => {
			expect(blob.dataset.index).toBe(String(i));
		});
	});

	it('forwards extra class onto the host', () => {
		const { container } = render(MeshGradientTestHarness, {
			props: { class: 'custom-mesh' }
		});
		const host = container.querySelector('.mesh-gradient');
		expect(host?.classList.contains('custom-mesh')).toBe(true);
	});
});
