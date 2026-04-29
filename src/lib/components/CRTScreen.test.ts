import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import CRTScreen, {
	pickProfile,
	buildScanlineGradient,
	buildAberrationShadow,
	rollSchedule,
	isReducedMotion
} from './CRTScreen.svelte';

describe('pickProfile', () => {
	it('resolves each named profile', () => {
		for (const n of ['amber', 'green', 'broadcast', 'modern']) {
			const p = pickProfile(n);
			expect(p.name).toBe(n);
			expect(p.fg.startsWith('#')).toBe(true);
			expect(p.bg.startsWith('#')).toBe(true);
		}
	});

	it('falls back to amber on unknown input', () => {
		expect(pickProfile('mystery').name).toBe('amber');
		expect(pickProfile('').name).toBe('amber');
	});

	it('returns palettes with matching channel pairs', () => {
		const broadcast = pickProfile('broadcast');
		expect(broadcast.aberrationR).toContain('rgba');
		expect(broadcast.aberrationB).toContain('rgba');
		expect(broadcast.aberrationR).not.toBe(broadcast.aberrationB);
	});
});

describe('buildScanlineGradient', () => {
	it('uses repeating-linear-gradient at 0deg', () => {
		const css = buildScanlineGradient(1, 3, pickProfile('amber'));
		expect(css.startsWith('repeating-linear-gradient(0deg')).toBe(true);
	});

	it('clamps density to a positive integer', () => {
		const css = buildScanlineGradient(1, 0.4, pickProfile('amber'));
		expect(css).toMatch(/transparent \d+px\)/);
		// no negative pixel values produced from sub-1 density
		expect(css).not.toMatch(/\s-\d/);
	});

	it('clamps intensity to [0, 1]', () => {
		const a = buildScanlineGradient(2, 4, pickProfile('amber'));
		const b = buildScanlineGradient(1, 4, pickProfile('amber'));
		expect(a).toBe(b);
	});

	it('drops the line height to zero at zero intensity', () => {
		const css = buildScanlineGradient(0, 4, pickProfile('amber'));
		expect(css).toContain('0px, transparent 0px');
	});

	it('embeds the profile-specific scan colour', () => {
		const profile = pickProfile('green');
		const css = buildScanlineGradient(1, 3, profile);
		expect(css).toContain(profile.scan);
	});

	it('produces different output for different densities', () => {
		const profile = pickProfile('amber');
		const a = buildScanlineGradient(1, 2, profile);
		const b = buildScanlineGradient(1, 8, profile);
		expect(a).not.toBe(b);
	});
});

describe('buildAberrationShadow', () => {
	it('returns "none" at zero amount', () => {
		expect(buildAberrationShadow(0, pickProfile('amber'))).toBe('none');
	});

	it('embeds both R and B channel offsets at amount > 0', () => {
		const profile = pickProfile('broadcast');
		const css = buildAberrationShadow(1.5, profile);
		expect(css).toContain('1.50px');
		expect(css).toContain('-1.50px');
		expect(css).toContain(profile.aberrationR);
		expect(css).toContain(profile.aberrationB);
	});

	it('clamps negative amounts to zero', () => {
		expect(buildAberrationShadow(-3, pickProfile('amber'))).toBe('none');
	});

	it('scales offsets with the amount prop', () => {
		const a = buildAberrationShadow(1, pickProfile('amber'));
		const b = buildAberrationShadow(3, pickProfile('amber'));
		expect(a).toContain('1.00px');
		expect(b).toContain('3.00px');
	});
});

describe('rollSchedule', () => {
	it('disables the animation at speed 0', () => {
		expect(rollSchedule(0)).toEqual({ duration: '0s', animationName: 'none' });
	});

	it('clamps negative speed to disabled', () => {
		expect(rollSchedule(-2).animationName).toBe('none');
	});

	it('produces shorter durations as speed increases', () => {
		const slow = rollSchedule(1);
		const fast = rollSchedule(10);
		expect(parseFloat(slow.duration)).toBeGreaterThan(parseFloat(fast.duration));
	});

	it('clamps speeds above 10 to the speed-10 schedule', () => {
		expect(rollSchedule(99).duration).toBe(rollSchedule(10).duration);
	});

	it('uses the static keyframe name when active', () => {
		expect(rollSchedule(3).animationName).toBe('crt-roll');
	});
});

describe('isReducedMotion', () => {
	const original = window.matchMedia;
	afterEach(() => {
		window.matchMedia = original;
	});

	it('returns matchMedia result when available', () => {
		window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(true);
		window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(false);
	});
});

describe('CRTScreen component', () => {
	beforeEach(() => {
		window.matchMedia = vi.fn().mockReturnValue({
			matches: false,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}) as unknown as typeof window.matchMedia;
	});

	it('renders the screen scaffolding', () => {
		const { container } = render(CRTScreen, { props: { profile: 'amber' } });
		expect(container.querySelector('.crt-root')).toBeTruthy();
		expect(container.querySelector('.crt-screen')).toBeTruthy();
		expect(container.querySelector('.crt-content')).toBeTruthy();
		expect(container.querySelector('.crt-scanlines')).toBeTruthy();
	});

	it('exposes the profile via data-profile', () => {
		const { container } = render(CRTScreen, { props: { profile: 'green' } });
		expect(container.querySelector('.crt-root')?.getAttribute('data-profile')).toBe('green');
	});

	it('falls back to amber when the profile name is unknown', () => {
		const { container } = render(CRTScreen, {
			// @ts-expect-error: deliberate unknown
			props: { profile: 'mystery' }
		});
		expect(container.querySelector('.crt-root')?.getAttribute('data-profile')).toBe('amber');
	});

	it('toggles the curved class', () => {
		const { container } = render(CRTScreen, { props: { profile: 'amber', curved: true } });
		expect(container.querySelector('.crt-root')?.classList.contains('crt-curved')).toBe(true);
	});

	it('omits the vignette layer when vignette=false', () => {
		const { container } = render(CRTScreen, { props: { profile: 'amber', vignette: false } });
		expect(container.querySelector('.crt-vignette-layer')).toBeNull();
		expect(container.querySelector('.crt-root')?.classList.contains('crt-vignette')).toBe(false);
	});

	it('appends extra class names without dropping built-ins', () => {
		const { container } = render(CRTScreen, {
			props: { profile: 'amber', class: 'custom-tag' }
		});
		const root = container.querySelector('.crt-root');
		expect(root?.classList.contains('custom-tag')).toBe(true);
		expect(root?.classList.contains('crt-root')).toBe(true);
	});

	it('treats roll=true as a default-speed roll', () => {
		const { container } = render(CRTScreen, { props: { profile: 'amber', roll: true } });
		const root = container.querySelector('.crt-root') as HTMLElement;
		expect(root.style.getPropertyValue('--crt-roll-name')).toBe('crt-roll');
		expect(root.style.getPropertyValue('--crt-roll-duration')).not.toBe('0s');
	});

	it('treats roll=false as no roll', () => {
		const { container } = render(CRTScreen, { props: { profile: 'amber', roll: false } });
		const root = container.querySelector('.crt-root') as HTMLElement;
		expect(root.style.getPropertyValue('--crt-roll-name')).toBe('none');
		expect(root.style.getPropertyValue('--crt-roll-duration')).toBe('0s');
	});

	it('honours numeric roll speed', () => {
		const { container } = render(CRTScreen, { props: { profile: 'amber', roll: 6 } });
		const root = container.querySelector('.crt-root') as HTMLElement;
		const slow = render(CRTScreen, { props: { profile: 'amber', roll: 1 } });
		const slowRoot = slow.container.querySelector('.crt-root') as HTMLElement;
		expect(parseFloat(root.style.getPropertyValue('--crt-roll-duration'))).toBeLessThan(
			parseFloat(slowRoot.style.getPropertyValue('--crt-roll-duration'))
		);
	});
});
