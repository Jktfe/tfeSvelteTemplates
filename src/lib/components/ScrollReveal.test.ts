/**
 * ============================================================
 * ScrollReveal Tests
 * ============================================================
 *
 * Two layers, mirroring the test split used elsewhere in the lib:
 *
 *  1. Pure helpers (thresholdForChild, delayForChild,
 *     transformAtProgress, shouldReplay, isReducedMotion) — exported
 *     from the module-script. These run with no DOM at all.
 *
 *  2. Component render — mount the wrapper through a small fixture
 *     harness with three known children, verify each child gets
 *     data-sr-index / --sr-delay / --sr-tx-*, drive a stubbed
 *     IntersectionObserver to flip data-revealed, and exercise both
 *     one-shot and replay paths plus the reduced-motion shortcut.
 *
 * 💡 Run `bun run test:ui` for a visual, filterable runner.
 * ============================================================
 */

import { cleanup, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	delayForChild,
	isReducedMotion,
	shouldReplay,
	thresholdForChild,
	transformAtProgress,
	type Direction
} from './ScrollReveal.svelte';
import ScrollRevealTestHarness from './ScrollRevealTestHarness.test.svelte';

afterEach(() => {
	cleanup();
});

// ============================================================
// 1. Pure helpers
// ============================================================

describe('ScrollReveal helpers', () => {
	describe('thresholdForChild', () => {
		it('returns the base threshold when valid', () => {
			expect(thresholdForChild(0, 5, 0.15)).toBe(0.15);
			expect(thresholdForChild(2, 5, 0.5)).toBe(0.5);
			expect(thresholdForChild(4, 5, 1)).toBe(1);
		});

		it('clamps thresholds outside [0, 1]', () => {
			expect(thresholdForChild(0, 5, -0.5)).toBe(0);
			expect(thresholdForChild(0, 5, 2)).toBe(1);
		});

		it('falls back to 0.15 for non-finite base', () => {
			expect(thresholdForChild(0, 5, Number.NaN)).toBe(0.15);
			expect(thresholdForChild(0, 5, Number.POSITIVE_INFINITY)).toBe(0.15);
		});
	});

	describe('delayForChild', () => {
		it('first child has zero delay', () => {
			expect(delayForChild(0, 80, 1)).toBe(0);
		});

		it('scales linearly with index', () => {
			expect(delayForChild(1, 80, 1)).toBe(80);
			expect(delayForChild(2, 80, 1)).toBe(160);
			expect(delayForChild(5, 80, 1)).toBe(400);
		});

		it('intensity scales the per-step gap', () => {
			expect(delayForChild(3, 100, 0.5)).toBe(150);
			expect(delayForChild(3, 100, 2)).toBe(600);
		});

		it('returns 0 for non-positive or invalid stagger', () => {
			expect(delayForChild(3, -50, 1)).toBe(0);
			expect(delayForChild(3, 0, 1)).toBe(0);
			expect(delayForChild(3, Number.NaN, 1)).toBe(0);
		});

		it('treats invalid intensity as 1', () => {
			expect(delayForChild(2, 80, Number.NaN)).toBe(160);
		});

		it('never returns a negative number', () => {
			expect(delayForChild(-2, 80, 1)).toBe(0);
		});
	});

	describe('transformAtProgress', () => {
		it('progress=0 → fully hidden transform for each direction', () => {
			expect(transformAtProgress('up', 32, 0)).toBe('translate3d(0, 32px, 0)');
			expect(transformAtProgress('down', 32, 0)).toBe('translate3d(0, -32px, 0)');
			expect(transformAtProgress('left', 32, 0)).toBe('translate3d(32px, 0, 0)');
			expect(transformAtProgress('right', 32, 0)).toBe('translate3d(-32px, 0, 0)');
			expect(transformAtProgress('scale', 32, 0)).toBe('scale(0.9500)');
			expect(transformAtProgress('rotate', 32, 0)).toBe('rotate(5.0000deg)');
		});

		it('progress=1 → identity transform for translate / scale / rotate', () => {
			expect(transformAtProgress('up', 32, 1)).toBe('translate3d(0, 0px, 0)');
			expect(transformAtProgress('left', 32, 1)).toBe('translate3d(0px, 0, 0)');
			expect(transformAtProgress('scale', 32, 1)).toBe('scale(1.0000)');
			expect(transformAtProgress('rotate', 32, 1)).toBe('rotate(0.0000deg)');
		});

		it('progress=0.5 → halfway translation', () => {
			expect(transformAtProgress('up', 40, 0.5)).toBe('translate3d(0, 20px, 0)');
		});

		it('clamps progress to [0, 1]', () => {
			expect(transformAtProgress('up', 32, -0.5)).toBe('translate3d(0, 32px, 0)');
			expect(transformAtProgress('up', 32, 2)).toBe('translate3d(0, 0px, 0)');
		});

		it('treats non-finite distance as 0', () => {
			expect(transformAtProgress('up', Number.NaN, 0)).toBe('translate3d(0, 0px, 0)');
		});

		it('returns "none" for unknown directions', () => {
			expect(transformAtProgress('diagonal' as unknown as Direction, 32, 0)).toBe('none');
		});
	});

	describe('shouldReplay', () => {
		it('is always false in one-shot mode', () => {
			expect(shouldReplay(true, 'one-shot')).toBe(false);
			expect(shouldReplay(false, 'one-shot')).toBe(false);
		});

		it('is always true in replay mode', () => {
			expect(shouldReplay(true, 'replay')).toBe(true);
			expect(shouldReplay(false, 'replay')).toBe(true);
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
// 2. IntersectionObserver mock — captures the most recent instance
//    so tests can fire synthetic entries by hand.
// ============================================================

type FakeObserver = {
	__targets: Set<Element>;
	__callback: IntersectionObserverCallback;
	__options: IntersectionObserverInit | undefined;
	__fire: (entries: { target: Element; isIntersecting: boolean }[]) => void;
	disconnect: () => void;
	observe: (el: Element) => void;
	unobserve: (el: Element) => void;
};

let lastObserver: FakeObserver | null = null;

function installIntersectionObserverMock() {
	class MockIO implements Partial<IntersectionObserver> {
		__targets = new Set<Element>();
		__callback: IntersectionObserverCallback;
		__options: IntersectionObserverInit | undefined;

		constructor(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
			this.__callback = cb;
			this.__options = options;
			lastObserver = this as unknown as FakeObserver;
		}

		observe(el: Element) {
			this.__targets.add(el);
		}
		unobserve(el: Element) {
			this.__targets.delete(el);
		}
		disconnect() {
			this.__targets.clear();
		}

		__fire(entries: { target: Element; isIntersecting: boolean }[]) {
			const full = entries.map(
				(e) =>
					({
						isIntersecting: e.isIntersecting,
						intersectionRatio: e.isIntersecting ? 1 : 0,
						target: e.target,
						boundingClientRect: { top: 0, bottom: 0, left: 0, right: 0 } as DOMRectReadOnly,
						intersectionRect: { top: 0, bottom: 0, left: 0, right: 0 } as DOMRectReadOnly,
						rootBounds: null,
						time: 0
					}) as IntersectionObserverEntry
			);
			this.__callback(full, this as unknown as IntersectionObserver);
		}
	}

	(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
		MockIO as unknown as typeof IntersectionObserver;
}

function uninstallIntersectionObserverMock() {
	// @ts-expect-error — runtime cleanup
	delete globalThis.IntersectionObserver;
	lastObserver = null;
}

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

// ============================================================
// 3. Component render — via the test harness fixture
// ============================================================

describe('ScrollReveal component', () => {
	beforeEach(() => {
		installIntersectionObserverMock();
	});

	afterEach(() => {
		uninstallIntersectionObserverMock();
	});

	it('renders the wrapper with all three children', async () => {
		const { container } = render(ScrollRevealTestHarness);
		await tick();
		expect(container.querySelector('.scroll-reveal')).toBeTruthy();
		expect(container.querySelectorAll('.child').length).toBe(3);
	});

	it('writes data-sr-direction onto the wrapper', async () => {
		const { container } = render(ScrollRevealTestHarness, {
			props: { direction: 'left' }
		});
		await tick();
		const wrapper = container.querySelector('.scroll-reveal') as HTMLElement;
		expect(wrapper.getAttribute('data-sr-direction')).toBe('left');
	});

	it('tags every direct child with sequential data-sr-index', async () => {
		const { container } = render(ScrollRevealTestHarness);
		await tick();
		const children = container.querySelectorAll('.child');
		expect(children[0].getAttribute('data-sr-index')).toBe('0');
		expect(children[1].getAttribute('data-sr-index')).toBe('1');
		expect(children[2].getAttribute('data-sr-index')).toBe('2');
	});

	it('starts every child with data-revealed="false"', async () => {
		const { container } = render(ScrollRevealTestHarness);
		await tick();
		const children = container.querySelectorAll('.child');
		children.forEach((c) => {
			expect(c.getAttribute('data-revealed')).toBe('false');
		});
	});

	it('writes increasing --sr-delay values to subsequent children', async () => {
		const { container } = render(ScrollRevealTestHarness, {
			props: { stagger: 100, intensity: 1 }
		});
		await tick();
		const children = Array.from(container.querySelectorAll('.child')) as HTMLElement[];
		expect(children[0].style.getPropertyValue('--sr-delay')).toBe('0ms');
		expect(children[1].style.getPropertyValue('--sr-delay')).toBe('100ms');
		expect(children[2].style.getPropertyValue('--sr-delay')).toBe('200ms');
	});

	it('writes --sr-duration matching the duration prop', async () => {
		const { container } = render(ScrollRevealTestHarness, {
			props: { duration: 1200 }
		});
		await tick();
		const children = Array.from(container.querySelectorAll('.child')) as HTMLElement[];
		children.forEach((c) => {
			expect(c.style.getPropertyValue('--sr-duration')).toBe('1200ms');
		});
	});

	it('writes hidden + revealed transform vars matching direction', async () => {
		const { container } = render(ScrollRevealTestHarness, {
			props: { direction: 'left', distance: 50 }
		});
		await tick();
		const first = container.querySelector('.child') as HTMLElement;
		expect(first.style.getPropertyValue('--sr-tx-hidden')).toContain('50px');
		expect(first.style.getPropertyValue('--sr-tx-revealed')).toContain('0px');
	});

	it('observes every child via IntersectionObserver', async () => {
		const { container } = render(ScrollRevealTestHarness);
		await tick();
		const children = container.querySelectorAll('.child');
		expect(lastObserver).toBeTruthy();
		expect(lastObserver?.__targets.size).toBe(3);
		children.forEach((c) => {
			expect(lastObserver?.__targets.has(c)).toBe(true);
		});
	});

	it('passes the threshold prop through to IntersectionObserver options', async () => {
		render(ScrollRevealTestHarness, { props: { threshold: 0.4 } });
		await tick();
		expect(lastObserver?.__options?.threshold).toBe(0.4);
	});

	it('one-shot: flips data-revealed=true on intersect, then unobserves', async () => {
		const { container } = render(ScrollRevealTestHarness, { props: { replay: false } });
		await tick();
		const first = container.querySelector('.child') as HTMLElement;
		expect(first.getAttribute('data-revealed')).toBe('false');

		lastObserver!.__fire([{ target: first, isIntersecting: true }]);
		expect(first.getAttribute('data-revealed')).toBe('true');
		expect(lastObserver?.__targets.has(first)).toBe(false);

		// Subsequent leave does NOT flip back in one-shot mode.
		lastObserver!.__fire([{ target: first, isIntersecting: false }]);
		expect(first.getAttribute('data-revealed')).toBe('true');
	});

	it('replay: flips data-revealed back to false on exit, keeps observing', async () => {
		const { container } = render(ScrollRevealTestHarness, { props: { replay: true } });
		await tick();
		const first = container.querySelector('.child') as HTMLElement;

		lastObserver!.__fire([{ target: first, isIntersecting: true }]);
		expect(first.getAttribute('data-revealed')).toBe('true');
		expect(lastObserver?.__targets.has(first)).toBe(true);

		lastObserver!.__fire([{ target: first, isIntersecting: false }]);
		expect(first.getAttribute('data-revealed')).toBe('false');
		expect(lastObserver?.__targets.has(first)).toBe(true);
	});

	it('reduced-motion: reveals every child immediately and skips the observer', async () => {
		const restore = setReducedMotion(true);
		try {
			const { container } = render(ScrollRevealTestHarness);
			await tick();
			const children = Array.from(container.querySelectorAll('.child')) as HTMLElement[];
			children.forEach((c) => {
				expect(c.getAttribute('data-revealed')).toBe('true');
				expect(c.style.getPropertyValue('--sr-duration')).toBe('0ms');
			});
			// Observer is never created when reduced motion is active.
			expect(lastObserver).toBeNull();
		} finally {
			restore();
		}
	});
});
