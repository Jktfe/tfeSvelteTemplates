/**
 * ============================================================
 * NotificationCentre Tests
 * ============================================================
 *
 * Verifies:
 *   - renders the bell trigger
 *   - unread badge reflects the count
 *   - panel opens on click and groups by recency
 *   - clicking an item marks it read and fires onChange
 *   - "Mark all as read" clears the badge
 *   - relative time is computed from the `now` prop (deterministic)
 *   - ARIA: aria-expanded toggles, trigger announces unread count
 *
 * Run: bun run test -- NotificationCentre
 * ============================================================
 */
import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import NotificationCentre from './NotificationCentre.svelte';

const NOW = '2026-06-06T12:00:00Z';

const items = [
	{
		id: 'a',
		title: 'New comment',
		body: 'Ada replied to your note',
		timestamp: '2026-06-06T10:00:00Z', // today
		read: false,
		icon: '💬'
	},
	{
		id: 'b',
		title: 'Build passed',
		timestamp: '2026-06-03T09:00:00Z', // earlier
		read: true
	}
];

describe('NotificationCentre', () => {
	it('renders the bell trigger with an unread-count label', () => {
		render(NotificationCentre, { props: { notifications: items, now: NOW } });
		const trigger = screen.getByRole('button', { name: /Notifications, 1 unread/i });
		expect(trigger).toBeInTheDocument();
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	it('shows the unread badge with the correct count', () => {
		render(NotificationCentre, { props: { notifications: items, now: NOW } });
		expect(screen.getByText('1')).toBeInTheDocument();
	});

	it('opens the panel and groups notifications by recency', async () => {
		render(NotificationCentre, { props: { notifications: items, now: NOW } });
		const trigger = screen.getByRole('button', { name: /Notifications/i });
		await fireEvent.click(trigger);
		expect(trigger).toHaveAttribute('aria-expanded', 'true');
		expect(screen.getByText('Today')).toBeInTheDocument();
		expect(screen.getByText('Earlier')).toBeInTheDocument();
		expect(screen.getByRole('menu')).toBeInTheDocument();
	});

	it('computes relative time from the now prop', async () => {
		render(NotificationCentre, { props: { notifications: items, now: NOW } });
		await fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));
		// 10:00 vs 12:00 = 2 hours ago, formatted with Intl en-GB.
		expect(screen.getByText('2 hours ago')).toBeInTheDocument();
	});

	it('marks an item read on click and fires onChange', async () => {
		const onChange = vi.fn();
		render(NotificationCentre, { props: { notifications: items, now: NOW, onChange } });
		await fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));
		const item = screen.getByRole('menuitem', { name: /New comment, unread/i });
		await fireEvent.click(item);
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0][0].find((n: { id: string }) => n.id === 'a').read).toBe(true);
	});

	it('clears all unread via "Mark all as read"', async () => {
		const onChange = vi.fn();
		render(NotificationCentre, { props: { notifications: items, now: NOW, onChange } });
		await fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));
		await fireEvent.click(screen.getByRole('button', { name: /Mark all as read/i }));
		expect(onChange).toHaveBeenCalled();
		const last = onChange.mock.calls.at(-1)![0];
		expect(last.every((n: { read: boolean }) => n.read)).toBe(true);
	});

	it('shows the empty state when there are no notifications', async () => {
		render(NotificationCentre, { props: { notifications: [], now: NOW } });
		await fireEvent.click(screen.getByRole('button', { name: /Notifications, no unread/i }));
		expect(screen.getByText(/all caught up/i)).toBeInTheDocument();
	});
});
