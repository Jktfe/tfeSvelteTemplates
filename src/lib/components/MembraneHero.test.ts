import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/svelte';

import MembraneHero from './MembraneHero/MembraneHero.svelte';
import MembraneSurface from './MembraneHero/MembraneSurface.svelte';
import {
	paletteToFilterStops,
	lissajous,
	buildTurbulenceFreq,
	lerp,
	clamp,
	isReducedMotion
} from './MembraneHero/types';

describe('paletteToFilterStops', () => {
	test('aurora returns teal/violet/amber stops', () => {
		const s = paletteToFilterStops('aurora');
		expect(s.from).toBe('#0d9488');
		expect(s.via).toBe('#7c3aed');
		expect(s.to).toBe('#f59e0b');
		expect(s.accent).toBe('#fde68a');
	});
	test('sunset returns rose/amber/indigo stops', () => {
		const s = paletteToFilterStops('sunset');
		expect(s.from).toBe('#f43f5e');
		expect(s.via).toBe('#f59e0b');
		expect(s.to).toBe('#4338ca');
	});
	test('polar returns slate/sky/cyan stops', () => {
		const s = paletteToFilterStops('polar');
		expect(s.from).toBe('#1e293b');
		expect(s.via).toBe('#0ea5e9');
		expect(s.to).toBe('#67e8f9');
	});
	test('every preset includes an accent', () => {
		for (const palette of ['aurora', 'sunset', 'polar'] as const) {
			expect(paletteToFilterStops(palette).accent).toMatch(/^#/);
		}
	});
});

describe('lissajous curve', () => {
	test('lissajous(0, …) on phase=0 anchors at origin in y-axis', () => {
		const p = lissajous(0, 3, 2, 1, 1, 0);
		expect(p.x).toBe(0);
		expect(p.y).toBe(0);
	});
	test('lissajous bounded by amplitude A, B', () => {
		const A = 0.4;
		const B = 0.3;
		for (let t = 0; t < 30; t += 0.37) {
			const p = lissajous(t, 3, 2, A, B, Math.PI / 4);
			expect(Math.abs(p.x)).toBeLessThanOrEqual(A);
			expect(Math.abs(p.y)).toBeLessThanOrEqual(B);
		}
	});
	test('lissajous with same args reproduces — pure function', () => {
		const a = lissajous(1.234, 3, 2, 0.32, 0.22, Math.PI / 4);
		const b = lissajous(1.234, 3, 2, 0.32, 0.22, Math.PI / 4);
		expect(a).toEqual(b);
	});
});

describe('buildTurbulenceFreq', () => {
	test('progress=0 returns the low end (0.012)', () => {
		expect(buildTurbulenceFreq(0)).toBeCloseTo(0.012, 5);
	});
	test('progress=0.5 returns the high end (0.024)', () => {
		expect(buildTurbulenceFreq(0.5)).toBeCloseTo(0.024, 5);
	});
	test('progress=1 returns the low end again (full cycle)', () => {
		expect(buildTurbulenceFreq(1)).toBeCloseTo(0.012, 5);
	});
	test('progress always inside [0.012, 0.024] envelope', () => {
		for (let p = 0; p <= 1; p += 0.07) {
			const f = buildTurbulenceFreq(p);
			expect(f).toBeGreaterThanOrEqual(0.012 - 1e-9);
			expect(f).toBeLessThanOrEqual(0.024 + 1e-9);
		}
	});
	test('out-of-range progress is clamped', () => {
		expect(buildTurbulenceFreq(-0.5)).toBeCloseTo(0.012, 5);
		expect(buildTurbulenceFreq(1.5)).toBeCloseTo(0.012, 5);
	});
});

describe('lerp + clamp', () => {
	test('lerp endpoints + midpoint', () => {
		expect(lerp(0, 10, 0)).toBe(0);
		expect(lerp(0, 10, 1)).toBe(10);
		expect(lerp(0, 10, 0.5)).toBe(5);
	});
	test('clamp inside / below / above', () => {
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(-5, 0, 10)).toBe(0);
		expect(clamp(15, 0, 10)).toBe(10);
	});
});

describe('isReducedMotion', () => {
	test('returns boolean (jsdom matchMedia supported)', () => {
		expect(typeof isReducedMotion()).toBe('boolean');
	});
});

describe('MembraneHero render', () => {
	test('renders the headline as a real <h1>', () => {
		const { container } = render(MembraneHero, { headline: 'Hello world' });
		const h1 = container.querySelector('h1');
		expect(h1).toBeTruthy();
		// .mh-sr-only span carries the full string for screen readers
		expect(container.textContent).toContain('Hello world');
	});

	test('default eyebrow + subhead + CTA labels render', () => {
		const { container } = render(MembraneHero);
		expect(container.textContent).toContain('Now in beta');
		expect(container.textContent).toContain('A new kind of canvas');
		expect(container.textContent).toContain('Hand-crafted');
		expect(container.textContent).toContain('Start building');
		expect(container.textContent).toContain('See the docs');
	});

	test('headline glyph spans match the (visible) character count', () => {
		const headline = 'ABCDE';
		const { container } = render(MembraneHero, { headline });
		const glyphs = container.querySelectorAll('.mh-glyph');
		expect(glyphs.length).toBe(headline.length);
	});

	test('palette class is applied to the root', () => {
		const { container } = render(MembraneHero, { palette: 'sunset' });
		const root = container.querySelector('.mh-root');
		expect(root?.classList.contains('mh-sunset')).toBe(true);
	});

	test('extra class is appended to the root', () => {
		const { container } = render(MembraneHero, { class: 'custom-frame' });
		const root = container.querySelector('.mh-root');
		expect(root?.classList.contains('custom-frame')).toBe(true);
	});

	test('CTA hrefs land on the anchors', () => {
		const { container } = render(MembraneHero, {
			primaryHref: '/start',
			secondaryHref: '/docs'
		});
		const links = container.querySelectorAll('a.mh-cta');
		expect(links.length).toBe(2);
		expect((links[0] as HTMLAnchorElement).getAttribute('href')).toBe('/start');
		expect((links[1] as HTMLAnchorElement).getAttribute('href')).toBe('/docs');
	});
});

describe('MembraneSurface render', () => {
	test('surface mounts with a unique filter id', () => {
		const { container } = render(MembraneSurface, { uid: 'test1' });
		const filter = container.querySelector('filter');
		expect(filter?.getAttribute('id')).toBe('test1-displace');
	});

	test('surface is decorative-only at the structural level', () => {
		const { container } = render(MembraneSurface);
		const root = container.querySelector('.mh-surface');
		expect(root?.getAttribute('aria-hidden')).toBe('true');
	});

	test('focal dot renders by default and can be hidden', () => {
		const { container: shown } = render(MembraneSurface, { uid: 'a' });
		expect(shown.querySelector('.mh-dot')).toBeTruthy();

		const { container: hidden } = render(MembraneSurface, { uid: 'b', showDot: false });
		expect(hidden.querySelector('.mh-dot')).toBeFalsy();
	});
});
