/**
 * Protected Routes Layout Server Load
 *
 * This layout server file protects all routes in the (protected) group.
 * Any route inside this group will require authentication.
 * Unauthenticated users are redirected to the sign-in page.
 *
 * Protected Routes Pattern:
 * - Place protected routes inside src/routes/(protected)/
 * - This layout automatically checks authentication
 * - Redirect includes return URL for post-login redirect
 *
 * @module routes/(protected)/+layout.server
 */

import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Get auth state from Clerk middleware
	const auth = locals.auth();

	// If not authenticated, redirect to sign-in with return URL
	if (!auth?.userId) {
		const returnUrl = encodeURIComponent(url.pathname + url.search);
		throw redirect(303, `/auth/sign-in?redirect_url=${returnUrl}`);
	}

	// User is authenticated, return their ID
	return {
		userId: auth.userId
	};
};
