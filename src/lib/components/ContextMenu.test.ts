import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/svelte';
import ContextMenuTestHarness from './ContextMenuTestHarness.test.svelte';
import {
	isInteractiveItem,
	normalizeItems,
	clampToViewport,
	nextEnabledIndex,
	isReducedMotion,
	type ContextMenuItem
} from './ContextMenu.svelte';

afterEach(() => {
	cleanup();
});

describe('ContextMenu — pure helpers', () => {
	describe('isInteractiveItem', () => {
		it('returns false for divider entries', () => {
			expect(isInteractiveItem({ type: 'divider' })).toBe(false);
		});

		it('returns true for action items', () => {
			expect(isInteractiveItem({ id: 'edit', label: 'Edit' })).toBe(true);
		});

		it('returns true for action items with all optional fields', () => {
			expect(
				isInteractiveItem({
					id: 'delete',
					label: 'Delete',
					shortcut: '⌫',
					disabled: true,
					danger: true
				})
			).toBe(true);
		});
	});

	describe('normalizeItems', () => {
		it('returns an empty array when given a non-array', () => {
			expect(normalizeItems(null)).toEqual([]);
			expect(normalizeItems(undefined)).toEqual([]);
			expect(normalizeItems('items')).toEqual([]);
			expect(normalizeItems(42)).toEqual([]);
		});

		it('preserves divider entries verbatim', () => {
			expect(normalizeItems([{ type: 'divider' }])).toEqual([{ type: 'divider' }]);
		});

		it('drops items missing id or label', () => {
			expect(
				normalizeItems([
					{ id: 'a', label: 'A' },
					{ id: 'b' }, // missing label
					{ label: 'C' }, // missing id
					{ id: 'd', label: 'D' }
				])
			).toEqual([
				{ id: 'a', label: 'A', shortcut: undefined, disabled: false, danger: false },
				{ id: 'd', label: 'D', shortcut: undefined, disabled: false, danger: false }
			]);
		});

		it('drops duplicates by id, keeping the first occurrence', () => {
			const out = normalizeItems([
				{ id: 'edit', label: 'Edit' },
				{ id: 'edit', label: 'Edit Again' },
				{ id: 'copy', label: 'Copy' }
			]);
			expect(out).toHaveLength(2);
			expect(out[0]).toMatchObject({ id: 'edit', label: 'Edit' });
			expect(out[1]).toMatchObject({ id: 'copy', label: 'Copy' });
		});

		it('coerces optional fields to safe defaults', () => {
			const out = normalizeItems([
				{ id: 'a', label: 'A', shortcut: 123, disabled: 'yes', danger: 1 }
			]);
			expect(out[0]).toEqual({
				id: 'a',
				label: 'A',
				shortcut: undefined,
				disabled: false,
				danger: false
			});
		});

		it('drops non-objects silently', () => {
			expect(normalizeItems([null, undefined, 1, 'x', { id: 'a', label: 'A' }])).toHaveLength(1);
		});
	});

	describe('clampToViewport', () => {
		it('returns the input unchanged when the menu fits in the viewport', () => {
			expect(clampToViewport(100, 100, 200, 100, 1024, 768)).toEqual({ x: 100, y: 100 });
		});

		it('flips horizontally when the menu would overflow the right edge', () => {
			const out = clampToViewport(900, 100, 200, 100, 1024, 768);
			expect(out.x).toBeLessThan(900);
			expect(out.x).toBe(900 - 200);
			expect(out.y).toBe(100);
		});

		it('flips vertically when the menu would overflow the bottom edge', () => {
			const out = clampToViewport(100, 700, 200, 100, 1024, 768);
			expect(out.y).toBeLessThan(700);
			expect(out.y).toBe(700 - 100);
			expect(out.x).toBe(100);
		});

		it('flips on both axes when overflow occurs in both', () => {
			const out = clampToViewport(950, 700, 200, 100, 1024, 768);
			expect(out.x).toBe(950 - 200);
			expect(out.y).toBe(700 - 100);
		});

		it('respects the padding when clamping near the top-left', () => {
			expect(clampToViewport(2, 2, 200, 100, 1024, 768, 8)).toEqual({ x: 8, y: 8 });
		});

		it('uses the default padding of 8px when not specified', () => {
			expect(clampToViewport(0, 0, 200, 100, 1024, 768)).toEqual({ x: 8, y: 8 });
		});
	});

	describe('nextEnabledIndex', () => {
		const items: ContextMenuItem[] = [
			{ id: 'a', label: 'A' },
			{ id: 'b', label: 'B' },
			{ type: 'divider' },
			{ id: 'c', label: 'C', disabled: true },
			{ id: 'd', label: 'D' }
		];

		it('returns the first enabled item from the top when current = -1, direction = 1', () => {
			expect(nextEnabledIndex(items, -1, 1)).toBe(0);
		});

		it('skips dividers when walking forward', () => {
			expect(nextEnabledIndex(items, 1, 1)).toBe(4);
		});

		it('skips disabled items when walking forward', () => {
			expect(nextEnabledIndex(items, 2, 1)).toBe(4);
		});

		it('wraps around from the last enabled item to the first', () => {
			expect(nextEnabledIndex(items, 4, 1)).toBe(0);
		});

		it('walks backward correctly, skipping dividers and disabled', () => {
			expect(nextEnabledIndex(items, 4, -1)).toBe(1);
		});

		it('wraps backward from the first item to the last enabled', () => {
			expect(nextEnabledIndex(items, 0, -1)).toBe(4);
		});

		it('returns -1 when no enabled item exists', () => {
			const allDisabled: ContextMenuItem[] = [
				{ type: 'divider' },
				{ id: 'a', label: 'A', disabled: true },
				{ type: 'divider' }
			];
			expect(nextEnabledIndex(allDisabled, -1, 1)).toBe(-1);
		});

		it('returns -1 for an empty list', () => {
			expect(nextEnabledIndex([], -1, 1)).toBe(-1);
		});
	});

	describe('isReducedMotion', () => {
		it('returns false when matchMedia is not available', () => {
			const original = window.matchMedia;
			// @ts-expect-error — temporarily delete for SSR-shape simulation
			delete window.matchMedia;
			expect(isReducedMotion()).toBe(false);
			window.matchMedia = original;
		});

		it('reads the prefers-reduced-motion: reduce media query', () => {
			const original = window.matchMedia;
			window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
			expect(isReducedMotion()).toBe(true);
			window.matchMedia = original;
		});
	});
});

describe('ContextMenu — render contract', () => {
	it('renders the trigger content via children snippet', () => {
		render(ContextMenuTestHarness);
		expect(screen.getByTestId('trigger-content')).toBeTruthy();
		expect(screen.getByTestId('trigger-content').textContent).toContain('Right-click target');
	});

	it('does not render the menu when closed', () => {
		render(ContextMenuTestHarness);
		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('exposes aria-haspopup=menu and aria-expanded=false on the trigger', () => {
		const { container } = render(ContextMenuTestHarness);
		const trigger = container.querySelector('.ctx-trigger');
		expect(trigger?.getAttribute('aria-haspopup')).toBe('menu');
		expect(trigger?.getAttribute('aria-expanded')).toBe('false');
	});

	it('marks the trigger aria-disabled when disabled prop is true', () => {
		const { container } = render(ContextMenuTestHarness, { props: { disabled: true } });
		const trigger = container.querySelector('.ctx-trigger');
		expect(trigger?.getAttribute('aria-disabled')).toBe('true');
		expect(trigger?.classList.contains('ctx-trigger-disabled')).toBe(true);
	});

	it('honours an extra class on the trigger wrapper', () => {
		const { container } = render(ContextMenuTestHarness, { props: { class: 'custom-trigger' } });
		expect(container.querySelector('.ctx-trigger')?.classList.contains('custom-trigger')).toBe(true);
	});
});

describe('ContextMenu — pointer interaction', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('opens the menu on contextmenu event with role=menu visible', async () => {
		const { container } = render(ContextMenuTestHarness);
		const trigger = container.querySelector('.ctx-trigger') as HTMLElement;

		await fireEvent.contextMenu(trigger, { clientX: 50, clientY: 50 });
		await vi.runAllTimersAsync();

		const menu = await screen.findByRole('menu');
		expect(menu).toBeTruthy();
		expect(menu.getAttribute('aria-orientation')).toBe('vertical');
		expect(menu.getAttribute('aria-label')).toBe('Context menu');
	});

	it('renders interactive items as menuitem buttons and dividers as separators', async () => {
		const { container } = render(ContextMenuTestHarness);
		const trigger = container.querySelector('.ctx-trigger') as HTMLElement;

		await fireEvent.contextMenu(trigger);
		await vi.runAllTimersAsync();

		const items = screen.getAllByRole('menuitem');
		expect(items).toHaveLength(3);
		const dividers = container.querySelectorAll('[role="separator"]');
		expect(dividers).toHaveLength(1);
	});

	it('flags trigger aria-expanded=true while open', async () => {
		const { container } = render(ContextMenuTestHarness);
		const trigger = container.querySelector('.ctx-trigger') as HTMLElement;

		await fireEvent.contextMenu(trigger);
		await vi.runAllTimersAsync();

		expect(trigger.getAttribute('aria-expanded')).toBe('true');
	});

	it('fires onSelect with the clicked item id and closes the menu', async () => {
		const onSelect = vi.fn();
		const { container } = render(ContextMenuTestHarness, { props: { onSelect } });
		const trigger = container.querySelector('.ctx-trigger') as HTMLElement;

		await fireEvent.contextMenu(trigger);
		await vi.runAllTimersAsync();

		const editItem = container.querySelector('[data-context-menu-item-id="edit"]') as HTMLElement;
		await fireEvent.click(editItem);

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledWith('edit');
		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('renders danger items with the danger class', async () => {
		const { container } = render(ContextMenuTestHarness);
		const trigger = container.querySelector('.ctx-trigger') as HTMLElement;

		await fireEvent.contextMenu(trigger);
		await vi.runAllTimersAsync();

		const deleteItem = container.querySelector('[data-context-menu-item-id="delete"]') as HTMLElement;
		expect(deleteItem.classList.contains('ctx-item-danger')).toBe(true);
	});

	it('does not open the menu when disabled', async () => {
		const { container } = render(ContextMenuTestHarness, { props: { disabled: true } });
		const trigger = container.querySelector('.ctx-trigger') as HTMLElement;

		await fireEvent.contextMenu(trigger);
		await vi.runAllTimersAsync();

		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('renders items with shortcut hint text', async () => {
		const { container } = render(ContextMenuTestHarness);
		const trigger = container.querySelector('.ctx-trigger') as HTMLElement;

		await fireEvent.contextMenu(trigger);
		await vi.runAllTimersAsync();

		const copyItem = container.querySelector('[data-context-menu-item-id="copy"]');
		expect(copyItem?.querySelector('.ctx-item-shortcut')?.textContent).toBe('⌘C');
	});

	it('closes the menu when the user clicks outside', async () => {
		const { container } = render(ContextMenuTestHarness);
		const trigger = container.querySelector('.ctx-trigger') as HTMLElement;

		await fireEvent.contextMenu(trigger);
		await vi.runAllTimersAsync();

		expect(screen.queryByRole('menu')).toBeTruthy();

		await fireEvent.mouseDown(document.body);
		expect(screen.queryByRole('menu')).toBeNull();
	});
});

describe('ContextMenu — keyboard interaction', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('opens via Shift+F10 on the trigger', async () => {
		const { container } = render(ContextMenuTestHarness);
		const trigger = container.querySelector('.ctx-trigger') as HTMLElement;

		await fireEvent.keyDown(trigger, { key: 'F10', shiftKey: true });
		await vi.runAllTimersAsync();

		expect(screen.queryByRole('menu')).toBeTruthy();
	});

	it('opens via the dedicated ContextMenu key on the trigger', async () => {
		const { container } = render(ContextMenuTestHarness);
		const trigger = container.querySelector('.ctx-trigger') as HTMLElement;

		await fireEvent.keyDown(trigger, { key: 'ContextMenu' });
		await vi.runAllTimersAsync();

		expect(screen.queryByRole('menu')).toBeTruthy();
	});

	it('Escape on the menu closes it', async () => {
		const { container } = render(ContextMenuTestHarness);
		const trigger = container.querySelector('.ctx-trigger') as HTMLElement;

		await fireEvent.contextMenu(trigger);
		await vi.runAllTimersAsync();

		const menu = screen.getByRole('menu');
		await fireEvent.keyDown(menu, { key: 'Escape' });

		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('Tab on the menu closes it', async () => {
		const { container } = render(ContextMenuTestHarness);
		const trigger = container.querySelector('.ctx-trigger') as HTMLElement;

		await fireEvent.contextMenu(trigger);
		await vi.runAllTimersAsync();

		const menu = screen.getByRole('menu');
		await fireEvent.keyDown(menu, { key: 'Tab' });

		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('Enter activates the focused item and fires onSelect', async () => {
		const onSelect = vi.fn();
		const { container } = render(ContextMenuTestHarness, { props: { onSelect } });
		const trigger = container.querySelector('.ctx-trigger') as HTMLElement;

		await fireEvent.contextMenu(trigger);
		await vi.runAllTimersAsync();

		const menu = screen.getByRole('menu');
		await fireEvent.keyDown(menu, { key: 'Enter' });

		expect(onSelect).toHaveBeenCalledWith('edit');
	});

	it('Space activates the focused item and fires onSelect', async () => {
		const onSelect = vi.fn();
		const { container } = render(ContextMenuTestHarness, { props: { onSelect } });
		const trigger = container.querySelector('.ctx-trigger') as HTMLElement;

		await fireEvent.contextMenu(trigger);
		await vi.runAllTimersAsync();

		const menu = screen.getByRole('menu');
		await fireEvent.keyDown(menu, { key: ' ' });

		expect(onSelect).toHaveBeenCalledWith('edit');
	});
});
