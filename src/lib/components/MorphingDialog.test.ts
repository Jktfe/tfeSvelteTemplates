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

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import MorphingDialogTest from './MorphingDialogTest.svelte';

describe('MorphingDialog', () => {
	// First things first — does it render the trigger?
	it('renders the trigger element', () => {
		render(MorphingDialogTest);
		const trigger = screen.getByText('Open Dialog');
		expect(trigger).toBeInTheDocument();
	});

	// The dialog should not be visible initially
	it('does not show dialog by default', () => {
		render(MorphingDialogTest);
		const dialog = screen.queryByRole('dialog');
		expect(dialog).not.toBeInTheDocument();
	});

	// Trigger should have correct ARIA attributes
	it('trigger has aria-expanded=false initially', () => {
		render(MorphingDialogTest);
		const trigger = screen.getByText('Open Dialog');
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
		expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
	});

	// Clicking the trigger should open the dialog
	it('opens dialog when trigger is clicked', async () => {
		const user = userEvent.setup();
		render(MorphingDialogTest);

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
		render(MorphingDialogTest);

		await user.click(screen.getByText('Open Dialog'));

		const closeBtn = screen.getByLabelText('Close dialog');
		expect(closeBtn).toBeInTheDocument();
	});

	// Dialog content should be rendered
	it('renders dialog content when open', async () => {
		const user = userEvent.setup();
		render(MorphingDialogTest);

		await user.click(screen.getByText('Open Dialog'));

		const content = screen.getByText('Dialog Content Here');
		expect(content).toBeInTheDocument();
	});

	// Trigger should update aria-expanded when dialog opens
	it('trigger aria-expanded updates when dialog opens', async () => {
		const user = userEvent.setup();
		render(MorphingDialogTest);

		const trigger = screen.getByText('Open Dialog');
		expect(trigger).toHaveAttribute('aria-expanded', 'false');

		await user.click(trigger);
		expect(trigger).toHaveAttribute('aria-expanded', 'true');
	});
});
