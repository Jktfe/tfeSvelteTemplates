import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/svelte';

import PortfolioPhotographer from './PortfolioPhotographer/PortfolioPhotographer.svelte';
import PhotoReelHero from './PortfolioPhotographer/PhotoReelHero.svelte';
import { SAMPLE_PHOTOS } from './PortfolioPhotographer/photos';
import { halton, haltonPoint, lerp, clamp, reelTrackOffset } from './PortfolioPhotographer/types';

describe('halton low-discrepancy sequence', () => {
	test('halton(0, base) is 0 for any base', () => {
		expect(halton(0, 2)).toBe(0);
		expect(halton(0, 3)).toBe(0);
		expect(halton(0, 5)).toBe(0);
	});

	test('halton in base 2 produces 1/2, 1/4, 3/4, 1/8 …', () => {
		expect(halton(1, 2)).toBe(0.5);
		expect(halton(2, 2)).toBe(0.25);
		expect(halton(3, 2)).toBe(0.75);
		expect(halton(4, 2)).toBe(0.125);
	});

	test('halton outputs always lie in [0,1)', () => {
		for (let i = 1; i < 100; i++) {
			const v2 = halton(i, 2);
			const v3 = halton(i, 3);
			expect(v2).toBeGreaterThanOrEqual(0);
			expect(v2).toBeLessThan(1);
			expect(v3).toBeGreaterThanOrEqual(0);
			expect(v3).toBeLessThan(1);
		}
	});

	test('haltonPoint pairs base-2 x with base-3 y, no two indices clash', () => {
		const seen = new Set<string>();
		for (let i = 0; i < 50; i++) {
			const p = haltonPoint(i);
			const key = `${p.x.toFixed(6)},${p.y.toFixed(6)}`;
			expect(seen.has(key)).toBe(false);
			seen.add(key);
		}
	});
});

describe('numeric helpers', () => {
	test('lerp', () => {
		expect(lerp(0, 10, 0)).toBe(0);
		expect(lerp(0, 10, 1)).toBe(10);
		expect(lerp(0, 10, 0.5)).toBe(5);
		expect(lerp(-10, 10, 0.5)).toBe(0);
	});

	test('clamp', () => {
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(-5, 0, 10)).toBe(0);
		expect(clamp(15, 0, 10)).toBe(10);
		expect(clamp(0, 0, 10)).toBe(0);
		expect(clamp(10, 0, 10)).toBe(10);
	});

	test('reelTrackOffset maps progress in [0,1] to [0, -50]', () => {
		expect(reelTrackOffset(0)).toBe(0);
		expect(reelTrackOffset(1)).toBe(-50);
		expect(reelTrackOffset(0.5)).toBe(-25);
		// clamps out-of-range progress
		expect(reelTrackOffset(-0.5)).toBe(0);
		expect(reelTrackOffset(1.5)).toBe(-50);
	});
});

describe('SAMPLE_PHOTOS dataset', () => {
	test('14 generic photos with all required fields', () => {
		expect(SAMPLE_PHOTOS).toHaveLength(14);
		for (const p of SAMPLE_PHOTOS) {
			expect(p.id).toMatch(/^[a-z0-9-]+$/);
			expect(p.caption.length).toBeGreaterThan(0);
			expect(p.category.length).toBeGreaterThan(0);
			expect(p.cover.from).toMatch(/^#/);
			expect(p.cover.via).toMatch(/^#/);
			expect(p.cover.to).toMatch(/^#/);
			expect(p.cover.accent).toMatch(/^#/);
		}
	});

	test('all photo ids are unique', () => {
		const ids = SAMPLE_PHOTOS.map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('PortfolioPhotographer render', () => {
	test('renders the photographer name as a real <h1>', () => {
		const { container } = render(PortfolioPhotographer, { name: 'Aria Lindqvist' });
		const h1 = container.querySelector('h1');
		expect(h1?.textContent).toBe('Aria Lindqvist');
	});

	test('default tagline + years render', () => {
		const { container } = render(PortfolioPhotographer);
		expect(container.textContent).toContain('photographs of light');
		expect(container.textContent).toContain('2018');
	});

	test('custom name + tagline + years override defaults', () => {
		const { container } = render(PortfolioPhotographer, {
			name: 'Test Photographer',
			tagline: 'a test tagline that should appear',
			years: '1999 — 2024'
		});
		expect(container.textContent).toContain('Test Photographer');
		expect(container.textContent).toContain('a test tagline that should appear');
		expect(container.textContent).toContain('1999');
	});

	test('reel renders the photo set duplicated for the seamless loop', () => {
		const { container } = render(PortfolioPhotographer);
		const tiles = container.querySelectorAll('.prh-tile');
		// 14 photos × 2 (duplicated) = 28 tiles
		expect(tiles.length).toBe(SAMPLE_PHOTOS.length * 2);
	});

	test('duplicated tiles are aria-hidden so screen readers see the set once', () => {
		const { container } = render(PortfolioPhotographer);
		const tiles = container.querySelectorAll('.prh-tile');
		const hidden = Array.from(tiles).filter(
			(t) => (t as HTMLElement).getAttribute('aria-hidden') === 'true'
		);
		expect(hidden.length).toBe(SAMPLE_PHOTOS.length);
	});
});

describe('PhotoReelHero scatter dots', () => {
	test('renders the requested number of scatter dots', () => {
		const { container } = render(PhotoReelHero, {
			photos: SAMPLE_PHOTOS,
			dotCount: 12
		});
		const dots = container.querySelectorAll('.prh-dot');
		expect(dots.length).toBe(12);
	});

	test('default scatter is 24 dots', () => {
		const { container } = render(PhotoReelHero, { photos: SAMPLE_PHOTOS });
		const dots = container.querySelectorAll('.prh-dot');
		expect(dots.length).toBe(24);
	});

	test('lens SVG and reel are both decorative-only at the structural level', () => {
		const { container } = render(PhotoReelHero, { photos: SAMPLE_PHOTOS });
		const lens = container.querySelector('.prh-lens');
		expect(lens?.getAttribute('aria-hidden')).toBe('true');
	});
});

describe('PortfolioPhotographer custom duration', () => {
	test('duration prop drives a CSS variable on the stage', () => {
		const { container } = render(PortfolioPhotographer, { duration: 60 });
		const stage = container.querySelector('.prh-stage') as HTMLElement;
		expect(stage?.style.cssText).toContain('--prh-duration: 60s');
	});
});
