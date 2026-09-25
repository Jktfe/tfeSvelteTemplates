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
 * tooltip, the live region and class forwarding, and pins the
 * motion contract (colour-only transitions, off under reduced motion).
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import DatabaseStatus from './DatabaseStatus.svelte';
import source from './DatabaseStatus.svelte?raw';

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

// happy-dom does not evaluate media queries or computed transitions, so the
// motion contract is pinned against the component's scoped stylesheet.
describe('DatabaseStatus motion styles', () => {
	// Strip CSS comments so prose that mentions a property never counts as a rule.
	const style = source.slice(source.indexOf('<style>')).replace(/\/\*[\s\S]*?\*\//g, '');

	it('does not use `transition: all`', () => {
		expect(style).not.toMatch(/transition:\s*all\b/);
	});

	it('transitions only the colour properties that change between states', () => {
		expect(style).toMatch(/background-color 0\.3s ease/);
		expect(style).toMatch(/border-color 0\.3s ease/);
		expect(style).toMatch(/color 0\.3s ease/);
	});

	it('turns transitions off under prefers-reduced-motion', () => {
		expect(style).toMatch(
			/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.database-status\s*\{\s*transition:\s*none;/
		);
	});

	it('declares the reduced-motion override exactly once', () => {
		expect(style.match(/prefers-reduced-motion: reduce/g) ?? []).toHaveLength(1);
	});
});
