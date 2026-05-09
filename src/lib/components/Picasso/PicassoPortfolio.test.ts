/**
 * ============================================================
 * PicassoPortfolio Tests
 * ============================================================
 *
 * Verifies panel rendering per painting, swatch grid generation
 * (gridSize × gridSize cells from the palette in row-major order),
 * title + caption + scene labels, and aria wiring.
 * IntersectionObserver and gsap timeline are stubbed; we only
 * assert the structural DOM and the data → DOM mapping.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PicassoPortfolio from './PicassoPortfolio.svelte';
import type { PicassoPainting } from '$lib/types';

const paintings: PicassoPainting[] = [
	{
		id: 'p1',
		title: 'Cubist Calm',
		caption: 'Soft geometric harmony.',
		scene: 'Suite I',
		palette: ['#1d4ed8', '#0f766e', '#fde68a', '#f87171']
	},
	{
		id: 'p2',
		title: 'Aurora',
		caption: 'Cool tones, hot accent.',
		scene: 'Suite II',
		palette: ['#0891b2', '#9333ea', '#e879f9']
	},
	{
		id: 'p3',
		title: 'Heatmap',
		palette: ['#dc2626', '#f59e0b']
	}
];

beforeEach(() => {
	(globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
		class StubIO implements IntersectionObserver {
			readonly root = null;
			readonly rootMargin = '';
			readonly thresholds: ReadonlyArray<number> = [];
			constructor(public cb: IntersectionObserverCallback) {}
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
			takeRecords = vi.fn(() => []);
		} as unknown as typeof IntersectionObserver;
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('PicassoPortfolio', () => {
	it('renders the wrapper with an aria-label', () => {
		const { container } = render(PicassoPortfolio, { props: { paintings } });
		const wrapper = container.querySelector('.picasso-portfolio');
		expect(wrapper).toBeTruthy();
		expect(wrapper?.getAttribute('aria-label')).toBe('Picasso portfolio');
	});

	it('renders one .pp-panel per painting', () => {
		const { container } = render(PicassoPortfolio, { props: { paintings } });
		expect(container.querySelectorAll('.pp-panel').length).toBe(paintings.length);
	});

	it('builds gridSize × gridSize swatches per painting', () => {
		const { container } = render(PicassoPortfolio, { props: { paintings, gridSize: 3 } });
		const panels = container.querySelectorAll('.pp-panel');
		for (const panel of panels) {
			expect(panel.querySelectorAll('.pp-swatch').length).toBe(9);
		}
	});

	it('cycles through the palette in row-major order when palette < gridSize²', () => {
		const single: PicassoPainting[] = [{ id: 's', title: 'Two-Tone', palette: ['#000000', '#ffffff'] }];
		const { container } = render(PicassoPortfolio, { props: { paintings: single, gridSize: 2 } });
		const swatches = container.querySelectorAll('.pp-swatch');
		expect(swatches.length).toBe(4);
		const bgs = Array.from(swatches).map((s) => (s as HTMLElement).style.background.toLowerCase());
		// row-major (0,0)=palette[0]; (0,1)=palette[1]; (1,0)=palette[2 % 2]=palette[0]; (1,1)=palette[1]
		expect(bgs[0]).toContain('#000000');
		expect(bgs[1]).toContain('#ffffff');
		expect(bgs[2]).toContain('#000000');
		expect(bgs[3]).toContain('#ffffff');
	});

	it('renders title, caption, and scene when supplied', () => {
		render(PicassoPortfolio, { props: { paintings } });
		expect(screen.getByText('Cubist Calm')).toBeTruthy();
		expect(screen.getByText('Soft geometric harmony.')).toBeTruthy();
		expect(screen.getByText('Suite I')).toBeTruthy();
	});

	it('omits .pp-caption when painting.caption is missing', () => {
		const minimal: PicassoPainting[] = [{ id: 'x', title: 'Quiet', palette: ['#000'] }];
		const { container } = render(PicassoPortfolio, { props: { paintings: minimal } });
		expect(container.querySelector('.pp-caption')).toBeNull();
		expect(screen.getByText('Quiet')).toBeTruthy();
	});

	it('marks the swatch grid as aria-hidden (decorative)', () => {
		const { container } = render(PicassoPortfolio, { props: { paintings } });
		const grids = container.querySelectorAll('.pp-grid');
		expect(grids.length).toBe(paintings.length);
		for (const g of grids) {
			expect(g.getAttribute('aria-hidden')).toBe('true');
		}
	});

	it('writes the gridSize CSS custom property on each .pp-grid', () => {
		const { container } = render(PicassoPortfolio, { props: { paintings, gridSize: 5 } });
		const grid = container.querySelector('.pp-grid') as HTMLElement;
		expect(grid.getAttribute('style')).toContain('--pp-grid-size: 5');
	});

	it('forwards the class prop onto the wrapper', () => {
		const { container } = render(PicassoPortfolio, {
			props: { paintings, class: 'custom-picasso' }
		});
		expect(container.querySelector('.picasso-portfolio.custom-picasso')).toBeTruthy();
	});

	it('renders titles as <h3> elements', () => {
		const { container } = render(PicassoPortfolio, { props: { paintings } });
		const titles = container.querySelectorAll('h3.pp-title');
		expect(titles.length).toBe(paintings.length);
		expect(titles[0].textContent).toBe('Cubist Calm');
	});

	it('handles an empty paintings array gracefully', () => {
		const { container } = render(PicassoPortfolio, { props: { paintings: [] } });
		expect(container.querySelectorAll('.pp-panel').length).toBe(0);
		expect(container.querySelector('.picasso-portfolio')).toBeTruthy();
	});

	it('respects custom ariaLabel', () => {
		const { container } = render(PicassoPortfolio, {
			props: { paintings, ariaLabel: 'Personal works' }
		});
		expect(container.querySelector('[aria-label="Personal works"]')).toBeTruthy();
	});
});
