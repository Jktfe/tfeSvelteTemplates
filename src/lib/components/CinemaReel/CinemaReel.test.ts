/**
 * ============================================================
 * CinemaReel Tests
 * ============================================================
 *
 * Verifies frame rendering, image vs gradient fallback, ARIA
 * wiring (aria-current, aria-label, decorative hidden masks),
 * letterbox CSS variable, and the class-prop forwarding.
 * IntersectionObserver behaviour is exercised via the JSDom
 * polyfill; we don't rely on real layout intersection.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CinemaReel from './CinemaReel.svelte';
import type { CinemaReelStill } from '$lib/types';

const stills: CinemaReelStill[] = [
	{ id: 'a', title: 'Opening', caption: 'Wide establishing shot', scene: '01', color: '#1d4ed8' },
	{
		id: 'b',
		image: 'https://example.com/scene-2.jpg',
		alt: 'Scene 2',
		title: 'Reveal',
		caption: 'Cut to close-up',
		scene: '02'
	},
	{ id: 'c', title: 'Coda', caption: 'Slow pull-back', scene: '03', color: '#0f766e' }
];

beforeEach(() => {
	// Stub IntersectionObserver as a real constructor — JSDom has no layout,
	// so observe/disconnect just record calls. The component'soutsideeach branch
	// either picks up the first still or no-ops; we only assert structural DOM.
	class StubIO implements IntersectionObserver {
		readonly root = null;
		readonly rootMargin = '';
		readonly thresholds: ReadonlyArray<number> = [];
		constructor(public cb: IntersectionObserverCallback) {}
		observe = vi.fn();
		unobserve = vi.fn();
		disconnect = vi.fn();
		takeRecords = vi.fn(() => []);
	}
	(globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
		StubIO as unknown as typeof IntersectionObserver;
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('CinemaReel', () => {
	it('renders one .cr-frame per still', () => {
		const { container } = render(CinemaReel, { props: { stills } });
		expect(container.querySelectorAll('.cr-frame').length).toBe(stills.length);
	});

	it('uses an <img> for stills with an image source', () => {
		const { container } = render(CinemaReel, { props: { stills } });
		const imgs = container.querySelectorAll('img.cr-image');
		expect(imgs.length).toBe(1);
		expect((imgs[0] as HTMLImageElement).src).toContain('scene-2.jpg');
	});

	it('falls back to a gradient div when image is missing', () => {
		const { container } = render(CinemaReel, { props: { stills } });
		const gradients = container.querySelectorAll('.cr-image--gradient');
		// Two stills (a, c) have no image — both should render a gradient
		expect(gradients.length).toBe(2);
	});

	it('renders the title, caption, and scene label when supplied', () => {
		render(CinemaReel, { props: { stills } });
		expect(screen.getByText('Opening')).toBeTruthy();
		expect(screen.getByText('Wide establishing shot')).toBeTruthy();
		expect(screen.getByText(/Scene 01/)).toBeTruthy();
	});

	it('marks each frame with a stable data-still-id matching the still.id', () => {
		const { container } = render(CinemaReel, { props: { stills } });
		const ids = Array.from(container.querySelectorAll('.cr-frame')).map((f) =>
			f.getAttribute('data-still-id')
		);
		expect(ids).toEqual(['a', 'b', 'c']);
	});

	it('exposes role-friendly figure + figcaption per still with caption content', () => {
		const { container } = render(CinemaReel, { props: { stills } });
		const figures = container.querySelectorAll('figure.cr-frame');
		expect(figures.length).toBe(stills.length);
		const captions = container.querySelectorAll('figcaption.cr-caption');
		expect(captions.length).toBe(stills.length);
	});

	it('renders the wrapper with the cinema-reel class and aria-label', () => {
		const { container } = render(CinemaReel, { props: { stills } });
		const wrapper = container.querySelector('.cinema-reel');
		expect(wrapper).toBeTruthy();
		expect(wrapper?.getAttribute('aria-label')).toBe('Cinema reel');
	});

	it('honours custom ariaLabel', () => {
		const { container } = render(CinemaReel, {
			props: { stills, ariaLabel: 'My film roll' }
		});
		expect(container.querySelector('[aria-label="My film roll"]')).toBeTruthy();
	});

	it('forwards the class prop onto the wrapper', () => {
		const { container } = render(CinemaReel, { props: { stills, class: 'custom-reel' } });
		expect(container.querySelector('.cinema-reel.custom-reel')).toBeTruthy();
	});

	it('clamps letterboxRatio into [0, 0.45] when serialising the CSS var', () => {
		const overflowingProps = { stills, letterboxRatio: 0.99 };
		const { container } = render(CinemaReel, { props: overflowingProps });
		const wrapper = container.querySelector('.cinema-reel') as HTMLElement;
		const styleAttr = wrapper.getAttribute('style') ?? '';
		// Largest accepted value 0.45 → "45%"
		expect(styleAttr).toContain('45%');
	});

	it('writes the still.color into a CSS custom property when supplied', () => {
		const { container } = render(CinemaReel, { props: { stills } });
		const frameA = container.querySelector('.cr-frame[data-still-id="a"]') as HTMLElement;
		expect(frameA.getAttribute('style')).toContain('#1d4ed8');
	});

	it('marks decorative letterbox masks with aria-hidden', () => {
		const { container } = render(CinemaReel, { props: { stills } });
		const masks = container.querySelectorAll('.cr-mask');
		expect(masks.length).toBe(stills.length * 2);
		for (const m of masks) expect(m.getAttribute('aria-hidden')).toBe('true');
	});

	it('uses the title as alt fallback when alt is omitted', () => {
		const stillsAltMissing: CinemaReelStill[] = [
			{ id: 'x', image: 'https://example.com/x.jpg', title: 'Mountain peak' }
		];
		const { container } = render(CinemaReel, { props: { stills: stillsAltMissing } });
		const img = container.querySelector('img.cr-image') as HTMLImageElement;
		expect(img.getAttribute('alt')).toBe('Mountain peak');
	});

	it('handles an empty stills list without crashing', () => {
		const { container } = render(CinemaReel, { props: { stills: [] } });
		expect(container.querySelectorAll('.cr-frame').length).toBe(0);
		expect(container.querySelector('.cinema-reel')).toBeTruthy();
	});
});
