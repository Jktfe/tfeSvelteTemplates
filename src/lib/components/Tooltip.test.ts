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
import { createRawSnippet } from 'svelte';
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

describe('Tooltip keyboard dismissal and describedby wiring', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const buttonChild = (attrs = '') =>
		createRawSnippet(() => ({
			render: () => `<button type="button" ${attrs}>Save</button>`
		}));

	async function hoverOpen(wrap: Element) {
		await fireEvent.mouseEnter(wrap);
		vi.advanceTimersByTime(0);
		await Promise.resolve();
	}

	it('closes a hover-opened tooltip on Escape even when focus is elsewhere', async () => {
		const outside = document.createElement('input');
		document.body.appendChild(outside);
		outside.focus();

		const { container } = render(Tooltip, { props: { text: 'Hi', showDelay: 0 } });
		await hoverOpen(container.querySelector('.tooltip-wrap')!);
		expect(container.querySelector('[role="tooltip"]')).toBeTruthy();

		await fireEvent.keyDown(outside, { key: 'Escape' });
		expect(container.querySelector('[role="tooltip"]')).toBeNull();
		outside.remove();
	});

	it('cancels a pending show when Escape is pressed before the delay elapses', async () => {
		const { container } = render(Tooltip, { props: { text: 'Hi', showDelay: 300 } });
		await fireEvent.mouseEnter(container.querySelector('.tooltip-wrap')!);
		await fireEvent.keyDown(window, { key: 'Escape' });
		vi.advanceTimersByTime(300);
		await Promise.resolve();
		expect(container.querySelector('[role="tooltip"]')).toBeNull();
	});

	it('puts aria-describedby on the focusable child, not just the wrapper span', async () => {
		const { container } = render(Tooltip, {
			props: { text: 'Hi', showDelay: 0, id: 'tip-save', children: buttonChild() }
		});
		const button = container.querySelector('button')!;
		expect(button.getAttribute('aria-describedby')).toBeNull();

		await hoverOpen(container.querySelector('.tooltip-wrap')!);
		expect(button.getAttribute('aria-describedby')).toBe('tip-save');

		await fireEvent.mouseLeave(container.querySelector('.tooltip-wrap')!);
		await Promise.resolve();
		expect(button.getAttribute('aria-describedby')).toBeNull();
	});

	it("preserves the child's own aria-describedby ids", async () => {
		const { container } = render(Tooltip, {
			props: {
				text: 'Hi',
				showDelay: 0,
				id: 'tip-save',
				children: buttonChild('aria-describedby="hint-a"')
			}
		});
		const button = container.querySelector('button')!;

		await hoverOpen(container.querySelector('.tooltip-wrap')!);
		expect(button.getAttribute('aria-describedby')).toBe('hint-a tip-save');

		await fireEvent.mouseLeave(container.querySelector('.tooltip-wrap')!);
		await Promise.resolve();
		expect(button.getAttribute('aria-describedby')).toBe('hint-a');
	});
});
