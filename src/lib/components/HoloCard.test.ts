import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import {
	pickIntensity,
	pickPalette,
	clamp01,
	cursorAngle,
	hueAtAngle,
	sheenAtAngle,
	isReducedMotion
} from './HoloCard.svelte';
import HoloCard from './HoloCard.svelte';
import { tick } from 'svelte';

describe('pickIntensity', () => {
	it('returns subtle config for "subtle"', () => {
		const cfg = pickIntensity('subtle');
		expect(cfg.saturation).toBe(0.18);
		expect(cfg.sheenAlpha).toBe(0.25);
		expect(cfg.paletteSize).toBe(3);
	});

	it('returns iridescent config for "iridescent"', () => {
		const cfg = pickIntensity('iridescent');
		expect(cfg.saturation).toBe(0.32);
		expect(cfg.sheenAlpha).toBe(0.45);
		expect(cfg.paletteSize).toBe(5);
	});

	it('returns cosmic config for "cosmic"', () => {
		const cfg = pickIntensity('cosmic');
		expect(cfg.saturation).toBe(0.5);
		expect(cfg.sheenAlpha).toBe(0.6);
		expect(cfg.paletteSize).toBe(7);
	});

	it('falls back to iridescent for unknown name', () => {
		expect(pickIntensity('bogus')).toEqual(pickIntensity('iridescent'));
	});

	it('falls back to iridescent for null/undefined', () => {
		expect(pickIntensity(null)).toEqual(pickIntensity('iridescent'));
		expect(pickIntensity(undefined)).toEqual(pickIntensity('iridescent'));
	});

	it('saturation increases monotonically across intensities', () => {
		expect(pickIntensity('subtle').saturation).toBeLessThan(pickIntensity('iridescent').saturation);
		expect(pickIntensity('iridescent').saturation).toBeLessThan(pickIntensity('cosmic').saturation);
	});
});

describe('pickPalette', () => {
	it('returns rainbow palette for "rainbow"', () => {
		const p = pickPalette('rainbow');
		expect(p.length).toBeGreaterThanOrEqual(7);
		expect(p[0]).toMatch(/^#[0-9a-f]{6}$/i);
	});

	it('returns pastel palette for "pastel"', () => {
		const p = pickPalette('pastel');
		expect(p.length).toBeGreaterThanOrEqual(7);
	});

	it('returns cosmic palette for "cosmic"', () => {
		const p = pickPalette('cosmic');
		expect(p.length).toBeGreaterThanOrEqual(7);
	});

	it('returns gold palette for "gold"', () => {
		const p = pickPalette('gold');
		expect(p.length).toBeGreaterThanOrEqual(7);
	});

	it('falls back to rainbow for unknown name', () => {
		expect(pickPalette('bogus')).toEqual(pickPalette('rainbow'));
	});

	it('falls back to rainbow for null/undefined', () => {
		expect(pickPalette(null)).toEqual(pickPalette('rainbow'));
		expect(pickPalette(undefined)).toEqual(pickPalette('rainbow'));
	});

	it('first and last colors match (closes the gradient ring)', () => {
		for (const name of ['rainbow', 'pastel', 'cosmic', 'gold'] as const) {
			const p = pickPalette(name);
			expect(p[0]).toBe(p[p.length - 1]);
		}
	});
});

describe('clamp01', () => {
	it('returns value unchanged when in [0, 1]', () => {
		expect(clamp01(0)).toBe(0);
		expect(clamp01(0.5)).toBe(0.5);
		expect(clamp01(1)).toBe(1);
	});

	it('clamps below zero', () => {
		expect(clamp01(-0.1)).toBe(0);
		expect(clamp01(-100)).toBe(0);
	});

	it('clamps above one', () => {
		expect(clamp01(1.5)).toBe(1);
		expect(clamp01(99)).toBe(1);
	});

	it('returns 0 for NaN', () => {
		expect(clamp01(NaN)).toBe(0);
	});

	it('returns 0 for Infinity / -Infinity', () => {
		expect(clamp01(Infinity)).toBe(0);
		expect(clamp01(-Infinity)).toBe(0);
	});
});

describe('cursorAngle', () => {
	const rect = { left: 0, top: 0, width: 100, height: 100 };

	it('returns 0° for cursor due east of center', () => {
		// center is (50, 50). East = (150, 50). atan2(0, 100) = 0 → 0°.
		expect(cursorAngle(150, 50, rect)).toBeCloseTo(0, 5);
	});

	it('returns 90° for cursor due south of center', () => {
		// south = (50, 150). atan2(100, 0) = π/2 → 90°.
		expect(cursorAngle(50, 150, rect)).toBeCloseTo(90, 5);
	});

	it('returns 180° for cursor due west of center', () => {
		// west = (-50, 50). atan2(0, -100) = π → 180°.
		expect(cursorAngle(-50, 50, rect)).toBeCloseTo(180, 5);
	});

	it('returns 270° for cursor due north of center', () => {
		// north = (50, -50). atan2(-100, 0) = -π/2 → -90° → +360 = 270°.
		expect(cursorAngle(50, -50, rect)).toBeCloseTo(270, 5);
	});

	it('returns 0° for cursor exactly at center (atan2(0,0) = 0)', () => {
		expect(cursorAngle(50, 50, rect)).toBeCloseTo(0, 5);
	});

	it('result is always in [0, 360)', () => {
		for (let x = -200; x <= 200; x += 25) {
			for (let y = -200; y <= 200; y += 25) {
				const a = cursorAngle(x, y, rect);
				expect(a).toBeGreaterThanOrEqual(0);
				expect(a).toBeLessThan(360);
			}
		}
	});

	it('handles offset rect (not at origin)', () => {
		const offsetRect = { left: 100, top: 200, width: 50, height: 50 };
		// center = (125, 225). East of center = (200, 225). atan2(0, 75) = 0 → 0°.
		expect(cursorAngle(200, 225, offsetRect)).toBeCloseTo(0, 5);
	});
});

describe('hueAtAngle', () => {
	it('returns 0 for angle 0 at any palette size', () => {
		expect(hueAtAngle(0, 1)).toBe(0);
		expect(hueAtAngle(0, 5)).toBe(0);
	});

	it('result is in [0, 360)', () => {
		for (let a = 0; a < 360; a += 5) {
			for (const size of [1, 3, 5, 7, 12]) {
				const h = hueAtAngle(a, size);
				expect(h).toBeGreaterThanOrEqual(0);
				expect(h).toBeLessThan(360);
			}
		}
	});

	it('clamps paletteSize at lower bound (1)', () => {
		expect(hueAtAngle(180, 0)).toBe(180);
		expect(hueAtAngle(180, -5)).toBe(180);
	});

	it('clamps paletteSize at upper bound (8)', () => {
		// At paletteSize=20 should behave same as paletteSize=8.
		expect(hueAtAngle(45, 20)).toBe(hueAtAngle(45, 8));
	});

	it('higher paletteSize cycles through hues faster', () => {
		// With paletteSize=2, angle 90 should give hue 180 (90*2 mod 360).
		expect(hueAtAngle(90, 2)).toBeCloseTo(180, 5);
		// With paletteSize=4, angle 90 should give hue 0 (90*4=360 mod 360).
		expect(hueAtAngle(90, 4)).toBeCloseTo(0, 5);
	});

	it('is deterministic per (angle, paletteSize)', () => {
		expect(hueAtAngle(123, 5)).toBe(hueAtAngle(123, 5));
	});
});

describe('sheenAtAngle', () => {
	const cfg = pickIntensity('iridescent');

	it('peak sheen at angle 90° (sin = 1)', () => {
		expect(sheenAtAngle(90, cfg)).toBeCloseTo(cfg.sheenAlpha, 5);
	});

	it('zero-ish sheen at angle 0°', () => {
		// sin(0)*0.5 + 0.5 = 0.5; * sheenAlpha
		expect(sheenAtAngle(0, cfg)).toBeCloseTo(0.5 * cfg.sheenAlpha, 5);
	});

	it('zero sheen at angle 270° (sin = -1, becomes 0)', () => {
		expect(sheenAtAngle(270, cfg)).toBeCloseTo(0, 5);
	});

	it('result is in [0, sheenAlpha]', () => {
		for (let a = 0; a < 360; a += 7) {
			const s = sheenAtAngle(a, cfg);
			expect(s).toBeGreaterThanOrEqual(0);
			expect(s).toBeLessThanOrEqual(cfg.sheenAlpha + 1e-9);
		}
	});

	it('higher intensity sheenAlpha gives higher peak', () => {
		const cosmicCfg = pickIntensity('cosmic');
		expect(sheenAtAngle(90, cosmicCfg)).toBeGreaterThan(sheenAtAngle(90, cfg));
	});

	it('is deterministic per (angle, intensity)', () => {
		expect(sheenAtAngle(45, cfg)).toBe(sheenAtAngle(45, cfg));
	});
});

describe('isReducedMotion', () => {
	const origMatchMedia = window.matchMedia;

	afterEach(() => {
		window.matchMedia = origMatchMedia;
	});

	it('returns false when matchMedia reports no preference', () => {
		window.matchMedia = vi.fn().mockReturnValue({
			matches: false,
			media: '(prefers-reduced-motion: reduce)',
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
			dispatchEvent: vi.fn()
		}) as unknown as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(false);
	});

	it('returns true when matchMedia reports reduce preference', () => {
		window.matchMedia = vi.fn().mockReturnValue({
			matches: true,
			media: '(prefers-reduced-motion: reduce)',
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
			dispatchEvent: vi.fn()
		}) as unknown as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(true);
	});
});

describe('HoloCard component', () => {
	beforeEach(() => {
		window.matchMedia = vi.fn().mockReturnValue({
			matches: false,
			media: '',
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
			dispatchEvent: vi.fn()
		}) as unknown as typeof window.matchMedia;
	});

	it('renders default with iridescent intensity and rainbow palette', () => {
		const { container } = render(HoloCard);
		const root = container.querySelector('.holo') as HTMLElement;
		expect(root).not.toBeNull();
		expect(root.dataset.intensity).toBe('iridescent');
		expect(root.dataset.palette).toBe('rainbow');
	});

	it('reflects custom intensity and palette', () => {
		const { container } = render(HoloCard, { intensity: 'cosmic', palette: 'gold' });
		const root = container.querySelector('.holo') as HTMLElement;
		expect(root.dataset.intensity).toBe('cosmic');
		expect(root.dataset.palette).toBe('gold');
	});

	it('mounts foil and sheen overlays as aria-hidden', () => {
		const { container } = render(HoloCard);
		const foil = container.querySelector('.holo-foil');
		const sheen = container.querySelector('.holo-sheen');
		expect(foil).not.toBeNull();
		expect(sheen).not.toBeNull();
		expect(foil?.getAttribute('aria-hidden')).toBe('true');
		expect(sheen?.getAttribute('aria-hidden')).toBe('true');
	});

	it('updates --holo-hue style on pointer move when not reduced', async () => {
		const { container } = render(HoloCard);
		const root = container.querySelector('.holo') as HTMLElement;
		root.getBoundingClientRect = () =>
			({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
		await fireEvent.pointerMove(root, { clientX: 150, clientY: 50 });
		await tick();
		expect(root.style.cssText).toMatch(/--holo-hue:\s*0deg/);
	});

	it('resets hue and sheen on pointer leave', async () => {
		const { container } = render(HoloCard);
		const root = container.querySelector('.holo') as HTMLElement;
		root.getBoundingClientRect = () =>
			({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
		await fireEvent.pointerMove(root, { clientX: 50, clientY: 150 });
		await tick();
		await fireEvent.pointerLeave(root);
		await tick();
		expect(root.style.cssText).toMatch(/--holo-hue:\s*0deg/);
		expect(root.style.cssText).toMatch(/--holo-sheen:\s*0/);
	});

	it('marks reduced and ignores pointer move under prefers-reduced-motion', async () => {
		window.matchMedia = vi.fn().mockReturnValue({
			matches: true,
			media: '(prefers-reduced-motion: reduce)',
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
			dispatchEvent: vi.fn()
		}) as unknown as typeof window.matchMedia;
		const { container } = render(HoloCard);
		await tick();
		const root = container.querySelector('.holo') as HTMLElement;
		expect(root.classList.contains('reduced')).toBe(true);
		root.getBoundingClientRect = () =>
			({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
		await fireEvent.pointerMove(root, { clientX: 50, clientY: 150 });
		await tick();
		expect(root.style.cssText).toMatch(/--holo-hue:\s*0deg/);
	});

	it('writes saturation as a CSS variable', () => {
		const { container } = render(HoloCard, { intensity: 'subtle' });
		const root = container.querySelector('.holo') as HTMLElement;
		expect(root.style.cssText).toMatch(/--holo-saturation:\s*0\.18/);
	});

	it('foil background contains conic-gradient with current hue', () => {
		const { container } = render(HoloCard);
		const foil = container.querySelector('.holo-foil') as HTMLElement;
		expect(foil.style.cssText).toMatch(/conic-gradient/);
		expect(foil.style.cssText).toMatch(/from\s+0deg/);
	});
});
