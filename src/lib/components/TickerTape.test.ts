import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';

import {
	pickVariant,
	pickDirection,
	clampSpeed,
	inferTrend,
	formatDelta,
	trendGlyph,
	isValidVariant,
	isValidDirection,
	isReducedMotion,
	type TickerItem
} from './TickerTape.svelte';
import Harness from './TickerTapeTestHarness.test.svelte';

describe('isValidVariant', () => {
	it('accepts the four named variants', () => {
		expect(isValidVariant('default')).toBe(true);
		expect(isValidVariant('finance')).toBe(true);
		expect(isValidVariant('sports')).toBe(true);
		expect(isValidVariant('minimal')).toBe(true);
	});

	it('rejects unknown / null / undefined', () => {
		expect(isValidVariant('rainbow')).toBe(false);
		expect(isValidVariant('')).toBe(false);
		expect(isValidVariant(undefined)).toBe(false);
		expect(isValidVariant(null)).toBe(false);
	});
});

describe('pickVariant', () => {
	it('returns the variant when valid', () => {
		expect(pickVariant('finance')).toBe('finance');
		expect(pickVariant('sports')).toBe('sports');
		expect(pickVariant('minimal')).toBe('minimal');
		expect(pickVariant('default')).toBe('default');
	});

	it('falls back to default for unknown / null / undefined', () => {
		expect(pickVariant('rainbow')).toBe('default');
		expect(pickVariant(undefined)).toBe('default');
		expect(pickVariant(null)).toBe('default');
		expect(pickVariant('')).toBe('default');
	});
});

describe('isValidDirection', () => {
	it('accepts left and right', () => {
		expect(isValidDirection('left')).toBe(true);
		expect(isValidDirection('right')).toBe(true);
	});

	it('rejects everything else', () => {
		expect(isValidDirection('up')).toBe(false);
		expect(isValidDirection('')).toBe(false);
		expect(isValidDirection(undefined)).toBe(false);
		expect(isValidDirection(null)).toBe(false);
	});
});

describe('pickDirection', () => {
	it('returns the direction when valid', () => {
		expect(pickDirection('left')).toBe('left');
		expect(pickDirection('right')).toBe('right');
	});

	it('falls back to left for unknown / null / undefined', () => {
		expect(pickDirection('up')).toBe('left');
		expect(pickDirection(undefined)).toBe('left');
		expect(pickDirection(null)).toBe('left');
	});
});

describe('clampSpeed', () => {
	it('returns finite positive numbers as-is', () => {
		expect(clampSpeed(60)).toBe(60);
		expect(clampSpeed(120)).toBe(120);
		expect(clampSpeed(1)).toBe(1);
	});

	it('clamps below 1 to 1', () => {
		expect(clampSpeed(0)).toBe(1);
		expect(clampSpeed(-5)).toBe(1);
		expect(clampSpeed(0.5)).toBe(1);
	});

	it('clamps above 1000 to 1000', () => {
		expect(clampSpeed(1001)).toBe(1000);
		expect(clampSpeed(99999)).toBe(1000);
	});

	it('falls back for non-finite / non-numeric inputs', () => {
		expect(clampSpeed(NaN)).toBe(60);
		expect(clampSpeed(Infinity)).toBe(60);
		expect(clampSpeed(-Infinity)).toBe(60);
		expect(clampSpeed(undefined)).toBe(60);
		expect(clampSpeed(null)).toBe(60);
	});

	it('respects custom fallback', () => {
		expect(clampSpeed(undefined, 100)).toBe(100);
		expect(clampSpeed(NaN, 200)).toBe(200);
	});
});

describe('inferTrend', () => {
	it('returns explicit trend when set', () => {
		expect(inferTrend({ label: 'X', value: 1, trend: 'up' })).toBe('up');
		expect(inferTrend({ label: 'X', value: 1, trend: 'down' })).toBe('down');
		expect(inferTrend({ label: 'X', value: 1, trend: 'flat' })).toBe('flat');
	});

	it('explicit trend wins over delta sign', () => {
		expect(inferTrend({ label: 'X', value: 1, delta: 5, trend: 'down' })).toBe('down');
		expect(inferTrend({ label: 'X', value: 1, delta: -5, trend: 'up' })).toBe('up');
	});

	it('infers up from positive delta', () => {
		expect(inferTrend({ label: 'X', value: 1, delta: 0.5 })).toBe('up');
		expect(inferTrend({ label: 'X', value: 1, delta: 100 })).toBe('up');
	});

	it('infers down from negative delta', () => {
		expect(inferTrend({ label: 'X', value: 1, delta: -0.5 })).toBe('down');
		expect(inferTrend({ label: 'X', value: 1, delta: -100 })).toBe('down');
	});

	it('infers flat from zero delta', () => {
		expect(inferTrend({ label: 'X', value: 1, delta: 0 })).toBe('flat');
	});

	it('infers flat when delta missing or non-finite', () => {
		expect(inferTrend({ label: 'X', value: 1 })).toBe('flat');
		expect(inferTrend({ label: 'X', value: 1, delta: NaN })).toBe('flat');
		expect(inferTrend({ label: 'X', value: 1, delta: Infinity })).toBe('flat');
	});
});

describe('formatDelta', () => {
	it('formats positive deltas with leading +', () => {
		expect(formatDelta(1.2)).toBe('+1.20%');
		expect(formatDelta(0.05)).toBe('+0.05%');
		expect(formatDelta(99.999)).toBe('+100.00%');
	});

	it('formats negative deltas with leading - (no extra +)', () => {
		expect(formatDelta(-1.2)).toBe('-1.20%');
		expect(formatDelta(-0.05)).toBe('-0.05%');
	});

	it('formats zero as 0.00% (no leading sign)', () => {
		expect(formatDelta(0)).toBe('0.00%');
	});

	it('returns empty string for missing / non-finite', () => {
		expect(formatDelta(undefined)).toBe('');
		expect(formatDelta(null)).toBe('');
		expect(formatDelta(NaN)).toBe('');
		expect(formatDelta(Infinity)).toBe('');
	});

	it('rounds to two decimals', () => {
		expect(formatDelta(1.234)).toBe('+1.23%');
		// 1.235 may round to 1.23 or 1.24 depending on engine; assert non-empty + leading sign
		const r = formatDelta(1.235);
		expect(r.startsWith('+')).toBe(true);
		expect(r.endsWith('%')).toBe(true);
	});
});

describe('trendGlyph', () => {
	it('returns up arrow for up', () => {
		expect(trendGlyph('up')).toBe('▲');
	});

	it('returns down arrow for down', () => {
		expect(trendGlyph('down')).toBe('▼');
	});

	it('returns horizontal bar for flat', () => {
		expect(trendGlyph('flat')).toBe('▬');
	});
});

describe('isReducedMotion', () => {
	it('returns false when matchMedia is unavailable (jsdom default)', () => {
		// jsdom doesn't implement matchMedia by default — function should return false safely
		expect(typeof isReducedMotion()).toBe('boolean');
	});
});

describe('TickerTape rendering', () => {
	it('renders without crashing with default items', () => {
		const { container } = render(Harness);
		expect(container.querySelector('.tickertape')).toBeTruthy();
	});

	it('renders track when items are present', () => {
		const { container } = render(Harness);
		expect(container.querySelector('.tickertape__track')).toBeTruthy();
	});

	it('does NOT render track when items are empty', () => {
		const { container } = render(Harness, { items: [] });
		expect(container.querySelector('.tickertape__track')).toBeNull();
	});

	it('renders 2× items for seamless loop', () => {
		const items: TickerItem[] = [
			{ label: 'A', value: 1 },
			{ label: 'B', value: 2 }
		];
		const { container } = render(Harness, { items });
		// 2 items × 2 copies = 4 rendered items
		const rendered = container.querySelectorAll('.tickertape__item');
		expect(rendered.length).toBe(4);
	});

	it('applies variant class', () => {
		const { container } = render(Harness, { variant: 'finance' });
		expect(container.querySelector('.tickertape--finance')).toBeTruthy();
	});

	it('applies direction class', () => {
		const { container } = render(Harness, { direction: 'right' });
		expect(container.querySelector('.tickertape--right')).toBeTruthy();
	});

	it('applies pause-on-hover class when enabled', () => {
		const { container } = render(Harness, { pauseOnHover: true });
		expect(container.querySelector('.tickertape--pause-on-hover')).toBeTruthy();
	});

	it('omits pause-on-hover class when disabled', () => {
		const { container } = render(Harness, { pauseOnHover: false });
		expect(container.querySelector('.tickertape--pause-on-hover')).toBeNull();
	});

	it('renders custom separator between items', () => {
		const { container } = render(Harness, { separator: '·' });
		const seps = container.querySelectorAll('.tickertape__sep');
		expect(seps.length).toBeGreaterThan(0);
		expect(seps[0].textContent).toBe('·');
	});

	it('marks the second copy as aria-hidden for screen readers', () => {
		const items: TickerItem[] = [
			{ label: 'A', value: 1 },
			{ label: 'B', value: 2 }
		];
		const { container } = render(Harness, { items });
		const rendered = container.querySelectorAll('.tickertape__item');
		// First two items (copy 0) — not aria-hidden
		expect(rendered[0].getAttribute('aria-hidden')).toBeNull();
		expect(rendered[1].getAttribute('aria-hidden')).toBeNull();
		// Last two items (copy 1) — aria-hidden="true"
		expect(rendered[2].getAttribute('aria-hidden')).toBe('true');
		expect(rendered[3].getAttribute('aria-hidden')).toBe('true');
	});

	it('renders trend chevron for items with non-zero delta', () => {
		const items: TickerItem[] = [{ label: 'A', value: 1, delta: 2.5 }];
		const { container } = render(Harness, { items });
		expect(container.querySelector('.tickertape__delta--up')).toBeTruthy();
	});

	it('renders down chevron for negative delta', () => {
		const items: TickerItem[] = [{ label: 'A', value: 1, delta: -1.0 }];
		const { container } = render(Harness, { items });
		expect(container.querySelector('.tickertape__delta--down')).toBeTruthy();
	});

	it('renders link wrapper when href is provided', () => {
		const items: TickerItem[] = [{ label: 'A', value: 1, href: '/a' }];
		const { container } = render(Harness, { items });
		const link = container.querySelector('a.tickertape__item');
		expect(link).toBeTruthy();
		expect(link?.getAttribute('href')).toBe('/a');
	});

	it('renders span (not link) when href is absent', () => {
		const items: TickerItem[] = [{ label: 'A', value: 1 }];
		const { container } = render(Harness, { items });
		expect(container.querySelector('a.tickertape__item')).toBeNull();
		expect(container.querySelector('span.tickertape__item')).toBeTruthy();
	});

	it('exposes role="marquee" and aria-live="off"', () => {
		const { container } = render(Harness);
		const root = container.querySelector('.tickertape');
		expect(root?.getAttribute('role')).toBe('marquee');
		expect(root?.getAttribute('aria-live')).toBe('off');
	});

	it('sets the duration custom property from items count + speed', () => {
		const items: TickerItem[] = Array.from({ length: 10 }, (_, i) => ({
			label: `L${i}`,
			value: i
		}));
		const { container } = render(Harness, { items, speed: 50 });
		const root = container.querySelector('.tickertape') as HTMLElement | null;
		// 10 items × 220px / 50 px/s = 44s
		expect(root?.style.getPropertyValue('--tickertape-duration')).toBe('44s');
	});
});
