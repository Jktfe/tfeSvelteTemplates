import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';

import ElectricBorder, {
	pickIntensity,
	pickPalette,
	clamp01,
	clampPositive,
	nextFilterId,
	resetFilterCounterForTesting,
	frequencyValuesString,
	isReducedMotion
} from './ElectricBorder.svelte';

describe('pickIntensity', () => {
	it('returns mild config for "mild"', () => {
		const cfg = pickIntensity('mild');
		expect(cfg.frequency).toBeCloseTo(0.015);
		expect(cfg.distortion).toBe(3);
		expect(cfg.strokeWidth).toBe(2);
	});

	it('returns crackling config for "crackling"', () => {
		const cfg = pickIntensity('crackling');
		expect(cfg.frequency).toBeCloseTo(0.03);
		expect(cfg.distortion).toBe(6);
	});

	it('returns lightning config for "lightning"', () => {
		const cfg = pickIntensity('lightning');
		expect(cfg.frequency).toBeCloseTo(0.06);
		expect(cfg.distortion).toBe(12);
		expect(cfg.strokeWidth).toBe(3);
	});

	it('falls back to crackling for unknown name', () => {
		expect(pickIntensity('nope').frequency).toBeCloseTo(0.03);
	});

	it('falls back to crackling for null/undefined', () => {
		expect(pickIntensity(null).frequency).toBeCloseTo(0.03);
		expect(pickIntensity(undefined).frequency).toBeCloseTo(0.03);
	});

	it('distortion increases monotonically across intensities', () => {
		expect(pickIntensity('mild').distortion).toBeLessThan(pickIntensity('crackling').distortion);
		expect(pickIntensity('crackling').distortion).toBeLessThan(
			pickIntensity('lightning').distortion
		);
	});

	it('animation speed decreases (faster) at higher intensity', () => {
		expect(pickIntensity('mild').animSpeed).toBeGreaterThan(pickIntensity('crackling').animSpeed);
		expect(pickIntensity('crackling').animSpeed).toBeGreaterThan(
			pickIntensity('lightning').animSpeed
		);
	});
});

describe('pickPalette', () => {
	it('returns electric-blue palette', () => {
		const p = pickPalette('electric-blue');
		expect(p.stroke).toBe('#00bfff');
		expect(p.glow).toBe('#0080ff');
	});

	it('returns plasma-purple palette', () => {
		const p = pickPalette('plasma-purple');
		expect(p.stroke).toBe('#c77dff');
		expect(p.glow).toBe('#9d00ff');
	});

	it('returns volt-yellow palette', () => {
		const p = pickPalette('volt-yellow');
		expect(p.stroke).toBe('#ffea00');
		expect(p.glow).toBe('#ffd60a');
	});

	it('falls back to electric-blue for unknown name', () => {
		expect(pickPalette('nope').stroke).toBe('#00bfff');
	});

	it('falls back to electric-blue for null/undefined', () => {
		expect(pickPalette(null).stroke).toBe('#00bfff');
		expect(pickPalette(undefined).stroke).toBe('#00bfff');
	});

	it('all palettes provide stroke, glow, and highlight', () => {
		for (const name of ['electric-blue', 'plasma-purple', 'volt-yellow'] as const) {
			const p = pickPalette(name);
			expect(p.stroke).toMatch(/^#[0-9a-f]{6}$/i);
			expect(p.glow).toMatch(/^#[0-9a-f]{6}$/i);
			expect(p.highlight).toMatch(/^#[0-9a-f]{6}$/i);
		}
	});
});

describe('clamp01', () => {
	it('returns the value when in [0,1]', () => {
		expect(clamp01(0)).toBe(0);
		expect(clamp01(0.5)).toBe(0.5);
		expect(clamp01(1)).toBe(1);
	});

	it('clamps below zero to zero', () => {
		expect(clamp01(-0.1)).toBe(0);
		expect(clamp01(-100)).toBe(0);
	});

	it('clamps above one to one', () => {
		expect(clamp01(1.1)).toBe(1);
		expect(clamp01(1000)).toBe(1);
	});

	it('returns 0 for NaN and Infinity', () => {
		expect(clamp01(Number.NaN)).toBe(0);
		expect(clamp01(Number.POSITIVE_INFINITY)).toBe(0);
		expect(clamp01(Number.NEGATIVE_INFINITY)).toBe(0);
	});
});

describe('clampPositive', () => {
	it('returns the value when in [0, max]', () => {
		expect(clampPositive(5)).toBe(5);
		expect(clampPositive(0)).toBe(0);
		expect(clampPositive(0.3, 1)).toBe(0.3);
	});

	it('clamps negative to zero', () => {
		expect(clampPositive(-7)).toBe(0);
	});

	it('clamps above max to max', () => {
		expect(clampPositive(10, 5)).toBe(5);
	});

	it('returns 0 for NaN and Infinity', () => {
		expect(clampPositive(Number.NaN)).toBe(0);
		expect(clampPositive(Number.POSITIVE_INFINITY, 1)).toBe(0);
	});
});

describe('nextFilterId', () => {
	beforeEach(() => {
		resetFilterCounterForTesting();
	});

	it('returns prefixed unique ids on each call', () => {
		const a = nextFilterId('ec');
		const b = nextFilterId('ec');
		expect(a).toBe('ec-1');
		expect(b).toBe('ec-2');
		expect(a).not.toBe(b);
	});

	it('uses default prefix when not given', () => {
		const id = nextFilterId();
		expect(id).toMatch(/^ec-\d+$/);
	});

	it('respects custom prefix', () => {
		const id = nextFilterId('zap');
		expect(id.startsWith('zap-')).toBe(true);
	});
});

describe('frequencyValuesString', () => {
	it('returns a 3-stop semicolon string with peak ~2.2x', () => {
		const s = frequencyValuesString(0.03);
		const parts = s.split(';').map(Number);
		expect(parts).toHaveLength(3);
		expect(parts[0]).toBeCloseTo(0.03, 4);
		expect(parts[1]).toBeCloseTo(0.066, 3);
		expect(parts[2]).toBeCloseTo(0.03, 4);
	});

	it('first and last stops match for seamless loop', () => {
		const s = frequencyValuesString(0.05);
		const parts = s.split(';');
		expect(parts[0]).toBe(parts[2]);
	});

	it('clamps base to [0, 1]', () => {
		const s = frequencyValuesString(-0.1);
		const parts = s.split(';').map(Number);
		expect(parts[0]).toBe(0);
		expect(parts[1]).toBe(0);
	});

	it('caps peak at 1.0', () => {
		const s = frequencyValuesString(0.9);
		const parts = s.split(';').map(Number);
		expect(parts[1]).toBeLessThanOrEqual(1);
	});
});

describe('isReducedMotion', () => {
	it('returns false when matchMedia not present', () => {
		const orig = window.matchMedia;
		// @ts-expect-error — simulate missing API
		delete window.matchMedia;
		expect(isReducedMotion()).toBe(false);
		window.matchMedia = orig;
	});

	it('returns true when prefers-reduced-motion: reduce matches', () => {
		const original = window.matchMedia;
		window.matchMedia = vi.fn().mockImplementation((q: string) => ({
			matches: q === '(prefers-reduced-motion: reduce)',
			media: q,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}));
		expect(isReducedMotion()).toBe(true);
		window.matchMedia = original;
	});

	it('returns false when matchMedia matches false', () => {
		const original = window.matchMedia;
		window.matchMedia = vi.fn().mockImplementation((q: string) => ({
			matches: false,
			media: q,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}));
		expect(isReducedMotion()).toBe(false);
		window.matchMedia = original;
	});
});

describe('ElectricBorder component', () => {
	beforeEach(() => {
		resetFilterCounterForTesting();
		const original = window.matchMedia;
		window.matchMedia = vi.fn().mockImplementation((q: string) => ({
			matches: false,
			media: q,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}));
		return () => {
			window.matchMedia = original;
		};
	});

	it('renders the wrapper with default data attributes', () => {
		const { container } = render(ElectricBorder);
		const wrapper = container.querySelector('.electric-wrapper');
		expect(wrapper).not.toBeNull();
		expect(wrapper?.getAttribute('data-intensity')).toBe('crackling');
		expect(wrapper?.getAttribute('data-palette')).toBe('electric-blue');
	});

	it('respects intensity prop', () => {
		const { container } = render(ElectricBorder, { props: { intensity: 'lightning' } });
		const wrapper = container.querySelector('.electric-wrapper');
		expect(wrapper?.getAttribute('data-intensity')).toBe('lightning');
	});

	it('respects palette prop', () => {
		const { container } = render(ElectricBorder, { props: { palette: 'plasma-purple' } });
		const wrapper = container.querySelector('.electric-wrapper');
		expect(wrapper?.getAttribute('data-palette')).toBe('plasma-purple');
		const style = (wrapper?.getAttribute('style') ?? '').replace(/\s+/g, '');
		expect(style).toContain('--ec-stroke:#c77dff');
	});

	it('applies CSS custom properties for stroke and glow', () => {
		const { container } = render(ElectricBorder, { props: { palette: 'volt-yellow' } });
		const style = (
			container.querySelector('.electric-wrapper')?.getAttribute('style') ?? ''
		).replace(/\s+/g, '');
		expect(style).toContain('--ec-stroke:#ffea00');
		expect(style).toContain('--ec-glow:#ffd60a');
	});

	it('renders an aria-hidden SVG border', () => {
		const { container } = render(ElectricBorder);
		const svg = container.querySelector('svg.electric-border-svg');
		expect(svg).not.toBeNull();
		expect(svg?.getAttribute('aria-hidden')).toBe('true');
	});

	it('SVG contains a filter and a stroked rect', () => {
		const { container } = render(ElectricBorder);
		expect(container.querySelector('svg filter')).not.toBeNull();
		expect(container.querySelector('svg feTurbulence')).not.toBeNull();
		expect(container.querySelector('svg feDisplacementMap')).not.toBeNull();
		const rect = container.querySelector('svg rect');
		expect(rect).not.toBeNull();
		expect(rect?.getAttribute('vector-effect')).toBe('non-scaling-stroke');
	});

	it('animation element exists when reduced-motion is off', async () => {
		const { container } = render(ElectricBorder);
		await tick();
		expect(container.querySelector('animate')).not.toBeNull();
	});

	it('animation element is removed when prefers-reduced-motion is set', async () => {
		const original = window.matchMedia;
		window.matchMedia = vi.fn().mockImplementation((q: string) => ({
			matches: q === '(prefers-reduced-motion: reduce)',
			media: q,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}));
		const { container } = render(ElectricBorder);
		await tick();
		await tick();
		const wrapper = container.querySelector('.electric-wrapper');
		expect(wrapper?.classList.contains('reduced')).toBe(true);
		expect(container.querySelector('animate')).toBeNull();
		window.matchMedia = original;
	});

	it('feDisplacementMap scale is zero under reduced motion', async () => {
		const original = window.matchMedia;
		window.matchMedia = vi.fn().mockImplementation((q: string) => ({
			matches: q === '(prefers-reduced-motion: reduce)',
			media: q,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}));
		const { container } = render(ElectricBorder);
		await tick();
		await tick();
		const dm = container.querySelector('feDisplacementMap');
		expect(dm?.getAttribute('scale')).toBe('0');
		window.matchMedia = original;
	});

	it('respects radius prop in CSS variable', () => {
		const { container } = render(ElectricBorder, { props: { radius: 24 } });
		const style = (
			container.querySelector('.electric-wrapper')?.getAttribute('style') ?? ''
		).replace(/\s+/g, '');
		expect(style).toContain('--ec-radius:24px');
	});

	it('strokeWidth in CSS variable scales with intensity', () => {
		const { container } = render(ElectricBorder, { props: { intensity: 'lightning' } });
		const style = (
			container.querySelector('.electric-wrapper')?.getAttribute('style') ?? ''
		).replace(/\s+/g, '');
		expect(style).toContain('--ec-stroke-width:3px');
	});

	it('glowBlur in CSS variable scales with intensity', () => {
		const { container } = render(ElectricBorder, { props: { intensity: 'mild' } });
		const style = (
			container.querySelector('.electric-wrapper')?.getAttribute('style') ?? ''
		).replace(/\s+/g, '');
		expect(style).toContain('--ec-glow-blur:4px');
	});

	it('falls back to crackling intensity for unknown value', () => {
		// @ts-expect-error — runtime fallback test
		const { container } = render(ElectricBorder, { props: { intensity: 'nope' } });
		const style = (
			container.querySelector('.electric-wrapper')?.getAttribute('style') ?? ''
		).replace(/\s+/g, '');
		expect(style).toContain('--ec-glow-blur:8px');
	});
});
