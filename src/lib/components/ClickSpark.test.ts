/**
 * ============================================================
 * ClickSpark Tests
 * ============================================================
 *
 * Verifies the click-burst contract:
 *  - getSparkAngles helper distributes evenly around the circle
 *  - Click on the wrapper spawns the configured number of sparks
 *  - Sparks self-clean after the configured duration
 *  - prefers-reduced-motion suppresses burst generation entirely
 *  - Wrapped children remain interactive (click events still fire
 *    on the inner button)
 *
 * jsdom does not run CSS animations, so we assert the *DOM
 * presence* of the spark elements rather than their visual state.
 * That's enough to verify the component's contract. Real-browser
 * visual review happens via the demo route + screenshot.
 * ============================================================
 */

import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { tick } from 'svelte';
import { getSparkAngles } from './ClickSpark.svelte';
import ClickSparkTestHarness from './ClickSparkTestHarness.test.svelte';

describe('getSparkAngles', () => {
	it('returns an empty array for non-positive counts', () => {
		expect(getSparkAngles(0)).toEqual([]);
		expect(getSparkAngles(-3)).toEqual([]);
	});

	it('returns a single angle at 0° for count=1', () => {
		expect(getSparkAngles(1)).toEqual([0]);
	});

	it('distributes 4 angles at 0/90/180/270', () => {
		expect(getSparkAngles(4)).toEqual([0, 90, 180, 270]);
	});

	it('distributes 8 angles at 45° steps', () => {
		expect(getSparkAngles(8)).toEqual([0, 45, 90, 135, 180, 225, 270, 315]);
	});

	it('always starts at 0°', () => {
		for (const n of [2, 3, 5, 7, 12, 24]) {
			expect(getSparkAngles(n)[0]).toBe(0);
		}
	});

	it('keeps adjacent angles equally spaced', () => {
		const angles = getSparkAngles(6);
		for (let i = 1; i < angles.length; i++) {
			expect(angles[i] - angles[i - 1]).toBeCloseTo(60);
		}
	});
});

describe('ClickSpark', () => {
	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('renders the wrapped child', () => {
		const { getByTestId } = render(ClickSparkTestHarness);
		expect(getByTestId('trigger').textContent).toBe('Click target');
	});

	it('does not render any sparks before a click', () => {
		const { container } = render(ClickSparkTestHarness);
		expect(container.querySelector('.burst')).toBeNull();
		expect(container.querySelectorAll('.spark').length).toBe(0);
	});

	it('spawns the configured number of sparks on click', async () => {
		const { container } = render(ClickSparkTestHarness, {
			props: { sparkCount: 12 }
		});
		const wrapper = container.querySelector('.click-spark-wrapper') as HTMLElement;
		await fireEvent.click(wrapper);
		await tick();
		expect(container.querySelector('.burst')).toBeTruthy();
		expect(container.querySelectorAll('.spark').length).toBe(12);
	});

	it('applies the configured shape class to each spark', async () => {
		const { container } = render(ClickSparkTestHarness, {
			props: { sparkCount: 4, shape: 'star' }
		});
		const wrapper = container.querySelector('.click-spark-wrapper') as HTMLElement;
		await fireEvent.click(wrapper);
		await tick();
		const sparks = container.querySelectorAll('.spark');
		expect(sparks.length).toBe(4);
		sparks.forEach((s) => expect(s.classList.contains('spark-star')).toBe(true));
	});

	it('forwards CSS variables for size, distance, color', async () => {
		const { container } = render(ClickSparkTestHarness, {
			props: { sparkCount: 1, sparkSize: 16, spreadRadius: 90, sparkColor: '#ff00aa' }
		});
		const wrapper = container.querySelector('.click-spark-wrapper') as HTMLElement;
		await fireEvent.click(wrapper);
		await tick();
		const spark = container.querySelector('.spark') as HTMLElement;
		const style = spark.getAttribute('style') ?? '';
		expect(style).toContain('--size: 16px');
		expect(style).toContain('--distance: 90px');
		expect(style).toContain('--color: #ff00aa');
	});

	it('removes the burst from the DOM after duration', async () => {
		vi.useFakeTimers();
		const { container } = render(ClickSparkTestHarness, {
			props: { sparkCount: 4, duration: 200 }
		});
		const wrapper = container.querySelector('.click-spark-wrapper') as HTMLElement;
		await fireEvent.click(wrapper);
		await tick();
		expect(container.querySelectorAll('.spark').length).toBe(4);
		vi.advanceTimersByTime(300); // duration + cushion
		await tick();
		expect(container.querySelector('.burst')).toBeNull();
		expect(container.querySelectorAll('.spark').length).toBe(0);
	});

	it('composes multiple bursts on rapid clicks', async () => {
		const { container } = render(ClickSparkTestHarness, {
			props: { sparkCount: 4 }
		});
		const wrapper = container.querySelector('.click-spark-wrapper') as HTMLElement;
		await fireEvent.click(wrapper);
		await fireEvent.click(wrapper);
		await fireEvent.click(wrapper);
		await tick();
		expect(container.querySelectorAll('.burst').length).toBe(3);
		expect(container.querySelectorAll('.spark').length).toBe(12);
	});

	it('skips burst generation when prefers-reduced-motion is set', async () => {
		const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
			matches: query === '(prefers-reduced-motion: reduce)',
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}));
		const { container } = render(ClickSparkTestHarness, {
			props: { sparkCount: 4 }
		});
		const wrapper = container.querySelector('.click-spark-wrapper') as HTMLElement;
		await fireEvent.click(wrapper);
		await tick();
		expect(container.querySelector('.burst')).toBeNull();
		expect(container.querySelectorAll('.spark').length).toBe(0);
		matchMediaSpy.mockRestore();
	});

	it('child click events still propagate (button onclick fires)', async () => {
		const { getByTestId } = render(ClickSparkTestHarness);
		const button = getByTestId('trigger') as HTMLButtonElement;
		const spy = vi.fn();
		button.addEventListener('click', spy);
		await fireEvent.click(button);
		expect(spy).toHaveBeenCalledTimes(1);
	});
});
