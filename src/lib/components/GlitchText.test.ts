import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import {
	pickIntensity,
	jitterOffset,
	tearBand,
	scheduleNextTear,
	pickTrigger,
	isReducedMotion
} from './GlitchText.svelte';
import GlitchText from './GlitchText.svelte';

describe('pickIntensity', () => {
	it('returns the subtle preset for "subtle"', () => {
		const cfg = pickIntensity('subtle');
		expect(cfg.offsetMax).toBeGreaterThan(0);
		expect(cfg.tearMs).toBeGreaterThan(0);
		expect(cfg.jitterMs).toBeGreaterThan(0);
		expect(cfg.opacity).toBeGreaterThan(0);
	});

	it('returns the moderate preset for "moderate"', () => {
		const cfg = pickIntensity('moderate');
		const subtle = pickIntensity('subtle');
		expect(cfg.offsetMax).toBeGreaterThan(subtle.offsetMax);
		expect(cfg.opacity).toBeGreaterThan(subtle.opacity);
	});

	it('returns the wild preset with the largest offset and shortest jitter cadence', () => {
		const wild = pickIntensity('wild');
		const moderate = pickIntensity('moderate');
		expect(wild.offsetMax).toBeGreaterThan(moderate.offsetMax);
		expect(wild.jitterMs).toBeLessThan(moderate.jitterMs);
	});

	it('falls back to moderate for unknown names', () => {
		const cfg = pickIntensity('extreme');
		const moderate = pickIntensity('moderate');
		expect(cfg).toEqual(moderate);
	});

	it('falls back to moderate for null / undefined', () => {
		const moderate = pickIntensity('moderate');
		expect(pickIntensity(null)).toEqual(moderate);
		expect(pickIntensity(undefined)).toEqual(moderate);
	});

	it('returns an object with the expected shape', () => {
		const cfg = pickIntensity('moderate');
		expect(cfg).toHaveProperty('offsetMax');
		expect(cfg).toHaveProperty('tearMs');
		expect(cfg).toHaveProperty('jitterMs');
		expect(cfg).toHaveProperty('opacity');
	});
});

describe('jitterOffset', () => {
	const cfg = pickIntensity('moderate');

	it('returns integer dx and dy', () => {
		const { dx, dy } = jitterOffset(cfg, 42);
		expect(Number.isInteger(dx)).toBe(true);
		expect(Number.isInteger(dy)).toBe(true);
	});

	it('keeps dx and dy within [-offsetMax, offsetMax]', () => {
		for (let seed = 0; seed < 200; seed++) {
			const { dx, dy } = jitterOffset(cfg, seed);
			expect(Math.abs(dx)).toBeLessThanOrEqual(cfg.offsetMax);
			expect(Math.abs(dy)).toBeLessThanOrEqual(cfg.offsetMax);
		}
	});

	it('is deterministic per seed', () => {
		const a = jitterOffset(cfg, 99);
		const b = jitterOffset(cfg, 99);
		expect(a).toEqual(b);
	});

	it('produces different offsets across a wide seed range (probabilistically)', () => {
		const set = new Set<string>();
		for (let seed = 0; seed < 50; seed++) {
			const { dx, dy } = jitterOffset(cfg, seed);
			set.add(`${dx},${dy}`);
		}
		expect(set.size).toBeGreaterThan(2);
	});

	it('scales with intensity offsetMax', () => {
		const wild = pickIntensity('wild');
		let maxObserved = 0;
		for (let seed = 0; seed < 200; seed++) {
			const { dx } = jitterOffset(wild, seed);
			if (Math.abs(dx) > maxObserved) maxObserved = Math.abs(dx);
		}
		expect(maxObserved).toBeGreaterThan(cfg.offsetMax);
	});
});

describe('tearBand', () => {
	const cfg = pickIntensity('moderate');

	it('returns top in [0, 80]', () => {
		for (let seed = 0; seed < 200; seed++) {
			const { top } = tearBand(cfg, seed);
			expect(top).toBeGreaterThanOrEqual(0);
			expect(top).toBeLessThanOrEqual(80);
		}
	});

	it('returns height in [5, 30]', () => {
		for (let seed = 0; seed < 200; seed++) {
			const { height } = tearBand(cfg, seed);
			expect(height).toBeGreaterThanOrEqual(5);
			expect(height).toBeLessThanOrEqual(30);
		}
	});

	it('returns dx within roughly [-4*offsetMax, 4*offsetMax]', () => {
		const limit = cfg.offsetMax * 4;
		for (let seed = 0; seed < 200; seed++) {
			const { dx } = tearBand(cfg, seed);
			expect(Math.abs(dx)).toBeLessThanOrEqual(limit + 1);
		}
	});

	it('is deterministic per seed', () => {
		const a = tearBand(cfg, 7);
		const b = tearBand(cfg, 7);
		expect(a).toEqual(b);
	});

	it('returns integer values', () => {
		const { top, height, dx } = tearBand(cfg, 13);
		expect(Number.isInteger(top)).toBe(true);
		expect(Number.isInteger(height)).toBe(true);
		expect(Number.isInteger(dx)).toBe(true);
	});
});

describe('scheduleNextTear', () => {
	const cfg = pickIntensity('moderate');

	it('returns a positive integer ms', () => {
		const ms = scheduleNextTear(cfg, 1000);
		expect(ms).toBeGreaterThan(0);
		expect(Number.isInteger(ms)).toBe(true);
	});

	it('stays within roughly [0.5*jitterMs, 1.5*jitterMs]', () => {
		const lo = Math.floor(cfg.jitterMs * 0.5);
		const hi = Math.ceil(cfg.jitterMs * 1.5);
		for (let now = 1; now < 200; now++) {
			const ms = scheduleNextTear(cfg, now);
			expect(ms).toBeGreaterThanOrEqual(lo - 1);
			expect(ms).toBeLessThanOrEqual(hi + 1);
		}
	});

	it('cadence shortens with wilder intensity', () => {
		const subtle = pickIntensity('subtle');
		const wild = pickIntensity('wild');
		let totalSubtle = 0;
		let totalWild = 0;
		for (let now = 1; now < 200; now++) {
			totalSubtle += scheduleNextTear(subtle, now);
			totalWild += scheduleNextTear(wild, now);
		}
		expect(totalWild).toBeLessThan(totalSubtle);
	});
});

describe('pickTrigger', () => {
	it('returns "auto" / "hover" / "viewport" verbatim when matched', () => {
		expect(pickTrigger('auto')).toBe('auto');
		expect(pickTrigger('hover')).toBe('hover');
		expect(pickTrigger('viewport')).toBe('viewport');
	});

	it('falls back to "auto" for unknown values', () => {
		expect(pickTrigger('clicktopaint')).toBe('auto');
		expect(pickTrigger('')).toBe('auto');
		expect(pickTrigger(null)).toBe('auto');
		expect(pickTrigger(undefined)).toBe('auto');
	});
});

describe('isReducedMotion', () => {
	const originalMatchMedia = window.matchMedia;

	afterEach(() => {
		window.matchMedia = originalMatchMedia;
	});

	it('returns false when the media query does not match', () => {
		window.matchMedia = vi.fn().mockReturnValue({
			matches: false,
			media: '',
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}) as unknown as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(false);
	});

	it('returns true when the media query matches', () => {
		window.matchMedia = vi.fn().mockReturnValue({
			matches: true,
			media: '',
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}) as unknown as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(true);
	});
});

describe('GlitchText component', () => {
	const observers: { observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] =
		[];
	const originalIO = (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
	const originalMatchMedia = window.matchMedia;

	beforeEach(() => {
		observers.length = 0;
		const tracker = observers;
		class MockIO {
			observe = vi.fn();
			disconnect = vi.fn();
			unobserve = vi.fn();
			constructor() {
				tracker.push(this as unknown as (typeof tracker)[number]);
			}
		}
		(window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = MockIO;
		window.matchMedia = vi.fn().mockReturnValue({
			matches: false,
			media: '',
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}) as unknown as typeof window.matchMedia;
	});

	afterEach(() => {
		(window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = originalIO;
		window.matchMedia = originalMatchMedia;
	});

	it('renders the text in the document', () => {
		const { container } = render(GlitchText, { props: { text: 'GLITCHED' } });
		expect(container.textContent).toContain('GLITCHED');
	});

	it('reflects intensity prop on the wrapper data-intensity attribute', () => {
		const { container } = render(GlitchText, {
			props: { text: 'X', intensity: 'wild' }
		});
		const root = container.querySelector('.glitch') as HTMLElement;
		expect(root.dataset.intensity).toBe('wild');
	});

	it('reflects trigger prop on the wrapper data-trigger attribute', () => {
		const { container } = render(GlitchText, {
			props: { text: 'X', trigger: 'hover' }
		});
		const root = container.querySelector('.glitch') as HTMLElement;
		expect(root.dataset.trigger).toBe('hover');
	});

	it('falls back to "auto" trigger for unknown values', () => {
		const { container } = render(GlitchText, {
			props: { text: 'X', trigger: 'clickytap' as 'auto' }
		});
		const root = container.querySelector('.glitch') as HTMLElement;
		expect(root.dataset.trigger).toBe('auto');
	});

	it('activates immediately on auto trigger when reduced motion is off', async () => {
		const { container } = render(GlitchText, {
			props: { text: 'AUTO', trigger: 'auto' }
		});
		await new Promise((r) => setTimeout(r, 0));
		const root = container.querySelector('.glitch') as HTMLElement;
		expect(root.classList.contains('active')).toBe(true);
	});

	it('does not activate when prefers-reduced-motion is set', async () => {
		window.matchMedia = vi.fn().mockReturnValue({
			matches: true,
			media: '',
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}) as unknown as typeof window.matchMedia;
		const { container } = render(GlitchText, {
			props: { text: 'CALM', trigger: 'auto' }
		});
		await new Promise((r) => setTimeout(r, 0));
		const root = container.querySelector('.glitch') as HTMLElement;
		expect(root.classList.contains('active')).toBe(false);
	});

	it('hover trigger toggles active on mouseenter / mouseleave', async () => {
		const { container } = render(GlitchText, {
			props: { text: 'HOVER', trigger: 'hover' }
		});
		await new Promise((r) => setTimeout(r, 0));
		const root = container.querySelector('.glitch') as HTMLElement;
		expect(root.classList.contains('active')).toBe(false);
		await fireEvent.mouseEnter(root);
		expect(root.classList.contains('active')).toBe(true);
		await fireEvent.mouseLeave(root);
		expect(root.classList.contains('active')).toBe(false);
	});

	it('viewport trigger registers an IntersectionObserver on the host', async () => {
		render(GlitchText, {
			props: { text: 'VIEWPORT', trigger: 'viewport' }
		});
		await new Promise((r) => setTimeout(r, 0));
		expect(observers.length).toBeGreaterThan(0);
		expect(observers[0].observe).toHaveBeenCalled();
	});

	it('renders the data-text attribute on the base layer for pseudo clones', () => {
		const { container } = render(GlitchText, { props: { text: 'CYBER' } });
		const base = container.querySelector('.glitch-base') as HTMLElement;
		expect(base.dataset.text).toBe('CYBER');
	});
});
