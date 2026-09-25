/**
 * ============================================================
 * Typewriter Tests
 * ============================================================
 *
 * Drives the typing state machine with fake timers:
 *   - types one character per `typeSpeed` ms
 *   - holds, deletes and moves on to the next phrase when looping
 *   - stops on the final phrase when `loop` is false
 *   - waits for `startDelay` before typing anything
 *   - exposes the full phrase via aria-label (not the partial text)
 *   - cursor visibility + custom cursor character
 *   - prefers-reduced-motion shows the whole phrase instantly
 *
 * Each timer step is followed by `tick()` so Svelte can flush the
 * state change and re-run the effect that schedules the next step.
 * ============================================================
 */

import { render } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tick } from 'svelte';
import Typewriter from './Typewriter.svelte';

async function step(ms: number) {
	vi.advanceTimersByTime(ms);
	await tick();
}

function textOf(container: HTMLElement) {
	return container.querySelector('.typewriter-text')?.textContent ?? '';
}

describe('Typewriter', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('types the phrase one character per typeSpeed', async () => {
		const { container } = render(Typewriter, {
			props: { phrases: ['Hey'], typeSpeed: 100, loop: false }
		});
		await tick();
		expect(textOf(container)).toBe('');

		await step(100);
		expect(textOf(container)).toBe('H');
		await step(100);
		expect(textOf(container)).toBe('He');
		await step(100);
		expect(textOf(container)).toBe('Hey');
	});

	it('announces the full current phrase through aria-label', async () => {
		const { container } = render(Typewriter, { props: { phrases: ['Hello world'] } });
		await tick();
		const wrapper = container.querySelector('.typewriter');
		expect(wrapper).toHaveAttribute('aria-label', 'Hello world');
		expect(container.querySelector('.typewriter-text')).toHaveAttribute('aria-hidden', 'true');
	});

	it('stays on the last phrase when loop is false', async () => {
		const { container } = render(Typewriter, {
			props: { phrases: ['Ok'], typeSpeed: 10, pauseDuration: 50, loop: false }
		});
		await tick();
		await step(10);
		await step(10);
		expect(textOf(container)).toBe('Ok');

		// Long after the pause would have elapsed, nothing is deleted.
		for (let i = 0; i < 10; i++) await step(100);
		expect(textOf(container)).toBe('Ok');
	});

	it('deletes and moves on to the next phrase when looping', async () => {
		const { container } = render(Typewriter, {
			props: {
				phrases: ['Ab', 'Cd'],
				typeSpeed: 10,
				deleteSpeed: 10,
				pauseDuration: 50
			}
		});
		await tick();
		await step(10);
		await step(10);
		expect(textOf(container)).toBe('Ab');

		await step(50); // pause → pausing
		await step(0); // pausing → deleting
		await step(10);
		expect(textOf(container)).toBe('A');
		await step(10);
		expect(textOf(container)).toBe('');

		await step(200); // deleting → waiting
		await step(0); // waiting → next phrase
		expect(container.querySelector('.typewriter')).toHaveAttribute('aria-label', 'Cd');

		await step(10);
		expect(textOf(container)).toBe('C');
	});

	it('waits for startDelay before typing', async () => {
		const { container } = render(Typewriter, {
			props: { phrases: ['Go'], typeSpeed: 10, startDelay: 500 }
		});
		await tick();
		await step(100);
		expect(textOf(container)).toBe('');

		await step(400); // delay elapses → started
		await step(10);
		expect(textOf(container)).toBe('G');
	});

	it('renders the cursor with a custom character, or hides it', async () => {
		const { container, unmount } = render(Typewriter, {
			props: { phrases: ['x'], cursorChar: '_' }
		});
		const cursor = container.querySelector('.typewriter-cursor');
		expect(cursor).toHaveTextContent('_');
		expect(cursor).toHaveAttribute('aria-hidden', 'true');
		unmount();

		const hidden = render(Typewriter, { props: { phrases: ['x'], showCursor: false } });
		expect(hidden.container.querySelector('.typewriter-cursor')).toBeNull();
	});

	it('forwards the class prop to the wrapper', () => {
		const { container } = render(Typewriter, { props: { phrases: ['x'], class: 'hero-type' } });
		expect(container.querySelector('.typewriter')).toHaveClass('hero-type');
	});

	it('shows the full phrase instantly under prefers-reduced-motion', async () => {
		vi.spyOn(window, 'matchMedia').mockImplementation(
			(query: string) =>
				({
					matches: query.includes('reduce'),
					media: query,
					onchange: null,
					addListener: () => {},
					removeListener: () => {},
					addEventListener: () => {},
					removeEventListener: () => {},
					dispatchEvent: () => false
				}) as MediaQueryList
		);

		const { container } = render(Typewriter, {
			props: { phrases: ['Calm and still'], typeSpeed: 1000 }
		});
		await tick();
		await tick();
		expect(textOf(container)).toBe('Calm and still');
	});
});
