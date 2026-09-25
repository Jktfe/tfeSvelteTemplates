/**
 * ============================================================
 * AuthStatus Tests
 * ============================================================
 *
 * The pill is purely derived from `isConfigured`, so the tests
 * pin the two states and their accessibility wiring:
 *   - configured → "Auth Enabled", lock icon, `configured` class
 *   - not configured → "Auth Offline", open lock, `demo-mode` class
 *   - live region + tooltip text explain what to do next
 *   - icon is hidden from assistive tech
 *   - class prop is forwarded
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import AuthStatus from './AuthStatus.svelte';

describe('AuthStatus', () => {
	it('shows the enabled state when Better Auth is configured', () => {
		const { container } = render(AuthStatus, { props: { isConfigured: true } });
		const pill = screen.getByRole('status');
		expect(pill).toHaveClass('auth-status', 'configured');
		expect(pill).toHaveTextContent('Auth Enabled');
		expect(pill).toHaveAttribute('title', 'Better Auth is configured and active');
		expect(container.querySelector('.status-icon')).toHaveTextContent('🔐');
	});

	it('shows the offline state with setup guidance when not configured', () => {
		const { container } = render(AuthStatus, { props: { isConfigured: false } });
		const pill = screen.getByRole('status');
		expect(pill).toHaveClass('demo-mode');
		expect(pill).not.toHaveClass('configured');
		expect(pill).toHaveTextContent('Auth Offline');
		expect(pill.getAttribute('title')).toContain('BETTER_AUTH_SECRET');
		expect(container.querySelector('.status-icon')).toHaveTextContent('🔓');
	});

	it('announces changes politely and hides the decorative icon', () => {
		const { container } = render(AuthStatus, { props: { isConfigured: true } });
		expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
		expect(container.querySelector('.status-icon')).toHaveAttribute('aria-hidden', 'true');
	});

	it('updates when isConfigured flips', async () => {
		const { rerender } = render(AuthStatus, { props: { isConfigured: false } });
		expect(screen.getByRole('status')).toHaveTextContent('Auth Offline');
		await rerender({ isConfigured: true });
		expect(screen.getByRole('status')).toHaveTextContent('Auth Enabled');
	});

	it('forwards extra classes', () => {
		render(AuthStatus, { props: { isConfigured: true, class: 'navbar-pill' } });
		expect(screen.getByRole('status')).toHaveClass('navbar-pill');
	});
});
