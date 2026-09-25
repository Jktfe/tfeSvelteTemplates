/**
 * ============================================================
 * InteractiveCards Tests
 * ============================================================
 *
 * The scroll choreography is visual (rAF + transforms) and is
 * reviewed in the browser. These tests pin the interactive
 * contract that sits on top of it:
 *   - one labelled <button> per project, plus the hero headline
 *   - clicking a card opens the detail panel for that painting
 *   - the panel defaults to the first size/material and qty 1
 *   - pills, stepper and Back button drive the parent state
 *   - Escape and clicking the section background close the panel
 *   - custom headline / projects props are honoured
 *   - prefers-reduced-motion skips the entrance and still shows cards
 *
 * requestAnimationFrame is stubbed with a manual queue so we can
 * step frames deterministically instead of racing a real loop.
 * ============================================================
 */

import { render, screen, fireEvent, within } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tick } from 'svelte';
import InteractiveCards from './InteractiveCards.svelte';
import { FALLBACK_INTERACTIVE_PROJECTS } from '$lib/constants';

let frameQueue: FrameRequestCallback[] = [];
let frameClock = 0;

function runFrames(count: number) {
	for (let i = 0; i < count; i++) {
		const queued = frameQueue;
		frameQueue = [];
		frameClock += 16;
		queued.forEach((cb) => cb(frameClock));
	}
}

function mockReducedMotion(reduce: boolean) {
	vi.spyOn(window, 'matchMedia').mockImplementation(
		(query: string) =>
			({
				matches: reduce && query.includes('reduce'),
				media: query,
				onchange: null,
				addListener: () => {},
				removeListener: () => {},
				addEventListener: () => {},
				removeEventListener: () => {},
				dispatchEvent: () => false
			}) as MediaQueryList
	);
}

function detailPanel() {
	return document.querySelector('[data-panel]') as HTMLElement | null;
}

describe('InteractiveCards', () => {
	beforeEach(() => {
		frameQueue = [];
		frameClock = 0;
		vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
			frameQueue.push(cb);
			return frameQueue.length;
		});
		vi.stubGlobal('cancelAnimationFrame', () => undefined);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('renders the hero headline and a labelled button per painting', () => {
		render(InteractiveCards);
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Every brushstroke');
		for (const project of FALLBACK_INTERACTIVE_PROJECTS) {
			expect(
				screen.getByRole('button', { name: `View ${project.title} by ${project.artist}` })
			).toBeInTheDocument();
		}
	});

	it('labels the gallery region', () => {
		render(InteractiveCards);
		expect(screen.getByRole('region', { name: 'Paintings gallery' })).toBeInTheDocument();
	});

	it('honours custom headline and projects', () => {
		const projects = FALLBACK_INTERACTIVE_PROJECTS.slice(0, 2);
		render(InteractiveCards, {
			props: { projects, headline: ['Small shows', 'big feelings.'] }
		});
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Small shows');
		expect(document.querySelectorAll('[data-card]')).toHaveLength(2);
	});

	it('opens the detail panel with sensible defaults when a card is clicked', async () => {
		const project = FALLBACK_INTERACTIVE_PROJECTS[1];
		render(InteractiveCards);
		expect(detailPanel()).toBeNull();

		await fireEvent.click(
			screen.getByRole('button', { name: `View ${project.title} by ${project.artist}` })
		);

		const panel = detailPanel()!;
		expect(panel).toHaveClass('open');
		expect(panel).toHaveAttribute('aria-hidden', 'false');
		expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent(project.title);
		expect(within(panel).getByRole('radio', { name: project.sizes[0] })).toHaveAttribute(
			'aria-checked',
			'true'
		);
		expect(within(panel).getByRole('radio', { name: project.materials[0] })).toHaveAttribute(
			'aria-checked',
			'true'
		);
		expect(panel.querySelector('.qty-value')).toHaveTextContent('1');
	});

	it('updates size, material and quantity from the panel controls', async () => {
		const project = FALLBACK_INTERACTIVE_PROJECTS[0];
		render(InteractiveCards);
		await fireEvent.click(document.querySelectorAll('[data-card]')[0]);
		const panel = detailPanel()!;

		await fireEvent.click(within(panel).getByRole('radio', { name: project.sizes[1] }));
		expect(within(panel).getByRole('radio', { name: project.sizes[1] })).toHaveAttribute(
			'aria-checked',
			'true'
		);

		await fireEvent.click(within(panel).getByRole('radio', { name: project.materials[2] }));
		expect(within(panel).getByRole('radio', { name: project.materials[2] })).toHaveAttribute(
			'aria-checked',
			'true'
		);

		const increase = within(panel).getByRole('button', { name: 'Increase quantity' });
		const decrease = within(panel).getByRole('button', { name: 'Decrease quantity' });
		await fireEvent.click(increase);
		await fireEvent.click(increase);
		expect(panel.querySelector('.qty-value')).toHaveTextContent('3');
		await fireEvent.click(decrease);
		await fireEvent.click(decrease);
		await fireEvent.click(decrease);
		expect(panel.querySelector('.qty-value')).toHaveTextContent('1');
	});

	it('closes the detail panel on Escape', async () => {
		render(InteractiveCards);
		await fireEvent.click(document.querySelectorAll('[data-card]')[0]);
		expect(detailPanel()).toHaveClass('open');

		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(detailPanel()).toBeNull();
	});

	it('closes the detail panel from the Back button and on background click', async () => {
		render(InteractiveCards);
		await fireEvent.click(document.querySelectorAll('[data-card]')[0]);
		await fireEvent.click(screen.getByRole('button', { name: 'Back to collection' }));
		expect(detailPanel()).toBeNull();

		await fireEvent.click(document.querySelectorAll('[data-card]')[0]);
		// A click inside the panel must not close it...
		await fireEvent.click(detailPanel()!.querySelector('.description')!);
		expect(detailPanel()).not.toBeNull();
		// ...but a click on the section background does.
		await fireEvent.click(screen.getByRole('region', { name: 'Paintings gallery' }));
		expect(detailPanel()).toBeNull();
	});

	it('keeps the rAF loop running and writes card transforms', async () => {
		mockReducedMotion(false);
		render(InteractiveCards);
		await tick();
		runFrames(3);
		expect(frameQueue.length).toBe(1);
		const slot = document.querySelector('.card-slot') as HTMLElement;
		expect(slot.style.transform).toContain('translate3d');
	});

	it('skips the entrance under prefers-reduced-motion so cards are visible at once', async () => {
		mockReducedMotion(true);
		// happy-dom lays nothing out, so every rect is 0×0. The component waits
		// for a measured hero title before posing cards — give it a real height.
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
			x: 0,
			y: 0,
			top: 0,
			left: 0,
			right: 800,
			bottom: 120,
			width: 800,
			height: 120,
			toJSON: () => ({})
		} as DOMRect);
		render(InteractiveCards);
		await tick();
		runFrames(2);

		const slots = Array.from(document.querySelectorAll<HTMLElement>('.card-slot'));
		expect(slots.length).toBe(FALLBACK_INTERACTIVE_PROJECTS.length);
		for (const slot of slots) {
			expect(slot.style.opacity).toBe('1');
		}
		// Loop still ticks so scroll + detail view stay responsive.
		expect(frameQueue.length).toBe(1);
	});
});
