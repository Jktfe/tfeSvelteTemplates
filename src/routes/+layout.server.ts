import type { LayoutServerLoad } from './$types';
import { isBetterAuthConfigured, toAuthUser } from '$lib/server/betterAuth';

export const load: LayoutServerLoad = ({ locals }) => {
	return {
		isAuthConfigured: isBetterAuthConfigured(),
		authUser: toAuthUser(locals.user)
	};
};
