/**
 * ============================================================
 * VariableShockText Tests
 * ============================================================
 *
 * GSAP is mocked globally in vitest.setup.ts, so these tests
 * assert *which* tweens get requested rather than how they look:
 *   - pure helpers split text + measure distance from the origin
 *   - the button carries the readable label; glyphs are aria-hidden
 *   - spaces render as non-breaking spaces with a `.space` class
 *   - idle motion starts after gsap loads (and not when idle=false)
 *   - Enter / Space / pointerdown trigger the shock timeline
 *   - other keys are ignored
 *   - prefers-reduced-motion suppresses both idle and shock motion
 * ============================================================
 */

import { render, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { gsap } from 'gsap';
import VariableShockText, { distanceFromOrigin, splitTextForShock } from './VariableShockText.svelte';

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

afterEach(() => {
	vi.restoreAllMocks();
});

describe('splitTextForShock', () => {
	it('returns one glyph per code point with stable ids', () => {
		expect(splitTextForShock('Hi')).toEqual([
			{ id: 'H-0', value: 'H', isSpace: false },
			{ id: 'i-1', value: 'i', isSpace: false }
		]);
	});

	it('flags whitespace glyphs', () => {
		const glyphs = splitTextForShock('a b');
		expect(glyphs.map((g) => g.isSpace)).toEqual([false, true, false]);
	});

	it('keeps emoji and astral characters intact', () => {
		expect(splitTextForShock('✨🎉').map((g) => g.value)).toEqual(['✨', '🎉']);
	});

	it('returns an empty array for empty text', () => {
		expect(splitTextForShock('')).toEqual([]);
	});
});

describe('distanceFromOrigin', () => {
	it('is symmetric around the origin', () => {
		expect(distanceFromOrigin(2, 5)).toBe(3);
		expect(distanceFromOrigin(8, 5)).toBe(3);
		expect(distanceFromOrigin(5, 5)).toBe(0);
	});
});

describe('VariableShockText', () => {
	it('renders an accessible button with hidden glyph spans', () => {
		const { container, getByRole } = render(VariableShockText, {
			props: { text: 'Go now' }
		});
		const button = getByRole('button', { name: 'Go now' });
		expect(button).toHaveAttribute('type', 'button');

		const glyphs = container.querySelectorAll('[data-shock-char]');
		expect(glyphs).toHaveLength(6);
		glyphs.forEach((g) => expect(g).toHaveAttribute('aria-hidden', 'true'));
	});

	it('renders spaces as non-breaking spaces with the space class', () => {
		const { container } = render(VariableShockText, { props: { text: 'a b' } });
		const glyphs = container.querySelectorAll('[data-shock-char]');
		expect(glyphs[1]).toHaveClass('space');
		expect(glyphs[1].textContent).toContain('\u00a0');
	});

	it('honours a custom ariaLabel and class', () => {
		const { getByRole } = render(VariableShockText, {
			props: { text: 'BOOM', ariaLabel: 'Boom headline', class: 'hero' }
		});
		const button = getByRole('button', { name: 'Boom headline' });
		expect(button).toHaveClass('variable-shock-text');
		expect(button).toHaveClass('hero');
	});

	it('starts the idle tween once gsap has loaded', async () => {
		mockReducedMotion(false);
		// The shared gsap mock returns a bare object; hand back a tween-shaped
		// stub so the unmount cleanup can call kill() on it.
		const toSpy = vi
			.spyOn(gsap, 'to')
			.mockImplementation(() => ({ kill: vi.fn(), pause: vi.fn() }) as never);
		render(VariableShockText, { props: { text: 'Idle' } });
		await waitFor(() => expect(toSpy).toHaveBeenCalled());
		const [, vars] = toSpy.mock.calls[0] as [unknown, Record<string, unknown>];
		expect(vars.repeat).toBe(-1);
		expect(vars.yoyo).toBe(true);
	});

	it('skips idle motion when idle is false', async () => {
		mockReducedMotion(false);
		const toSpy = vi.spyOn(gsap, 'to');
		const timelineSpy = vi.spyOn(gsap, 'timeline');
		const { getByRole } = render(VariableShockText, { props: { text: 'Still', idle: false } });

		// Prove gsap has loaded by triggering a shock, then confirm no idle tween ran.
		await waitFor(async () => {
			await fireEvent.keyDown(getByRole('button'), { key: 'Enter' });
			expect(timelineSpy).toHaveBeenCalled();
		});
		expect(toSpy).not.toHaveBeenCalled();
	});

	it('fires the shock timeline on Enter, Space and pointerdown', async () => {
		mockReducedMotion(false);
		const timelineSpy = vi.spyOn(gsap, 'timeline');
		const { getByRole } = render(VariableShockText, { props: { text: 'Hit', idle: false } });
		const button = getByRole('button');

		await waitFor(async () => {
			await fireEvent.keyDown(button, { key: 'Enter' });
			expect(timelineSpy).toHaveBeenCalledTimes(1);
		});

		await fireEvent.keyDown(button, { key: ' ' });
		expect(timelineSpy).toHaveBeenCalledTimes(2);

		await fireEvent.pointerDown(button);
		expect(timelineSpy).toHaveBeenCalledTimes(3);
	});

	it('ignores unrelated keys', async () => {
		mockReducedMotion(false);
		const timelineSpy = vi.spyOn(gsap, 'timeline');
		const { getByRole } = render(VariableShockText, { props: { text: 'Hit', idle: false } });
		const button = getByRole('button');

		// Wait for gsap to load via a real trigger, then reset the count.
		await waitFor(async () => {
			await fireEvent.keyDown(button, { key: 'Enter' });
			expect(timelineSpy).toHaveBeenCalled();
		});
		timelineSpy.mockClear();

		await fireEvent.keyDown(button, { key: 'a' });
		await fireEvent.keyDown(button, { key: 'Tab' });
		expect(timelineSpy).not.toHaveBeenCalled();
	});

	it('suppresses idle and shock motion under prefers-reduced-motion', async () => {
		mockReducedMotion(true);
		const toSpy = vi.spyOn(gsap, 'to');
		const timelineSpy = vi.spyOn(gsap, 'timeline');
		const { getByRole } = render(VariableShockText, { props: { text: 'Calm' } });

		// Give the dynamic gsap import time to resolve.
		await new Promise((resolve) => setTimeout(resolve, 20));
		await fireEvent.keyDown(getByRole('button'), { key: 'Enter' });
		await fireEvent.pointerDown(getByRole('button'));

		expect(toSpy).not.toHaveBeenCalled();
		expect(timelineSpy).not.toHaveBeenCalled();
	});
});
