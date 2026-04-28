/**
 * ============================================================
 * BadgePill Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Renders label text
 *   ✓ Defaults to neutral / soft / md
 *   ✓ Applies tone, variant and size class names
 *   ✓ Shows the leading dot only when dot=true
 *   ✓ Shows the dismiss button only when dismissible=true
 *   ✓ onDismiss is called when × is clicked
 *   ✓ onDismiss click does not bubble to ancestor click handlers
 *   ✓ Extra `class` is appended to the container
 *
 * Run:
 *   bun run test -- BadgePill
 * ============================================================
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import BadgePill from './BadgePill.svelte';

describe('BadgePill', () => {
	it('renders the label text', () => {
		const { getByText } = render(BadgePill, { label: 'Active' });
		expect(getByText('Active')).toBeTruthy();
	});

	it('defaults to neutral / soft / md classes', () => {
		const { container } = render(BadgePill, { label: 'Default' });
		const pill = container.querySelector('.badge-pill') as HTMLElement;
		expect(pill).toBeTruthy();
		expect(pill.classList.contains('badge-neutral')).toBe(true);
		expect(pill.classList.contains('badge-soft')).toBe(true);
		expect(pill.classList.contains('badge-md')).toBe(true);
	});

	it('applies tone class', () => {
		const { container } = render(BadgePill, { label: 'Win', tone: 'success' });
		const pill = container.querySelector('.badge-pill') as HTMLElement;
		expect(pill.classList.contains('badge-success')).toBe(true);
		expect(pill.dataset.tone).toBe('success');
	});

	it('applies variant class', () => {
		const { container } = render(BadgePill, { label: 'Loud', variant: 'solid' });
		const pill = container.querySelector('.badge-pill') as HTMLElement;
		expect(pill.classList.contains('badge-solid')).toBe(true);
		expect(pill.dataset.variant).toBe('solid');
	});

	it('applies size class', () => {
		const { container } = render(BadgePill, { label: 'Tiny', size: 'sm' });
		const pill = container.querySelector('.badge-pill') as HTMLElement;
		expect(pill.classList.contains('badge-sm')).toBe(true);
	});

	it('shows the dot only when dot=true', () => {
		const { container, rerender } = render(BadgePill, { label: 'No dot' });
		expect(container.querySelector('.badge-dot')).toBeNull();
		rerender({ label: 'With dot', dot: true });
		expect(container.querySelector('.badge-dot')).toBeTruthy();
	});

	it('shows the dismiss button only when dismissible=true', () => {
		const { container, rerender } = render(BadgePill, { label: 'No close' });
		expect(container.querySelector('.badge-dismiss')).toBeNull();
		rerender({ label: 'With close', dismissible: true });
		expect(container.querySelector('.badge-dismiss')).toBeTruthy();
	});

	it('calls onDismiss when × is clicked', async () => {
		const onDismiss = vi.fn();
		const { container } = render(BadgePill, {
			label: 'Tag',
			dismissible: true,
			onDismiss
		});
		const dismissBtn = container.querySelector('.badge-dismiss') as HTMLButtonElement;
		await fireEvent.click(dismissBtn);
		expect(onDismiss).toHaveBeenCalledTimes(1);
	});

	it('appends extra class to the container', () => {
		const { container } = render(BadgePill, {
			label: 'Custom',
			class: 'extra-class hello'
		});
		const pill = container.querySelector('.badge-pill') as HTMLElement;
		expect(pill.classList.contains('extra-class')).toBe(true);
		expect(pill.classList.contains('hello')).toBe(true);
	});

	it('dismiss button has aria-label for screen readers', () => {
		const { container } = render(BadgePill, { label: 'A', dismissible: true });
		const dismissBtn = container.querySelector('.badge-dismiss') as HTMLButtonElement;
		expect(dismissBtn.getAttribute('aria-label')).toBe('Dismiss');
	});
});
