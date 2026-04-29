/**
 * ============================================================
 * ShinyText Tests
 * ============================================================
 *
 * Two layers of coverage:
 *  1. Pure helpers (buildShinyGradient, getAnimDirection,
 *     getIterationCount) — exported from the component's
 *     module-script block so we can assert the maths/strings
 *     without ever rendering DOM.
 *  2. Component render — confirms the text appears, the CSS
 *     custom properties are wired through to the span, and
 *     prop changes flow into the inline style.
 *
 * 💡 Run `bun run test:ui` for a visual, filterable runner.
 * ============================================================
 */

import { render, screen, cleanup } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import ShinyText, {
	buildShinyGradient,
	getAnimDirection,
	getIterationCount
} from './ShinyText.svelte';

afterEach(() => {
	cleanup();
});

describe('ShinyText helpers', () => {
	describe('buildShinyGradient', () => {
		it('produces a 90deg linear-gradient with base→shine→base stops', () => {
			const out = buildShinyGradient('#000000', '#ffffff');
			expect(out).toContain('linear-gradient(90deg');
			expect(out).toContain('#000000 0%');
			expect(out).toContain('#ffffff 50%');
			expect(out).toContain('#000000 100%');
		});

		it('passes any CSS colour string through verbatim', () => {
			const out = buildShinyGradient('rgba(0,0,0,0.4)', 'hsl(48, 100%, 70%)');
			expect(out).toContain('rgba(0,0,0,0.4) 0%');
			expect(out).toContain('hsl(48, 100%, 70%) 50%');
		});

		it('keeps base + shine ordered (the shine MUST sit at 50%)', () => {
			const out = buildShinyGradient('#a', '#b');
			const baseFirstIdx = out.indexOf('#a 0%');
			const shineIdx = out.indexOf('#b 50%');
			const baseLastIdx = out.lastIndexOf('#a 100%');
			expect(baseFirstIdx).toBeGreaterThan(-1);
			expect(shineIdx).toBeGreaterThan(baseFirstIdx);
			expect(baseLastIdx).toBeGreaterThan(shineIdx);
		});
	});

	describe('getAnimDirection', () => {
		it('maps "lr" to the CSS keyword "normal"', () => {
			expect(getAnimDirection('lr')).toBe('normal');
		});

		it('maps "rl" to the CSS keyword "reverse"', () => {
			expect(getAnimDirection('rl')).toBe('reverse');
		});

		it('returns one of the two valid CSS animation-direction values for both branches', () => {
			expect(['normal', 'reverse']).toContain(getAnimDirection('lr'));
			expect(['normal', 'reverse']).toContain(getAnimDirection('rl'));
		});
	});

	describe('getIterationCount', () => {
		it('returns "infinite" when looping', () => {
			expect(getIterationCount(true)).toBe('infinite');
		});

		it('returns "1" when not looping (one-shot mode)', () => {
			expect(getIterationCount(false)).toBe('1');
		});
	});
});

describe('ShinyText component', () => {
	it('renders the supplied text inside a span', () => {
		render(ShinyText, { props: { text: 'Premium' } });
		expect(screen.getByText('Premium').tagName).toBe('SPAN');
	});

	it('exposes the chosen direction via a data attribute (handy for visual debugging)', () => {
		render(ShinyText, { props: { text: 'Backwards', direction: 'rl' } });
		const el = screen.getByText('Backwards');
		expect(el.getAttribute('data-direction')).toBe('rl');
	});

	it('writes the gradient + base colour through to inline CSS custom properties', () => {
		render(ShinyText, {
			props: {
				text: 'Glow',
				baseColor: '#475569',
				shineColor: '#fbbf24'
			}
		});
		const el = screen.getByText('Glow') as HTMLElement;
		const style = el.getAttribute('style') ?? '';
		expect(style).toContain('--shiny-gradient');
		expect(style).toContain('#475569');
		expect(style).toContain('#fbbf24');
		expect(style).toContain('--shiny-base: #475569');
	});

	it('writes the duration and delay (with the "s" suffix) through to inline style', () => {
		render(ShinyText, {
			props: { text: 'Slow', duration: 5, delay: 1.25 }
		});
		const el = screen.getByText('Slow') as HTMLElement;
		const style = el.getAttribute('style') ?? '';
		expect(style).toContain('--shiny-duration: 5s');
		expect(style).toContain('--shiny-delay: 1.25s');
	});

	it('switches animation-direction to "reverse" when direction is "rl"', () => {
		render(ShinyText, { props: { text: 'Right to left', direction: 'rl' } });
		const el = screen.getByText('Right to left') as HTMLElement;
		expect(el.getAttribute('style') ?? '').toContain('--shiny-direction: reverse');
	});

	it('switches animation-iteration-count to "1" for one-shot mode', () => {
		render(ShinyText, { props: { text: 'Once', loop: false } });
		const el = screen.getByText('Once') as HTMLElement;
		expect(el.getAttribute('style') ?? '').toContain('--shiny-iteration: 1');
	});

	it('uses "infinite" iteration count by default', () => {
		render(ShinyText, { props: { text: 'Forever' } });
		const el = screen.getByText('Forever') as HTMLElement;
		expect(el.getAttribute('style') ?? '').toContain('--shiny-iteration: infinite');
	});

	it('appends user-supplied class names without dropping the base class', () => {
		render(ShinyText, { props: { text: 'Combo', class: 'hero-headline display-1' } });
		const el = screen.getByText('Combo');
		expect(el.classList.contains('shiny-text')).toBe(true);
		expect(el.classList.contains('hero-headline')).toBe(true);
		expect(el.classList.contains('display-1')).toBe(true);
	});
});
