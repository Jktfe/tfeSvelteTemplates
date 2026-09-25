import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import DatabaseStatus from './DatabaseStatus.svelte';
import source from './DatabaseStatus.svelte?raw';

describe('DatabaseStatus', () => {
	it('shows the connected state when the database is in use', () => {
		render(DatabaseStatus, { usingDatabase: true });
		const status = screen.getByRole('status');
		expect(status).toHaveClass('connected');
		expect(status).toHaveTextContent('Database Connected');
		expect(status).toHaveAttribute('aria-live', 'polite');
	});

	it('falls back to the fixture state when the database is not in use', () => {
		render(DatabaseStatus, { usingDatabase: false });
		const status = screen.getByRole('status');
		expect(status).toHaveClass('fallback');
		expect(status).toHaveTextContent('Demo Fixture Data');
	});

	it('lets an explicit source override usingDatabase', () => {
		render(DatabaseStatus, { usingDatabase: true, source: 'error', message: 'Timed out' });
		const status = screen.getByRole('status');
		expect(status).toHaveClass('error');
		expect(status).toHaveTextContent('Database Error - Demo Fixtures');
		expect(status).toHaveAttribute('title', 'Timed out');
	});

	it('renders the static state', () => {
		render(DatabaseStatus, { usingDatabase: false, source: 'static' });
		expect(screen.getByRole('status')).toHaveTextContent('Static Demo Data');
	});

	it('hides the decorative emoji from assistive tech', () => {
		const { container } = render(DatabaseStatus, { usingDatabase: true });
		expect(container.querySelector('.status-icon')).toHaveAttribute('aria-hidden', 'true');
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
});
