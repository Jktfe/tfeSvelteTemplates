/**
 * ============================================================
 * MorphingDialog Tests
 * ============================================================
 *
 * These tests verify that MorphingDialog works correctly as a
 * shared-element transition modal component.
 *
 * What we're checking:
 *   - It renders the trigger element without crashing
 *   - The dialog is hidden by default
 *   - Clicking the trigger opens the dialog
 *   - The dialog has correct ARIA attributes
 *   - The close button is present and functional
 *   - The trigger has correct aria-expanded state
 *
 * Run these tests:
 *   bun run test                       - Run once
 *   bun run test:watch                 - Watch mode
 *   bun run test -- MorphingDialog     - Just this file
 *
 * ============================================================
 */

import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import MorphingDialogTestHarness from './MorphingDialogTestHarness.test.svelte';

describe('MorphingDialog', () => {
	// First things first — does it render the trigger?
	it('renders the trigger element', () => {
		render(MorphingDialogTestHarness);
		const trigger = screen.getByText('Open Dialog');
		expect(trigger).toBeInTheDocument();
	});

	// The dialog should not be visible initially
	it('does not show dialog by default', () => {
		render(MorphingDialogTestHarness);
		const dialog = screen.queryByRole('dialog');
		expect(dialog).not.toBeInTheDocument();
	});

	// Trigger should have correct ARIA attributes
	it('trigger has aria-expanded=false initially', () => {
		render(MorphingDialogTestHarness);
		const trigger = screen.getByText('Open Dialog');
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
		expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
	});

	// Clicking the trigger should open the dialog
	it('opens dialog when trigger is clicked', async () => {
		const user = userEvent.setup();
		render(MorphingDialogTestHarness);

		const trigger = screen.getByText('Open Dialog');
		await user.click(trigger);

		// Dialog should now be in the DOM
		const dialog = screen.getByRole('dialog');
		expect(dialog).toBeInTheDocument();
		expect(dialog).toHaveAttribute('aria-modal', 'true');
	});

	// Close button should be present when dialog is open
	it('shows close button when dialog is open', async () => {
		const user = userEvent.setup();
		render(MorphingDialogTestHarness);

		await user.click(screen.getByText('Open Dialog'));

		const closeBtn = screen.getByLabelText('Close dialog');
		expect(closeBtn).toBeInTheDocument();
	});

	// Dialog content should be rendered
	it('renders dialog content when open', async () => {
		const user = userEvent.setup();
		render(MorphingDialogTestHarness);

		await user.click(screen.getByText('Open Dialog'));

		const content = screen.getByText('Dialog Content Here');
		expect(content).toBeInTheDocument();
	});

	// Trigger should update aria-expanded when dialog opens
	it('trigger aria-expanded updates when dialog opens', async () => {
		const user = userEvent.setup();
		render(MorphingDialogTestHarness);

		const trigger = screen.getByText('Open Dialog');
		expect(trigger).toHaveAttribute('aria-expanded', 'false');

		await user.click(trigger);
		expect(trigger).toHaveAttribute('aria-expanded', 'true');
	});
});

describe('MorphingDialog keyboard, focus and naming', () => {
	// duration={0} still settles via a 0ms timer, so wait for the 'open' phase.
	async function openViaTrigger() {
		const user = userEvent.setup();
		const result = render(MorphingDialogTestHarness);
		const trigger = screen.getByText('Open Dialog');
		await user.click(trigger);
		await waitFor(() =>
			expect(document.activeElement).toBe(screen.getByLabelText('Close dialog'))
		);
		return { user, trigger, ...result };
	}

	it('gives the dialog an accessible name by default', async () => {
		await openViaTrigger();
		expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Dialog');
	});

	it('uses aria-labelledby when ariaLabelledBy is provided', async () => {
		const user = userEvent.setup();
		render(MorphingDialogTestHarness, { ariaLabelledBy: 'morph-test-heading', withHeading: true });
		await user.click(screen.getByText('Open Dialog'));
		const dialog = screen.getByRole('dialog');
		expect(dialog).toHaveAttribute('aria-labelledby', 'morph-test-heading');
		expect(dialog).not.toHaveAttribute('aria-label');
	});

	it('closes on Escape and returns focus to the trigger', async () => {
		const { user, trigger } = await openViaTrigger();
		await user.keyboard('{Escape}');
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
		expect(document.activeElement).toBe(trigger);
	});

	it('ignores Escape when closeOnEscape is false', async () => {
		const user = userEvent.setup();
		render(MorphingDialogTestHarness, { closeOnEscape: false });
		await user.click(screen.getByText('Open Dialog'));
		await waitFor(() =>
			expect(document.activeElement).toBe(screen.getByLabelText('Close dialog'))
		);
		await user.keyboard('{Escape}');
		expect(screen.getByRole('dialog')).toBeInTheDocument();
	});

	it('traps Tab inside the dialog and skips disabled controls', async () => {
		const { user } = await openViaTrigger();
		const closeBtn = screen.getByLabelText('Close dialog');
		const input = screen.getByTestId('dialog-input');
		// Close button → input; the disabled button is skipped, so Tab wraps.
		await user.tab();
		expect(document.activeElement).toBe(input);
		await user.tab();
		expect(document.activeElement).toBe(closeBtn);
		await user.tab({ shift: true });
		expect(document.activeElement).toBe(input);
	});

	it('pulls stray focus back into the dialog on Tab', async () => {
		const { user } = await openViaTrigger();
		screen.getByTestId('external-toggle').focus();
		await user.tab();
		expect(document.activeElement).toBe(screen.getByLabelText('Close dialog'));
	});

	it('opens and closes when the parent drives bind:open', async () => {
		const { rerender } = render(MorphingDialogTestHarness, { open: false });
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

		await rerender({ open: true });
		await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
		await waitFor(() =>
			expect(document.activeElement).toBe(screen.getByLabelText('Close dialog'))
		);

		await rerender({ open: false });
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
	});

	it('releases the scroll lock if unmounted while open', async () => {
		const { unmount } = await openViaTrigger();
		expect(document.body.style.overflow).toBe('hidden');
		unmount();
		expect(document.body.style.overflow).not.toBe('hidden');
	});
});
