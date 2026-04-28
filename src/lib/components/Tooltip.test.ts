/**
 * ============================================================
 * Tooltip Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Tooltip is hidden initially
 *   ✓ Hover (mouseenter) shows tooltip after showDelay
 *   ✓ Mouse leave hides immediately when hideDelay=0
 *   ✓ focusin shows the tooltip
 *   ✓ focusout hides the tooltip
 *   ✓ Escape closes a visible tooltip
 *   ✓ aria-describedby is linked when visible
 *   ✓ aria-describedby is absent when hidden
 *   ✓ Default placement is 'top' (.tooltip-top)
 *   ✓ Custom placement applies .tooltip-{placement}
 *   ✓ Custom showDelay is honoured
 *
 * Run:
 *   bun run test -- Tooltip
 * ============================================================
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Tooltip from './Tooltip.svelte';

describe('Tooltip', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('is hidden initially', () => {
		const { container } = render(Tooltip, { props: { text: 'Hi' } });
		expect(container.querySelector('[role="tooltip"]')).toBeNull();
	});

	it('shows after showDelay on mouseenter', async () => {
		const { container } = render(Tooltip, { props: { text: 'Hi', showDelay: 100 } });
		const wrap = container.querySelector('.tooltip-wrap')!;

		await fireEvent.mouseEnter(wrap);
		expect(container.querySelector('[role="tooltip"]')).toBeNull();

		vi.advanceTimersByTime(100);
		await Promise.resolve();
		expect(container.querySelector('[role="tooltip"]')?.textContent?.trim()).toBe('Hi');
	});

	it('hides immediately on mouseleave when hideDelay is 0', async () => {
		const { container } = render(Tooltip, {
			props: { text: 'Hi', showDelay: 0, hideDelay: 0 }
		});
		const wrap = container.querySelector('.tooltip-wrap')!;

		await fireEvent.mouseEnter(wrap);
		vi.advanceTimersByTime(0);
		await Promise.resolve();
		expect(container.querySelector('[role="tooltip"]')).toBeTruthy();

		await fireEvent.mouseLeave(wrap);
		expect(container.querySelector('[role="tooltip"]')).toBeNull();
	});

	it('shows on focusin', async () => {
		const { container } = render(Tooltip, { props: { text: 'Hi', showDelay: 0 } });
		const wrap = container.querySelector('.tooltip-wrap')!;

		await fireEvent.focusIn(wrap);
		vi.advanceTimersByTime(0);
		await Promise.resolve();
		expect(container.querySelector('[role="tooltip"]')).toBeTruthy();
	});

	it('hides on focusout', async () => {
		const { container } = render(Tooltip, {
			props: { text: 'Hi', showDelay: 0, hideDelay: 0 }
		});
		const wrap = container.querySelector('.tooltip-wrap')!;

		await fireEvent.focusIn(wrap);
		vi.advanceTimersByTime(0);
		await Promise.resolve();
		expect(container.querySelector('[role="tooltip"]')).toBeTruthy();

		await fireEvent.focusOut(wrap);
		expect(container.querySelector('[role="tooltip"]')).toBeNull();
	});

	it('hides when Escape is pressed while visible', async () => {
		const { container } = render(Tooltip, {
			props: { text: 'Hi', showDelay: 0, hideDelay: 200 }
		});
		const wrap = container.querySelector('.tooltip-wrap')!;

		await fireEvent.mouseEnter(wrap);
		vi.advanceTimersByTime(0);
		await Promise.resolve();
		expect(container.querySelector('[role="tooltip"]')).toBeTruthy();

		await fireEvent.keyDown(wrap, { key: 'Escape' });
		expect(container.querySelector('[role="tooltip"]')).toBeNull();
	});

	it('links trigger to tooltip via aria-describedby when visible', async () => {
		const { container } = render(Tooltip, {
			props: { text: 'Hi', showDelay: 0, id: 'fixed-id' }
		});
		const wrap = container.querySelector('.tooltip-wrap')!;
		const trigger = container.querySelector('.tooltip-trigger')!;

		expect(trigger.getAttribute('aria-describedby')).toBeNull();

		await fireEvent.mouseEnter(wrap);
		vi.advanceTimersByTime(0);
		await Promise.resolve();

		expect(trigger.getAttribute('aria-describedby')).toBe('fixed-id');
		expect(container.querySelector('#fixed-id')).toBeTruthy();
	});

	it('removes aria-describedby when hidden again', async () => {
		const { container } = render(Tooltip, {
			props: { text: 'Hi', showDelay: 0, hideDelay: 0 }
		});
		const wrap = container.querySelector('.tooltip-wrap')!;
		const trigger = container.querySelector('.tooltip-trigger')!;

		await fireEvent.mouseEnter(wrap);
		vi.advanceTimersByTime(0);
		await Promise.resolve();
		expect(trigger.getAttribute('aria-describedby')).toBeTruthy();

		await fireEvent.mouseLeave(wrap);
		expect(trigger.getAttribute('aria-describedby')).toBeNull();
	});

	it('applies the default placement class (.tooltip-top)', async () => {
		const { container } = render(Tooltip, { props: { text: 'Hi', showDelay: 0 } });
		const wrap = container.querySelector('.tooltip-wrap')!;

		await fireEvent.mouseEnter(wrap);
		vi.advanceTimersByTime(0);
		await Promise.resolve();

		expect(container.querySelector('.tooltip-top')).toBeTruthy();
	});

	it('applies a custom placement class', async () => {
		const { container } = render(Tooltip, {
			props: { text: 'Hi', placement: 'right', showDelay: 0 }
		});
		const wrap = container.querySelector('.tooltip-wrap')!;

		await fireEvent.mouseEnter(wrap);
		vi.advanceTimersByTime(0);
		await Promise.resolve();

		expect(container.querySelector('.tooltip-right')).toBeTruthy();
		expect(container.querySelector('.tooltip-top')).toBeNull();
	});

	it('honours a custom showDelay', async () => {
		const { container } = render(Tooltip, { props: { text: 'Hi', showDelay: 500 } });
		const wrap = container.querySelector('.tooltip-wrap')!;

		await fireEvent.mouseEnter(wrap);
		vi.advanceTimersByTime(400);
		await Promise.resolve();
		expect(container.querySelector('[role="tooltip"]')).toBeNull();

		vi.advanceTimersByTime(100);
		await Promise.resolve();
		expect(container.querySelector('[role="tooltip"]')).toBeTruthy();
	});
});
