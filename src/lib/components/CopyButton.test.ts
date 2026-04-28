/**
 * ============================================================
 * CopyButton Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Renders the default 'Copy' label
 *   ✓ Renders custom label
 *   ✓ Applies the size class
 *   ✓ Applies the variant class
 *   ✓ Variant 'icon' hides the label, 'text' hides the icon
 *   ✓ Calls navigator.clipboard.writeText with the value on click
 *   ✓ Flips to copied state and shows copiedLabel
 *   ✓ Resets after copiedDuration
 *   ✓ Fires onCopy callback with the value
 *   ✓ Stays in idle state if clipboard write fails
 *   ✓ Uses ariaLabel override when provided
 *
 * Run:
 *   bun run test -- CopyButton
 * ============================================================
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import CopyButton from './CopyButton.svelte';

function mockClipboard(write: (text: string) => Promise<void> = async () => undefined) {
	Object.defineProperty(navigator, 'clipboard', {
		value: { writeText: vi.fn(write) },
		configurable: true,
		writable: true
	});
	return navigator.clipboard.writeText as ReturnType<typeof vi.fn>;
}

describe('CopyButton', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('renders the default Copy label', () => {
		mockClipboard();
		const { getByText } = render(CopyButton, { value: 'hi' });
		expect(getByText('Copy')).toBeTruthy();
	});

	it('renders a custom label', () => {
		mockClipboard();
		const { getByText } = render(CopyButton, { value: 'hi', label: 'Copy URL' });
		expect(getByText('Copy URL')).toBeTruthy();
	});

	it('applies the size class', () => {
		mockClipboard();
		const { container } = render(CopyButton, { value: 'hi', size: 'lg' });
		const btn = container.querySelector('.copy-btn') as HTMLElement;
		expect(btn.classList.contains('copy-lg')).toBe(true);
	});

	it("variant 'icon' hides the label", () => {
		mockClipboard();
		const { container } = render(CopyButton, { value: 'hi', variant: 'icon' });
		expect(container.querySelector('.copy-label')).toBeNull();
		expect(container.querySelector('.copy-icon')).toBeTruthy();
	});

	it("variant 'text' hides the icon", () => {
		mockClipboard();
		const { container } = render(CopyButton, { value: 'hi', variant: 'text' });
		expect(container.querySelector('.copy-icon')).toBeNull();
		expect(container.querySelector('.copy-label')).toBeTruthy();
	});

	it('writes the value to clipboard on click', async () => {
		const write = mockClipboard();
		const { container } = render(CopyButton, { value: 'secret-token' });
		const btn = container.querySelector('.copy-btn') as HTMLButtonElement;
		await fireEvent.click(btn);
		expect(write).toHaveBeenCalledWith('secret-token');
	});

	it('flips to copied state after a successful click', async () => {
		mockClipboard();
		const { container } = render(CopyButton, { value: 'hi', copiedLabel: 'Yay!' });
		const btn = container.querySelector('.copy-btn') as HTMLButtonElement;
		await fireEvent.click(btn);
		expect(container.querySelector('.copy-label')?.textContent).toBe('Yay!');
		expect(btn.classList.contains('is-copied')).toBe(true);
	});

	it('resets to idle after copiedDuration', async () => {
		mockClipboard();
		const { container } = render(CopyButton, {
			value: 'hi',
			copiedDuration: 1000
		});
		const btn = container.querySelector('.copy-btn') as HTMLButtonElement;
		await fireEvent.click(btn);
		expect(btn.classList.contains('is-copied')).toBe(true);
		await vi.advanceTimersByTimeAsync(1000);
		expect(btn.classList.contains('is-copied')).toBe(false);
		expect(container.querySelector('.copy-label')?.textContent).toBe('Copy');
	});

	it('fires onCopy with the value', async () => {
		mockClipboard();
		const onCopy = vi.fn();
		const { container } = render(CopyButton, { value: 'payload', onCopy });
		const btn = container.querySelector('.copy-btn') as HTMLButtonElement;
		await fireEvent.click(btn);
		expect(onCopy).toHaveBeenCalledWith('payload');
	});

	it('stays in idle state if clipboard write rejects', async () => {
		mockClipboard(async () => {
			throw new Error('denied');
		});
		const { container } = render(CopyButton, { value: 'hi' });
		const btn = container.querySelector('.copy-btn') as HTMLButtonElement;
		await fireEvent.click(btn);
		expect(btn.classList.contains('is-copied')).toBe(false);
		expect(container.querySelector('.copy-label')?.textContent).toBe('Copy');
	});

	it('uses ariaLabel override on the button', () => {
		mockClipboard();
		const { container } = render(CopyButton, {
			value: 'hi',
			ariaLabel: 'Copy invite link'
		});
		const btn = container.querySelector('.copy-btn') as HTMLButtonElement;
		expect(btn.getAttribute('aria-label')).toBe('Copy invite link');
	});
});
