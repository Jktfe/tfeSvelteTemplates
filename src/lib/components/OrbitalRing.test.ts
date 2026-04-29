/**
 * ============================================================
 * OrbitalRing Tests
 * ============================================================
 *
 * Verifies the pure helpers (distribution, slot transform,
 * counter-rotation, direction validation, radius clamping,
 * reduced-motion detection) and a handful of render assertions
 * against the test harness fixture.
 *
 * Pure helpers are exercised through the module-script exports
 * — no rendering needed. Render tests use the harness with
 * autoSpin disabled so rAF never fires.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
	distributeAngles,
	slotTransform,
	contentRotation,
	pickDirection,
	clampRadius,
	isReducedMotion
} from './OrbitalRing.svelte';
import OrbitalRingTestHarness from './OrbitalRingTestHarness.test.svelte';

describe('distributeAngles', () => {
	it('returns evenly spaced angles starting at 0', () => {
		const angles = distributeAngles(4);
		expect(angles).toEqual([0, 90, 180, 270]);
	});

	it('honours startDeg', () => {
		const angles = distributeAngles(4, 45);
		expect(angles).toEqual([45, 135, 225, 315]);
	});

	it('returns 360-step single entry for count=1', () => {
		const angles = distributeAngles(1, 90);
		expect(angles).toEqual([90]);
	});

	it('returns empty array for count=0', () => {
		expect(distributeAngles(0)).toEqual([]);
	});

	it('returns empty array for negative count', () => {
		expect(distributeAngles(-3)).toEqual([]);
	});

	it('returns empty array for non-finite count', () => {
		expect(distributeAngles(NaN)).toEqual([]);
		expect(distributeAngles(Infinity)).toEqual([]);
	});

	it('coerces non-finite startDeg to 0', () => {
		expect(distributeAngles(3, NaN)).toEqual([0, 120, 240]);
	});

	it('handles 6 evenly distributed positions', () => {
		const angles = distributeAngles(6);
		expect(angles).toEqual([0, 60, 120, 180, 240, 300]);
	});
});

describe('slotTransform', () => {
	it('places item at the top for angle 0', () => {
		const transform = slotTransform(0, 100);
		expect(transform).toContain('rotate(0deg)');
		expect(transform).toContain('translateY(-100px)');
	});

	it('places item at 3 o\'clock for angle 90', () => {
		const transform = slotTransform(90, 100);
		expect(transform).toContain('rotate(90deg)');
		expect(transform).toContain('translateY(-100px)');
	});

	it('always begins with centring translate', () => {
		const transform = slotTransform(45, 200);
		expect(transform.startsWith('translate(-50%, -50%)')).toBe(true);
	});

	it('clamps negative radius to 0', () => {
		const transform = slotTransform(0, -50);
		expect(transform).toContain('translateY(0px)');
	});

	it('falls back for non-finite angle', () => {
		expect(slotTransform(NaN, 100)).toBe('translate(-50%, -50%)');
	});

	it('falls back for non-finite radius', () => {
		expect(slotTransform(0, Infinity)).toBe('translate(-50%, -50%)');
	});
});

describe('contentRotation', () => {
	it('returns -angle when not upright (ring-frame)', () => {
		expect(contentRotation(45, 90, false)).toBe(-45);
	});

	it('compensates angle plus ring rotation when upright', () => {
		expect(contentRotation(45, 90, true)).toBe(-135);
	});

	it('returns 0 when both inputs are 0 and upright', () => {
		expect(contentRotation(0, 0, true)).toBe(0);
	});

	it('coerces non-finite angle to 0', () => {
		expect(contentRotation(NaN, 30, true)).toBe(-30);
	});

	it('coerces non-finite ring rotation to 0', () => {
		expect(contentRotation(60, NaN, true)).toBe(-60);
	});

	it('non-upright ignores ring rotation entirely', () => {
		expect(contentRotation(60, 999, false)).toBe(-60);
	});
});

describe('pickDirection', () => {
	it('accepts clockwise', () => {
		expect(pickDirection('clockwise')).toBe('clockwise');
	});

	it('accepts counter-clockwise', () => {
		expect(pickDirection('counter-clockwise')).toBe('counter-clockwise');
	});

	it('falls back to clockwise for unknowns', () => {
		expect(pickDirection('widdershins')).toBe('clockwise');
		expect(pickDirection('')).toBe('clockwise');
	});
});

describe('clampRadius', () => {
	it('returns value when within bounds', () => {
		expect(clampRadius(100, 20, 2000)).toBe(100);
	});

	it('clamps below min', () => {
		expect(clampRadius(5, 20, 2000)).toBe(20);
	});

	it('clamps above max', () => {
		expect(clampRadius(5000, 20, 2000)).toBe(2000);
	});

	it('non-finite value falls back to min', () => {
		expect(clampRadius(NaN, 30, 500)).toBe(30);
	});

	it('falls back to min when bounds are inverted', () => {
		expect(clampRadius(100, 500, 200)).toBe(500);
	});

	it('handles default bounds', () => {
		expect(clampRadius(150)).toBe(150);
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

describe('OrbitalRing render', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'IntersectionObserver',
			class {
				observe() {}
				unobserve() {}
				disconnect() {}
			}
		);
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

	it('renders one slot per item with correct labels', () => {
		render(OrbitalRingTestHarness, {
			props: {
				items: [
					{ id: 1, label: 'alpha' },
					{ id: 2, label: 'beta' },
					{ id: 3, label: 'gamma' }
				]
			}
		});
		expect(screen.getByText('alpha')).toBeInTheDocument();
		expect(screen.getByText('beta')).toBeInTheDocument();
		expect(screen.getByText('gamma')).toBeInTheDocument();
	});

	it('marks the ring with role=list and items with role=listitem', () => {
		render(OrbitalRingTestHarness);
		const list = screen.getByRole('list');
		expect(list).toBeInTheDocument();
		const items = screen.getAllByRole('listitem');
		expect(items.length).toBe(4);
	});

	it('exposes data-direction on the host', () => {
		const { container } = render(OrbitalRingTestHarness, {
			props: { direction: 'counter-clockwise' }
		});
		const host = container.querySelector('.orbital-ring');
		expect(host?.getAttribute('data-direction')).toBe('counter-clockwise');
	});

	it('falls back to clockwise for unknown direction', () => {
		const { container } = render(OrbitalRingTestHarness, {
			props: { direction: 'widdershins' as 'clockwise' }
		});
		const host = container.querySelector('.orbital-ring');
		expect(host?.getAttribute('data-direction')).toBe('clockwise');
	});

	it('writes orbital-radius custom property based on prop', () => {
		const { container } = render(OrbitalRingTestHarness, {
			props: { radius: 250 }
		});
		const host = container.querySelector('.orbital-ring') as HTMLElement;
		expect(host.style.getPropertyValue('--orbital-radius')).toBe('250px');
	});

	it('clamps radius below minimum', () => {
		const { container } = render(OrbitalRingTestHarness, {
			props: { radius: 5 }
		});
		const host = container.querySelector('.orbital-ring') as HTMLElement;
		expect(host.style.getPropertyValue('--orbital-radius')).toBe('20px');
	});

	it('writes orbital-item-size custom property based on prop', () => {
		const { container } = render(OrbitalRingTestHarness, {
			props: { itemSize: 120 }
		});
		const host = container.querySelector('.orbital-ring') as HTMLElement;
		expect(host.style.getPropertyValue('--orbital-item-size')).toBe('120px');
	});

	it('renders empty ring with no items', () => {
		const { container } = render(OrbitalRingTestHarness, {
			props: { items: [] }
		});
		const items = container.querySelectorAll('.orbital-ring__slot');
		expect(items.length).toBe(0);
	});

	it('applies upright class when counterRotateItems=true', () => {
		const { container } = render(OrbitalRingTestHarness, {
			props: { counterRotateItems: true }
		});
		const upright = container.querySelectorAll('.orbital-ring__content--upright');
		expect(upright.length).toBe(4);
	});

	it('omits upright class when counterRotateItems=false', () => {
		const { container } = render(OrbitalRingTestHarness, {
			props: { counterRotateItems: false }
		});
		const upright = container.querySelectorAll('.orbital-ring__content--upright');
		expect(upright.length).toBe(0);
	});

	it('writes correct slot angles for 4 items at 0deg start', () => {
		const { container } = render(OrbitalRingTestHarness, {
			props: { startAngleDeg: 0 }
		});
		const slots = container.querySelectorAll('.orbital-ring__slot');
		expect(slots.length).toBe(4);
		expect((slots[0] as HTMLElement).style.getPropertyValue('--orbital-slot-angle')).toBe('0deg');
		expect((slots[1] as HTMLElement).style.getPropertyValue('--orbital-slot-angle')).toBe('90deg');
		expect((slots[2] as HTMLElement).style.getPropertyValue('--orbital-slot-angle')).toBe('180deg');
		expect((slots[3] as HTMLElement).style.getPropertyValue('--orbital-slot-angle')).toBe('270deg');
	});

	it('honours startAngleDeg', () => {
		const { container } = render(OrbitalRingTestHarness, {
			props: { startAngleDeg: 45 }
		});
		const slots = container.querySelectorAll('.orbital-ring__slot');
		expect((slots[0] as HTMLElement).style.getPropertyValue('--orbital-slot-angle')).toBe('45deg');
	});
});
