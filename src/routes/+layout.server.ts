/**
 * Root Layout Server Load
 *
 * Provides initial authentication state for SSR (Server-Side Rendering).
 * The buildClerkProps function extracts auth data from the request and
 * passes it to ClerkProvider for hydration on the client.
 *
 * This enables:
 * - Proper SSR of authenticated content
 * - No flash of unauthenticated content on page refresh
 * - Auth state available in all child routes
 *
 * When Clerk is not configured, returns isClerkConfigured: false for demo mode.
 *
 * @module routes/+layout.server
 */

import { buildClerkProps } from 'svelte-clerk/server';
import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

/**
 * Check if Clerk is properly configured
 */
const checkClerkConfigured = (): boolean => {
	return !!(env.PUBLIC_CLERK_PUBLISHABLE_KEY && privateEnv.CLERK_SECRET_KEY);
};

export const load: LayoutServerLoad = ({ locals }) => {
	const isClerkConfigured = checkClerkConfigured();

	// Only build Clerk props if Clerk is configured
	if (isClerkConfigured) {
		return {
			isClerkConfigured: true,
			...buildClerkProps(locals.auth())
		};
	}

	// Return configuration status for demo mode
	return {
		isClerkConfigured: false
	};
};
