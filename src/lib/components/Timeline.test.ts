/**
 * ============================================================
 * Timeline Tests
 * ============================================================
 *
 * These tests make sure our animated timeline works correctly.
 *
 * What we're checking:
 *   - It renders without exploding (always a good start!)
 *   - Different orientations display correctly (vertical, horizontal)
 *   - Event alignment works as expected (left, right, alternate)
 *   - Accessibility attributes are in place
 *   - Click handlers fire correctly
 *   - Custom styling props are applied
 *
 * Note: Animation testing is tricky in JSDOM, so we focus on
 * structure and interaction rather than visual animations.
 *
 * Run these tests:
 *   bun run test                    - Run once
 *   bun run test:watch              - Watch mode
 *   bun run test -- Timeline        - Just this file
 *
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Timeline from './Timeline.svelte';
import type { TimelineEvent } from '$lib/types';

// Sample events for testing
const mockEvents: TimelineEvent[] = [
	{
		id: '1',
		date: '2024-01-15',
		title: 'First Event',
		description: 'This is the first event',
		completed: true
	},
	{
		id: '2',
		date: '2024-03-20',
		title: 'Second Event',
		description: 'This is the second event',
		completed: false
	},
	{
		id: '3',
		date: '2024-06-10',
		title: 'Third Event',
		description: 'This is the third event',
		icon: '🎉'
	}
];

describe('Timeline', () => {
	// Mock IntersectionObserver since JSDOM doesn't support it
	beforeEach(() => {
		// Create a proper class mock for IntersectionObserver
		class MockIntersectionObserver {
			callback: IntersectionObserverCallback;
			root: Element | null = null;
			rootMargin: string = '';
			thresholds: ReadonlyArray<number> = [];

			constructor(callback: IntersectionObserverCallback) {
				this.callback = callback;
			}
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
			takeRecords = vi.fn().mockReturnValue([]);
		}
		window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

		// Mock matchMedia for reduced motion check
		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			value: vi.fn().mockImplementation((query: string) => ({
				matches: false,
				media: query,
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn()
			}))
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents }
		});

		// If we got here without errors, that's a win!
		expect(container).toBeTruthy();
	});

	// The timeline should have the correct role for accessibility
	it('has the correct ARIA role', () => {
		render(Timeline, {
			props: { events: mockEvents }
		});

		// Timeline should be announced as a list to screen readers
		const list = screen.getByRole('list');
		expect(list).toBeInTheDocument();
		expect(list.getAttribute('aria-label')).toBe('Timeline of events');
	});

	// Test the default vertical orientation
	it('renders in vertical orientation by default', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents }
		});

		// Should have the vertical orientation class
		const timeline = container.querySelector('.timeline--vertical');
		expect(timeline).toBeInTheDocument();
	});

	// Test horizontal orientation
	it('renders in horizontal orientation when specified', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents, orientation: 'horizontal' }
		});

		// Should have the horizontal orientation class
		const timeline = container.querySelector('.timeline--horizontal');
		expect(timeline).toBeInTheDocument();
	});

	// Test that all events are rendered
	it('renders all provided events', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents }
		});

		// Should have 3 timeline items
		const items = container.querySelectorAll('.timeline-item');
		expect(items.length).toBe(3);
	});

	// Test event titles are displayed
	it('displays event titles', () => {
		render(Timeline, {
			props: { events: mockEvents }
		});

		expect(screen.getByText('First Event')).toBeInTheDocument();
		expect(screen.getByText('Second Event')).toBeInTheDocument();
		expect(screen.getByText('Third Event')).toBeInTheDocument();
	});

	// Test event descriptions are displayed
	it('displays event descriptions', () => {
		render(Timeline, {
			props: { events: mockEvents }
		});

		expect(screen.getByText('This is the first event')).toBeInTheDocument();
		expect(screen.getByText('This is the second event')).toBeInTheDocument();
	});

	// Test alternate alignment
	it('applies alternate alignment by default', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents }
		});

		const items = container.querySelectorAll('.timeline-item');

		// First item should be left-aligned (even index)
		expect(items[0].classList.contains('align-left')).toBe(true);

		// Second item should be right-aligned (odd index)
		expect(items[1].classList.contains('align-right')).toBe(true);

		// Third item should be left-aligned (even index)
		expect(items[2].classList.contains('align-left')).toBe(true);
	});

	// Test left alignment
	it('applies left alignment when specified', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents, alignment: 'left' }
		});

		const items = container.querySelectorAll('.timeline-item');

		// All items should be left-aligned
		items.forEach((item) => {
			expect(item.classList.contains('align-left')).toBe(true);
		});
	});

	// Test right alignment
	it('applies right alignment when specified', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents, alignment: 'right' }
		});

		const items = container.querySelectorAll('.timeline-item');

		// All items should be right-aligned
		items.forEach((item) => {
			expect(item.classList.contains('align-right')).toBe(true);
		});
	});

	// Test completed event styling
	it('marks completed events with correct class', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents }
		});

		const items = container.querySelectorAll('.timeline-item');

		// First event is completed
		expect(items[0].classList.contains('timeline-item--completed')).toBe(true);

		// Second event is not completed
		expect(items[1].classList.contains('timeline-item--completed')).toBe(false);
	});

	// Test custom icons display
	it('displays custom icons on markers', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents }
		});

		// Third event has a party emoji icon
		const iconMarker = container.querySelector('.timeline-marker-icon');
		expect(iconMarker?.textContent).toBe('🎉');
	});

	// Test check mark for completed events without custom icon
	it('shows check mark for completed events without icon', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents }
		});

		// First event is completed and has no custom icon
		const checkMarks = container.querySelectorAll('.timeline-marker-check');
		expect(checkMarks.length).toBeGreaterThan(0);
		expect(checkMarks[0].textContent).toBe('✓');
	});

	// Test click handler
	it('calls onEventClick when event is clicked', async () => {
		const onEventClick = vi.fn();

		const { container } = render(Timeline, {
			props: { events: mockEvents, onEventClick }
		});

		// Click the first timeline item
		const firstItem = container.querySelector('.timeline-item');
		if (firstItem) {
			await fireEvent.click(firstItem);
		}

		// The callback should have been called with the event
		expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
	});

	// Test keyboard navigation
	it('activates event on Enter key', async () => {
		const onEventClick = vi.fn();

		const { container } = render(Timeline, {
			props: { events: mockEvents, onEventClick }
		});

		// Press Enter on the first timeline item
		const firstItem = container.querySelector('.timeline-item');
		if (firstItem) {
			await fireEvent.keyDown(firstItem, { key: 'Enter' });
		}

		// The callback should have been called
		expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
	});

	// Test keyboard navigation with Space
	it('activates event on Space key', async () => {
		const onEventClick = vi.fn();

		const { container } = render(Timeline, {
			props: { events: mockEvents, onEventClick }
		});

		// Press Space on the first timeline item
		const firstItem = container.querySelector('.timeline-item');
		if (firstItem) {
			await fireEvent.keyDown(firstItem, { key: ' ' });
		}

		// The callback should have been called
		expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
	});

	// Test custom line colour
	it('applies custom line colour', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents, lineColor: '#ff0000' }
		});

		const timeline = container.querySelector('.timeline') as HTMLElement;
		expect(timeline.style.getPropertyValue('--line-color')).toBe('#ff0000');
	});

	// Test custom marker colour
	it('applies custom marker colour', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents, markerColor: '#00ff00' }
		});

		const timeline = container.querySelector('.timeline') as HTMLElement;
		expect(timeline.style.getPropertyValue('--marker-color')).toBe('#00ff00');
	});

	// Test progress line display
	it('shows progress line when showProgress is true', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents, showProgress: true }
		});

		const progressLine = container.querySelector('.timeline-progress');
		expect(progressLine).toBeInTheDocument();
	});

	// Test progress line hidden by default
	it('hides progress line by default', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents }
		});

		const progressLine = container.querySelector('.timeline-progress');
		expect(progressLine).not.toBeInTheDocument();
	});

	// Test relative date formatting
	it('formats dates correctly with default format', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents }
		});

		// Should find time elements with formatted dates
		const dates = container.querySelectorAll('.timeline-date');
		expect(dates.length).toBe(3);
	});

	// Test custom date format function
	it('uses custom date format function', () => {
		const customFormat = (date: Date | string) => {
			const d = typeof date === 'string' ? new Date(date) : date;
			return `Year: ${d.getFullYear()}`;
		};

		render(Timeline, {
			props: { events: mockEvents, dateFormat: customFormat }
		});

		// Should find our custom formatted dates (all 3 events are from 2024)
		const formattedDates = screen.getAllByText('Year: 2024');
		expect(formattedDates).toHaveLength(3);
	});

	// Test event links
	it('renders links for events with href', () => {
		const eventsWithLink: TimelineEvent[] = [
			{
				id: '1',
				date: '2024-01-15',
				title: 'Linked Event',
				href: '/some-page'
			}
		];

		const { container } = render(Timeline, {
			props: { events: eventsWithLink }
		});

		const link = container.querySelector('.timeline-link') as HTMLAnchorElement;
		expect(link).toBeInTheDocument();
		expect(link.getAttribute('href')).toBe('/some-page');
	});

	// Test timeline line exists
	it('has a connecting line element', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents }
		});

		const line = container.querySelector('.timeline-line');
		expect(line).toBeInTheDocument();
	});

	// Test markers exist for each event
	it('has markers for each event', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents }
		});

		const markers = container.querySelectorAll('.timeline-marker');
		expect(markers.length).toBe(3);
	});

	// Test custom event colour
	it('applies custom colour to event marker', () => {
		const eventsWithColour: TimelineEvent[] = [
			{
				id: '1',
				date: '2024-01-15',
				title: 'Coloured Event',
				color: '#ff6b6b'
			}
		];

		const { container } = render(Timeline, {
			props: { events: eventsWithColour }
		});

		const marker = container.querySelector('.timeline-marker') as HTMLElement;
		expect(marker.style.backgroundColor).toBe('rgb(255, 107, 107)');
	});

	// Test animation none doesn't set opacity
	it('does not hide items when animation is none', () => {
		const { container } = render(Timeline, {
			props: { events: mockEvents, animation: 'none' }
		});

		const items = container.querySelectorAll('.timeline-item');
		items.forEach((item) => {
			const element = item as HTMLElement;
			// When animation is 'none', items should not have opacity: 0 inline style
			expect(element.style.opacity).not.toBe('0');
		});
	});
});
