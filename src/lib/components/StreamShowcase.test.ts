import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import StreamShowcase from './StreamShowcase/StreamShowcase.svelte';
import StreamShowcaseCarousel from './StreamShowcase/StreamShowcaseCarousel.svelte';
import { SAMPLE_PLAYLISTS } from './StreamShowcase/playlists';
import { fanAngle, wrapIndex, easedRotation } from './StreamShowcase/types';

describe('StreamShowcase helpers', () => {
	describe('fanAngle', () => {
		it('returns 0 for the active card', () => {
			expect(fanAngle(5, 5)).toBe(0);
		});
		it('returns negative spread for cards left of active', () => {
			expect(fanAngle(3, 5, 7)).toBe(-14);
		});
		it('returns positive spread for cards right of active', () => {
			expect(fanAngle(7, 5, 7)).toBe(14);
		});
		it('respects the spread argument', () => {
			expect(fanAngle(6, 5, 3)).toBe(3);
			expect(fanAngle(6, 5, 10)).toBe(10);
		});
	});

	describe('wrapIndex', () => {
		it('clamps below 0 to 0', () => {
			expect(wrapIndex(-3, 10)).toBe(0);
		});
		it('clamps above max-1 to max-1', () => {
			expect(wrapIndex(99, 10)).toBe(9);
		});
		it('returns the value when in range', () => {
			expect(wrapIndex(4, 10)).toBe(4);
		});
		it('returns 0 when max is 0 or negative (defensive)', () => {
			expect(wrapIndex(5, 0)).toBe(0);
			expect(wrapIndex(2, -1)).toBe(0);
		});
	});

	describe('easedRotation', () => {
		it('returns 0 at t=0', () => {
			expect(easedRotation(0)).toBe(0);
		});
		it('returns 1 at t=1', () => {
			expect(easedRotation(1)).toBeCloseTo(1, 5);
		});
		it('clamps inputs above 1', () => {
			expect(easedRotation(2)).toBeCloseTo(1, 5);
		});
		it('clamps inputs below 0', () => {
			expect(easedRotation(-0.5)).toBe(0);
		});
		it('is monotonically increasing', () => {
			const samples = [0, 0.25, 0.5, 0.75, 1];
			const values = samples.map(easedRotation);
			for (let i = 1; i < values.length; i += 1) {
				expect(values[i]).toBeGreaterThanOrEqual(values[i - 1] as number);
			}
		});
	});
});

describe('StreamShowcase rendering', () => {
	beforeEach(() => cleanup());

	it('renders the hero with default lines', () => {
		const { container } = render(StreamShowcase);
		const h1 = container.querySelector('h1');
		expect(h1).not.toBeNull();
		// Canonical text is in the screen-reader span, not just letter spans
		expect(h1?.textContent?.replace(/\s+/g, ' ').trim()).toContain('Queue up.');
		expect(h1?.textContent?.replace(/\s+/g, ' ').trim()).toContain('Level up.');
	});

	it('renders 10 carousel cards by default', () => {
		const { container } = render(StreamShowcase);
		const cards = container.querySelectorAll('.ssc-card');
		expect(cards.length).toBe(10);
	});

	it('marks the centre card as aria-current', () => {
		const { container } = render(StreamShowcase, { props: { count: 10 } });
		const active = container.querySelector('.ssc-card[aria-current="true"]');
		expect(active).not.toBeNull();
		expect(active?.classList.contains('ssc-card-active')).toBe(true);
	});

	it('exposes the carousel as a region with carousel role description', () => {
		const { container } = render(StreamShowcase);
		const region = container.querySelector('[role="region"][aria-roledescription="carousel"]');
		expect(region).not.toBeNull();
	});

	it('renders the canonical playlist title in the active card aria-label', () => {
		const { container } = render(StreamShowcase, { props: { count: 10 } });
		const active = container.querySelector('.ssc-card[aria-current="true"]');
		const label = active?.getAttribute('aria-label') ?? '';
		// Default count=10, active=floor(10/2)=5, fanCards[5] = playlists[5%5] = playlists[0]
		// playlists[0] is "Solo to SaaS"
		expect(label).toContain('Solo to SaaS');
		expect(label).toContain('Founder Diary');
	});

	it('only the active card is in the natural tab order', () => {
		const { container } = render(StreamShowcase, { props: { count: 10 } });
		const cards = Array.from(container.querySelectorAll<HTMLButtonElement>('.ssc-card'));
		const tabbable = cards.filter((c) => c.getAttribute('tabindex') === '0');
		expect(tabbable.length).toBe(1);
	});
});

describe('StreamShowcaseCarousel keyboard interaction', () => {
	beforeEach(() => cleanup());

	it('ArrowRight advances active by 1', async () => {
		const { container } = render(StreamShowcaseCarousel, {
			props: { playlists: SAMPLE_PLAYLISTS, count: 10, active: 5 }
		});
		const region = container.querySelector('[role="region"]');
		expect(region).not.toBeNull();
		await fireEvent.keyDown(region!, { key: 'ArrowRight' });
		const active = container.querySelector('.ssc-card[aria-current="true"]');
		// Card index 6 should now be active; aria-label includes its title.
		expect(active?.getAttribute('aria-label')).toContain(SAMPLE_PLAYLISTS[6 % 5]!.title);
	});

	it('ArrowLeft retreats active by 1', async () => {
		const { container } = render(StreamShowcaseCarousel, {
			props: { playlists: SAMPLE_PLAYLISTS, count: 10, active: 5 }
		});
		const region = container.querySelector('[role="region"]');
		await fireEvent.keyDown(region!, { key: 'ArrowLeft' });
		const active = container.querySelector('.ssc-card[aria-current="true"]');
		expect(active?.getAttribute('aria-label')).toContain(SAMPLE_PLAYLISTS[4 % 5]!.title);
	});

	it('Home jumps to first card', async () => {
		const { container } = render(StreamShowcaseCarousel, {
			props: { playlists: SAMPLE_PLAYLISTS, count: 10, active: 5 }
		});
		const region = container.querySelector('[role="region"]');
		await fireEvent.keyDown(region!, { key: 'Home' });
		const active = container.querySelector('.ssc-card[aria-current="true"]');
		expect(active?.getAttribute('aria-label')).toContain(SAMPLE_PLAYLISTS[0]!.title);
	});

	it('End jumps to last card', async () => {
		const { container } = render(StreamShowcaseCarousel, {
			props: { playlists: SAMPLE_PLAYLISTS, count: 10, active: 5 }
		});
		const region = container.querySelector('[role="region"]');
		await fireEvent.keyDown(region!, { key: 'End' });
		const active = container.querySelector('.ssc-card[aria-current="true"]');
		// fanCards[9] = playlists[9 % 5] = playlists[4] = "Ship Logs"
		expect(active?.getAttribute('aria-label')).toContain(SAMPLE_PLAYLISTS[9 % 5]!.title);
	});

	it('clamps at the left edge — ArrowLeft on index 0 stays at 0', async () => {
		const { container } = render(StreamShowcaseCarousel, {
			props: { playlists: SAMPLE_PLAYLISTS, count: 10, active: 0 }
		});
		const region = container.querySelector('[role="region"]');
		await fireEvent.keyDown(region!, { key: 'ArrowLeft' });
		const active = container.querySelector('.ssc-card[aria-current="true"]');
		expect(active?.getAttribute('aria-label')).toContain(SAMPLE_PLAYLISTS[0]!.title);
	});

	it('clamps at the right edge — ArrowRight on last index stays', async () => {
		const { container } = render(StreamShowcaseCarousel, {
			props: { playlists: SAMPLE_PLAYLISTS, count: 10, active: 9 }
		});
		const region = container.querySelector('[role="region"]');
		await fireEvent.keyDown(region!, { key: 'ArrowRight' });
		const active = container.querySelector('.ssc-card[aria-current="true"]');
		expect(active?.getAttribute('aria-label')).toContain(SAMPLE_PLAYLISTS[9 % 5]!.title);
	});

	it('Enter on the active card calls onSelect with the playlist', async () => {
		let selected: { slug: string; index: number } | null = null;
		const { container } = render(StreamShowcaseCarousel, {
			props: {
				playlists: SAMPLE_PLAYLISTS,
				count: 10,
				active: 5,
				onSelect: (p, i) => {
					selected = { slug: p.slug, index: i };
				}
			}
		});
		const region = container.querySelector('[role="region"]');
		await fireEvent.keyDown(region!, { key: 'Enter' });
		expect(selected).not.toBeNull();
		expect(selected!.index).toBe(5);
		// fanCards[5] = playlists[5 % 5] = playlists[0] = "Solo to SaaS"
		expect(selected!.slug).toBe('solo-to-saas');
	});

	it('clicking a side card brings it to centre, click on centre selects', async () => {
		let selectedIndex = -1;
		const { container } = render(StreamShowcaseCarousel, {
			props: {
				playlists: SAMPLE_PLAYLISTS,
				count: 10,
				active: 5,
				onSelect: (_, i) => {
					selectedIndex = i;
				}
			}
		});
		const cards = container.querySelectorAll<HTMLButtonElement>('.ssc-card');
		// Click side card at index 7
		await fireEvent.click(cards[7]!);
		const active1 = container.querySelector('.ssc-card[aria-current="true"]');
		expect(active1?.getAttribute('aria-label')).toContain(SAMPLE_PLAYLISTS[7 % 5]!.title);
		// onSelect should NOT have fired yet (only re-centres)
		expect(selectedIndex).toBe(-1);
		// Click centre card now selects
		await fireEvent.click(cards[7]!);
		expect(selectedIndex).toBe(7);
	});
});
