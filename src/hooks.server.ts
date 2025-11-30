/**
 * SvelteKit Server Hooks for Clerk Authentication
 *
 * This file integrates Clerk authentication with SvelteKit's request handling.
 * The withClerkHandler middleware runs on every request to:
 * - Validate session tokens from cookies
 * - Attach auth state to request locals
 * - Handle authentication state for SSR
 *
 * If Clerk environment variables are not configured, authentication features
 * are disabled but the app continues to function normally (graceful fallback).
 *
 * @see https://svelte-clerk.netlify.app/
 * @module hooks.server
 */

import { withClerkHandler } from 'svelte-clerk/server';
import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

/**
 * Check if Clerk is properly configured
 * Both publishable key and secret key are required for Clerk to function
 */
const isClerkConfigured = (): boolean => {
	return !!(env.PUBLIC_CLERK_PUBLISHABLE_KEY && privateEnv.CLERK_SECRET_KEY);
};

/**
 * Fallback handler when Clerk is not configured
 * Provides a mock auth() function that returns null for all auth checks
 */
const fallbackHandler: Handle = async ({ event, resolve }) => {
	// Provide a mock auth function that returns null (unauthenticated)
	event.locals.auth = () => null;
	return resolve(event);
};

/**
 * SvelteKit handle hook with conditional Clerk authentication
 * - If Clerk keys are configured: Uses full Clerk authentication
 * - If Clerk keys are missing: Falls back to demo mode (no auth)
 */
export const handle: Handle = async (input) => {
	if (isClerkConfigured()) {
		// Use Clerk authentication when properly configured
		const clerkHandler = withClerkHandler();
		return clerkHandler(input);
	}

	// Fallback to demo mode when Clerk is not configured
	return fallbackHandler(input);
};
