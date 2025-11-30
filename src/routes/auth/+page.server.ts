/**
 * Auth Demo Page Server Load
 *
 * Checks whether Clerk authentication is configured and provides
 * this information to the client for conditional UI rendering.
 *
 * @module routes/auth/+page.server
 */

import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/public';

export const load: PageServerLoad = async () => {
	// Check if Clerk is configured by verifying the publishable key exists
	// Using dynamic env to avoid build errors when the key is not set
	const isConfigured = !!env.PUBLIC_CLERK_PUBLISHABLE_KEY;

	return {
		isConfigured
	};
};
