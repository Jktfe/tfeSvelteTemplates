import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

import {
	isValidVariant,
	pickVariant,
	clampDuration,
	isReducedMotion
} from './HoldToConfirm.svelte';
import Harness from './HoldToConfirmTestHarness.test.svelte';

// ============================================================
// Helpers
// ============================================================

describe('isValidVariant', () => {
	it('accepts the three named variants', () => {
		expect(isValidVariant('ring')).toBe(true);
		expect(isValidVariant('bar')).toBe(true);
		expect(isValidVariant('glow')).toBe(true);
	});

	it('rejects unknown / null / undefined / non-strings', () => {
		expect(isValidVariant('halo')).toBe(false);
		expect(isValidVariant('')).toBe(false);
		expect(isValidVariant(undefined)).toBe(false);
		expect(isValidVariant(null)).toBe(false);
		expect(isValidVariant(3)).toBe(false);
		expect(isValidVariant({})).toBe(false);
	});
});

describe('pickVariant', () => {
	it('returns the same name for valid variants', () => {
		expect(pickVariant('ring')).toBe('ring');
		expect(pickVariant('bar')).toBe('bar');
		expect(pickVariant('glow')).toBe('glow');
	});

	it('falls back to "ring" for unknown / null / undefined', () => {
		expect(pickVariant('halo')).toBe('ring');
		expect(pickVariant(undefined)).toBe('ring');
		expect(pickVariant(null)).toBe('ring');
		expect(pickVariant('')).toBe('ring');
	});
});

describe('clampDuration', () => {
	it('clamps below 200ms to 200', () => {
		expect(clampDuration(0)).toBe(200);
		expect(clampDuration(50)).toBe(200);
		expect(clampDuration(-100)).toBe(200);
		expect(clampDuration(199.9)).toBe(200);
	});

	it('clamps above 10000ms to 10000', () => {
		expect(clampDuration(10001)).toBe(10000);
		expect(clampDuration(60_000)).toBe(10000);
	});

	it('passes through values inside [200, 10000]', () => {
		expect(clampDuration(200)).toBe(200);
		expect(clampDuration(1500)).toBe(1500);
		expect(clampDuration(5000)).toBe(5000);
		expect(clampDuration(10000)).toBe(10000);
	});

	it('treats NaN / ±Infinity / non-numeric as 1500', () => {
		expect(clampDuration(NaN)).toBe(1500);
		expect(clampDuration(Infinity)).toBe(1500);
		expect(clampDuration(-Infinity)).toBe(1500);
		expect(clampDuration('1500')).toBe(1500);
		expect(clampDuration(undefined)).toBe(1500);
		expect(clampDuration(null)).toBe(1500);
		expect(clampDuration({})).toBe(1500);
	});
});

describe('isReducedMotion', () => {
	const originalMatchMedia = globalThis.window?.matchMedia;

	afterEach(() => {
		if (originalMatchMedia && globalThis.window) {
			globalThis.window.matchMedia = originalMatchMedia;
		}
	});

	it('returns false when matchMedia reports no preference', () => {
		// jsdom's default matchMedia returns matches:false
		expect(isReducedMotion()).toBe(false);
	});

	it('returns true when matchMedia reports prefers-reduced-motion', () => {
		globalThis.window.matchMedia = ((q: string) => ({
			matches: q.includes('reduce'),
			media: q,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false
		})) as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(true);
	});
});

// ============================================================
// Render contract
// ============================================================

describe('HoldToConfirm — render contract', () => {
	it('renders a button with role="button" and the label', () => {
		const { container } = render(Harness, { label: 'Hold to delete' });
		const button = container.querySelector('button.htc');
		expect(button).toBeTruthy();
		expect(button?.getAttribute('aria-label')).toBe('Hold to delete');
		expect(button?.textContent ?? '').toContain('Hold to delete');
	});

	it('uses ariaLabel prop when supplied (overrides label fallback)', () => {
		const { container } = render(Harness, {
			label: 'Hold to send',
			ariaLabel: 'Send the message irrevocably'
		});
		const button = container.querySelector('button.htc');
		expect(button?.getAttribute('aria-label')).toBe('Send the message irrevocably');
	});

	it('aria-pressed reads "false" before any interaction', () => {
		const { container } = render(Harness);
		const button = container.querySelector('button.htc') as HTMLButtonElement;
		expect(button.getAttribute('aria-pressed')).toBe('false');
	});

	it('reflects the variant via data-holdtoconfirm-variant attribute', () => {
		const { container } = render(Harness, { variant: 'bar' });
		const button = container.querySelector('button.htc') as HTMLButtonElement;
		expect(button.getAttribute('data-holdtoconfirm-variant')).toBe('bar');
	});

	it('falls back to "ring" for an unknown variant', () => {
		// @ts-expect-error — deliberately invalid for the test
		const { container } = render(Harness, { variant: 'halo' });
		const button = container.querySelector('button.htc') as HTMLButtonElement;
		expect(button.getAttribute('data-holdtoconfirm-variant')).toBe('ring');
	});

	it('renders the SVG ring for variant=ring', () => {
		const { container } = render(Harness, { variant: 'ring' });
		expect(container.querySelector('svg.htc-ring')).toBeTruthy();
		expect(container.querySelector('.htc-bar')).toBeFalsy();
		expect(container.querySelector('.htc-glow')).toBeFalsy();
	});

	it('renders the bar fill for variant=bar', () => {
		const { container } = render(Harness, { variant: 'bar' });
		expect(container.querySelector('.htc-bar')).toBeTruthy();
		expect(container.querySelector('svg.htc-ring')).toBeFalsy();
		expect(container.querySelector('.htc-glow')).toBeFalsy();
	});

	it('renders the glow element for variant=glow', () => {
		const { container } = render(Harness, { variant: 'glow' });
		expect(container.querySelector('.htc-glow')).toBeTruthy();
		expect(container.querySelector('svg.htc-ring')).toBeFalsy();
		expect(container.querySelector('.htc-bar')).toBeFalsy();
	});

	it('exposes the duration via --htc-duration custom property (clamped)', () => {
		const { container } = render(Harness, { duration: 50_000 });
		const button = container.querySelector('button.htc') as HTMLButtonElement;
		expect((button.getAttribute('style') ?? '').replace(/\s+/g, '')).toContain(
			'--htc-duration:10000ms'
		);
	});

	it('clamps a too-low duration up to 200ms in the inline style', () => {
		const { container } = render(Harness, { duration: 10 });
		const button = container.querySelector('button.htc') as HTMLButtonElement;
		expect((button.getAttribute('style') ?? '').replace(/\s+/g, '')).toContain(
			'--htc-duration:200ms'
		);
	});

	it('falls back to 1500ms for invalid duration', () => {
		// @ts-expect-error — deliberately invalid
		const { container } = render(Harness, { duration: 'fast' });
		const button = container.querySelector('button.htc') as HTMLButtonElement;
		expect((button.getAttribute('style') ?? '').replace(/\s+/g, '')).toContain(
			'--htc-duration:1500ms'
		);
	});

	it('disabled prop sets aria-disabled and the disabled attribute', () => {
		const { container } = render(Harness, { disabled: true });
		const button = container.querySelector('button.htc') as HTMLButtonElement;
		expect(button.getAttribute('aria-disabled')).toBe('true');
		expect(button.disabled).toBe(true);
	});

	it('accepts an extra className via the class prop', () => {
		const { container } = render(Harness, { class: 'extra-class' });
		const button = container.querySelector('button.htc') as HTMLButtonElement;
		expect(button.classList.contains('extra-class')).toBe(true);
	});

	it('decorative ring/bar/glow elements are aria-hidden so the label is the SR text', () => {
		const { container: ringContainer } = render(Harness, { variant: 'ring' });
		expect(ringContainer.querySelector('svg.htc-ring')?.getAttribute('aria-hidden')).toBe('true');

		const { container: barContainer } = render(Harness, { variant: 'bar' });
		expect(barContainer.querySelector('.htc-bar')?.getAttribute('aria-hidden')).toBe('true');

		const { container: glowContainer } = render(Harness, { variant: 'glow' });
		expect(glowContainer.querySelector('.htc-glow')?.getAttribute('aria-hidden')).toBe('true');
	});
});

// ============================================================
// Interaction — pointer & keyboard hold cycle
// ============================================================

describe('HoldToConfirm — pointer interaction', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('flips aria-pressed=true on pointerdown and back to false on pointerup before duration', async () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();
		const { container } = render(Harness, { duration: 1500, onConfirm, onCancel });
		const button = container.querySelector('button.htc') as HTMLButtonElement;

		await fireEvent.pointerDown(button, { pointerId: 1 });
		expect(button.getAttribute('aria-pressed')).toBe('true');

		// Release before the duration elapses → cancel
		vi.advanceTimersByTime(500);
		await fireEvent.pointerUp(button, { pointerId: 1 });

		expect(button.getAttribute('aria-pressed')).toBe('false');
		expect(onConfirm).not.toHaveBeenCalled();
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it('fires onConfirm when the hold completes the full duration', async () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();
		const { container } = render(Harness, { duration: 1000, onConfirm, onCancel });
		const button = container.querySelector('button.htc') as HTMLButtonElement;

		await fireEvent.pointerDown(button, { pointerId: 1 });
		vi.advanceTimersByTime(1000);
		await Promise.resolve();

		expect(onConfirm).toHaveBeenCalledTimes(1);
		expect(onCancel).not.toHaveBeenCalled();
	});

	it('pointercancel mid-hold cancels and does not fire onConfirm', async () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();
		const { container } = render(Harness, { duration: 1000, onConfirm, onCancel });
		const button = container.querySelector('button.htc') as HTMLButtonElement;

		await fireEvent.pointerDown(button, { pointerId: 1 });
		vi.advanceTimersByTime(300);
		await fireEvent.pointerCancel(button, { pointerId: 1 });
		vi.advanceTimersByTime(2000);

		expect(onConfirm).not.toHaveBeenCalled();
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it('disabled button ignores pointerdown entirely', async () => {
		const onConfirm = vi.fn();
		const { container } = render(Harness, { duration: 500, disabled: true, onConfirm });
		const button = container.querySelector('button.htc') as HTMLButtonElement;

		await fireEvent.pointerDown(button, { pointerId: 1 });
		vi.advanceTimersByTime(2000);

		expect(onConfirm).not.toHaveBeenCalled();
		expect(button.getAttribute('aria-pressed')).toBe('false');
	});
});

describe('HoldToConfirm — keyboard interaction', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('Enter keydown starts a programmatic hold cycle and fires onConfirm at duration', async () => {
		const onConfirm = vi.fn();
		const { container } = render(Harness, { duration: 800, onConfirm });
		const button = container.querySelector('button.htc') as HTMLButtonElement;

		await fireEvent.keyDown(button, { key: 'Enter' });
		expect(button.getAttribute('aria-pressed')).toBe('true');

		vi.advanceTimersByTime(800);
		await Promise.resolve();
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it('Enter keyup before duration cancels (mirrors release-to-cancel)', async () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();
		const { container } = render(Harness, { duration: 800, onConfirm, onCancel });
		const button = container.querySelector('button.htc') as HTMLButtonElement;

		await fireEvent.keyDown(button, { key: 'Enter' });
		vi.advanceTimersByTime(200);
		await fireEvent.keyUp(button, { key: 'Enter' });
		vi.advanceTimersByTime(2000);

		expect(onConfirm).not.toHaveBeenCalled();
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it('repeated Enter events while holding do not start a second cycle', async () => {
		const onConfirm = vi.fn();
		const { container } = render(Harness, { duration: 1000, onConfirm });
		const button = container.querySelector('button.htc') as HTMLButtonElement;

		await fireEvent.keyDown(button, { key: 'Enter' });
		await fireEvent.keyDown(button, { key: 'Enter', repeat: true });
		await fireEvent.keyDown(button, { key: 'Enter', repeat: true });

		vi.advanceTimersByTime(1000);
		await Promise.resolve();

		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it('non-Enter / non-Space keys do not trigger the hold cycle', async () => {
		const onConfirm = vi.fn();
		const { container } = render(Harness, { duration: 200, onConfirm });
		const button = container.querySelector('button.htc') as HTMLButtonElement;

		await fireEvent.keyDown(button, { key: 'a' });
		await fireEvent.keyDown(button, { key: 'Tab' });
		await fireEvent.keyDown(button, { key: 'Escape' });
		vi.advanceTimersByTime(2000);

		expect(onConfirm).not.toHaveBeenCalled();
		expect(button.getAttribute('aria-pressed')).toBe('false');
	});

	it('Space key (alternative button activation) also starts the cycle', async () => {
		const onConfirm = vi.fn();
		const { container } = render(Harness, { duration: 500, onConfirm });
		const button = container.querySelector('button.htc') as HTMLButtonElement;

		await fireEvent.keyDown(button, { key: ' ' });
		vi.advanceTimersByTime(500);
		await Promise.resolve();
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});
});
