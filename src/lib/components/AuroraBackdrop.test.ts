/**
 * ============================================================
 * AuroraBackdrop Tests
 * ============================================================
 *
 * Two layers:
 *  1. Pure helpers (pickPalette, ribbonConfig, buildRibbonGradient,
 *     isReducedMotion) — exported from the module-script. Pass
 *     deterministic input to assert maths and CSS strings exactly.
 *  2. Component render — mount the wall and confirm four ribbon
 *     elements + a single veil exist, the wrapper is decorative
 *     (aria-hidden), and the palette swap re-paints stops.
 *
 * 💡 Run `bun run test:ui` for a visual, filterable runner.
 * ============================================================
 */

import { render, cleanup } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import AuroraBackdrop, {
	buildRibbonGradient,
	isReducedMotion,
	pickPalette,
	ribbonConfig
} from './AuroraBackdrop.svelte';

afterEach(() => {
	cleanup();
});

describe('AuroraBackdrop helpers — pickPalette', () => {
	it('returns the named palette for "classic"', () => {
		const p = pickPalette('classic');
		expect(p.name).toBe('classic');
		expect(p.stops).toHaveLength(4);
		expect(p.base).toMatch(/^#/);
	});

	it('returns the "dawn" palette with rose/amber stops', () => {
		const p = pickPalette('dawn');
		expect(p.name).toBe('dawn');
		expect(p.stops).toContain('#f472b6');
		expect(p.stops).toContain('#fbbf24');
	});

	it('returns the "deep" palette with slate/cyan stops', () => {
		const p = pickPalette('deep');
		expect(p.name).toBe('deep');
		expect(p.stops).toContain('#0ea5e9');
		expect(p.stops).toContain('#312e81');
	});

	it('falls back to classic for unknown names (never throws)', () => {
		const p = pickPalette('nonsense');
		expect(p.name).toBe('classic');
	});

	it('falls back to classic for an empty string', () => {
		expect(pickPalette('').name).toBe('classic');
	});
});

describe('AuroraBackdrop helpers — ribbonConfig', () => {
	it('produces a config for each of the four ribbon indices', () => {
		for (let i = 0; i < 4; i++) {
			const c = ribbonConfig(i);
			expect(c.idx).toBe(i);
			expect(c.period).toBeGreaterThan(0);
			expect(['normal', 'reverse']).toContain(c.direction);
			expect(c.opacity).toBeGreaterThan(0);
			expect(c.opacity).toBeLessThanOrEqual(1);
		}
	});

	it('alternates direction so neighbouring ribbons swirl against each other', () => {
		expect(ribbonConfig(0).direction).toBe('normal');
		expect(ribbonConfig(1).direction).toBe('reverse');
		expect(ribbonConfig(2).direction).toBe('normal');
		expect(ribbonConfig(3).direction).toBe('reverse');
	});

	it('outer ribbons (idx 2, 3) are slightly fainter than inner ones', () => {
		expect(ribbonConfig(0).opacity).toBeGreaterThan(ribbonConfig(2).opacity);
		expect(ribbonConfig(1).opacity).toBeGreaterThan(ribbonConfig(3).opacity);
	});

	it('uses non-harmonic base periods (40, 65, 80, 110) so the composite never loops cleanly', () => {
		expect(ribbonConfig(0).period).toBe(40);
		expect(ribbonConfig(1).period).toBe(65);
		expect(ribbonConfig(2).period).toBe(80);
		expect(ribbonConfig(3).period).toBe(110);
	});

	it('intensity scales the period — intensity<1 speeds up, >1 slows down', () => {
		const fast = ribbonConfig(0, 0.5);
		const slow = ribbonConfig(0, 2);
		expect(fast.period).toBeLessThan(40);
		expect(slow.period).toBeGreaterThan(40);
	});

	it('clamps intensity to a sensible minimum so periods never collapse to ~0', () => {
		const tiny = ribbonConfig(0, 0);
		expect(tiny.period).toBeGreaterThan(0);
	});

	it('wraps out-of-range indices (idx=5 → 1, idx=-1 → 3)', () => {
		expect(ribbonConfig(5).idx).toBe(1);
		expect(ribbonConfig(-1).idx).toBe(3);
	});
});

describe('AuroraBackdrop helpers — buildRibbonGradient', () => {
	it('emits a conic-gradient string referencing every palette stop plus a wrap-around', () => {
		const palette = pickPalette('classic');
		const css = buildRibbonGradient(palette, 0);
		expect(css.startsWith('conic-gradient(')).toBe(true);
		for (const stop of palette.stops) {
			expect(css).toContain(stop);
		}
		// First stop appears twice — the wrap-around at the end keeps the seam invisible
		const occurrences = css.split(palette.stops[0]).length - 1;
		expect(occurrences).toBeGreaterThanOrEqual(2);
	});

	it('plants the gradient origin at the centre (50% 50%)', () => {
		const css = buildRibbonGradient(pickPalette('classic'), 0);
		expect(css).toContain('50% 50%');
	});

	it('honours the from-angle parameter — same palette, different starts produce different CSS', () => {
		const palette = pickPalette('classic');
		const a = buildRibbonGradient(palette, 0);
		const b = buildRibbonGradient(palette, 90);
		expect(a).not.toBe(b);
		expect(b).toContain('90deg');
	});
});

describe('AuroraBackdrop helpers — isReducedMotion', () => {
	it('returns a boolean in any environment (jsdom or non-DOM)', () => {
		expect(typeof isReducedMotion()).toBe('boolean');
	});
});

describe('AuroraBackdrop component', () => {
	it('renders four ribbon elements (one per layer)', () => {
		const { container } = render(AuroraBackdrop);
		expect(container.querySelectorAll('.ab-ribbon')).toHaveLength(4);
	});

	it('renders exactly one veil overlay for the corner-fade mask', () => {
		const { container } = render(AuroraBackdrop);
		expect(container.querySelectorAll('.ab-veil')).toHaveLength(1);
	});

	it('marks the wrapper as decorative (aria-hidden="true")', () => {
		const { container } = render(AuroraBackdrop);
		const root = container.querySelector('.ab-root');
		expect(root).not.toBeNull();
		expect(root?.getAttribute('aria-hidden')).toBe('true');
	});

	it('appends user-supplied class names to the wrapper', () => {
		const { container } = render(AuroraBackdrop, {
			props: { class: 'hero deep' }
		});
		const root = container.querySelector('.ab-root');
		expect(root?.classList.contains('hero')).toBe(true);
		expect(root?.classList.contains('deep')).toBe(true);
	});

	it('applies the requested palette via inline CSS variables', () => {
		const { container } = render(AuroraBackdrop, {
			props: { palette: 'dawn' }
		});
		const root = container.querySelector('.ab-root') as HTMLElement | null;
		expect(root).not.toBeNull();
		// dawn base is the very-dark plum
		expect(root?.getAttribute('style')).toContain('#1a0710');
	});

	it('paints each ribbon with a conic-gradient referencing the palette', () => {
		const { container } = render(AuroraBackdrop, {
			props: { palette: 'deep' }
		});
		const ribbons = container.querySelectorAll('.ab-ribbon');
		const palette = pickPalette('deep');
		for (const ribbon of ribbons) {
			const style = ribbon.getAttribute('style') ?? '';
			expect(style).toContain('conic-gradient');
			// at least one of the palette stops should appear in the CSS
			expect(palette.stops.some((s) => style.includes(s))).toBe(true);
		}
	});

	it('emits four distinct ribbon animation durations (matching ribbonConfig periods)', () => {
		const { container } = render(AuroraBackdrop);
		const ribbons = container.querySelectorAll('.ab-ribbon');
		const durations = Array.from(ribbons).map((r) => {
			const style = r.getAttribute('style') ?? '';
			const m = style.match(/animation-duration:\s*(\d+)s/);
			return m ? Number(m[1]) : NaN;
		});
		expect(new Set(durations).size).toBe(4);
		expect(durations).toEqual(expect.arrayContaining([40, 65, 80, 110]));
	});
});
