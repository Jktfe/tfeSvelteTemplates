/**
 * ============================================================
 * Pendulum Tests
 * ============================================================
 *
 * Two layers, mirroring the test split used elsewhere in the lib:
 *
 *   1. Pure helpers (dampedSine, nextAngle, clampSwing, pickTrigger,
 *      pivotOffsetCSS, isReducedMotion) — exported from the module-script.
 *      These run with no DOM.
 *
 *   2. Component render — mount via a small fixture harness and
 *      verify the wrapper applies the expected attributes, the
 *      transform-origin from the pivot offset, and that the trigger
 *      modes wire up correctly.
 *
 * rAF is stubbed to fire synchronously so the dampedSine tick loop
 * runs to completion in a single tick — that means we can assert on
 * the resting state (angle === 0) without needing real time.
 * ============================================================
 */

import { cleanup, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	clampSwing,
	dampedSine,
	isReducedMotion,
	nextAngle,
	pickTrigger,
	pivotOffsetCSS
} from './Pendulum.svelte';
import PendulumTestHarness from './PendulumTestHarness.test.svelte';

afterEach(() => {
	cleanup();
});

// ============================================================
// 1. Pure helpers
// ============================================================

describe('Pendulum helpers', () => {
	describe('dampedSine', () => {
		it('at t=0 returns amplitude (cos(0)·exp(0) = 1)', () => {
			expect(dampedSine(0, 18, 1.2, 1.4)).toBeCloseTo(18);
			expect(dampedSine(0, 30, 2, 1)).toBeCloseTo(30);
		});

		it('amplitude=0 always returns 0', () => {
			expect(dampedSine(0, 0, 1.2, 1.4)).toBe(0);
			expect(dampedSine(1, 0, 1.2, 1.4)).toBe(0);
			expect(dampedSine(5, 0, 1.2, 1.4)).toBe(0);
		});

		it('decays toward zero as t grows', () => {
			const a0 = Math.abs(dampedSine(0, 18, 1.2, 1.4));
			const a3 = Math.abs(dampedSine(3, 18, 1.2, 1.4));
			const a10 = Math.abs(dampedSine(10, 18, 1.2, 1.4));
			expect(a3).toBeLessThan(a0);
			expect(a10).toBeLessThan(a3);
			expect(a10).toBeLessThan(0.05); // well-damped
		});

		it('higher decay reaches halt threshold sooner', () => {
			const slowAt2 = Math.abs(dampedSine(2, 18, 1.2, 0.5));
			const fastAt2 = Math.abs(dampedSine(2, 18, 1.2, 3));
			expect(fastAt2).toBeLessThan(slowAt2);
		});

		it('phase: at frequency=1Hz, t=0.5 should be at -amplitude·envelope (cos(π)=-1)', () => {
			const result = dampedSine(0.5, 10, 1, 0); // no decay
			expect(result).toBeCloseTo(-10);
		});

		it('returns 0 for negative t', () => {
			expect(dampedSine(-1, 18, 1.2, 1.4)).toBe(0);
		});

		it('returns 0 for non-finite inputs', () => {
			expect(dampedSine(Number.NaN, 18, 1.2, 1.4)).toBe(0);
			expect(dampedSine(0, Number.NaN, 1.2, 1.4)).toBe(0);
			expect(dampedSine(0, 18, Number.NaN, 1.4)).toBe(0);
			expect(dampedSine(0, 18, 1.2, Number.NaN)).toBe(0);
			expect(dampedSine(Number.POSITIVE_INFINITY, 18, 1.2, 1.4)).toBe(0);
		});
	});

	describe('nextAngle', () => {
		it('returns the same state when deltaT is zero or negative', () => {
			const state = { angle: 10, velocity: 5 };
			expect(nextAngle(state, 0, 9.8, 0.5)).toBe(state);
			expect(nextAngle(state, -0.1, 9.8, 0.5)).toBe(state);
		});

		it('returns the same state when deltaT is non-finite', () => {
			const state = { angle: 10, velocity: 5 };
			expect(nextAngle(state, Number.NaN, 9.8, 0.5)).toBe(state);
		});

		it('damping reduces velocity magnitude over a step', () => {
			const state = { angle: 0, velocity: 10 };
			const next = nextAngle(state, 0.016, 0, 5); // gravity zero, only damping
			expect(Math.abs(next.velocity)).toBeLessThan(10);
		});

		it('positive angle pulls velocity toward zero (restoring force)', () => {
			const state = { angle: 30, velocity: 0 };
			const next = nextAngle(state, 0.016, 9.8, 0);
			expect(next.velocity).toBeLessThan(0); // negative velocity = swinging back to zero
		});

		it('does not mutate the input state', () => {
			const state = { angle: 10, velocity: 5 };
			const before = { ...state };
			nextAngle(state, 0.016, 9.8, 0.5);
			expect(state).toEqual(before);
		});
	});

	describe('clampSwing', () => {
		it('returns the angle unchanged when within range', () => {
			expect(clampSwing(5, 12)).toBe(5);
			expect(clampSwing(-7, 12)).toBe(-7);
			expect(clampSwing(0, 12)).toBe(0);
		});

		it('clamps positive overruns to max', () => {
			expect(clampSwing(20, 12)).toBe(12);
			expect(clampSwing(100, 5)).toBe(5);
		});

		it('clamps negative overruns to -max', () => {
			expect(clampSwing(-20, 12)).toBe(-12);
			expect(clampSwing(-100, 5)).toBe(-5);
		});

		it('returns 0 for non-finite angle', () => {
			expect(clampSwing(Number.NaN, 12)).toBe(0);
			expect(clampSwing(Number.POSITIVE_INFINITY, 12)).toBe(0);
		});

		it('returns 0 for non-positive max', () => {
			expect(clampSwing(5, 0)).toBe(0);
			expect(clampSwing(5, -3)).toBe(0);
			expect(clampSwing(5, Number.NaN)).toBe(0);
		});
	});

	describe('pickTrigger', () => {
		it('returns the trigger name when valid', () => {
			expect(pickTrigger('mount')).toBe('mount');
			expect(pickTrigger('viewport')).toBe('viewport');
			expect(pickTrigger('click')).toBe('click');
			expect(pickTrigger('manual')).toBe('manual');
		});

		it('falls back to mount on unknown input', () => {
			expect(pickTrigger('hover')).toBe('mount');
			expect(pickTrigger('')).toBe('mount');
			expect(pickTrigger('random-string')).toBe('mount');
		});
	});

	describe('pivotOffsetCSS', () => {
		it('zero offset returns "50% 50%"', () => {
			expect(pivotOffsetCSS({ x: 0, y: 0 })).toBe('50% 50%');
		});

		it('positive offset uses calc(50% + Npx)', () => {
			expect(pivotOffsetCSS({ x: 10, y: 20 })).toBe('calc(50% + 10px) calc(50% + 20px)');
		});

		it('negative offset uses calc(50% + -Npx)', () => {
			expect(pivotOffsetCSS({ x: -10, y: -40 })).toBe('calc(50% + -10px) calc(50% + -40px)');
		});

		it('mixed sign is preserved', () => {
			expect(pivotOffsetCSS({ x: 10, y: -40 })).toBe('calc(50% + 10px) calc(50% + -40px)');
		});

		it('non-finite values fall back to centre', () => {
			expect(pivotOffsetCSS({ x: Number.NaN, y: 0 })).toBe('50% 50%');
			expect(pivotOffsetCSS({ x: 0, y: Number.POSITIVE_INFINITY })).toBe('50% 50%');
		});

		it('null/undefined offset falls back to centre', () => {
			expect(pivotOffsetCSS(null as unknown as { x: number; y: number })).toBe('50% 50%');
			expect(pivotOffsetCSS(undefined as unknown as { x: number; y: number })).toBe('50% 50%');
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

		it('returns false when prefers-reduced-motion: reduce does not match', () => {
			globalThis.matchMedia = vi.fn().mockReturnValue({
				matches: false,
				media: '(prefers-reduced-motion: reduce)',
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
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

describe('Pendulum component', () => {
	beforeEach(() => {
		// rAF stub: advances a virtual clock by 5s per call. The first
		// call sets startTs; the second call sees elapsed=5000ms which
		// pushes the envelope below 0.05° (with default decay=1.4), so
		// the tick loop's halt branch runs and we settle at angle=0.
		// A 200-call safety cap protects us if a future change broke
		// the halt condition — the test would still terminate.
		let virtualTime = 0;
		let callCount = 0;
		vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
			callCount++;
			if (callCount > 200) return 0;
			virtualTime += 5000;
			cb(virtualTime);
			return callCount;
		});
		vi.stubGlobal('cancelAnimationFrame', () => {});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('renders the wrapper with the child', async () => {
		const { container } = render(PendulumTestHarness);
		await tick();
		expect(container.querySelector('.pendulum')).toBeTruthy();
		expect(container.querySelector('[data-testid="bell"]')).toBeTruthy();
	});

	it('applies the transform-origin from pivotOffset', async () => {
		const { container } = render(PendulumTestHarness, {
			props: { pivotOffset: { x: 0, y: -40 } }
		});
		await tick();
		const wrap = container.querySelector('.pendulum') as HTMLElement;
		expect(wrap.style.transformOrigin).toContain('calc(50% + -40px)');
	});

	it('zero pivotOffset → 50% 50% transform-origin', async () => {
		const { container } = render(PendulumTestHarness, {
			props: { pivotOffset: { x: 0, y: 0 } }
		});
		await tick();
		const wrap = container.querySelector('.pendulum') as HTMLElement;
		expect(wrap.style.transformOrigin).toBe('50% 50%');
	});

	it('reflects the trigger via data-trigger attribute', async () => {
		const { container } = render(PendulumTestHarness, { props: { trigger: 'click' } });
		await tick();
		const wrap = container.querySelector('.pendulum') as HTMLElement;
		expect(wrap.getAttribute('data-trigger')).toBe('click');
	});

	it('click trigger adds the clickable class', async () => {
		const { container } = render(PendulumTestHarness, { props: { trigger: 'click' } });
		await tick();
		const wrap = container.querySelector('.pendulum') as HTMLElement;
		expect(wrap.classList.contains('pendulum--clickable')).toBe(true);
	});

	it('non-click trigger omits the clickable class', async () => {
		const { container } = render(PendulumTestHarness, { props: { trigger: 'manual' } });
		await tick();
		const wrap = container.querySelector('.pendulum') as HTMLElement;
		expect(wrap.classList.contains('pendulum--clickable')).toBe(false);
	});

	it('click trigger applies role=button to the inner element', async () => {
		const { container } = render(PendulumTestHarness, { props: { trigger: 'click' } });
		await tick();
		const inner = container.querySelector('.pendulum__inner') as HTMLElement;
		expect(inner.getAttribute('role')).toBe('button');
		expect(inner.getAttribute('tabindex')).toBe('0');
	});

	it('non-click trigger omits the button role and tabindex', async () => {
		const { container } = render(PendulumTestHarness, { props: { trigger: 'manual' } });
		await tick();
		const inner = container.querySelector('.pendulum__inner') as HTMLElement;
		expect(inner.getAttribute('role')).toBe('presentation');
		expect(inner.getAttribute('tabindex')).toBeNull();
	});

	it('manual trigger does not auto-start (angle stays 0)', async () => {
		const { container } = render(PendulumTestHarness, { props: { trigger: 'manual' } });
		await tick();
		const inner = container.querySelector('.pendulum__inner') as HTMLElement;
		expect(inner.style.cssText).toContain('--pendulum-angle: 0deg');
	});

	it('mount trigger runs the rAF tick — with our halt-on-large-ts stub, settles to 0', async () => {
		const { container } = render(PendulumTestHarness, { props: { trigger: 'mount' } });
		await tick();
		const inner = container.querySelector('.pendulum__inner') as HTMLElement;
		// The tick stub fires with timestamp 99999 → elapsed past duration → angle resets to 0.
		expect(inner.style.cssText).toContain('--pendulum-angle: 0deg');
	});

	it('reduced-motion skips the rAF tick entirely', async () => {
		const restore = setReducedMotion(true);
		try {
			const { container } = render(PendulumTestHarness, { props: { trigger: 'mount' } });
			await tick();
			const inner = container.querySelector('.pendulum__inner') as HTMLElement;
			expect(inner.style.cssText).toContain('--pendulum-angle: 0deg');
		} finally {
			restore();
		}
	});
});
