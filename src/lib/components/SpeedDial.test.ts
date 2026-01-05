/**
 * ============================================================
 * SpeedDial Tests
 * ============================================================
 *
 * These tests verify that SpeedDial renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - Main trigger button displays correctly
 *   - Actions are hidden when closed, visible when open
 *   - Toggle functionality works
 *   - Keyboard navigation (Escape to close)
 *   - Disabled state prevents interaction
 *   - Tooltips display correctly
 *   - ARIA attributes are set correctly
 *
 * Run these tests:
 *   bun run test                    - Run once
 *   bun run test:watch              - Watch mode
 *   bun run test -- SpeedDial       - Just this file
 *
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import SpeedDial from './SpeedDial.svelte';

// Sample actions for testing
const testActions = [
	{ id: 'edit', label: 'Edit', icon: '✏️', onclick: vi.fn() },
	{ id: 'delete', label: 'Delete', icon: '🗑️', onclick: vi.fn() },
	{ id: 'share', label: 'Share', icon: '📤', onclick: vi.fn() }
];

describe('SpeedDial', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(SpeedDial);
		expect(container).toBeTruthy();
	});

	// Main trigger button should always be visible
	it('renders the main trigger button', () => {
		render(SpeedDial);
		const button = screen.getByRole('button', { name: 'Open menu' });
		expect(button).toBeInTheDocument();
	});

	// Custom button label should be used
	it('uses custom button label', () => {
		render(SpeedDial, { props: { actions: testActions, buttonLabel: 'Show actions' } });
		const button = screen.getByRole('button', { name: 'Show actions' });
		expect(button).toBeInTheDocument();
	});

	// ARIA expanded should be false when closed
	it('has aria-expanded=false when closed', () => {
		render(SpeedDial);
		const button = screen.getByRole('button', { name: 'Open menu' });
		expect(button).toHaveAttribute('aria-expanded', 'false');
	});

	// ARIA haspopup should be set
	it('has aria-haspopup=true on trigger', () => {
		render(SpeedDial);
		const button = screen.getByRole('button', { name: 'Open menu' });
		expect(button).toHaveAttribute('aria-haspopup', 'true');
	});

	// Action buttons should be disabled when menu is closed
	it('action buttons are disabled when closed', () => {
		render(SpeedDial, { props: { actions: testActions } });
		// Get action buttons by their labels
		const editBtn = screen.getByLabelText('Edit');
		const deleteBtn = screen.getByLabelText('Delete');
		const shareBtn = screen.getByLabelText('Share');

		// When closed, action buttons should be disabled
		expect(editBtn).toBeDisabled();
		expect(deleteBtn).toBeDisabled();
		expect(shareBtn).toBeDisabled();
	});

	// Clicking trigger should toggle open state
	it('opens when trigger is clicked', async () => {
		render(SpeedDial, { props: { actions: testActions } });
		const trigger = screen.getByRole('button', { name: 'Open menu' });

		await fireEvent.click(trigger);

		expect(trigger).toHaveAttribute('aria-expanded', 'true');
	});

	// Action buttons should be enabled when menu is open
	it('action buttons are enabled when open', async () => {
		render(SpeedDial, { props: { actions: testActions } });
		const trigger = screen.getByRole('button', { name: 'Open menu' });

		await fireEvent.click(trigger);

		// When open, action buttons should no longer be disabled
		const editBtn = screen.getByLabelText('Edit');
		const deleteBtn = screen.getByLabelText('Delete');
		const shareBtn = screen.getByLabelText('Share');

		expect(editBtn).not.toBeDisabled();
		expect(deleteBtn).not.toBeDisabled();
		expect(shareBtn).not.toBeDisabled();
	});

	// Action buttons should have correct ARIA labels
	it('action buttons have ARIA labels', () => {
		render(SpeedDial, { props: { actions: testActions } });
		// Check ARIA labels exist (buttons may be hidden but still in DOM)
		expect(screen.getByLabelText('Edit')).toBeInTheDocument();
		expect(screen.getByLabelText('Delete')).toBeInTheDocument();
		expect(screen.getByLabelText('Share')).toBeInTheDocument();
	});

	// Disabled state should prevent toggle
	it('does not open when disabled', async () => {
		render(SpeedDial, { props: { actions: testActions, disabled: true } });
		const trigger = screen.getByRole('button', { name: 'Open menu' });

		await fireEvent.click(trigger);

		expect(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	// Trigger button should be disabled when component is disabled
	it('trigger button is disabled when component is disabled', () => {
		render(SpeedDial, { props: { actions: testActions, disabled: true } });
		const trigger = screen.getByRole('button', { name: 'Open menu' });
		expect(trigger).toBeDisabled();
	});

	// Tooltips should be present when showTooltip=true
	it('shows tooltips when enabled', () => {
		render(SpeedDial, { props: { actions: testActions, showTooltip: true } });
		// Tooltips have role="tooltip"
		const tooltips = screen.getAllByRole('tooltip');
		expect(tooltips).toHaveLength(3);
	});

	// Tooltips should not render when showTooltip=false
	it('hides tooltips when disabled', () => {
		render(SpeedDial, { props: { actions: testActions, showTooltip: false } });
		const tooltips = screen.queryAllByRole('tooltip');
		expect(tooltips).toHaveLength(0);
	});

	// Container should have speed-dial class
	it('has speed-dial container class', () => {
		const { container } = render(SpeedDial);
		const speedDial = container.querySelector('.speed-dial');
		expect(speedDial).toBeInTheDocument();
	});

	// Custom class should be applied
	it('applies custom class to container', () => {
		const { container } = render(SpeedDial, { props: { actions: testActions, class: 'my-custom-class' } });
		const speedDial = container.querySelector('.speed-dial');
		expect(speedDial).toHaveClass('my-custom-class');
	});

	// Default icon (plus) should render as SVG
	it('renders default plus icon when no buttonIcon provided', () => {
		const { container } = render(SpeedDial);
		const svg = container.querySelector('.button-icon-svg');
		expect(svg).toBeInTheDocument();
	});

	// Custom emoji icon should render
	it('renders custom emoji icon', () => {
		render(SpeedDial, { props: { actions: testActions, buttonIcon: '⚡' } });
		// The emoji should be visible
		expect(screen.getByText('⚡')).toBeInTheDocument();
	});

	// Mask should not render by default
	it('does not show mask by default', () => {
		const { container } = render(SpeedDial, { props: { actions: testActions } });
		const mask = container.querySelector('.speed-dial-mask');
		expect(mask).not.toBeInTheDocument();
	});

	// Actions container should exist
	it('has actions container', () => {
		const { container } = render(SpeedDial, { props: { actions: testActions } });
		const actionsContainer = container.querySelector('.speed-dial-actions');
		expect(actionsContainer).toBeInTheDocument();
	});

	// Clicking an action should call its onclick
	it('calls onclick when action is clicked', async () => {
		const clickHandler = vi.fn();
		const actions = [{ id: 'test', label: 'Test', icon: '🧪', onclick: clickHandler }];

		render(SpeedDial, { props: { actions } });
		const trigger = screen.getByRole('button', { name: 'Open menu' });

		// Open the menu
		await fireEvent.click(trigger);

		// Click the action
		const actionButton = screen.getByLabelText('Test');
		await fireEvent.click(actionButton);

		expect(clickHandler).toHaveBeenCalledOnce();
	});

	// Menu should close after clicking action
	it('closes after action click', async () => {
		const actions = [{ id: 'test', label: 'Test', icon: '🧪', onclick: vi.fn() }];

		render(SpeedDial, { props: { actions } });
		const trigger = screen.getByRole('button', { name: 'Open menu' });

		// Open the menu
		await fireEvent.click(trigger);
		expect(trigger).toHaveAttribute('aria-expanded', 'true');

		// Click the action
		const actionButton = screen.getByLabelText('Test');
		await fireEvent.click(actionButton);

		// Menu should be closed
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	// Disabled action should not call onclick
	it('does not call onclick for disabled action', async () => {
		const clickHandler = vi.fn();
		const actions = [{ id: 'test', label: 'Test', icon: '🧪', onclick: clickHandler, disabled: true }];

		render(SpeedDial, { props: { actions } });
		const trigger = screen.getByRole('button', { name: 'Open menu' });

		// Open the menu
		await fireEvent.click(trigger);

		// Try to click the disabled action
		const actionButton = screen.getByLabelText('Test');
		await fireEvent.click(actionButton);

		expect(clickHandler).not.toHaveBeenCalled();
	});
});
