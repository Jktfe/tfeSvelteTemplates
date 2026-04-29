/**
 * ============================================================
 * Drawer Tests
 * ============================================================
 *
 * Verifies the modal contract: render gating on `open`, ARIA
 * dialog semantics, position class mapping, size forwarding,
 * Escape + backdrop dismissal, persistent behaviour, and body
 * scroll lock with restore.
 *
 * The focus trap itself is hard to assert in jsdom (Tab key
 * behaviour is approximated, not real browser sequencing). We
 * assert the structural pieces — tabbable elements present, role
 * and aria-modal correctly set — and trust real-browser testing
 * for the live keyboard cycling.
 *
 * Children are passed via DrawerTestHarness.test.svelte so we can
 * exercise the focus-trap surface without snippet gymnastics.
 * ============================================================
 */

import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import { tick } from 'svelte';
import DrawerTestHarness from './DrawerTestHarness.test.svelte';

describe('Drawer', () => {
	it('does not render any drawer DOM when closed', () => {
		const { container } = render(DrawerTestHarness, { props: { open: false } });
		expect(container.querySelector('.drawer')).toBeNull();
		expect(container.querySelector('.drawer-backdrop')).toBeNull();
		expect(container.querySelector('[role="dialog"]')).toBeNull();
	});

	it('renders the drawer + backdrop when open', () => {
		const { container } = render(DrawerTestHarness, { props: { open: true } });
		expect(container.querySelector('.drawer')).toBeTruthy();
		expect(container.querySelector('.drawer-backdrop')).toBeTruthy();
		expect(container.querySelector('[role="dialog"]')).toBeTruthy();
	});

	it('exposes role="dialog" and aria-modal="true" while open', () => {
		const { container } = render(DrawerTestHarness, { props: { open: true } });
		const dialog = container.querySelector('.drawer') as HTMLElement;
		expect(dialog.getAttribute('role')).toBe('dialog');
		expect(dialog.getAttribute('aria-modal')).toBe('true');
	});

	it('uses ariaLabel as aria-label by default', () => {
		const { container } = render(DrawerTestHarness, {
			props: { open: true, ariaLabel: 'Settings panel' }
		});
		const dialog = container.querySelector('.drawer') as HTMLElement;
		expect(dialog.getAttribute('aria-label')).toBe('Settings panel');
	});

	it('applies the right edge class for each position', () => {
		for (const pos of ['left', 'right', 'top', 'bottom'] as const) {
			const { container, unmount } = render(DrawerTestHarness, {
				props: { open: true, position: pos }
			});
			const drawer = container.querySelector('.drawer') as HTMLElement;
			expect(drawer.classList.contains(`drawer-${pos}`)).toBe(true);
			unmount();
		}
	});

	it('forwards a numeric size as a px width on left/right', () => {
		const { container } = render(DrawerTestHarness, {
			props: { open: true, position: 'right', size: 480 }
		});
		const drawer = container.querySelector('.drawer') as HTMLElement;
		expect(drawer.getAttribute('style') ?? '').toContain('width: 480px');
	});

	it('forwards a numeric size as a px height on top/bottom', () => {
		const { container } = render(DrawerTestHarness, {
			props: { open: true, position: 'bottom', size: 240 }
		});
		const drawer = container.querySelector('.drawer') as HTMLElement;
		expect(drawer.getAttribute('style') ?? '').toContain('height: 240px');
	});

	it('forwards a CSS string size verbatim', () => {
		const { container } = render(DrawerTestHarness, {
			props: { open: true, position: 'top', size: '70vh' }
		});
		const drawer = container.querySelector('.drawer') as HTMLElement;
		expect(drawer.getAttribute('style') ?? '').toContain('height: 70vh');
	});

	it('calls onClose when the backdrop is clicked', async () => {
		const onClose = vi.fn();
		const { container } = render(DrawerTestHarness, { props: { open: true, onClose } });
		const backdrop = container.querySelector('.drawer-backdrop') as HTMLElement;
		await fireEvent.click(backdrop);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('removes the drawer from the DOM after backdrop dismiss', async () => {
		const { container } = render(DrawerTestHarness, { props: { open: true } });
		const backdrop = container.querySelector('.drawer-backdrop') as HTMLElement;
		await fireEvent.click(backdrop);
		await tick();
		expect(container.querySelector('.drawer')).toBeNull();
	});

	it('calls onClose when Escape is pressed', async () => {
		const onClose = vi.fn();
		render(DrawerTestHarness, { props: { open: true, onClose } });
		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('does not close on backdrop click when persistent=true', async () => {
		const onClose = vi.fn();
		const { container } = render(DrawerTestHarness, {
			props: { open: true, persistent: true, onClose }
		});
		const backdrop = container.querySelector('.drawer-backdrop') as HTMLElement;
		await fireEvent.click(backdrop);
		expect(onClose).not.toHaveBeenCalled();
		expect(container.querySelector('.drawer')).toBeTruthy();
	});

	it('does not close on Escape when persistent=true', async () => {
		const onClose = vi.fn();
		const { container } = render(DrawerTestHarness, {
			props: { open: true, persistent: true, onClose }
		});
		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(onClose).not.toHaveBeenCalled();
		expect(container.querySelector('.drawer')).toBeTruthy();
	});

	it('locks body scroll while open and restores it on close', async () => {
		// Set a sentinel value so we can verify it's restored, not blanket-cleared.
		document.body.style.overflow = 'auto';
		const { container, rerender } = render(DrawerTestHarness, { props: { open: true } });
		await tick();
		expect(document.body.style.overflow).toBe('hidden');

		await rerender({ open: false });
		await tick();
		expect(container.querySelector('.drawer')).toBeNull();
		expect(document.body.style.overflow).toBe('auto');
		// Cleanup
		document.body.style.overflow = '';
	});

	it('contains the children (heading + form fields + close button)', () => {
		const { getByTestId } = render(DrawerTestHarness, { props: { open: true } });
		expect(getByTestId('drawer-heading').textContent).toBe('Drawer content');
		expect(getByTestId('first-input')).toBeTruthy();
		expect(getByTestId('second-input')).toBeTruthy();
		expect(getByTestId('close-btn')).toBeTruthy();
	});
});
