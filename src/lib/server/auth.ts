/**
 * Server-side Authentication Utilities
 *
 * This module provides helper functions for authentication checks in
 * server-side code (load functions, API endpoints, actions).
 *
 * IMPORTANT: Only import this module in server-side code.
 * It is located in $lib/server/ to prevent accidental client imports.
 *
 * Usage:
 *   // In +page.server.ts or +server.ts
 *   import { requireAuth, checkAuth } from '$lib/server/auth';
 *
 * @module lib/server/auth
 */

import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Result of an authentication check
 */
export interface AuthResult {
	/** Whether the user is authenticated */
	authenticated: boolean;
	/** User ID if authenticated, null otherwise */
	userId: string | null;
}

/**
 * Require authentication for a route
 *
 * Use this in +page.server.ts load functions to protect routes.
 * If the user is not authenticated, they will be redirected to sign-in.
 *
 * @param event - SvelteKit request event
 * @param redirectUrl - URL to redirect to for sign-in (default: /auth/sign-in)
 * @returns The authenticated user's ID
 * @throws Redirect to sign-in page if not authenticated
 *
 * @example
 * ```typescript
 * export const load: PageServerLoad = async (event) => {
 *   const userId = requireAuth(event);
 *   // User is authenticated, proceed with loading data
 *   return { userId };
 * };
 * ```
 */
export function requireAuth(event: RequestEvent, redirectUrl = '/auth/sign-in'): string {
	const auth = event.locals.auth();
	const userId = auth?.userId;

	if (!userId) {
		const returnUrl = encodeURIComponent(event.url.pathname + event.url.search);
		throw redirect(303, `${redirectUrl}?redirect_url=${returnUrl}`);
	}

	return userId;
}

/**
 * Check authentication status without throwing
 *
 * Use this when you need to conditionally show content based on auth state
 * but don't want to redirect unauthenticated users.
 *
 * @param event - SvelteKit request event
 * @returns Auth result with authenticated status and userId
 *
 * @example
 * ```typescript
 * export const load: PageServerLoad = async (event) => {
 *   const { authenticated, userId } = checkAuth(event);
 *   return {
 *     isLoggedIn: authenticated,
 *     userId
 *   };
 * };
 * ```
 */
export function checkAuth(event: RequestEvent): AuthResult {
	const auth = event.locals.auth();

	return {
		authenticated: !!auth?.userId,
		userId: auth?.userId ?? null
	};
}

/**
 * Require authentication for API endpoints
 *
 * Use this in +server.ts files for protected API routes.
 * Returns 401 Unauthorized if not authenticated (does not redirect).
 *
 * @param event - SvelteKit request event
 * @returns The authenticated user's ID
 * @throws 401 HTTP error if not authenticated
 *
 * @example
 * ```typescript
 * export const POST: RequestHandler = async (event) => {
 *   const userId = requireAuthAPI(event);
 *   // User is authenticated, process the request
 *   const data = await event.request.json();
 *   return json({ success: true, userId });
 * };
 * ```
 */
export function requireAuthAPI(event: RequestEvent): string {
	const auth = event.locals.auth();
	const userId = auth?.userId;

	if (!userId) {
		throw error(401, {
			message: 'Authentication required'
		});
	}

	return userId;
}

/**
 * Get the session ID if available
 *
 * Useful for session-specific operations like logging or analytics.
 *
 * @param event - SvelteKit request event
 * @returns Session ID if authenticated, null otherwise
 */
export function getSessionId(event: RequestEvent): string | null {
	const auth = event.locals.auth();
	return auth?.sessionId ?? null;
}

/**
 * Check if the request has a specific claim
 *
 * Useful for role-based access control or custom permissions.
 *
 * @param event - SvelteKit request event
 * @param claim - The claim key to check
 * @param value - Optional value to match (if not provided, just checks existence)
 * @returns Whether the claim exists (and matches the value if provided)
 *
 * @example
 * ```typescript
 * export const load: PageServerLoad = async (event) => {
 *   requireAuth(event);
 *   if (!hasClaim(event, 'role', 'admin')) {
 *     throw error(403, 'Admin access required');
 *   }
 *   return { isAdmin: true };
 * };
 * ```
 */
export function hasClaim(
	event: RequestEvent,
	claim: string,
	value?: string | number | boolean
): boolean {
	const auth = event.locals.auth();
	const claims = auth?.sessionClaims as Record<string, unknown> | undefined;

	if (!claims || !(claim in claims)) {
		return false;
	}

	if (value === undefined) {
		return true;
	}

	return claims[claim] === value;
}
