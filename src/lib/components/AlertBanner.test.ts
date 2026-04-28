/**
 * ============================================================
 * AlertBanner Tests
 * ============================================================
 *
 * Verifies that AlertBanner renders the right variant, the right
 * ARIA role for the variant, optional title/message/dismiss, and
 * fires onDismiss when the close button is clicked.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AlertBanner from './AlertBanner.svelte';

describe('AlertBanner', () => {
	it('renders the title and message', () => {
		render(AlertBanner, { props: { title: 'Saved!', message: 'Your changes are live.' } });
		expect(screen.getByText('Saved!')).toBeInTheDocument();
		expect(screen.getByText('Your changes are live.')).toBeInTheDocument();
	});

	it('uses role="status" for info (polite)', () => {
		const { container } = render(AlertBanner, { props: { variant: 'info', message: 'Hi' } });
		expect(container.querySelector('[role="status"]')).toBeTruthy();
	});

	it('uses role="status" for success', () => {
		const { container } = render(AlertBanner, { props: { variant: 'success', message: 'Done' } });
		expect(container.querySelector('[role="status"]')).toBeTruthy();
	});

	it('uses role="alert" for warning (assertive)', () => {
		const { container } = render(AlertBanner, {
			props: { variant: 'warning', message: 'Heads up' }
		});
		expect(container.querySelector('[role="alert"]')).toBeTruthy();
	});

	it('uses role="alert" for error', () => {
		const { container } = render(AlertBanner, { props: { variant: 'error', message: 'Oops' } });
		expect(container.querySelector('[role="alert"]')).toBeTruthy();
	});

	it('applies the variant CSS class', () => {
		const { container } = render(AlertBanner, { props: { variant: 'error', message: 'x' } });
		expect(container.querySelector('.alert-error')).toBeTruthy();
	});

	it('does not render dismiss button by default', () => {
		render(AlertBanner, { props: { message: 'Hello' } });
		expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
	});

	it('renders dismiss button when dismissable=true', () => {
		render(AlertBanner, { props: { message: 'Hello', dismissable: true } });
		expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
	});

	it('fires onDismiss when × is clicked', async () => {
		const user = userEvent.setup();
		const onDismiss = vi.fn();
		render(AlertBanner, {
			props: { message: 'Hello', dismissable: true, onDismiss }
		});

		await user.click(screen.getByRole('button', { name: 'Dismiss' }));
		expect(onDismiss).toHaveBeenCalledTimes(1);
	});

	it('renders without title (message-only)', () => {
		render(AlertBanner, { props: { message: 'Just a message' } });
		expect(screen.getByText('Just a message')).toBeInTheDocument();
	});

	it('forwards extra classes', () => {
		const { container } = render(AlertBanner, {
			props: { message: 'x', class: 'my-extra-class' }
		});
		expect(container.querySelector('.my-extra-class')).toBeTruthy();
	});
});
