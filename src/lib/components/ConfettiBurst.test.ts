import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

import {
	clampCount,
	clampDuration,
	clampSpread,
	parseOrigin,
	mulberry32,
	generateParticles,
	stepParticle,
	isReducedMotion,
	DEFAULT_PALETTE
} from './ConfettiBurst.svelte';
import Harness from './ConfettiBurstTestHarness.test.svelte';

// ============================================================
// rAF / cAF manual mock — vitest fake timers don't fake rAF by
// default, and jsdom polyfills it via setTimeout which adds
// indirection. A direct manual mock makes timing deterministic.
// ============================================================

interface RafSlot {
	id: number;
	cb: FrameRequestCallback;
}
let rafCallbacks: RafSlot[] = [];
let rafCounter = 0;

function mockRaf() {
	rafCallbacks = [];
	rafCounter = 0;
	vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
		rafCounter++;
		rafCallbacks.push({ id: rafCounter, cb });
		return rafCounter;
	});
	vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
		rafCallbacks = rafCallbacks.filter((slot) => slot.id !== id);
	});
}

function flushRaf(timestamp: number) {
	const drained = rafCallbacks.slice();
	rafCallbacks = [];
	for (const { cb } of drained) cb(timestamp);
}

// ============================================================
// Helpers — pure, no DOM
// ============================================================

describe('clampCount', () => {
	it('clamps below 10 to 10', () => {
		expect(clampCount(0)).toBe(10);
		expect(clampCount(-50)).toBe(10);
		expect(clampCount(9)).toBe(10);
	});

	it('clamps above 500 to 500', () => {
		expect(clampCount(501)).toBe(500);
		expect(clampCount(10_000)).toBe(500);
	});

	it('passes through values inside [10, 500] (floored)', () => {
		expect(clampCount(10)).toBe(10);
		expect(clampCount(80)).toBe(80);
		expect(clampCount(500)).toBe(500);
		expect(clampCount(123.7)).toBe(123);
	});

	it('falls back to 80 for non-finite / non-numeric', () => {
		expect(clampCount(NaN)).toBe(80);
		expect(clampCount(Infinity)).toBe(80);
		expect(clampCount(-Infinity)).toBe(80);
		expect(clampCount('100')).toBe(80);
		expect(clampCount(null)).toBe(80);
		expect(clampCount(undefined)).toBe(80);
	});
});

describe('clampDuration', () => {
	it('clamps below 200ms to 200', () => {
		expect(clampDuration(0)).toBe(200);
		expect(clampDuration(-100)).toBe(200);
		expect(clampDuration(199.9)).toBe(200);
	});

	it('clamps above 5000ms to 5000', () => {
		expect(clampDuration(5001)).toBe(5000);
		expect(clampDuration(60_000)).toBe(5000);
	});

	it('passes through values inside [200, 5000]', () => {
		expect(clampDuration(200)).toBe(200);
		expect(clampDuration(1800)).toBe(1800);
		expect(clampDuration(5000)).toBe(5000);
	});

	it('falls back to 1800 for non-finite / non-numeric', () => {
		expect(clampDuration(NaN)).toBe(1800);
		expect(clampDuration(Infinity)).toBe(1800);
		expect(clampDuration('1800')).toBe(1800);
		expect(clampDuration(null)).toBe(1800);
	});
});

describe('clampSpread', () => {
	it('clamps below 0 to 0', () => {
		expect(clampSpread(-30)).toBe(0);
	});

	it('clamps above 180 to 180', () => {
		expect(clampSpread(360)).toBe(180);
	});

	it('passes through inside [0, 180]', () => {
		expect(clampSpread(0)).toBe(0);
		expect(clampSpread(70)).toBe(70);
		expect(clampSpread(180)).toBe(180);
	});

	it('falls back to 70 for non-finite / non-numeric', () => {
		expect(clampSpread(NaN)).toBe(70);
		expect(clampSpread('70')).toBe(70);
		expect(clampSpread(undefined)).toBe(70);
	});
});

describe('parseOrigin', () => {
	it('returns canvas centre for "center"', () => {
		expect(parseOrigin('center', 800, 600)).toEqual({ x: 400, y: 300 });
	});

	it('returns the literal x/y for valid object', () => {
		expect(parseOrigin({ x: 100, y: 200 }, 800, 600)).toEqual({ x: 100, y: 200 });
	});

	it('falls back to centre for objects with bad x/y', () => {
		expect(parseOrigin({ x: NaN, y: 0 }, 800, 600)).toEqual({ x: 400, y: 300 });
		expect(parseOrigin({ x: '0', y: '0' }, 800, 600)).toEqual({ x: 400, y: 300 });
	});

	it('falls back to centre for null / undefined / missing keys', () => {
		expect(parseOrigin(undefined, 800, 600)).toEqual({ x: 400, y: 300 });
		expect(parseOrigin(null, 800, 600)).toEqual({ x: 400, y: 300 });
		expect(parseOrigin({}, 800, 600)).toEqual({ x: 400, y: 300 });
		expect(parseOrigin({ x: 100 }, 800, 600)).toEqual({ x: 400, y: 300 });
	});
});

describe('mulberry32', () => {
	it('produces the same sequence for the same seed', () => {
		const a = mulberry32(42);
		const b = mulberry32(42);
		const seqA = [a(), a(), a(), a(), a()];
		const seqB = [b(), b(), b(), b(), b()];
		expect(seqA).toEqual(seqB);
	});

	it('produces different sequences for different seeds', () => {
		const a = mulberry32(1);
		const b = mulberry32(2);
		expect(a()).not.toBe(b());
	});

	it('returns values in [0, 1)', () => {
		const r = mulberry32(7);
		for (let i = 0; i < 50; i++) {
			const v = r();
			expect(v).toBeGreaterThanOrEqual(0);
			expect(v).toBeLessThan(1);
		}
	});
});

describe('generateParticles', () => {
	const baseOpts = {
		count: 10,
		palette: ['#ff0000', '#00ff00'] as const,
		origin: { x: 100, y: 100 },
		spread: 90,
		velocity: 500,
		seed: 42
	};

	it('produces exactly count particles', () => {
		expect(generateParticles({ ...baseOpts, count: 25 })).toHaveLength(25);
		expect(generateParticles({ ...baseOpts, count: 1 })).toHaveLength(1);
	});

	it('is deterministic for a given seed', () => {
		const a = generateParticles(baseOpts);
		const b = generateParticles(baseOpts);
		expect(a).toEqual(b);
	});

	it('starts every particle at the supplied origin', () => {
		const ps = generateParticles(baseOpts);
		for (const p of ps) {
			expect(p.x).toBe(100);
			expect(p.y).toBe(100);
		}
	});

	it('only assigns colors from the supplied palette', () => {
		const ps = generateParticles(baseOpts);
		for (const p of ps) {
			expect(['#ff0000', '#00ff00']).toContain(p.color);
		}
	});

	it('falls back to DEFAULT_PALETTE when palette is empty', () => {
		const ps = generateParticles({ ...baseOpts, palette: [] });
		for (const p of ps) {
			expect(DEFAULT_PALETTE).toContain(p.color);
		}
	});

	it('initialises every particle with opacity 1', () => {
		const ps = generateParticles(baseOpts);
		for (const p of ps) expect(p.opacity).toBe(1);
	});

	it('produces particles aimed roughly upward (vy negative on average)', () => {
		const ps = generateParticles({ ...baseOpts, count: 200, spread: 60 });
		const avgVy = ps.reduce((s, p) => s + p.vy, 0) / ps.length;
		// Spread 60° around -π/2 → all initial vy should be < 0.
		expect(avgVy).toBeLessThan(0);
	});
});

describe('stepParticle', () => {
	const base = {
		x: 0,
		y: 0,
		vx: 100,
		vy: -100,
		size: 5,
		rotation: 0,
		angularVelocity: 1,
		color: '#fff',
		opacity: 1
	};

	it('advances position by velocity * deltaSec', () => {
		const next = stepParticle(base, 1, 0, 0, 1000);
		expect(next.x).toBeCloseTo(100, 5);
		expect(next.y).toBeCloseTo(-100, 5);
	});

	it('applies gravity to vy', () => {
		const next = stepParticle(base, 1, 1500, 0, 1000);
		// Drag is 0.99 then gravity adds 1500.
		expect(next.vy).toBeCloseTo(-100 * 0.99 + 1500, 3);
	});

	it('applies drag to vx', () => {
		const next = stepParticle(base, 1, 0, 0, 1000);
		expect(next.vx).toBeCloseTo(100 * 0.99, 5);
	});

	it('advances rotation by angularVelocity * deltaSec', () => {
		const next = stepParticle(base, 0.5, 0, 0, 1000);
		expect(next.rotation).toBeCloseTo(0.5, 5);
	});

	it('linearly ramps opacity from 1 to 0 over duration', () => {
		expect(stepParticle(base, 0, 0, 0, 1000).opacity).toBe(1);
		expect(stepParticle(base, 0, 0, 500, 1000).opacity).toBeCloseTo(0.5, 5);
		expect(stepParticle(base, 0, 0, 1000, 1000).opacity).toBe(0);
	});

	it('clamps opacity to 0 past duration', () => {
		expect(stepParticle(base, 0, 0, 1500, 1000).opacity).toBe(0);
	});

	it('does not divide by zero when totalMs is zero', () => {
		// stepParticle uses Math.max(1, totalMs) defensively.
		const next = stepParticle(base, 0, 0, 0, 0);
		expect(Number.isFinite(next.opacity)).toBe(true);
	});
});

describe('isReducedMotion', () => {
	const originalMatchMedia = globalThis.window?.matchMedia;

	afterEach(() => {
		if (typeof globalThis.window !== 'undefined') {
			globalThis.window.matchMedia = originalMatchMedia as typeof window.matchMedia;
		}
	});

	it('returns false when matchMedia reports no preference', () => {
		globalThis.window.matchMedia = vi.fn().mockReturnValue({
			matches: false,
			media: '',
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}) as unknown as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(false);
	});

	it('returns true when matchMedia reports reduced motion', () => {
		globalThis.window.matchMedia = vi.fn().mockReturnValue({
			matches: true,
			media: '',
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}) as unknown as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(true);
	});
});

// ============================================================
// Render contract + imperative fire()
// ============================================================

describe('ConfettiBurst — render contract', () => {
	beforeEach(() => mockRaf());
	afterEach(() => vi.restoreAllMocks());

	it('does not render a canvas while idle', () => {
		const { container } = render(Harness);
		expect(container.querySelector('canvas')).toBeNull();
	});

	it('exposes fire-button and fire-with-origin triggers from the harness', () => {
		const { getByTestId } = render(Harness);
		expect(getByTestId('fire-button')).toBeInTheDocument();
		expect(getByTestId('fire-with-origin')).toBeInTheDocument();
	});
});

describe('ConfettiBurst — fire() with reduced motion', () => {
	const originalMatchMedia = globalThis.window?.matchMedia;

	beforeEach(() => {
		mockRaf();
		globalThis.window.matchMedia = vi.fn().mockReturnValue({
			matches: true,
			media: '(prefers-reduced-motion: reduce)',
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}) as unknown as typeof window.matchMedia;
	});

	afterEach(() => {
		vi.restoreAllMocks();
		globalThis.window.matchMedia = originalMatchMedia as typeof window.matchMedia;
	});

	it('fires onComplete immediately and skips canvas mount', async () => {
		const onComplete = vi.fn();
		const { getByTestId, container } = render(Harness, { props: { onComplete } });
		await fireEvent.click(getByTestId('fire-button'));
		expect(onComplete).toHaveBeenCalledTimes(1);
		expect(container.querySelector('canvas')).toBeNull();
	});

	it('does not request animation frames under reduced motion', async () => {
		const onComplete = vi.fn();
		const { getByTestId } = render(Harness, { props: { onComplete } });
		await fireEvent.click(getByTestId('fire-button'));
		expect(window.requestAnimationFrame).not.toHaveBeenCalled();
	});
});

describe('ConfettiBurst — fire() in normal motion (jsdom canvas → null ctx → graceful abort)', () => {
	beforeEach(() => {
		mockRaf();
		// Force matchMedia to report no reduced-motion.
		globalThis.window.matchMedia = vi.fn().mockReturnValue({
			matches: false,
			media: '',
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}) as unknown as typeof window.matchMedia;
	});

	afterEach(() => vi.restoreAllMocks());

	it('mounts the canvas after fire() and removes it once the burst aborts (jsdom has null ctx)', async () => {
		const onComplete = vi.fn();
		const { getByTestId, container } = render(Harness, { props: { onComplete } });

		await fireEvent.click(getByTestId('fire-button'));

		// One rAF was queued by fire(); flush it. Canvas will mount inside it,
		// frame() runs, getContext returns null in jsdom, stop() unmounts canvas
		// and onComplete fires.
		flushRaf(0);
		// Allow Svelte to process the firing=false update.
		await Promise.resolve();
		await Promise.resolve();

		expect(onComplete).toHaveBeenCalledTimes(1);
		expect(container.querySelector('canvas')).toBeNull();
	});

	it('queues a single rAF on fire()', async () => {
		const { getByTestId } = render(Harness);
		await fireEvent.click(getByTestId('fire-button'));
		expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
	});

	it('accepts per-shot origin override via fire({ origin })', async () => {
		const onComplete = vi.fn();
		const { getByTestId } = render(Harness, { props: { onComplete } });
		await fireEvent.click(getByTestId('fire-with-origin'));
		flushRaf(0);
		await Promise.resolve();
		expect(onComplete).toHaveBeenCalledTimes(1);
	});
});

describe('ConfettiBurst — props pass through to canvas / class', () => {
	beforeEach(() => {
		mockRaf();
		globalThis.window.matchMedia = vi.fn().mockReturnValue({
			matches: false,
			media: '',
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}) as unknown as typeof window.matchMedia;
	});

	afterEach(() => vi.restoreAllMocks());

	it('applies the custom class on the canvas while firing', async () => {
		const { getByTestId, container } = render(Harness, {
			props: { class: 'my-extra' }
		});
		await fireEvent.click(getByTestId('fire-button'));

		// Canvas exists between the rAF deferral and the frame() abort.
		const canvas = container.querySelector('canvas');
		expect(canvas).not.toBeNull();
		expect(canvas?.classList.contains('confetti-canvas')).toBe(true);
		expect(canvas?.classList.contains('my-extra')).toBe(true);

		flushRaf(0);
		await Promise.resolve();
	});
});
