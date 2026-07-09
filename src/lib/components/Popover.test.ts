import { describe, it, expect, afterEach } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import PopoverTestHarness from './PopoverTestHarness.test.svelte';
import {
	flipPlacement,
	computePosition,
	isReducedMotion,
	type RectLike
} from './Popover.svelte';

afterEach(() => {
	cleanup();
});

// A helper to build a rect quickly for the pure-maths tests.
function rect(partial: Partial<RectLike>): RectLike {
	return {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: 0,
		height: 0,
		...partial
	};
}

describe('Popover — pure placement helpers', () => {
	describe('flipPlacement', () => {
		it('keeps the preferred side when it has room', () => {
			// Trigger near the top-left, panel small — bottom fits comfortably.
			const t = rect({ top: 40, bottom: 60, left: 40, right: 140, width: 100, height: 20 });
			expect(flipPlacement('bottom', t, 200, 120, 1024, 768, 8)).toBe('bottom');
		});

		it('flips bottom → top when the panel would overflow the bottom edge', () => {
			// Trigger pinned to the bottom of the viewport, big panel below.
			const t = rect({ top: 730, bottom: 760, left: 40, right: 140, width: 100, height: 30 });
			expect(flipPlacement('bottom', t, 200, 300, 1024, 768, 8)).toBe('top');
		});

		it('flips right → left when the panel would overflow the right edge', () => {
			const t = rect({ top: 100, bottom: 130, left: 950, right: 1000, width: 50, height: 30 });
			expect(flipPlacement('right', t, 200, 120, 1024, 768, 8)).toBe('left');
		});

		it('keeps the preference when the opposite side is no roomier', () => {
			// Trigger high up: bottom has more room than top, so a too-tall panel
			// should NOT flip to the cramped top side — it stays on bottom.
			const t = rect({ top: 20, bottom: 40, left: 40, right: 140, width: 100, height: 20 });
			expect(flipPlacement('bottom', t, 200, 900, 1024, 768, 8)).toBe('bottom');
		});
	});

	describe('computePosition', () => {
		it('centres the panel on the trigger cross-axis for bottom placement', () => {
			const t = rect({ top: 100, bottom: 130, left: 400, right: 500, width: 100, height: 30 });
			const pos = computePosition('bottom', t, 200, 120, 1024, 768, 8);
			expect(pos.top).toBe(130 + 8); // below the trigger + offset
			expect(pos.left).toBe(400 + (100 - 200) / 2); // centred: 350
		});

		it('clamps the panel so it never spills off the left edge', () => {
			const t = rect({ top: 100, bottom: 130, left: 0, right: 40, width: 40, height: 30 });
			const pos = computePosition('bottom', t, 300, 120, 1024, 768, 8);
			expect(pos.left).toBeGreaterThanOrEqual(8);
		});
	});

	describe('isReducedMotion', () => {
		it('returns a boolean without throwing', () => {
			expect(typeof isReducedMotion()).toBe('boolean');
		});
	});
});

describe('Popover — interaction', () => {
	it('does not render the panel initially and reports aria-expanded=false', () => {
		render(PopoverTestHarness);
		const trigger = screen.getByTestId('popover-trigger');
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('opens the panel when the trigger is clicked', async () => {
		render(PopoverTestHarness);
		const trigger = screen.getByTestId('popover-trigger');

		await fireEvent.click(trigger);

		const panel = await screen.findByRole('dialog');
		expect(panel).toBeTruthy();
		expect(panel.getAttribute('aria-modal')).toBe('false');
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(screen.getByTestId('popover-content')).toBeTruthy();
	});

	it('toggles closed when the trigger is clicked again', async () => {
		render(PopoverTestHarness);
		const trigger = screen.getByTestId('popover-trigger');

		await fireEvent.click(trigger);
		expect(await screen.findByRole('dialog')).toBeTruthy();

		await fireEvent.click(trigger);
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('closes on Escape and reflects aria-expanded=false', async () => {
		render(PopoverTestHarness);
		const trigger = screen.getByTestId('popover-trigger');

		await fireEvent.click(trigger);
		expect(await screen.findByRole('dialog')).toBeTruthy();

		await fireEvent.keyDown(window, { key: 'Escape' });

		expect(screen.queryByRole('dialog')).toBeNull();
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('closes when the user clicks outside the panel', async () => {
		render(PopoverTestHarness);
		const trigger = screen.getByTestId('popover-trigger');

		await fireEvent.click(trigger);
		expect(await screen.findByRole('dialog')).toBeTruthy();

		await fireEvent.mouseDown(screen.getByTestId('outside'));

		expect(screen.queryByRole('dialog')).toBeNull();
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('stays open when a pointer press lands inside the panel', async () => {
		render(PopoverTestHarness);
		const trigger = screen.getByTestId('popover-trigger');

		await fireEvent.click(trigger);
		const panel = await screen.findByRole('dialog');

		await fireEvent.mouseDown(screen.getByTestId('inner-button'));

		expect(screen.queryByRole('dialog')).toBe(panel);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
	});

	it('opens via keyboard (Enter on the trigger button)', async () => {
		const user = userEvent.setup();
		render(PopoverTestHarness);
		const trigger = screen.getByTestId('popover-trigger');

		trigger.focus();
		await user.keyboard('{Enter}');

		expect(await screen.findByRole('dialog')).toBeTruthy();
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
	});

	it('honours a custom ariaLabel on the dialog', async () => {
		render(PopoverTestHarness, { props: { ariaLabel: 'Account menu' } });
		await fireEvent.click(screen.getByTestId('popover-trigger'));
		const panel = await screen.findByRole('dialog');
		expect(panel.getAttribute('aria-label')).toBe('Account menu');
	});

	it('forwards an extra class onto the panel', async () => {
		render(PopoverTestHarness, { props: { class: 'custom-panel' } });
		await fireEvent.click(screen.getByTestId('popover-trigger'));
		const panel = await screen.findByRole('dialog');
		expect(panel.classList.contains('custom-panel')).toBe(true);
	});
});
