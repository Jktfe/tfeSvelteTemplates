import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import CountUp, {
	pickEasing,
	easeOutQuart,
	tickValue,
	clampValue,
	formatNumber,
	isReducedMotion
} from './CountUp.svelte';

describe('pickEasing', () => {
	it('resolves each named easing', () => {
		for (const name of ['linear', 'quad', 'cubic', 'quart', 'expo']) {
			const fn = pickEasing(name);
			expect(typeof fn).toBe('function');
			expect(fn(0)).toBeCloseTo(0, 5);
			expect(fn(1)).toBeCloseTo(1, 5);
		}
	});

	it('falls back to quart on unknown input', () => {
		const fallback = pickEasing('mystery');
		const quart = pickEasing('quart');
		expect(fallback(0.5)).toBeCloseTo(quart(0.5), 5);
	});

	it('returns linear that maps t to t', () => {
		const linear = pickEasing('linear');
		for (const t of [0, 0.25, 0.5, 0.75, 1]) {
			expect(linear(t)).toBe(t);
		}
	});
});

describe('easeOutQuart', () => {
	it('hits 0 at t=0 and 1 at t=1', () => {
		expect(easeOutQuart(0)).toBe(0);
		expect(easeOutQuart(1)).toBe(1);
	});

	it('is monotonically non-decreasing on [0,1]', () => {
		let prev = easeOutQuart(0);
		for (let t = 0.05; t <= 1; t += 0.05) {
			const v = easeOutQuart(t);
			expect(v).toBeGreaterThanOrEqual(prev);
			prev = v;
		}
	});

	it('is fast-out (above linear in the middle)', () => {
		expect(easeOutQuart(0.5)).toBeGreaterThan(0.5);
	});

	it('clamps t outside [0,1]', () => {
		expect(easeOutQuart(-1)).toBe(0);
		expect(easeOutQuart(2)).toBe(1);
	});
});

describe('tickValue', () => {
	it('returns start at t=0', () => {
		expect(tickValue(0, 100, 0)).toBe(0);
		expect(tickValue(50, 200, 0)).toBe(50);
	});

	it('returns end at t=1', () => {
		expect(tickValue(0, 100, 1)).toBe(100);
		expect(tickValue(50, 200, 1)).toBe(200);
	});

	it('respects direction (counts down)', () => {
		const v = tickValue(100, 0, 0.5);
		expect(v).toBeGreaterThan(0);
		expect(v).toBeLessThan(100);
	});

	it('uses the supplied easing function', () => {
		const linear = (t: number) => t;
		expect(tickValue(0, 100, 0.5, linear)).toBe(50);
	});

	it('clamps t into [0,1]', () => {
		expect(tickValue(0, 100, -0.5)).toBe(0);
		expect(tickValue(0, 100, 1.5)).toBe(100);
	});
});

describe('clampValue', () => {
	it('clamps below the range', () => {
		expect(clampValue(-50, 0, 100)).toBe(0);
	});

	it('clamps above the range', () => {
		expect(clampValue(150, 0, 100)).toBe(100);
	});

	it('passes values inside the range through', () => {
		expect(clampValue(42, 0, 100)).toBe(42);
	});

	it('respects descending range (count-down)', () => {
		expect(clampValue(150, 100, 0)).toBe(100);
		expect(clampValue(-10, 100, 0)).toBe(0);
		expect(clampValue(50, 100, 0)).toBe(50);
	});
});

describe('formatNumber', () => {
	it('applies thousand-grouping by default', () => {
		const out = formatNumber(1000000);
		// en-GB uses comma; some locales use period — accept either
		expect(out).toMatch(/[1][,.]000[,.]000/);
	});

	it('honours decimals', () => {
		const out = formatNumber(99.9, { decimals: 2 });
		expect(out).toContain('99.90');
	});

	it('applies prefix and suffix', () => {
		const out = formatNumber(50, { prefix: '£', suffix: '+' });
		expect(out.startsWith('£')).toBe(true);
		expect(out.endsWith('+')).toBe(true);
		expect(out).toContain('50');
	});

	it('drops grouping when useGrouping=false', () => {
		const out = formatNumber(10000, { useGrouping: false });
		expect(out).not.toMatch(/[,.]/);
	});

	it('clamps decimal precision to a non-negative integer', () => {
		const out = formatNumber(1.234567, { decimals: -1 });
		expect(out).not.toContain('.');
	});
});

describe('isReducedMotion', () => {
	const original = window.matchMedia;
	afterEach(() => {
		window.matchMedia = original;
	});

	it('returns matchMedia result when available', () => {
		window.matchMedia = vi
			.fn()
			.mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(true);
		window.matchMedia = vi
			.fn()
			.mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(false);
	});
});

describe('CountUp component', () => {
	let observers: Array<{ observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }>;

	beforeEach(() => {
		observers = [];
		window.matchMedia = vi.fn().mockReturnValue({
			matches: true,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}) as unknown as typeof window.matchMedia;
		const tracker = observers;
		class MockIO {
			observe = vi.fn();
			disconnect = vi.fn();
			unobserve = vi.fn();
			constructor() {
				tracker.push(this);
			}
		}
		(window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = MockIO;
	});

	it('renders the wrapper and value spans', () => {
		const { container } = render(CountUp, { props: { end: 1000, trigger: 'manual' } });
		expect(container.querySelector('.countup')).toBeTruthy();
		expect(container.querySelector('.countup-value')).toBeTruthy();
		expect(container.querySelector('.countup-sr')).toBeTruthy();
	});

	it('exposes easing via data-easing', () => {
		const { container } = render(CountUp, {
			props: { end: 1000, easing: 'quad', trigger: 'manual' }
		});
		expect(container.querySelector('.countup')?.getAttribute('data-easing')).toBe('quad');
	});

	it('shows the start value when trigger is manual (no auto-run)', () => {
		const { container } = render(CountUp, {
			props: { end: 1000, start: 100, trigger: 'manual' }
		});
		const v = container.querySelector('.countup-value');
		expect(v?.textContent).toContain('100');
	});

	it('jumps to end value on mount when reduced-motion is set', () => {
		const { container } = render(CountUp, {
			props: { end: 1234, trigger: 'mount' }
		});
		const v = container.querySelector('.countup-value');
		expect(v?.textContent).toContain('1,234');
	});

	it('applies the size class', () => {
		const { container } = render(CountUp, {
			props: { end: 100, size: 'lg', trigger: 'manual' }
		});
		expect(container.querySelector('.countup')?.classList.contains('countup-size-lg')).toBe(true);
	});

	it('appends extra class names without dropping built-ins', () => {
		const { container } = render(CountUp, {
			props: { end: 100, class: 'custom-tag', trigger: 'manual' }
		});
		const root = container.querySelector('.countup');
		expect(root?.classList.contains('custom-tag')).toBe(true);
		expect(root?.classList.contains('countup')).toBe(true);
	});

	it('formats the destination value into the SR span', () => {
		const { container } = render(CountUp, {
			props: { end: 1000000, prefix: '£', suffix: '+', trigger: 'manual' }
		});
		const sr = container.querySelector('.countup-sr');
		expect(sr?.textContent).toMatch(/£/);
		expect(sr?.textContent).toMatch(/\+/);
		expect(sr?.textContent).toMatch(/1[,.]000[,.]000/);
	});

	it('observes the host on viewport trigger', () => {
		render(CountUp, { props: { end: 100, trigger: 'viewport' } });
		expect(observers.length).toBe(1);
		expect(observers[0].observe).toHaveBeenCalled();
	});

	it('does not observe when trigger is manual', () => {
		render(CountUp, { props: { end: 100, trigger: 'manual' } });
		expect(observers.length).toBe(0);
	});

	it('marks data-trigger from the prop', () => {
		const { container } = render(CountUp, { props: { end: 100, trigger: 'mount' } });
		expect(container.querySelector('.countup')?.getAttribute('data-trigger')).toBe('mount');
	});
});
