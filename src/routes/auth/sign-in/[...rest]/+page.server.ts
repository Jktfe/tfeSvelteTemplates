/**
 * Sign-In Page Server Load
 *
 * Checks whether Clerk authentication is configured and provides
 * this information to the client for conditional UI rendering.
 *
 * @module routes/auth/sign-in/+page.server
 */

import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

export const load: PageServerLoad = async () => {
	// Check if Clerk is configured by verifying both keys exist
	const isConfigured = !!(env.PUBLIC_CLERK_PUBLISHABLE_KEY && privateEnv.CLERK_SECRET_KEY);

	return {
		isConfigured
	};
};
