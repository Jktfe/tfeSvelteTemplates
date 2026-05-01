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

import type { LayoutServerLoad } from './$types';
import { isDemoUser, requireAuth } from '$lib/server/auth';
import { toAuthUser } from '$lib/server/betterAuth';

export const load: LayoutServerLoad = async (event) => {
	const userId = requireAuth(event);

	return {
		userId,
		authUser: toAuthUser(event.locals.user),
		isDemoUser: isDemoUser(event)
	};
};
