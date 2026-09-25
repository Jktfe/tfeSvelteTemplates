/**
 * ============================================================
 * ToastNotification Tests
 * ============================================================
 *
 * Covers the contract between the module-level toast bus
 * (`$lib/toast.svelte`) and the rendered container:
 *   - addToast() pushes a toast that renders with the right severity
 *   - error toasts escalate to role="alert" / aria-live="assertive"
 *   - the close button and Escape key dismiss the latest toast
 *   - non-dismissible toasts ignore Escape and render no close button
 *   - action buttons fire their callback and then dismiss
 *   - duration > 0 auto-dismisses; duration 0 persists
 *   - maxVisible caps how many toasts are shown at once
 *   - position + offset props reach the container
 *
 * The toast stack is module state, so every test starts by emptying
 * it — otherwise toasts from one test would leak into the next.
 *
 * happy-dom has no Web Animations API, and Svelte's fly/fade call
 * `element.animate()`. We stub it with an animation that finishes on
 * the next microtask, so intros/outros complete instantly.
 * ============================================================
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { tick } from 'svelte';
import ToastNotification from './ToastNotification.svelte';
import { addToast, dismissToast, toastState } from '$lib/toast.svelte';

function clearStack() {
	toastState.stack.splice(0, toastState.stack.length);
}

type AnimateFn = typeof Element.prototype.animate;
const originalAnimate: AnimateFn | undefined = Element.prototype.animate;

function instantAnimate(this: Element) {
	const animation = {
		onfinish: null as null | (() => void),
		cancel: () => undefined,
		currentTime: 0,
		playState: 'finished',
		effect: null
	};
	queueMicrotask(() => animation.onfinish?.());
	return animation as unknown as Animation;
}

describe('ToastNotification', () => {
	beforeAll(() => {
		Element.prototype.animate = instantAnimate as unknown as AnimateFn;
	});

	afterAll(() => {
		if (originalAnimate) {
			Element.prototype.animate = originalAnimate;
		} else {
			delete (Element.prototype as { animate?: AnimateFn }).animate;
		}
	});

	beforeEach(() => {
		clearStack();
	});

	afterEach(() => {
		vi.useRealTimers();
		clearStack();
	});

	it('renders an empty, labelled live region when there are no toasts', () => {
		const { container } = render(ToastNotification);
		const region = container.querySelector('.toast-container');
		expect(region).toBeInTheDocument();
		expect(region).toHaveAttribute('aria-label', 'Notifications');
		expect(region).toHaveAttribute('aria-live', 'polite');
		expect(container.querySelectorAll('.toast-item')).toHaveLength(0);
	});

	it('renders a toast pushed through addToast with its severity class', async () => {
		const { container } = render(ToastNotification);
		addToast({ message: 'Saved your changes', severity: 'success', duration: 0 });
		await tick();

		expect(screen.getByText('Saved your changes')).toBeInTheDocument();
		const item = container.querySelector('.toast-item');
		expect(item).toHaveClass('success');
		expect(item).toHaveAttribute('role', 'status');
	});

	it('defaults severity to info', async () => {
		const { container } = render(ToastNotification);
		addToast({ message: 'Heads up', duration: 0 });
		await tick();
		expect(container.querySelector('.toast-item')).toHaveClass('info');
	});

	it('escalates error toasts to an assertive alert', async () => {
		const { container } = render(ToastNotification);
		addToast({ message: 'Upload failed', severity: 'error', duration: 0 });
		await tick();

		const item = container.querySelector('.toast-item');
		expect(item).toHaveAttribute('role', 'alert');
		expect(item).toHaveAttribute('aria-live', 'assertive');
	});

	it('dismisses a toast when the close button is clicked', async () => {
		render(ToastNotification);
		addToast({ message: 'Closable', duration: 0 });
		await tick();

		await fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
		expect(toastState.stack).toHaveLength(0);
		await waitFor(() => expect(screen.queryByText('Closable')).not.toBeInTheDocument());
	});

	it('dismisses only the most recent toast on Escape', async () => {
		render(ToastNotification);
		addToast({ id: 'first', message: 'First', duration: 0 });
		addToast({ id: 'second', message: 'Second', duration: 0 });
		await tick();

		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(toastState.stack.map((t) => t.id)).toEqual(['first']);
	});

	it('ignores Escape for non-dismissible toasts and hides their close button', async () => {
		render(ToastNotification);
		addToast({ message: 'Sticky', duration: 0, dismissible: false });
		await tick();

		expect(screen.queryByRole('button', { name: 'Dismiss notification' })).toBeNull();
		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(toastState.stack).toHaveLength(1);
	});

	it('runs the action callback and then dismisses the toast', async () => {
		const onclick = vi.fn();
		render(ToastNotification);
		addToast({ message: 'Item deleted', duration: 0, action: { label: 'Undo', onclick } });
		await tick();

		await fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
		expect(onclick).toHaveBeenCalledTimes(1);
		expect(toastState.stack).toHaveLength(0);
	});

	it('auto-dismisses after the configured duration', async () => {
		vi.useFakeTimers();
		render(ToastNotification);
		addToast({ message: 'Brief', duration: 1000 });
		await tick();
		expect(toastState.stack).toHaveLength(1);

		vi.advanceTimersByTime(999);
		expect(toastState.stack).toHaveLength(1);
		vi.advanceTimersByTime(1);
		expect(toastState.stack).toHaveLength(0);
	});

	it('keeps duration: 0 toasts until they are dismissed manually', () => {
		vi.useFakeTimers();
		render(ToastNotification);
		const id = addToast({ message: 'Persistent', duration: 0 });
		vi.advanceTimersByTime(60_000);
		expect(toastState.stack).toHaveLength(1);
		dismissToast(id);
		expect(toastState.stack).toHaveLength(0);
	});

	it('caps the visible toasts at maxVisible, keeping the newest', async () => {
		const { container } = render(ToastNotification, { props: { maxVisible: 2 } });
		addToast({ message: 'One', duration: 0 });
		addToast({ message: 'Two', duration: 0 });
		addToast({ message: 'Three', duration: 0 });
		await tick();

		const messages = Array.from(container.querySelectorAll('.toast-message')).map(
			(n) => n.textContent
		);
		expect(messages).toEqual(['Two', 'Three']);
	});

	it('applies position class and offset custom properties', () => {
		const { container } = render(ToastNotification, {
			props: { position: 'bottom-left', offsetY: '5rem', offsetX: '2rem', class: 'extra' }
		});
		const region = container.querySelector('.toast-container') as HTMLElement;
		expect(region).toHaveClass('bottom-left');
		expect(region).toHaveClass('extra');
		expect(region.style.getPropertyValue('--toast-offset-y')).toBe('5rem');
		expect(region.style.getPropertyValue('--toast-offset-x')).toBe('2rem');
	});
});
