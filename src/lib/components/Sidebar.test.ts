/**
 * ============================================================
 * Sidebar Tests
 * ============================================================
 * Verifies the rail renders, the active item is marked for
 * screen readers, nested groups toggle, the collapse control
 * flips state, and the mobile drawer responds to the hamburger.
 *
 *   bun run test -- Sidebar
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Sidebar from './Sidebar.svelte';

const items = [
	{ label: 'Dashboard', href: '/dashboard', icon: '▤' },
	{ label: 'Reports', href: '/reports', icon: '📊' },
	{
		label: 'Settings',
		icon: '⚙️',
		children: [
			{ label: 'Profile', href: '/settings/profile' },
			{ label: 'Billing', href: '/settings/billing' }
		]
	}
];

describe('Sidebar', () => {
	it('renders the nav landmark with its accessible label', () => {
		render(Sidebar, { items, ariaLabel: 'Primary' });
		expect(screen.getByRole('navigation', { name: 'Primary' })).toBeTruthy();
	});

	it('renders a link per top-level item', () => {
		render(Sidebar, { items });
		expect(screen.getByText('Dashboard')).toBeTruthy();
		expect(screen.getByText('Reports')).toBeTruthy();
	});

	it('marks the active item with aria-current="page"', () => {
		render(Sidebar, { items, activeHref: '/reports' });
		const active = screen.getByText('Reports').closest('a');
		expect(active?.getAttribute('aria-current')).toBe('page');
	});

	it('auto-expands the group that owns the active child', () => {
		render(Sidebar, { items, activeHref: '/settings/billing' });
		// Billing lives inside the Settings group; it should be visible.
		expect(screen.getByText('Billing')).toBeTruthy();
	});

	it('toggles a nested group via its group button (aria-expanded)', async () => {
		render(Sidebar, { items });
		const groupBtn = screen.getByRole('button', { name: /settings/i });
		expect(groupBtn.getAttribute('aria-expanded')).toBe('false');
		await fireEvent.click(groupBtn);
		expect(groupBtn.getAttribute('aria-expanded')).toBe('true');
		expect(screen.getByText('Profile')).toBeTruthy();
	});

	it('flips collapsed state when the collapse control is clicked', async () => {
		render(Sidebar, { items, storageKey: '' });
		const collapse = screen.getByRole('button', { name: /collapse sidebar/i });
		await fireEvent.click(collapse);
		expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeTruthy();
	});

	it('opens the mobile drawer when the hamburger is pressed', async () => {
		render(Sidebar, { items, ariaLabel: 'Primary' });
		const hamburger = screen.getByRole('button', { name: /open primary/i });
		expect(hamburger.getAttribute('aria-expanded')).toBe('false');
		await fireEvent.click(hamburger);
		expect(hamburger.getAttribute('aria-expanded')).toBe('true');
		// Drawer becomes a modal dialog while open.
		expect(screen.getByRole('dialog', { name: 'Primary' })).toBeTruthy();
	});
});
