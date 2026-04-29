/**
 * ============================================================
 * Tilt3D Tests
 * ============================================================
 *
 * Two layers, mirroring the test split used elsewhere in the lib:
 *
 *   1. Pure helpers (rotationFromCursor, glarePositionFromCursor,
 *      clampTilt, springReset, isReducedMotion) — exported from the
 *      module-script. These run with no DOM.
 *
 *   2. Component render — mount via a small fixture harness and
 *      verify the wrapper writes the expected CSS custom properties,
 *      that pointer-move events update them, and that pointer-leave
 *      with each reset mode behaves as advertised.
 *
 * Pointer events go directly through dispatchEvent because jsdom
 * doesn't ship a pointer event helper. We stub getBoundingClientRect
 * on the wrapper so the math is deterministic regardless of layout.
 * ============================================================
 */

import { cleanup, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	clampTilt,
	glarePositionFromCursor,
	isReducedMotion,
	rotationFromCursor,
	springReset
} from './Tilt3D.svelte';
import Tilt3DTestHarness from './Tilt3DTestHarness.test.svelte';

afterEach(() => {
	cleanup();
});

// ============================================================
// 1. Pure helpers
// ============================================================

describe('Tilt3D helpers', () => {
	describe('clampTilt', () => {
		it('returns the angle unchanged when within range', () => {
			expect(clampTilt(5, 12)).toBe(5);
			expect(clampTilt(-7, 12)).toBe(-7);
			expect(clampTilt(0, 12)).toBe(0);
		});

		it('clamps positive overruns to max', () => {
			expect(clampTilt(20, 12)).toBe(12);
			expect(clampTilt(100, 5)).toBe(5);
		});

		it('clamps negative overruns to -max', () => {
			expect(clampTilt(-20, 12)).toBe(-12);
			expect(clampTilt(-100, 5)).toBe(-5);
		});

		it('returns 0 for non-finite angle', () => {
			expect(clampTilt(Number.NaN, 12)).toBe(0);
			expect(clampTilt(Number.POSITIVE_INFINITY, 12)).toBe(0);
		});

		it('returns 0 for non-positive max', () => {
			expect(clampTilt(5, 0)).toBe(0);
			expect(clampTilt(5, -3)).toBe(0);
			expect(clampTilt(5, Number.NaN)).toBe(0);
		});
	});

	describe('rotationFromCursor', () => {
		const rect = { left: 0, top: 0, width: 200, height: 100 };

		it('cursor at element centre → zero rotation', () => {
			const r = rotationFromCursor(100, 50, rect, 12);
			expect(r.rx).toBeCloseTo(0);
			expect(r.ry).toBeCloseTo(0);
		});

		it('cursor at top edge → top tilts forward (positive rx)', () => {
			const r = rotationFromCursor(100, 0, rect, 12);
			expect(r.rx).toBeCloseTo(12);
			expect(r.ry).toBeCloseTo(0);
		});

		it('cursor at bottom edge → top tilts back (negative rx)', () => {
			const r = rotationFromCursor(100, 100, rect, 12);
			expect(r.rx).toBeCloseTo(-12);
			expect(r.ry).toBeCloseTo(0);
		});

		it('cursor at right edge → right tilts back (positive ry)', () => {
			const r = rotationFromCursor(200, 50, rect, 12);
			expect(r.ry).toBeCloseTo(12);
			expect(r.rx).toBeCloseTo(0);
		});

		it('cursor at left edge → right tilts forward (negative ry)', () => {
			const r = rotationFromCursor(0, 50, rect, 12);
			expect(r.ry).toBeCloseTo(-12);
		});

		it('cursor far outside rect → clamps to ±maxTilt', () => {
			const r = rotationFromCursor(-1000, -1000, rect, 12);
			expect(r.rx).toBe(12);
			expect(r.ry).toBe(-12);
		});

		it('zero-sized rect returns zero rotation', () => {
			const r = rotationFromCursor(50, 50, { left: 0, top: 0, width: 0, height: 0 }, 12);
			expect(r.rx).toBe(0);
			expect(r.ry).toBe(0);
		});

		it('non-finite rect dimensions return zero rotation', () => {
			const r = rotationFromCursor(
				50,
				50,
				{ left: 0, top: 0, width: Number.NaN, height: 100 },
				12
			);
			expect(r.rx).toBe(0);
			expect(r.ry).toBe(0);
		});

		it('respects rect offset', () => {
			const offset = { left: 100, top: 200, width: 200, height: 100 };
			const r = rotationFromCursor(200, 250, offset, 12); // centre of offset rect
			expect(r.rx).toBeCloseTo(0);
			expect(r.ry).toBeCloseTo(0);
		});
	});

	describe('glarePositionFromCursor', () => {
		const rect = { left: 0, top: 0, width: 200, height: 100 };

		it('cursor at top-left corner → (0, 0)', () => {
			expect(glarePositionFromCursor(0, 0, rect)).toEqual({ x: 0, y: 0 });
		});

		it('cursor at centre → (0.5, 0.5)', () => {
			expect(glarePositionFromCursor(100, 50, rect)).toEqual({ x: 0.5, y: 0.5 });
		});

		it('cursor at bottom-right corner → (1, 1)', () => {
			expect(glarePositionFromCursor(200, 100, rect)).toEqual({ x: 1, y: 1 });
		});

		it('cursor outside rect clamps to [0, 1]', () => {
			expect(glarePositionFromCursor(-50, -50, rect)).toEqual({ x: 0, y: 0 });
			expect(glarePositionFromCursor(500, 500, rect)).toEqual({ x: 1, y: 1 });
		});

		it('zero-sized rect returns centre fallback', () => {
			const r = glarePositionFromCursor(0, 0, { left: 0, top: 0, width: 0, height: 0 });
			expect(r).toEqual({ x: 0.5, y: 0.5 });
		});

		it('respects rect offset', () => {
			const offset = { left: 100, top: 200, width: 200, height: 100 };
			expect(glarePositionFromCursor(200, 250, offset)).toEqual({ x: 0.5, y: 0.5 });
		});
	});

	describe('springReset', () => {
		it('moves toward the target by the damping fraction', () => {
			expect(springReset(10, 0, 0.1)).toBeCloseTo(9);
			expect(springReset(10, 0, 0.5)).toBeCloseTo(5);
		});

		it('damping=0 leaves current unchanged', () => {
			expect(springReset(10, 0, 0)).toBe(10);
		});

		it('damping=1 snaps to target immediately', () => {
			expect(springReset(10, 0, 1)).toBe(0);
			expect(springReset(-7, 4, 1)).toBe(4);
		});

		it('clamps damping above 1 to 1', () => {
			expect(springReset(10, 0, 5)).toBe(0);
		});

		it('clamps negative damping to 0', () => {
			expect(springReset(10, 0, -1)).toBe(10);
		});

		it('non-finite current returns 0', () => {
			expect(springReset(Number.NaN, 0, 0.15)).toBe(0);
		});

		it('non-finite target falls back to 0', () => {
			expect(springReset(10, Number.NaN, 0.5)).toBeCloseTo(5);
		});

		it('converges over multiple iterations', () => {
			let v = 12;
			// 12 * (1 - 0.15)^n falls under 0.05 at n ≈ 34. Fifty gives a safe margin.
			for (let i = 0; i < 50; i++) v = springReset(v, 0, 0.15);
			expect(Math.abs(v)).toBeLessThan(0.05);
		});
	});

	describe('isReducedMotion', () => {
		const original = globalThis.matchMedia;

		afterEach(() => {
			if (original) globalThis.matchMedia = original;
		});

		it('returns false when matchMedia is missing', () => {
			// @ts-expect-error — deliberately removing for the test
			delete globalThis.matchMedia;
			expect(isReducedMotion()).toBe(false);
		});

		it('returns true when prefers-reduced-motion: reduce matches', () => {
			globalThis.matchMedia = vi.fn().mockReturnValue({
				matches: true,
				media: '(prefers-reduced-motion: reduce)',
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			}) as unknown as typeof globalThis.matchMedia;
			expect(isReducedMotion()).toBe(true);
		});

		it('returns false when matchMedia throws', () => {
			globalThis.matchMedia = vi.fn(() => {
				throw new Error('not supported');
			}) as unknown as typeof globalThis.matchMedia;
			expect(isReducedMotion()).toBe(false);
		});
	});
});

// ============================================================
// 2. Component render — via the test harness fixture
// ============================================================

function setReducedMotion(matches: boolean) {
	const previous = globalThis.matchMedia;
	globalThis.matchMedia = vi.fn().mockReturnValue({
		matches,
		media: '(prefers-reduced-motion: reduce)',
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}) as unknown as typeof globalThis.matchMedia;
	return () => {
		if (previous) globalThis.matchMedia = previous;
	};
}

function stubRect(el: Element, rect: { left: number; top: number; width: number; height: number }) {
	el.getBoundingClientRect = () =>
		({
			left: rect.left,
			top: rect.top,
			right: rect.left + rect.width,
			bottom: rect.top + rect.height,
			width: rect.width,
			height: rect.height,
			x: rect.left,
			y: rect.top,
			toJSON() {
				return rect;
			}
		}) as DOMRect;
}

function fireMove(el: Element, clientX: number, clientY: number) {
	const evt = new Event('pointermove', { bubbles: true });
	Object.defineProperty(evt, 'clientX', { value: clientX });
	Object.defineProperty(evt, 'clientY', { value: clientY });
	el.dispatchEvent(evt);
}

function fireLeave(el: Element) {
	const evt = new Event('pointerleave', { bubbles: true });
	el.dispatchEvent(evt);
}

describe('Tilt3D component', () => {
	beforeEach(() => {
		// rAF stub so our spring loop is deterministic and we don't hit jsdom's lack of impl.
		vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
			cb(0);
			return 0;
		});
		vi.stubGlobal('cancelAnimationFrame', () => {});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('renders the wrapper with the child', async () => {
		const { container } = render(Tilt3DTestHarness);
		await tick();
		expect(container.querySelector('.tilt3d')).toBeTruthy();
		expect(container.querySelector('[data-testid="card"]')).toBeTruthy();
	});

	it('renders the glare layer when glare=true', async () => {
		const { container } = render(Tilt3DTestHarness, { props: { glare: true } });
		await tick();
		expect(container.querySelector('.tilt3d__glare')).toBeTruthy();
	});

	it('omits the glare layer when glare=false', async () => {
		const { container } = render(Tilt3DTestHarness, { props: { glare: false } });
		await tick();
		expect(container.querySelector('.tilt3d__glare')).toBeNull();
	});

	it('writes the perspective custom property', async () => {
		const { container } = render(Tilt3DTestHarness, { props: { perspective: 800 } });
		await tick();
		const wrap = container.querySelector('.tilt3d') as HTMLElement;
		expect(wrap.style.getPropertyValue('--tilt-perspective')).toBe('800px');
	});

	it('starts at zero rotation', async () => {
		const { container } = render(Tilt3DTestHarness);
		await tick();
		const wrap = container.querySelector('.tilt3d') as HTMLElement;
		expect(wrap.style.getPropertyValue('--tilt-rx')).toBe('0deg');
		expect(wrap.style.getPropertyValue('--tilt-ry')).toBe('0deg');
	});

	it('updates rotation custom properties on pointer move', async () => {
		const { container } = render(Tilt3DTestHarness, { props: { maxTilt: 10 } });
		await tick();
		const wrap = container.querySelector('.tilt3d') as HTMLElement;
		stubRect(wrap, { left: 0, top: 0, width: 200, height: 100 });

		// Cursor at centre → still zero.
		fireMove(wrap, 100, 50);
		await tick();
		expect(parseFloat(wrap.style.getPropertyValue('--tilt-rx'))).toBeCloseTo(0);
		expect(parseFloat(wrap.style.getPropertyValue('--tilt-ry'))).toBeCloseTo(0);

		// Cursor at top-left → max positive rx, max negative ry.
		fireMove(wrap, 0, 0);
		await tick();
		expect(parseFloat(wrap.style.getPropertyValue('--tilt-rx'))).toBeCloseTo(10);
		expect(parseFloat(wrap.style.getPropertyValue('--tilt-ry'))).toBeCloseTo(-10);
	});

	it('updates glare position custom properties on pointer move', async () => {
		const { container } = render(Tilt3DTestHarness);
		await tick();
		const wrap = container.querySelector('.tilt3d') as HTMLElement;
		stubRect(wrap, { left: 0, top: 0, width: 200, height: 100 });

		fireMove(wrap, 200, 100); // bottom-right
		await tick();
		expect(wrap.style.getPropertyValue('--glare-x')).toBe('100%');
		expect(wrap.style.getPropertyValue('--glare-y')).toBe('100%');
	});

	it('applies tilt3d--active class while the cursor is inside', async () => {
		const { container } = render(Tilt3DTestHarness);
		await tick();
		const wrap = container.querySelector('.tilt3d') as HTMLElement;
		stubRect(wrap, { left: 0, top: 0, width: 200, height: 100 });

		fireMove(wrap, 50, 25);
		await tick();
		expect(wrap.classList.contains('tilt3d--active')).toBe(true);
	});

	it('reset="instant" snaps rotation to zero on pointer leave', async () => {
		const { container } = render(Tilt3DTestHarness, { props: { reset: 'instant' } });
		await tick();
		const wrap = container.querySelector('.tilt3d') as HTMLElement;
		stubRect(wrap, { left: 0, top: 0, width: 200, height: 100 });

		fireMove(wrap, 0, 0);
		await tick();
		expect(parseFloat(wrap.style.getPropertyValue('--tilt-rx'))).not.toBeCloseTo(0);

		fireLeave(wrap);
		await tick();
		expect(parseFloat(wrap.style.getPropertyValue('--tilt-rx'))).toBeCloseTo(0);
		expect(parseFloat(wrap.style.getPropertyValue('--tilt-ry'))).toBeCloseTo(0);
		expect(wrap.classList.contains('tilt3d--active')).toBe(false);
	});

	it('reset="none" leaves rotation at the last position on pointer leave', async () => {
		const { container } = render(Tilt3DTestHarness, { props: { reset: 'none' } });
		await tick();
		const wrap = container.querySelector('.tilt3d') as HTMLElement;
		stubRect(wrap, { left: 0, top: 0, width: 200, height: 100 });

		fireMove(wrap, 0, 0);
		await tick();
		const rxBefore = parseFloat(wrap.style.getPropertyValue('--tilt-rx'));
		expect(rxBefore).not.toBeCloseTo(0);

		fireLeave(wrap);
		await tick();
		expect(parseFloat(wrap.style.getPropertyValue('--tilt-rx'))).toBeCloseTo(rxBefore);
	});

	it('reset="spring" eases rotation back toward zero on pointer leave', async () => {
		const { container } = render(Tilt3DTestHarness, { props: { reset: 'spring' } });
		await tick();
		const wrap = container.querySelector('.tilt3d') as HTMLElement;
		stubRect(wrap, { left: 0, top: 0, width: 200, height: 100 });

		fireMove(wrap, 0, 0);
		await tick();
		fireLeave(wrap);
		await tick();
		// With our rAF stub firing synchronously, the spring loop runs to completion.
		expect(parseFloat(wrap.style.getPropertyValue('--tilt-rx'))).toBeCloseTo(0);
		expect(parseFloat(wrap.style.getPropertyValue('--tilt-ry'))).toBeCloseTo(0);
	});

	it('reduced-motion: pointer move does not update rotation', async () => {
		const restore = setReducedMotion(true);
		try {
			const { container } = render(Tilt3DTestHarness);
			await tick();
			const wrap = container.querySelector('.tilt3d') as HTMLElement;
			stubRect(wrap, { left: 0, top: 0, width: 200, height: 100 });

			fireMove(wrap, 0, 0);
			await tick();
			expect(parseFloat(wrap.style.getPropertyValue('--tilt-rx'))).toBe(0);
			expect(parseFloat(wrap.style.getPropertyValue('--tilt-ry'))).toBe(0);
			expect(wrap.classList.contains('tilt3d--reduced')).toBe(true);
		} finally {
			restore();
		}
	});
});
