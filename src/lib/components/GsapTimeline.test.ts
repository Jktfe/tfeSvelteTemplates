/**
 * ============================================================
 * GsapTimeline Tests
 * ============================================================
 *
 * Verifies event rendering, alignment classes, marker icon vs
 * check fallback, click-to-callback wiring, ARIA roles, and the
 * progress fill toggle.
 * gsap timeline + IntersectionObserver are stubbed; we assert
 * structural DOM and the data → DOM mapping.
 * ============================================================
 */

import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GsapTimeline from './GsapTimeline.svelte';
import type { TimelineEvent } from '$lib/types';

const events: TimelineEvent[] = [
	{ id: '1', date: '2024-01-15', title: 'Discovery', description: 'Kickoff', completed: true },
	{ id: '2', date: '2024-03-01', title: 'MVP', description: 'First demo', completed: true, icon: '🚀' },
	{ id: '3', date: '2024-06-15', title: 'Beta', description: 'Limited release', color: '#9333ea' },
	{ id: '4', date: '2024-09-01', title: 'GA', href: '/launch' }
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

describe('GsapTimeline', () => {
	it('renders the wrapper with role="list" and an aria-label', () => {
		const { container } = render(GsapTimeline, { props: { events } });
		const wrapper = container.querySelector('.gsap-timeline');
		expect(wrapper).toBeTruthy();
		expect(wrapper?.getAttribute('role')).toBe('list');
		expect(wrapper?.getAttribute('aria-label')).toBe('GSAP timeline');
	});

	it('renders one .gt-item per event', () => {
		const { container } = render(GsapTimeline, { props: { events } });
		expect(container.querySelectorAll('.gt-item').length).toBe(events.length);
	});

	it('alternates left/right classes by default', () => {
		const { container } = render(GsapTimeline, { props: { events } });
		const items = container.querySelectorAll('.gt-item');
		expect(items[0].classList.contains('gt-item--left')).toBe(true);
		expect(items[1].classList.contains('gt-item--right')).toBe(true);
		expect(items[2].classList.contains('gt-item--left')).toBe(true);
		expect(items[3].classList.contains('gt-item--right')).toBe(true);
	});

	it('forces left alignment when alignment="left"', () => {
		const { container } = render(GsapTimeline, { props: { events, alignment: 'left' } });
		const items = container.querySelectorAll('.gt-item');
		for (const it of items) expect(it.classList.contains('gt-item--left')).toBe(true);
	});

	it('renders the icon when supplied, and a check for completed events without icon', () => {
		const { container } = render(GsapTimeline, { props: { events } });
		// Event 2 has icon "🚀"
		expect(container.textContent).toContain('🚀');
		// Event 1 is completed but has no icon → renders ✓
		expect(container.textContent).toContain('✓');
	});

	it('renders an <a> when event.href is set', () => {
		const { container } = render(GsapTimeline, { props: { events } });
		const link = container.querySelector('a.gt-link');
		expect(link).toBeTruthy();
		expect(link?.getAttribute('href')).toBe('/launch');
	});

	it('marks the marker as aria-hidden (decorative)', () => {
		const { container } = render(GsapTimeline, { props: { events } });
		const markers = container.querySelectorAll('.gt-marker');
		for (const m of markers) expect(m.getAttribute('aria-hidden')).toBe('true');
	});

	it('attaches role="button" + tabindex only when onEventClick is supplied', () => {
		const onEventClick = vi.fn();
		const { container } = render(GsapTimeline, { props: { events, onEventClick } });
		const items = container.querySelectorAll('.gt-item');
		for (const it of items) {
			expect(it.getAttribute('role')).toBe('button');
			expect(it.getAttribute('tabindex')).toBe('0');
		}
	});

	it('href-only events stay listitems (the inner <a> handles navigation)', () => {
		// Without onEventClick the wrapper must be a plain listitem even when href is present
		const { container } = render(GsapTimeline, { props: { events } });
		const items = container.querySelectorAll('.gt-item');
		for (const it of items) {
			expect(it.getAttribute('role')).toBe('listitem');
			expect(it.getAttribute('tabindex')).toBeNull();
		}
		// The inner <a> still renders for the event with href
		const link = container.querySelector('a.gt-link');
		expect(link?.getAttribute('href')).toBe('/launch');
	});

	it('clicking a clickable item fires onEventClick', async () => {
		const user = userEvent.setup();
		const onEventClick = vi.fn();
		const { container } = render(GsapTimeline, { props: { events, onEventClick } });
		const items = container.querySelectorAll('.gt-item');
		await user.click(items[2] as HTMLElement);
		expect(onEventClick).toHaveBeenCalled();
		expect(onEventClick.mock.calls[0][0].id).toBe('3');
	});

	it('Enter on a focused item fires onEventClick', async () => {
		const user = userEvent.setup();
		const onEventClick = vi.fn();
		const { container } = render(GsapTimeline, { props: { events, onEventClick } });
		const item = container.querySelector('.gt-item') as HTMLElement;
		item.focus();
		await user.keyboard('{Enter}');
		expect(onEventClick).toHaveBeenCalled();
	});

	it('renders the progress div only when showProgress=true', () => {
		const { container: a } = render(GsapTimeline, { props: { events } });
		expect(a.querySelector('.gt-progress')).toBeNull();
		const { container: b } = render(GsapTimeline, { props: { events, showProgress: true } });
		expect(b.querySelector('.gt-progress')).toBeTruthy();
	});

	it('writes the progress percent into a CSS custom property', () => {
		const { container } = render(GsapTimeline, { props: { events, showProgress: true } });
		const wrapper = container.querySelector('.gsap-timeline') as HTMLElement;
		// 2 of 4 events completed → 50%
		expect(wrapper.getAttribute('style')).toContain('--gt-progress: 50%');
	});

	it('respects a custom dateFormat function', () => {
		const formatter = (d: Date) => `Y${d.getFullYear()}`;
		const { container } = render(GsapTimeline, { props: { events, dateFormat: formatter } });
		const dates = container.querySelectorAll('time.gt-date');
		// All four events are in 2024 → all four dates render as "Y2024"
		expect(dates.length).toBe(events.length);
		for (const d of dates) expect(d.textContent).toBe('Y2024');
	});

	it('forwards the class prop onto the wrapper', () => {
		const { container } = render(GsapTimeline, {
			props: { events, class: 'extra-gsap-tl' }
		});
		expect(container.querySelector('.gsap-timeline.extra-gsap-tl')).toBeTruthy();
	});

	it('handles an empty events array gracefully', () => {
		const { container } = render(GsapTimeline, { props: { events: [] } });
		expect(container.querySelectorAll('.gt-item').length).toBe(0);
		expect(container.querySelector('.gsap-timeline')).toBeTruthy();
	});

	it('uses the event.color override on the marker background', () => {
		const { container } = render(GsapTimeline, { props: { events } });
		const markers = container.querySelectorAll('.gt-marker');
		const purpleMarker = markers[2] as HTMLElement;
		expect((purpleMarker.getAttribute('style') ?? '').toLowerCase()).toContain('#9333ea');
	});
});
