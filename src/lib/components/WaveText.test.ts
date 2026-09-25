/**
 * ============================================================
 * WaveText Tests
 * ============================================================
 *
 * Two layers:
 *  1. Pure helpers — the sine path builder, phase maths and the
 *     alignment map.
 *  2. Rendered behaviour — semantics per trigger, hover / click /
 *     Escape, unique ids, reduced motion and theming hooks.
 * ============================================================
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import WaveText, {
	MAX_WAVE_POINTS,
	WAVE_VIEW_WIDTH,
	advancePhase,
	alignToAnchor,
	buildWavePath,
	prefersReducedMotion
} from './WaveText.svelte';

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function pointsOf(d: string): Array<[number, number]> {
	const nums = d.replace(/[ML]/g, ' ').trim().split(/\s+/).map(Number);
	const out: Array<[number, number]> = [];
	for (let i = 0; i < nums.length; i += 2) out.push([nums[i], nums[i + 1]]);
	return out;
}

function stubReducedMotion(matches: boolean) {
	vi.stubGlobal('matchMedia', (q: string) => ({
		matches: matches && q.includes('reduce'),
		addEventListener: () => undefined,
		removeEventListener: () => undefined
	}));
}

describe('WaveText helpers', () => {
	describe('buildWavePath', () => {
		it('starts with a move command at x=0 on the centre line', () => {
			expect(buildWavePath(20, 200).startsWith('M 0 150')).toBe(true);
		});

		it('keeps every point within ±amplitude of the centre line', () => {
			for (const [, y] of pointsOf(buildWavePath(40, 180))) {
				expect(y).toBeGreaterThanOrEqual(110 - 0.01);
				expect(y).toBeLessThanOrEqual(190 + 0.01);
			}
		});

		it('spans the whole view width', () => {
			const pts = pointsOf(buildWavePath(20, 200));
			expect(pts[pts.length - 1][0]).toBeGreaterThanOrEqual(WAVE_VIEW_WIDTH);
		});

		it('draws a flat line when the wavelength is not positive', () => {
			expect(buildWavePath(20, 0)).toBe(`M 0 150 L ${WAVE_VIEW_WIDTH} 150`);
			expect(buildWavePath(20, -5)).toBe(`M 0 150 L ${WAVE_VIEW_WIDTH} 150`);
		});

		it('draws a flat line when the amplitude is zero', () => {
			for (const [, y] of pointsOf(buildWavePath(0, 200))) expect(y).toBe(150);
		});

		it('caps the point count for tiny wavelengths', () => {
			expect(pointsOf(buildWavePath(20, 1)).length).toBeLessThanOrEqual(MAX_WAVE_POINTS + 2);
		});

		it('shifts the crests when the phase changes', () => {
			expect(buildWavePath(20, 200, 0)).not.toBe(buildWavePath(20, 200, Math.PI / 2));
		});
	});

	describe('advancePhase', () => {
		it('advances by 2π × speed × dt', () => {
			expect(advancePhase(0, 0.25, 1)).toBeCloseTo(Math.PI / 2);
		});

		it('wraps into [0, 2π)', () => {
			const next = advancePhase(Math.PI * 1.9, 1, 0.5);
			expect(next).toBeGreaterThanOrEqual(0);
			expect(next).toBeLessThan(Math.PI * 2);
		});

		it('ignores non-finite input', () => {
			expect(advancePhase(1, Number.NaN, 1)).toBe(1);
			expect(advancePhase(1, 1, Number.POSITIVE_INFINITY)).toBe(1);
		});
	});

	describe('alignToAnchor', () => {
		it('maps each alignment to a matching offset + anchor', () => {
			expect(alignToAnchor('start').textAnchor).toBe('start');
			expect(alignToAnchor('middle')).toEqual({ startOffset: '50%', textAnchor: 'middle' });
			expect(alignToAnchor('end').textAnchor).toBe('end');
		});
	});

	describe('prefersReducedMotion', () => {
		it('reads the media query', () => {
			stubReducedMotion(true);
			expect(prefersReducedMotion()).toBe(true);
		});
	});
});

describe('WaveText component', () => {
	it('renders an aria-pressed button named after the text by default', () => {
		render(WaveText, { text: 'Making waves' });
		const button = screen.getByRole('button', { name: 'Making waves' });
		expect(button).toHaveAttribute('aria-pressed', 'false');
	});

	it('renders role="img" when trigger="none"', () => {
		render(WaveText, { text: 'Still water', trigger: 'none' });
		expect(screen.queryByRole('button')).toBeNull();
		expect(screen.getByRole('img', { name: 'Still water' })).toBeInTheDocument();
	});

	it('uses the default phrase and supports a label override', () => {
		const { container } = render(WaveText, { label: 'Wavy heading' });
		expect(screen.getByRole('button', { name: 'Wavy heading' })).toBeInTheDocument();
		expect(container.querySelector('textPath')?.textContent).toBe('WAVING TEXT');
	});

	it('styles its own nodes through scoped classes rather than global selectors', () => {
		const { container } = render(WaveText, { text: 'Scoped' });
		expect(container.querySelector('text')).toHaveClass('wt-text');
		expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
	});

	it('gives every instance its own path id', () => {
		const a = render(WaveText, { text: 'One' });
		const b = render(WaveText, { text: 'Two' });
		const idA = a.container.querySelector('path')?.getAttribute('id');
		const idB = b.container.querySelector('path')?.getAttribute('id');
		expect(idA).toBeTruthy();
		expect(idA).not.toBe(idB);
		expect(a.container.querySelector('textPath')).toHaveAttribute('href', `#${idA}`);
	});

	it('reflects the amplitude + wavelength in the path', () => {
		const { container } = render(WaveText, { amplitude: 30, wavelength: 300 });
		expect(container.querySelector('path')).toHaveAttribute('d', buildWavePath(30, 300, 0));
	});

	it('applies the alignment to the text anchor', () => {
		const { container } = render(WaveText, { align: 'start' });
		expect(container.querySelector('text')).toHaveAttribute('text-anchor', 'start');
	});

	it('plays on mouse hover and stops on leave', async () => {
		render(WaveText, { text: 'W' });
		const button = screen.getByRole('button');
		await fireEvent.pointerEnter(button, { pointerType: 'mouse' });
		expect(button).toHaveAttribute('aria-pressed', 'true');
		await fireEvent.pointerLeave(button, { pointerType: 'mouse' });
		expect(button).toHaveAttribute('aria-pressed', 'false');
	});

	it('toggles on click in click mode, and Escape stops it', async () => {
		render(WaveText, { text: 'W', trigger: 'click' });
		const button = screen.getByRole('button');
		await fireEvent.click(button);
		expect(button).toHaveAttribute('data-playing', 'true');
		await fireEvent.keyDown(button, { key: 'Escape' });
		expect(button).toHaveAttribute('data-playing', 'false');
	});

	it('only starts the animation loop while playing', () => {
		stubReducedMotion(false);
		const raf = vi.fn(() => 1);
		vi.stubGlobal('requestAnimationFrame', raf);
		vi.stubGlobal('cancelAnimationFrame', () => undefined);
		render(WaveText, { text: 'Idle' });
		expect(raf).not.toHaveBeenCalled();
		cleanup();
		render(WaveText, { text: 'Busy', playing: true });
		expect(raf).toHaveBeenCalled();
	});

	it('under reduced motion, flips half a cycle instead of animating', () => {
		stubReducedMotion(true);
		const raf = vi.fn(() => 1);
		vi.stubGlobal('requestAnimationFrame', raf);
		const { container } = render(WaveText, { playing: true, amplitude: 20, wavelength: 200 });
		expect(raf).not.toHaveBeenCalled();
		expect(container.querySelector('path')).toHaveAttribute('d', buildWavePath(20, 200, Math.PI));
	});

	it('applies the height as a CSS custom property', () => {
		const { container } = render(WaveText, { height: 180 });
		const root = container.querySelector('.wt-root') as HTMLElement;
		expect(root.style.getPropertyValue('--wt-height')).toBe('180px');
	});
});
