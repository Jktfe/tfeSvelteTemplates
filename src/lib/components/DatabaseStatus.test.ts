/**
 * ============================================================
 * DatabaseStatus Tests
 * ============================================================
 *
 * DatabaseStatus mirrors a `DataSourceResult` onto a pill, so the
 * tests walk each of the four states:
 *   - database  → green "Database Connected"
 *   - fallback  → yellow "Demo Fixture Data"
 *   - error     → red "Database Error - Demo Fixtures"
 *   - static    → slate "Static Demo Data"
 * plus the legacy boolean path (no `source` prop), the message
 * tooltip, the live region and class forwarding.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import DatabaseStatus from './DatabaseStatus.svelte';

describe('DatabaseStatus', () => {
	it.each([
		['database', 'connected', 'Database Connected', '🟢'],
		['fallback', 'fallback', 'Demo Fixture Data', '🟡'],
		['error', 'error', 'Database Error - Demo Fixtures', '🔴'],
		['static', 'static', 'Static Demo Data', '⚪']
	] as const)('renders the %s state', (source, cssClass, label, icon) => {
		const { container } = render(DatabaseStatus, {
			props: { usingDatabase: source === 'database', source }
		});
		const pill = screen.getByRole('status');
		expect(pill).toHaveClass('database-status', cssClass);
		expect(pill).toHaveTextContent(label);
		expect(container.querySelector('.status-icon')).toHaveTextContent(icon);
	});

	it('falls back to usingDatabase when no source is given', async () => {
		const { rerender } = render(DatabaseStatus, { props: { usingDatabase: true } });
		expect(screen.getByRole('status')).toHaveTextContent('Database Connected');

		await rerender({ usingDatabase: false });
		expect(screen.getByRole('status')).toHaveTextContent('Demo Fixture Data');
	});

	it('lets an explicit source override usingDatabase', () => {
		render(DatabaseStatus, { props: { usingDatabase: true, source: 'error' } });
		expect(screen.getByRole('status')).toHaveClass('error');
	});

	it('exposes the message as a tooltip', () => {
		render(DatabaseStatus, {
			props: { usingDatabase: false, source: 'error', message: 'Connection refused' }
		});
		expect(screen.getByRole('status')).toHaveAttribute('title', 'Connection refused');
	});

	it('is a polite live region with a decorative icon', () => {
		const { container } = render(DatabaseStatus, { props: { usingDatabase: true } });
		expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
		expect(container.querySelector('.status-icon')).toHaveAttribute('aria-hidden', 'true');
	});

	it('forwards extra classes', () => {
		render(DatabaseStatus, { props: { usingDatabase: true, class: 'page-badge' } });
		expect(screen.getByRole('status')).toHaveClass('page-badge');
	});
});
