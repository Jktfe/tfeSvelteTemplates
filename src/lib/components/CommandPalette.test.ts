/**
 * ============================================================
 * CommandPalette Tests
 * ============================================================
 *
 * Verifies open/close behaviour via isOpen, search filtering,
 * group rendering, role wiring (dialog + listbox + option),
 * keyboard activation (Enter selects, Escape closes), and
 * empty-state messaging.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CommandPalette from './CommandPalette.svelte';
import type { CommandPaletteItem } from '$lib/types';

const items: CommandPaletteItem[] = [
	{ id: 'new-doc', label: 'New document', group: 'Files', icon: '📄', shortcut: '⌘N' },
	{ id: 'open-doc', label: 'Open document', group: 'Files', icon: '📂' },
	{ id: 'save', label: 'Save', group: 'Files', shortcut: '⌘S' },
	{ id: 'find', label: 'Find in page', group: 'Edit', shortcut: '⌘F' },
	{ id: 'replace', label: 'Replace', group: 'Edit', description: 'Find and replace text' }
];

describe('CommandPalette', () => {
	it('renders nothing when isOpen=false', () => {
		const { container } = render(CommandPalette, { props: { items, isOpen: false } });
		expect(container.querySelector('[role="dialog"]')).toBeNull();
	});

	it('renders the dialog with role + aria-modal when isOpen=true', () => {
		const { container } = render(CommandPalette, { props: { items, isOpen: true } });
		const dialog = container.querySelector('[role="dialog"]');
		expect(dialog).toBeTruthy();
		expect(dialog?.getAttribute('aria-modal')).toBe('true');
	});

	it('renders the result list with role="listbox"', () => {
		const { container } = render(CommandPalette, { props: { items, isOpen: true } });
		expect(container.querySelector('[role="listbox"]')).toBeTruthy();
	});

	it('renders one option per item up to maxResults', () => {
		const { container } = render(CommandPalette, {
			props: { items, isOpen: true, maxResults: 3 }
		});
		expect(container.querySelectorAll('[role="option"]').length).toBeLessThanOrEqual(3);
	});

	it('renders all items when items.length <= maxResults', () => {
		const { container } = render(CommandPalette, {
			props: { items, isOpen: true, maxResults: 50 }
		});
		expect(container.querySelectorAll('[role="option"]').length).toBe(items.length);
	});

	it('groups items by group name', () => {
		render(CommandPalette, { props: { items, isOpen: true } });
		expect(screen.getByText('Files')).toBeTruthy();
		expect(screen.getByText('Edit')).toBeTruthy();
	});

	it('renders the configured placeholder', () => {
		render(CommandPalette, {
			props: { items, isOpen: true, placeholder: 'Search anything...' }
		});
		expect(screen.getByPlaceholderText('Search anything...')).toBeTruthy();
	});

	it('shows the empty message when query has no matches', async () => {
		const user = userEvent.setup();
		render(CommandPalette, {
			props: { items, isOpen: true, emptyMessage: 'Nothing matches' }
		});
		const input = screen.getByRole('combobox') as HTMLInputElement;
		await user.type(input, 'zzzzzzzz_no_match_zzzzzzzz');
		expect(screen.getByText('Nothing matches')).toBeTruthy();
	});

	it('filters options as the query is typed', async () => {
		const user = userEvent.setup();
		const { container } = render(CommandPalette, { props: { items, isOpen: true } });
		const input = screen.getByRole('combobox') as HTMLInputElement;
		await user.type(input, 'save');
		const options = container.querySelectorAll('[role="option"]');
		const labels = Array.from(options).map((o) => o.textContent ?? '');
		expect(labels.some((l) => l.includes('Save'))).toBe(true);
	});

	it('renders shortcut hints when item.shortcut is set', () => {
		render(CommandPalette, { props: { items, isOpen: true } });
		expect(screen.getByText('⌘N')).toBeTruthy();
		expect(screen.getByText('⌘S')).toBeTruthy();
	});

	it('Escape key on the dialog fires onClose', async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();
		const { container } = render(CommandPalette, {
			props: { items, isOpen: true, onClose }
		});
		const input = container.querySelector('input.command-palette-input') as HTMLInputElement;
		input.focus();
		await user.keyboard('{Escape}');
		expect(onClose).toHaveBeenCalled();
	});

	it('Enter on the active option fires onSelect with the item', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		const { container } = render(CommandPalette, {
			props: { items, isOpen: true, onSelect }
		});
		const input = container.querySelector('input.command-palette-input') as HTMLInputElement;
		input.focus();
		await user.keyboard('{Enter}');
		expect(onSelect).toHaveBeenCalled();
		const arg = onSelect.mock.calls[0][0];
		expect(arg).toHaveProperty('id');
		expect(arg).toHaveProperty('label');
	});

	it('clicking an option fires onSelect with that item', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		const { container } = render(CommandPalette, { props: { items, isOpen: true, onSelect } });
		const second = container.querySelectorAll('[role="option"]')[1] as HTMLElement;
		await user.click(second);
		expect(onSelect).toHaveBeenCalled();
	});
});
