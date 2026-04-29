import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import NeonSign, {
	pickPalette,
	buildShadowStack,
	flickerSchedule,
	brokenMask,
	isReducedMotion
} from './NeonSign.svelte';

describe('pickPalette', () => {
	it('resolves each named palette', () => {
		for (const n of ['pink', 'cyan', 'yellow', 'green', 'red', 'purple']) {
			const p = pickPalette(n);
			expect(p.name).toBe(n);
			expect(p.glow.startsWith('#')).toBe(true);
			expect(p.halo.startsWith('rgba')).toBe(true);
		}
	});

	it('falls back to pink on unknown input', () => {
		expect(pickPalette('mystery').name).toBe('pink');
		expect(pickPalette('').name).toBe('pink');
	});

	it('returns identical references for the same name', () => {
		const a = pickPalette('cyan');
		const b = pickPalette('cyan');
		expect(a).toEqual(b);
	});
});

describe('buildShadowStack', () => {
	it('produces five shadow stops at intensity 1', () => {
		const css = buildShadowStack(pickPalette('pink'), 1);
		const stops = css.match(/0 0 \d+\.\d+px/g) ?? [];
		expect(stops.length).toBe(5);
		expect(css).toContain('#fff');
		expect(css).toContain('#ff3aa9');
	});

	it('scales blur radii with intensity', () => {
		const a = buildShadowStack(pickPalette('cyan'), 1);
		const b = buildShadowStack(pickPalette('cyan'), 2);
		expect(a).toContain('2.00px');
		expect(b).toContain('4.00px');
		expect(b).toContain('64.00px');
	});

	it('clamps negative intensity to zero', () => {
		const css = buildShadowStack(pickPalette('green'), -3);
		expect(css).toContain('0.00px');
		expect(css).not.toContain('-');
	});

	it('uses palette halo for the outermost two stops', () => {
		const palette = pickPalette('yellow');
		const css = buildShadowStack(palette, 1);
		expect(css).toContain(palette.halo);
	});
});

describe('flickerSchedule', () => {
	it('returns a flat 0/100 schedule for profile=none', () => {
		const stops = flickerSchedule(1, 'none');
		expect(stops.length).toBe(2);
		expect(stops[0]).toEqual({ pct: 0, opacity: 1 });
		expect(stops[1]).toEqual({ pct: 100, opacity: 1 });
	});

	it('emits more dips for broken than for subtle', () => {
		const subtle = flickerSchedule(11, 'subtle');
		const broken = flickerSchedule(11, 'broken');
		const subtleDips = subtle.filter((s) => s.opacity < 0.95).length;
		const brokenDips = broken.filter((s) => s.opacity < 0.95).length;
		expect(brokenDips).toBeGreaterThan(subtleDips);
	});

	it('subtle dips stay shallower than broken dips', () => {
		const subtle = flickerSchedule(11, 'subtle');
		const broken = flickerSchedule(11, 'broken');
		const minSubtle = Math.min(...subtle.map((s) => s.opacity));
		const minBroken = Math.min(...broken.map((s) => s.opacity));
		expect(minSubtle).toBeGreaterThanOrEqual(0.7);
		expect(minBroken).toBeLessThan(minSubtle);
	});

	it('is deterministic for the same seed', () => {
		expect(flickerSchedule(42, 'subtle')).toEqual(flickerSchedule(42, 'subtle'));
		expect(flickerSchedule(42, 'broken')).toEqual(flickerSchedule(42, 'broken'));
	});

	it('produces different schedules for different seeds', () => {
		const a = flickerSchedule(1, 'subtle');
		const b = flickerSchedule(99, 'subtle');
		expect(a).not.toEqual(b);
	});

	it('always begins at 0% and ends at 100% with full opacity', () => {
		const stops = flickerSchedule(7, 'broken');
		expect(stops[0]).toEqual({ pct: 0, opacity: 1 });
		const last = stops[stops.length - 1];
		expect(last.pct).toBe(100);
		expect(last.opacity).toBe(1);
	});

	it('keeps every percent within [0, 100]', () => {
		const stops = flickerSchedule(123, 'broken');
		for (const s of stops) {
			expect(s.pct).toBeGreaterThanOrEqual(0);
			expect(s.pct).toBeLessThanOrEqual(100);
		}
	});

	it('handles a zero seed without crashing', () => {
		const stops = flickerSchedule(0, 'subtle');
		expect(stops.length).toBeGreaterThan(2);
	});
});

describe('brokenMask', () => {
	it('returns an all-false mask when no indices are broken', () => {
		const m = brokenMask('OPEN', []);
		expect(m).toEqual([false, false, false, false]);
	});

	it('marks the requested indices', () => {
		expect(brokenMask('VACANCY', [0, 2])).toEqual([true, false, true, false, false, false, false]);
	});

	it('ignores out-of-range and negative indices', () => {
		expect(brokenMask('OPEN', [-1, 99, 1])).toEqual([false, true, false, false]);
	});

	it('ignores non-integer indices', () => {
		expect(brokenMask('OPEN', [1.5 as number, 1])).toEqual([false, true, false, false]);
	});

	it('preserves length for an empty value', () => {
		expect(brokenMask('', [0, 1])).toEqual([]);
	});
});

describe('isReducedMotion', () => {
	const original = window.matchMedia;
	afterEach(() => {
		window.matchMedia = original;
	});

	it('returns the matchMedia result when available', () => {
		window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(true);
		window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(false);
	});
});

describe('NeonSign component', () => {
	beforeEach(() => {
		window.matchMedia = vi.fn().mockReturnValue({
			matches: false,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}) as unknown as typeof window.matchMedia;
	});

	it('renders one .neon-char per character', () => {
		const { container } = render(NeonSign, { props: { value: 'OPEN' } });
		expect(container.querySelectorAll('.neon-char').length).toBe(4);
	});

	it('reflects the value via aria-label', () => {
		render(NeonSign, { props: { value: 'CLOSED' } });
		expect(screen.getByLabelText('CLOSED')).toBeTruthy();
	});

	it('marks broken indices with the neon-broken class', () => {
		const { container } = render(NeonSign, {
			props: { value: 'OPEN', broken: [0, 2] }
		});
		const chars = container.querySelectorAll('.neon-char');
		expect(chars[0].classList.contains('neon-broken')).toBe(true);
		expect(chars[1].classList.contains('neon-broken')).toBe(false);
		expect(chars[2].classList.contains('neon-broken')).toBe(true);
	});

	it('toggles the off class when on=false', () => {
		const { container } = render(NeonSign, { props: { value: 'OPEN', on: false } });
		const root = container.querySelector('.neon-root');
		expect(root?.classList.contains('neon-off')).toBe(true);
		expect(root?.classList.contains('neon-on')).toBe(false);
	});

	it('exposes the chosen colour via data-colour', () => {
		const { container } = render(NeonSign, { props: { value: 'GO', colour: 'green' } });
		expect(container.querySelector('.neon-root')?.getAttribute('data-colour')).toBe('green');
	});

	it('falls back to pink when an unknown colour is passed', () => {
		const { container } = render(NeonSign, {
			// @ts-expect-error: deliberate unknown
			props: { value: 'GO', colour: 'mystery' }
		});
		expect(container.querySelector('.neon-root')?.getAttribute('data-colour')).toBe('pink');
	});

	it('applies the size class', () => {
		const { container } = render(NeonSign, { props: { value: 'GO', size: 'lg' } });
		expect(container.querySelector('.neon-size-lg')).toBeTruthy();
	});

	it('exposes the flicker profile via data-flicker', () => {
		const { container } = render(NeonSign, {
			props: { value: 'GO', flicker: 'broken' }
		});
		expect(container.querySelector('.neon-root')?.getAttribute('data-flicker')).toBe('broken');
	});

	it('appends extra class names without dropping built-ins', () => {
		const { container } = render(NeonSign, {
			props: { value: 'GO', class: 'custom-tag' }
		});
		const root = container.querySelector('.neon-root');
		expect(root?.classList.contains('custom-tag')).toBe(true);
		expect(root?.classList.contains('neon-size-md')).toBe(true);
	});
});
